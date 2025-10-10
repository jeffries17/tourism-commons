#!/usr/bin/env python3
"""
Create a Recommendations sheet in Google Sheets to store AI-generated recommendations
"""

import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDS_FILE = '../tourism-development-d620c-5c9db9e21301.json'

def get_sheets_service():
    with open(CREDS_FILE, 'r') as f:
        creds_dict = json.load(f)
    
    credentials = service_account.Credentials.from_service_account_info(
        creds_dict,
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    return build('sheets', 'v4', credentials=credentials)

def create_recommendations_sheet():
    service = get_sheets_service()
    
    # Check if sheet already exists
    spreadsheet = service.spreadsheets().get(spreadsheetId=SHEET_ID).execute()
    sheets = spreadsheet.get('sheets', [])
    
    for sheet in sheets:
        if sheet['properties']['title'] == 'Recommendations':
            print("✅ Recommendations sheet already exists")
            sheet_id = sheet['properties']['sheetId']
            return sheet_id
    
    # Create new sheet
    requests = [{
        'addSheet': {
            'properties': {
                'title': 'Recommendations',
                'gridProperties': {
                    'rowCount': 1000,
                    'columnCount': 15
                }
            }
        }
    }]
    
    response = service.spreadsheets().batchUpdate(
        spreadsheetId=SHEET_ID,
        body={'requests': requests}
    ).execute()
    
    sheet_id = response['replies'][0]['addSheet']['properties']['sheetId']
    print("✅ Created new Recommendations sheet")
    
    # Add headers
    headers = [
        'Stakeholder Name',
        'Sector',
        'Social Media Score',
        'Social Media Recommendation',
        'Website Score',
        'Website Recommendation',
        'Visual Content Score',
        'Visual Content Recommendation',
        'Discoverability Score',
        'Discoverability Recommendation',
        'Digital Sales Score',
        'Digital Sales Recommendation',
        'Platform Integration Score',
        'Platform Integration Recommendation',
        'Last Updated'
    ]
    
    service.spreadsheets().values().update(
        spreadsheetId=SHEET_ID,
        range='Recommendations!A1:O1',
        valueInputOption='RAW',
        body={'values': [headers]}
    ).execute()
    
    # Format headers
    format_requests = [
        {
            'repeatCell': {
                'range': {
                    'sheetId': sheet_id,
                    'startRowIndex': 0,
                    'endRowIndex': 1
                },
                'cell': {
                    'userEnteredFormat': {
                        'backgroundColor': {'red': 0.2, 'green': 0.5, 'blue': 0.8},
                        'textFormat': {
                            'foregroundColor': {'red': 1, 'green': 1, 'blue': 1},
                            'bold': True
                        }
                    }
                },
                'fields': 'userEnteredFormat(backgroundColor,textFormat)'
            }
        },
        {
            'updateSheetProperties': {
                'properties': {
                    'sheetId': sheet_id,
                    'gridProperties': {
                        'frozenRowCount': 1
                    }
                },
                'fields': 'gridProperties.frozenRowCount'
            }
        }
    ]
    
    service.spreadsheets().batchUpdate(
        spreadsheetId=SHEET_ID,
        body={'requests': format_requests}
    ).execute()
    
    print("✅ Added headers and formatting")
    return sheet_id

if __name__ == '__main__':
    create_recommendations_sheet()
    print("\n🎉 Recommendations sheet is ready!")

