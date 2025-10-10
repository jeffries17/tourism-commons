#!/usr/bin/env python3
"""
Generate ITO Dashboard Data - Comprehensive analysis for dashboard visualization
Includes completed sections and placeholders for future analysis
"""

import json
from datetime import datetime
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from collections import defaultdict, Counter


SPREADSHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
SHEET_NAME = 'ITO Tour Analysis'


def get_sheets_service():
    """Initialize Google Sheets API"""
    SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
    creds = Credentials.from_service_account_file(
        '../tourism-development-d620c-5c9db9e21301.json',
        scopes=SCOPES
    )
    return build('sheets', 'v4', credentials=creds)


def load_ito_data(service):
    """Load ITO analysis data from sheet"""
    result = service.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=f'{SHEET_NAME}!A2:AF200'
    ).execute()
    
    rows = result.get('values', [])
    tours = []
    
    for row in rows:
        if len(row) < 8:
            continue
        
        # Skip blocked/insufficient content
        scraping_status = row[5] if len(row) > 5 else ''
        if 'BLOCKED' in scraping_status or 'Manual Screenshot' in scraping_status:
            continue
        
        # Handle word_count parsing
        try:
            word_count = int(row[7]) if len(row) > 7 and row[7] else 0
        except (ValueError, TypeError):
            # Skip rows with invalid word count
            continue
        
        if word_count < 50:
            continue
        
        tour = {
            'operator': row[0],
            'country': row[1],
            'page_type': row[2],
            'page_title': row[3] if len(row) > 3 else '',
            'url': row[4] if len(row) > 4 else '',
            'scraping_status': scraping_status,
            'word_count': word_count,
            'sentiment': float(row[8]) if len(row) > 8 and row[8] else 0,
            'creative_score': float(row[9]) if len(row) > 9 and row[9] else 0,
            'theme1': row[10] if len(row) > 10 else '',
            'theme2': row[11] if len(row) > 11 else '',
            'theme3': row[12] if len(row) > 12 else '',
            'gambia_pct': int(row[13]) if len(row) > 13 and row[13] else 0,
            'packaging': row[14] if len(row) > 14 else '',
            'music': int(row[15]) if len(row) > 15 and row[15] else 0,
            'crafts': int(row[16]) if len(row) > 16 and row[16] else 0,
            'heritage': int(row[17]) if len(row) > 17 and row[17] else 0,
            'fashion': int(row[18]) if len(row) > 18 and row[18] else 0,
            'festivals': int(row[19]) if len(row) > 19 and row[19] else 0,
            'audiovisual': int(row[20]) if len(row) > 20 and row[20] else 0,
            'performing_arts': int(row[21]) if len(row) > 21 and row[21] else 0,
            'publishing': int(row[22]) if len(row) > 22 and row[22] else 0,
        }
        tours.append(tour)
    
    return tours


def generate_overview(tours):
    """Generate overview statistics"""
    if not tours:
        return {}
    
    total_tours = len(tours)
    avg_sentiment = sum(t['sentiment'] for t in tours) / total_tours
    avg_creative_score = sum(t['creative_score'] for t in tours) / total_tours
    
    # Packaging breakdown
    packaging_counts = Counter(t['packaging'] for t in tours)
    
    # Sentiment distribution
    sentiment_distribution = {
        'very_positive': sum(1 for t in tours if t['sentiment'] > 0.4),
        'positive': sum(1 for t in tours if 0.2 < t['sentiment'] <= 0.4),
        'neutral': sum(1 for t in tours if -0.2 <= t['sentiment'] <= 0.2),
        'negative': sum(1 for t in tours if t['sentiment'] < -0.2)
    }
    
    # Top themes
    all_themes = []
    for t in tours:
        if t['theme1']: all_themes.append(t['theme1'])
        if t['theme2']: all_themes.append(t['theme2'])
        if t['theme3']: all_themes.append(t['theme3'])
    theme_counts = Counter(all_themes).most_common(5)
    
    return {
        'total_tours': total_tours,
        'total_operators': len(set(t['operator'] for t in tours)),
        'avg_sentiment': round(avg_sentiment, 2),
        'avg_creative_score': round(avg_creative_score, 1),
        'sentiment_distribution': sentiment_distribution,
        'packaging_breakdown': dict(packaging_counts),
        'top_themes': [{'theme': theme, 'count': count} for theme, count in theme_counts]
    }


