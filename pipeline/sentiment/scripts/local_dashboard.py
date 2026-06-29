#!/usr/bin/env python3
"""
Local Dashboard for Sentiment Analysis Data
Test and visualize the data before Google Sheets upload
"""

import json
import pandas as pd
from tabulate import tabulate
import matplotlib.pyplot as plt
import seaborn as sns

def load_analysis_data():
    """Load the comprehensive analysis results"""
    with open('../output/comprehensive_sentiment_analysis_results.json', 'r') as f:
        return json.load(f)

def create_summary_table(data):
    """Create a summary table of all stakeholders"""
    stakeholder_data = data['stakeholder_data']
    
    # Create summary table
    summary_data = []
    for stakeholder in stakeholder_data:
        summary_data.append({
            'Stakeholder': stakeholder['stakeholder_name'].replace('_', ' ').title(),
            'Reviews': stakeholder['total_reviews'],
            'Rating': f"{stakeholder['average_rating']:.1f}/5",
            'Sentiment': f"{stakeholder['overall_sentiment']:.3f}",
            'Positive %': f"{stakeholder['positive_rate']:.1f}%",
            'Critical Areas': len(stakeholder['critical_areas']),
            'Top Strength': stakeholder['key_strengths'][0]['theme'].replace('_', ' ').title() if stakeholder['key_strengths'] else 'None',
            'Top Weakness': stakeholder['key_weaknesses'][0]['theme'].replace('_', ' ').title() if stakeholder['key_weaknesses'] else 'None'
        })
    
    return pd.DataFrame(summary_data)

def create_theme_analysis_table(data):
    """Create theme analysis table"""
    stakeholder_data = data['stakeholder_data']
    
    # Get all unique themes
    all_themes = set()
    for stakeholder in stakeholder_data:
        all_themes.update(stakeholder['theme_scores'].keys())
    
    # Create theme analysis
    theme_data = []
    for stakeholder in stakeholder_data:
        row = {'Stakeholder': stakeholder['stakeholder_name'].replace('_', ' ').title()}
        for theme in sorted(all_themes):
            theme_info = stakeholder['theme_scores'].get(theme, {})
            score = theme_info.get('score', 0)
            mentions = theme_info.get('mentions', 0)
            row[f"{theme.replace('_', ' ').title()}"] = f"{score:.2f} ({mentions})"
        theme_data.append(row)
    
    return pd.DataFrame(theme_data)

def create_critical_areas_summary(data):
    """Create critical areas summary"""
    stakeholder_data = data['stakeholder_data']
    
    critical_areas = []
    for stakeholder in stakeholder_data:
        for area in stakeholder['critical_areas']:
            critical_areas.append({
                'Stakeholder': stakeholder['stakeholder_name'].replace('_', ' ').title(),
                'Theme': area['theme'].replace('_', ' ').title(),
                'Sentiment': f"{area['sentiment_score']:.2f}",
                'Priority': area['priority'].upper(),
                'Sample Quote': area['quotes'][0][:100] + "..." if area['quotes'] else "No quotes"
            })
    
    return pd.DataFrame(critical_areas)

def create_management_response_summary(data):
    """Create management response summary"""
    stakeholder_data = data['stakeholder_data']
    
    mgmt_data = []
    for stakeholder in stakeholder_data:
        mgmt = stakeholder['management_response']
        mgmt_data.append({
            'Stakeholder': stakeholder['stakeholder_name'].replace('_', ' ').title(),
            'Response Rate': f"{mgmt['response_rate']:.1f}%",
            'Total Responses': mgmt['total_responses'],
            'Gap Opportunity': mgmt['gap_opportunity'],
            'Reviews': stakeholder['total_reviews']
        })
    
    return pd.DataFrame(mgmt_data)

