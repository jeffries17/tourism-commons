# Tourism Sentiment Analysis Tool - Implementation Document

## Overview

A public-facing sentiment analysis tool designed for students and small tour operators to analyze tourism reviews. Users can upload review datasets, analyze them against predefined or custom themes, and generate shareable visualizations. The tool will be accessible at `tourismcommons.com/sentiment-analysis`.

### Objectives

- Provide accessible sentiment analysis for tourism stakeholders
- Enable theme-based analysis with customizable keyword sets
- Generate presentation-ready visualizations
- Collect anonymous data to improve tourism sentiment analysis models
- Maintain user privacy with opt-in data sharing and deletion options

## Target Users

- **Students**: Tourism and hospitality students analyzing case studies
- **Small Tour Operators**: Independent operators analyzing their own reviews
- **Tourism Researchers**: Academics and researchers studying tourism sentiment
- **Tourism Consultants**: Professionals advising tourism businesses

## Core Features

### 1. Data Input

**Supported Input Methods:**
- **CSV Upload**: Upload reviews as CSV with columns (text, rating, date, reviewer_name, etc.)
- **Text Paste**: Paste reviews directly (up to 5000 words or 50 reviews)
- **Google Sheets Import**: Link to Google Sheet (optional, for advanced users)

**Input Limits:**
- Maximum 50 individual reviews
- Maximum 5000 words total
- Single file or paste operation

**Data Format:**
```
Required fields:
- review_text (text content of review)
- rating (1-5 stars, optional)
- date (optional, for time-based analysis)

Optional fields:
- reviewer_name
- source (e.g., TripAdvisor, Booking.com)
- business_name
- location
```

### 2. Theme System

#### Default Theme Sets

**Universal Tourism Themes** (from existing analysis):
- Cultural & Heritage Value
- Service & Staff Quality
- Facilities & Infrastructure
- Accessibility & Transport
- Value for Money
- Safety & Security
- Educational & Informational Value
- Artistic & Creative Quality
- Atmosphere & Overall Experience

**Category-Specific Themes**:

**Activities:**
- Activity Quality
- Guide Expertise
- Safety Measures
- Equipment Quality
- Duration & Timing

**Accommodations:**
- Room Quality
- Facilities & Amenities
- Location & Access
- Breakfast & Dining
- Cleanliness

**Restaurants:**
- Food Quality
- Service Speed
- Atmosphere
- Value for Money
- Dietary Options

**Tour Operators:**
- Guide Quality
- Itinerary Planning
- Transportation
- Organization
- Responsiveness

#### Custom Themes

Users can:
- Create new themes with custom names
- Add/remove keywords to existing themes
- Define theme weights (importance multipliers)
- Save custom theme sets for reuse
- Export/import theme configurations

### 3. Analysis Engine

**Sentiment Analysis:**
- Use TextBlob or VADER for sentiment scoring (-1 to +1)
- Classify each theme mention as Positive, Neutral, or Negative
- Calculate aggregate sentiment per theme
- Provide confidence scores

**Theme Detection:**
- Keyword matching (case-insensitive, partial word support)
- Sentence-level analysis (analyze sentiment of sentences containing theme keywords)
- Count mentions per theme
- Weight scoring based on theme importance

**Output Metrics:**
- Total reviews analyzed
- Theme mention counts
- Sentiment breakdown (positive/neutral/negative percentages)
- Average sentiment score per theme (-1 to +1)
- Top mentioned themes
- Sentiment distribution charts

### 4. Visualization & Reporting

**Core Visualizations:**

#### 4.1 Word Clouds
- **Overall Word Cloud**: Most frequently mentioned words across all reviews (stop words filtered)
- **Theme-Specific Word Clouds**: Word frequency within each detected theme
- **Sentiment-Based Word Clouds**: 
  - Positive sentiment word cloud (green palette)
  - Negative sentiment word cloud (red palette)
  - Compare positive vs negative language patterns
- **Customizable Options**:
  - Font size range (min/max)
  - Color schemes (sentiment-based, theme-based, custom)
  - Minimum word frequency threshold
  - Exclude common words toggle
  - Export as PNG (high resolution for presentations)

