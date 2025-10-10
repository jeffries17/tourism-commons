#!/usr/bin/env python3
"""
Test Automated Assessment
Simple proof of concept: Google Search + Website Scraping
"""

import os
import re
import json
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from datetime import datetime
from typing import Dict, List, Optional

# Configuration
USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'

# You'll need to set these
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY', '')
SEARCH_ENGINE_ID = os.environ.get('GOOGLE_SEARCH_ENGINE_ID', '')


def google_custom_search(query: str, num_results: int = 10) -> List[Dict]:
    """
    Search Google using Custom Search API
    
    Setup: https://developers.google.com/custom-search/v1/overview
    1. Enable Custom Search API in Google Cloud Console
    2. Create API key
    3. Create Custom Search Engine at https://programmablesearchengine.google.com/
    4. Select "Search the entire web"
    """
    if not GOOGLE_API_KEY or not SEARCH_ENGINE_ID:
        print("  ⚠️  No Google API credentials found")
        print("     Set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID environment variables")
        return []
    
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        'key': GOOGLE_API_KEY,
        'cx': SEARCH_ENGINE_ID,
        'q': query,
        'num': min(num_results, 10)
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        return response.json().get('items', [])
    except Exception as e:
        print(f"  ⚠️  Search failed: {e}")
        return []


def classify_url(url: str) -> str:
    """Determine what type of URL this is"""
    url_lower = url.lower()
    
    if 'facebook.com' in url_lower:
        return 'facebook'
    elif 'instagram.com' in url_lower:
        return 'instagram'
    elif 'tripadvisor' in url_lower:
        return 'tripadvisor'
    elif 'youtube.com' in url_lower:
        return 'youtube'
    elif any(d in url_lower for d in ['accessgambia', 'mygambia', 'visitthegambia']):
        return 'directory'
    else:
        return 'website'


def discover_digital_presence(name: str, region: str = "Gambia") -> Dict:
    """
    Use Google search to discover digital presence
    
    Returns URLs for website, social media, directories
    """
    print(f"\n🔍 Discovering digital presence for: {name}")
    
    query = f"{name} {region}"
    results = google_custom_search(query)
    
    discovered = {
        'website': None,
        'facebook': None,
        'instagram': None,
        'tripadvisor': None,
        'youtube': None,
        'directories': []
    }
    
    if not results:
        print("  ❌ No search results found")
        return discovered
    
    print(f"  ✓ Found {len(results)} search results")
    
    for result in results:
        url = result['link']
        title = result.get('title', '')
        platform = classify_url(url)
        
        print(f"    • {title[:50]}... → {platform}")
        
        if platform == 'website' and not discovered['website']:
            # First non-social URL is likely their official site
            discovered['website'] = url
        elif platform == 'directory':
            discovered['directories'].append(url)
        elif platform in discovered and not discovered[platform]:
            discovered[platform] = url
    
    # Summary
    print(f"\n  📊 Discovered:")
    for key, value in discovered.items():
        if key == 'directories':
            if value:
                print(f"    • {key}: {len(value)} found")
        elif value:
            print(f"    • {key}: {value}")
    
    return discovered


