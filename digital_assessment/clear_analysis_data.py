#!/usr/bin/env python3
"""
Clear analysis data and mark all tours as pending for fresh analysis
Keeps: Operator, Country, Destination, URLs
Clears: Sentiment, Scores, Analysis columns
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


def clear_analysis_data(service):
    """Clear analysis columns while keeping operator/URL data"""
    
    # Read all current data
    result = service.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=f'{SHEET_NAME}!A1:AJ1000'
    ).execute()
    
    all_rows = result.get('values', [])
    
    if not all_rows:
        print("No data found")
        return
    
    header = all_rows[0]
    data_rows = all_rows[1:]
    
    print(f"Found {len(data_rows)} tours")
    print()
    
    # Clear analysis data (keep first 6 columns: A-F)
    # A: Operator, B: Operator Country, C: Primary Destination, 
    # D: Countries Covered, E: Page Type, F: URL
    
    cleared_rows = []
    for row in data_rows:
        # Keep first 6 columns
        cleared_row = row[:6] if len(row) >= 6 else row + [''] * (6 - len(row))
        
        # Add pending status
        cleared_row.append('⏳ Pending')  # Column G: Scraping Status
        
        # Clear rest of columns (H onwards - analysis data)
        # Add empty strings for all analysis columns
        cleared_row.extend([''] * (len(header) - len(cleared_row)))
        
        # Update analysis date
        if len(cleared_row) >= len(header):
            cleared_row[-1] = datetime.now().strftime('%Y-%m-%d')
        
        cleared_rows.append(cleared_row)
    
    return header, cleared_rows


def main():
    print("="*80)
    print("CLEAR ANALYSIS DATA & MARK AS PENDING")
    print("="*80)
    print()
    
    service = get_sheets_service()
    
    print("Reading current data...")
    header, cleared_rows = clear_analysis_data(service)
    
    if not cleared_rows:
        print("No data to clear")
        return
    
    print(f"✅ Prepared {len(cleared_rows)} tours for fresh analysis")
    print()
    print("Data to be cleared:")
    print("  • Word Count, Sentiment, Creative Score")
    print("  • Themes (1, 2, 3)")
    print("  • Destination %, Packaging Type, Is Pure Destination")
    print("  • All sector scores & justifications")
    print("  • Countries Covered (will be re-detected)")
    print()
    print("Data to be kept:")
    print("  • Operator, Operator Country")
    print("  • Primary Destination")
    print("  • Page Type, URL")
    print()
    print("All tours will be marked: ⏳ Pending")
    print()
    
    confirm = input("Proceed with clearing analysis data? (yes/no): ").strip().lower()
    
    if confirm not in ['yes', 'y']:
        print("Cancelled.")
        return
    
    print()
    print("Backing up first...")
    
    # Create backup
    try:
        backup_name = f'ITO Tour Analysis (Pre-Clear Backup {datetime.now().strftime("%Y-%m-%d")})'
        # Note: This may fail if sheet already exists, that's okay
        service.spreadsheets().batchUpdate(
            spreadsheetId=SPREADSHEET_ID,
            body={
                'requests': [{
                    'duplicateSheet': {
                        'sourceSheetId': 0,
                        'newSheetName': backup_name
                    }
                }]
            }
        ).execute()
        print(f"✅ Backup created: '{backup_name}'")
    except:
        print("⚠️  Backup may already exist, continuing...")
    
    print()
    print("Clearing analysis data...")
    
    # Clear old data
    service.spreadsheets().values().clear(
        spreadsheetId=SPREADSHEET_ID,
        range=f'{SHEET_NAME}!A2:AJ1000'
    ).execute()
    
    # Write cleared data
    all_data = [header] + cleared_rows
    service.spreadsheets().values().update(
        spreadsheetId=SPREADSHEET_ID,
        range=f'{SHEET_NAME}!A1',
        valueInputOption='RAW',
        body={'values': all_data}
    ).execute()
    
    print()
    print("="*80)
    print("✅ ANALYSIS DATA CLEARED")
    print("="*80)
    print()
    print(f"All {len(cleared_rows)} tours marked as ⏳ Pending")
    print("Ready for fresh analysis with enhanced scraper!")
    print()
    print("NEXT STEP:")
    print("  source sentiment_env/bin/activate")
    print("  python3 run_ito_tour_level_analysis.py")
    print()
    print("  Choose: Source 2 (Pending tours)")
    print("  Choose: Processing 1 (Pilot - 10 tours)")
    print()


if __name__ == '__main__':
    main()

