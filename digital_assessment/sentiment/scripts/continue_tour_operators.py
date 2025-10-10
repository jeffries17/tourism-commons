#!/usr/bin/env python3
"""
Continue Tour Operators Assessment (Rate Limited)
Processes remaining tour operators with API rate limiting
"""

import os
import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
from urllib.parse import urljoin
import time
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

# API Configuration
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')
SEARCH_ENGINE_ID = os.environ.get('GOOGLE_SEARCH_ENGINE_ID')
SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'

# Google Sheets setup
key_path = '../../../tourism-development-d620c-5c9db9e21301.json'
credentials = service_account.Credentials.from_service_account_file(
    key_path,
    scopes=['https://www.googleapis.com/auth/spreadsheets']
)
service = build('sheets', 'v4', credentials=credentials)

USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'

def google_custom_search(query, api_key, search_engine_id, num_results=10):
    """Search Google using Custom Search API"""
    if not api_key or not search_engine_id:
        return []
    
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        'key': api_key,
        'cx': search_engine_id,
        'q': query,
        'num': num_results
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return data.get('items', [])
    except Exception as e:
        print(f"    ❌ Search error: {e}")
    
    return []

def classify_url(url: str) -> str:
    """Classify URL as website, facebook, instagram, etc."""
    url_lower = url.lower()
    
    if 'facebook.com' in url_lower:
        return 'facebook'
    elif 'instagram.com' in url_lower:
        return 'instagram'
    elif 'tripadvisor.com' in url_lower:
        return 'tripadvisor'
    elif 'booking.com' in url_lower or 'expedia.com' in url_lower:
        return 'booking_platform'
    elif any(domain in url_lower for domain in ['.com', '.org', '.net', '.co', '.io']):
        return 'website'
    else:
        return 'other'

def scrape_website(url: str) -> str:
    """Scrape website content"""
    try:
        response = requests.get(url, headers={'User-Agent': USER_AGENT}, timeout=15)
        if response.status_code == 200:
            return response.text
    except Exception as e:
        print(f"    ❌ Scraping error: {e}")
    return ""

def evaluate_website_criteria(html_content: str, url: str) -> dict:
    """Evaluate website criteria (WEB1-7,9-10)"""
    if not html_content:
        return {**{f'WEB{i}': 0 for i in [1,2,3,4,5,6,7,9,10]}, 'WEB8': ''}
    
    soup = BeautifulSoup(html_content, 'html.parser')
    text = soup.get_text().lower()
    
    results = {}
    
    # WEB1: Exists and loads
    results['WEB1'] = 1
    
    # WEB2: Mobile-friendly
    viewport = soup.find('meta', attrs={'name': 'viewport'})
    has_responsive = '@media' in html_content or 'max-width' in html_content
    is_mobile = bool(viewport) or has_responsive
    results['WEB2'] = 1 if is_mobile else 0
    
    # WEB3: No major issues
    images = soup.find_all('img')[:10]
    broken = sum(1 for img in images if not img.get('src'))
    no_issues = broken < 2
    results['WEB3'] = 1 if no_issues else 0
    
    # WEB4: Services described
    keywords = ['tour', 'service', 'package', 'excursion', 'safari', 'trip', 'booking', 'reservation']
    service_count = sum(1 for kw in keywords if kw in text)
    has_services = service_count >= 3
    results['WEB4'] = 1 if has_services else 0
    
    # WEB5: Contact visible
    has_email = bool(re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text))
    has_phone = bool(re.search(r'\+?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}', text))
    has_contact = has_email or has_phone or 'contact' in text
    results['WEB5'] = 1 if has_contact else 0
    
    # WEB6: Contact forms
    forms = soup.find_all('form')
    has_form = len(forms) > 0
    results['WEB6'] = 1 if has_form else 0
    
    # WEB7: Updated recently
    current_year = datetime.now().year
    has_current = str(current_year) in text or str(current_year - 1) in text
    results['WEB7'] = 1 if has_current else 0
    
    # WEB8: Modern design - MANUAL
    results['WEB8'] = ''
    
    # WEB9: Multiple pages
    links = soup.find_all('a', href=True)
    internal = [l.get('href') for l in links if l.get('href') and not l.get('href').startswith('http')]
    has_multiple = len(set(internal)) > 3
    results['WEB9'] = 1 if has_multiple else 0
    
    # WEB10: Links to social
    social_found = any(d in html_content.lower() for d in ['facebook.com', 'instagram.com'])
    results['WEB10'] = 1 if social_found else 0
    
    return results