#### 4.2 Theme Analysis Charts

**Bar Charts:**
- **Theme Mention Frequency**: Horizontal/vertical bar chart showing mention counts per theme
- **Sentiment Score by Theme**: Bar chart with sentiment scores (-1 to +1) per theme
- **Sorted Views**: Sort by mentions, sentiment, or alphabetical

**Stacked Bar Charts:**
- **Sentiment Distribution per Theme**: Stacked bars showing positive (green), neutral (yellow), negative (red) proportions
- **Comparison View**: Compare multiple themes side-by-side
- **Percentage View**: Show as percentages (100% stacked)

**Radar/Spider Charts:**
- **Overall Theme Performance**: Radar chart showing sentiment scores across all themes
- **Comparative Radar**: Overlay multiple datasets (e.g., before/after theme refinement)
- **Category Radar**: Show performance across theme categories (Activities, Accommodations, etc.)

#### 4.3 Sentiment Analysis Visualizations

**Sentiment Distribution:**
- **Overall Sentiment Pie Chart**: Proportion of positive/neutral/negative reviews
- **Sentiment by Theme**: Pie charts for each theme showing sentiment breakdown
- **Sentiment Timeline**: Line chart showing sentiment trends over time (if dates provided)

**Heatmaps:**
- **Theme × Sentiment Heatmap**: Color-coded grid showing sentiment intensity per theme
- **Time × Sentiment Heatmap**: Temporal sentiment patterns (if dates provided)
- **Review Rating × Sentiment Heatmap**: Correlation between ratings and sentiment scores

**Scatter Plots:**
- **Sentiment vs Mentions**: Scatter plot showing relationship between theme mentions and sentiment scores
- **Rating vs Sentiment**: If ratings provided, show correlation between review ratings and sentiment

#### 4.4 Quote & Evidence Visualizations

**Quote Cards:**
- Expandable quote cards per theme with sentiment color coding
- Filter by sentiment (positive/neutral/negative)
- Search quotes by keyword
- Export selected quotes

**Treemap:**
- Visualize theme importance by area size (based on mentions or sentiment)
- Color by sentiment score
- Interactive: click to drill down into theme details

**Network Graph** (Advanced):
- Show co-occurrence of themes (which themes appear together in reviews)
- Node size = mention frequency
- Edge thickness = co-occurrence frequency
- Useful for identifying theme relationships

#### 4.5 Summary Dashboard

**Key Metrics Cards:**
- Total reviews analyzed
- Overall sentiment score
- Top themes by mentions
- Top themes by sentiment
- Positive/neutral/negative percentages

**Quick Insights:**
- Highlight themes with highest positive sentiment
- Flag themes needing attention (high negative sentiment)
- Show theme coverage (how many reviews mentioned each theme)

#### 4.6 Export Options

**Individual Visualizations:**
- Download each chart as PNG (high resolution, 300 DPI for presentations)
- Download as SVG (scalable vector graphics)
- Copy chart image to clipboard

**Complete Reports:**
- **PDF Report**: Comprehensive PDF including all visualizations, summary stats, and quotes
- **PowerPoint Export**: Generate .pptx with slides for each visualization (future enhancement)
- **HTML Report**: Interactive HTML page with all visualizations (shareable link)

**Data Exports:**
- **CSV**: Raw data with reviews, themes, sentiment scores
- **JSON**: Complete analysis results for programmatic access
- **Excel**: Formatted spreadsheet with charts embedded

**Shareable Links:**
- Generate unique URL for results page
- Password protection option (optional)
- Expiration settings (24 hours, 7 days, 30 days, or permanent)

**Visualization Requirements:**
- **Responsive Design**: 
  - Mobile-friendly layouts (charts resize appropriately)
  - Tablet optimization
  - Desktop full-width displays
- **Interactive Features**:
  - Hover tooltips with detailed information
  - Click to filter/highlight related data
  - Zoom functionality for detailed views
  - Legend toggle (show/hide data series)
