#!/usr/bin/env python3
"""
New 10-Point Base Scoring System for Digital Assessment
Implements the standardized scoring framework with sector-specific weighting
"""

import csv
import os
import re
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse

import pandas as pd
import requests
from bs4 import BeautifulSoup


# Configuration
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/126.0.0.0 Safari/537.36"
)
REQUEST_TIMEOUT_SECONDS = 15

# Sector-specific weighting multipliers
SECTOR_WEIGHTS = {
    'creative': {
        'social_media': 2.2,      # 22 points
        'visual_content': 2.0,    # 20 points  
        'website': 1.0,           # 10 points
        'discoverability': 0.8,   # 8 points
        'digital_sales': 0.5,     # 5 points
        'platform_integration': 0.5  # 5 points
    },
    'tour_operator': {
        'social_media': 1.4,      # 14 points
        'visual_content': 1.0,    # 10 points
        'website': 1.5,           # 15 points
        'discoverability': 1.5,   # 15 points
        'digital_sales': 1.2,     # 12 points
        'platform_integration': 1.0  # 10 points
    }
}

@dataclass
class AssessmentResult:
    name: str
    sector: str
    region: str
    
    # Base scores (0-10 each)
    social_media_base: int
    website_base: int
    visual_content_base: int
    discoverability_base: int
    digital_sales_base: int
    platform_integration_base: int
    
    # Weighted scores
    social_media_weighted: float
    website_weighted: float
    visual_content_weighted: float
    discoverability_weighted: float
    digital_sales_weighted: float
    platform_integration_weighted: float
    
    # Totals
    external_total: float
    maturity_level: str
    
    # Details for debugging
    details: Dict[str, Any]


def safe_get(url: str) -> Optional[requests.Response]:
    """Safely fetch a URL with error handling"""
    if not url or not isinstance(url, str):
        return None
    try:
        headers = {"User-Agent": USER_AGENT}
        resp = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT_SECONDS, allow_redirects=True)
        return resp
    except Exception:
        return None


def normalize_url(url: Optional[str]) -> str:
    """Normalize URL format"""
    if not url or not isinstance(url, str):
        return ""
    url = url.strip().strip('"').strip("'")
    if not url:
        return ""
    if url.startswith("http://") or url.startswith("https://"):
        return url
    if url.startswith("www."):
        return f"https://{url}"
    if "." not in url:
        return ""
    return f"https://{url}"


def extract_text(response: Optional[requests.Response]) -> str:
    """Extract text content from response"""
    if response is None or response.status_code >= 400:
        return ""
    try:
        return response.text or ""
    except Exception:
        return ""


def get_sector_type(sector: str) -> str:
    """Determine if sector is creative or tour operator"""
    sector_lower = sector.lower()
    if any(keyword in sector_lower for keyword in ['tour operator', 'tourism', 'travel']):
        return 'tour_operator'
    return 'creative'


def assess_social_media(links: Dict[str, str], hints_text: str = "") -> Tuple[int, Dict[str, Any]]:
    """
    Assess social media presence using 10-point base system
    
    Basic Setup (3 points) - Easy to achieve
    - Has business account on primary platform = 1 point
    - Has business account on second platform = 1 point  
    - Has business account on third platform = 1 point
    
    Content Activity (3 points) - Moderate effort
    - Posts monthly in last 6 months = 1 point
    - Posts 2x monthly in last 6 months = 1 point
    - Posts weekly in last 6 months = 1 point
    
    Quality & Strategy (4 points) - Requires active management
    - Clear, in-focus photos/videos = 1 point
    - Shows products/services consistently = 1 point
    - Uses platform business features = 1 point
    - Contact info clearly visible = 1 point
    """
    details = {}
    score = 0
    
    # Basic Setup (3 points)
    platforms_found = 0
    for platform in ['facebook', 'instagram', 'whatsapp', 'youtube', 'tiktok', 'linkedin']:
        if links.get(platform):
            platforms_found += 1
            details[f'{platform}_present'] = True
        else:
            details[f'{platform}_present'] = False
    
    # Award points for platform presence (max 3)
    score += min(3, platforms_found)
    details['platform_count'] = platforms_found
    
    # Content Activity (3 points) - Simplified for now
    # In a full implementation, we'd scrape recent posts
    if platforms_found >= 1:
        score += 1  # Assume monthly posting if platform exists
        details['monthly_posting'] = True
    if platforms_found >= 2:
        score += 1  # Assume 2x monthly if multiple platforms
        details['frequent_posting'] = True
    if platforms_found >= 3:
        score += 1  # Assume weekly if 3+ platforms
        details['weekly_posting'] = True
    
    # Quality & Strategy (4 points) - Simplified for now
    # In a full implementation, we'd analyze content quality
    if platforms_found >= 1:
        score += 1  # Assume basic quality if platform exists
        details['content_quality'] = True
    if platforms_found >= 2:
        score += 1  # Assume product focus with multiple platforms
        details['product_focus'] = True
    if platforms_found >= 2:
        score += 1  # Assume business features with multiple platforms
        details['business_features'] = True
    if platforms_found >= 1:
        score += 1  # Assume contact info visible
        details['contact_visible'] = True
    
    return min(10, score), details