def scrape_website(url: str) -> Dict:
    """
    Scrape website and evaluate criteria
    
    Returns which website criteria are met (1 or 0)
    """
    print(f"\n🌐 Scraping website: {url}")
    
    try:
        response = requests.get(url, headers={'User-Agent': USER_AGENT}, timeout=15)
        
        if response.status_code != 200:
            print(f"  ❌ Failed to load (status: {response.status_code})")
            return {'WEB1_exists_loads': 0}
        
        print(f"  ✓ Website loads (status: 200)")
        
        html = response.text
        soup = BeautifulSoup(html, 'html.parser')
        text = soup.get_text().lower()
        
        criteria = {}
        
        # WEB1: Exists and loads
        criteria['WEB1_exists_loads'] = 1
        print(f"    ✓ WEB1: Exists and loads")
        
        # WEB2: Mobile-friendly
        viewport = soup.find('meta', attrs={'name': 'viewport'})
        has_responsive = '@media' in html or 'max-width' in html
        is_mobile = bool(viewport) or has_responsive
        criteria['WEB2_mobile_friendly'] = 1 if is_mobile else 0
        print(f"    {'✓' if is_mobile else '✗'} WEB2: Mobile-friendly")
        
        # WEB3: No major issues (check a few images/links)
        images = soup.find_all('img')[:5]
        links = soup.find_all('a', href=True)[:10]
        broken_count = 0
        
        # Quick check - don't be too thorough (saves time)
        for img in images:
            if not img.get('src'):
                broken_count += 1
        
        no_issues = broken_count < 2
        criteria['WEB3_no_major_issues'] = 1 if no_issues else 0
        print(f"    {'✓' if no_issues else '✗'} WEB3: No major issues")
        
        # WEB4: Services described
        service_keywords = ['service', 'product', 'offer', 'tour', 'package', 'menu', 'available']
        service_count = sum(1 for kw in service_keywords if kw in text)
        has_services = service_count >= 3
        criteria['WEB4_services_described'] = 1 if has_services else 0
        print(f"    {'✓' if has_services else '✗'} WEB4: Services described")
        
        # WEB5: Contact visible
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        phone_pattern = r'\+?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}'
        has_email = bool(re.search(email_pattern, text))
        has_phone = bool(re.search(phone_pattern, text))
        has_contact = has_email or has_phone or 'contact' in text
        criteria['WEB5_contact_visible'] = 1 if has_contact else 0
        print(f"    {'✓' if has_contact else '✗'} WEB5: Contact info visible")
        
        # WEB6: Working forms
        forms = soup.find_all('form')
        has_form = len(forms) > 0
        criteria['WEB6_working_forms'] = 1 if has_form else 0
        print(f"    {'✓' if has_form else '✗'} WEB6: Contact forms present")
        
        # WEB7: Updated recently
        current_year = datetime.now().year
        last_year = current_year - 1
        has_current_year = str(current_year) in text or str(last_year) in text
        
        # Check meta tags
        last_modified = soup.find('meta', attrs={'name': 'last-modified'})
        date_modified = soup.find('meta', attrs={'property': 'article:modified_time'})
        
        updated = bool(last_modified or date_modified or has_current_year)
        criteria['WEB7_updated_recently'] = 1 if updated else 0
        print(f"    {'✓' if updated else '✗'} WEB7: Updated recently")
        
        # WEB8: Modern design - SKIP (too subjective for automation)
        criteria['WEB8_modern_design'] = ''  # Mark for manual review
        print(f"    ⚠️  WEB8: Modern design [MANUAL REVIEW]")
        
        # WEB9: Multiple pages
        internal_links = [
            link.get('href') for link in links 
            if link.get('href') and not link.get('href').startswith(('http://', 'https://'))
        ]
        unique_pages = len(set(internal_links))
        has_multiple = unique_pages > 3
        criteria['WEB9_multiple_pages'] = 1 if has_multiple else 0
        print(f"    {'✓' if has_multiple else '✗'} WEB9: Multiple pages ({unique_pages} found)")
        
        # WEB10: Links to social
        social_domains = ['facebook.com', 'instagram.com', 'twitter.com', 'youtube.com']
        has_social_links = any(
            any(domain in link.get('href', '').lower() for domain in social_domains)
            for link in links
        )
        criteria['WEB10_links_to_social'] = 1 if has_social_links else 0
        print(f"    {'✓' if has_social_links else '✗'} WEB10: Links to social media")
        
        # Calculate total
        website_raw = sum(v for v in criteria.values() if isinstance(v, int))
        print(f"\n  📊 Website Raw Score: {website_raw}/9 (WEB8 needs manual review)")
        
        return criteria
        
    except Exception as e:
        print(f"  ❌ Error scraping website: {e}")
        return {'WEB1_exists_loads': 0, 'error': str(e)}


