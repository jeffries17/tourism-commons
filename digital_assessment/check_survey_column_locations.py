#!/usr/bin/env python3
"""Check where the survey columns are located in the sheets"""

from google.oauth2 import service_account
from googleapiclient.discovery import build

SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDENTIALS_PATH = '/Users/alexjeffries/tourism-commons/tourism-development-d620c-5c9db9e21301.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

def get_sheets_service():
    credentials = service_account.Credentials.from_service_account_file(
        CREDENTIALS_PATH, scopes=SCOPES
    )
    return build('sheets', 'v4', credentials=credentials)

def check_columns(sheet_name):
    service = get_sheets_service()
    result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range=f"{sheet_name}!A1:AZ1"
    ).execute()
    
    headers = result.get('values', [[]])[0] if result.get('values') else []
    
    print(f"\n{'='*100}")
    print(f"{sheet_name} - COLUMN LOCATIONS")
    print(f"{'='*100}")
    print(f"Total columns: {len(headers)}")
    
    # Find survey-related columns
    survey_columns = []
    for i, header in enumerate(headers):
        if 'survey' in header.lower():
            letter = chr(65 + (i // 26 - 1)) + chr(65 + (i % 26)) if i >= 26 else chr(65 + i)
            survey_columns.append((i+1, letter, header))
    
    if survey_columns:
        print(f"\n📊 SURVEY COLUMNS FOUND:")
        for col_num, col_letter, header in survey_columns:
            print(f"   Column {col_letter} (#{col_num}): {header}")
    else:
        print(f"\n⚠️  No survey columns found!")
    
    # Show a few rows with survey data
    print(f"\n📝 SAMPLE DATA (First 3 participants with survey scores):")
    result2 = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range=f"{sheet_name}!A1:AZ100"
    ).execute()
    
    rows = result2.get('values', [])
    count = 0
    for i, row in enumerate(rows[1:], start=2):  # Skip header
        if i >= len(rows):
            break
        
        # Check if this row has survey data
        has_survey_data = False
        for col_num, col_letter, header in survey_columns:
            col_idx = col_num - 1
            if col_idx < len(row) and row[col_idx]:
                has_survey_data = True
                break
        
        if has_survey_data:
            name = row[0] if len(row) > 0 else 'Unknown'
            print(f"\n   Row {i}: {name}")
            for col_num, col_letter, header in survey_columns:
                col_idx = col_num - 1
                value = row[col_idx] if col_idx < len(row) else ''
                if value:
                    print(f"      {header}: {value}")
            
            count += 1
            if count >= 3:
                break

print("\n" + "="*100)
print("SURVEY COLUMN LOCATION CHECKER")
print("="*100)

check_columns('CI Assessment')
check_columns('TO Assessment')

print("\n" + "="*100)

