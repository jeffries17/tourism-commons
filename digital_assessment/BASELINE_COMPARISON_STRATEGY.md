# Baseline Comparison Strategy for Regional ITO Analysis

**Status:** ✅ Implemented  
**Last Updated:** October 2025

---

## 🎯 The Problem You Identified

When comparing how ITOs position Gambia vs. regional competitors, we need to distinguish between:

1. **Pure destination tours** (e.g., "10 Days in Senegal")
   - 100% focus on one country
   - Creative scores reflect actual positioning of that destination
   
2. **Multi-country tours** (e.g., "Senegal, Gambia & Guinea Explorer")
   - Content spread across 2-4 countries
   - Lower creative scores don't mean weak positioning—just diluted focus

**Why this matters:**  
Comparing a "pure Gambia" tour (Creative Score: 45) vs. a "Senegal-Gambia-Guinea" tour (Gambia Creative Score: 18) is misleading. The second tour's low score is due to content dilution, not poor Gambia positioning.

---

## ✅ Solution Implemented

### New Sheet Columns

The **"ITO Tour Analysis"** sheet now has:

| Column | Name | Purpose |
|--------|------|---------|
| **C** | Primary Destination | Main country focus (Gambia, Senegal, etc.) |
| **D** | Countries Covered | All countries mentioned with mention counts<br>Example: "Senegal (23), Gambia (12), Guinea (8)" |
| **N** | Primary Destination % | % of content about primary destination (0-100%) |
| **O** | Packaging Type | "Gambia-only", "Multi-country package", etc. |
| **P** | Is Pure Destination | **Yes** if ≥80% focus on primary destination<br>**No** if multi-country |

### Automated Country Detection

The analyzer now:
1. **Scans text** for 15 West African countries + capital cities
2. **Counts mentions** of each country
3. **Calculates %** of primary destination vs. others
4. **Flags "pure"** tours automatically (≥80% threshold)

**Example Output:**
```
Tour: "Senegal & The Gambia: Cultural Journey"
Primary Destination: Senegal
Countries Covered: Senegal (34), Gambia (18), Guinea (3)
Primary Destination %: 62%
Packaging Type: Senegal-focused multi-country
Is Pure Destination: No
```

---

## 📊 How to Use This for Analysis

### Step 1: Establish Pure Baselines

**Filter your sheet for:**
```
Primary Destination = "Gambia"
Is Pure Destination = "Yes"
```

This gives you the **true Gambia baseline:**
- Average Creative Score: e.g., 42.3
- Average Music Score: e.g., 6.8
- Average Crafts Score: e.g., 7.1

Repeat for each competitor:
```
Primary Destination = "Senegal"
Is Pure Destination = "Yes"
→ Senegal baseline: Creative 48.5, Music 8.2, Crafts 6.3
```

### Step 2: Pure-to-Pure Comparisons

**Now you can compare apples-to-apples:**

| Destination | Avg Creative | Music | Crafts | Heritage | Tours Analyzed |
|------------|--------------|-------|--------|----------|----------------|
| Senegal (Pure) | 48.5 | 8.2 | 6.3 | 9.1 | 12 tours |
| **Gambia (Pure)** | **42.3** | **6.8** | **7.1** | **7.9** | **8 tours** |
| Ghana (Pure) | 45.2 | 7.1 | 8.4 | 6.8 | 10 tours |
| Cape Verde (Pure) | 38.7 | 9.3 | 5.2 | 4.1 | 6 tours |

**Insights:**
- Senegal gets stronger **music** positioning (+1.4 vs Gambia)
- Gambia slightly ahead on **crafts** (+0.8 vs Senegal)
- Ghana dominates **crafts** positioning (+1.3 vs Gambia)

### Step 3: Multi-Country Package Analysis (Separate)

**Filter for:**
```
Is Pure Destination = "No"
Countries Covered contains "Gambia"
```

