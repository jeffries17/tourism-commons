# Sentiment Analysis & ITOS Workflows

Quick reference guide for running analyses with the streamlined codebase.

---

## 🎯 Two Main Workflows

### 1. ITO Assessment (Tour Operator Analysis)

**Purpose:** Analyze how tour operators market The Gambia  
**Output:** 32-column CSV for Google Sheets import

**Run:**
```bash
cd sentiment/scripts
python run_ito_assessment_from_sheet.py
```

**Output Location:** `../output/ito_assessment_results_YYYYMMDD_HHMMSS.csv`

**Documentation:** `../docs/ITOS_README.md`

---

### 2. Sentiment Analysis (Review Analysis)

**Purpose:** Analyze TripAdvisor/Google reviews for tourism stakeholders  
**Output:** Sentiment scores, themes, quotes

#### Option A: All Stakeholders
```bash
cd sentiment/scripts
python comprehensive_sentiment_analysis.py
```

#### Option B: Tour Operators Only
```bash
cd sentiment/scripts
python analyze_tour_operators.py
```

#### Option C: Creative Industries Only
```bash
cd sentiment/scripts
python analyze_creative_industries.py
```

**Output Location:** `../output/*_sentiment_analysis_google_sheets.csv`

---

## 📋 Complete Script Reference

### Core Production Scripts (Use These)

#### ITOS Assessment
- `run_ito_assessment_from_sheet.py` - **Main orchestrator for ITO assessment**
- `complete_ito_assessment.py` - Core assessment engine (called by above)
- `itos_data_models.py` - Data structures and schemas
- `analyzers/activity_extractor.py` - Detects 12 activity categories
- `analyzers/audience_analyzer.py` - Identifies target audiences
- `analyzers/product_classifier.py` - Classifies product types
- `analyzers/itinerary_parser.py` - Analyzes itinerary depth
- `analyzers/simple_analyzers.py` - Booking, pricing, language detection

#### Sentiment Analysis
- `comprehensive_sentiment_analysis.py` - **Main sentiment engine**
- `analyze_tour_operators.py` - **Tour operator sentiment analysis**
- `analyze_creative_industries.py` - **Creative industries sentiment analysis**
- `generate_detailed_insights.py` - Creates detailed reports with quotes

#### Data Preparation
- `separate_reviews_by_stakeholder.py` - Splits review datasets by stakeholder
- `batch_translate.py` - Translates reviews using Google Cloud Translation
- `translate_reviews.py` - Single-file translation utility

#### Utilities
- `itos_web_scraper.py` - Scrapes ITO websites for fresh data
- `analyze_single_url.py` - Quick analysis of a single ITO URL
- `local_dashboard.py` - Creates local visualization dashboard
- `firebase_sentiment_integration.py` - Uploads results to Firebase
- `automated_sentiment_pipeline.py` - Runs complete sentiment pipeline

---

## 🔄 Common Workflows

### Workflow 1: New ITO Assessment

```bash
# Optional: Scrape fresh data
python itos_web_scraper.py

# Run assessment
python run_ito_assessment_from_sheet.py

# Import CSV to Google Sheets:
# File → Import → ../output/ito_assessment_results_*.csv
```

---

### Workflow 2: Analyze All Reviews

```bash
# 1. Separate reviews by stakeholder (one-time)
python separate_reviews_by_stakeholder.py

# 2. Translate if needed (one-time)
python batch_translate.py

# 3. Run comprehensive analysis
python comprehensive_sentiment_analysis.py

# 4. Generate detailed insights
python generate_detailed_insights.py

# Import to Google Sheets:
# ../output/comprehensive_sentiment_analysis_results.csv
```

---

### Workflow 3: Quick Tour Operator Sentiment

```bash
# Run tour operator analysis
python analyze_tour_operators.py

# Import to Google Sheets:
# ../output/tour_operators_sentiment_analysis_google_sheets.csv
```

---

### Workflow 4: Quick Creative Industries Sentiment

```bash
# Run creative industries analysis
python analyze_creative_industries.py

# Import to Google Sheets:
# ../output/creative_industries_sentiment_analysis_google_sheets.csv
```

---

### Workflow 5: Test Single ITO

```bash
# Analyze one URL quickly
python analyze_single_url.py https://example-tour-operator.com/gambia

# Review console output
```

---

## 📁 Directory Structure

