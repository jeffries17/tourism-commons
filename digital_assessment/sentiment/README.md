# Sentiment Analysis Workflow

This folder contains the complete sentiment analysis workflow for tourism stakeholder reviews, including data processing, translation, analysis, and visualization.

## 📁 Folder Structure

```
sentiment/
├── scripts/           # Python analysis scripts
├── data/             # Raw and processed data
│   ├── config/       # Configuration files
│   ├── raw_reviews/  # Original review data
│   └── processed/    # Processed data
├── output/           # Analysis results and reports
├── workflows/        # Documentation and workflows
└── README.md         # This file
```

## 🚀 Quick Start

### 1. Setup Environment
```bash
cd sentiment/scripts
python -m venv ../sentiment_env
source ../sentiment_env/bin/activate  # On Windows: ../sentiment_env/Scripts/activate
pip install -r ../../requirements.txt
```

### 2. Data Preparation
```bash
# Separate reviews by stakeholder
python separate_reviews_by_stakeholder.py

# Translate reviews to English
python batch_translate.py
```

### 3. Run Analysis
```bash
# Comprehensive sentiment analysis
python comprehensive_sentiment_analysis.py

# Generate detailed insights
python generate_detailed_insights.py
```

### 4. View Results
```bash
# Local dashboard
python local_dashboard.py

# Or access via web app at http://localhost:5173
```

## 📊 Scripts Overview

### Core Analysis Scripts
- **`comprehensive_sentiment_analysis.py`** - Main analysis engine
- **`enhanced_sentiment_analysis.py`** - Enhanced sentiment analysis with themes
- **`enhanced_theme_analysis.py`** - Deep theme-based analysis
- **`generate_detailed_insights.py`** - Generate detailed insights and reports

### Data Processing Scripts
- **`separate_reviews_by_stakeholder.py`** - Separate reviews by stakeholder
- **`translate_reviews.py`** - Translate reviews to English
- **`batch_translate.py`** - Batch translation workflow

### Integration Scripts
- **`firebase_sentiment_integration.py`** - Firebase integration
- **`automated_sentiment_pipeline.py`** - Complete automated pipeline
- **`local_dashboard.py`** - Local visualization dashboard

## 📈 Output Files

### Analysis Results
- **`comprehensive_sentiment_analysis_results.json`** - Complete analysis results
- **`sentiment_analysis_google_sheets.csv`** - Google Sheets ready data
- **`enhanced_theme_analysis_results.json`** - Theme analysis results

### Visualizations
- **`sentiment_analysis_dashboard.png`** - Dashboard visualization (if matplotlib available)

## 🔧 Configuration

### Analysis Themes (`data/config/analysis_themes.json`)
Defines the themes for sentiment analysis:
- Universal themes (applies to all stakeholders)
- Sector-specific themes (tourism, cultural, etc.)

### Stakeholder Mapping (`data/config/stakeholder_mapping.json`)
Maps place names to stakeholder categories for data separation.

## 📊 Features

### Sentiment Analysis
- **Overall sentiment scoring** (-1 to +1 scale)
- **Theme-specific analysis** with detailed breakdowns
- **Critical area identification** with priority levels
- **Quote extraction** for improvement insights

### Data Processing
- **Multi-language support** with Google Cloud Translation
- **Stakeholder categorization** with keyword matching
- **Data validation** and error handling
- **Batch processing** for efficiency

### Visualization
- **Interactive charts** (donut, bar charts)
- **Dashboard views** for different audiences
- **Export capabilities** for Google Sheets
- **Local and web-based** visualization options

## 🌐 Web Integration

The sentiment analysis is integrated into the main web application:

- **API Endpoints**: `/sentiment/summary`, `/sentiment/all`, `/sentiment/stakeholder/:name`
- **Frontend Component**: React-based dashboard with Chart.js visualizations
- **Real-time Updates**: Automatic data refresh and visualization

## 📋 Workflow Steps

1. **Data Collection** - Gather reviews from various sources
2. **Data Separation** - Separate by stakeholder using mapping rules
3. **Translation** - Translate to English for analysis
4. **Analysis** - Run comprehensive sentiment analysis
5. **Visualization** - Generate charts and dashboards
6. **Integration** - Feed results to web application
7. **Reporting** - Generate reports and insights

## 🔍 Troubleshooting

### Common Issues
- **Translation API errors**: Check Google Cloud credentials
- **File not found errors**: Verify file paths in scripts
- **Memory issues**: Process data in smaller batches
- **Chart rendering**: Ensure Chart.js is properly installed

### Debug Mode
Run scripts with verbose output:
```bash
python -u comprehensive_sentiment_analysis.py
```

## 📚 Dependencies

See `../../requirements.txt` for complete Python dependencies.

Key packages:
- `google-cloud-translate` - Translation services
- `nltk` - Natural language processing
- `pandas` - Data manipulation
- `matplotlib` - Visualization
- `chart.js` - Web charts (via npm)

## 🤝 Contributing

When adding new features:
1. Update configuration files as needed
2. Add tests for new functionality
3. Update this README
4. Ensure backward compatibility

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review script logs for error messages
3. Verify file paths and permissions
4. Check API credentials and quotas
