# Region Tab - Dashboard Specification

## Tab Structure

**Navigation:** Sectors | Participants | Methodology | **Region** ← NEW

---

## Region Tab Layout

### Section 1: HEADER & OVERVIEW (Top Banner)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ REGIONAL COMPETITIVE ANALYSIS                                              │
│ The Gambia vs West African Creative Industries                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  THE GAMBIA: 15.29/60          REGIONAL AVG: 20.25/60         GAP: -4.96  │
│  ──────────────────────        ─────────────────────        ────────────  │
│       [●─────────]                  [●──────────]              Behind      │
│                                                                            │
│  90 Entities Analyzed          199 Regional Entities          5 Countries │
└────────────────────────────────────────────────────────────────────────────┘
```

**Visual Elements:**
- Progress bars for Gambia vs Regional scores
- Color coding: Red for below average, Green for above
- Quick stat cards

---

### Section 2: CATEGORY PERFORMANCE (Radar Chart)

**Layout:** Left side (60% width)

#### Radar/Spider Chart: "6-Category Comparison"
- **Axes:** Social Media, Website, Visual Content, Discoverability, Digital Sales, Platform Integration
- **Two polygons:**
  - **Green line:** The Gambia
  - **Orange line:** Regional Average
  - **Shaded areas:** Shows gap

**Interactive:**
- Hover over point to see exact scores
- Click category to filter data below

#### Right side (40% width): "Strengths & Gaps"

**✅ Gambia Strengths:**
```
╔═══════════════════════════════════╗
║ DISCOVERABILITY                   ║
║ 3.11/10 vs 1.44/10 regional       ║
║ +1.67 AHEAD ↑                     ║
║                                   ║
║ Why: Strong SEO, visibility       ║
╚═══════════════════════════════════╝

╔═══════════════════════════════════╗
║ PLATFORM INTEGRATION              ║
║ 1.36/10 vs 1.23/10 regional       ║
║ +0.13 ahead ↑                     ║
╚═══════════════════════════════════╝
```

**❌ Priority Gaps:**
```
╔═══════════════════════════════════╗
║ SOCIAL MEDIA - CRITICAL GAP       ║
║ 3.02/10 vs 5.17/10 regional       ║
║ -2.15 BEHIND ↓                    ║
║                                   ║
║ Action: Instagram presence needed ║
╚═══════════════════════════════════╝

╔═══════════════════════════════════╗
║ WEBSITE                           ║
║ 3.74/10 vs 5.49/10 regional       ║
║ -1.74 behind ↓                    ║
╚═══════════════════════════════════╝

╔═══════════════════════════════════╗
║ DIGITAL SALES                     ║
║ 0.51/10 vs 2.04/10 regional       ║
║ -1.53 behind ↓                    ║
╚═══════════════════════════════════╝
```

---

### Section 3: COUNTRY RANKINGS (Bar Chart)

**Horizontal Bar Chart: "Average Digital Maturity by Country"**

```
Nigeria          ████████████████████ 23.32/60
Ghana            ███████████████████ 23.00/60
Senegal          ████████████████ 20.95/60
──────────────── ──────────────── Regional Avg: 20.25
Cape Verde       ██████████████ 18.15/60
✦ THE GAMBIA     ████████ 15.29/60 ← HIGHLIGHTED
Benin            ██████ 15.90/60
```

**Features:**
- Gambia highlighted in distinct color (gold/blue)
- Dotted line showing regional average
- Entity count shown on hover
- Clickable to drill into country detail

**Filters (Above chart):**
- [ ] All Categories | [ ] Social Media | [ ] Website | [ ] Visual Content | etc.
- When filtered, bars update to show that category's average

---

### Section 4: SECTOR COMPARISON (Grouped Bar Chart)

**Title:** "Gambia vs Regional by Sector"

**Chart:**
```
Music              [Gambia] [Regional]
Fashion            [Gambia] [Regional]
Museums            [Gambia] [Regional]
Crafts             [Gambia] [Regional]
Performing Arts    [Gambia] [Regional]
Audiovisual        [Gambia] [Regional]
Festivals          [Gambia] [Regional]
Marketing          [Gambia] [Regional]
```

Each sector shows two bars side-by-side:
- **Blue bar:** Gambia average
- **Orange bar:** Regional average

**Interactive Table Below Chart:**

| Sector | Gambia Avg | Entities | Regional Avg | Entities | Gap | Status |
|--------|------------|----------|--------------|----------|-----|--------|
| Fashion & Design | X.XX | XX | 23.76 | 25 | ±X.XX | ⬇️ |
| Music | X.XX | XX | XX.XX | 24 | ±X.XX | ⬇️ |
| Museums | X.XX | XX | 20.04 | 25 | ±X.XX | ⬇️ |
| ... | ... | ... | ... | ... | ... | ... |

**Sort/Filter Options:**
- Sort by: Gap (ascending/descending)
- Show only: [ ] Below average | [ ] Above average

---

### Section 5: VISUAL CONTENT SPOTLIGHT

**Two-Column Layout:**

#### Left: "Regional Visual Content Leaders (10/10)"

**Card Grid:**
```
┌─────────────────────────────────┐
│ Youssou N'Dour                  │
│ Senegal • Music                 │
│ ──────────────────────────────  │
│ Visual: 10/10 ★★★★★            │
│ Total: 33/60                    │
│ ──────────────────────────────  │
│ ✓ 77 Instagram posts            │
│ ✓ 18M followers                 │
│ ✓ Professional website          │
│                                 │
│ [Learn More →]                  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Adama Paris                     │
│ Senegal • Fashion               │
│ ──────────────────────────────  │
│ Visual: 10/10 ★★★★★            │
│ Total: 33/60                    │
│ ──────────────────────────────  │
│ ✓ 217 Instagram posts           │
│ ✓ 23K followers                 │
│ ✓ Website with 4 faces detected │
│                                 │
│ [Learn More →]                  │
└─────────────────────────────────┘

