# Benin Cultural Heritage Dashboard

A standalone sentiment analysis dashboard for Benin's cultural heritage sites.

## Features

- 📊 **30 Cultural Sites**: Comprehensive sentiment analysis
- 🌍 **1,284 Reviews**: From TripAdvisor across multiple languages
- 🇫🇷 **Harmonized Data**: All reviews translated to French for consistent analysis
- 📈 **Interactive Charts**: Bar charts, pie charts, and responsive cards
- 🎨 **Benin Theme**: Green/yellow/red color scheme

## Quick Start

```bash
cd digital_assessment/projects/benin/dashboard
npm install
npm run dev
```

Then open http://localhost:5173

## Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

## Data Source

The dashboard loads data from `public/benin_sentiment_data.json` which contains:
- 30 stakeholders (cultural sites)
- Sentiment scores for 9 themes
- Language distribution
- Theme performance metrics

## Project Structure

```
benin/dashboard/
├── public/
│   ├── benin_sentiment_data.json  # Main data file
│   └── vite.svg
├── src/
│   ├── pages/
│   │   └── BeninSentiment.tsx      # Main dashboard component
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                    # Tailwind CSS
├── package.json
└── README.md
```

## Technologies

- React 19
- TypeScript
- Vite
- Recharts (for charts)
- Tailwind CSS
- Lucide Icons

## Deployment

This is a standalone app that can be deployed to:
- Firebase Hosting
- Netlify
- Vercel
- GitHub Pages

Any static hosting service will work!
