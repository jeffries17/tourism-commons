# 🚀 Quick Start - Run Assessment on Your Google Sheet

## 3 Simple Steps to Process Your ITOs

---

## Step 1: Share Your Google Sheet (1 minute)

1. Open your Google Sheet with ITOs
2. Click **Share** button (top right)
3. Add this email address:
   ```
   tourism-commons@tourism-development-d620c.iam.gserviceaccount.com
   ```
4. Give it **Editor** permissions
5. Click **Done**

✅ This allows the script to read and write to your sheet

---

## Step 2: Get Your Spreadsheet ID (30 seconds)

1. Look at your Google Sheet URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
   ```

2. Copy the SPREADSHEET_ID part

Example:
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
                                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                        This is your SPREADSHEET_ID
```

---

## Step 3: Run the Script (2-5 minutes)

```bash
cd /Users/alexjeffries/tourism-commons/digital_assessment/sentiment/scripts

# Run with your spreadsheet ID
./run_google_sheets_assessment.sh YOUR_SPREADSHEET_ID
```

### What Will Happen:

1. **Reads** your ITO data from columns A-D
2. **Scrapes** all URLs (main page + tour pages from column D)
3. **Analyzes** everything with all 9 analyzers
4. **Writes** results to new tab "ITO Assessment Results" (32 columns)

**Time:** 2-5 minutes depending on number of ITOs

---

## Example

```bash
# If your sheet ID is: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
./run_google_sheets_assessment.sh 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

---

## Expected Output

```
==============================================================================
GOOGLE SHEETS ITO ASSESSMENT - QUICK START
==============================================================================

✅ Using credentials: tourism-development-d620c-5c9db9e21301.json
✅ Spreadsheet ID: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms

📊 Step 1: Reading from Google Sheet 'Sheet1'...
✅ Found 26 ITOs

🌐 Step 2-3: Scraping content and running assessment...

[1/26] Scraping: Adventure Life
  Scraping: https://www.adventure-life.com/africa/cruises/18461/...
  ✓ Scraped 5,234 chars
  Scraping: https://www.adventure-life.com/africa/cruises/18460/...
  ✓ Scraped 4,891 chars
  Total content: 10,125 chars from 2 pages

[2/26] Scraping: Apollo
  ...

Running assessments...
✅ Adventure Life: 8/12 activities, 1 audiences, Itinerary
✅ Apollo: 4/12 activities, 0 audiences, Flight+Hotel
...

💾 Step 4: Writing results to sheet 'ITO Assessment Results'...
✅ Wrote 27 rows to Google Sheets

==============================================================================
✅ COMPLETE! Check your Google Sheet for 'ITO Assessment Results' tab
==============================================================================
```

---

## Check Results

1. Go back to your Google Sheet
2. Look for new tab: **"ITO Assessment Results"**
3. You'll see 32 columns with complete analysis!

---

## Troubleshooting

### Error: "Permission denied"
**Fix:** Make sure you shared the sheet with:
```
tourism-commons@tourism-development-d620c.iam.gserviceaccount.com
```

### Error: "No ITOs found"
**Fix:** Check that your sheet has data in columns A-D:
- Column A: Operator Name
- Column B: Country
- Column C: Gambia Page Link
- Column D: Gambia Tour Page (URLs)

### Error: "Module not found"
**Fix:** Install required packages:
```bash
pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client requests beautifulsoup4
```

---

## What Gets Analyzed

### From Your Sheet:
- ✅ Main Gambia page (Column C)
- ✅ Individual tour pages (Column D - comma-separated)
- ✅ All content combined for comprehensive analysis

### Output Includes:
- ✅ 12 activity categories (Yes/No flags)
- ✅ Product type (Flight+Hotel, Itinerary, etc.)
- ✅ Target audiences detected
- ✅ Booking pathway
- ✅ Price transparency
- ✅ Languages available
- ✅ Local partnerships (Gambian hotels, attractions)
- ✅ Seasonality framing
- ✅ And more! (32 total columns)

---

## Re-run Anytime

You can run the script again to:
- ✅ Update with fresh scrapes
- ✅ Add new ITOs
- ✅ Track changes over time

Just run the same command again!

---

## That's It!

Three simple steps:
1. Share your sheet
2. Get your sheet ID  
3. Run the script

Results appear in your Google Sheet automatically! 🎉

---

*Need more help? See GOOGLE_SHEETS_SETUP.md for detailed documentation*
