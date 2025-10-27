# Regional Tours Analysis Workflow

**Status:** ✅ Ready  
**Last Updated:** October 2025

---

## 🎯 Purpose

Analyze how the same ITOs position **regional destinations** (Senegal, Ghana, Cape Verde, etc.) compared to Gambia, specifically focusing on **creative tourism visibility**.

---

## 📊 What Changed

### Updated Sheet Structure

The **"ITO Tour Analysis"** sheet now includes:
- **Column C: Destination Country** (Gambia, Senegal, Ghana, etc.)
- **Column M: Destination %** (replaces "Gambia %")
- All existing Gambia data remains intact with "Gambia" in Column C

### Updated Analysis Scripts

1. **Analyzer** (`ito_ai_analyzer.py`)
   - Now accepts `destination_country` parameter
   - Flexible packaging analysis for any West African country
   - Counts mentions of target destination vs. other countries

2. **Main Script** (`run_ito_tour_level_analysis.py`)
   - Can read from "ITO Tour Analysis" sheet directly
   - Filters for "⏳ Pending" status
   - Passes destination country to analyzer

---

## 🚀 Workflow

### Step 1: Add Regional Tour URLs

**Option A: Interactive (one-by-one)**
```bash
cd /Users/alexjeffries/tourism-commons/digital_assessment
python3 add_regional_tours.py
```

You'll be prompted for:
- Operator name (e.g., "Intrepid Travel")
- Operator country (e.g., "UK")
- Destination country (e.g., "Senegal")
- Page type (1=Destination Page, 2=Tour/Itinerary)
- URL

**Option B: Batch Paste** ⭐ **RECOMMENDED**
```bash
python3 add_regional_tours_batch.py
```

Paste multiple tours in this format:
```
Operator | Country | Destination | Type | URL
```

**Example:**
```
Intrepid Travel | UK | Senegal | Tour | https://intrepidtravel.com/trips/senegal-explorer
Explore | UK | Ghana | Destination | https://explore.co.uk/destinations/ghana
G Adventures | Canada | Cape Verde | Tour | https://gadventures.com/trips/cape-verde-island-hopping
Responsible Travel | UK | Senegal | Tour | https://responsibletravel.com/holidays/senegal/travel-guide
```

### Step 2: Verify Entries

Open your Google Sheet:
- Go to **"ITO Tour Analysis"** tab
- Check the bottom rows for new entries
- Status should show: **⏳ Pending**
- Verify URLs are correct

### Step 3: Scrape & Analyze

```bash
python3 run_ito_tour_level_analysis.py
```

**When prompted:**
1. **Source:** Choose **2** (ITO Tour Analysis sheet - pending tours)
2. **Processing:** Choose **1** (pilot - 5 tours) for testing, or **3** (full run)

The script will:
- ✅ Scrape content from each URL
- ✅ Analyze sentiment + creative sector scores
- ✅ Update the sheet with results
- ✅ Change status from "⏳ Pending" to "✅ Scraped"

---

## 📋 Paste Format Reference

### Simple Format
```
Operator | Country | Destination | Type | URL
```

### Field Details

| Field | Description | Examples |
|-------|-------------|----------|
| **Operator** | Tour operator name | Intrepid Travel, Explore, G Adventures |
| **Country** | Operator's base country | UK, USA, Germany, Canada |
| **Destination** | Target destination | Senegal, Ghana, Cape Verde, Nigeria, Benin |
| **Type** | Page type | Tour, Destination, Itinerary, Dest, T |
| **URL** | Full URL | https://... |

**Type shortcuts:**
- `Tour`, `Itinerary`, `T` → "Tour/Itinerary"
- `Destination`, `Dest`, `D` → "Destination Page"

### Example Paste Block

```
Intrepid Travel | UK | Senegal | Tour | https://intrepidtravel.com/trips/senegal-explorer
Intrepid Travel | UK | Ghana | Tour | https://intrepidtravel.com/trips/ghana-togo-benin
Explore | UK | Senegal | Tour | https://explore.co.uk/holidays/senegal-and-the-gambia
Explore | UK | Ghana | Destination | https://explore.co.uk/destinations/africa/ghana
G Adventures | Canada | Cape Verde | Tour | https://gadventures.com/trips/cape-verde-island-hopping
G Adventures | Canada | Senegal | Tour | https://gadventures.com/trips/senegal-uncovered
Responsible Travel | UK | Ghana | Tour | https://responsibletravel.com/holidays/ghana/travel-guide
Wildlife Worldwide | UK | Ghana | Tour | https://wildlifeworldwide.com/holidays/ghana-birding
Naturetrek | UK | Senegal | Tour | https://naturetrek.co.uk/tours/senegal-birding
```

