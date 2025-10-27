#!/usr/bin/env python3
"""
Extract year distribution data for Gambian creative industries
"""

import json

def extract_gambian_creative_industries_data():
    """Extract year distribution for Gambian creative industries"""
    
    # Load the sentiment data
    with open('/Users/alexjeffries/tourism-commons/digital_assessment/dashboard/public/sentiment_data.json', 'r') as f:
        data = json.load(f)
    
    # Initialize counters
    total_2023 = 0
    total_2024 = 0
    total_reviews = 0
    
    print("Gambian Creative Industries - Year Distribution Analysis")
    print("=" * 60)
    print()
    
    # Process each stakeholder
    for stakeholder in data['stakeholder_data']:
        if stakeholder['source'] == 'gambia_creative':
            name = stakeholder['stakeholder_name']
            year_dist = stakeholder['year_distribution']
            reviews_2023 = year_dist.get('2023', 0)
            reviews_2024 = year_dist.get('2024', 0)
            total_stakeholder_reviews = stakeholder['total_reviews']
            
            print(f"{name}:")
            print(f"  2023: {reviews_2023} reviews")
            print(f"  2024: {reviews_2024} reviews")
            print(f"  Total: {total_stakeholder_reviews} reviews")
            print()
            
            total_2023 += reviews_2023
            total_2024 += reviews_2024
            total_reviews += total_stakeholder_reviews
    
    print("=" * 60)
    print("SUMMARY:")
    print(f"Total Gambian Creative Industries Reviews 2023: {total_2023}")
    print(f"Total Gambian Creative Industries Reviews 2024: {total_2024}")
    print(f"Total Gambian Creative Industries Reviews (All Years): {total_reviews}")
    print(f"2023 + 2024 Combined: {total_2023 + total_2024}")
    print(f"Percentage 2023: {(total_2023/total_reviews)*100:.1f}%")
    print(f"Percentage 2024: {(total_2024/total_reviews)*100:.1f}%")
    print(f"Percentage 2023+2024: {((total_2023 + total_2024)/total_reviews)*100:.1f}%")

if __name__ == "__main__":
    extract_gambian_creative_industries_data()

