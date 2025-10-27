#!/usr/bin/env python3
"""
Safe Survey Score Updater - Writes ONLY to Survey Total column
Updates Combined Score and Maturity Level based on External + Survey
"""

from google.oauth2 import service_account
from googleapiclient.discovery import build
import json
from datetime import datetime

# Configuration
SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDENTIALS_PATH = '/Users/alexjeffries/tourism-commons/tourism-development-d620c-5c9db9e21301.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

# Column indices (0-based)
COL_EXTERNAL_SCORE = 16  # Q - Adjusted External Score (0-70)
COL_SURVEY_TOTAL = 20    # U - Survey Total (0-30)
COL_COMBINED_SCORE = 21  # V - Combined Score (0-100)
COL_MATURITY_LEVEL = 22  # W - Digital Maturity Level
COL_ASSESSMENT_DATE = 23 # X - Assessment Date


def get_maturity_level(combined_score):
    """Determine maturity level based on combined score"""
    if combined_score >= 80:
        return "Expert"
    elif combined_score >= 60:
        return "Advanced"
    elif combined_score >= 40:
        return "Intermediate"
    elif combined_score >= 20:
        return "Emerging"
    else:
        return "Absent"


def col_letter(col_idx):
    """Convert column index to letter (0 -> A, 25 -> Z, 26 -> AA)"""
    result = ""
    col_idx_copy = col_idx
    while col_idx_copy >= 0:
        result = chr(col_idx_copy % 26 + 65) + result
        col_idx_copy = col_idx_copy // 26 - 1
    return result