[... more cards ...]
```

#### Right: "Gambia's Visual Content Performance"

**Stats Box:**
```
╔══════════════════════════════════════╗
║ GAMBIA VISUAL CONTENT                ║
║ ────────────────────────────────────║
║ Average: 3.54/10                     ║
║ Regional: 4.88/10                    ║
║ Gap: -1.34 points                    ║
║                                      ║
║ Entities with 7+/10:  X              ║
║ Entities with 0/10:   X              ║
╚══════════════════════════════════════╝
```

**Top Gambian Visual Performers:**
```
1. [Entity Name]    X/10  [Sector]
2. [Entity Name]    X/10  [Sector]
3. [Entity Name]    X/10  [Sector]
4. [Entity Name]    X/10  [Sector]
5. [Entity Name]    X/10  [Sector]
```

**[View Full Visual Content Analysis →]** button

---

### Section 6: GAP ANALYSIS (Waterfall Chart)

**Title:** "Digital Maturity Gap Breakdown"

**Waterfall Visualization:**
```
20 ┤                                         ╔═══╗ Regional
19 ┤                                         ║   ║
18 ┤                                         ║   ║
17 ┤                                         ║   ║
16 ┤                                    ╔════╝   ║
15 ┤ ╔═══╗                         ↓─2.15      ║
14 ┤ ║   ║                    ↓─1.74           ║
13 ┤ ║   ║↑+1.67         ↓─1.34                ║
12 ┤ ║   ╚══╗       ↓─1.53                     ║
11 ┤ ║      ║                                   ║
   └─┴──────┴────────────────────────────────────
   Gambia Discover Website Visual Sales Platform Regional
   Start   +1.67  -1.74   -1.34  -1.53  +0.13   Avg
```

**Legend:**
- Green bars: Gambia ahead
- Red bars: Gambia behind

**Interpretation Box:**
"The Gambia's strong discoverability (+1.67) is offset by gaps in social media (-2.15), website (-1.74), and visual content (-1.34). Closing these 3 gaps would bring Gambia to regional parity."

---

### Section 7: RECOMMENDATIONS PANEL

**Accordion/Expandable Sections:**

#### 🎯 **Priority 1: Boost Social Media Presence**
```
Gap: -2.15 points | Impact: High | Difficulty: Medium
──────────────────────────────────────────────────
Current: 3.02/10 | Target: 5.17/10 (regional avg)

Actions:
✓ Increase Instagram posting frequency (currently avg X posts)
✓ Build follower base through engagement campaigns
✓ Create consistent content calendar
✓ Use Instagram Reels for video content

Learn from:
• Youssou N'Dour (18M followers)
• Adama Paris (23K followers, 217 posts)

