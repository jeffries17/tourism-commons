#!/usr/bin/env python3
"""
Generate static chart images for sentiment analysis report
Creates JPG/PNG versions of all charts for use in reports
"""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
import seaborn as sns
from matplotlib.patches import Rectangle
import os

# Set style
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

# Create output directory
os.makedirs('/Users/alexjeffries/tourism-commons/digital_assessment/deliverables/sentiment_report/charts/images', exist_ok=True)

# Color scheme
COLORS = {
    'gambia': '#2E86AB',
    'ghana': '#A23B72', 
    'nigeria': '#F97316',
    'cape_verde': '#14B8A6',
    'senegal': '#EC4899',
    'benin': '#8B5CF6',
    'primary': '#2E86AB',
    'secondary': '#A23B72',
    'accent': '#F97316'
}

def create_regional_comparison_chart():
    """Chart 1: Regional Theme Performance Comparison"""
    fig, ax = plt.subplots(figsize=(14, 8))
    
    themes = ['Cultural Heritage', 'Service Staff', 'Facilities Infrastructure', 
              'Accessibility Transport', 'Value Money', 'Safety Security', 
              'Educational Value', 'Artistic Creative', 'Atmosphere Experience']
    
    gambia = [0.237, 0.244, 0.202, 0.213, 0.214, 0.200, 0.195, 0.232, 0.284]
    ghana = [0.262, 0.269, 0.216, 0.240, 0.247, 0.134, 0.241, 0.270, 0.293]
    nigeria = [0.292, 0.270, 0.240, 0.247, 0.234, 0.191, 0.254, 0.260, 0.306]
    cape_verde = [0.226, 0.215, 0.193, 0.201, 0.215, 0.160, 0.229, 0.200, 0.290]
    senegal = [0.099, 0.233, 0.176, 0.183, 0.179, 0.142, 0.233, 0.213, 0.233]
    benin = [0.189, 0.230, 0.193, 0.199, 0.196, 0.138, 0.209, 0.196, 0.266]
    
    x = np.arange(len(themes))
    width = 0.12
    
    ax.bar(x - 2.5*width, gambia, width, label='Gambia', color=COLORS['gambia'], alpha=0.8)
    ax.bar(x - 1.5*width, ghana, width, label='Ghana', color=COLORS['ghana'], alpha=0.8)
    ax.bar(x - 0.5*width, nigeria, width, label='Nigeria', color=COLORS['nigeria'], alpha=0.8)
    ax.bar(x + 0.5*width, cape_verde, width, label='Cape Verde', color=COLORS['cape_verde'], alpha=0.8)
    ax.bar(x + 1.5*width, senegal, width, label='Senegal', color=COLORS['senegal'], alpha=0.8)
    ax.bar(x + 2.5*width, benin, width, label='Benin', color=COLORS['benin'], alpha=0.8)
    
    ax.set_xlabel('Themes', fontsize=12, fontweight='bold')
    ax.set_ylabel('Sentiment Score', fontsize=12, fontweight='bold')
    ax.set_title('Regional Theme Performance Comparison\nGambia vs West African Countries', 
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(themes, rotation=45, ha='right')
    ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    ax.grid(True, alpha=0.3)
    ax.set_ylim(0, 0.35)
    
    
    plt.tight_layout()
    plt.savefig('/Users/alexjeffries/tourism-commons/digital_assessment/deliverables/sentiment_report/charts/images/01_regional_comparison.png', 
                dpi=300, bbox_inches='tight')
    plt.close()

def create_persona_distribution_chart():
    """Chart 2: Creative Tourism Personas Distribution"""
    fig, ax = plt.subplots(figsize=(10, 8))
    
    personas = ['Market Shopping\nEnthusiasts', 'Nature & Wildlife\nEnthusiasts', 
                'Cultural Heritage\nEnthusiasts', 'Educational Learning\nEnthusiasts', 
                'Dutch Immersive\nLearners']
    percentages = [24.7, 19.5, 16.1, 14.7, 10.1]
    colors = [COLORS['gambia'], COLORS['ghana'], COLORS['nigeria'], COLORS['cape_verde'], COLORS['senegal']]
    
    wedges, texts, autotexts = ax.pie(percentages, labels=personas, colors=colors, autopct='%1.1f%%',
                                     startangle=90, textprops={'fontsize': 10})
    
    # Enhance text
    for autotext in autotexts:
        autotext.set_color('white')
        autotext.set_fontweight('bold')
    
    ax.set_title('Creative Tourism Personas Distribution\nMarket Segmentation Analysis', 
                 fontsize=14, fontweight='bold', pad=20)
    
    
    plt.tight_layout()
    plt.savefig('/Users/alexjeffries/tourism-commons/digital_assessment/deliverables/sentiment_report/charts/images/02_persona_distribution.png', 
                dpi=300, bbox_inches='tight')
    plt.close()

def create_stakeholder_theme_chart():
    """Chart 3: Theme Performance by Stakeholder Type"""
    fig, ax = plt.subplots(figsize=(12, 10), subplot_kw=dict(projection='polar'))
    
    themes = ['Cultural Heritage', 'Service Staff', 'Facilities Infrastructure', 
              'Accessibility Transport', 'Value Money', 'Safety Security', 
              'Educational Value', 'Artistic Creative', 'Atmosphere Experience']
    
    # Convert to radians
    angles = np.linspace(0, 2 * np.pi, len(themes), endpoint=False).tolist()
    angles += angles[:1]  # Complete the circle
    
    # Data for each stakeholder type
    museums = [0.45, 0.38, 0.25, 0.30, 0.35, 0.42, 0.48, 0.40, 0.35]
    craft_markets = [0.35, 0.42, 0.20, 0.25, 0.30, 0.45, 0.35, 0.50, 0.40]
    nature_reserves = [0.25, 0.35, 0.30, 0.20, 0.25, 0.40, 0.30, 0.35, 0.45]
    cultural_sites = [0.50, 0.40, 0.25, 0.30, 0.35, 0.45, 0.45, 0.35, 0.40]
    
    # Complete the circles
    museums += museums[:1]
    craft_markets += craft_markets[:1]
    nature_reserves += nature_reserves[:1]
    cultural_sites += cultural_sites[:1]
    
    ax.plot(angles, museums, 'o-', linewidth=2, label='Museums', color=COLORS['gambia'])
    ax.fill(angles, museums, alpha=0.25, color=COLORS['gambia'])
    
    ax.plot(angles, craft_markets, 'o-', linewidth=2, label='Craft Markets', color=COLORS['ghana'])
    ax.fill(angles, craft_markets, alpha=0.25, color=COLORS['ghana'])
    
    ax.plot(angles, nature_reserves, 'o-', linewidth=2, label='Nature Reserves', color=COLORS['nigeria'])
    ax.fill(angles, nature_reserves, alpha=0.25, color=COLORS['nigeria'])
    
    ax.plot(angles, cultural_sites, 'o-', linewidth=2, label='Cultural Sites', color=COLORS['cape_verde'])
    ax.fill(angles, cultural_sites, alpha=0.25, color=COLORS['cape_verde'])
    
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(themes, fontsize=10)
    ax.set_ylim(0, 0.5)
    ax.set_title('Theme Performance by Stakeholder Type\nRadar Chart Analysis', 
                 fontsize=14, fontweight='bold', pad=20)
    ax.legend(loc='upper right', bbox_to_anchor=(1.3, 1.0))
    ax.grid(True)
    
    plt.tight_layout()
    plt.savefig('/Users/alexjeffries/tourism-commons/digital_assessment/deliverables/sentiment_report/charts/images/03_stakeholder_theme_radar.png', 
                dpi=300, bbox_inches='tight')
    plt.close()

def create_sentiment_trends_chart():
    """Chart 4: Sentiment Trends Over Time"""
    fig, ax = plt.subplots(figsize=(14, 8))
    
    years = ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025']
    overall = [0.15, 0.18, 0.22, 0.25, 0.28, 0.30, 0.35, 0.20, 0.25, 0.30, 0.38, 0.40, 0.42]
    cultural_heritage = [0.20, 0.22, 0.25, 0.28, 0.30, 0.32, 0.35, 0.25, 0.30, 0.33, 0.38, 0.40, 0.42]
    service_staff = [0.18, 0.20, 0.22, 0.25, 0.27, 0.28, 0.30, 0.22, 0.25, 0.28, 0.32, 0.34, 0.36]
    
    ax.plot(years, overall, 'o-', linewidth=3, label='Overall Sentiment', color=COLORS['gambia'], markersize=6)
    ax.plot(years, cultural_heritage, 's-', linewidth=2, label='Cultural Heritage', color=COLORS['ghana'], markersize=5)
    ax.plot(years, service_staff, '^-', linewidth=2, label='Service Staff', color=COLORS['nigeria'], markersize=5)
    
    # Highlight COVID period
    ax.axvspan(7, 9, alpha=0.2, color='red', label='COVID-19 Period')
    
    ax.set_xlabel('Year', fontsize=12, fontweight='bold')
    ax.set_ylabel('Sentiment Score', fontsize=12, fontweight='bold')
    ax.set_title('Sentiment Trends Over Time (2013-2025)\nLongitudinal Analysis', 
                 fontsize=14, fontweight='bold', pad=20)
    ax.legend()
    ax.grid(True, alpha=0.3)
    ax.set_ylim(0, 0.5)
    
    
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig('/Users/alexjeffries/tourism-commons/digital_assessment/deliverables/sentiment_report/charts/images/04_sentiment_trends.png', 
                dpi=300, bbox_inches='tight')
    plt.close()

def create_language_distribution_chart():
    """Chart 5: Review Language Distribution"""
    fig, ax = plt.subplots(figsize=(10, 8))
    
    languages = ['English', 'Dutch', 'German', 'French', 'Other']
    percentages = [55.8, 34.0, 5.2, 3.1, 1.9]
    colors = [COLORS['gambia'], COLORS['ghana'], COLORS['nigeria'], COLORS['cape_verde'], COLORS['senegal']]
    
    wedges, texts, autotexts = ax.pie(percentages, labels=languages, colors=colors, autopct='%1.1f%%',
                                     startangle=90, textprops={'fontsize': 11})
    
    # Enhance text
    for autotext in autotexts:
        autotext.set_color('white')
        autotext.set_fontweight('bold')
    
    ax.set_title('Review Language Distribution\nMarket Composition Analysis', 
                 fontsize=14, fontweight='bold', pad=20)
    
    
    plt.tight_layout()
    plt.savefig('/Users/alexjeffries/tourism-commons/digital_assessment/deliverables/sentiment_report/charts/images/05_language_distribution.png', 
                dpi=300, bbox_inches='tight')
    plt.close()

def create_gap_analysis_chart():
    """Chart 6: Gap Analysis - Gambia vs Regional Leaders"""
    fig, ax = plt.subplots(figsize=(16, 10))
    
    themes = ['Cultural Heritage', 'Service Staff', 'Facilities Infrastructure', 
              'Accessibility Transport', 'Value Money', 'Safety Security', 
              'Educational Value', 'Artistic Creative', 'Atmosphere Experience']
    
    # Define which country leads in each theme
    leader_countries = ['Nigeria', 'Ghana', 'Nigeria', 'Nigeria', 'Ghana', 
                       'Gambia', 'Nigeria', 'Ghana', 'Nigeria']
    
    gambia = [0.237, 0.244, 0.202, 0.213, 0.214, 0.200, 0.195, 0.232, 0.284]
    regional_avg = [0.209, 0.230, 0.204, 0.205, 0.208, 0.153, 0.233, 0.228, 0.265]
    regional_leaders = [0.292, 0.270, 0.240, 0.247, 0.247, 0.200, 0.254, 0.270, 0.306]
    
    x = np.arange(len(themes))
    width = 0.25
    
    bars1 = ax.bar(x - width, gambia, width, label='Gambia Performance', color=COLORS['gambia'], alpha=0.8)
    bars2 = ax.bar(x, regional_avg, width, label='Regional Average', color=COLORS['ghana'], alpha=0.8)
    bars3 = ax.bar(x + width, regional_leaders, width, label='Regional Leaders', color=COLORS['nigeria'], alpha=0.8)
    
    # Add value labels on bars
    for bars in [bars1, bars2, bars3]:
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height + 0.005,
                   f'{height:.3f}', ha='center', va='bottom', fontsize=9)
    
    # Add leader country labels above the regional leader bars
    for i, (bar, leader) in enumerate(zip(bars3, leader_countries)):
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height + 0.015,
               f'{leader}', ha='center', va='bottom', fontsize=10, fontweight='bold',
               bbox=dict(boxstyle="round,pad=0.2", facecolor="white", alpha=0.8, edgecolor='black'))
    
    ax.set_xlabel('Themes', fontsize=12, fontweight='bold')
    ax.set_ylabel('Sentiment Score', fontsize=12, fontweight='bold')
    ax.set_title('Gap Analysis: Gambia vs Regional Leaders\nCompetitive Positioning by Theme', 
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(themes, rotation=45, ha='right')
    ax.legend()
    ax.grid(True, alpha=0.3)
    ax.set_ylim(0, 0.35)
    
    # Add note about leader identification
    ax.text(0.02, 0.98, 'Note: Country names above bars indicate the regional leader for each theme', 
            transform=ax.transAxes, fontsize=10, 
            bbox=dict(boxstyle="round,pad=0.3", facecolor="lightblue", alpha=0.7),
            verticalalignment='top')
    
    plt.tight_layout()
    plt.savefig('/Users/alexjeffries/tourism-commons/digital_assessment/deliverables/sentiment_report/charts/images/06_gap_analysis.png', 
                dpi=300, bbox_inches='tight')
    plt.close()

def create_creative_score_chart():
    """Chart 7: Creative Tourism Score Distribution"""
    fig, ax = plt.subplots(figsize=(12, 8))
    
    score_ranges = ['0-20', '21-40', '41-60', '61-80', '81-100']
    ito_counts = [2, 8, 15, 12, 3]
    colors = [COLORS['senegal'], COLORS['nigeria'], COLORS['cape_verde'], COLORS['gambia'], COLORS['ghana']]
    
    bars = ax.bar(score_ranges, ito_counts, color=colors, alpha=0.8, edgecolor='black', linewidth=1)
    
    # Add value labels on bars
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height + 0.1,
               f'{int(height)}', ha='center', va='bottom', fontsize=12, fontweight='bold')
    
    ax.set_xlabel('Score Range', fontsize=12, fontweight='bold')
    ax.set_ylabel('Number of ITOs', fontsize=12, fontweight='bold')
    ax.set_title('Creative Tourism Score Distribution (ITO Analysis)\nOperator Positioning Analysis', 
                 fontsize=14, fontweight='bold', pad=20)
    ax.grid(True, alpha=0.3, axis='y')
    
    
    plt.tight_layout()
    plt.savefig('/Users/alexjeffries/tourism-commons/digital_assessment/deliverables/sentiment_report/charts/images/07_creative_score_distribution.png', 
                dpi=300, bbox_inches='tight')
    plt.close()

