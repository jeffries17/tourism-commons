#!/usr/bin/env python3
"""
ITO Tour-Level Analysis - Analyzes each individual tour/page separately
Reads from 'ITOs' sheet, writes to 'ITO Tour Analysis'
"""

import json
import time
from datetime import datetime
from ito_content_scraper import ITOContentScraper
from ito_ai_analyzer import ITOAnalyzer
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build


SPREADSHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
SHEET_NAME = 'ITO Tour Analysis'
SOURCE_SHEET = 'ITOs'


def get_sheets_service():
    """Initialize Google Sheets API"""
    SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
    creds = Credentials.from_service_account_file(
        '../tourism-development-d620c-5c9db9e21301.json',
        scopes=SCOPES
    )
    return build('sheets', 'v4', credentials=creds)


def read_ito_list(service):
    """Read ITO list from 'ITOs' sheet"""
    result = service.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=f'{SOURCE_SHEET}!A2:F200'
    ).execute()
    
    rows = result.get('values', [])
    
    itos = []
    for row in rows:
        if len(row) < 3:
            continue
        
        operator = row[0].strip() if len(row) > 0 else ''
        country = row[1].strip() if len(row) > 1 else ''
        dest_url = row[2].strip() if len(row) > 2 else ''
        tour_urls = row[3].strip() if len(row) > 3 else ''
        
        if not operator:
            continue
        
        # Parse tours (default to Gambia for existing data)
        tours = []
        if dest_url:
            tours.append({
                'type': 'Destination Page',
                'url': dest_url
            })
        
        if tour_urls:
            for url in tour_urls.split('\n'):
                url = url.strip()
                if url:
                    tours.append({
                        'type': 'Tour/Itinerary',
                        'url': url
                    })
        
        for tour in tours:
            itos.append({
                'operator': operator,
                'country': country,
                'destination_country': 'Gambia',  # Default for existing data
                'page_type': tour['type'],
                'url': tour['url']
            })
    
    return itos


def read_pending_tours_from_sheet(service):
    """Read tours directly from 'ITO Tour Analysis' sheet that need scraping"""
    result = service.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=f'{SHEET_NAME}!A2:G500'  # FIXED: Include column G for status
    ).execute()
    
    rows = result.get('values', [])
    
    pending = []
    for row_idx, row in enumerate(rows, start=2):  # Start at row 2 (after header)
        if len(row) < 4:
            continue
        
        operator = row[0].strip() if len(row) > 0 else ''
        operator_country = row[1].strip() if len(row) > 1 else ''
        destination = row[2].strip() if len(row) > 2 else ''
        
        # Countries Covered (Column D) might be empty, so we need to handle two cases:
        # Case 1: Column D has data -> row = [A, B, C, D, E, F, G]
        # Case 2: Column D empty -> row = [A, B, C, E, F, G] (API skips empty columns)
        
        # Check if row[3] looks like a URL (starts with http) or status (contains emoji)
        # If it does, Column D is empty and we're in Case 2
        if len(row) > 3 and (row[3].startswith('http') or '⏳' in row[3] or '✅' in row[3] or 'Destination' in row[3] or 'Tour' in row[3]):
            # Case 2: Countries Covered is empty
            page_type = row[3].strip() if len(row) > 3 else ''  # Column E
            url = row[4].strip() if len(row) > 4 else ''  # Column F
            status = row[5].strip() if len(row) > 5 else ''  # Column G
        else:
            # Case 1: Countries Covered has data
            page_type = row[4].strip() if len(row) > 4 else ''  # Column E
            url = row[5].strip() if len(row) > 5 else ''  # Column F
            status = row[6].strip() if len(row) > 6 else ''  # Column G
        
        if not operator or not url:
            continue
        
        # Only include pending tours
        if status == '⏳ Pending' or not status:
            pending.append({
                'operator': operator,
                'country': operator_country,
                'destination_country': destination,
                'page_type': page_type,
                'url': url,
                'sheet_row': row_idx
            })
    
    return pending