def create_visualizations(data):
    """Create visualizations of the data"""
    stakeholder_data = data['stakeholder_data']
    
    # Set up the plotting style
    plt.style.use('seaborn-v0_8')
    fig, axes = plt.subplots(2, 2, figsize=(15, 12))
    fig.suptitle('Sentiment Analysis Dashboard', fontsize=16, fontweight='bold')
    
    # 1. Sentiment vs Rating scatter plot
    ax1 = axes[0, 0]
    sentiments = [s['overall_sentiment'] for s in stakeholder_data]
    ratings = [s['average_rating'] for s in stakeholder_data]
    names = [s['stakeholder_name'].replace('_', ' ').title() for s in stakeholder_data]
    
    scatter = ax1.scatter(sentiments, ratings, s=100, alpha=0.7, c=sentiments, cmap='RdYlGn')
    ax1.set_xlabel('Overall Sentiment')
    ax1.set_ylabel('Average Rating')
    ax1.set_title('Sentiment vs Rating by Stakeholder')
    ax1.grid(True, alpha=0.3)
    
    # Add labels for points
    for i, name in enumerate(names):
        ax1.annotate(name, (sentiments[i], ratings[i]), xytext=(5, 5), 
                    textcoords='offset points', fontsize=8, alpha=0.8)
    
    # 2. Theme performance heatmap
    ax2 = axes[0, 1]
    
    # Get theme data for heatmap
    theme_names = []
    stakeholder_names = []
    theme_scores = []
    
    for stakeholder in stakeholder_data:
        stakeholder_names.append(stakeholder['stakeholder_name'].replace('_', ' ').title())
        stakeholder_scores = []
        for theme in ['guide_quality', 'cultural_value', 'historical_significance', 'infrastructure_state', 'accessibility_comfort']:
            score = stakeholder['theme_scores'].get(theme, {}).get('score', 0)
            stakeholder_scores.append(score)
        theme_scores.append(stakeholder_scores)
    
    theme_names = ['Guide Quality', 'Cultural Value', 'Historical Significance', 'Infrastructure State', 'Accessibility Comfort']
    
    im = ax2.imshow(theme_scores, cmap='RdYlGn', aspect='auto', vmin=-1, vmax=1)
    ax2.set_xticks(range(len(theme_names)))
    ax2.set_xticklabels(theme_names, rotation=45, ha='right')
    ax2.set_yticks(range(len(stakeholder_names)))
    ax2.set_yticklabels(stakeholder_names)
    ax2.set_title('Theme Performance Heatmap')
    
    # Add colorbar
    plt.colorbar(im, ax=ax2, shrink=0.8)
    
    # 3. Review count distribution
    ax3 = axes[1, 0]
    review_counts = [s['total_reviews'] for s in stakeholder_data]
    stakeholder_names_short = [name[:15] + '...' if len(name) > 15 else name for name in stakeholder_names]
    
    bars = ax3.bar(range(len(stakeholder_names_short)), review_counts, color='skyblue', alpha=0.7)
    ax3.set_xlabel('Stakeholders')
    ax3.set_ylabel('Number of Reviews')
    ax3.set_title('Review Count by Stakeholder')
    ax3.set_xticks(range(len(stakeholder_names_short)))
    ax3.set_xticklabels(stakeholder_names_short, rotation=45, ha='right')
    
    # Add value labels on bars
    for bar, count in zip(bars, review_counts):
        height = bar.get_height()
        ax3.text(bar.get_x() + bar.get_width()/2., height + 5,
                f'{count}', ha='center', va='bottom', fontsize=8)
    
    # 4. Management response rate
    ax4 = axes[1, 1]
    response_rates = [s['management_response']['response_rate'] for s in stakeholder_data]
    
    bars = ax4.bar(range(len(stakeholder_names_short)), response_rates, color='lightcoral', alpha=0.7)
    ax4.set_xlabel('Stakeholders')
    ax4.set_ylabel('Response Rate (%)')
    ax4.set_title('Management Response Rate')
    ax4.set_xticks(range(len(stakeholder_names_short)))
    ax4.set_xticklabels(stakeholder_names_short, rotation=45, ha='right')
    ax4.set_ylim(0, 100)
    
    # Add value labels on bars
    for bar, rate in zip(bars, response_rates):
        height = bar.get_height()
        ax4.text(bar.get_x() + bar.get_width()/2., height + 1,
                f'{rate:.1f}%', ha='center', va='bottom', fontsize=8)
    
    plt.tight_layout()
    plt.savefig('sentiment_analysis_dashboard.png', dpi=300, bbox_inches='tight')
    plt.show()

def main():
    """Main function to run the local dashboard"""
    print("🎯 LOCAL SENTIMENT ANALYSIS DASHBOARD")
    print("=" * 60)
    
    # Load data
    data = load_analysis_data()
    
    # Create summary table
    print("\n📊 STAKEHOLDER SUMMARY")
    print("-" * 40)
    summary_df = create_summary_table(data)
    print(tabulate(summary_df, headers='keys', tablefmt='grid', showindex=False))
    
    # Create theme analysis table
    print("\n🎯 THEME ANALYSIS")
    print("-" * 40)
    theme_df = create_theme_analysis_table(data)
    print(tabulate(theme_df, headers='keys', tablefmt='grid', showindex=False))
    
    # Create critical areas summary
    print("\n⚠️ CRITICAL AREAS FOR IMPROVEMENT")
    print("-" * 40)
    critical_df = create_critical_areas_summary(data)
    if not critical_df.empty:
        print(tabulate(critical_df, headers='keys', tablefmt='grid', showindex=False))
    else:
        print("No critical areas identified.")
    
    # Create management response summary
    print("\n📞 MANAGEMENT RESPONSE ANALYSIS")
    print("-" * 40)
    mgmt_df = create_management_response_summary(data)
    print(tabulate(mgmt_df, headers='keys', tablefmt='grid', showindex=False))
    
    # Create visualizations
    print("\n📈 Creating visualizations...")
    try:
        create_visualizations(data)
        print("✅ Dashboard visualization saved as 'sentiment_analysis_dashboard.png'")
    except Exception as e:
        print(f"⚠️ Could not create visualizations: {e}")
        print("   (This is optional - the data tables above show the key insights)")
    
    # Show sector summary
    sector = data['summary']
    print(f"\n🌍 SECTOR SUMMARY")
    print("-" * 40)
    print(f"Total Stakeholders: {sector['total_stakeholders']}")
    print(f"Total Reviews: {sector['total_reviews']:,}")
    print(f"Average Sentiment: {sector['average_sentiment']:.3f}")
    print(f"Average Rating: {sector['average_rating']:.1f}/5")
    
    # Show top themes
    print(f"\n🎯 TOP PERFORMING THEMES:")
    for theme, data in sorted(sector['theme_averages'].items(), key=lambda x: x[1]['average_score'], reverse=True):
        print(f"  {theme.replace('_', ' ').title()}: {data['average_score']:.2f} avg score")
    
    print(f"\n✅ Local dashboard complete!")
    print(f"📁 Files created:")
    print(f"  - sentiment_analysis_dashboard.png (if matplotlib available)")
    print(f"  - ../output/comprehensive_sentiment_analysis_results.json")
    print(f"  - sentiment_analysis_google_sheets.csv")

if __name__ == "__main__":
    main()
