#!/usr/bin/env python3
"""
Enhanced sentiment analysis with theme-based analysis, quote extraction, and demographic insights
"""

import json
import re
from collections import defaultdict, Counter
from datetime import datetime

class EnhancedSentimentAnalyzer:
    def __init__(self, config_file='../data/config/analysis_themes.json'):
        with open(config_file, 'r') as f:
            self.config = json.load(f)
        
        self.universal_themes = self.config['universal_themes']
        self.sector_themes = self.config['sector_specific_themes']
        self.sentiment_indicators = self.config['sentiment_indicators']
        
    def analyze_review(self, review):
        """Analyze a single review for themes and sentiment"""
        text = (review.get('title', '') + ' ' + review.get('text', '')).lower()
        rating = review.get('rating', 0)
        
        # Theme analysis
        theme_scores = {}
        theme_quotes = {}
        
        for theme_name, theme_config in self.universal_themes.items():
            keywords = theme_config['keywords']
            matches = [kw for kw in keywords if kw in text]
            
            if matches:
                # Calculate theme sentiment score
                sentiment_score = self.calculate_theme_sentiment(text, matches, rating)
                theme_scores[theme_name] = sentiment_score
                
                # Extract quote for this theme
                quote = self.extract_theme_quote(review, matches, theme_name)
                if quote:
                    theme_quotes[theme_name] = quote
        
        return {
            'overall_sentiment': self.calculate_overall_sentiment(text, rating),
            'theme_scores': theme_scores,
            'theme_quotes': theme_quotes,
            'rating': rating,
            'language': review.get('language_original', 'en'),
            'user_location': review.get('user', {}).get('location', 'Unknown'),
            'review_count': review.get('user', {}).get('review_count', 0)
        }
    
    def calculate_theme_sentiment(self, text, matched_keywords, rating):
        """Calculate sentiment score for a specific theme"""
        positive_words = self.sentiment_indicators['positive']
        negative_words = self.sentiment_indicators['negative']
        
        # Count positive and negative sentiment words
        pos_count = sum(1 for word in positive_words if word in text)
        neg_count = sum(1 for word in negative_words if word in text)
        
        # Factor in rating (1-5 scale, normalize to 0-1)
        rating_score = (rating - 1) / 4  # 1→0, 5→1
        
        # Combine keyword sentiment with rating
        if pos_count > neg_count:
            sentiment_score = 0.5 + (pos_count * 0.1) + (rating_score * 0.3)
        elif neg_count > pos_count:
            sentiment_score = 0.5 - (neg_count * 0.1) - ((5 - rating) * 0.1)
        else:
            sentiment_score = 0.4 + (rating_score * 0.2)
        
        return min(1.0, max(0.0, sentiment_score))
    
    def calculate_overall_sentiment(self, text, rating):
        """Calculate overall sentiment score"""
        positive_words = self.sentiment_indicators['positive']
        negative_words = self.sentiment_indicators['negative']
        
        pos_count = sum(1 for word in positive_words if word in text)
        neg_count = sum(1 for word in negative_words if word in text)
        
        # Rating-based sentiment (primary factor)
        rating_sentiment = (rating - 1) / 4
        
        # Text-based sentiment (secondary factor)
        if pos_count > neg_count:
            text_sentiment = 0.6 + (pos_count * 0.05)
        elif neg_count > pos_count:
            text_sentiment = 0.4 - (neg_count * 0.05)
        else:
            text_sentiment = 0.5
        
        # Weighted combination
        overall_sentiment = (rating_sentiment * 0.7) + (text_sentiment * 0.3)
        return min(1.0, max(0.0, overall_sentiment))
    
    def extract_theme_quote(self, review, matched_keywords, theme_name):
        """Extract a representative quote for a theme"""
        text = review.get('text', '')
        if not text or len(text) < 20:
            return None
        
        # Find sentences that contain theme keywords
        sentences = re.split(r'[.!?]+', text)
        theme_sentences = []
        
        for sentence in sentences:
            sentence_lower = sentence.lower().strip()
            if any(keyword in sentence_lower for keyword in matched_keywords):
                if 20 <= len(sentence) <= 150:  # Good length for quotes
                    theme_sentences.append(sentence.strip())
        
        # Return the most relevant sentence
        if theme_sentences:
            return theme_sentences[0]
        return None
    
    def analyze_stakeholder(self, reviews_data):
        """Analyze all reviews for a stakeholder"""
        if isinstance(reviews_data, dict) and 'reviews' in reviews_data:
            reviews = reviews_data['reviews']
            metadata = reviews_data.get('collection_metadata', {})
        else:
            reviews = reviews_data
            metadata = {}
        
        # Analyze each review
        analysis_results = []
        for review in reviews:
            result = self.analyze_review(review)
            analysis_results.append(result)
        
        # Aggregate results
        return self.aggregate_analysis(analysis_results, metadata)
    
    def aggregate_analysis(self, results, metadata):
        """Aggregate individual review analyses"""
        stakeholder_name = metadata.get('stakeholder', 'unknown')
        total_reviews = len(results)
        
        # Overall sentiment
        overall_scores = [r['overall_sentiment'] for r in results]
        avg_sentiment = sum(overall_scores) / len(overall_scores) if overall_scores else 0
        
        # Theme analysis
        theme_analysis = defaultdict(list)
        theme_quotes = defaultdict(list)
        
        for result in results:
            for theme, score in result['theme_scores'].items():
                theme_analysis[theme].append({
                    'score': score,
                    'rating': result['rating'],
                    'language': result['language'],
                    'location': result['user_location']
                })
            
            for theme, quote in result['theme_quotes'].items():
                if quote:
                    theme_quotes[theme].append({
                        'quote': quote,
                        'rating': result['rating'],
                        'language': result['language'],
                        'sentiment': result['theme_scores'].get(theme, 0)
                    })
        
        # Calculate theme averages and insights
        theme_summary = {}
        for theme, scores in theme_analysis.items():
            if scores:
                avg_score = sum(s['score'] for s in scores) / len(scores)
                
                # Demographic breakdown
                by_language = defaultdict(list)
                by_location = defaultdict(list)
                
                for score_data in scores:
                    by_language[score_data['language']].append(score_data['score'])
                    by_location[score_data['location']].append(score_data['score'])
                
                theme_summary[theme] = {
                    'average_score': avg_score,
                    'mention_count': len(scores),
                    'percentage_mentioned': (len(scores) / total_reviews) * 100,
                    'by_language': {
                        lang: sum(scores) / len(scores) 
                        for lang, scores in by_language.items()
                    },
                    'by_location': {
                        loc: sum(scores) / len(scores) 
                        for loc, scores in by_location.items()
                    },
                    'example_quotes': theme_quotes.get(theme, [])[:3]  # Top 3 quotes
                }
        
        # Language and demographic analysis
        language_distribution = Counter(r['language'] for r in results)
        location_distribution = Counter(r['user_location'] for r in results)
        
        return {
            'stakeholder': stakeholder_name,
            'total_reviews': total_reviews,
            'overall_sentiment': avg_sentiment,
            'theme_analysis': theme_summary,
            'demographics': {
                'language_distribution': dict(language_distribution),
                'location_distribution': dict(location_distribution),
                'average_rating': sum(r['rating'] for r in results) / len(results) if results else 0
            },
            'metadata': metadata
        }

