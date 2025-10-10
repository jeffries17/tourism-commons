#!/usr/bin/env python3
"""
ITO Regional Competitive Analysis
Analyzes how ITOs position Gambia vs other West African destinations
"""

import json
from collections import Counter, defaultdict
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build

SPREADSHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
SHEET_NAME = 'ITO Tour Analysis'
SERVICE_ACCOUNT_FILE = 'config/tourism-development-d620c-5c9db9e21301.json'

def load_data_from_sheet(service):
    """Load all analyzed tour data from Google Sheet"""
    result = service.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=f'{SHEET_NAME}!A2:AJ500'
    ).execute()
    
    rows = result.get('values', [])
    tours = []
    
    for row_idx, row in enumerate(rows, start=2):
        if len(row) < 10:
            continue
        
        # Skip if not analyzed (no creative score)
        status = row[6] if len(row) > 6 else ''
        if 'Pending' in status or not status:
            continue
        
        # Parse row (matching the column structure)
        tour = {
            'operator': row[0] if len(row) > 0 else '',
            'operator_country': row[1] if len(row) > 1 else '',
            'primary_destination': row[2] if len(row) > 2 else '',
            'countries_covered': row[3] if len(row) > 3 else '',
            'page_type': row[4] if len(row) > 4 else '',
            'url': row[5] if len(row) > 5 else '',
            'status': status,
            'word_count': int(row[7]) if len(row) > 7 and row[7] else 0,
            'sentiment': float(row[8]) if len(row) > 8 and row[8] else 0,
            'creative_score': float(row[9]) if len(row) > 9 and row[9] else 0,
            'theme1': row[10] if len(row) > 10 else '',
            'theme2': row[11] if len(row) > 11 else '',
            'theme3': row[12] if len(row) > 12 else '',
            'destination_pct': float(row[13]) if len(row) > 13 and row[13] else 100,
            'packaging_type': row[14] if len(row) > 14 else '',
            'is_pure': row[15] if len(row) > 15 else '',
            'heritage': float(row[16]) if len(row) > 16 and row[16] else 0,
            'crafts': float(row[18]) if len(row) > 18 and row[18] else 0,
            'music': float(row[20]) if len(row) > 20 and row[20] else 0,
            'performing_arts': float(row[22]) if len(row) > 22 and row[22] else 0,
            'festivals': float(row[24]) if len(row) > 24 and row[24] else 0,
            'audiovisual': float(row[26]) if len(row) > 26 and row[26] else 0,
            'fashion': float(row[28]) if len(row) > 28 and row[28] else 0,
            'publishing': float(row[30]) if len(row) > 30 and row[30] else 0,
        }
        
        tours.append(tour)
    
    return tours

def calculate_summary_stats(tours):
    """Calculate overall summary statistics"""
    operators = set(t['operator'] for t in tours)
    source_markets = set(t['operator_country'] for t in tours if t['operator_country'])
    
    # Count tours vs destination pages
    tour_pages = [t for t in tours if 'Tour' in t['page_type'] or 'Itinerary' in t['page_type']]
    destination_pages = [t for t in tours if 'Destination' in t['page_type']]
    
    # Tours by country
    tours_by_country = Counter(t['primary_destination'] for t in tours)
    
    stats = {
        'total_analyzed': len(tours),
        'unique_operators': len(operators),
        'source_markets': len(source_markets),
        'source_market_list': sorted(list(source_markets)),
        'tour_pages': len(tour_pages),
        'destination_pages': len(destination_pages),
        'tours_by_country': dict(tours_by_country),
        'analysis_date': datetime.now().strftime('%Y-%m-%d')
    }
    
    return stats

