#!/usr/bin/env python3
"""
Enhanced Theme Analysis with Quote Extraction
Provides deep thematic analysis with specific quotes and improvement areas
"""

import json
import re
from collections import defaultdict, Counter
from typing import Dict, List, Tuple
import numpy as np

class EnhancedThemeAnalyzer:
    def __init__(self):
        # Define tourism-specific themes with detailed keywords
        self.themes = {
            'historical_significance': {
                'keywords': ['history', 'historical', 'heritage', 'past', 'story', 'significance', 'important', 'meaningful', 'cultural', 'tradition'],
                'positive': ['fascinating', 'amazing', 'incredible', 'wonderful', 'beautiful', 'worth', 'valuable'],
                'negative': ['boring', 'disappointing', 'overrated', 'uninteresting', 'forgotten']
            },
            'guide_quality': {
                'keywords': ['guide', 'tour', 'explanation', 'knowledge', 'expert', 'staff', 'service', 'helpful', 'friendly'],
                'positive': ['excellent', 'knowledgeable', 'helpful', 'friendly', 'professional', 'informative'],
                'negative': ['poor', 'unhelpful', 'rude', 'unprofessional', 'confusing', 'lacking']
            },
            'cultural_value': {
                'keywords': ['culture', 'authentic', 'local', 'traditional', 'experience', 'unique', 'special', 'meaningful'],
                'positive': ['authentic', 'unique', 'special', 'meaningful', 'cultural', 'traditional', 'local'],
                'negative': ['touristy', 'fake', 'commercial', 'artificial', 'disappointing']
            },
            'ferry_service': {
                'keywords': ['ferry', 'boat', 'transport', 'crossing', 'ride', 'journey', 'trip', 'service'],
                'positive': ['smooth', 'reliable', 'comfortable', 'efficient', 'good', 'nice'],
                'negative': ['inconsistent', 'unreliable', 'poor', 'bad', 'broken', 'delayed', 'cancelled']
            },
            'infrastructure_state': {
                'keywords': ['infrastructure', 'maintenance', 'condition', 'state', 'building', 'facility', 'site', 'grounds', 'deterioration', 'decay'],
                'positive': ['well-maintained', 'clean', 'good condition', 'modern', 'updated', 'preserved'],
                'negative': ['dilapidated', 'deteriorating', 'decay', 'poor condition', 'run-down', 'neglected', 'broken', 'needs work']
            },
            'accessibility_comfort': {
                'keywords': ['access', 'accessible', 'comfort', 'easy', 'difficult', 'walking', 'stairs', 'path', 'terrain'],
                'positive': ['easy', 'accessible', 'comfortable', 'convenient', 'smooth'],
                'negative': ['difficult', 'hard', 'inaccessible', 'challenging', 'rough', 'uncomfortable']
            },
            'value_pricing': {
                'keywords': ['price', 'cost', 'value', 'worth', 'expensive', 'cheap', 'money', 'fee', 'ticket'],
                'positive': ['good value', 'worth it', 'reasonable', 'fair', 'cheap', 'affordable'],
                'negative': ['expensive', 'overpriced', 'not worth', 'waste', 'rip-off', 'too much']
            },
            'safety_security': {
                'keywords': ['safe', 'security', 'dangerous', 'risk', 'concern', 'worry', 'fear', 'protection'],
                'positive': ['safe', 'secure', 'protected', 'comfortable', 'reassuring'],
                'negative': ['dangerous', 'unsafe', 'risky', 'concerning', 'worrying', 'scary']
            }
        }
        
        # Management response patterns
        self.management_patterns = [
            r'owner response',
            r'management response', 
            r'response from',
            r'response by',
            r'thank you for',
            r'we appreciate',
            r'we apologize'
        ]

    def analyze_theme_sentiment(self, text: str, theme: str) -> Tuple[float, List[str]]:
        """Analyze sentiment for a specific theme and extract relevant quotes"""
        theme_config = self.themes.get(theme, {})
        keywords = theme_config.get('keywords', [])
        positive_words = theme_config.get('positive', [])
        negative_words = theme_config.get('negative', [])
        
        if not keywords:
            return 0.0, []
        
        # Find sentences containing theme keywords
        theme_sentences = []
        sentences = re.split(r'[.!?]+', text.lower())
        
        for sentence in sentences:
            if any(keyword in sentence for keyword in keywords):
                theme_sentences.append(sentence.strip())
        
        if not theme_sentences:
            return 0.0, []
        
        # Calculate sentiment for each sentence
        sentiment_scores = []
        relevant_quotes = []
        
        for sentence in theme_sentences:
            positive_count = sum(1 for word in positive_words if word in sentence)
            negative_count = sum(1 for word in negative_words if word in sentence)
            
            if positive_count + negative_count == 0:
                sentiment_scores.append(0.0)
            else:
                sentiment = (positive_count - negative_count) / (positive_count + negative_count)
                sentiment_scores.append(sentiment)
                
                # Extract meaningful quotes (longer than 20 characters)
                if len(sentence) > 20:
                    relevant_quotes.append(sentence)
        
        # Calculate overall theme sentiment
        if sentiment_scores:
            theme_sentiment = np.mean(sentiment_scores)
        else:
            theme_sentiment = 0.0
        
        return theme_sentiment, relevant_quotes[:3]  # Top 3 quotes

    def extract_improvement_quotes(self, reviews: List[Dict]) -> Dict[str, List[str]]:
        """Extract specific quotes about areas needing improvement"""
        improvement_quotes = defaultdict(list)
        
        for review in reviews:
            text = review.get('text', '').lower()
            
            # Look for improvement-related phrases
            improvement_patterns = [
                r'needs?\s+(?:improvement|work|fixing|attention)',
                r'could\s+(?:be\s+)?(?:better|improved)',
                r'should\s+(?:be\s+)?(?:improved|fixed|better)',
                r'wish\s+(?:they\s+)?(?:would|could)',
                r'disappointed',
                r'disappointing',
                r'let\s+down',
                r'not\s+(?:good|great|excellent)',
                r'poor\s+(?:quality|condition|service)',
                r'terrible',
                r'awful',
                r'horrible'
            ]
            
            for pattern in improvement_patterns:
                matches = re.findall(pattern, text)
                if matches:
                    # Extract the full sentence containing the improvement mention
                    sentences = re.split(r'[.!?]+', review.get('text', ''))
                    for sentence in sentences:
                        if re.search(pattern, sentence.lower()):
                            if len(sentence.strip()) > 30:  # Meaningful length
                                improvement_quotes['general_improvements'].append(sentence.strip())
                                break
        
        return dict(improvement_quotes)

    def analyze_management_response(self, reviews: List[Dict]) -> Dict:
        """Analyze management response patterns"""
        total_reviews = len(reviews)
        responses = 0
        
        for review in reviews:
            # Check for owner response
            if review.get('ownerResponse'):
                responses += 1
            else:
                # Check text for management response patterns
                text = review.get('text', '').lower()
                if any(re.search(pattern, text) for pattern in self.management_patterns):
                    responses += 1
        
        response_rate = (responses / total_reviews) * 100 if total_reviews > 0 else 0
        
        return {
            'response_rate': response_rate,
            'total_responses': responses,
            'total_reviews': total_reviews,
            'gap_opportunity': total_reviews - responses
        }

    def generate_theme_insights(self, reviews: List[Dict]) -> Dict:
        """Generate comprehensive theme insights with quotes"""
        theme_results = {}
        all_quotes = defaultdict(list)
        
        for theme in self.themes.keys():
            theme_scores = []
            theme_quotes = []
            
            for review in reviews:
                text = review.get('text', '')
                sentiment, quotes = self.analyze_theme_sentiment(text, theme)
                
                if sentiment != 0:  # Only include themes with actual mentions
                    theme_scores.append(sentiment)
                    theme_quotes.extend(quotes)
            
            if theme_scores:
                theme_results[theme] = {
                    'average_sentiment': np.mean(theme_scores),
                    'mention_count': len(theme_scores),
                    'quotes': theme_quotes[:5],  # Top 5 quotes
                    'sentiment_distribution': {
                        'positive': len([s for s in theme_scores if s > 0.2]),
                        'neutral': len([s for s in theme_scores if -0.2 <= s <= 0.2]),
                        'negative': len([s for s in theme_scores if s < -0.2])
                    }
                }
        
        # Extract improvement quotes
        improvement_quotes = self.extract_improvement_quotes(reviews)
        
        # Analyze management response
        management_analysis = self.analyze_management_response(reviews)
        
        return {
            'theme_analysis': theme_results,
            'improvement_quotes': improvement_quotes,
            'management_response': management_analysis,
            'critical_areas': self.identify_critical_areas(theme_results)
        }

    def identify_critical_areas(self, theme_results: Dict) -> List[Dict]:
        """Identify critical areas needing improvement"""
        critical_areas = []
        
        for theme, data in theme_results.items():
            if data['average_sentiment'] < -0.1:  # Negative sentiment threshold
                critical_areas.append({
                    'theme': theme.replace('_', ' ').title(),
                    'sentiment_score': data['average_sentiment'],
                    'mention_count': data['mention_count'],
                    'quotes': data['quotes'][:3],  # Top 3 quotes
                    'priority': 'high' if data['average_sentiment'] < -0.2 else 'medium'
                })
        
        # Sort by sentiment score (most negative first)
        critical_areas.sort(key=lambda x: x['sentiment_score'])
        
        return critical_areas

    def generate_dashboard_data(self, reviews: List[Dict], stakeholder_name: str) -> Dict:
        """Generate comprehensive dashboard data"""
        insights = self.generate_theme_insights(reviews)
        
        # Calculate overall metrics
        total_reviews = len(reviews)
        ratings = [r.get('rating', 0) for r in reviews if r.get('rating')]
        avg_rating = np.mean(ratings) if ratings else 0
        
        # Calculate overall sentiment
        all_sentiments = []
        for review in reviews:
            text = review.get('text', '')
            for theme in self.themes.keys():
                sentiment, _ = self.analyze_theme_sentiment(text, theme)
                if sentiment != 0:
                    all_sentiments.append(sentiment)
        
        overall_sentiment = np.mean(all_sentiments) if all_sentiments else 0
        
        # Language distribution
        languages = [r.get('language_detected', 'unknown') for r in reviews]
        language_dist = dict(Counter(languages))
        
        # Year distribution
        years = []
        for review in reviews:
            date = review.get('publishedDate', '')
            if date:
                year = date.split('-')[0] if '-' in date else date[:4]
                years.append(year)
        year_dist = dict(Counter(years))
        
        return {
            'stakeholder_name': stakeholder_name,
            'total_reviews': total_reviews,
            'average_rating': round(avg_rating, 1),
            'overall_sentiment': round(overall_sentiment, 3),
            'positive_rate': round(len([s for s in all_sentiments if s > 0.2]) / len(all_sentiments) * 100, 1) if all_sentiments else 0,
            'language_distribution': language_dist,
            'year_distribution': year_dist,
            'theme_analysis': insights['theme_analysis'],
            'critical_areas': insights['critical_areas'],
            'improvement_quotes': insights['improvement_quotes'],
            'management_response': insights['management_response']
        }

