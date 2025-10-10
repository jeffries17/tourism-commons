#!/usr/bin/env python3
"""Extract qualitative responses from surveys for analysis"""

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

def read_survey(sheet_name):
    service = get_sheets_service()
    result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range=f"{sheet_name}!A1:DN1000"
    ).execute()
    
    values = result.get('values', [])
    if not values:
        return None, []
    
    headers = values[0]
    rows = values[1:]
    
    return headers, rows

def extract_qualitative(sheet_name):
    headers, rows = read_survey(sheet_name)
    
    print(f"\n{'='*100}")
    print(f"{sheet_name} - QUALITATIVE RESPONSES")
    print(f"{'='*100}")
    
    # Key questions to extract
    key_questions = [
        'biggest challenge',
        'help your business',
        'would you be interested',
        'what could help',
        'contact information'
    ]
    
    for i, row in enumerate(rows, 1):
        biz_name_col = 'Q2. Name of organization/business' if 'CI' in sheet_name else 'Q2. Name of your organization/business'
        biz_name_idx = headers.index(biz_name_col) if biz_name_col in headers else 1
        biz_name = row[biz_name_idx] if biz_name_idx < len(row) else f'Response {i}'
        
        print(f"\n{'─'*100}")
        print(f"RESPONSE #{i}: {biz_name}")
        print(f"{'─'*100}")
        
        # Find and print qualitative responses
        for idx, header in enumerate(headers):
            if idx >= len(row):
                continue
                
            value = row[idx]
            if not value or len(str(value)) < 3:
                continue
            
            # Check if this is a qualitative question (open-ended)
            header_lower = header.lower()
            is_qualitative = any(keyword in header_lower for keyword in key_questions)
            
            # Also include text responses that are longer
            is_long_text = len(str(value)) > 50 and not value.replace('.', '').replace(',', '').isdigit()
            
            if is_qualitative or (is_long_text and 'Q' in header):
                print(f"\n  {header}")
                print(f"  → {value}")

# Extract from both surveys
extract_qualitative('CI_Survey')
extract_qualitative('TO_Survey')

