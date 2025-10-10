# Tourism Commons

A comprehensive digital assessment platform for evaluating tourism stakeholders and International Tour Operators (ITOs), with advanced sentiment analysis capabilities.

**Status:** ✅ Production Ready | **Last Updated:** October 1, 2025

---

## 🚀 Quick Start

### Run ITO Assessment
```bash
cd digital_assessment/sentiment/scripts
python run_ito_assessment_from_sheet.py
```

### Run Sentiment Analysis
```bash
cd digital_assessment/sentiment/scripts
python comprehensive_sentiment_analysis.py
```

### Deploy to Firebase
```bash
cd digital_assessment
firebase deploy
```

---

## 📚 Documentation

### Start Here
- **[Production Setup](PRODUCTION_SETUP.md)** - Complete production structure and deployment guide
- **[Final Cleanup Report](FINAL_CLEANUP_REPORT.md)** - What was cleaned up and why

### Digital Assessment
- **[Digital Assessment Overview](digital_assessment/README.md)** - Main application overview
- **[ITOS Assessment Guide](digital_assessment/docs/ITOS_README.md)** - Complete ITOS assessment documentation
- **[Sentiment Analysis](digital_assessment/sentiment/README.md)** - Technical reference
- **[Workflows](digital_assessment/sentiment/WORKFLOWS.md)** - Step-by-step workflow guide

### Cleanup Details
- **[Cleanup Summary](CLEANUP_SUMMARY.md)** - Detailed cleanup log (43 files removed)

---

## 🏗️ Project Structure

```
tourism-commons/
│
├── firebase.json                      # Firebase configuration
│
├── digital_assessment/                # Main application
│   ├── functions/                    # Firebase Functions (Express API)
│   ├── hosting/                      # Firebase Hosting (static sites)
│   ├── sentiment/                    # Python analysis scripts (21 scripts)
│   ├── docs/                         # Documentation
│   └── google_scripts/               # Google Sheets Apps Scripts
│
└── docs/                              # General documentation
```

---

## 🎯 Main Components

### 1. Firebase Functions (API)
**Location:** `digital_assessment/functions/`

Express API with endpoints for:
- Participant data and scoring
- Sector intelligence
- ITO assessment data
- Sentiment analysis results

**Deploy:** `cd digital_assessment && firebase deploy --only functions`

---

### 2. Firebase Hosting
**Location:** `digital_assessment/hosting/public/`

Static hosting for:
- Landing page (`/`)
- Gambia ITC app (`/gambia-itc/`)

**Deploy:** `firebase deploy --only hosting`

---

### 3. ITOS Assessment System
**Location:** `digital_assessment/sentiment/scripts/`

Python scripts for analyzing how tour operators market destinations:
- 12 activity categories detection
- Product type classification
- Local partnership identification
- 32-column Google Sheets output

**Main Script:** `run_ito_assessment_from_sheet.py`  
**Documentation:** [ITOS Assessment Guide](digital_assessment/docs/ITOS_README.md)

---

### 4. Sentiment Analysis System
**Location:** `digital_assessment/sentiment/scripts/`

Python scripts for analyzing tourism stakeholder reviews:
- Theme-based sentiment analysis
- Quote extraction
- Critical area identification
- Sector-specific insights

**Main Scripts:**
- `comprehensive_sentiment_analysis.py` - All stakeholders
- `analyze_tour_operators.py` - Tour operators only
- `analyze_creative_industries.py` - Creative industries only

**Documentation:** [Workflows Guide](digital_assessment/sentiment/WORKFLOWS.md)

---

## 🛠️ Technologies

- **Backend:** TypeScript, Node.js, Express
- **Frontend:** React/Angular (Vite builds)
- **Analysis:** Python 3.9+
- **Hosting:** Firebase Hosting + Functions
- **Data:** Google Sheets API
- **Translation:** Google Cloud Translation API

---

## 📊 Recent Improvements (Oct 2025)

### Codebase Cleanup
- ✅ Reduced codebase by **40%**
- ✅ Consolidated **13 ITOS docs → 1 guide**
- ✅ Organized **56 scripts → 21 focused scripts**
- ✅ Removed **3 unused app directories**
- ✅ Single Firebase configuration
- ✅ Clear production structure

**Details:** See [Final Cleanup Report](FINAL_CLEANUP_REPORT.md)

---

## 🚦 Current Status

### Production Ready ✅
- Firebase Functions API deployed and working
- Firebase Hosting serving static assets
- ITOS Assessment system tested on 30 ITOs
- Sentiment analysis processing reviews
- Google Sheets integration functional

### In Development 🔄
- Scoring system updates (in preparation)
- Enhanced analytics features

---

## 💻 Development

### Prerequisites
```bash
# Node.js and Firebase CLI
npm install -g firebase-tools

# Python environment
python -m venv digital_assessment/sentiment_env
source digital_assessment/sentiment_env/bin/activate
pip install -r digital_assessment/requirements.txt
```

### Local Development

**API:**
```bash
cd digital_assessment/functions
npm install
export SHEET_ID=your_sheet_id
export GOOGLE_SERVICE_ACCOUNT_JSON='...'
npm run serve
# Runs on http://localhost:5009
```

**Analysis:**
```bash
cd digital_assessment/sentiment/scripts
source ../sentiment_env/bin/activate
python run_ito_assessment_from_sheet.py
```

---

## 📝 Environment Variables

### Required for Production
- `SHEET_ID` - Google Sheets ID for assessment data
- `GOOGLE_SERVICE_ACCOUNT_JSON` - Service account credentials

### Set in Firebase
```bash
firebase functions:secrets:set SHEET_ID
firebase functions:secrets:set GOOGLE_SERVICE_ACCOUNT_JSON
```

---

## 🎯 For Scoring Updates

When updating the scoring system, modify:

1. **API Layer:** `digital_assessment/functions/src/app.ts` (lines 920-1210)
2. **Data Models:** `digital_assessment/sentiment/scripts/itos_data_models.py`
3. **Analyzers:** `digital_assessment/sentiment/scripts/analyzers/*.py`
4. **Configuration:** `digital_assessment/sentiment/data/config/*.json`
5. **Google Sheets:** `digital_assessment/google_scripts/*.gs`

**Reference:** [Production Setup Guide](PRODUCTION_SETUP.md)

---

## 📞 Support & Documentation

- **Production setup questions:** [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)
- **ITOS assessment help:** [ITOS_README.md](digital_assessment/docs/ITOS_README.md)
- **Workflow questions:** [WORKFLOWS.md](digital_assessment/sentiment/WORKFLOWS.md)
- **Cleanup details:** [CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md)

---

## 🤝 Contributing

This codebase has been streamlined for maintainability. Please:
1. Follow the existing structure
2. Update documentation when making changes
3. Test locally before deploying
4. Keep scripts focused and single-purpose

---

## 📄 License

Part of the Tourism Commons initiative. See project documentation for licensing terms.

---

**Firebase Project:** tourism-development-d620c  
**Last Cleanup:** October 1, 2025  
**Codebase Status:** Streamlined & Production Ready

