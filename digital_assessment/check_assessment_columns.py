#!/usr/bin/env python3
"""Check the actual column structure of CI Assessment sheet"""

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

def col_letter(col_idx):
    """Convert column index to letter (0 -> A, 25 -> Z, 26 -> AA)"""
    result = ""
    while col_idx >= 0:
        result = chr(col_idx % 26 + 65) + result
        col_idx = col_idx // 26 - 1
    return result

def check_columns():
    service = get_sheets_service()
    result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range="CI Assessment!A1:BZ1"
    ).execute()
    
    headers = result.get('values', [[]])[0] if result.get('values') else []
    
    print(f"\n{'='*100}")
    print(f"CI ASSESSMENT - ALL COLUMN HEADERS ({len(headers)} columns)")
    print(f"{'='*100}\n")
    
    for i, header in enumerate(headers):
        col_name = col_letter(i)
        print(f"  {col_name:>3} [{i:>3}] {header}")
    
    # Highlight the key columns
    print(f"\n{'='*100}")
    print("KEY COLUMNS TO WATCH:")
    print(f"{'='*100}\n")
    
    keywords = ['EXTERNAL', 'SURVEY', 'COMBINED', 'MATURITY', 'DATE', 'Website', 'Facebook', 'Instagram']
    for i, header in enumerate(headers):
        for keyword in keywords:
            if keyword.lower() in header.lower():
                col_name = col_letter(i)
                print(f"  {col_name:>3} [{i:>3}] {header}")
                break

if __name__ == '__main__':
    check_columns()