**Analyze:**
- How often is Gambia packaged with other countries?
- Which country pairings are most common?
- Does Gambia get equal attention in multi-country tours?

**Example findings:**
```
18 multi-country tours mention Gambia:
  - Senegal-Gambia: 12 tours (avg 45% Gambia content)
  - Gambia-Guinea: 4 tours (avg 58% Gambia content)
  - 3-country tours: 2 tours (avg 28% Gambia content)
```

**Insight:** When packaged with Senegal, Gambia averages only 45% content share → ITOs may view Senegal as the "anchor" destination.

---

## 📈 Analysis Templates

### Template 1: Pure Destination Competitive Positioning

**Google Sheets Pivot Table:**
```
Rows: Primary Destination
Columns: (None)
Values: 
  - AVERAGE of Creative Score
  - AVERAGE of Music Score
  - AVERAGE of Crafts Score
  - COUNT of URL (# tours)
Filters:
  - Is Pure Destination = "Yes"
```

**Result:** Clean comparison of how each country is positioned in dedicated tours.

### Template 2: Gap Analysis

**Formula approach:**
```
For each creative sector:
1. Calculate pure baseline for Gambia
2. Calculate pure baseline for competitors
3. Gap = Competitor score - Gambia score
4. Rank gaps to find biggest positioning differences
```

**Example Output:**
```
Sector Gaps vs Gambia (Pure Tours Only):

Senegal:
  Music: +1.4 (Senegal stronger)
  Heritage: +1.2 (Senegal stronger)
  Crafts: -0.8 (Gambia stronger)
  
Ghana:
  Crafts: +1.3 (Ghana stronger)
  Music: +0.3 (Ghana stronger)
  Heritage: -1.1 (Gambia stronger)
```

**Strategic Insight:** ITOs position Senegal as the "music destination" of West Africa. Opportunity for Gambia to differentiate or compete.

### Template 3: Packaging Intelligence

**Filter:**
```
Countries Covered contains "Gambia"
Is Pure Destination = "No"
```

**Analyze:**
1. **Most common pairings**
   - COUNT tours by each country combination
   
2. **Content share patterns**
   - AVERAGE "Primary Destination %" when Gambia is primary
   - AVERAGE mention count when Gambia is secondary
   
3. **Sentiment differences**
   - Compare sentiment: pure Gambia vs. packaged Gambia

**Insight Example:**
```
When Gambia is packaged with Senegal:
  - 83% of tours make Senegal primary (Gambia secondary)
  - Gambia averages 35% content share
  - Sentiment: 0.42 (pure Gambia: 0.48)
  
→ Gambia often positioned as a "add-on" to Senegal tours
→ Slightly less enthusiastic language in multi-country context
```

---

## 🎯 Recommended Workflow

### Phase 1: Build Pure Baselines (Week 1)

**Prioritize these operators & destinations:**
- Focus on: **Senegal, Ghana** (main competitors)
- Operators: Use existing 17 Gambia operators
- Goal: 8-12 "pure" tours per destination

**Add tours using batch script:**
```bash
python3 add_regional_tours_batch.py
```

**Paste format:**
```
Intrepid Travel | UK | Senegal | Tour | https://...
```

**Run analysis:**
```bash
python3 run_ito_tour_level_analysis.py
Choose: Option 2 (Pending tours from sheet)
```

### Phase 2: Analyze Pure Baselines

**In Google Sheets:**
1. Create pivot table (pure tours only)
2. Export to CSV or copy to analysis doc
3. Calculate gaps for each sector
4. Identify Gambia's strengths & weaknesses

**Key questions:**
- Which sectors does Gambia trail competitors?
- Which sectors is Gambia ahead?
- Are there "white space" sectors underutilized by all countries?

### Phase 3: Multi-Country Intelligence (Week 2)

**Expand to multi-country tours:**
- Add tours like "Senegal & Gambia Explorer"
- Analyze packaging patterns
- Understand ITO bundling strategies

### Phase 4: Dashboard & Deliverable

