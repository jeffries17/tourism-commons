#!/usr/bin/env python3
"""Quick check of what's in the ITO Tour Analysis sheet"""

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
    
    # Read last 10 rows (columns A-P which includes Countries Covered)
    result = service.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=f'{SHEET_NAME}!A2:P11'  # Rows 2-11
    ).execute()
    
    values = result.get('values', [])
    
    print("=" * 100)
    print("LAST 10 ANALYZED TOURS")
    print("=" * 100)
    
    headers = ['Operator', 'Country', 'Primary Dest', 'Countries Covered', 'Page Type', 
               'URL', 'Status', 'Words', 'Sentiment', 'Score', 'Theme1', 'Theme2', 'Theme3',
               'Dest %', 'Packaging', 'Is Pure']
    
    for i, row in enumerate(values, start=2):
        print(f"\nRow {i}:")
        print(f"  Operator: {row[0] if len(row) > 0 else 'N/A'}")
        print(f"  Primary Destination: {row[2] if len(row) > 2 else 'N/A'}")
        print(f"  🌍 Countries Covered: {row[3] if len(row) > 3 else 'N/A'}")
        print(f"  Packaging Type: {row[14] if len(row) > 14 else 'N/A'}")
        print(f"  Is Pure: {row[15] if len(row) > 15 else 'N/A'}")
        print(f"  Creative Score: {row[9] if len(row) > 9 else 'N/A'}")
        print("-" * 80)

if __name__ == '__main__':
    main()

