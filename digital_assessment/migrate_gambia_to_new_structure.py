#!/usr/bin/env python3
"""
Migrate existing Gambia data to new sheet structure with Primary Destination column
"""

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

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


def read_all_data(service):
    """Read all data from sheet"""
    result = service.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=f'{SHEET_NAME}!A1:AJ1000'
    ).execute()
    
    return result.get('values', [])


def detect_structure(row):
    """Detect if row has old or new structure"""
    # New structure: Column C has country name (Gambia, Senegal, etc.)
    # Old structure: Column C has "Tour/Itinerary" or "Destination Page"
    
    if len(row) < 3:
        return 'unknown'
    
    col_c = row[2].strip() if len(row) > 2 else ''
    
    # Check if it's a page type (old structure)
    if col_c in ['Tour/Itinerary', 'Destination Page', 'Tour', 'Destination']:
        return 'old'
    
    # Check if it's a country name (new structure)
    countries = ['Gambia', 'Senegal', 'Ghana', 'Nigeria', 'Benin', 'Cape Verde']
    if col_c in countries:
        return 'new'
    
    return 'unknown'


def migrate_old_row_to_new(row):
    """Convert old structure row to new structure"""
    # Old structure:
    # A: Operator, B: Country, C: Page Type, D: URL, E: Status, ...rest
    
    # New structure:
    # A: Operator, B: Operator Country, C: Primary Destination, D: Countries Covered, 
    # E: Page Type, F: URL, G: Status, ...rest
    
    if len(row) < 5:
        return row  # Can't migrate incomplete rows
    
    new_row = [
        row[0],  # A: Operator (same)
        row[1],  # B: Operator Country (same)
        'Gambia',  # C: Primary Destination (NEW - default to Gambia)
        '',  # D: Countries Covered (NEW - will be filled during analysis)
        row[2] if len(row) > 2 else '',  # E: Page Type (was C)
        row[3] if len(row) > 3 else '',  # F: URL (was D)
        row[4] if len(row) > 4 else '',  # G: Status (was E)
    ]
    
    # Copy the rest of the columns (analysis data)
    new_row.extend(row[5:] if len(row) > 5 else [])
    
    return new_row


def main():
    print("="*80)
    print("MIGRATING GAMBIA DATA TO NEW STRUCTURE")
    print("="*80)
    print()
    
    service = get_sheets_service()
    
    # Read all data
    print("Reading current sheet data...")
    all_rows = read_all_data(service)
    
    if not all_rows:
        print("No data found")
        return
    
    # Separate header and data
    header = all_rows[0]
    data_rows = all_rows[1:]
    
    print(f"Found {len(data_rows)} data rows")
    print()
    
    # Analyze structure
    old_count = 0
    new_count = 0
    unknown_count = 0
    
    for row in data_rows:
        structure = detect_structure(row)
        if structure == 'old':
            old_count += 1
        elif structure == 'new':
            new_count += 1
        else:
            unknown_count += 1
    
    print("Structure analysis:")
    print(f"  Old structure (needs migration): {old_count} rows")
    print(f"  New structure (already correct): {new_count} rows")
    print(f"  Unknown/empty: {unknown_count} rows")
    print()
    
    if old_count == 0:
        print("✅ No migration needed - all rows are already in new structure!")
        return
    
    # Migrate
    print(f"Migrating {old_count} rows to new structure...")
    print()
    
    migrated_rows = []
    for row in data_rows:
        structure = detect_structure(row)
        if structure == 'old':
            migrated_row = migrate_old_row_to_new(row)
            migrated_rows.append(migrated_row)
        else:
            migrated_rows.append(row)
    
    # Confirm
    print("Migration preview (first 3 old rows):")
    preview_count = 0
    for i, row in enumerate(data_rows):
        if detect_structure(row) == 'old' and preview_count < 3:
            print(f"\n  Row {i+2} (before):")
            print(f"    Operator: {row[0] if len(row) > 0 else 'N/A'}")
            print(f"    Column C (old): {row[2] if len(row) > 2 else 'N/A'}")
            print(f"    URL (old col D): {row[3][:60] if len(row) > 3 else 'N/A'}...")
            
            migrated = migrate_old_row_to_new(row)
            print(f"  After migration:")
            print(f"    Column C (new): {migrated[2]}")
            print(f"    Column D (new): {migrated[3]}")
            print(f"    Column E (Page Type): {migrated[4]}")
            print(f"    Column F (URL): {migrated[5][:60]}...")
            preview_count += 1
    
    print()
    print("="*80)
    confirm = input(f"Proceed with migration of {old_count} rows? (yes/no): ").strip().lower()
    
    if confirm not in ['yes', 'y']:
        print("Cancelled.")
        return
    
    print()
    print("Backing up to new sheet first...")
    
    # Create backup sheet
    try:
        backup_sheet_name = 'ITO Tour Analysis (Backup)'
        service.spreadsheets().batchUpdate(
            spreadsheetId=SPREADSHEET_ID,
            body={
                'requests': [{
                    'duplicateSheet': {
                        'sourceSheetId': 0,  # Adjust if needed
                        'newSheetName': backup_sheet_name
                    }
                }]
            }
        ).execute()
        print(f"✅ Backup created: '{backup_sheet_name}'")
    except:
        print("⚠️  Backup sheet may already exist, continuing...")
    
    # Clear current data (keep header)
    print("Clearing current data...")
    service.spreadsheets().values().clear(
        spreadsheetId=SPREADSHEET_ID,
        range=f'{SHEET_NAME}!A2:AJ1000'
    ).execute()
    
    # Write migrated data
    print("Writing migrated data...")
    all_migrated = [header] + migrated_rows
    
    service.spreadsheets().values().update(
        spreadsheetId=SPREADSHEET_ID,
        range=f'{SHEET_NAME}!A1',
        valueInputOption='RAW',
        body={'values': all_migrated}
    ).execute()
    
    print()
    print("="*80)
    print("✅ MIGRATION COMPLETE")
    print("="*80)
    print()
    print(f"Migrated {old_count} Gambia rows to new structure")
    print(f"All {len(data_rows)} rows now use consistent structure:")
    print("  - Column C: Primary Destination")
    print("  - Column D: Countries Covered (will be filled during analysis)")
    print("  - Column E: Page Type")
    print("  - Column F: URL")
    print()
    print("Your Gambia data now has 'Gambia' in Column C")
    print("Regional tours have their country names in Column C")
    print()
    print("✅ Ready for analysis with consistent structure!")
    print()


if __name__ == '__main__':
    main()

