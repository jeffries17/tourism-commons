# Updated Scoring System - Implementation Plan

**Goal:** Transition to standardized 10-point system with sector-specific weighting  
**Sheet ID:** `1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM`  
**This is the ONLY document you need** - Everything is here.

---

## ⚡ Quick Start (Do This Today - 45 minutes)

### 1. Rename Your Sheets (5 min)
- Master Assessment → **CI Assessment**
- Tourism Assessment → **TO Assessment**
- Regional Assessment → **Regional Assessment V2**

### 2. Create "Sector Weights v2" Sheet (10 min)
Add new sheet with this table:

| Sector | Social Media | Website | Visual | Discover | Sales | Platform |
|--------|-------------|---------|--------|----------|-------|----------|
| Creative Industries | 2.2 | 1.0 | 2.0 | 0.8 | 0.5 | 0.5 |
| Tour Operators | 1.4 | 1.5 | 1.0 | 2.6 | 1.2 | 1.0 |
| Hotels/Lodging | 1.5 | 2.0 | 1.5 | 2.0 | 1.5 | 1.0 |

### 3. Create "Checklist Detail" Sheet (30 min)

**This is your central data sheet - all 700+ stakeholders scored here!**

Add new sheet with ~75 columns:
- Columns A-E: Name, Sector, Date, Method, Assessor
- Columns F-P: Social Media (10 checkboxes + total)
- Columns Q-AA: Website (10 checkboxes + total)
- Columns AB-AL: Visual Content (10 checkboxes + total)
- Columns AM-AW: Discoverability (10 checkboxes + total)
- Columns AX-BH: Digital Sales (10 checkboxes + total)
- Columns BI-BS: Platform Integration (10 checkboxes + total)

**Category total formulas:**
```
P2: =SUM(F2:O2)      Social Media Raw (0-10)
AA2: =SUM(Q2:Z2)     Website Raw (0-10)
AL2: =SUM(AB2:AK2)   Visual Content Raw (0-10)
AW2: =SUM(AM2:AV2)   Discoverability Raw (0-10)
BH2: =SUM(AX2:BG2)   Digital Sales Raw (0-10)
BS2: =SUM(BI2:BR2)   Platform Integration Raw (0-10)
```

### 4. Link Assessment Sheets to Checklist Detail (15 min per sheet)

**In CI Assessment, TO Assessment, and Regional V2:**

Add these formulas in columns J-O (they pull from Checklist Detail):

```
J2: =IFERROR(INDEX('Checklist Detail'!$P:$P,MATCH($A2,'Checklist Detail'!$A:$A,0)),"")
K2: =IFERROR(INDEX('Checklist Detail'!$AA:$AA,MATCH($A2,'Checklist Detail'!$A:$A,0)),"")
L2: =IFERROR(INDEX('Checklist Detail'!$AL:$AL,MATCH($A2,'Checklist Detail'!$A:$A,0)),"")
M2: =IFERROR(INDEX('Checklist Detail'!$AW:$AW,MATCH($A2,'Checklist Detail'!$A:$A,0)),"")
N2: =IFERROR(INDEX('Checklist Detail'!$BH:$BH,MATCH($A2,'Checklist Detail'!$A:$A,0)),"")
O2: =IFERROR(INDEX('Checklist Detail'!$BS:$BS,MATCH($A2,'Checklist Detail'!$A:$A,0)),"")
```

**Done!** Now you score once in Checklist Detail, all assessment sheets auto-update!

---

## 🎯 Three-Sheet Structure Overview

```
┌─────────────────────────────────────────────────────────┐
│  CI Assessment (Creative Industries)                    │
│  ~500 stakeholders                                      │
│  Weights: Social 2.2× | Visual 2.0× | Website 1.0×     │
│  Priority: Social media & visual content                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  TO Assessment (Tour Operators)                         │
│  ~24 stakeholders                                       │
│  Weights: Discover 2.6× | Website 1.5× | Sales 1.2×    │
│  Priority: Discoverability & booking                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Regional Assessment V2 (Multi-sector)                  │
│  ~200 stakeholders                                      │
│  Weights: Dynamic per sector (from lookup table)        │
│  Priority: Varies by stakeholder sector                 │
└─────────────────────────────────────────────────────────┘
```

