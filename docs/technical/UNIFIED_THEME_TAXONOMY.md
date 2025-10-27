# Unified Theme Taxonomy for Cross-Regional Comparison

## Problem Statement

**Current State:**
- Gambian data has 8 themes (including overly specific "ferry_service")
- Regional data has 9 themes (different names, different concepts)
- **Cannot do meaningful cross-comparison** with mismatched taxonomies

**Solution:**
Create a universal theme taxonomy that:
1. Works for ALL stakeholder types (museums, tours, sites, markets)
2. Works for ALL countries (Gambia, Nigeria, Ghana, Senegal, Benin, Cape Verde)
3. Captures all essential visitor experience dimensions
4. Can be mapped from existing data OR used to re-run analysis

## Proposed Unified Theme Taxonomy (9 Core Themes)

### 1. **Cultural & Heritage Value**
**What it measures:** Authenticity, historical significance, cultural depth, heritage preservation
**Keywords:** culture, heritage, history, authentic, traditional, significance, preservation
**Existing mappings:**
- Gambian: `cultural_value`, `historical_significance` 
- Regional: `cultural_heritage`

### 2. **Service & Staff Quality**
**What it measures:** Staff friendliness, guide knowledge, hospitality, customer service
**Keywords:** staff, guide, service, friendly, helpful, knowledgeable, hospitable
**Existing mappings:**
- Gambian: `guide_quality`
- Regional: `staff_service`

### 3. **Facilities & Infrastructure**
**What it measures:** Physical condition, maintenance, cleanliness, modern amenities
**Keywords:** facilities, infrastructure, building, maintenance, clean, condition, restrooms
**Existing mappings:**
- Gambian: `infrastructure_state`
- Regional: `facilities_infrastructure`

### 4. **Accessibility & Transport**
**What it measures:** Location accessibility, transport options, parking, ease of access, wayfinding
**Keywords:** access, transport, location, parking, directions, signage, ferry, bus, taxi
**Existing mappings:**
- Gambian: `accessibility_comfort`, `ferry_service` ← **MERGE THESE**
- Regional: `accessibility_location`

### 5. **Value for Money**
**What it measures:** Price perception, value received, cost-benefit assessment
**Keywords:** price, value, expensive, cheap, worth, money, cost, fee
**Existing mappings:**
- Gambian: `value_pricing` ✓
- Regional: `value_pricing` ✓
**Status:** Already unified!

### 6. **Safety & Security**
**What it measures:** Safety concerns, security presence, risk perception
**Keywords:** safe, safety, security, dangerous, risk, crime, guard
**Existing mappings:**
- Gambian: `safety_security`
- Regional: *(not currently tracked)* ← **ADD TO REGIONAL**

### 7. **Educational & Informational Value**
**What it measures:** Learning opportunities, information quality, interpretation, exhibits
**Keywords:** learn, educational, information, exhibit, explanation, knowledge, informative
**Existing mappings:**
- Gambian: *(not currently tracked)* ← **ADD TO GAMBIAN**
- Regional: `educational_value`

### 8. **Artistic & Creative Quality**
**What it measures:** Artistic expression, creativity, aesthetic quality, craftsmanship
**Keywords:** art, artistic, creative, beautiful, crafts, design, aesthetic, gallery
**Existing mappings:**
- Gambian: *(not currently tracked)* ← **ADD TO GAMBIAN**
- Regional: `art_creativity`

### 9. **Atmosphere & Overall Experience**
**What it measures:** Ambiance, overall feel, visitor experience quality, enjoyment
**Keywords:** atmosphere, ambiance, experience, enjoyable, pleasant, memorable, vibe
**Existing mappings:**
- Gambian: *(not currently tracked)* ← **ADD TO GAMBIAN**
- Regional: `atmosphere_experience`

### Optional 10th Theme (Sector-Specific)
**Music & Performance** - Only relevant for venues with live entertainment
- Regional: `music_performance`
- Gambian: *(not tracked)*
- **Recommendation:** Keep as optional, or merge into "Artistic & Creative Quality"

## Mapping Strategy

### Option A: Map Existing Data (Quick, No Re-Analysis)
Create a mapping layer in the dashboard that translates old themes to new unified themes.

