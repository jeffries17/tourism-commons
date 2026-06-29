#!/usr/bin/env python3
"""
Data models for enhanced ITOS assessment system
Structured framework for analyzing tour operator Gambia offerings
"""

from dataclasses import dataclass, field, asdict
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import json


class VisibilityLevel(Enum):
    """How visible is Gambia in the site navigation"""
    MAIN_MENU = "Main menu"
    SUBMENU = "Submenu"
    SEARCH_ONLY = "Only via search"
    FEATURED = "Featured"
    UNKNOWN = "Unknown"


class ProductType(Enum):
    """Type of tourism product offered"""
    FLIGHT_HOTEL = "Flight+Hotel"
    ITINERARY = "Itinerary"
    TAILOR_MADE = "Tailor-made"
    MIXED = "Mixed"
    UNKNOWN = "Unknown"


class DetailLevel(Enum):
    """Level of itinerary detail provided"""
    DAY_BY_DAY = "Day-by-day"
    MULTI_DAY_OVERVIEW = "Multi-day overview"
    SUMMARY_ONLY = "Summary only"
    NOT_APPLICABLE = "N/A"


class BookingPathway(Enum):
    """How customers can book the tour"""
    ONLINE_BOOKABLE = "Online bookable"
    ENQUIRY_ONLY = "Enquiry-only"
    PRICE_ON_REQUEST = "Price on request"
    MIXED = "Mixed"
    UNKNOWN = "Unknown"


class MediaQuality(Enum):
    """Quality and specificity of visual media"""
    DESTINATION_SPECIFIC = "Destination-specific"
    STOCK_PHOTOS = "Stock photos"
    MIXED = "Mixed"
    POOR = "Poor"
    UNKNOWN = "Unknown"


class PriceTransparency(Enum):
    """How clearly pricing is displayed"""
    CLEAR_PACKAGES = "Clear packages"
    SEASONAL_RANGES = "Seasonal ranges"
    FROM_PRICING = "From pricing"
    PRICE_ON_REQUEST = "Price on request"
    UNKNOWN = "Unknown"


# Target audience types
AUDIENCE_TYPES = [
    'families',
    'older_couples',
    'backpackers',
    'adventure_travellers',
    'diaspora_heritage',
    'luxury_travellers',
    'groups',
    'students'
]


@dataclass
class ActivityPresence:
    """Binary flags for activity presence (Yes/No)
    
    Tourism Core activities and Creative Industries breakdown
    aligned with diagnostic framework
    """
    # Tourism Core
    sun_beach: bool = False
    nature_wildlife: bool = False
    adventure: bool = False
    culture_heritage: bool = False
    
    # Creative Industries (detailed breakdown)
    festivals_events: bool = False
    audiovisual: bool = False
    marketing_advertising_publishing: bool = False
    crafts_artisan: bool = False
    fashion_design: bool = False
    music: bool = False
    performing_visual_arts: bool = False
    heritage_sites_museums: bool = False
    
    def to_dict(self) -> Dict[str, bool]:
        """Convert to dictionary"""
        return asdict(self)
    
    def count_present(self) -> int:
        """Count how many activities are present"""
        return sum(1 for v in self.to_dict().values() if v)
    
    def get_present_activities(self) -> List[str]:
        """Get list of present activities"""
        return [
            activity.replace('_', ' ').title()
            for activity, present in self.to_dict().items()
            if present
        ]
    
    def tourism_core_count(self) -> int:
        """Count tourism core activities"""
        return sum([
            self.sun_beach,
            self.nature_wildlife,
            self.adventure,
            self.culture_heritage
        ])
    
    def creative_industries_count(self) -> int:
        """Count creative industries activities"""
        return sum([
            self.festivals_events,
            self.audiovisual,
            self.marketing_advertising_publishing,
            self.crafts_artisan,
            self.fashion_design,
            self.music,
            self.performing_visual_arts,
            self.heritage_sites_museums
        ])


@dataclass
class ItineraryDepth:
    """Itinerary analysis results"""
    gambia_percentage: Optional[float] = None  # 0-100
    detail_level: DetailLevel = DetailLevel.NOT_APPLICABLE
    total_days: Optional[int] = None
    countries_breakdown: Dict[str, int] = field(default_factory=dict)
    has_multi_country: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'gambia_percentage': self.gambia_percentage,
            'detail_level': self.detail_level.value,
            'total_days': self.total_days,
            'countries_breakdown': self.countries_breakdown,
            'has_multi_country': self.has_multi_country
        }