**Why this approach?**
- ✅ Clear separation by industry type
- ✅ Optimized weights per sector
- ✅ Simpler formulas (CI/TO use fixed weights)
- ✅ Easy to filter and analyze
- ✅ Replicable across countries

---

## 📊 Current Structure Analysis

### What We Have Now:

**Three separate assessment sheets:**

1. **Master Assessment** → Will become **CI Assessment** (Creative Industries)
   - ~500 rows of creative industry stakeholders
   - Old variable scoring system (0-18, 0-12, etc.)
   
2. **Tourism Assessment** → Will become **TO Assessment** (Tour Operators)
   - ~24 rows of tour operators
   - Old variable scoring system
   
3. **Regional Assessment** → Will become **Regional Assessment V2**
   - ~200 rows of regional stakeholders (multi-sector)
   - Simplified external scoring only

**Current columns (Master & Tourism sheets):**
```
Columns D-I: External Scores (OLD SYSTEM - Variable maximums)
  D: Social Media (0-18)
  E: Website (0-12)
  F: Visual Content (0-15)
  G: Discoverability (0-12)
  H: Digital Sales (0-8)
  I: Platform Integration (0-5)

Columns J-N: Survey Scores (0-30 total)
  J: Digital Comfort (0-8)
  K: Content Strategy (0-8)
  L: Platform Breadth (0-7)
  M: Investment Capacity (0-4)
  N: Challenge Severity (0-3)

Columns O-Q: Totals
  O: External Total (0-70)
  P: Survey Total (0-30)
  Q: Combined Score (0-100)

Columns Y-AD: Justifications (text explanations for each category)
Columns AN-AX: Opportunities (improvement suggestions)
```

### What We Need (NEW SYSTEM - Standardized):

```
NEW Columns for Raw Scores (0-10 each, UNIFORM):
  - Social Media Raw (0-10)
  - Website Raw (0-10)
  - Visual Content Raw (0-10)
  - Discoverability Raw (0-10)
  - Digital Sales Raw (0-10)
  - Platform Integration Raw (0-10)

NEW Columns for Detailed Point Tracking:
  - Social Media Checklist (which of 10 criteria met?)
  - Website Checklist (which of 10 criteria met?)
  - Visual Content Checklist (which of 10 criteria met?)
  - Discoverability Checklist (which of 10 criteria met?)
  - Digital Sales Checklist (which of 10 criteria met?)
  - Platform Integration Checklist (which of 10 criteria met?)

NEW Columns for Weighted Scores (sector-specific):
  - Social Media Weighted (raw × sector weight)
  - Website Weighted (raw × sector weight)
  - Visual Content Weighted (raw × sector weight)
  - Discoverability Weighted (raw × sector weight)
  - Digital Sales Weighted (raw × sector weight)
  - Platform Integration Weighted (raw × sector weight)
  - External Total Weighted (sum = 0-70)
```

---

## 🎯 PHASE 0: Reorganize Sheet Structure

**Time Estimate:** 30 minutes  
**Who:** Manual (Google Sheets)  
**Risk:** Low (renaming only)

### ☐ Task 0.1: Rename Existing Sheets

**Action:** Right-click each sheet tab → Rename

```
"Master Assessment" → "CI Assessment"
  Purpose: Creative Industries only
  Sector Weight: Creative Industries (social media 2.2×, visual 2.0×)
  Rows: ~500 stakeholders

"Tourism Assessment" → "TO Assessment"  
  Purpose: Tour Operators only
  Sector Weight: Tour Operators (discoverability 2.1×, website 1.2×)
  Rows: ~24 operators

"Regional Assessment" → "Regional Assessment V2"
  Purpose: Multi-sector regional analysis
  Sector Weight: Applied per stakeholder based on sector column
  Rows: ~200 stakeholders
```

**Why separate sheets?**
- Different sectors have different priorities
- Easier filtering and analysis
- Clearer for users ("I'm a tour operator, use TO Assessment")
- Can apply sheet-level sector weights automatically

---

### ☐ Task 0.2: Add Sheet-Level Sector Indicator