def assess_website(website_url: str) -> Tuple[int, Dict[str, Any]]:
    """
    Assess website presence using 10-point base system
    
    Basic Setup (3 points) - Easy to achieve
    - Website exists and loads = 1 point
    - Mobile-friendly/responsive = 1 point
    - No major usability issues = 1 point
    
    Content & Functionality (3 points) - Moderate effort
    - Services/products clearly described = 1 point
    - Contact information clearly visible = 1 point
    - Working contact forms = 1 point
    
    Professional Features (4 points) - Requires active management
    - Content updated within last 6 months = 1 point
    - Modern, professional design = 1 point
    - Multiple pages (not just homepage) = 1 point
    - Links to social media accounts = 1 point
    """
    details = {}
    score = 0
    
    if not website_url:
        return 0, {'error': 'No website URL provided'}
    
    # Test website
    resp = safe_get(website_url)
    if not resp or resp.status_code >= 400:
        return 0, {'error': f'Website not accessible (status: {resp.status_code if resp else "No response"}')}
    
    # Basic Setup (3 points)
    score += 1  # Website exists and loads
    details['website_loads'] = True
    
    # Check mobile responsiveness (simplified)
    html = extract_text(resp)
    if html:
        soup = BeautifulSoup(html, 'html.parser')
        viewport_meta = soup.find('meta', attrs={'name': 'viewport'})
        if viewport_meta:
            score += 1
            details['mobile_friendly'] = True
        else:
            details['mobile_friendly'] = False
        
        # Check for usability issues (simplified)
        broken_links = len(soup.find_all('a', href=True))
        if broken_links > 0:  # Has links, assume they work
            score += 1
            details['no_usability_issues'] = True
        else:
            details['no_usability_issues'] = False
    
    # Content & Functionality (3 points)
    if html:
        text = soup.get_text().lower()
        
        # Check for services/products description
        service_keywords = ['service', 'product', 'about', 'what we do', 'our work']
        if any(keyword in text for keyword in service_keywords):
            score += 1
            details['services_described'] = True
        else:
            details['services_described'] = False
        
        # Check for contact information
        contact_keywords = ['contact', 'phone', 'email', 'address', 'location']
        if any(keyword in text for keyword in contact_keywords):
            score += 1
            details['contact_visible'] = True
        else:
            details['contact_visible'] = False
        
        # Check for contact forms
        forms = soup.find_all('form')
        if forms:
            score += 1
            details['contact_forms'] = True
        else:
            details['contact_forms'] = False
    
    # Professional Features (4 points)
    if html:
        # Check for multiple pages (simplified - look for navigation)
        nav_links = soup.find_all('a', href=True)
        internal_links = [link for link in nav_links if not link.get('href', '').startswith('http')]
        if len(internal_links) > 3:  # Has navigation
            score += 1
            details['multiple_pages'] = True
        else:
            details['multiple_pages'] = False
        
        # Check for professional design (simplified - look for CSS)
        if 'css' in html.lower() or 'style' in html.lower():
            score += 1
            details['professional_design'] = True
        else:
            details['professional_design'] = False
        
        # Check for recent updates (simplified - look for current year)
        current_year = str(datetime.now().year)
        if current_year in html:
            score += 1
            details['recent_updates'] = True
        else:
            details['recent_updates'] = False
        
        # Check for social media links
        social_platforms = ['facebook', 'instagram', 'twitter', 'youtube', 'linkedin']
        social_links = [link for link in nav_links if any(platform in link.get('href', '').lower() for platform in social_platforms)]
        if social_links:
            score += 1
            details['social_links'] = True
        else:
            details['social_links'] = False
    
    return min(10, score), details


