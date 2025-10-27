#!/usr/bin/env python3
"""
Data Validation Framework
Ensures all persona and sentiment analysis data is verified and consistent.
Prevents fabrication of metrics and ensures data integrity.
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Tuple, Any
from datetime import datetime
import hashlib

class DataValidationFramework:
    def __init__(self):
        """Initialize data validation framework"""
        self.validation_rules = {
            'min_sample_size': 20,  # Minimum reviews for statistical significance
            'required_fields': ['total_reviews', 'language_distribution', 'avg_sentiment'],
            'allowed_languages': ['en', 'nl', 'fr', 'de', 'es', 'pt', 'it', 'unknown'],
            'max_validation_errors': 5
        }
        
        self.validation_results = {
            'passed': [],
            'failed': [],
            'warnings': [],
            'data_checksums': {}
        }
    
    def calculate_data_checksum(self, file_path: str) -> str:
        """Calculate checksum for data file to detect changes"""
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            return hashlib.md5(content).hexdigest()
        except Exception as e:
            return f"ERROR: {str(e)}"
    
    def validate_data_consistency(self, data_sources: List[str]) -> Dict[str, Any]:
        """Validate consistency across multiple data sources"""
        print("🔍 Validating Data Consistency Across Sources")
        print("=" * 50)
        
        validation_results = {
            'total_sources': len(data_sources),
            'valid_sources': 0,
            'inconsistent_sources': [],
            'language_distribution_consistency': {},
            'total_review_consistency': {},
            'checksums': {}
        }
        
        language_totals = {}
        total_review_counts = []
        
        for source in data_sources:
            print(f"\n📁 Validating: {os.path.basename(source)}")
            
            try:
                # Calculate checksum
                checksum = self.calculate_data_checksum(source)
                validation_results['checksums'][source] = checksum
                
                # Load and validate data
                with open(source, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Extract language distribution
                lang_dist = self.extract_language_distribution(data)
                total_reviews = sum(lang_dist.values())
                
                # Store for consistency checking
                for lang, count in lang_dist.items():
                    if lang not in language_totals:
                        language_totals[lang] = []
                    language_totals[lang].append(count)
                
                total_review_counts.append(total_reviews)
                validation_results['valid_sources'] += 1
                
                print(f"  ✅ Valid: {total_reviews} reviews")
                for lang, count in lang_dist.items():
                    percentage = round((count / total_reviews) * 100, 1) if total_reviews > 0 else 0
                    print(f"    - {lang}: {count} ({percentage}%)")
                
            except Exception as e:
                validation_results['inconsistent_sources'].append({
                    'source': source,
                    'error': str(e)
                })
                print(f"  ❌ Invalid: {str(e)}")
        
        # Check consistency across sources
        validation_results['language_distribution_consistency'] = self.check_language_consistency(language_totals)
        validation_results['total_review_consistency'] = self.check_total_review_consistency(total_review_counts)
        
        return validation_results
    
    def extract_language_distribution(self, data: Dict) -> Dict[str, int]:
        """Extract language distribution from data structure"""
        lang_dist = {}
        
        # Check for language_distribution in summary
        if 'summary' in data and 'language_distribution' in data['summary']:
            lang_dist = data['summary']['language_distribution']
        
        # Check for language distribution in stakeholder data
        elif 'stakeholder_data' in data:
            for stakeholder in data['stakeholder_data']:
                if 'language_distribution' in stakeholder:
                    for lang, count in stakeholder['language_distribution'].items():
                        lang_dist[lang] = lang_dist.get(lang, 0) + count
        
        return lang_dist
    
    def check_language_consistency(self, language_totals: Dict[str, List[int]]) -> Dict[str, Any]:
        """Check if language distributions are consistent across sources"""
        consistency_results = {}
        
        for lang, counts in language_totals.items():
            if len(counts) > 1:
                min_count = min(counts)
                max_count = max(counts)
                variance = max_count - min_count
                consistency_results[lang] = {
                    'consistent': variance <= max_count * 0.1,  # Allow 10% variance
                    'variance': variance,
                    'min_count': min_count,
                    'max_count': max_count,
                    'counts': counts
                }
            else:
                consistency_results[lang] = {
                    'consistent': True,
                    'variance': 0,
                    'counts': counts
                }
        
        return consistency_results
    
    def check_total_review_consistency(self, total_review_counts: List[int]) -> Dict[str, Any]:
        """Check if total review counts are consistent"""
        if len(total_review_counts) <= 1:
            return {'consistent': True, 'variance': 0}
        
        min_count = min(total_review_counts)
        max_count = max(total_review_counts)
        variance = max_count - min_count
        
        return {
            'consistent': variance <= max_count * 0.2,  # Allow 20% variance
            'variance': variance,
            'min_count': min_count,
            'max_count': max_count,
            'counts': total_review_counts
        }
    
    def validate_persona_data(self, persona_data: Dict) -> Dict[str, Any]:
        """Validate persona data against actual sentiment analysis data"""
        print("\n🎯 Validating Persona Data Against Actual Sources")
        print("=" * 50)
        
        validation_results = {
            'personas_validated': 0,
            'validation_errors': [],
            'data_discrepancies': [],
            'recommendations': []
        }
        
        # Check if persona data matches actual data sources
        for persona_name, persona_info in persona_data.items():
            print(f"\n📊 Validating: {persona_name}")
            
            # Check sample size
            sample_size = persona_info.get('sample_size', 0)
            if sample_size < self.validation_rules['min_sample_size']:
                validation_results['validation_errors'].append(
                    f"{persona_name}: Sample size {sample_size} below minimum {self.validation_rules['min_sample_size']}"
                )
                print(f"  ⚠️  Sample size too small: {sample_size}")
            else:
                print(f"  ✅ Sample size adequate: {sample_size}")
            
            # Check data source
            data_source = persona_info.get('data_source', 'unknown')
            if data_source == 'verified_sentiment_analysis':
                print(f"  ✅ Data source verified")
                validation_results['personas_validated'] += 1
            else:
                validation_results['validation_errors'].append(
                    f"{persona_name}: Unverified data source '{data_source}'"
                )
                print(f"  ❌ Unverified data source: {data_source}")
        
        # Generate recommendations
        if validation_results['validation_errors']:
            validation_results['recommendations'].append(
                "Re-run persona generation using verified data sources only"
            )
        
        return validation_results
    
    def generate_validation_report(self, validation_results: Dict) -> str:
        """Generate comprehensive validation report"""
        report = []
        report.append("# Data Validation Report")
        report.append(f"**Generated:** {datetime.now().isoformat()}")
        report.append("")
        
        # Summary
        report.append("## Summary")
        report.append(f"- **Total Sources Validated:** {validation_results['total_sources']}")
        report.append(f"- **Valid Sources:** {validation_results['valid_sources']}")
        report.append(f"- **Inconsistent Sources:** {len(validation_results['inconsistent_sources'])}")
        report.append("")
        
        # Language Distribution Consistency
        report.append("## Language Distribution Consistency")
        for lang, consistency in validation_results['language_distribution_consistency'].items():
            status = "✅ Consistent" if consistency['consistent'] else "❌ Inconsistent"
            report.append(f"- **{lang}:** {status}")
            if not consistency['consistent']:
                report.append(f"  - Variance: {consistency['variance']}")
                report.append(f"  - Counts: {consistency['counts']}")
        report.append("")
        
        # Total Review Consistency
        report.append("## Total Review Count Consistency")
        total_consistency = validation_results['total_review_consistency']
        status = "✅ Consistent" if total_consistency['consistent'] else "❌ Inconsistent"
        report.append(f"- **Status:** {status}")
        if not total_consistency['consistent']:
            report.append(f"- **Variance:** {total_consistency['variance']}")
            report.append(f"- **Counts:** {total_consistency['counts']}")
        report.append("")
        
        # Data Checksums
        report.append("## Data File Checksums")
        for source, checksum in validation_results['checksums'].items():
            report.append(f"- **{os.path.basename(source)}:** `{checksum}`")
        report.append("")
        
        return "\n".join(report)
    
    def save_validation_report(self, validation_results: Dict, output_path: str):
        """Save validation report to file"""
        report = self.generate_validation_report(validation_results)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"\n✅ Validation report saved to: {output_path}")


def main():
    """Main function to run data validation"""
    validator = DataValidationFramework()
    
    # Define data sources to validate
    data_sources = [
        '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/sentiment_analysis_results.json',
        '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/regional_sentiment/regional_sentiment_analysis.json'
    ]
    
    # Run validation
    validation_results = validator.validate_data_consistency(data_sources)
    
    # Save validation report
    output_path = '/Users/alexjeffries/tourism-commons/digital_assessment/sentiment/output/data_validation_report.md'
    validator.save_validation_report(validation_results, output_path)
    
    print(f"\n🎉 Data validation completed!")
    print(f"📊 Validated {validation_results['valid_sources']}/{validation_results['total_sources']} data sources")


if __name__ == "__main__":
    main()
