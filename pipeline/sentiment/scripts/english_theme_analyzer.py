#!/usr/bin/env python3
"""
English Theme Analyzer
Analyzes English-speaking reviews to identify different interest themes and create theme-based personas.
"""

import json
import re
from collections import defaultdict, Counter
from typing import Dict, List, Tuple

class EnglishThemeAnalyzer:
    def __init__(self):
        """Initialize theme analyzer"""
        
        # Theme patterns for creative tourism
        self.theme_patterns = {
            'cultural_heritage': [
                r'\bculture\b', r'\bheritage\b', r'\bhistory\b', r'\bhistorical\b', 
                r'\btraditional\b', r'\bauthentic\b', r'\bcolonial\b', r'\bslave\b', 
                r'\bslavery\b', r'\btradition\b', r'\blocal\b', r'\bgenuine\b'
            ],
            'nature_wildlife': [
                r'\bnature\b', r'\bwildlife\b', r'\bbirds\b', r'\bbirding\b', 
                r'\banimals\b', r'\bwild\b', r'\bnatural\b', r'\bforest\b', 
                r'\briver\b', r'\bextraordinary\b', r'\bscenic\b', r'\blandscape\b',
                r'\bcrocodile\b', r'\bmonkey\b', r'\bmonkeys\b'
            ],
            'art_creativity': [
                r'\bart\b', r'\bartist\b', r'\bcreative\b', r'\bgallery\b', 
                r'\bexhibition\b', r'\bcraft\b', r'\bhandmade\b', r'\bartisan\b', 
                r'\bpainting\b', r'\bsculpture\b', r'\bdesign\b', r'\baesthetic\b',
                r'\bwoodworking\b', r'\bjewelry\b', r'\btrinkets\b'
            ],
            'educational_learning': [
                r'\blearn\b', r'\blearning\b', r'\beducational\b', r'\binformative\b',
                r'\bguide\b', r'\bexplanation\b', r'\bknowledge\b', r'\binformation\b',
                r'\binteresting\b', r'\bfascinating\b', r'\beye-opening\b'
            ],
            'adventure_experience': [
                r'\badventure\b', r'\bexciting\b', r'\bthrilling\b', r'\bexplore\b',
                r'\bdiscovery\b', r'\bunique\b', r'\bunforgettable\b', r'\bamazing\b',
                r'\bwonderful\b', r'\bexcellent\b', r'\bfantastic\b'
            ],
            'spiritual_religious': [
                r'\bspiritual\b', r'\breligious\b', r'\bchurch\b', r'\bmosque\b',
                r'\bpilgrimage\b', r'\bsacred\b', r'\bholy\b', r'\bfaith\b'
            ],
            'architecture_historical': [
                r'\barchitecture\b', r'\bbuilding\b', r'\bconstruction\b', r'\bdesign\b',
                r'\bmonument\b', r'\bstatue\b', r'\barch\b', r'\bfortress\b',
                r'\bcastle\b', r'\bmuseum\b', r'\bexhibit\b'
            ],
            'market_shopping': [
                r'\bmarket\b', r'\bshopping\b', r'\bshop\b', r'\bbuy\b', r'\bpurchase\b',
                r'\bsouvenir\b', r'\bprice\b', r'\bcost\b', r'\bhaggle\b', r'\bbargain\b'
            ]
        }
        
    def analyze_review_themes(self, text: str) -> Dict[str, int]:
        """Analyze themes in a single review"""
        text_lower = text.lower()
        theme_counts = {}
        
        for theme, patterns in self.theme_patterns.items():
            count = 0
            for pattern in patterns:
                matches = len(re.findall(pattern, text_lower))
                count += matches
            
            if count > 0:
                theme_counts[theme] = count
        
        return theme_counts
    
    def analyze_english_reviews_by_theme(self):
        """Analyze English reviews to identify theme-based personas"""
        print("🎯 Analyzing English Reviews by Interest Themes")
        print("=" * 60)
        
        # Load the main review dataset
        review_file = '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/data/sentiment_data/to_be_sorted/dataset_tripadvisor-reviews_2025-09-15_15-43-17-592.json'
        
        try:
            with open(review_file, 'r', encoding='utf-8') as f:
                reviews = json.load(f)
            
            print(f"📊 Loaded {len(reviews)} total reviews")
            
            # Analyze English reviews
            english_reviews = []
            theme_analysis = defaultdict(lambda: {
                'reviews': [],
                'ratings': [],
                'quotes': [],
                'sample_size': 0
            })
            
            for review in reviews:
                text = f"{review.get('title', '')} {review.get('text', '')}"
                rating = review.get('rating', 0)
                
                if self.is_english_text(text):
                    english_reviews.append(review)
                    
                    # Analyze themes
                    themes = self.analyze_review_themes(text)
                    
                    # Assign to primary theme (highest count)
                    if themes:
                        primary_theme = max(themes, key=themes.get)
                        theme_analysis[primary_theme]['reviews'].append(review)
                        theme_analysis[primary_theme]['sample_size'] += 1
                        
                        if rating > 0:
                            theme_analysis[primary_theme]['ratings'].append(rating)
                        
                        # Store sample quotes (first 3 per theme)
                        if len(theme_analysis[primary_theme]['quotes']) < 3:
                            quote_text = text[:150] + "..." if len(text) > 150 else text
                            theme_analysis[primary_theme]['quotes'].append(quote_text)
            
            print(f"📈 Found {len(english_reviews)} English reviews")
            
            # Calculate averages and filter by sample size
            theme_personas = {}
            for theme, data in theme_analysis.items():
                if data['sample_size'] >= 10:  # Minimum sample size
                    avg_rating = round(sum(data['ratings']) / len(data['ratings']), 2) if data['ratings'] else 0
                    theme_personas[theme] = {
                        'sample_size': data['sample_size'],
                        'avg_rating': avg_rating,
                        'sample_quotes': data['quotes']
                    }
            
            # Sort by sample size
            sorted_themes = sorted(theme_personas.items(), key=lambda x: x[1]['sample_size'], reverse=True)
            
            print(f"\n🎯 English Theme-Based Personas (Sample Size >= 10):")
            for theme, data in sorted_themes:
                print(f"\n### {theme.replace('_', ' ').title()} Enthusiasts")
                print(f"- **Sample Size:** {data['sample_size']} reviews")
                print(f"- **Average Rating:** {data['avg_rating']}/5")
                print(f"- **Sample Quotes:**")
                for i, quote in enumerate(data['sample_quotes'], 1):
                    print(f"  {i}. \"{quote}\"")
            
            # Save results
            results = {
                'total_english_reviews': len(english_reviews),
                'theme_personas': dict(sorted_themes),
                'all_theme_data': dict(theme_analysis)
            }
            
            output_file = '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/english_theme_personas.json'
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
            
            print(f"\n✅ Results saved to: {output_file}")
            
            return results
            
        except Exception as e:
            print(f"❌ Error analyzing reviews: {e}")
            return None
    
    def is_english_text(self, text: str) -> bool:
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

def main():
    """Main function to analyze English reviews by theme"""
    analyzer = EnglishThemeAnalyzer()
    
    results = analyzer.analyze_english_reviews_by_theme()
    
    if results:
        print(f"\n🎉 English theme analysis completed!")
        print(f"📊 Analyzed {results['total_english_reviews']} English reviews")
        print(f"🎯 Identified {len(results['theme_personas'])} theme-based personas")
    else:
        print(f"\n❌ Failed to analyze English themes")

if __name__ == "__main__":
    main()
