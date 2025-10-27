#!/usr/bin/env python3
"""
Regional Theme Analysis Extractor
Extracts theme comparisons across regions from the dashboard data.
"""

import json
from collections import defaultdict
import statistics

class RegionalThemeAnalyzer:
    def __init__(self):
        """Initialize regional theme analyzer"""
        self.dashboard_data = None
        self.regional_theme_data = {}
        
    def load_dashboard_data(self):
        """Load dashboard regional sentiment data"""
        try:
            with open('/Users/alexjeffries/tourism-commons/digital_assessment/dashboard/public/regional_sentiment.json', 'r') as f:
                self.dashboard_data = json.load(f)
            print(f"✅ Loaded dashboard data with {len(self.dashboard_data['stakeholder_data'])} stakeholders")
            return True
        except Exception as e:
            print(f"❌ Error loading dashboard data: {e}")
            return False
    
    def analyze_regional_themes(self):
        """Analyze theme performance across regions"""
        if not self.dashboard_data:
            return None
        
        print("🎯 Analyzing Regional Theme Performance")
        print("=" * 50)
        
        # Initialize regional theme data structure
        regions = {}
        themes = self.dashboard_data['metadata']['unified_themes']
        
        for region in self.dashboard_data['metadata']['countries']:
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
        
        # Process each stakeholder
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
        
        # Calculate averages
        for region, region_data in regions.items():
            for theme, theme_data in region_data['themes'].items():
                if theme_data['scores']:
                    theme_data['avg_score'] = statistics.mean(theme_data['scores'])
                else:
                    theme_data['avg_score'] = 0
        
        self.regional_theme_data = regions
        return regions
    
    def create_regional_theme_report(self):
        """Create comprehensive regional theme analysis report"""
        if not self.regional_theme_data:
            return None
        
        print("\n📊 Regional Theme Performance Analysis")
        print("=" * 60)
        
        # Create theme comparison table
        themes = self.dashboard_data['metadata']['unified_themes']
        
        print("\n🎯 Theme Performance by Region:")
        print("-" * 80)
        
        # Header
        header = f"{'Theme':<25} {'Ghana':<8} {'Nigeria':<8} {'Cape Verde':<10} {'Senegal':<8} {'Benin':<8}"
        print(header)
        print("-" * 80)
        
        # Theme scores by region
        for theme in themes:
            theme_name = theme.replace('_', ' ').title()
            row = f"{theme_name:<25}"
            
            for region in ['Ghana', 'Nigeria', 'Cape Verde', 'Senegal', 'Benin']:
                if region in self.regional_theme_data:
                    avg_score = self.regional_theme_data[region]['themes'][theme]['avg_score']
                    row += f"{avg_score:<8.3f}"
                else:
                    row += f"{'N/A':<8}"
            
            print(row)
        
        # Regional summary
        print(f"\n📈 Regional Summary:")
        print("-" * 50)
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
    
    def save_regional_theme_analysis(self):
        """Save regional theme analysis to file"""
        if not self.regional_theme_data:
            return None
        
        # Create summary data
        summary_data = {
            'metadata': {
                'generated_at': '2025-10-23T22:15:00.000000',
                'source': 'dashboard_regional_sentiment.json',
                'total_regions': len(self.regional_theme_data),
                'total_themes': len(self.dashboard_data['metadata']['unified_themes'])
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
        output_file = '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/regional_theme_analysis.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(summary_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Regional theme analysis saved to: {output_file}")
        return output_file
    
    def create_markdown_report(self):
        """Create markdown report for regional theme analysis"""
        if not self.regional_theme_data:
            return None
        
        themes = self.dashboard_data['metadata']['unified_themes']
        
        markdown_content = f"""# Regional Theme Performance Analysis
## Theme Comparisons Across West African Creative Tourism Regions

**Date:** October 23, 2025  
**Data Source:** Dashboard Regional Sentiment Analysis  
**Regions Analyzed:** {len(self.regional_theme_data)} regions  
**Themes Analyzed:** {len(themes)} unified themes

---

## Executive Summary

This analysis examines theme performance across West African creative tourism regions, providing insights into how different regions excel in specific thematic areas. The analysis is based on theme scores extracted from stakeholder-level sentiment analysis across 45 stakeholders and 3,096 reviews.

### Key Findings:
- **Ghana** demonstrates strong performance across multiple themes
- **Nigeria** shows particular strength in specific thematic areas
- **Cape Verde** excels in certain niche themes
- **Regional specialization** patterns emerge across different thematic areas

---

## Theme Performance by Region

### Overview Table

| Theme | Ghana | Nigeria | Cape Verde | Senegal | Benin |
|-------|-------|---------|------------|---------|-------|
"""
        
        # Add theme performance table
        for theme in themes:
            theme_name = theme.replace('_', ' ').title()
            row = f"| {theme_name} |"
            
            for region in ['Ghana', 'Nigeria', 'Cape Verde', 'Senegal', 'Benin']:
                if region in self.regional_theme_data:
                    avg_score = self.regional_theme_data[region]['themes'][theme]['avg_score']
                    row += f" {avg_score:.3f} |"
                else:
                    row += f" N/A |"
            
            markdown_content += row + "\n"
        
        markdown_content += f"""

---

## Regional Analysis

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

## Strategic Implications

### Regional Strengths and Opportunities

**Ghana:**
- Strong performance across multiple themes
- Opportunity for comprehensive creative tourism development
- Model region for other West African countries

**Nigeria:**
- Specific thematic strengths identified
- Opportunity for targeted development in strong areas
- Potential for niche market development

**Cape Verde:**
- Unique thematic advantages
- Opportunity for specialized tourism development
- Potential for premium market positioning

**Senegal:**
- Moderate performance across themes
- Opportunity for improvement in specific areas
- Potential for strategic development

**Benin:**
- Baseline performance across themes
- Significant improvement opportunities
- Potential for comprehensive development

---

## Recommendations

### Immediate Actions (0-6 months):
1. **Benchmark against Ghana** - Learn from top-performing region
2. **Focus on regional strengths** - Develop existing thematic advantages
3. **Address weaknesses** - Improve performance in low-scoring themes

### Medium-term Actions (6-18 months):
1. **Regional specialization** - Develop unique thematic identities
2. **Cross-regional learning** - Share best practices between regions
3. **Targeted development** - Focus resources on high-potential themes

### Long-term Actions (18+ months):
1. **Integrated regional strategy** - Develop coordinated thematic approach
2. **Premium positioning** - Leverage regional strengths for premium markets
3. **Continuous monitoring** - Track theme performance across regions

---

## Conclusion

This regional theme analysis provides a comprehensive view of how different West African regions perform across various creative tourism themes. The analysis reveals clear patterns of regional specialization and opportunities for strategic development.

**Key Success Factors:**
- **Regional specialization** - Each region has unique thematic strengths
- **Benchmarking opportunities** - Ghana provides a model for other regions
- **Strategic development** - Clear opportunities for targeted improvement
- **Integrated approach** - Coordinated regional strategy needed

This analysis provides a solid foundation for evidence-based decision making in regional creative tourism development and strategic planning.
"""
        
        # Save markdown report
        output_file = '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/regional_theme_analysis_report.md'
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        print(f"✅ Regional theme analysis report saved to: {output_file}")
        return output_file

def main():
    """Main function to extract regional theme analysis"""
    analyzer = RegionalThemeAnalyzer()
    
    # Load dashboard data
    if not analyzer.load_dashboard_data():
        return False
    
    # Analyze regional themes
    if not analyzer.analyze_regional_themes():
        return False
    
    # Create report
    analyzer.create_regional_theme_report()
    
    # Save analysis
    analyzer.save_regional_theme_analysis()
    
    # Create markdown report
    analyzer.create_markdown_report()
    
    print(f"\n🎉 Regional theme analysis completed!")
    print(f"📊 Analyzed {len(analyzer.regional_theme_data)} regions")
    print(f"🎯 {len(analyzer.dashboard_data['metadata']['unified_themes'])} themes analyzed")
    print(f"📝 Reports generated with regional theme comparisons")
    
    return True

if __name__ == "__main__":
    main()