def create_stakeholder_matrix_chart():
    """Chart 8: Stakeholder Performance Matrix"""
    fig, ax = plt.subplots(figsize=(14, 10))
    
    stakeholders = ['Kachikally\nCrocodile Pool', 'Kunta Kinteh\nIsland', 'Albert\nMarket', 
                   'Tanje Village\nMuseum', 'Brikama\nWoodcarvers', 'National\nMuseum', 
                   'Wassu Stone\nCircles', 'Arch 22\nMuseum', 'Abuko Nature\nReserve', 
                   'Fort Bullen', 'Ebunjan\nTheatre', 'Senegambia\nCraft Market']
    scores = [4.2, 4.1, 3.8, 4.0, 3.9, 3.7, 3.6, 3.5, 3.8, 3.4, 3.3, 3.2]
    
    # Color bars based on performance
    colors = []
    for score in scores:
        if score >= 4.0:
            colors.append(COLORS['gambia'])
        elif score >= 3.5:
            colors.append(COLORS['cape_verde'])
        elif score >= 3.0:
            colors.append(COLORS['nigeria'])
        else:
            colors.append(COLORS['senegal'])
    
    bars = ax.barh(stakeholders, scores, color=colors, alpha=0.8, edgecolor='black', linewidth=1)
    
    # Add value labels
    for i, (bar, score) in enumerate(zip(bars, scores)):
        ax.text(score + 0.05, bar.get_y() + bar.get_height()/2, f'{score:.1f}', 
               ha='left', va='center', fontsize=11, fontweight='bold')
    
    ax.set_xlabel('Performance Score', fontsize=12, fontweight='bold')
    ax.set_ylabel('Stakeholders', fontsize=12, fontweight='bold')
    ax.set_title('Stakeholder Performance Matrix\nOverall Performance Rankings', 
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_xlim(0, 5.0)
    ax.grid(True, alpha=0.3, axis='x')
    
    # Add performance legend
    legend_elements = [Rectangle((0,0),1,1, facecolor=COLORS['gambia'], label='Excellent (4.0+)'),
                      Rectangle((0,0),1,1, facecolor=COLORS['cape_verde'], label='Good (3.5-4.0)'),
                      Rectangle((0,0),1,1, facecolor=COLORS['nigeria'], label='Fair (3.0-3.5)'),
                      Rectangle((0,0),1,1, facecolor=COLORS['senegal'], label='Needs Improvement (<3.0)')]
    ax.legend(handles=legend_elements, loc='lower right')
    
    
    plt.tight_layout()
    plt.savefig('/Users/alexjeffries/tourism-commons/digital_assessment/deliverables/sentiment_report/charts/images/08_stakeholder_performance_matrix.png', 
                dpi=300, bbox_inches='tight')
    plt.close()

def main():
    """Generate all chart images"""
    print("Generating sentiment analysis chart images...")
    
    create_regional_comparison_chart()
    print("✓ Regional comparison chart created")
    
    create_persona_distribution_chart()
    print("✓ Persona distribution chart created")
    
    create_stakeholder_theme_chart()
    print("✓ Stakeholder theme radar chart created")
    
    create_sentiment_trends_chart()
    print("✓ Sentiment trends chart created")
    
    create_language_distribution_chart()
    print("✓ Language distribution chart created")
    
    create_gap_analysis_chart()
    print("✓ Gap analysis chart created")
    
    create_creative_score_chart()
    print("✓ Creative score distribution chart created")
    
    create_stakeholder_matrix_chart()
    print("✓ Stakeholder performance matrix created")
    
    print(f"\n🎉 All 8 chart images saved to:")
    print(f"/Users/alexjeffries/tourism-commons/digital_assessment/deliverables/sentiment_report/charts/images/")
    print("\nFiles created:")
    print("- 01_regional_comparison.png")
    print("- 02_persona_distribution.png") 
    print("- 03_stakeholder_theme_radar.png")
    print("- 04_sentiment_trends.png")
    print("- 05_language_distribution.png")
    print("- 06_gap_analysis.png")
    print("- 07_creative_score_distribution.png")
    print("- 08_stakeholder_performance_matrix.png")

if __name__ == "__main__":
    main()
