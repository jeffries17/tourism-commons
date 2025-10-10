#!/usr/bin/env python3
"""
Weighted Scoring System v2.0
Standardized 10-point raw scores with sector-specific weighting
"""

import json
import os
from dataclasses import dataclass, asdict
from typing import Dict, Optional, List
from datetime import datetime


@dataclass
class RawScores:
    """
    Uniform raw assessment (0-10 per category)
    Same criteria for everyone, regardless of sector
    """
    social_media: float  # 0-10
    website: float  # 0-10
    visual_content: float  # 0-10
    discoverability: float  # 0-10
    digital_sales: float  # 0-10
    platform_integration: float  # 0-10
    
    def to_dict(self) -> Dict[str, float]:
        return asdict(self)
    
    def total(self) -> float:
        """Sum of all raw scores (max 60)"""
        return sum(self.to_dict().values())


@dataclass
class WeightedScores:
    """
    Sector-specific weighted scores
    Raw scores multiplied by sector weights to reach 70 total
    """
    social_media: float
    website: float
    visual_content: float
    discoverability: float
    digital_sales: float
    platform_integration: float
    external_total: float  # Sum of weighted scores (0-70)
    
    def to_dict(self) -> Dict[str, float]:
        return {
            'social_media': round(self.social_media, 1),
            'website': round(self.website, 1),
            'visual_content': round(self.visual_content, 1),
            'discoverability': round(self.discoverability, 1),
            'digital_sales': round(self.digital_sales, 1),
            'platform_integration': round(self.platform_integration, 1),
            'external_total': round(self.external_total, 1)
        }


@dataclass
class CombinedScore:
    """
    Complete assessment including optional survey
    """
    raw_scores: RawScores
    weighted_scores: WeightedScores
    external_total: float  # 0-70
    survey_total: Optional[float]  # 0-30 or None
    combined_score: float  # external + survey
    max_possible: float  # 70 or 100
    percentage: float  # score as percentage of max
    has_survey: bool
    sector: str
    
    def to_dict(self) -> Dict:
        return {
            'raw_scores': self.raw_scores.to_dict(),
            'weighted_scores': self.weighted_scores.to_dict(),
            'external_total': round(self.external_total, 1),
            'survey_total': round(self.survey_total, 1) if self.survey_total else None,
            'combined_score': round(self.combined_score, 1),
            'max_possible': self.max_possible,
            'percentage': round(self.percentage, 1),
            'has_survey': self.has_survey,
            'sector': self.sector
        }


