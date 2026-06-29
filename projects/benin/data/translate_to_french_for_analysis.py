#!/usr/bin/env python3
"""
Translate Benin reviews to French for harmonized analysis
Translates all non-French reviews to French for consistent sentiment analysis
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime
from collections import Counter
import time

# Add sentiment scripts to path
sys.path.insert(0, '../../sentiment/scripts')
from translate_reviews import ReviewTranslator

def translate_benin_to_french():
    """Translate all Benin reviews to French"""
    
    base_dir = Path(__file__).parent
    input_dir = base_dir / "prepared_for_analysis"
    output_dir = base_dir / "sentiment_input"
    output_dir.mkdir(exist_ok=True)
    
    # Initialize translator
    creds_path = '../../config/tourism-development-d620c-5c9db9e21301.json'
    translator = ReviewTranslator(credentials_path=creds_path)
    
    print("\n🚀 Starting translation of Benin reviews to French...")
    print("=" * 80)
    
    # Track overall stats
    overall_stats = {
        'total_reviews': 0,
        'already_french': 0,
        'translated': 0,
        'skipped': 0,
        'languages': Counter(),
        'original_languages': Counter()
    }
    
    # Process each file
    for file in sorted(input_dir.glob('*_reviews.json')):
        if 'EXAMPLE' in file.name or 'metadata' in file.name:
            continue
        
        print(f"\n📄 Processing: {file.name}")
        
        with open(file, 'r') as f:
            reviews = json.load(f)
        
        french_reviews = []
        
        for review in reviews:
            overall_stats['total_reviews'] += 1
            
            # Get language from metadata
            detected_lang = review.get('metadata', {}).get('language_detected', 'unknown')
            overall_stats['original_languages'][detected_lang] += 1
            
            if detected_lang == 'fr':
                # Already French
                french_reviews.append(review)
                overall_stats['already_french'] += 1
            else:
                # Need translation
                translated_review = review.copy()
                
                # Translate title
                if review.get('title'):
                    print(f"   Translating title...", end='\r')
                    translated_review['title'] = translator.translate_text(
                        review['title'], 
                        source_lang=detected_lang,
                        target_lang='fr'
                    )
                    time.sleep(0.1)  # Rate limiting
                
                # Translate review text
                if review.get('text'):
                    print(f"   Translating review text...", end='\r')
                    translated_review['text'] = translator.translate_text(
                        review['text'],
                        source_lang=detected_lang,
                        target_lang='fr'
                    )
                    time.sleep(0.1)  # Rate limiting
                
                # Update metadata
                if 'metadata' not in translated_review:
                    translated_review['metadata'] = {}
                translated_review['metadata']['original_language'] = detected_lang
                translated_review['metadata']['translated_to_french'] = True
                translated_review['metadata']['translation_date'] = datetime.now().isoformat()
                translated_review['metadata']['language_detected'] = 'fr'
                
                french_reviews.append(translated_review)
                overall_stats['translated'] += 1
        
        # Save translated reviews
        output_file = output_dir / file.name
        with open(output_file, 'w') as f:
            json.dump(french_reviews, f, indent=2, ensure_ascii=False)
        
        print(f"   ✓ Saved {len(french_reviews)} reviews")
    
    # Print summary
    print("\n" + "=" * 80)
    print("TRANSLATION SUMMARY")
    print("=" * 80)
    print(f"Total reviews processed: {overall_stats['total_reviews']}")
    print(f"Already French: {overall_stats['already_french']}")
    print(f"Translated to French: {overall_stats['translated']}")
    print(f"\nOriginal languages:")
    for lang, count in overall_stats['original_languages'].most_common():
        pct = (count / overall_stats['total_reviews']) * 100
        print(f"  {lang:>8}: {count:>4} ({pct:>5.1f}%)")
    
    print(f"\n✅ All reviews now in French!")
    print(f"📁 Output directory: {output_dir}")
    
    return output_dir

if __name__ == "__main__":
    output_dir = translate_benin_to_french()
    print(f"\n🎉 Translation complete! Ready for sentiment analysis.")