**Gambian Mapping:**
```javascript
const gambianThemeMapping = {
  // Direct mappings
  'value_pricing': 'value_money',
  'safety_security': 'safety_security',
  
  // Merged mappings
  'cultural_value': 'cultural_heritage',
  'historical_significance': 'cultural_heritage',  // merge with above
  'guide_quality': 'service_staff',
  'infrastructure_state': 'facilities_infrastructure',
  'accessibility_comfort': 'accessibility_transport',
  'ferry_service': 'accessibility_transport',  // merge with above
  
  // Missing themes (no data available)
  'educational_value': null,
  'artistic_creative': null,
  'atmosphere_experience': null
};
```

**Regional Mapping:**
```javascript
const regionalThemeMapping = {
  // Direct mappings (rename only)
  'value_pricing': 'value_money',
  'cultural_heritage': 'cultural_heritage',
  'staff_service': 'service_staff',
  'facilities_infrastructure': 'facilities_infrastructure',
  'accessibility_location': 'accessibility_transport',
  'educational_value': 'educational_value',
  'art_creativity': 'artistic_creative',
  'atmosphere_experience': 'atmosphere_experience',
  'music_performance': 'artistic_creative',  // merge into creative
  
  // Missing theme (no data available)
  'safety_security': null
};
```

### Option B: Re-Run Analysis with Unified Taxonomy (Better, More Time)
Update the sentiment analysis scripts to use the unified theme taxonomy and re-process all reviews.

**Implementation:**
1. Update `enhanced_theme_analysis.py` with new theme keywords
2. Re-run analysis for Gambian stakeholders (27 stakeholders)
3. Re-run analysis for Regional stakeholders (45 stakeholders)
4. Generate new dashboard JSON files with unified themes

**Estimated time:** 2-4 hours to re-analyze all reviews

## Recommended Approach

### Phase 1: Quick Win (Use Mapping Layer)
1. Create theme mapping utility in dashboard
2. When displaying themes, merge/translate to unified names
3. For missing themes, show "No data" or exclude from comparison
4. **Time:** 1 hour
5. **Benefit:** Immediate cross-comparison capability

### Phase 2: Full Re-Analysis (Complete Solution)
1. Update sentiment analysis configuration
2. Re-run all analyses with unified themes
3. Replace dashboard JSON files
4. **Time:** 2-4 hours
5. **Benefit:** Complete, accurate data for all 9 themes across all stakeholders

## Unified Theme Configuration for Re-Analysis

```python
# enhanced_theme_analysis.py configuration

UNIFIED_THEMES = {
    'cultural_heritage': {
        'keywords': [
            'culture', 'cultural', 'heritage', 'history', 'historical',
            'authentic', 'traditional', 'significance', 'preservation',
            'legacy', 'ancestor', 'origin', 'custom', 'ritual'
        ],
        'weight': 1.0,
        'applies_to': 'all'
    },
    
    'service_staff': {
        'keywords': [
            'staff', 'guide', 'service', 'friendly', 'helpful',
            'knowledgeable', 'hospitable', 'welcoming', 'professional',
            'courteous', 'attentive', 'tour guide', 'host'
        ],
        'weight': 1.0,
        'applies_to': 'all'
    },
    
    'facilities_infrastructure': {
        'keywords': [
            'facilities', 'infrastructure', 'building', 'maintenance',
            'clean', 'condition', 'restroom', 'bathroom', 'toilet',
            'amenities', 'upkeep', 'repair', 'modern', 'facility'
        ],
        'weight': 1.0,
        'applies_to': 'all'
    },
    
    'accessibility_transport': {
        'keywords': [
            'access', 'accessible', 'transport', 'transportation',
            'location', 'parking', 'directions', 'signage', 'sign',
            'ferry', 'bus', 'taxi', 'drive', 'walk', 'reach',
            'find', 'navigate', 'wayfinding', 'entrance'
        ],
        'weight': 1.0,
        'applies_to': 'all'
    },
    
    'value_money': {
        'keywords': [
            'price', 'pricing', 'value', 'expensive', 'cheap',
            'worth', 'money', 'cost', 'fee', 'charge', 'admission',
            'ticket', 'affordable', 'overpriced', 'reasonable'
        ],
        'weight': 1.0,
        'applies_to': 'all'
    },
    
    'safety_security': {
        'keywords': [
            'safe', 'safety', 'security', 'dangerous', 'danger',
            'risk', 'crime', 'guard', 'secure', 'protect',
            'threat', 'hazard', 'precaution'
        ],
        'weight': 1.0,
        'applies_to': 'all'
    },
    
    'educational_value': {
        'keywords': [
            'learn', 'educational', 'education', 'information',
            'informative', 'exhibit', 'exhibition', 'explanation',
            'knowledge', 'teach', 'insight', 'discover',
            'understand', 'interpretation', 'label', 'plaque'
        ],
        'weight': 1.0,
        'applies_to': 'all'
    },
    
    'artistic_creative': {
        'keywords': [
            'art', 'artistic', 'creative', 'creativity', 'beautiful',
            'crafts', 'craftsman', 'design', 'aesthetic', 'gallery',
            'artist', 'artwork', 'collection', 'masterpiece',
            'visual', 'handmade', 'music', 'performance', 'show'
        ],
        'weight': 1.0,
        'applies_to': 'all'
    },
    
    'atmosphere_experience': {
        'keywords': [
            'atmosphere', 'ambiance', 'experience', 'enjoyable',
            'pleasant', 'memorable', 'vibe', 'feel', 'feeling',
            'environment', 'setting', 'mood', 'wonderful',
            'amazing', 'fantastic', 'boring', 'disappointing'
        ],
        'weight': 1.0,
        'applies_to': 'all'
    }
}
```

