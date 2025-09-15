#!/usr/bin/env python3
"""
Batch sentiment analysis for all stakeholders
Processes all English review files and generates comprehensive analysis
"""

import json
import os
import glob
from datetime import datetime
from enhanced_sentiment_analysis import EnhancedSentimentAnalyzer

def find_english_review_files(base_dir="../data/raw_reviews/oct_2025"):
    """Find all English review JSON files"""
    pattern = f"{base_dir}/**/*_ENG.json"
    files = glob.glob(pattern, recursive=True)
    return files

def process_all_stakeholders():
    """Process all stakeholder files and generate comprehensive analysis"""
    print("🔍 Batch Sentiment Analysis for All Stakeholders")
    print("=" * 60)
    
    # Initialize analyzer
    analyzer = EnhancedSentimentAnalyzer()
    
    # Find all English review files
    review_files = find_english_review_files()
    
    if not review_files:
        print("❌ No English review files found")
        return
    
    print(f"📁 Found {len(review_files)} stakeholder files to analyze")
    print()
    
    # Process each stakeholder
    all_results = []
    summary_stats = {
        'total_stakeholders': 0,
        'total_reviews': 0,
        'overall_sentiment_avg': 0,
        'language_distribution': {},
        'top_themes': {},
        'sector_breakdown': {}
    }
    
    for file_path in review_files:
        try:
            print(f"🔄 Processing: {os.path.basename(file_path)}")
            
            # Load data
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Extract reviews and stakeholder name
            if 'reviews' in data:
                reviews_data = data['reviews']
                stakeholder_name = data.get('collection_metadata', {}).get('stakeholder', 'unknown')
            else:
                reviews_data = data
                stakeholder_name = os.path.basename(os.path.dirname(file_path))
            
            # If still unknown, extract from filename
            if stakeholder_name == 'unknown':
                filename = os.path.basename(file_path)
                stakeholder_name = filename.replace('_reviews_ENG.json', '').replace('_', ' ').title()
            
            # Analyze stakeholder
            results = analyzer.analyze_stakeholder(reviews_data)
            results['stakeholder'] = stakeholder_name  # Override with correct name
            results['file_path'] = file_path
            all_results.append(results)
            
            # Update summary stats
            summary_stats['total_stakeholders'] += 1
            summary_stats['total_reviews'] += results['total_reviews']
            summary_stats['overall_sentiment_avg'] += results['overall_sentiment']
            
            # Language distribution
            for lang, count in results['demographics']['language_distribution'].items():
                summary_stats['language_distribution'][lang] = summary_stats['language_distribution'].get(lang, 0) + count
            
            # Theme analysis
            for theme, analysis in results['theme_analysis'].items():
                if theme not in summary_stats['top_themes']:
                    summary_stats['top_themes'][theme] = {'total_mentions': 0, 'avg_score': 0, 'stakeholders': 0}
                
                summary_stats['top_themes'][theme]['total_mentions'] += analysis['mention_count']
                summary_stats['top_themes'][theme]['avg_score'] += analysis['average_score']
                summary_stats['top_themes'][theme]['stakeholders'] += 1
            
            print(f"  ✅ {results['total_reviews']} reviews, sentiment: {results['overall_sentiment']:.2f}")
            
        except Exception as e:
            print(f"  ❌ Error processing {file_path}: {e}")
            continue
    
    # Calculate averages
    if summary_stats['total_stakeholders'] > 0:
        summary_stats['overall_sentiment_avg'] /= summary_stats['total_stakeholders']
        
        # Calculate theme averages
        for theme in summary_stats['top_themes']:
            if summary_stats['top_themes'][theme]['stakeholders'] > 0:
                summary_stats['top_themes'][theme]['avg_score'] /= summary_stats['top_themes'][theme]['stakeholders']
    
    # Print comprehensive summary
    print("\n" + "=" * 60)
    print("📊 COMPREHENSIVE ANALYSIS SUMMARY")
    print("=" * 60)
    
    print(f"Total Stakeholders Analyzed: {summary_stats['total_stakeholders']}")
    print(f"Total Reviews Processed: {summary_stats['total_reviews']}")
    print(f"Average Sentiment Score: {summary_stats['overall_sentiment_avg']:.2f}")
    print()
    
    # Language distribution
    print("🌍 LANGUAGE DISTRIBUTION:")
    for lang, count in sorted(summary_stats['language_distribution'].items(), key=lambda x: x[1], reverse=True):
        percentage = (count / summary_stats['total_reviews']) * 100
        print(f"  {lang.upper()}: {count} reviews ({percentage:.1f}%)")
    print()
    
    # Top themes
    print("🎯 TOP THEMES ACROSS ALL STAKEHOLDERS:")
    sorted_themes = sorted(summary_stats['top_themes'].items(), 
                          key=lambda x: x[1]['total_mentions'], reverse=True)
    
    for theme, stats in sorted_themes[:10]:  # Top 10 themes
        avg_score = stats['avg_score']
        total_mentions = stats['total_mentions']
        stakeholders = stats['stakeholders']
        print(f"  {theme}: {avg_score:.2f} avg score, {total_mentions} mentions across {stakeholders} stakeholders")
    print()
    
    # Individual stakeholder results
    print("🏢 STAKEHOLDER BREAKDOWN:")
    print("-" * 60)
    
    # Sort by sentiment score
    sorted_results = sorted(all_results, key=lambda x: x['overall_sentiment'], reverse=True)
    
    for result in sorted_results:
        stakeholder = result['stakeholder']
        reviews = result['total_reviews']
        sentiment = result['overall_sentiment']
        rating = result['demographics']['average_rating']
        
        # Get top 3 themes for this stakeholder
        top_themes = sorted(result['theme_analysis'].items(), 
                           key=lambda x: x[1]['mention_count'], reverse=True)[:3]
        theme_names = [theme for theme, _ in top_themes]
        
        print(f"{stakeholder:<25} | {reviews:>3} reviews | {sentiment:>4.2f} sentiment | {rating:>3.1f} rating | {', '.join(theme_names)}")
    
    print("\n" + "=" * 60)
    print("📈 GOOGLE SHEETS INTEGRATION READY")
    print("=" * 60)
    print("The analysis results are now ready to be integrated with Google Sheets.")
    print("Key data points for dashboard display:")
    print("• Overall sentiment scores by stakeholder")
    print("• Theme analysis with mention counts and scores")
    print("• Language distribution insights")
    print("• Demographic breakdown by location")
    print("• Quote extraction for qualitative insights")
    
    return all_results, summary_stats