- **Accessibility**:
  - High contrast color schemes
  - Alt text for all visualizations
  - Keyboard navigation support
  - Screen reader compatibility
- **Professional Styling**:
  - Consistent color palette (green=positive, yellow=neutral, red=negative)
  - Professional typography
  - Clean, minimal design
  - Customizable themes (light/dark mode option)

**Visualization Libraries:**
- **Word Clouds**: `react-wordcloud2` or `wordcloud2.js` (backup: `wordcloud`)
- **Charts**: `recharts` (React) or `Chart.js` with `react-chartjs-2`
- **Advanced Charts**: `d3.js` for custom visualizations (heatmaps, network graphs)
- **Export**: `html2canvas` + `jspdf` for PDF generation, `canvas-to-blob` for PNG export

### 5. Theme Fine-Tuning

**Real-time Refinement:**
- Show review quotes where themes were detected
- Allow users to add/remove keywords on the fly
- Preview changes before re-analyzing
- Show impact of keyword changes (mention count updates)

**Keyword Management:**
- Add single keywords or phrases
- Remove false positives
- Test keyword effectiveness with preview
- Suggest related keywords based on detected terms

### 6. Google Sheets Integration

**Export to Google Sheets:**
- User connects Google account (OAuth)
- Results automatically sync to user's Google Sheet
- Sheet includes: review text, detected themes, sentiment scores, quotes
- Updates in real-time as user refines themes

**Data Collection Sheet:**
- Anonymous results stored in Tourism Commons Google Sheet
- Only includes: theme configs, sentiment scores, keyword effectiveness
- Excludes: review text, personal identifiers, business names
- Used to improve sentiment analysis accuracy

## Development Status

### Current Setup (✅ Completed)

**Development Environment:**
- ✅ Frontend project initialized in `tools/tourism-sentiment/frontend/`
- ✅ Vite dev server configured and running
- ✅ Base path configured: `/sentiment-analysis/`
- ✅ Development server URL: `http://localhost:3001/sentiment-analysis/`
- ✅ Tailwind CSS v4 configured with `@tailwindcss/postcss`
- ✅ React Router configured with `/sentiment-analysis` route
- ✅ Basic MVP components: `ReviewInput`, `ResultsDisplay`, `WordCloud`

**Configuration Details:**
- **Package Manager**: npm
- **Build Tool**: Vite 7.1.8
- **Styling**: Tailwind CSS 4.1.14 (with `@tailwindcss/postcss` 4.1.16)
- **CSS Import**: `@import "tailwindcss";` (Tailwind v4 syntax)
- **PostCSS Config**: Uses `@tailwindcss/postcss` plugin
- **Server Port**: 3001
- **Base Path**: `/sentiment-analysis/`

**Available Scripts:**
```bash
cd tools/tourism-sentiment/frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

**Notes:**
- Server currently runs standalone on port 3001
- Base path `/sentiment-analysis/` configured for future deployment at `tourismcommons.com/sentiment-analysis`
- Aligned with `digital-assessment` tool architecture and configuration patterns

### Next Steps

- Complete MVP features (review input, theme selection, basic analysis)
- Implement sentiment analysis logic (currently using `sentiment` npm package)
- Build visualization components
- Add theme detection and matching
- Implement export functionality

## Technical Architecture

### Frontend

**Technology Stack:**
- React + TypeScript (aligned with digital-assessment tool)
- Recharts or Chart.js for visualizations
- Tailwind CSS v4 for styling (using `@tailwindcss/postcss`)
- React Router for navigation
- File upload handling (react-dropzone or similar)

**Key Components:**
- `UploadInterface.tsx` - File upload and text paste interface
- `ThemeSelector.tsx` - Default and custom theme selection
- `ThemeEditor.tsx` - Keyword editing for themes
- `ResultsDashboard.tsx` - Main results display with summary metrics
- `VisualizationPanel.tsx` - Main visualization container with tabs
- `WordCloud.tsx` - Word cloud visualization component (overall, theme-specific, sentiment-based)
- `ThemeCharts.tsx` - Bar charts, stacked bars, and theme analysis charts
- `SentimentCharts.tsx` - Sentiment distribution charts, pie charts, heatmaps
- `RadarChart.tsx` - Radar/spider chart for theme performance
- `TimelineChart.tsx` - Time-based sentiment trends (if dates provided)
- `QuoteViewer.tsx` - Expandable quote cards per theme with filtering
- `TreemapView.tsx` - Treemap visualization for theme importance
- `NetworkGraph.tsx` - Theme co-occurrence network visualization (advanced)
- `ExportPanel.tsx` - Download and share options (PNG, PDF, CSV, JSON)
- `ShareableLink.tsx` - Generate and manage shareable result links

### Backend

**API Layer:**
- Node.js/Express or Python FastAPI
- Sentiment analysis endpoints
- Theme detection endpoints
- File processing endpoints
- Google Sheets API integration

**Processing:**
- TextBlob (Python) or sentiment library (Node.js)
- Keyword matching algorithm
- Sentiment classification
- Quote extraction per theme

**Storage:**
- User sessions (temporary, Redis or in-memory)
- Theme configurations (localStorage + backend)
- Anonymous analytics data (database)

### Data Flow

```
1. User uploads data → Frontend validates
2. Frontend sends to backend API
3. Backend processes reviews:
   - Extract text
   - Run sentiment analysis
   - Match themes (keywords)
   - Calculate metrics