def setup_sheet_headers(service):
    """Ensure sheet has proper headers"""
    headers = [
        ['Operator', 'Operator Country', 'Primary Destination', 'Countries Covered', 'Page Type', 'URL', 'Scraping Status',
         'Word Count', 'Sentiment', 'Creative Score', 'Theme 1', 'Theme 2', 'Theme 3',
         'Primary Destination %', 'Packaging Type', 'Is Pure Destination',
         'Heritage', 'Heritage Justification',
         'Crafts', 'Crafts Justification',
         'Music', 'Music Justification',
         'Performing Arts', 'Performing Arts Justification',
         'Festivals', 'Festivals Justification',
         'Audiovisual', 'Audiovisual Justification',
         'Fashion', 'Fashion Justification',
         'Publishing', 'Publishing Justification',
         'Best Cultural Quote', 'Analysis Date']
    ]
    
    service.spreadsheets().values().update(
        spreadsheetId=SPREADSHEET_ID,
        range=f'{SHEET_NAME}!A1:AJ1',
        valueInputOption='RAW',
        body={'values': headers}
    ).execute()


def write_tour_analysis(service, tour, analysis, scraping_status="✅ Scraped"):
    """Write a single tour analysis to the sheet"""
    
    themes = analysis.get('themes', [])
    theme1 = themes[0] if len(themes) > 0 else ''
    theme2 = themes[1] if len(themes) > 1 else ''
    theme3 = themes[2] if len(themes) > 2 else ''
    
    sector_scores = analysis.get('sector_scores', {})
    sector_justifications = analysis.get('sector_justifications', {})
    
    # Determine if this is a "pure" destination tour (>=80% focus on primary destination)
    dest_pct = analysis.get('destination_percentage', 0)
    is_pure = 'Yes' if dest_pct >= 80 else 'No'
    
    # Get countries covered from analysis
    countries_covered = analysis.get('countries_detected', tour.get('destination_country', 'Gambia'))
    
    row_data = [
        tour['operator'],
        tour['country'],
        tour.get('destination_country', 'Gambia'),
        countries_covered,
        tour['page_type'],
        tour['url'],
        scraping_status,
        analysis.get('word_count', 0),
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
        '',  # Best cultural quote (placeholder)
        datetime.now().strftime('%Y-%m-%d')
    ]
    
    # Append to sheet
    service.spreadsheets().values().append(
        spreadsheetId=SPREADSHEET_ID,
        range=f'{SHEET_NAME}!A2',
        valueInputOption='RAW',
        insertDataOption='INSERT_ROWS',
        body={'values': [row_data]}
    ).execute()
    
    # Update original row's status if sheet_row is provided
    if 'sheet_row' in tour and tour['sheet_row']:
        service.spreadsheets().values().update(
            spreadsheetId=SPREADSHEET_ID,
            range=f'{SHEET_NAME}!G{tour["sheet_row"]}',  # Column G = Scraping Status
            valueInputOption='RAW',
            body={'values': [[scraping_status]]}
        ).execute()
    
    pure_label = '(Pure)' if is_pure == 'Yes' else '(Multi-country)'
    print(f"  ✅ Added to sheet: {tour['operator']} - {tour.get('destination_country', 'Gambia')} {pure_label} - {tour['page_type']}")