def generate_sector_analysis(tours):
    """Analyze creative sector visibility across all tours"""
    sectors = ['heritage', 'crafts', 'music', 'performing_arts', 'festivals', 
               'audiovisual', 'fashion', 'publishing']
    
    sector_stats = {}
    
    for sector in sectors:
        scores = [t[sector] for t in tours]
        non_zero = [s for s in scores if s > 0]
        
        sector_stats[sector] = {
            'avg_score': round(sum(scores) / len(scores), 1),
            'max_score': max(scores),
            'min_score': min(scores),
            'mention_rate': round(len(non_zero) / len(tours) * 100, 1),  # % of tours mentioning
            'avg_when_mentioned': round(sum(non_zero) / len(non_zero), 1) if non_zero else 0,
            'distribution': {
                '0': sum(1 for s in scores if s == 0),
                '1-3': sum(1 for s in scores if 1 <= s <= 3),
                '4-6': sum(1 for s in scores if 4 <= s <= 6),
                '7-9': sum(1 for s in scores if 7 <= s <= 9),
                '10': sum(1 for s in scores if s == 10)
            }
        }
    
    return sector_stats


def generate_operator_rankings(tours):
    """Rank operators by creative tourism score"""
    # Aggregate by operator
    operator_stats = defaultdict(lambda: {
        'tours': [],
        'total_creative_score': 0,
        'total_sentiment': 0,
        'country': ''
    })
    
    for tour in tours:
        op = tour['operator']
        operator_stats[op]['tours'].append(tour)
        operator_stats[op]['total_creative_score'] += tour['creative_score']
        operator_stats[op]['total_sentiment'] += tour['sentiment']
        operator_stats[op]['country'] = tour['country']
    
    # Calculate averages
    rankings = []
    for operator, stats in operator_stats.items():
        num_tours = len(stats['tours'])
        avg_creative = stats['total_creative_score'] / num_tours
        avg_sentiment = stats['total_sentiment'] / num_tours
        
        # Get top sectors
        sector_scores = defaultdict(list)
        for tour in stats['tours']:
            for sector in ['heritage', 'crafts', 'music', 'performing_arts', 
                          'festivals', 'audiovisual', 'fashion', 'publishing']:
                sector_scores[sector].append(tour[sector])
        
        top_sectors = []
        for sector, scores in sector_scores.items():
            avg_score = sum(scores) / len(scores)
            if avg_score >= 3:  # Only include if meaningful presence
                top_sectors.append({
                    'sector': sector,
                    'avg_score': round(avg_score, 1)
                })
        top_sectors.sort(key=lambda x: x['avg_score'], reverse=True)
        
        rankings.append({
            'operator': operator,
            'country': stats['country'],
            'num_tours': num_tours,
            'avg_creative_score': round(avg_creative, 1),
            'avg_sentiment': round(avg_sentiment, 2),
            'top_sectors': top_sectors[:3],
            'sample_urls': [t['url'] for t in stats['tours'][:2]]
        })
    
    # Sort by creative score
    rankings.sort(key=lambda x: x['avg_creative_score'], reverse=True)
    
    return {
        'top_10_champions': rankings[:10],
        'bottom_10': rankings[-10:],
        'all_operators': rankings
    }


