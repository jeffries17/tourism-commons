#!/usr/bin/env python3
"""
Organize regional TripAdvisor data by country
Split the regional dataset into country-specific folders
"""

import json
import os
from pathlib import Path

# Paths
INPUT_FILE = '../data/sentiment_data/to_be_sorted/regional_ci_dataset_tripadvisor-reviews_2025-10-07_07-32-09-089.json'
OUTPUT_BASE = '../data/sentiment_data/raw_reviews/oct_2025'

def extract_country(place_info):
    """Extract country from place info"""
    addr = place_info.get('address', '').lower()
    location = place_info.get('locationString', '').lower()
    
    # Check address and location
    text = f"{addr} {location}"
    
    if 'nigeria' in text:
        return 'nigeria'
    elif 'senegal' in text:
        return 'senegal'
    elif 'ghana' in text:
        return 'ghana'
    elif 'gambia' in text:
        return 'gambia'
    elif 'cape verde' in text or 'cabo verde' in text:
        return 'cape_verde'
    elif 'benin' in text:
        return 'benin'
    else:
        return 'unknown'

def sanitize_name(name):
    """Convert name to safe folder name"""
    name = name.lower()
    # Remove special characters, keep only alphanumeric and spaces
    name = ''.join(c if c.isalnum() or c.isspace() else ' ' for c in name)
    # Replace spaces with underscores and collapse multiple underscores
    name = '_'.join(name.split())
    return name

def main():
    print("="*80)
    print("ORGANIZING REGIONAL TRIPADVISOR DATA")
    print("="*80)
    
    # Load data
    print(f"\n📂 Loading: {INPUT_FILE}")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"✅ Loaded {len(data)} stakeholders")
    
    # Group by country
    by_country = {}
    unknown_count = 0
    
    for item in data:
        place_info = item['placeInfo']
        country = extract_country(place_info)
        
        if country == 'unknown':
            unknown_count += 1
            print(f"⚠️  Unknown country for: {place_info['name']} - {place_info.get('address', 'No address')}")
            continue
        
        if country not in by_country:
            by_country[country] = []
        
        by_country[country].append(item)
    
    # Print summary
    print(f"\n📊 Distribution:")
    for country, items in sorted(by_country.items(), key=lambda x: len(x[1]), reverse=True):
        print(f"  {country:15} - {len(items)} stakeholders")
    print(f"  {'unknown':15} - {unknown_count} stakeholders")
    
    # Save by country
    print(f"\n💾 Saving to country folders...")
    
    for country, items in by_country.items():
        country_dir = Path(OUTPUT_BASE) / country / 'creative_industries'
        country_dir.mkdir(parents=True, exist_ok=True)
        
        # Save master list for this country
        master_file = country_dir / f'{country}_stakeholders_master.json'
        with open(master_file, 'w', encoding='utf-8') as f:
            json.dump(items, f, indent=2, ensure_ascii=False)
        
        print(f"  ✅ {country}: {len(items)} stakeholders → {master_file}")
        
        # Create individual folders (empty for now - ready for review scraping)
        for item in items:
            place_info = item['placeInfo']
            folder_name = sanitize_name(place_info['name'])
            stakeholder_dir = country_dir / folder_name
            stakeholder_dir.mkdir(parents=True, exist_ok=True)
            
            # Save metadata
            metadata_file = stakeholder_dir / f'{folder_name}_metadata.json'
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(place_info, f, indent=2, ensure_ascii=False)
    
    # Save unknown for review
    if unknown_count > 0:
        unknown_file = Path(OUTPUT_BASE) / 'unknown_country.json'
        unknown_items = [item for item in data if extract_country(item['placeInfo']) == 'unknown']
        with open(unknown_file, 'w', encoding='utf-8') as f:
            json.dump(unknown_items, f, indent=2, ensure_ascii=False)
        print(f"\n⚠️  {unknown_count} items with unknown country saved to: {unknown_file}")
    
    print(f"\n{'='*80}")
    print("ORGANIZATION COMPLETE")
    print(f"{'='*80}")
    print(f"\n📁 Structure created:")
    print(f"  - Master lists by country")
    print(f"  - Individual stakeholder folders")
    print(f"  - Metadata files ready")
    print(f"\n🎯 NEXT STEPS:")
    print(f"  1. Review stakeholder lists by country")
    print(f"  2. Scrape actual reviews for each stakeholder")
    print(f"  3. Translate non-English reviews")
    print(f"  4. Run sentiment analysis")


if __name__ == '__main__':
    main()