class SafeSurveyUpdater:
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
    
    def preview_updates(self):
        """Show what will be updated before making changes"""
        
        print("\n" + "="*100)
        print("PREVIEW: Survey Score Updates")
        print("="*100)
        
        # Group by sheet
        ci_results = [r for r in self.results if r.get('matched') and r['survey_type'] == 'CI']
        to_results = [r for r in self.results if r.get('matched') and r['survey_type'] == 'TO']
        
        if ci_results:
            print(f"\n📊 CI Assessment - {len(ci_results)} updates:")
            for result in ci_results:
                print(f"\n  Row {result['sheet_row']}: {result['matched_participant']}")
                print(f"    Column U (Survey Total): {result['total_score']}/30")
                print(f"    Will update: Combined Score & Maturity Level based on External + Survey")
        
        if to_results:
            print(f"\n📊 TO Assessment - {len(to_results)} updates:")
            for result in to_results:
                print(f"\n  Row {result['sheet_row']}: {result['matched_participant']}")
                print(f"    Column U (Survey Total): {result['total_score']}/30")
                print(f"    Will update: Combined Score & Maturity Level based on External + Survey")
        
        print("\n" + "="*100)
        print("Columns to be updated:")
        print(f"  {col_letter(COL_SURVEY_TOTAL)} (Survey Total)")
        print(f"  {col_letter(COL_COMBINED_SCORE)} (Combined Score = External + Survey)")
        print(f"  {col_letter(COL_MATURITY_LEVEL)} (Maturity Level)")
        print(f"  {col_letter(COL_ASSESSMENT_DATE)} (Assessment Date)")
        print("="*100)
    
    def update_scores(self, dry_run=False):
        """Update survey scores in the spreadsheet"""
        
        # Group by sheet
        ci_results = [r for r in self.results if r.get('matched') and r['survey_type'] == 'CI']
        to_results = [r for r in self.results if r.get('matched') and r['survey_type'] == 'TO']
        
        if ci_results:
            print(f"\n{'='*100}")
            print("UPDATING CI ASSESSMENT")
            print(f"{'='*100}")
            for result in ci_results:
                self._update_single_row('CI Assessment', result, dry_run)
        
        if to_results:
            print(f"\n{'='*100}")
            print("UPDATING TO ASSESSMENT")
            print(f"{'='*100}")
            for result in to_results:
                self._update_single_row('TO Assessment', result, dry_run)
        
        if not dry_run:
            print(f"\n{'='*100}")
            print("✅ ALL SCORES UPDATED SUCCESSFULLY")
            print(f"{'='*100}")
    
    def _update_single_row(self, sheet_tab, result, dry_run=False):
        """Update a single row with survey scores"""
        
        row_num = result['sheet_row']
        business_name = result['matched_participant']
        survey_score = result['total_score']
        
        print(f"\n  {'[DRY RUN] ' if dry_run else ''}Row {row_num}: {business_name}")
        
        # First, read the current external score from the sheet
        read_range = f"{sheet_tab}!{col_letter(COL_EXTERNAL_SCORE)}{row_num}"
        
        try:
            read_result = self.service.spreadsheets().values().get(
                spreadsheetId=SHEET_ID,
                range=read_range
            ).execute()
            
            external_score = float(read_result.get('values', [[0]])[0][0] or 0)
            
            # Calculate combined score and maturity level
            combined_score = external_score + survey_score
            maturity_level = get_maturity_level(combined_score)
            assessment_date = datetime.now().strftime('%m/%d/%Y')
            
            print(f"    External Score: {external_score}/70")
            print(f"    Survey Score: {survey_score}/30")
            print(f"    Combined: {combined_score}/100")
            print(f"    Maturity: {maturity_level}")
            
            if not dry_run:
                # Update Survey Total (column U)
                survey_range = f"{sheet_tab}!{col_letter(COL_SURVEY_TOTAL)}{row_num}"
                self.service.spreadsheets().values().update(
                    spreadsheetId=SHEET_ID,
                    range=survey_range,
                    valueInputOption='USER_ENTERED',
                    body={'values': [[survey_score]]}
                ).execute()
                
                # Update Combined Score (column V)
                combined_range = f"{sheet_tab}!{col_letter(COL_COMBINED_SCORE)}{row_num}"
                self.service.spreadsheets().values().update(
                    spreadsheetId=SHEET_ID,
                    range=combined_range,
                    valueInputOption='USER_ENTERED',
                    body={'values': [[combined_score]]}
                ).execute()
                
                # Update Maturity Level (column W)
                maturity_range = f"{sheet_tab}!{col_letter(COL_MATURITY_LEVEL)}{row_num}"
                self.service.spreadsheets().values().update(
                    spreadsheetId=SHEET_ID,
                    range=maturity_range,
                    valueInputOption='USER_ENTERED',
                    body={'values': [[maturity_level]]}
                ).execute()
                
                # Update Assessment Date (column X)
                date_range = f"{sheet_tab}!{col_letter(COL_ASSESSMENT_DATE)}{row_num}"
                self.service.spreadsheets().values().update(
                    spreadsheetId=SHEET_ID,
                    range=date_range,
                    valueInputOption='USER_ENTERED',
                    body={'values': [[assessment_date]]}
                ).execute()
                
                print(f"    ✅ Updated successfully")
        
        except Exception as e:
            print(f"    ❌ Error: {e}")


def main():
    """Main entry point"""
    
    import glob
    import os
    
    # Find the most recent results file
    results_files = glob.glob('/Users/alexjeffries/tourism-commons/digital_assessment/survey_scores_*.json')
    
    if not results_files:
        print("❌ No results files found. Run score_and_match_surveys.py first.")
        return
    
    # Get the most recent file
    latest_file = max(results_files, key=os.path.getctime)
    
    print(f"\n📁 Using results file: {os.path.basename(latest_file)}")
    
    updater = SafeSurveyUpdater(latest_file)
    
    # Show preview
    updater.preview_updates()
    
    # Ask for confirmation
    print("\n" + "="*100)
    response = input("Proceed with updates? (yes/no): ").strip().lower()
    
    if response == 'yes':
        updater.update_scores(dry_run=False)
    else:
        print("\n❌ Update cancelled")


if __name__ == '__main__':
    main()

