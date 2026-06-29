#!/usr/bin/env python3
"""
Comprehensive Sentiment Analysis with Deep Theme Analysis
Generates detailed insights matching the quality of previous analysis
"""

import json
import os
import glob
from datetime import datetime
from typing import List, Dict
from enhanced_theme_analysis import EnhancedThemeAnalyzer
from collections import defaultdict, Counter
import numpy as np

class ComprehensiveSentimentAnalyzer:
    def __init__(self):
        self.theme_analyzer = EnhancedThemeAnalyzer()
        self.results = {
            'summary': {},
            'stakeholder_data': [],
            'sector_insights': {},
            'critical_areas': {},
            'generated_at': datetime.now().isoformat()
        }

    def analyze_stakeholder_comprehensive(self, reviews: List[Dict], stakeholder_name: str, source: str = 'unknown') -> Dict:
        """Perform comprehensive analysis for a single stakeholder"""
        print(f"🔍 Analyzing {stakeholder_name}...")
        
        # Generate dashboard data
        dashboard_data = self.theme_analyzer.generate_dashboard_data(reviews, stakeholder_name)
        
        # Extract key insights
        insights = {
            'stakeholder_name': stakeholder_name,
            'source': source,  # 'gambia_creative', 'gambia_operators', 'regional'
            'total_reviews': dashboard_data['total_reviews'],
            'average_rating': dashboard_data['average_rating'],
            'overall_sentiment': dashboard_data['overall_sentiment'],
            'positive_rate': dashboard_data['positive_rate'],
            'language_distribution': dashboard_data['language_distribution'],
            'year_distribution': dashboard_data['year_distribution'],
            
            # Theme-specific analysis
            'theme_scores': {},
            'theme_quotes': {},
            'critical_areas': dashboard_data['critical_areas'],
            'improvement_quotes': dashboard_data['improvement_quotes'],
            'management_response': dashboard_data['management_response'],
            
            # Key strengths and weaknesses
            'key_strengths': [],
            'key_weaknesses': [],
            'sector_insights': {}
        }
        
        # Process theme analysis
        for theme, data in dashboard_data['theme_analysis'].items():
            insights['theme_scores'][theme] = {
                'score': round(data['average_sentiment'], 2),
                'mentions': data['mention_count'],
                'distribution': data['sentiment_distribution']
            }
            insights['theme_quotes'][theme] = data['quotes'][:3]  # Top 3 quotes
        
        # Identify key strengths (positive themes)
        strengths = [(theme, data['average_sentiment']) for theme, data in dashboard_data['theme_analysis'].items() 
                    if data['average_sentiment'] > 0.3]
        strengths.sort(key=lambda x: x[1], reverse=True)
        insights['key_strengths'] = [{'theme': theme, 'score': score} for theme, score in strengths[:3]]
        
        # Identify key weaknesses (negative themes)
        weaknesses = [(theme, data['average_sentiment']) for theme, data in dashboard_data['theme_analysis'].items() 
                     if data['average_sentiment'] < -0.1]
        weaknesses.sort(key=lambda x: x[1])
        insights['key_weaknesses'] = [{'theme': theme, 'score': score} for theme, score in weaknesses[:3]]
        
        return insights

    def analyze_sector_insights(self, all_stakeholder_data: List[Dict]) -> Dict:
        """Analyze insights across the entire sector"""
        sector_insights = {
            'total_stakeholders': len(all_stakeholder_data),
            'total_reviews': sum(s['total_reviews'] for s in all_stakeholder_data),
            'average_sentiment': np.mean([s['overall_sentiment'] for s in all_stakeholder_data]),
            'average_rating': np.mean([s['average_rating'] for s in all_stakeholder_data]),
            'language_distribution': {},
            'theme_performance': defaultdict(list),
            'critical_areas_sector': [],
            'management_response_sector': {},
            'top_performers': [],
            'underperformers': []
        }
        
        # Aggregate language distribution
        for stakeholder in all_stakeholder_data:
            for lang, count in stakeholder['language_distribution'].items():
                sector_insights['language_distribution'][lang] = sector_insights['language_distribution'].get(lang, 0) + count
        
        # Aggregate theme performance
        for stakeholder in all_stakeholder_data:
            for theme, data in stakeholder['theme_scores'].items():
                sector_insights['theme_performance'][theme].append({
                    'stakeholder': stakeholder['stakeholder_name'],
                    'score': data['score'],
                    'mentions': data['mentions']
                })
        
        # Calculate average theme scores
        theme_averages = {}
        for theme, performances in sector_insights['theme_performance'].items():
            scores = [p['score'] for p in performances]
            theme_averages[theme] = {
                'average_score': np.mean(scores),
                'total_mentions': sum(p['mentions'] for p in performances),
                'stakeholder_count': len(performances)
            }
        
        sector_insights['theme_averages'] = theme_averages
        
        # Identify critical areas across sector
        for theme, data in theme_averages.items():
            if data['average_score'] < -0.1:
                sector_insights['critical_areas_sector'].append({
                    'theme': theme.replace('_', ' ').title(),
                    'average_score': data['average_score'],
                    'total_mentions': data['total_mentions'],
                    'affected_stakeholders': data['stakeholder_count']
                })
        
        # Sort critical areas by score
        sector_insights['critical_areas_sector'].sort(key=lambda x: x['average_score'])
        
        # Identify top and bottom performers
        sorted_stakeholders = sorted(all_stakeholder_data, key=lambda x: x['overall_sentiment'], reverse=True)
        sector_insights['top_performers'] = sorted_stakeholders[:3]
        sector_insights['underperformers'] = sorted_stakeholders[-3:]
        
        return sector_insights

    def generate_google_sheets_data(self, stakeholder_data: List[Dict]) -> List[Dict]:
        """Generate data formatted for Google Sheets integration"""
        sheets_data = []
        
        for stakeholder in stakeholder_data:
            row = {
                'stakeholder_name': stakeholder['stakeholder_name'],
                'total_reviews': stakeholder['total_reviews'],
                'average_rating': stakeholder['average_rating'],
                'overall_sentiment': stakeholder['overall_sentiment'],
                'positive_rate': stakeholder['positive_rate'],
                'language_diversity': len(stakeholder['language_distribution']),
                'analysis_date': datetime.now().strftime('%Y-%m-%d'),
                
                # Theme scores
                'service_quality_score': stakeholder['theme_scores'].get('guide_quality', {}).get('score', 0),
                'service_quality_mentions': stakeholder['theme_scores'].get('guide_quality', {}).get('mentions', 0),
                'educational_value_score': stakeholder['theme_scores'].get('historical_significance', {}).get('score', 0),
                'educational_value_mentions': stakeholder['theme_scores'].get('historical_significance', {}).get('mentions', 0),
                'value_pricing_score': stakeholder['theme_scores'].get('value_pricing', {}).get('score', 0),
                'value_pricing_mentions': stakeholder['theme_scores'].get('value_pricing', {}).get('mentions', 0),
                'artistic_creative_quality_score': stakeholder['theme_scores'].get('cultural_value', {}).get('score', 0),
                'artistic_creative_quality_mentions': stakeholder['theme_scores'].get('cultural_value', {}).get('mentions', 0),
                'authenticity_culture_score': stakeholder['theme_scores'].get('cultural_value', {}).get('score', 0),
                'authenticity_culture_mentions': stakeholder['theme_scores'].get('cultural_value', {}).get('mentions', 0),
                'infrastructure_score': stakeholder['theme_scores'].get('infrastructure_state', {}).get('score', 0),
                'infrastructure_mentions': stakeholder['theme_scores'].get('infrastructure_state', {}).get('mentions', 0),
                'ferry_service_score': stakeholder['theme_scores'].get('ferry_service', {}).get('score', 0),
                'ferry_service_mentions': stakeholder['theme_scores'].get('ferry_service', {}).get('mentions', 0),
                
                # Language distribution
                'english_reviews': stakeholder['language_distribution'].get('en', 0),
                'dutch_reviews': stakeholder['language_distribution'].get('nl', 0),
                'german_reviews': stakeholder['language_distribution'].get('de', 0),
                'spanish_reviews': stakeholder['language_distribution'].get('es', 0),
                'french_reviews': stakeholder['language_distribution'].get('fr', 0),
                
                # Critical areas
                'critical_areas_count': len(stakeholder['critical_areas']),
                'management_response_rate': stakeholder['management_response']['response_rate'],
                
                # Key insights
                'top_strength': stakeholder['key_strengths'][0]['theme'] if stakeholder['key_strengths'] else 'None',
                'top_weakness': stakeholder['key_weaknesses'][0]['theme'] if stakeholder['key_weaknesses'] else 'None'
            }
            
            sheets_data.append(row)
        
        return sheets_data

    def generate_dashboard_summary(self, stakeholder_data: List[Dict], sector_insights: Dict) -> str:
        """Generate a comprehensive dashboard summary"""
        summary = f"""
🎯 COMPREHENSIVE SENTIMENT ANALYSIS DASHBOARD
{'='*60}

📊 SECTOR OVERVIEW:
  Total Stakeholders: {sector_insights['total_stakeholders']}
  Total Reviews: {sector_insights['total_reviews']:,}
  Average Sentiment: {sector_insights['average_sentiment']:.3f}
  Average Rating: {sector_insights['average_rating']:.1f}/5

🌍 LANGUAGE DISTRIBUTION:
"""
        
        for lang, count in sorted(sector_insights['language_distribution'].items(), key=lambda x: x[1], reverse=True):
            percentage = (count / sector_insights['total_reviews']) * 100
            summary += f"  {lang.upper()}: {count:,} reviews ({percentage:.1f}%)\n"
        
        summary += f"\n🎯 THEME PERFORMANCE ACROSS SECTOR:\n"
        for theme, data in sorted(sector_insights['theme_averages'].items(), key=lambda x: x[1]['average_score'], reverse=True):
            summary += f"  {theme.replace('_', ' ').title()}: {data['average_score']:.2f} avg score, {data['total_mentions']} mentions across {data['stakeholder_count']} stakeholders\n"
        
        if sector_insights['critical_areas_sector']:
            summary += f"\n⚠️ CRITICAL AREAS FOR SECTOR IMPROVEMENT:\n"
            for area in sector_insights['critical_areas_sector']:
                summary += f"  • {area['theme']}: {area['average_score']:.2f} avg score, {area['total_mentions']} mentions, {area['affected_stakeholders']} stakeholders affected\n"
        
        summary += f"\n🏆 TOP PERFORMERS:\n"
        for i, stakeholder in enumerate(sector_insights['top_performers'], 1):
            summary += f"  {i}. {stakeholder['stakeholder_name']}: {stakeholder['overall_sentiment']:.3f} sentiment, {stakeholder['total_reviews']} reviews\n"
        
        summary += f"\n📉 AREAS NEEDING ATTENTION:\n"
        for i, stakeholder in enumerate(sector_insights['underperformers'], 1):
            summary += f"  {i}. {stakeholder['stakeholder_name']}: {stakeholder['overall_sentiment']:.3f} sentiment, {stakeholder['total_reviews']} reviews\n"
        
        return summary

    def run_comprehensive_analysis(self):
        """Run the complete comprehensive analysis"""
        print("🚀 Starting Comprehensive Sentiment Analysis")
        print("=" * 60)
        
        # Find all English review files
        pattern = "../data/sentiment_data/raw_reviews/oct_2025/**/*_reviews_ENG.json"
        files = glob.glob(pattern, recursive=True)
        
        if not files:
            print("❌ No English review files found")
            return
        
        print(f"📁 Found {len(files)} stakeholder files to analyze\n")
        
        all_stakeholder_data = []
        
        # Analyze each stakeholder
        for file_path in files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                reviews = data.get('reviews', [])
                stakeholder_name = data.get('collection_metadata', {}).get('stakeholder', 'unknown')
                
                if stakeholder_name == 'unknown':
                    filename = os.path.basename(file_path)
                    stakeholder_name = filename.replace('_reviews_ENG.json', '').replace('_', ' ').title()
                
                # Determine source based on file path
                if '/gambia/creative_industries/' in file_path:
                    source = 'gambia_creative'
                elif '/gambia/tour_operators/' in file_path:
                    source = 'gambia_operators'
                else:
                    source = 'regional'
                
                insights = self.analyze_stakeholder_comprehensive(reviews, stakeholder_name, source)
                all_stakeholder_data.append(insights)
                
                print(f"  ✅ {stakeholder_name}: {insights['total_reviews']} reviews, {insights['overall_sentiment']:.3f} sentiment")
                
            except Exception as e:
                print(f"  ❌ Error processing {file_path}: {e}")
                continue
        
        # Generate sector insights
        sector_insights = self.analyze_sector_insights(all_stakeholder_data)
        
        # Generate Google Sheets data
        sheets_data = self.generate_google_sheets_data(all_stakeholder_data)
        
        # Compile results
        self.results = {
            'summary': sector_insights,
            'stakeholder_data': all_stakeholder_data,
            'sheets_data': sheets_data,
            'generated_at': datetime.now().isoformat()
        }
        
        # Save results
        with open('../output/comprehensive_sentiment_analysis_results.json', 'w') as f:
            json.dump(self.results, f, indent=2)
        
        # Generate and print dashboard summary
        dashboard_summary = self.generate_dashboard_summary(all_stakeholder_data, sector_insights)
        print(dashboard_summary)
        
        print(f"\n💾 Comprehensive analysis saved to: ../output/comprehensive_sentiment_analysis_results.json")
        print(f"📊 Google Sheets data ready for integration")

def main():
    analyzer = ComprehensiveSentimentAnalyzer()
    analyzer.run_comprehensive_analysis()

if __name__ == "__main__":
    main()
