# Tourism Sentiment Analysis Tool

A public-facing web application for analyzing tourism reviews with customizable theme-based sentiment analysis.

## Overview

This tool enables students, small tour operators, and tourism researchers to:

- Upload review datasets (up to 50 reviews or 5000 words)
- Analyze reviews against predefined or custom themes
- Fine-tune theme detection by adding/removing keywords
- Generate shareable visualizations and reports
- Export results to Google Sheets (optional)
- Opt-in to contribute anonymous data for model improvement

**Live URL**: `tourismcommons.com/sentiment-analysis`

## Quick Start

### Prerequisites

- Node.js 18+ (for frontend)
- Python 3.9+ (for backend sentiment analysis) or Node.js (alternative)
- npm or yarn

### Development Setup

```bash
# Clone repository
cd tools/tourism-sentiment

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install  # or pip install -r requirements.txt

# Run frontend dev server
cd ../frontend
npm run dev

# Run backend server
cd ../backend
npm run dev  # or python src/server.py
```

## Project Structure

```
tourism-sentiment/
├── frontend/          # React + TypeScript frontend
├── backend/           # API server
├── config/            # Default themes and configuration
├── docs/              # Documentation
└── IMPLEMENTATION.md  # Detailed implementation plan
```

## Features

### Core Capabilities

1. **Data Input**
   - CSV file upload
   - Direct text paste
   - Google Sheets import (optional)

2. **Theme Analysis**
   - Default theme sets: Universal, Activities, Accommodations, Restaurants, Tour Operators
   - Custom theme creation
   - Keyword-based detection
   - Real-time keyword editing

3. **Sentiment Analysis**
   - Sentiment scores (-1 to +1)
   - Positive/Neutral/Negative classification
   - Per-theme sentiment breakdown
   - Quote extraction

4. **Visualizations**
   - Theme mention frequency charts
   - Sentiment distribution per theme
   - Radar charts for overall performance
   - Exportable as PNG (high resolution)

5. **Export Options**
   - CSV data export
   - PDF reports
   - PNG chart downloads
   - Shareable result links
   - Google Sheets sync

## Default Theme Categories

### Universal Themes
- Cultural & Heritage Value
- Service & Staff Quality
- Facilities & Infrastructure
- Accessibility & Transport
- Value for Money
- Safety & Security
- Educational & Informational Value
- Artistic & Creative Quality
- Atmosphere & Overall Experience

### Category-Specific Themes
- **Activities**: Activity Quality, Guide Expertise, Safety Measures, Equipment Quality, Duration & Timing
- **Accommodations**: Room Quality, Facilities & Amenities, Location & Access, Breakfast & Dining, Cleanliness
- **Restaurants**: Food Quality, Service Speed, Atmosphere, Value for Money, Dietary Options
- **Tour Operators**: Guide Quality, Itinerary Planning, Transportation, Organization, Responsiveness

## Privacy & Data Usage

### Data Collection
- Users explicitly opt-in to share anonymous data
- Only theme configurations and aggregate sentiment scores are shared
- Review texts and personal identifiers are NEVER shared

### Data Deletion
Request deletion by emailing: `alex.jeffries+sentiment@gmail.com`
- Include session ID or timestamp
- All personal data will be deleted within 7 days

See `IMPLEMENTATION.md` for complete privacy policy details.

## Technology Stack

### Frontend
- React 18+
- TypeScript
- Tailwind CSS
- Recharts or Chart.js
- React Router

### Backend
- Python FastAPI (or Node.js/Express)
- TextBlob for sentiment analysis
- Google Sheets API integration

## API Endpoints

### Analysis
- `POST /api/analyze` - Analyze reviews with themes
- `GET /api/themes/default/:category` - Get default theme sets
- `POST /api/themes/custom` - Save custom theme set

### Export
- `GET /api/export/:sessionId/csv` - Download CSV
- `GET /api/export/:sessionId/pdf` - Download PDF report
- `GET /api/export/:sessionId/chart/:themeName/png` - Download chart PNG

## Development Roadmap

### Phase 1: MVP ✅ (In Progress)
- Basic upload and analysis
- Default themes
- Simple visualizations
- CSV export

### Phase 2: Enhanced Features
- Custom themes
- Keyword fine-tuning
- Advanced visualizations
- PDF reports

### Phase 3: Advanced Features
- Google Sheets integration
- Shareable links
- Mobile optimization

### Phase 4: Polish & Deploy
- UI refinements
- Production deployment
- Documentation

## Contributing

This is an internal Tourism Commons project. See `IMPLEMENTATION.md` for detailed development guidelines.

## License

Internal use - Tourism Commons

## Contact

For questions or data deletion requests:
- Email: `alex.jeffries+sentiment@gmail.com`
- Subject: "Tourism Sentiment Analysis Tool"

## References

- Inspired by existing sentiment analysis in `digital_assessment/sentiment/`
- Theme definitions from `digital_assessment/sentiment/data/sentiment_data/config/analysis_themes.json`
- UI patterns from `tools/digital-assessment/`

