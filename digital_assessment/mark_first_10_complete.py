#!/usr/bin/env python3
"""Mark the first 10 analyzed tours as complete"""

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
    
    # Mark rows 2-11 (first 10 tours) as "✅ Scraped"
    print("Updating rows 2-11...")
    for row in range(2, 12):  # Rows 2-11
        service.spreadsheets().values().update(
            spreadsheetId=SPREADSHEET_ID,
            range=f'{SHEET_NAME}!G{row}',
            valueInputOption='RAW',
            body={'values': [['✅ Scraped']]}
        ).execute()
        print(f"  Row {row}: ✅")
    
    print("\n✅ Marked first 10 tours as complete")
    print("   Rows 2-11 now show '✅ Scraped' status")

if __name__ == '__main__':
    main()

