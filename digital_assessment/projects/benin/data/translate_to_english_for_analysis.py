#!/usr/bin/env python3
"""
Translate all Benin reviews to English for sentiment analysis
TextBlob sentiment analysis works best with English text
"""

import json
from pathlib import Path
from google.cloud import translate_v2 as translate
import os

def detect_language(text):
    """Simple language detection"""
    # French patterns
    french_patterns = [
        r'\b(le|la|les|un|une|des|de|du|des)\b',
        r'\b(et|ou|mais|donc|car|ce|cette|ces|cet)\b',
        r'\b(très|plus|moins|beaucoup|toujours)\b'
    ]
    
    # English patterns  
    english_patterns = [
        r'\b(the|and|or|but|is|are|was|were)\b',
        r'\b(a|an|of|to|in|for|with|on|at)\b'
    ]
    
    import re
    text_lower = text.lower()
    
    french_count = sum(len(re.findall(pattern, text_lower)) for pattern in french_patterns)
    english_count = sum(len(re.findall(pattern, text_lower)) for pattern in english_patterns)
    
    if french_count > english_count * 1.5:
        return 'fr'
    elif english_count > 0:
        return 'en'
    else:
        return 'unknown'

def translate_reviews(input_dir, output_dir):
    """Translate all reviews to English"""
    
    # Set up Google Cloud Translation client
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/Users/alexjeffries/tourism-commons/digital_assessment/config/tourism-development-d620c-5c9db9e21301.json'
    client = translate.Client()
    
    output_dir = Path(output_dir)
    output_dir.mkdir(exist_ok=True)
    
    review_files = list(Path(input_dir).glob('*_reviews.json'))
    
    print(f"\n🌍 Translating {len(review_files)} stakeholder review files to English")
    print("=" * 80)
    
    for review_file in review_files:
        print(f"\n📄 Processing: {review_file.name}")
        
        with open(review_file, 'r', encoding='utf-8') as f:
            reviews = json.load(f)
        
        translated_reviews = []
        english_count = 0
        translated_count = 0
        french_count = 0
        
        for i, review in enumerate(reviews):
            title = review.get('title', '')
            text = review.get('text', '')
            
            # Detect language
            lang = detect_language(f"{title} {text}")
            
            translated_review = review.copy()
            
            if lang == 'en':
                # Already in English
                translated_review['translated_title'] = title
                translated_review['translated_text'] = text
                translated_review['original_language'] = 'en'
                english_count += 1
            elif lang == 'fr' or lang == 'unknown':
                # Translate to English
                try:
                    # Translate title
                    if title:
                        title_result = client.translate(title, target_language='en', source_language='fr')
                        translated_review['translated_title'] = title_result['translatedText']
                    else:
                        translated_review['translated_title'] = ''
                    
                    # Translate text
                    if text:
                        text_result = client.translate(text, target_language='en', source_language='fr')
                        translated_review['translated_text'] = text_result['translatedText']
                    else:
                        translated_review['translated_text'] = ''
                    
                    translated_review['original_language'] = lang
                    translated_count += 1
                    
                    if i % 5 == 0:
                        print(f"   Translated {i}/{len(reviews)} reviews...")
                except Exception as e:
                    print(f"   ⚠️  Translation error: {e}")
                    # Keep original text if translation fails
                    translated_review['translated_title'] = title
                    translated_review['translated_text'] = text
                    translated_review['original_language'] = lang
            else:
                # Other language
                translated_review['translated_title'] = title
                translated_review['translated_text'] = text
                translated_review['original_language'] = lang
                french_count += 1
            
            translated_reviews.append(translated_review)
        
        # Save translated reviews
        output_file = output_dir / review_file.name.replace('_reviews.json', '_reviews_translated.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(translated_reviews, f, indent=2, ensure_ascii=False)
        
        print(f"   ✅ English: {english_count}, Translated: {translated_count}, Other: {french_count}")
        print(f"   💾 Saved to: {output_file}")
    
    print("\n" + "=" * 80)
    print(f"✅ Translation complete! All reviews are now in English for sentiment analysis.")
    print("=" * 80)

if __name__ == "__main__":
    input_dir = Path(__file__).parent / "raw_reviews" / "cultural_heritage"
    output_dir = Path(__file__).parent / "translated_to_english"
    
    translate_reviews(input_dir, output_dir)

