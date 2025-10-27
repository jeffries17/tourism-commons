#!/usr/bin/env python3
"""
Generate positioning opportunities data for the dashboard
Reads from the Digital Positioning Matrix Google Sheet and creates JSON data
"""

import os
import json
from datetime import datetime
from typing import Dict, List, Any
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Configuration
SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDENTIALS_PATH = '/Users/alexjeffries/tourism-commons/tourism-development-d620c-5c9db9e21301.json'
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
OUTPUT_PATH = '/Users/alexjeffries/tourism-commons/digital_assessment/dashboard/public/positioning_opportunities.json'

def get_sheets_service():
    """Initialize Google Sheets service with credentials"""
    try:
        credentials = service_account.Credentials.from_service_account_file(
            CREDENTIALS_PATH, scopes=SCOPES
        )
        service = build('sheets', 'v4', credentials=credentials)
        print("✅ Successfully connected to Google Sheets")
        return service
    except Exception as e:
        print(f"❌ Error connecting to Google Sheets: {e}")
        return None

def read_positioning_matrix_data(service):
    """Read positioning matrix data from Google Sheets"""
    try:
        range_name = 'Digital Positioning Matrix!A1:Z100'
        result = service.spreadsheets().values().get(
            spreadsheetId=SHEET_ID, range=range_name
        ).execute()
        
        values = result.get('values', [])
        if not values:
            print("❌ No data found in Digital Positioning Matrix sheet")
            return []
        
        # First row contains headers
        headers = values[0]
        print(f"📊 Found {len(headers)} columns in Positioning Matrix")
        
        # Process data rows
        positioning_data = []
        for row in values[1:]:
            if not row or not row[0]:  # Skip empty rows
                continue
            
            # Create dictionary from row data
            stakeholder_data = {}
            for j, value in enumerate(row):
                if j < len(headers):
                    stakeholder_data[headers[j]] = value
            
            positioning_data.append(stakeholder_data)
        
        print(f"✅ Processed {len(positioning_data)} stakeholders from Positioning Matrix")
        return positioning_data
        
    except Exception as e:
        print(f"❌ Error reading Positioning Matrix data: {e}")
        return []

def convert_to_dashboard_format(positioning_data):
    """Convert positioning data to dashboard format"""
    dashboard_data = []
    
    for stakeholder in positioning_data:
        try:
            # Convert string values to appropriate types
            dashboard_item = {
                'stakeholder_name': stakeholder.get('Stakeholder Name', ''),
                'sector': stakeholder.get('Sector', ''),
                'individual_readiness': float(stakeholder.get('Individual Readiness (X-axis)', 0)),
                'market_impact': float(stakeholder.get('Market Impact (Y-axis)', 0)),
                'quadrant': stakeholder.get('Quadrant', ''),
                'priority_score': float(stakeholder.get('Priority Score', 0)),
                'has_survey_data': stakeholder.get('Has Survey Data', 'No') == 'Yes',
                'has_sentiment_data': stakeholder.get('Has Sentiment Data', 'No') == 'Yes',
                'external_score': float(stakeholder.get('External Score', 0)),
                'survey_score': float(stakeholder.get('Survey Score', 0)),
                'sentiment_score': float(stakeholder.get('Sentiment Score', 0)),
                'sector_gap': float(stakeholder.get('Sector Gap', 0)),
                'ito_gap': float(stakeholder.get('ITO Gap', 0)),
                'individual_recommendations': stakeholder.get('Individual Recommendations', ''),
                'external_recommendations': stakeholder.get('External Recommendations', '')
            }
            
            dashboard_data.append(dashboard_item)
            
        except (ValueError, TypeError) as e:
            print(f"⚠️ Error processing stakeholder {stakeholder.get('Stakeholder Name', 'Unknown')}: {e}")
            continue
    
    return dashboard_data

def generate_summary_stats(dashboard_data):
    """Generate summary statistics for the dashboard"""
    if not dashboard_data:
        return {}
    
    # Count by quadrant
    quadrant_counts = {}
    for item in dashboard_data:
        quadrant = item['quadrant']
        quadrant_counts[quadrant] = quadrant_counts.get(quadrant, 0) + 1
    
    # Count by sector
    sector_counts = {}
    for item in dashboard_data:
        sector = item['sector']
        sector_counts[sector] = sector_counts.get(sector, 0) + 1
    
    # Data availability
    with_survey = sum(1 for item in dashboard_data if item['has_survey_data'])
    with_sentiment = sum(1 for item in dashboard_data if item['has_sentiment_data'])
    
    # Average scores
    avg_readiness = sum(item['individual_readiness'] for item in dashboard_data) / len(dashboard_data)
    avg_market_impact = sum(item['market_impact'] for item in dashboard_data) / len(dashboard_data)
    avg_priority = sum(item['priority_score'] for item in dashboard_data) / len(dashboard_data)
    
    return {
        'total_stakeholders': len(dashboard_data),
        'quadrant_distribution': quadrant_counts,
        'sector_distribution': sector_counts,
        'data_availability': {
            'with_survey': with_survey,
            'with_sentiment': with_sentiment,
            'survey_percentage': (with_survey / len(dashboard_data)) * 100,
            'sentiment_percentage': (with_sentiment / len(dashboard_data)) * 100
        },
        'average_scores': {
            'individual_readiness': round(avg_readiness, 2),
            'market_impact': round(avg_market_impact, 2),
            'priority_score': round(avg_priority, 2)
        }
    }

def main():
    """Main function to generate positioning dashboard data"""
    print("🚀 Generating Positioning Opportunities Dashboard Data")
    print("=" * 60)
    
    # Check if credentials file exists
    if not os.path.exists(CREDENTIALS_PATH):
        print(f"❌ Credentials file not found: {CREDENTIALS_PATH}")
        return
    
    try:
        # Initialize Google Sheets service
        service = get_sheets_service()
        if not service:
            return
        
        # Read positioning matrix data
        positioning_data = read_positioning_matrix_data(service)
        if not positioning_data:
            print("❌ No positioning data available")
            return
        
        # Convert to dashboard format
        dashboard_data = convert_to_dashboard_format(positioning_data)
        if not dashboard_data:
            print("❌ No valid dashboard data generated")
            return
        
        # Generate summary statistics
        summary_stats = generate_summary_stats(dashboard_data)
        
        # Create final output
        output_data = {
            'stakeholders': dashboard_data,
            'summary': summary_stats,
            'generated_at': datetime.now().isoformat(),
            'data_source': 'Digital Positioning Matrix Google Sheet'
        }
        
        # Write to JSON file
        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
        with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Successfully generated positioning dashboard data")
        print(f"📁 Output file: {OUTPUT_PATH}")
        print(f"📊 Total stakeholders: {len(dashboard_data)}")
        print(f"📈 Quadrant distribution: {summary_stats['quadrant_distribution']}")
        print(f"📈 Data availability: {summary_stats['data_availability']['with_survey']} survey, {summary_stats['data_availability']['with_sentiment']} sentiment")
        
    except Exception as e:
        print(f"❌ Error generating positioning dashboard data: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