Expected Improvement: +2.15 points
──────────────────────────────────────────────────
[View Detailed Playbook →]
```

#### 🎯 **Priority 2: Upgrade Website Quality**
```
Gap: -1.74 points | Impact: High | Difficulty: Medium
──────────────────────────────────────────────────
Current: 3.74/10 | Target: 5.49/10 (regional avg)

Actions:
✓ Professional photography for all websites
✓ Include people/faces in images (builds trust)
✓ Ensure mobile responsiveness
✓ Add sector-relevant content (products, services)

Learn from:
• Christie Brown (8 images, 5 faces detected)
• Pistis (5 images, professional quality)

Expected Improvement: +1.74 points
──────────────────────────────────────────────────
[View Detailed Playbook →]
```

#### 🎯 **Priority 3: Enable Digital Sales**
```
Gap: -1.53 points | Impact: High | Difficulty: High
──────────────────────────────────────────────────
Current: 0.51/10 | Target: 2.04/10 (regional avg)

Actions:
✓ Implement e-commerce for crafts/fashion
✓ Online booking for tours/events
✓ Payment integration (mobile money, cards)
✓ Shopping cart functionality

Learn from:
• Global Mamas (e-commerce leader)
• Regional tour operators with booking systems

Expected Improvement: +1.53 points
──────────────────────────────────────────────────
[View Detailed Playbook →]
```

---

### Section 8: DATA EXPORTS & ACTIONS

**Button Bar (Bottom Right):**

```
[📊 Export Full Report PDF]  [📈 Download Data CSV]  [📧 Email Analysis]
```

**Quick Actions:**
```
[🎯 View Gambia Participants →]  [📚 See Methodology →]  [🔄 Refresh Data]
```

---

## Data Sources for Region Tab

### JSON Endpoints/Files:

1. **`gambia_competitive_analysis_[date].json`**
   - Overall comparison stats
   - Sector comparisons
   - Best practices/top performers

2. **`updated_benchmarks_[date].json`**
   - Regional country rankings
   - Sector benchmarks
   - Category leaders

3. **Real-time from Google Sheets:**
   - Gambia: `Checklist Detail` sheet
   - Regional: `Regional Checklist Detail` sheet

### Data Refresh Strategy:
- **On page load:** Fetch latest JSON files
- **Manual refresh:** Button to regenerate analysis
- **Auto-refresh:** Weekly (scheduled)

---

## Interactive Features

### Filters (Global for Tab):
- **Country:** [ ] Gambia | [ ] Senegal | [ ] Nigeria | [ ] Ghana | [ ] Cape Verde | [ ] Benin | [ ] All
- **Sector:** [Dropdown: All Sectors, Music, Fashion, Museums, etc.]
- **Category:** [Dropdown: Overall, Social Media, Website, Visual Content, etc.]

### Drill-Downs:
- Click country → Show all entities from that country
- Click sector → Show Gambia vs Regional entities in that sector
- Click entity card → Full entity detail page

### Comparisons:
- Select 2 entities → Side-by-side comparison
- Compare Gambia entity to regional leader

---

## Mobile Responsive Behavior

### Desktop (>1200px):
- Full layout as described
- 2-3 column layouts

### Tablet (768-1200px):
- Stack sections vertically
- Radar chart + stats become full-width

### Mobile (<768px):
- Single column
- Simplified bar charts (top 3 countries only)
- Accordion sections collapsed by default

---

## Technical Implementation

### Framework Options:
1. **React + Recharts** - For interactive charts
2. **Plotly.js** - Python-generated, embedded in HTML
3. **Google Data Studio** - Direct Google Sheets integration

### Key Components:
```javascript
<RegionTab>
  <OverviewBanner data={comparison} />
  <CategoryRadarChart gambia={gambiaData} regional={regionalData} />
  <CountryRankings countries={countryBenchmarks} />
  <SectorComparison sectors={sectorComparisons} />
  <VisualContentSpotlight leaders={visualLeaders} />
  <GapAnalysis gaps={gapData} />
  <RecommendationsPanel priorities={recommendations} />
  <ExportButtons />
</RegionTab>
```

---

## Success Metrics

Users should be able to answer:
1. ✅ "How does Gambia compare to the region overall?"
2. ✅ "What are our strongest/weakest areas?"
3. ✅ "Which sectors need most improvement?"
4. ✅ "Who are the regional leaders we can learn from?"
5. ✅ "What specific actions should we take?"

---

*This Region tab provides a comprehensive, actionable view of Gambia's competitive position and clear pathways for improvement.*

