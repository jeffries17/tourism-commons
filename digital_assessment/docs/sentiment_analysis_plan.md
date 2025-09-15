# Creative Industries & Tourism Digital Assessment Platform
## Comprehensive Adaptation Plan

Based on my analysis of your current sentiment analyzer system, here's a detailed plan to adapt it for creative industries and tourism digital assessment with Google Sheets integration:

## 🏗️ **Current System Architecture Analysis**

Your existing system has these key components:
- **Data Extraction**: Apify-inspired TripAdvisor extractor with rich JSON output
- **Analysis Engine**: Tourism-specific sentiment analysis with aspect-based scoring
- **API Layer**: Flask-based REST API with Firebase authentication
- **Web Interface**: Streamlit dashboard with modern visualizations
- **Comparison Tools**: Multi-destination analysis and benchmarking

## 🎯 **Adaptation Strategy for Creative Industries**

### **1. Enhanced Data Structure for Creative Industries**

**Current JSON Structure** (from your safari_data.json):
```json
{
  "title": "Review Title",
  "rating": 5,
  "text": "Review content...",
  "user": {
    "userId": "unique_id",
    "name": "User Name",
    "userLocation": {...}
  },
  "placeInfo": {
    "name": "Business Name",
    "category": "Business Type",
    "locationString": "Location"
  }
}
```

**Enhanced Structure for Creative Industries**:
```json
{
  "review_metadata": {
    "source": "tripadvisor|google|facebook|instagram|youtube",
    "platform": "web|mobile|api",
    "language": "en|es|fr|de|...",
    "timestamp": "2025-01-15T10:30:00Z"
  },
  "business_info": {
    "name": "Creative Business Name",
    "category": "art_gallery|music_venue|theater|museum|festival|workshop",
    "subcategory": "contemporary_art|jazz_club|drama_theater|history_museum",
    "location": {
      "address": "Full Address",
      "coordinates": {"lat": 0.0, "lng": 0.0},
      "region": "West Africa",
      "country": "Gambia"
    },
    "creative_attributes": {
      "artistic_discipline": ["visual_arts", "performing_arts"],
      "target_audience": ["local", "tourist", "professional"],
      "price_range": "budget|mid|premium|luxury",
      "accessibility": ["wheelchair_accessible", "hearing_impaired", "visually_impaired"]
    }
  },
  "review_content": {
    "title": "Review Title",
    "text": "Review content...",
    "rating": 5,
    "sentiment_scores": {
      "overall": 0.8,
      "creative_quality": 0.9,
      "accessibility": 0.7,
      "value_for_money": 0.6
    }
  },
  "user_profile": {
    "demographics": {
      "age_group": "25-34",
      "traveler_type": "cultural_tourist|local_enthusiast|professional",
      "nationality": "Switzerland",
      "language_preference": "German"
    },
    "engagement_level": "high|medium|low",
    "review_history": {
      "total_reviews": 15,
      "creative_industry_reviews": 8,
      "average_rating_given": 4.2
    }
  }
}
```

### **2. Creative Industries Analysis Framework**

**New Analysis Categories**:
```python
CREATIVE_INDUSTRIES_ASPECTS = {
    'artistic_quality': {
        'keywords': ['art', 'creative', 'talent', 'skill', 'artistic', 'beautiful', 'inspiring'],
        'sub_aspects': {
            'visual_impact': ['stunning', 'breathtaking', 'mesmerizing', 'captivating'],
            'technical_skill': ['skilled', 'professional', 'expert', 'masterful'],
            'originality': ['unique', 'original', 'innovative', 'creative', 'fresh']
        }
    },
    'cultural_authenticity': {
        'keywords': ['authentic', 'traditional', 'cultural', 'heritage', 'local', 'indigenous'],
        'sub_aspects': {
            'cultural_accuracy': ['accurate', 'authentic', 'traditional', 'genuine'],
            'local_connection': ['local', 'community', 'indigenous', 'native'],
            'educational_value': ['educational', 'informative', 'learning', 'insightful']
        }
    },
    'accessibility_inclusion': {
        'keywords': ['accessible', 'inclusive', 'welcoming', 'diverse', 'accommodating'],
        'sub_aspects': {
            'physical_access': ['wheelchair', 'accessible', 'mobility', 'ramp'],
            'sensory_access': ['audio', 'visual', 'hearing', 'sight'],
            'cultural_access': ['multilingual', 'translation', 'explanation', 'guide']
        }
    },
    'experience_engagement': {
        'keywords': ['interactive', 'engaging', 'immersive', 'participatory', 'hands-on'],
        'sub_aspects': {
            'interactivity': ['interactive', 'hands-on', 'participatory', 'engaging'],
            'educational_depth': ['educational', 'informative', 'detailed', 'comprehensive'],
            'emotional_impact': ['moving', 'inspiring', 'emotional', 'powerful']
        }
    },
    'value_proposition': {
        'keywords': ['value', 'worth', 'price', 'expensive', 'cheap', 'reasonable'],
        'sub_aspects': {
            'price_value': ['expensive', 'cheap', 'reasonable', 'overpriced'],
            'time_value': ['worth', 'waste', 'quick', 'lengthy'],
            'experience_value': ['memorable', 'unforgettable', 'special', 'unique']
        }
    }
}
```