def demonstrate_analysis():
    """Demonstrate the enhanced analysis capabilities"""
    print("🔍 Enhanced Sentiment Analysis Demo")
    print("=" * 50)
    
    # Load sample data
    analyzer = EnhancedSentimentAnalyzer()
    
    try:
        with open('../data/raw_reviews/oct_2025/gambia/kunta_kinteh_island/kunta_kinteh_island_reviews_ENG.json', 'r') as f:
            data = json.load(f)
        
        # Extract reviews from the English file format
        if 'reviews' in data:
            reviews_data = data['reviews']
        else:
            reviews_data = data  # Fallback for original format
        
        # Analyze the data
        results = analyzer.analyze_stakeholder(reviews_data)
        
        print(f"📊 Analysis Results for: {results['stakeholder']}")
        print(f"Total Reviews: {results['total_reviews']}")
        print(f"Overall Sentiment: {results['overall_sentiment']:.2f}")
        print(f"Average Rating: {results['demographics']['average_rating']:.1f}")
        print()
        
        # Theme analysis
        print("🎯 THEME ANALYSIS:")
        for theme, analysis in results['theme_analysis'].items():
            print(f"\n{theme.upper()}:")
            print(f"  Score: {analysis['average_score']:.2f}")
            print(f"  Mentions: {analysis['mention_count']} ({analysis['percentage_mentioned']:.1f}%)")
            
            # By language breakdown
            if analysis['by_language']:
                print(f"  By Language:")
                for lang, score in analysis['by_language'].items():
                    print(f"    {lang}: {score:.2f}")
            
            # Example quotes
            if analysis['example_quotes']:
                print(f"  Example Quotes:")
                for quote_data in analysis['example_quotes'][:2]:
                    print(f"    \"{quote_data['quote'][:100]}...\" ({quote_data['rating']}/5)")
        
        # Demographic insights
        print(f"\n🌍 DEMOGRAPHIC INSIGHTS:")
        print(f"Languages: {results['demographics']['language_distribution']}")
        print(f"Top Locations: {dict(list(results['demographics']['location_distribution'].items())[:3])}")
        
    except FileNotFoundError:
        print("❌ Sample data file not found. Please ensure Kunta Kinteh data is available.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    demonstrate_analysis()