4. Return results to frontend
5. Frontend displays dashboard
6. User refines themes → Re-analyze
7. User exports/shares results
8. (Optional) Sync to Google Sheets
9. (Optional) Submit anonymous data
```

## Privacy & Data Usage

### User Data Privacy

**Data Collection:**
- Users must explicitly opt-in to share anonymous data
- Clear checkbox: "Help improve tourism analysis (anonymous data only)"
- Explain what data is shared (theme configs, sentiment scores, NOT review text)

**Data Sharing Agreement:**
- Clear terms displayed during opt-in
- "By using this tool and opting in, you agree that Tourism Commons may use anonymized results to improve sentiment analysis for tourism"

**Data Retention:**
- Active analysis: Stored temporarily (24-48 hours) for user sessions
- Anonymous data: Retained for model improvement
- All personal data deleted after session expires

### Data Deletion

**Deletion Process:**
- Contact: `alex.jeffries+sentiment@gmail.com`
- Subject: "Delete Sentiment Analysis Data"
- Include: Session ID or timestamp of analysis
- Response: Confirmation within 7 days

**What Gets Deleted:**
- All uploaded review texts
- Personal identifiers (names, locations)
- Business names
- All user-specific data

**What Stays (if opted in):**
- Aggregated, anonymized statistics (theme effectiveness, keyword patterns)
- No way to link back to original reviews

## User Experience Flow

### Step 1: Welcome & Upload
- Landing page with tool description
- Clear instructions for upload methods
- Examples of supported formats
- Privacy notice and opt-in checkbox

### Step 2: Theme Selection
- Choose from default theme sets (Activities, Accommodations, Restaurants, Tour Operators, Universal)
- Preview theme keywords
- Option to start from scratch with custom themes
- Load saved custom theme sets

### Step 3: Initial Analysis
- Processing indicator
- Quick summary of results
- Theme mention overview
- Sentiment summary

### Step 4: Results Dashboard
- Theme breakdown with charts
- Click themes to see quotes and sentiment
- Interactive visualizations
- Refine themes button

### Step 5: Fine-Tuning
- View quotes where themes were detected
- Add/remove keywords per theme
- Preview changes
- Re-analyze with updated themes
- Save custom theme sets

### Step 6: Export & Share
- Download charts (PNG)
- Download full report (PDF)
- Download data (CSV/JSON)
- Generate shareable link
- Connect Google Sheets (optional)

## Implementation Phases

### Phase 1: MVP (Minimum Viable Product)
**Timeline: 2-3 weeks**

**Core Features:**
- CSV/text upload (basic validation)
- Default theme sets (Universal + 2 categories)
- Basic sentiment analysis (TextBlob or simple library)
- Keyword matching
- Simple charts (bar chart for mentions, sentiment distribution)
- Basic export (CSV download)

**Tech Stack:**
- React frontend (minimal styling)
- Python FastAPI backend (or Node.js)
- Basic sentiment library
- Simple chart library

### Phase 2: Enhanced Features
**Timeline: 3-4 weeks**

**Additions:**
- All default theme categories (Activities, Accommodations, Restaurants, Tour Operators)
- Custom theme creation
- Keyword fine-tuning with real-time preview
- Quote viewing per theme
- **Enhanced Visualizations**:
  - Word clouds (overall, theme-specific, sentiment-based)
  - Radar charts for theme performance
  - Stacked bar charts for sentiment distribution
  - Pie charts for sentiment breakdown
  - Heatmaps (theme × sentiment, time-based if dates provided)
  - Scatter plots (sentiment vs mentions, rating correlations)
- PDF report generation with all visualizations
- Theme save/load functionality
- Export individual charts as PNG

### Phase 3: Advanced Features
**Timeline: 2-3 weeks**

**Additions:**
- Google Sheets integration (OAuth)
- Shareable links with results (password protection, expiration)
- Time-based trends visualization (timeline charts if dates provided)
- **Advanced Visualizations**:
  - Treemap for theme importance visualization
  - Network graph for theme co-occurrence
  - Quote cards with filtering and search
  - Interactive dashboard with drill-down capabilities
- Mobile optimization (responsive charts, touch interactions)
- Performance improvements for larger datasets
- HTML report export (interactive shareable page)

### Phase 4: Polish & Deploy
**Timeline: 1-2 weeks**

**Finalization:**
- UI/UX refinements
- Comprehensive error handling
- Loading states and user feedback
- Privacy policy and terms of use
- Analytics integration
- Production deployment
- Documentation and user guides

## File Structure

```
tools/tourism-sentiment/
├── README.md
├── IMPLEMENTATION.md (this file)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadInterface.tsx
│   │   │   ├── ThemeSelector.tsx
│   │   │   ├── ThemeEditor.tsx
│   │   │   ├── ResultsDashboard.tsx
│   │   │   ├── VisualizationPanel.tsx
│   │   │   ├── visualizations/
│   │   │   │   ├── WordCloud.tsx
│   │   │   │   ├── ThemeCharts.tsx
│   │   │   │   ├── SentimentCharts.tsx
│   │   │   │   ├── RadarChart.tsx
│   │   │   │   ├── TimelineChart.tsx
│   │   │   │   ├── HeatmapView.tsx
│   │   │   │   ├── TreemapView.tsx
│   │   │   │   └── NetworkGraph.tsx
│   │   │   ├── QuoteViewer.tsx
│   │   │   ├── ExportPanel.tsx
│   │   │   └── ShareableLink.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── sentiment.ts
│   │   │   └── sheets.ts
│   │   ├── utils/
│   │   │   ├── themeDefaults.ts
│   │   │   └── validators.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── upload.ts
│   │   │   ├── analyze.ts
│   │   │   └── themes.ts
│   │   ├── services/
│   │   │   ├── sentiment.ts
│   │   │   ├── themeDetector.ts
│   │   │   └── sheets.ts
│   │   ├── utils/
│   │   │   ├── textProcessor.ts
│   │   │   └── validators.ts
│   │   └── server.ts
│   ├── requirements.txt (or package.json)
│   └── README.md
├── config/
│   ├── defaultThemes.json
│   └── privacyPolicy.md
└── docs/
    ├── USER_GUIDE.md
    └── API_DOCUMENTATION.md