class SectorWeightCalculator:
    """
    Calculates weighted scores based on sector-specific priorities
    """
    
    def __init__(self, config_path: Optional[str] = None):
        if config_path is None:
            # Default to config file location
            config_path = os.path.join(
                os.path.dirname(__file__),
                '../data/config/scoring_weights_v2.json'
            )
        
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        
        self.sector_weights = self.config['sector_weights']
        self.default_weights = self.config['default_weights']
        self.categories = list(self.config['categories'].keys())
    
    def get_sector_weights(self, sector: str) -> Dict[str, float]:
        """
        Get weights for a specific sector
        
        Args:
            sector: Business sector name
        
        Returns:
            Dictionary of category weights
        """
        # Try exact match first
        if sector in self.sector_weights:
            weights = self.sector_weights[sector]
            return {cat: weights[cat] for cat in self.categories}
        
        # Try case-insensitive match
        sector_lower = sector.lower()
        for key in self.sector_weights.keys():
            if key.lower() == sector_lower:
                weights = self.sector_weights[key]
                return {cat: weights[cat] for cat in self.categories}
        
        # Return default weights if no match
        print(f"Warning: Unknown sector '{sector}', using default weights")
        return {cat: self.default_weights[cat] for cat in self.categories}
    
    def apply_weights(
        self, 
        raw_scores: RawScores, 
        sector: str
    ) -> WeightedScores:
        """
        Apply sector-specific weights to raw scores
        
        Args:
            raw_scores: Raw 0-10 scores (same for everyone)
            sector: Business sector (e.g., "Creative Industries")
        
        Returns:
            Weighted scores totaling up to 70 points
        
        Example:
            raw = RawScores(social_media=8, website=5, ...)
            weighted = calculator.apply_weights(raw, "Creative Industries")
            # raw 8 × weight 2.2 = 17.6/22 weighted points
        """
        weights = self.get_sector_weights(sector)
        raw_dict = raw_scores.to_dict()
        
        # Apply weights to each category
        weighted = {
            cat: raw_dict[cat] * weights[cat]
            for cat in self.categories
        }
        
        external_total = sum(weighted.values())
        
        return WeightedScores(
            social_media=weighted['social_media'],
            website=weighted['website'],
            visual_content=weighted['visual_content'],
            discoverability=weighted['discoverability'],
            digital_sales=weighted['digital_sales'],
            platform_integration=weighted['platform_integration'],
            external_total=external_total
        )
    
    def calculate_combined_score(
        self, 
        raw_scores: RawScores, 
        sector: str, 
        survey_score: Optional[float] = None
    ) -> CombinedScore:
        """
        Calculate complete assessment with optional survey
        
        Args:
            raw_scores: Raw 0-10 scores per category
            sector: Business sector for weighting
            survey_score: Optional survey score (0-30)
        
        Returns:
            Complete scoring breakdown
        
        Example:
            result = calculator.calculate_combined_score(
                raw_scores=RawScores(8, 5, 9, 6, 3, 4),
                sector="Creative Industries",
                survey_score=22  # Optional
            )
            print(f"Score: {result.combined_score}/{result.max_possible}")
        """
        # Apply sector weights
        weighted = self.apply_weights(raw_scores, sector)
        
        # Survey is optional (0-30 points)
        survey_total = survey_score if survey_score is not None else 0
        
        # Combined score
        combined = weighted.external_total + survey_total
        
        # Calculate as percentage of maximum possible
        max_possible = 70 if survey_score is None else 100
        percentage = (combined / max_possible) * 100 if max_possible > 0 else 0
        
        return CombinedScore(
            raw_scores=raw_scores,
            weighted_scores=weighted,
            external_total=weighted.external_total,
            survey_total=survey_total if survey_score is not None else None,
            combined_score=combined,
            max_possible=max_possible,
            percentage=percentage,
            has_survey=survey_score is not None,
            sector=sector
        )
    
    def get_sector_info(self, sector: str) -> Dict:
        """Get detailed information about a sector's weights"""
        if sector in self.sector_weights:
            return self.sector_weights[sector]
        return self.default_weights
    
    def list_sectors(self) -> List[str]:
        """Get list of all defined sectors"""
        return list(self.sector_weights.keys())


def compare_sectors(
    raw_scores: RawScores, 
    sectors: List[str],
    calculator: Optional[SectorWeightCalculator] = None
) -> Dict[str, float]:
    """
    Compare how the same raw scores would be weighted across different sectors
    
    Useful for understanding sector weight impact
    
    Args:
        raw_scores: Raw scores to compare
        sectors: List of sectors to compare
        calculator: Optional calculator instance
    
    Returns:
        Dictionary mapping sector names to external totals
    
    Example:
        raw = RawScores(8, 5, 9, 6, 3, 4)
        comparison = compare_sectors(raw, [
            "Creative Industries",
            "Tour Operators", 
            "Hotels/Lodging"
        ])
        # Shows how same performance scores differently per sector
    """
    if calculator is None:
        calculator = SectorWeightCalculator()
    
    results = {}
    for sector in sectors:
        weighted = calculator.apply_weights(raw_scores, sector)
        results[sector] = weighted.external_total
    
    return results


