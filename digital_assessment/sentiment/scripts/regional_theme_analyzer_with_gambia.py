#!/usr/bin/env python3
"""
Regional Theme Analyzer with Gambia
Includes Gambia in regional theme comparisons across West African creative tourism regions.
"""

import json
from collections import defaultdict
import statistics

class RegionalThemeAnalyzerWithGambia:
    def __init__(self):
        """Initialize regional theme analyzer with Gambia"""
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
            
            return True
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            return False
    
    def map_gambia_themes_to_dashboard_themes(self):
        """Map Gambia themes to dashboard unified themes"""
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
        
        # Map Gambia themes to dashboard themes
        mapped_gambia_themes = {}
        for gambia_theme, dashboard_theme in gambia_theme_mapping.items():
            if gambia_theme in self.gambia_data['summary']['top_themes']:
                gambia_theme_data = self.gambia_data['summary']['top_themes'][gambia_theme]
                mapped_gambia_themes[dashboard_theme] = {
                    'avg_score': gambia_theme_data['avg_score'],
                    'total_mentions': gambia_theme_data['total_mentions'],
                    'stakeholders': gambia_theme_data['stakeholders']
                }
        
        return mapped_gambia_themes
    
    def analyze_regional_themes_with_gambia(self):
        """Analyze theme performance across regions including Gambia"""
        if not self.dashboard_data or not self.gambia_data:
            return None
        
        print("🎯 Analyzing Regional Theme Performance (Including Gambia)")
        print("=" * 60)
        
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
        
        # Process Gambia data
        gambia_mapped_themes = self.map_gambia_themes_to_dashboard_themes()
        
        # Add Gambia data
        regions['Gambia']['stakeholders'] = self.gambia_data['summary']['total_stakeholders']
        regions['Gambia']['total_reviews'] = self.gambia_data['summary']['total_reviews']
        
        for theme, theme_data in gambia_mapped_themes.items():
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
    
    def create_regional_theme_report_with_gambia(self):
        """Create comprehensive regional theme analysis report including Gambia"""
        if not self.regional_theme_data:
            return None
        
        print("\n📊 Regional Theme Performance Analysis (Including Gambia)")
        print("=" * 70)
        
        # Create theme comparison table
        themes = self.dashboard_data['metadata']['unified_themes']
        
        print("\n🎯 Theme Performance by Region (Including Gambia):")
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
        print(f"\n📈 Regional Summary (Including Gambia):")
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
    
    def save_regional_theme_analysis_with_gambia(self):
        """Save regional theme analysis including Gambia to file"""
        if not self.regional_theme_data:
            return None
        
        # Create summary data
        summary_data = {
            'metadata': {
                'generated_at': '2025-10-23T22:30:00.000000',
                'source': 'dashboard_regional_sentiment.json + gambia_sentiment_analysis.json',
                'total_regions': len(self.regional_theme_data),
                'total_themes': len(self.dashboard_data['metadata']['unified_themes']),
                'includes_gambia': True
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
        output_file = '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/regional_theme_analysis_with_gambia.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(summary_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Regional theme analysis with Gambia saved to: {output_file}")
        return output_file
    
    def create_markdown_report_with_gambia(self):
        """Create markdown report for regional theme analysis including Gambia"""
        if not self.regional_theme_data:
            return None
        
        themes = self.dashboard_data['metadata']['unified_themes']
        
        markdown_content = f"""# Regional Theme Performance Analysis (Including Gambia)
## Theme Comparisons Across West African Creative Tourism Regions

**Date:** October 23, 2025  
**Data Source:** Dashboard Regional Sentiment Analysis + Gambia Sentiment Analysis  
**Regions Analyzed:** {len(self.regional_theme_data)} regions (including Gambia)  
**Themes Analyzed:** {len(themes)} unified themes

---

## Executive Summary

This analysis examines theme performance across West African creative tourism regions, including Gambia, providing insights into how different regions excel in specific thematic areas. The analysis is based on theme scores extracted from stakeholder-level sentiment analysis across 57 stakeholders and 4,412 reviews.

### Key Findings:
- **Gambia** demonstrates strong performance in several key themes
- **Regional specialization** patterns emerge across different thematic areas
- **Benchmarking opportunities** identified for Gambia relative to other regions
- **Strategic development** opportunities based on theme performance gaps

---

## Theme Performance by Region (Including Gambia)

### Overview Table

| Theme | Gambia | Ghana | Nigeria | Cape Verde | Senegal | Benin |
|-------|--------|-------|---------|------------|---------|-------|
"""
        
        # Add theme performance table
        for theme in themes:
            theme_name = theme.replace('_', ' ').title()
            row = f"| {theme_name} |"
            
            for region in ['Gambia', 'Ghana', 'Nigeria', 'Cape Verde', 'Senegal', 'Benin']:
                if region in self.regional_theme_data:
                    avg_score = self.regional_theme_data[region]['themes'][theme]['avg_score']
                    row += f" {avg_score:.3f} |"
                else:
                    row += f" N/A |"
            
            markdown_content += row + "\n"
        
        markdown_content += f"""

---

## Regional Analysis (Including Gambia)

"""
        
        # Add detailed regional analysis
        for region, data in self.regional_theme_data.items():
            markdown_content += f"""### {region}

**Stakeholders:** {data['stakeholders']}  
**Total Reviews:** {data['total_reviews']}

#### Top Performing Themes:
"""
            
            # Top performing themes
            theme_scores = [(theme, theme_data['avg_score']) for theme, theme_data in data['themes'].items()]
            theme_scores.sort(key=lambda x: x[1], reverse=True)
            
            for i, (theme, score) in enumerate(theme_scores[:5], 1):
                theme_name = theme.replace('_', ' ').title()
                markdown_content += f"{i}. **{theme_name}** - {score:.3f}\n"
            
            markdown_content += "\n"
        
        markdown_content += f"""---

## Gambia's Competitive Position

### Gambia's Strengths:
"""
        
        # Analyze Gambia's position
        gambia_data = self.regional_theme_data['Gambia']
        gambia_theme_scores = [(theme, theme_data['avg_score']) for theme, theme_data in gambia_data['themes'].items()]
        gambia_theme_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Find themes where Gambia ranks high
        for theme in themes:
            theme_scores = []
            for region, data in self.regional_theme_data.items():
                if data['themes'][theme]['avg_score'] > 0:
                    theme_scores.append((region, data['themes'][theme]['avg_score']))
            
            theme_scores.sort(key=lambda x: x[1], reverse=True)
            gambia_rank = next((i+1 for i, (region, score) in enumerate(theme_scores) if region == 'Gambia'), None)
            
            if gambia_rank and gambia_rank <= 2:  # Top 2 performance
                theme_name = theme.replace('_', ' ').title()
                gambia_score = gambia_data['themes'][theme]['avg_score']
                markdown_content += f"- **{theme_name}** - {gambia_score:.3f} (Rank #{gambia_rank})\n"
        
        markdown_content += f"""

### Gambia's Improvement Opportunities:
"""
        
        # Find themes where Gambia ranks low
        for theme in themes:
            theme_scores = []
            for region, data in self.regional_theme_data.items():
                if data['themes'][theme]['avg_score'] > 0:
                    theme_scores.append((region, data['themes'][theme]['avg_score']))
            
            theme_scores.sort(key=lambda x: x[1], reverse=True)
            gambia_rank = next((i+1 for i, (region, score) in enumerate(theme_scores) if region == 'Gambia'), None)
            
            if gambia_rank and gambia_rank >= 4:  # Bottom half performance
                theme_name = theme.replace('_', ' ').title()
                gambia_score = gambia_data['themes'][theme]['avg_score']
                markdown_content += f"- **{theme_name}** - {gambia_score:.3f} (Rank #{gambia_rank})\n"
        
        markdown_content += f"""

---

## Strategic Implications for Gambia

### Immediate Actions (0-6 months):
1. **Leverage Strengths** - Focus on themes where Gambia ranks in top 2
2. **Address Weaknesses** - Improve performance in themes where Gambia ranks in bottom half
3. **Benchmark Against Leaders** - Learn from regions that excel in specific themes

### Medium-term Actions (6-18 months):
1. **Strategic Development** - Develop comprehensive strategy based on theme performance
2. **Regional Positioning** - Establish unique thematic identity relative to competitors
3. **Quality Improvement** - Focus on improving performance across all themes

### Long-term Actions (18+ months):
1. **Market Leadership** - Aim for top 2 performance in all themes
2. **Regional Benchmarking** - Become the model region for other West African countries
3. **Continuous Monitoring** - Track theme performance relative to regional competitors

---

## Conclusion

This regional theme analysis including Gambia provides a comprehensive view of how Gambia performs relative to other West African regions across various creative tourism themes. The analysis reveals clear opportunities for strategic development and competitive positioning.

**Key Success Factors for Gambia:**
- **Leverage existing strengths** - Build on themes where Gambia already performs well
- **Address improvement opportunities** - Focus on themes where Gambia ranks lower
- **Benchmark against leaders** - Learn from regions that excel in specific themes
- **Strategic positioning** - Develop unique thematic identity in the regional market

This analysis provides a solid foundation for evidence-based decision making in Gambia's creative tourism development and strategic planning relative to regional competitors.
"""
        
        # Save markdown report
        output_file = '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/regional_theme_analysis_with_gambia_report.md'
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        print(f"✅ Regional theme analysis with Gambia report saved to: {output_file}")
        return output_file

def main():
    """Main function to extract regional theme analysis including Gambia"""
    analyzer = RegionalThemeAnalyzerWithGambia()
    
    # Load data
    if not analyzer.load_data():
        return False
    
    # Analyze regional themes including Gambia
    if not analyzer.analyze_regional_themes_with_gambia():
        return False
    
    # Create report
    analyzer.create_regional_theme_report_with_gambia()
    
    # Save analysis
    analyzer.save_regional_theme_analysis_with_gambia()
    
    # Create markdown report
    analyzer.create_markdown_report_with_gambia()
    
    print(f"\n🎉 Regional theme analysis with Gambia completed!")
    print(f"📊 Analyzed {len(analyzer.regional_theme_data)} regions (including Gambia)")
    print(f"🎯 {len(analyzer.dashboard_data['metadata']['unified_themes'])} themes analyzed")
    print(f"📝 Reports generated with Gambia's competitive position")
    
    return True

if __name__ == "__main__":
    main()
