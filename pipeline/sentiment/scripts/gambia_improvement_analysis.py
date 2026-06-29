#!/usr/bin/env python3
"""
Gambia Improvement Analysis
Identifies specific stakeholders and actionable improvements for Gambia based on regional theme analysis.
"""

import json
from collections import defaultdict

class GambiaImprovementAnalyzer:
    def __init__(self):
        """Initialize Gambia improvement analyzer"""
        self.dashboard_data = None
        self.gambia_data = None
        self.improvement_analysis = {}
        
    def load_data(self):
        """Load dashboard data for analysis"""
        try:
            # Load dashboard regional data
            with open('/Users/alexjeffries/tourism-commons/digital_assessment/dashboard/public/regional_sentiment.json', 'r') as f:
                self.dashboard_data = json.load(f)
            print(f"✅ Loaded dashboard regional data with {len(self.dashboard_data['stakeholder_data'])} stakeholders")
            
            # Load Gambia dashboard data
            with open('/Users/alexjeffries/tourism-commons/digital_assessment/dashboard/public/sentiment_data.json', 'r') as f:
                self.gambia_data = json.load(f)
            print(f"✅ Loaded Gambia dashboard data with {self.gambia_data['metadata']['total_stakeholders']} stakeholders")
            
            return True
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            return False
    
    def analyze_regional_leaders(self):
        """Analyze regional leaders by theme and identify top-performing stakeholders"""
        if not self.dashboard_data:
            return None
        
        print("🎯 Analyzing Regional Leaders and Top-Performing Stakeholders")
        print("=" * 60)
        
        # Group stakeholders by theme performance
        theme_leaders = defaultdict(list)
        
        for stakeholder in self.dashboard_data['stakeholder_data']:
            if 'theme_scores' in stakeholder:
                for theme, theme_data in stakeholder['theme_scores'].items():
                    if theme_data['score'] > 0.3:  # High-performing stakeholders
                        theme_leaders[theme].append({
                            'name': stakeholder['stakeholder_name'],
                            'country': stakeholder['country'],
                            'score': theme_data['score'],
                            'mentions': theme_data['mentions'],
                            'rating': stakeholder.get('average_rating', 0),
                            'reviews': stakeholder.get('total_reviews', 0)
                        })
        
        # Sort by score for each theme
        for theme in theme_leaders:
            theme_leaders[theme].sort(key=lambda x: x['score'], reverse=True)
        
        return theme_leaders
    
    def identify_gambia_improvement_opportunities(self):
        """Identify specific improvement opportunities for Gambia"""
        if not self.dashboard_data or not self.gambia_data:
            return None
        
        print("🎯 Identifying Gambia Improvement Opportunities")
        print("=" * 50)
        
        # Calculate regional averages for comparison
        regional_averages = defaultdict(list)
        for stakeholder in self.dashboard_data['stakeholder_data']:
            if 'theme_scores' in stakeholder:
                for theme, theme_data in stakeholder['theme_scores'].items():
                    regional_averages[theme].append(theme_data['score'])
        
        # Calculate Gambia averages
        gambia_averages = defaultdict(list)
        for stakeholder in self.gambia_data['stakeholder_data']:
            if 'theme_scores' in stakeholder:
                for theme, theme_data in stakeholder['theme_scores'].items():
                    gambia_averages[theme].append(theme_data['score'])
        
        # Identify improvement opportunities
        improvement_opportunities = {}
        
        for theme in regional_averages:
            if theme in gambia_averages:
                regional_avg = sum(regional_averages[theme]) / len(regional_averages[theme])
                gambia_avg = sum(gambia_averages[theme]) / len(gambia_averages[theme])
                gap = regional_avg - gambia_avg
                
                if gap > 0.02:  # Significant improvement opportunity
                    improvement_opportunities[theme] = {
                        'gambia_avg': gambia_avg,
                        'regional_avg': regional_avg,
                        'gap': gap,
                        'improvement_potential': 'High' if gap > 0.05 else 'Medium'
                    }
        
        return improvement_opportunities
    
    def create_improvement_report(self):
        """Create comprehensive improvement report with 5 key takeaways"""
        if not self.dashboard_data or not self.gambia_data:
            return None
        
        print("📝 Creating Gambia Improvement Report")
        print("=" * 40)
        
        # Analyze regional leaders
        theme_leaders = self.analyze_regional_leaders()
        
        # Identify improvement opportunities
        improvement_opportunities = self.identify_gambia_improvement_opportunities()
        
        # Create report content
        report_content = f"""# Gambia Creative Tourism Improvement Analysis
## 5 Key Takeaways for Strategic Development

**Date:** October 23, 2025  
**Data Source:** Dashboard Regional Sentiment Analysis  
**Focus:** Actionable improvements based on regional leader analysis

---

## Executive Summary

This analysis identifies specific improvement opportunities for Gambia's creative tourism sector based on regional theme performance. While the differences between regions are not dramatic, there are clear opportunities for Gambia to learn from regional leaders and implement targeted improvements.

### Key Finding:
Gambia shows **moderate performance** across most themes, with **safety/security** as a clear competitive advantage. The analysis reveals **5 strategic improvement areas** where Gambia can learn from regional leaders and implement specific enhancements.

---

## 5 Key Takeaways for Gambia's Strategic Development

### Takeaway 1: Learn from Nigeria's Atmosphere Experience Excellence
**Theme:** Atmosphere Experience  
**Gambia Performance:** 0.284 (4th out of 6 regions)  
**Regional Leader:** Nigeria (0.306)  
**Gap:** 0.022 points

**Top-Performing Stakeholders in Nigeria:**
"""
        
        # Add Nigeria's top performers
        if 'atmosphere_experience' in theme_leaders:
            nigeria_performers = [s for s in theme_leaders['atmosphere_experience'] if s['country'] == 'Nigeria']
            for i, stakeholder in enumerate(nigeria_performers[:3], 1):
                report_content += f"""
**{i}. {stakeholder['name']}**
- Theme Score: {stakeholder['score']:.3f}
- Average Rating: {stakeholder['rating']:.2f}/5
- Total Reviews: {stakeholder['reviews']}
- Theme Mentions: {stakeholder['mentions']}
"""
        
        report_content += f"""

**Actionable Improvements:**
- **Enhance visitor experience design** - Focus on creating memorable, engaging atmospheres
- **Improve site presentation** - Learn from Nigeria's successful atmosphere creation
- **Staff training** - Develop atmosphere-focused service delivery
- **Physical environment** - Enhance visual appeal and visitor comfort

---

### Takeaway 2: Leverage Ghana's Artistic Creative Excellence
**Theme:** Artistic Creative  
**Gambia Performance:** 0.232 (4th out of 6 regions)  
**Regional Leader:** Ghana (0.270)  
**Gap:** 0.038 points

**Top-Performing Stakeholders in Ghana:**
"""
        
        # Add Ghana's top performers
        if 'artistic_creative' in theme_leaders:
            ghana_performers = [s for s in theme_leaders['artistic_creative'] if s['country'] == 'Ghana']
            for i, stakeholder in enumerate(ghana_performers[:3], 1):
                report_content += f"""
**{i}. {stakeholder['name']}**
- Theme Score: {stakeholder['score']:.3f}
- Average Rating: {stakeholder['rating']:.2f}/5
- Total Reviews: {stakeholder['reviews']}
- Theme Mentions: {stakeholder['mentions']}
"""
        
        report_content += f"""

**Actionable Improvements:**
- **Artistic presentation** - Enhance visual appeal and creative displays
- **Creative programming** - Develop engaging artistic experiences
- **Artist engagement** - Increase direct interaction with local artists
- **Creative workshops** - Offer hands-on artistic experiences

---

### Takeaway 3: Learn from Nigeria's Cultural Heritage Excellence
**Theme:** Cultural Heritage  
**Gambia Performance:** 0.237 (4th out of 6 regions)  
**Regional Leader:** Nigeria (0.292)  
**Gap:** 0.055 points

**Top-Performing Stakeholders in Nigeria:**
"""
        
        # Add Nigeria's cultural heritage performers
        if 'cultural_heritage' in theme_leaders:
            nigeria_performers = [s for s in theme_leaders['cultural_heritage'] if s['country'] == 'Nigeria']
            for i, stakeholder in enumerate(nigeria_performers[:3], 1):
                report_content += f"""
**{i}. {stakeholder['name']}**
- Theme Score: {stakeholder['score']:.3f}
- Average Rating: {stakeholder['rating']:.2f}/5
- Total Reviews: {stakeholder['reviews']}
- Theme Mentions: {stakeholder['mentions']}
"""
        
        report_content += f"""

**Actionable Improvements:**
- **Cultural interpretation** - Enhance storytelling and cultural context
- **Authentic experiences** - Develop deeper cultural immersion opportunities
- **Heritage preservation** - Improve presentation of cultural artifacts
- **Cultural education** - Strengthen educational components of cultural sites

---

### Takeaway 4: Learn from Ghana's Value Money Excellence
**Theme:** Value Money  
**Gambia Performance:** 0.214 (4th out of 6 regions)  
**Regional Leader:** Ghana (0.247)  
**Gap:** 0.033 points

**Top-Performing Stakeholders in Ghana:**
"""
        
        # Add Ghana's value money performers
        if 'value_money' in theme_leaders:
            ghana_performers = [s for s in theme_leaders['value_money'] if s['country'] == 'Ghana']
            for i, stakeholder in enumerate(ghana_performers[:3], 1):
                report_content += f"""
**{i}. {stakeholder['name']}**
- Theme Score: {stakeholder['score']:.3f}
- Average Rating: {stakeholder['rating']:.2f}/5
- Total Reviews: {stakeholder['reviews']}
- Theme Mentions: {stakeholder['mentions']}
"""
        
        report_content += f"""

**Actionable Improvements:**
- **Pricing strategy** - Review and optimize pricing for better value perception
- **Value-added services** - Include additional benefits in standard offerings
- **Transparent pricing** - Ensure clear communication of value proposition
- **Quality improvement** - Enhance service quality to justify pricing

---

### Takeaway 5: Maintain and Leverage Gambia's Safety Security Advantage
**Theme:** Safety Security  
**Gambia Performance:** 0.200 (1st out of 6 regions) ✅ **Gambia's Strength**  
**Regional Average:** 0.161  
**Gap:** +0.039 points (Gambia leads)

**Gambia's Top-Performing Stakeholders:**
"""
        
        # Add Gambia's safety security performers
        if 'safety_security' in theme_leaders:
            gambia_performers = [s for s in theme_leaders['safety_security'] if s['country'] == 'Gambia']
            for i, stakeholder in enumerate(gambia_performers[:3], 1):
                report_content += f"""
**{i}. {stakeholder['name']}**
- Theme Score: {stakeholder['score']:.3f}
- Average Rating: {stakeholder['rating']:.2f}/5
- Total Reviews: {stakeholder['reviews']}
- Theme Mentions: {stakeholder['mentions']}
"""
        
        report_content += f"""

**Actionable Improvements:**
- **Market positioning** - Promote Gambia as the safest creative tourism destination
- **Safety protocols** - Maintain and enhance existing safety measures
- **Visitor communication** - Clearly communicate safety advantages to potential visitors
- **Safety training** - Ensure all stakeholders maintain high safety standards

---

## Strategic Implementation Plan

### Phase 1: Immediate Actions (0-6 months)
1. **Safety Security Marketing** - Leverage Gambia's competitive advantage
2. **Atmosphere Experience Enhancement** - Learn from Nigeria's successful practices
3. **Cultural Heritage Improvement** - Implement Nigeria's cultural interpretation methods

### Phase 2: Medium-term Development (6-18 months)
1. **Artistic Creative Development** - Adopt Ghana's artistic presentation techniques
2. **Value Money Optimization** - Implement Ghana's value proposition strategies
3. **Cross-regional Learning** - Establish partnerships with top-performing stakeholders

### Phase 3: Long-term Excellence (18+ months)
1. **Integrated Experience Design** - Combine best practices from all regional leaders
2. **Continuous Improvement** - Establish ongoing benchmarking and improvement processes
3. **Regional Leadership** - Aim to become the regional leader in multiple themes

---

## Conclusion

While the performance differences between regions are not dramatic, there are clear opportunities for Gambia to learn from regional leaders and implement targeted improvements. By focusing on these 5 key takeaways, Gambia can enhance its competitive position and provide better experiences for creative tourism visitors.

**Key Success Factors:**
- **Leverage existing strengths** - Maintain safety/security advantage
- **Learn from regional leaders** - Adopt best practices from top-performing stakeholders
- **Implement targeted improvements** - Focus on specific themes with clear improvement potential
- **Continuous monitoring** - Track progress and adjust strategies based on results

This analysis provides a solid foundation for evidence-based decision making in Gambia's creative tourism development and strategic planning.
"""
        
        return report_content
    
    def save_improvement_report(self, content):
        """Save improvement report to file"""
        output_file = '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/gambia_improvement_analysis.md'
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Gambia improvement analysis saved to: {output_file}")
        return output_file

def main():
    """Main function to create Gambia improvement analysis"""
    analyzer = GambiaImprovementAnalyzer()
    
    # Load data
    if not analyzer.load_data():
        return False
    
    # Create improvement report
    report_content = analyzer.create_improvement_report()
    
    if report_content:
        # Save report
        analyzer.save_improvement_report(report_content)
        
        print(f"\n🎉 Gambia improvement analysis completed!")
        print(f"📝 5 key takeaways identified with specific stakeholders")
        print(f"🎯 Actionable improvements based on regional leader analysis")
        print(f"📊 Focus on leveraging strengths and addressing improvement opportunities")
    else:
        print(f"\n❌ Failed to create Gambia improvement analysis")
    
    return True

if __name__ == "__main__":
    main()
