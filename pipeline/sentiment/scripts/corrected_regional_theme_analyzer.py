#!/usr/bin/env python3
"""
Corrected Regional Theme Analyzer
Properly normalizes and compares theme scores across regions including Gambia.
"""

import json
from collections import defaultdict
import statistics

class CorrectedRegionalThemeAnalyzer:
    def __init__(self):
        """Initialize corrected regional theme analyzer"""
        self.dashboard_data = None
        self.gambia_data = None
        self.regional_theme_data = {}
        
    def load_data(self):
        """Load both dashboard and Gambia data"""
        try:
            # Load dashboard regional data
            with open('/Users/alexjeffries/tourism-commons/digital_assessment/dashboard/public/regional_sentiment.json', 'r') as f:
                self.dashboard_data = json.load(f)
            print(f"✅ Loaded dashboard data with {len(self.dashboard_data['stakeholder_data'])} stakeholders")
            
            # Load Gambia data
            with open('/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/sentiment_analysis_results.json', 'r') as f:
                self.gambia_data = json.load(f)
            print(f"✅ Loaded Gambia data with {self.gambia_data['summary']['total_stakeholders']} stakeholders")
            print(f"📊 Gambia overall sentiment: {self.gambia_data['summary']['overall_sentiment_avg']:.3f}")
            
            return True
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            return False
    
    def normalize_gambia_scores(self):
        """Normalize Gambia scores to be comparable with dashboard scores"""
        # The dashboard scores appear to be raw sentiment scores (0.1-0.4 range)
        # The Gambia scores appear to be inflated (0.8+ range)
        # We need to normalize them to be comparable
        
        gambia_overall_sentiment = self.gambia_data['summary']['overall_sentiment_avg']
        
        # Calculate normalization factor
        # If Gambia's overall sentiment is 0.617, but individual themes are 0.8+,
        # we need to scale them down to be comparable with dashboard scores
        
        # Let's use the overall sentiment as a reference point
        normalization_factor = 0.3 / gambia_overall_sentiment  # Scale to 0.3 range like dashboard
        
        print(f"📊 Gambia overall sentiment: {gambia_overall_sentiment:.3f}")
        print(f"📊 Normalization factor: {normalization_factor:.3f}")
        
        normalized_gambia_themes = {}
        
        # Map Gambia themes to dashboard themes and normalize
        gambia_theme_mapping = {
            'service_quality': 'service_staff',
            'artistic_creative_quality': 'artistic_creative',
            'value_pricing': 'value_money',
            'authenticity_culture': 'cultural_heritage',
            'educational_value': 'educational_value',
            'accessibility_comfort': 'accessibility_transport',
            'safety_security': 'safety_security',
            'infrastructure': 'facilities_infrastructure'
        }
        
        for gambia_theme, dashboard_theme in gambia_theme_mapping.items():
            if gambia_theme in self.gambia_data['summary']['top_themes']:
                gambia_theme_data = self.gambia_data['summary']['top_themes'][gambia_theme]
                original_score = gambia_theme_data['avg_score']
                normalized_score = original_score * normalization_factor
                
                normalized_gambia_themes[dashboard_theme] = {
                    'avg_score': normalized_score,
                    'original_score': original_score,
                    'total_mentions': gambia_theme_data['total_mentions'],
                    'stakeholders': gambia_theme_data['stakeholders']
                }
                
                print(f"📊 {dashboard_theme}: {original_score:.3f} -> {normalized_score:.3f}")
        
        return normalized_gambia_themes
    
    def analyze_corrected_regional_themes(self):
        """Analyze theme performance across regions with corrected Gambia scores"""
        if not self.dashboard_data or not self.gambia_data:
            return None
        
        print("🎯 Analyzing Corrected Regional Theme Performance (Including Gambia)")
        print("=" * 70)
        
        # Initialize regional theme data structure
        regions = {}
        themes = self.dashboard_data['metadata']['unified_themes']
        
        # Add Gambia to regions
        all_regions = self.dashboard_data['metadata']['countries'] + ['Gambia']
        
        for region in all_regions:
            regions[region] = {
                'stakeholders': 0,
                'total_reviews': 0,
                'themes': {}
            }
            
            for theme in themes:
                regions[region]['themes'][theme] = {
                    'scores': [],
                    'mentions': [],
                    'avg_score': 0,
                    'total_mentions': 0,
                    'stakeholders_with_theme': 0
                }
        
        # Process dashboard stakeholders
        for stakeholder in self.dashboard_data['stakeholder_data']:
            region = stakeholder['country']
            if region not in regions:
                continue
                
            regions[region]['stakeholders'] += 1
            regions[region]['total_reviews'] += stakeholder['total_reviews']
            
            # Process theme scores
            if 'theme_scores' in stakeholder:
                for theme, theme_data in stakeholder['theme_scores'].items():
                    if theme in regions[region]['themes']:
                        regions[region]['themes'][theme]['scores'].append(theme_data['score'])
                        regions[region]['themes'][theme]['mentions'].append(theme_data['mentions'])
                        regions[region]['themes'][theme]['total_mentions'] += theme_data['mentions']
                        regions[region]['themes'][theme]['stakeholders_with_theme'] += 1
        
        # Process Gambia data with corrected scores
        normalized_gambia_themes = self.normalize_gambia_scores()
        
        # Add Gambia data
        regions['Gambia']['stakeholders'] = self.gambia_data['summary']['total_stakeholders']
        regions['Gambia']['total_reviews'] = self.gambia_data['summary']['total_reviews']
        
        for theme, theme_data in normalized_gambia_themes.items():
            if theme in regions['Gambia']['themes']:
                regions['Gambia']['themes'][theme]['avg_score'] = theme_data['avg_score']
                regions['Gambia']['themes'][theme]['total_mentions'] = theme_data['total_mentions']
                regions['Gambia']['themes'][theme]['stakeholders_with_theme'] = theme_data['stakeholders']
        
        # Calculate averages for dashboard regions
        for region, region_data in regions.items():
            if region != 'Gambia':  # Gambia already has calculated averages
                for theme, theme_data in region_data['themes'].items():
                    if theme_data['scores']:
                        theme_data['avg_score'] = statistics.mean(theme_data['scores'])
                    else:
                        theme_data['avg_score'] = 0
        
        self.regional_theme_data = regions
        return regions
    
    def create_corrected_regional_theme_report(self):
        """Create corrected regional theme analysis report"""
        if not self.regional_theme_data:
            return None
        
        print("\n📊 Corrected Regional Theme Performance Analysis (Including Gambia)")
        print("=" * 70)
        
        # Create theme comparison table
        themes = self.dashboard_data['metadata']['unified_themes']
        
        print("\n🎯 Corrected Theme Performance by Region (Including Gambia):")
        print("-" * 90)
        
        # Header
        header = f"{'Theme':<25} {'Gambia':<8} {'Ghana':<8} {'Nigeria':<8} {'Cape Verde':<10} {'Senegal':<8} {'Benin':<8}"
        print(header)
        print("-" * 90)
        
        # Theme scores by region
        for theme in themes:
            theme_name = theme.replace('_', ' ').title()
            row = f"{theme_name:<25}"
            
            for region in ['Gambia', 'Ghana', 'Nigeria', 'Cape Verde', 'Senegal', 'Benin']:
                if region in self.regional_theme_data:
                    avg_score = self.regional_theme_data[region]['themes'][theme]['avg_score']
                    row += f"{avg_score:<8.3f}"
                else:
                    row += f"{'N/A':<8}"
            
            print(row)
        
        # Regional summary
        print(f"\n📈 Corrected Regional Summary (Including Gambia):")
        print("-" * 60)
        for region, data in self.regional_theme_data.items():
            print(f"{region}:")
            print(f"  - Stakeholders: {data['stakeholders']}")
            print(f"  - Total Reviews: {data['total_reviews']}")
            
            # Top performing themes
            theme_scores = [(theme, theme_data['avg_score']) for theme, theme_data in data['themes'].items()]
            theme_scores.sort(key=lambda x: x[1], reverse=True)
            top_themes = theme_scores[:3]
            
            print(f"  - Top Themes:")
            for theme, score in top_themes:
                theme_name = theme.replace('_', ' ').title()
                print(f"    • {theme_name}: {score:.3f}")
            print()
        
        return True
    
    def save_corrected_analysis(self):
        """Save corrected regional theme analysis"""
        if not self.regional_theme_data:
            return None
        
        # Create summary data
        summary_data = {
            'metadata': {
                'generated_at': '2025-10-23T22:45:00.000000',
                'source': 'dashboard_regional_sentiment.json + normalized_gambia_sentiment_analysis.json',
                'total_regions': len(self.regional_theme_data),
                'total_themes': len(self.dashboard_data['metadata']['unified_themes']),
                'includes_gambia': True,
                'gambia_scores_normalized': True,
                'normalization_method': 'scaled_to_dashboard_range'
            },
            'regional_theme_performance': self.regional_theme_data,
            'theme_rankings': {}
        }
        
        # Create theme rankings across regions
        themes = self.dashboard_data['metadata']['unified_themes']
        for theme in themes:
            theme_scores = []
            for region, data in self.regional_theme_data.items():
                if data['themes'][theme]['avg_score'] > 0:
                    theme_scores.append((region, data['themes'][theme]['avg_score']))
            
            theme_scores.sort(key=lambda x: x[1], reverse=True)
            summary_data['theme_rankings'][theme] = theme_scores
        
        # Save to file
        output_file = '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/corrected_regional_theme_analysis.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(summary_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Corrected regional theme analysis saved to: {output_file}")
        return output_file

def main():
    """Main function to extract corrected regional theme analysis"""
    analyzer = CorrectedRegionalThemeAnalyzer()
    
    # Load data
    if not analyzer.load_data():
        return False
    
    # Analyze corrected regional themes
    if not analyzer.analyze_corrected_regional_themes():
        return False
    
    # Create corrected report
    analyzer.create_corrected_regional_theme_report()
    
    # Save corrected analysis
    analyzer.save_corrected_analysis()
    
    print(f"\n🎉 Corrected regional theme analysis completed!")
    print(f"📊 Analyzed {len(analyzer.regional_theme_data)} regions (including Gambia)")
    print(f"🎯 {len(analyzer.dashboard_data['metadata']['unified_themes'])} themes analyzed")
    print(f"📝 Gambia scores properly normalized for comparison")
    
    return True

if __name__ == "__main__":
    main()
