#!/usr/bin/env python3
"""
Complete ITO Assessment
Orchestrates all analyzers to produce complete ITO assessments
"""

import json
import os
import sys
from typing import Dict, List
import logging
from datetime import datetime

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

from itos_data_models import ITOAssessment, VisibilityLevel, LocalIntegration, MediaPresentation
from analyzers.activity_extractor import ActivityExtractor
from analyzers.audience_analyzer import AudienceAnalyzer
from analyzers.product_classifier import ProductTypeClassifier
from analyzers.itinerary_parser import ItineraryParser
from analyzers.simple_analyzers import (
    BookingDetector, PricingAnalyzer, LanguageDetector,
    PartnershipExtractor, SeasonalityAnalyzer
)

logger = logging.getLogger(__name__)


class CompleteITOAssessment:
    """Orchestrates complete ITO assessment"""
    
    def __init__(self):
        """Initialize all analyzers"""
        logger.info("Initializing analyzers...")
        
        self.activity_extractor = ActivityExtractor()
        self.audience_analyzer = AudienceAnalyzer()
        self.product_classifier = ProductTypeClassifier()
        self.itinerary_parser = ItineraryParser()
        self.booking_detector = BookingDetector()
        self.pricing_analyzer = PricingAnalyzer()
        self.language_detector = LanguageDetector()
        self.partnership_extractor = PartnershipExtractor()
        self.seasonality_analyzer = SeasonalityAnalyzer()
        
        logger.info("✅ All analyzers initialized")
    
    def assess_ito(self, ito_data: Dict, scraped_content: Dict = None) -> ITOAssessment:
        """
        Run complete assessment on a single ITO
        
        Args:
            ito_data: Dict with operator_name, country, website_url, gambia_page_url, gambia_tour_pages
            scraped_content: Optional dict with 'content' key for scraped text
            
        Returns:
            Complete ITOAssessment object
        """
        operator_name = ito_data.get('operator_name', 'Unknown')
        logger.info(f"Assessing: {operator_name}")
        
        # Create assessment object
        assessment = ITOAssessment(
            operator_name=operator_name,
            country_region=ito_data.get('country', ''),
            website_url=ito_data.get('website_url', ''),
            gambia_page_url=ito_data.get('gambia_page_url', ''),
            gambia_tour_pages=ito_data.get('gambia_tour_pages', [])
        )
        
        # Get content
        if scraped_content and 'content' in scraped_content:
            content = scraped_content['content']
            assessment.raw_content_length = len(content)
        elif 'content' in ito_data:
            content = ito_data['content']
            assessment.raw_content_length = len(content)
        else:
            logger.warning(f"No content for {operator_name}")
            assessment.scrape_status = "No content"
            return assessment
        
        try:
            # Determine if has tour pages
            has_tour_pages = bool(assessment.gambia_tour_pages)
            
            # Run all analyzers
            logger.debug(f"  Extracting activities...")
            assessment.activities = self.activity_extractor.extract_all_activities(content)
            
            logger.debug(f"  Identifying audiences...")
            audiences, scores = self.audience_analyzer.identify_audiences(content)
            assessment.target_audiences = audiences
            assessment.audience_confidence_scores = scores
            
            logger.debug(f"  Classifying product type...")
            assessment.product_type = self.product_classifier.classify(content, has_tour_pages)
            
            logger.debug(f"  Parsing itinerary...")
            assessment.itinerary_depth = self.itinerary_parser.parse_itinerary(content)
            
            logger.debug(f"  Detecting booking pathway...")
            assessment.booking_pathway = self.booking_detector.detect(content)
            
            logger.debug(f"  Analyzing pricing...")
            assessment.price_transparency = self.pricing_analyzer.analyze(content)
            
            logger.debug(f"  Detecting languages...")
            assessment.languages_available = self.language_detector.detect(
                content, 
                assessment.gambia_page_url
            )
            
            logger.debug(f"  Extracting partnerships...")
            partnerships = self.partnership_extractor.extract(content)
            assessment.local_integration = LocalIntegration(
                hotels_mentioned=partnerships['hotels_mentioned'],
                attractions_mentioned=partnerships['attractions_mentioned'],
                dmc_mentioned=partnerships['dmc_mentioned'],
                has_local_partnerships=partnerships['has_local_partnerships'],
                integration_score=partnerships['integration_score']
            )
            
            logger.debug(f"  Analyzing seasonality...")
            assessment.seasonality_framing = self.seasonality_analyzer.analyze(content)
            
            # Simple media assessment (could be enhanced)
            assessment.media_presentation = MediaPresentation(
                has_ugc_testimonials='testimonial' in content.lower() or 'review' in content.lower(),
                has_tripadvisor='tripadvisor' in content.lower()
            )
            
            # Set visibility (would need homepage scraping for accuracy, default to unknown)
            assessment.visibility_navigation = VisibilityLevel.UNKNOWN
            
            assessment.scrape_status = "Success"
            assessment.last_scraped = datetime.now()
            
            logger.info(f"✅ {operator_name}: {assessment.activities.count_present()}/12 activities, "
                       f"{len(audiences)} audiences, {assessment.product_type.value}")
            
        except Exception as e:
            logger.error(f"❌ Error assessing {operator_name}: {e}")
            assessment.scrape_status = "Failed"
            assessment.scrape_errors.append(str(e))
        
        return assessment
    
    def assess_multiple_itos(self, itos_data: List[Dict]) -> List[ITOAssessment]:
        """Assess multiple ITOs"""
        logger.info(f"Assessing {len(itos_data)} ITOs...")
        
        assessments = []
        
        for i, ito_data in enumerate(itos_data, 1):
            logger.info(f"\n[{i}/{len(itos_data)}]")
            try:
                assessment = self.assess_ito(ito_data)
                assessments.append(assessment)
            except Exception as e:
                logger.error(f"Failed to assess ITO {i}: {e}")
                continue
        
        logger.info(f"\n✅ Completed {len(assessments)}/{len(itos_data)} assessments")
        
        return assessments
    
    def save_assessments(self, assessments: List[ITOAssessment], output_path: str = None):
        """Save assessments to JSON"""
        if output_path is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_path = f"../output/ito_assessments_{timestamp}.json"
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        data = {
            'summary': {
                'total_assessed': len(assessments),
                'successful': sum(1 for a in assessments if a.scrape_status == "Success"),
                'failed': sum(1 for a in assessments if a.scrape_status != "Success"),
                'timestamp': datetime.now().isoformat()
            },
            'assessments': [a.to_dict() for a in assessments]
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"💾 Saved to: {output_path}")
        return output_path


