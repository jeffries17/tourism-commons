#!/usr/bin/env python3
"""
Activity Extractor - Binary Detection (Yes/No)
Detects presence of 12 activity categories aligned with creative industries framework
"""

import json
import os
import sys
from typing import Dict, List
import logging

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from itos_data_models import ActivityPresence

logger = logging.getLogger(__name__)


class ActivityExtractor:
    """Extracts activity presence using binary detection (Yes/No)"""
    
    def __init__(self, config_path: str = None):
        if config_path is None:
            config_path = os.path.join(
                os.path.dirname(__file__),
                '../../data/config/activity_keywords_comprehensive.json'
            )
        
        with open(config_path, 'r', encoding='utf-8') as f:
            self.config = json.load(f)
        
        self.tourism_core = self.config['tourism_core']
        self.creative_industries = self.config['creative_industries']
        self.thresholds = self.config['detection_rules']['min_keyword_matches']
    
    def extract_all_activities(self, content: str) -> ActivityPresence:
        """Extract all activity presence flags from content"""
        content_lower = content.lower()
        
        activities = ActivityPresence(
            # Tourism Core
            sun_beach=self._detect_activity(content_lower, 'sun_beach', self.tourism_core),
            nature_wildlife=self._detect_activity(content_lower, 'nature_wildlife', self.tourism_core),
            adventure=self._detect_activity(content_lower, 'adventure', self.tourism_core),
            culture_heritage=self._detect_activity(content_lower, 'culture_heritage', self.tourism_core),
            # Creative Industries
            festivals_events=self._detect_activity(content_lower, 'festivals_events', self.creative_industries),
            audiovisual=self._detect_activity(content_lower, 'audiovisual', self.creative_industries),
            marketing_advertising_publishing=self._detect_activity(content_lower, 'marketing_advertising_publishing', self.creative_industries),
            crafts_artisan=self._detect_activity(content_lower, 'crafts_artisan', self.creative_industries),
            fashion_design=self._detect_activity(content_lower, 'fashion_design', self.creative_industries),
            music=self._detect_activity(content_lower, 'music', self.creative_industries),
            performing_visual_arts=self._detect_activity(content_lower, 'performing_visual_arts', self.creative_industries),
            heritage_sites_museums=self._detect_activity(content_lower, 'heritage_sites_museums', self.creative_industries)
        )
        
        return activities
    
    def _detect_activity(self, content: str, activity_type: str, category_dict: Dict) -> bool:
        """
        Detect if activity is present (binary Yes/No)
        
        Returns True if number of unique keyword matches >= threshold
        """
        if activity_type not in category_dict:
            logger.warning(f"Activity type '{activity_type}' not found in config")
            return False
        
        activity_config = category_dict[activity_type]
        keywords = activity_config['keywords']
        threshold = self.thresholds.get(activity_type, 2)
        
        # Count unique keyword matches
        keyword_matches = [kw for kw in keywords if kw in content]
        match_count = len(keyword_matches)
        
        # Return True if matches meet or exceed threshold
        return match_count >= threshold
    
    def get_matched_keywords(self, content: str, activity_type: str) -> List[str]:
        """Get list of matched keywords for an activity"""
        content_lower = content.lower()
        
        # Check both tourism core and creative industries
        if activity_type in self.tourism_core:
            keywords = self.tourism_core[activity_type]['keywords']
        elif activity_type in self.creative_industries:
            keywords = self.creative_industries[activity_type]['keywords']
        else:
            return []
        
        return [kw for kw in keywords if kw in content_lower]
    
    def get_detection_report(self, content: str) -> Dict:
        """
        Get detailed detection report for debugging/validation
        
        Returns dict with activity presence, matched keywords, and counts
        """
        activities = self.extract_all_activities(content)
        
        report = {
            'summary': {
                'total_present': activities.count_present(),
                'tourism_core_count': activities.tourism_core_count(),
                'creative_industries_count': activities.creative_industries_count()
            },
            'details': {}
        }
        
        # Get details for each activity
        all_activities = {
            **self.tourism_core,
            **self.creative_industries
        }
        
        for activity_type in all_activities.keys():
            matched = self.get_matched_keywords(content, activity_type)
            threshold = self.thresholds.get(activity_type, 2)
            is_present = len(matched) >= threshold
            
            report['details'][activity_type] = {
                'present': is_present,
                'matched_keywords': matched,
                'match_count': len(matched),
                'threshold': threshold,
                'verdict': 'Yes' if is_present else 'No'
            }
        
        return report


