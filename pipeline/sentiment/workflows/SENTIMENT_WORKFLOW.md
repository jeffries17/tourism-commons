# Sentiment Analysis Workflow

## Overview
Complete workflow for analyzing tourism stakeholder reviews from raw data to actionable insights.

## Step-by-Step Process

### 1. Data Preparation
```bash
cd sentiment/scripts
python separate_reviews_by_stakeholder.py
```
- Separates large dataset into individual stakeholder files
- Uses stakeholder mapping configuration
- Creates organized folder structure

### 2. Translation
```bash
python batch_translate.py
```
- Translates all reviews to English using Google Cloud Translation
- Preserves original language metadata
- Creates `_ENG.json` files for analysis

### 3. Analysis
```bash
python comprehensive_sentiment_analysis.py
```
- Runs comprehensive sentiment analysis
- Generates theme-specific insights
- Creates critical area identification
- Outputs to `../output/` folder

### 4. Detailed Insights
```bash
python generate_detailed_insights.py
```
- Generates detailed stakeholder insights
- Creates Google Sheets ready CSV
- Extracts quotes for critical areas

### 5. Visualization
```bash
python local_dashboard.py
```
- Creates local visualization dashboard
- Generates charts and summaries
- Alternative to web-based dashboard

## Output Files

- `comprehensive_sentiment_analysis_results.json` - Complete analysis
- `sentiment_analysis_google_sheets.csv` - Google Sheets data
- `sentiment_analysis_dashboard.png` - Visual dashboard

## Web Integration

The analysis results are automatically integrated into the web application:
- API endpoints serve the data
- React components display interactive charts
- Real-time updates and filtering

## Maintenance

- Update stakeholder mapping as needed
- Refresh analysis when new data arrives
- Monitor API quotas and costs
- Regular backup of output files
