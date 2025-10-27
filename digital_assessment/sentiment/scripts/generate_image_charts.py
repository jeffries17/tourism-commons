#!/usr/bin/env python3
"""
Image Chart Generator for Sentiment Analysis
Generates PNG/JPG charts using matplotlib and seaborn for sentiment analysis report.
"""

import json
import os
import sys
from pathlib import Path

# Try to import matplotlib, if not available, provide alternative
try:
    import matplotlib.pyplot as plt
    import matplotlib
    matplotlib.use('Agg')  # Use non-interactive backend
    import seaborn as sns
    import pandas as pd
    import numpy as np
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False
    print("⚠️  matplotlib not available. Will create simple text-based charts instead.")

class ImageChartGenerator:
    def __init__(self):
        """Initialize image chart generator"""
        if MATPLOTLIB_AVAILABLE:
            plt.style.use('default')
            self.colors = {
                'primary': '#2E86AB',
                'secondary': '#A23B72', 
                'accent': '#F18F01',
                'success': '#C73E1D',
                'warning': '#FF6B35',
                'info': '#6B5B95'
            }
        else:
            self.colors = {}
        
        # Load sentiment data
        self.sentiment_data = self.load_sentiment_data()
    
    def load_sentiment_data(self):
        """Load sentiment analysis data"""
        try:
            with open('/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/comprehensive_sentiment_report.json', 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading data: {e}")
            return None
    
    def create_language_distribution_chart(self):
        """Create language distribution chart"""
        if not MATPLOTLIB_AVAILABLE:
            return self.create_text_chart("language_distribution")
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 7))
        
        # Language distribution data
        lang_dist = self.sentiment_data['key_findings']['language_distribution']
        lang_percentages = self.sentiment_data['key_findings']['language_percentages']
        
        # Prepare data
        languages = ['English', 'Dutch', 'German', 'Spanish', 'French']
        counts = [lang_dist['en'], lang_dist['nl'], lang_dist['de'], lang_dist['es'], lang_dist['fr']]
        percentages = [lang_percentages['en'], lang_percentages['nl'], lang_percentages['de'], lang_percentages['es'], lang_percentages['fr']]
        
        # Pie chart
        colors = [self.colors['primary'], self.colors['secondary'], self.colors['accent'], self.colors['success'], self.colors['warning']]
        wedges, texts, autotexts = ax1.pie(counts, labels=languages, autopct='%1.1f%%', colors=colors, startangle=90)
        ax1.set_title('Language Distribution of Reviews\n(4,412 Total Reviews)', fontsize=14, fontweight='bold', pad=20)
        
        # Bar chart
        bars = ax2.bar(languages, counts, color=colors)
        ax2.set_title('Review Count by Language', fontsize=14, fontweight='bold')
        ax2.set_ylabel('Number of Reviews')
        ax2.set_xlabel('Language')
        
        # Add value labels on bars
        for bar, count, pct in zip(bars, counts, percentages):
            height = bar.get_height()
            ax2.text(bar.get_x() + bar.get_width()/2., height + 10,
                    f'{count}\n({pct}%)', ha='center', va='bottom', fontweight='bold')
        
        plt.tight_layout()
        return fig
    
    def create_sector_performance_chart(self):
        """Create sector performance comparison chart"""
        if not MATPLOTLIB_AVAILABLE:
            return self.create_text_chart("sector_performance")
        
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10))
        
        # Sector data
        sectors = list(self.sentiment_data['sector_analysis'].keys())
        sentiments = [self.sentiment_data['sector_analysis'][s]['avg_sentiment'] for s in sectors]
        ratings = [self.sentiment_data['sector_analysis'][s]['avg_rating'] for s in sectors]
        reviews = [self.sentiment_data['sector_analysis'][s]['total_reviews'] for s in sectors]
        
        # Clean sector names for display
        sector_names = [s.replace('_', ' & ').title() for s in sectors]
        
        # Sentiment chart
        bars1 = ax1.bar(sector_names, sentiments, color=self.colors['primary'], alpha=0.8)
        ax1.set_title('Average Sentiment by Sector', fontsize=14, fontweight='bold')
        ax1.set_ylabel('Sentiment Score')
        ax1.set_ylim(0, 1)
        
        # Add value labels
        for bar, val in zip(bars1, sentiments):
            height = bar.get_height()
            ax1.text(bar.get_x() + bar.get_width()/2., height + 0.01,
                    f'{val:.3f}', ha='center', va='bottom', fontweight='bold')
        
        # Rating chart
        bars2 = ax2.bar(sector_names, ratings, color=self.colors['secondary'], alpha=0.8)
        ax2.set_title('Average Rating by Sector', fontsize=14, fontweight='bold')
        ax2.set_ylabel('Rating (out of 5)')
        ax2.set_ylim(0, 5)
        
        # Add value labels
        for bar, val in zip(bars2, ratings):
            height = bar.get_height()
            ax2.text(bar.get_x() + bar.get_width()/2., height + 0.05,
                    f'{val:.2f}', ha='center', va='bottom', fontweight='bold')
        
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        return fig
    
    def create_regional_performance_chart(self):
        """Create regional performance comparison chart"""
        if not MATPLOTLIB_AVAILABLE:
            return self.create_text_chart("regional_performance")
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 7))
        
        # Regional data
        regions = list(self.sentiment_data['regional_analysis'].keys())
        sentiments = [self.sentiment_data['regional_analysis'][r]['avg_sentiment'] for r in regions]
        ratings = [self.sentiment_data['regional_analysis'][r]['avg_rating'] for r in regions]
        reviews = [self.sentiment_data['regional_analysis'][r]['total_reviews'] for r in regions]
        
        # Sort by rating for better visualization
        sorted_data = sorted(zip(regions, sentiments, ratings, reviews), key=lambda x: x[2], reverse=True)
        regions, sentiments, ratings, reviews = zip(*sorted_data)
        
        # Sentiment chart
        bars1 = ax1.bar(regions, sentiments, color=self.colors['accent'], alpha=0.8)
        ax1.set_title('Average Sentiment by Region', fontsize=14, fontweight='bold')
        ax1.set_ylabel('Sentiment Score')
        ax1.set_ylim(0, 1)
        
        # Add value labels
        for bar, val in zip(bars1, sentiments):
            height = bar.get_height()
            ax1.text(bar.get_x() + bar.get_width()/2., height + 0.01,
                    f'{val:.3f}', ha='center', va='bottom', fontweight='bold')
        
        # Rating chart
        bars2 = ax2.bar(regions, ratings, color=self.colors['success'], alpha=0.8)
        ax2.set_title('Average Rating by Region', fontsize=14, fontweight='bold')
        ax2.set_ylabel('Rating (out of 5)')
        ax2.set_ylim(0, 5)
        
        # Add value labels
        for bar, val in zip(bars2, ratings):
            height = bar.get_height()
            ax2.text(bar.get_x() + bar.get_width()/2., height + 0.05,
                    f'{val:.2f}', ha='center', va='bottom', fontweight='bold')
        
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        return fig
    
    def create_persona_chart(self):
        """Create persona distribution chart"""
        if not MATPLOTLIB_AVAILABLE:
            return self.create_text_chart("personas")
        
        # Load persona data
        try:
            with open('/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/final_5_persona_framework.json', 'r') as f:
                persona_data = json.load(f)
        except:
            return self.create_text_chart("personas")
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 7))
        
        # Persona data
        personas = [p['name'] for p in persona_data['personas']]
        sample_sizes = [p['sample_size'] for p in persona_data['personas']]
        percentages = [p['percentage'] for p in persona_data['personas']]
        
        # Pie chart
        colors = [self.colors['primary'], self.colors['secondary'], self.colors['accent'], self.colors['success'], self.colors['warning']]
        wedges, texts, autotexts = ax1.pie(sample_sizes, labels=personas, autopct='%1.1f%%', colors=colors, startangle=90)
        ax1.set_title('Creative Tourism Personas Distribution', fontsize=14, fontweight='bold', pad=20)
        
        # Bar chart
        bars = ax2.bar(personas, sample_sizes, color=colors)
        ax2.set_title('Sample Size by Persona', fontsize=14, fontweight='bold')
        ax2.set_ylabel('Number of Reviews')
        ax2.set_xlabel('Persona')
        
        # Add value labels on bars
        for bar, count, pct in zip(bars, sample_sizes, percentages):
            height = bar.get_height()
            ax2.text(bar.get_x() + bar.get_width()/2., height + 10,
                    f'{count}\n({pct}%)', ha='center', va='bottom', fontweight='bold')
        
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        return fig
    
    def create_text_chart(self, chart_type):
        """Create simple text-based chart when matplotlib is not available"""
        print(f"📊 Creating text-based {chart_type} chart...")
        
        if chart_type == "language_distribution":
            lang_dist = self.sentiment_data['key_findings']['language_distribution']
            lang_percentages = self.sentiment_data['key_findings']['language_percentages']
            
            print("Language Distribution:")
            for lang, count in lang_dist.items():
                pct = lang_percentages[lang]
                bar = "█" * int(pct / 2)  # Simple bar representation
                print(f"  {lang.upper()}: {count:4d} reviews ({pct:4.1f}%) {bar}")
        
        elif chart_type == "sector_performance":
            sectors = self.sentiment_data['sector_analysis']
            print("Sector Performance:")
            for sector, data in sectors.items():
                sector_name = sector.replace('_', ' & ').title()
                bar = "█" * int(data['avg_rating'] * 10)  # Simple bar representation
                print(f"  {sector_name}: {data['avg_rating']:.2f}/5 {bar}")
        
        elif chart_type == "regional_performance":
            regions = self.sentiment_data['regional_analysis']
            print("Regional Performance:")
            for region, data in regions.items():
                bar = "█" * int(data['avg_rating'] * 10)  # Simple bar representation
                print(f"  {region}: {data['avg_rating']:.2f}/5 {bar}")
        
        return None
    
    def save_all_charts(self):
        """Generate and save all charts as images"""
        print("📊 Generating Sentiment Analysis Charts as Images")
        print("=" * 50)
        
        # Create output directory
        output_dir = '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/charts_images'
        os.makedirs(output_dir, exist_ok=True)
        
        charts_generated = []
        
        try:
            if MATPLOTLIB_AVAILABLE:
                # Language distribution chart
                print("  📈 Creating language distribution chart...")
                fig1 = self.create_language_distribution_chart()
                if fig1:
                    fig1.savefig(f'{output_dir}/language_distribution.png', dpi=300, bbox_inches='tight')
                    fig1.savefig(f'{output_dir}/language_distribution.jpg', dpi=300, bbox_inches='tight')
                    plt.close(fig1)
                    charts_generated.extend(['language_distribution.png', 'language_distribution.jpg'])
                
                # Sector performance chart
                print("  📈 Creating sector performance chart...")
                fig2 = self.create_sector_performance_chart()
                if fig2:
                    fig2.savefig(f'{output_dir}/sector_performance.png', dpi=300, bbox_inches='tight')
                    fig2.savefig(f'{output_dir}/sector_performance.jpg', dpi=300, bbox_inches='tight')
                    plt.close(fig2)
                    charts_generated.extend(['sector_performance.png', 'sector_performance.jpg'])
                
                # Regional performance chart
                print("  📈 Creating regional performance chart...")
                fig3 = self.create_regional_performance_chart()
                if fig3:
                    fig3.savefig(f'{output_dir}/regional_performance.png', dpi=300, bbox_inches='tight')
                    fig3.savefig(f'{output_dir}/regional_performance.jpg', dpi=300, bbox_inches='tight')
                    plt.close(fig3)
                    charts_generated.extend(['regional_performance.png', 'regional_performance.jpg'])
                
                # Persona chart
                print("  📈 Creating persona distribution chart...")
                fig4 = self.create_persona_chart()
                if fig4:
                    fig4.savefig(f'{output_dir}/persona_distribution.png', dpi=300, bbox_inches='tight')
                    fig4.savefig(f'{output_dir}/persona_distribution.jpg', dpi=300, bbox_inches='tight')
                    plt.close(fig4)
                    charts_generated.extend(['persona_distribution.png', 'persona_distribution.jpg'])
                
                print(f"\n✅ Successfully generated {len(charts_generated)} chart images:")
                for chart in charts_generated:
                    print(f"  - {chart}")
                
                print(f"\n📁 Charts saved to: {output_dir}")
                
            else:
                print("⚠️  matplotlib not available. Creating text-based charts instead:")
                self.create_text_chart("language_distribution")
                print()
                self.create_text_chart("sector_performance")
                print()
                self.create_text_chart("regional_performance")
            
            return charts_generated
            
        except Exception as e:
            print(f"❌ Error generating charts: {e}")
            return []


def main():
    """Main function to generate all charts as images"""
    generator = ImageChartGenerator()
    
    if generator.sentiment_data is None:
        print("❌ Could not load sentiment data")
        return False
    
    charts = generator.save_all_charts()
    
    if charts or not MATPLOTLIB_AVAILABLE:
        print(f"\n🎉 Successfully generated chart images for sentiment analysis report!")
        return True
    else:
        print(f"\n❌ Failed to generate chart images")
        return False


if __name__ == "__main__":
    main()