def main():
    print("="*80)
    print("ITO TOUR-LEVEL ANALYSIS")
    print("="*80)
    
    # Initialize
    service = get_sheets_service()
    scraper = ITOContentScraper()
    analyzer = ITOAnalyzer()
    
    # Ask for source
    print("\nSource options:")
    print("  1. ITOs sheet (original Gambia tours)")
    print("  2. ITO Tour Analysis sheet (pending tours only)")
    
    source_choice = input("\nSelect source (1-2): ").strip()
    
    if source_choice == '2':
        # Read pending tours from analysis sheet
        itos = read_pending_tours_from_sheet(service)
        print(f"\n📋 Found {len(itos)} pending tours in '{SHEET_NAME}' sheet")
        
        if not itos:
            print("No pending tours found. Add tours using add_regional_tours_batch.py")
            return
    else:
        # Read from ITOs sheet (original)
        itos = read_ito_list(service)
        print(f"\n📋 Found {len(itos)} individual tour pages to analyze")
    
    # Ask user
    print("\nProcessing options:")
    print("  1. Pilot test (first 10 tours)")
    print("  2. Batch (30 tours)")
    print("  3. Full run (all tours)")
    print("  4. Continue from tour #31 onwards")
    print("  5. Skip first N tours (custom)")
    
    choice = input("\nSelect option (1-5): ").strip()
    
    if choice == '1':
        itos = itos[:10]
        print(f"\n🧪 PILOT MODE: Analyzing {len(itos)} tours")
    elif choice == '2':
        itos = itos[:30]
        print(f"\n📦 BATCH MODE: Analyzing {len(itos)} tours")
    elif choice == '4':
        itos = itos[30:]  # Skip first 30
        print(f"\n🔄 CONTINUE MODE: Analyzing {len(itos)} tours (starting from #31)")
    elif choice == '5':
        skip_count = input("\nHow many tours to skip? ").strip()
        try:
            skip_count = int(skip_count)
            itos = itos[skip_count:]
            print(f"\n🔄 CUSTOM CONTINUE: Analyzing {len(itos)} tours (starting from #{skip_count + 1})")
        except ValueError:
            print("Invalid number, using full run instead")
            print(f"\n🚀 FULL RUN: Analyzing all {len(itos)} tours")
    else:
        print(f"\n🚀 FULL RUN: Analyzing all {len(itos)} tours")
    
    # Setup headers
    setup_sheet_headers(service)
    
    # Track blocked
    blocked_tours = []
    successful = 0
    
    # Process each tour
    for i, tour in enumerate(itos, 1):
        print(f"\n{'='*80}")
        print(f"[{i}/{len(itos)}] {tour['operator']} ({tour['country']})")
        print(f"{'='*80}")
        print(f"  📄 {tour['page_type']}: {tour['url']}...")
        
        # Scrape
        print(f"  Scraping: {tour['url']}...")
        content = scraper.scrape_page(tour['url'])
        
        if not content.get('success', False):
            print(f"    🚫 BLOCKED: {content.get('error', 'Unknown error')}")
            blocked_tours.append(tour)
            write_tour_analysis(service, tour, {
                'word_count': 0,
                'sentiment': 0,
                'creative_score': 0,
                'themes': [],
                'sector_scores': {},
                'sector_justifications': {},
                'destination_percentage': 0,
                'packaging_type': 'Unknown'
            }, scraping_status="🚫 BLOCKED - Manual Screenshot Needed")
            continue
        
        word_count = len(content['full_text'].split())
        
        if word_count < 50:
            print(f"    ⚠️  Insufficient content ({word_count} words)")
            continue
        
        print(f"    ✅ Extracted {word_count} words")
        
        # Analyze
        destination = tour.get('destination_country', 'Gambia')
        analysis = analyzer.analyze_content(
            f"{tour['operator']} - {tour['page_type']}",
            content['full_text'],
            destination_country=destination
        )
        analysis['word_count'] = word_count
        
        # Write to sheet
        write_tour_analysis(service, tour, analysis)
        successful += 1
        
        time.sleep(2)  # Rate limiting
    
    # Summary
    print(f"\n\n{'='*80}")
    print("ANALYSIS COMPLETE")
    print(f"{'='*80}")
    print(f"✅ Successfully analyzed: {successful}/{len(itos)} pages")
    print(f"🚫 Blocked (need manual screenshots): {len(blocked_tours)} pages")
    
    if blocked_tours:
        print(f"\n📋 BLOCKED OPERATORS (Manual Screenshot Needed):")
        blocked_by_operator = {}
        for tour in blocked_tours:
            op = tour['operator']
            if op not in blocked_by_operator:
                blocked_by_operator[op] = []
            blocked_by_operator[op].append(tour)
        
        for operator, tours in blocked_by_operator.items():
            print(f"  {operator} ({tours[0]['country']}) - {len(tours)} page(s)")
            for t in tours[:2]:
                print(f"    - {t['page_type']}: {t['url'][:70]}...")
            if len(tours) > 2:
                print(f"    ... and {len(tours)-2} more")
        
        # Save blocked list
        with open('ito_blocked_for_manual_review.json', 'w') as f:
            json.dump(blocked_tours, f, indent=2)
        print(f"\n💾 Blocked tours saved to: ito_blocked_for_manual_review.json")
    
    print(f"\n📊 Check '{SHEET_NAME}' sheet for detailed results!")
    print(f"💡 Each tour/page analyzed separately with:")
    print(f"   - URL tracking")
    print(f"   - Individual sentiment & creative scores")
    print(f"   - Packaging analysis (solo vs. multi-country)")
    print(f"   - Sector scores with justifications")
    
    if blocked_tours:
        print(f"\n🎯 NEXT STEP: Manual screenshot & analysis for blocked operators")


if __name__ == '__main__':
    main()

