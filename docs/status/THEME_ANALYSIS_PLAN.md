# Theme-Based Sentiment Analysis Enhancement Plan

## Current State

### Regional Competitors (Full Theme Data)
**45 stakeholders** have comprehensive `theme_analysis` with 9 themes:
- `cultural_heritage`
- `art_creativity`
- `atmosphere_experience`
- `educational_value`
- `staff_service`
- `facilities_infrastructure`
- `music_performance`
- `value_pricing`
- `accessibility_location`

Each theme includes:
- `avg_sentiment` (score -1 to +1)
- `mentions` (count)
- `reviews_mentioning` (count)

### Gambian Stakeholders (Limited Theme Data)
**27 stakeholders** (12 creative + 15 operators) have:
- Individual theme score fields (mostly 0)
- `critical_areas` array with negative themes and quotes
- BUT missing the same structured `theme_analysis` format

## Data Structure Examples

### Regional (Rich Data)
```json
{
  "stakeholder_name": "Musée de la Fondation Zinsou (Ouidah)",
  "country": "Benin",
  "sector": "Cultural heritage sites/museums",
  "theme_analysis": {
    "staff_service": {
      "avg_sentiment": 0.880,
      "mentions": 36,
      "reviews_mentioning": 29
    },
    "facilities_infrastructure": {
      "avg_sentiment": 0.939,
      "mentions": 12,
      "reviews_mentioning": 11
    }
  }
}
```

### Gambian (Sparse Data)
```json
{
  "stakeholder_name": "abuko_nature_reserve",
  "service_quality_score": 0,
  "service_quality_mentions": 0,
  "infrastructure_score": 0,
  "infrastructure_mentions": 0,
  "critical_areas": [
    {
      "theme": "Accessibility Comfort",
      "sentiment_score": -0.433,
      "mention_count": 20
    },
    {
      "theme": "Infrastructure State",
      "sentiment_score": -0.125,
      "mention_count": 4
    }
  ]
}
```

## Proposed Enhancements

### 1. Theme Analysis Tab (New)
Add a fourth tab to Reviews & Sentiment page: **"Theme Analysis"**

**Features:**
- **Theme Comparison Heatmap**: Countries × Themes matrix showing average sentiment
- **Sector Breakdown**: Compare how each sector performs on each theme
- **Country Rankings**: Rank countries by theme performance
- **Gambia Gap Analysis**: Show where Gambia lags behind regional averages per theme

**Layout:**
```
┌─────────────────────────────────────────┐
│ Reviews & Sentiment Analysis            │
├─────────────────────────────────────────┤
│ [Creative] [Operators] [Regional] [Themes] ← NEW TAB
└─────────────────────────────────────────┘

Theme Analysis Tab:
┌─────────────────────────────────────────┐
│ 🎯 Regional Theme Performance            │
├─────────────────────────────────────────┤
│ Heatmap: Countries × Themes             │
│                                         │
│ Top 3 Themes Regionally:               │
│ 1. 🏗️ Facilities/Infrastructure (0.89)  │
│ 2. 🎨 Cultural Heritage (0.82)          │
│ 3. 👥 Staff/Service (0.81)              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📊 Sector Theme Comparison              │
├─────────────────────────────────────────┤
│ Chart: Each sector's theme performance │
│ Filter by: [Theme dropdown]            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🇬🇲 Gambia's Critical Areas            │
├─────────────────────────────────────────┤
│ Theme insights from critical_areas     │
│ - Infrastructure State: -0.13 (4)      │
│ - Accessibility Comfort: -0.43 (20)    │
└─────────────────────────────────────────┘
```

### 2. Enhanced Stakeholder Detail View
When clicking on a stakeholder in the table, show:
- Theme radar chart
- Top 3 performing themes
- Bottom 3 themes needing improvement
- Comparison vs sector average
- Comparison vs country average

### 3. Cross-Country Theme Comparison
Interactive filters:
- **Select Theme**: Dropdown to choose which theme to analyze
- **Select Sectors**: Multi-select for sector comparison
- **Select Countries**: Multi-select for country comparison

Visualizations:
- Bar chart: Country rankings for selected theme
- Line chart: Theme performance trends (if temporal data available)
- Table: Detailed breakdown with mention counts

### 4. Sector Theme Profiles
Create summary profiles showing:
- "Cultural Heritage Sites excel at: Educational Value, Cultural Heritage"
- "Tour Operators excel at: Staff Service, Value/Pricing"
- "Gambia needs improvement in: Infrastructure, Accessibility"

## Implementation Priority

### Phase 1: Display Existing Data (Immediate)
1. ✅ Add Theme Analysis tab to Reviews & Sentiment page
2. ✅ Display regional theme data in heatmap format
3. ✅ Show Gambia's critical areas (from `critical_areas` array)
4. ✅ Basic sector comparison charts

### Phase 2: Enhanced Analytics (Next)
1. Calculate regional averages by theme
2. Calculate sector averages by theme
3. Create comparative visualizations
4. Add filtering and drill-down capabilities

### Phase 3: Gambian Theme Enrichment (Future)
1. Re-run sentiment analysis for Gambian stakeholders to populate theme_analysis
2. Standardize theme taxonomy across all datasets
3. Add temporal trending (if historical data available)

## Key Insights to Surface

1. **Regional Strengths**: Which themes West African tourism excels at
2. **Gambia's Gaps**: Where Gambia underperforms vs regional averages
3. **Sector Patterns**: Which themes correlate with which sectors
4. **Best Practices**: Top performers by theme with learning opportunities
5. **Critical Issues**: Common negative themes requiring attention

## Technical Notes

### Data Normalization
- Regional data uses `theme_analysis` object
- Gambian data uses individual `*_score` fields and `critical_areas`
- Need utility function to normalize both formats

### Theme Mapping
Regional themes → Gambian fields:
- `staff_service` → `service_quality_score`
- `facilities_infrastructure` → `infrastructure_score`
- `educational_value` → `educational_value_score`
- `value_pricing` → `value_pricing_score`
- `cultural_heritage` → `authenticity_culture_score`?
- `art_creativity` → `artistic_creative_quality_score`

### Missing Mappings
Some regional themes don't have Gambian equivalents:
- `atmosphere_experience` - NEW
- `music_performance` - NEW
- `accessibility_location` - Could map to `critical_areas` theme "Accessibility Comfort"

## Success Metrics

✅ Users can compare theme performance across countries
✅ Users can identify sector-specific theme strengths/weaknesses
✅ Gambia's theme-based gaps vs regional competitors are clear
✅ Best practice examples by theme are easily discoverable
✅ Critical areas for Gambian stakeholders are highlighted