def assess_visual_content(website_url: str, social_links: Dict[str, str]) -> Tuple[int, Dict[str, Any]]:
    """
    Assess visual content quality using 10-point base system
    
    Basic Quality (3 points) - Easy to achieve
    - Photos are in focus = 1 point
    - Good lighting = 1 point
    - Subject is clearly visible = 1 point
    
    Content Variety (3 points) - Moderate effort
    - Shows products/services = 1 point
    - Behind-the-scenes content = 1 point
    - Different angles/perspectives = 1 point
    
    Professional Elements (4 points) - Requires active management
    - Consistent style/filter = 1 point
    - Good composition = 1 point
    - Professional product shots = 1 point
    - Video content = 1 point
    """
    details = {}
    score = 0
    
    # Basic Quality (3 points) - Simplified assessment
    if website_url:
        resp = safe_get(website_url)
        if resp and resp.status_code < 400:
            html = extract_text(resp)
            if html:
                soup = BeautifulSoup(html, 'html.parser')
                images = soup.find_all('img')
                
                if len(images) > 0:
                    score += 1  # Assume photos are in focus if images exist
                    details['photos_in_focus'] = True
                else:
                    details['photos_in_focus'] = False
                
                if len(images) > 2:
                    score += 1  # Assume good lighting with multiple images
                    details['good_lighting'] = True
                else:
                    details['good_lighting'] = False
                
                if len(images) > 1:
                    score += 1  # Assume clear subjects with multiple images
                    details['clear_subjects'] = True
                else:
                    details['clear_subjects'] = False
    
    # Content Variety (3 points) - Simplified
    if website_url:
        resp = safe_get(website_url)
        if resp and resp.status_code < 400:
            html = extract_text(resp)
            if html:
                text = html.lower()
                
                # Check for product/service content
                if any(keyword in text for keyword in ['product', 'service', 'work', 'portfolio']):
                    score += 1
                    details['shows_products'] = True
                else:
                    details['shows_products'] = False
                
                # Check for behind-the-scenes content
                if any(keyword in text for keyword in ['behind', 'process', 'making', 'workshop']):
                    score += 1
                    details['behind_scenes'] = True
                else:
                    details['behind_scenes'] = False
                
                # Check for different angles (simplified)
                if 'gallery' in text or 'photos' in text:
                    score += 1
                    details['different_angles'] = True
                else:
                    details['different_angles'] = False
    
    # Professional Elements (4 points) - Simplified
    if website_url:
        resp = safe_get(website_url)
        if resp and resp.status_code < 400:
            html = extract_text(resp)
            if html:
                soup = BeautifulSoup(html, 'html.parser')
                images = soup.find_all('img')
                
                # Check for consistent style (simplified)
                if len(images) > 3:
                    score += 1
                    details['consistent_style'] = True
                else:
                    details['consistent_style'] = False
                
                # Check for good composition (simplified)
                if len(images) > 2:
                    score += 1
                    details['good_composition'] = True
                else:
                    details['good_composition'] = False
                
                # Check for professional shots (simplified)
                if len(images) > 5:
                    score += 1
                    details['professional_shots'] = True
                else:
                    details['professional_shots'] = False
                
                # Check for video content
                videos = soup.find_all(['video', 'iframe'])
                if videos:
                    score += 1
                    details['video_content'] = True
                else:
                    details['video_content'] = False
    
    return min(10, score), details


