# Regional ITO Perception Expansion Strategy
## Analyzing How ITOs Position Regional Competitors vs Gambia

**Date:** October 2025  
**Current Status:** 17 operators analyzed for Gambia only  
**Goal:** Compare ITO positioning across 6 West African destinations

---

## 📊 Current Baseline

**Operators Analyzed for Gambia:**
- ✅ **17 operators with Gambia tours**
- Total: 36 operators in database
- Coverage: UK (12), USA (4), Germany (3), Netherlands (2), Others (15)

**Key Operators with Gambia:**
1. Adventure Life (USA)
2. Explore (UK)
3. Intrepid Travel (UK)
4. The Gambia Experience (UK)
5. Responsible Travel (UK)
6. Overseas Adventure Travel (USA)
7. Overlanding West Africa (UK)
8. Wildlife Worldwide (UK)
9. Naturetrek (UK)
10. Birding Ecotours (UK)
11. World Insight (Germany)
12. Fleewinter (UK)
13. First Choice/TUI (UK)
14. Luxotour (Spain)
15. Spector Travel (USA)
16. TransAfrica (West Africa)
17. Wild Birding (International)

---

## 🎯 Regional Expansion Goal

**Compare ITO positioning for:**
1. 🇬🇲 **Gambia** (baseline - ✅ complete)
2. 🇸🇳 **Senegal**
3. 🇨🇻 **Cape Verde**
4. 🇬🇭 **Ghana**
5. 🇳🇬 **Nigeria**
6. 🇧🇯 **Benin**

---

## 🔍 Strategy 1: Search Same Operators' Websites

### Phase 1A: Automated Site Search (Quick, 1-2 days)

**Approach:** Use existing operators' websites to search for regional tours

**For Each of the 17 Operators:**
1. **Try destination-specific URLs** (pattern matching):
   ```
   # Common URL patterns
   {domain}/destinations/senegal
   {domain}/tours/senegal
   {domain}/trips/senegal
   {domain}/holidays/senegal
   {domain}/africa/senegal
   {domain}/west-africa/senegal
   {domain}/en/senegal  # For multilingual sites
   ```

2. **Use site search** (if available):
   ```
   {domain}/search?q=senegal
   {domain}/?s=senegal
   ```

3. **Use Google Site Search** (most reliable):
   ```
   site:{domain} senegal tours
   site:{domain} cape verde
   site:{domain} ghana travel
   site:{domain} nigeria tours
   site:{domain} benin itinerary
   ```

**Implementation:**

```python
# Pseudo-code
def find_regional_tours(operator_data):
    """Search for regional tours on operator websites"""
    
    countries = ['senegal', 'cape-verde', 'ghana', 'nigeria', 'benin']
    results = {}
    
    for country in countries:
        results[country] = {
            'destination_pages': [],
            'tour_pages': [],
            'search_results': []
        }
        
        # Method 1: Try common URL patterns
        patterns = [
            f"{domain}/destinations/{country}",
            f"{domain}/tours/{country}",
            f"{domain}/africa/{country}",
            f"{domain}/west-africa/{country}",
        ]
        
        for pattern in patterns:
            if url_exists(pattern):
                results[country]['destination_pages'].append(pattern)
        
        # Method 2: Google site search
        google_results = google_search(f"site:{domain} {country} tours")
        results[country]['search_results'] = google_results[:5]
    
    return results
```

**Estimated Effort:** 
- Script development: 2-3 hours
- Execution: 17 operators × 5 countries = 85 searches (~1 hour)
- Manual validation: 2-3 hours
- **Total: 1 day**

**Expected Output:**
- ~50-85 regional tour pages discovered (assuming 60% success rate)
- URL list for Phase 1B scraping

---

### Phase 1B: Scrape & Analyze Regional Tours (2-3 days)

**Use existing pipeline:**
1. `ito_content_scraper.py` - Scrape discovered URLs
2. `ito_ai_analyzer.py` - Analyze content for creative sector mentions
3. `run_ito_tour_level_analysis.py` - Write results to new sheet

**Modifications Needed:**
- Add `country` field to track destination
- Update sheet structure: "Regional ITO Analysis" with columns:
  - Operator, Country (operator origin), Destination (Senegal/Ghana/etc), URL, Creative Sector Scores...
- Filter creative sector keywords by country (e.g., "Île de Gorée" for Senegal)

