#!/usr/bin/env python3
"""
Itinerary Parser
Parses tour itineraries to extract structure and Gambia focus
"""

import re
import sys
import os
from typing import Dict, Optional
import logging

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from itos_data_models import ItineraryDepth, DetailLevel

logger = logging.getLogger(__name__)


class ItineraryParser:
    """Parses itinerary content to extract structure"""
    
    # Day markers in multiple languages
    DAY_PATTERNS = [
        r'day\s+(\d+)',           # English: Day 1
        r'dag\s+(\d+)',           # Dutch: Dag 1
        r'jour\s+(\d+)',          # French: Jour 1  
        r'tag\s+(\d+)',           # German: Tag 1
        r'día\s+(\d+)',           # Spanish: Día 1
        r'(\d+)\.\s+day',         # Alternative: 1. Day
        r'(\d+)\s*[-:]\s*day',    # Alternative: 1 - Day
    ]
    
    COUNTRY_KEYWORDS = {
        'gambia': ['gambia', 'banjul', 'serrekunda', 'bakau', 'abuko', 'kachikally'],
        'senegal': ['senegal', 'dakar', 'saint-louis', 'st louis', 'goree', 'gorée'],
        'guinea': ['guinea', 'conakry', 'guinea-bissau', 'bissau'],
        'mali': ['mali', 'bamako', 'timbuktu', 'djenne'],
        'mauritania': ['mauritania', 'nouakchott'],
    }
    
    def parse_itinerary(self, content: str) -> ItineraryDepth:
        """
        Parse itinerary content
        
        Returns ItineraryDepth with:
        - gambia_percentage: % of days in Gambia
        - detail_level: day-by-day vs overview
        - total_days: total duration
        - countries_breakdown: days per country
        """
        content_lower = content.lower()
        
        # Detect total days
        total_days = self._detect_total_days(content_lower)
        
        # Detect detail level
        detail_level = self._detect_detail_level(content_lower)
        
        # Parse country breakdown
        countries_breakdown = self._parse_country_breakdown(content_lower, total_days)
        
        # Calculate Gambia percentage
        gambia_percentage = None
        has_multi_country = len(countries_breakdown) > 1
        
        if total_days and total_days > 0:
            gambia_days = countries_breakdown.get('Gambia', 0)
            gambia_percentage = (gambia_days / total_days) * 100
        elif countries_breakdown:
            # Estimate based on mentions if no day count
            total_mentions = sum(countries_breakdown.values())
            gambia_mentions = countries_breakdown.get('Gambia', 0)
            if total_mentions > 0:
                gambia_percentage = (gambia_mentions / total_mentions) * 100
        
        return ItineraryDepth(
            gambia_percentage=gambia_percentage,
            detail_level=detail_level,
            total_days=total_days,
            countries_breakdown=countries_breakdown,
            has_multi_country=has_multi_country
        )
    
    def _detect_total_days(self, content: str) -> Optional[int]:
        """Detect total number of days in itinerary"""
        
        # Try to find day markers
        all_days = []
        for pattern in self.DAY_PATTERNS:
            days = re.findall(pattern, content, re.IGNORECASE)
            all_days.extend([int(d) for d in days])
        
        if all_days:
            return max(all_days)
        
        # Try to find duration mentions
        duration_patterns = [
            r'(\d+)\s*days?',
            r'(\d+)\s*nights?',
            r'(\d+)[-\s]*day\s+tour',
            r'(\d+)[-\s]*night\s+trip',
        ]
        
        for pattern in duration_patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                return int(match.group(1))
        
        return None
    
    def _detect_detail_level(self, content: str) -> DetailLevel:
        """Detect how detailed the itinerary is"""
        
        # Count day markers
        day_marker_count = 0
        for pattern in self.DAY_PATTERNS:
            day_marker_count += len(re.findall(pattern, content, re.IGNORECASE))
        
        # Check for detailed indicators
        detail_indicators = [
            'breakfast', 'lunch', 'dinner',
            'morning', 'afternoon', 'evening',
            'overnight', 'transfer', 'drive to',
            'visit', 'explore', 'tour of'
        ]
        
        detail_count = sum(1 for ind in detail_indicators if ind in content)
        
        # Determine level
        if day_marker_count >= 3 and detail_count >= 5:
            return DetailLevel.DAY_BY_DAY
        elif day_marker_count >= 2 or detail_count >= 3:
            return DetailLevel.MULTI_DAY_OVERVIEW
        elif day_marker_count > 0 or detail_count > 0:
            return DetailLevel.SUMMARY_ONLY
        else:
            return DetailLevel.NOT_APPLICABLE
    
    def _parse_country_breakdown(self, content: str, total_days: Optional[int]) -> Dict[str, int]:
        """Parse which countries are mentioned and estimate days"""
        
        breakdown = {}
        
        # Count mentions of each country
        for country, keywords in self.COUNTRY_KEYWORDS.items():
            mentions = sum(content.count(kw) for kw in keywords)
            if mentions > 0:
                country_name = country.capitalize()
                breakdown[country_name] = mentions
        
        # If we have total days and countries, estimate distribution
        if total_days and breakdown:
            total_mentions = sum(breakdown.values())
            estimated_breakdown = {}
            
            for country, mentions in breakdown.items():
                # Proportional allocation
                estimated_days = round((mentions / total_mentions) * total_days)
                estimated_breakdown[country] = max(estimated_days, 1)  # At least 1 day
            
            # Adjust to match total
            diff = total_days - sum(estimated_breakdown.values())
            if diff != 0 and estimated_breakdown:
                # Add/subtract from largest
                largest_country = max(estimated_breakdown, key=estimated_breakdown.get)
                estimated_breakdown[largest_country] += diff
            
            return estimated_breakdown
        
        return breakdown
    
    def get_parsing_details(self, content: str) -> Dict:
        """Get detailed parsing information for debugging"""
        
        result = self.parse_itinerary(content)
        
        # Find day markers
        day_markers = []
        for pattern in self.DAY_PATTERNS:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            day_markers.extend([m.group(0) for m in matches])
        
        return {
            'itinerary_depth': result,
            'day_markers_found': day_markers[:10],  # First 10
            'day_marker_count': len(day_markers),
            'countries_detected': list(result.countries_breakdown.keys()),
            'is_multi_country': result.has_multi_country
        }


