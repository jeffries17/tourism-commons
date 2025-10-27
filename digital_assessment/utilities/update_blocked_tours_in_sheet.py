#!/usr/bin/env python3
"""Update blocked tour rows in Google Sheet with manual analysis results"""

import re
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from ito_ai_analyzer import ITOAnalyzer

SPREADSHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
SHEET_NAME = 'ITO Tour Analysis'
SERVICE_ACCOUNT_FILE = 'config/tourism-development-d620c-5c9db9e21301.json'

def extract_tours_from_file(filepath):
    """Extract individual tours from the blocked text file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    url_pattern = r'^https://[^\s]+$'
    tours = []
    
    lines = content.split('\n')
    current_url = None
    current_text = []
    
    for line in lines:
        if re.match(url_pattern, line):
            if current_url and current_text:
                tours.append({
                    'url': current_url,
                    'text': '\n'.join(current_text).strip()
                })
            current_url = line.strip()
            current_text = []
        else:
            if current_url:
                current_text.append(line)
    
    if current_url and current_text:
        tours.append({
            'url': current_url,
            'text': '\n'.join(current_text).strip()
        })
    
    return tours

def identify_destination(url):
    """Extract destination from URL"""
    destinations = {
        'gambia': 'Gambia',
        'senegal': 'Senegal',
        'kaapverdie': 'Cape Verde',
        'cape-verde': 'Cape Verde',
        'ghana': 'Ghana',
        'benin': 'Benin',
        'nigeria': 'Nigeria',
    }
    
    url_lower = url.lower()
    for keyword, dest in destinations.items():
        if keyword in url_lower:
            return dest
    
    return 'Multi-country'

def find_blocked_rows(service):
    """Find all rows marked as blocked in the sheet"""
    result = service.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=f'{SHEET_NAME}!A2:G500'
    ).execute()
    
    rows = result.get('values', [])
    blocked_rows = []
    
    for row_idx, row in enumerate(rows, start=2):
        if len(row) >= 7:
            status = row[6] if len(row) > 6 else ''
            if '🚫 BLOCKED' in status or 'BLOCKED' in status:
                url = row[5] if len(row) > 5 else ''
                blocked_rows.append({
                    'row_number': row_idx,
                    'url': url,
                    'operator': row[0] if len(row) > 0 else '',
                    'operator_country': row[1] if len(row) > 1 else '',
                    'destination': row[2] if len(row) > 2 else '',
                    'page_type': row[4] if len(row) > 4 else ''
                })
    
    return blocked_rows

def url_matches(sheet_url, text_url):
    """Check if URLs match (handling truncations and variations)"""
    # Remove common variations
    sheet_clean = sheet_url.replace('...', '').strip().lower()
    text_clean = text_url.strip().lower()
    
    # Check if one is substring of other
    return sheet_clean in text_clean or text_clean in sheet_clean

def main():
    print("=" * 80)
    print("UPDATING BLOCKED TOURS IN GOOGLE SHEET")
    print("=" * 80)
    
    # Authenticate
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE,
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    service = build('sheets', 'v4', credentials=creds)
    
    # Find blocked rows
    print("\n📋 Finding blocked rows in sheet...")
    blocked_rows = find_blocked_rows(service)
    print(f"   Found {len(blocked_rows)} blocked rows")
    
    # Extract and analyze tours
    print("\n📄 Analyzing blocked tour texts...")
    tours = extract_tours_from_file('docs/blocked_ito_text.md')
    print(f"   Found {len(tours)} tour texts")
    
    analyzer = ITOAnalyzer()
    updates_made = 0
    
    for blocked_row in blocked_rows:
        print(f"\n{'='*80}")
        print(f"Processing: {blocked_row['operator']} - {blocked_row['destination']}")
        print(f"  Sheet Row: {blocked_row['row_number']}")
        print(f"  URL: {blocked_row['url'][:80]}...")
        
        # Find matching tour text
        matching_tour = None
        for tour in tours:
            if url_matches(blocked_row['url'], tour['url']):
                matching_tour = tour
                break
        
        if not matching_tour:
            print(f"  ⚠️  No matching text found")
            continue
        
        print(f"  ✓ Found matching text ({len(matching_tour['text'])} chars)")
        
        # Analyze
        try:
            destination = identify_destination(matching_tour['url'])
            analysis = analyzer.analyze_content(
                f"{blocked_row['operator']} - {blocked_row['page_type']}",
                matching_tour['text'],
                destination_country=destination
            )
            
            # Prepare row data
            themes = analysis.get('themes', [])
            theme1 = themes[0] if len(themes) > 0 else ''
            theme2 = themes[1] if len(themes) > 1 else ''
            theme3 = themes[2] if len(themes) > 2 else ''
            
            sector_scores = analysis.get('sector_scores', {})
            sector_justifications = analysis.get('sector_justifications', {})
            
            dest_pct = analysis.get('destination_percentage', 0)
            is_pure = 'Yes' if dest_pct >= 80 else 'No'
            countries_covered = analysis.get('countries_detected', destination)
            
            # Update the full row (columns H onwards - after URL and Status)
            row_update = [
                analysis.get('word_count', len(matching_tour['text'].split())),
                analysis.get('sentiment', 0),
                analysis.get('creative_score', 0),
                theme1, theme2, theme3,
                dest_pct,
                analysis.get('packaging_type', ''),
                is_pure,
                sector_scores.get('heritage', 0),
                sector_justifications.get('heritage', ''),
                sector_scores.get('crafts', 0),
                sector_justifications.get('crafts', ''),
                sector_scores.get('music', 0),
                sector_justifications.get('music', ''),
                sector_scores.get('performing_arts', 0),
                sector_justifications.get('performing_arts', ''),
                sector_scores.get('festivals', 0),
                sector_justifications.get('festivals', ''),
                sector_scores.get('audiovisual', 0),
                sector_justifications.get('audiovisual', ''),
                sector_scores.get('fashion', 0),
                sector_justifications.get('fashion', ''),
                sector_scores.get('publishing', 0),
                sector_justifications.get('publishing', ''),
                '',  # Best cultural quote
                datetime.now().strftime('%Y-%m-%d')
            ]
            
            # Update columns D (Countries Covered), G (Status), H-AJ (Analysis data)
            service.spreadsheets().values().update(
                spreadsheetId=SPREADSHEET_ID,
                range=f'{SHEET_NAME}!D{blocked_row["row_number"]}',
                valueInputOption='RAW',
                body={'values': [[countries_covered]]}
            ).execute()
            
            service.spreadsheets().values().update(
                spreadsheetId=SPREADSHEET_ID,
                range=f'{SHEET_NAME}!G{blocked_row["row_number"]}',
                valueInputOption='RAW',
                body={'values': [['✅ Manual Analysis']]}
            ).execute()
            
            service.spreadsheets().values().update(
                spreadsheetId=SPREADSHEET_ID,
                range=f'{SHEET_NAME}!H{blocked_row["row_number"]}:AJ{blocked_row["row_number"]}',
                valueInputOption='RAW',
                body={'values': [row_update]}
            ).execute()
            
            print(f"  ✅ Updated: Creative Score {analysis.get('creative_score', 0)}/100")
            updates_made += 1
            
        except Exception as e:
            print(f"  ❌ Error: {str(e)[:100]}")
    
    print("\n" + "=" * 80)
    print("UPDATE COMPLETE")
    print("=" * 80)
    print(f"\n✅ Successfully updated {updates_made}/{len(blocked_rows)} blocked tours")

if __name__ == '__main__':
    main()

