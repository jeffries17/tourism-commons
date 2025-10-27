# Digital Positioning Opportunities Dashboard

## Overview

The Digital Positioning Opportunities Dashboard provides a visual, interactive analysis of stakeholder digital readiness and market impact potential. This tool helps identify strategic priorities and resource allocation opportunities.

## Features

### 🎯 **Interactive Matrix Visualization**
- **Scatter Plot**: Visual representation of stakeholders on a 2D matrix
- **X-axis**: Individual Digital Readiness (0-10)
- **Y-axis**: Market Impact Potential (0-10)
- **Color-coded Quadrants**: Different colors for each strategic quadrant

### 🔍 **Interactive Features**
- **Hover Tooltips**: Detailed stakeholder information on hover
- **Click Navigation**: Click any stakeholder dot to view their detailed page
- **Sector Filtering**: Filter stakeholders by sector
- **Real-time Updates**: Data automatically updates from Google Sheets

### 📊 **Quadrant Analysis**
- **Quick Wins** (Green): High readiness + High impact
- **Strategic Investment** (Blue): Low readiness + High impact  
- **Individual Focus** (Yellow): High readiness + Low impact
- **Future Consideration** (Gray): Low readiness + Low impact

### 📈 **Data Integration**
- **CI Assessment Data**: Individual digital readiness scores
- **Sentiment Analysis**: Comprehensive sentiment data for 12 stakeholders
- **Survey Data**: Self-reported capacity for 5 stakeholders
- **Sector Analysis**: Sector-specific gap calculations

## Technical Implementation

### Data Flow
1. **Google Sheets**: Digital Positioning Matrix sheet contains all calculations
2. **Data Generation**: `generate_positioning_dashboard_data.py` reads from Google Sheets
3. **JSON Output**: Creates `positioning_opportunities.json` for dashboard
4. **Dashboard**: React component fetches and visualizes data

### Key Files
- **Dashboard Page**: `src/pages/PositioningOpportunities.tsx`
- **Data Generator**: `generate_positioning_dashboard_data.py`
- **Matrix Creator**: `create_positioning_matrix.py`
- **Navigation**: Added to `Header.tsx` and `App.tsx`

### Data Structure
```json
{
  "stakeholders": [
    {
      "stakeholder_name": "Stakeholder Name",
      "sector": "Sector",
      "individual_readiness": 5.2,
      "market_impact": 6.8,
      "quadrant": "Quick Wins",
      "priority_score": 6.0,
      "has_survey_data": true,
      "has_sentiment_data": false,
      "external_score": 35.1,
      "survey_score": 20.25,
      "sentiment_score": 0,
      "sector_gap": 0.6,
      "ito_gap": 0.6,
      "individual_recommendations": "Recommendation text",
      "external_recommendations": "Recommendation text"
    }
  ],
  "summary": {
    "total_stakeholders": 61,
    "quadrant_distribution": {...},
    "data_availability": {...}
  }
}
```

## Usage

### For Administrators
1. Navigate to **Positioning Opportunities** in the dashboard
2. Use sector filter to focus on specific sectors
3. Hover over dots to see stakeholder details
4. Click dots to view individual stakeholder pages
5. Review top priorities table for strategic planning

### For Strategic Planning
- **Quick Wins**: Immediate opportunities for high impact
- **Strategic Investment**: Long-term development priorities
- **Individual Focus**: Stakeholders ready for advanced features
- **Future Consideration**: Long-term capacity building needs

## Data Updates

To update the positioning data:

```bash
cd /Users/alexjeffries/tourism-commons/digital_assessment
python3 generate_positioning_dashboard_data.py
```

This will:
1. Read the latest data from Google Sheets
2. Generate updated JSON file
3. Refresh dashboard data automatically

## Benefits

### Strategic Insights
- **Resource Allocation**: Identify where to invest resources
- **Sector Priorities**: Understand which sectors need most support
- **Individual Opportunities**: Find stakeholders ready for advancement
- **Market Impact**: Focus on high-impact opportunities

### Visual Analysis
- **Pattern Recognition**: See clusters and outliers
- **Sector Comparison**: Compare sectors side-by-side
- **Progress Tracking**: Monitor stakeholder development over time
- **Decision Support**: Data-driven strategic decisions

## Future Enhancements

- **Time Series**: Track stakeholder progress over time
- **Advanced Filtering**: Filter by multiple criteria
- **Export Features**: Download data and visualizations
- **Recommendation Engine**: Automated strategic recommendations
- **Integration**: Connect with other dashboard components

## Technical Notes

- **Performance**: Optimized for 61+ stakeholders
- **Responsive**: Works on desktop and mobile
- **Accessibility**: Screen reader compatible
- **Data Validation**: Handles missing data gracefully
- **Error Handling**: Robust error management

---

*This dashboard transforms complex positioning data into actionable strategic insights for digital tourism development.*
