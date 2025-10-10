# ITO Perception Analysis - Implementation Plan

## 🎯 Goal
Understand how International Tour Operators (ITOs) position and perceive Gambian creative tourism offerings through AI-powered content analysis.

## 📊 Data Sources
- **29 Tour Operators** 
- **28 Gambia destination pages** (general marketing)
- **14 tour/itinerary pages** (specific packages)

## 🔧 Technical Stack

### Phase 1: Content Extraction
**Tool:** Playwright + BeautifulSoup
- Scrape Gambia pages and tour pages
- Extract main content (filter navigation/footers)
- Save raw text + HTML structure
- Extract metadata (title, description)

### Phase 2: AI-Powered Analysis
**Primary Engine:** Google Cloud Natural Language API
- Sentiment analysis
- Entity recognition (places, activities)
- Content classification

**Secondary Engine:** OpenAI GPT-4 (for deep insights)
- Thematic analysis
- Quote extraction
- Cultural positioning assessment

### Phase 3: Creative Industry Detection
**Custom NLP Pipeline:**
- Keyword matching for 8 sectors
- Context analysis (mentioned vs. featured)
- Depth scoring (word count, placement, emphasis)

## 📈 Metrics to Calculate

### 1. Creative Industry Visibility
**Per Sector (0-10 scale):**
- Music
- Crafts & Artisan Products
- Heritage Sites & Museums
- Fashion & Design
- Festivals & Cultural Events
- Audiovisual (Film/Photo)
- Performing & Visual Arts
- Publishing/Marketing

**Scoring Logic:**
- 0 = Not mentioned
- 1-3 = Brief mention (1 sentence)
- 4-6 = Described (paragraph, some detail)
- 7-9 = Featured (dedicated section, itinerary item)
- 10 = Highlighted (key selling point, extensive coverage)

### 2. Overall Creative Tourism Score (0-100)
- Sum of all 8 sector scores × 1.25
- Measures: How much is Gambia positioned as a cultural/creative destination?

### 3. Sentiment Analysis (-1 to +1)
- Overall tone toward Gambia
- Language quality (enthusiastic vs. generic)
- Positioning (unique vs. commodity)

### 4. Packaging Analysis
**From Existing Columns + AI Analysis:**
- Solo destination vs. multi-country
- % of itinerary in Gambia (AI calculates from day-by-day)
- Gambia's role: Primary vs. add-on vs. transit

### 5. Positioning Categories
**AI-Detected Primary Themes (rank 1-3):**
- Beach/Resort destination
- Wildlife/Nature destination
- Cultural heritage destination
- Adventure/Active destination
- Roots/Diaspora tourism
- Birding/Specialist destination

### 6. Quote Extraction
**AI selects most representative quotes:**
- Best positive quote about Gambia
- Most compelling cultural mention
- Any unique positioning statements

## 📋 New Google Sheet Columns

Add to "ITO Assessment" (after existing columns):

| Column | Description | Type |
|--------|-------------|------|
| `AA` | Scraped Status | Text (✅/❌/⏳) |
| `AB` | Gambia Text Word Count | Number |
| `AC` | Tour Pages Text Word Count | Number |
| `AD` | Overall Sentiment | Number (-1 to +1) |
| `AE` | Creative Tourism Score | Number (0-100) |
| `AF` | Music Score | Number (0-10) |
| `AG` | Crafts Score | Number (0-10) |
| `AH` | Heritage Score | Number (0-10) |
| `AI` | Fashion Score | Number (0-10) |
| `AJ` | Festivals Score | Number (0-10) |
| `AK` | Audiovisual Score | Number (0-10) |
| `AL` | Performing Arts Score | Number (0-10) |
| `AM` | Publishing Score | Number (0-10) |
| `AN` | Primary Theme 1 | Text |
| `AO` | Primary Theme 2 | Text |
| `AP` | Primary Theme 3 | Text |
| `AQ` | Best Cultural Quote | Text |
| `AR` | Gambia % (AI Calculated) | Number (0-100%) |
| `AS` | Analysis Date | Date |

## 🎨 Dashboard Integration

### New Tab: "ITO Perception"

**Overview Cards:**
- Average Creative Tourism Score
- Average Sentiment
- Most Mentioned Creative Sector
- Least Mentioned Creative Sector

**Visualizations:**
1. **Creative Sector Radar Chart** (8 sectors, avg scores)
2. **Sentiment by Operator Type** (Niche vs. Mass Market)
3. **Packaging Analysis** (Solo vs. Multi-country breakdown)
4. **Top Quotes Carousel** (Best cultural quotes from ITOs)
5. **Sector Mention Heatmap** (Which operators mention which sectors)
6. **Gap Analysis** (What's missing from ITO narratives?)

**Operator Deep Dive:**
- Searchable/filterable table
- Click to see full analysis
- Links to scraped pages

## 🚀 Implementation Phases

### Phase 1: Scraper (Day 1)
- Build Playwright scraper
- Extract content from all pages
- Save to JSON + update sheet status

### Phase 2: AI Analysis (Day 1-2)
- Google NLP sentiment analysis
- Creative sector keyword detection
- GPT-4 thematic analysis
- Quote extraction

### Phase 3: Sheet Integration (Day 2)
- Write all metrics back to sheet
- Update existing analysis columns
- Add timestamp

### Phase 4: Dashboard (Day 2-3)
- Generate dashboard data JSON
- Build ITO Perception tab
- Add visualizations

## 💰 Cost Estimate

**Google Cloud NLP:**
- 29 operators × 2 pages avg = ~60 API calls
- $0.001 per entity/sentiment call
- **~$0.06 total**

**OpenAI GPT-4:**
- 29 operators × 2 pages × ~2,000 tokens avg = ~120K tokens input
- 29 operators × 500 tokens output = ~15K tokens output
- $0.01/1K input, $0.03/1K output
- **~$1.65 total**

**Total: ~$1.71** for complete analysis

## 📝 Sample Output

**Example: Explore.co.uk**
```json
{
  "operator": "Explore",
  "sentiment": 0.78,
  "creative_tourism_score": 65,
  "sector_scores": {
    "music": 3,
    "crafts": 7,
    "heritage": 8,
    "fashion": 2,
    "festivals": 4,
    "audiovisual": 0,
    "performing_arts": 5,
    "publishing": 0
  },
  "primary_themes": ["Cultural Heritage", "Nature & Wildlife", "Adventure"],
  "packaging": "Multi-country with Senegal",
  "gambia_percentage": 60,
  "best_quote": "Explore Gambia's rich cultural heritage through visits to traditional villages and craft markets",
  "analysis": "Strong emphasis on heritage sites (Kunta Kinteh Island) and craft markets. Gambia positioned as cultural complement to Senegal. Music and arts mentioned but not deeply featured in itinerary."
}
```

## ✅ Success Metrics
- All 29 operators analyzed
- 8 sector scores per operator
- Representative quotes extracted
- Dashboard showing clear patterns
- Actionable insights: Which sectors are underrepresented? Which operators to target for partnerships?