def analyze_gambia_standalone(tours):
    """Analyze Gambia tours in isolation"""
    gambia_tours = [t for t in tours if t['primary_destination'] == 'Gambia']
    
    if not gambia_tours:
        return {}
    
    # Basic stats
    avg_creative = sum(t['creative_score'] for t in gambia_tours) / len(gambia_tours)
    avg_sentiment = sum(t['sentiment'] for t in gambia_tours) / len(gambia_tours)
    
    # Sentiment breakdown
    positive = sum(1 for t in gambia_tours if t['sentiment'] > 0.2)
    neutral = sum(1 for t in gambia_tours if -0.2 <= t['sentiment'] <= 0.2)
    negative = sum(1 for t in gambia_tours if t['sentiment'] < -0.2)
    
    # Theme analysis
    themes = []
    for t in gambia_tours:
        if t['theme1']: themes.append(t['theme1'])
        if t['theme2']: themes.append(t['theme2'])
        if t['theme3']: themes.append(t['theme3'])
    theme_counts = Counter(themes)
    
    # Sector scores
    sectors = ['heritage', 'crafts', 'music', 'performing_arts', 'festivals', 
               'audiovisual', 'fashion', 'publishing']
    sector_avgs = {
        sector: sum(t[sector] for t in gambia_tours) / len(gambia_tours)
        for sector in sectors
    }
    
    # Best and worst tours
    sorted_tours = sorted(gambia_tours, key=lambda x: x['creative_score'], reverse=True)
    best_tours = sorted_tours[:5]
    worst_tours = sorted_tours[-5:]
    
    # Pure vs Multi-country
    pure_tours = [t for t in gambia_tours if t['is_pure'] == 'Yes']
    multi_tours = [t for t in gambia_tours if t['is_pure'] == 'No']
    
    return {
        'total_tours': len(gambia_tours),
        'avg_creative_score': round(avg_creative, 1),
        'avg_sentiment': round(avg_sentiment, 2),
        'sentiment_breakdown': {
            'positive': positive,
            'neutral': neutral,
            'negative': negative,
            'positive_pct': round(positive / len(gambia_tours) * 100, 1)
        },
        'top_themes': dict(theme_counts.most_common(10)),
        'sector_averages': {k: round(v, 1) for k, v in sector_avgs.items()},
        'best_tours': [
            {
                'operator': t['operator'],
                'url': t['url'],
                'creative_score': t['creative_score'],
                'page_type': t['page_type']
            } for t in best_tours
        ],
        'worst_tours': [
            {
                'operator': t['operator'],
                'url': t['url'],
                'creative_score': t['creative_score'],
                'page_type': t['page_type']
            } for t in worst_tours
        ],
        'packaging': {
            'pure_count': len(pure_tours),
            'multi_count': len(multi_tours),
            'pure_pct': round(len(pure_tours) / len(gambia_tours) * 100, 1),
            'pure_avg_score': round(sum(t['creative_score'] for t in pure_tours) / len(pure_tours), 1) if pure_tours else 0,
            'multi_avg_score': round(sum(t['creative_score'] for t in multi_tours) / len(multi_tours), 1) if multi_tours else 0
        }
    }

def analyze_regional_comparison(tours):
    """Compare creative scores across all countries"""
    countries = ['Gambia', 'Senegal', 'Ghana', 'Cape Verde', 'Benin', 'Nigeria']
    sectors = ['heritage', 'crafts', 'music', 'performing_arts', 'festivals', 
               'audiovisual', 'fashion', 'publishing']
    
    comparison = {}
    
    for country in countries:
        country_tours = [t for t in tours if t['primary_destination'] == country]
        
        if not country_tours:
            continue
        
        avg_creative = sum(t['creative_score'] for t in country_tours) / len(country_tours)
        avg_sentiment = sum(t['sentiment'] for t in country_tours) / len(country_tours)
        
        sector_avgs = {
            sector: sum(t[sector] for t in country_tours) / len(country_tours)
            for sector in sectors
        }
        
        comparison[country] = {
            'tour_count': len(country_tours),
            'avg_creative_score': round(avg_creative, 1),
            'avg_sentiment': round(avg_sentiment, 2),
            'sector_scores': {k: round(v, 1) for k, v in sector_avgs.items()}
        }
    
    return comparison

def analyze_packaging(tours):
    """Analyze multi-country packaging patterns"""
    gambia_tours = [t for t in tours if t['primary_destination'] == 'Gambia']
    
    # Parse countries mentioned
    co_occurrence = Counter()
    
    for tour in gambia_tours:
        if tour['countries_covered']:
            # Parse format like "Gambia (23), Senegal (12)"
            countries = []
            for part in tour['countries_covered'].split(','):
                part = part.strip()
                if '(' in part:
                    country = part.split('(')[0].strip()
                    countries.append(country)
                else:
                    countries.append(part)
            
            # Count co-occurrences (exclude Gambia itself)
            for country in countries:
                if country and country != 'Gambia':
                    co_occurrence[country] += 1
    
    # Calculate average focus percentage for multi-country tours
    multi_tours = [t for t in gambia_tours if t['is_pure'] == 'No']
    avg_gambia_focus = sum(t['destination_pct'] for t in multi_tours) / len(multi_tours) if multi_tours else 0
    
    return {
        'pure_vs_multi': {
            'pure_count': sum(1 for t in gambia_tours if t['is_pure'] == 'Yes'),
            'multi_count': sum(1 for t in gambia_tours if t['is_pure'] == 'No'),
        },
        'co_occurrence_counts': dict(co_occurrence.most_common()),
        'avg_gambia_focus_in_multi': round(avg_gambia_focus, 1),
        'most_common_combinations': list(co_occurrence.most_common(5))
    }

