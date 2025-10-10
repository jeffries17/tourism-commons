#!/usr/bin/env python3
"""Check actual survey column names"""

from google.oauth2 import service_account
from googleapiclient.discovery import build
import json

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
        range=f"{sheet_name}!A1:DN1"
    ).execute()
    
    headers = result.get('values', [[]])[0]
    
    print(f"\n{'='*100}")
    print(f"{sheet_name} - COLUMN HEADERS ({len(headers)} columns)")
    print(f"{'='*100}")
    
    for i, header in enumerate(headers):
        if 'website' in header.lower() or 'social' in header.lower() or 'post' in header.lower() or 'comfortable' in header.lower():
            print(f"  [{i}] {header}")
    
    # Also show first response for a few key columns
    result2 = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range=f"{sheet_name}!A2:DN2"
    ).execute()
    
    row = result2.get('values', [[]])[0] if result2.get('values') else []
    
    print(f"\n  FIRST RESPONSE SAMPLE:")
    for i in range(min(20, len(headers))):
        if i < len(row):
            print(f"    [{i}] {headers[i]}: {row[i][:60] if len(str(row[i])) > 60 else row[i]}")

check_columns('CI_Survey')
check_columns('TO_Survey')

