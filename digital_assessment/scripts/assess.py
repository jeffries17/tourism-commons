import csv
import os
import re
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd
import requests
from bs4 import BeautifulSoup


USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/126.0.0.0 Safari/537.36"
)

REQUEST_TIMEOUT_SECONDS = 15


def safe_get(url: str) -> Optional[requests.Response]:
    if not url or not isinstance(url, str):
        return None
    try:
        headers = {"User-Agent": USER_AGENT}
        resp = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT_SECONDS, allow_redirects=True)
        return resp
    except Exception:
        return None


def normalize_url(url: Optional[str]) -> str:
    if not url or not isinstance(url, str):
        return ""
    url = url.strip().strip('"').strip("'")
    if not url:
        return ""
    if url.startswith("http://") or url.startswith("https://"):
        return url
    if url.startswith("www."):
        return f"https://{url}"
    # treat as missing if it is not a url
    if "." not in url:
        return ""
    return f"https://{url}"


def extract_text(response: Optional[requests.Response]) -> str:
    if response is None or response.status_code >= 400:
        return ""
    try:
        return response.text or ""
    except Exception:
        return ""


def parse_site_metadata(html: str) -> Dict[str, Any]:
    if not html:
        return {}
    soup = BeautifulSoup(html, "html.parser")
    title = (soup.title.string.strip() if soup.title and soup.title.string else "")
    meta_desc = ""
    md = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
    if md and md.get("content"):
        meta_desc = md["content"].strip()
    h1 = soup.find("h1")
    headings_ok = bool(h1)
    images = soup.find_all("img")
    image_count = len(images)

    # crude last update heuristic: look for date patterns in text
    text = soup.get_text(" ", strip=True)[:200000]
    date_match = re.search(r"(20\d{2}|19\d{2})[-/\.](0?[1-9]|1[0-2])[-/\.](0?[1-9]|[12][0-9]|3[01])", text)
    iso_match = re.search(r"20\d{2}-[01]\d-[0-3]\d", html)
    last_update_score_days = None
    try:
        if iso_match:
            dt = datetime.fromisoformat(iso_match.group(0))
            last_update_score_days = (datetime.now(timezone.utc) - dt.replace(tzinfo=timezone.utc)).days
        elif date_match:
            parts = re.split(r"[-/\.]", date_match.group(0))
            year = int(parts[0]) if len(parts[0]) == 4 else int(parts[2])
            month = int(parts[1])
            day = int(parts[2]) if len(parts[0]) == 4 else int(parts[0])
            dt = datetime(year, month, day, tzinfo=timezone.utc)
            last_update_score_days = (datetime.now(timezone.utc) - dt).days
    except Exception:
        last_update_score_days = None

    has_contact = bool(re.search(r"(contact|email|phone|tel|address)", text, re.I))
    has_about = bool(re.search(r"(about|who we are|our story)", text, re.I))
    has_services = bool(re.search(r"(services|products|book|tickets|pricing)", text, re.I))

    # e-commerce / booking signals
    ecommerce_signals = {
        "has_cart": bool(re.search(r"/cart|cart__drawer|checkout|add_to_cart", html, re.I)),
        "has_payment": bool(re.search(r"(stripe|paypal|checkout|paystack|flutterwave|orange money|visa|mastercard)", html, re.I)),
        "has_booking": bool(re.search(r"(book now|reservation|calendar|availability)", html, re.I)),
        "platform": ("shopify" if "cdn.shopify.com" in html.lower() else ("woocommerce" if "woocommerce" in html.lower() else ("wix" if "wixstatic" in html.lower() else ""))),
    }

    return {
        "title": title,
        "meta_description": meta_desc,
        "headings_ok": headings_ok,
        "image_count": image_count,
        "has_contact": has_contact,
        "has_about": has_about,
        "has_services": has_services,
        "last_update_days": last_update_score_days,
        "ecommerce_signals": ecommerce_signals,
    }


SOCIAL_HOSTS = {
    "facebook": ["facebook.com", "fb.com"],
    "instagram": ["instagram.com"],
    "youtube": ["youtube.com", "youtu.be"],
    "tiktok": ["tiktok.com"],
    "linkedin": ["linkedin.com"],
    "tripadvisor": ["tripadvisor.com"],
    "whatsapp": ["wa.me", "api.whatsapp.com"],
}