**Estimated Cost:**
- Google Cloud Natural Language API: ~$100 (for 85 tours)
- Translation API (if needed): ~$50

---

## 🔍 Strategy 2: Expand Operator List

### Phase 2A: Find Regional Specialists (1-2 days)

**Approach:** Identify operators that specialize in Senegal, Ghana, etc.

**Research Sources:**
1. **Google Search:**
   - "Senegal tours" → Top 10 results
   - "Ghana cultural tours" → Top 10 results
   - "Cape Verde holidays" → Top 10 results
   
2. **Travel Industry Associations:**
   - ATTA (Adventure Travel Trade Association) members
   - UNWTO affiliated operators
   - Senegal Tourism Board partnerships
   
3. **TripAdvisor Listings:**
   - Top-rated operators for each country
   - Filter for international operators (not just local)

4. **Competitor Analysis:**
   - Who advertises on "Senegal tours" Google Ads?
   - Who ranks in top 10 organic results?

**Target:** 5-10 new operators per country (25-50 total)

**Example Candidates:**
- **Senegal Specialists:** 
  - Aventure du Monde (France)
  - Terres d'Aventure (France)
  - Senegal Tours (various)
  
- **Ghana Specialists:**
  - GAdventures (Canada)
  - Exodus Travels (UK)
  - African Safaris by Local Experts
  
- **Cape Verde Specialists:**
  - Cape Verde Experience (UK)
  - Archipelago Choice (Portugal)
  - Travel 2 Cape Verde (various)

**Criteria for Selection:**
- International operator (not purely local)
- English, French, German, or Spanish website
- Visible online presence (SEO, social media)
- Itinerary-based tours (not just flight+hotel)

---

### Phase 2B: Analyze New Operators (2-3 days)

Same pipeline as Phase 1B, but for new operators.

**Estimated Total New Tours:** 50-100 (10-20 per country)

---

## 🔍 Strategy 3: Market Intelligence Approach

### Phase 3: Secondary Data Collection (Parallel, ongoing)

**Sources:**
1. **Existing Tourism Reports:**
   - Senegal Tourism Board ITO partnerships list
   - Ghana Tourism Authority approved operators
   - Cape Verde trade mission documents
   
2. **Travel Trade Shows:**
   - WTM London exhibitor lists (operators showcasing West Africa)
   - ITB Berlin Africa pavilion participants
   - IFTM Top Resa (France) Africa tour operators
   
3. **Social Media Intelligence:**
   - Instagram hashtags: #senegaltours, #ghanatours
   - Facebook pages: West Africa tour operator groups
   - LinkedIn: Tour operator company pages with West Africa focus

4. **Booking Platform Analysis:**
   - Viator/GetYourGuide regional tour listings
   - Expedia/TripAdvisor "Things to Do" operators
   - G Adventures / Intrepid regional offerings

**Deliverable:** Expanded operator database (100-150 total operators covering all 6 countries)

---

## 📊 Comparative Analysis Framework

### Data to Collect (Per Operator, Per Country)

**1. Creative Sector Visibility (0-10 scale, 8 sectors):**
- Music
- Crafts & Artisan Products
- Heritage Sites & Museums
- Fashion & Design
- Festivals & Cultural Events
- Film/Photography
- Performing & Visual Arts
- Publishing/Marketing

**2. Positioning Narrative:**
- How is the country positioned? (beach, culture, adventure, etc.)
- What's the primary selling point?
- Creative tourism prominence (low/medium/high)

**3. Sentiment Analysis:**
- Overall tone (-1 to +1)
- Language quality (enthusiastic vs generic)
- Authenticity emphasis

**4. Packaging Analysis:**
- Solo destination vs multi-country
- If multi-country: % of days in each country
- Gambia-Senegal combo frequency
- Ghana-Benin-Togo corridor

**5. Pricing (if available):**
- Cost per day
- Premium vs budget positioning

---

## 📈 Output: Regional ITO Positioning Matrix

### Dashboard View: "Regional ITO Perception"