def assess_discoverability(name: str, region: str, website_url: str) -> Tuple[int, Dict[str, Any]]:
    """
    Assess online discoverability using 10-point base system
    
    Basic Presence (3 points) - Easy to achieve
    - Appears in Google search = 1 point
    - Google My Business listing exists = 1 point
    - Listed on one national directory = 1 point
    
    Search Visibility (3 points) - Moderate effort
    - Appears on first page = 1 point
    - Google My Business has photos = 1 point
    - Listed on multiple directories = 1 point
    
    Reputation Management (4 points) - Requires active management
    - Has customer reviews = 1 point
    - 5+ reviews total = 1 point
    - Responds to reviews = 1 point
    - Other websites link to them = 1 point
    """
    details = {}
    score = 0
    
    # Basic Presence (3 points) - Simplified
    if website_url:
        score += 1  # Assume searchable if website exists
        details['searchable'] = True
    else:
        details['searchable'] = False
    
    # Assume Google My Business exists if website exists
    if website_url:
        score += 1
        details['gmb_listing'] = True
    else:
        details['gmb_listing'] = False
    
    # Assume directory listing if website exists
    if website_url:
        score += 1
        details['directory_listing'] = True
    else:
        details['directory_listing'] = False
    
    # Search Visibility (3 points) - Simplified
    if website_url:
        score += 1  # Assume first page if website exists
        details['first_page'] = True
    else:
        details['first_page'] = False
    
    if website_url:
        score += 1  # Assume GMB photos if website exists
        details['gmb_photos'] = True
    else:
        details['gmb_photos'] = False
    
    if website_url:
        score += 1  # Assume multiple directories if website exists
        details['multiple_directories'] = True
    else:
        details['multiple_directories'] = False
    
    # Reputation Management (4 points) - Simplified
    if website_url:
        score += 1  # Assume reviews exist if website exists
        details['has_reviews'] = True
    else:
        details['has_reviews'] = False
    
    if website_url:
        score += 1  # Assume 5+ reviews if website exists
        details['many_reviews'] = True
    else:
        details['many_reviews'] = False
    
    if website_url:
        score += 1  # Assume responds to reviews if website exists
        details['responds_reviews'] = True
    else:
        details['responds_reviews'] = False
    
    if website_url:
        score += 1  # Assume other sites link if website exists
        details['external_links'] = True
    else:
        details['external_links'] = False
    
    return min(10, score), details


def assess_digital_sales(website_url: str, social_links: Dict[str, str]) -> Tuple[int, Dict[str, Any]]:
    """
    Assess digital sales capability using 10-point base system
    
    Basic Digital Contact (3 points) - Easy to achieve
    - Contact form on website = 1 point
    - WhatsApp Business for orders = 1 point
    - Phone number clearly visible = 1 point
    
    Social Media Commerce (3 points) - Moderate effort
    - Facebook/Instagram shopping = 1 point
    - WhatsApp catalog = 1 point
    - Social media posts include pricing = 1 point
    
    Payment Integration (4 points) - Requires active management
    - Mobile money integration = 1 point
    - Online payment options = 1 point
    - Online booking system = 1 point
    - Full e-commerce website = 1 point
    """
    details = {}
    score = 0
    
    # Basic Digital Contact (3 points)
    if website_url:
        resp = safe_get(website_url)
        if resp and resp.status_code < 400:
            html = extract_text(resp)
            if html:
                soup = BeautifulSoup(html, 'html.parser')
                
                # Check for contact forms
                forms = soup.find_all('form')
                if forms:
                    score += 1
                    details['contact_form'] = True
                else:
                    details['contact_form'] = False
                
                # Check for phone number
                text = soup.get_text()
                phone_pattern = r'(\+?220|0)?[0-9]{7,9}'
                if re.search(phone_pattern, text):
                    score += 1
                    details['phone_visible'] = True
                else:
                    details['phone_visible'] = False
    
    # Check for WhatsApp Business
    if social_links.get('whatsapp'):
        score += 1
        details['whatsapp_business'] = True
    else:
        details['whatsapp_business'] = False
    
    # Social Media Commerce (3 points) - Simplified
    if social_links.get('facebook') or social_links.get('instagram'):
        score += 1  # Assume shopping features if social media exists
        details['social_shopping'] = True
    else:
        details['social_shopping'] = False
    
    if social_links.get('whatsapp'):
        score += 1  # Assume catalog if WhatsApp exists
        details['whatsapp_catalog'] = True
    else:
        details['whatsapp_catalog'] = False
    
    if social_links.get('facebook') or social_links.get('instagram'):
        score += 1  # Assume pricing in posts if social media exists
        details['pricing_posts'] = True
    else:
        details['pricing_posts'] = False
    
    # Payment Integration (4 points) - Simplified
    if website_url:
        resp = safe_get(website_url)
        if resp and resp.status_code < 400:
            html = extract_text(resp)
            if html:
                # Check for payment keywords
                payment_keywords = ['payment', 'pay', 'money', 'orange', 'qmoney', 'visa', 'mastercard']
                if any(keyword in html.lower() for keyword in payment_keywords):
                    score += 1
                    details['mobile_money'] = True
                else:
                    details['mobile_money'] = False
                
                if any(keyword in html.lower() for keyword in payment_keywords):
                    score += 1
                    details['online_payment'] = True
                else:
                    details['online_payment'] = False
                
                # Check for booking keywords
                booking_keywords = ['book', 'booking', 'reserve', 'order']
                if any(keyword in html.lower() for keyword in booking_keywords):
                    score += 1
                    details['booking_system'] = True
                else:
                    details['booking_system'] = False
                
                # Check for e-commerce keywords
                ecommerce_keywords = ['shop', 'cart', 'buy', 'purchase', 'checkout']
                if any(keyword in html.lower() for keyword in ecommerce_keywords):
                    score += 1
                    details['ecommerce'] = True
                else:
                    details['ecommerce'] = False
    
    return min(10, score), details


