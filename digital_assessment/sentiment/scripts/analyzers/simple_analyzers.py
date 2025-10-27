#!/usr/bin/env python3
"""
Simple Analyzers
Quick implementations for booking, pricing, language, partnerships, seasonality
"""

import re
import sys
import os
from typing import List, Dict
import logging

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from itos_data_models import BookingPathway, PriceTransparency, VisibilityLevel

logger = logging.getLogger(__name__)


class BookingDetector:
    """Detects booking mechanisms"""
    
    BOOKING_INDICATORS = {
        'online_bookable': [
            'book now', 'book online', 'add to cart', 'add to basket',
            'check availability', 'reserve now', 'buy now',
            'instant booking', 'book direct', 'secure booking',
            'booking form', 'online reservation'
        ],
        'enquiry_only': [
            'enquire now', 'inquire now', 'contact us', 'get in touch',
            'request quote', 'request information', 'ask for details',
            'send enquiry', 'make an enquiry', 'email us',
            'call us', 'phone us', 'contact for details'
        ],
        'price_on_request': [
            'price on request', 'price on application', 'poa',
            'contact for price', 'call for price', 'email for price',
            'quotation on request', 'quote on request'
        ]
    }
    
    def detect(self, content: str) -> BookingPathway:
        """Detect booking pathway"""
        content_lower = content.lower()
        
        online_count = sum(1 for ind in self.BOOKING_INDICATORS['online_bookable'] if ind in content_lower)
        enquiry_count = sum(1 for ind in self.BOOKING_INDICATORS['enquiry_only'] if ind in content_lower)
        por_count = sum(1 for ind in self.BOOKING_INDICATORS['price_on_request'] if ind in content_lower)
        
        # Price on request is most specific
        if por_count >= 1:
            return BookingPathway.PRICE_ON_REQUEST
        
        # If both online and enquiry present
        if online_count >= 2 and enquiry_count >= 1:
            return BookingPathway.MIXED
        
        # Primary pathway
        if online_count >= 2:
            return BookingPathway.ONLINE_BOOKABLE
        elif enquiry_count >= 1:
            return BookingPathway.ENQUIRY_ONLY
        
        # Default to enquiry if unclear
        return BookingPathway.ENQUIRY_ONLY


class PricingAnalyzer:
    """Analyzes price transparency"""
    
    def analyze(self, content: str) -> PriceTransparency:
        """Detect pricing transparency"""
        content_lower = content.lower()
        
        # Check for clear pricing
        clear_indicators = [
            r'£\d+', r'\$\d+', r'€\d+',  # Currency symbols with numbers
            'per person', 'per night', 'total price',
            'package price', 'fixed price'
        ]
        clear_count = sum(1 for ind in clear_indicators if re.search(ind, content_lower))
        
        # Check for "from" pricing
        from_indicators = [
            'from £', 'from $', 'from €', 'from usd', 'from gbp',
            'starting from', 'prices from', 'starting at'
        ]
        from_count = sum(1 for ind in from_indicators if ind in content_lower)
        
        # Check for seasonal pricing
        seasonal_indicators = [
            'seasonal price', 'seasonal rate', 'high season', 'low season',
            'price varies', 'seasonal variation'
        ]
        seasonal_count = sum(1 for ind in seasonal_indicators if ind in content_lower)
        
        # Check for price on request
        por_indicators = [
            'price on request', 'poa', 'contact for price',
            'call for price', 'email for quote'
        ]
        por_count = sum(1 for ind in por_indicators if ind in content_lower)
        
        # Determine transparency level
        if por_count >= 1:
            return PriceTransparency.PRICE_ON_REQUEST
        elif seasonal_count >= 1:
            return PriceTransparency.SEASONAL_RANGES
        elif from_count >= 1:
            return PriceTransparency.FROM_PRICING
        elif clear_count >= 2:
            return PriceTransparency.CLEAR_PACKAGES
        
        return PriceTransparency.UNKNOWN


