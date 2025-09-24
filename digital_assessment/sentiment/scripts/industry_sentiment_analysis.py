#!/usr/bin/env python3
"""
Industry-specific sentiment analysis with theme-based analysis for creative industries and tour operators
"""

import json
import re
import glob
import os
from collections import defaultdict, Counter
from datetime import datetime
import numpy as np

class IndustrySentimentAnalyzer:
    def __init__(self, config_file='/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/data/sentiment_data/config/industry_themes.json'):
        with open(config_file, 'r') as f:
            self.config = json.load(f)
        
        self.creative_industries_themes = self.config['creative_industries_themes']
        self.tour_operators_themes = self.config['tour_operators_themes']
        self.sentiment_indicators = self.config['sentiment_indicators']
        
    def determine_industry(self, file_path):
        """Determine industry based on file path"""
        if 'tour_operators' in file_path:
            return 'tour_operators'
        elif 'creative_industries' in file_path:
            return 'creative_industries'
        else:
            # Default to creative industries for backward compatibility
            return 'creative_industries'
    
    def get_themes_for_industry(self, industry):
        """Get themes for specific industry"""
        if industry == 'tour_operators':
            return self.tour_operators_themes
        else:
            return self.creative_industries_themes
    
    def analyze_review(self, review, industry):
        """Analyze a single review for themes and sentiment"""
        text = (review.get('title', '') + ' ' + review.get('text', '')).lower()
        rating = review.get('rating', 0)
        
        # Get themes for this industry
        themes = self.get_themes_for_industry(industry)
        
        # Theme analysis
        theme_scores = {}
        theme_quotes = {}
        
        for theme_name, theme_config in themes.items():
            keywords = theme_config['keywords']
            matches = [kw for kw in keywords if kw in text]
            
            if matches:
                # Calculate theme sentiment score
                sentiment_score = self.calculate_theme_sentiment(text, matches, rating)
                theme_scores[theme_name] = {
                    'score': sentiment_score,
                    'mentions': len(matches),
                    'weight': theme_config['weight']
                }
                
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
        
        # Count positive and negative words in the text
        positive_count = sum(1 for word in positive_words if word in text)
        negative_count = sum(1 for word in negative_words if word in text)
        
        # Base sentiment from rating (0-1 scale)
        rating_sentiment = (rating - 1) / 4  # Convert 1-5 to 0-1
        
        # Adjust based on word sentiment
        word_sentiment = (positive_count - negative_count) / max(1, positive_count + negative_count)
        
        # Combine rating and word sentiment
        final_sentiment = (rating_sentiment * 0.7) + (word_sentiment * 0.3)
        
        return max(0, min(1, final_sentiment))  # Clamp between 0 and 1
    
    def calculate_overall_sentiment(self, text, rating):
        """Calculate overall sentiment score for the review"""
        positive_words = self.sentiment_indicators['positive']
        negative_words = self.sentiment_indicators['negative']
        
        positive_count = sum(1 for word in positive_words if word in text)
        negative_count = sum(1 for word in negative_words if word in text)
        
        # Base sentiment from rating
        rating_sentiment = (rating - 1) / 4
        
        # Word sentiment
        total_words = positive_count + negative_count
        if total_words > 0:
            word_sentiment = (positive_count - negative_count) / total_words
        else:
            word_sentiment = 0
        
        # Combine with weights
        final_sentiment = (rating_sentiment * 0.6) + (word_sentiment * 0.4)
        
        return max(0, min(1, final_sentiment))
    
    def extract_theme_quote(self, review, matched_keywords, theme_name):
        """Extract a relevant quote for the theme"""
        text = review.get('text', '')
        if len(text) < 50:
            return None
        
        # Find sentences containing the matched keywords
        sentences = re.split(r'[.!?]+', text)
        relevant_sentences = []
        
        for sentence in sentences:
            if any(keyword in sentence.lower() for keyword in matched_keywords):
                relevant_sentences.append(sentence.strip())
        
        if relevant_sentences:
            # Return the first relevant sentence, truncated if too long
            quote = relevant_sentences[0]
            if len(quote) > 150:
                quote = quote[:147] + "..."
            return quote
        
        return None
    
    def analyze_stakeholder(self, stakeholder_name, reviews, industry):
        """Analyze all reviews for a single stakeholder"""
        if not reviews:
            return None
        
        total_reviews = len(reviews)
        ratings = [r.get('rating', 0) for r in reviews]
        average_rating = sum(ratings) / total_reviews if total_reviews > 0 else 0
        
        # Analyze each review
        review_analyses = [self.analyze_review(review, industry) for review in reviews]
        
        # Calculate overall metrics
        overall_sentiments = [ra['overall_sentiment'] for ra in review_analyses]
        average_sentiment = sum(overall_sentiments) / len(overall_sentiments) if overall_sentiments else 0
        
        positive_reviews = sum(1 for s in overall_sentiments if s > 0.6)
        positive_rate = (positive_reviews / len(overall_sentiments)) * 100 if overall_sentiments else 0
        
        # Aggregate theme scores
        theme_aggregates = defaultdict(lambda: {'total_score': 0, 'total_mentions': 0, 'count': 0})
        theme_quotes_aggregate = defaultdict(list)
        
        for analysis in review_analyses:
            for theme, data in analysis['theme_scores'].items():
                theme_aggregates[theme]['total_score'] += data['score']
                theme_aggregates[theme]['total_mentions'] += data['mentions']
                theme_aggregates[theme]['count'] += 1
            
            for theme, quote in analysis['theme_quotes'].items():
                if quote and len(theme_quotes_aggregate[theme]) < 3:
                    theme_quotes_aggregate[theme].append(quote)
        
        # Calculate average theme scores
        theme_scores = {}
        for theme, data in theme_aggregates.items():
            if data['count'] > 0:
                theme_scores[theme] = {
                    'score': data['total_score'] / data['count'],
                    'mentions': data['total_mentions']
                }
        
        # Identify critical areas (themes with low scores)
        critical_areas = []
        for theme, data in theme_scores.items():
            if data['score'] < 0.4 and data['mentions'] >= 2:  # Low score with sufficient mentions
                priority = 'high' if data['score'] < 0.3 else 'medium'
                critical_areas.append({
                    'theme': theme.replace('_', ' ').title(),
                    'sentiment_score': data['score'],
                    'mention_count': data['mentions'],
                    'quotes': theme_quotes_aggregate[theme][:2],  # Top 2 quotes
                    'priority': priority
                })
        
        # Sort critical areas by priority and score
        critical_areas.sort(key=lambda x: (x['priority'] == 'high', -x['sentiment_score']))
        
        # Calculate key strengths and weaknesses
        key_strengths = []
        key_weaknesses = []
        
        for theme, data in theme_scores.items():
            if data['mentions'] >= 3:  # Only include themes with sufficient mentions
                theme_display = theme.replace('_', ' ').title()
                if data['score'] >= 0.7:
                    key_strengths.append({'theme': theme_display, 'score': data['score']})
                elif data['score'] <= 0.4:
                    key_weaknesses.append({'theme': theme_display, 'score': data['score']})
        
        # Sort by score
        key_strengths.sort(key=lambda x: x['score'], reverse=True)
        key_weaknesses.sort(key=lambda x: x['score'])
        
        # Language distribution
        languages = [ra['language'] for ra in review_analyses]
        language_distribution = dict(Counter(languages))
        
        # Year distribution
        years = []
        for review in reviews:
            pub_date = review.get('publishedDate', '')
            if pub_date:
                try:
                    year = pub_date.split('-')[0]
                    years.append(year)
                except:
                    pass
        year_distribution = dict(Counter(years))
        
        # Management response analysis
        responses = [r.get('ownerResponse') for r in reviews]
        total_responses = sum(1 for r in responses if r)
        response_rate = (total_responses / total_reviews) * 100 if total_reviews > 0 else 0
        
        return {
            'stakeholder_name': stakeholder_name,
            'industry': industry,
            'total_reviews': total_reviews,
            'average_rating': round(average_rating, 1),
            'overall_sentiment': round(average_sentiment, 3),
            'positive_rate': round(positive_rate, 1),
            'language_distribution': language_distribution,
            'year_distribution': year_distribution,
            'theme_scores': {k: {'score': round(v['score'], 3), 'mentions': v['mentions']} for k, v in theme_scores.items()},
            'theme_quotes': {k: v for k, v in theme_quotes_aggregate.items()},
            'critical_areas': critical_areas,
            'key_strengths': key_strengths[:5],  # Top 5
            'key_weaknesses': key_weaknesses[:5],  # Top 5
            'management_response': {
                'response_rate': round(response_rate, 1),
                'total_responses': total_responses,
                'total_reviews': total_reviews,
                'gap_opportunity': total_reviews - total_responses
            },
            'analysis_date': datetime.now().isoformat()
        }
    
    def run_industry_analysis(self, industry, base_dir="/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/data/sentiment_data/raw_reviews/oct_2025/gambia"):
        """Run analysis for a specific industry"""
        print(f"🚀 Starting {industry.replace('_', ' ').title()} Sentiment Analysis")
        print("=" * 60)
        
        # Find all review files for this industry
        pattern = f"{base_dir}/{industry}/**/*_reviews_ENG.json"
        files = glob.glob(pattern, recursive=True)
        
        if not files:
            print(f"❌ No English review files found for {industry}")
            return None
        
        print(f"📁 Found {len(files)} review files")
        
        stakeholder_data = []
        
        for file_path in files:
            try:
                # Extract stakeholder name from file path
                stakeholder_name = os.path.basename(file_path).replace('_reviews_ENG.json', '')
                
                print(f"📊 Analyzing {stakeholder_name}...")
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Handle different file structures
                if isinstance(data, list):
                    reviews = data
                elif isinstance(data, dict) and 'reviews' in data:
                    reviews = data['reviews']
                else:
                    print(f"  ⚠️  Unexpected file structure in {file_path}")
                    continue
                
                if not reviews:
                    print(f"  ⚠️  No reviews found in {file_path}")
                    continue
                
                # Analyze stakeholder
                analysis = self.analyze_stakeholder(stakeholder_name, reviews, industry)
                if analysis:
                    stakeholder_data.append(analysis)
                    print(f"  ✅ Analyzed {len(reviews)} reviews")
                
            except Exception as e:
                print(f"  ❌ Error processing {file_path}: {str(e)}")
                continue
        
        if not stakeholder_data:
            print(f"❌ No stakeholder data generated for {industry}")
            return None
        
        # Calculate summary statistics
        total_stakeholders = len(stakeholder_data)
        total_reviews = sum(s['total_reviews'] for s in stakeholder_data)
        average_sentiment = sum(s['overall_sentiment'] for s in stakeholder_data) / total_stakeholders
        average_rating = sum(s['average_rating'] for s in stakeholder_data) / total_stakeholders
        
        # Aggregate language distribution
        language_distribution = defaultdict(int)
        for stakeholder in stakeholder_data:
            for lang, count in stakeholder['language_distribution'].items():
                language_distribution[lang] += count
        
        # Calculate theme averages
        theme_averages = defaultdict(lambda: {'total_score': 0, 'total_mentions': 0, 'count': 0})
        for stakeholder in stakeholder_data:
            for theme, data in stakeholder['theme_scores'].items():
                theme_averages[theme]['total_score'] += data['score']
                theme_averages[theme]['total_mentions'] += data['mentions']
                theme_averages[theme]['count'] += 1
        
        # Calculate average theme scores
        for theme, data in theme_averages.items():
            if data['count'] > 0:
                data['average_score'] = data['total_score'] / data['count']
        
        # Get top and bottom performers
        sorted_stakeholders = sorted(stakeholder_data, key=lambda x: x['overall_sentiment'], reverse=True)
        top_performers = sorted_stakeholders[:3]
        underperformers = sorted_stakeholders[-3:]
        
        # Aggregate critical areas
        all_critical_areas = []
        for stakeholder in stakeholder_data:
            all_critical_areas.extend(stakeholder['critical_areas'])
        
        # Count critical areas by theme
        critical_areas_sector = defaultdict(int)
        for area in all_critical_areas:
            critical_areas_sector[area['theme']] += 1
        
        summary = {
            'total_stakeholders': total_stakeholders,
            'total_reviews': total_reviews,
            'average_sentiment': round(average_sentiment, 3),
            'average_rating': round(average_rating, 1),
            'language_distribution': dict(language_distribution),
            'theme_averages': {k: {'average_score': round(v['average_score'], 3), 'total_mentions': v['total_mentions'], 'stakeholder_count': v['count']} for k, v in theme_averages.items()},
            'critical_areas_sector': dict(critical_areas_sector),
            'top_performers': top_performers,
            'underperformers': underperformers,
            'analysis_date': datetime.now().isoformat()
        }
        
        result = {
            'summary': summary,
            'stakeholder_data': stakeholder_data
        }
        
        print(f"✅ Analysis complete!")
        print(f"   📊 {total_stakeholders} stakeholders analyzed")
        print(f"   📝 {total_reviews} total reviews")
        print(f"   😊 Average sentiment: {average_sentiment:.3f}")
        print(f"   ⭐ Average rating: {average_rating:.1f}")
        
        return result

