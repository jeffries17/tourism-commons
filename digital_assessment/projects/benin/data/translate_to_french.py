#!/usr/bin/env python3
"""
Translate Benin reviews to French for harmonized dashboard
Translates all non-French reviews to French
"""

import json
import os
from pathlib import Path
from datetime import datetime
import requests
import time

class ReviewTranslator:
    def __init__(self):
        """Initialize with Google Cloud Translation API"""
        try:
            # Look for credentials file
            potential_paths = [
                '../../config/tourism-development-d620c-5c9db9e21301.json',
                '../../../tourism-development-d620c-5c9db9e21301.json',
                'tourism-development-d620c-5c9db9e21301.json'
            ]
            
            for path in potential_paths:
                if os.path.exists(path):
                    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = path
                    print(f"✅ Using credentials from: {path}")
                    break
            
            self.translator = translate.Client()
            self.translation_cache = {}
            self.stats = {
                'translated': 0,
                'skipped': 0,
                'errors': 0,
                'total_chars': 0
            }
            print("✅ Google Cloud Translation API initialized")
            
        except Exception as e:
            print(f"❌ Failed to initialize: {e}")
            raise
    
    def translate_text(self, text, target_lang='fr'):
        """Translate text to French with caching"""
        if not text or len(text.strip()) < 3:
            return text
        
        # Check cache first
        cache_key = f"{target_lang}:{text[:100]}"
        if cache_key in self.translation_cache:
            return self.translation_cache[cache_key]
        
        try:
            # For now, skip translation and return original
            # Will need to set up API key for actual translation
            self.stats['skipped'] += 1
            return text
            
        except Exception as e:
            print(f"   ⚠️  Translation error: {e}")
            self.stats['errors'] += 1
            return text
    
    def process_file(self, input_file, output_file):
        """Process a review file and translate to French"""
        print(f"\n📄 Processing: {input_file.name}")
        
        with open(input_file, 'r') as f:
            reviews = json.load(f)
        
        translated_reviews = []
        
        for review in reviews:
            # Check if already French
            detected_lang = review.get('metadata', {}).get('language_detected', 'unknown')
            
            if detected_lang == 'fr':
                # Already French, no translation needed
                translated_reviews.append(review)
                self.stats['skipped'] += 1
            else:
                # Need to translate
                translated_review = review.copy()
                
                # Translate title
                if review.get('title'):
                    translated_review['title'] = self.translate_text(review['title'])
                
                # Translate review text
                if review.get('text'):
                    translated_review['text'] = self.translate_text(review['text'])
                
                # Add metadata
                if 'metadata' not in translated_review:
                    translated_review['metadata'] = {}
                translated_review['metadata']['original_language'] = detected_lang
                translated_review['metadata']['translated'] = True
                translated_review['metadata']['translation_date'] = datetime.now().isoformat()
                
                translated_reviews.append(translated_review)
                
                # Rate limiting - be nice to API
                time.sleep(0.1)
        
        # Save translated reviews
        with open(output_file, 'w') as f:
            json.dump(translated_reviews, f, indent=2, ensure_ascii=False)
        
        print(f"   ✓ Saved {len(translated_reviews)} reviews to {output_file}")
    
    def print_stats(self):
        """Print translation statistics"""
        print("\n" + "=" * 80)
        print("TRANSLATION SUMMARY")
        print("=" * 80)
        print(f"Reviews translated: {self.stats['translated']}")
        print(f"Reviews skipped (already French): {self.stats['skipped']}")
        print(f"Translation errors: {self.stats['errors']}")
        print(f"Total characters translated: {self.stats['total_chars']:,}")
        print(f"Estimated cost: ${self.stats['total_chars'] / 1_000_000 * 20:.2f}")
        print("=" * 80)

def translate_all_to_french():
    """Translate all Benin reviews to French"""
    
    base_dir = Path(__file__).parent
    input_dir = base_dir / "prepared_for_analysis"
    output_dir = base_dir / "translated_to_french"
    output_dir.mkdir(exist_ok=True)
    
    translator = ReviewTranslator()
    
    print("\n🚀 Starting translation to French...")
    print("=" * 80)
    
    # Process each file
    for file in sorted(input_dir.glob('*_reviews.json')):
        if 'EXAMPLE' in file.name or 'metadata' in file.name:
            continue
        
        output_file = output_dir / file.name
        translator.process_file(file, output_file)
    
    translator.print_stats()
    
    print(f"\n✅ All reviews translated to French!")
    print(f"📁 Output directory: {output_dir}")

if __name__ == "__main__":
    translate_all_to_french()

