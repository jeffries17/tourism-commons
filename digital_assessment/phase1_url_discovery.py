#!/usr/bin/env python3
"""
PHASE 1: URL DISCOVERY & VALIDATION
- Discovers URLs using Google Search
- Validates URLs (filters blogs, guest houses, photo links, etc.)
- Writes URLs to Regional Assessment for human review
- NO expensive AI analysis or web scraping yet

Cost: ~$0.01-0.02 per entity (just Google Search API)
Time: ~10-15 seconds per entity
"""

import os
import json
import requests
import time
from datetime import datetime
from typing import Dict, List
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDS_FILE = '../tourism-development-d620c-5c9db9e21301.json'
USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'

GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY', '')
SEARCH_ENGINE_ID = os.environ.get('GOOGLE_SEARCH_ENGINE_ID', '')

# Import the validator from our main analyzer
from regional_competitor_analyzer import RegionalCompetitorAnalyzer

class URLDiscoveryEngine:
    """Phase 1: Discover and validate URLs only (no deep analysis)"""
    
    def __init__(self, verbose=True):
        self.verbose = verbose
        self.sheets_service = self._get_sheets_service()
        # Use the analyzer's validation methods
        self.analyzer = RegionalCompetitorAnalyzer(verbose=False)
        
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
    
    def discover_urls(self, name: str, country: str, sector: str) -> Dict:
        """Discover and validate URLs (no analysis)"""
        
        print(f"\n{'='*80}")
        print(f"DISCOVERING: {name}")
        print(f"Country: {country} | Sector: {sector}")
        print(f"{'='*80}")
        
        # Use the analyzer's discovery method (already has validation built in)
        presence = self.analyzer.discover_digital_presence(name, country, sector)
        
        # Add metadata
        result = {
            'stakeholder_name': name,
            'country': country,
            'sector': sector,
            'discovery_date': datetime.now().isoformat(),
            'discovery_method': 'google_search_validated',
            'urls': {
                'website': presence.get('website'),
                'facebook': presence.get('facebook'),
                'instagram': presence.get('instagram'),
                'tripadvisor': presence.get('tripadvisor'),
                'youtube': presence.get('youtube'),
                'linkedin': presence.get('linkedin')
            },
            'validation_metadata': presence.get('_validation_metadata', {})
        }
        
        # Print summary
        found = [k for k, v in result['urls'].items() if v]
        self._log(f"Discovered: {', '.join(found) if found else 'Nothing'}", "success")
        
        return result
    
    def save_urls_to_sheet(self, result: Dict):
        """Save discovered URLs to Regional Assessment for review"""
        
        # Find the row for this stakeholder
        search_result = self.sheets_service.spreadsheets().values().get(
            spreadsheetId=SHEET_ID,
            range='Regional Assessment!A:A'
        ).execute()
        
        rows = search_result.get('values', [])
        row_index = None
        
        for i, row in enumerate(rows):
            if not row or not row[0]:
                continue  # Skip empty rows
            
            try:
                if row[0].strip().lower() == result['stakeholder_name'].lower():
                    row_index = i + 1
                    break
            except Exception as e:
                self._log(f"Error checking row {i+1}: {e}", "warn")
                continue
        
        if not row_index:
            self._log(f"Could not find {result['stakeholder_name']} in Regional Assessment", "warn")
            return False
        
        urls = result['urls']
        
        # Update URLs (columns X-AC: Website, Facebook, Instagram, TripAdvisor, YouTube, LinkedIn)
        # Also update discovery date and method (columns AD-AE)
        update_data = [
            urls['website'] or '',
            urls['facebook'] or '',
            urls['instagram'] or '',
            urls['tripadvisor'] or '',
            urls['youtube'] or '',
            urls['linkedin'] or '',
            result['discovery_date'],
            result['discovery_method']
        ]
        
        try:
            self.sheets_service.spreadsheets().values().update(
                spreadsheetId=SHEET_ID,
                range=f'Regional Assessment!X{row_index}:AE{row_index}',
                valueInputOption='RAW',
                body={'values': [update_data]}
            ).execute()
            
            self._log(f"Saved URLs for {result['stakeholder_name']}", "success")
            return True
            
        except Exception as e:
            self._log(f"Error saving URLs: {e}", "error")
            return False
    
    def discover_batch(self, country: str = None, start: int = 0, limit: int = 10):
        """Discover URLs for a batch of entities"""
        
        # Get all competitors
        competitors = self.analyzer.get_regional_assessment_data()
        
        # Filter by country if specified
        if country:
            competitors = [c for c in competitors if c['country'].lower() == country.lower()]
            print(f"Filtered to {len(competitors)} entities in {country}")
        
        # Apply batch limits
        batch = competitors[start:start+limit]
        
        print(f"\n{'='*80}")
        print(f"PHASE 1: URL DISCOVERY")
        print(f"Batch: {start+1}-{start+len(batch)} of {len(competitors)} total")
        print(f"{'='*80}")
        
        results = []
        for i, comp in enumerate(batch, start=1):
            try:
                result = self.discover_urls(comp['name'], comp['country'], comp['sector'])
                results.append(result)
                
                # Save to sheet
                self.save_urls_to_sheet(result)
                
                # Rate limiting
                if i < len(batch):
                    time.sleep(2)
                
            except Exception as e:
                print(f"❌ Error discovering {comp['name']}: {e}")
                continue
        
        # Save batch results
        output_file = f"phase1_urls_{country or 'all'}_{start+1}-{start+len(batch)}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n{'='*80}")
        print(f"✅ PHASE 1 COMPLETE!")
        print(f"Discovered URLs for {len(results)} entities")
        print(f"Saved to: {output_file}")
        print(f"\n📋 NEXT STEPS:")
        print(f"1. Review URLs in Regional Assessment sheet")
        print(f"2. Edit/correct any URLs as needed")
        print(f"3. Run Phase 2 (deep analysis) on approved URLs")
        print(f"{'='*80}")
        
        return results


def main():
    """Main execution"""
    import sys
    
    # Parse args
    country = None
    start = 0
    limit = 10
    
    for i, arg in enumerate(sys.argv):
        if arg == '--country' and i+1 < len(sys.argv):
            country = sys.argv[i+1]
        elif arg == '--start' and i+1 < len(sys.argv):
            start = int(sys.argv[i+1])
        elif arg == '--limit' and i+1 < len(sys.argv):
            limit = int(sys.argv[i+1])
    
    engine = URLDiscoveryEngine(verbose=True)
    engine.discover_batch(country=country, start=start, limit=limit)


if __name__ == '__main__':
    main()

