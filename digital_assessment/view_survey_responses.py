#!/usr/bin/env python3
"""
View survey responses from CI_Survey and TO_Survey sheets
"""

from google.oauth2 import service_account
from googleapiclient.discovery import build
import json

# Configuration from survey_integration.py
SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDENTIALS_PATH = '/Users/alexjeffries/tourism-commons/tourism-development-d620c-5c9db9e21301.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']


def get_sheets_service():
    """Initialize Google Sheets API service"""
    credentials = service_account.Credentials.from_service_account_file(
        CREDENTIALS_PATH, scopes=SCOPES
    )
    service = build('sheets', 'v4', credentials=credentials)
    return service


def read_survey_data(service, sheet_name):
    """Read all data from a survey sheet"""
    result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range=f"{sheet_name}!A1:DN1000"  # Read all columns
    ).execute()
    
    values = result.get('values', [])
    
    if not values:
        return None, []
    
    headers = values[0]
    rows = values[1:]
    
    # Filter out completely empty rows
    rows = [row for row in rows if any(cell for cell in row)]
    
    return headers, rows


def display_survey_summary(sheet_name, headers, rows):
    """Display summary of survey data"""
    print(f"\n{'='*100}")
    print(f"{sheet_name} - SURVEY RESPONSES")
    print(f"{'='*100}")
    
    if not rows:
        print(f"  ⚠️  No responses found in {sheet_name}")
        return
    
    print(f"\n📊 Total Responses: {len(rows)}")
    print(f"📋 Total Questions/Columns: {len(headers)}")
    
    # Show first few column names
    print(f"\n📝 First 10 Questions/Columns:")
    for i, header in enumerate(headers[:10], 1):
        print(f"   {i}. {header}")
    
    if len(headers) > 10:
        print(f"   ... and {len(headers) - 10} more columns")
    
    # Show key fields from each response
    print(f"\n👥 RESPONSES SUMMARY:")
    print(f"{'='*100}")
    
    for i, row in enumerate(rows, 1):
        print(f"\n  Response #{i}:")
        
        # Try to extract key information
        timestamp = row[0] if len(row) > 0 else 'N/A'
        business_name = row[1] if len(row) > 1 else 'N/A'
        
        print(f"    Timestamp: {timestamp}")
        print(f"    Business Name: {business_name}")
        
        # Show how many questions were answered
        answered = sum(1 for cell in row if cell)
        print(f"    Questions Answered: {answered}/{len(headers)}")
        
        # Show first few responses
        print(f"    Sample Responses:")
        for j, (header, value) in enumerate(zip(headers[:5], row[:5])):
            if value:
                display_value = value[:60] + "..." if len(str(value)) > 60 else value
                print(f"      • {header}: {display_value}")


def main():
    """Main entry point"""
    print("\n" + "="*100)
    print("SURVEY RESPONSES VIEWER")
    print("="*100)
    
    service = get_sheets_service()
    
    # Read CI Survey
    try:
        print("\n🔍 Reading CI_Survey...")
        ci_headers, ci_rows = read_survey_data(service, 'CI_Survey')
        if ci_headers:
            display_survey_summary('CI_Survey', ci_headers, ci_rows)
    except Exception as e:
        print(f"\n❌ Error reading CI_Survey: {e}")
        import traceback
        traceback.print_exc()
    
    # Read TO Survey
    try:
        print("\n\n🔍 Reading TO_Survey...")
        to_headers, to_rows = read_survey_data(service, 'TO_Survey')
        if to_headers:
            display_survey_summary('TO_Survey', to_headers, to_rows)
    except Exception as e:
        print(f"\n❌ Error reading TO_Survey: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "="*100)


if __name__ == '__main__':
    main()
