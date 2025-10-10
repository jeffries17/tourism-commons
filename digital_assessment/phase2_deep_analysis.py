#!/usr/bin/env python3
"""
PHASE 2: DEEP DIGITAL ANALYSIS
- Reads APPROVED URLs from Regional Assessment
- Scrapes websites
- Runs AI analysis (OpenAI) on all 6 categories × 10 criteria
- Writes scores to sheets

Cost: ~$0.10-0.20 per entity (OpenAI calls + scraping)
Time: ~30-40 seconds per entity

IMPORTANT: Only run this after reviewing/approving URLs from Phase 1!
"""

import os
import time
import json
from datetime import datetime
from typing import Dict, List
from google.oauth2 import service_account
from googleapiclient.discovery import build
from regional_competitor_analyzer import RegionalCompetitorAnalyzer

SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDS_FILE = '../tourism-development-d620c-5c9db9e21301.json'


class DeepAnalysisEngine:
    """Phase 2: Deep analysis using approved URLs"""
    
    def __init__(self, verbose=True):
        self.verbose = verbose
        self.analyzer = RegionalCompetitorAnalyzer(verbose=verbose)
    
    def _log(self, message, level="info"):
        """Simple logging"""
        if self.verbose:
            prefix = "🔍" if level == "info" else "✅" if level == "success" else "⚠️" if level == "warn" else "❌"
            print(f"{prefix} {message}")
    
    def _setup_score_formulas(self, entity_name: str):
        """Setup score formulas in Regional Assessment for this entity"""
        
        # Find the row
        search_result = self.analyzer.sheets_service.spreadsheets().values().get(
            spreadsheetId=SHEET_ID,
            range='Regional Assessment!A:A'
        ).execute()
        
        rows = search_result.get('values', [])
        row_num = None
        
        for i, row in enumerate(rows):
            if not row or not row[0]:
                continue  # Skip empty rows
            
            try:
                if row[0].strip().lower() == entity_name.lower():
                    row_num = i + 1
                    break
            except Exception as e:
                self._log(f"Error checking row {i+1}: {e}", "warn")
                continue
        
        if not row_num:
            return
        
        # Formulas to pull from Regional Checklist Detail
        formulas = [
            f'=IFERROR(VLOOKUP(A{row_num},\'Regional Checklist Detail\'!A:P,16,FALSE),"")',      # Social Media
            f'=IFERROR(VLOOKUP(A{row_num},\'Regional Checklist Detail\'!A:AA,27,FALSE),"")',     # Website
            f'=IFERROR(VLOOKUP(A{row_num},\'Regional Checklist Detail\'!A:AL,38,FALSE),"")',     # Visual Content
            f'=IFERROR(VLOOKUP(A{row_num},\'Regional Checklist Detail\'!A:AW,49,FALSE),"")',     # Discoverability
            f'=IFERROR(VLOOKUP(A{row_num},\'Regional Checklist Detail\'!A:BH,60,FALSE),"")',     # Digital Sales
            f'=IFERROR(VLOOKUP(A{row_num},\'Regional Checklist Detail\'!A:BS,71,FALSE),"")',     # Platform Integration
        ]
        
        try:
            self.analyzer.sheets_service.spreadsheets().values().update(
                spreadsheetId=SHEET_ID,
                range=f'Regional Assessment!D{row_num}:I{row_num}',
                valueInputOption='USER_ENTERED',
                body={'values': [formulas]}
            ).execute()
        except Exception as e:
            print(f"⚠️  Could not set up formulas for {entity_name}: {e}")
    
    def get_approved_urls(self, name: str) -> Dict:
        """Get approved URLs from Regional Assessment sheet"""
        
        # Find the row
        search_result = self.analyzer.sheets_service.spreadsheets().values().get(
            spreadsheetId=SHEET_ID,
            range='Regional Assessment!A:AE'
        ).execute()
        
        rows = search_result.get('values', [])
        
        for row in rows[1:]:  # Skip header
            if not row or not row[0]:
                continue  # Skip empty rows
            
            try:
                if row[0].strip().lower() == name.lower():
                    # Columns X-AC (indices 23-28): URLs
                    # Handle sparse arrays and ensure we get actual URLs (not empty strings)
                    def get_url(row, index):
                        """Helper to safely extract URL from row"""
                        if len(row) > index and row[index] and row[index].strip():
                            return row[index].strip()
                        return None
                    
                    return {
                        'name': row[0].strip(),
                        'sector': row[1].strip() if len(row) > 1 and row[1] else 'Unknown',
                        'country': row[2].strip() if len(row) > 2 and row[2] else 'Unknown',
                        'website': get_url(row, 23),
                        'facebook': get_url(row, 24),
                        'instagram': get_url(row, 25),
                        'tripadvisor': get_url(row, 26),
                        'youtube': get_url(row, 27),
                        'linkedin': get_url(row, 28)
                    }
            except Exception as e:
                self._log(f"Error reading row for {name}: {e}", "warn")
                continue
        
        return None
    
    def analyze_with_approved_urls(self, name: str, country: str, sector: str) -> Dict:
        """Run deep analysis using approved URLs from sheet"""
        
        print(f"\n{'='*80}")
        print(f"ANALYZING: {name}")
        print(f"Country: {country} | Sector: {sector}")
        print(f"{'='*80}")
        
        # Get approved URLs from sheet
        approved = self.get_approved_urls(name)
        
        if not approved:
            self._log(f"Could not find {name} in Regional Assessment", "error")
            return None
        
        # Check if any URLs exist
        has_urls = any([
            approved['website'],
            approved['facebook'],
            approved['instagram'],
            approved['tripadvisor'],
            approved['youtube'],
            approved['linkedin']
        ])
        
        if not has_urls:
            self._log(f"No URLs found for {name} - skipping analysis", "warn")
            return None
        
        self._log(f"Using approved URLs from sheet", "info")
        
        # Scrape website if exists
        website_data = None
        if approved['website']:
            self._log(f"Scraping website: {approved['website']}", "info")
            website_data = self.analyzer.scrape_website(approved['website'])
            time.sleep(1)
        
        # Build evidence package
        evidence = {
            'search_results': [],  # We already did discovery in Phase 1
            'website': approved['website'],
            'website_data': website_data,
            'facebook': approved['facebook'],
            'instagram': approved['instagram'],
            'tripadvisor': approved['tripadvisor'],
            'youtube': approved['youtube'],
            'linkedin': approved['linkedin']
        }
        
        # AI analysis for each category
        categories = [
            'Social Media',
            'Website',
            'Visual Content',
            'Discoverability',
            'Digital Sales',
            'Platform Integration'
        ]
        
        analysis_results = {}
        for category in categories:
            result = self.analyzer.ai_analyze_category(category, evidence, sector, country)
            analysis_results[category] = result
            time.sleep(0.5)  # Rate limiting
        
        # Calculate totals
        total_score = sum(r['score'] for r in analysis_results.values())
        avg_confidence = sum(1 for r in analysis_results.values() if r['confidence'] == 'high') / 6
        
        # Compile final result
        final_result = {
            'stakeholder_name': name,
            'country': country,
            'sector': sector,
            'assessment_date': datetime.now().isoformat(),
            'assessment_method': 'phase2_deep_analysis',
            
            # Digital presence (approved URLs)
            'digital_presence': {
                'website': approved['website'],
                'facebook': approved['facebook'],
                'instagram': approved['instagram'],
                'tripadvisor': approved['tripadvisor'],
                'youtube': approved['youtube'],
                'linkedin': approved['linkedin']
            },
            
            # Category scores
            'category_scores': {
                'social_media': analysis_results['Social Media']['score'],
                'website': analysis_results['Website']['score'],
                'visual_content': analysis_results['Visual Content']['score'],
                'discoverability': analysis_results['Discoverability']['score'],
                'digital_sales': analysis_results['Digital Sales']['score'],
                'platform_integration': analysis_results['Platform Integration']['score']
            },
            
            # Detailed analysis
            'detailed_analysis': analysis_results,
            
            # Summary
            'total_score': total_score,
            'max_score': 60,
            'percentage': round((total_score / 60) * 100, 1),
            'maturity_level': self.analyzer._get_maturity_level(total_score),
            'confidence_score': round(avg_confidence * 100, 1)
        }
        
        # Print summary
        print(f"\n📊 RESULTS SUMMARY")
        print(f"{'='*80}")
        print(f"Total Score: {total_score}/60 ({final_result['percentage']}%)")
        print(f"Maturity Level: {final_result['maturity_level']}")
        print(f"Confidence: {final_result['confidence_score']}%")
        print(f"\nCategory Breakdown:")
        for cat, score in final_result['category_scores'].items():
            print(f"  {cat:25} {score}/10")
        
        return final_result
    
    def analyze_batch(self, country: str = None, start: int = 0, limit: int = 10):
        """Analyze batch of entities using approved URLs"""
        
        # Get all competitors
        competitors = self.analyzer.get_regional_assessment_data()
        
        # Filter by country if specified
        if country:
            competitors = [c for c in competitors if c['country'].lower() == country.lower()]
            print(f"Filtered to {len(competitors)} entities in {country}")
        
        # Apply batch limits
        batch = competitors[start:start+limit]
        
        print(f"\n{'='*80}")
        print(f"PHASE 2: DEEP ANALYSIS")
        print(f"Batch: {start+1}-{start+len(batch)} of {len(competitors)} total")
        print(f"Using approved URLs from sheet")
        print(f"{'='*80}")
        
        results = []
        for i, comp in enumerate(batch, start=1):
            try:
                result = self.analyze_with_approved_urls(
                    comp['name'],
                    comp['country'],
                    comp['sector']
                )
                
                if result:
                    results.append(result)
                    
                    # Save to sheets
                    self._log("Saving to sheets...", "info")
                    self.analyzer.save_to_checklist_detail(result)
                    self.analyzer.save_to_sheet(result)
                    
                    # Set up score formulas in Regional Assessment
                    self._setup_score_formulas(comp['name'])
                    
                    # Rate limiting
                    if i < len(batch):
                        time.sleep(3)
                
            except Exception as e:
                print(f"❌ Error analyzing {comp['name']}: {e}")
                import traceback
                traceback.print_exc()
                continue
        
        # Save batch results
        output_file = f"phase2_analysis_{country or 'all'}_{start+1}-{start+len(batch)}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n{'='*80}")
        print(f"✅ PHASE 2 COMPLETE!")
        print(f"Analyzed {len(results)} entities")
        print(f"Saved to: {output_file}")
        print(f"\n📈 SUMMARY:")
        if results:
            avg_score = sum(r['total_score'] for r in results) / len(results)
            avg_pct = sum(r['percentage'] for r in results) / len(results)
            print(f"Average score: {avg_score:.1f}/60")
            print(f"Average percentage: {avg_pct:.1f}%")
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
    
    engine = DeepAnalysisEngine(verbose=True)
    engine.analyze_batch(country=country, start=start, limit=limit)


if __name__ == '__main__':
    main()

