#!/usr/bin/env python3
"""
Travel Party Analyzer
Analyzes review text to identify different English-speaking traveler archetypes based on self-reported travel party types.
"""

import json
import os
import re
from pathlib import Path
from collections import defaultdict, Counter
from typing import Dict, List, Tuple
from datetime import datetime

class TravelPartyAnalyzer:
    def __init__(self):
        """Initialize travel party analyzer"""
        
        # Travel party detection patterns
        self.travel_party_patterns = {
            'family': [
                r'\bfamily\b', r'\bfamilies\b', r'\bchildren\b', r'\bkids\b', r'\bchild\b',
                r'\bwith my (?:daughter|son|children|kids)\b', r'\bmy (?:daughter|son|children|kids)\b',
                r'\bparents\b', r'\bmother\b', r'\bfather\b', r'\bmum\b', r'\bdad\b',
                r'\bages? \d+ to \d+\b', r'\b(?:daughter|son) aged?\b'
            ],
            'couple': [
                r'\bcouple\b', r'\bmy (?:wife|husband|partner|spouse)\b', r'\bwe (?:two|both)\b',
                r'\bwith my (?:wife|husband|partner|spouse)\b', r'\bromantic\b', r'\bhoneymoon\b',
                r'\banniversary\b', r'\bwedding\b', r'\bmy (?:girlfriend|boyfriend)\b'
            ],
            'solo': [
                r'\bsolo\b', r'\balone\b', r'\bby myself\b', r'\bjust me\b', r'\bsingle\b',
                r'\btraveling alone\b', r'\bvisited alone\b', r'\bon my own\b'
            ],
            'group': [
                r'\bgroup\b', r'\bfriends\b', r'\bwith friends\b', r'\bgroup of \d+\b',
                r'\babout \d+ people\b', r'\bwe were \d+\b', r'\btour group\b',
                r'\bsmall group\b', r'\blarge group\b', r'\bparty of \d+\b'
            ]
        }
        
        # Theme patterns for each archetype
        self.theme_patterns = {
            'educational': [
                r'\blearn\b', r'\blearning\b', r'\binformative\b', r'\beducational\b',
                r'\bguide\b', r'\bexplanation\b', r'\bknowledge\b', r'\binformation\b',
                r'\bhistory\b', r'\bhistorical\b', r'\bculture\b', r'\bcultural\b'
            ],
            'artistic': [
                r'\bart\b', r'\bartist\b', r'\bcreative\b', r'\bgallery\b', r'\bexhibition\b',
                r'\bcraft\b', r'\bhandmade\b', r'\bartisan\b', r'\bpainting\b', r'\bsculpture\b',
                r'\bdesign\b', r'\baesthetic\b', r'\bbeautiful\b'
            ],
            'authentic': [
                r'\bauthentic\b', r'\bgenuine\b', r'\breal\b', r'\blocal\b', r'\btraditional\b',
                r'\bnon-touristy\b', r'\boff the beaten path\b', r'\bunspoiled\b'
            ],
            'adventure': [
                r'\badventure\b', r'\bexciting\b', r'\bthrilling\b', r'\bexplore\b',
                r'\bdiscovery\b', r'\bunique\b', r'\bunforgettable\b', r'\bamazing\b'
            ],
            'value': [
                r'\bvalue\b', r'\bprice\b', r'\bcost\b', r'\bworth\b', r'\bexpensive\b',
                r'\bcheap\b', r'\baffordable\b', r'\bmoney\b', r'\bpay\b'
            ]
        }
        
        self.results = {
            'total_reviews_analyzed': 0,
            'travel_party_distribution': defaultdict(int),
            'archetype_analysis': defaultdict(lambda: {
                'sample_size': 0,
                'avg_rating': 0,
                'theme_preferences': defaultdict(int),
                'sample_quotes': [],
                'sentiment_scores': []
            }),
            'generated_at': datetime.now().isoformat()
        }
    
    def analyze_review_text(self, text: str) -> Dict:
        """Analyze a single review text for travel party and themes"""
        text_lower = text.lower()
        
        # Detect travel party
        travel_party = self.detect_travel_party(text_lower)
        
        # Detect themes
        themes = self.detect_themes(text_lower)
        
        return {
            'travel_party': travel_party,
            'themes': themes
        }
    
    def detect_travel_party(self, text: str) -> str:
        """Detect travel party type from text"""
        scores = {}
        
        for party_type, patterns in self.travel_party_patterns.items():
            score = 0
            for pattern in patterns:
                matches = len(re.findall(pattern, text))
                score += matches
            
            if score > 0:
                scores[party_type] = score
        
        if scores:
            return max(scores, key=scores.get)
        else:
            return 'unknown'
    
    def detect_themes(self, text: str) -> List[str]:
        """Detect themes from text"""
        detected_themes = []
        
        for theme, patterns in self.theme_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text):
                    detected_themes.append(theme)
                    break  # Only count each theme once per review
        
        return detected_themes
    
    def load_english_reviews(self, data_sources: List[str]) -> List[Dict]:
        """Load English language reviews from data sources"""
        english_reviews = []
        
        for source in data_sources:
            try:
                with open(source, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Extract reviews from different data structures
                if 'stakeholder_data' in data:
                    for stakeholder in data['stakeholder_data']:
                        # Check if this stakeholder has English reviews
                        lang_dist = stakeholder.get('language_distribution', {})
                        if lang_dist.get('en', 0) > 0:
                            # This stakeholder has English reviews
                            # We need to get the actual review text
                            pass
                
                # For sentiment analysis results, extract English reviews
                if 'summary' in data and 'language_distribution' in data['summary']:
                    if data['summary']['language_distribution'].get('en', 0) > 0:
                        # Load the actual review files
                        english_reviews.extend(self.load_review_files_for_english())
                        
            except Exception as e:
                print(f"Error loading {source}: {e}")
                continue
        
        return english_reviews
    
    def load_review_files_for_english(self) -> List[Dict]:
        """Load actual review files that contain English reviews"""
        review_files = []
        
        # Look for review files in the data directory
        data_dir = Path('/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/data')
        
        for file_path in data_dir.rglob('*_reviews_ENG.json'):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                reviews = data.get('reviews', [])
                for review in reviews:
                    # Check if review is in English
                    if review.get('language_detected', '') == 'en' or review.get('language', '') == 'en':
                        review_files.append(review)
                        
            except Exception as e:
                print(f"Error loading {file_path}: {e}")
                continue
        
        return review_files
    
    def analyze_travel_party_archetypes(self) -> Dict:
        """Analyze travel party archetypes from English reviews"""
        print("🎯 Analyzing English-Speaking Travel Party Archetypes")
        print("=" * 60)
        
        # Load English reviews
        data_sources = [
            '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/sentiment_analysis_results.json',
            '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/regional_sentiment/regional_sentiment_analysis.json'
        ]
        
        english_reviews = self.load_review_files_for_english()
        
        if not english_reviews:
            print("❌ No English reviews found")
            return {}
        
        print(f"📊 Found {len(english_reviews)} English reviews to analyze")
        
        # Analyze each review
        for review in english_reviews:
            text = f"{review.get('title', '')} {review.get('text', '')}"
            rating = review.get('rating', 0)
            
            if not text.strip():
                continue
            
            # Analyze travel party and themes
            analysis = self.analyze_review_text(text)
            travel_party = analysis['travel_party']
            themes = analysis['themes']
            
            # Update results
            self.results['total_reviews_analyzed'] += 1
            self.results['travel_party_distribution'][travel_party] += 1
            
            # Update archetype analysis
            archetype_key = f"english_{travel_party}"
            self.results['archetype_analysis'][archetype_key]['sample_size'] += 1
            
            if rating > 0:
                self.results['archetype_analysis'][archetype_key]['sentiment_scores'].append(rating)
            
            # Count theme mentions
            for theme in themes:
                self.results['archetype_analysis'][archetype_key]['theme_preferences'][theme] += 1
            
            # Collect sample quotes (first 3 for each archetype)
            if len(self.results['archetype_analysis'][archetype_key]['sample_quotes']) < 3:
                quote_text = text[:200] + "..." if len(text) > 200 else text
                self.results['archetype_analysis'][archetype_key]['sample_quotes'].append(quote_text)
        
        # Calculate averages
        for archetype, data in self.results['archetype_analysis'].items():
            if data['sentiment_scores']:
                data['avg_rating'] = round(sum(data['sentiment_scores']) / len(data['sentiment_scores']), 2)
        
        return self.results
    
    def generate_archetype_summary(self) -> str:
        """Generate summary of travel party archetypes"""
        summary = []
        summary.append("# English-Speaking Travel Party Archetypes Analysis")
        summary.append(f"**Generated:** {datetime.now().isoformat()}")
        summary.append(f"**Total Reviews Analyzed:** {self.results['total_reviews_analyzed']}")
        summary.append("")
        
        # Travel party distribution
        summary.append("## Travel Party Distribution")
        total_reviews = self.results['total_reviews_analyzed']
        for party_type, count in self.results['travel_party_distribution'].items():
            percentage = round((count / total_reviews) * 100, 1) if total_reviews > 0 else 0
            summary.append(f"- **{party_type.title()}:** {count} reviews ({percentage}%)")
        summary.append("")
        
        # Archetype analysis
        summary.append("## Travel Party Archetypes")
        for archetype, data in self.results['archetype_analysis'].items():
            if data['sample_size'] >= 10:  # Only show archetypes with sufficient sample size
                summary.append(f"### {archetype.replace('_', ' ').title()}")
                summary.append(f"- **Sample Size:** {data['sample_size']} reviews")
                summary.append(f"- **Average Rating:** {data['avg_rating']}/5")
                
                if data['theme_preferences']:
                    summary.append("- **Top Themes:**")
                    sorted_themes = sorted(data['theme_preferences'].items(), key=lambda x: x[1], reverse=True)
                    for theme, count in sorted_themes[:3]:
                        summary.append(f"  - {theme.title()}: {count} mentions")
                
                if data['sample_quotes']:
                    summary.append("- **Sample Quotes:**")
                    for i, quote in enumerate(data['sample_quotes'], 1):
                        summary.append(f"  {i}. \"{quote}\"")
                
                summary.append("")
        
        return "\n".join(summary)
    
    def save_results(self, output_path: str):
        """Save analysis results"""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Save JSON results
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        # Save summary report
        summary_path = output_path.replace('.json', '_SUMMARY.md')
        summary = self.generate_archetype_summary()
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write(summary)
        
        print(f"✅ Results saved to: {output_path}")
        print(f"✅ Summary saved to: {summary_path}")


def main():
    """Main function to analyze travel party archetypes"""
    analyzer = TravelPartyAnalyzer()
    
    try:
        # Analyze travel party archetypes
        results = analyzer.analyze_travel_party_archetypes()
        
        # Save results
        output_path = '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/travel_party_archetypes.json'
        analyzer.save_results(output_path)
        
        print(f"\n🎉 Travel party archetype analysis completed!")
        print(f"📊 Analyzed {results['total_reviews_analyzed']} English reviews")
        
        # Print summary
        print(f"\n📈 Travel Party Distribution:")
        for party_type, count in results['travel_party_distribution'].items():
            percentage = round((count / results['total_reviews_analyzed']) * 100, 1)
            print(f"  {party_type.title()}: {count} ({percentage}%)")
        
    except Exception as e:
        print(f"\n❌ Error analyzing travel party archetypes: {str(e)}")
        return False
    
    return True


if __name__ == "__main__":
    main()
