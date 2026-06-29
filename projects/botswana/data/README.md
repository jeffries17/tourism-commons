# Botswana Data Pipeline

## Pipeline Steps

### Step 1 — Drop the scrape
Copy the raw TripAdvisor JSON file into `data/raw/`.
The filename doesn't matter — the scripts auto-detect the first `.json` file in that folder.

### Step 2 — Qualify stakeholders
```bash
python qualify_botswana_stakeholders.py
```
Scores all scraped operators for ecotourism/adventure relevance.
Outputs `qualification_results.csv` (open in Excel or Google Sheets) and `qualification_results.json`.

- **INCLUDE** (score ≥ 0.15) → goes into the full analysis
- **REVIEW** (score 0.05–0.15) → check manually (may be a valid operator with few reviews)
- **EXCLUDE** (score < 0.05 or exclusion signals) → casinos, malls, restaurants, etc.

### Step 3 — Configure the qualified list
Open `organize_botswana_reviews.py` and paste the INCLUDE (+ any manually approved REVIEW) names into `QUALIFIED_STAKEHOLDERS`.

Optionally override sector/zone/tier in `STAKEHOLDER_TAGS` for any operator where the auto-inference is wrong.

### Step 4 — Organise reviews
```bash
python organize_botswana_reviews.py
```
Splits reviews into one file per stakeholder in `data/prepared/`.
Tags each with sector, zone, and price tier.

### Step 5 — Translate to English (harmonisation)
```bash
python translate_to_english.py
```
Detects the language of each review and translates non-English reviews (German, Dutch, Afrikaans, etc.) to English via Google Cloud Translation. English reviews are passed through untouched.

Every review retains its original fields — `original_text`, `original_title`, `original_language`, `was_translated`, plus all dates, ratings, and placeInfo. Language counts, dates, and other metadata are fully preserved for reporting.

Output: `data/translated/<stakeholder>_reviews.json`

### Step 6 — Run sentiment analysis
```bash
python run_botswana_sentiment.py
```
Runs 11-theme Botswana sentiment analysis. Automatically reads from `data/translated/` if available, otherwise falls back to `data/prepared/`. Uses `translated_text`/`translated_title` fields for analysis while preserving original language counts in the output.
Output: `data/sentiment_outputs/botswana_sentiment_analysis.json`
Includes sector averages, zone averages, seasonal breakdown, and language distribution.

### Step 7 — Format for dashboard
```bash
python format_botswana_dashboard.py
```
Converts analysis to dashboard JSON with sector/zone summaries and eco-credibility scores.
Output: `dashboard/public/botswana_sentiment_data.json`

---

## Themes (11)
| Theme | What it measures |
|---|---|
| wildlife_experience | Sightings, guide quality, encounter uniqueness |
| eco_conservation | Sustainability, conservation practices |
| service_hospitality | Staff, rangers, camp management |
| accommodation_quality | Tents, lodges, facilities |
| value_money | Price-to-experience ratio |
| accessibility_logistics | Transfers, flights, getting there |
| adventure_activities | Mokoro, walking safari, horseback, boat, fly-camp |
| safety | Wildlife safety, camp security |
| atmosphere_wilderness | Remoteness, silence, landscape, exclusivity |
| food_dining | Bush meals, sundowners |
| environmental_sensitivity | Crowding, noise, over-tourism |

## Data Scope
Reviews are filtered to **March 2021 onwards** (one year after COVID-19). Reviews from March 2020–February 2021 are excluded as the pandemic severely disrupted tourism operations, staffing, and visitor experience in ways that don't reflect the current product. This is noted in the methodology section of the report.

## Eco-credibility Index
Novel composite metric derived from review language — a proxy for how well operators
deliver on Botswana's conservation-first brand promise.
Weights: eco_conservation (40%), wildlife_experience (25%), atmosphere_wilderness (20%), environmental_sensitivity (15%)