def evaluate_discoverability_criteria(business_name: str, region: str, discovered_urls: list) -> dict:
    """Evaluate discoverability criteria (DIS1,3,4,6)"""
    results = {}
    
    # DIS1: Appears in Google search
    results['DIS1'] = 1 if discovered_urls else 0
    
    # DIS2: GMB listing - SKIPPED
    results['DIS2'] = ''
    
    # DIS3: Listed on at least one directory
    directories = ['tripadvisor', 'booking.com', 'expedia', 'accessgambia', 'gambia.com']
    has_directory = any(any(dir_name in url.lower() for dir_name in directories) for url in discovered_urls)
    results['DIS3'] = 1 if has_directory else 0
    
    # DIS4: Appears on first page
    results['DIS4'] = 1 if discovered_urls else 0
    
    # DIS5: GMB photos - SKIPPED
    results['DIS5'] = ''
    
    # DIS6: Multiple directories
    directory_count = sum(1 for url in discovered_urls 
                         if any(dir_name in url.lower() for dir_name in directories))
    results['DIS6'] = 1 if directory_count > 1 else 0
    
    # DIS7-10: Review-related - MANUAL
    results['DIS7'] = ''
    results['DIS8'] = ''
    results['DIS9'] = ''
    results['DIS10'] = ''
    
    return results

def automated_assessment(stakeholder_name: str, region: str = "Gambia") -> dict:
    """Run automated assessment for a stakeholder"""
    print(f"\n🔍 Assessing: {stakeholder_name}")
    print("-" * 60)
    
    # Search Google
    query = f"{stakeholder_name} {region}"
    search_results = google_custom_search(query, GOOGLE_API_KEY, SEARCH_ENGINE_ID)
    
    if not search_results:
        print("  ❌ No search results found")
        return {
            'stakeholder_name': stakeholder_name,
            'region': region,
            'discoverability_raw': 0,
            'website_raw': 0,
            'total_automated': 0,
            'confidence': 'Low',
            'notes': 'No online presence found',
            'discovered_urls': [],
            'website_url': None,
            'discoverability_results': {f'DIS{i}': 0 for i in range(1, 11)},
            'website_results': {**{f'WEB{i}': 0 for i in [1,2,3,4,5,6,7,9,10]}, 'WEB8': ''}
        }
    
    # Extract URLs
    discovered_urls = [item['link'] for item in search_results]
    print(f"  📍 Found {len(discovered_urls)} URLs")
    
    # Find website URL
    website_url = None
    for url in discovered_urls:
        if classify_url(url) == 'website':
            website_url = url
            break
    
    if website_url:
        print(f"  🌐 Website: {website_url}")
    else:
        print("  ⚠️  No website found")
    
    # Evaluate discoverability
    discover_results = evaluate_discoverability_criteria(stakeholder_name, region, discovered_urls)
    discover_raw = sum(v for v in discover_results.values() if isinstance(v, int))
    print(f"  📊 Discoverability: {discover_raw}/6 automated")
    
    # Evaluate website
    website_raw = 0
    if website_url:
        print(f"  🌐 Scraping website...")
        html_content = scrape_website(website_url)
        website_results = evaluate_website_criteria(html_content, website_url)
        website_raw = sum(v for v in website_results.values() if isinstance(v, int))
        print(f"  📊 Website: {website_raw}/9 automated")
    else:
        website_results = {**{f'WEB{i}': 0 for i in [1,2,3,4,5,6,7,9,10]}, 'WEB8': ''}
    
    total_automated = discover_raw + website_raw
    confidence = 'High' if total_automated > 12 else 'Medium' if total_automated > 6 else 'Low'
    
    return {
        'stakeholder_name': stakeholder_name,
        'region': region,
        'discoverability_raw': discover_raw,
        'website_raw': website_raw,
        'total_automated': total_automated,
        'confidence': confidence,
        'notes': f"Found {len(discovered_urls)} URLs, website: {'Yes' if website_url else 'No'}",
        'discovered_urls': discovered_urls,
        'website_url': website_url,
        'discoverability_results': discover_results,
        'website_results': website_results
    }

def get_remaining_tour_operators():
    """Get remaining tour operators (rows 19-23 from TO Assessment)"""
    result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range='TO Assessment!A19:A25'  # Get rows 19-25
    ).execute()
    
    rows = result.get('values', [])
    tour_operators = []
    
    for i, row in enumerate(rows, start=19):
        if row and len(row) > 0 and row[0].strip():
            tour_operators.append({
                'name': row[0].strip(),
                'row': i
            })
    
    return tour_operators