```

## Default Theme Definitions

Complete theme definitions are stored in `config/defaultThemes.json`. Below is a summary:

### Universal Themes (9 themes)

1. **Cultural & Heritage Value** (27 keywords)
   - Keywords: culture, heritage, history, authentic, traditional, preservation, legacy, sacred, spiritual, etc.
   - Weight: 1.0

2. **Service & Staff Quality** (20 keywords)
   - Keywords: staff, guide, service, friendly, helpful, knowledgeable, hospitable, professional, etc.
   - Weight: 1.0

3. **Facilities & Infrastructure** (23 keywords)
   - Keywords: facilities, infrastructure, building, maintenance, clean, restroom, amenities, modern, etc.
   - Weight: 1.0

4. **Accessibility & Transport** (24 keywords)
   - Keywords: access, transport, location, parking, directions, ferry, boat, bus, taxi, navigate, etc.
   - Weight: 1.0

5. **Value for Money** (18 keywords)
   - Keywords: price, value, expensive, cheap, worth, cost, fee, affordable, overpriced, bargain, etc.
   - Weight: 1.0

6. **Safety & Security** (18 keywords)
   - Keywords: safe, safety, security, dangerous, risk, guard, protection, threat, unsafe, etc.
   - Weight: 1.0

7. **Educational & Informational Value** (22 keywords)
   - Keywords: learn, educational, informative, exhibit, explanation, knowledge, teach, insight, museum, etc.
   - Weight: 1.0

8. **Artistic & Creative Quality** (22 keywords)
   - Keywords: art, artistic, creative, beautiful, crafts, craftsmanship, design, gallery, artwork, etc.
   - Weight: 1.0

9. **Atmosphere & Overall Experience** (25 keywords)
   - Keywords: atmosphere, ambiance, experience, enjoyable, memorable, vibe, wonderful, amazing, disappointing, etc.
   - Weight: 1.0

### Category-Specific Themes

#### Activities (5 themes, 1.0-1.3 weight range)
- **Activity Quality**: activity, excursion, tour, fun, enjoyable, engaging, interactive
- **Guide Expertise**: guide, instructor, knowledgeable, expert, professional, passionate
- **Safety Measures**: safe, safety, equipment, helmet, life jacket, supervision
- **Equipment Quality**: equipment, gear, modern, well-maintained, condition
- **Duration & Timing**: duration, length, schedule, punctual, too short, rushed

#### Accommodations (5 themes, 1.1-1.3 weight range)
- **Room Quality**: room, bedroom, comfortable, spacious, clean, bed, bathroom, air conditioning
- **Facilities & Amenities**: pool, spa, gym, restaurant, bar, wifi, parking, laundry
- **Location & Access**: location, central, beach, waterfront, close to, accessible
- **Breakfast & Dining**: breakfast, meal, dining, buffet, fresh, variety
- **Cleanliness**: clean, cleanliness, hygiene, tidy, spotless, housekeeping

#### Restaurants (5 themes, 1.0-1.4 weight range)
- **Food Quality**: food, dish, meal, cuisine, delicious, tasty, flavor, fresh (1.4 weight - highest priority)
- **Service Speed**: service, wait, waiting, quick, fast, slow, prompt, efficient
- **Atmosphere**: atmosphere, ambiance, decor, romantic, cozy, lively, quiet
- **Value for Money**: price, expensive, affordable, overpriced, portion, quality
- **Dietary Options**: vegetarian, vegan, gluten-free, halal, allergy, dietary, menu

#### Tour Operators (5 themes, 1.1-1.4 weight range)
- **Guide Quality**: guide, tour guide, driver, knowledgeable, friendly, professional (1.4 weight - highest priority)
- **Itinerary Planning**: itinerary, schedule, planning, route, organized, well-planned, structured
- **Transportation**: vehicle, bus, car, comfortable, clean, reliable, air conditioning
- **Organization**: organized, coordination, efficient, smooth, professional, chaotic
- **Responsiveness**: responsive, communication, contact, reply, booking, confirmation

**Total**: 29 distinct themes across all categories

All themes include comprehensive keyword lists (typically 10-25 keywords each) optimized for tourism review analysis. Users can customize any theme or create entirely new ones.

## API Endpoints

### Analysis Endpoints

```
POST /api/analyze
Body: {
  reviews: [{text, rating?, date?}],
  themes: [{name, keywords, weight}],
  options: {
    caseSensitive: false,
    minSentiment: -1,
    maxSentiment: 1
  }
}
Response: {
  results: {
    totalReviews: number,
    themes: {
      [themeName]: {
        mentions: number,
        sentimentScore: number,
        positiveCount: number,
        neutralCount: number,
        negativeCount: number,
        quotes: string[]
      }
    },
    overallSentiment: number
  }
}
```

### Theme Endpoints

```
GET /api/themes/default/:category
Response: { themes: [...] }

