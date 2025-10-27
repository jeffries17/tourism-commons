#!/usr/bin/env python3
"""
Sentiment Analysis Chart Generator
Generates comprehensive charts and visualizations for sentiment analysis report.
"""

import json
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
from pathlib import Path
import os

class SentimentChartGenerator:
    def __init__(self):
        """Initialize chart generator"""
        plt.style.use('seaborn-v0_8')
        self.colors = {
            'primary': '#2E86AB',
            'secondary': '#A23B72', 
            'accent': '#F18F01',
            'success': '#C73E1D',
            'warning': '#FF6B35',
            'info': '#6B5B95'
        }
        
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
        """Create language distribution pie chart"""
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
    
    def create_sector_volume_chart(self):
        """Create sector volume and performance scatter plot"""
        fig, ax = plt.subplots(figsize=(12, 8))
        
        # Sector data
        sectors = list(self.sentiment_data['sector_analysis'].keys())
        reviews = [self.sentiment_data['sector_analysis'][s]['total_reviews'] for s in sectors]
        ratings = [self.sentiment_data['sector_analysis'][s]['avg_rating'] for s in sectors]
        sentiments = [self.sentiment_data['sector_analysis'][s]['avg_sentiment'] for s in sectors]
        
        # Clean sector names
        sector_names = [s.replace('_', ' & ').title() for s in sectors]
        
        # Create scatter plot
        scatter = ax.scatter(reviews, ratings, s=[s*2 for s in sentiments], 
                           c=sentiments, cmap='viridis', alpha=0.7, edgecolors='black')
        
        # Add sector labels
        for i, name in enumerate(sector_names):
            ax.annotate(name, (reviews[i], ratings[i]), 
                       xytext=(5, 5), textcoords='offset points', fontsize=10, fontweight='bold')
        
        ax.set_xlabel('Total Reviews', fontsize=12, fontweight='bold')
        ax.set_ylabel('Average Rating', fontsize=12, fontweight='bold')
        ax.set_title('Sector Performance: Volume vs Rating\n(Bubble size = Sentiment Score)', 
                    fontsize=14, fontweight='bold', pad=20)
        
        # Add colorbar
        cbar = plt.colorbar(scatter, ax=ax)
        cbar.set_label('Sentiment Score', fontsize=12, fontweight='bold')
        
        # Add grid
        ax.grid(True, alpha=0.3)
        
        plt.tight_layout()
        return fig
    
    def create_overall_performance_dashboard(self):
        """Create overall performance dashboard"""
        fig = plt.figure(figsize=(16, 10))
        
        # Create grid layout
        gs = fig.add_gridspec(3, 3, hspace=0.3, wspace=0.3)
        
        # Overall metrics
        ax1 = fig.add_subplot(gs[0, :])
        metrics = ['Total Reviews', 'Avg Sentiment', 'Avg Rating', 'Stakeholders', 'Countries', 'Sectors']
        values = [4412, 0.617, 4.13, 57, 5, 5]
        colors = [self.colors['primary'], self.colors['secondary'], self.colors['accent'], 
                 self.colors['success'], self.colors['warning'], self.colors['info']]
        
        bars = ax1.bar(metrics, values, color=colors, alpha=0.8)
        ax1.set_title('Overall Performance Metrics', fontsize=16, fontweight='bold', pad=20)
        ax1.set_ylabel('Value')
        
        # Add value labels
        for bar, val in zip(bars, values):
            height = bar.get_height()
            ax1.text(bar.get_x() + bar.get_width()/2., height + max(values)*0.01,
                    f'{val}', ha='center', va='bottom', fontweight='bold', fontsize=12)
        
        # Language distribution (pie chart)
        ax2 = fig.add_subplot(gs[1, 0])
        lang_dist = self.sentiment_data['key_findings']['language_distribution']
        languages = ['English', 'Dutch', 'German', 'Spanish', 'French']
        counts = [lang_dist['en'], lang_dist['nl'], lang_dist['de'], lang_dist['es'], lang_dist['fr']]
        colors_pie = [self.colors['primary'], self.colors['secondary'], self.colors['accent'], 
                     self.colors['success'], self.colors['warning']]
        
        ax2.pie(counts, labels=languages, autopct='%1.1f%%', colors=colors_pie, startangle=90)
        ax2.set_title('Language Distribution', fontsize=12, fontweight='bold')
        
        # Top sectors
        ax3 = fig.add_subplot(gs[1, 1])
        sectors = list(self.sentiment_data['sector_analysis'].keys())
        ratings = [self.sentiment_data['sector_analysis'][s]['avg_rating'] for s in sectors]
        sector_names = [s.replace('_', ' & ').title() for s in sectors]
        
        # Sort by rating
        sorted_sectors = sorted(zip(sector_names, ratings), key=lambda x: x[1], reverse=True)
        sector_names, ratings = zip(*sorted_sectors)
        
        bars = ax3.barh(sector_names, ratings, color=self.colors['primary'], alpha=0.8)
        ax3.set_title('Sector Ratings', fontsize=12, fontweight='bold')
        ax3.set_xlabel('Rating')
        
        # Top regions
        ax4 = fig.add_subplot(gs[1, 2])
        regions = list(self.sentiment_data['regional_analysis'].keys())
        ratings = [self.sentiment_data['regional_analysis'][r]['avg_rating'] for r in regions]
        
        # Sort by rating
        sorted_regions = sorted(zip(regions, ratings), key=lambda x: x[1], reverse=True)
        regions, ratings = zip(*sorted_regions)
        
        bars = ax4.barh(regions, ratings, color=self.colors['secondary'], alpha=0.8)
        ax4.set_title('Regional Ratings', fontsize=12, fontweight='bold')
        ax4.set_xlabel('Rating')
        
        # Performance matrix
        ax5 = fig.add_subplot(gs[2, :])
        
        # Create performance matrix data
        matrix_data = []
        for sector in self.sentiment_data['sector_analysis']:
            for region in self.sentiment_data['regional_analysis']:
                # Simplified performance score (sentiment + rating)
                sector_sentiment = self.sentiment_data['sector_analysis'][sector]['avg_sentiment']
                region_rating = self.sentiment_data['regional_analysis'][region]['avg_rating']
                performance_score = (sector_sentiment + region_rating/5) / 2
                matrix_data.append([sector.replace('_', ' ').title(), region, performance_score])
        
        # Create heatmap data
        sectors_matrix = [d[0] for d in matrix_data]
        regions_matrix = [d[1] for d in matrix_data]
        scores_matrix = [d[2] for d in matrix_data]
        
        # Reshape for heatmap
        unique_sectors = list(set(sectors_matrix))
        unique_regions = list(set(regions_matrix))
        
        heatmap_data = np.zeros((len(unique_sectors), len(unique_regions)))
        for i, sector in enumerate(unique_sectors):
            for j, region in enumerate(unique_regions):
                # Find score for this combination
                for d in matrix_data:
                    if d[0] == sector and d[1] == region:
                        heatmap_data[i, j] = d[2]
                        break
        
        im = ax5.imshow(heatmap_data, cmap='YlOrRd', aspect='auto')
        ax5.set_xticks(range(len(unique_regions)))
        ax5.set_yticks(range(len(unique_sectors)))
        ax5.set_xticklabels(unique_regions)
        ax5.set_yticklabels(unique_sectors)
        ax5.set_title('Performance Matrix: Sectors vs Regions', fontsize=14, fontweight='bold')
        
        # Add colorbar
        cbar = plt.colorbar(im, ax=ax5)
        cbar.set_label('Performance Score', fontsize=12, fontweight='bold')
        
        plt.tight_layout()
        return fig
    
    def save_all_charts(self):
        """Generate and save all charts"""
        print("📊 Generating Sentiment Analysis Charts")
        print("=" * 50)
        
        # Create output directory
        output_dir = '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/charts'
        os.makedirs(output_dir, exist_ok=True)
        
        charts_generated = []
        
        try:
            # Language distribution chart
            print("  📈 Creating language distribution chart...")
            fig1 = self.create_language_distribution_chart()
            fig1.savefig(f'{output_dir}/language_distribution.png', dpi=300, bbox_inches='tight')
            plt.close(fig1)
            charts_generated.append('language_distribution.png')
            
            # Sector performance chart
            print("  📈 Creating sector performance chart...")
            fig2 = self.create_sector_performance_chart()
            fig2.savefig(f'{output_dir}/sector_performance.png', dpi=300, bbox_inches='tight')
            plt.close(fig2)
            charts_generated.append('sector_performance.png')
            
            # Regional performance chart
            print("  📈 Creating regional performance chart...")
            fig3 = self.create_regional_performance_chart()
            fig3.savefig(f'{output_dir}/regional_performance.png', dpi=300, bbox_inches='tight')
            plt.close(fig3)
            charts_generated.append('regional_performance.png')
            
            # Sector volume chart
            print("  📈 Creating sector volume chart...")
            fig4 = self.create_sector_volume_chart()
            fig4.savefig(f'{output_dir}/sector_volume.png', dpi=300, bbox_inches='tight')
            plt.close(fig4)
            charts_generated.append('sector_volume.png')
            
            # Overall performance dashboard
            print("  📈 Creating overall performance dashboard...")
            fig5 = self.create_overall_performance_dashboard()
            fig5.savefig(f'{output_dir}/overall_performance_dashboard.png', dpi=300, bbox_inches='tight')
            plt.close(fig5)
            charts_generated.append('overall_performance_dashboard.png')
            
            print(f"\n✅ Successfully generated {len(charts_generated)} charts:")
            for chart in charts_generated:
                print(f"  - {chart}")
            
            print(f"\n📁 Charts saved to: {output_dir}")
            
            return charts_generated
            
        except Exception as e:
            print(f"❌ Error generating charts: {e}")
            return []


def main():
    """Main function to generate all charts"""
    generator = SentimentChartGenerator()
    
    if generator.sentiment_data is None:
        print("❌ Could not load sentiment data")
        return False
    
    charts = generator.save_all_charts()
    
    if charts:
        print(f"\n🎉 Successfully generated {len(charts)} charts for sentiment analysis report!")
        return True
    else:
        print("\n❌ Failed to generate charts")
        return False


if __name__ == "__main__":
    main()
