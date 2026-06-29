# Starting a New Country Project

This guide covers adding a new country/client project to Tourism Commons — from raw data to a live dashboard.

There are two project types. Pick the one that fits:

| Type | Example | What it involves |
|---|---|---|
| **Sentiment dashboard** | Botswana, Benin | Raw reviews → sentiment analysis → React dashboard |
| **Digital assessment** | Gambia | Google Sheets survey → scoring engine → dashboard + reports |

The steps below cover the **sentiment dashboard** path (Botswana model), which is the standard pattern for new engagements.

---

## Step 1 — Scaffold the project folder

Create the project folder structure under `projects/`:

```
projects/{country}/
├── data/
│   ├── raw/                  ← drop the raw TripAdvisor JSON here
│   ├── prepared/             ← auto-generated: one file per stakeholder
│   ├── translated/           ← auto-generated: translated reviews
│   └── sentiment_outputs/    ← auto-generated: sentiment results
├── dashboard/                ← React SPA (copy from projects/botswana/dashboard)
│   ├── public/
│   │   └── {country}_sentiment_data.json   ← final dashboard data (generated)
│   └── src/
└── config/
    └── project_config.json
```

Copy the Botswana data scripts as your starting point:

```bash
cp projects/botswana/data/organize_botswana_reviews.py  projects/{country}/data/organize_{country}_reviews.py
cp projects/botswana/data/qualify_botswana_stakeholders.py  projects/{country}/data/qualify_{country}_stakeholders.py
cp projects/botswana/data/translate_to_english.py  projects/{country}/data/translate_to_english.py
cp projects/botswana/data/run_botswana_sentiment.py  projects/{country}/data/run_{country}_sentiment.py
cp projects/botswana/data/format_botswana_dashboard.py  projects/{country}/data/format_{country}_dashboard.py
```

Then update the country name, themes, and any project-specific logic in each script.

---

## Step 2 — Set up the Python environment

From the `pipeline/` folder:

```bash
cd pipeline
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

If translation is needed, ensure `GOOGLE_APPLICATION_CREDENTIALS` is set in `pipeline/.env`.

---

## Step 3 — Run the data pipeline

Work through these steps from `projects/{country}/data/`:

### 3a. Drop the raw data
Copy the TripAdvisor JSON scrape into `data/raw/`. Scripts auto-detect the first `.json` file in that folder.

### 3b. Qualify stakeholders
```bash
python qualify_{country}_stakeholders.py
```
Scores all scraped operators for relevance. Outputs `qualification_results.csv` — open in a spreadsheet and manually review borderline cases.

- **INCLUDE** (score ≥ 0.15) → full analysis
- **REVIEW** (score 0.05–0.15) → check manually
- **EXCLUDE** (score < 0.05) → irrelevant (restaurants, malls, etc.)

### 3c. Configure and organise reviews
Open `organize_{country}_reviews.py` and paste the approved stakeholder names into `QUALIFIED_STAKEHOLDERS`. Override sector/zone/tier tags in `STAKEHOLDER_TAGS` where auto-inference is wrong. Then run:

```bash
python organize_{country}_reviews.py
```

Outputs one JSON file per stakeholder in `data/prepared/`.

### 3d. Translate (if needed)
For non-English markets (or mixed-language review sets):
```bash
python translate_to_english.py
```
Uses Google Cloud Translation. Passes English reviews through untouched. Outputs to `data/translated/`.

For French-language dashboards (e.g. Benin), see `projects/benin/data/` for the French translation variants.

### 3e. Run sentiment analysis
```bash
python run_{country}_sentiment.py
```
Outputs `data/sentiment_outputs/{country}_sentiment_analysis.json` with per-stakeholder scores, sector averages, zone averages, and seasonal breakdown.

**Themes to define upfront** — before running, decide on 8–12 themes appropriate to the destination type. See Botswana's 11-theme set in `projects/botswana/data/README.md` as a reference. Add a themes table to your project's `data/README.md`.

### 3f. Format for dashboard
```bash
python format_{country}_dashboard.py
```
Converts analysis to the dashboard JSON format. Output: `dashboard/public/{country}_sentiment_data.json`.

---

## Step 4 — Build the dashboard

Copy the Botswana dashboard as a starting point:

```bash
cp -r projects/botswana/dashboard projects/{country}/dashboard
cd projects/{country}/dashboard
npm install
```

Key files to update:
- `src/types.ts` — update type definitions to match your JSON structure
- `src/pages/Overview.tsx` — update sector names, zone names, key metrics
- `src/pages/Sectors.tsx`, `Geography.tsx`, `Findings.tsx` — adapt to your data shape
- `public/{country}_sentiment_data.json` — generated in Step 3f
- `index.html` — update `<title>`
- `vite.config.ts` — update `base` path to `/{country}/`

Test locally:
```bash
npm run dev
```

---

## Step 5 — Register the project in projects.json

Add one entry to `projects.json` at the repo root:

```json
{ "id": "{country}", "type": "react", "src": "projects/{country}/dashboard" }
```

That's the only change needed to include it in the build.

---

## Step 6 — Add the Firebase routing rewrite

In `firebase.json`, add a rewrite for the new SPA:

```json
{
  "source": "/{country}/**",
  "destination": "/{country}/index.html"
}
```

---

## Step 7 — Build and deploy

```bash
npm run build          # builds all projects including the new one
firebase deploy --only hosting
```

The dashboard will be live at `https://tourismcommons.org/{country}`.

---

## Notes

- **Date filtering** — consider filtering reviews to post-COVID (March 2021+) as done for Botswana, unless the destination was less impacted
- **Language** — for francophone markets, see `projects/benin/data/` for the French-first translation workflow
- **Eco-credibility or custom composite scores** — if the destination has a signature metric (like Botswana's eco-credibility index), define it in `format_{country}_dashboard.py` and add it to the dashboard Overview page
- **Client URLs** — once shared with a client, the URL path (`/{country}`) is permanent; don't change it