def generate_packaging_analysis(tours):
    """Analyze how Gambia is packaged"""
    packaging_groups = defaultdict(list)
    
    for tour in tours:
        packaging_groups[tour['packaging']].append(tour)
    
    analysis = {}
    for pkg_type, pkg_tours in packaging_groups.items():
        if not pkg_tours:
            continue
        
        avg_gambia_pct = sum(t['gambia_pct'] for t in pkg_tours) / len(pkg_tours)
        avg_creative_score = sum(t['creative_score'] for t in pkg_tours) / len(pkg_tours)
        
        analysis[pkg_type] = {
            'count': len(pkg_tours),
            'avg_gambia_percentage': round(avg_gambia_pct, 1),
            'avg_creative_score': round(avg_creative_score, 1),
            'operators': list(set(t['operator'] for t in pkg_tours))[:5]
        }
    
    return analysis


def generate_gap_analysis_placeholder():
    """Placeholder for gap analysis - needs CI Assessment data"""
    return {
        'status': 'PLACEHOLDER',
        'description': 'Gap analysis comparing ITO perception vs Gambia actual offerings',
        'required_data': [
            'CI Assessment sector scores',
            'CI Assessment visual content scores',
            'Cross-reference with ITO sector visibility'
        ],
        'planned_insights': [
            'Sectors Gambia excels at but ITOs don\'t showcase',
            'Sectors ITOs feature but Gambia underdeveloped',
            'Alignment opportunities for marketing',
            'Priority sectors for capacity building'
        ],
        'example_structure': {
            'music': {
                'gambia_capacity': 'TBD',
                'ito_visibility': 2.3,
                'gap_score': 'TBD',
                'recommendation': 'TBD'
            }
        }
    }


def generate_opportunities_matrix_placeholder():
    """Placeholder for digital positioning opportunities matrix"""
    return {
        'status': 'PLACEHOLDER',
        'description': 'Digital positioning opportunities matrix per TOR Output 2',
        'required_analysis': [
            'Competitive advantages (what Gambia does better)',
            'Market gaps (what competitors offer that Gambia doesn\'t)',
            'ITO demand signals (what operators are looking for)',
            'Gambia supply reality (what\'s actually available)'
        ],
        'planned_quadrants': {
            'competitive_advantage': {
                'description': 'Strong supply + High ITO demand',
                'sectors': []
            },
            'hidden_gems': {
                'description': 'Strong supply + Low ITO visibility',
                'sectors': []
            },
            'market_gaps': {
                'description': 'Weak supply + High ITO demand',
                'sectors': []
            },
            'low_priority': {
                'description': 'Weak supply + Low ITO demand',
                'sectors': []
            }
        }
    }


def generate_persona_insights_placeholder():
    """Placeholder for persona development"""
    return {
        'status': 'PLACEHOLDER',
        'description': 'Creative tourism persona development per TOR Output 2',
        'required_analysis': [
            'Deep text analysis of ITO marketing language',
            'Activity patterns by tour type',
            'Price point analysis',
            'Target audience indicators in tour descriptions'
        ],
        'preliminary_insights': {
            'heritage_seekers': {
                'operators': ['Adventure Life', 'Swan Hellenic'],
                'characteristics': 'UNESCO sites, slave trade history, cultural immersion',
                'avg_creative_score': 'TBD'
            },
            'nature_enthusiasts': {
                'operators': ['Wild Birding', 'Wildlife Worldwide'],
                'characteristics': 'Birding, wildlife, eco-tourism',
                'avg_creative_score': 'TBD'
            },
            'beach_vacationers': {
                'operators': ['Apollo', 'TUI', 'Meier\'s Weltreisen'],
                'characteristics': 'Sun, beach, resort-based, minimal cultural',
                'avg_creative_score': 'TBD'
            }
        }
    }


def generate_regional_comparison_placeholder():
    """Placeholder for Senegal/Cape Verde comparison"""
    return {
        'status': 'PLACEHOLDER',
        'description': 'Regional positioning analysis per TOR Output 2',
        'required_analysis': [
            'Senegal mention frequency and context',
            'Cape Verde mention frequency and context',
            'Multi-country package analysis',
            'Time allocation per country in tours'
        ],
        'data_available': {
            'gambia_solo_tours': 'TBD from packaging data',
            'gambia_senegal_tours': 'TBD',
            'gambia_cape_verde_tours': 'TBD',
            'multi_west_africa_tours': 'TBD'
        }
    }