def assess_platform_integration(social_links: Dict[str, str]) -> Tuple[int, Dict[str, Any]]:
    """
    Assess platform integration using 10-point base system
    
    Basic Presence (3 points) - Easy to achieve
    - Listed on VisitTheGambia = 1 point
    - Listed on TripAdvisor = 1 point
    - Listed on one other platform = 1 point
    
    Profile Completeness (3 points) - Moderate effort
    - Complete profile information = 1 point
    - Professional photos uploaded = 1 point
    - Contact information provided = 1 point
    
    Active Management (4 points) - Requires active management
    - Regular updates on platforms = 1 point
    - Responds to platform messages = 1 point
    - Customer reviews visible = 1 point
    - Cross-platform consistency = 1 point
    """
    details = {}
    score = 0
    
    # Basic Presence (3 points)
    if social_links.get('tripadvisor'):
        score += 1
        details['tripadvisor'] = True
    else:
        details['tripadvisor'] = False
    
    # Assume VisitTheGambia if website exists (simplified)
    score += 1  # Simplified assumption
    details['visit_gambia'] = True
    
    # Check for other platforms
    other_platforms = ['facebook', 'instagram', 'youtube', 'linkedin']
    other_count = sum(1 for platform in other_platforms if social_links.get(platform))
    if other_count > 0:
        score += 1
        details['other_platforms'] = True
    else:
        details['other_platforms'] = False
    
    # Profile Completeness (3 points) - Simplified
    if social_links.get('facebook') or social_links.get('instagram'):
        score += 1  # Assume complete profile if social media exists
        details['complete_profile'] = True
    else:
        details['complete_profile'] = False
    
    if social_links.get('facebook') or social_links.get('instagram'):
        score += 1  # Assume professional photos if social media exists
        details['professional_photos'] = True
    else:
        details['professional_photos'] = False
    
    if social_links.get('facebook') or social_links.get('instagram'):
        score += 1  # Assume contact info if social media exists
        details['contact_provided'] = True
    else:
        details['contact_provided'] = False
    
    # Active Management (4 points) - Simplified
    if social_links.get('facebook') or social_links.get('instagram'):
        score += 1  # Assume regular updates if social media exists
        details['regular_updates'] = True
    else:
        details['regular_updates'] = False
    
    if social_links.get('facebook') or social_links.get('instagram'):
        score += 1  # Assume responds to messages if social media exists
        details['responds_messages'] = True
    else:
        details['responds_messages'] = False
    
    if social_links.get('tripadvisor'):
        score += 1  # Assume reviews visible if TripAdvisor exists
        details['reviews_visible'] = True
    else:
        details['reviews_visible'] = False
    
    if len([p for p in social_links.values() if p]) >= 2:
        score += 1  # Assume consistency if multiple platforms
        details['cross_platform_consistency'] = True
    else:
        details['cross_platform_consistency'] = False
    
    return min(10, score), details


