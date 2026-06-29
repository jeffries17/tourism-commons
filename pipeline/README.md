# Digital Assessment Platform - Python Scripts

This directory contains all Python scripts for the Tourism Commons Digital Assessment platform, organized by function.

## 📁 Directory Structure

### 🔧 Core Scripts (`/core/`)
**Essential production scripts for the main platform functionality**

- **[full_api_server.py](core/full_api_server.py)** - Main API server for the platform
- **[proxy_server.py](core/proxy_server.py)** - Proxy server for API requests
- **[auth_server.py](core/auth_server.py)** - Authentication server
- **[ito_content_scraper.py](core/ito_content_scraper.py)** - ITO content scraping functionality
- **[ito_ai_analyzer.py](core/ito_ai_analyzer.py)** - AI-powered ITO analysis

### 📊 Analysis Scripts (`/analysis/`)
**Data analysis and research scripts**

- **[ito_regional_analysis.py](analysis/ito_regional_analysis.py)** - Regional ITO analysis
- **[regional_competitor_analyzer.py](analysis/regional_competitor_analyzer.py)** - Competitor analysis
- **[generate_gap_analysis.py](analysis/generate_gap_analysis.py)** - Gap analysis generation

### 🔄 Data Processing (`/data_processing/`)
**Data manipulation and processing scripts**

- **[survey_scoring_engine.py](data_processing/survey_scoring_engine.py)** - Survey scoring system
- **[survey_integration.py](data_processing/survey_integration.py)** - Survey data integration
- **[score_and_match_surveys.py](data_processing/score_and_match_surveys.py)** - Survey matching
- **[web_score_updater.py](data_processing/web_score_updater.py)** - Web score updates
- **[local_score_updater.py](data_processing/local_score_updater.py)** - Local score updates
- **[safe_survey_score_updater.py](data_processing/safe_survey_score_updater.py)** - Safe survey updates
- **[survey_capacity_scorer.py](data_processing/survey_capacity_scorer.py)** - Capacity scoring
- **[survey_question_mapping.py](data_processing/survey_question_mapping.py)** - Question mapping
- **[view_survey_responses.py](data_processing/view_survey_responses.py)** - Survey response viewer

### 🛠️ Utilities (`/utilities/`)
**Helper scripts and data generation tools**

- **[generate_participant_recommendations.py](utilities/generate_participant_recommendations.py)** - Participant recommendations
- **[generate_contextual_recommendations.py](utilities/generate_contextual_recommendations.py)** - Contextual recommendations
- **[generate_ito_dashboard_data.py](utilities/generate_ito_dashboard_data.py)** - ITO dashboard data
- **[generate_positioning_dashboard_data.py](utilities/generate_positioning_dashboard_data.py)** - Positioning data
- **[generate_regional_leaders_shortlist.py](utilities/generate_regional_leaders_shortlist.py)** - Regional leaders
- **[create_positioning_matrix.py](utilities/create_positioning_matrix.py)** - Positioning matrix
- **[create_recommendations_sheet.py](utilities/create_recommendations_sheet.py)** - Recommendations sheet
- **[create_survey_scoring_sheet.py](utilities/create_survey_scoring_sheet.py)** - Survey scoring sheet
- **[regenerate_dashboard_data.py](utilities/regenerate_dashboard_data.py)** - Dashboard data regeneration
- **[run_ito_tour_level_analysis.py](utilities/run_ito_tour_level_analysis.py)** - Tour level analysis
- **[fix_website_scores.py](utilities/fix_website_scores.py)** - Website score fixes
- **[update_blocked_tours_in_sheet.py](utilities/update_blocked_tours_in_sheet.py)** - Blocked tours updates
- **[find_regional_ito_tours.py](utilities/find_regional_ito_tours.py)** - Regional tour finder
- **[add_regional_tours.py](utilities/add_regional_tours.py)** - Add regional tours
- **[add_regional_tours_batch.py](utilities/add_regional_tours_batch.py)** - Batch regional tours

### 📈 Sentiment Analysis (`/sentiment/`)
**Comprehensive sentiment analysis system**

The sentiment analysis system contains 59 Python scripts organized in:
- **Scripts** - Main analysis scripts
- **Analyzers** - Specialized analysis modules
- **Output** - Generated reports and data

**Key Scripts:**
- **[comprehensive_sentiment_analysis.py](sentiment/scripts/comprehensive_sentiment_analysis.py)** - Main sentiment analysis
- **[run_ito_assessment_from_sheet.py](sentiment/scripts/run_ito_assessment_from_sheet.py)** - ITO assessment
- **[analyze_tour_operators.py](sentiment/scripts/analyze_tour_operators.py)** - Tour operator analysis
- **[analyze_creative_industries.py](sentiment/scripts/analyze_creative_industries.py)** - Creative industries analysis

---

## 🚀 Quick Start

### Core Platform
```bash
# Start the main API server
python core/full_api_server.py

# Start proxy server
python core/proxy_server.py

# Run ITO content scraping
python core/ito_content_scraper.py
```

### Data Processing
```bash
# Update survey scores
python data_processing/survey_scoring_engine.py

# Process survey integration
python data_processing/survey_integration.py
```

### Analysis
```bash
# Run regional analysis
python analysis/ito_regional_analysis.py

# Generate gap analysis
python analysis/generate_gap_analysis.py
```

### Sentiment Analysis
```bash
# Run comprehensive sentiment analysis
python sentiment/scripts/comprehensive_sentiment_analysis.py

# Run ITO assessment
python sentiment/scripts/run_ito_assessment_from_sheet.py
```

---

## 📋 Script Categories

### Production Scripts
- **Core**: Essential platform functionality
- **Data Processing**: Survey and scoring systems
- **Analysis**: Research and analysis tools

### Utility Scripts
- **Generation**: Data and report generation
- **Maintenance**: Data updates and fixes
- **Integration**: System integration tools

### Sentiment Analysis
- **Main Scripts**: Primary analysis workflows
- **Analyzers**: Specialized analysis modules
- **Output**: Report generation and data export

---

## 🔧 Dependencies

### Core Dependencies
- `google-auth` - Google API authentication
- `google-api-python-client` - Google Sheets API
- `openai` - OpenAI API integration
- `pandas` - Data manipulation
- `requests` - HTTP requests

### Sentiment Analysis
- `transformers` - NLP models
- `torch` - PyTorch for ML
- `scikit-learn` - Machine learning
- `nltk` - Natural language processing

### Data Processing
- `google-cloud-translate` - Translation services
- `beautifulsoup4` - Web scraping
- `selenium` - Web automation

---

## 📝 Usage Guidelines

### For Core Development
1. Use scripts in `/core/` for main platform functionality
2. Test changes in development environment first
3. Update documentation when modifying core scripts

### For Data Processing
1. Use `/data_processing/` scripts for survey and scoring operations
2. Always backup data before running updates
3. Monitor logs for processing status

### For Analysis
1. Use `/analysis/` scripts for research and analysis
2. Generate reports in appropriate output directories
3. Document analysis methodology

### For Sentiment Analysis
1. Follow the workflow in `/sentiment/scripts/`
2. Use appropriate analyzers for specific tasks
3. Generate comprehensive reports

---

## 🎯 Best Practices

1. **Organization**: Keep scripts in appropriate folders
2. **Documentation**: Document script purpose and usage
3. **Testing**: Test scripts before production use
4. **Backup**: Always backup data before processing
5. **Logging**: Use proper logging for debugging

---

*Last updated: $(date)*