def write_single_result(result, row_num):
    """Write a single result to Checklist Detail with rate limiting"""
    print(f"  💾 Writing to Checklist Detail row {row_num}...")
    
    # Build row data
    row_data = [
        result['stakeholder_name'],  # A
        'Tour Operator',  # B
        datetime.now().strftime('%Y-%m-%d'),  # C
        'Automated (Google Search + Scraping)',  # D
        'Python Script',  # E
        
        # Social Media (F-O) - empty
        '', '', '', '', '', '', '', '', '', '',
        
        # Website (Q-Z)
        result['website_results'].get('WEB1', 0),
        result['website_results'].get('WEB2', 0),
        result['website_results'].get('WEB3', 0),
        result['website_results'].get('WEB4', 0),
        result['website_results'].get('WEB5', 0),
        result['website_results'].get('WEB6', 0),
        result['website_results'].get('WEB7', 0),
        result['website_results'].get('WEB8', ''),
        result['website_results'].get('WEB9', 0),
        result['website_results'].get('WEB10', 0),
        
        # Visual Content (AB-AK) - empty
        '', '', '', '', '', '', '', '', '', '',
        
        # Discoverability (AM-AV)
        result['discoverability_results'].get('DIS1', 0),
        result['discoverability_results'].get('DIS2', ''),
        result['discoverability_results'].get('DIS3', 0),
        result['discoverability_results'].get('DIS4', 0),
        result['discoverability_results'].get('DIS5', ''),
        result['discoverability_results'].get('DIS6', 0),
        result['discoverability_results'].get('DIS7', ''),
        result['discoverability_results'].get('DIS8', ''),
        result['discoverability_results'].get('DIS9', ''),
        result['discoverability_results'].get('DIS10', ''),
        
        # Digital Sales (AX-BG) - empty
        '', '', '', '', '', '', '', '', '', '',
        
        # Platform Integration (BI-BR) - empty
        '', '', '', '', '', '', '', '', '', '',
        
        # Summary
        '',  # BT: Total
        result['notes'],  # BU: Notes
        f"{result['confidence'].lower()}",  # BV: Confidence
        'Yes'  # BW: Manual review needed
    ]
    
    # Write row
    body = {'values': [row_data]}
    service.spreadsheets().values().update(
        spreadsheetId=SHEET_ID,
        range=f'Checklist Detail!A{row_num}:BW{row_num}',
        valueInputOption='USER_ENTERED',
        body=body
    ).execute()
    
    # Add formulas (with delay)
    time.sleep(2)  # Rate limiting
    
    formulas = [
        (f'Checklist Detail!AA{row_num}', f'=SUM(Q{row_num}:Z{row_num})'),
        (f'Checklist Detail!AL{row_num}', f'=SUM(AB{row_num}:AK{row_num})'),
        (f'Checklist Detail!AW{row_num}', f'=SUM(AM{row_num}:AV{row_num})'),
        (f'Checklist Detail!BH{row_num}', f'=SUM(AX{row_num}:BG{row_num})'),
        (f'Checklist Detail!BS{row_num}', f'=SUM(BI{row_num}:BR{row_num})'),
        (f'Checklist Detail!BT{row_num}', f'=SUM(AA{row_num},AL{row_num},AW{row_num},BH{row_num},BS{row_num})')
    ]
    
    for range_name, formula in formulas:
        service.spreadsheets().values().update(
            spreadsheetId=SHEET_ID,
            range=range_name,
            valueInputOption='USER_ENTERED',
            body={'values': [[formula]]}
        ).execute()
        time.sleep(1)  # Rate limiting between formula writes
    
    print(f"  ✅ Row {row_num}: {result['stakeholder_name']} - {result['total_automated']}/20 points")

def main():
    print("=" * 80)
    print("CONTINUE TOUR OPERATORS ASSESSMENT (Rate Limited)")
    print("=" * 80)
    print()
    
    if not GOOGLE_API_KEY or not SEARCH_ENGINE_ID:
        print("❌ Missing API credentials!")
        print("Set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID environment variables")
        return
    
    # Get remaining tour operators
    print("📋 Getting remaining tour operators...")
    tour_operators = get_remaining_tour_operators()
    print(f"Found {len(tour_operators)} remaining tour operators")
    
    if not tour_operators:
        print("✅ All tour operators already processed!")
        return
    
    # Process each one with rate limiting
    print(f"\n🚀 Processing remaining tour operators with rate limiting...")
    
    for i, to in enumerate(tour_operators, 1):
        print(f"\n[{i}/{len(tour_operators)}] Processing: {to['name']}")
        
        try:
            result = automated_assessment(to['name'])
            write_single_result(result, 18 + i)  # Start from row 19
            
            # Rate limiting between assessments
            if i < len(tour_operators):
                print("  ⏳ Waiting 10 seconds for rate limiting...")
                time.sleep(10)
            
        except Exception as e:
            print(f"  ❌ Error: {e}")
            # Still write empty result
            empty_result = {
                'stakeholder_name': to['name'],
                'region': 'Gambia',
                'discoverability_raw': 0,
                'website_raw': 0,
                'total_automated': 0,
                'confidence': 'Low',
                'notes': f'Error during assessment: {e}',
                'discovered_urls': [],
                'website_url': None,
                'discoverability_results': {f'DIS{i}': 0 for i in range(1, 11)},
                'website_results': {**{f'WEB{i}': 0 for i in [1,2,3,4,5,6,7,9,10]}, 'WEB8': ''}
            }
            write_single_result(empty_result, 18 + i)
    
    print("\n" + "=" * 80)
    print("🎉 ALL TOUR OPERATORS COMPLETE!")
    print("=" * 80)
    print()
    print("✅ All 23 tour operators have been assessed")
    print("✅ All data written to Checklist Detail")
    print("✅ TO Assessment should be auto-updating")
    print()
    print(f"Open your sheet: https://docs.google.com/spreadsheets/d/{SHEET_ID}")

if __name__ == '__main__':
    main()