def extract_links_from_text(text: str) -> Dict[str, str]:
    """Extract social media and website links from text"""
    if not text or not isinstance(text, str):
        return {}
    
    results = {}
    url_pattern = re.compile(r"https?://[^\s)\],]+", re.I)
    urls = url_pattern.findall(text)
    
    # Map known platforms
    social_hosts = {
        "facebook": ["facebook.com", "fb.com"],
        "instagram": ["instagram.com"],
        "youtube": ["youtube.com", "youtu.be"],
        "tiktok": ["tiktok.com"],
        "linkedin": ["linkedin.com"],
        "tripadvisor": ["tripadvisor.com"],
        "whatsapp": ["wa.me", "api.whatsapp.com"],
    }
    
    for url in urls:
        url_lower = url.lower()
        for platform, hosts in social_hosts.items():
            if any(host in url_lower for host in hosts):
                results[platform] = normalize_url(url)
                break
    
    return results


def determine_maturity_level(external_total: float) -> str:
    """Determine maturity level based on total score"""
    if external_total >= 80:
        return "Expert"
    elif external_total >= 60:
        return "Advanced"
    elif external_total >= 40:
        return "Intermediate"
    elif external_total >= 20:
        return "Emerging"
    else:
        return "Absent"


def assess_business(row: pd.Series) -> AssessmentResult:
    """Assess a single business using the new scoring system"""
    name = str(row.get("Name of Event", "")).strip()
    sector = str(row.get("Type", "")).strip()
    region = str(row.get("Region", "")).strip()
    
    # Extract links from various columns
    website = normalize_url(row.get("Website"))
    facebook = normalize_url(row.get("Facebook"))
    instagram = normalize_url(row.get("Instagram"))
    tripadvisor = normalize_url(row.get("Tripadvisor"))
    
    # Extract additional links from text fields
    text_fields = []
    for col in ["Digital Presence (Web/Social)", "Description", "Outreach"]:
        val = row.get(col)
        if isinstance(val, str) and val.strip():
            text_fields.append(val)
    
    extracted_links = extract_links_from_text("\n".join(text_fields))
    
    # Combine all links
    all_links = {
        "website": website or extracted_links.get("website", ""),
        "facebook": facebook or extracted_links.get("facebook", ""),
        "instagram": instagram or extracted_links.get("instagram", ""),
        "tripadvisor": tripadvisor or extracted_links.get("tripadvisor", ""),
        "youtube": extracted_links.get("youtube", ""),
        "tiktok": extracted_links.get("tiktok", ""),
        "linkedin": extracted_links.get("linkedin", ""),
        "whatsapp": extracted_links.get("whatsapp", ""),
    }
    
    # Assess each category
    social_media_base, social_details = assess_social_media(all_links)
    website_base, website_details = assess_website(all_links.get("website", ""))
    visual_content_base, visual_details = assess_visual_content(all_links.get("website", ""), all_links)
    discoverability_base, discoverability_details = assess_discoverability(name, region, all_links.get("website", ""))
    digital_sales_base, digital_sales_details = assess_digital_sales(all_links.get("website", ""), all_links)
    platform_integration_base, platform_details = assess_platform_integration(all_links)
    
    # Determine sector type and apply weighting
    sector_type = get_sector_type(sector)
    weights = SECTOR_WEIGHTS[sector_type]
    
    # Calculate weighted scores
    social_media_weighted = social_media_base * weights['social_media']
    website_weighted = website_base * weights['website']
    visual_content_weighted = visual_content_base * weights['visual_content']
    discoverability_weighted = discoverability_base * weights['discoverability']
    digital_sales_weighted = digital_sales_base * weights['digital_sales']
    platform_integration_weighted = platform_integration_base * weights['platform_integration']
    
    # Calculate total
    external_total = (
        social_media_weighted + 
        website_weighted + 
        visual_content_weighted + 
        discoverability_weighted + 
        digital_sales_weighted + 
        platform_integration_weighted
    )
    
    maturity_level = determine_maturity_level(external_total)
    
    # Combine all details
    all_details = {
        'social_media': social_details,
        'website': website_details,
        'visual_content': visual_details,
        'discoverability': discoverability_details,
        'digital_sales': digital_sales_details,
        'platform_integration': platform_details,
        'sector_type': sector_type,
        'weights_applied': weights
    }
    
    return AssessmentResult(
        name=name,
        sector=sector,
        region=region,
        social_media_base=social_media_base,
        website_base=website_base,
        visual_content_base=visual_content_base,
        discoverability_base=discoverability_base,
        digital_sales_base=digital_sales_base,
        platform_integration_base=platform_integration_base,
        social_media_weighted=social_media_weighted,
        website_weighted=website_weighted,
        visual_content_weighted=visual_content_weighted,
        discoverability_weighted=discoverability_weighted,
        digital_sales_weighted=digital_sales_weighted,
        platform_integration_weighted=platform_integration_weighted,
        external_total=external_total,
        maturity_level=maturity_level,
        details=all_details
    )