def evaluate_discoverability(name: str, search_results: List[Dict], discovered: Dict) -> Dict:
    """
    Evaluate discoverability criteria based on search results
    """
    print(f"\n📍 Evaluating discoverability...")
    
    criteria = {}
    
    # DIS1: Appears in Google search
    in_search = len(search_results) > 0
    criteria['DIS1_in_search'] = 1 if in_search else 0
    print(f"    {'✓' if in_search else '✗'} DIS1: Appears in Google search")
    
    # DIS2: GMB exists - SKIPPING (per user request)
    criteria['DIS2_gmb_exists'] = ''  # Manual or skip
    print(f"    ⚠️  DIS2: GMB listing [SKIPPED]")
    
    # DIS3: Listed on one directory
    has_directory = len(discovered.get('directories', [])) >= 1 or discovered.get('tripadvisor')
    criteria['DIS3_one_directory'] = 1 if has_directory else 0
    print(f"    {'✓' if has_directory else '✗'} DIS3: Listed on at least one directory")
    
    # DIS4: First page of results
    name_lower = name.lower()
    first_page = any(
        name_lower in result.get('title', '').lower() or 
        name_lower in result.get('snippet', '').lower()
        for result in search_results[:10]
    )
    criteria['DIS4_first_page'] = 1 if first_page else 0
    print(f"    {'✓' if first_page else '✗'} DIS4: Appears on first page")
    
    # DIS5: GMB has photos - SKIPPING
    criteria['DIS5_gmb_photos'] = ''  # Manual or skip
    print(f"    ⚠️  DIS5: GMB photos [SKIPPED]")
    
    # DIS6: Multiple directories
    multiple_dirs = len(discovered.get('directories', [])) >= 2
    criteria['DIS6_multiple_directories'] = 1 if multiple_dirs else 0
    print(f"    {'✓' if multiple_dirs else '✗'} DIS6: Multiple directories")
    
    # DIS7-10: Reviews-related - SKIP (need Places API or manual)
    criteria['DIS7_has_reviews'] = ''
    criteria['DIS8_5plus_reviews'] = ''
    criteria['DIS9_responds_reviews'] = ''
    criteria['DIS10_backlinks'] = ''
    print(f"    ⚠️  DIS7-10: Review-related [MANUAL REVIEW]")
    
    # Calculate automatable total
    discoverable_raw = sum(v for v in criteria.values() if isinstance(v, int))
    print(f"\n  📊 Discoverability: {discoverable_raw}/4 automated (6 need manual review)")
    
    return criteria