def analyze_page_type_differences(tours):
    """Compare destination pages vs tour itineraries"""
    tour_pages = [t for t in tours if 'Tour' in t['page_type'] or 'Itinerary' in t['page_type']]
    dest_pages = [t for t in tours if 'Destination' in t['page_type']]
    
    sectors = ['heritage', 'crafts', 'music', 'performing_arts', 'festivals', 
               'audiovisual', 'fashion', 'publishing']
    
    if not tour_pages or not dest_pages:
        return {}
    
    return {
        'tour_itineraries': {
            'count': len(tour_pages),
            'avg_creative_score': round(sum(t['creative_score'] for t in tour_pages) / len(tour_pages), 1),
            'avg_word_count': round(sum(t['word_count'] for t in tour_pages) / len(tour_pages)),
            'avg_sentiment': round(sum(t['sentiment'] for t in tour_pages) / len(tour_pages), 2),
            'sector_averages': {
                sector: round(sum(t[sector] for t in tour_pages) / len(tour_pages), 1)
                for sector in sectors
            }
        },
        'destination_pages': {
            'count': len(dest_pages),
            'avg_creative_score': round(sum(t['creative_score'] for t in dest_pages) / len(dest_pages), 1),
            'avg_word_count': round(sum(t['word_count'] for t in dest_pages) / len(dest_pages)),
            'avg_sentiment': round(sum(t['sentiment'] for t in dest_pages) / len(dest_pages), 2),
            'sector_averages': {
                sector: round(sum(t[sector] for t in dest_pages) / len(dest_pages), 1)
                for sector in sectors
            }
        }
    }

def calculate_gap_analysis(regional_comparison):
    """Calculate gaps between Gambia and competitors"""
    if 'Gambia' not in regional_comparison:
        return {}
    
    gambia_scores = regional_comparison['Gambia']['sector_scores']
    gaps = {}
    
    for country, data in regional_comparison.items():
        if country == 'Gambia':
            continue
        
        country_gaps = {}
        for sector, competitor_score in data['sector_scores'].items():
            gambia_score = gambia_scores.get(sector, 0)
            gap = competitor_score - gambia_score
            country_gaps[sector] = round(gap, 1)
        
        # Overall creative score gap
        overall_gap = data['avg_creative_score'] - regional_comparison['Gambia']['avg_creative_score']
        
        gaps[country] = {
            'overall_gap': round(overall_gap, 1),
            'sector_gaps': country_gaps,
            'biggest_gap_sector': max(country_gaps.items(), key=lambda x: abs(x[1]))[0] if country_gaps else None
        }
    
    return gaps

def analyze_operator_insights(tours):
    """Analyze which operators position creative tourism best"""
    operator_stats = defaultdict(lambda: {
        'tours': [],
        'countries': set()
    })
    
    for tour in tours:
        operator_stats[tour['operator']]['tours'].append(tour)
        operator_stats[tour['operator']]['countries'].add(tour['primary_destination'])
    
    operator_analysis = {}
    
    for operator, data in operator_stats.items():
        tours_list = data['tours']
        avg_creative = sum(t['creative_score'] for t in tours_list) / len(tours_list)
        avg_sentiment = sum(t['sentiment'] for t in tours_list) / len(tours_list)
        
        # Get sample URLs (up to 3)
        sample_urls = [t['url'] for t in tours_list if t.get('url')][:3]
        
        operator_analysis[operator] = {
            'tour_count': len(tours_list),
            'countries_covered': list(data['countries']),
            'avg_creative_score': round(avg_creative, 1),
            'avg_sentiment': round(avg_sentiment, 2),
            'source_country': tours_list[0]['operator_country'] if tours_list else '',
            'sample_urls': sample_urls
        }
    
    # Top operators by creative score
    sorted_operators = sorted(operator_analysis.items(), 
                             key=lambda x: x[1]['avg_creative_score'], 
                             reverse=True)
    
    return {
        'all_operators': operator_analysis,
        'top_10_creative': dict(sorted_operators[:10]),
        'by_source_market': {}  # Can expand this later
    }