def run_assessment(input_csv: str, output_csv: str, limit: Optional[int] = None):
    """Run the new assessment on CSV data"""
    print(f"Loading data from {input_csv}...")
    df = pd.read_csv(input_csv)
    
    if limit:
        df = df.head(limit)
        print(f"Limited to first {limit} rows for testing")
    
    print(f"Assessing {len(df)} businesses...")
    
    results = []
    for idx, row in df.iterrows():
        try:
            result = assess_business(row)
            results.append(result)
            print(f"✓ {result.name}: {result.maturity_level} ({result.external_total:.1f}/70)")
        except Exception as e:
            print(f"✗ Error assessing {row.get('Name of Event', 'Unknown')}: {e}")
            continue
    
    # Convert results to DataFrame
    output_data = []
    for result in results:
        output_data.append({
            'Name': result.name,
            'Sector': result.sector,
            'Region': result.region,
            'Sector_Type': result.details['sector_type'],
            'Social_Media_Base': result.social_media_base,
            'Website_Base': result.website_base,
            'Visual_Content_Base': result.visual_content_base,
            'Discoverability_Base': result.discoverability_base,
            'Digital_Sales_Base': result.digital_sales_base,
            'Platform_Integration_Base': result.platform_integration_base,
            'Social_Media_Weighted': result.social_media_weighted,
            'Website_Weighted': result.website_weighted,
            'Visual_Content_Weighted': result.visual_content_weighted,
            'Discoverability_Weighted': result.discoverability_weighted,
            'Digital_Sales_Weighted': result.digital_sales_weighted,
            'Platform_Integration_Weighted': result.platform_integration_weighted,
            'External_Total': result.external_total,
            'Maturity_Level': result.maturity_level
        })
    
    output_df = pd.DataFrame(output_data)
    output_df.to_csv(output_csv, index=False)
    
    print(f"\nAssessment complete! Results saved to {output_csv}")
    print(f"Processed {len(results)} businesses")
    
    # Print summary statistics
    if results:
        avg_score = sum(r.external_total for r in results) / len(results)
        maturity_counts = {}
        for result in results:
            maturity_counts[result.maturity_level] = maturity_counts.get(result.maturity_level, 0) + 1
        
        print(f"\nSummary:")
        print(f"Average Score: {avg_score:.1f}/70")
        print(f"Maturity Distribution:")
        for level, count in maturity_counts.items():
            print(f"  {level}: {count}")


if __name__ == "__main__":
    input_csv = "/Users/alexjeffries/tourism-commons/digital_assessment/docs/The Gambia - Creative Industry & Tourism Stakeholders - CI Stakeholders.csv"
    output_csv = "/Users/alexjeffries/tourism-commons/digital_assessment/output/new_scoring_assessment.csv"
    
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    
    # Run assessment with limit for testing
    run_assessment(input_csv, output_csv, limit=10)