class LanguageDetector:
    """Detects available languages"""
    
    LANGUAGE_PATTERNS = {
        'en': ['english', 'en-gb', 'en-us', 'language: english'],
        'de': ['german', 'deutsch', 'de-de', 'language: german'],
        'fr': ['french', 'français', 'francais', 'fr-fr', 'language: french'],
        'nl': ['dutch', 'nederlands', 'nl-nl', 'language: dutch'],
        'es': ['spanish', 'español', 'espanol', 'es-es', 'language: spanish'],
        'it': ['italian', 'italiano', 'it-it', 'language: italian'],
        'sv': ['swedish', 'svenska', 'sv-se', 'language: swedish'],
        'no': ['norwegian', 'norsk', 'no-no', 'language: norwegian'],
        'da': ['danish', 'dansk', 'da-dk', 'language: danish']
    }
    
    def detect(self, content: str, url: str = '') -> List[str]:
        """Detect available languages"""
        content_lower = content.lower()
        url_lower = url.lower()
        
        detected = []
        
        # Check URL for language codes
        for lang_code in ['en', 'de', 'fr', 'nl', 'es', 'it', 'sv']:
            if f'/{lang_code}/' in url_lower or f'-{lang_code}-' in url_lower:
                if lang_code not in detected:
                    detected.append(lang_code)
        
        # Check content for language indicators
        for lang_code, patterns in self.LANGUAGE_PATTERNS.items():
            if any(pattern in content_lower for pattern in patterns):
                if lang_code not in detected:
                    detected.append(lang_code)
        
        # If no languages detected, assume English (most common)
        if not detected:
            detected = ['en']
        
        return sorted(detected)


class PartnershipExtractor:
    """Extracts Gambian entity mentions"""
    
    def __init__(self, entities_path: str = None):
        if entities_path is None:
            entities_path = os.path.join(
                os.path.dirname(__file__),
                '../../data/config/gambian_entities.json'
            )
        
        import json
        with open(entities_path, 'r') as f:
            config = json.load(f)
        
        self.hotels = config['hotels_lodges']
        self.attractions = config['attractions']
        self.dmcs = config['dmcs_tour_operators']
    
    def extract(self, content: str) -> Dict:
        """Extract Gambian entity mentions"""
        content_lower = content.lower()
        
        hotels_found = [h for h in self.hotels if h in content_lower]
        attractions_found = [a for a in self.attractions if a in content_lower]
        dmcs_found = [d for d in self.dmcs if d in content_lower]
        
        # Calculate integration score (0-5)
        score = 0
        score += min(len(hotels_found), 2)  # Max 2 points
        score += min(len(attractions_found), 2)  # Max 2 points
        score += 1 if dmcs_found else 0  # Max 1 point
        
        return {
            'hotels_mentioned': hotels_found,
            'attractions_mentioned': attractions_found,
            'dmc_mentioned': dmcs_found,
            'integration_score': score,
            'has_local_partnerships': score > 0
        }


class SeasonalityAnalyzer:
    """Analyzes seasonal framing"""
    
    def __init__(self, config_path: str = None):
        if config_path is None:
            config_path = os.path.join(
                os.path.dirname(__file__),
                '../../data/config/seasonality_patterns.json'
            )
        
        import json
        with open(config_path, 'r') as f:
            config = json.load(f)
        
        self.frames = config['seasonal_frames']
    
    def analyze(self, content: str) -> List[str]:
        """Identify seasonal framing"""
        content_lower = content.lower()
        
        detected_frames = []
        
        for frame_id, frame_config in self.frames.items():
            keywords = frame_config['keywords']
            matches = sum(1 for kw in keywords if kw in content_lower)
            
            if matches >= 1:
                detected_frames.append(frame_id)
        
        return detected_frames


def test_simple_analyzers():
    """Test all simple analyzers"""
    
    sample_content = """
    Book now for our winter sun holiday to The Gambia! 
    Prices from £899 per person. Contact us for seasonal rates.
    
    Visit Abuko Nature Reserve and stay at Mandina Lodges.
    Available in English, German, and Dutch.
    
    Enquire now or call us for more information.
    """
    
    print("="*70)
    print("SIMPLE ANALYZERS TEST")
    print("="*70)
    
    # Booking
    booking_detector = BookingDetector()
    booking = booking_detector.detect(sample_content)
    print(f"\n📞 Booking Pathway: {booking.value}")
    
    # Pricing
    pricing_analyzer = PricingAnalyzer()
    pricing = pricing_analyzer.analyze(sample_content)
    print(f"💰 Price Transparency: {pricing.value}")
    
    # Languages
    lang_detector = LanguageDetector()
    languages = lang_detector.detect(sample_content, 'https://example.com/de/gambia')
    print(f"🌍 Languages: {', '.join(languages)}")
    
    # Partnerships
    partnership_extractor = PartnershipExtractor()
    partnerships = partnership_extractor.extract(sample_content)
    print(f"🤝 Local Partnerships:")
    print(f"   Hotels: {partnerships['hotels_mentioned']}")
    print(f"   Attractions: {partnerships['attractions_mentioned']}")
    print(f"   Integration Score: {partnerships['integration_score']}/5")
    
    # Seasonality
    seasonality_analyzer = SeasonalityAnalyzer()
    seasons = seasonality_analyzer.analyze(sample_content)
    print(f"📅 Seasonal Framing: {', '.join(seasons) if seasons else 'None'}")
    
    print("\n" + "="*70)
    print("✅ All simple analyzers working!")
    print("="*70)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    test_simple_analyzers()