def test_complete_assessment():
    """Test complete assessment on sample data"""
    
    # Load scraped data
    output_dir = os.path.join(os.path.dirname(__file__), '../output')
    files = [f for f in os.listdir(output_dir) if f.startswith('itos_scraped_data')]
    
    if not files:
        print("❌ No scraped data found. Run scraper first.")
        return
    
    latest_file = sorted(files)[-1]
    filepath = os.path.join(output_dir, latest_file)
    
    print("="*80)
    print("COMPLETE ITO ASSESSMENT TEST")
    print("="*80)
    print(f"\n📂 Loading: {latest_file}\n")
    
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    scraped_itos = data.get('scraped_itos', [])
    
    # Prepare ITO data
    itos_to_assess = []
    for ito in scraped_itos[:3]:  # Test on first 3
        itos_to_assess.append({
            'operator_name': ito['company_name'],
            'country': '',  # Would come from Google Sheets
            'website_url': '',
            'gambia_page_url': ito['url'],
            'gambia_tour_pages': [],  # Would come from Google Sheets
            'content': ito['content']
        })
    
    # Run assessment
    assessor = CompleteITOAssessment()
    assessments = assessor.assess_multiple_itos(itos_to_assess)
    
    # Display results
    print("\n" + "="*80)
    print("ASSESSMENT RESULTS")
    print("="*80)
    
    for assessment in assessments:
        print(f"\n{'─'*80}")
        print(f"Operator: {assessment.operator_name}")
        print("─"*80)
        print(f"Product Type: {assessment.product_type.value}")
        print(f"Activities: {assessment.activities.count_present()}/12")
        print(f"  Tourism Core: {assessment.activities.tourism_core_count()}/4")
        print(f"  Creative Industries: {assessment.activities.creative_industries_count()}/8")
        print(f"Target Audiences: {', '.join([a.replace('_', ' ').title() for a in assessment.target_audiences]) if assessment.target_audiences else 'None'}")
        print(f"Booking: {assessment.booking_pathway.value}")
        print(f"Pricing: {assessment.price_transparency.value}")
        print(f"Languages: {', '.join(assessment.languages_available)}")
        print(f"Local Partnerships: {assessment.local_integration.integration_score}/5")
        if assessment.seasonality_framing:
            print(f"Seasonality: {', '.join(assessment.seasonality_framing)}")
        print(f"Status: {assessment.scrape_status}")
    
    # Save results
    output_file = assessor.save_assessments(assessments)
    
    print("\n" + "="*80)
    print(f"✅ Assessment complete! Saved to: {output_file}")
    print("="*80)


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(levelname)s: %(message)s'
    )
    
    test_complete_assessment()