def test_activity_extractor():
    """Test the activity extractor with sample content"""
    
    sample_content = """
    Discover the incredible birdwatching opportunities in The Gambia, 
    Africa's best-kept birding secret. Our tours include visits to 
    Abuko Nature Reserve, river safaris to spot hippos and chimpanzees, 
    and wildlife photography sessions. We also offer cultural tours to 
    Kunta Kinteh Island, a UNESCO World Heritage site, traditional 
    village visits, and explore the ancient stone circles at Wassu. 
    
    Relax on beautiful beaches along the Atlantic coast and enjoy 
    the tropical sun at our beachfront resorts. Perfect for nature 
    lovers and cultural enthusiasts.
    
    Experience traditional music and drumming performances, visit 
    local craft markets to see artisans create beautiful handmade 
    textiles and wood carvings. Don't miss the National Museum in 
    Banjul showcasing Gambian heritage and history.
    """
    
    print("=" * 70)
    print("ACTIVITY EXTRACTOR TEST - Binary Detection (Yes/No)")
    print("=" * 70)
    
    extractor = ActivityExtractor()
    activities = extractor.extract_all_activities(sample_content)
    
    print("\n📊 ACTIVITY PRESENCE SUMMARY")
    print("-" * 70)
    print(f"Total Activities Present: {activities.count_present()}/12")
    print(f"Tourism Core: {activities.tourism_core_count()}/4")
    print(f"Creative Industries: {activities.creative_industries_count()}/8")
    
    print("\n🏖️  TOURISM CORE")
    print("-" * 70)
    print(f"Sun & Beach:           {'✅ Yes' if activities.sun_beach else '❌ No'}")
    print(f"Nature & Wildlife:     {'✅ Yes' if activities.nature_wildlife else '❌ No'}")
    print(f"Adventure:             {'✅ Yes' if activities.adventure else '❌ No'}")
    print(f"Culture & Heritage:    {'✅ Yes' if activities.culture_heritage else '❌ No'}")
    
    print("\n🎨 CREATIVE INDUSTRIES")
    print("-" * 70)
    print(f"Festivals & Events:              {'✅ Yes' if activities.festivals_events else '❌ No'}")
    print(f"Audiovisual:                     {'✅ Yes' if activities.audiovisual else '❌ No'}")
    print(f"Marketing/Advertising/Publishing: {'✅ Yes' if activities.marketing_advertising_publishing else '❌ No'}")
    print(f"Crafts & Artisan:                {'✅ Yes' if activities.crafts_artisan else '❌ No'}")
    print(f"Fashion & Design:                {'✅ Yes' if activities.fashion_design else '❌ No'}")
    print(f"Music:                           {'✅ Yes' if activities.music else '❌ No'}")
    print(f"Performing & Visual Arts:        {'✅ Yes' if activities.performing_visual_arts else '❌ No'}")
    print(f"Heritage Sites & Museums:        {'✅ Yes' if activities.heritage_sites_museums else '❌ No'}")
    
    print("\n📋 DETAILED DETECTION REPORT")
    print("-" * 70)
    report = extractor.get_detection_report(sample_content)
    
    for activity_type, details in report['details'].items():
        if details['present']:
            activity_name = activity_type.replace('_', ' ').title()
            print(f"\n✅ {activity_name}")
            print(f"   Matched {details['match_count']} keywords (threshold: {details['threshold']})")
            print(f"   Keywords: {', '.join(details['matched_keywords'][:5])}")
            if len(details['matched_keywords']) > 5:
                print(f"   ... and {len(details['matched_keywords']) - 5} more")
    
    print("\n" + "=" * 70)
    print("✅ Activity extractor working correctly!")
    print("=" * 70)


if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
    
    # Run test
    test_activity_extractor()
