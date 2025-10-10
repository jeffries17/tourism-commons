#!/usr/bin/env python3
"""List all sheets in the spreadsheet"""

from google.oauth2 import service_account
from googleapiclient.discovery import build

SPREADSHEET_ID = '1Q76RdQoMUPe0y0JzaUZJYLqoIaFrYFGOqGJQhIgXCfo'
SERVICE_ACCOUNT_FILE = 'config/tourism-development-d620c-5c9db9e21301.json'

def main():
    # Authenticate
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE,
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    service = build('sheets', 'v4', credentials=creds)
    
    # Get spreadsheet metadata
    spreadsheet = service.spreadsheets().get(spreadsheetId=SPREADSHEET_ID).execute()
    
    print("\n" + "=" * 80)
    print("SHEETS IN SPREADSHEET")
    print("=" * 80)
    
    sheets = spreadsheet.get('sheets', [])
    for sheet in sheets:
        props = sheet.get('properties', {})
        print(f"\n  Sheet Name: '{props.get('title', 'Unnamed')}'")
        print(f"  Sheet ID: {props.get('sheetId', 'N/A')}")
        print(f"  Rows: {props.get('gridProperties', {}).get('rowCount', 'N/A')}")
        print(f"  Columns: {props.get('gridProperties', {}).get('columnCount', 'N/A')}")
    
    print("\n" + "=" * 80)

if __name__ == '__main__':
    main()
