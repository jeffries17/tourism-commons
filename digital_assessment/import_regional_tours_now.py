#!/usr/bin/env python3
"""
Direct import of all regional tours to ITO Tour Analysis sheet
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


def read_batch_file(filepath):
    """Read the batch-ready file"""
    tours = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            
            # Skip comments and empty lines
            if not line or line.startswith('#'):
                continue
            
            # Parse: Operator | Country | Destination | Type | URL
            parts = [p.strip() for p in line.split('|')]
            
            if len(parts) < 5:
                continue
            
            tours.append({
                'operator': parts[0],
                'operator_country': parts[1],
                'destination': parts[2],
                'page_type': parts[3],
                'url': parts[4]
            })
    
    return tours


def add_tours_to_sheet(service, tours):
    """Add multiple tours to sheet at once"""
    
    rows = []
    for tour in tours:
        row_data = [
            tour['operator'],
            tour['operator_country'],
            tour['destination'],  # Primary destination
            '',  # Countries covered (will be auto-detected)
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
            '', '', '', '', '', '', '', '', '', '',  # Sector scores (10 columns)
            '', '', '', '', '', '', '', '',  # Sector justifications (8 columns)
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
    print("IMPORTING REGIONAL TOURS TO GOOGLE SHEET")
    print("="*80)
    print()
    
    # Read batch file
    batch_file = '/Users/alexjeffries/tourism-commons/digital_assessment/regional_tours_batch_ready.txt'
    print(f"Reading: {batch_file}")
    tours = read_batch_file(batch_file)
    print(f"✅ Loaded {len(tours)} tours")
    print()
    
    # Stats
    by_dest = {}
    for tour in tours:
        dest = tour['destination']
        by_dest[dest] = by_dest.get(dest, 0) + 1
    
    print("Tours by destination:")
    for dest, count in sorted(by_dest.items()):
        print(f"  {dest:15s} {count:3d} tours")
    print()
    
    # Confirm
    print(f"About to add {len(tours)} tours to '{SHEET_NAME}' sheet")
    print("These will be marked as '⏳ Pending' for analysis")
    print()
    
    confirm = input("Continue? (yes/no): ").strip().lower()
    
    if confirm != 'yes':
        print("Cancelled.")
        return
    
    print()
    print("="*80)
    print("IMPORTING TO SHEET")
    print("="*80)
    print()
    
    # Get sheets service
    service = get_sheets_service()
    
    # Import in batches of 50 to avoid timeouts
    batch_size = 50
    total_batches = (len(tours) + batch_size - 1) // batch_size
    
    for batch_num in range(total_batches):
        start_idx = batch_num * batch_size
        end_idx = min(start_idx + batch_size, len(tours))
        batch_tours = tours[start_idx:end_idx]
        
        print(f"Importing batch {batch_num + 1}/{total_batches} ({len(batch_tours)} tours)...")
        add_tours_to_sheet(service, batch_tours)
        print(f"  ✅ Batch {batch_num + 1} complete")
    
    print()
    print("="*80)
    print("✅ IMPORT COMPLETE")
    print("="*80)
    print()
    print(f"Added {len(tours)} regional tours to '{SHEET_NAME}' sheet")
    print()
    print("NEXT STEPS:")
    print("1. Open your Google Sheet and verify the new entries")
    print("2. All tours are marked '⏳ Pending'")
    print("3. Run: python3 run_ito_tour_level_analysis.py")
    print("4. Choose option 2 (Pending tours from sheet)")
    print("5. Start with pilot (5-10 tours) to test")
    print()
    print("TIP: Filter sheet by 'Primary Destination' to see tours by country")
    print()


if __name__ == '__main__':
    main()