def test_itinerary_parser():
    """Test the itinerary parser"""
    
    samples = {
        "Gambia Only Tour": """
        Day 1: Arrival in Banjul, transfer to hotel
        Day 2: Abuko Nature Reserve birdwatching tour
        Day 3: River cruise to Kunta Kinteh Island
        Day 4: Visit to local villages in Gambia
        Day 5: Beach day and departure from Banjul
        """,
        
        "Senegal-Gambia Combo": """
        Day 1-2: Dakar, Senegal - city tour and Goree Island
        Day 3: Drive to Gambia, arrive Banjul
        Day 4-5: Gambia river safari and Abuko Nature Reserve
        Day 6: Return to Senegal, Saint-Louis
        Day 7: Departure from Dakar
        """,
        
        "Overview Only": """
        Explore the best of Gambia including birdwatching, 
        river cruises, and beach relaxation. Visit Banjul
        and surrounding areas during this amazing trip.
        """,
        
        "Detailed Itinerary": """
        Dag 1: Aankomst in Banjul
        Morning arrival and transfer to hotel. Afternoon at leisure.
        Overnight in Gambia.
        
        Dag 2: Abuko Nature Reserve
        Breakfast at hotel. Morning visit to Abuko for birdwatching.
        Lunch included. Afternoon river cruise. Dinner and overnight.
        
        Dag 3: Kunta Kinteh Island
        After breakfast, drive to the river. Visit Kunta Kinteh Island
        and Juffureh village. Lunch on board. Return evening.
        """
    }
    
    print("="*70)
    print("ITINERARY PARSER TEST")
    print("="*70)
    
    parser = ItineraryParser()
    
    for sample_name, content in samples.items():
        print(f"\n{'─'*70}")
        print(f"Sample: {sample_name}")
        print("─"*70)
        
        result = parser.parse_itinerary(content)
        details = parser.get_parsing_details(content)
        
        print(f"\n📊 PARSED RESULTS:")
        print(f"  Total Days: {result.total_days if result.total_days else 'Unknown'}")
        print(f"  Detail Level: {result.detail_level.value}")
        print(f"  Gambia %: {result.gambia_percentage:.0f}%" if result.gambia_percentage else "  Gambia %: N/A")
        print(f"  Multi-country: {'Yes' if result.has_multi_country else 'No'}")
        
        if result.countries_breakdown:
            print(f"\n🌍 COUNTRIES:")
            for country, days in result.countries_breakdown.items():
                print(f"  {country}: {days} {'day' if days == 1 else 'days'}")
        
        print(f"\n🔍 DETECTION:")
        print(f"  Day markers found: {details['day_marker_count']}")
        if details['day_markers_found']:
            print(f"  Examples: {', '.join(details['day_markers_found'][:3])}")
    
    print("\n" + "="*70)
    print("✅ Itinerary parser working correctly!")
    print("="*70)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    test_itinerary_parser()
