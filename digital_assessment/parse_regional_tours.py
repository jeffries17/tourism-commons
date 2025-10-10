#!/usr/bin/env python3
"""
Parse regional_ito_tour_raw.md and create batch-ready format
"""

import re
from collections import defaultdict

# Operator country mapping from existing ITO data
OPERATOR_COUNTRIES = {
    'Adventure Life': 'USA',
    'African Travel Seminars': 'USA',
    'Apollo': 'Sweden',
    'Birding Ecotours': 'UK',
    'Corendon': 'Netherlands',
    'Explore': 'UK',
    'Firstchoice': 'UK (TUI Group)',
    'First Choice': 'UK (TUI Group)',
    'Fleewinter': 'UK',
    'Hays Travel': 'UK',
    'Holiday Hyper Market': 'UK',
    'Holiday Hypermarket': 'UK',
    'Intrepid Travel': 'UK',
    'Love Holidays': 'UK',
    'Luxotour': 'Spain',
    'Meiers Weltreisen': 'Germany',
    'Meier\'s Weltreisen': 'Germany',
    'Naturetrek': 'UK',
    'Neckermann': 'Germany',
    'Neckermann Reisen': 'Germany',
    'Olympic Holidays': 'Unknown (Greek / Cyprus / UK)',
    'On The Beach': 'UK',
    'Overlanding West Africa': 'UK',
    'OAT Travel': 'USA',
    'Overseas Adventure Travel': 'USA',
    'Palace Travel': 'USA',
    'Responsible Travel': 'UK',
    'Serenity': 'UK',
    'Serenity Holidays': 'UK',
    'Spector Travel': 'USA',
    'Spector Travel Boston': 'USA',
    'Spies': 'Denmark',
    'Spies.dk': 'Denmark',
    'Spies (Globus Danmark)': 'Denmark',
    'Gambia.co.uk': 'UK',
    'The Gambia Experience': 'UK',
    'Thomas Cook': 'UK',
    'Thomas Cook UK': 'UK',
    'Tjareborg': 'Finland',
    'Transafrica': 'West Africa',
    'TransAfrica': 'West Africa',
    'TUI': 'UK',
    'TUI (Netherlands)': 'Netherlands',
    'TUI UK': 'UK',
    'Ving': 'Sweden',
    'Wildlife Worldwide': 'UK',
    'Wild Birding': 'International',
    'World Insight': 'Germany'
}


def normalize_operator_name(name):
    """Normalize operator names for matching"""
    name = name.strip()
    # Handle common variations
    variations = {
        'Firstchoice': 'First Choice',
        'Holiday Hyper Market': 'Holiday Hypermarket',
        'OAT Travel': 'Overseas Adventure Travel',
        'Spector Travel': 'Spector Travel Boston',
        'Spies.dk': 'Spies (Globus Danmark)',
        'Serenity': 'Serenity Holidays',
        'Gambia.co.uk': 'The Gambia Experience',
        'Transafrica': 'TransAfrica',
    }
    return variations.get(name, name)


def classify_page_type(url, note):
    """Determine if URL is destination page or tour"""
    url_lower = url.lower()
    
    # Check note first
    if note and 'parent' in note.lower():
        return 'Destination'
    
    # URL patterns for destination pages
    dest_patterns = [
        r'/destinations?/',
        r'/holidays/[a-z-]+$',
        r'/tour-places/',
        r'/rundreisen/[a-z-]+/?$',
        r'/discover/[a-z-]+$',
        r'-tours/?$',
        r'holiday/location/',
        r'/kap-verde$',
        r'/kapverdie$',
        r'/senegal$',
        r'/ghana$',
        r'/benin/?$',
        r'/nigeria-tours/?$',
        r'/cape-verde$',
        r'/category/[a-z-]+-en/?$'
    ]
    
    for pattern in dest_patterns:
        if re.search(pattern, url_lower):
            return 'Destination'
    
    # Default to Tour
    return 'Tour'