def main():
    print("="*80)
    print("GENERATING ITO DASHBOARD DATA")
    print("="*80)
    
    # Load data
    service = get_sheets_service()
    tours = load_ito_data(service)
    
    print(f"\n✅ Loaded {len(tours)} analyzed tours from sheet")
    
    # Generate sections
    print("\n📊 Generating dashboard sections...")
    
    dashboard_data = {
        'metadata': {
            'generated': datetime.now().isoformat(),
            'total_tours_analyzed': len(tours),
            'data_source': SHEET_NAME,
            'version': '1.0'
        },
        
        # COMPLETED SECTIONS
        'overview': generate_overview(tours),
        'sector_analysis': generate_sector_analysis(tours),
        'operator_rankings': generate_operator_rankings(tours),
        'packaging_analysis': generate_packaging_analysis(tours),
        
        # PLACEHOLDER SECTIONS (for future development)
        'gap_analysis': generate_gap_analysis_placeholder(),
        'opportunities_matrix': generate_opportunities_matrix_placeholder(),
        'persona_insights': generate_persona_insights_placeholder(),
        'regional_comparison': generate_regional_comparison_placeholder()
    }
    
    # Save to JSON
    output_file = 'dashboard/public/dashboard_ito_data.json'
    with open(output_file, 'w') as f:
        json.dump(dashboard_data, f, indent=2)
    
    print(f"\n✅ Dashboard data saved to: {output_file}")
    
    # Print summary
    print("\n" + "="*80)
    print("DASHBOARD DATA SUMMARY")
    print("="*80)
    
    print(f"\n📈 OVERVIEW:")
    print(f"  Total tours: {dashboard_data['overview']['total_tours']}")
    print(f"  Total operators: {dashboard_data['overview']['total_operators']}")
    print(f"  Avg creative score: {dashboard_data['overview']['avg_creative_score']}/100")
    print(f"  Avg sentiment: {dashboard_data['overview']['avg_sentiment']}")
    
    print(f"\n🏆 TOP 3 CREATIVE CHAMPIONS:")
    for i, op in enumerate(dashboard_data['operator_rankings']['top_10_champions'][:3], 1):
        print(f"  {i}. {op['operator']} ({op['country']}): {op['avg_creative_score']}/100")
        if op['top_sectors']:
            sectors_str = ', '.join(f"{s['sector']} ({s['avg_score']})" for s in op['top_sectors'])
            print(f"     Top sectors: {sectors_str}")
    
    print(f"\n🎨 SECTOR VISIBILITY:")
    sector_data = dashboard_data['sector_analysis']
    sorted_sectors = sorted(sector_data.items(), key=lambda x: x[1]['avg_score'], reverse=True)
    for sector, stats in sorted_sectors:
        print(f"  {sector.replace('_', ' ').title():20} - Avg: {stats['avg_score']}/10, Mentioned: {stats['mention_rate']}%")
    
    print(f"\n📦 PACKAGING:")
    for pkg_type, stats in dashboard_data['packaging_analysis'].items():
        print(f"  {pkg_type:30} - {stats['count']} tours, {stats['avg_gambia_percentage']}% Gambia")
    
    print(f"\n⚠️  PLACEHOLDER SECTIONS (to be developed):")
    print(f"  ❏ Gap Analysis - Compare ITO perception vs Gambia reality")
    print(f"  ❏ Opportunities Matrix - Identify competitive advantages & market gaps")
    print(f"  ❏ Persona Insights - Develop creative tourism personas")
    print(f"  ❏ Regional Comparison - Position vs Senegal & Cape Verde")
    
    print(f"\n🎯 NEXT STEPS:")
    print(f"  1. Create React component for ITO dashboard tab")
    print(f"  2. Visualize completed sections (overview, sectors, operators)")
    print(f"  3. Add placeholder UI for future sections")
    print(f"  4. Develop gap analysis (requires CI Assessment cross-reference)")


if __name__ == '__main__':
    main()

