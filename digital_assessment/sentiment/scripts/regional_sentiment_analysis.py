#!/usr/bin/env python3
"""
Regional Sentiment Analysis - Analyzes regional competitor reviews by country
"""

import json
import os
import glob
from datetime import datetime
from comprehensive_sentiment_analysis import ComprehensiveSentimentAnalyzer
from pathlib import Path

class RegionalSentimentAnalyzer:
    def __init__(self):
        self.analyzer = ComprehensiveSentimentAnalyzer()
        
    def run_regional_analysis(self):
        """Run sentiment analysis on regional competitors by country"""
        print("🌍 REGIONAL SENTIMENT ANALYSIS")
        print("=" * 70)
        
        base_path = Path("../data/sentiment_data/raw_reviews/oct_2025")
        countries = ['benin', 'cape_verde', 'ghana', 'nigeria', 'senegal']
        
        regional_results = {
            'by_country': {},
            'overall': {},
            'generated_at': datetime.now().isoformat()
        }
        
        all_stakeholders = []
        
        for country in countries:
            country_path = base_path / country / "creative_industries"
            
            if not country_path.exists():
                print(f"⚠️  {country}: No data found")
                continue
            
            # Find all English review files for this country
            pattern = str(country_path / "**/*_reviews_ENG.json")
            files = glob.glob(pattern, recursive=True)
            
            if not files:
                print(f"⚠️  {country}: No translated files found")
                continue
            
            print(f"\n📍 {country.replace('_', ' ').title()}")
            print(f"   Found {len(files)} stakeholders with translated reviews")
            
            country_stakeholders = []
            
            for file_path in files:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        reviews = json.load(f)
                    
                    if not reviews:
                        continue
                    
                    # Get stakeholder name from first review's place_info
                    stakeholder_name = reviews[0].get('place_info', {}).get('name', 'Unknown')
                    if stakeholder_name == 'Unknown':
                        # Fallback to folder name
                        stakeholder_name = Path(file_path).parent.name.replace('_', ' ').title()
                    
                    # Analyze this stakeholder
                    analysis = self.analyzer.analyze_stakeholder_comprehensive(reviews, stakeholder_name)
                    analysis['country'] = country.replace('_', ' ').title()
                    analysis['country_code'] = country
                    
                    country_stakeholders.append(analysis)
                    all_stakeholders.append(analysis)
                    
                except Exception as e:
                    print(f"   ❌ Error analyzing {Path(file_path).parent.name}: {e}")
                    continue
            
            # Generate country-level insights
            if country_stakeholders:
                country_insights = self.analyzer.analyze_sector_insights(country_stakeholders)
                country_insights['country'] = country.replace('_', ' ').title()
                country_insights['country_code'] = country
                
                regional_results['by_country'][country] = {
                    'insights': country_insights,
                    'stakeholders': country_stakeholders
                }
                
                print(f"   ✅ Analyzed {len(country_stakeholders)} stakeholders")
                print(f"   📊 Avg Sentiment: {country_insights['average_sentiment']:.3f}")
                print(f"   ⭐ Avg Rating: {country_insights['average_rating']:.1f}/5")
        
        # Generate overall regional insights
        if all_stakeholders:
            print(f"\n🌍 OVERALL REGIONAL ANALYSIS")
            overall_insights = self.analyzer.analyze_sector_insights(all_stakeholders)
            overall_insights['region'] = 'West Africa'
            
            regional_results['overall'] = {
                'insights': overall_insights,
                'stakeholders': all_stakeholders
            }
            
            print(f"   ✅ Total: {len(all_stakeholders)} stakeholders across {len(regional_results['by_country'])} countries")
            print(f"   📊 Avg Sentiment: {overall_insights['average_sentiment']:.3f}")
            print(f"   ⭐ Avg Rating: {overall_insights['average_rating']:.1f}/5")
            print(f"   💬 Total Reviews: {overall_insights['total_reviews']:,}")
        
        # Save results
        output_dir = Path("../output/regional_sentiment")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Save comprehensive JSON
        output_file = output_dir / "regional_sentiment_analysis_results.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(regional_results, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Results saved to: {output_file}")
        
        # Save country-specific files
        for country, data in regional_results['by_country'].items():
            country_file = output_dir / f"{country}_sentiment_analysis.json"
            with open(country_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"   📄 {country.replace('_', ' ').title()}: {country_file}")
        
        return regional_results

def main():
    analyzer = RegionalSentimentAnalyzer()
    results = analyzer.run_regional_analysis()
    
    print("\n" + "=" * 70)
    print("✅ Regional sentiment analysis complete!")
    print("=" * 70)

if __name__ == "__main__":
    main()

