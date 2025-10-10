# Digital Assessment (Firebase)

This is the migration of the Apps Script–based assessment into a deployable Firebase web app and API.

## Folder Structure

### Core Application
- `functions/` - Firebase Functions (Express) API reading the master Google Sheet
- `dashboard/` - Dashboard visualization components
- `hosting/` - Firebase hosting configuration
- `google_scripts/` - Google Sheets integration scripts

### Data & Configuration
- `config/` - Configuration files, credentials, and survey structures
- `data/` - Organized data files
  - `benchmarks/` - Country, regional, and sector benchmark data
  - `surveys/` - Entity data, matrices, and survey outputs
- `docs/` - Documentation, implementation plans, and guides

### Analysis & Tools
- `ito_analyzed/` - International Tour Operator (ITO) analyzed results
- `ito_scraped/` - ITO scraped content
- `archived/` - Historical analysis results and one-time batch outputs
- `scripts/` - Utility scripts for assessments

### Python Scripts (Root Level)
Analysis and generation scripts for various assessment aspects:
- `*_analyzer.py` - Content and visual analysis tools
- `*_generator.py` - Report and recommendation generators  
- `*_scraper.py` - Content scraping utilities
- `run_*.py` - Batch processing and execution scripts
- `phase*.py` - Multi-phase workflow scripts

### Legacy Structure (For Reference)
- `app/web`: React + Vite frontend (deprecated - see `dashboard/`)
- `firebase.json`: Firebase Hosting + Functions config (rewrites `/api/**`)

## Recent Cleanup (October 2025)

The following types of files have been removed to declutter the workspace:
- ✅ One-time test scripts (`test_*.py`)
- ✅ One-time setup/fix scripts (`setup_*.py`, `fix_*.py`, `check_*.py`)
- ✅ Historical log files (`*.log`)
- ✅ Timestamped batch output JSONs (moved to `archived/`)
- ✅ Old shell scripts for one-time setup/activation

Files have been reorganized into logical folders (`config/`, `data/`, `archived/`) for better maintainability.

## Local development

1. API: set env and start emulators

```
cd functions
npm i
export SHEET_ID=YOUR_SHEET_ID
# optional for local auth: export GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
npm run build
npm run serve
```

2. Web: start Vite dev server

```
cd app/web
npm i
# Optional: create .env with VITE_API_URL=http://localhost:8787
npm run dev
```

Open the web app at the printed Vite URL (usually http://localhost:5173). In production it will call the Functions API via `/api/*`.

Deploy

```
cd app/web && npm run build
cd ../../functions && npm run deploy:all
```

Notes

- Functions expect `SHEET_ID` to be configured as a secret in production: `firebase functions:secrets:set SHEET_ID`
- For local dev, plain env vars are sufficient.

## Technical Website Audit Tool

Automatically audit all stakeholder websites for performance, SEO, mobile responsiveness, and security issues.

### Quick Start

```bash
# Set PageSpeed API key (optional but recommended)
export PAGESPEED_API_KEY='your_api_key_here'

# Run the audit
./run_technical_audit.sh

# Generate human-readable reports
python3 generate_recommendations_report.py
```

### What It Does

- ⚡ **Website Speed Analysis** - PageSpeed Insights scores for mobile and desktop
- 📱 **Mobile Responsiveness** - Viewport, tap targets, mobile optimization
- 🔍 **SEO Technical Issues** - Meta tags, titles, structured data
- 🔒 **Security Audit** - HTTPS, SSL certificates
- 🎯 **Priority Recommendations** - Categorized fixes by severity

### Output Files

- `technical_audit_report_*.json` - Complete technical data
- `technical_audit_recommendations.csv` - Spreadsheet for analysis
- `technical_audit_recommendations.md` - Detailed report for sharing

### Documentation

- **[Quick Start Guide](QUICK_START_TECHNICAL_AUDIT.md)** - Get started in 3 steps
- **[Full Documentation](TECHNICAL_AUDIT_GUIDE.md)** - Detailed usage and API setup
- **[Example Output](TECHNICAL_AUDIT_EXAMPLE_OUTPUT.md)** - See what results look like

Audits all websites from both CI Assessment and TO Assessment sheets automatically.