def assess_one_stakeholder(name: str, region: str = "Gambia", known_website: str = None):
    """
    Complete assessment for one stakeholder
    
    Args:
        name: Stakeholder name
        region: Region/country
        known_website: If you already know their website URL
    """
    print("=" * 80)
    print(f"AUTOMATED ASSESSMENT TEST")
    print("=" * 80)
    print(f"Stakeholder: {name}")
    print(f"Region: {region}")
    print()
    
    # Step 1: Discover via Google Search
    results = google_custom_search(f"{name} {region}")
    
    if not results:
        print("\n❌ No search results - cannot assess")
        print("   This stakeholder may not have online presence, or API not configured")
        return None
    
    discovered = {
        'website': None,
        'facebook': None,
        'instagram': None,
        'tripadvisor': None,
        'directories': []
    }
    
    for result in results:
        url = result['link']
        platform = classify_url(url)
        
        if platform == 'website' and not discovered['website']:
            discovered['website'] = url
        elif platform == 'directory':
            discovered['directories'].append(url)
        elif platform in discovered and not discovered[platform]:
            discovered[platform] = url
    
    # Use known website if provided
    if known_website:
        print(f"\n  💡 Using known website: {known_website}")
        discovered['website'] = known_website
    
    # Step 2: Evaluate Discoverability
    discoverability = evaluate_discoverability(name, results, discovered)
    
    # Step 3: Scrape Website (if found)
    website_criteria = {}
    if discovered.get('website'):
        website_criteria = scrape_website(discovered['website'])
    else:
        print("\n🌐 No website found - all website criteria = 0")
        website_criteria = {f'WEB{i}': 0 for i in range(1, 11)}
    
    # Calculate totals
    discover_raw = sum(v for v in discoverability.values() if isinstance(v, int))
    website_raw = sum(v for v in website_criteria.values() if isinstance(v, int))
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 ASSESSMENT RESULTS")
    print("=" * 80)
    print(f"\nDiscoverability Raw: {discover_raw}/10 (automated 4, manual 6)")
    print(f"Website Raw: {website_raw}/10 (automated 9, manual 1)")
    print(f"\nTotal Automated: {discover_raw + website_raw} points")
    print(f"Needs Manual Review: ~7 criteria")
    print()
    print("Confidence: {'High' if discover_raw + website_raw > 12 else 'Medium' if discover_raw + website_raw > 6 else 'Low'}")
    print()
    
    # Build complete result
    result = {
        'name': name,
        'region': region,
        'assessment_date': datetime.now().isoformat(),
        'assessment_method': 'automated_test',
        'discovered_urls': discovered,
        'discoverability_criteria': discoverability,
        'website_criteria': website_criteria,
        'discoverability_raw': discover_raw,
        'website_raw': website_raw,
        'total_automated': discover_raw + website_raw,
        'manual_review_needed': [
            'DIS2', 'DIS5', 'DIS7', 'DIS8', 'DIS9', 'DIS10',  # Discoverability
            'WEB8',  # Website
            'Social Media (all 10)', 'Visual Content (all 10)', 
            'Digital Sales (all 10)', 'Platform Integration (all 10)'
        ]
    }
    
    return result


# Main test
if __name__ == '__main__':
    import sys
    
    print("🧪 AUTOMATED ASSESSMENT TEST SCRIPT")
    print("=" * 80)
    print()
    print("This script will:")
    print("  1. Search Google for a stakeholder")
    print("  2. Discover their website and social media")
    print("  3. Scrape their website (if found)")
    print("  4. Auto-evaluate discoverable criteria")
    print()
    print("Requirements:")
    print("  • Google Custom Search API key")
    print("  • Search Engine ID")
    print()
    
    # Check if API keys are set
    if not GOOGLE_API_KEY:
        print("⚠️  GOOGLE_API_KEY not set!")
        print("   Set it with: export GOOGLE_API_KEY='your-key'")
        print()
    
    if not SEARCH_ENGINE_ID:
        print("⚠️  GOOGLE_SEARCH_ENGINE_ID not set!")
        print("   Set it with: export GOOGLE_SEARCH_ENGINE_ID='your-search-engine-id'")
        print()
    
    if not GOOGLE_API_KEY or not SEARCH_ENGINE_ID:
        print("Without API keys, this script will run but won't find search results.")
        print()
    
    # Get stakeholder name from command line or use default
    if len(sys.argv) > 1:
        stakeholder_name = ' '.join(sys.argv[1:])
    else:
        stakeholder_name = input("Enter stakeholder name to test (or press Enter for demo): ").strip()
        if not stakeholder_name:
            stakeholder_name = "Gambia Experience"  # Demo tour operator
    
    # Run assessment
    result = assess_one_stakeholder(stakeholder_name)
    
    if result:
        # Save results
        output_file = f"test_assessment_{stakeholder_name.replace(' ', '_')}.json"
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        
        print(f"\n💾 Results saved to: {output_file}")
        print()
        print("=" * 80)
        print("✅ TEST COMPLETE")
        print("=" * 80)
        print()
        print("Next steps:")
        print("  1. Review the results above")
        print("  2. Check if discovered URLs are correct")
        print("  3. Verify website criteria scores feel accurate")
        print("  4. If good, scale up to more stakeholders!")
        print()