### **3. Google Sheets Integration Architecture**

**Integration Components**:

1. **Google Sheets API Service**:
```python
class GoogleSheetsService:
    def __init__(self, credentials_path, spreadsheet_id):
        self.service = self._authenticate(credentials_path)
        self.spreadsheet_id = spreadsheet_id
    
    def create_analysis_worksheet(self, destination_name, analysis_data):
        """Create a new worksheet for destination analysis"""
        
    def update_metrics_dashboard(self, metrics_data):
        """Update the main metrics dashboard"""
        
    def export_comparison_data(self, comparison_results):
        """Export cross-sector comparison data"""
        
    def sync_review_data(self, reviews_data):
        """Sync raw review data to sheets"""
```

2. **Sheet Structure Design**:
   - **Dashboard Sheet**: Executive summary with key metrics
   - **Individual Analysis Sheets**: One per destination/sector
   - **Comparison Sheet**: Cross-sector analysis
   - **Raw Data Sheet**: All review data for further analysis
   - **Trends Sheet**: Temporal analysis and patterns

### **4. Cross-Sector Analysis Framework**

**Sector Categories**:
```python
CREATIVE_SECTORS = {
    'visual_arts': {
        'galleries': 'art_gallery',
        'museums': 'museum',
        'public_art': 'public_art_space',
        'artisan_workshops': 'craft_workshop'
    },
    'performing_arts': {
        'theaters': 'theater',
        'music_venues': 'music_venue',
        'dance_studios': 'dance_venue',
        'festivals': 'cultural_festival'
    },
    'cultural_heritage': {
        'historic_sites': 'historic_site',
        'cultural_centers': 'cultural_center',
        'traditional_villages': 'heritage_village',
        'museums': 'heritage_museum'
    },
    'creative_services': {
        'design_studios': 'design_studio',
        'photography': 'photography_service',
        'creative_workshops': 'creative_workshop',
        'cultural_tours': 'cultural_tour'
    }
}
```

### **5. Implementation Roadmap**

**Phase 1: Foundation (Weeks 1-2)**
- [ ] Set up Google Sheets API integration
- [ ] Extend data extraction for creative industries
- [ ] Create new analysis framework
- [ ] Build basic Google Sheets export functionality

**Phase 2: Core Analysis (Weeks 3-4)**
- [ ] Implement creative industries sentiment analysis
- [ ] Create cross-sector comparison tools
- [ ] Build automated Google Sheets reporting
- [ ] Add stakeholder-specific dashboards

**Phase 3: Advanced Features (Weeks 5-6)**
- [ ] Implement real-time data synchronization
- [ ] Add predictive analytics capabilities
- [ ] Create custom visualization templates
- [ ] Build stakeholder notification system

**Phase 4: Integration & Deployment (Weeks 7-8)**
- [ ] Integrate with existing tourism board systems
- [ ] Create user management and permissions
- [ ] Deploy to cloud infrastructure
- [ ] Create training materials and documentation

### **6. Google Sheets Integration Details**

**API Endpoints for Sheets Integration**:
```python
@app.route('/api/export-to-sheets', methods=['POST'])
@verify_firebase_token
def export_to_sheets(user_id=None):
    """Export analysis results to Google Sheets"""
    
@app.route('/api/sync-reviews', methods=['POST'])
@verify_firebase_token
def sync_reviews_to_sheets(user_id=None):
    """Sync review data to Google Sheets"""
    
@app.route('/api/create-comparison-sheet', methods=['POST'])
@verify_firebase_token
def create_comparison_sheet(user_id=None):
    """Create cross-sector comparison sheet"""
```

