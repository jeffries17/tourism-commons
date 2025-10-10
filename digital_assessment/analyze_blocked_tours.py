#!/usr/bin/env python3
"""Analyze blocked tour texts from the markdown file"""

import re
from ito_ai_analyzer import ITOAnalyzer

def extract_tours_from_file(filepath):
    """Extract individual tours from the blocked text file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split by URLs (tours are separated by URLs at the start of a line)
    url_pattern = r'^https://[^\s]+$'
    tours = []
    
    lines = content.split('\n')
    current_url = None
    current_text = []
    
    for line in lines:
        if re.match(url_pattern, line):
            # Save previous tour if exists
            if current_url and current_text:
                tours.append({
                    'url': current_url,
                    'text': '\n'.join(current_text).strip()
                })
            # Start new tour
            current_url = line.strip()
            current_text = []
        else:
            if current_url:
                current_text.append(line)
    
    # Don't forget the last tour
    if current_url and current_text:
        tours.append({
            'url': current_url,
            'text': '\n'.join(current_text).strip()
        })
    
    return tours

def identify_operator_and_destination(url):
    """Extract operator and destination from URL"""
    operators = {
        'neckermann.be': ('Neckermann Reisen', 'Germany'),
        'intrepidtravel.com': ('Intrepid Travel', 'UK'),
        'oattravel.com': ('Overseas Adventure Travel', 'USA'),
        'responsibletravel.com': ('Responsible Travel', 'UK'),
        'tui.co.uk': ('TUI', 'UK'),
    }
    
    destinations = {
        'gambia': 'Gambia',
        'senegal': 'Senegal',
        'kaapverdie': 'Cape Verde',
        'cape-verde': 'Cape Verde',
        'ghana': 'Ghana',
        'benin': 'Benin',
        'nigeria': 'Nigeria',
        'west-africa': 'Multi-country'
    }
    
    operator = 'Unknown'
    operator_country = 'Unknown'
    destination = 'Unknown'
    
    # Find operator
    for domain, (op_name, op_country) in operators.items():
        if domain in url:
            operator = op_name
            operator_country = op_country
            break
    
    # Find destination
    url_lower = url.lower()
    for keyword, dest in destinations.items():
        if keyword in url_lower:
            destination = dest
            break
    
    return operator, operator_country, destination

def main():
    print("=" * 80)
    print("ANALYZING BLOCKED TOURS")
    print("=" * 80)
    
    # Extract tours from file
    tours = extract_tours_from_file('docs/blocked_ito_text.md')
    print(f"\n📋 Found {len(tours)} blocked tours\n")
    
    # Initialize analyzer
    analyzer = ITOAnalyzer()
    
    results = []
    
    for i, tour in enumerate(tours, 1):
        operator, operator_country, destination = identify_operator_and_destination(tour['url'])
        
        print(f"=" * 80)
        print(f"[{i}/{len(tours)}] {operator} - {destination}")
        print(f"=" * 80)
        print(f"  URL: {tour['url'][:80]}...")
        print(f"  Text length: {len(tour['text'])} characters")
        
        # Analyze
        try:
            analysis = analyzer.analyze_content(
                f"{operator} - {destination}",
                tour['text'],
                destination_country=destination
            )
            
            results.append({
                'operator': operator,
                'operator_country': operator_country,
                'destination': destination,
                'url': tour['url'],
                'analysis': analysis
            })
            
            print(f"  ✅ Analyzed successfully")
            
        except Exception as e:
            print(f"  ❌ Error: {str(e)[:100]}")
            results.append({
                'operator': operator,
                'operator_country': operator_country,
                'destination': destination,
                'url': tour['url'],
                'analysis': None,
                'error': str(e)
            })
    
    # Print summary
    print("\n" + "=" * 80)
    print("ANALYSIS COMPLETE")
    print("=" * 80)
    print(f"\n✅ Successfully analyzed: {sum(1 for r in results if r.get('analysis'))}/{len(results)} tours")
    
    # Print results
    print("\n" + "=" * 80)
    print("RESULTS SUMMARY")
    print("=" * 80)
    
    for result in results:
        if result.get('analysis'):
            analysis = result['analysis']
            print(f"\n{result['operator']} - {result['destination']}")
            print(f"  Creative Score: {analysis.get('creative_score', 0)}/100")
            print(f"  Sentiment: {analysis.get('sentiment', 0):.2f}")
            print(f"  Packaging: {analysis.get('packaging_type', 'Unknown')}")
            print(f"  Is Pure: {'Yes' if analysis.get('destination_percentage', 0) >= 80 else 'No'}")
            
            # Top sector scores
            sector_scores = analysis.get('sector_scores', {})
            top_sectors = sorted(sector_scores.items(), key=lambda x: x[1], reverse=True)[:3]
            if top_sectors:
                print(f"  Top Sectors:")
                for sector, score in top_sectors:
                    if score > 0:
                        print(f"    - {sector.replace('_', ' ').title()}: {score}/10")

if __name__ == '__main__':
    main()

