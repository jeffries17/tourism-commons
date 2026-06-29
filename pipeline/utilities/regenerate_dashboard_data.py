#!/usr/bin/env python3
"""
Regenerate dashboard_region_data.json from Regional Assessment sheet
This script reads the updated Regional Assessment data (without Music entries)
and regenerates the dashboard data files.
"""

import os
import sys
import json
from datetime import datetime
from collections import defaultdict

# Add the digital_assessment directory to the path
sys.path.append('digital_assessment')

from google.oauth2 import service_account
from googleapiclient.discovery import build

def get_sheets_service():
    """Initialize Google Sheets API service"""
    credentials_path = '/Users/alexjeffries/tourism-commons/tourism-development-d620c-5c9db9e21301.json'
    credentials = service_account.Credentials.from_service_account_file(
        credentials_path,
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    return build('sheets', 'v4', credentials=credentials)

def load_regional_data(service):
    """Load data from Regional Assessment sheet"""
    spreadsheet_id = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
    
    # Read the entire Regional Assessment sheet
    range_name = 'Regional Assessment!A:Z'
    result = service.spreadsheets().values().get(
        spreadsheetId=spreadsheet_id,
        range=range_name
    ).execute()
    
    values = result.get('values', [])
    if not values:
        return []
    
    headers = values[0]
    data_rows = values[1:]
    
    # Find column indices
    name_col = headers.index('Stakeholder Name')
    sector_col = headers.index('Sector')
    country_col = headers.index('Country')
    social_col = headers.index('Social Media Score')
    website_col = headers.index('Website Score')
    visual_col = headers.index('Visual Content Score')
    discover_col = headers.index('Discoverability Score')
    sales_col = headers.index('Digital Sales Score')
    platform_col = headers.index('Platform Integration Score')
    total_col = headers.index('Total Score')
    
    # Parse data
    stakeholders = []
    for row in data_rows:
        if len(row) > max(total_col, sector_col, country_col):
            try:
                stakeholder = {
                    'name': row[name_col] if len(row) > name_col else 'Unknown',
                    'sector': row[sector_col] if len(row) > sector_col else 'Unknown',
                    'country': row[country_col] if len(row) > country_col else 'Unknown',
                    'social_media_score': int(row[social_col]) if len(row) > social_col and row[social_col] else 0,
                    'website_score': int(row[website_col]) if len(row) > website_col and row[website_col] else 0,
                    'visual_content_score': int(row[visual_col]) if len(row) > visual_col and row[visual_col] else 0,
                    'discoverability_score': int(row[discover_col]) if len(row) > discover_col and row[discover_col] else 0,
                    'digital_sales_score': int(row[sales_col]) if len(row) > sales_col and row[sales_col] else 0,
                    'platform_integration_score': int(row[platform_col]) if len(row) > platform_col and row[platform_col] else 0,
                    'total_score': int(row[total_col]) if len(row) > total_col and row[total_col] else 0
                }
                stakeholders.append(stakeholder)
            except (ValueError, IndexError):
                continue
    
    return stakeholders

def load_gambia_data(service):
    """Load Gambia data from CI Assessment sheet"""
    spreadsheet_id = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
    
    # Read the CI Assessment sheet
    range_name = 'CI Assessment!A:Z'
    result = service.spreadsheets().values().get(
        spreadsheetId=spreadsheet_id,
        range=range_name
    ).execute()
    
    values = result.get('values', [])
    if not values:
        return []
    
    headers = values[0]
    data_rows = values[1:]
    
    # Find column indices
    name_col = headers.index('Stakeholder Name')
    sector_col = headers.index('Sector')
    # CI Assessment uses "Adjusted External Score" as the total
    total_col = headers.index('Adjusted External Score (0-70)')
    
    # Parse data - all entries are from The Gambia
    stakeholders = []
    for row in data_rows:
        if len(row) > max(total_col, sector_col):
            try:
                stakeholder = {
                    'name': row[name_col] if len(row) > name_col else 'Unknown',
                    'sector': row[sector_col] if len(row) > sector_col else 'Unknown',
                    'country': 'The Gambia',  # All CI Assessment entries are from Gambia
                    'social_media_score': 0,  # We don't have individual scores from CI Assessment
                    'website_score': 0,
                    'visual_content_score': 0,
                    'discoverability_score': 0,
                    'digital_sales_score': 0,
                    'platform_integration_score': 0,
                    'total_score': float(row[total_col]) if len(row) > total_col and row[total_col] else 0
                }
                stakeholders.append(stakeholder)
            except (ValueError, IndexError):
                continue
    
    return stakeholders

def generate_dashboard_data(regional_stakeholders, gambia_stakeholders):
    """Generate dashboard data structure"""
    
    # Combine regional and Gambia data
    all_stakeholders = regional_stakeholders + gambia_stakeholders
    
    # Filter out Music sector entries
    filtered_stakeholders = [s for s in all_stakeholders if s['sector'] != 'Music (artists, production, venues, education)']
    
    print(f"📊 Loaded {len(regional_stakeholders)} regional stakeholders")
    print(f"📊 Loaded {len(gambia_stakeholders)} Gambia stakeholders")
    print(f"🎵 Removed {len(all_stakeholders) - len(filtered_stakeholders)} Music entries")
    print(f"✅ Processing {len(filtered_stakeholders)} total stakeholders")
    
    # Group by country
    by_country = defaultdict(list)
    for s in filtered_stakeholders:
        by_country[s['country']].append(s)
    
    # Group by sector
    by_sector = defaultdict(list)
    for s in filtered_stakeholders:
        by_sector[s['sector']].append(s)
    
    # Calculate country rankings
    country_rankings = []
    for country, country_stakeholders in by_country.items():
        if country_stakeholders:
            avg_score = sum(s['total_score'] for s in country_stakeholders) / len(country_stakeholders)
            country_rankings.append({
                'country': country,
                'avg_score': round(avg_score, 2),
                'entity_count': len(country_stakeholders)
            })
    
    # Sort by average score
    country_rankings.sort(key=lambda x: x['avg_score'], reverse=True)
    
    # Calculate sector comparison (Gambia vs Regional)
    sector_comparison = []
    for sector, sector_stakeholders in by_sector.items():
        if sector_stakeholders:
            # Calculate regional average
            regional_avg = sum(s['total_score'] for s in sector_stakeholders) / len(sector_stakeholders)
            
            # Check if Gambia has entries in this sector
            gambia_stakeholders = [s for s in sector_stakeholders if s['country'] == 'The Gambia']
            if gambia_stakeholders:
                gambia_avg = sum(s['total_score'] for s in gambia_stakeholders) / len(gambia_stakeholders)
                gap = gambia_avg - regional_avg
            else:
                gambia_avg = 0
                gap = -regional_avg
            
            sector_comparison.append({
                'sector': sector,
                'gambia_avg': gambia_avg,
                'gambia_count': len(gambia_stakeholders),
                'regional_avg': round(regional_avg, 2),
                'regional_count': len(sector_stakeholders),
                'gap': round(gap, 2)
            })
    
    # Sort by gap (worst gaps first)
    sector_comparison.sort(key=lambda x: x['gap'])
    
    # Generate category leaders (top performers in each category)
    category_leaders = {}
    
    # Social Media leaders
    social_leaders = sorted(filtered_stakeholders, key=lambda x: x['social_media_score'], reverse=True)[:5]
    category_leaders['social_media'] = {
        'regional': [{'name': s['name'], 'country': s['country'], 'score': s['social_media_score']} for s in social_leaders]
    }
    
    # Website leaders
    website_leaders = sorted(filtered_stakeholders, key=lambda x: x['website_score'], reverse=True)[:5]
    category_leaders['website'] = {
        'regional': [{'name': s['name'], 'country': s['country'], 'score': s['website_score']} for s in website_leaders]
    }
    
    # Visual Content leaders
    visual_leaders = sorted(filtered_stakeholders, key=lambda x: x['visual_content_score'], reverse=True)[:5]
    category_leaders['visual_content'] = {
        'regional': [{'name': s['name'], 'country': s['country'], 'score': s['visual_content_score']} for s in visual_leaders]
    }
    
    # Generate sector analysis
    sector_analysis = []
    for sector, sector_stakeholders in by_sector.items():
        if sector_stakeholders:
            # Get top 3 performers
            top_3 = sorted(sector_stakeholders, key=lambda x: x['total_score'], reverse=True)[:3]
            
            # Calculate averages
            avg_social = sum(s['social_media_score'] for s in sector_stakeholders) / len(sector_stakeholders)
            avg_website = sum(s['website_score'] for s in sector_stakeholders) / len(sector_stakeholders)
            avg_visual = sum(s['visual_content_score'] for s in sector_stakeholders) / len(sector_stakeholders)
            
            # Check Gambia performance
            gambia_stakeholders = [s for s in sector_stakeholders if s['country'] == 'The Gambia']
            gambia_avg = sum(s['total_score'] for s in gambia_stakeholders) / len(gambia_stakeholders) if gambia_stakeholders else None
            
            sector_analysis.append({
                'sector': sector,
                'regional_avg': round(sum(s['total_score'] for s in sector_stakeholders) / len(sector_stakeholders), 1),
                'gambia_avg': round(gambia_avg, 1) if gambia_avg else None,
                'gap': round(gambia_avg - sum(s['total_score'] for s in sector_stakeholders) / len(sector_stakeholders), 1) if gambia_avg else None,
                'gambia_rank': None,  # Could be calculated if needed
                'gambia_count': len(gambia_stakeholders),
                'regional_count': len(sector_stakeholders),
                'top_3': [{'name': s['name'], 'country': s['country'], 'score': s['total_score']} for s in top_3],
                'success_patterns': {
                    'avg_social_media': round(avg_social, 1),
                    'avg_website': round(avg_website, 1),
                    'avg_visual_content': round(avg_visual, 1)
                }
            })
    
    # Build final dashboard data
    dashboard_data = {
        'metadata': {
            'generated': datetime.now().isoformat(),
            'total_stakeholders': len(filtered_stakeholders),
            'countries_analyzed': len(by_country),
            'sectors_analyzed': len(by_sector),
            'music_entries_removed': len(all_stakeholders) - len(filtered_stakeholders)
        },
        'country_rankings': country_rankings,
        'sector_comparison': sector_comparison,
        'category_leaders': category_leaders,
        'sector_analysis': sector_analysis
    }
    
    return dashboard_data

def main():
    print("=" * 80)
    print("REGENERATING DASHBOARD DATA (WITHOUT MUSIC SECTOR)")
    print("=" * 80)
    
    # Initialize Google Sheets service
    print("\n📊 Connecting to Google Sheets...")
    service = get_sheets_service()
    
    # Load regional data
    print("📋 Loading Regional Assessment data...")
    regional_stakeholders = load_regional_data(service)
    
    # Load Gambia data
    print("📋 Loading CI Assessment (Gambia) data...")
    gambia_stakeholders = load_gambia_data(service)
    
    if not regional_stakeholders and not gambia_stakeholders:
        print("❌ No data found in either sheet")
        return
    
    # Generate dashboard data
    print("🔄 Generating dashboard data...")
    dashboard_data = generate_dashboard_data(regional_stakeholders, gambia_stakeholders)
    
    # Save to both locations
    output_files = [
        'dashboard/public/data/dashboard_region_data.json',
        'data/dashboard_region_data.json'
    ]
    
    for output_file in output_files:
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(dashboard_data, f, indent=2, ensure_ascii=False)
        print(f"✅ Saved: {output_file}")
    
    # Print summary
    print("\n" + "=" * 80)
    print("DASHBOARD DATA SUMMARY")
    print("=" * 80)
    
    print(f"\n📊 OVERVIEW:")
    print(f"  Total stakeholders: {dashboard_data['metadata']['total_stakeholders']}")
    print(f"  Countries analyzed: {dashboard_data['metadata']['countries_analyzed']}")
    print(f"  Sectors analyzed: {dashboard_data['metadata']['sectors_analyzed']}")
    print(f"  Music entries removed: {dashboard_data['metadata']['music_entries_removed']}")
    
    print(f"\n🏆 TOP 3 COUNTRIES:")
    for i, country in enumerate(dashboard_data['country_rankings'][:3], 1):
        print(f"  {i}. {country['country']} - {country['avg_score']}/50 (avg)")
    
    print(f"\n📈 SECTOR COMPARISON (Gambia vs Regional):")
    for sector in dashboard_data['sector_comparison']:
        gap_icon = "📈" if sector['gap'] > 0 else "📉" if sector['gap'] < 0 else "➡️"
        print(f"  {gap_icon} {sector['sector']}: {sector['gambia_avg']} vs {sector['regional_avg']} (gap: {sector['gap']})")
    
    print(f"\n✅ Dashboard data regenerated successfully!")
    print(f"🎵 Music sector entries have been removed from all analysis")

if __name__ == '__main__':
    main()
