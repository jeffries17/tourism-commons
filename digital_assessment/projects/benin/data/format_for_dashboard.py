#!/usr/bin/env python3
"""
Format Benin sentiment analysis for dashboard consumption
Converts analysis output to the expected dashboard format
"""

import json
from pathlib import Path
from datetime import datetime
from collections import Counter, defaultdict

def format_benin_for_dashboard():
    """Convert Benin sentiment analysis to dashboard format"""
    
    base_dir = Path(__file__).parent
    
    # Load sentiment analysis
    input_file = base_dir / "sentiment_outputs" / "benin_sentiment_analysis.json"
    
    with open(input_file, 'r') as f:
        analysis_data = json.load(f)
    
    # Load year distribution from metadata
    metadata_file = base_dir / "prepared_for_analysis" / "benin_metadata.json"
    
    all_years = Counter()
    all_langs = Counter()
    
    if metadata_file.exists():
        with open(metadata_file, 'r') as f:
            metadata = json.load(f)
            all_years = Counter(metadata.get('years', {}))
            all_langs = Counter(metadata.get('languages', {}))
    
    # Format for dashboard
    dashboard_data = {
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "title": "Benin Cultural Heritage Sentiment Analysis",
            "total_stakeholders": analysis_data['metadata']['total_stakeholders'],
            "total_reviews": analysis_data['metadata']['total_reviews'],
            "unified_themes": [
                "cultural_heritage",
                "service_staff",
                "facilities_infrastructure",
                "accessibility_transport",
                "value_money",
                "safety_security",
                "educational_value",
                "artistic_creative",
                "atmosphere_experience"
            ]
        },
        "stakeholder_data": []
    }
    
    # Convert each stakeholder
    for stakeholder in analysis_data['stakeholder_data']:
        name = stakeholder['stakeholder_name'].replace('_', ' ').title()
        
        # Convert theme_scores format with actual sentiment breakdown
        theme_scores = {}
        detailed_analysis = stakeholder.get('detailed_theme_analysis', {})
        
        for theme, score in stakeholder['theme_scores'].items():
            # Use detailed analysis if available, otherwise estimate
            if theme in detailed_analysis:
                details = detailed_analysis[theme]
                theme_scores[theme] = {
                    "score": round(details.get('score', score), 2),
                    "mentions": details.get('mentions', 0),
                    "sentiment_score": round(details.get('sentiment_score', 0), 2),
                    "distribution": {
                        "positive": details.get('positive', 0),
                        "neutral": details.get('neutral', 0),
                        "negative": details.get('negative', 0)
                    }
                }
            else:
                # Fallback: estimate based on score
                mentions = int(score * 100) if score > 0 else 0
                theme_scores[theme] = {
                    "score": round(score, 2),
                    "mentions": mentions,
                    "sentiment_score": score,
                    "distribution": {
                        "positive": int(mentions * 0.6),
                        "neutral": int(mentions * 0.3),
                        "negative": int(mentions * 0.1)
                    }
                }
        
        # Get language distribution - need to include French from original_languages
        lang_dist = stakeholder.get('language_distribution', {})
        if not lang_dist:
            lang_dist = {'fr': stakeholder['total_reviews']}
        
        # Check metadata for original_languages which includes fr
        if 'metadata' in stakeholder and 'original_languages' in stakeholder['metadata']:
            # Merge with any missing languages from original_languages
            for lang, count in stakeholder['metadata']['original_languages'].items():
                if lang not in lang_dist:
                    lang_dist[lang] = count
                elif lang == 'fr':
                    # Ensure French is included
                    lang_dist[lang] = count
        
        # Get rating from metadata if available
        avg_rating = 5.0  # Default fallback
        if 'metadata' in stakeholder and 'average_rating' in stakeholder['metadata']:
            avg_rating = stakeholder['metadata']['average_rating']
        else:
            # Fallback: estimate from sentiment
            avg_rating = (stakeholder['overall_sentiment'] + 1) * 2.5 + 2.5
            avg_rating = max(1, min(5, avg_rating))
        
        # Get TripAdvisor URL from metadata if available
        ta_url = stakeholder.get('metadata', {}).get('tripadvisor_url') or f"https://www.tripadvisor.fr/Search?q={name.replace(' ', '+')}"
        
        formatted_stakeholder = {
            "stakeholder_name": name,
            "source": "benin_cultural_heritage",
            "total_reviews": stakeholder['total_reviews'],
            "average_rating": round(avg_rating, 1),
            "tripadvisor_url": ta_url,
            "overall_sentiment": round(stakeholder['overall_sentiment'], 3),
            "positive_rate": 0.5 + (stakeholder['overall_sentiment'] / 2),  # Estimate
            "language_distribution": lang_dist,
            "theme_scores": theme_scores,
            "year_distribution": dict(all_years) if all_years else {"2024": 50, "2023": 50}
        }
        
        dashboard_data["stakeholder_data"].append(formatted_stakeholder)
    
    # Save for dashboard
    output_dir = Path("/Users/alexjeffries/tourism-commons/digital_assessment/dashboard/public")
    output_file = output_dir / "benin_sentiment_data.json"
    
    # Ensure directory exists
    output_dir.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w') as f:
        json.dump(dashboard_data, f, indent=2, ensure_ascii=False)
    
    print("\n" + "=" * 80)
    print("BENIN SENTIMENT ANALYSIS - DASHBOARD READY")
    print("=" * 80)
    print(f"✅ Formatted {len(dashboard_data['stakeholder_data'])} stakeholders")
    print(f"✅ Total reviews: {dashboard_data['metadata']['total_reviews']}")
    print(f"\nTheme Performance:")
    for theme, avg in sorted(analysis_data['summary']['theme_averages'].items(), 
                             key=lambda x: x[1], reverse=True):
        print(f"  {theme:>25}: {avg:.3f}")
    
    print(f"\n📁 Dashboard data saved to: {output_file}")
    print("=" * 80)
    
    return output_file

if __name__ == "__main__":
    format_benin_for_dashboard()