# Example usage and testing
if __name__ == '__main__':
    print("=" * 80)
    print("Weighted Scoring System v2.0 - Examples")
    print("=" * 80)
    
    calculator = SectorWeightCalculator()
    
    # Example 1: Creative Industries stakeholder
    print("\n📱 Example 1: Creative Industries (Batik Artist)")
    print("-" * 80)
    
    raw_scores = RawScores(
        social_media=8,      # Strong Instagram presence
        website=5,           # Basic site
        visual_content=9,    # Excellent photos
        discoverability=6,   # Some GMB presence
        digital_sales=3,     # WhatsApp only
        platform_integration=4  # Listed on one directory
    )
    
    result = calculator.calculate_combined_score(
        raw_scores=raw_scores,
        sector="Creative Industries",
        survey_score=None  # No survey completed
    )
    
    print(f"Raw Scores (0-10 each):")
    for cat, score in raw_scores.to_dict().items():
        print(f"  {cat}: {score}/10")
    
    print(f"\nWeighted Scores (sector-specific):")
    for cat, score in result.weighted_scores.to_dict().items():
        if cat != 'external_total':
            weight = calculator.get_sector_weights("Creative Industries")[cat]
            print(f"  {cat}: {score:.1f} ({raw_scores.to_dict()[cat]} × {weight})")
    
    print(f"\n✓ External Total: {result.external_total}/70 ({result.percentage:.1f}%)")
    print(f"  Survey: Not completed")
    print(f"  Final Score: {result.combined_score}/70")
    
    # Example 2: Tour Operator with survey
    print("\n\n🚌 Example 2: Tour Operators (with same raw scores)")
    print("-" * 80)
    
    result2 = calculator.calculate_combined_score(
        raw_scores=raw_scores,  # Same raw scores!
        sector="Tour Operators",  # Different weights
        survey_score=22  # Survey completed
    )
    
    print(f"Raw Scores (0-10 each): [SAME AS EXAMPLE 1]")
    
    print(f"\nWeighted Scores (different sector weights):")
    for cat, score in result2.weighted_scores.to_dict().items():
        if cat != 'external_total':
            weight = calculator.get_sector_weights("Tour Operators")[cat]
            print(f"  {cat}: {score:.1f} ({raw_scores.to_dict()[cat]} × {weight})")
    
    print(f"\n✓ External Total: {result2.external_total}/70 ({result2.external_total/70*100:.1f}%)")
    print(f"  Survey: {result2.survey_total}/30")
    print(f"  Combined: {result2.combined_score}/100 ({result2.percentage:.1f}%)")
    
    # Example 3: Sector comparison
    print("\n\n📊 Example 3: Sector Comparison")
    print("-" * 80)
    print("How do the same raw scores rank across different sectors?\n")
    
    sectors_to_compare = [
        "Creative Industries",
        "Tour Operators",
        "Hotels/Lodging",
        "Restaurants"
    ]
    
    comparison = compare_sectors(raw_scores, sectors_to_compare, calculator)
    
    # Sort by score
    sorted_comparison = sorted(comparison.items(), key=lambda x: x[1], reverse=True)
    
    for i, (sector, score) in enumerate(sorted_comparison, 1):
        percentage = (score / 70) * 100
        print(f"{i}. {sector}: {score:.1f}/70 ({percentage:.1f}%)")
    
    print("\n💡 Key Insight: Same performance, different sector priorities!")
    print("   Creative Industries scores highest (values social media & visuals)")
    print("   Tour Operators score lowest (values discoverability more)")
    
    # Example 4: List available sectors
    print("\n\n📋 Available Sectors:")
    print("-" * 80)
    for sector in calculator.list_sectors():
        info = calculator.get_sector_info(sector)
        print(f"  • {sector}")
        print(f"    {info.get('description', '')}")
    
    print("\n" + "=" * 80)
    print("✓ Weighted Scoring System v2.0 ready to use!")
    print("=" * 80)

