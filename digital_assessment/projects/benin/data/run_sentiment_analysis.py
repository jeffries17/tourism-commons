#!/usr/bin/env python3
"""
Run sentiment analysis on Benin data
Processes all French-translated reviews and generates sentiment insights
"""

import json
import sys
from pathlib import Path
from datetime import datetime
from collections import Counter, defaultdict
import re

# Add sentiment scripts to path
sentiment_dir = Path(__file__).parent.parent.parent.parent / "sentiment" / "scripts"
sys.path.insert(0, str(sentiment_dir))

# Import our enhanced analyzer
analyzer_path = Path(__file__).parent / "enhanced_theme_analyzer.py"
import importlib.util
spec = importlib.util.spec_from_file_location("enhanced_theme_analyzer", analyzer_path)
enhanced_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(enhanced_module)
EnhancedThemeAnalyzer = enhanced_module.EnhancedThemeAnalyzer

def analyze_benin_sentiment():
    """Run comprehensive sentiment analysis on Benin data"""
    
    base_dir = Path(__file__).parent
    # Use translated English reviews for better sentiment analysis
    input_dir = base_dir / "translated_to_english"
    output_dir = base_dir / "sentiment_outputs"
    output_dir.mkdir(exist_ok=True)
    
    print("\n🚀 Starting Sentiment Analysis on Benin Data")
    print("=" * 80)
    
    # Initialize analyzer
    analyzer = EnhancedThemeAnalyzer()
    
    # Find all review files (translated versions)
    review_files = list(input_dir.glob('*_translated.json'))
    
    if not review_files:
        print("❌ No review files found")
        return
    
    print(f"📁 Found {len(review_files)} stakeholder files\n")
    
    # Track results
    all_stakeholder_data = []
    
    # Process each stakeholder
    for file in sorted(review_files):
        print(f"🔍 Analyzing: {file.stem}")
        
        with open(file, 'r') as f:
            reviews = json.load(f)
        
        # Extract translated reviews (use translated_text and translated_title)
        review_texts = [r.get('translated_text', r.get('text', '')) for r in reviews if r.get('translated_text') or r.get('text')]
        review_titles = [r.get('translated_title', r.get('title', '')) for r in reviews if r.get('translated_title') or r.get('title')]
        
        # Combine text and titles for analysis (all in English now)
        combined_text = ' '.join([f"{t} {r}" for t, r in zip(review_titles, review_texts)])
        
        if not combined_text:
            print(f"   ⚠️  No text found, skipping")
            continue
        
        # Analyze themes with sentiment breakdown - now using English text
        # TextBlob works best with English, so we get better sentiment detection
        theme_analysis = analyzer.analyze_text_for_themes_with_sentiment(combined_text)
        theme_scores = {theme: data['score'] for theme, data in theme_analysis.items()}
        
        # Calculate sentiment
        sentiment_score = analyzer.get_sentiment_score(combined_text)
        
        # Convert theme analysis to detailed format
        detailed_themes = {}
        for theme, data in theme_analysis.items():
            if data['mentions'] > 0:
                detailed_themes[theme] = {
                    'score': data['score'],
                    'sentiment_score': data['sentiment_score'],
                    'mentions': data['mentions'],
                    'positive': data['sentiment_breakdown']['positive'],
                    'negative': data['sentiment_breakdown']['negative'],
                    'neutral': data['sentiment_breakdown']['neutral']
                }
        
        # Extract original language distribution
        original_langs = []
        for r in reviews:
            meta = r.get('metadata', {})
            # Try original_language first, then language_detected
            lang = meta.get('original_language') or meta.get('language_detected', 'unknown')
            original_langs.append(lang)
        lang_dist = Counter(original_langs)
        
        # Calculate average rating from actual ratings
        ratings = [r.get('rating', 0) for r in reviews if r.get('rating')]
        avg_rating = sum(ratings) / len(ratings) if ratings else 0
        
        # Get TripAdvisor URL from first review's placeInfo
        tripadvisor_url = None
        for r in reviews:
            if r.get('placeInfo', {}).get('webUrl'):
                tripadvisor_url = r['placeInfo']['webUrl']
                break
        
        # Create stakeholder data
        stakeholder_data = {
            'stakeholder_name': file.stem.replace('_reviews_translated', '').replace('_translated', ''),
            'total_reviews': len(reviews),
            'overall_sentiment': sentiment_score,
            'theme_scores': theme_scores,
            'detailed_theme_analysis': detailed_themes,
            'language_distribution': dict(lang_dist),
            'metadata': {
                'analyzed_at': datetime.now().isoformat(),
                'source': 'tripadvisor',
                'original_languages': dict(lang_dist),
                'average_rating': round(avg_rating, 1),
                'tripadvisor_url': tripadvisor_url
            }
        }
        
        all_stakeholder_data.append(stakeholder_data)
        print(f"   ✓ Analyzed {len(reviews)} reviews")
    
    # Calculate summary statistics
    total_reviews = sum(s['total_reviews'] for s in all_stakeholder_data)
    avg_sentiment = sum(s['overall_sentiment'] for s in all_stakeholder_data) / len(all_stakeholder_data)
    
    # Aggregate theme scores
    theme_totals = defaultdict(list)
    for stakeholder in all_stakeholder_data:
        for theme, score in stakeholder['theme_scores'].items():
            theme_totals[theme].append(score)
    
    theme_averages = {theme: sum(scores) / len(scores) if scores else 0 
                     for theme, scores in theme_totals.items()}
    
    # Create final output
    output_data = {
        'metadata': {
            'generated_at': datetime.now().isoformat(),
            'project': 'benin',
            'sector': 'cultural_heritage',
            'total_stakeholders': len(all_stakeholder_data),
            'total_reviews': total_reviews,
            'overall_sentiment': avg_sentiment
        },
        'summary': {
            'total_reviews': total_reviews,
            'total_stakeholders': len(all_stakeholder_data),
            'average_sentiment': avg_sentiment,
            'theme_averages': theme_averages
        },
        'stakeholder_data': all_stakeholder_data
    }
    
    # Save output
    output_file = output_dir / 'benin_sentiment_analysis.json'
    with open(output_file, 'w') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print("\n" + "=" * 80)
    print("ANALYSIS SUMMARY")
    print("=" * 80)
    print(f"Stakeholders analyzed: {len(all_stakeholder_data)}")
    print(f"Total reviews: {total_reviews}")
    print(f"Average sentiment: {avg_sentiment:.3f}")
    print("\nTheme Averages:")
    for theme, score in sorted(theme_averages.items(), key=lambda x: x[1], reverse=True):
        print(f"  {theme:>25}: {score:.3f}")
    
    print(f"\n✅ Analysis complete!")
    print(f"📁 Output saved to: {output_file}")
    print("=" * 80)
    
    return output_data

if __name__ == "__main__":
    analyze_benin_sentiment()