POST /api/themes/custom
Body: { themes: [...] }
Response: { success: boolean, themeSetId: string }
```

### Visualization Data Endpoints

```
GET /api/visualizations/:sessionId/wordcloud
Query params:
  - type: 'overall' | 'theme' | 'sentiment' | 'theme-sentiment'
  - theme?: string (if type is 'theme' or 'theme-sentiment')
  - sentiment?: 'positive' | 'negative' | 'neutral' (if type is 'sentiment' or 'theme-sentiment')
  - minFreq?: number (default: 2)
  - maxWords?: number (default: 100)
Response: {
  words: [{text: string, value: number, sentiment?: number}],
  totalWords: number,
  options: {...}
}

GET /api/visualizations/:sessionId/heatmap
Query params:
  - type: 'theme-sentiment' | 'time-sentiment' | 'rating-sentiment'
Response: {
  data: {[key]: number}[], // Grid data for heatmap
  xLabels: string[],
  yLabels: string[],
  colorScale: {min: number, max: number}
}

GET /api/visualizations/:sessionId/cooccurrence
Response: {
  nodes: [{id: string, value: number}], // Themes
  links: [{source: string, target: string, value: number}] // Co-occurrence frequency
}
```

### Export Endpoints

```
GET /api/export/:sessionId/csv
GET /api/export/:sessionId/json
GET /api/export/:sessionId/pdf
GET /api/export/:sessionId/chart/:chartType/png
  - chartType: 'wordcloud' | 'barchart' | 'radar' | 'heatmap' | 'timeline' | etc.
