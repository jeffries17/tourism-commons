#!/usr/bin/env python3
"""
Run ITO Assessment from Google Sheets Data
Processes ITOs and outputs 32-column format ready for Google Sheets
"""

import csv
import json
import os
import sys
import logging
from typing import List, Dict
from datetime import datetime

sys.path.insert(0, os.path.dirname(__file__))

from complete_ito_assessment import CompleteITOAssessment
from itos_data_models import SHEETS_HEADERS
from analyzers.activity_extractor import ActivityExtractor

logger = logging.getLogger(__name__)


def parse_tour_pages(tour_pages_str: str) -> List[str]:
    """Parse comma-separated tour page URLs"""
    if not tour_pages_str or tour_pages_str.strip() == '':
        return []
    
    # Split by comma and clean up
    pages = [p.strip() for p in tour_pages_str.split(',')]
    return [p for p in pages if p and p.startswith('http')]


def load_ito_data_from_csv(csv_path: str) -> List[Dict]:
    """
    Load ITO data from CSV file
    
    Expected columns:
    - Operator Name (A)
    - Country (B)
    - Gambia Page Link (C)
    - Gambia Tour Page (D) - comma-separated URLs
    """
    itos = []
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            operator_name = row.get('Operator Name', '').strip()
            if not operator_name:
                continue
            
            gambia_page = row.get('Gambia Page Link', '').strip()
            tour_pages_str = row.get('Gambia Tour Page', '')
            
            ito = {
                'operator_name': operator_name,
                'country': row.get('Country', '').strip(),
                'website_url': '',  # Could add column for this
                'gambia_page_url': gambia_page,
                'gambia_tour_pages': parse_tour_pages(tour_pages_str)
            }
            
            itos.append(ito)
    
    logger.info(f"✅ Loaded {len(itos)} ITOs from CSV")
    return itos


def load_scraped_content(output_dir: str = '../output') -> Dict[str, str]:
    """Load scraped content by URL"""
    
    # Find most recent scraped data
    files = [f for f in os.listdir(output_dir) if f.startswith('itos_scraped_data')]
    if not files:
        logger.warning("No scraped data found")
        return {}
    
    latest_file = sorted(files)[-1]
    filepath = os.path.join(output_dir, latest_file)
    
    logger.info(f"Loading scraped content from: {latest_file}")
    
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    # Create URL -> content mapping
    content_map = {}
    for ito in data.get('scraped_itos', []):
        url = ito.get('url', '')
        content = ito.get('content', '')
        if url and content:
            content_map[url] = content
    
    logger.info(f"✅ Loaded content for {len(content_map)} URLs")
    return content_map


def merge_ito_with_content(ito_data: Dict, content_map: Dict[str, str]) -> Dict:
    """Merge ITO data with scraped content"""
    
    # Try to find content for main Gambia page
    gambia_url = ito_data.get('gambia_page_url', '')
    
    content = content_map.get(gambia_url, '')
    
    # If no content for main page, try tour pages
    if not content and ito_data.get('gambia_tour_pages'):
        for tour_url in ito_data['gambia_tour_pages']:
            if tour_url in content_map:
                content = content_map[tour_url]
                break
    
    # Add content to ITO data
    ito_with_content = ito_data.copy()
    ito_with_content['content'] = content
    
    return ito_with_content


def export_to_csv(assessments: List, output_path: str):
    """Export assessments to CSV in 32-column Google Sheets format"""
    
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        
        # Write headers
        writer.writerow(SHEETS_HEADERS)
        
        # Write data rows
        for assessment in assessments:
            writer.writerow(assessment.to_sheets_row())
    
    logger.info(f"✅ Exported {len(assessments)} assessments to CSV")


