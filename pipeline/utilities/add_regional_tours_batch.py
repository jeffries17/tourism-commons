#!/usr/bin/env python3
"""
Batch Add Regional Tours to ITO Tour Analysis Sheet
Paste multiple URLs at once in a simple format
"""

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from datetime import datetime

SPREADSHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
SHEET_NAME = 'ITO Tour Analysis'


def get_sheets_service():
    """Initialize Google Sheets API"""
    SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
    creds = Credentials.from_service_account_file(
        '../tourism-development-d620c-5c9db9e21301.json',
        scopes=SCOPES
    )
    return build('sheets', 'v4', credentials=creds)


def parse_batch_input(text):
    """
    Parse batch input in format:
    Operator | Operator Country | Destination | Page Type | URL
    
    Example:
    Intrepid Travel | UK | Senegal | Tour | https://intrepidtravel.com/trips/senegal-explorer
    Explore | UK | Ghana | Destination | https://explore.co.uk/destinations/ghana
    """
    tours = []
    
    for line in text.strip().split('\n'):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        
        parts = [p.strip() for p in line.split('|')]
        
        if len(parts) < 5:
            print(f"  ⚠️  Skipping malformed line: {line[:60]}...")
            continue
        
        operator = parts[0]
        operator_country = parts[1]
        destination = parts[2]
        page_type_input = parts[3].lower()
        url = parts[4]
        
        # Normalize page type
        if page_type_input in ['tour', 'itinerary', 't']:
            page_type = 'Tour/Itinerary'
        else:
            page_type = 'Destination Page'
        
        tours.append({
            'operator': operator,
            'operator_country': operator_country,
            'destination': destination,
            'page_type': page_type,
            'url': url
        })
    
    return tours


def add_tours_to_sheet(service, tours):
    """Add multiple tours to sheet at once"""
    
    rows = []
    for tour in tours:
        row_data = [
            tour['operator'],
            tour['operator_country'],
            tour['destination'],
            '',  # Countries covered (will be auto-detected during analysis)
            tour['page_type'],
            tour['url'],
            '⏳ Pending',  # Scraping status
            '',  # Word count
            '',  # Sentiment
            '',  # Creative score
            '', '', '',  # Themes
            '',  # Destination %
            '',  # Packaging type
            '',  # Is pure destination
            '', '', '', '', '', '', '', '', '', '',  # Sector scores
            '', '', '', '', '', '', '', '',  # Sector justifications
            '',  # Best cultural quote
            datetime.now().strftime('%Y-%m-%d')
        ]
        rows.append(row_data)
    
    # Batch append
    service.spreadsheets().values().append(
        spreadsheetId=SPREADSHEET_ID,
        range=f'{SHEET_NAME}!A2',
        valueInputOption='RAW',
        insertDataOption='INSERT_ROWS',
        body={'values': rows}
    ).execute()


def main():
    print("="*80)
    print("BATCH ADD REGIONAL TOURS")
    print("="*80)
    print()
    print("Paste your tours in this format (one per line):")
    print("  Operator | Country | Destination | Type | URL")
    print()
    print("Example:")
    print("  Intrepid Travel | UK | Senegal | Tour | https://intrepidtravel.com/trips/senegal")
    print("  Explore | UK | Ghana | Destination | https://explore.co.uk/destinations/ghana")
    print()
    print("Type (or paste) your tours below, then press Enter twice when done:")
    print("-" * 80)
    
    lines = []
    while True:
        try:
            line = input()
            if not line:
                if lines:
                    break
                else:
                    continue
            lines.append(line)
        except EOFError:
            break
    
    batch_input = '\n'.join(lines)
    
    if not batch_input.strip():
        print("No tours provided. Exiting.")
        return
    
    print()
    print("="*80)
    print("PARSING INPUT")
    print("="*80)
    
    tours = parse_batch_input(batch_input)
    
    if not tours:
        print("No valid tours found. Check your format.")
        return
    
    print(f"\n✅ Parsed {len(tours)} tours:")
    for tour in tours:
        print(f"  • {tour['operator']} - {tour['destination']} ({tour['page_type']})")
    
    print()
    confirm = input("Add these tours to the sheet? (y/n): ").strip().lower()
    
    if confirm != 'y':
        print("Cancelled.")
        return
    
    print()
    print("="*80)
    print("ADDING TO SHEET")
    print("="*80)
    print()
    
    service = get_sheets_service()
    add_tours_to_sheet(service, tours)
    
    print(f"✅ Added {len(tours)} tours to '{SHEET_NAME}' sheet")
    print()
    print("NEXT STEPS:")
    print("1. Review the sheet to verify entries")
    print("2. Run: python3 run_ito_tour_level_analysis.py")
    print("3. Choose which tours to scrape & analyze")
    print()


if __name__ == '__main__':
    main()