def main():
    """Test the enhanced theme analysis"""
    analyzer = EnhancedThemeAnalyzer()
    
    # Load sample data
    with open('../data/raw_reviews/oct_2025/gambia/kunta_kinteh_island/kunta_kinteh_island_reviews_ENG.json', 'r') as f:
        data = json.load(f)
    
    reviews = data.get('reviews', [])
    
    # Generate dashboard data
    dashboard_data = analyzer.generate_dashboard_data(reviews, 'Kunta Kinteh Island')
    
    # Save results
    with open('enhanced_theme_analysis_results.json', 'w') as f:
        json.dump(dashboard_data, f, indent=2)
    
    print("🎯 Enhanced Theme Analysis Complete!")
    print(f"📊 Analyzed {dashboard_data['total_reviews']} reviews")
    print(f"📈 Overall Sentiment: {dashboard_data['overall_sentiment']}")
    print(f"⭐ Average Rating: {dashboard_data['average_rating']}/5")
    print(f"📝 Critical Areas: {len(dashboard_data['critical_areas'])}")
    
    # Print critical areas
    if dashboard_data['critical_areas']:
        print("\n⚠️ Critical Areas for Improvement:")
        for area in dashboard_data['critical_areas']:
            print(f"  • {area['theme']}: {area['sentiment_score']:.2f} sentiment")
            for quote in area['quotes'][:2]:
                print(f"    \"{quote[:100]}...\"")

if __name__ == "__main__":
    main()
