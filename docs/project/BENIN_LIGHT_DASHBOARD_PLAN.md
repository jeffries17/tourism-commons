# Benin Light Dashboard - Implementation Plan

## Goal
Create a lightweight dashboard for Benin focused on sentiment analysis with French-to-English translation support, displaying themes across sectors.

## What Benin Needs

### 1. **Configuration** ✅ (Already Created)
- `projects/benin/config/project_config.json` - Basic config already created
- Will need to update with Benin-specific paths and settings

### 2. **Dashboard Components** (CAN BE SHARED)
These React components can be reused with minimal changes:

**From `dashboard/src/pages/`:**
- ✅ `ReviewsSentiment.tsx` - Main sentiment analysis page (SHARE)
- ✅ Chart components from `ReviewsSentiment` - Theme visualizations (SHARE)
- ✅ Sentiment data loading logic (SHARE)

**What needs project-specific data:**
- Sentiment data JSON files (Benin-specific)
- Theme configuration (might need French keywords)

### 3. **Sentiment Analysis Scripts** (CAN BE SHARED)
These Python scripts in `sentiment/scripts/` can be reused:

**Core Scripts to Copy:**
- ✅ `comprehensive_sentiment_analysis.py` - Main sentiment analyzer
- ✅ `enhanced_theme_analysis.py` - Theme detection
- ✅ `batch_translate.py` - Translation workflow
- ✅ `translate_reviews.py` - Single file translation
- ✅ `generate_sentiment_charts.py` - Chart generation
- ✅ All theme analyzer scripts

**What makes them work:**
- Theme keywords (currently English, needs French additions)
- Language detection patterns (needs French support)
- Translation API configuration (already configured)

### 4. **Data** (BENIN-SPECIFIC)
Need Benin review data:

**Structure needed:**
```
projects/benin/data/
├── raw_reviews/          # Original French reviews from sources
│   └── [sector]/         # Organized by sector
│       └── [stakeholder]_reviews.json
├── translated_reviews/   # English translations
│   └── [stakeholder]_reviews_ENG.json
└── sentiment_outputs/    # Generated sentiment data
    ├── sentiment_data.json
    └── [sector]_sentiment.json
```

**Data Requirements:**
- Review files from French sources (TripAdvisor, Google, etc.)
- One sector selected (e.g., "Crafts and artisan products", "Fashion & Design", or "Cultural heritage sites/museums")
- Minimum: 5-10 stakeholders per sector
- Reviews preferably in French (will translate)

### 5. **Theme Keywords** (NEEDS FRENCH VERSION)

Current theme keywords are in English. Need French versions:

**Current English Themes:**
```
- cultural_heritage
- service_staff
- facilities_infrastructure
- accessibility_transport
- value_money
- safety_security
- educational_value
- artistic_creative
- atmosphere_experience
```

**French Keywords Needed:**
```
- cultural_heritage: patrimoine, culture, histoire, historique, traditionnel, authentique
- service_staff: personnel, serveur, amical, serviable, service, professionnel
- facilities_infrastructure: installations, bâtiment, propre, entretenu, modern
- accessibility_transport: accessible, transport, emplacement, parking, facile
- value_money: prix, valeur, cher, bon marché, ça vaut la peine
- safety_security: sûr, sécurité, confortable, dangereux
- educational_value: informatif, éducatif, guide, intéressant, instructif
- artistic_creative: artistique, créatif, beau, artisanat, art, galerie
- atmosphere_experience: atmosphère, expérience, ambiance, merveilleux
```

## What to Copy vs Share

### **SHARE (Don't Copy)**
✅ Dashboard React components (`ReviewsSentiment.tsx` and related)
✅ Sentiment analysis Python scripts
✅ Theme analysis utilities
✅ Translation scripts
✅ Chart generation scripts
✅ Shared utilities in `/shared/`

### **COPY (Project-Specific)**
✅ Sentiment data JSON files (generated from Benin reviews)
✅ Project configuration (`project_config.json`)
✅ Theme keyword files with French keywords
✅ Raw review data
✅ Translated reviews
✅ Generated output files

### **CREATE/ADAPT**
🔄 Add French keyword support to theme analyzers
🔄 Update language detection patterns for French
🔄 Create Benin sector-specific data structure

## Implementation Steps

### Step 1: Data Collection (You do this)
1. Collect Benin reviews for one sector (French reviews)
2. Organize by stakeholder
3. Save as JSON files in `projects/benin/data/raw_reviews/[sector]/`

### Step 2: Add French Support (We do this)
1. Add French keywords to theme analyzers
2. Update language detection for French
3. Test translation workflow

### Step 3: Translation
1. Run batch translation on French reviews
2. Creates `_ENG.json` files for all reviews
3. Verify translation quality

### Step 4: Sentiment Analysis
1. Run comprehensive sentiment analysis on translated reviews
2. Generate `sentiment_data.json` for Benin
3. Create sector-specific outputs

### Step 5: Dashboard Integration
1. Copy sentiment JSON to `projects/benin/public/` or `dashboard/public/`
2. Update Benita config to point to data
3. Dashboard should just work!

## Minimal File Structure for Benin

```
projects/benin/
├── config/
│   └── project_config.json          # Already created ✅
├── data/
│   ├── raw_reviews/
│   │   └── [sector]/                # French reviews from sources
│   ├── translated_reviews/          # English versions
│   └── sentiment_outputs/           # Generated sentiment data
└── public/                          # Data for dashboard
    └── sentiment_data.json          # Final formatted data
```

## What You Need to Provide

### Input Required:
1. **Review Data**: French reviews for 5-10 Benin stakeholders in one sector
2. **Sector Selection**: Which sector? (Crafts, Fashion, Museums, etc.)
3. **Data Sources**: Where are you getting reviews? (TripAdvisor, Google Reviews, etc.)

### Minimum Data:
- 500+ reviews total (50-100 per stakeholder ideal)
- Mix of positive/negative/neutral reviews
- French language (we'll translate)
- Organized by stakeholder

## Next Steps

1. **Confirm sector and data availability**
2. **Set up French keyword support** (modify theme analyzers)
3. **Test translation workflow** with sample French data
4. **Run full pipeline** once we have Benin data
5. **Deploy light dashboard** with sentiment visualization

## Questions

- Which sector should we focus on for Benin?
- Do you already have French review data, or do we need to scrape it?
- How many stakeholders are available in the selected sector?
- Any specific themes you want to emphasize for Benin?

