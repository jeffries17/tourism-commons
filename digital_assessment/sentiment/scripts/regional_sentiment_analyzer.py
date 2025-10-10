#!/usr/bin/env python3
"""
Comprehensive Regional Sentiment Analyzer
Analyzes regional competitor reviews with country, sector, and traveler persona insights
"""

import json
import os
import glob
from pathlib import Path
from datetime import datetime
from collections import defaultdict, Counter
from typing import List, Dict, Tuple
import re

# Sentiment analysis
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

class RegionalSentimentAnalyzer:
    def __init__(self):
        self.vader = SentimentIntensityAnalyzer()
        
        # Theme keywords for creative tourism
        self.theme_keywords = {
            'cultural_heritage': ['culture', 'heritage', 'history', 'historical', 'traditional', 'authentic', 'colonial', 'slave', 'slavery'],
            'art_creativity': ['art', 'artist', 'creative', 'gallery', 'exhibition', 'craft', 'handmade', 'artisan', 'painting', 'sculpture'],
            'music_performance': ['music', 'performance', 'concert', 'show', 'festival', 'dance', 'singer', 'band', 'live'],
            'educational_value': ['learn', 'educational', 'informative', 'guide', 'tour', 'explanation', 'knowledge', 'interesting', 'fascinating'],
            'atmosphere_experience': ['atmosphere', 'experience', 'ambiance', 'feeling', 'vibe', 'beautiful', 'stunning', 'amazing', 'wonderful'],
            'staff_service': ['staff', 'guide', 'friendly', 'helpful', 'service', 'welcome', 'hospitality', 'professional'],
            'facilities_infrastructure': ['building', 'facility', 'clean', 'maintained', 'restoration', 'preserved', 'structure', 'architecture'],
            'value_pricing': ['price', 'value', 'expensive', 'cheap', 'worth', 'cost', 'fee', 'ticket', 'affordable'],
            'accessibility_location': ['access', 'location', 'reach', 'transport', 'parking', 'easy', 'difficult', 'find'],
        }
        
        # Sector mapping
        self.sector_mapping = {
            'Cultural heritage sites/museums': 'Museums & Heritage',
            'Crafts and artisan products': 'Crafts & Artisans',
            'Performing and visual arts': 'Performing Arts',
            'Music (artists, production, venues, education)': 'Music & Venues',
            'Festivals and cultural events': 'Festivals',
            'Fashion & Design': 'Fashion & Design',
            'Marketing/advertising/publishing': 'Media & Publishing',
        }
        
        # Language to country/region mapping for traveler personas
        self.language_to_region = {
            'en': 'English-speaking (Global)',
            'nl': 'Dutch/Belgian',
            'fr': 'French-speaking',
            'de': 'German-speaking',
            'es': 'Spanish-speaking',
            'pt': 'Portuguese-speaking',
            'it': 'Italian',
            'other': 'Other International'
        }
    
    def analyze_sentiment(self, text: str) -> Dict:
        """Analyze sentiment of text using VADER"""
        scores = self.vader.polarity_scores(text)
        return {
            'compound': scores['compound'],
            'positive': scores['pos'],
            'neutral': scores['neu'],
            'negative': scores['neg'],
            'label': 'positive' if scores['compound'] >= 0.05 else ('negative' if scores['compound'] <= -0.05 else 'neutral')
        }
    
    def extract_themes(self, text: str) -> Dict[str, int]:
        """Extract theme mentions from text"""
        text_lower = text.lower()
        themes = {}
        
        for theme, keywords in self.theme_keywords.items():
            count = sum(1 for keyword in keywords if keyword in text_lower)
            if count > 0:
                themes[theme] = count
        
        return themes
    
    def analyze_review(self, review: Dict) -> Dict:
        """Analyze a single review"""
        combined_text = f"{review.get('title', '')} {review.get('text', '')}"
        
        sentiment = self.analyze_sentiment(combined_text)
        themes = self.extract_themes(combined_text)
        
        # Extract metadata
        language = review.get('language_detected', 'en')
        rating = review.get('rating', 0)
        year = review.get('date', '')[:4] if review.get('date') else 'unknown'
        
        # User location
        user_location = review.get('user', {}).get('location', 'Unknown')
        
        return {
            'sentiment': sentiment,
            'themes': themes,
            'rating': rating,
            'language': language,
            'year': year,
            'user_location': user_location,
            'text_length': len(combined_text),
            'review_text': combined_text[:200]  # Sample for quotes
        }
    
    def analyze_stakeholder(self, reviews: List[Dict], stakeholder_name: str, country: str, sector: str) -> Dict:
        """Analyze all reviews for a stakeholder"""
        print(f"  🔍 Analyzing {stakeholder_name}...")
        
        analyzed_reviews = [self.analyze_review(r) for r in reviews]
        
        # Aggregate sentiment
        sentiments = [r['sentiment']['compound'] for r in analyzed_reviews]
        ratings = [r['rating'] for r in analyzed_reviews if r['rating'] > 0]
        
        # Theme analysis
        theme_scores = defaultdict(lambda: {'scores': [], 'mentions': 0})
        for review in analyzed_reviews:
            for theme, count in review['themes'].items():
                theme_scores[theme]['mentions'] += count
                theme_scores[theme]['scores'].append(review['sentiment']['compound'])
        
        # Language/traveler analysis
        language_dist = Counter(r['language'] for r in analyzed_reviews)
        year_dist = Counter(r['year'] for r in analyzed_reviews)
        
        # Calculate theme averages
        theme_analysis = {}
        for theme, data in theme_scores.items():
            if data['scores']:
                theme_analysis[theme] = {
                    'avg_sentiment': round(sum(data['scores']) / len(data['scores']), 3),
                    'mentions': data['mentions'],
                    'reviews_mentioning': len(data['scores'])
                }
        
        # Find best and worst reviews for quotes
        sorted_reviews = sorted(analyzed_reviews, key=lambda x: x['sentiment']['compound'], reverse=True)
        positive_quotes = [r['review_text'] for r in sorted_reviews[:3] if r['sentiment']['compound'] > 0.3]
        
        sorted_reviews_neg = sorted(analyzed_reviews, key=lambda x: x['sentiment']['compound'])
        negative_quotes = [r['review_text'] for r in sorted_reviews_neg[:3] if r['sentiment']['compound'] < -0.1]
        
        return {
            'stakeholder_name': stakeholder_name,
            'country': country,
            'sector': sector,
            'sector_category': self.sector_mapping.get(sector, 'Other'),
            
            # Core metrics
            'total_reviews': len(reviews),
            'avg_sentiment': round(sum(sentiments) / len(sentiments), 3) if sentiments else 0,
            'avg_rating': round(sum(ratings) / len(ratings), 2) if ratings else 0,
            'positive_rate': round(sum(1 for s in sentiments if s >= 0.05) / len(sentiments) * 100, 1) if sentiments else 0,
            
            # Sentiment distribution
            'sentiment_distribution': {
                'positive': sum(1 for s in sentiments if s >= 0.05),
                'neutral': sum(1 for s in sentiments if -0.05 < s < 0.05),
                'negative': sum(1 for s in sentiments if s <= -0.05)
            },
            
            # Theme analysis
            'theme_analysis': theme_analysis,
            
            # Traveler demographics
            'language_distribution': dict(language_dist),
            'traveler_personas': {self.language_to_region.get(lang, 'Other'): count 
                                 for lang, count in language_dist.items()},
            'year_distribution': dict(year_dist),
            
            # Quotes
            'positive_quotes': positive_quotes,
            'negative_quotes': negative_quotes,
            
            # Top themes
            'top_themes': sorted(theme_analysis.items(), 
                               key=lambda x: x[1]['avg_sentiment'], 
                               reverse=True)[:3] if theme_analysis else []
        }
    
    def aggregate_by_country(self, stakeholders: List[Dict]) -> Dict:
        """Aggregate analysis by country"""
        country_data = {}
        
        for country in set(s['country'] for s in stakeholders):
            country_stakeholders = [s for s in stakeholders if s['country'] == country]
            
            # Aggregate metrics
            total_reviews = sum(s['total_reviews'] for s in country_stakeholders)
            avg_sentiment = sum(s['avg_sentiment'] * s['total_reviews'] for s in country_stakeholders) / total_reviews if total_reviews > 0 else 0
            avg_rating = sum(s['avg_rating'] * s['total_reviews'] for s in country_stakeholders if s['avg_rating'] > 0) / total_reviews if total_reviews > 0 else 0
            
            # Aggregate themes
            country_themes = defaultdict(lambda: {'sentiment_scores': [], 'mentions': 0})
            for stakeholder in country_stakeholders:
                for theme, data in stakeholder['theme_analysis'].items():
                    country_themes[theme]['sentiment_scores'].append(data['avg_sentiment'])
                    country_themes[theme]['mentions'] += data['mentions']
            
            theme_summary = {
                theme: {
                    'avg_sentiment': round(sum(data['sentiment_scores']) / len(data['sentiment_scores']), 3),
                    'total_mentions': data['mentions'],
                    'stakeholders_mentioning': len(data['sentiment_scores'])
                }
                for theme, data in country_themes.items()
                if data['sentiment_scores']
            }
            
            # Aggregate traveler personas
            country_travelers = defaultdict(int)
            for stakeholder in country_stakeholders:
                for persona, count in stakeholder['traveler_personas'].items():
                    country_travelers[persona] += count
            
            # Sector distribution
            sector_dist = Counter(s['sector_category'] for s in country_stakeholders)
            
            country_data[country] = {
                'total_stakeholders': len(country_stakeholders),
                'total_reviews': total_reviews,
                'avg_sentiment': round(avg_sentiment, 3),
                'avg_rating': round(avg_rating, 2),
                'theme_analysis': theme_summary,
                'traveler_personas': dict(country_travelers),
                'sector_distribution': dict(sector_dist),
                'top_performers': sorted(country_stakeholders, 
                                       key=lambda x: x['avg_sentiment'], 
                                       reverse=True)[:5]
            }
        
        return country_data
    
    def aggregate_by_sector(self, stakeholders: List[Dict]) -> Dict:
        """Aggregate analysis by sector"""
        sector_data = {}
        
        for sector in set(s['sector_category'] for s in stakeholders):
            sector_stakeholders = [s for s in stakeholders if s['sector_category'] == sector]
            
            total_reviews = sum(s['total_reviews'] for s in sector_stakeholders)
            avg_sentiment = sum(s['avg_sentiment'] * s['total_reviews'] for s in sector_stakeholders) / total_reviews if total_reviews > 0 else 0
            avg_rating = sum(s['avg_rating'] * s['total_reviews'] for s in sector_stakeholders if s['avg_rating'] > 0) / total_reviews if total_reviews > 0 else 0
            
            # Country distribution within sector
            country_dist = Counter(s['country'] for s in sector_stakeholders)
            
            # Aggregate themes for sector
            sector_themes = defaultdict(lambda: {'sentiment_scores': [], 'mentions': 0})
            for stakeholder in sector_stakeholders:
                for theme, data in stakeholder['theme_analysis'].items():
                    sector_themes[theme]['sentiment_scores'].append(data['avg_sentiment'])
                    sector_themes[theme]['mentions'] += data['mentions']
            
            theme_summary = {
                theme: {
                    'avg_sentiment': round(sum(data['sentiment_scores']) / len(data['sentiment_scores']), 3),
                    'total_mentions': data['mentions']
                }
                for theme, data in sector_themes.items()
                if data['sentiment_scores']
            }
            
            sector_data[sector] = {
                'total_stakeholders': len(sector_stakeholders),
                'total_reviews': total_reviews,
                'avg_sentiment': round(avg_sentiment, 3),
                'avg_rating': round(avg_rating, 2),
                'theme_analysis': theme_summary,
                'country_distribution': dict(country_dist),
                'top_performers': sorted(sector_stakeholders, 
                                       key=lambda x: x['avg_sentiment'], 
                                       reverse=True)[:3]
            }
        
        return sector_data
    
    def create_traveler_personas(self, all_stakeholders: List[Dict]) -> Dict:
        """Create traveler personas based on language/origin and preferences"""
        personas = {}
        
        # Aggregate by language/region
        for region in set(self.language_to_region.values()):
            region_reviews = []
            region_sentiments = []
            region_themes = defaultdict(list)
            
            for stakeholder in all_stakeholders:
                for persona, count in stakeholder['traveler_personas'].items():
                    if persona == region:
                        region_reviews.append(count)
                        region_sentiments.append(stakeholder['avg_sentiment'])
                        
                        # Collect theme preferences
                        for theme, data in stakeholder['theme_analysis'].items():
                            region_themes[theme].append(data['avg_sentiment'])
            
            if region_reviews:
                # Top themes for this persona
                theme_preferences = {
                    theme: round(sum(scores) / len(scores), 3)
                    for theme, scores in region_themes.items()
                    if scores
                }
                
                personas[region] = {
                    'total_reviews': sum(region_reviews),
                    'avg_sentiment': round(sum(region_sentiments) / len(region_sentiments), 3) if region_sentiments else 0,
                    'theme_preferences': dict(sorted(theme_preferences.items(), 
                                                    key=lambda x: x[1], 
                                                    reverse=True)[:5]),
                    'engagement_level': 'High' if sum(region_reviews) > 100 else 'Medium' if sum(region_reviews) > 50 else 'Low'
                }
        
        return personas
    
    def run_analysis(self):
        """Run complete regional sentiment analysis"""
        print("🌍 REGIONAL SENTIMENT ANALYSIS")
        print("=" * 70)
        
        base_path = Path("../data/sentiment_data/raw_reviews/oct_2025")
        countries = ['benin', 'cape_verde', 'ghana', 'nigeria', 'senegal']
        
        all_stakeholders = []
        
        for country in countries:
            country_path = base_path / country / "creative_industries"
            
            if not country_path.exists():
                continue
            
            # Find all English review files
            pattern = str(country_path / "**/*_reviews_ENG.json")
            files = glob.glob(pattern, recursive=True)
            
            if not files:
                continue
            
            print(f"\n📍 {country.replace('_', ' ').title()}: {len(files)} stakeholders")
            
            for file_path in files:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    # Extract reviews from data structure
                    reviews = data.get('reviews', data) if isinstance(data, dict) else data
                    
                    if not reviews or not isinstance(reviews, list):
                        continue
                    
                    # Get metadata from master file
                    master_file = Path(file_path).parent / f"{Path(file_path).parent.name}_master.json"
                    if master_file.exists():
                        with open(master_file, 'r') as f:
                            master_data = json.load(f)
                        stakeholder_name = master_data['name']
                        sector = master_data['sector']
                    else:
                        stakeholder_name = Path(file_path).parent.name.replace('_', ' ').title()
                        sector = 'Unknown'
                    
                    # Analyze
                    analysis = self.analyze_stakeholder(
                        reviews, 
                        stakeholder_name, 
                        country.replace('_', ' ').title(),
                        sector
                    )
                    all_stakeholders.append(analysis)
                    
                except Exception as e:
                    print(f"   ❌ Error: {e}")
                    continue
        
        if not all_stakeholders:
            print("❌ No stakeholders analyzed")
            return None
        
        print(f"\n✅ Analyzed {len(all_stakeholders)} stakeholders")
        
        # Generate aggregated insights
        print("\n📊 Generating aggregated insights...")
        country_insights = self.aggregate_by_country(all_stakeholders)
        sector_insights = self.aggregate_by_sector(all_stakeholders)
        traveler_personas = self.create_traveler_personas(all_stakeholders)
        
        # Create comprehensive results
        results = {
            'summary': {
                'total_stakeholders': len(all_stakeholders),
                'total_reviews': sum(s['total_reviews'] for s in all_stakeholders),
                'avg_sentiment': round(sum(s['avg_sentiment'] * s['total_reviews'] for s in all_stakeholders) / 
                                     sum(s['total_reviews'] for s in all_stakeholders), 3),
                'avg_rating': round(sum(s['avg_rating'] * s['total_reviews'] for s in all_stakeholders if s['avg_rating'] > 0) / 
                                  sum(s['total_reviews'] for s in all_stakeholders if s['avg_rating'] > 0), 2),
                'countries_analyzed': len(country_insights),
                'sectors_analyzed': len(sector_insights),
            },
            'stakeholder_data': all_stakeholders,
            'by_country': country_insights,
            'by_sector': sector_insights,
            'traveler_personas': traveler_personas,
            'generated_at': datetime.now().isoformat()
        }
        
        # Save results
        output_dir = Path("../output/regional_sentiment")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        output_file = output_dir / "regional_sentiment_analysis.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Results saved: {output_file}")
        
        # Print summary
        self.print_summary(results)
        
        return results
    
    def print_summary(self, results: Dict):
        """Print analysis summary"""
        print("\n" + "=" * 70)
        print("📊 ANALYSIS SUMMARY")
        print("=" * 70)
        
        summary = results['summary']
        print(f"\n🌍 Overall:")
        print(f"   Stakeholders: {summary['total_stakeholders']}")
        print(f"   Total Reviews: {summary['total_reviews']:,}")
        print(f"   Avg Sentiment: {summary['avg_sentiment']:.3f}")
        print(f"   Avg Rating: {summary['avg_rating']:.1f}/5")
        
        print(f"\n📍 By Country:")
        for country, data in sorted(results['by_country'].items(), 
                                   key=lambda x: x[1]['avg_sentiment'], 
                                   reverse=True):
            print(f"   {country}: {data['avg_sentiment']:.3f} sentiment, {data['total_reviews']:,} reviews")
        
        print(f"\n🎯 By Sector:")
        for sector, data in sorted(results['by_sector'].items(), 
                                  key=lambda x: x[1]['avg_sentiment'], 
                                  reverse=True):
            print(f"   {sector}: {data['avg_sentiment']:.3f} sentiment, {data['total_reviews']:,} reviews")
        
        print(f"\n👥 Traveler Personas:")
        for persona, data in sorted(results['traveler_personas'].items(), 
                                   key=lambda x: x[1]['total_reviews'], 
                                   reverse=True):
            print(f"   {persona}: {data['total_reviews']:,} reviews, {data['engagement_level']} engagement")

if __name__ == "__main__":
    analyzer = RegionalSentimentAnalyzer()
    analyzer.run_analysis()