```
sentiment/
├── scripts/
│   ├── analyzers/                    # ITOS analyzer modules
│   │   ├── activity_extractor.py
│   │   ├── audience_analyzer.py
│   │   ├── product_classifier.py
│   │   ├── itinerary_parser.py
│   │   └── simple_analyzers.py
│   │
│   ├── run_ito_assessment_from_sheet.py    ⭐ Main ITO runner
│   ├── complete_ito_assessment.py          - ITO core engine
│   ├── itos_data_models.py                 - ITO data structures
│   ├── itos_web_scraper.py                 - Scrape ITO websites
│   ├── analyze_single_url.py               - Quick ITO test
│   │
│   ├── comprehensive_sentiment_analysis.py ⭐ Main sentiment engine
│   ├── analyze_tour_operators.py           ⭐ Tour operator sentiment
│   ├── analyze_creative_industries.py      ⭐ Creative sentiment
│   ├── generate_detailed_insights.py       - Detailed reports
│   │
│   ├── separate_reviews_by_stakeholder.py  - Data prep
│   ├── batch_translate.py                  - Translation
│   ├── translate_reviews.py                - Translation utility
│   │
│   ├── local_dashboard.py                  - Visualization
│   ├── firebase_sentiment_integration.py   - Firebase upload
│   └── automated_sentiment_pipeline.py     - Complete pipeline
│
├── data/
│   ├── config/                       # Configuration files
│   │   ├── activity_keywords_comprehensive.json
│   │   ├── audience_indicators.json
│   │   ├── gambian_entities.json
│   │   ├── seasonality_patterns.json
│   │   └── analysis_themes.json
│   │
│   └── sentiment_data/               # Review data by stakeholder
│
├── output/                           # All analysis results
│
├── workflows/                        # Additional documentation
│
├── README.md                         # Main documentation
└── WORKFLOWS.md                      # This file
```

---

## 🎓 Script Selection Guide

### "I want to assess tour operators"
→ Use `run_ito_assessment_from_sheet.py`

### "I want to analyze reviews for tour operators"
→ Use `analyze_tour_operators.py`

### "I want to analyze reviews for creative industries"
→ Use `analyze_creative_industries.py`

### "I want to analyze ALL stakeholder reviews"
→ Use `comprehensive_sentiment_analysis.py`

### "I need to prepare review data"
→ Use `separate_reviews_by_stakeholder.py`

### "I need to translate reviews"
→ Use `batch_translate.py`

### "I want to test one tour operator quickly"
→ Use `analyze_single_url.py https://...`

### "I want to scrape fresh ITO data"
→ Use `itos_web_scraper.py`

### "I want a visual dashboard"
→ Use `local_dashboard.py`

---

## 📊 Output Files

### ITOS Assessment
```
output/
├── ito_assessment_results_YYYYMMDD_HHMMSS.csv  # Google Sheets import
└── ito_assessment_results_YYYYMMDD_HHMMSS.json # Detailed data
```

### Sentiment Analysis
```
output/
├── comprehensive_sentiment_analysis_results.json
├── sentiment_analysis_google_sheets.csv
├── tour_operators_sentiment_analysis_google_sheets.csv
├── creative_industries_sentiment_analysis_google_sheets.csv
└── enhanced_theme_analysis_results.json
```

---

## 🔧 Configuration

All configuration files are in `data/config/`:

### ITOS Assessment Config
- `activity_keywords_comprehensive.json` - 400+ keywords for 12 activities
- `audience_indicators.json` - 8 target audience patterns
- `gambian_entities.json` - 150+ Gambian locations/businesses
- `seasonality_patterns.json` - Seasonal marketing phrases

### Sentiment Analysis Config
- `analysis_themes.json` - Universal themes and sector-specific themes
- `stakeholder_mapping.json` - Maps review sources to stakeholders

---

## 🚀 Quick Commands

```bash
# Setup (one-time)
cd sentiment/scripts
python -m venv ../sentiment_env
source ../sentiment_env/bin/activate
pip install -r ../../requirements.txt

# ITO Assessment
python run_ito_assessment_from_sheet.py

# Sentiment Analysis - All
python comprehensive_sentiment_analysis.py

# Sentiment Analysis - Tour Operators Only
python analyze_tour_operators.py

# Sentiment Analysis - Creative Industries Only
python analyze_creative_industries.py

# Data Preparation
python separate_reviews_by_stakeholder.py
python batch_translate.py

# Utilities
python analyze_single_url.py https://example.com/gambia
python itos_web_scraper.py
python local_dashboard.py
```

---

## 📚 Documentation

- **README.md** - Main technical documentation
- **WORKFLOWS.md** - This file (workflow guide)
- **../docs/ITOS_README.md** - Complete ITOS assessment guide
- **workflows/SENTIMENT_WORKFLOW.md** - Detailed sentiment process
- **workflows/TRANSLATION_WORKFLOW.md** - Translation process

---

**Last Updated:** October 1, 2025  
**Total Scripts:** 21 production scripts (down from 56!)

