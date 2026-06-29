#!/usr/bin/env python3
"""
Simple Travel Party Analyzer
Analyzes actual review data to identify English-speaking traveler archetypes based on self-reported travel party types.
"""

import json
import re
from collections import defaultdict, Counter
from typing import Dict, List

def is_english_text(text: str) -> bool:
    """Simple check if text is in English"""
    if not text:
        return False
    
    # Check for common English words
    english_indicators = [
        'the', 'and', 'was', 'were', 'with', 'this', 'that', 'very', 'great', 'good',
        'amazing', 'wonderful', 'beautiful', 'excellent', 'fantastic', 'perfect'
    ]
    
    text_lower = text.lower()
    english_word_count = sum(1 for word in english_indicators if word in text_lower)
    
    # If we find 3+ English indicator words, likely English
    return english_word_count >= 3

def detect_travel_party(text: str) -> str:
    """Detect travel party type from text"""
    text_lower = text.lower()
    
    # Family indicators
    family_patterns = [
        r'\bfamily\b', r'\bfamilies\b', r'\bchildren\b', r'\bkids\b', r'\bchild\b',
        r'\bwith my (?:daughter|son|children|kids)\b', r'\bmy (?:daughter|son|children|kids)\b',
        r'\bages? \d+ to \d+\b', r'\b(?:daughter|son) aged?\b', r'\bparents\b'
    ]
    
    # Couple indicators
    couple_patterns = [
        r'\bcouple\b', r'\bmy (?:wife|husband|partner|spouse)\b', r'\bwe (?:two|both)\b',
        r'\bwith my (?:wife|husband|partner|spouse)\b', r'\bromantic\b', r'\bhoneymoon\b'
    ]
    
    # Solo indicators
    solo_patterns = [
        r'\bsolo\b', r'\balone\b', r'\bby myself\b', r'\bjust me\b', r'\btraveling alone\b'
    ]
    
    # Group indicators
    group_patterns = [
        r'\bgroup\b', r'\bfriends\b', r'\bwith friends\b', r'\bgroup of \d+\b',
        r'\babout \d+ people\b', r'\bwe were \d+\b', r'\btour group\b'
    ]
    
    # Check for each type
    for pattern in family_patterns:
        if re.search(pattern, text_lower):
            return 'family'
    
    for pattern in couple_patterns:
        if re.search(pattern, text_lower):
            return 'couple'
    
    for pattern in solo_patterns:
        if re.search(pattern, text_lower):
            return 'solo'
    
    for pattern in group_patterns:
        if re.search(pattern, text_lower):
            return 'group'
    
    return 'unknown'

def analyze_reviews():
    """Analyze reviews for travel party patterns"""
    print("🎯 Analyzing English Reviews for Travel Party Patterns")
    print("=" * 60)
    
    # Load the main review dataset
    review_file = '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/data/sentiment_data/to_be_sorted/dataset_tripadvisor-reviews_2025-09-15_15-43-17-592.json'
    
    try:
        with open(review_file, 'r', encoding='utf-8') as f:
            reviews = json.load(f)
        
        print(f"📊 Loaded {len(reviews)} total reviews")
        
        # Analyze English reviews
        english_reviews = []
        travel_party_distribution = defaultdict(int)
        archetype_data = defaultdict(lambda: {
            'reviews': [],
            'ratings': [],
            'quotes': []
        })
        
        for review in reviews:
            text = f"{review.get('title', '')} {review.get('text', '')}"
            rating = review.get('rating', 0)
            
            if is_english_text(text):
                english_reviews.append(review)
                travel_party = detect_travel_party(text)
                travel_party_distribution[travel_party] += 1
                
                # Store data for this archetype
                archetype_data[travel_party]['reviews'].append(review)
                if rating > 0:
                    archetype_data[travel_party]['ratings'].append(rating)
                
                # Store sample quotes (first 3 per archetype)
                if len(archetype_data[travel_party]['quotes']) < 3:
                    quote_text = text[:150] + "..." if len(text) > 150 else text
                    archetype_data[travel_party]['quotes'].append(quote_text)
        
        print(f"📈 Found {len(english_reviews)} English reviews")
        print(f"📊 Travel Party Distribution:")
        
        total_english = len(english_reviews)
        for party_type, count in travel_party_distribution.items():
            percentage = round((count / total_english) * 100, 1) if total_english > 0 else 0
            print(f"  {party_type.title()}: {count} reviews ({percentage}%)")
        
        # Analyze archetypes with sufficient sample size
        print(f"\n🎯 Travel Party Archetypes (Sample Size >= 10):")
        for party_type, data in archetype_data.items():
            if len(data['reviews']) >= 10:
                avg_rating = round(sum(data['ratings']) / len(data['ratings']), 2) if data['ratings'] else 0
                print(f"\n### {party_type.title()} Travelers")
                print(f"- **Sample Size:** {len(data['reviews'])} reviews")
                print(f"- **Average Rating:** {avg_rating}/5")
                print(f"- **Sample Quotes:**")
                for i, quote in enumerate(data['quotes'], 1):
                    print(f"  {i}. \"{quote}\"")
        
        # Save results
        results = {
            'total_english_reviews': len(english_reviews),
            'travel_party_distribution': dict(travel_party_distribution),
            'archetype_analysis': {
                party_type: {
                    'sample_size': len(data['reviews']),
                    'avg_rating': round(sum(data['ratings']) / len(data['ratings']), 2) if data['ratings'] else 0,
                    'sample_quotes': data['quotes']
                }
                for party_type, data in archetype_data.items()
                if len(data['reviews']) >= 10  # Only include significant sample sizes
            }
        }
        
        # Save to file
        output_file = '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/english_travel_party_archetypes.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Results saved to: {output_file}")
        
        return results
        
    except Exception as e:
        print(f"❌ Error analyzing reviews: {e}")
        return None

if __name__ == "__main__":
    analyze_reviews()
