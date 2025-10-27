#!/usr/bin/env python3
"""
Audience Analyzer
Detects target audiences using sentiment analysis on marketing language
"""

import json
import os
import sys
from typing import Dict, List, Tuple
import logging

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

logger = logging.getLogger(__name__)


class AudienceAnalyzer:
    """Analyzes marketing language to identify target audiences"""
    
    def __init__(self, config_path: str = None):
        if config_path is None:
            config_path = os.path.join(
                os.path.dirname(__file__),
                '../../data/config/audience_indicators.json'
            )
        
        with open(config_path, 'r', encoding='utf-8') as f:
            self.config = json.load(f)
        
        self.audiences = self.config['audience_types']
        self.thresholds = self.config['detection_rules']['min_keyword_matches']
        self.confidence_threshold = self.config['detection_rules']['confidence_threshold']
        self.max_audiences = self.config['detection_rules']['max_audiences_per_ito']
        self.weights = self.config['scoring_weights']
    
    def identify_audiences(self, content: str) -> Tuple[List[str], Dict[str, float]]:
        """
        Identify target audiences from content
        
        Returns:
            - List of audience types (up to max_audiences)
            - Dict of confidence scores for each audience
        """
        content_lower = content.lower()
        
        # Calculate confidence scores for all audiences
        all_scores = {}
        for audience_type in self.audiences.keys():
            score = self._calculate_audience_score(content_lower, audience_type)
            all_scores[audience_type] = score
        
        # Filter by confidence threshold and select top audiences
        qualified_audiences = {
            aud: score for aud, score in all_scores.items()
            if score >= self.confidence_threshold
        }
        
        # Sort by confidence and take top N
        sorted_audiences = sorted(
            qualified_audiences.items(),
            key=lambda x: x[1],
            reverse=True
        )[:self.max_audiences]
        
        # Extract audience names and scores
        audience_names = [aud for aud, score in sorted_audiences]
        confidence_scores = dict(sorted_audiences)
        
        return audience_names, all_scores
    
    def _calculate_audience_score(self, content: str, audience_type: str) -> float:
        """
        Calculate confidence score for an audience type (0.0 - 1.0)
        
        Scoring based on:
        - Keyword matches (40%)
        - Tone word matches (30%)
        - Activity mentions (20%)
        - Negative indicators penalty (10%)
        """
        audience_config = self.audiences[audience_type]
        
        # 1. Keyword match score (40%)
        keywords = audience_config['keywords']
        keyword_matches = sum(1 for kw in keywords if kw in content)
        keyword_score = min(keyword_matches / len(keywords), 1.0)
        
        # 2. Tone word match score (30%)
        tone_words = audience_config['tone_words']
        tone_matches = sum(1 for tw in tone_words if tw in content)
        tone_score = min(tone_matches / len(tone_words), 1.0) if tone_words else 0
        
        # 3. Activity match score (20%)
        activities = audience_config.get('activities', [])
        activity_matches = sum(1 for act in activities if act in content)
        activity_score = min(activity_matches / len(activities), 1.0) if activities else 0
        
        # 4. Negative indicator penalty (10%)
        negative_indicators = audience_config.get('negative_indicators', [])
        negative_matches = sum(1 for neg in negative_indicators if neg in content)
        negative_penalty = min(negative_matches * 0.3, 1.0)  # Each match = 30% penalty
        
        # Calculate weighted score
        weighted_score = (
            keyword_score * self.weights['keyword_match'] +
            tone_score * self.weights['tone_match'] +
            activity_score * self.weights['activity_match']
        )
        
        # Apply negative penalty
        final_score = max(weighted_score - (negative_penalty * self.weights['negative_penalty']), 0.0)
        
        # Apply audience-specific weight
        audience_weight = audience_config.get('weight', 1.0)
        final_score = min(final_score * audience_weight, 1.0)
        
        return round(final_score, 3)
    
    def get_detection_report(self, content: str) -> Dict:
        """
        Get detailed detection report for all audiences
        
        Returns comprehensive analysis with matched keywords, scores, etc.
        """
        content_lower = content.lower()
        
        audience_names, all_scores = self.identify_audiences(content)
        
        report = {
            'identified_audiences': audience_names,
            'confidence_threshold': self.confidence_threshold,
            'details': {}
        }
        
        # Get details for each audience
        for audience_type, audience_config in self.audiences.items():
            score = all_scores[audience_type]
            
            # Get matched elements
            keywords = audience_config['keywords']
            tone_words = audience_config['tone_words']
            activities = audience_config.get('activities', [])
            negatives = audience_config.get('negative_indicators', [])
            
            matched_keywords = [kw for kw in keywords if kw in content_lower]
            matched_tone = [tw for tw in tone_words if tw in content_lower]
            matched_activities = [act for act in activities if act in content_lower]
            matched_negatives = [neg for neg in negatives if neg in content_lower]
            
            is_identified = audience_type in audience_names
            
            report['details'][audience_type] = {
                'confidence_score': score,
                'identified': is_identified,
                'matched_keywords': matched_keywords[:5],  # Top 5
                'matched_tone': matched_tone[:3],  # Top 3
                'matched_activities': matched_activities[:3],  # Top 3
                'negative_indicators': matched_negatives,
                'total_keyword_matches': len(matched_keywords),
                'verdict': '✅ Identified' if is_identified else '❌ Not identified'
            }
        
        return report
    
    def get_matched_keywords(self, content: str, audience_type: str) -> Dict[str, List[str]]:
        """Get all matched keywords for a specific audience"""
        content_lower = content.lower()
        
        if audience_type not in self.audiences:
            return {}
        
        audience_config = self.audiences[audience_type]
        
        return {
            'keywords': [kw for kw in audience_config['keywords'] if kw in content_lower],
            'tone_words': [tw for tw in audience_config['tone_words'] if tw in content_lower],
            'activities': [act for act in audience_config.get('activities', []) if act in content_lower],
            'negatives': [neg for neg in audience_config.get('negative_indicators', []) if neg in content_lower]
        }