def generate_google_sheets_data(all_results, summary_stats):
    """Generate data structure optimized for Google Sheets integration"""
    
    # Main stakeholder data for Google Sheets
    stakeholder_data = []
    
    for result in all_results:
        row = {
            'stakeholder_name': result['stakeholder'],
            'total_reviews': result['total_reviews'],
            'overall_sentiment': round(result['overall_sentiment'], 2),
            'average_rating': round(result['demographics']['average_rating'], 1),
            'language_diversity': len(result['demographics']['language_distribution']),
            'top_theme': max(result['theme_analysis'].items(), key=lambda x: x[1]['mention_count'])[0] if result['theme_analysis'] else 'N/A',
            'top_theme_score': round(max(result['theme_analysis'].items(), key=lambda x: x[1]['mention_count'])[1]['average_score'], 2) if result['theme_analysis'] else 0,
            'analysis_date': datetime.now().strftime('%Y-%m-%d')
        }
        
        # Add theme scores
        for theme, analysis in result['theme_analysis'].items():
            row[f'theme_{theme.lower()}_score'] = round(analysis['average_score'], 2)
            row[f'theme_{theme.lower()}_mentions'] = analysis['mention_count']
        
        stakeholder_data.append(row)
    
    return stakeholder_data

if __name__ == "__main__":
    # Run the batch analysis
    all_results, summary_stats = process_all_stakeholders()
    
    # Generate Google Sheets data
    sheets_data = generate_google_sheets_data(all_results, summary_stats)
    
    # Save results to JSON for Google Sheets integration
    output_file = 'sentiment_analysis_results.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'summary': summary_stats,
            'stakeholder_data': sheets_data,
            'generated_at': datetime.now().isoformat()
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Results saved to: {output_file}")
    print("This file can be imported into Google Sheets for dashboard visualization.")
