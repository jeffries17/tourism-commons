#!/usr/bin/env python3
"""
Enhanced Theme Analysis with Unified Taxonomy
Provides cross-regional comparison with standardized themes
"""

from collections import defaultdict, Counter
from typing import List, Dict
import re
from textblob import TextBlob

class EnhancedThemeAnalyzer:
    """
    Unified theme taxonomy for cross-regional comparison
    9 core themes applicable to all stakeholder types and countries
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
                    'display', 'museum', 'gallery', 'tour', 'presentation',
                    'fact', 'detail', 'detailed', 'description'
                ],
                'weight': 1.0
            },
            
            'artistic_creative': {
                'display_name': 'Artistic & Creative Quality',
                'keywords': [
                    'art', 'artistic', 'creative', 'creativity', 'beautiful', 'beauty',
                    'crafts', 'craftsman', 'craftsmanship', 'design', 'aesthetic', 'gallery',
                    'artist', 'artwork', 'collection', 'masterpiece', 'piece',
                    'visual', 'handmade', 'hand made', 'music', 'musical', 'performance',
                    'perform', 'show', 'display', 'colorful', 'vibrant',
                    'sculpture', 'paint', 'painting', 'draw', 'drawing'
                ],
                'weight': 1.0
            },
            
            'atmosphere_experience': {
                'display_name': 'Atmosphere & Overall Experience',
                'keywords': [
                    'atmosphere', 'atmospheric', 'ambiance', 'ambience', 'experience',
                    'enjoyable', 'pleasant', 'memorable', 'vibe', 'feel', 'feeling',
                    'environment', 'setting', 'mood', 'wonderful', 'fantastic',
                    'amazing', 'excellent', 'great', 'good', 'nice', 'lovely',
                    'boring', 'dull', 'disappointing', 'disappointment', 'underwhelming',
                    'impressive', 'stunning', 'breathtaking', 'peaceful', 'serene'
                ],
                'weight': 1.0
            }
        }
    
    def analyze_text_for_themes(self, text: str) -> Dict[str, float]:
        """Analyze text and return theme scores"""
        text_lower = text.lower()
        theme_scores = {}
        
        for theme_key, theme_config in self.themes.items():
            # Count keyword matches
            matches = 0
            for keyword in theme_config['keywords']:
                if keyword in text_lower:
                    matches += 1
            
            # Calculate theme relevance score (0-1)
            # More matches = higher relevance
            if matches > 0:
                # Normalize by text length (per 100 words) to account for review length
                word_count = len(text.split())
                normalized_matches = (matches / max(word_count / 100, 1))
                theme_scores[theme_key] = min(normalized_matches * theme_config['weight'], 1.0)
            else:
                theme_scores[theme_key] = 0.0
        
        return theme_scores
    
    def get_sentiment_score(self, text: str) -> float:
        """Get sentiment polarity for text"""
        try:
            blob = TextBlob(text)
            return blob.sentiment.polarity
        except:
            return 0.0
    
    def extract_theme_quotes(self, reviews: List[Dict], theme_key: str, limit: int = 5) -> List[str]:
        """Extract relevant quotes for a specific theme"""
        theme_keywords = self.themes[theme_key]['keywords']
        quotes = []
        
        for review in reviews:
            text = review.get('text', '').lower()
            # Check if review mentions this theme
            if any(keyword in text for keyword in theme_keywords):
                # Get original case text for display
                original_text = review.get('text', '')
                sentiment = self.get_sentiment_score(original_text)
                quotes.append({
                    'text': original_text[:200] + '...' if len(original_text) > 200 else original_text,
                    'sentiment': sentiment,
                    'rating': review.get('rating', 0)
                })
        
        # Sort by sentiment (get both positive and negative examples)
        quotes.sort(key=lambda x: abs(x['sentiment']), reverse=True)
        return quotes[:limit]
    
    def generate_dashboard_data(self, reviews: List[Dict], stakeholder_name: str) -> Dict:
        """Generate comprehensive dashboard data with theme analysis"""
        
        # Initialize aggregators
        total_reviews = len(reviews)
        sentiment_scores = []
        ratings = []
        theme_data = {theme: {
            'scores': [],
            'sentiments': [],
            'mentions': 0,
            'quotes': []
        } for theme in self.themes.keys()}
        
        language_dist = Counter()
        year_dist = Counter()
        
        # Management response tracking
        responses = 0
        
        # Process each review
        for review in reviews:
            text = review.get('text', '')
            rating = review.get('rating', 0)
            
            if not text:
                continue
            
            # Overall sentiment
            sentiment = self.get_sentiment_score(text)
            sentiment_scores.append(sentiment)
            ratings.append(rating)
            
            # Language tracking
            lang = review.get('language', 'unknown')
            language_dist[lang] += 1
            
            # Year tracking
            date_str = review.get('date', '')
            if date_str:
                try:
                    year = date_str.split('-')[0] if '-' in date_str else date_str[:4]
                    year_dist[year] += 1
                except:
                    pass
            
            # Management response
            if review.get('management_response'):
                responses += 1
            
            # Theme analysis
            theme_scores = self.analyze_text_for_themes(text)
            for theme_key, relevance_score in theme_scores.items():
                if relevance_score > 0.1:  # Threshold for theme mention
                    theme_data[theme_key]['scores'].append(relevance_score)
                    theme_data[theme_key]['sentiments'].append(sentiment)
                    theme_data[theme_key]['mentions'] += 1
        
        # Extract quotes for each theme
        for theme_key in self.themes.keys():
            theme_data[theme_key]['quotes'] = self.extract_theme_quotes(reviews, theme_key, limit=5)
        
        # Calculate aggregates
        avg_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0
        avg_rating = sum(ratings) / len(ratings) if ratings else 0
        positive_rate = len([s for s in sentiment_scores if s > 0.1]) / len(sentiment_scores) if sentiment_scores else 0
        
        # Process theme analysis
        theme_analysis = {}
        critical_areas = []
        
        for theme_key, data in theme_data.items():
            if data['mentions'] > 0:
                avg_theme_sentiment = sum(data['sentiments']) / len(data['sentiments'])
                avg_relevance = sum(data['scores']) / len(data['scores'])
                
                # Calculate sentiment distribution
                positive = len([s for s in data['sentiments'] if s > 0.1])
                neutral = len([s for s in data['sentiments'] if -0.1 <= s <= 0.1])
                negative = len([s for s in data['sentiments'] if s < -0.1])
                
                theme_analysis[theme_key] = {
                    'average_sentiment': avg_theme_sentiment,
                    'average_relevance': avg_relevance,
                    'mention_count': data['mentions'],
                    'sentiment_distribution': {
                        'positive': positive,
                        'neutral': neutral,
                        'negative': negative
                    },
                    'quotes': data['quotes']
                }
                
                # Flag critical areas (negative sentiment + high mentions)
                if avg_theme_sentiment < -0.1 and data['mentions'] >= 3:
                    critical_areas.append({
                        'theme': self.themes[theme_key]['display_name'],
                        'sentiment': avg_theme_sentiment,
                        'mentions': data['mentions']
                    })
        
        # Sort critical areas by severity
        critical_areas.sort(key=lambda x: x['sentiment'])
        
        # Extract improvement quotes (negative reviews)
        improvement_quotes = []
        for review in reviews:
            text = review.get('text', '')
            if text:
                sentiment = self.get_sentiment_score(text)
                if sentiment < -0.2:  # Negative threshold
                    improvement_quotes.append({
                        'text': text[:200] + '...' if len(text) > 200 else text,
                        'sentiment': sentiment,
                        'rating': review.get('rating', 0)
                    })
        improvement_quotes.sort(key=lambda x: x['sentiment'])
        improvement_quotes = improvement_quotes[:5]
        
        # Management response data
        management_response = {
            'total_responses': responses,
            'response_rate': responses / total_reviews if total_reviews > 0 else 0,
            'management_response_rate': responses / total_reviews if total_reviews > 0 else 0
        }
        
        return {
            'stakeholder_name': stakeholder_name,
            'total_reviews': total_reviews,
            'average_rating': avg_rating,
            'overall_sentiment': avg_sentiment,
            'positive_rate': positive_rate,
            'language_distribution': dict(language_dist),
            'year_distribution': dict(year_dist),
            'theme_analysis': theme_analysis,
            'critical_areas': critical_areas,
            'improvement_quotes': improvement_quotes,
            'management_response': management_response
        }

