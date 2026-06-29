#!/usr/bin/env python3
"""
Corrected Automated Assessment Script
Fixes all data format issues
"""

import os
import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
import time
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
    """Evaluate website criteria (WEB1-7,9-10) - FIXED to return proper binary values"""
    if not html_content:
        return {f'WEB{i}': 0 for i in [1,2,3,4,5,6,7,8,9,10]}
    
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
    
    # WEB8: Modern design - FIXED: Use 0 instead of empty string
    results['WEB8'] = 0  # Manual assessment needed
    
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
    """Evaluate discoverability criteria (DIS1,3,4,6) - FIXED to return proper binary values"""
    results = {}
    
    # DIS1: Appears in Google search
    results['DIS1'] = 1 if discovered_urls else 0
    
    # DIS2: GMB listing - FIXED: Use 0 instead of empty string
    results['DIS2'] = 0  # Manual assessment needed
    
    # DIS3: Listed on at least one directory
    directories = ['tripadvisor', 'booking.com', 'expedia', 'accessgambia', 'gambia.com']
    has_directory = any(any(dir_name in url.lower() for dir_name in directories) for url in discovered_urls)
    results['DIS3'] = 1 if has_directory else 0
    
    # DIS4: Appears on first page
    results['DIS4'] = 1 if discovered_urls else 0
    
    # DIS5: GMB photos - FIXED: Use 0 instead of empty string
    results['DIS5'] = 0  # Manual assessment needed
    
    # DIS6: Multiple directories
    directory_count = sum(1 for url in discovered_urls 
                         if any(dir_name in url.lower() for dir_name in directories))
    results['DIS6'] = 1 if directory_count > 1 else 0
    
    # DIS7-10: Review-related - FIXED: Use 0 instead of empty string
    results['DIS7'] = 0  # Manual assessment needed
    results['DIS8'] = 0  # Manual assessment needed
    results['DIS9'] = 0  # Manual assessment needed
    results['DIS10'] = 0  # Manual assessment needed
    
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
            'website_results': {f'WEB{i}': 0 for i in range(1, 11)}
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
    discover_raw = sum(discover_results.values())
    print(f"  📊 Discoverability: {discover_raw}/10 automated")
    
    # Evaluate website
    website_raw = 0
    if website_url:
        print(f"  🌐 Scraping website...")
        html_content = scrape_website(website_url)
        website_results = evaluate_website_criteria(html_content, website_url)
        website_raw = sum(website_results.values())
        print(f"  📊 Website: {website_raw}/10 automated")
    else:
        website_results = {f'WEB{i}': 0 for i in range(1, 11)}
    
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

def write_single_result_corrected(result, row_num):
    """Write a single result to Checklist Detail with CORRECTED data format"""
    print(f"  💾 Writing to Checklist Detail row {row_num}...")
    
    # Build row data - FIXED: All values are binary (0 or 1)
    row_data = [
        result['stakeholder_name'],  # A
        'Tour Operator',  # B
        datetime.now().strftime('%Y-%m-%d'),  # C
        'Automated (Google Search + Scraping)',  # D
        'Python Script',  # E
        
        # Social Media (F-O) - ALL 0s (manual assessment needed)
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  # F-O: SM1-SM10
        
        # Website (Q-Z) - FIXED: All binary values
        result['website_results']['WEB1'],
        result['website_results']['WEB2'],
        result['website_results']['WEB3'],
        result['website_results']['WEB4'],
        result['website_results']['WEB5'],
        result['website_results']['WEB6'],
        result['website_results']['WEB7'],
        result['website_results']['WEB8'],
        result['website_results']['WEB9'],
        result['website_results']['WEB10'],
        
        # Visual Content (AB-AK) - ALL 0s (manual assessment needed)
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  # AB-AK: VIS1-VIS10
        
        # Discoverability (AM-AV) - FIXED: All binary values
        result['discoverability_results']['DIS1'],
        result['discoverability_results']['DIS2'],
        result['discoverability_results']['DIS3'],
        result['discoverability_results']['DIS4'],
        result['discoverability_results']['DIS5'],
        result['discoverability_results']['DIS6'],
        result['discoverability_results']['DIS7'],
        result['discoverability_results']['DIS8'],
        result['discoverability_results']['DIS9'],
        result['discoverability_results']['DIS10'],
        
        # Digital Sales (AX-BG) - ALL 0s (manual assessment needed)
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  # AX-BG: SAL1-SAL10
        
        # Platform Integration (BI-BR) - ALL 0s (manual assessment needed)
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  # BI-BR: PLAT1-PLAT10
        
        # Summary
        '',  # BT: Total (will be calculated by formula)
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
    
    # Add formulas with rate limiting
    time.sleep(2)
    
    formulas = [
        (f'Checklist Detail!P{row_num}', f'=SUM(F{row_num}:O{row_num})'),      # Social Media Raw
        (f'Checklist Detail!AA{row_num}', f'=SUM(Q{row_num}:Z{row_num})'),     # Website Raw
        (f'Checklist Detail!AL{row_num}', f'=SUM(AB{row_num}:AK{row_num})'),   # Visual Content Raw
        (f'Checklist Detail!AW{row_num}', f'=SUM(AM{row_num}:AV{row_num})'),   # Discoverability Raw
        (f'Checklist Detail!BH{row_num}', f'=SUM(AX{row_num}:BG{row_num})'),   # Digital Sales Raw
        (f'Checklist Detail!BS{row_num}', f'=SUM(BI{row_num}:BR{row_num})'),   # Platform Integration Raw
        (f'Checklist Detail!BT{row_num}', f'=SUM(P{row_num},AA{row_num},AL{row_num},AW{row_num},BH{row_num},BS{row_num})')  # Total Raw
    ]
    
    for range_name, formula in formulas:
        service.spreadsheets().values().update(
            spreadsheetId=SHEET_ID,
            range=range_name,
            valueInputOption='USER_ENTERED',
            body={'values': [[formula]]}
        ).execute()
        time.sleep(1)  # Rate limiting
    
    print(f"  ✅ Row {row_num}: {result['stakeholder_name']} - {result['total_automated']}/20 points")

def main():
    print("=" * 80)
    print("CORRECTED AUTOMATED ASSESSMENT")
    print("=" * 80)
    print()
    print("This script fixes all data format issues:")
    print("  • All values are binary (0 or 1)")
    print("  • No empty strings or text descriptions")
    print("  • Proper formulas for raw totals")
    print("  • Rate limiting to avoid API quotas")
    print()
    
    if not GOOGLE_API_KEY or not SEARCH_ENGINE_ID:
        print("❌ Missing API credentials!")
        print("Set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID environment variables")
        return
    
    # Test with one stakeholder
    print("Testing with West African Tours...")
    result = automated_assessment('West African Tours')
    write_single_result_corrected(result, 4)
    
    print("\n✅ Test complete! Check your Google Sheet.")
    print("If this looks correct, you can run it on all stakeholders.")

if __name__ == '__main__':
    main()
