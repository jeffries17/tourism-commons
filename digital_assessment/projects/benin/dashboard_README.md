# Benin Cultural Heritage Dashboard

## Overview

This is a **standalone, light dashboard** for Benin cultural heritage sentiment analysis. It is **separate from the main Gambia dashboard** and should be deployed independently.

## What's Included

- ✅ **Data**: 30 cultural heritage sites, 1,284 reviews
- ✅ **Translation**: All reviews harmonized to French
- ✅ **Sentiment Analysis**: Complete with 9 themes
- ✅ **Dashboard Page**: `BeninSentiment.tsx` component ready
- ✅ **Formatted Data**: `benin_sentiment_data.json` in `/dashboard/public/`

## Setup Options

### Option 1: Simple Standalone HTML Dashboard (Recommended for Light Dashboard)

Create a simple, standalone HTML file that can be hosted anywhere:

```bash
# Generate a simple HTML dashboard
cd digital_assessment/projects/benin
python3 data/generate_simple_html_dashboard.py
```

### Option 2: Separate Vite App

Create a new Vite app in the projects/benin directory:

```bash
cd digital_assessment/projects/benin
npm create vite@latest dashboard -- --template react-ts
cd dashboard
npm install recharts
# Copy BeninSentiment.tsx to src/pages/
```

### Option 3: Multi-Project Router (Future)

Implement a project selector/router that loads different projects based on URL:

- `/gambia-itc/*` → Gambia dashboard
- `/benin-itc/*` → Benin dashboard
- `/` → Project selector

## Current Files Ready for Use

1. **Dashboard Component**: `digital_assessment/dashboard/src/pages/BeninSentiment.tsx`
   - ✅ Complete UI with theme analysis
   - ✅ Language distribution charts
   - ✅ Site-by-site sentiment scores
   - ✅ Responsive design

2. **Data File**: `digital_assessment/dashboard/public/benin_sentiment_data.json`
   - ✅ 30 stakeholders formatted
   - ✅ Theme scores included
   - ✅ Language distribution included

## Next Steps

Choose your deployment approach:

1. **Quick & Simple**: Generate standalone HTML dashboard
2. **Full Stack**: Set up separate Vite app for Benin
3. **Integrated**: Build multi-project router system

## Testing Locally

If you want to quickly preview the Benin dashboard component:

```bash
# Temporarily add Benin route to test
# (Note: This should be removed before production)

# Then navigate to:
http://localhost:5173/benin-sentiment
```

**Remember**: Remove the Benin route from the Gambia dashboard before deploying!

