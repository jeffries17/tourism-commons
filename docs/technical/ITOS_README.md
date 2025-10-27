# International Tour Operators (ITO) Assessment System

**Status:** ✅ Production Ready | **Last Updated:** October 2025

---

## 📋 What This System Does

Analyzes how International Tour Operators (ITOs) **market and sell** The Gambia by evaluating:
- **Activity Coverage**: Which of 12 tourism/creative activities are mentioned
- **Product Types**: Flight+Hotel, Itinerary, Tailor-made, or Mixed offerings  
- **Local Integration**: Partnerships with Gambian entities
- **Booking & Pricing**: How bookable and transparent the offerings are
- **Content Quality**: Media, language support, seasonality framing

**Output**: 32-column Google Sheets-ready assessment for each ITO.

---

## 🚀 Quick Start

### Run Assessment on Existing Data

```bash
cd /Users/alexjeffries/tourism-commons/digital_assessment/sentiment/scripts
python3 run_ito_assessment_from_sheet.py
```

**Output Files:**
- `../output/ito_assessment_results_YYYYMMDD_HHMMSS.csv` - Import to Google Sheets
- `../output/ito_assessment_results_YYYYMMDD_HHMMSS.json` - Detailed analysis data

### Import to Google Sheets

1. Open your ITO Google Sheet
2. **File → Import**
3. Upload the CSV file
4. Choose **Replace current sheet** or **Insert new sheet**
5. Done! All 32 columns will populate

---

## 📊 The 32 Assessment Columns

### Basic Info (5 columns)
1. **Operator Name** - Tour operator company name
2. **Country / Region** - Where they're based
3. **Website URL** - Main company website
4. **Gambia Page URL** - Dedicated Gambia destination page
5. **Gambia Tour Pages** - Individual tour/package URLs

### Structure & Navigation (4 columns)
6. **Visibility & Navigation** - How prominently Gambia is featured
7. **Product Type** - Flight+Hotel, Itinerary, Tailor-made, or Mixed
8. **Itinerary Depth - % Gambia** - What % of multi-country tours is Gambia
9. **Itinerary Depth - Detail Level** - Basic, Moderate, or Detailed descriptions

### Tourism Core Activities (4 columns - Yes/No)
10. **Sun & Beach** - Resort, beach holidays, relaxation
11. **Nature & Wildlife** - Birding, safari, eco-tourism, river cruises
12. **Adventure** - Kayaking, hiking, expeditions
13. **Culture & Heritage** - Villages, UNESCO sites, museums, history

### Creative Industries (8 columns - Yes/No)
14. **Festivals & Cultural Events** - Music festivals, cultural events
15. **Audiovisual** - Photography tours, film locations, video production
16. **Marketing/Advertising/Publishing** - Content creation, publishing tours
17. **Crafts & Artisan Products** - Batik, wood carving, tie-dye workshops
18. **Fashion & Design** - Fashion tours, design experiences
19. **Music** - Live music, drumming, kora performances
20. **Performing & Visual Arts** - Dance, theater, art galleries
21. **Heritage Sites & Museums** - National Museum, historical sites

### Audience & Booking (2 columns)
22. **Positioning & Target Audience** - Families, couples, solo, adventure-seekers, etc.
23. **Booking Pathway** - Online bookable, Enquiry-only, or Price on request

### Media & Content (3 columns)
24. **Media Quality** - Professional photos/videos, stock images, or limited
25. **Media - UGC/Testimonials** - User-generated content and reviews
26. **Media - TripAdvisor Integration** - TripAdvisor reviews/widgets embedded

### Pricing & Localization (4 columns)
27. **Price Transparency** - Clear packages, seasonal pricing, from pricing, or POA
28. **Language Availability** - Which languages the content is available in
29. **Local Partnerships** - Gambian hotels, DMCs, attractions mentioned
30. **Seasonality Framing** - Winter sun, dry season, year-round positioning

### Metadata (2 columns)
31. **Last Scraped** - When the data was collected
32. **Scrape Status** - Success, Partial, or Failed

---

## 🔧 System Architecture

### Core Components

**1. Data Models** (`itos_data_models.py`)
- Defines the complete ITO assessment structure
- Handles Google Sheets formatting
- JSON serialization for archival

**2. Analyzers** (`scripts/analyzers/`)
- `activity_extractor.py` - Detects 12 activity categories
- `audience_analyzer.py` - Identifies target audiences
- `product_classifier.py` - Classifies product types
- `itinerary_parser.py` - Analyzes itinerary depth
- `simple_analyzers.py` - Booking, pricing, language, partnerships

**3. Orchestrator** (`complete_ito_assessment.py`)
- Runs all analyzers in sequence
- Combines results into final assessment
- Generates CSV and JSON outputs

**4. Sheet Integration** (`run_ito_assessment_from_sheet.py`)
- Reads ITO data from Google Sheets
- Processes all ITOs
- Exports results for import

### Configuration Files

Located in `sentiment/data/config/`:

- `activity_keywords_comprehensive.json` - 400+ keywords for 12 activities
- `audience_indicators.json` - Patterns for 8 target audiences
- `gambian_entities.json` - 150+ Gambian hotels, attractions, DMCs
- `seasonality_patterns.json` - Seasonal marketing phrases

---

## 📈 Typical Results

From 30 real ITOs analyzed:

| Metric | Average |
|--------|---------|
| **Activities Detected** | 6.2/12 (52%) |
| **Tourism Core** | 2.4/4 (60%) |
| **Creative Industries** | 3.8/8 (48%) |
| **Gambia %** (multi-country) | 88% |
| **Local Partnerships** | 0.9/5 (18%) |