---

## 📈 Analysis Output

For each regional tour, you'll get:

### Scores (Same as Gambia)
- **Sentiment:** -1 to +1 (how positively the destination is portrayed)
- **Creative Score:** 0-100 (overall creative tourism visibility)
- **Sector Scores:** 0-10 each for:
  - Heritage Sites & Museums
  - Crafts & Artisan Products
  - Music
  - Performing & Visual Arts
  - Festivals & Cultural Events
  - Audiovisual (Film/Photo/TV)
  - Fashion & Design
  - Publishing

### Insights
- **Themes:** Top 3 themes (Beach/Resort, Wildlife, Culture, etc.)
- **Packaging:** Is Senegal sold alone or with other countries?
- **Destination %:** What percentage of the tour focuses on this country?

---

## 🔍 Comparative Analysis

### In Google Sheets

**Filter by Destination:**
```
Column C = "Gambia" → See all Gambia tours
Column C = "Senegal" → See all Senegal tours
```

**Compare Creative Scores:**
1. Create pivot table
2. Rows: Destination Country
3. Values: Average of Creative Score, Average of Music Score, etc.

**Result:**
```
Destination | Avg Creative | Music | Crafts | Heritage
Gambia      | 35.2        | 5.2   | 6.1    | 7.3
Senegal     | 42.8        | 7.8   | 5.5    | 8.1
Ghana       | 38.5        | 6.4   | 7.2    | 6.9
```

### In Dashboard

Once you have regional data, the dashboard can show:
- **Scatter plot:** Gambia vs competitors (Creative Score vs Sentiment)
- **Heatmap:** Country × Sector visibility
- **Gap analysis:** "Senegal music 7.8 vs Gambia 5.2 = -2.6 gap"

---

## 💡 Tips

### Finding Regional Tours

1. **URL Pattern Guessing** (often works):
   ```
   If Gambia tour is: intrepidtravel.com/trips/gambia-discovery
   Try Senegal: intrepidtravel.com/trips/senegal-explorer
   ```

2. **Site Search:**
   ```
   Google: site:intrepidtravel.com senegal tours
   ```

3. **Check Existing Operators First:**
   - Start with the 17 operators that sell Gambia
   - They likely have regional tours too
   - Controlled comparison (same operator style/audience)

### Destination Priority

**Quick Win (Week 1):**
- Focus on: **Senegal + Ghana**
- Why: Popular, direct competitors, likely lots of tours

**Comprehensive (Weeks 2-3):**
- Add: **Cape Verde, Nigeria, Benin**

---

## 🎯 Expected Outcomes

### Deliverable 2 Enhancement

**Original:** "How do ITOs perceive The Gambia?"  
**Enhanced:** "How do ITOs position Gambia vs. regional competitors?"

### Key Questions Answered

1. **Creative Sector Gaps:**
   - "Do ITOs highlight music more in Senegal than Gambia?"
   - "Is Ghana positioned as a crafts destination while Gambia isn't?"

2. **Packaging Patterns:**
   - "How often is Gambia bundled with Senegal?"
   - "Do multi-country tours give Gambia equal attention?"

3. **Sentiment Differences:**
   - "Is sentiment more positive for Ghana tours?"
   - "Do ITOs use more enthusiastic language for Cape Verde?"

4. **Positioning Opportunities:**
   - "Which creative sectors are underutilized across ALL countries?"
   - "Where can Gambia differentiate?"

---

## 📞 Support

**If something breaks:**
1. Check Google Sheet has correct headers (run `setup_sheet_headers()`)
2. Verify URLs are valid (test in browser first)
3. Check status column shows "⏳ Pending" not "✅ Scraped"

**Common Issues:**
- **"No pending tours found"** → Add tours using batch script first
- **"Blocked"** → Website has anti-scraping, needs manual screenshot
- **"Insufficient content"** → URL might be wrong or page has little text

---

Ready to start! 🚀