def extract_links_from_text(text: str) -> Dict[str, str]:
    if not text or not isinstance(text, str):
        return {}
    results: Dict[str, str] = {}
    # Raw URLs
    url_pattern = re.compile(r"https?://[^\s)\],]+", re.I)
    urls = url_pattern.findall(text)
    # Domain mentions like example.com
    domain_pattern = re.compile(r"\b([a-z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?)\b", re.I)
    domains = domain_pattern.findall(text)

    def assign_if_matches(hosts: List[str], key: str):
        for u in urls:
            for h in hosts:
                if h in u.lower():
                    results.setdefault(key, normalize_url(u))
                    return

    # Map known platforms
    for key, hosts in SOCIAL_HOSTS.items():
        assign_if_matches(hosts, key)

    # Try to capture website via explicit hint
    m = re.search(r"website\s*[:\-]\s*(https?://[^\s)\],]+|www\.[^\s)\],]+|[a-z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?)", text, re.I)
    if m and not results.get("website"):
        results["website"] = normalize_url(m.group(1))

    # Otherwise choose a domain that is not a known social host
    if not results.get("website"):
        for d in domains:
            dl = d.lower()
            if any(any(host in dl for host in hosts) for hosts in SOCIAL_HOSTS.values()):
                continue
            # skip obvious non-domains like 'Aubko' typo; require a dot and alpha tld present
            if "." in dl and dl[0].isalnum():
                results["website"] = normalize_url(dl)
                break

    # If still nothing, pick the first non-social raw URL as website
    if not results.get("website"):
        for u in urls:
            ul = u.lower()
            if any(any(host in ul for host in hosts) for hosts in SOCIAL_HOSTS.values()):
                continue
            results["website"] = normalize_url(u)
            break

    return results