@dataclass
class MediaPresentation:
    """Media and digital presentation analysis"""
    quality: MediaQuality = MediaQuality.UNKNOWN
    has_ugc_testimonials: bool = False
    has_tripadvisor: bool = False
    image_count: int = 0
    video_count: int = 0
    has_destination_specific_images: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'quality': self.quality.value,
            'has_ugc_testimonials': self.has_ugc_testimonials,
            'has_tripadvisor': self.has_tripadvisor,
            'image_count': self.image_count,
            'video_count': self.video_count,
            'has_destination_specific_images': self.has_destination_specific_images
        }


@dataclass
class LocalIntegration:
    """Local partnerships and integration"""
    hotels_mentioned: List[str] = field(default_factory=list)
    attractions_mentioned: List[str] = field(default_factory=list)
    dmc_mentioned: List[str] = field(default_factory=list)
    has_local_partnerships: bool = False
    integration_score: int = 0  # 0-5
    
    def calculate_score(self) -> int:
        """Calculate integration score based on mentions"""
        score = 0
        score += min(len(self.hotels_mentioned), 2)  # Max 2 points
        score += min(len(self.attractions_mentioned), 2)  # Max 2 points
        score += 1 if self.dmc_mentioned else 0  # Max 1 point
        return min(score, 5)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'hotels_mentioned': self.hotels_mentioned,
            'attractions_mentioned': self.attractions_mentioned,
            'dmc_mentioned': self.dmc_mentioned,
            'has_local_partnerships': self.has_local_partnerships,
            'integration_score': self.integration_score
        }


