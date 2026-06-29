#!/usr/bin/env python3
"""
Prepare Benin review data for sentiment analysis
Includes language detection, year tracking, and data preparation
"""

import json
from pathlib import Path
from collections import Counter, defaultdict
import re
from datetime import datetime

def detect_language_enhanced(text):
    """Enhanced language detection"""
    text_lower = text.lower()
    
    # Language patterns with weights
    patterns = {
        'fr': ['le', 'la', 'les', 'un', 'une', 'des', 'très', 'plus', 'moins', 'mais', 'cette', 'avec', 'bien', 'tout', 'être'],
        'en': ['the', 'and', 'or', 'is', 'are', 'was', 'were', 'a', 'an', 'of', 'to', 'in', 'for', 'with', 'this', 'that'],
        'pl': ['i', 'w', 'na', 'z', 'o', 'a', 'do', 'od', 'po', 'jest', 'są', 'bardzo', 'rok', 'lat', 'godzin'],
        'it': ['il', 'la', 'di', 'e', 'un', 'una', 'per', 'con', 'molto', 'bello', 'da', 'del', 'della', 'chi', 'che'],
        'pt': ['o', 'a', 'os', 'as', 'que', 'por', 'para', 'como', 'muito', 'mas', 'não', 'você', 'ele', 'ela', 'com'],
        'de': ['der', 'die', 'das', 'und', 'ist', 'sind', 'auch', 'schön', 'sehr', 'aber', 'mit', 'von', 'für'],
        'es': ['el', 'la', 'los', 'las', 'que', 'por', 'para', 'como', 'muy', 'pero', 'del', 'con', 'todo']
    }
    
    scores = {}
    for lang, keywords in patterns.items():
        score = sum(1 for word in keywords if word in text_lower)
        scores[lang] = score
    
    # Find language with highest score
    best_lang = max(scores, key=scores.get)
    
    # Only return detected language if we have enough confidence
    if scores[best_lang] >= 2:
        return best_lang
    return 'unknown'

def extract_year(date_str):
    """Extract year from date string"""
    if not date_str:
        return None
    
    # Try different date formats
    if '-' in date_str:
        parts = date_str.split('-')
        if parts[0].isdigit():
            year = parts[0]
            if len(year) == 4:
                return year
    
    # Try 4 digit year at start
    match = re.search(r'\b(20\d{2}|19\d{2})\b', date_str)
    if match:
        return match.group(1)
    
    return None

def prepare_benin_data():
    """Prepare Benin data with language and year tracking"""
    
    base_dir = Path(__file__).parent
    input_dir = base_dir / "raw_reviews" / "cultural_heritage"
    output_dir = base_dir / "prepared_for_analysis"
    output_dir.mkdir(exist_ok=True)
    
    all_metadata = {
        'languages': Counter(),
        'years': Counter(),
        'stakeholders': {},
        'total_reviews': 0
    }
    
    print("Processing reviews...")
    print("=" * 80)
    
    # Process each stakeholder file
    for file in sorted(input_dir.glob('*_reviews.json')):
        if 'EXAMPLE' in file.name:
            continue
        
        print(f"\nProcessing: {file.name}")
        
        with open(file, 'r') as f:
            reviews = json.load(f)
        
        stakeholder_name = file.stem.replace('_reviews', '')
        
        # Track metadata
        stakeholder_langs = Counter()
        stakeholder_years = Counter()
        
        processed_reviews = []
        
        for review in reviews:
            # Detect language
            lang = detect_language_enhanced(review['text'])
            stakeholder_langs[lang] += 1
            all_metadata['languages'][lang] += 1
            
            # Extract year
            year = extract_year(review.get('publishedDate', ''))
            if year:
                stakeholder_years[year] += 1
                all_metadata['years'][year] += 1
            
            # Add metadata to review
            review['metadata'] = {
                'language_detected': lang,
                'year': year,
                'needs_translation': lang not in ['en', 'unknown']
            }
            
            processed_reviews.append(review)
            all_metadata['total_reviews'] += 1
        
        # Save processed reviews
        output_file = output_dir / file.name
        with open(output_file, 'w') as f:
            json.dump(processed_reviews, f, indent=2, ensure_ascii=False)
        
        # Store stakeholder metadata
        all_metadata['stakeholders'][stakeholder_name] = {
            'total': len(processed_reviews),
            'languages': dict(stakeholder_langs),
            'years': dict(stakeholder_years)
        }
        
        print(f"  ✓ {len(processed_reviews)} reviews")
        print(f"  ✓ Languages: {dict(stakeholder_langs)}")
    
    # Save metadata
    metadata_file = output_dir / "benin_metadata.json"
    with open(metadata_file, 'w') as f:
        json.dump(all_metadata, f, indent=2, ensure_ascii=False)
    
    # Print summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total Reviews: {all_metadata['total_reviews']}")
    print(f"Total Stakeholders: {len(all_metadata['stakeholders'])}")
    
    print("\nLanguage Distribution:")
    for lang, count in all_metadata['languages'].most_common():
        pct = (count / all_metadata['total_reviews']) * 100
        print(f"  {lang:>8}: {count:>4} ({pct:>5.1f}%)")
    
    print("\nYear Distribution:")
    for year in sorted(all_metadata['years'].keys(), reverse=True)[:10]:
        print(f"  {year}: {all_metadata['years'][year]} reviews")
    
    print(f"\n✅ Prepared data saved to: {output_dir}")
    print(f"✅ Metadata saved to: {metadata_file}")

if __name__ == "__main__":
    prepare_benin_data()

