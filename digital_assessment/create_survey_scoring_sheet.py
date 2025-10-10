#!/usr/bin/env python3
"""
Create Survey_Scoring sheet in the master spreadsheet with all participant survey data
"""

from google.oauth2 import service_account
from googleapiclient.discovery import build
import json
from datetime import datetime

# Configuration
SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDENTIALS_PATH = '/Users/alexjeffries/tourism-commons/tourism-development-d620c-5c9db9e21301.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

# Load the latest survey scores
with open('survey_scores_20251008_165232.json', 'r') as f:
    survey_data = json.load(f)

def get_sheets_service():
    """Initialize Google Sheets API service"""
    credentials = service_account.Credentials.from_service_account_file(
        CREDENTIALS_PATH, scopes=SCOPES
    )
    return build('sheets', 'v4', credentials=credentials)

def get_maturity_description(tier):
    """Get description for each maturity tier"""
    descriptions = {
        'Absent/Basic': 'Limited digital presence, minimal use of digital tools, primarily operating offline or with very basic social media presence.',
        'Emerging': 'Beginning digital journey with basic social media presence and some digital activity, but lacking strategy and consistency.',
        'Intermediate': 'Active digital presence across multiple platforms with regular posting, but limited strategic approach and analytics usage.',
        'Advanced': 'Strong digital presence with strategic approach, good understanding of tools, regular analytics review, and investment in growth.',
        'Expert': 'Comprehensive digital strategy with sophisticated tools, data-driven decisions, strong online sales, and continuous optimization.'
    }
    return descriptions.get(tier, '')

def create_survey_scoring_sheet():
    """Create the Survey_Scoring sheet with all data"""
    service = get_sheets_service()
    
    # Check if sheet exists
    spreadsheet = service.spreadsheets().get(spreadsheetId=SHEET_ID).execute()
    sheets = {sheet['properties']['title']: sheet['properties']['sheetId'] 
              for sheet in spreadsheet['sheets']}
    
    # Delete existing sheet if present
    if 'Survey_Scoring' in sheets:
        print("Deleting existing Survey_Scoring sheet...")
        service.spreadsheets().batchUpdate(
            spreadsheetId=SHEET_ID,
            body={'requests': [{'deleteSheet': {'sheetId': sheets['Survey_Scoring']}}]}
        ).execute()
    
    # Create new sheet
    print("Creating Survey_Scoring sheet...")
    service.spreadsheets().batchUpdate(
        spreadsheetId=SHEET_ID,
        body={
            'requests': [{
                'addSheet': {
                    'properties': {
                        'title': 'Survey_Scoring',
                        'gridProperties': {'rowCount': 100, 'columnCount': 20}
                    }
                }
            }]
        }
    ).execute()
    
    # Prepare header row
    headers = [
        'Participant Name',
        'Type (CI/TO)',
        'Survey Date',
        'Total Score (/30)',
        'Foundation Score (/10)',
        'Capability Score (/10)',
        'Growth Score (/10)',
        'Maturity Tier',
        'Maturity Description',
        '---',
        'Foundation: Website',
        'Foundation: Social Platforms',
        'Foundation: Posting Frequency',
        'Foundation: Online Sales',
        'Foundation: Review Management',
        'Capability: Comfort Level',
        'Capability: Device Access',
        'Capability: Internet',
        'Capability: Analytics',
        'Growth: Marketing Knowledge',
        'Growth: Challenge Type',
        'Growth: Content Creation',
        'Growth: Monthly Investment',
        'Growth: Training',
        'Growth: Growth Ambition'
    ]
    
    # Prepare data rows
    rows = [headers]
    
    for entry in sorted(survey_data, key=lambda x: x['matched_participant']):
        if not entry['matched']:
            continue
            
        breakdown = entry['breakdown']
        tier = entry['tier']
        
        row = [
            entry['matched_participant'],
            entry['survey_type'],
            datetime.now().strftime('%Y-%m-%d'),  # Survey date
            entry['total_score'],
            entry['foundation_score'],
            entry['capability_score'],
            entry['growth_score'],
            tier,
            get_maturity_description(tier),
            '---',  # Separator
            breakdown['foundation']['website'],
            breakdown['foundation']['social_platforms'],
            breakdown['foundation']['posting_frequency'],
            breakdown['foundation']['online_sales'],
            breakdown['foundation']['review_management'],
            breakdown['capability']['comfort_level'],
            breakdown['capability']['device_access'],
            breakdown['capability']['internet'],
            breakdown['capability']['analytics'],
            breakdown['growth']['marketing_knowledge'],
            breakdown['growth']['challenge_type'],
            breakdown['growth']['content_creation'],
            breakdown['growth']['monthly_investment'],
            breakdown['growth']['training'],
            breakdown['growth']['growth_ambition']
        ]
        rows.append(row)
    
    # Write data
    print(f"Writing {len(rows)-1} participant records...")
    service.spreadsheets().values().update(
        spreadsheetId=SHEET_ID,
        range='Survey_Scoring!A1',
        valueInputOption='RAW',
        body={'values': rows}
    ).execute()
    
    # Format the sheet
    print("Applying formatting...")
    
    # Re-fetch spreadsheet info to get the new sheet ID
    spreadsheet = service.spreadsheets().get(spreadsheetId=SHEET_ID).execute()
    survey_sheet_id = [s['properties']['sheetId'] for s in spreadsheet['sheets'] 
                       if s['properties']['title'] == 'Survey_Scoring'][0]
    
    requests = [
        # Header row formatting
        {
            'repeatCell': {
                'range': {
                    'sheetId': survey_sheet_id,
                    'startRowIndex': 0,
                    'endRowIndex': 1
                },
                'cell': {
                    'userEnteredFormat': {
                        'backgroundColor': {'red': 0.2, 'green': 0.3, 'blue': 0.5},
                        'textFormat': {'bold': True, 'foregroundColor': {'red': 1, 'green': 1, 'blue': 1}},
                        'horizontalAlignment': 'CENTER'
                    }
                },
                'fields': 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
            }
        },
        # Freeze header row
        {
            'updateSheetProperties': {
                'properties': {
                    'sheetId': survey_sheet_id,
                    'gridProperties': {'frozenRowCount': 1}
                },
                'fields': 'gridProperties.frozenRowCount'
            }
        },
        # Auto-resize columns
        {
            'autoResizeDimensions': {
                'dimensions': {
                    'sheetId': survey_sheet_id,
                    'dimension': 'COLUMNS',
                    'startIndex': 0,
                    'endIndex': 25
                }
            }
        }
    ]
    
    service.spreadsheets().batchUpdate(
        spreadsheetId=SHEET_ID,
        body={'requests': requests}
    ).execute()
    
    print("✅ Survey_Scoring sheet created successfully!")
    print(f"   - {len(rows)-1} participants added")
    print(f"   - View at: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit#gid=0")

if __name__ == '__main__':
    create_survey_scoring_sheet()