**Tab 1: Overview**
- Map: ITO attention by country (# operators, # tours, avg creative score)
- Bar chart: Creative sector visibility by country
- Sentiment comparison: Which country is positioned most positively?

**Tab 2: Operator-Level Analysis**
- Table: Operators and which countries they cover
- Highlight: Operators that offer Gambia vs don't
- Filter: By operator origin country (UK, USA, Germany, etc.)

**Tab 3: Creative Sector Deep-Dive**
- Heatmap: Country × Sector visibility
- **Key Insight:** Where does Gambia over/under-perform?
  - Example: "Gambia music: 5.2/10, Senegal music: 7.8/10 → Gap of -2.6"
  
**Tab 4: Competitive Positioning**
- Scatter plot: Creative Tourism Score (x) vs Sentiment (y)
  - Quadrants: 
    - High sentiment, high creative = "Leaders"
    - High sentiment, low creative = "Untapped potential"
    - Low sentiment, high creative = "Quality issues"
    - Low sentiment, low creative = "Need work"
- Gambia vs regional positioning
- **Key Insight:** "Senegal leads in creative positioning (8.2/10), Gambia competitive at 6.9/10"

**Tab 5: Packaging Intelligence**
- Network graph: Multi-country tour combinations
- **Key Insight:** "68% of Gambia tours packaged with Senegal; opportunity to position as standalone?"

---

## 🚀 Implementation Roadmap

### Week 1: Automated Discovery
- ✅ Run URL pattern search on 17 existing operators
- ✅ Google site search for regional tours
- ✅ Validate discovered URLs (manual spot-check)
- **Deliverable:** List of 50-85 regional tour URLs

### Week 2: Scraping & Analysis (Existing Operators)
- ✅ Scrape 50-85 regional tour pages
- ✅ Run AI analysis (creative sectors, sentiment, positioning)
- ✅ Write results to "Regional ITO Analysis" sheet
- **Deliverable:** Comparative data for 17 operators × 5 countries

### Week 3: Operator Expansion Research
- ✅ Identify 25-50 regional specialist operators
- ✅ Prioritize by market relevance (UK/Germany/France focus)
- ✅ Validate websites and tour offerings
- **Deliverable:** Expanded operator list

### Week 4: Extended Scraping & Analysis
- ✅ Scrape 50-100 additional tours from new operators
- ✅ Complete analysis pipeline
- ✅ Generate comparative dashboard data
- **Deliverable:** Full regional ITO perception dataset

### Week 5: Insights & Reporting
- ✅ Dashboard integration (new "Regional ITO Perception" tab)
- ✅ Write insights report
- ✅ Presentation deck for stakeholders
- **Deliverable:** Actionable competitive intelligence

---

## 💰 Budget Estimate

**Technical Costs:**
- Google Cloud APIs (NLP, Translation): $150-200
- Apify/scraping services (if needed): $50-100
- Development time modifications: 8-12 hours

**Research Costs:**
- Operator research & validation: 12-16 hours
- Manual data validation: 8-10 hours

**Total Investment:** $200-300 (APIs) + 30-40 hours (labor)

**Expected Value:**
- Complete competitive positioning for Gambia vs 5 regional rivals
- Identify narrative gaps and opportunities
- Inform ITO outreach strategy with data-backed insights
- Potentially $50K-100K+ in targeted ITO partnerships

**ROI:** 100:1+ (low cost, high strategic value)

---

## 🎯 Quick Start (Minimal Viable Approach)

**If time/budget is tight, focus on:**

1. **Top 5 Operators Only:**
   - Intrepid Travel
   - G Adventures
   - Explore
   - Responsible Travel
   - Exodus Travels
   
2. **Top 2 Competitor Countries:**
   - Senegal (closest competitor, often packaged with Gambia)
   - Ghana (similar creative tourism potential)

3. **Quick Analysis (1 week):**
   - Manual URL discovery (2 hours)
   - Automated scraping & analysis (1 day)
   - Dashboard integration (1 day)
   - Insights summary (1 day)

**Result:** Answer the critical question: "How do major ITOs position Senegal/Ghana creative industries vs Gambia?" with just 10-20 tours analyzed.

---

## 📋 Next Steps

**Immediate Action (This Week):**
1. ✅ Approve this strategy document
2. ✅ Decide: Full approach vs Quick Start?
3. ✅ Create "Regional ITO Analysis" sheet in Google Sheets
4. ✅ Update `ito_content_scraper.py` to handle regional URLs
5. ✅ Run Phase 1A: URL discovery for existing 17 operators

**Decision Point:**
- **Option A (Recommended):** Full 4-week rollout → Comprehensive competitive intelligence
- **Option B (Quick Win):** 1-week minimal viable analysis → Answer key questions fast

---

**Prepared By:** Digital Assessment Team  
**Date:** October 7, 2025  
**Status:** Ready for implementation

