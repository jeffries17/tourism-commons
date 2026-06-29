#!/usr/bin/env python3
"""
Script to separate reviews from a consolidated dataset into individual stakeholder folders.
This script reads the large dataset and separates reviews based on place names.
"""

import json
import os
from pathlib import Path
from collections import defaultdict

def load_stakeholder_mapping():
    """Load the stakeholder mapping configuration."""
    mapping_file = Path("../data/config/stakeholder_mapping.json")
    with open(mapping_file, 'r') as f:
        return json.load(f)

def create_place_to_stakeholder_mapping(stakeholder_config):
    """Create a mapping from place names to stakeholder folder names."""
    mapping = {}
    
    # Direct name mappings
    place_to_stakeholder = {
        "Kachikally Crocodile Pool": "kachikally_crocodile_pool",
        "Albert Market": "banjul_craft_market",  # Albert Market is the craft section
        "Senegambia Craft Market": "senegambia_craft_market",
        "Abuko Nature Reserve": "abuko_nature_reserve",
        "Arch 22": "arch_22_museum",
        "Tanje Village Museum": "tanji_village_market",  # Note: slight name difference
        "Bakau Craft Market - Sand Art Shop": "bakau_craft_market",
        "National Museum": "national_museum_gambia",
        "Kunta Kinteh Island": "kunta_kinteh_island",
        "Brikama Craft Market": "brikama_woodcarvers_market",
        "Stone Circles of Senegambia": "wassu_stone_circles",
        "Fort Bullen": "fort_bullen_barra_museum",
        "Ebunjan Theater": "ebunjan_theatre"
    }
    
    return place_to_stakeholder

def separate_reviews(input_file, output_base_dir):
    """Separate reviews from the large dataset into individual stakeholder files."""
    
    # Load the stakeholder mapping
    stakeholder_config = load_stakeholder_mapping()
    place_mapping = create_place_to_stakeholder_mapping(stakeholder_config)
    
    # Load the large dataset
    print(f"Loading dataset from {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        reviews = json.load(f)
    
    print(f"Total reviews loaded: {len(reviews)}")
    
    # Group reviews by stakeholder
    stakeholder_reviews = defaultdict(list)
    unmatched_reviews = []
    
    for review in reviews:
        if 'placeInfo' in review and 'name' in review['placeInfo']:
            place_name = review['placeInfo']['name']
            if place_name in place_mapping:
                stakeholder = place_mapping[place_name]
                stakeholder_reviews[stakeholder].append(review)
            else:
                unmatched_reviews.append(review)
                print(f"Warning: No mapping found for place: {place_name}")
        else:
            unmatched_reviews.append(review)
            print("Warning: Review missing placeInfo or name")
    
    # Create output directories and save files
    output_base_path = Path(output_base_dir)
    output_base_path.mkdir(parents=True, exist_ok=True)
    
    print(f"\nSeparating reviews into stakeholder folders...")
    
    for stakeholder, reviews_list in stakeholder_reviews.items():
        # Create stakeholder directory
        stakeholder_dir = output_base_path / stakeholder
        stakeholder_dir.mkdir(exist_ok=True)
        
        # Create filename
        filename = f"{stakeholder}_reviews.json"
        output_file = stakeholder_dir / filename
        
        # Save reviews
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(reviews_list, f, indent=2, ensure_ascii=False)
        
        print(f"  {stakeholder}: {len(reviews_list)} reviews -> {output_file}")
    
    # Save unmatched reviews for manual review
    if unmatched_reviews:
        unmatched_file = output_base_path / "unmatched_reviews.json"
        with open(unmatched_file, 'w', encoding='utf-8') as f:
            json.dump(unmatched_reviews, f, indent=2, ensure_ascii=False)
        print(f"\n  Unmatched reviews: {len(unmatched_reviews)} -> {unmatched_file}")
    
    # Print summary
    total_processed = sum(len(reviews) for reviews in stakeholder_reviews.values())
    print(f"\nSummary:")
    print(f"  Total reviews processed: {total_processed}")
    print(f"  Stakeholders with reviews: {len(stakeholder_reviews)}")
    print(f"  Unmatched reviews: {len(unmatched_reviews)}")

def main():
    """Main function to run the separation process."""
    # Set up paths
    script_dir = Path(__file__).parent
    input_file = script_dir / "sentiment_data" / "to_be_sorted" / "dataset_tripadvisor-reviews_2025-09-15_15-43-17-592.json"
    output_dir = script_dir / "sentiment_data" / "raw_reviews" / "oct_2025" / "gambia"
    
    # Check if input file exists
    if not input_file.exists():
        print(f"Error: Input file not found: {input_file}")
        return
    
    # Run the separation
    separate_reviews(input_file, output_dir)
    print("\nReview separation completed!")

if __name__ == "__main__":
    main()