## Cross-Comparison Examples (After Unification)

### Example 1: Infrastructure Comparison
```
Country/Stakeholder          facilities_infrastructure
──────────────────────────  ────────────────────────
Gambia (Avg)                        0.45  ▓▓▓▓▓░░░░░
Nigeria (Avg)                       0.92  ▓▓▓▓▓▓▓▓▓░
Ghana (Avg)                         0.87  ▓▓▓▓▓▓▓▓▓░
Senegal (Avg)                       0.85  ▓▓▓▓▓▓▓▓░░
Benin (Avg)                         0.88  ▓▓▓▓▓▓▓▓▓░
Cape Verde (Avg)                    0.90  ▓▓▓▓▓▓▓▓▓░

Gap: Gambia -0.44 vs Regional Avg (0.88)
Priority: HIGH - Biggest improvement opportunity
```

### Example 2: Service Quality Comparison
```
Country/Stakeholder          service_staff
──────────────────────────  ────────────────────────
Gambia (Avg)                        0.76  ▓▓▓▓▓▓▓▓░░
Nigeria (Avg)                       0.78  ▓▓▓▓▓▓▓▓░░
Ghana (Avg)                         0.80  ▓▓▓▓▓▓▓▓░░
Senegal (Avg)                       0.75  ▓▓▓▓▓▓▓░░░
Benin (Avg)                         0.81  ▓▓▓▓▓▓▓▓░░
Cape Verde (Avg)                    0.88  ▓▓▓▓▓▓▓▓▓░

Gap: Gambia -0.03 vs Regional Avg (0.79)
Priority: LOW - Already competitive
```

## Benefits of Unified Taxonomy

1. ✅ **Direct cross-comparison** between Gambia and any regional competitor
2. ✅ **Sector benchmarking** - compare museums to museums, tours to tours
3. ✅ **Country rankings** - rank all countries on each theme
4. ✅ **Gap analysis** - identify exactly where Gambia needs improvement
5. ✅ **Best practices** - find regional leaders on specific themes
6. ✅ **Consistent reporting** - all stakeholders measured on same dimensions
7. ✅ **Actionable insights** - clear priorities based on comparable data

## Next Steps

**Immediate Decision Needed:**
- [ ] **Option A**: Implement mapping layer (quick, but some data gaps)
- [ ] **Option B**: Re-run full analysis with unified themes (complete, but takes time)

**Recommendation:** Start with Option A for immediate functionality, then do Option B for completeness.

**Questions for User:**
1. Do these 9 unified themes capture all important visitor experience dimensions?
2. Any themes to add, remove, or rename?
3. Should we merge "Music & Performance" into "Artistic & Creative"?
4. Priority: Quick mapping layer or full re-analysis?

