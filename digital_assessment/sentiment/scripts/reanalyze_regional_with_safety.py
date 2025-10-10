#!/usr/bin/env python3
"""
Re-analyze Regional Competitors with Complete Unified Theme Taxonomy
Adds safety_security theme extraction to regional competitor data
"""

import json
import os
import glob
from pathlib import Path
from datetime import datetime
from collections import defaultdict, Counter
from typing import List, Dict
from enhanced_theme_analysis import EnhancedThemeAnalyzer

class RegionalReAnalyzer:
    def __init__(self):
        self.theme_analyzer = EnhancedThemeAnalyzer()
        
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
    
    def analyze_stakeholder(self, reviews: List[Dict], stakeholder_name: str, country: str, sector: str) -> Dict:
        """Analyze all reviews for a stakeholder using EnhancedThemeAnalyzer"""
        print(f"  🔍 Analyzing {stakeholder_name}...")
        
        # Use the enhanced theme analyzer
        dashboard_data = self.theme_analyzer.generate_dashboard_data(reviews, stakeholder_name)
        
        # Convert to dashboard format
        theme_scores = {}
        for theme, data in dashboard_data['theme_analysis'].items():
            theme_scores[theme] = {
                'score': round(data['average_sentiment'], 2),
                'mentions': data['mention_count'],
                'distribution': data['sentiment_distribution']
            }
        
        # Build comprehensive stakeholder data
        return {
            'stakeholder_name': stakeholder_name,
            'source': 'regional',
            'country': country,
            'sector': sector,
            'sector_category': self.sector_mapping.get(sector, 'Other'),
            'total_reviews': dashboard_data['total_reviews'],
            'average_rating': round(dashboard_data['average_rating'], 2),
            'overall_sentiment': round(dashboard_data['overall_sentiment'], 3),
            'positive_rate': round(dashboard_data['positive_rate'], 3),
            'language_distribution': dashboard_data['language_distribution'],
            'year_distribution': dashboard_data['year_distribution'],
            'theme_scores': theme_scores
        }
    
    def run_analysis(self):
        """Run complete regional re-analysis with safety_security theme"""
        print("🌍 RE-ANALYZING REGIONAL COMPETITORS WITH UNIFIED THEMES")
        print("=" * 70)
        print("Adding safety_security theme extraction")
        print("=" * 70)
        
        base_path = Path("../data/sentiment_data/raw_reviews/oct_2025")
        countries = ['benin', 'cape_verde', 'ghana', 'nigeria', 'senegal']
        
        all_stakeholders = []
        
        for country in countries:
            country_path = base_path / country / "creative_industries"
            
            if not country_path.exists():
                print(f"⚠️  {country.title()} path not found, skipping...")
                continue
            
            # Find all English review files
            pattern = str(country_path / "**/*_reviews_ENG.json")
            files = glob.glob(pattern, recursive=True)
            
            if not files:
                print(f"⚠️  No files found for {country.title()}")
                continue
            
            print(f"\n📍 {country.replace('_', ' ').title()}: {len(files)} stakeholders")
            
            for file_path in files:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    # Extract reviews
                    reviews = data.get('reviews', [])
                    
                    if not reviews or not isinstance(reviews, list):
                        continue
                    
                    # Get metadata from master file
                    master_file = Path(file_path).parent / f"{Path(file_path).parent.name}_master.json"
                    if master_file.exists():
                        with open(master_file, 'r') as f:
                            master_data = json.load(f)
                        stakeholder_name = master_data.get('name', Path(file_path).parent.name)
                        sector = master_data.get('sector', 'Unknown')
                    else:
                        stakeholder_name = Path(file_path).parent.name.replace('_', ' ').title()
                        sector = 'Cultural heritage sites/museums'  # Default for creative industries
                    
                    # Analyze with complete theme taxonomy
                    analysis = self.analyze_stakeholder(
                        reviews, 
                        stakeholder_name, 
                        country.replace('_', ' ').title(),
                        sector
                    )
                    all_stakeholders.append(analysis)
                    
                    # Show if safety_security was found
                    if 'safety_security' in analysis['theme_scores'] and analysis['theme_scores']['safety_security']['mentions'] > 0:
                        print(f"    ✅ Found {analysis['theme_scores']['safety_security']['mentions']} safety_security mentions")
                    
                except Exception as e:
                    print(f"   ❌ Error processing {Path(file_path).name}: {e}")
                    continue
        
        if not all_stakeholders:
            print("\n❌ No stakeholders analyzed")
            return None
        
        print(f"\n✅ Analyzed {len(all_stakeholders)} regional stakeholders")
        
        # Calculate summary statistics
        total_reviews = sum(s['total_reviews'] for s in all_stakeholders)
        avg_sentiment = sum(s['overall_sentiment'] * s['total_reviews'] for s in all_stakeholders) / total_reviews if total_reviews > 0 else 0
        avg_rating = sum(s['average_rating'] * s['total_reviews'] for s in all_stakeholders if s['average_rating'] > 0) / total_reviews if total_reviews > 0 else 0
        
        # Count safety_security mentions
        safety_mentions = sum(s['theme_scores'].get('safety_security', {}).get('mentions', 0) for s in all_stakeholders)
        stakeholders_with_safety = sum(1 for s in all_stakeholders if s['theme_scores'].get('safety_security', {}).get('mentions', 0) > 0)
        
        # Prepare dashboard data
        dashboard_data = {
            'metadata': {
                'generated_at': datetime.now().isoformat(),
                'title': 'Regional Competitors Sentiment Analysis',
                'total_stakeholders': len(all_stakeholders),
                'total_reviews': total_reviews,
                'countries': sorted(list(set(s['country'] for s in all_stakeholders))),
                'unified_themes': [
                    'cultural_heritage',
                    'service_staff',
                    'facilities_infrastructure',
                    'accessibility_transport',
                    'value_money',
                    'safety_security',
                    'educational_value',
                    'artistic_creative',
                    'atmosphere_experience'
                ]
            },
            'stakeholder_data': all_stakeholders
        }
        
        # Save results
        output_file = Path("../output/regional_sentiment/regional_sentiment_unified_themes.json")
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(dashboard_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Results saved to: {output_file}")
        
        # Also update the dashboard file
        dashboard_file = Path("../../dashboard/public/regional_sentiment.json")
        if dashboard_file.exists():
            # Create backup
            backup_file = dashboard_file.parent / f"regional_sentiment_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(dashboard_file, 'r') as f:
                old_data = json.load(f)
            with open(backup_file, 'w') as f:
                json.dump(old_data, f, indent=2)
            print(f"📦 Backup created: {backup_file}")
        
        with open(dashboard_file, 'w', encoding='utf-8') as f:
            json.dump(dashboard_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Dashboard file updated: {dashboard_file}")
        
        # Print summary
        print("\n" + "=" * 70)
        print("📊 ANALYSIS SUMMARY")
        print("=" * 70)
        print(f"\n🌍 Regional Competitors:")
        print(f"   Total Stakeholders: {len(all_stakeholders)}")
        print(f"   Total Reviews: {total_reviews:,}")
        print(f"   Average Sentiment: {avg_sentiment:.3f}")
        print(f"   Average Rating: {avg_rating:.1f}/5")
        
        print(f"\n🔒 Safety & Security Theme:")
        print(f"   Total Mentions: {safety_mentions}")
        print(f"   Stakeholders with mentions: {stakeholders_with_safety}/{len(all_stakeholders)}")
        print(f"   Percentage: {stakeholders_with_safety/len(all_stakeholders)*100:.1f}%")
        
        # Show stakeholders with safety mentions
        if stakeholders_with_safety > 0:
            print(f"\n✅ Stakeholders with safety_security mentions:")
            safety_stakeholders = [s for s in all_stakeholders if s['theme_scores'].get('safety_security', {}).get('mentions', 0) > 0]
            safety_stakeholders.sort(key=lambda x: x['theme_scores']['safety_security']['mentions'], reverse=True)
            for s in safety_stakeholders[:10]:  # Top 10
                mentions = s['theme_scores']['safety_security']['mentions']
                score = s['theme_scores']['safety_security']['score']
                print(f"   • {s['stakeholder_name']} ({s['country']}): {mentions} mentions, score: {score:.2f}")
        
        print("\n" + "=" * 70)
        print("✅ COMPLETE - Regional data now includes safety_security theme!")
        print("=" * 70)
        
        return dashboard_data

def main():
    analyzer = RegionalReAnalyzer()
    analyzer.run_analysis()

if __name__ == "__main__":
    main()