def generate_top_tours_global(tours):
    """Generate top 10 tours globally with links"""
    sorted_tours = sorted(tours, key=lambda x: x['creative_score'], reverse=True)
    
    top_tours = []
    for tour in sorted_tours[:10]:
        top_tours.append({
            'rank': len(top_tours) + 1,
            'operator': tour['operator'],
            'destination': tour['primary_destination'],
            'creative_score': tour['creative_score'],
            'sentiment': tour['sentiment'],
            'url': tour['url'],
            'page_type': tour['page_type'],
            'is_pure': tour['is_pure'],
            'top_sectors': {
                'heritage': tour['heritage'],
                'crafts': tour['crafts'],
                'music': tour['music'],
                'performing_arts': tour['performing_arts'],
                'festivals': tour['festivals']
            }
        })
    
    return top_tours

def main():
    print("=" * 80)
    print("ITO REGIONAL COMPETITIVE ANALYSIS")
    print("=" * 80)
    
    # Authenticate
    print("\n📊 Loading data from Google Sheet...")
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE,
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    service = build('sheets', 'v4', credentials=creds)
    
    # Load data
    tours = load_data_from_sheet(service)
    print(f"   Loaded {len(tours)} analyzed tours")
    
    # Generate analyses
    print("\n🔍 Running analyses...")
    
    print("   1. Summary statistics...")
    summary_stats = calculate_summary_stats(tours)
    
    print("   2. Gambia standalone analysis...")
    gambia_analysis = analyze_gambia_standalone(tours)
    
    print("   3. Regional comparison...")
    regional_comparison = analyze_regional_comparison(tours)
    
    print("   4. Multi-country packaging...")
    packaging_analysis = analyze_packaging(tours)
    
    print("   5. Page type comparison...")
    page_type_analysis = analyze_page_type_differences(tours)
    
    print("   6. Gap analysis...")
    gap_analysis = calculate_gap_analysis(regional_comparison)
    
    print("   7. Operator insights...")
    operator_insights = analyze_operator_insights(tours)
    
    print("   8. Top tours globally...")
    top_tours = generate_top_tours_global(tours)
    
    # Compile results
    results = {
        'summary_stats': summary_stats,
        'gambia_standalone': gambia_analysis,
        'regional_comparison': regional_comparison,
        'packaging_analysis': packaging_analysis,
        'page_type_comparison': page_type_analysis,
        'gap_analysis': gap_analysis,
        'operator_insights': operator_insights,
        'top_tours_global': top_tours
    }
    
    # Save to JSON
    output_file = 'outputs/ito_regional_analysis.json'
    print(f"\n💾 Saving results to {output_file}...")
    
    import os
    os.makedirs('outputs', exist_ok=True)
    
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    # Print executive summary
    print("\n" + "=" * 80)
    print("EXECUTIVE SUMMARY")
    print("=" * 80)
    
    print(f"\n📈 Overall Statistics:")
    print(f"   Total Tours Analyzed: {summary_stats['total_analyzed']}")
    print(f"   Unique Operators: {summary_stats['unique_operators']}")
    print(f"   Source Markets: {summary_stats['source_markets']}")
    print(f"   Tour Pages: {summary_stats['tour_pages']}")
    print(f"   Destination Pages: {summary_stats['destination_pages']}")
    
    print(f"\n🇬🇲 Gambia Performance:")
    print(f"   Average Creative Score: {gambia_analysis['avg_creative_score']}/100")
    print(f"   Average Sentiment: {gambia_analysis['avg_sentiment']}")
    print(f"   Positive Sentiment: {gambia_analysis['sentiment_breakdown']['positive_pct']}%")
    print(f"   Pure vs Multi: {gambia_analysis['packaging']['pure_count']} pure, {gambia_analysis['packaging']['multi_count']} multi-country")
    
    print(f"\n🌍 Regional Comparison (Avg Creative Scores):")
    for country, data in sorted(regional_comparison.items(), 
                                key=lambda x: x[1]['avg_creative_score'], 
                                reverse=True):
        print(f"   {country}: {data['avg_creative_score']}/100 ({data['tour_count']} tours)")
    
    print(f"\n🔝 Top Creative Operators:")
    for i, (operator, data) in enumerate(list(operator_insights['top_10_creative'].items())[:5], 1):
        print(f"   {i}. {operator}: {data['avg_creative_score']}/100")
    
    print(f"\n🎯 Biggest Gaps (vs Gambia):")
    for country, data in sorted(gap_analysis.items(), 
                               key=lambda x: x[1]['overall_gap'], 
                               reverse=True)[:3]:
        print(f"   {country}: +{data['overall_gap']} points (worst sector: {data['biggest_gap_sector']})")
    
    print("\n" + "=" * 80)
    print("✅ ANALYSIS COMPLETE")
    print("=" * 80)
    print(f"\nResults saved to: {output_file}")
    print("Ready for dashboard integration!")

if __name__ == '__main__':
    main()

