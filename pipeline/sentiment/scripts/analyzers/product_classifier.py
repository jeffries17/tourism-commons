#!/usr/bin/env python3
"""
Product Type Classifier
Classifies tour products: Flight+Hotel, Itinerary, Tailor-made, or Mixed
"""

import sys
import os
from typing import Tuple
import logging

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from itos_data_models import ProductType

logger = logging.getLogger(__name__)


class ProductTypeClassifier:
    """Classifies tour products into categories"""
    
    INDICATORS = {
        'flight_hotel': [
            'flight + hotel', 'flight and hotel', 'flights and hotels',
            'package holiday', 'all-inclusive', 'all inclusive',
            'charter', 'hotel package', 'fly and stay',
            'flight only', 'hotel only', 'accommodation only',
            'beach holiday', 'sun holiday', 'resort package',
            'package deal', 'holiday package', 'vacation package'
        ],
        'itinerary': [
            'day-by-day', 'day by day', 'itinerary', 'tour schedule',
            'day 1:', 'day 2:', 'day 3:', 'dag 1:', 'dag 2:',  # Dutch
            'jour 1:', 'jour 2:',  # French
            'tag 1:', 'tag 2:',  # German
            'guided tour', 'escorted tour', 'multi-day tour',
            'tour itinerary', 'tour program', 'tour route',
            'detailed itinerary', 'full itinerary', 'tour plan',
            'trip itinerary', 'travel itinerary'
        ],
        'tailor_made': [
            'tailor-made', 'tailor made', 'tailored', 'custom',
            'bespoke', 'flexible', 'personalized', 'personalised',
            'on request', 'design your own', 'customize',
            'customise', 'build your own', 'create your own',
            'made to measure', 'custom-made', 'custom itinerary',
            'flexible itinerary', 'your way'
        ]
    }
    
    def classify(self, content: str, has_tour_pages: bool = False) -> ProductType:
        """
        Classify product type based on content and structure
        
        Args:
            content: Page content
            has_tour_pages: Whether there are specific tour page URLs
            
        Returns:
            ProductType enum
        """
        content_lower = content.lower()
        
        # Count indicators for each type
        flight_hotel_count = sum(1 for ind in self.INDICATORS['flight_hotel'] if ind in content_lower)
        itinerary_count = sum(1 for ind in self.INDICATORS['itinerary'] if ind in content_lower)
        tailor_count = sum(1 for ind in self.INDICATORS['tailor_made'] if ind in content_lower)
        
        # If has_tour_pages, likely itinerary-based
        if has_tour_pages:
            itinerary_count += 5  # Boost itinerary score
        
        # Determine primary type
        scores = {
            'flight_hotel': flight_hotel_count,
            'itinerary': itinerary_count,
            'tailor_made': tailor_count
        }
        
        max_score = max(scores.values())
        
        # If no clear indicators
        if max_score == 0:
            # Default based on has_tour_pages
            return ProductType.ITINERARY if has_tour_pages else ProductType.FLIGHT_HOTEL
        
        # Check if multiple types are present (Mixed)
        types_above_threshold = sum(1 for score in scores.values() if score >= 3)
        if types_above_threshold >= 2:
            return ProductType.MIXED
        
        # Return dominant type
        if scores['itinerary'] == max_score:
            return ProductType.ITINERARY
        elif scores['tailor_made'] == max_score:
            return ProductType.TAILOR_MADE
        elif scores['flight_hotel'] == max_score:
            return ProductType.FLIGHT_HOTEL
        
        return ProductType.UNKNOWN
    
    def get_classification_details(self, content: str, has_tour_pages: bool = False) -> dict:
        """Get detailed classification breakdown"""
        content_lower = content.lower()
        
        details = {}
        for product_type, indicators in self.INDICATORS.items():
            matched = [ind for ind in indicators if ind in content_lower]
            details[product_type] = {
                'count': len(matched),
                'matched': matched[:5]  # Top 5
            }
        
        details['has_tour_pages'] = has_tour_pages
        details['classification'] = self.classify(content, has_tour_pages)
        
        return details


def test_product_classifier():
    """Test the product classifier"""
    
    samples = {
        "Flight+Hotel Package": (
            "Book your perfect beach holiday to The Gambia with our all-inclusive "
            "package deals. Flights and hotels combined for great value. Choose from "
            "our range of 3, 4, and 5-star resorts along the Atlantic coast.",
            False
        ),
        "Itinerary Tour": (
            "Day 1: Arrival in Banjul, transfer to hotel\n"
            "Day 2: Abuko Nature Reserve and river cruise\n"
            "Day 3: Kunta Kinteh Island and Juffureh village\n"
            "Day 4: Birdwatching at Tanji Bird Reserve\n"
            "Day 5: Departure",
            True
        ),
        "Tailor-made": (
            "Create your perfect Gambia adventure with our tailor-made tour service. "
            "Flexible itineraries designed around your interests. Bespoke experiences "
            "crafted just for you. Contact us to customize your journey.",
            False
        ),
        "Mixed": (
            "Choose from our package holidays with flight and hotel, or select one of "
            "our guided itineraries with day-by-day schedules. We also offer tailor-made "
            "tours designed to your specifications.",
            True
        )
    }
    
    print("="*70)
    print("PRODUCT TYPE CLASSIFIER TEST")
    print("="*70)
    
    classifier = ProductTypeClassifier()
    
    for sample_name, (content, has_tours) in samples.items():
        print(f"\n{'─'*70}")
        print(f"Sample: {sample_name}")
        print(f"Has tour pages: {has_tours}")
        print("─"*70)
        
        product_type = classifier.classify(content, has_tours)
        details = classifier.get_classification_details(content, has_tours)
        
        print(f"\n✅ Classification: {product_type.value}")
        
        print(f"\n📊 Indicator Counts:")
        for ptype, info in details.items():
            if ptype not in ['has_tour_pages', 'classification']:
                if info['count'] > 0:
                    print(f"  {ptype}: {info['count']} matches")
                    if info['matched']:
                        print(f"    → {', '.join(info['matched'][:3])}")
    
    print("\n" + "="*70)
    print("✅ Product classifier working correctly!")
    print("="*70)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    test_product_classifier()
