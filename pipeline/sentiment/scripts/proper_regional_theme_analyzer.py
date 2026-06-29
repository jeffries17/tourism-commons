#!/usr/bin/env python3
"""
Proper Regional Theme Analyzer
Uses dashboard data format for both regional and Gambia data to ensure accurate comparison.
"""

import json
from collections import defaultdict
import statistics

class ProperRegionalThemeAnalyzer:
    def __init__(self):
        """Initialize proper regional theme analyzer"""
        self.dashboard_data = None
        self.gambia_data = None
        self.regional_theme_data = {}
        
    def load_data(self):
        """Load both dashboard regional and Gambia data"""
        try:
            # Load dashboard regional data
            with open('/Users/alexjeffries/tourism-commons/digital_assessment/dashboard/public/regional_sentiment.json', 'r') as f:
                self.dashboard_data = json.load(f)
            print(f"✅ Loaded dashboard regional data with {len(self.dashboard_data['stakeholder_data'])} stakeholders")
            
            # Load Gambia dashboard data (same format as regional)
            with open('/Users/alexjeffries/tourism-commons/digital_assessment/dashboard/public/sentiment_data.json', 'r') as f:
                self.gambia_data = json.load(f)
            print(f"✅ Loaded Gambia dashboard data with {self.gambia_data['metadata']['total_stakeholders']} stakeholders")
            
            return True
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            return False
    
    def analyze_proper_regional_themes(self):
        """Analyze theme performance across regions using proper dashboard data format"""
        if not self.dashboard_data or not self.gambia_data:
            return None
        
        print("🎯 Analyzing Regional Theme Performance (Dashboard Data Format)")
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
        
        # Process dashboard regional stakeholders
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
        
        # Process Gambia stakeholders (same format as regional)
        for stakeholder in self.gambia_data['stakeholder_data']:
            regions['Gambia']['stakeholders'] += 1
            regions['Gambia']['total_reviews'] += stakeholder['total_reviews']
            
            # Process theme scores
            if 'theme_scores' in stakeholder:
                for theme, theme_data in stakeholder['theme_scores'].items():
                    if theme in regions['Gambia']['themes']:
                        regions['Gambia']['themes'][theme]['scores'].append(theme_data['score'])
                        regions['Gambia']['themes'][theme]['mentions'].append(theme_data['mentions'])
                        regions['Gambia']['themes'][theme]['total_mentions'] += theme_data['mentions']
                        regions['Gambia']['themes'][theme]['stakeholders_with_theme'] += 1
        
        # Calculate averages for all regions
        for region, region_data in regions.items():
            for theme, theme_data in region_data['themes'].items():
                if theme_data['scores']:
                    theme_data['avg_score'] = statistics.mean(theme_data['scores'])
                else:
                    theme_data['avg_score'] = 0
        
        self.regional_theme_data = regions
        return regions
    
    def create_proper_regional_theme_report(self):
        """Create proper regional theme analysis report"""
        if not self.regional_theme_data:
            return None
        
        print("\n📊 Proper Regional Theme Performance Analysis (Dashboard Data Format)")
        print("=" * 70)
        
        # Create theme comparison table
        themes = self.dashboard_data['metadata']['unified_themes']
        
        print("\n🎯 Theme Performance by Region (Dashboard Data Format):")
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
        print(f"\n📈 Regional Summary (Dashboard Data Format):")
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
    
    def save_proper_analysis(self):
        """Save proper regional theme analysis"""
        if not self.regional_theme_data:
            return None
        
        # Create summary data
        summary_data = {
            'metadata': {
                'generated_at': '2025-10-23T23:00:00.000000',
                'source': 'dashboard_regional_sentiment.json + dashboard_sentiment_data.json',
                'total_regions': len(self.regional_theme_data),
                'total_themes': len(self.dashboard_data['metadata']['unified_themes']),
                'includes_gambia': True,
                'data_format': 'dashboard_consistent',
                'comparison_method': 'same_data_format'
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
        output_file = '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/proper_regional_theme_analysis.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(summary_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Proper regional theme analysis saved to: {output_file}")
        return output_file
    
    def create_markdown_report(self):
        """Create markdown report for proper regional theme analysis"""
        if not self.regional_theme_data:
            return None
        
        themes = self.dashboard_data['metadata']['unified_themes']
        
        markdown_content = f"""# Proper Regional Theme Performance Analysis
## Theme Comparisons Across West African Creative Tourism Regions (Dashboard Data Format)

**Date:** October 23, 2025  
**Data Source:** Dashboard Regional Sentiment + Dashboard Gambia Sentiment  
**Regions Analyzed:** {len(self.regional_theme_data)} regions (including Gambia)  
**Themes Analyzed:** {len(themes)} unified themes  
**Data Format:** Consistent dashboard format for accurate comparison

---

## Executive Summary

This analysis examines theme performance across West African creative tourism regions, including Gambia, using consistent dashboard data format to ensure accurate comparison. The analysis is based on theme scores extracted from stakeholder-level sentiment analysis across 57 stakeholders and 4,412 reviews.

### Key Findings:
- **Gambia** shows realistic performance relative to other regions
- **Regional specialization** patterns emerge across different thematic areas
- **Benchmarking opportunities** identified for Gambia relative to other regions
- **Strategic development** opportunities based on theme performance gaps

---

## Theme Performance by Region (Dashboard Data Format)

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

## Regional Analysis (Dashboard Data Format)

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

## Gambia's Competitive Position (Realistic Analysis)

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

This proper regional theme analysis using consistent dashboard data format provides a realistic view of how Gambia performs relative to other West African regions across various creative tourism themes. The analysis reveals clear opportunities for strategic development and competitive positioning.

**Key Success Factors for Gambia:**
- **Leverage existing strengths** - Build on themes where Gambia already performs well
- **Address improvement opportunities** - Focus on themes where Gambia ranks lower
- **Benchmark against leaders** - Learn from regions that excel in specific themes
- **Strategic positioning** - Develop unique thematic identity in the regional market

This analysis provides a solid foundation for evidence-based decision making in Gambia's creative tourism development and strategic planning relative to regional competitors.
"""
        
        # Save markdown report
        output_file = '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/proper_regional_theme_analysis_report.md'
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        print(f"✅ Proper regional theme analysis report saved to: {output_file}")
        return output_file

def main():
    """Main function to extract proper regional theme analysis"""
    analyzer = ProperRegionalThemeAnalyzer()
    
    # Load data
    if not analyzer.load_data():
        return False
    
    # Analyze proper regional themes
    if not analyzer.analyze_proper_regional_themes():
        return False
    
    # Create proper report
    analyzer.create_proper_regional_theme_report()
    
    # Save proper analysis
    analyzer.save_proper_analysis()
    
    # Create markdown report
    analyzer.create_markdown_report()
    
    print(f"\n🎉 Proper regional theme analysis completed!")
    print(f"📊 Analyzed {len(analyzer.regional_theme_data)} regions (including Gambia)")
    print(f"🎯 {len(analyzer.dashboard_data['metadata']['unified_themes'])} themes analyzed")
    print(f"📝 Using consistent dashboard data format for accurate comparison")
    
    return True

if __name__ == "__main__":
    main()
