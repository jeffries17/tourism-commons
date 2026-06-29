#!/usr/bin/env python3
"""
Digital Positioning Opportunities Matrix Creator
Connects to existing CI Digital Assessment sheet and creates a new matrix sheet
"""

import os
import json
import csv
from typing import Dict, List, Tuple, Any, Optional
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Configuration
SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDENTIALS_PATH = '/Users/alexjeffries/tourism-commons/tourism-development-d620c-5c9db9e21301.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

class DigitalPositioningMatrix:
    """Creates Digital Positioning Opportunities Matrix from existing assessment data"""
    
    def __init__(self):
        self.service = self._get_sheets_service()
        self.matrix_data = []
        
    def _get_sheets_service(self):
        """Initialize Google Sheets API service"""
        credentials = service_account.Credentials.from_service_account_file(
            CREDENTIALS_PATH, scopes=SCOPES
        )
        service = build('sheets', 'v4', credentials=credentials)
        return service
    
    def read_ci_assessment_data(self):
        """Read data from CI Digital Assessment sheet"""
        print("📊 Reading CI Digital Assessment data...")
        
        try:
            # Read the CI Assessment sheet
            result = self.service.spreadsheets().values().get(
                spreadsheetId=SHEET_ID,
                range='CI Assessment!A1:AN100'  # Adjust range as needed
            ).execute()
            
            rows = result.get('values', [])
            if not rows:
                print("❌ No data found in CI Assessment sheet")
                return []
            
            # Get headers
            headers = rows[0]
            print(f"✅ Found {len(headers)} columns in CI Assessment")
            print(f"📋 Headers: {headers[:10]}...")  # Show first 10 headers
            
            # Process data rows
            ci_data = []
            for i, row in enumerate(rows[1:], start=2):
                if not row or not row[0]:  # Skip empty rows
                    continue
                    
                # Create dictionary from row data
                stakeholder_data = {}
                for j, value in enumerate(row):
                    if j < len(headers):
                        stakeholder_data[headers[j]] = value
                
                ci_data.append(stakeholder_data)
            
            print(f"✅ Processed {len(ci_data)} CI stakeholders")
            return ci_data
            
        except HttpError as e:
            print(f"❌ Error reading CI Assessment: {e}")
            return []
    
    def read_sentiment_data(self):
        """Read comprehensive sentiment data from local CSV file"""
        print("📊 Reading comprehensive sentiment data from local file...")
        
        try:
            sentiment_file = '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/sentiment_analysis_google_sheets.csv'
            
            if not os.path.exists(sentiment_file):
                print(f"❌ Sentiment file not found: {sentiment_file}")
                print("⚠️ Will use TripAdvisor review counts from CI Assessment as fallback")
                return {}
            
            sentiment_data = {}
            with open(sentiment_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    stakeholder_name = row['stakeholder_name']
                    
                    # Convert sentiment score to 0-10 scale
                    # overall_sentiment is typically 0-1, so multiply by 10
                    sentiment_score = float(row['overall_sentiment']) * 10
                    
                    sentiment_data[stakeholder_name] = {
                        'sentiment_score': sentiment_score,
                        'total_reviews': int(row['total_reviews']),
                        'average_rating': float(row['average_rating']),
                        'positive_rate': float(row['positive_rate']),
                        'language_diversity': int(row['language_diversity']),
                        'critical_areas_count': int(row['critical_areas_count']),
                        'management_response_rate': float(row['management_response_rate']),
                        'has_sentiment_data': True
                    }
            
            print(f"✅ Loaded comprehensive sentiment data for {len(sentiment_data)} stakeholders")
            
            # Show sample of sentiment data
            print("📊 Sample sentiment data:")
            for i, (name, data) in enumerate(list(sentiment_data.items())[:3]):
                print(f"  {name}: sentiment={data['sentiment_score']:.2f}, reviews={data['total_reviews']}")
            
            return sentiment_data
            
        except Exception as e:
            print(f"❌ Error reading sentiment data: {e}")
            return {}
    
    def calculate_individual_readiness(self, stakeholder_data):
        """Calculate Individual Digital Readiness (X-axis)"""
        stakeholder_name = stakeholder_data.get('Stakeholder Name', 'Unknown')
        
        # Get external score (0-70 scale) - handle empty strings
        external_score = 0
        try:
            external_score_str = stakeholder_data.get('Adjusted External Score (0-70)', '0')
            if external_score_str and external_score_str.strip():
                external_score = float(external_score_str)
        except (ValueError, TypeError):
            pass
        
        # Get survey score (0-30 scale) if available - handle empty strings
        survey_score = 0
        try:
            survey_score_str = stakeholder_data.get('Survey Total (0-30)', '0')
            if survey_score_str and survey_score_str.strip():
                survey_score = float(survey_score_str)
        except (ValueError, TypeError):
            pass
        
        has_survey = survey_score > 0
        
        # Get combined score (0-100 scale) - handle empty strings
        combined_score = 0
        try:
            combined_score_str = stakeholder_data.get('Combined Score (0-100)', '0')
            if combined_score_str and combined_score_str.strip():
                combined_score = float(combined_score_str)
        except (ValueError, TypeError):
            pass
        
        # Convert to 0-10 scale using combined score
        individual_readiness = (combined_score / 100) * 10  # Normalize to 0-10
        
        return {
            'external_score': external_score,
            'survey_score': survey_score,
            'has_survey': has_survey,
            'combined_score': combined_score,
            'individual_readiness': min(10, max(0, individual_readiness))
        }
    
    def calculate_market_impact(self, stakeholder_data, sentiment_data):
        """Calculate External Market Impact Potential (Y-axis)"""
        stakeholder_name = stakeholder_data.get('Stakeholder Name', '').lower().replace(' ', '_')
        sector = stakeholder_data.get('Sector', '')
        
        # Get comprehensive sentiment data if available
        sentiment_info = sentiment_data.get(stakeholder_name, {})
        has_sentiment = sentiment_info.get('has_sentiment_data', False)
        sentiment_score = sentiment_info.get('sentiment_score', 0)
        
        # If no comprehensive sentiment data, check TripAdvisor review count from CI Assessment
        if not has_sentiment:
            tripadvisor_reviews = stakeholder_data.get('TripAdvisor Reviews', '0')
            try:
                review_count = int(tripadvisor_reviews) if tripadvisor_reviews else 0
                if review_count >= 24:
                    has_sentiment = True
                    # Estimate sentiment score based on review count (simplified)
                    sentiment_score = min(5.0, review_count / 20)  # Rough estimate on 0-10 scale
            except (ValueError, TypeError):
                pass
        
        # Calculate sector regional gap based on actual sector performance
        sector_gaps = {
            'Cultural heritage sites/museums': 0.8,  # High gap - museums behind regionally
            'Crafts and artisan products': 0.6,       # Medium gap - craft markets need development
            'Performing and visual arts': 0.9,        # Very high gap - arts sector needs support
            'Festivals and cultural events': 0.7,    # High gap - events need digital presence
            'Fashion & Design': 0.5,                 # Medium gap - fashion sector developing
            'Audiovisual (film, photography, TV, videography)': 0.3,  # Low gap - already digital
            'Marketing/advertising/publishing': 0.2   # Low gap - already digital
        }
        
        sector_gap = sector_gaps.get(sector, 0.5)  # Default medium gap
        
        # Calculate ITO integration gap based on sector digital readiness
        ito_gaps = {
            'Cultural heritage sites/museums': 0.3,  # Already well integrated with ITO
            'Crafts and artisan products': 0.6,       # Moderate integration gap
            'Performing and visual arts': 0.8,        # High integration gap - needs ITO support
            'Festivals and cultural events': 0.7,     # High integration gap - events need ITO
            'Fashion & Design': 0.4,                  # Medium integration gap
            'Audiovisual (film, photography, TV, videography)': 0.1,  # Already integrated
            'Marketing/advertising/publishing': 0.1   # Already integrated
        }
        
        ito_gap = ito_gaps.get(sector, 0.4)  # Default moderate gap
        
        # Calculate market impact potential using a more realistic formula:
        # Market Impact = Base Sector Potential + Sentiment Bonus + Individual Performance
        # Where each component is weighted appropriately
        
        # Base sector potential (0-4 points) - how much potential the sector has
        base_sector_potential = sector_gap * 4  # Convert 0-1 gap to 0-4 points
        
        # Sentiment bonus (0-2 points) - how well the stakeholder is perceived
        if has_sentiment:
            # Use comprehensive sentiment data
            sentiment_bonus = (sentiment_score / 10) * 2  # Convert 0-10 sentiment to 0-2 bonus
        else:
            # No sentiment data - neutral score
            sentiment_bonus = 1.0
        
        # Individual performance bonus (0-2 points) - based on survey data if available
        individual_performance = 0
        try:
            survey_score = float(stakeholder_data.get('Survey Total (0-30)', 0))
            if survey_score > 0:
                individual_performance = (survey_score / 30) * 2  # Convert 0-30 survey to 0-2 bonus
            else:
                individual_performance = 1.0  # Neutral score if no survey
        except (ValueError, TypeError):
            individual_performance = 1.0
        
        # Calculate final market impact score (0-8 points, then scale to 0-10)
        market_impact = (base_sector_potential + sentiment_bonus + individual_performance) * 1.25
        
        # Ensure it's within 0-10 range
        market_impact = min(10, max(0, market_impact))
        
        return {
            'has_sentiment': has_sentiment,
            'sentiment_score': sentiment_score,
            'sector_gap': sector_gap,
            'ito_gap': ito_gap,
            'market_impact': market_impact
        }
    
    def determine_quadrant(self, individual_readiness, market_impact):
        """Determine which quadrant the stakeholder falls into"""
        # Adjusted thresholds to be more realistic
        if individual_readiness >= 5 and market_impact >= 5:
            return "Scale & Optimize"
        elif individual_readiness < 5 and market_impact >= 5:
            return "Foundation Builders"
        elif individual_readiness >= 5 and market_impact < 5:
            return "Niche Specialists"
        else:
            return "Long-term Development"
    
    def generate_recommendations(self, quadrant, individual_readiness, market_impact, stakeholder_data):
        """Generate recommendations based on quadrant"""
        sector = stakeholder_data.get('Sector', '')
        
        if quadrant == "Quick Wins":
            individual_recs = [
                "Optimize existing digital presence",
                "Enhance social media engagement",
                "Improve website functionality",
                "Add online booking capabilities"
            ]
            external_recs = [
                "Sector-wide digital marketing campaign",
                "ITO content kit development",
                "Regional positioning strategy"
            ]
        elif quadrant == "Strategic Investment":
            individual_recs = [
                "Digital skills training",
                "Basic website development",
                "Social media setup",
                "Online presence creation"
            ]
            external_recs = [
                "Sector development program",
                "Market positioning support",
                "ITO integration assistance"
            ]
        elif quadrant == "Individual Focus":
            individual_recs = [
                "Advanced digital features",
                "E-commerce implementation",
                "Content marketing strategy",
                "Performance optimization"
            ]
            external_recs = [
                "Wait for sector opportunities",
                "Focus on differentiation",
                "Monitor market trends"
            ]
        else:  # Future Consideration
            individual_recs = [
                "Basic digital literacy",
                "Simple online presence",
                "Digital readiness assessment"
            ]
            external_recs = [
                "Long-term sector development",
                "Market education",
                "Infrastructure improvement"
            ]
        
        return {
            'individual': individual_recs,
            'external': external_recs
        }
    
    def create_matrix_sheet(self):
        """Create the Digital Positioning Opportunities Matrix sheet"""
        print("📊 Creating Digital Positioning Opportunities Matrix...")
        
        # Read data
        ci_data = self.read_ci_assessment_data()
        sentiment_data = self.read_sentiment_data()
        
        if not ci_data:
            print("❌ No CI data available to create matrix")
            return
        
        # Prepare matrix data
        matrix_rows = []
        headers = [
            'Stakeholder Name',
            'Sector',
            'Individual Readiness (X-axis)',
            'Market Impact (Y-axis)',
            'Quadrant',
            'Priority Score',
            'Has Survey Data',
            'Has Sentiment Data',
            'External Score',
            'Survey Score',
            'Sentiment Score',
            'Sector Gap',
            'ITO Gap',
            'Individual Recommendations',
            'External Recommendations'
        ]
        
        matrix_rows.append(headers)
        
        for stakeholder_data in ci_data:
            stakeholder_name = stakeholder_data.get('Stakeholder Name', '')
            if not stakeholder_name:
                continue
            
            # Calculate scores
            readiness = self.calculate_individual_readiness(stakeholder_data)
            impact = self.calculate_market_impact(stakeholder_data, sentiment_data)
            
            # Determine quadrant
            quadrant = self.determine_quadrant(
                readiness['individual_readiness'], 
                impact['market_impact']
            )
            
            # Calculate priority score (higher is more urgent)
            priority_score = (readiness['individual_readiness'] + impact['market_impact']) / 2
            
            # Generate recommendations
            recommendations = self.generate_recommendations(
                quadrant, 
                readiness['individual_readiness'], 
                impact['market_impact'],
                stakeholder_data
            )
            
            # Create row
            row = [
                stakeholder_name,
                stakeholder_data.get('Sector', ''),
                round(readiness['individual_readiness'], 2),
                round(impact['market_impact'], 2),
                quadrant,
                round(priority_score, 2),
                'Yes' if readiness['has_survey'] else 'No',
                'Yes' if impact['has_sentiment'] else 'No',
                round(readiness['external_score'], 2),
                round(readiness['survey_score'], 2),
                round(impact['sentiment_score'], 2),
                round(impact['sector_gap'], 2),
                round(impact['ito_gap'], 2),
                '; '.join(recommendations['individual']),
                '; '.join(recommendations['external'])
            ]
            
            matrix_rows.append(row)
        
        # Create new sheet
        try:
            # Check if sheet already exists
            try:
                self.service.spreadsheets().get(
                    spreadsheetId=SHEET_ID,
                    ranges=['Digital Positioning Matrix']
                ).execute()
                print("⚠️ Sheet 'Digital Positioning Matrix' already exists")
                # Clear existing data
                self.service.spreadsheets().values().clear(
                    spreadsheetId=SHEET_ID,
                    range='Digital Positioning Matrix!A:Z'
                ).execute()
            except HttpError:
                # Sheet doesn't exist, create it
                request_body = {
                    'requests': [{
                        'addSheet': {
                            'properties': {
                                'title': 'Digital Positioning Matrix'
                            }
                        }
                    }]
                }
                self.service.spreadsheets().batchUpdate(
                    spreadsheetId=SHEET_ID,
                    body=request_body
                ).execute()
                print("✅ Created new 'Digital Positioning Matrix' sheet")
            
            # Write data to sheet
            self.service.spreadsheets().values().update(
                spreadsheetId=SHEET_ID,
                range='Digital Positioning Matrix!A1',
                valueInputOption='RAW',
                body={'values': matrix_rows}
            ).execute()
            
            print(f"✅ Successfully created matrix with {len(matrix_rows)-1} stakeholders")
            print("📊 Matrix created in 'Digital Positioning Matrix' sheet")
            
            # Print summary
            self.print_matrix_summary(matrix_rows[1:])  # Skip header
            
        except HttpError as e:
            print(f"❌ Error creating matrix sheet: {e}")
    
    def print_matrix_summary(self, matrix_data):
        """Print summary of the matrix results"""
        print("\n📊 DIGITAL POSITIONING OPPORTUNITIES MATRIX SUMMARY")
        print("=" * 60)
        
        # Count by quadrant
        quadrants = {}
        for row in matrix_data:
            quadrant = row[4]  # Quadrant column
            quadrants[quadrant] = quadrants.get(quadrant, 0) + 1
        
        print("\n🎯 QUADRANT DISTRIBUTION:")
        for quadrant, count in quadrants.items():
            print(f"  {quadrant}: {count} stakeholders")
        
        # Top priorities
        print("\n🔥 TOP 10 PRIORITIES (by Priority Score):")
        sorted_data = sorted(matrix_data, key=lambda x: float(x[5]), reverse=True)
        for i, row in enumerate(sorted_data[:10], 1):
            print(f"  {i:2d}. {row[0]} ({row[4]}) - Score: {row[5]}")
        
        # Data availability
        with_survey = sum(1 for row in matrix_data if row[6] == 'Yes')
        with_sentiment = sum(1 for row in matrix_data if row[7] == 'Yes')
        
        print(f"\n📈 DATA AVAILABILITY:")
        print(f"  Stakeholders with survey data: {with_survey}/{len(matrix_data)}")
        print(f"  Stakeholders with sentiment data: {with_sentiment}/{len(matrix_data)}")
        
        print("\n✅ Matrix creation complete! Check the 'Digital Positioning Matrix' sheet in your Google Sheet.")

def main():
    """Main function to create the Digital Positioning Opportunities Matrix"""
    print("🚀 Digital Positioning Opportunities Matrix Creator")
    print("=" * 60)
    
    # Check if credentials file exists
    if not os.path.exists(CREDENTIALS_PATH):
        print(f"❌ Credentials file not found: {CREDENTIALS_PATH}")
        print("Please ensure the Google Sheets credentials file is in the correct location.")
        return
    
    try:
        matrix_creator = DigitalPositioningMatrix()
        matrix_creator.create_matrix_sheet()
        
    except Exception as e:
        print(f"❌ Error creating matrix: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
