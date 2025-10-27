# 📊 Google Sheets Integration - Setup Guide

## How to Connect to Your Google Sheet

This guide shows you how to set up the system to read from your Google Sheet, scrape the tour URLs, and write results back.

---

## 🎯 What This Will Do

1. **Read** your ITO data from Google Sheet (columns A-D)
2. **Scrape** all URLs (main Gambia page + individual tour pages)
3. **Analyze** all content with our 9 analyzers
4. **Write** 32-column results back to a new sheet

---

## 📋 Prerequisites

Your Google Sheet should have these columns:
- **Column A:** Operator Name
- **Column B:** Country
- **Column C:** Gambia Page Link (main overview page)
- **Column D:** Gambia Tour Page (specific tour URLs, comma-separated)

---

## 🔐 Step 1: Get Google Credentials

### Option A: Using Existing Project Credentials

If you already have credentials (like for your current system):

```bash
# Find your existing credentials
ls -la ~/tourism-commons/*.json
```

Look for a file like `tourism-development-d620c-5c9db9e21301.json`

### Option B: Create New Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create new one)
3. Enable **Google Sheets API**
4. Create **Service Account** credentials
5. Download JSON key file
6. Save it securely

---

## 🆔 Step 2: Get Your Spreadsheet ID

From your Google Sheet URL:
```
https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
                                       ^^^^^^^^^^^^^^^^^^^
```

Example:
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
```
Spreadsheet ID: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

---

## 🔧 Step 3: Grant Sheet Access

1. Open your Google Sheet
2. Click **Share** button
3. Add the service account email (from JSON credentials)
   - It looks like: `your-service@project-id.iam.gserviceaccount.com`
4. Give **Editor** permissions
5. Click **Done**

---

## ⚙️ Step 4: Configure the Script

### Method A: Environment Variables (Recommended)

```bash
# In your terminal, set these variables:
export GOOGLE_CREDENTIALS_PATH="/Users/alexjeffries/tourism-commons/tourism-development-d620c-5c9db9e21301.json"
export GOOGLE_SPREADSHEET_ID="your-spreadsheet-id-here"
```

### Method B: Edit the Script Directly

Open `google_sheets_ito_processor.py` and modify the `main()` function:

```python
def main():
    processor = GoogleSheetsITOProcessor(
        credentials_path='/Users/alexjeffries/tourism-commons/your-credentials.json',
        spreadsheet_id='your-spreadsheet-id-here'
    )
    
    processor.run_complete_workflow(
        input_sheet='Sheet1',           # Name of sheet with ITO data
        input_range='A2:D100',          # Range to read
        output_sheet='ITO Assessment Results'  # Where to write results
    )
```

---

## 🚀 Step 5: Run the Processor

```bash
cd /Users/alexjeffries/tourism-commons/digital_assessment/sentiment/scripts
python3 google_sheets_ito_processor.py
```

---

## 📊 What Will Happen

### Phase 1: Reading (5 seconds)
```
📊 Step 1: Reading from Google Sheet 'Sheet1'...
✅ Found 26 ITOs
```

### Phase 2: Scraping (2-5 minutes)
```
🌐 Step 2-3: Scraping content and running assessment...

[1/26] Scraping: Adventure Life
  Scraping: https://www.adventure-life.com/africa/cruises/18461/...
  ✓ Scraped 5,234 chars
  Scraping: https://www.adventure-life.com/africa/cruises/18460/...
  ✓ Scraped 4,891 chars
  Total content: 10,125 chars from 2 pages

[2/26] Scraping: African Travel Seminars
  ...
```

### Phase 3: Assessment (30 seconds)
```
Running assessments...
✅ Adventure Life: 8/12 activities, 1 audiences, Itinerary
✅ African Travel Seminars: 4/12 activities, 0 audiences, Flight+Hotel
...
```

### Phase 4: Writing Back (5 seconds)
```
💾 Step 4: Writing results to sheet 'ITO Assessment Results'...
✅ Wrote 27 rows to Google Sheets

✅ COMPLETE!
📊 Results written to: ITO Assessment Results
```

---

## 📋 Output

### New Sheet Created: "ITO Assessment Results"

Will have 32 columns with all assessments:

| Operator Name | Product Type | Sun & Beach | Nature & Wildlife | ... | Status |
|---------------|--------------|-------------|-------------------|-----|--------|
| Adventure Life | Itinerary | Yes | Yes | ... | Success |
| Apollo | Flight+Hotel | Yes | No | ... | Success |
| ... | ... | ... | ... | ... | ... |

---

## 🔍 Verify Results

1. Open your Google Sheet
2. Look for new tab: **"ITO Assessment Results"**
3. Check the data:
   - 32 columns
   - One row per ITO
   - Yes/No flags for activities
   - All fields populated

---

## 🐛 Troubleshooting

### Error: "Failed to initialize Google Sheets"
- ✅ Check credentials path is correct
- ✅ Check JSON file exists
- ✅ Check service account email is shared on the sheet

### Error: "No ITOs found in Google Sheet"
- ✅ Check sheet name is correct
- ✅ Check range includes your data (A2:D100)
- ✅ Check Column A has operator names

### Error: "Failed to scrape"
- ⚠️ Some sites block scrapers - this is normal
- ✅ Check URLs are valid
- ✅ Check internet connection

### Slow Scraping
- ⏱️ Normal! We wait 1 second between requests to be polite
- 📊 26 ITOs with 2 URLs each = ~1 minute scraping time
- 🎯 Could take 2-5 minutes total depending on page sizes

---

## 💡 Tips

### Test with Small Sample First

Modify the range to test on just a few ITOs:

```python
processor.run_complete_workflow(
    input_sheet='Sheet1',
    input_range='A2:D5',  # Just first 3 ITOs
    output_sheet='Test Results'
)
```

### Re-run Anytime

The script can be run multiple times:
- It will re-scrape fresh content
- It will overwrite the output sheet
- Good for tracking changes over time

### Save Historical Data

Before re-running, rename your output sheet:
- "ITO Assessment Results - Sept 2025"
- "ITO Assessment Results - Dec 2025"
- Track changes quarter-over-quarter

---

## 🔄 Quick Reference

### Full Workflow Command

```bash
# Set credentials (once per session)
export GOOGLE_CREDENTIALS_PATH="/path/to/credentials.json"
export GOOGLE_SPREADSHEET_ID="your-sheet-id"

# Run processor
cd /Users/alexjeffries/tourism-commons/digital_assessment/sentiment/scripts
python3 google_sheets_ito_processor.py
```

### What It Does

```
Google Sheet (A-D columns)
    ↓
Scrape all URLs (main + tour pages)
    ↓
Analyze content (9 analyzers)
    ↓
Google Sheet (32 columns, new tab)
```

---

## 📞 Need Help?

### Common Issues

1. **"Module not found" errors**
   ```bash
   pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client requests beautifulsoup4
   ```

2. **Permission denied**
   - Check service account has Editor access
   - Check credentials file is readable

3. **No results**
   - Check URLs in column C and D are valid
   - Check they start with http:// or https://

---

## ✅ Checklist

Before running:

- [ ] Google Sheets API enabled
- [ ] Service account credentials downloaded
- [ ] Service account email shared on sheet (Editor access)
- [ ] Spreadsheet ID copied
- [ ] Environment variables set OR script edited
- [ ] Python packages installed
- [ ] Sheet has data in columns A-D
- [ ] URLs in columns C-D are valid

Ready to run! 🚀

---

*Setup Guide v1.0 - September 30, 2025*