**Create visualizations:**
1. **Bar chart:** Pure destination creative scores (all countries)
2. **Spider chart:** Sector scores comparison (Gambia vs top 3)
3. **Heatmap:** Country × Sector visibility matrix
4. **Network graph:** Multi-country tour combinations

**Deliverable narrative:**
```
"Gambia trails Senegal in music positioning (6.8 vs 8.2) but 
leads in crafts visibility (7.1 vs 6.3). When packaged together, 
Senegal dominates content share (65% avg), suggesting ITOs view 
Gambia as complementary rather than standalone destination."
```

---

## 💡 Pro Tips

### Tip 1: Watch Your Sample Sizes

**Before comparing:**
```
Check: COUNT of tours per destination
Minimum recommended: 5 pure tours per country
Ideal: 10+ pure tours per country
```

**If too few:**
- Results may not be statistically significant
- One outlier tour skews averages
- Solution: Add more tours or note limitations

### Tip 2: Operator Style Matters

**Consider segmenting by operator type:**
```
Adventure operators (Intrepid, G Adventures):
  → Higher activity/adventure themes
  → Lower heritage/cultural scores
  
Cultural specialists (Responsible Travel):
  → Higher creative sector scores across board
  → More nuanced descriptions
```

**Compare within segments:**
- "Intrepid's Senegal tours" vs "Intrepid's Gambia tours"
- Controls for operator style/audience

### Tip 3: Time Context

**Track when tours were analyzed:**
- Column AJ: Analysis Date
- Tourism positioning changes over time
- ITOs update content based on trends

**Future use:**
- Re-analyze in 6-12 months
- Track if Gambia positioning improves
- Measure impact of tourism development efforts

---

## 🚨 Common Pitfalls to Avoid

### ❌ DON'T: Compare pure vs. multi-country tours

**Wrong:**
```
Gambia pure tour (Creative: 45) is better than 
Senegal-Gambia tour (Gambia Creative: 18)
```

**Why:** Multi-country tours dilute scores naturally.

### ❌ DON'T: Ignore the "Primary Destination %" column

**Use it to:**
- Validate "pure" classification
- Understand content balance in multi-country tours
- Weight scores appropriately

### ❌ DON'T: Over-interpret small differences

**If Gambia = 6.8 and Senegal = 7.1 in music:**
- Difference: 0.3 points
- Might not be meaningful
- Check: Sample size, operator mix, individual tour variance

**Rule of thumb:** ≥1.0 point difference = meaningful gap

---

## ✅ Success Criteria

You'll know this analysis is working when you can answer:

1. **Pure Positioning:**
   - "How do ITOs position Gambia vs Senegal in dedicated tours?"
   - "Which creative sectors are Gambia's strengths?"
   
2. **Gap Identification:**
   - "Where is Gambia trailing regional competitors?"
   - "Which sectors offer differentiation opportunities?"
   
3. **Packaging Strategy:**
   - "How often is Gambia sold standalone vs packaged?"
   - "With which countries is Gambia most commonly paired?"
   - "Does Gambia get equal billing in multi-country tours?"

4. **Strategic Recommendations:**
   - "Should Gambia compete head-on with Senegal in music?"
   - "Should Gambia lean into crafts as a differentiator?"
   - "Should Gambia encourage more standalone positioning?"

---

## 📞 Next Steps

**Ready to proceed? Here's how:**

1. **Add 10-15 regional tours** using batch script
2. **Run analysis** on pending tours
3. **Check "Is Pure Destination" column** in sheet
4. **Build pivot table** with pure tours only
5. **Share findings** and discuss strategy

**Questions?**
- Check `REGIONAL_TOURS_WORKFLOW.md` for technical how-to
- This doc covers analytical strategy
- Together they provide complete system

---

🎯 **Bottom line:** Pure Gambia tours vs Pure Senegal tours = valid comparison. Everything else = context-dependent. Use the "Is Pure Destination" filter religiously!
