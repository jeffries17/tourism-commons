#!/usr/bin/env python3
"""
Translate all Benin reviews to French for harmonized sentiment analysis
Translates English, Polish, Italian, Portuguese, and German reviews to French
"""

import json
import os
from pathlib import Path
from datetime import datetime
from collections import Counter
import time
import sys

# Add sentiment scripts to path
sentiment_dir = Path(__file__).parent.parent.parent.parent / "sentiment" / "scripts"
sys.path.insert(0, str(sentiment_dir))

from translate_reviews import ReviewTranslator

def translate_benin_to_french():
    """Translate all Benin reviews to French"""
    
    base_dir = Path(__file__).parent
    input_dir = base_dir / "prepared_for_analysis"
    output_dir = base_dir / "translated_to_french"
    output_dir.mkdir(exist_ok=True)
    
    print("\n🚀 Setting up translator...")
    
    # Find credentials
    creds_paths = [
        base_dir.parent.parent.parent / "config" / "tourism-development-d620c-5c9db9e21301.json",
        base_dir.parent.parent.parent.parent / "tourism-development-d620c-5c9db9e21301.json",
        Path("tourism-development-d620c-5c9db9e21301.json")
    ]
    
    creds_path = None
    for path in creds_paths:
        if path.exists():
            creds_path = str(path)
            print(f"✅ Found credentials: {creds_path}")
            break
    
    if not creds_path:
        print("❌ Could not find credentials file")
        print("Looking in:")
        for path in creds_paths:
            print(f"  - {path}")
        return
    
    # Initialize translator
    translator = ReviewTranslator(credentials_path=creds_path)
    
    print(f"\n📁 Reading from: {input_dir}")
    print(f"📁 Writing to: {output_dir}")
    print("=" * 80)
    
    # Track stats
    stats = {
        'total_files': 0,
        'total_reviews': 0,
        'already_french': 0,
        'translated': 0,
        'original_languages': Counter()
    }
    
    # Process each file
    for file in sorted(input_dir.glob('*_reviews.json')):
        if 'EXAMPLE' in file.name or 'metadata' in file.name:
            continue
        
        stats['total_files'] += 1
        print(f"\n📄 {file.name}")
        
        with open(file, 'r') as f:
            reviews = json.load(f)
        
        translated_reviews = []
        
        for review in reviews:
            stats['total_reviews'] += 1
            
            # Get detected language
            detected_lang = review.get('metadata', {}).get('language_detected', 'unknown')
            stats['original_languages'][detected_lang] += 1
            
            if detected_lang == 'fr':
                # Already French - keep as is
                translated_reviews.append(review)
                stats['already_french'] += 1
            else:
                # Need translation
                print(f"   Translating from {detected_lang}...", end='\r')
                
                translated_review = review.copy()
                
                # Translate title
                if review.get('title'):
                    translated_review['title'] = translator.translate_text(
                        review['title'],
                        source_lang=detected_lang if detected_lang != 'unknown' else 'auto',
                        target_lang='fr'
                    )
                    time.sleep(0.2)  # Rate limiting
                
                # Translate review text  
                if review.get('text'):
                    translated_review['text'] = translator.translate_text(
                        review['text'],
                        source_lang=detected_lang if detected_lang != 'unknown' else 'auto',
                        target_lang='fr'
                    )
                    time.sleep(0.2)  # Rate limiting
                
                # Update metadata
                if 'metadata' not in translated_review:
                    translated_review['metadata'] = {}
                
                translated_review['metadata']['original_language'] = detected_lang
                translated_review['metadata']['translated'] = True
                translated_review['metadata']['translated_to_french'] = True
                translated_review['metadata']['translation_date'] = datetime.now().isoformat()
                
                translated_reviews.append(translated_review)
                stats['translated'] += 1
        
        # Save translated file
        output_file = output_dir / file.name
        with open(output_file, 'w') as f:
            json.dump(translated_reviews, f, indent=2, ensure_ascii=False)
        
        print(f"   ✓ Saved {len(translated_reviews)} reviews")
    
    # Print summary
    print("\n" + "=" * 80)
    print("TRANSLATION SUMMARY")
    print("=" * 80)
    print(f"Files processed: {stats['total_files']}")
    print(f"Total reviews: {stats['total_reviews']}")
    print(f"\nReview status:")
    print(f"  Already French: {stats['already_french']} (kept as-is)")
    print(f"  Translated: {stats['translated']}")
    
    print(f"\nOriginal languages:")
    for lang, count in stats['original_languages'].most_common():
        pct = (count / stats['total_reviews']) * 100
        print(f"  {lang:>8}: {count:>4} ({pct:>5.1f}%)")
    
    print("\n✅ All reviews are now in French!")
    print(f"📁 Output directory: {output_dir}")
    print("=" * 80)

if __name__ == "__main__":
    translate_benin_to_french()