**Most Common Activities:**
- Sun & Beach (70%)
- Nature & Wildlife (53%)
- Culture & Heritage (47%)

**Least Common Activities:**
- Fashion & Design (17%)
- Marketing/Publishing (23%)
- Performing Arts (30%)

---

## 🛠️ Advanced Usage

### Run with Fresh Scraped Data

```bash
# 1. Scrape new ITO pages
python3 itos_web_scraper.py

# 2. Run assessment
python3 run_ito_assessment_from_sheet.py

# 3. Import new CSV to Google Sheets
```

### Test Individual Analyzers

```bash
# Test activity extraction
python3 test_analyzers_on_real_data.py

# Test complete analysis on one ITO
python3 analyze_single_url.py https://example-tour-operator.com/gambia
```

### Modify Detection Thresholds

Edit configuration files to adjust:
- Keyword lists for activities
- Confidence thresholds
- Partnership entity lists
- Audience detection patterns

---

## 🔍 How Activity Detection Works

### Binary Yes/No Detection

Each activity uses keyword matching with context awareness:

**Example - "Nature & Wildlife":**
```json
{
  "keywords": [
    "birding", "birdwatching", "wildlife", "safari",
    "abuko", "river cruise", "chimpanzee", "hippo",
    "tanji bird reserve", "bijilo forest"
  ]
}
```

If **2+ keywords** appear in the ITO content → **Yes**, else **No**

### Activity Categories

**Tourism Core (4):**
- Sun & Beach - Resorts, swimming, relaxation
- Nature & Wildlife - Birding, safaris, eco-tourism  
- Adventure - Kayaking, hiking, expeditions
- Culture & Heritage - Villages, museums, UNESCO sites

**Creative Industries (8):**
- Festivals & Events - Music festivals, cultural celebrations
- Audiovisual - Photography, film, video production
- Marketing/Publishing - Content creation, travel writing
- Crafts & Artisan - Batik, woodcarving, tie-dye
- Fashion & Design - Fashion experiences, design workshops
- Music - Drumming, kora, live performances
- Performing & Visual Arts - Dance, theater, galleries
- Heritage Sites & Museums - Historical sites, museums

---

## 🎯 Use Cases

### 1. Gap Analysis
**Question:** Which creative industries are underrepresented?
- Import CSV to Sheets
- Sum "Yes" counts per activity column
- Identify lowest-scoring activities

### 2. Operator Benchmarking  
**Question:** Which operators have best activity coverage?
- Count total "Yes" across 12 activity columns
- Rank operators by total score
- Identify top performers

### 3. Local Integration Assessment
**Question:** Who mentions Gambian partnerships?
- Filter by "Local Partnerships" column
- Identify operators with 3+ partnerships
- Analyze partnership types

### 4. Product Type Distribution
**Question:** What product mix do ITOs offer?
- Pivot on "Product Type" column
- Chart distribution (Flight+Hotel vs Itinerary vs Tailor-made)
- Identify trends

---

## 🐛 Troubleshooting

### Issue: CSV Import Shows Formatting Errors

**Solution:**
- Ensure UTF-8 encoding
- Check for commas in text fields (should be quoted)
- Try "Replace sheet" instead of "Append"

### Issue: Low Activity Detection

**Possible Causes:**
- Content too brief (need 200+ words for reliable detection)
- Generic content without specifics
- Content in non-English language (translation needed)

**Solution:**
- Check `confidence_scores` in JSON output
- Review keyword matches in detailed logs
- Adjust thresholds in config files if needed

### Issue: Wrong Product Type Classification

**Solution:**
- Review `product_classifier.py` rules
- Check if itinerary structure is clear
- Manually override in Sheet if needed

---

## 📚 For Developers

### Adding New Activity Categories

1. Edit `activity_keywords_comprehensive.json`:
```json
{
  "new_activity_name": {
    "keywords": ["keyword1", "keyword2", ...],
    "min_threshold": 2
  }
}
```

2. Update `activity_extractor.py` to include new category

3. Rerun assessment

### Changing Detection Logic

- **Activity extraction**: `analyzers/activity_extractor.py`
- **Product classification**: `analyzers/product_classifier.py`  
- **Audience detection**: `analyzers/audience_analyzer.py`
- **Partnership matching**: `analyzers/simple_analyzers.py`

### Output Format

**CSV**: For Google Sheets import (32 columns)
**JSON**: For archival and detailed analysis
```json
{
  "operator_name": "Example Tours",
  "activities": {
    "sun_beach": true,
    "nature_wildlife": true,
    ...
  },
  "confidence_scores": {
    "sun_beach": 0.95,
    "nature_wildlife": 0.87
  },
  "metadata": {...}
}
```

---

## 📝 Change Log

### October 2025 - Current System
- ✅ Complete rebuild from sentiment to operational assessment
- ✅ 12 activity categories (4 core tourism + 8 creative industries)
- ✅ 32-column Google Sheets output
- ✅ Tested on 30 real ITOs
- ✅ Binary Yes/No activity detection

### December 2024 - Original System
- Sentiment-focused analysis
- 6 tourism niches with 0-1 scores
- Limited creative industries coverage

---

## 🤝 Support

**Quick Reference:**
- Configuration: `sentiment/data/config/`
- Scripts: `sentiment/scripts/`
- Output: `sentiment/output/`
- Logs: Check console output during run

**Common Commands:**
```bash
# Full assessment run
python3 run_ito_assessment_from_sheet.py

# Test on sample data
python3 test_analyzers_on_real_data.py

# Analyze single URL
python3 analyze_single_url.py <URL>
```

---

**System Version:** 2.0  
**Documentation Updated:** October 1, 2025