def main():
    """Main execution"""
    
    print("="*80)
    print("ITO ASSESSMENT - GOOGLE SHEETS INTEGRATION")
    print("="*80)
    
    # Check for input CSV
    input_csv = '../data/itos_input.csv'  # You would export from Google Sheets
    
    if not os.path.exists(input_csv):
        print(f"\n⚠️  Input file not found: {input_csv}")
        print("\nTo use this script:")
        print("1. Export your Google Sheet columns A-D as CSV")
        print("2. Save as: digital_assessment/sentiment/data/itos_input.csv")
        print("3. Run this script again")
        print("\nAlternatively, we can process the existing scraped data...")
        
        # Fallback: process existing scraped data
        print("\nProcessing existing scraped data instead...")
        process_existing_scraped_data()
        return
    
    # Load ITO data from CSV
    logger.info("Loading ITO data from CSV...")
    itos_data = load_ito_data_from_csv(input_csv)
    
    # Load scraped content
    logger.info("Loading scraped content...")
    content_map = load_scraped_content()
    
    # Merge data with content
    logger.info("Merging data with content...")
    itos_with_content = []
    for ito in itos_data:
        ito_with_content = merge_ito_with_content(ito, content_map)
        if ito_with_content.get('content'):
            itos_with_content.append(ito_with_content)
        else:
            logger.warning(f"No content found for: {ito['operator_name']}")
    
    logger.info(f"✅ Found content for {len(itos_with_content)}/{len(itos_data)} ITOs")
    
    # Run assessment
    logger.info("\nRunning complete assessment...")
    assessor = CompleteITOAssessment()
    assessments = assessor.assess_multiple_itos(itos_with_content)
    
    # Export results
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_csv = f'../output/ito_assessment_results_{timestamp}.csv'
    output_json = f'../output/ito_assessment_results_{timestamp}.json'
    
    export_to_csv(assessments, output_csv)
    assessor.save_assessments(assessments, output_json)
    
    # Summary
    print("\n" + "="*80)
    print("ASSESSMENT COMPLETE")
    print("="*80)
    print(f"\n✅ Processed: {len(assessments)} ITOs")
    print(f"📊 Average activities: {sum(a.activities.count_present() for a in assessments) / len(assessments):.1f}/12")
    print(f"📁 Output files:")
    print(f"   CSV (for Google Sheets): {output_csv}")
    print(f"   JSON (detailed data): {output_json}")
    print("\nNext steps:")
    print("1. Open the CSV file in Excel/Google Sheets")
    print("2. Copy all data (Ctrl+A)")
    print("3. Paste into your Google Sheet")
    print("4. Format as needed")


def process_existing_scraped_data():
    """Process existing scraped data without CSV input"""
    
    # Load scraped data
    output_dir = '../output'
    files = [f for f in os.listdir(output_dir) if f.startswith('itos_scraped_data')]
    
    if not files:
        print("❌ No scraped data found. Run scraper first.")
        return
    
    latest_file = sorted(files)[-1]
    filepath = os.path.join(output_dir, latest_file)
    
    print(f"\n📂 Loading: {latest_file}")
    
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    scraped_itos = data.get('scraped_itos', [])
    
    # Convert to ITO data format
    itos_data = []
    for ito in scraped_itos:
        itos_data.append({
            'operator_name': ito['company_name'],
            'country': '',  # Not in scraped data
            'website_url': '',
            'gambia_page_url': ito['url'],
            'gambia_tour_pages': [],  # Not in scraped data
            'content': ito['content']
        })
    
    print(f"✅ Loaded {len(itos_data)} ITOs")
    
    # Run assessment
    print("\nRunning complete assessment...")
    assessor = CompleteITOAssessment()
    assessments = assessor.assess_multiple_itos(itos_data)
    
    # Export
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_csv = f'../output/ito_assessment_results_{timestamp}.csv'
    output_json = f'../output/ito_assessment_results_{timestamp}.json'
    
    export_to_csv(assessments, output_csv)
    assessor.save_assessments(assessments, output_json)
    
    print("\n" + "="*80)
    print("ASSESSMENT COMPLETE")
    print("="*80)
    print(f"\n✅ Processed: {len(assessments)} ITOs")
    print(f"📊 Average activities: {sum(a.activities.count_present() for a in assessments) / len(assessments):.1f}/12")
    print(f"\n📁 Output files:")
    print(f"   CSV: {output_csv}")
    print(f"   JSON: {output_json}")
    print("\n💡 Import CSV into Google Sheets to see results!")


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(levelname)s: %(message)s'
    )
    
    main()
