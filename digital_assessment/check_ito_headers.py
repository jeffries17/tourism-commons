#!/usr/bin/env python3
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

SPREADSHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
SHEET_NAME = 'ITO Tour Analysis'

def get_sheets_service():
    SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
    creds = Credentials.from_service_account_file(
        '../tourism-development-d620c-5c9db9e21301.json',
        scopes=SCOPES
    )
    return build('sheets', 'v4', credentials=creds)

service = get_sheets_service()

# Read header row
result = service.spreadsheets().values().get(
    spreadsheetId=SPREADSHEET_ID,
    range=f'{SHEET_NAME}!A1:AJ1'
).execute()

headers = result.get('values', [])[0] if result.get('values') else []

print(f"Headers in {SHEET_NAME}:")
for i, header in enumerate(headers):
    print(f"  [{i}] {header}")