def parse_raw_file(filepath):
    """Parse the raw markdown file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    tours = []
    current_operator = None
    current_destination = None
    
    for line in lines:
        line = line.strip()
        
        if not line:
            continue
        
        # Check if it's a destination header
        if line in ['Benin', 'Cape Verde', 'Ghana', 'Nigeria', 'Senegal', 'Senega']:
            if line == 'Senega':  # Typo in source
                line = 'Senegal'
            current_destination = line
            continue
        
        # Check if it's a URL
        if line.startswith('http'):
            if not current_operator or not current_destination:
                continue
            
            # Split URL and note
            parts = line.split(' - ')
            url = parts[0].strip()
            note = parts[1] if len(parts) > 1 else ''
            
            # Get operator country
            normalized_operator = normalize_operator_name(current_operator)
            operator_country = OPERATOR_COUNTRIES.get(normalized_operator, 'Unknown')
            
            # Classify page type
            page_type = classify_page_type(url, note)
            
            tours.append({
                'operator': normalized_operator,
                'operator_country': operator_country,
                'destination': current_destination,
                'page_type': page_type,
                'url': url,
                'note': note
            })
        else:
            # Assume it's an operator name
            # Check if previous line was a destination (means new operator)
            if current_destination:
                current_operator = line
                current_destination = None
    
    return tours


def deduplicate_tours(tours):
    """Remove duplicate URLs"""
    seen_urls = set()
    unique_tours = []
    duplicates = []
    
    for tour in tours:
        url = tour['url']
        if url not in seen_urls:
            seen_urls.add(url)
            unique_tours.append(tour)
        else:
            duplicates.append(tour)
    
    return unique_tours, duplicates


def main():
    print("="*80)
    print("PARSING REGIONAL TOURS")
    print("="*80)
    print()
    
    # Parse file
    tours = parse_raw_file('/Users/alexjeffries/tourism-commons/digital_assessment/docs/regional_ito_tour_raw.md')
    print(f"✅ Parsed {len(tours)} tour entries")
    
    # Deduplicate
    unique_tours, duplicates = deduplicate_tours(tours)
    print(f"✅ Found {len(unique_tours)} unique tours")
    print(f"⚠️  Removed {len(duplicates)} duplicates")
    print()
    
    # Stats by destination
    by_destination = defaultdict(int)
    for tour in unique_tours:
        by_destination[tour['destination']] += 1
    
    print("Tours by destination:")
    for dest, count in sorted(by_destination.items()):
        print(f"  {dest:15s} {count:3d} tours")
    print()
    
    # Stats by operator
    by_operator = defaultdict(int)
    for tour in unique_tours:
        by_operator[tour['operator']] += 1
    
    print(f"Tours from {len(by_operator)} operators:")
    for operator, count in sorted(by_operator.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  {operator:30s} {count:3d} tours")
    print()
    
    # Create batch file
    output_file = '/Users/alexjeffries/tourism-commons/digital_assessment/regional_tours_batch_ready.txt'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Regional ITO Tours - Batch Import Format\n")
        f.write("# Format: Operator | Country | Destination | Type | URL\n")
        f.write("# Ready to paste into add_regional_tours_batch.py\n")
        f.write("#\n")
        f.write(f"# Total: {len(unique_tours)} unique tours\n")
        f.write("#\n\n")
        
        for tour in unique_tours:
            line = f"{tour['operator']} | {tour['operator_country']} | {tour['destination']} | {tour['page_type']} | {tour['url']}\n"
            f.write(line)
    
    print(f"✅ Batch file created: {output_file}")
    print()
    print("="*80)
    print("READY TO IMPORT")
    print("="*80)
    print()
    print("Next steps:")
    print("1. Review the batch file (optional)")
    print("2. Run: python3 add_regional_tours_batch.py")
    print("3. Copy/paste contents of regional_tours_batch_ready.txt")
    print("4. Or paste directly from below:")
    print()
    print("-"*80)
    print()
    
    # Print first 10 as example
    print("# First 10 tours (example):")
    for i, tour in enumerate(unique_tours[:10], 1):
        print(f"{tour['operator']} | {tour['operator_country']} | {tour['destination']} | {tour['page_type']} | {tour['url']}")
    
    print()
    print(f"... and {len(unique_tours) - 10} more tours")
    print()
    print("-"*80)
    print()
    print(f"📊 SUMMARY:")
    print(f"  • Total unique tours: {len(unique_tours)}")
    print(f"  • Destinations covered: {len(by_destination)}")
    print(f"  • Operators: {len(by_operator)}")
    print(f"  • Destination pages: {sum(1 for t in unique_tours if t['page_type'] == 'Destination')}")
    print(f"  • Tour pages: {sum(1 for t in unique_tours if t['page_type'] == 'Tour')}")
    print()


if __name__ == '__main__':
    main()

