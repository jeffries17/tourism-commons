# Benin Light Dashboard - Layout Mockup

## Overview
A lightweight sentiment analysis dashboard for Benin, focused on displaying theme insights across a single sector with French translation support.

---

## Dashboard Layout

### Header
```
┌─────────────────────────────────────────────────────────────────┐
│  BENIN DIGITAL ASSESSMENT                                        │
│  Sentiment Analysis Dashboard                                    │
│                                                   🇧🇯 Benin       │
└─────────────────────────────────────────────────────────────────┘
```

### Main Content Area

#### 1. Sector Summary Card (Top Section)
```
┌─────────────────────────────────────────────────────────────┐
│  📊 [SECTOR NAME] - Overview                                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────┬─────────┬─────────┬─────────┐                │
│  │ Total   │ Reviews │ Avg     │ Overall │                │
│  │ Stake-  │ Analyzed│ Rating  │ Senti-  │                │
│  │ holders │         │         │ ment    │                │
│  ├─────────┼─────────┼─────────┼─────────┤                │
│  │   8     │  1,234  │  4.2/5  │  +0.45  │                │
│  └─────────┴─────────┴─────────┴─────────┘                │
│                                                               │
│  📈 +18%  improvement vs last quarter                      │
└─────────────────────────────────────────────────────────────┘
```

#### 2. Theme Performance (Large Chart Section)
```
┌─────────────────────────────────────────────────────────────┐
│  🎯 Theme Performance Across [Sector]                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [Interactive Bar Chart]                                      │
│                                                               │
│  ────────┬───────────────────────────────────────────       │
│  Cul.    │ ████████████▌ 0.72                              │
│  Heritage│                                                 │
│  ────────┼───────────────────────────────────────────       │
│  Service │ ██████████████████▌ 0.88                        │
│  Quality │                                                 │
│  ────────┼───────────────────────────────────────────       │
│  Artistic│ ████████████▌ 0.69                              │
│  Creative│                                                 │
│  ────────┼───────────────────────────────────────────       │
│  Edu.    │ ████████████████▌ 0.81                         │
│  Value   │                                                 │
│  ────────┼───────────────────────────────────────────       │
│  Atmo-   │ ████████████████████▌ 0.95                     │
│  sphere  │                                                 │
│  ────────┴───────────────────────────────────────────       │
│  -1.0       Negative           Neutral        Positive +1.0 │
└─────────────────────────────────────────────────────────────┘
```

#### 3. Top Performers vs Areas for Improvement
```
┌──────────────────────────────┬──────────────────────────────┐
│  🌟 Top Performing Themes    │  ⚠️  Areas for Improvement   │
├──────────────────────────────┼──────────────────────────────┤
│  ✓ Atmosphere               │  ⚠ Accessibility             │
│     Score: +0.95             │     Score: -0.12             │
│     Mention rate: 78%        │     Mention rate: 45%        │
│                              │                              │
│  ✓ Service Quality          │  ⚠ Safety Concerns           │
│     Score: +0.88             │     Score: +0.15              │
│     Mention rate: 82%        │     Mention rate: 12%        │
└──────────────────────────────┴──────────────────────────────┘
```

#### 4. Sample Quotes from Reviews
```
┌─────────────────────────────────────────────────────────────┐
│  💬 What Visitors Say                                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Theme: Atmosphere                                            │
│  ⭐⭐⭐⭐⭐ (5/5)                                             │
│  "Incroyable expérience! L'atmosphère était merveilleuse."  │
│  ─ Visitor from France                                       │
│                                                               │
│  Theme: Service Quality                                      │
│  ⭐⭐⭐⭐☆ (4/5)                                             │
│  "Le personnel était très serviable et professionnel."     │
│  ─ Visitor from Belgium                                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Requirements Template

### For TripAdvisor Data Collection

Save each stakeholder's reviews in this format:

```json
[
  {
    "title": "Amazing cultural experience",
    "rating": 5,
    "text": "Une expérience culturelle incroyable. Le musée offre un aperçu fascinant de l'histoire et de la culture du Bénin. Le personnel était très informatif.",
    "date": "2024-08-15",
    "reviewer": {
      "username": "MarieB",
      "location": "Paris, France",
      "contributions": 45,
      "languages": ["French", "English"]
    },
    "placeInfo": {
      "name": "Musée d'Histoire de Ouidah",
      "category": "Museum",
      "location": "Ouidah, Benin"
    },
    "language_detected": "fr",
    "translated": false
  }
]
```

### File Structure Needed
```
projects/benin/data/
├── raw_reviews/
│   └── [sector_name]/                    # e.g., "cultural_heritage"
│       ├── musee_histoire_ouidah_reviews.json
│       ├── musee_fondation_zinsou_reviews.json
│       ├── pontonhue_reviews.json
│       └── [more_stakeholders...]
└── README.md (explaining data format)
```

### Minimum Data Needed
- **Sector**: Choose one (Museums, Crafts, Fashion, Arts, etc.)
- **Stakeholders**: 5-10 stakeholders per sector
- **Reviews**: 50-100 reviews per stakeholder (minimum 20)
- **Languages**: French (we'll translate)
- **Sources**: TripAdvisor, Google Reviews, or booking.com

### For Scripts to Work
You need ONE folder structure like this:
```
projects/benin/data/raw_reviews/cultural_heritage/
├── stakeholder_1_reviews.json
├── stakeholder_2_reviews.json
└── stakeholder_3_reviews.json
```

Each JSON file contains array of review objects as shown above.

---

## Features in Dashboard

### ✅ What Will Be Included
1. **Sector Overview Card** - Summary stats
2. **Theme Performance Chart** - Bar chart of all 9 themes
3. **Top Performers** - Best-rated themes
4. **Areas for Improvement** - Themes needing attention
5. **Sample Quotes** - Real translated review excerpts
6. **Language Distribution** - Show French vs other languages
7. **Translation Toggle** - Show original French or English

### ✅ Already Working (From Shared Code)
- Review translation workflow
- Sentiment scoring
- Theme detection
- Chart generation
- Data export

---

## What We Need From You

### Immediate
1. **Which sector** do you want to analyze? (Museums, Crafts, Arts, etc.)
2. **Do you have TripAdvisor data** or need help scraping?
3. **How many stakeholders** in that sector?

### Data Format
Just save TripAdvisor reviews as JSON files. Can provide scraping help if needed.

---

## Visual Style

- **Color Scheme**: Benin green (#008751)
- **Language Display**: French by default, toggle to English
- **Charts**: Clean, minimalist bar charts
- **Layout**: Single column, mobile-responsive
- **Typography**: Clear French-friendly fonts

---

## When You Have Data

1. Save to `projects/benin/data/raw_reviews/[sector]/`
2. Run: `python batch_translate.py --project benin --sector [sector]`
3. Run: `python sentiment_analysis.py --project benin`
4. Data automatically appears in dashboard!

Will create dashboard skeleton next.

