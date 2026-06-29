#!/usr/bin/env python3
"""
Survey Integration Script - Option C Implementation
Reads CI_Survey and TO_Survey, scores responses, matches to stakeholders, writes to assessment sheets
"""

import json
from typing import Dict, List, Tuple, Any, Optional
from google.oauth2 import service_account
from googleapiclient.discovery import build
from survey_scoring_engine import SurveyScorer
from difflib import SequenceMatcher
import re
from datetime import datetime

# Configuration
SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDENTIALS_PATH = '/Users/alexjeffries/tourism-commons/tourism-development-d620c-5c9db9e21301.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']


class SurveyIntegration:
    """Integrates survey responses with assessment sheets"""
    
    def __init__(self):
        self.service = self._get_sheets_service()
        self.ci_scorer = SurveyScorer('CI')
        self.to_scorer = SurveyScorer('TO')
        self.match_report = []
    
    def _get_sheets_service(self):
        """Initialize Google Sheets API service with write access"""
        credentials = service_account.Credentials.from_service_account_file(
            CREDENTIALS_PATH, scopes=SCOPES
        )
        service = build('sheets', 'v4', credentials=credentials)
        return service
    
    # =============================================================================
    # READ SURVEYS
    # =============================================================================
    
    def read_survey_responses(self, survey_tab: str) -> List[Dict[str, Any]]:
        """
        Read all responses from a survey tab
        Returns list of response dicts with question keys
        """
        result = self.service.spreadsheets().values().get(
            spreadsheetId=SHEET_ID,
            range=f"{survey_tab}!A1:DN1000"  # Read all columns
        ).execute()
        
        values = result.get('values', [])
        
        if not values:
            return []
        
        headers = values[0]
        responses = []
        
        for row in values[1:]:
            # Skip empty rows
            if not row or not any(cell for cell in row):
                continue
            
            # Create dict with header as key
            response = {}
            for i, header in enumerate(headers):
                if i < len(row):
                    response[header] = row[i]
                else:
                    response[header] = ''
            
            responses.append(response)
        
        return responses
    
    def read_assessment_sheet(self, assessment_tab: str) -> Tuple[List[str], List[List[str]]]:
        """
        Read assessment sheet (CI Assessment or TO Assessment)
        Returns (headers, rows)
        """
        result = self.service.spreadsheets().values().get(
            spreadsheetId=SHEET_ID,
            range=f"{assessment_tab}!A1:AT1000"  # Read through column AT
        ).execute()
        
        values = result.get('values', [])
        
        if not values:
            return [], []
        
        headers = values[0]
        rows = values[1:]
        
        return headers, rows
    
    # =============================================================================
    # STAKEHOLDER MATCHING
    # =============================================================================
    
    def normalize_name(self, name: str) -> str:
        """Normalize business name for matching"""
        if not name:
            return ''
        
        name = name.lower().strip()
        # Remove common business suffixes
        for suffix in [' ltd', ' limited', ' inc', ' llc', ' co', ' company', ' enterprises']:
            if name.endswith(suffix):
                name = name[:-len(suffix)].strip()
        
        # Remove special characters except spaces
        name = re.sub(r'[^a-z0-9\s]', '', name)
        # Collapse multiple spaces
        name = re.sub(r'\s+', ' ', name)
        
        return name
    
    def fuzzy_match_score(self, str1: str, str2: str) -> float:
        """
        Calculate similarity score between two strings (0-1)
        Uses SequenceMatcher for fuzzy matching
        """
        return SequenceMatcher(None, str1, str2).ratio()
    
    def extract_phone(self, contact: str) -> str:
        """Extract phone number from contact info"""
        if not contact:
            return ''
        
        # Extract digits
        digits = re.sub(r'\D', '', contact)
        # Return last 7-10 digits (typical phone number)
        if len(digits) >= 7:
            return digits[-10:]
        return digits
    
    def phone_match(self, phone1: str, phone2: str) -> float:
        """Check if phone numbers match (returns 0 or 1)"""
        p1 = self.extract_phone(phone1)
        p2 = self.extract_phone(phone2)
        
        if not p1 or not p2:
            return 0.0
        
        # Check if last 7 digits match (local number)
        if p1[-7:] == p2[-7:]:
            return 1.0
        
        return 0.0
    
    def match_survey_to_stakeholder(
        self,
        survey_response: Dict[str, Any],
        assessment_rows: List[List[str]],
        survey_type: str
    ) -> Tuple[Optional[int], str, List[Dict]]:
        """
        Match a survey response to stakeholder in assessment sheet
        
        Returns:
            (row_index, confidence, top_3_matches)
            row_index: 0-based index into assessment_rows (None if no match)
            confidence: 'HIGH', 'MEDIUM', 'LOW', or 'NO_MATCH'
            top_3_matches: List of top 3 potential matches with details
        """
        
        # Extract survey info
        survey_biz_name = survey_response.get('Q2. Name of organization/business', '')
        if not survey_biz_name:
            survey_biz_name = survey_response.get('Q2. Name of your organization/business', '')
        
        survey_contact_key = 'Q107. Contact information for follow-up (phone, WhatsApp, email)' if survey_type == 'CI' else 'Q55. Contact information for follow-up (phone, WhatsApp, email)'
        survey_contact = survey_response.get(survey_contact_key, '')
        
        survey_sector_key = 'Q6. What best describes your creative industry sector?' if survey_type == 'CI' else 'Q4. What is your main business activity?'
        survey_sector = survey_response.get(survey_sector_key, '')
        
        # Normalize survey name
        survey_name_norm = self.normalize_name(survey_biz_name)
        
        if not survey_name_norm:
            return None, 'NO_MATCH', []
        
        # Score each stakeholder
        matches = []
        
        for i, row in enumerate(assessment_rows):
            if not row or len(row) == 0:
                continue
            
            stakeholder_name = row[0] if len(row) > 0 else ''
            stakeholder_sector = row[1] if len(row) > 1 else ''
            stakeholder_contact = row[20] if len(row) > 20 else ''  # Column U (index 20)
            
            if not stakeholder_name:
                continue
            
            # Calculate match score
            score = 0.0
            
            # 1. Name similarity (0-70 points)
            name_norm = self.normalize_name(stakeholder_name)
            name_similarity = self.fuzzy_match_score(survey_name_norm, name_norm)
            score += name_similarity * 70
            
            # 2. Contact match (0-20 points)
            contact_sim = self.phone_match(survey_contact, stakeholder_contact)
            score += contact_sim * 20
            
            # 3. Sector alignment (0-10 points)
            if survey_sector and stakeholder_sector:
                sector_sim = self.fuzzy_match_score(
                    survey_sector.lower(),
                    stakeholder_sector.lower()
                )
                score += sector_sim * 10
            
            matches.append({
                'row_index': i,
                'stakeholder_name': stakeholder_name,
                'score': score,
                'name_similarity': name_similarity,
                'contact_match': contact_sim,
                'details': {
                    'survey_name': survey_biz_name,
                    'stakeholder_name': stakeholder_name,
                    'survey_contact': survey_contact,
                    'stakeholder_contact': stakeholder_contact
                }
            })
        
        # Sort by score
        matches.sort(key=lambda x: x['score'], reverse=True)
        
        if not matches:
            return None, 'NO_MATCH', []
        
        best_match = matches[0]
        
        # Determine confidence level
        if best_match['score'] >= 85:
            confidence = 'HIGH'
        elif best_match['score'] >= 65:
            confidence = 'MEDIUM'
        elif best_match['score'] >= 45:
            confidence = 'LOW'
        else:
            confidence = 'NO_MATCH'
            return None, confidence, matches[:3]
        
        return best_match['row_index'], confidence, matches[:3]
    
    # =============================================================================
    # WRITE SCORES TO ASSESSMENT SHEET
    # =============================================================================
    
    def write_scores_to_assessment(
        self,
        assessment_tab: str,
        row_index: int,
        scores: Dict[str, Any]
    ):
        """
        Write survey scores to assessment sheet at specific row
        Writes to columns J-R
        
        row_index: 0-based index (will be converted to 1-based + 2 for header row)
        """
        
        # Convert to 1-based and add 2 for header row (row 1 is header, data starts at row 2)
        sheet_row = row_index + 2
        
        # Prepare values for columns J through R
        values = [
            scores['J_digital_foundation'],  # Column J
            scores['K_digital_capability'],  # Column K
            scores['L_platform_ecosystem'],  # Column L
            scores['M_content_engagement'],  # Column M
            scores['N_investment_barriers'],  # Column N
            scores['O_customer_discovery'],  # Column O
            scores['P_digital_commerce'],    # Column P
            scores['Q_review_presence'],     # Column Q
            scores['R_market_focus'],        # Column R
        ]
        
        # Write to sheet
        range_name = f"{assessment_tab}!J{sheet_row}:R{sheet_row}"
        
        body = {
            'values': [values]
        }
        
        self.service.spreadsheets().values().update(
            spreadsheetId=SHEET_ID,
            range=range_name,
            valueInputOption='USER_ENTERED',
            body=body
        ).execute()
    
    # =============================================================================
    # MAIN INTEGRATION FLOW
    # =============================================================================
    
    def integrate_survey(self, survey_tab: str, assessment_tab: str, survey_type: str):
        """
        Complete integration flow for one survey type
        1. Read survey responses
        2. Score each response
        3. Match to stakeholders
        4. Write scores to assessment sheet
        5. Generate report
        """
        
        print(f"\n{'='*80}")
        print(f"INTEGRATING {survey_tab} → {assessment_tab}")
        print(f"{'='*80}")
        
        # Read survey responses
        print(f"\n📋 Reading survey responses from {survey_tab}...")
        survey_responses = self.read_survey_responses(survey_tab)
        print(f"   Found {len(survey_responses)} responses")
        
        if not survey_responses:
            print(f"   ⚠️  No responses found in {survey_tab}")
            return
        
        # Read assessment sheet
        print(f"\n📋 Reading stakeholders from {assessment_tab}...")
        headers, assessment_rows = self.read_assessment_sheet(assessment_tab)
        print(f"   Found {len(assessment_rows)} stakeholders")
        
        # Process each survey response
        print(f"\n🔄 Processing responses...")
        
        scorer = self.ci_scorer if survey_type == 'CI' else self.to_scorer
        
        for idx, response in enumerate(survey_responses, 1):
            biz_name = response.get('Q2. Name of organization/business', '') or response.get('Q2. Name of your organization/business', '')
            
            print(f"\n   [{idx}/{len(survey_responses)}] Processing: {biz_name}")
            
            # Score the response
            scores = scorer.score_complete_response(response)
            print(f"      Total Score: {scores['total_survey_score']}/30")
            
            # Match to stakeholder
            row_index, confidence, top_matches = self.match_survey_to_stakeholder(
                response, assessment_rows, survey_type
            )
            
            print(f"      Match Confidence: {confidence}")
            
            if row_index is not None:
                matched_name = assessment_rows[row_index][0]
                print(f"      ✓ Matched to: {matched_name}")
                
                # Write scores
                try:
                    self.write_scores_to_assessment(assessment_tab, row_index, scores)
                    print(f"      ✓ Scores written to row {row_index + 2}")
                    
                    # Add to report
                    self.match_report.append({
                        'survey_tab': survey_tab,
                        'survey_business': biz_name,
                        'matched_stakeholder': matched_name,
                        'confidence': confidence,
                        'row': row_index + 2,
                        'total_score': scores['total_survey_score'],
                        'status': 'SUCCESS'
                    })
                    
                except Exception as e:
                    print(f"      ✗ Error writing scores: {e}")
                    self.match_report.append({
                        'survey_tab': survey_tab,
                        'survey_business': biz_name,
                        'matched_stakeholder': matched_name,
                        'confidence': confidence,
                        'error': str(e),
                        'status': 'ERROR'
                    })
            else:
                print(f"      ✗ No match found")
                if top_matches:
                    print(f"      Top suggestion: {top_matches[0]['stakeholder_name']} (score: {top_matches[0]['score']:.1f})")
                
                self.match_report.append({
                    'survey_tab': survey_tab,
                    'survey_business': biz_name,
                    'confidence': confidence,
                    'total_score': scores['total_survey_score'],
                    'top_suggestion': top_matches[0]['stakeholder_name'] if top_matches else None,
                    'status': 'NO_MATCH'
                })
    
    def run_complete_integration(self):
        """Run integration for both CI and TO surveys"""
        
        print("\n" + "="*80)
        print("SURVEY INTEGRATION - OPTION C (HYBRID APPROACH)")
        print("="*80)
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Sheet ID: {SHEET_ID}")
        
        # Integrate CI Survey
        try:
            self.integrate_survey('CI_Survey', 'CI Assessment', 'CI')
        except Exception as e:
            print(f"\n✗ Error integrating CI_Survey: {e}")
            import traceback
            traceback.print_exc()
        
        # Integrate TO Survey
        try:
            self.integrate_survey('TO_Survey', 'TO Assessment', 'TO')
        except Exception as e:
            print(f"\n✗ Error integrating TO_Survey: {e}")
            import traceback
            traceback.print_exc()
        
        # Generate report
        self.generate_report()
    
    def generate_report(self):
        """Generate and display match report"""
        
        print(f"\n{'='*80}")
        print("INTEGRATION REPORT")
        print(f"{'='*80}")
        
        total = len(self.match_report)
        success = len([r for r in self.match_report if r['status'] == 'SUCCESS'])
        no_match = len([r for r in self.match_report if r['status'] == 'NO_MATCH'])
        errors = len([r for r in self.match_report if r['status'] == 'ERROR'])
        
        print(f"\nTotal Responses Processed: {total}")
        print(f"  ✓ Successfully Matched & Written: {success}")
        print(f"  ⚠️  No Match Found: {no_match}")
        print(f"  ✗ Errors: {errors}")
        
        if success > 0:
            print(f"\n{'='*80}")
            print("SUCCESSFUL MATCHES:")
            print(f"{'='*80}")
            for r in self.match_report:
                if r['status'] == 'SUCCESS':
                    print(f"\n  {r['survey_business']}")
                    print(f"  → Matched to: {r['matched_stakeholder']} (Row {r['row']})")
                    print(f"     Confidence: {r['confidence']}, Score: {r['total_score']}/30")
        
        if no_match > 0:
            print(f"\n{'='*80}")
            print("NO MATCHES (Manual Review Required):")
            print(f"{'='*80}")
            for r in self.match_report:
                if r['status'] == 'NO_MATCH':
                    print(f"\n  {r['survey_business']}")
                    print(f"  → No confident match found")
                    if r.get('top_suggestion'):
                        print(f"     Suggestion: {r['top_suggestion']}")
                    print(f"     Score: {r['total_score']}/30")
        
        if errors > 0:
            print(f"\n{'='*80}")
            print("ERRORS:")
            print(f"{'='*80}")
            for r in self.match_report:
                if r['status'] == 'ERROR':
                    print(f"\n  {r['survey_business']}")
                    print(f"  → Error: {r.get('error', 'Unknown error')}")
        
        # Save report to JSON
        report_file = f"/Users/alexjeffries/tourism-commons/digital_assessment/survey_integration_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(self.match_report, f, indent=2)
        
        print(f"\n{'='*80}")
        print(f"Full report saved to:")
        print(f"{report_file}")
        print(f"{'='*80}\n")


def main():
    """Main entry point"""
    integrator = SurveyIntegration()
    integrator.run_complete_integration()


if __name__ == '__main__':
    main()

