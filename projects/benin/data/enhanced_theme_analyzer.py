#!/usr/bin/env python3
"""
Enhanced Theme Analysis with Sentiment Breakdown
Provides positive/negative/neutral breakdown for each theme
"""

from collections import defaultdict, Counter
from typing import List, Dict, Tuple
import re
from textblob import TextBlob

class EnhancedThemeAnalyzer:
    """
    Unified theme taxonomy with sentiment breakdown
    """
    
    def __init__(self):
        # UNIFIED THEME TAXONOMY
        self.themes = {
            'cultural_heritage': {
                'display_name': 'Cultural & Heritage Value',
                'keywords': [
                    'culture', 'cultural', 'heritage', 'history', 'historical',
                    'authentic', 'authenticity', 'traditional', 'significance', 'preservation',
                    'legacy', 'ancestor', 'ancestral', 'origin', 'custom', 'ritual',
                    'tribe', 'tribal', 'slavery', 'monument', 'historic', 'slave',
                    'colonial', 'ancient', 'sacred', 'spiritual', 'religion', 'religious'
                ],
                'weight': 1.0
            },
            
            'service_staff': {
                'display_name': 'Service & Staff Quality',
                'keywords': [
                    'staff', 'guide', 'service', 'friendly', 'helpful',
                    'knowledgeable', 'hospitable', 'welcoming', 'professional',
                    'courteous', 'attentive', 'tour guide', 'host', 'hostess',
                    'informative', 'passionate', 'enthusiastic', 'crew',
                    'employee', 'worker', 'receptionist', 'manager'
                ],
                'weight': 1.0
            },
            
            'facilities_infrastructure': {
                'display_name': 'Facilities & Infrastructure',
                'keywords': [
                    'facilities', 'facility', 'infrastructure', 'building', 'maintenance',
                    'clean', 'cleanliness', 'condition', 'restroom', 'bathroom', 'toilet',
                    'amenities', 'upkeep', 'repair', 'modern', 'renovate', 'renovation',
                    'deteriorat', 'decay', 'neglect', 'dirty', 'filthy', 'old',
                    'structure', 'construction', 'air condition', 'lighting'
                ],
                'weight': 1.0
            },
            
            'accessibility_transport': {
                'display_name': 'Accessibility & Transport',
                'keywords': [
                    'access', 'accessible', 'transport', 'transportation',
                    'location', 'parking', 'directions', 'signage', 'sign', 'signpost',
                    'ferry', 'boat', 'bus', 'taxi', 'drive', 'driving', 'walk', 'walking',
                    'reach', 'reaching', 'find', 'finding', 'navigate', 'navigation',
                    'wayfinding', 'entrance', 'approach', 'arrive', 'arrival',
                    'distance', 'far', 'close', 'nearby', 'remote', 'isolated'
                ],
                'weight': 1.0
            },
            
            'value_money': {
                'display_name': 'Value for Money',
                'keywords': [
                    'price', 'pricing', 'value', 'expensive', 'cheap',
                    'worth', 'worthwhile', 'money', 'cost', 'fee', 'charge', 'admission',
                    'ticket', 'affordable', 'overpriced', 'reasonable', 'bargain',
                    'rip off', 'ripoff', 'waste', 'free', 'donation',
                    'budget', 'payment', 'paid', 'pay'
                ],
                'weight': 1.0
            },
            
            'safety_security': {
                'display_name': 'Safety & Security',
                'keywords': [
                    'safe', 'safety', 'security', 'dangerous', 'danger',
                    'risk', 'risky', 'crime', 'guard', 'secure', 'protection',
                    'protect', 'threat', 'threatening', 'hazard', 'precaution',
                    'unsafe', 'insecure', 'theft', 'steal', 'robber', 'robbery',
                    'police', 'emergency', 'fear'
                ],
                'weight': 1.0
            },
            
            'educational_value': {
                'display_name': 'Educational & Informational Value',
                'keywords': [
                    'learn', 'learning', 'educational', 'education', 'information',
                    'informative', 'exhibit', 'exhibition', 'explanation', 'explain',
                    'knowledge', 'knowledgeable', 'teach', 'teaching', 'insight', 'discover',
                    'understand', 'understanding', 'interpretation', 'label', 'plaque',
                    'museum', 'display', 'story', 'narrative', 'context'
                ],
                'weight': 1.0
            },
            
            'artistic_creative': {
                'display_name': 'Artistic & Creative Quality',
                'keywords': [
                    'art', 'artistic', 'creative', 'creativity', 'beautiful', 'beauty',
                    'aesthetic', 'design', 'craft', 'craftsmanship', 'skill', 'skilled',
                    'masterpiece', 'work', 'artwork', 'sculpture', 'painting', 'drawing',
                    'handmade', 'traditional', 'unique', 'impressive', 'amazing',
                    'wonderful', 'stunning', 'breathtaking', 'magnificent'
                ],
                'weight': 1.0
            },
            
            'atmosphere_experience': {
                'display_name': 'Atmosphere & Overall Experience',
                'keywords': [
                    'atmosphere', 'ambiance', 'experience', 'feeling', 'mood',
                    'peaceful', 'calm', 'quiet', 'noisy', 'crowded', 'busy',
                    'relaxing', 'stressful', 'enjoyable', 'pleasant', 'unpleasant',
                    'memorable', 'unforgettable', 'disappointing', 'boring', 'exciting',
                    'interesting', 'fascinating', 'inspiring', 'moving', 'emotional'
                ],
                'weight': 1.0
            }
        }

    def analyze_text_for_themes_with_sentiment(self, text: str) -> Dict[str, Dict]:
        """
        Analyze text and return theme scores with sentiment breakdown
        Returns: {
            'theme_name': {
                'score': float,  # Overall theme relevance (0-1)
                'mentions': int,  # Total mentions
                'sentiment_breakdown': {
                    'positive': int,
                    'negative': int, 
                    'neutral': int
                },
                'sentiment_score': float  # Weighted sentiment (-1 to +1)
            }
        }
        """
        text_lower = text.lower()
        theme_results = {}
        
        for theme_key, theme_config in self.themes.items():
            # Find sentences containing theme keywords
            sentences = re.split(r'[.!?]+', text)
            theme_sentences = []
            
            for sentence in sentences:
                sentence_lower = sentence.lower().strip()
                if not sentence_lower:
                    continue
                    
                # Check if sentence contains theme keywords
                for keyword in theme_config['keywords']:
                    if keyword in sentence_lower:
                        theme_sentences.append(sentence.strip())
                        break
            
            # Count total mentions
            total_mentions = 0
            for keyword in theme_config['keywords']:
                total_mentions += text_lower.count(keyword)
            
            if total_mentions == 0:
                theme_results[theme_key] = {
                    'score': 0.0,
                    'mentions': 0,
                    'sentiment_breakdown': {'positive': 0, 'negative': 0, 'neutral': 0},
                    'sentiment_score': 0.0
                }
                continue
            
            # Analyze sentiment of theme-related sentences using TextBlob
            # This works best with English text
            sentiment_scores = []
            positive_count = 0
            negative_count = 0
            neutral_count = 0
            
            for sentence in theme_sentences:
                try:
                    blob = TextBlob(sentence)
                    sentiment = blob.sentiment.polarity
                    sentiment_scores.append(sentiment)
                    
                    if sentiment > 0.1:
                        positive_count += 1
                    elif sentiment < -0.1:
                        negative_count += 1
                    else:
                        neutral_count += 1
                except:
                    neutral_count += 1
            
            # Calculate weighted sentiment score
            if sentiment_scores:
                weighted_sentiment = sum(sentiment_scores) / len(sentiment_scores)
            else:
                weighted_sentiment = 0.0
            
            # Calculate theme relevance score (0-1)
            word_count = len(text.split())
            normalized_matches = (total_mentions / max(word_count / 100, 1))
            theme_score = min(normalized_matches * theme_config['weight'], 1.0)
            
            theme_results[theme_key] = {
                'score': theme_score,
                'mentions': total_mentions,
                'sentiment_breakdown': {
                    'positive': positive_count,
                    'negative': negative_count,
                    'neutral': neutral_count
                },
                'sentiment_score': weighted_sentiment
            }
        
        return theme_results

    def analyze_text_for_themes(self, text: str) -> Dict[str, float]:
        """Legacy method - returns only theme scores"""
        results = self.analyze_text_for_themes_with_sentiment(text)
        return {theme: data['score'] for theme, data in results.items()}

    def get_sentiment_score(self, text: str) -> float:
        """Get sentiment polarity for text"""
        try:
            blob = TextBlob(text)
            return blob.sentiment.polarity
        except:
            return 0.0

if __name__ == "__main__":
    # Test the enhanced analyzer
    analyzer = EnhancedThemeAnalyzer()
    
    test_text = "C'est un bâtiment visible de loin seulement. La police vous tiendra à distance de l'entrée. Donc, pas du tout excitant."
    
    print("Testing enhanced theme analysis:")
    print(f"Text: {test_text}")
    print()
    
    results = analyzer.analyze_text_for_themes_with_sentiment(test_text)
    
    for theme, data in results.items():
        if data['mentions'] > 0:
            print(f"{theme}:")
            print(f"  Mentions: {data['mentions']}")
            print(f"  Sentiment: {data['sentiment_score']:.3f}")
            print(f"  Breakdown: {data['sentiment_breakdown']}")
            print()
