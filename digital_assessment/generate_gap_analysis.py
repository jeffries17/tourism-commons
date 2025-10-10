#!/usr/bin/env python3
"""
Gap Analysis - Cross-reference ITO perception vs Gambia's actual creative industry offerings
Identifies misalignments and opportunities for targeted marketing
"""

import json
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from collections import defaultdict


SPREADSHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CI_SHEET = 'CI Assessment'
ITO_DATA_FILE = 'dashboard/public/dashboard_ito_data.json'


def get_sheets_service():
    """Initialize Google Sheets API"""
    SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
    creds = Credentials.from_service_account_file(
        '../tourism-development-d620c-5c9db9e21301.json',
        scopes=SCOPES
    )
    return build('sheets', 'v4', credentials=creds)


def load_gambia_capacity(service):
    """Load Gambia's actual creative industry capacity from CI Assessment"""
    result = service.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=f'{CI_SHEET}!A2:I200'
    ).execute()
    
    rows = result.get('values', [])
    
    # Aggregate by sector
    sector_scores = defaultdict(list)
    
    for row in rows:
        if len(row) < 9:
            continue
        
        sector = row[1] if len(row) > 1 else ''
        if not sector or sector in ['0', 'Tour Operator']:
            continue
        
        # Category scores are in columns D-I (indices 3-8)
        try:
            content = float(row[3]) if len(row) > 3 and row[3] else 0
            platform = float(row[4]) if len(row) > 4 and row[4] else 0
            engagement = float(row[5]) if len(row) > 5 and row[5] else 0
            visual = float(row[6]) if len(row) > 6 and row[6] else 0
            innovation = float(row[7]) if len(row) > 7 and row[7] else 0
            presence = float(row[8]) if len(row) > 8 and row[8] else 0
            
            total = content + platform + engagement + visual + innovation + presence
            sector_scores[sector].append(total)
        except (ValueError, TypeError):
            continue
    
    # Calculate averages
    sector_averages = {}
    for sector, scores in sector_scores.items():
        if scores:
            sector_averages[sector] = round(sum(scores) / len(scores), 1)
    
    return sector_averages


def map_sectors_to_ito():
    """Map CI Assessment sectors to ITO analysis sectors"""
    return {
        'Festivals and cultural events': 'festivals',
        'Crafts and artisan products': 'crafts',
        'Music (artists, production, venues, education)': 'music',
        'Performing and visual arts (dance, fine arts, galleries, photography, theatre)': 'performing_arts',
        'Cultural heritage sites/museums': 'heritage',
        'Fashion & Design (design, production, textiles)': 'fashion',
        'Audiovisual (film, TV, video, photography, animation)': 'audiovisual',
        'Marketing/advertising/publishing': 'publishing'
    }


def generate_gap_analysis(gambia_capacity, ito_visibility):
    """Generate gap analysis comparing supply vs demand"""
    
    sector_mapping = map_sectors_to_ito()
    gap_items = []
    
    for ci_sector, ito_sector in sector_mapping.items():
        # Get Gambia capacity (0-100 scale from CI Assessment)
        capacity = gambia_capacity.get(ci_sector, 0)
        
        # Get ITO visibility (0-10 scale, convert to 0-100)
        visibility = ito_visibility.get(ito_sector, 0) * 10
        
        # Calculate gap
        gap = capacity - visibility
        
        # Determine gap type and recommendation
        if capacity >= 50 and visibility >= 50:
            gap_type = 'Competitive Advantage'
            recommendation = f'Amplify marketing - strong supply meets high demand. Showcase {ci_sector} success stories to ITOs.'
        elif capacity >= 50 and visibility < 50:
            gap_type = 'Hidden Gem'
            recommendation = f'Marketing opportunity - strong local capacity but low ITO visibility. Create targeted campaigns for {ci_sector}.'
        elif capacity < 50 and visibility >= 50:
            gap_type = 'Market Gap'
            recommendation = f'Capacity building needed - ITOs want {ci_sector} but supply is weak. Prioritize development programs.'
        else:
            gap_type = 'Low Priority'
            recommendation = f'Monitor - both supply and demand are low for {ci_sector}. Focus resources elsewhere.'
        
        gap_items.append({
            'sector': ci_sector,
            'ito_sector_key': ito_sector,
            'gambia_capacity': round(capacity, 1),
            'ito_visibility': round(visibility, 1),
            'gap_score': round(gap, 1),
            'gap_type': gap_type,
            'recommendation': recommendation
        })
    
    # Sort by absolute gap (highest priority first)
    gap_items.sort(key=lambda x: abs(x['gap_score']), reverse=True)
    
    return gap_items


