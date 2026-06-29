#!/usr/bin/env python3
"""
Score and Match Survey Responses
Reads actual survey responses from CI_Survey and TO_Survey sheets,
scores them using the capacity scorer, matches to participants,
and prepares data for spreadsheet update.
"""

from typing import Dict, Any, List, Tuple, Optional
from google.oauth2 import service_account
from googleapiclient.discovery import build
from survey_capacity_scorer import SurveyCapacityScorer
from difflib import SequenceMatcher
import json
import re
from datetime import datetime

# Configuration
SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDENTIALS_PATH = '/Users/alexjeffries/tourism-commons/tourism-development-d620c-5c9db9e21301.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']


class SurveyScoreAndMatch:
    """Score survey responses and match to participants"""
    
    def __init__(self):
        self.service = self._get_sheets_service()
        self.ci_scorer = SurveyCapacityScorer('CI')
        self.to_scorer = SurveyCapacityScorer('TO')
        self.results = []
    
    def _get_sheets_service(self):
        """Initialize Google Sheets API service"""
        credentials = service_account.Credentials.from_service_account_file(
            CREDENTIALS_PATH, scopes=SCOPES
        )
        return build('sheets', 'v4', credentials=credentials)
    
    def read_survey_responses(self, survey_tab: str):
        """Read all responses from a survey tab"""
        result = self.service.spreadsheets().values().get(
            spreadsheetId=SHEET_ID,
            range=f"{survey_tab}!A1:DN1000"
        ).execute()
        
        values = result.get('values', [])
        
        if not values:
            return []
        
        headers = values[0]
        responses = []
        
        for row in values[1:]:
            if not row or not any(cell for cell in row):
                continue
            
            response = {}
            for i, header in enumerate(headers):
                if i < len(row):
                    response[header] = row[i]
                else:
                    response[header] = ''
            
            responses.append(response)
        
        return responses
    
    def read_assessment_sheet(self, assessment_tab: str):
        """Read assessment sheet (CI Assessment or TO Assessment)"""
        result = self.service.spreadsheets().values().get(
            spreadsheetId=SHEET_ID,
            range=f"{assessment_tab}!A1:AZ1000"
        ).execute()
        
        values = result.get('values', [])
        
        if not values:
            return [], []
        
        headers = values[0]
        rows = values[1:]
        
        return headers, rows
    
    def normalize_name(self, name: str) -> str:
        """Normalize business name for matching"""
        if not name:
            return ''
        
        name = name.lower().strip()
        # Remove common business suffixes
        for suffix in [' ltd', ' limited', ' inc', ' llc', ' co', ' company', ' enterprises', ' gambia', ' the gambia']:
            if name.endswith(suffix):
                name = name[:-len(suffix)].strip()
        
        # Remove special characters except spaces
        name = re.sub(r'[^a-z0-9\s]', '', name)
        # Collapse multiple spaces
        name = re.sub(r'\s+', ' ', name)
        
        return name
    
    def fuzzy_match_score(self, str1: str, str2: str) -> float:
        """Calculate similarity score between two strings (0-1)"""
        return SequenceMatcher(None, str1, str2).ratio()
    
    def extract_business_name_from_response(self, response: Dict, survey_type: str) -> str:
        """Extract business name from survey response"""
        # Try multiple possible question formats
        possible_keys = [
            'Q2. Name of organization/business',
            'Q2. Name of your organization/business',
            'Q1.1 What is the name of your organization/business?',
            'Q1.1 What is the name of your business?',
            'Business Name',
            'Organization Name'
        ]
        
        for key in possible_keys:
            if key in response and response[key]:
                return response[key]
        
        return ''
    
    def match_to_participant(self, survey_response: Dict, assessment_rows: list, survey_type: str):
        """
        Match survey response to participant in assessment sheet
        Returns (best_match_index, confidence_score, matched_name)
        """
        
        survey_biz_name = self.extract_business_name_from_response(survey_response, survey_type)
        survey_name_norm = self.normalize_name(survey_biz_name)
        
        if not survey_name_norm:
            return None, 0.0, None
        
        best_match = None
        best_score = 0.0
        best_name = None
        
        for i, row in enumerate(assessment_rows):
            if not row or len(row) == 0:
                continue
            
            stakeholder_name = row[0] if len(row) > 0 else ''
            if not stakeholder_name:
                continue
            
            # Calculate name similarity
            name_norm = self.normalize_name(stakeholder_name)
            similarity = self.fuzzy_match_score(survey_name_norm, name_norm)
            
            if similarity > best_score:
                best_score = similarity
                best_match = i
                best_name = stakeholder_name
        
        return best_match, best_score, best_name
    
    def process_surveys(self):
        """Process both CI and TO surveys"""
        
        print("\n" + "="*100)
        print("SURVEY SCORING AND MATCHING")
        print("="*100)
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Process CI Survey
        print("\n" + "="*100)
        print("PROCESSING CI_SURVEY")
        print("="*100)
        
        ci_responses = self.read_survey_responses('CI_Survey')
        ci_headers, ci_rows = self.read_assessment_sheet('CI Assessment')
        
        print(f"\n📋 Found {len(ci_responses)} CI survey responses")
        print(f"📋 Found {len(ci_rows)} CI assessment participants")
        
        for idx, response in enumerate(ci_responses, 1):
            print(f"\n{'─'*100}")
            print(f"CI RESPONSE #{idx}")
            print(f"{'─'*100}")
            
            # Extract key info
            biz_name = self.extract_business_name_from_response(response, 'CI')
            response_id = response.get('Response ID', f'Response {idx}')
            respondent_id = response.get('Respondent ID', 'Unknown')
            
            print(f"  Response ID: {response_id}")
            print(f"  Respondent ID: {respondent_id}")
            print(f"  Business Name: {biz_name}")
            
            # Score the response
            print(f"\n  🔢 SCORING...")
            score_result = self.ci_scorer.score_response(response)
            
            print(f"     Total Score: {score_result['total_score']}/30")
            print(f"     Tier: {score_result['tier']}")
            print(f"     • Foundation: {score_result['foundation_score']}/10")
            print(f"     • Capability: {score_result['capability_score']}/10")
            print(f"     • Growth: {score_result['growth_score']}/10")
            
            # Match to participant
            print(f"\n  🔍 MATCHING TO PARTICIPANT...")
            match_idx, match_score, match_name = self.match_to_participant(response, ci_rows, 'CI')
            
            if match_idx is not None and match_score >= 0.6:
                print(f"     ✅ MATCHED: {match_name} (confidence: {match_score:.2%})")
                sheet_row = match_idx + 2  # +2 for 1-based indexing and header row
                
                self.results.append({
                    'survey_type': 'CI',
                    'response_id': response_id,
                    'respondent_id': respondent_id,
                    'survey_business_name': biz_name,
                    'matched': True,
                    'matched_participant': match_name,
                    'match_confidence': match_score,
                    'sheet_row': sheet_row,
                    'sheet_tab': 'CI Assessment',
                    'total_score': score_result['total_score'],
                    'foundation_score': score_result['foundation_score'],
                    'capability_score': score_result['capability_score'],
                    'growth_score': score_result['growth_score'],
                    'tier': score_result['tier'],
                    'breakdown': score_result['breakdown']
                })
            else:
                print(f"     ⚠️  NO CONFIDENT MATCH FOUND")
                if match_name:
                    print(f"     Best suggestion: {match_name} ({match_score:.2%})")
                
                self.results.append({
                    'survey_type': 'CI',
                    'response_id': response_id,
                    'respondent_id': respondent_id,
                    'survey_business_name': biz_name,
                    'matched': False,
                    'best_suggestion': match_name,
                    'suggestion_confidence': match_score,
                    'total_score': score_result['total_score'],
                    'foundation_score': score_result['foundation_score'],
                    'capability_score': score_result['capability_score'],
                    'growth_score': score_result['growth_score'],
                    'tier': score_result['tier'],
                    'breakdown': score_result['breakdown']
                })
        
        # Process TO Survey
        print("\n\n" + "="*100)
        print("PROCESSING TO_SURVEY")
        print("="*100)
        
        to_responses = self.read_survey_responses('TO_Survey')
        to_headers, to_rows = self.read_assessment_sheet('TO Assessment')
        
        print(f"\n📋 Found {len(to_responses)} TO survey responses")
        print(f"📋 Found {len(to_rows)} TO assessment participants")
        
        for idx, response in enumerate(to_responses, 1):
            print(f"\n{'─'*100}")
            print(f"TO RESPONSE #{idx}")
            print(f"{'─'*100}")
            
            # Extract key info
            biz_name = self.extract_business_name_from_response(response, 'TO')
            response_id = response.get('Response ID', f'Response {idx}')
            respondent_id = response.get('Respondent ID', 'Unknown')
            
            print(f"  Response ID: {response_id}")
            print(f"  Respondent ID: {respondent_id}")
            print(f"  Business Name: {biz_name}")
            
            # Score the response
            print(f"\n  🔢 SCORING...")
            score_result = self.to_scorer.score_response(response)
            
            print(f"     Total Score: {score_result['total_score']}/30")
            print(f"     Tier: {score_result['tier']}")
            print(f"     • Foundation: {score_result['foundation_score']}/10")
            print(f"     • Capability: {score_result['capability_score']}/10")
            print(f"     • Growth: {score_result['growth_score']}/10")
            
            # Match to participant
            print(f"\n  🔍 MATCHING TO PARTICIPANT...")
            match_idx, match_score, match_name = self.match_to_participant(response, to_rows, 'TO')
            
            if match_idx is not None and match_score >= 0.6:
                print(f"     ✅ MATCHED: {match_name} (confidence: {match_score:.2%})")
                sheet_row = match_idx + 2  # +2 for 1-based indexing and header row
                
                self.results.append({
                    'survey_type': 'TO',
                    'response_id': response_id,
                    'respondent_id': respondent_id,
                    'survey_business_name': biz_name,
                    'matched': True,
                    'matched_participant': match_name,
                    'match_confidence': match_score,
                    'sheet_row': sheet_row,
                    'sheet_tab': 'TO Assessment',
                    'total_score': score_result['total_score'],
                    'foundation_score': score_result['foundation_score'],
                    'capability_score': score_result['capability_score'],
                    'growth_score': score_result['growth_score'],
                    'tier': score_result['tier'],
                    'breakdown': score_result['breakdown']
                })
            else:
                print(f"     ⚠️  NO CONFIDENT MATCH FOUND")
                if match_name:
                    print(f"     Best suggestion: {match_name} ({match_score:.2%})")
                
                self.results.append({
                    'survey_type': 'TO',
                    'response_id': response_id,
                    'respondent_id': respondent_id,
                    'survey_business_name': biz_name,
                    'matched': False,
                    'best_suggestion': match_name,
                    'suggestion_confidence': match_score,
                    'total_score': score_result['total_score'],
                    'foundation_score': score_result['foundation_score'],
                    'capability_score': score_result['capability_score'],
                    'growth_score': score_result['growth_score'],
                    'tier': score_result['tier'],
                    'breakdown': score_result['breakdown']
                })
        
        # Generate summary report
        self.generate_summary()
        
        # Save results to JSON
        self.save_results()
    
    def generate_summary(self):
        """Generate summary report"""
        
        print("\n\n" + "="*100)
        print("SUMMARY REPORT")
        print("="*100)
        
        total_responses = len(self.results)
        matched = sum(1 for r in self.results if r['matched'])
        unmatched = total_responses - matched
        
        ci_responses = sum(1 for r in self.results if r['survey_type'] == 'CI')
        to_responses = sum(1 for r in self.results if r['survey_type'] == 'TO')
        
        ci_matched = sum(1 for r in self.results if r['survey_type'] == 'CI' and r['matched'])
        to_matched = sum(1 for r in self.results if r['survey_type'] == 'TO' and r['matched'])
        
        print(f"\n📊 OVERALL:")
        print(f"   Total Responses: {total_responses}")
        print(f"   ✅ Matched: {matched}")
        print(f"   ⚠️  Unmatched: {unmatched}")
        
        print(f"\n📊 BY SURVEY TYPE:")
        print(f"   CI Survey: {ci_responses} responses ({ci_matched} matched)")
        print(f"   TO Survey: {to_responses} responses ({to_matched} matched)")
        
        if matched > 0:
            print(f"\n" + "="*100)
            print("MATCHED RESPONSES - READY FOR SPREADSHEET UPDATE")
            print("="*100)
            
            for r in self.results:
                if r['matched']:
                    print(f"\n  {r['survey_type']}: {r['survey_business_name']}")
                    print(f"     → {r['matched_participant']} (Row {r['sheet_row']})")
                    print(f"     Score: {r['total_score']}/30 ({r['tier']})")
        
        if unmatched > 0:
            print(f"\n" + "="*100)
            print("UNMATCHED RESPONSES - NEEDS MANUAL REVIEW")
            print("="*100)
            
            for r in self.results:
                if not r['matched']:
                    print(f"\n  {r['survey_type']}: {r['survey_business_name']}")
                    print(f"     Score: {r['total_score']}/30 ({r['tier']})")
                    if r.get('best_suggestion'):
                        print(f"     Suggestion: {r['best_suggestion']} ({r['suggestion_confidence']:.2%})")
    
    def save_results(self):
        """Save results to JSON file"""
        
        output_file = f"/Users/alexjeffries/tourism-commons/digital_assessment/survey_scores_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(output_file, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"\n" + "="*100)
        print(f"📁 Results saved to:")
        print(f"   {output_file}")
        print("="*100)
        
        return output_file


def main():
    """Main entry point"""
    processor = SurveyScoreAndMatch()
    processor.process_surveys()


if __name__ == '__main__':
    main()

