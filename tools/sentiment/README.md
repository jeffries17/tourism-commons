# Tourism Sentiment Analysis - MVP

A minimal viable product for analyzing single reviews locally with sentiment analysis and theme detection.

## Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at `http://localhost:3001`

## Features

- **Sentiment Analysis**: Analyzes review text and provides sentiment score (-1 to +1)
- **Theme Detection**: Detects themes from 29 default themes (Universal + category-specific)
- **Word Cloud**: Visual representation of most frequent words
- **Visualizations**: 
  - Theme mention bar chart
  - Sentiment breakdown pie chart
  - Word frequency cloud

## Usage

1. Enter a review in the text area (or click "Load Example" for a sample)
2. Click "Analyze Review"
3. View results:
   - Overall sentiment score and label
   - Detected themes with mention counts
   - Example sentences for each theme
   - Word cloud
   - Positive/negative word breakdown

## Technologies

- React 18 + TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Recharts for charts
- `sentiment` library for sentiment analysis
- Custom word cloud implementation

## Next Steps

- Add theme customization (add/remove keywords)
- Support for multiple reviews
- Export results as PDF/CSV
- More advanced visualizations
- Theme refinement interface