@dataclass
class ITOAssessment:
    """Complete ITO assessment results"""
    
    # Basic info (required)
    operator_name: str
    country_region: str = ""
    website_url: str = ""
    gambia_page_url: str = ""
    gambia_tour_pages: List[str] = field(default_factory=list)
    
    # Structural analysis
    visibility_navigation: VisibilityLevel = VisibilityLevel.UNKNOWN
    product_type: ProductType = ProductType.UNKNOWN
    itinerary_depth: ItineraryDepth = field(default_factory=ItineraryDepth)
    
    # Activities (binary presence flags)
    activities: ActivityPresence = field(default_factory=ActivityPresence)
    
    # Audience targeting
    target_audiences: List[str] = field(default_factory=list)
    audience_confidence_scores: Dict[str, float] = field(default_factory=dict)
    
    # Booking & pricing
    booking_pathway: BookingPathway = BookingPathway.UNKNOWN
    price_transparency: PriceTransparency = PriceTransparency.UNKNOWN
    
    # Media
    media_presentation: MediaPresentation = field(default_factory=MediaPresentation)
    
    # Localization
    languages_available: List[str] = field(default_factory=list)
    local_integration: LocalIntegration = field(default_factory=LocalIntegration)
    
    # Seasonality
    seasonality_framing: List[str] = field(default_factory=list)
    
    # Metadata
    last_scraped: datetime = field(default_factory=datetime.now)
    scrape_status: str = "Pending"
    scrape_errors: List[str] = field(default_factory=list)
    
    # Raw content for reference
    raw_content_length: int = 0
    
    def to_sheets_row(self) -> List[Any]:
        """Convert to Google Sheets row format"""
        return [
            self.operator_name,
            self.country_region,
            self.website_url,
            self.gambia_page_url,
            ', '.join(self.gambia_tour_pages) if self.gambia_tour_pages else '',
            self.visibility_navigation.value,
            self.product_type.value,
            f"{self.itinerary_depth.gambia_percentage:.0f}%" if self.itinerary_depth.gambia_percentage is not None else "N/A",
            self.itinerary_depth.detail_level.value,
            # Tourism Core (4 columns)
            'Yes' if self.activities.sun_beach else 'No',
            'Yes' if self.activities.nature_wildlife else 'No',
            'Yes' if self.activities.adventure else 'No',
            'Yes' if self.activities.culture_heritage else 'No',
            # Creative Industries (8 columns)
            'Yes' if self.activities.festivals_events else 'No',
            'Yes' if self.activities.audiovisual else 'No',
            'Yes' if self.activities.marketing_advertising_publishing else 'No',
            'Yes' if self.activities.crafts_artisan else 'No',
            'Yes' if self.activities.fashion_design else 'No',
            'Yes' if self.activities.music else 'No',
            'Yes' if self.activities.performing_visual_arts else 'No',
            'Yes' if self.activities.heritage_sites_museums else 'No',
            # Audience & Booking
            ', '.join(self.target_audiences) if self.target_audiences else '',
            self.booking_pathway.value,
            # Media
            self.media_presentation.quality.value,
            'Yes' if self.media_presentation.has_ugc_testimonials else 'No',
            'Yes' if self.media_presentation.has_tripadvisor else 'No',
            # Pricing & Localization
            self.price_transparency.value,
            ', '.join(self.languages_available) if self.languages_available else '',
            self._format_partnerships(),
            ', '.join(self.seasonality_framing) if self.seasonality_framing else '',
            # Metadata
            self.last_scraped.strftime('%Y-%m-%d %H:%M:%S'),
            self.scrape_status
        ]
    
    def _format_partnerships(self) -> str:
        """Format local partnerships for display"""
        partnerships = []
        partnerships.extend(self.local_integration.hotels_mentioned)
        partnerships.extend(self.local_integration.attractions_mentioned)
        partnerships.extend(self.local_integration.dmc_mentioned)
        return ', '.join(partnerships) if partnerships else ''
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'operator_name': self.operator_name,
            'country_region': self.country_region,
            'website_url': self.website_url,
            'gambia_page_url': self.gambia_page_url,
            'gambia_tour_pages': self.gambia_tour_pages,
            'visibility_navigation': self.visibility_navigation.value,
            'product_type': self.product_type.value,
            'itinerary_depth': self.itinerary_depth.to_dict(),
            'activities': self.activities.to_dict(),
            'target_audiences': self.target_audiences,
            'audience_confidence_scores': self.audience_confidence_scores,
            'booking_pathway': self.booking_pathway.value,
            'price_transparency': self.price_transparency.value,
            'media_presentation': self.media_presentation.to_dict(),
            'languages_available': self.languages_available,
            'local_integration': self.local_integration.to_dict(),
            'seasonality_framing': self.seasonality_framing,
            'last_scraped': self.last_scraped.isoformat(),
            'scrape_status': self.scrape_status,
            'scrape_errors': self.scrape_errors,
            'raw_content_length': self.raw_content_length
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ITOAssessment':
        """Create ITOAssessment from dictionary"""
        # Convert nested objects
        if 'itinerary_depth' in data and isinstance(data['itinerary_depth'], dict):
            data['itinerary_depth'] = ItineraryDepth(**data['itinerary_depth'])
        
        if 'activities' in data and isinstance(data['activities'], dict):
            data['activities'] = ActivityPresence(**data['activities'])
        
        if 'media_presentation' in data and isinstance(data['media_presentation'], dict):
            data['media_presentation'] = MediaPresentation(**data['media_presentation'])
        
        if 'local_integration' in data and isinstance(data['local_integration'], dict):
            data['local_integration'] = LocalIntegration(**data['local_integration'])
        
        # Convert enums
        if 'visibility_navigation' in data and isinstance(data['visibility_navigation'], str):
            data['visibility_navigation'] = VisibilityLevel(data['visibility_navigation'])
        
        if 'product_type' in data and isinstance(data['product_type'], str):
            data['product_type'] = ProductType(data['product_type'])
        
        if 'booking_pathway' in data and isinstance(data['booking_pathway'], str):
            data['booking_pathway'] = BookingPathway(data['booking_pathway'])
        
        if 'price_transparency' in data and isinstance(data['price_transparency'], str):
            data['price_transparency'] = PriceTransparency(data['price_transparency'])
        
        return cls(**data)
    
    def save_json(self, filepath: str):
        """Save assessment to JSON file"""
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(self.to_dict(), f, indent=2, ensure_ascii=False)
    
    @classmethod
    def load_json(cls, filepath: str) -> 'ITOAssessment':
        """Load assessment from JSON file"""
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return cls.from_dict(data)
    
    def get_summary(self) -> Dict[str, Any]:
        """Get a human-readable summary"""
        return {
            'operator': self.operator_name,
            'country': self.country_region,
            'visibility': self.visibility_navigation.value,
            'product_type': self.product_type.value,
            'activities_present': self.activities.get_present_activities(),
            'activities_count': self.activities.count_present(),
            'tourism_core_count': self.activities.tourism_core_count(),
            'creative_industries_count': self.activities.creative_industries_count(),
            'target_audiences': self.target_audiences,
            'booking': self.booking_pathway.value,
            'languages': len(self.languages_available),
            'local_partnerships': len(self.local_integration.hotels_mentioned + 
                                    self.local_integration.attractions_mentioned),
            'status': self.scrape_status
        }