def main():
    analyzer = IndustrySentimentAnalyzer()
    
    # Run analysis only for tour operators (creative industries already done)
    industry = 'tour_operators'
    
    result = analyzer.run_industry_analysis(industry)
    
    if result:
        # Save results
        output_file = f"/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/{industry}_sentiment_analysis_results.json"
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Results saved to {output_file}")
        
        # Generate CSV for Google Sheets
        csv_file = f"/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/{industry}_sentiment_analysis_google_sheets.csv"
        generate_csv(result, csv_file)
        print(f"📊 CSV saved to {csv_file}")
    else:
        print("❌ No results generated")

def generate_csv(result, filename):
    """Generate CSV file for Google Sheets import"""
    import csv
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        
        # Header
        writer.writerow([
            'Stakeholder Name', 'Industry', 'Total Reviews', 'Average Rating', 
            'Overall Sentiment', 'Positive Rate', 'Language Distribution',
            'Critical Areas Count', 'Management Response Rate', 'Analysis Date'
        ])
        
        # Data rows
        for stakeholder in result['stakeholder_data']:
            writer.writerow([
                stakeholder['stakeholder_name'],
                stakeholder['industry'],
                stakeholder['total_reviews'],
                stakeholder['average_rating'],
                stakeholder['overall_sentiment'],
                stakeholder['positive_rate'],
                json.dumps(stakeholder['language_distribution']),
                len(stakeholder['critical_areas']),
                stakeholder['management_response']['response_rate'],
                stakeholder['analysis_date']
            ])

if __name__ == "__main__":
    main()
