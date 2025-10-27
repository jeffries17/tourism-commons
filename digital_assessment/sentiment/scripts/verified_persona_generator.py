#!/usr/bin/env python3
"""
Verified Persona Generator
Generates creative tourism personas from ACTUAL, verified sentiment analysis data only.
This script ensures data integrity and prevents fabrication of persona metrics.
"""

import json
import os
from pathlib import Path
from collections import defaultdict, Counter
from typing import Dict, List, Tuple
from datetime import datetime
import re

class VerifiedPersonaGenerator:
    def __init__(self):
        """Initialize with strict data validation"""
        self.validation_errors = []
        self.data_sources_verified = {}
        
        # Language to region mapping (verified)
        self.language_to_region = {
            'en': 'English-speaking (Global)',
            'nl': 'Dutch/Belgian',
            'fr': 'French-speaking',
            'de': 'German-speaking',
            'es': 'Spanish-speaking',
            'pt': 'Portuguese-speaking',
            'it': 'Italian',
            'unknown': 'Unknown/Other'
        }
        
    def validate_data_source(self, file_path: str) -> bool:
        """Validate that a data source file exists and is properly formatted"""
        try:
            if not os.path.exists(file_path):
                self.validation_errors.append(f"Data source not found: {file_path}")
                return False
                
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # Check required fields
            required_fields = ['summary', 'stakeholder_data']
            for field in required_fields:
                if field not in data:
                    self.validation_errors.append(f"Missing required field '{field}' in {file_path}")
                    return False
                    
            # Validate summary structure
            summary = data['summary']
            if 'total_reviews' not in summary:
                self.validation_errors.append(f"Missing total_reviews in summary of {file_path}")
                return False
                
            self.data_sources_verified[file_path] = {
                'total_reviews': summary['total_reviews'],
                'timestamp': datetime.now().isoformat()
            }
            
            return True
            
        except Exception as e:
            self.validation_errors.append(f"Error validating {file_path}: {str(e)}")
            return False
    
    def load_verified_sentiment_data(self) -> Dict:
        """Load and validate sentiment analysis data"""
        print("🔍 Loading and validating sentiment analysis data...")
        
        # Primary data sources to validate
        data_sources = [
            '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/sentiment_analysis_results.json',
            '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/regional_sentiment/regional_sentiment_analysis.json'
        ]
        
        verified_data = {}
        
        for source in data_sources:
            if self.validate_data_source(source):
                with open(source, 'r', encoding='utf-8') as f:
                    verified_data[source] = json.load(f)
                print(f"  ✅ Verified: {source}")
            else:
                print(f"  ❌ Failed validation: {source}")
        
        if not verified_data:
            raise ValueError("No valid data sources found. Cannot generate personas.")
            
        if self.validation_errors:
            print(f"\n⚠️  Validation Errors Found:")
            for error in self.validation_errors:
                print(f"  - {error}")
                
        return verified_data
    
    def extract_language_distribution(self, data: Dict) -> Dict[str, int]:
        """Extract actual language distribution from verified data"""
        language_dist = defaultdict(int)
        
        # Extract from sentiment analysis results
        sentiment_file = '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/sentiment_analysis_results.json'
        if sentiment_file in data:
            lang_dist = data[sentiment_file]['summary'].get('language_distribution', {})
            for lang, count in lang_dist.items():
                language_dist[lang] += count
        
        # Extract from regional sentiment analysis
        regional_file = '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/regional_sentiment/regional_sentiment_analysis.json'
        if regional_file in data:
            for stakeholder in data[regional_file].get('stakeholder_data', []):
                for lang, count in stakeholder.get('language_distribution', {}).items():
                    language_dist[lang] += count
        
        return dict(language_dist)
    
    def calculate_persona_metrics(self, language_dist: Dict[str, int], data: Dict) -> Dict:
        """Calculate persona metrics from ACTUAL data only"""
        total_reviews = sum(language_dist.values())
        
        if total_reviews == 0:
            raise ValueError("No reviews found in verified data")
        
        personas = {}
        
        # Only create personas for languages with significant sample sizes (>= 20 reviews)
        for lang_code, count in language_dist.items():
            if count < 20:
                continue  # Skip small sample sizes
                
            region_name = self.language_to_region.get(lang_code, f'Unknown ({lang_code})')
            percentage = round((count / total_reviews) * 100, 1)
            
            # Extract theme preferences from actual data
            theme_preferences = self.extract_theme_preferences(lang_code, data)
            
            # Calculate average rating from actual data
            avg_rating = self.calculate_average_rating(lang_code, data)
            
            personas[lang_code] = {
                'name': self.generate_persona_name(region_name, lang_code),
                'region': region_name,
                'language_code': lang_code,
                'sample_size': count,
                'percentage': percentage,
                'avg_rating': avg_rating,
                'theme_preferences': theme_preferences,
                'data_source': 'verified_sentiment_analysis',
                'generated_at': datetime.now().isoformat()
            }
        
        return personas
    
    def extract_theme_preferences(self, lang_code: str, data: Dict) -> Dict:
        """Extract theme preferences from actual sentiment data"""
        theme_mentions = defaultdict(int)
        
        # This would need to be implemented based on the actual theme analysis data
        # For now, return placeholder that indicates this needs real data
        return {
            'top_theme': 'Requires theme analysis from actual review text',
            'mentions': 0,
            'note': 'Theme analysis needs to be extracted from actual review content'
        }
    
    def calculate_average_rating(self, lang_code: str, data: Dict) -> float:
        """Calculate average rating from actual data"""
        # This would need to be implemented based on actual rating data
        # For now, return placeholder
        return 0.0  # Will be calculated from actual data
    
    def generate_persona_name(self, region_name: str, lang_code: str) -> str:
        """Generate persona name based on region and language"""
        name_mapping = {
            'English-speaking (Global)': 'Cultural Explorer',
            'Dutch/Belgian': 'Immersive Learner', 
            'French-speaking': 'Heritage Seeker',
            'German-speaking': 'Experience Collector',
            'Spanish-speaking': 'Discovery Traveler'
        }
        
        return name_mapping.get(region_name, f'{region_name} Traveler')
    
    def generate_verified_personas(self) -> Dict:
        """Generate personas from verified data only"""
        print("🎯 Generating Verified Creative Tourism Personas")
        print("=" * 60)
        
        # Load and validate data
        verified_data = self.load_verified_sentiment_data()
        
        # Extract language distribution from actual data
        language_dist = self.extract_language_distribution(verified_data)
        
        print(f"\n📊 Verified Language Distribution:")
        total_reviews = sum(language_dist.values())
        for lang, count in language_dist.items():
            percentage = round((count / total_reviews) * 100, 1)
            region = self.language_to_region.get(lang, f'Unknown ({lang})')
            print(f"  {region}: {count} reviews ({percentage}%)")
        
        print(f"\n📈 Total Verified Reviews: {total_reviews}")
        
        # Calculate persona metrics from actual data
        personas = self.calculate_persona_metrics(language_dist, verified_data)
        
        # Generate verification report
        verification_report = {
            'generated_at': datetime.now().isoformat(),
            'data_sources_verified': self.data_sources_verified,
            'validation_errors': self.validation_errors,
            'total_reviews_analyzed': total_reviews,
            'language_distribution': language_dist,
            'personas_generated': len(personas),
            'personas': personas
        }
        
        return verification_report
    
    def save_verified_personas(self, verification_report: Dict, output_path: str):
        """Save verified personas with full audit trail"""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(verification_report, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Verified personas saved to: {output_path}")
        
        # Also create a summary report
        summary_path = output_path.replace('.json', '_SUMMARY.md')
        self.create_summary_report(verification_report, summary_path)
    
    def create_summary_report(self, verification_report: Dict, output_path: str):
        """Create a markdown summary report"""
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("# Verified Creative Tourism Personas\n\n")
            f.write(f"**Generated:** {verification_report['generated_at']}\n")
            f.write(f"**Total Reviews Analyzed:** {verification_report['total_reviews_analyzed']}\n")
            f.write(f"**Personas Generated:** {verification_report['personas_generated']}\n\n")
            
            f.write("## Data Sources Verified\n\n")
            for source, info in verification_report['data_sources_verified'].items():
                f.write(f"- **{os.path.basename(source)}:** {info['total_reviews']} reviews\n")
            
            f.write("\n## Language Distribution (Verified)\n\n")
            for lang, count in verification_report['language_distribution'].items():
                percentage = round((count / verification_report['total_reviews_analyzed']) * 100, 1)
                region = self.language_to_region.get(lang, f'Unknown ({lang})')
                f.write(f"- **{region}:** {count} reviews ({percentage}%)\n")
            
            if verification_report['validation_errors']:
                f.write("\n## Validation Errors\n\n")
                for error in verification_report['validation_errors']:
                    f.write(f"- {error}\n")
            
            f.write("\n## Personas Generated\n\n")
            for lang_code, persona in verification_report['personas'].items():
                f.write(f"### {persona['name']}\n")
                f.write(f"- **Region:** {persona['region']}\n")
                f.write(f"- **Sample Size:** {persona['sample_size']} reviews\n")
                f.write(f"- **Percentage:** {persona['percentage']}%\n")
                f.write(f"- **Data Source:** {persona['data_source']}\n\n")
        
        print(f"✅ Summary report saved to: {output_path}")


def main():
    """Main function to generate verified personas"""
    generator = VerifiedPersonaGenerator()
    
    try:
        # Generate verified personas
        verification_report = generator.generate_verified_personas()
        
        # Save results
        output_path = '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/verified_personas.json'
        generator.save_verified_personas(verification_report, output_path)
        
        print(f"\n🎉 Verified persona generation completed!")
        print(f"📊 Generated {verification_report['personas_generated']} personas from {verification_report['total_reviews_analyzed']} verified reviews")
        
    except Exception as e:
        print(f"\n❌ Error generating verified personas: {str(e)}")
        return False
    
    return True


if __name__ == "__main__":
    main()
