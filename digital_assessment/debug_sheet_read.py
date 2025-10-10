#!/usr/bin/env python3
"""Debug what's being read from the sheet"""

from google.oauth2 import service_account
from googleapiclient.discovery import build

SPREADSHEET_ID = '1Q76RdQoMUPe0y0JzaUZJYLqoIaFrYFGOqGJQhIgXCfo'
SHEET_NAME = 'ITO Tour Analysis'
SERVICE_ACCOUNT_FILE = 'config/tourism-development-d620c-5c9db9e21301.json'

def main():
    # Authenticate
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE,
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    service = build('sheets', 'v4', credentials=creds)
    
    # Read first 5 data rows
    result = service.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=f'{SHEET_NAME}!A1:G6'  # Header + 5 rows
    ).execute()
    
    rows = result.get('values', [])
    
    print("=" * 100)
    print("SHEET CONTENT (First 5 rows)")
    print("=" * 100)
    
    for i, row in enumerate(rows):
        print(f"\nRow {i}:")
        for j, cell in enumerate(row):
            col_letter = chr(65 + j)  # A, B, C, etc.
            print(f"  {col_letter}[{j}]: {cell[:80] if len(cell) > 80 else cell}")
        print("-" * 80)

if __name__ == '__main__':
    main()