def ddg_search_urls(query: str, max_results: int = 5) -> List[str]:
    try:
        headers = {"User-Agent": USER_AGENT}
        resp = requests.get(
            "https://duckduckgo.com/html/",
            params={"q": query},
            headers=headers,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        if resp.status_code >= 400:
            return []
        soup = BeautifulSoup(resp.text, "html.parser")
        urls: List[str] = []
        for a in soup.select("a.result__a"):
            href = a.get("href")
            if href and href.startswith("http"):
                urls.append(href)
                if len(urls) >= max_results:
                    break
        # Fallback generic anchors
        if not urls:
            for a in soup.find_all("a"):
                href = a.get("href")
                if href and href.startswith("http"):
                    urls.append(href)
                    if len(urls) >= max_results:
                        break
        return urls
    except Exception:
        return []


def resolve_official_links(name: str, region: str, hints_text: str, links: Dict[str, str]) -> Dict[str, str]:
    updated = dict(links)
    base_query = f"{name} {region}".strip()
    # Resolve website if missing
    if not updated.get("website") and base_query:
        urls = ddg_search_urls(base_query, max_results=5)
        for u in urls:
            ul = u.lower()
            if any(any(host in ul for host in hosts) for hosts in SOCIAL_HOSTS.values()):
                continue
            if "google.com" in ul or "wikipedia.org" in ul or "tripadvisor.com" in ul:
                continue
            updated["website"] = normalize_url(u)
            break
    # Resolve Facebook
    if not updated.get("facebook") and ("facebook" in hints_text.lower() if hints_text else True) and base_query:
        urls = ddg_search_urls(f"{base_query} Facebook", max_results=5)
        for u in urls:
            if "facebook.com" in u.lower():
                updated["facebook"] = normalize_url(u)
                break
    # Resolve Instagram
    if not updated.get("instagram") and ("instagram" in hints_text.lower() if hints_text else True) and base_query:
        urls = ddg_search_urls(f"{base_query} Instagram", max_results=5)
        for u in urls:
            if "instagram.com" in u.lower():
                updated["instagram"] = normalize_url(u)
                break
    # Resolve TripAdvisor
    if not updated.get("tripadvisor") and ("tripadvisor" in hints_text.lower() if hints_text else True) and base_query:
        urls = ddg_search_urls(f"{base_query} TripAdvisor", max_results=5)
        for u in urls:
            if "tripadvisor.com" in u.lower():
                updated["tripadvisor"] = normalize_url(u)
                break
    return updated


def score_existence_functionality(url: str, resp: Optional[requests.Response], meta: Dict[str, Any]) -> int:
    if not url:
        return 0
    if resp is None or resp.status_code >= 400:
        return 3  # treat as minimal if present but failing
    # completeness proxy
    completeness = sum([meta.get("has_contact", False), meta.get("has_about", False), meta.get("has_services", False)])
    freshness_days = meta.get("last_update_days")
    if completeness >= 2 and (freshness_days is not None and freshness_days <= 180):
        return 10
    if completeness >= 1 and (freshness_days is not None and freshness_days <= 365):
        return 6
    return 3


def score_content_quality(meta: Dict[str, Any]) -> Tuple[int, int, int]:
    # visual (0..3)
    image_count = int(meta.get("image_count")) if meta.get("image_count") is not None else 0
    visual_points = 0
    if image_count == 0:
        visual_points = 0
    elif image_count < 5:
        visual_points = 1
    elif image_count < 15:
        visual_points = 2
    else:
        visual_points = 3

    info_points = 0
    info_count = sum([meta.get("has_contact", False), meta.get("has_about", False), meta.get("has_services", False)])
    if info_count >= 3:
        info_points = 2
    elif info_count >= 1:
        info_points = 1
    else:
        info_points = 0

    freshness_points = 0
    days = meta.get("last_update_days")
    if isinstance(days, int):
        if days <= 180:
            freshness_points = 2
        elif days <= 365:
            freshness_points = 1
        else:
            freshness_points = 0
    return visual_points, info_points, freshness_points


def score_technical(psi: Dict[str, Any], meta: Dict[str, Any]) -> Tuple[int, int, int]:
    # Without API keys, approximate via HTML size and mobile meta viewport
    # loading (0..3): approximate by content length as proxy (very rough)
    size = int(psi.get("bytes", 0))
    load_points = 3 if size < 300_000 else 2 if size < 1_000_000 else 1 if size < 2_500_000 else 0
    # mobile (0..2)
    mobile_points = 2 if psi.get("has_viewport", False) else 1 if meta.get("headings_ok", False) else 0
    # seo basics (0..3)
    seo_components = 0
    if meta.get("title"):
        seo_components += 1
    if meta.get("meta_description"):
        seo_components += 1
    if meta.get("headings_ok"):
        seo_components += 1
    seo_points = 0 if seo_components == 0 else 1 if seo_components == 1 else 2 if seo_components == 2 else 3
    return load_points, mobile_points, seo_points


def probe_simple_pagespeed(html: str) -> Dict[str, Any]:
    # No API: approximate using byte size and presence of viewport
    has_viewport = bool(re.search(r"<meta[^>]+name=\"viewport\"|<meta[^>]+viewport", html, re.I))
    return {"bytes": len(html.encode("utf-8")), "has_viewport": has_viewport}


def probe_pagespeed_api(url: str, strategy: str = "mobile") -> Dict[str, Any]:
    api_key = os.environ.get("PAGESPEED_API_KEY", "").strip()
    if not api_key or not url:
        return {}
    try:
        headers = {"User-Agent": USER_AGENT}
        resp = requests.get(
            "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
            params={"url": url, "strategy": strategy, "key": api_key},
            headers=headers,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        if resp.status_code >= 400:
            return {}
        return resp.json()
    except Exception:
        return {}


def score_technical_api(psi_api: Dict[str, Any], meta: Dict[str, Any]) -> Tuple[int, int, int, Dict[str, Any]]:
    details: Dict[str, Any] = {}
    if not psi_api or not isinstance(psi_api, dict) or "lighthouseResult" not in psi_api:
        # signal no API
        return 0, 0, 0, details
    lr = psi_api.get("lighthouseResult", {})
    audits = lr.get("audits", {})
    categories = lr.get("categories", {})
    perf_score = categories.get("performance", {}).get("score")
    details["psi_performance_score"] = perf_score

    # LCP from audit numericValue (ms)
    lcp_ms = None
    if "largest-contentful-paint" in audits:
        lcp_ms = audits.get("largest-contentful-paint", {}).get("numericValue")
    elif "metrics" in audits and audits.get("metrics", {}).get("details", {}).get("items"):
        lcp_ms = audits.get("metrics", {}).get("details", {}).get("items", [{}])[0].get("largestContentfulPaint")
    lcp_sec = None
    if isinstance(lcp_ms, (int, float)):
        lcp_sec = float(lcp_ms) / 1000.0 if lcp_ms > 100 else float(lcp_ms)
    details["psi_lcp_seconds"] = lcp_sec

    viewport_score = (audits.get("viewport", {}).get("score", 0) or 0)
    tap_targets_score = (audits.get("tap-targets", {}).get("score", 0) or 0)
    details["psi_mobile_viewport_score"] = viewport_score
    details["psi_tap_targets_score"] = tap_targets_score

    # loading speed (0..3) from LCP
    if lcp_sec is None:
        load_points = 1
    elif lcp_sec > 5:
        load_points = 0
    elif lcp_sec > 3:
        load_points = 1
    elif lcp_sec > 1:
        load_points = 2
    else:
        load_points = 3

    # mobile responsiveness (0..2)
    mobile_points = 2 if (viewport_score >= 0.9 and tap_targets_score >= 0.9) else (1 if viewport_score > 0 else 0)

    # SEO basics via audits (0..3)
    seo_passes = 0
    if (audits.get("document-title", {}).get("score", 0) or 0) >= 0.9:
        seo_passes += 1
    if (audits.get("meta-description", {}).get("score", 0) or 0) >= 0.9:
        seo_passes += 1
    if (audits.get("hreflang", {}).get("score", 0) or 0) >= 0.9 or (audits.get("structured-data", {}).get("score", 0) or 0) >= 0.9:
        seo_passes += 1
    seo_points = 0 if seo_passes == 0 else 1 if seo_passes == 1 else 2 if seo_passes == 2 else 3

    return load_points, mobile_points, seo_points, details


def score_social_presence(links: Dict[str, str], hints_text: str = "") -> Tuple[int, Dict[str, Any]]:
    platform_points = 0
    details = {}
    # facebook, instagram, whatsapp, extras
    extras = 0
    text_l = (hints_text or "").lower()
    if links.get("facebook"):
        platform_points += 2
        details["facebook_status"] = "active_or_present"
    elif "facebook" in text_l:
        platform_points += 1
        details["facebook_status"] = "mentioned"
    if links.get("instagram"):
        platform_points += 2
        details["instagram_status"] = "active_or_present"
    elif "instagram" in text_l:
        platform_points += 1
        details["instagram_status"] = "mentioned"
    if links.get("whatsapp"):
        platform_points += 2
        details["whatsapp_status"] = "present"
    elif "whatsapp" in text_l:
        platform_points += 1
        details["whatsapp_status"] = "mentioned"
    # extras detection from text
    if links.get("youtube"):
        extras += 1
    elif "youtube" in text_l:
        extras += 1
    if links.get("tiktok") or links.get("linkedin"):
        extras += 1
    elif ("tiktok" in text_l) or ("linkedin" in text_l):
        extras += 1
    platform_points += min(2, extras)
    return min(8, platform_points), details


def score_search_visibility(name: str, region: str, site_url: str) -> int:
    # No API: rough heuristic – if site exists, assume at least some presence
    if site_url:
        return 6  # assume first page positions 4-10 as a safe mid-score
    return 3 if name else 0


def score_reviews(tripadvisor_url: str) -> Tuple[int, Dict[str, Any]]:
    if not tripadvisor_url:
        return 0, {"tripadvisor_present": False}
    return 2, {"tripadvisor_present": True}


def score_ecommerce_booking(meta: Dict[str, Any]) -> int:
    sig = meta.get("ecommerce_signals", {}) if meta else {}
    points = 0
    # online sales integration (0..8)
    if sig.get("platform"):
        points += 6
    if sig.get("has_payment"):
        points = max(points, 6)
    if sig.get("has_cart"):
        points = max(points, 4)
    if sig.get("has_booking"):
        points += 4  # booking (0..4)
    return min(12, points)  # cap partial first pass


def score_content_marketing(meta: Dict[str, Any], social_details: Dict[str, Any]) -> int:
    # Rough proxy: if images exist and social present, allocate mid points
    visual = 2 if (meta and meta.get("image_count", 0) >= 5) else 1 if (meta and meta.get("image_count", 0) > 0) else 0
    platforms = 2 if ("facebook_status" in social_details and "instagram_status" in social_details) else 1 if social_details else 0
    consistency = 1 if platforms >= 1 else 0
    return min(15, visual + platforms + consistency)


def sector_bonus(stype: str) -> int:
    if not stype:
        return 0
    stype_l = stype.lower()
    if "festival" in stype_l or "event" in stype_l:
        return 2
    if "craft" in stype_l or "artisan" in stype_l:
        return 2
    if "fashion" in stype_l or "music" in stype_l or "media" in stype_l:
        return 2
    return 0


def assess_row(row: pd.Series, *, enable_resolution: bool = False) -> Dict[str, Any]:
    name = str(row.get("Name of Event", "")).strip()
    region = str(row.get("Region", "")).strip()
    stype = str(row.get("Type", "")).strip()
    website = normalize_url(row.get("Website"))
    facebook = normalize_url(row.get("Facebook"))
    instagram = normalize_url(row.get("Instagram"))
    tripadvisor = normalize_url(row.get("Tripadvisor"))

    # Augment from free-text columns if missing
    free_text_fields = []
    for col in ["Digital Presence (Web/Social)", "Description", "Outreach", "Contact Number/Email"]:
        val = row.get(col)
        if isinstance(val, str) and val.strip():
            free_text_fields.append(val)
    extracted: Dict[str, str] = extract_links_from_text("\n".join(free_text_fields)) if free_text_fields else {}

    if not website and extracted.get("website"):
        website = extracted["website"]
    if not facebook and extracted.get("facebook"):
        facebook = extracted["facebook"]
    if not instagram and extracted.get("instagram"):
        instagram = extracted["instagram"]
    if not tripadvisor and extracted.get("tripadvisor"):
        tripadvisor = extracted["tripadvisor"]

    # Try search resolution if enabled and still missing
    if enable_resolution:
        resolved = resolve_official_links(name, region, "\n".join(free_text_fields), {
            "website": website,
            "facebook": facebook,
            "instagram": instagram,
            "tripadvisor": tripadvisor,
        })
        website = resolved.get("website", website)
        facebook = resolved.get("facebook", facebook)
        instagram = resolved.get("instagram", instagram)
        tripadvisor = resolved.get("tripadvisor", tripadvisor)

    # Fetch website
    resp = safe_get(website) if website else None
    html = extract_text(resp)
    meta = parse_site_metadata(html) if html else {}
    # PageSpeed API (if key present) else heuristic
    psi_api = probe_pagespeed_api(website, strategy="mobile") if website else {}
    psi = probe_simple_pagespeed(html) if html else {"bytes": 0, "has_viewport": False}

    # Website scoring breakdown
    existence_points = score_existence_functionality(website, resp, meta)
    visual_points, info_points, freshness_points = score_content_quality(meta)
    # Prefer API-based scoring if available
    api_load, api_mobile, api_seo, psi_details = score_technical_api(psi_api, meta)
    if api_load + api_mobile + api_seo > 0:
        load_points, mobile_points, seo_points = api_load, api_mobile, api_seo
    else:
        psi_details = {}
        load_points, mobile_points, seo_points = score_technical(psi, meta)

    website_presence_total = existence_points + visual_points + info_points + freshness_points
    technical_total = load_points + mobile_points + seo_points

    # Social
    links = {
        "facebook": facebook,
        "instagram": instagram,
        "tripadvisor": tripadvisor,
        "youtube": extracted.get("youtube", ""),
        "tiktok": extracted.get("tiktok", ""),
        "linkedin": extracted.get("linkedin", ""),
        # WhatsApp present even if only number/mention
        "whatsapp": extracted.get("whatsapp", ""),
    }
    hints_text = "\n".join(free_text_fields)
    social_platform_points, social_details = score_social_presence(links, hints_text=hints_text)
    # For first pass, skip deep engagement/followers
    social_total = social_platform_points  # out of 8; conservative

    # Search
    search_points = score_search_visibility(name, region, website)

    # Reviews
    reviews_points, reviews_details = score_reviews(tripadvisor)

    # Ecommerce / Booking
    ecommerce_points = score_ecommerce_booking(meta)

    # Content Marketing (proxy)
    marketing_points = score_content_marketing(meta, social_details)

    # Sector Bonus (lightweight)
    bonus_points = sector_bonus(stype)

    # Totals (note: partial first-pass scale; some sections underfill max)
    total_score = (
        website_presence_total
        + technical_total
        + social_total
        + search_points
        + ecommerce_points
        + reviews_points
        + marketing_points
        + bonus_points
    )

    return {
        # meta
        "assessed_name": name,
        "assessed_type": stype,
        "assessed_region": region,
        "assessed_timestamp": datetime.now(timezone.utc).isoformat(),
        # website breakdown columns
        "website_url_norm": website,
        "website_http_status": (resp.status_code if resp is not None else None),
        "website_existence_points": existence_points,
        "website_visual_points": visual_points,
        "website_info_points": info_points,
        "website_freshness_points": freshness_points,
        "technical_load_points": load_points,
        "technical_mobile_points": mobile_points,
        "technical_seo_points": seo_points,
        # PSI details
        "psi_lcp_seconds": psi_details.get("psi_lcp_seconds"),
        "psi_mobile_viewport_score": psi_details.get("psi_mobile_viewport_score"),
        "psi_tap_targets_score": psi_details.get("psi_tap_targets_score"),
        "psi_performance_score": psi_details.get("psi_performance_score"),
        # social columns
        "facebook_url_norm": facebook,
        "instagram_url_norm": instagram,
        "social_facebook_status": social_details.get("facebook_status"),
        "social_instagram_status": social_details.get("instagram_status"),
        "social_whatsapp_status": social_details.get("whatsapp_status"),
        "social_platform_points": social_platform_points,
        # search/reviews
        "search_visibility_points": search_points,
        "tripadvisor_url_norm": tripadvisor,
        "reviews_points": reviews_points,
        # ecommerce/booking
        "ecommerce_points": ecommerce_points,
        # marketing
        "marketing_points": marketing_points,
        # bonus + total
        "sector_bonus_points": bonus_points,
        "total_score_first_pass": total_score,
    }


def run(input_csv: str, output_csv: str) -> None:
    df = pd.read_csv(input_csv)
    # Fast mode controls
    row_limit_env = os.environ.get("ASSESS_ROW_LIMIT")
    row_offset_env = os.environ.get("ASSESS_ROW_OFFSET", "0")
    resolve_env = os.environ.get("ASSESS_ENABLE_RESOLUTION", "0").strip()
    enable_resolution = resolve_env in ("1", "true", "yes", "on")

    # Apply pagination if provided
    offset = int(row_offset_env) if row_offset_env.isdigit() else 0
    if row_limit_env and row_limit_env.isdigit():
        limit = int(row_limit_env)
        df = df.iloc[offset: offset + limit]
    elif offset:
        df = df.iloc[offset:]

    results = df.apply(lambda r: assess_row(r, enable_resolution=enable_resolution), axis=1, result_type="expand")
    out = pd.concat([df, results], axis=1)

    # Optional output suffix to avoid overwrites across batches
    suffix = os.environ.get("ASSESS_OUTPUT_SUFFIX", "").strip()
    final_output_csv = output_csv
    if suffix:
        base, ext = os.path.splitext(output_csv)
        final_output_csv = f"{base}{suffix}{ext}"

    os.makedirs(os.path.dirname(final_output_csv), exist_ok=True)
    out.to_csv(final_output_csv, index=False)


if __name__ == "__main__":
    input_csv = "/Users/alexjeffries/digital_assessment/docs/The Gambia - Creative Industry & Tourism Stakeholders - CI Stakeholders.csv"
    output_csv = "/Users/alexjeffries/digital_assessment/output/assessment.csv"
    run(input_csv, output_csv)


