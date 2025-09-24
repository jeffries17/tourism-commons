#!/usr/bin/env python3
"""
Creative Industries Sentiment Analysis
Analyzes only the creative industries stakeholders separately
"""

import json
import os
import glob
from datetime import datetime
from typing import List, Dict
from enhanced_theme_analysis import EnhancedThemeAnalyzer
from collections import defaultdict, Counter
import numpy as np

class CreativeIndustriesAnalyzer:
    def __init__(self):
        self.theme_analyzer = EnhancedThemeAnalyzer()
        self.results = {
            'summary': {},
            'stakeholder_data': [],
            'sector_insights': {},
            'critical_areas': {},
            'generated_at': datetime.now().isoformat(),
            'industry': 'creative_industries'
        }

    def analyze_stakeholder_comprehensive(self, reviews: List[Dict], stakeholder_name: str) -> Dict:
        """Perform comprehensive analysis for a single stakeholder"""
        print(f"🔍 Analyzing {stakeholder_name}...")
        
        # Generate dashboard data
        dashboard_data = self.theme_analyzer.generate_dashboard_data(reviews, stakeholder_name)
        
        # Extract key insights
        insights = {
            'stakeholder_name': stakeholder_name,
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
            
            # Additional metrics
            'service_quality_score': dashboard_data.get('service_quality_score', 0),
            'service_quality_mentions': dashboard_data.get('service_quality_mentions', 0),
            'educational_value_score': dashboard_data.get('educational_value_score', 0),
            'educational_value_mentions': dashboard_data.get('educational_value_mentions', 0),
            'value_pricing_score': dashboard_data.get('value_pricing_score', 0),
            'value_pricing_mentions': dashboard_data.get('value_pricing_mentions', 0),
            'artistic_creative_quality_score': dashboard_data.get('artistic_creative_quality_score', 0),
            'artistic_creative_quality_mentions': dashboard_data.get('artistic_creative_quality_mentions', 0),
            'authenticity_culture_score': dashboard_data.get('authenticity_culture_score', 0),
            'authenticity_culture_mentions': dashboard_data.get('authenticity_culture_mentions', 0),
            'infrastructure_score': dashboard_data.get('infrastructure_score', 0),
            'infrastructure_mentions': dashboard_data.get('infrastructure_mentions', 0),
            'ferry_service_score': dashboard_data.get('ferry_service_score', 0),
            'ferry_service_mentions': dashboard_data.get('ferry_service_mentions', 0),
            
            # Language breakdown
            'english_reviews': dashboard_data['language_distribution'].get('en', 0),
            'dutch_reviews': dashboard_data['language_distribution'].get('nl', 0),
            'german_reviews': dashboard_data['language_distribution'].get('de', 0),
            'spanish_reviews': dashboard_data['language_distribution'].get('es', 0),
            'french_reviews': dashboard_data['language_distribution'].get('fr', 0),
            
            # Critical areas count
            'critical_areas_count': len(dashboard_data['critical_areas']),
            'management_response_rate': dashboard_data['management_response']['response_rate'],
            
            # Top strength and weakness
            'top_strength': max(dashboard_data.get('theme_scores', {}).items(), key=lambda x: x[1])[0] if dashboard_data.get('theme_scores') else 'none',
            'top_weakness': min(dashboard_data.get('theme_scores', {}).items(), key=lambda x: x[1])[0] if dashboard_data.get('theme_scores') else 'none'
        }
        
        return insights

    def analyze_sector_insights(self, all_stakeholder_data: List[Dict]) -> Dict:
        """Analyze insights across the creative industries sector"""
        if not all_stakeholder_data:
            return {}
        
        # Calculate sector-wide metrics
        total_reviews = sum(s['total_reviews'] for s in all_stakeholder_data)
        avg_sentiment = np.mean([s['overall_sentiment'] for s in all_stakeholder_data])
        avg_rating = np.mean([s['average_rating'] for s in all_stakeholder_data])
        
        # Language distribution
        language_dist = defaultdict(int)
        for s in all_stakeholder_data:
            for lang, count in s['language_distribution'].items():
                language_dist[lang] += count
        
        # Theme performance
        theme_scores = defaultdict(list)
        theme_mentions = defaultdict(int)
        
        for s in all_stakeholder_data:
            for theme, score in s.get('theme_scores', {}).items():
                theme_scores[theme].append(score)
            for theme, mentions in s.get('theme_mentions', {}).items():
                theme_mentions[theme] += mentions
        
        # Calculate average theme scores
        avg_theme_scores = {}
        for theme, scores in theme_scores.items():
            avg_theme_scores[theme] = np.mean(scores)
        
        # Top performers and underperformers
        sorted_stakeholders = sorted(all_stakeholder_data, key=lambda x: x['overall_sentiment'], reverse=True)
        top_performers = sorted_stakeholders[:3]
        underperformers = sorted_stakeholders[-3:]
        
        return {
            'total_stakeholders': len(all_stakeholder_data),
            'total_reviews': total_reviews,
            'average_sentiment': avg_sentiment,
            'average_rating': avg_rating,
            'language_distribution': dict(language_dist),
            'theme_performance': avg_theme_scores,
            'theme_mentions': dict(theme_mentions),
            'top_performers': top_performers,
            'underperformers': underperformers
        }

    def generate_dashboard_summary(self, stakeholder_data: List[Dict], sector_insights: Dict) -> str:
        """Generate a comprehensive dashboard summary"""
        summary = f"\n🎨 CREATIVE INDUSTRIES SENTIMENT ANALYSIS DASHBOARD\n"
        summary += "=" * 60 + "\n\n"
        
        summary += f"📊 SECTOR OVERVIEW:\n"
        summary += f"  Total Stakeholders: {sector_insights['total_stakeholders']}\n"
        summary += f"  Total Reviews: {sector_insights['total_reviews']:,}\n"
        summary += f"  Average Sentiment: {sector_insights['average_sentiment']:.3f}\n"
        summary += f"  Average Rating: {sector_insights['average_rating']:.1f}/5\n\n"
        
        summary += f"🌍 LANGUAGE DISTRIBUTION:\n"
        for lang, count in sector_insights['language_distribution'].items():
            percentage = (count / sector_insights['total_reviews']) * 100
            summary += f"  {lang.upper()}: {count:,} reviews ({percentage:.1f}%)\n"
        summary += "\n"
        
        summary += f"🎯 THEME PERFORMANCE ACROSS CREATIVE INDUSTRIES:\n"
        for theme, score in sorted(sector_insights['theme_performance'].items(), key=lambda x: x[1], reverse=True):
            mentions = sector_insights['theme_mentions'].get(theme, 0)
            summary += f"  {theme.replace('_', ' ').title()}: {score:.2f} avg score, {mentions} mentions\n"
        summary += "\n"
        
        summary += f"🏆 TOP PERFORMERS:\n"
        for i, stakeholder in enumerate(sector_insights['top_performers'], 1):
            summary += f"  {i}. {stakeholder['stakeholder_name']}: {stakeholder['overall_sentiment']:.3f} sentiment, {stakeholder['total_reviews']} reviews\n"
        summary += "\n"
        
        summary += f"📉 AREAS NEEDING ATTENTION:\n"
        for i, stakeholder in enumerate(sector_insights['underperformers'], 1):
            summary += f"  {i}. {stakeholder['stakeholder_name']}: {stakeholder['overall_sentiment']:.3f} sentiment, {stakeholder['total_reviews']} reviews\n"
        
        return summary

    def run_creative_industries_analysis(self):
        """Run the complete creative industries analysis"""
        print("🎨 Starting Creative Industries Sentiment Analysis")
        print("=" * 60)
        
        # Find all English review files in creative industries
        pattern = "../data/sentiment_data/raw_reviews/oct_2025/gambia/creative_industries/**/*_reviews_ENG.json"
        files = glob.glob(pattern, recursive=True)
        
        if not files:
            print("❌ No English review files found in creative industries")
            return
        
        print(f"📁 Found {len(files)} creative industry files to analyze\n")
        
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
                
                insights = self.analyze_stakeholder_comprehensive(reviews, stakeholder_name)
                all_stakeholder_data.append(insights)
                
                print(f"  ✅ {stakeholder_name}: {insights['total_reviews']} reviews, {insights['overall_sentiment']:.3f} sentiment")
                
            except Exception as e:
                print(f"  ❌ Error processing {file_path}: {e}")
                continue
        
        # Generate sector insights
        sector_insights = self.analyze_sector_insights(all_stakeholder_data)
        
        # Generate Google Sheets data
        self.generate_google_sheets_data(all_stakeholder_data, sector_insights)
        
        # Store results
        self.results['stakeholder_data'] = all_stakeholder_data
        self.results['sector_insights'] = sector_insights
        
        # Save comprehensive results
        output_file = "../output/creative_industries_sentiment_analysis_results.json"
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        # Generate and print dashboard
        dashboard = self.generate_dashboard_summary(all_stakeholder_data, sector_insights)
        print(dashboard)
        
        print(f"\n💾 Creative industries analysis saved to: {output_file}")
        print(f"📊 Google Sheets data ready for integration")

    def generate_google_sheets_data(self, stakeholder_data: List[Dict], sector_insights: Dict):
        """Generate Google Sheets ready CSV data"""
        csv_data = []
        
        for stakeholder in stakeholder_data:
            row = {
                'stakeholder_name': stakeholder['stakeholder_name'],
                'industry': 'creative_industries',
                'total_reviews': stakeholder['total_reviews'],
                'average_rating': stakeholder['average_rating'],
                'overall_sentiment': stakeholder['overall_sentiment'],
                'positive_rate': stakeholder['positive_rate'],
                'language_diversity': len([k for k, v in stakeholder['language_distribution'].items() if v > 0]),
                'analysis_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'service_quality_score': stakeholder['service_quality_score'],
                'service_quality_mentions': stakeholder['service_quality_mentions'],
                'educational_value_score': stakeholder['educational_value_score'],
                'educational_value_mentions': stakeholder['educational_value_mentions'],
                'value_pricing_score': stakeholder['value_pricing_score'],
                'value_pricing_mentions': stakeholder['value_pricing_mentions'],
                'artistic_creative_quality_score': stakeholder['artistic_creative_quality_score'],
                'artistic_creative_quality_mentions': stakeholder['artistic_creative_quality_mentions'],
                'authenticity_culture_score': stakeholder['authenticity_culture_score'],
                'authenticity_culture_mentions': stakeholder['authenticity_culture_mentions'],
                'infrastructure_score': stakeholder['infrastructure_score'],
                'infrastructure_mentions': stakeholder['infrastructure_mentions'],
                'ferry_service_score': stakeholder['ferry_service_score'],
                'ferry_service_mentions': stakeholder['ferry_service_mentions'],
                'english_reviews': stakeholder['english_reviews'],
                'dutch_reviews': stakeholder['dutch_reviews'],
                'german_reviews': stakeholder['german_reviews'],
                'spanish_reviews': stakeholder['spanish_reviews'],
                'french_reviews': stakeholder['french_reviews'],
                'critical_areas_count': stakeholder['critical_areas_count'],
                'management_response_rate': stakeholder['management_response_rate'],
                'top_strength': stakeholder['top_strength'],
                'top_weakness': stakeholder['top_weakness']
            }
            csv_data.append(row)
        
        # Save CSV
        import csv
        csv_file = "creative_industries_sentiment_analysis_google_sheets.csv"
        with open(csv_file, 'w', newline='', encoding='utf-8') as f:
            if csv_data:
                writer = csv.DictWriter(f, fieldnames=csv_data[0].keys())
                writer.writeheader()
                writer.writerows(csv_data)
        
        print(f"📊 Creative industries Google Sheets data created: {csv_file}")

def main():
    analyzer = CreativeIndustriesAnalyzer()
    analyzer.run_creative_industries_analysis()

if __name__ == "__main__":
    main()
