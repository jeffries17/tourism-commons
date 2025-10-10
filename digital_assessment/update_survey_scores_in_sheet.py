#!/usr/bin/env python3
"""
Update Survey Scores in Google Sheet
Writes the survey assessment scores (0-30) to the assessment sheets
Keeps them separate from the external assessment (0-70)
"""

from google.oauth2 import service_account
from googleapiclient.discovery import build
import json
from datetime import datetime

# Configuration
SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDENTIALS_PATH = '/Users/alexjeffries/tourism-commons/tourism-development-d620c-5c9db9e21301.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']


class SurveyScoreUpdater:
    """Updates survey scores in Google Sheets"""
    
    def __init__(self, results_file):
        self.service = self._get_sheets_service()
        self.results_file = results_file
        self.results = self._load_results()
    
    def _get_sheets_service(self):
        """Initialize Google Sheets API service"""
        credentials = service_account.Credentials.from_service_account_file(
            CREDENTIALS_PATH, scopes=SCOPES
        )
        return build('sheets', 'v4', credentials=credentials)
    
    def _load_results(self):
        """Load scoring results from JSON file"""
        with open(self.results_file, 'r') as f:
            return json.load(f)
    
    def check_and_create_columns(self, sheet_tab):
        """Check if survey score columns exist, create if needed"""
        
        # Read headers
        result = self.service.spreadsheets().values().get(
            spreadsheetId=SHEET_ID,
            range=f"{sheet_tab}!A1:AZ1"
        ).execute()
        
        headers = result.get('values', [[]])[0] if result.get('values') else []
        
        print(f"\n📋 Checking headers in {sheet_tab}...")
        print(f"   Current column count: {len(headers)}")
        
        # Define the new survey columns we need
        survey_columns = [
            'Survey Total (0-30)',
            'Survey Foundation (0-10)',
            'Survey Capability (0-10)',
            'Survey Growth (0-10)',
            'Survey Tier',
            'Survey Date'
        ]
        
        # Check if they already exist
        missing_columns = []
        for col in survey_columns:
            if col not in headers:
                missing_columns.append(col)
        
        if missing_columns:
            print(f"   ⚠️  Missing columns: {', '.join(missing_columns)}")
            print(f"   ➕ Adding {len(missing_columns)} new columns...")
            
            # Add the new column headers
            new_headers = headers + missing_columns
            
            # Update the header row
            update_range = f"{sheet_tab}!A1:{self._col_letter(len(new_headers))}1"
            body = {'values': [new_headers]}
            
            self.service.spreadsheets().values().update(
                spreadsheetId=SHEET_ID,
                range=update_range,
                valueInputOption='USER_ENTERED',
                body=body
            ).execute()
            
            print(f"   ✅ Columns added successfully")
        else:
            print(f"   ✅ All survey columns already exist")
        
        # Return the column indices for the survey columns
        updated_headers = headers + missing_columns if missing_columns else headers
        
        return {
            'total': updated_headers.index('Survey Total (0-30)') if 'Survey Total (0-30)' in updated_headers else len(headers),
            'foundation': updated_headers.index('Survey Foundation (0-10)') if 'Survey Foundation (0-10)' in updated_headers else len(headers) + 1,
            'capability': updated_headers.index('Survey Capability (0-10)') if 'Survey Capability (0-10)' in updated_headers else len(headers) + 2,
            'growth': updated_headers.index('Survey Growth (0-10)') if 'Survey Growth (0-10)' in updated_headers else len(headers) + 3,
            'tier': updated_headers.index('Survey Tier') if 'Survey Tier' in updated_headers else len(headers) + 4,
            'date': updated_headers.index('Survey Date') if 'Survey Date' in updated_headers else len(headers) + 5,
        }
    
    def _col_letter(self, col_idx):
        """Convert column index to letter (0 -> A, 25 -> Z, 26 -> AA)"""
        result = ""
        while col_idx >= 0:
            result = chr(col_idx % 26 + 65) + result
            col_idx = col_idx // 26 - 1
        return result
    
    def update_scores(self):
        """Update all matched scores in the spreadsheet"""
        
        print("\n" + "="*100)
        print("UPDATING SURVEY SCORES IN SPREADSHEET")
        print("="*100)
        
        # Group results by sheet tab
        ci_results = [r for r in self.results if r.get('matched') and r['survey_type'] == 'CI']
        to_results = [r for r in self.results if r.get('matched') and r['survey_type'] == 'TO']
        
        # Update CI Assessment
        if ci_results:
            print("\n" + "="*100)
            print("UPDATING CI ASSESSMENT")
            print("="*100)
            
            col_indices = self.check_and_create_columns('CI Assessment')
            
            for result in ci_results:
                self._update_single_row('CI Assessment', result, col_indices)
        
        # Update TO Assessment
        if to_results:
            print("\n" + "="*100)
            print("UPDATING TO ASSESSMENT")
            print("="*100)
            
            col_indices = self.check_and_create_columns('TO Assessment')
            
            for result in to_results:
                self._update_single_row('TO Assessment', result, col_indices)
        
        print("\n" + "="*100)
        print("✅ ALL SCORES UPDATED SUCCESSFULLY")
        print("="*100)
    
    def _update_single_row(self, sheet_tab, result, col_indices):
        """Update a single row with survey scores"""
        
        row_num = result['sheet_row']
        business_name = result['matched_participant']
        
        print(f"\n  📝 Updating Row {row_num}: {business_name}")
        print(f"     Total: {result['total_score']}/30 ({result['tier']})")
        
        # Prepare the values
        values = [
            result['total_score'],           # Survey Total
            result['foundation_score'],      # Survey Foundation
            result['capability_score'],      # Survey Capability
            result['growth_score'],          # Survey Growth
            result['tier'],                  # Survey Tier
            datetime.now().strftime('%Y-%m-%d')  # Survey Date
        ]
        
        # Calculate range - update all 6 columns in one call
        start_col = self._col_letter(col_indices['total'])
        end_col = self._col_letter(col_indices['date'])
        update_range = f"{sheet_tab}!{start_col}{row_num}:{end_col}{row_num}"
        
        body = {'values': [values]}
        
        try:
            self.service.spreadsheets().values().update(
                spreadsheetId=SHEET_ID,
                range=update_range,
                valueInputOption='USER_ENTERED',
                body=body
            ).execute()
            
            print(f"     ✅ Successfully updated")
            
        except Exception as e:
            print(f"     ❌ Error: {e}")


def main():
    """Main entry point"""
    
    # Find the most recent results file
    import glob
    import os
    
    results_files = glob.glob('/Users/alexjeffries/tourism-commons/digital_assessment/survey_scores_*.json')
    
    if not results_files:
        print("❌ No results files found. Run score_and_match_surveys.py first.")
        return
    
    # Get the most recent file
    latest_file = max(results_files, key=os.path.getctime)
    
    print(f"\n📁 Using results file: {os.path.basename(latest_file)}")
    
    updater = SurveyScoreUpdater(latest_file)
    updater.update_scores()


if __name__ == '__main__':
    main()

