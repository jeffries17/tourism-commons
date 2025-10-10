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

# Read first few rows
result = service.spreadsheets().values().get(
    spreadsheetId=SPREADSHEET_ID,
    range=f'{SHEET_NAME}!A1:F5'
).execute()

rows = result.get('values', [])

print(f"First 5 rows of {SHEET_NAME}:")
for i, row in enumerate(rows, 1):
    print(f"Row {i}: {row[:6] if len(row) > 6 else row}")

# Check total rows
result2 = service.spreadsheets().values().get(
    spreadsheetId=SPREADSHEET_ID,
    range=f'{SHEET_NAME}!A:A'
).execute()

total_rows = len(result2.get('values', []))
print(f"\nTotal rows in sheet: {total_rows}")