# Google Sheets column headers (32 columns total)
SHEETS_HEADERS = [
    # Basic Info (5 columns)
    'Operator Name',
    'Country / Region',
    'Website URL',
    'Gambia Page URL',
    'Gambia Tour Pages',
    # Structure (4 columns)
    'Visibility & Navigation',
    'Product Type',
    'Itinerary Depth - % Gambia',
    'Itinerary Depth - Detail Level',
    # Tourism Core Activities (4 columns)
    'Sun & Beach',
    'Nature & Wildlife',
    'Adventure',
    'Culture & Heritage',
    # Creative Industries (8 columns)
    'Festivals & Cultural Events',
    'Audiovisual (Film/Photo/TV/Video)',
    'Marketing/Advertising/Publishing',
    'Crafts & Artisan Products',
    'Fashion & Design',
    'Music',
    'Performing & Visual Arts',
    'Heritage Sites & Museums',
    # Audience & Booking (2 columns)
    'Positioning & Target Audience',
    'Booking Pathway',
    # Media (3 columns)
    'Media Quality',
    'Media - UGC/Testimonials',
    'Media - TripAdvisor Integration',
    # Pricing & Localization (4 columns)
    'Price Transparency',
    'Language Availability',
    'Local Partnerships',
    'Seasonality Framing',
    # Metadata (2 columns)
    'Last Scraped',
    'Scrape Status'
]


def create_sample_assessment() -> ITOAssessment:
    """Create a sample assessment for testing"""
    assessment = ITOAssessment(
        operator_name="Adventure Life",
        country_region="United States",
        website_url="https://www.adventure-life.com",
        gambia_page_url="https://www.adventure-life.com/africa/gambia",
        gambia_tour_pages=["https://www.adventure-life.com/africa/gambia/tours/gambia-senegal-adventure"],
        visibility_navigation=VisibilityLevel.SUBMENU,
        product_type=ProductType.ITINERARY,
    )
    
    assessment.itinerary_depth = ItineraryDepth(
        gambia_percentage=60.0,
        detail_level=DetailLevel.DAY_BY_DAY,
        total_days=10,
        countries_breakdown={'Gambia': 6, 'Senegal': 4},
        has_multi_country=True
    )
    
    assessment.activities = ActivityPresence(
        # Tourism Core
        sun_beach=True,
        nature_wildlife=True,
        adventure=True,
        culture_heritage=True,
        # Creative Industries
        festivals_events=False,
        audiovisual=False,
        marketing_advertising_publishing=False,
        crafts_artisan=True,
        fashion_design=False,
        music=True,
        performing_visual_arts=False,
        heritage_sites_museums=True
    )
    
    assessment.target_audiences = ['adventure_travellers', 'older_couples']
    assessment.audience_confidence_scores = {
        'adventure_travellers': 0.85,
        'older_couples': 0.65
    }
    
    assessment.booking_pathway = BookingPathway.ENQUIRY_ONLY
    assessment.price_transparency = PriceTransparency.FROM_PRICING
    
    assessment.media_presentation = MediaPresentation(
        quality=MediaQuality.DESTINATION_SPECIFIC,
        has_ugc_testimonials=True,
        has_tripadvisor=False,
        image_count=12,
        video_count=0,
        has_destination_specific_images=True
    )
    
    assessment.languages_available = ['en']
    
    assessment.local_integration = LocalIntegration(
        hotels_mentioned=['Mandina Lodges', 'Ngala Lodge'],
        attractions_mentioned=['Abuko Nature Reserve', 'Kunta Kinteh Island'],
        integration_score=4
    )
    
    assessment.seasonality_framing = ['winter_sun', 'dry_season']
    assessment.scrape_status = "Success"
    
    return assessment


if __name__ == "__main__":
    # Test the data models
    print("Creating sample assessment...")
    assessment = create_sample_assessment()
    
    print("\n=== Assessment Summary ===")
    print(json.dumps(assessment.get_summary(), indent=2))
    
    print("\n=== Google Sheets Row ===")
    print(assessment.to_sheets_row())
    
    print("\n=== Saving to JSON ===")
    assessment.save_json('/tmp/sample_ito_assessment.json')
    print("Saved to /tmp/sample_ito_assessment.json")
    
    print("\n=== Loading from JSON ===")
    loaded = ITOAssessment.load_json('/tmp/sample_ito_assessment.json')
    print(f"Loaded: {loaded.operator_name}")
    
    print("\n✅ Data models working correctly!")
