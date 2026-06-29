#!/usr/bin/env python3
"""
Organize Benin TripAdvisor reviews by stakeholder
Processes the main dataset and creates separate files per stakeholder
"""

import json
from pathlib import Path
from collections import defaultdict
import re

def detect_language(text):
    """Detect language from text"""
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
    
    text_lower = text.lower()
    
    french_count = sum(len(re.findall(pattern, text_lower)) for pattern in french_patterns)
    english_count = sum(len(re.findall(pattern, text_lower)) for pattern in english_patterns)
    
    if french_count > english_count * 1.5:
        return 'fr'
    elif english_count > 0:
        return 'en'
    else:
        return 'unknown'

def organize_reviews(input_file, output_dir):
    """Organize reviews by stakeholder"""
    
    print(f"Loading reviews from {input_file}...")
    with open(input_file, 'r') as f:
        reviews = json.load(f)
    
    print(f"Found {len(reviews)} total reviews")
    
    # Organize by stakeholder
    stakeholders = defaultdict(list)
    
    for review in reviews:
        place_name = review['placeInfo']['name']
        stakeholders[place_name].append(review)
    
    print(f"\nFound {len(stakeholders)} unique stakeholders:")
    
    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Process each stakeholder
    for name, reviews in stakeholders.items():
        # Detect language
        lang_count = {'fr': 0, 'en': 0, 'unknown': 0}
        for review in reviews:
            lang = detect_language(review['text'])
            lang_count[lang] += 1
        
        print(f"\n{name}:")
        print(f"  Reviews: {len(reviews)}")
        print(f"  Languages: FR={lang_count['fr']}, EN={lang_count['en']}, ?={lang_count['unknown']}")
        
        # Create safe filename
        safe_name = name.lower().replace(' ', '_').replace("'", '').replace('é', 'e')
        safe_name = re.sub(r'[^a-z0-9_]', '', safe_name)
        
        # Save to file
        output_file = output_path / f"{safe_name}_reviews.json"
        with open(output_file, 'w') as f:
            json.dump(reviews, f, indent=2, ensure_ascii=False)
        
        print(f"  Saved to: {output_file}")
    
    print(f"\n✅ Organized {len(stakeholders)} stakeholder files in {output_dir}")

if __name__ == "__main__":
    input_file = Path(__file__).parent / "dataset_tripadvisor-reviews_2025-10-27_10-15-59-976.json"
    output_dir = Path(__file__).parent / "raw_reviews" / "cultural_heritage"
    
    organize_reviews(input_file, output_dir)