def main():
    print("="*80)
    print("GENERATING GAP ANALYSIS")
    print("="*80)
    
    # Load data
    service = get_sheets_service()
    
    print("\n📊 Loading Gambia creative industry capacity...")
    gambia_capacity = load_gambia_capacity(service)
    
    print(f"✅ Loaded capacity scores for {len(gambia_capacity)} sectors")
    for sector, score in sorted(gambia_capacity.items(), key=lambda x: x[1], reverse=True):
        print(f"  {sector:60} - {score}/100")
    
    print("\n📊 Loading ITO visibility data...")
    with open(ITO_DATA_FILE, 'r') as f:
        ito_data = json.load(f)
    
    ito_visibility = {k: v['avg_score'] for k, v in ito_data['sector_analysis'].items()}
    
    print(f"✅ Loaded ITO visibility for {len(ito_visibility)} sectors")
    for sector, score in sorted(ito_visibility.items(), key=lambda x: x[1], reverse=True):
        print(f"  {sector:30} - {score}/10")
    
    print("\n🔍 Generating gap analysis...")
    gap_items = generate_gap_analysis(gambia_capacity, ito_visibility)
    
    # Update dashboard data
    ito_data['gap_analysis'] = {
        'status': 'COMPLETED',
        'description': 'Gap analysis comparing ITO perception vs Gambia actual offerings',
        'generated': ito_data['metadata']['generated'],
        'items': gap_items
    }
    
    # Save updated data
    with open(ITO_DATA_FILE, 'w') as f:
        json.dump(ito_data, f, indent=2)
    
    print(f"\n✅ Gap analysis complete! Updated {ITO_DATA_FILE}")
    
    # Print summary
    print("\n" + "="*80)
    print("GAP ANALYSIS SUMMARY")
    print("="*80)
    
    gap_types = defaultdict(list)
    for item in gap_items:
        gap_types[item['gap_type']].append(item)
    
    for gap_type, items in gap_types.items():
        print(f"\n🎯 {gap_type.upper()} ({len(items)} sectors):")
        for item in items:
            print(f"  • {item['sector']}")
            print(f"    Gambia: {item['gambia_capacity']}/100  |  ITO: {item['ito_visibility']}/100  |  Gap: {item['gap_score']:+.1f}")
            print(f"    → {item['recommendation']}")
    
    print(f"\n💡 KEY INSIGHTS:")
    
    # Hidden gems (high capacity, low visibility)
    hidden = [i for i in gap_items if i['gap_type'] == 'Hidden Gem']
    if hidden:
        print(f"\n  🌟 HIDDEN GEMS - Marketing Opportunities:")
        for item in hidden[:3]:
            print(f"    • {item['sector']}: {item['gambia_capacity']}/100 capacity but only {item['ito_visibility']}/100 ITO visibility")
    
    # Market gaps (low capacity, high visibility)
    gaps = [i for i in gap_items if i['gap_type'] == 'Market Gap']
    if gaps:
        print(f"\n  ⚠️  MARKET GAPS - Development Priorities:")
        for item in gaps[:3]:
            print(f"    • {item['sector']}: ITOs want it ({item['ito_visibility']}/100) but capacity is low ({item['gambia_capacity']}/100)")
    
    # Competitive advantages
    advantages = [i for i in gap_items if i['gap_type'] == 'Competitive Advantage']
    if advantages:
        print(f"\n  🏆 COMPETITIVE ADVANTAGES - Double Down:")
        for item in advantages[:3]:
            print(f"    • {item['sector']}: Strong supply ({item['gambia_capacity']}/100) + Strong demand ({item['ito_visibility']}/100)")
    
    print(f"\n🎯 NEXT STEPS:")
    print(f"  1. Dashboard updated with gap analysis visualizations")
    print(f"  2. Use insights for targeted ITO outreach campaigns")
    print(f"  3. Prioritize capacity building for 'Market Gap' sectors")
    print(f"  4. Create marketing materials for 'Hidden Gem' sectors")


if __name__ == '__main__':
    main()

