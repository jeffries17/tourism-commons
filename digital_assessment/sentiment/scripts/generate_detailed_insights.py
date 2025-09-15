#!/usr/bin/env python3
"""
Generate Detailed Insights with Quote Extraction
Creates the same depth of analysis as the previous dashboard
"""

import json
from comprehensive_sentiment_analysis import ComprehensiveSentimentAnalyzer
from enhanced_theme_analysis import EnhancedThemeAnalyzer

def generate_detailed_insights():
    """Generate detailed insights with quotes and critical areas"""
    
    # Load the comprehensive analysis results
    with open('../output/comprehensive_sentiment_analysis_results.json', 'r') as f:
        data = json.load(f)
    
    stakeholder_data = data['stakeholder_data']
    
    print("🎯 DETAILED SENTIMENT ANALYSIS INSIGHTS")
    print("=" * 60)
    
    # Analyze each stakeholder in detail
    for stakeholder in stakeholder_data:
        print(f"\n🏢 {stakeholder['stakeholder_name'].upper()}")
        print("-" * 50)
        
        # Key metrics
        print(f"📊 Total Reviews: {stakeholder['total_reviews']}")
        print(f"⭐ Average Rating: {stakeholder['average_rating']}/5")
        print(f"📈 Overall Sentiment: {stakeholder['overall_sentiment']:.3f}")
        print(f"📝 Positive Rate: {stakeholder['positive_rate']:.1f}%")
        
        # Language distribution
        print(f"\n🌍 Language Distribution:")
        for lang, count in stakeholder['language_distribution'].items():
            percentage = (count / stakeholder['total_reviews']) * 100
            print(f"  {lang.upper()}: {count} reviews ({percentage:.1f}%)")
        
        # Theme analysis with scores
        print(f"\n🎯 Theme Analysis:")
        for theme, data in stakeholder['theme_scores'].items():
            if data['mentions'] > 0:  # Only show themes with mentions
                print(f"  {theme.replace('_', ' ').title()}: {data['score']:.2f} score, {data['mentions']} mentions")
        
        # Critical areas
        if stakeholder['critical_areas']:
            print(f"\n⚠️ Critical Areas for Improvement:")
            for area in stakeholder['critical_areas']:
                print(f"  • {area['theme']}: {area['sentiment_score']:.2f} sentiment")
                print(f"    Priority: {area['priority'].upper()}")
                for quote in area['quotes']:
                    print(f"    \"{quote[:150]}...\"")
        
        # Key strengths
        if stakeholder['key_strengths']:
            print(f"\n✅ Key Strengths:")
            for strength in stakeholder['key_strengths']:
                print(f"  • {strength['theme'].replace('_', ' ').title()}: {strength['score']:.2f} score")
        
        # Key weaknesses
        if stakeholder['key_weaknesses']:
            print(f"\n❌ Key Weaknesses:")
            for weakness in stakeholder['key_weaknesses']:
                print(f"  • {weakness['theme'].replace('_', ' ').title()}: {weakness['score']:.2f} score")
        
        # Management response
        mgmt = stakeholder['management_response']
        print(f"\n📞 Management Response:")
        print(f"  Response Rate: {mgmt['response_rate']:.1f}%")
        print(f"  Total Responses: {mgmt['total_responses']}")
        print(f"  Gap Opportunity: {mgmt['gap_opportunity']} reviews without response")
        
        print("\n" + "="*60)

