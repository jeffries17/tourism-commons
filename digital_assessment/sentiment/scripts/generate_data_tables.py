#!/usr/bin/env python3
"""
Data Table Generator for Sentiment Analysis
Generates formatted data tables for sentiment analysis report.
"""

import json
import os
from pathlib import Path

class DataTableGenerator:
    def __init__(self):
        """Initialize data table generator"""
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
    
    def create_language_distribution_table(self):
        """Create language distribution table"""
        lang_dist = self.sentiment_data['key_findings']['language_distribution']
        lang_percentages = self.sentiment_data['key_findings']['language_percentages']
        
        languages = ['English', 'Dutch', 'German', 'Spanish', 'French']
        lang_codes = ['en', 'nl', 'de', 'es', 'fr']
        counts = [lang_dist[code] for code in lang_codes]
        percentages = [lang_percentages[code] for code in lang_codes]
        
        table = "| Language | Reviews | Percentage |\n"
        table += "|----------|---------|------------|\n"
        
        for lang, count, pct in zip(languages, counts, percentages):
            table += f"| {lang} | {count:,} | {pct}% |\n"
        
        return table
    
    def create_sector_performance_table(self):
        """Create sector performance table"""
        sectors = self.sentiment_data['sector_analysis']
        
        table = "| Sector | Reviews | Stakeholders | Avg Sentiment | Avg Rating |\n"
        table += "|--------|---------|--------------|---------------|------------|\n"
        
        for sector, data in sectors.items():
            sector_name = sector.replace('_', ' & ').title()
            table += f"| {sector_name} | {data['total_reviews']:,} | {data['stakeholders']} | {data['avg_sentiment']:.3f} | {data['avg_rating']:.2f}/5 |\n"
        
        return table
    
    def create_regional_performance_table(self):
        """Create regional performance table"""
        regions = self.sentiment_data['regional_analysis']
        
        table = "| Region | Reviews | Stakeholders | Avg Sentiment | Avg Rating |\n"
        table += "|--------|---------|--------------|---------------|------------|\n"
        
        for region, data in regions.items():
            table += f"| {region} | {data['total_reviews']:,} | {data['stakeholders']} | {data['avg_sentiment']:.3f} | {data['avg_rating']:.2f}/5 |\n"
        
        return table
    
    def create_summary_statistics_table(self):
        """Create summary statistics table"""
        key_findings = self.sentiment_data['key_findings']
        
        table = "| Metric | Value |\n"
        table += "|--------|-------|\n"
        table += f"| Total Reviews Analyzed | {key_findings['total_reviews_analyzed']:,} |\n"
        table += f"| Average Sentiment Score | {key_findings['average_sentiment']:.3f} |\n"
        table += f"| Average Rating | {key_findings['average_rating']:.2f}/5 |\n"
        table += f"| Primary Language | English ({key_findings['language_percentages']['en']}%) |\n"
        table += f"| Secondary Language | Dutch ({key_findings['language_percentages']['nl']}%) |\n"
        
        return table
    
    def create_top_performers_table(self):
        """Create top performers table"""
        # Top sectors by rating
        sectors = self.sentiment_data['sector_analysis']
        top_sectors = sorted(sectors.items(), key=lambda x: x[1]['avg_rating'], reverse=True)
        
        # Top regions by rating
        regions = self.sentiment_data['regional_analysis']
        top_regions = sorted(regions.items(), key=lambda x: x[1]['avg_rating'], reverse=True)
        
        table = "| Category | Top Performer | Rating | Second Best | Rating |\n"
        table += "|----------|---------------|--------|-------------|--------|\n"
        
        # Sectors
        sector1 = top_sectors[0][0].replace('_', ' & ').title()
        rating1 = top_sectors[0][1]['avg_rating']
        sector2 = top_sectors[1][0].replace('_', ' & ').title()
        rating2 = top_sectors[1][1]['avg_rating']
        table += f"| Sectors | {sector1} | {rating1:.2f}/5 | {sector2} | {rating2:.2f}/5 |\n"
        
        # Regions
        region1 = top_regions[0][0]
        rating1 = top_regions[0][1]['avg_rating']
        region2 = top_regions[1][0]
        rating2 = top_regions[1][1]['avg_rating']
        table += f"| Regions | {region1} | {rating1:.2f}/5 | {region2} | {rating2:.2f}/5 |\n"
        
        return table
    
    def create_improvement_opportunities_table(self):
        """Create improvement opportunities table"""
        sectors = self.sentiment_data['sector_analysis']
        regions = self.sentiment_data['regional_analysis']
        
        # Find sectors/regions with lowest ratings but high volume
        low_performing_sectors = [(s, d) for s, d in sectors.items() if d['avg_rating'] < 4.0 and d['total_reviews'] > 100]
        low_performing_regions = [(r, d) for r, d in regions.items() if d['avg_rating'] < 4.1 and d['total_reviews'] > 400]
        
        table = "| Category | Opportunity | Current Rating | Reviews | Improvement Potential |\n"
        table += "|----------|-------------|----------------|---------|----------------------|\n"
        
        for sector, data in low_performing_sectors:
            sector_name = sector.replace('_', ' & ').title()
            potential = "High" if data['total_reviews'] > 500 else "Medium"
            table += f"| Sector | {sector_name} | {data['avg_rating']:.2f}/5 | {data['total_reviews']:,} | {potential} |\n"
        
        for region, data in low_performing_regions:
            potential = "High" if data['total_reviews'] > 500 else "Medium"
            table += f"| Region | {region} | {data['avg_rating']:.2f}/5 | {data['total_reviews']:,} | {potential} |\n"
        
        return table
    
    def generate_all_tables(self):
        """Generate all data tables"""
        print("📊 Generating Data Tables for Sentiment Analysis")
        print("=" * 50)
        
        if self.sentiment_data is None:
            print("❌ Could not load sentiment data")
            return False
        
        # Create output directory
        output_dir = '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/tables'
        os.makedirs(output_dir, exist_ok=True)
        
        tables = {
            'language_distribution.md': self.create_language_distribution_table(),
            'sector_performance.md': self.create_sector_performance_table(),
            'regional_performance.md': self.create_regional_performance_table(),
            'summary_statistics.md': self.create_summary_statistics_table(),
            'top_performers.md': self.create_top_performers_table(),
            'improvement_opportunities.md': self.create_improvement_opportunities_table()
        }
        
        try:
            for filename, table_content in tables.items():
                filepath = f'{output_dir}/{filename}'
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(table_content)
                print(f"  ✅ Generated: {filename}")
            
            # Create combined report
            combined_content = "# Sentiment Analysis Data Tables\n\n"
            combined_content += f"**Generated:** {self.sentiment_data['metadata']['generated_at']}\n\n"
            
            for filename, table_content in tables.items():
                title = filename.replace('.md', '').replace('_', ' ').title()
                combined_content += f"## {title}\n\n"
                combined_content += table_content + "\n\n"
            
            combined_file = f'{output_dir}/all_tables_combined.md'
            with open(combined_file, 'w', encoding='utf-8') as f:
                f.write(combined_content)
            
            print(f"\n✅ Successfully generated {len(tables)} data tables!")
            print(f"📁 Tables saved to: {output_dir}")
            print(f"📄 Combined report: {combined_file}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error generating data tables: {e}")
            return False


def main():
    """Main function to generate data tables"""
    generator = DataTableGenerator()
    
    success = generator.generate_all_tables()
    
    if success:
        print(f"\n🎉 Successfully generated data tables for sentiment analysis report!")
        return True
    else:
        print(f"\n❌ Failed to generate data tables")
        return False


if __name__ == "__main__":
    main()