**Sheet Templates**:
1. **Executive Dashboard**: Key metrics, trends, alerts
2. **Sector Analysis**: Individual sector performance
3. **Cross-Sector Comparison**: Benchmarking across sectors
4. **Stakeholder Reports**: Customized views for different stakeholders
5. **Raw Data**: All review data for advanced analysis

### **7. Stakeholder-Specific Features**

**For Individual Stakeholders**:
- Personal dashboard with their sector's performance
- Custom alerts for sentiment changes
- Competitor benchmarking
- Export capabilities for presentations

**For Cross-Sector Analysis**:
- Regional performance comparison
- Sector growth trends
- Resource allocation insights
- Policy impact assessment

### **8. Technical Implementation**

**New Dependencies**:
```txt
google-api-python-client>=2.0.0
google-auth-httplib2>=0.1.0
google-auth-oauthlib>=1.0.0
gspread>=5.0.0
oauth2client>=4.1.3
```

**Configuration**:
```python
GOOGLE_SHEETS_CONFIG = {
    'credentials_path': 'credentials/google_sheets_credentials.json',
    'spreadsheet_id': 'your_spreadsheet_id',
    'worksheet_templates': {
        'dashboard': 'Dashboard',
        'sector_analysis': 'Sector Analysis',
        'comparison': 'Cross-Sector Comparison',
        'raw_data': 'Raw Review Data'
    }
}
```

## 🚀 **IMPLEMENTATION PLAN - Gambia Creative Industries Sentiment Analysis**

### **Phase 1: Local Infrastructure Setup**

#### **1.1 Data Structure & Organization**
```
digital_assessment/
├── sentiment_data/
│   ├── raw_reviews/
│   │   ├── oct_2025/
│   │   │   ├── gambia/
│   │   │   │   ├── wassu_stone_circles/
│   │   │   │   │   ├── tripadvisor_reviews.json
│   │   │   │   │   └── google_reviews.json (future)
│   │   │   │   ├── brikama_woodcarvers_market/
│   │   │   │   │   └── tripadvisor_reviews.json
│   │   │   │   ├── kunta_kinteh_island/
│   │   │   │   │   └── tripadvisor_reviews.json
│   │   │   │   ├── banjul_craft_market/
│   │   │   │   ├── ebunjan_theatre/
│   │   │   │   ├── ebunjan_theatre_company/
│   │   │   │   ├── abuko_nature_reserve/
│   │   │   │   ├── arch_22_museum/
│   │   │   │   ├── senegambia_craft_market/
│   │   │   │   ├── tanji_village_museum/
│   │   │   │   ├── fort_bullen_barra_museum/
│   │   │   │   ├── kachikally_crocodile_pool/
│   │   │   │   ├── bakau_craft_market/
│   │   │   │   ├── national_museum_gambia/
│   │   │   │   └── african_adventure_tours/
│   │   │   ├── senegal/
│   │   │   ├── cape_verde/
│   │   │   ├── ghana/
│   │   │   ├── benin/
│   │   │   └── nigeria/
│   │   └── processed/
│   │       ├── oct_2025_sentiment_analysis.json
│   │       └── oct_2025_cross_country_comparison.json
│   └── config/
│       ├── stakeholder_mapping.json
│       └── analysis_themes.json
```

#### **1.2 Stakeholder Matching Strategy**
- **Primary Key**: Business name (normalized - remove extra spaces, standardize capitalization)
- **Fallback**: Location + business type if name matching fails
- **Multiple Sources**: Each stakeholder gets a subfolder for different review platforms
- **Timestamp**: All data tagged with collection period (e.g., "oct_2025")

#### **1.3 Analysis Framework - Adapted from Tonga Assessment**