def generate_sector_summary():
    """Generate sector-wide summary with critical insights"""
    
    with open('../output/comprehensive_sentiment_analysis_results.json', 'r') as f:
        data = json.load(f)
    
    sector = data['summary']
    
    print("\n🎯 SECTOR-WIDE CRITICAL INSIGHTS")
    print("=" * 60)
    
    # Overall performance
    print(f"📊 SECTOR PERFORMANCE:")
    print(f"  Total Stakeholders: {sector['total_stakeholders']}")
    print(f"  Total Reviews: {sector['total_reviews']:,}")
    print(f"  Average Sentiment: {sector['average_sentiment']:.3f}")
    print(f"  Average Rating: {sector['average_rating']:.1f}/5")
    
    # Language distribution
    print(f"\n🌍 LANGUAGE DISTRIBUTION:")
    for lang, count in sorted(sector['language_distribution'].items(), key=lambda x: x[1], reverse=True):
        percentage = (count / sector['total_reviews']) * 100
        print(f"  {lang.upper()}: {count:,} reviews ({percentage:.1f}%)")
    
    # Theme performance
    print(f"\n🎯 THEME PERFORMANCE RANKING:")
    for theme, data in sorted(sector['theme_averages'].items(), key=lambda x: x[1]['average_score'], reverse=True):
        print(f"  {theme.replace('_', ' ').title()}: {data['average_score']:.2f} avg score")
        print(f"    {data['total_mentions']} mentions across {data['stakeholder_count']} stakeholders")
    
    # Critical areas
    if sector['critical_areas_sector']:
        print(f"\n⚠️ SECTOR CRITICAL AREAS:")
        for area in sector['critical_areas_sector']:
            print(f"  • {area['theme']}: {area['average_score']:.2f} avg score")
            print(f"    {area['total_mentions']} mentions, {area['affected_stakeholders']} stakeholders affected")
    
    # Top performers
    print(f"\n🏆 TOP PERFORMERS:")
    for i, stakeholder in enumerate(sector['top_performers'], 1):
        print(f"  {i}. {stakeholder['stakeholder_name']}")
        print(f"     Sentiment: {stakeholder['overall_sentiment']:.3f}")
        print(f"     Reviews: {stakeholder['total_reviews']}")
        print(f"     Rating: {stakeholder['average_rating']:.1f}/5")
    
    # Underperformers
    print(f"\n📉 AREAS NEEDING ATTENTION:")
    for i, stakeholder in enumerate(sector['underperformers'], 1):
        print(f"  {i}. {stakeholder['stakeholder_name']}")
        print(f"     Sentiment: {stakeholder['overall_sentiment']:.3f}")
        print(f"     Reviews: {stakeholder['total_reviews']}")
        print(f"     Rating: {stakeholder['average_rating']:.1f}/5")
        
        # Show specific issues
        if stakeholder['key_weaknesses']:
            print(f"     Key Issues: {', '.join([w['theme'].replace('_', ' ').title() for w in stakeholder['key_weaknesses']])}")

def generate_google_sheets_ready_data():
    """Generate data ready for Google Sheets integration"""
    
    with open('../output/comprehensive_sentiment_analysis_results.json', 'r') as f:
        data = json.load(f)
    
    sheets_data = data['sheets_data']
    
    print("\n📊 GOOGLE SHEETS INTEGRATION DATA")
    print("=" * 60)
    
    # Create CSV-ready format
    import csv
    
    with open('sentiment_analysis_google_sheets.csv', 'w', newline='') as csvfile:
        if sheets_data:
            fieldnames = sheets_data[0].keys()
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(sheets_data)
    
    print("✅ Google Sheets CSV created: sentiment_analysis_google_sheets.csv")
    print(f"📊 {len(sheets_data)} stakeholder records ready for import")
    
    # Show sample data
    if sheets_data:
        print(f"\n📋 Sample Data (First Stakeholder):")
        sample = sheets_data[0]
        for key, value in sample.items():
            if isinstance(value, (int, float)):
                print(f"  {key}: {value}")
            else:
                print(f"  {key}: {str(value)[:50]}...")

def main():
    """Run all detailed insight generation"""
    print("🚀 Generating Detailed Sentiment Analysis Insights")
    print("=" * 60)
    
    # Generate detailed stakeholder insights
    generate_detailed_insights()
    
    # Generate sector summary
    generate_sector_summary()
    
    # Generate Google Sheets data
    generate_google_sheets_ready_data()
    
    print("\n🎉 Detailed insights generation complete!")
    print("📁 Files created:")
    print("  - ../output/comprehensive_sentiment_analysis_results.json")
    print("  - sentiment_analysis_google_sheets.csv")

if __name__ == "__main__":
    main()