**For CI Assessment:**
- Add cell A1 note: "Creative Industries Assessment - Social Media & Visual Content Focus"
- Lock sector column (B) to "Creative Industries" or creative subsectors

**For TO Assessment:**
- Add cell A1 note: "Tour Operators Assessment - Discoverability & Booking Focus"
- Lock sector column (B) to "Tour Operators"

**For Regional Assessment V2:**
- Keep flexible sector column
- Weights auto-applied based on sector value

---

## 🎯 PHASE 1: Create Scoring Reference Sheets

**Time Estimate:** 2-3 hours  
**Who:** Manual setup  
**Risk:** Low

### ☐ Task 1.1: Create "Scoring Criteria v2" Sheet

Create a new sheet in the workbook with scoring rubric:

**Columns:**
```
A: Category (Social Media, Website, etc.)
B: Criterion Number (1-10)
C: Criterion Description
D: Points
E: Difficulty Level (Easy/Moderate/Advanced)
F: Example Evidence
```

**Content:**
- Copy all 60 criteria from `updated_scoring.md` (6 categories × 10 points each)
- Format as table for easy reference
- Add examples for each criterion

**Deliverable:** Reference sheet that assessors can use to score stakeholders

---

### ☐ Task 1.2: Create "Sector Weights v2" Sheet

Create weight reference table:

**Columns:**
```
A: Sector Name
B: Social Media Weight
C: Website Weight
D: Visual Content Weight
E: Discoverability Weight
F: Digital Sales Weight
G: Platform Integration Weight
H: Total Multiplier (should = 7.0)
```

**Initial Sectors:**
```
Creative Industries:    2.2  1.0  2.0  0.8  0.5  0.5  = 7.0
Tour Operators:         1.4  1.5  1.0  2.6  1.2  1.0  = 7.0
Hotels/Lodging:         1.5  2.0  1.5  2.0  1.5  1.0  = 7.0
Restaurants:            2.5  1.0  2.5  1.5  0.8  0.7  = 7.0
Transportation:         1.2  1.5  0.8  2.5  1.5  1.5  = 7.0
```

**Deliverable:** Weight reference for automated scoring

---

## 🎯 PHASE 2: Add New Columns to Master Assessment