**Universal Experience Themes** (Cross-Sector Applicable):
```json
{
  "service_quality": {
    "keywords": ["service", "staff", "friendly", "helpful", "professional", "attentive", "welcoming"],
    "weight": 1.0
  },
  "authenticity_culture": {
    "keywords": ["authentic", "traditional", "cultural", "local", "genuine", "heritage", "indigenous"],
    "weight": 1.2
  },
  "value_pricing": {
    "keywords": ["price", "value", "worth", "expensive", "cheap", "reasonable", "overpriced", "bargain"],
    "weight": 1.0
  },
  "organization_logistics": {
    "keywords": ["organized", "efficient", "timing", "schedule", "punctual", "well-planned"],
    "weight": 1.1
  },
  "accessibility_comfort": {
    "keywords": ["accessible", "comfortable", "clean", "safe", "easy", "convenient", "welcoming"],
    "weight": 1.0
  }
}
```

**Sector-Specific Themes**:
- **Tour Operators**: Guide quality, safety, organization, education, value
- **Craft Markets**: Authenticity, craftsmanship, pricing, variety, bargaining
- **Cultural Sites**: Educational value, preservation, authenticity, accessibility
- **Festivals**: Organization, atmosphere, cultural accuracy, value, accessibility

### **Phase 2: Local Processing Pipeline**

#### **2.1 Required Local Tools & Dependencies**
```python
# Core processing requirements
- Python 3.8+
- pandas, numpy (data processing)
- transformers, torch (sentiment analysis)
- googletrans (translation)
- nltk, spacy (text processing)
- requests (API calls)
- google-api-python-client (Google Sheets integration)
```

#### **2.2 Processing Pipeline Steps**
1. **Data Collection**: Store JSON files in stakeholder-specific folders
2. **Translation**: Translate all reviews to English using Google Cloud Translation API
   - **Input**: `{stakeholder}_reviews.json` (mixed languages)
   - **Output**: `{stakeholder}_reviews_ENG.json` (English only)
   - **Process**: Language detection → Translation → Metadata preservation
3. **Stakeholder Matching**: Match reviews to existing stakeholder list by business name
4. **Theme Extraction**: Apply universal + sector-specific theme framework
5. **Sentiment Analysis**: Overall sentiment + theme-specific sentiment scoring
6. **Aggregation**: By stakeholder, sector, and country
7. **Google Sheets Integration**: Push processed results to existing sheet structure

#### **2.3 Translation Workflow**
```bash
# Test Google Cloud Translation API setup
python3 test_translation.py

# Translate single file (e.g., Kunta Kinteh)
python3 translate_reviews.py

# Batch translate all review files
python3 batch_translate.py
```

**Translation Features:**
- **Language Detection**: Automatic detection of Dutch, French, German, Spanish, English
- **Google Cloud API**: Uses existing credentials (`tourism-development-d620c-5c9db9e21301.json`)
- **Caching**: Avoids re-translating identical text
- **Cost**: ~$0.01 per review (~$0.24 for Kunta Kinteh's 24 reviews)
- **Output Format**: Maintains original language metadata for cross-language analysis

#### **2.4 Cross-Country Analysis Framework**
- **Competitive Positioning**: Compare Gambian stakeholders against regional competitors
- **Sentiment Trends**: Analyze sentiment patterns across all countries
- **Market Insights**: Identify opportunities and gaps in the regional market
- **Language Harmonization**: Normalize sentiment scores across different languages

### **Phase 3: Google Sheets Integration**

#### **3.1 Existing Sheet Extensions**
- **Master Assessment**: Add columns for `Sentiment Score`, `Review Count`, `Language Mix`, `Key Themes`
- **Regional Assessment**: Add `Sentiment vs Competitors`, `Market Position`, `Cross-Country Ranking`
- **Tourism Assessment**: Add sentiment metrics alongside existing digital readiness scores

#### **3.2 New Analysis Tabs**
- **Sentiment Analysis**: Detailed breakdown by stakeholder with theme analysis
- **Cross-Country Sentiment**: Regional comparison dashboard with competitive insights
- **Theme Trends**: Sector-specific theme analysis across countries

### **Phase 4: Implementation Timeline**

**Week 1-2**: Setup local infrastructure and folder structure
**Week 3-4**: Build processing pipeline and stakeholder matching
**Week 5-6**: Implement sentiment analysis and theme extraction
**Week 7-8**: Google Sheets integration and dashboard creation

### **Next Steps**
1. Create initial folder structure with sample stakeholder directories
2. Set up stakeholder mapping configuration
3. Build local processing scripts
4. Test with sample data before full implementation

Would you like me to elaborate on any specific aspect of this plan or help you begin implementing any particular component?
