#!/usr/bin/env python3
"""
TikTok Discovery Tool for CI Assessment
Searches for TikTok accounts for creative industry stakeholders
"""

import os
import json
import requests
import time
from datetime import datetime
from typing import Dict, List, Optional
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDS_FILE = 'config/tourism-development-d620c-5c9db9e21301.json'

# API Keys
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY', '')
SEARCH_ENGINE_ID = os.environ.get('GOOGLE_SEARCH_ENGINE_ID', '')

# TikTok will be in column AM (after YouTube Subscribers in AL)
# TikTok Followers will be in column AN
TIKTOK_URL_COLUMN = 'AM'
TIKTOK_FOLLOWERS_COLUMN = 'AN'


class TikTokDiscovery:
    """Lightweight TikTok account discovery"""
    
    def __init__(self, verbose=True):
        self.verbose = verbose
        self.sheets_service = self._get_sheets_service()
        
    def _get_sheets_service(self):
        """Initialize Google Sheets API service"""
        with open(CREDS_FILE, 'r') as f:
            creds_dict = json.load(f)
        
        credentials = service_account.Credentials.from_service_account_info(
            creds_dict,
            scopes=['https://www.googleapis.com/auth/spreadsheets']
        )
        return build('sheets', 'v4', credentials=credentials)
    
    def _log(self, message, level="info"):
        """Simple logging"""
        if self.verbose:
            prefix = "🔍" if level == "info" else "✅" if level == "success" else "⚠️" if level == "warn" else "❌"
            print(f"{prefix} {message}")
    
    def google_search(self, query: str, num_results: int = 10) -> List[Dict]:
        """Search using Google Custom Search API"""
        if not GOOGLE_API_KEY or not SEARCH_ENGINE_ID:
            self._log("Google API credentials not configured", "error")
            return []
        
        url = "https://www.googleapis.com/customsearch/v1"
        params = {
            'key': GOOGLE_API_KEY,
            'cx': SEARCH_ENGINE_ID,
            'q': query,
            'num': min(num_results, 10)
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            items = response.json().get('items', [])
            self._log(f"Found {len(items)} search results")
            return items
        except Exception as e:
            self._log(f"Search error: {e}", "error")
            return []
    
    def extract_tiktok_url(self, search_results: List[Dict]) -> Optional[str]:
        """Extract TikTok profile URL from search results"""
        for item in search_results:
            url = item.get('link', '')
            
            # Look for tiktok.com URLs with @ (profile or video)
            if 'tiktok.com/@' in url.lower():
                # Extract the profile URL from formats like:
                # - https://www.tiktok.com/@username
                # - https://www.tiktok.com/@username/video/123456789
                # We want just: https://www.tiktok.com/@username
                
                # Find the @ symbol and extract username
                if '@' in url:
                    # Split by @ and get the part after
                    after_at = url.split('@')[1]
                    # Username is everything before the next / or ?
                    username = after_at.split('/')[0].split('?')[0]
                    # Construct clean profile URL
                    profile_url = f"https://www.tiktok.com/@{username}"
                    return profile_url
        
        return None
    
    def search_tiktok(self, name: str, country: str = "The Gambia") -> Optional[str]:
        """
        Search for TikTok account with fallback strategy
        1. Try: name + country + "tiktok"
        2. If no result, try: name + "tiktok" (without country)
        """
        # Try first with country
        query = f"{name} {country} tiktok"
        self._log(f"Searching: {query}")
        
        results = self.google_search(query, num_results=10)
        
        if results:
            tiktok_url = self.extract_tiktok_url(results)
            if tiktok_url:
                self._log(f"Found TikTok: {tiktok_url}", "success")
                return tiktok_url
        
        # Fallback: Try without country name
        query_fallback = f"{name} tiktok"
        self._log(f"Trying without country: {query_fallback}")
        
        results = self.google_search(query_fallback, num_results=10)
        
        if results:
            tiktok_url = self.extract_tiktok_url(results)
            if tiktok_url:
                self._log(f"Found TikTok (fallback): {tiktok_url}", "success")
                return tiktok_url
        
        self._log("No TikTok account found", "warn")
        return None
    
    def get_ci_assessment_data(self, limit: Optional[int] = None) -> List[Dict]:
        """Read stakeholders from CI Assessment sheet"""
        try:
            # Read stakeholder names, sectors, and existing data
            result = self.sheets_service.spreadsheets().values().get(
                spreadsheetId=SHEET_ID,
                range='CI Assessment!A2:AN'  # Read through TikTok Followers column
            ).execute()
            
            values = result.get('values', [])
            
            stakeholders = []
            for i, row in enumerate(values, start=2):
                if not row or not row[0]:  # Skip empty rows
                    continue
                
                stakeholder = {
                    'row_number': i,
                    'name': row[0] if len(row) > 0 else '',
                    'sector': row[1] if len(row) > 1 else '',
                    'existing_tiktok': row[38] if len(row) > 38 else '',  # Column AM (index 38)
                }
                
                stakeholders.append(stakeholder)
                
                if limit and len(stakeholders) >= limit:
                    break
            
            return stakeholders
            
        except Exception as e:
            self._log(f"Error reading sheet: {e}", "error")
            return []
    
    def update_tiktok_column(self, row_number: int, tiktok_url: str):
        """Update TikTok URL in the sheet (only if cell is empty)"""
        try:
            # First check if there's already a value
            result = self.sheets_service.spreadsheets().values().get(
                spreadsheetId=SHEET_ID,
                range=f'CI Assessment!{TIKTOK_URL_COLUMN}{row_number}'
            ).execute()
            
            existing_value = result.get('values', [['']])[0][0] if result.get('values') else ''
            
            if existing_value and existing_value.strip():
                self._log(f"Row {row_number} already has TikTok URL, skipping", "warn")
                return False
            
            # Update TikTok URL column (AM)
            self.sheets_service.spreadsheets().values().update(
                spreadsheetId=SHEET_ID,
                range=f'CI Assessment!{TIKTOK_URL_COLUMN}{row_number}',
                valueInputOption='RAW',
                body={'values': [[tiktok_url or '']]}
            ).execute()
            
            self._log(f"Updated row {row_number}", "success")
            return True
            
        except Exception as e:
            self._log(f"Error updating sheet: {e}", "error")
            return False
    
    def add_header_columns(self):
        """Add TikTok and TikTok Followers headers if they don't exist"""
        try:
            # Read current headers
            result = self.sheets_service.spreadsheets().values().get(
                spreadsheetId=SHEET_ID,
                range='CI Assessment!A1:AN1'
            ).execute()
            
            headers = result.get('values', [[]])[0]
            
            # Check if we need to add headers
            updates = []
            
            if len(headers) < 39 or not headers[38]:  # Column AM (index 38)
                self._log("Adding TikTok header")
                updates.append({
                    'range': f'CI Assessment!{TIKTOK_URL_COLUMN}1',
                    'values': [['TikTok']]
                })
            
            if len(headers) < 40 or not headers[39]:  # Column AN (index 39)
                self._log("Adding TikTok Followers header")
                updates.append({
                    'range': f'CI Assessment!{TIKTOK_FOLLOWERS_COLUMN}1',
                    'values': [['TikTok Followers']]
                })
            
            if updates:
                self.sheets_service.spreadsheets().values().batchUpdate(
                    spreadsheetId=SHEET_ID,
                    body={'data': updates, 'valueInputOption': 'RAW'}
                ).execute()
                self._log("Headers added successfully", "success")
            else:
                self._log("Headers already exist", "info")
            
        except Exception as e:
            self._log(f"Error adding headers: {e}", "error")
    
    def discover_batch(self, start: int = 0, limit: int = 2, test_mode: bool = True):
        """
        Discover TikTok accounts for a batch of stakeholders
        
        Args:
            start: Starting index (0-based)
            limit: Number of stakeholders to process
            test_mode: If True, only tests first 1-2 entries without updating sheet
        """
        
        print(f"\n{'='*80}")
        print(f"TIKTOK DISCOVERY")
        print(f"Mode: {'TEST (no sheet updates)' if test_mode else 'LIVE (will update sheet)'}")
        print(f"{'='*80}\n")
        
        # Add headers if needed (only in live mode)
        if not test_mode:
            self.add_header_columns()
        
        # Get stakeholders
        stakeholders = self.get_ci_assessment_data()
        
        if not stakeholders:
            self._log("No stakeholders found", "error")
            return
        
        # Filter out those that already have TikTok URLs (unless testing)
        if not test_mode:
            original_count = len(stakeholders)
            stakeholders = [s for s in stakeholders if not s.get('existing_tiktok')]
            self._log(f"Filtered to {len(stakeholders)} without TikTok (skipped {original_count - len(stakeholders)})")
        
        # Apply batch limits
        batch = stakeholders[start:start+limit]
        
        print(f"\nProcessing {len(batch)} stakeholders (rows {batch[0]['row_number']}-{batch[-1]['row_number']})\n")
        
        results = []
        for i, stakeholder in enumerate(batch, start=1):
            print(f"\n--- {i}/{len(batch)}: {stakeholder['name']} ---")
            
            # Search for TikTok
            tiktok_url = self.search_tiktok(stakeholder['name'], "The Gambia")
            
            result = {
                'name': stakeholder['name'],
                'sector': stakeholder['sector'],
                'row_number': stakeholder['row_number'],
                'tiktok_url': tiktok_url,
                'searched_at': datetime.now().isoformat()
            }
            results.append(result)
            
            # Update sheet (only in live mode)
            if not test_mode and tiktok_url:
                self.update_tiktok_column(stakeholder['row_number'], tiktok_url)
            
            # Rate limiting
            if i < len(batch):
                time.sleep(2)
        
        # Summary
        print(f"\n{'='*80}")
        print(f"SUMMARY")
        print(f"{'='*80}")
        print(f"Searched: {len(results)} stakeholders")
        found = [r for r in results if r['tiktok_url']]
        print(f"Found TikTok: {len(found)}")
        
        if found:
            print("\n✅ Accounts found:")
            for r in found:
                print(f"  • {r['name']}: {r['tiktok_url']}")
        
        not_found = [r for r in results if not r['tiktok_url']]
        if not_found:
            print(f"\n⚠️  No TikTok found for {len(not_found)} stakeholders:")
            for r in not_found:
                print(f"  • {r['name']}")
        
        if test_mode:
            print(f"\n💡 TEST MODE: No changes were made to the sheet")
            print(f"   Run with --live to update the sheet")
        else:
            print(f"\n✅ Sheet updated with {len(found)} TikTok URLs")
            print(f"   Note: TikTok Followers column (AN) is empty - fill in manually")
        
        print(f"{'='*80}\n")
        
        return results


def main():
    """Main execution"""
    import sys
    
    # Parse args
    start = 0
    limit = 2  # Default to 2 for testing
    test_mode = True
    
    for i, arg in enumerate(sys.argv):
        if arg == '--start' and i+1 < len(sys.argv):
            start = int(sys.argv[i+1])
        elif arg == '--limit' and i+1 < len(sys.argv):
            limit = int(sys.argv[i+1])
        elif arg == '--live':
            test_mode = False
    
    print("\n🎵 TikTok Discovery Tool")
    print("=" * 80)
    
    if not GOOGLE_API_KEY or not SEARCH_ENGINE_ID:
        print("❌ Error: Google API credentials not configured")
        print("Please set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID in .env file")
        return
    
    discovery = TikTokDiscovery(verbose=True)
    discovery.discover_batch(start=start, limit=limit, test_mode=test_mode)


if __name__ == '__main__':
    main()