def test_audience_analyzer():
    """Test the audience analyzer with sample content"""
    
    # Sample content targeting different audiences
    sample_contents = {
        "Adventure Tour": """
        Join us for an exciting adventure through The Gambia! This thrilling 
        expedition includes kayaking on the Gambia River, trekking through 
        nature reserves, and challenging outdoor activities. Perfect for active 
        travelers seeking an adrenaline-filled African adventure. Our guided 
        safari tours will take you off the beaten path to discover hidden gems.
        """,
        
        "Heritage Tour": """
        Embark on a meaningful roots journey to The Gambia, retracing the steps 
        of your African ancestors. Visit Kunta Kinteh Island, a UNESCO World 
        Heritage Site, and explore the profound history of the transatlantic 
        slave trade. This emotional heritage tour connects African Americans 
        with their ancestral homeland through genealogy research and village 
        visits. Experience the spiritual significance of returning to your roots.
        """,
        
        "Family Holiday": """
        Perfect family holiday in The Gambia! Our family-friendly resort offers 
        activities suitable for all ages - from beach fun for the kids to gentle 
        nature walks everyone can enjoy. Safe, educational, and fun for the whole 
        family including children and grandparents. Enjoy our swimming pool, 
        playground, and family rooms. A wonderful multi-generational vacation.
        """,
        
        "Luxury Escape": """
        Indulge in an exclusive luxury experience at The Gambia's finest 5-star 
        boutique resorts. Enjoy private tours with your personal concierge, 
        bespoke itineraries tailored to your preferences, and world-class spa 
        treatments. Premium accommodation, fine dining, and sophisticated service 
        await at our deluxe beachfront properties. VIP transfers and butler 
        service included.
        """
    }
    
    print("=" * 70)
    print("AUDIENCE ANALYZER TEST - Target Audience Detection")
    print("=" * 70)
    
    analyzer = AudienceAnalyzer()
    
    for tour_type, content in sample_contents.items():
        print(f"\n{'─' * 70}")
        print(f"📄 Sample: {tour_type}")
        print("─" * 70)
        
        # Identify audiences
        audiences, all_scores = analyzer.identify_audiences(content)
        
        print(f"\n🎯 IDENTIFIED AUDIENCES: {len(audiences)}")
        for i, audience in enumerate(audiences, 1):
            score = all_scores[audience]
            print(f"  {i}. {audience.replace('_', ' ').title()}: {score:.1%} confidence")
        
        if not audiences:
            print("  No audiences identified above confidence threshold")
        
        # Show top 5 scores
        print(f"\n📊 TOP 5 CONFIDENCE SCORES:")
        sorted_scores = sorted(all_scores.items(), key=lambda x: x[1], reverse=True)[:5]
        for audience, score in sorted_scores:
            emoji = "✅" if audience in audiences else "  "
            print(f"  {emoji} {audience.replace('_', ' ').title():30} {score:.1%}")
    
    # Detailed report for one example
    print(f"\n{'=' * 70}")
    print("DETAILED DETECTION REPORT - Heritage Tour Example")
    print("=" * 70)
    
    report = analyzer.get_detection_report(sample_contents["Heritage Tour"])
    
    print(f"\n🎯 Identified Audiences: {', '.join([a.replace('_', ' ').title() for a in report['identified_audiences']])}")
    print(f"📊 Confidence Threshold: {report['confidence_threshold']:.0%}")
    
    # Show details for identified audiences
    print(f"\n📋 DETAILS FOR IDENTIFIED AUDIENCES:")
    for audience in report['identified_audiences']:
        details = report['details'][audience]
        print(f"\n  ✅ {audience.replace('_', ' ').title()}")
        print(f"     Confidence: {details['confidence_score']:.1%}")
        print(f"     Keywords matched: {details['total_keyword_matches']}")
        if details['matched_keywords']:
            print(f"     Sample keywords: {', '.join(details['matched_keywords'][:3])}")
        if details['matched_tone']:
            print(f"     Tone words: {', '.join(details['matched_tone'])}")
    
    print("\n" + "=" * 70)
    print("✅ Audience analyzer working correctly!")
    print("=" * 70)


if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
    
    # Run test
    test_audience_analyzer()
