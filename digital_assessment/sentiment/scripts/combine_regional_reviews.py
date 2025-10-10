#!/usr/bin/env python3
"""
Combine individual regional review files into single combined files.
This creates the same structure as Gambia reviews for translation compatibility.
"""

import json
import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
RAW_REVIEWS_BASE = PROJECT_ROOT / "data/sentiment_data/raw_reviews/oct_2025"

# Regional countries (not Gambia)
REGIONAL_COUNTRIES = ['benin', 'cape_verde', 'ghana', 'nigeria', 'senegal']

def combine_reviews_for_stakeholder(stakeholder_dir):
    """Combine individual review files into a single reviews.json file"""
    stakeholder_name = stakeholder_dir.name
    
    # Find all individual review files
    review_files = sorted(stakeholder_dir.glob(f"{stakeholder_name}_review_*.json"))
    
    if not review_files:
        return 0
    
    # Load and combine all reviews
    all_reviews = []
    for review_file in review_files:
        try:
            with open(review_file, 'r', encoding='utf-8') as f:
                review = json.load(f)
                all_reviews.append(review)
        except Exception as e:
            print(f"  ⚠️  Error reading {review_file.name}: {e}")
            continue
    
    # Save combined file
    if all_reviews:
        combined_file = stakeholder_dir / f"{stakeholder_name}_reviews.json"
        with open(combined_file, 'w', encoding='utf-8') as f:
            json.dump(all_reviews, f, indent=2, ensure_ascii=False)
        
        return len(all_reviews)
    
    return 0

def main():
    print("🔄 Combining regional review files for translation...")
    print("=" * 70)
    
    total_stakeholders = 0
    total_reviews = 0
    
    for country in REGIONAL_COUNTRIES:
        country_dir = RAW_REVIEWS_BASE / country / "creative_industries"
        
        if not country_dir.exists():
            continue
        
        print(f"\n📍 Processing {country.replace('_', ' ').title()}:")
        
        # Get all stakeholder directories
        stakeholder_dirs = [d for d in country_dir.iterdir() if d.is_dir()]
        
        for stakeholder_dir in sorted(stakeholder_dirs):
            review_count = combine_reviews_for_stakeholder(stakeholder_dir)
            
            if review_count > 0:
                total_stakeholders += 1
                total_reviews += review_count
                print(f"  ✅ {stakeholder_dir.name}: {review_count} reviews combined")
    
    print("\n" + "=" * 70)
    print(f"✅ Combined reviews for {total_stakeholders} stakeholders")
    print(f"📊 Total reviews: {total_reviews:,}")
    print(f"\n📝 Next step: Run batch_translate.py to create English versions")

if __name__ == "__main__":
    main()