**Time Estimate:** 1 hour  
**Who:** Manual sheet editing  
**Risk:** Medium (don't delete existing data!)

### ☐ Task 2.1: Insert New Columns for Raw Scores

**Location:** Insert after column I (Platform Integration old score)

**New Columns (J-O):**
```
J: [RAW] Social Media (0-10)
K: [RAW] Website (0-10)
L: [RAW] Visual Content (0-10)
M: [RAW] Discoverability (0-10)
N: [RAW] Digital Sales (0-10)
O: [RAW] Platform Integration (0-10)
```

**Action:** All cells start empty (will be filled during re-assessment)

---

### ☐ Task 2.2: Insert New Columns for Weighted Scores

**Location:** Insert after new raw score columns

**New Columns (P-V):**
```
P: [WEIGHTED] Social Media
Q: [WEIGHTED] Website
R: [WEIGHTED] Visual Content
S: [WEIGHTED] Discoverability
T: [WEIGHTED] Digital Sales
U: [WEIGHTED] Platform Integration
V: [NEW] External Total (0-70)
```

**Formulas:**
```
P2: =J2 * VLOOKUP($B2, 'Sector Weights v2'!$A:$B, 2, FALSE)
Q2: =K2 * VLOOKUP($B2, 'Sector Weights v2'!$A:$C, 3, FALSE)
... (repeat for each category)
V2: =SUM(P2:U2)
```

---

### ☐ Task 2.3: Shift Existing Survey Columns

**Action:** Survey columns (old J-N) will shift to new positions
- Keep formulas pointing to correct columns
- Update any dashboard references

---

### ☐ Task 2.4: Add Historical Tracking Columns

**Location:** Insert after current "Combined Score" column

**New Columns:**
```
[OLD SYSTEM - Archive Oct 2024]
- Old External Total (0-70)
- Old Survey Total (0-30)
- Old Combined (0-100)

[CHANGE TRACKING]
- Change in External (new minus old)
- Change in Survey (new minus old)
- % Improvement
- Assessment Method Version (v1.0 or v2.0)
```

---

## 🎯 PHASE 3: Create Detailed Checklists

**Time Estimate:** 4-6 hours  
**Who:** Manual + scripting  
**Risk:** Low

### ☐ Task 3.1: Create "Assessment Checklists" Sheet

Create detailed point-by-point tracking:

**Structure:**
```
A: Stakeholder Name
B: Assessment Date
C: Category (Social Media, Website, etc.)
D: Criterion # (1-10)
E: Criterion Description
F: Points Earned (0 or 1)
G: Evidence/Notes
H: Assessor Initials
```

**Purpose:**
- Track exactly which criteria each stakeholder met
- Provide audit trail
- Enable detailed progress tracking year-over-year

**Example Rows:**
```
"Batik Artist", "2025-10-15", "Social Media", "1", "Has business account on primary platform", 1, "Facebook page active", "AJ"
"Batik Artist", "2025-10-15", "Social Media", "2", "Has business account on second platform", 0, "No Instagram", "AJ"
```

---

### ☐ Task 3.2: Create Checklist Form (Optional)

**Tool:** Google Forms linked to Checklist sheet

**Structure:**
- Dropdown: Stakeholder name
- Dropdown: Category
- Checkboxes: All 10 criteria for that category
- Text: Evidence/Notes
- Submit → auto-populates Checklist sheet → auto-calculates raw scores

**Benefits:**
- Easy manual assessment
- Consistent data entry
- Automatic score calculation

---

## 🎯 PHASE 4: Build Automation Scripts

**Time Estimate:** 8-12 hours  
**Who:** Python development  
**Risk:** Medium

> 💡 **NEW:** See `automated_assessment_architecture.md` for complete automated discovery & assessment pipeline!

### ☐ Task 4.1: Create Weighted Scoring Module

**File:** `digital_assessment/sentiment/scripts/weighted_scoring.py`

**Functions:**
```python
def calculate_raw_scores(stakeholder_data) -> RawScores
    """Assess stakeholder and return 0-10 scores for each category"""

def apply_sector_weights(raw_scores, sector) -> WeightedScores
    """Apply sector-specific weights to raw scores"""

def calculate_combined_score(raw_scores, sector, survey_score=None)
    """Calculate full assessment with optional survey"""
```

**Deliverable:** Reusable scoring module

---

### ☐ Task 4.2: Create Assessment Runner Script

**File:** `digital_assessment/sentiment/scripts/run_weighted_assessment.py`

**Functionality:**
```python
# Read existing data from Google Sheets
# For each stakeholder:
#   - Calculate new raw scores (0-10 each)
#   - Apply sector weights
#   - Calculate weighted total
#   - Compare to old scores
#   - Log changes
# Write results back to Google Sheets
# Generate comparison report
```

**Command:**
```bash
python run_weighted_assessment.py --sheet-id 1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM
```

---

### ☐ Task 4.3: Create Multi-Country Support

**File:** `digital_assessment/sentiment/data/config/country_configs.json`

**Structure:**
```json
{
  "gambia": {
    "sheet_id": "1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM",
    "assessment_sheet": "Master Assessment",
    "methodology_version": "v2.0"
  },
  "senegal": {
    "sheet_id": "another-sheet-id",
    "assessment_sheet": "Master Assessment",
    "methodology_version": "v2.0"
  }
}
```

**Command:**
```bash
python run_weighted_assessment.py --country gambia
python run_weighted_assessment.py --country senegal
python generate_cross_country_comparison.py --countries gambia,senegal
```

---

### ☐ Task 4.4: Create Apps Script for Auto-Calculations

**File:** `digital_assessment/google_scripts/weighted_scoring.gs`

**Functions:**
```javascript
function onWeightedScoreUpdate() {
  // When raw scores (J-O) change
  // Auto-calculate weighted scores (P-U)
  // Update totals
  // Color code changes
}

function calculateWeightedScore(rawScore, sector, category) {
  // Look up weight from "Sector Weights v2" sheet
  // Return rawScore * weight
}
```

---

### ☐ Task 4.5: Build Automated Discovery & Assessment (OPTIONAL)

**🚀 This is the "holy grail" - fully automated assessment!**

**File:** `digital_assessment/sentiment/scripts/automated_digital_assessment.py`

**What it does:**
1. Takes stakeholder name from sheet
2. Uses Google Search API to find their website, Facebook, Instagram, etc.
3. Scrapes each discovered URL
4. Evaluates against all 10-point criteria automatically
5. Writes scores back to sheet

**Focused Automation (Google Search + Website Scraping Only):**
- ✅ **Discoverability:** 4/10 automated (40%)
  - DIS1: In Google search ✅
  - DIS3: Directory listings ✅
  - DIS4: First page results ✅
  - DIS6: Multiple directories ✅
  - DIS2,5,7-10: Manual review needed
  
- ✅ **Website:** 9/10 automated (90%)
  - WEB1-7,9-10: Fully automated ✅
  - WEB8: Design quality (manual)
  
- ⚠️ **Social Media:** Manual review needed (or add Facebook API later)
- ⚠️ **Visual Content:** Manual review needed (subjective)
- ⚠️ **Digital Sales:** Manual review needed
- ⚠️ **Platform Integration:** Manual review needed

**Overall: ~22% of criteria automated with high reliability (13/60)**

**Time Savings:**
- Manual: 500 stakeholders × 30 min = 250 hours
- Automated: 500 stakeholders × 3 min = 25 hours
- **Savings: 225 hours (90% reduction)**

**Cost:**
- Google Custom Search API: ~$2.50 for 500 searches
- Google Places API: ~$8.50 for 500 lookups
- **Total: ~$11 for 500 stakeholders**

**Implementation Time:** 3-4 weeks (if building from scratch)

**See:** `automated_assessment_architecture.md` for complete design

**APIs Needed:**
- Google Custom Search API (discovery)
- Google Places API (GMB data)
- Facebook Graph API (social data)
- Instagram Basic Display API (optional)

**Deliverable:** 
- Fully automated assessment pipeline
- Confidence scores for each assessment
- Manual review flagging system

---

#### 🔍 Discovery Implementation Quick Start

**Step 1: Set up Google Custom Search API** (30 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Custom Search API"
3. Create API key
4. Go to [Custom Search Engine](https://programmablesearchengine.google.com/)
5. Create new search engine:
   - **Search the entire web:** Yes
   - **Name:** "Digital Presence Discovery"
6. Copy your **Search Engine ID** (looks like: `017576662512468239146:omuauf_lfve`)

**Step 2: Test Discovery** (15 min)

```python
import requests

def google_custom_search(query, api_key, search_engine_id, num_results=10):
    """Search Google for digital presence"""
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        'key': api_key,
        'cx': search_engine_id,
        'q': query,
        'num': num_results
    }
    response = requests.get(url, params=params)
    return response.json().get('items', [])

# Test
results = google_custom_search(
    query="Batik Artist Gambia",
    api_key="YOUR_API_KEY",
    search_engine_id="YOUR_SEARCH_ENGINE_ID"
)

# Print discovered URLs
for result in results:
    print(f"{result['title']}: {result['link']}")
```

**Step 3: Classify URLs** (30 min)

```python
def classify_url(url: str) -> str:
    """Determine what type of platform this URL is"""
    url_lower = url.lower()
    
    if 'facebook.com' in url_lower:
        return 'facebook'
    elif 'instagram.com' in url_lower:
        return 'instagram'
    elif 'tripadvisor' in url_lower:
        return 'tripadvisor'
    elif 'youtube.com' in url_lower:
        return 'youtube'
    elif any(directory in url_lower for directory in [
        'accessgambia', 'mygambia', 'visitthegambia'
    ]):
        return 'directory'
    else:
        return 'website'  # Assume official site

def discover_presence(name: str, region: str = "Gambia") -> dict:
    """Find all digital presence for a stakeholder"""
    results = google_custom_search(
        query=f"{name} {region}",
        api_key=API_KEY,
        search_engine_id=SEARCH_ENGINE_ID
    )
    
    discovered = {
        'website': None,
        'facebook': None,
        'instagram': None,
        'tripadvisor': None,
        'youtube': None,
        'directories': []
    }
    
    for result in results:
        url = result['link']
        platform = classify_url(url)
        
        if platform in discovered:
            if isinstance(discovered[platform], list):
                discovered[platform].append(url)
            elif not discovered[platform]:
                discovered[platform] = url
    
    return discovered
```

**Step 4: Add Google Places** (30 min)

```python
def search_google_places(name: str, region: str) -> dict:
    """Find Google My Business listing"""
    url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
    params = {
        'input': f"{name} {region}",
        'inputtype': 'textquery',
        'fields': 'place_id,name,formatted_address',
        'key': GOOGLE_PLACES_API_KEY
    }
    response = requests.get(url, params=params)
    data = response.json()
    
    if data.get('candidates'):
        return data['candidates'][0]
    return None

def get_place_details(place_id: str) -> dict:
    """Get detailed GMB info"""
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        'place_id': place_id,
        'fields': 'name,rating,user_ratings_total,photos,website,formatted_phone_number,opening_hours,reviews',
        'key': GOOGLE_PLACES_API_KEY
    }
    response = requests.get(url, params=params)
    return response.json().get('result', {})
```

**Step 5: Store Configuration** (15 min)

```json
// digital_assessment/sentiment/data/config/api_keys.json
{
  "google_custom_search": {
    "api_key": "YOUR_API_KEY",
    "search_engine_id": "YOUR_SEARCH_ENGINE_ID"
  },
  "google_places": {
    "api_key": "YOUR_PLACES_API_KEY"
  },
  "facebook_graph": {
    "app_id": "YOUR_APP_ID",
    "app_secret": "YOUR_APP_SECRET"
  }
}
```

**Security Note:** Don't commit `api_keys.json` to git! Add to `.gitignore`

**Test Discovery on 10 Stakeholders:**
```bash
python test_discovery.py --sheet-id 1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM --rows 2-11
```

Expected output:
```
Stakeholder: Batik Artist
  ✓ Website: https://batikartist.gm
  ✓ Facebook: https://facebook.com/batikartist
  ✓ Instagram: https://instagram.com/batikartist_gm
  ✓ GMB: place_id ChIJ...
  ✓ TripAdvisor: Not found
  Confidence: 0.8 (High)

Stakeholder: Tour Operator XYZ
  ✓ Website: https://tourxyz.com
  ✓ Facebook: https://facebook.com/tourxyz
  ✗ Instagram: Not found
  ✓ GMB: place_id ChIJ...
  ✓ TripAdvisor: https://tripadvisor.com/...
  Confidence: 0.7 (Medium)
```

---

## 🎯 PHASE 5: Pilot Testing

**Time Estimate:** 2-4 hours  
**Who:** You + 1-2 team members  
**Risk:** Low

### ☐ Task 5.1: Test on Sample Stakeholders

**Action:**
1. Select 5-10 diverse stakeholders
2. Manually score using new 10-point system
3. Compare to old scores
4. Document discrepancies
5. Refine criteria if needed

**Success Criteria:**
- New scores feel accurate
- Easier to assess than old system
- Sector weights make sense

---

### ☐ Task 5.2: Test Automation Scripts

**Action:**
1. Run `run_weighted_assessment.py` on test subset
2. Verify calculations are correct
3. Check Google Sheets updates properly
4. Review comparison reports

---

## 🎯 PHASE 6: Full Migration

**Time Estimate:** 1-2 days  
**Who:** You  
**Risk:** Medium

### ☐ Task 6.1: Archive Old System

**Action:**
1. Duplicate entire Google Sheet → "Archive Oct 2024"
2. Move old score columns to historical section
3. Mark old columns clearly: "[ARCHIVE - v1.0]"

---

### ☐ Task 6.2: Re-assess All Stakeholders

**Options:**

**Option A: Manual (slower, more accurate)**
- Use checklist form for each stakeholder
- Team of 2-3 people
- ~500 stakeholders × 15 min = 125 hours
- Spread over 2-3 weeks

**Option B: Automated (faster, needs validation)**
- Run script on all stakeholders
- Auto-calculate based on existing data
- ~500 stakeholders × 2 min = 17 hours
- Review 10% sample for accuracy

**Option C: Hybrid (recommended)**
- Auto-calculate for stakeholders with good existing data
- Manual review for unclear cases
- Prioritize key stakeholders for manual assessment

---

### ☐ Task 6.3: Update Dashboards

**Action:**
1. Update "Digital Readiness Matrix" sheet to use new scores
2. Update "Baseline Metrics" calculations
3. Update "Technical Analysis" formulas
4. Test all dashboard auto-updates

---

### ☐ Task 6.4: Document Changes

**Create:**
- "Methodology Change Log" sheet
- Migration date
- What changed and why
- Conversion notes
- Known issues

---

## 🎯 PHASE 7: Survey Strategy

**Time Estimate:** 2-4 hours  
**Who:** You  
**Risk:** Low

### ☐ Task 7.1: Re-position Survey in UI

**Current:** Survey score (0-30) is required for "Combined Score"  
**New:** External score (0-70) is primary, survey is optional bonus

**UI Changes:**
```
OLD DISPLAY:
━━━━━━━━━━━━━━━━━━━━━━━━━━
Combined Score: 63/100 (63%)
  ├─ External: 45/70
  └─ Survey: 18/30

NEW DISPLAY:
━━━━━━━━━━━━━━━━━━━━━━━━━━
Digital Readiness: 45/70 (64%) ⭐ Primary
━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Social Media: 17.6/22
🌐 Website: 5.0/10
📸 Visual Content: 18.0/20
🔍 Discoverability: 4.8/8
💳 Digital Sales: 1.5/5
🔗 Platform Integration: 2.0/5

Optional: Complete Survey (+30 points)
[Take 5-minute survey →]
```

---

### ☐ Task 7.2: Create Survey Incentive Strategy

**Ideas:**
- "Unlock personalized recommendations"
- "See how you compare to sector peers"
- "Get priority support access"
- Gamification: badge for completing survey

---

## 📅 Recommended Timeline

### Week 1: Setup
- ✓ Day 1-2: Phase 1 (Reference sheets)
- ✓ Day 3-4: Phase 2 (Add new columns)
- ✓ Day 5: Phase 3 (Checklists)

### Week 2: Development
- ✓ Day 1-3: Phase 4.1-4.2 (Core scripts)
- ✓ Day 4: Phase 4.3 (Multi-country)
- ✓ Day 5: Phase 4.4 (Apps Script)

### Week 3: Testing & Migration
- ✓ Day 1-2: Phase 5 (Pilot testing)
- ✓ Day 3-5: Phase 6 (Full migration)

### Week 4: Polish
- ✓ Day 1-2: Phase 7 (Survey strategy)
- ✓ Day 3-5: Documentation and training

---

## 🚨 Risk Mitigation

### Risk: Losing existing data
**Mitigation:** Always work on copies, archive original

### Risk: Formulas breaking
**Mitigation:** Test on small subset first, document all formula changes

### Risk: Scoring inconsistencies
**Mitigation:** Pilot test thoroughly, create detailed rubric

### Risk: Team adoption
**Mitigation:** Create simple checklist form, provide training

---

## ✅ Success Criteria

- [ ] All stakeholders have new raw scores (0-10 per category)
- [ ] Weighted scores calculate correctly per sector
- [ ] External score (0-70) is primary display
- [ ] Survey score (0-30) optional and working
- [ ] Historical comparison shows changes from old system
- [ ] Dashboards use new scores
- [ ] Documentation complete
- [ ] Team trained on new system

---

## 📞 Who to Involve

**You:**
- Overall strategy
- Weight decisions
- Testing
- Approval

**Data Team (if available):**
- Google Sheets setup
- Formula creation
- Data migration

**Developer:**
- Python scripts
- Apps Script
- Automation

**Assessors:**
- Manual scoring
- Using checklist forms
- Quality control

---

## 🎯 Quick Start (If You Want to Begin Now)

1. **Create "Sector Weights v2" sheet** (30 min)
2. **Test weights on 5 stakeholders manually** (1 hour)
3. **Refine weights based on results** (30 min)
4. **Create checklist for one category** (1 hour)
5. **Test checklist scoring** (30 min)

**Total:** ~3.5 hours to validate approach before full build

---

**Next Action:** Which phase would you like to start with?

