#!/usr/bin/env python3
"""
Transform regional sentiment data to match dashboard format with unified themes
"""
import json
from pathlib import Path

# Theme mapping from old to unified
THEME_MAPPING = {
    'cultural_heritage': 'cultural_heritage',
    'art_creativity': 'artistic_creative',
    'atmosphere_experience': 'atmosphere_experience',
    'educational_value': 'educational_value',
    'staff_service': 'service_staff',
    'facilities_infrastructure': 'facilities_infrastructure',
    'music_performance': 'artistic_creative',  # Merge with artistic
    'value_pricing': 'value_money',
    'accessibility_location': 'accessibility_transport',
    'safety_security': 'safety_security'
}

def transform_stakeholder(stakeholder):
    """Transform a single stakeholder's data"""
    # Convert theme_analysis to theme_scores with unified themes
    theme_scores = {}
    unified_themes_data = {}
    
    # Group by unified theme
    for old_theme, theme_data in stakeholder.get('theme_analysis', {}).items():
        unified_theme = THEME_MAPPING.get(old_theme, old_theme)
        
        if unified_theme not in unified_themes_data:
            unified_themes_data[unified_theme] = {
                'sentiments': [],
                'mentions': 0,
                'positive': 0,
                'neutral': 0,
                'negative': 0
            }
        
        # Accumulate data
        avg_sent = theme_data.get('avg_sentiment', 0)
        mentions = theme_data.get('mentions', 0)
        
        unified_themes_data[unified_theme]['sentiments'].append(avg_sent)
        unified_themes_data[unified_theme]['mentions'] += mentions
        
        # Estimate distribution based on sentiment
        if avg_sent > 0.3:
            unified_themes_data[unified_theme]['positive'] += theme_data.get('reviews_mentioning', 0)
        elif avg_sent < -0.1:
            unified_themes_data[unified_theme]['negative'] += theme_data.get('reviews_mentioning', 0)
        else:
            unified_themes_data[unified_theme]['neutral'] += theme_data.get('reviews_mentioning', 0)
    
    # Convert to final format
    for unified_theme, data in unified_themes_data.items():
        if data['mentions'] > 0:
            avg_sentiment = sum(data['sentiments']) / len(data['sentiments'])
            theme_scores[unified_theme] = {
                'score': round(avg_sentiment, 2),
                'mentions': data['mentions'],
                'distribution': {
                    'positive': data['positive'],
                    'neutral': data['neutral'],
                    'negative': data['negative']
                }
            }
    
    # Build transformed stakeholder
    transformed = {
        'stakeholder_name': stakeholder['stakeholder_name'].lower().replace(' ', '_').replace('(', '').replace(')', '').replace('-', '_'),
        'source': 'regional',
        'country': stakeholder.get('country', 'Unknown'),
        'sector': stakeholder.get('sector', 'Unknown'),
        'sector_category': stakeholder.get('sector_category', 'Unknown'),
        'total_reviews': stakeholder['total_reviews'],
        'average_rating': stakeholder['avg_rating'],
        'overall_sentiment': stakeholder['avg_sentiment'],
        'positive_rate': stakeholder['positive_rate'] / 100,  # Convert to decimal
        'language_distribution': stakeholder.get('language_distribution', {}),
        'year_distribution': stakeholder.get('year_distribution', {}),
        'theme_scores': theme_scores
    }
    
    return transformed

def main():
    print("="*80)
    print("TRANSFORMING REGIONAL SENTIMENT DATA FOR DASHBOARD")
    print("="*80)
    
    # Paths
    input_file = Path("../output/regional_sentiment/regional_sentiment_analysis.json")
    output_file = Path("../../dashboard/public/regional_sentiment.json")
    
    # Load source data
    print(f"\n📂 Loading: {input_file}")
    with open(input_file, 'r', encoding='utf-8') as f:
        source_data = json.load(f)
    
    print(f"✅ Loaded {len(source_data['stakeholder_data'])} stakeholders")
    
    # Transform stakeholders
    transformed_stakeholders = []
    countries_found = set()
    
    for stakeholder in source_data['stakeholder_data']:
        try:
            transformed = transform_stakeholder(stakeholder)
            transformed_stakeholders.append(transformed)
            countries_found.add(transformed['country'])
        except Exception as e:
            print(f"❌ Error transforming {stakeholder['stakeholder_name']}: {e}")
            continue
    
    print(f"✅ Transformed {len(transformed_stakeholders)} stakeholders")
    print(f"📍 Countries: {', '.join(sorted(countries_found))}")
    
    # Build output structure
    output_data = {
        'metadata': {
            'generated_at': source_data.get('summary', {}).get('generated_at', ''),
            'title': 'Regional Competitors Sentiment Analysis',
            'total_stakeholders': len(transformed_stakeholders),
            'total_reviews': sum(s['total_reviews'] for s in transformed_stakeholders),
            'countries': sorted(countries_found),
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
        'stakeholder_data': transformed_stakeholders
    }
    
    # Save
    print(f"\n💾 Saving to: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Saved successfully!")
    print(f"\n📊 Summary:")
    print(f"  Total Stakeholders: {output_data['metadata']['total_stakeholders']}")
    print(f"  Total Reviews: {output_data['metadata']['total_reviews']}")
    print(f"  Countries: {len(output_data['metadata']['countries'])}")
    
    # Show country breakdown
    print(f"\n🌍 By Country:")
    country_counts = {}
    for s in transformed_stakeholders:
        country = s['country']
        if country not in country_counts:
            country_counts[country] = {'stakeholders': 0, 'reviews': 0}
        country_counts[country]['stakeholders'] += 1
        country_counts[country]['reviews'] += s['total_reviews']
    
    for country in sorted(country_counts.keys()):
        stats = country_counts[country]
        print(f"  {country:15} - {stats['stakeholders']} stakeholders, {stats['reviews']} reviews")

if __name__ == '__main__':
    main()

