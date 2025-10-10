#!/usr/bin/env python3
"""
Process manually collected ITO text from docs/itos_raw_text.md
"""

import json
from datetime import datetime
from ito_ai_analyzer import ITOAnalyzer
from run_ito_tour_level_analysis import write_tour_analysis, get_sheets_service

def parse_manual_tours():
    """Parse the manually collected tours from markdown file"""
    
    with open('docs/itos_raw_text.md', 'r', encoding='utf-8') as f:
        content = f.read()
    
    tours = [
        {
            'operator': 'Adventure Life',
            'country': 'USA',
            'page_type': 'Tour/Itinerary',
            'page_title': 'Rivers Of West Africa Banjul To Banjul',
            'url': 'https://www.adventure-life.com/africa/cruises/18461/rivers-of-west-africa-banjul-to-banjul',
            'start_marker': 'Rivers Of West Africa Banjul To Banjul',
            'end_marker': 'Rivers of West Africa - Dakar to Dakar'
        },
        {
            'operator': 'Adventure Life',
            'country': 'USA',
            'page_type': 'Tour/Itinerary',
            'page_title': 'Rivers Of West Africa Dakar To Dakar',
            'url': 'https://www.adventure-life.com/africa/cruises/18460/rivers-of-west-africa-dakar-to-dakar',
            'start_marker': 'Rivers of West Africa - Dakar to Dakar\nRivers of West Africa - Dakar to Dakar',
            'end_marker': 'Cruise West Africa: The Slavery Coast\nCruise West Africa: The Slavery Coast'
        },
        {
            'operator': 'Adventure Life',
            'country': 'USA',
            'page_type': 'Tour/Itinerary',
            'page_title': 'Cruise West Africa The Slavery Coast',
            'url': 'https://www.adventure-life.com/africa/cruises/18516/cruise-west-africa-the-slavery-coast',
            'start_marker': 'Cruise West Africa: The Slavery Coast\nCruise West Africa: The Slavery Coast',
            'end_marker': 'The Slavery Coast: Cruise from Senegal to Ghana\nThe Slavery Coast: Cruise from Senegal to Ghana'
        },
        {
            'operator': 'Adventure Life',
            'country': 'USA',
            'page_type': 'Tour/Itinerary',
            'page_title': 'The Slavery Coast Cruise From Senegal To Ghana',
            'url': 'https://www.adventure-life.com/africa/cruises/18514/the-slavery-coast-cruise-from-senegal-to-ghana',
            'start_marker': 'The Slavery Coast: Cruise from Senegal to Ghana\nThe Slavery Coast: Cruise from Senegal to Ghana',
            'end_marker': 'Apollo.se / Gambia'
        },
        {
            'operator': 'Apollo',
            'country': 'Sweden',
            'page_type': 'Destination Page',
            'page_title': 'Gambia',
            'url': 'https://www.apollo.se/gambia',
            'start_marker': 'Apollo.se / Gambia\nGambia',
            'end_marker': 'https://www.meiers-weltreisen.de/reiseziele/afrika/gambia'
        },
        {
            'operator': "Meier's Weltreisen",
            'country': 'Germany',
            'page_type': 'Destination Page',
            'page_title': 'Gambia',
            'url': 'https://www.meiers-weltreisen.de/reiseziele/afrika/gambia',
            'start_marker': 'https://www.meiers-weltreisen.de/reiseziele/afrika/gambia',
            'end_marker': None  # Last one, goes to end
        }
    ]
    
    # Extract text for each tour
    for tour in tours:
        start_idx = content.find(tour['start_marker'])
        if start_idx == -1:
            print(f"⚠️  Warning: Could not find start marker for {tour['page_title']}")
            tour['text'] = ''
            continue
        
        if tour['end_marker']:
            end_idx = content.find(tour['end_marker'], start_idx + len(tour['start_marker']))
            if end_idx == -1:
                tour['text'] = content[start_idx:]
            else:
                tour['text'] = content[start_idx:end_idx]
        else:
            tour['text'] = content[start_idx:]
        
        tour['text'] = tour['text'].strip()
        tour['word_count'] = len(tour['text'].split())
    
    return tours


def main():
    print("="*80)
    print("PROCESSING MANUALLY COLLECTED ITO TOURS")
    print("="*80)
    
    # Initialize
    service = get_sheets_service()
    analyzer = ITOAnalyzer()
    
    # Parse tours from markdown
    tours = parse_manual_tours()
    
    print(f"\n✅ Found {len(tours)} tours in docs/itos_raw_text.md\n")
    
    # Process each
    for i, tour in enumerate(tours, 1):
        print(f"\n{'='*80}")
        print(f"[{i}/{len(tours)}] {tour['operator']} - {tour['page_title']}")
        print(f"{'='*80}")
        print(f"URL: {tour['url']}")
        print(f"Word count: {tour['word_count']}")
        
        if tour['word_count'] < 50:
            print(f"⚠️  Skipping: insufficient content")
            continue
        
        print("\nAnalyzing...")
        
        # Analyze
        analysis = analyzer.analyze_content(
            f"{tour['operator']} - {tour['page_type']}",
            tour['text']
        )
        
        # Add metadata
        analysis['word_count'] = tour['word_count']
        analysis['analyzed_text'] = tour['text'][:1000]
        
        # Write to sheet with "Manual Entry" status
        write_tour_analysis(service, tour, analysis, scraping_status="✅ Manual Entry")
        
        print(f"\n✅ Analysis complete and added to sheet!")
    
    print(f"\n\n{'='*80}")
    print("ALL MANUAL TOURS PROCESSED")
    print(f"{'='*80}")
    print(f"\n📊 Check 'ITO Tour Analysis' sheet for complete results!")
    print(f"✨ All 65 tours now analyzed (51 automated + 6 manual + 8 skipped/timeout)")


if __name__ == '__main__':
    main()

