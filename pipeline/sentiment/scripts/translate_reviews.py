#!/usr/bin/env python3
"""
Translation pipeline for review data
Creates English-only versions of review files for sentiment analysis
"""

import json
import os
import re
from datetime import datetime
from google.cloud import translate_v2 as translate
import time

class ReviewTranslator:
    def __init__(self, credentials_path=None):
        """Initialize with Google Cloud Translation API"""
        try:
            if credentials_path and os.path.exists(credentials_path):
                # Use specific credentials file
                os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path
            elif 'GOOGLE_APPLICATION_CREDENTIALS' in os.environ:
                # Use existing environment variable
                pass
            else:
                # Try to find credentials file in project
                potential_paths = [
                    '../tourism-development-d620c-5c9db9e21301.json',
                    '../../tourism-development-d620c-5c9db9e21301.json',
                    'tourism-development-d620c-5c9db9e21301.json'
                ]
                for path in potential_paths:
                    if os.path.exists(path):
                        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = path
                        break
            
            self.translator = translate.Client()
            self.translation_cache = {}
            print("✅ Google Cloud Translation API initialized")
            
        except Exception as e:
            print(f"❌ Failed to initialize Google Cloud Translation API: {e}")
            print("Please ensure you have:")
            print("1. Google Cloud credentials file")
            print("2. Translation API enabled in your project")
            print("3. GOOGLE_APPLICATION_CREDENTIALS environment variable set")
            raise
        
    def detect_language(self, text):
        """Enhanced language detection with regex patterns"""
        text_lower = text.lower()
        
        # Dutch patterns
        dutch_patterns = [
            r'\b(de|het|een|van|op|in|met|voor|aan|door|over|onder|tussen|naar|uit|om|bij|zonder)\b',
            r'\b(was|waren|heeft|hebben|zijn|wordt|worden|kan|kunnen|zal|zullen)\b',
            r'\b(zeer|heel|erg|veel|meer|meest|beste|goede|slechte)\b'
        ]
        
        # French patterns
        french_patterns = [
            r'\b(le|la|les|un|une|des|de|du|des|à|au|aux|en|avec|pour|sur|dans)\b',
            r'\b(était|étaient|est|sont|sera|seront|peut|peuvent|très|bien|bon|mauvais)\b'
        ]
        
        # German patterns
        german_patterns = [
            r'\b(der|die|das|ein|eine|einen|eines|und|oder|aber|mit|von|zu|auf|in|für)\b',
            r'\b(war|waren|ist|sind|wird|werden|kann|können|sehr|gut|schlecht)\b'
        ]
        
        # Spanish patterns
        spanish_patterns = [
            r'\b(el|la|los|las|un|una|de|del|en|con|por|para|sobre|muy|bueno|malo)\b'
        ]
        
        # Count matches
        dutch_score = sum(len(re.findall(pattern, text_lower)) for pattern in dutch_patterns)
        french_score = sum(len(re.findall(pattern, text_lower)) for pattern in french_patterns)
        german_score = sum(len(re.findall(pattern, text_lower)) for pattern in german_patterns)
        spanish_score = sum(len(re.findall(pattern, text_lower)) for pattern in spanish_patterns)
        
        # Return language with highest score
        scores = {'nl': dutch_score, 'fr': french_score, 'de': german_score, 'es': spanish_score}
        detected_lang = max(scores, key=scores.get)
        
        # Only return detected language if score is significant
        if scores[detected_lang] > 2:
            return detected_lang
        else:
            return 'en'  # Default to English if unclear
    
    def translate_text(self, text, source_lang='auto', target_lang='en'):
        """Translate text using Google Cloud Translation API with caching"""
        if not text or len(text.strip()) < 3:
            return text
            
        # Check cache first
        cache_key = f"{source_lang}:{text[:50]}"
        if cache_key in self.translation_cache:
            return self.translation_cache[cache_key]
        
        try:
            # Use Google Cloud Translation API
            result = self.translator.translate(
                text,
                source_language=source_lang if source_lang != 'auto' else None,
                target_language=target_lang
            )
            
            translated_text = result['translatedText']
            
            # Cache the result
            self.translation_cache[cache_key] = translated_text
            return translated_text
            
        except Exception as e:
            print(f"Translation error for '{text[:50]}...': {e}")
            return text  # Return original text if translation fails
    
    def process_review_file(self, input_file, output_file):
        """Process a single review file and create English version"""
        print(f"🔄 Processing: {input_file}")
        
        # Load original data
        with open(input_file, 'r', encoding='utf-8') as f:
            reviews = json.load(f)
        
        if not isinstance(reviews, list):
            print(f"❌ Error: Expected array format, got {type(reviews)}")
            return
        
        print(f"📊 Found {len(reviews)} reviews")
        
        # Process each review
        processed_reviews = []
        language_stats = {'en': 0, 'nl': 0, 'fr': 0, 'de': 0, 'es': 0, 'other': 0}
        
        for i, review in enumerate(reviews):
            print(f"  Processing review {i+1}/{len(reviews)}", end='\r')
            
            # Skip None reviews
            if review is None:
                continue
            
            # Combine title and text for language detection
            combined_text = f"{review.get('title', '')} {review.get('text', '')}"
            
            # Detect language
            detected_lang = self.detect_language(combined_text)
            language_stats[detected_lang] = language_stats.get(detected_lang, 0) + 1
            
            # Create processed review
            user = review.get('user') or {}
            processed_review = {
                'review_id': f"{user.get('userId', 'unknown')}_{i}",
                'title': review.get('title', ''),
                'text': review.get('text', ''),
                'rating': review.get('rating', 0),
                'date': review.get('publishedDate', ''),
                'travel_date': review.get('travelDate', ''),
                'language_detected': detected_lang,
                'language_original': detected_lang,
                'user': {
                    'user_id': user.get('userId', ''),
                    'name': user.get('name', ''),
                    'location': user.get('userLocation', {}).get('name', 'Unknown') if user.get('userLocation') else 'Unknown',
                    'review_count': user.get('contributions', {}).get('totalContributions', 0) if user.get('contributions') else 0,
                    'helpful_votes': user.get('contributions', {}).get('helpfulVotes', 0) if user.get('contributions') else 0
                },
                'place_info': {
                    'name': review.get('placeInfo', {}).get('name', '') if review.get('placeInfo') else '',
                    'category': 'Cultural heritage site',
                    'location': review.get('placeInfo', {}).get('locationString', '') if review.get('placeInfo') else '',
                    'coordinates': {
                        'lat': review.get('placeInfo', {}).get('latitude') if review.get('placeInfo') else None,
                        'lng': review.get('placeInfo', {}).get('longitude') if review.get('placeInfo') else None
                    }
                },
                'metadata': {
                    'source_url': review.get('url', ''),
                    'scraped_at': datetime.now().isoformat(),
                    'original_data': True
                }
            }
            
            # Translate if not English
            if detected_lang != 'en':
                print(f"    Translating {detected_lang} to English...")
                processed_review['title'] = self.translate_text(
                    review.get('title', ''), detected_lang, 'en'
                )
                processed_review['text'] = self.translate_text(
                    review.get('text', ''), detected_lang, 'en'
                )
                processed_review['language_detected'] = 'en'
            
            processed_reviews.append(processed_review)
        
        # Create output structure
        output_data = {
            'collection_metadata': {
                'source': 'tripadvisor',
                'stakeholder': os.path.basename(os.path.dirname(input_file)),
                'collection_date': datetime.now().strftime('%Y-%m-%d'),
                'total_reviews': len(processed_reviews),
                'language_distribution': language_stats,
                'translation_applied': True,
                'date_range': {
                    'earliest': min([r.get('date', '') for r in processed_reviews if r.get('date')]) if processed_reviews else '',
                    'latest': max([r.get('date', '') for r in processed_reviews if r.get('date')]) if processed_reviews else ''
                }
            },
            'reviews': processed_reviews
        }
        
        # Save English version
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Created English version: {output_file}")
        print(f"📊 Language distribution:")
        for lang, count in language_stats.items():
            if count > 0:
                print(f"  {lang}: {count} reviews")

def main():
    translator = ReviewTranslator()
    
    # Process Kunta Kinteh Island file
    input_file = '../data/raw_reviews/oct_2025/gambia/kunta_kinteh_island/kunta_kinteh_reviews.json'
    output_file = '../data/raw_reviews/oct_2025/gambia/kunta_kinteh_island/kunta_kinteh_reviews_ENG.json'
    
    if os.path.exists(input_file):
        translator.process_review_file(input_file, output_file)
    else:
        print(f"❌ File not found: {input_file}")

if __name__ == "__main__":
    main()
