# Sentiment Analysis & ITOS Assessment

This directory contains Python scripts for tourism stakeholder sentiment analysis and International Tour Operator (ITO) assessment.

---

## 📁 Directory Structure

```
sentiment/
├── scripts/          # Python analysis scripts
│   ├── analyzers/   # ITOS analyzer modules
│   └── *.py         # Main analysis scripts
├── data/
│   ├── config/      # Configuration files (keywords, entities, patterns)
│   └── sentiment_data/ # Review data by stakeholder
├── output/          # Analysis results (CSV, JSON)
└── workflows/       # Workflow documentation
```

---

## 🚀 Quick Start

### Setup Environment

```bash
cd sentiment/scripts
python -m venv ../sentiment_env
source ../sentiment_env/bin/activate  # Windows: ../sentiment_env/Scripts/activate
pip install -r ../../requirements.txt
```

---

## 📊 Two Main Workflows

### 1. ITO Assessment (Operational Analysis)

**What it does:** Analyzes how tour operators market Gambia (32 metrics per ITO)

**Run:**
```bash
python run_ito_assessment_from_sheet.py
```

**Output:** 
- CSV file with 32 columns (ready for Google Sheets)
- Activity coverage (12 categories)
- Product types, booking pathways, local partnerships

**Documentation:** See `../docs/ITOS_README.md`

---

### 2. Stakeholder Sentiment Analysis (Review Analysis)

**What it does:** Analyzes TripAdvisor/Google reviews for tourism stakeholders

**Steps:**

```bash
# 1. Separate reviews by stakeholder
python separate_reviews_by_stakeholder.py

# 2. Translate reviews to English (if needed)
python batch_translate.py

# 3. Run comprehensive sentiment analysis
python comprehensive_sentiment_analysis.py

# 4. Generate detailed insights
python generate_detailed_insights.py
```

**Output:**
- Sentiment scores by theme
- Critical area identification  
- Quote extraction
- Google Sheets-ready CSV

---

## 🔧 Key Scripts

### ITOS Assessment
- `run_ito_assessment_from_sheet.py` - Main orchestrator
- `complete_ito_assessment.py` - Core assessment engine
- `analyzers/activity_extractor.py` - 12 activity categories
- `analyzers/product_classifier.py` - Product type detection
- `analyzers/audience_analyzer.py` - Target audience detection
- `itos_data_models.py` - Data structures

### Sentiment Analysis
- `comprehensive_sentiment_analysis.py` - Main sentiment engine
- `enhanced_sentiment_analysis.py` - Theme-based analysis
- `generate_detailed_insights.py` - Insight generation
- `batch_translate.py` - Google Cloud translation

### Data Processing
- `separate_reviews_by_stakeholder.py` - Split review datasets
- `itos_web_scraper.py` - Scrape ITO websites

---

## 📋 Configuration Files

Located in `data/config/`:

### ITOS Assessment
- `activity_keywords_comprehensive.json` - 400+ keywords for 12 activities
- `audience_indicators.json` - 8 target audience patterns
- `gambian_entities.json` - 150+ Gambian hotels/attractions/DMCs
- `seasonality_patterns.json` - Seasonal marketing phrases

### Sentiment Analysis
- `analysis_themes.json` - Universal and sector themes
- `stakeholder_mapping.json` - Review source to stakeholder mapping

---

## 📤 Output Files

All outputs go to `output/`:

### ITOS Assessment
- `ito_assessment_results_YYYYMMDD_HHMMSS.csv` - Import to Google Sheets
- `ito_assessment_results_YYYYMMDD_HHMMSS.json` - Detailed data

### Sentiment Analysis
- `comprehensive_sentiment_analysis_results.json` - Complete analysis
- `sentiment_analysis_google_sheets.csv` - Google Sheets format
- `*_sentiment_analysis_google_sheets.csv` - Sector-specific results

---

## 🎯 Common Tasks

### Task: Assess All ITOs
```bash
cd scripts
python run_ito_assessment_from_sheet.py
# Import output CSV to Google Sheets
```

### Task: Analyze Tour Operator Reviews
```bash
cd scripts
python analyze_tour_operators.py
# Output: tour_operators_sentiment_analysis_google_sheets.csv
```

### Task: Analyze Creative Industry Reviews
```bash
cd scripts
python analyze_creative_industries.py
# Output: creative_industries_sentiment_analysis_google_sheets.csv
```

### Task: Scrape New ITO Data
```bash
cd scripts
python itos_web_scraper.py
# Updates ITO content for assessment
```

---

## 🐛 Troubleshooting

### Import Errors
**Solution:** Ensure virtual environment is activated and dependencies installed
```bash
source ../sentiment_env/bin/activate
pip install -r ../../requirements.txt
```

### Google Sheets API Errors
**Solution:** Check credentials in environment variables
```bash
export GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

### Low Detection Rates
**Solution:** 
- Check keyword configuration files
- Ensure content has sufficient length (200+ words)
- Review confidence thresholds in analyzer code

---

## 📚 Documentation

- **ITOS Assessment:** `../docs/ITOS_README.md` - Complete guide
- **Workflows:** `workflows/SENTIMENT_WORKFLOW.md` - Detailed process
- **Translation:** `workflows/TRANSLATION_WORKFLOW.md` - Translation guide

---

## 🔄 Workflow Diagrams

### ITOS Assessment Flow
```
ITO Data → Activity Extractor → Product Classifier → Audience Analyzer 
         → Booking Detector → Pricing Analyzer → Partnership Matcher
         → CSV/JSON Output → Google Sheets Import
```

### Sentiment Analysis Flow
```
Raw Reviews → Separate by Stakeholder → Translate (if needed)
           → Sentiment Analysis → Theme Extraction → Quote Extraction
           → CSV/JSON Output → Google Sheets Import
```

---

**Last Updated:** October 2025  
**Python Version:** 3.9+  
**Primary Maintainer:** Tourism Commons Team