GET /api/export/:sessionId/report/html (generates shareable HTML report)
```

## Deployment

### Hosting

- **Frontend**: Vercel, Netlify, or S3 + CloudFront
- **Backend**: Railway, Render, or AWS Lambda
- **Database**: PostgreSQL or MongoDB (for anonymous analytics)

### URL Structure

- Main tool: `tourismcommons.com/sentiment-analysis`
- Shareable results: `tourismcommons.com/sentiment-analysis/results/[session-id]`
- Documentation: `tourismcommons.com/sentiment-analysis/docs`

### Environment Variables

```
VITE_API_URL=https://api.tourismcommons.com
GOOGLE_SHEETS_CLIENT_ID=...
GOOGLE_SHEETS_CLIENT_SECRET=...
DATABASE_URL=...
SENTIMENT_MODEL_PATH=...
```

## Success Metrics

- **User Adoption**: Number of analyses per month
- **Data Quality**: Opt-in rate for data sharing
- **User Retention**: Users who create custom themes
- **Export Usage**: PDF/CSV downloads vs shareable links
- **Feedback**: User satisfaction surveys

## Future Enhancements

- Multi-language support (auto-detect and translate)
- Batch processing for larger datasets (paid tier?)
- API access for developers
- Integration with review platforms (TripAdvisor, Booking.com)
- Machine learning model training from collected data
- Real-time collaboration on theme sets
- Template gallery (pre-built theme sets for specific use cases)

## Questions & Next Steps

1. **Technology Preference**: Python backend (TextBlob) vs Node.js (flexibility)?
2. **Hosting**: Preferred hosting platform?
3. **Authentication**: Simple session-based or full user accounts?
4. **Data Storage**: How long to keep user session data?
5. **Monetization**: Free tool, or premium features?
6. **Analytics**: What analytics to track beyond mentioned metrics?

## References

- Existing sentiment analysis: `digital_assessment/sentiment/`
- Theme definitions: `digital_assessment/sentiment/data/sentiment_data/config/analysis_themes.json`
- Frontend example: `tools/digital-assessment/src/pages/ReviewsSentiment.tsx`
- Visualization component: `tools/digital-assessment/src/components/ThemeComparison.tsx`

