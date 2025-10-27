# Reviews & Sentiment Data Integration

## Issue
The Reviews & Sentiment page was missing two critical datasets:
1. **Gambia Tour Operators** - Review data for local tour companies (Janeya Tours, Lams Tours, Timo Tours, etc.)
2. **Regional Competitors** - Sentiment data for creative industry stakeholders in Nigeria, Benin, Ghana, Cape Verde, and Senegal

The page was only showing Gambian creative industry stakeholders (museums, heritage sites, craft markets).

## Solution
Integrated all three sentiment datasets into a unified view with filtering capabilities.

### Data Files Added
Copied two new data files from the sentiment analysis output to the dashboard:

1. **tour_operators_sentiment.json**
   - Source: `sentiment/output/tour_operators_sentiment_analysis_results.json`
   - Contains: 11 Gambia tour operators
   - Includes: Janeya Tours, Lams Tours, Timo Tours, Simon Tours, Omi Tours, Arch Tours, Bushwhacker Tours, Aji Tours, Fatou Tours, Eco Tours

2. **regional_sentiment.json**
   - Source: `sentiment/output/regional_sentiment/regional_sentiment_analysis.json`
   - Contains: 45 regional stakeholders across 5 countries
   - Total: 3,096 reviews
   - Countries: Nigeria, Benin, Ghana, Cape Verde, Senegal
   - Sectors: Museums & Heritage, Festivals & Events, Markets & Crafts, Tour Operators, Performing Arts

### UI Organization

The page uses a **tab-based interface** (not simple filters) because each data source has:
- **Different data structures**: Creative industries analyze themes like accessibility/safety; tour operators focus on guide performance; regional data has country/sector comparisons
- **Different insights**: Each stakeholder type requires different visualization and analysis approaches
- **Customized context**: Each tab shows relevant intro text and context specific to that data source

#### Tab Navigation
- **🎨 Creative Industries**: Museums, Heritage Sites, Crafts
- **🚐 Tour Operators**: Gambia Tour Companies  
- **🌍 Regional Competitors**: Nigeria, Ghana, Senegal, Benin, Cape Verde

Each tab:
- Resets stakeholder selection when switched
- Shows tab-specific intro banner with context
- Displays metrics relevant to that data source
- Has a count badge showing number of stakeholders

### Code Changes

#### 1. Updated Data Loading (Lines 49-82)
```typescript
// Load all three datasets
Promise.all([
  fetch(`${basePath}/sentiment_data.json`).then(res => res.json()),
  fetch(`${basePath}/tour_operators_sentiment.json`).then(res => res.json()),
  fetch(`${basePath}/regional_sentiment.json`).then(res => res.json())
])
  .then(([creativeData, operatorData, regionalData]) => {
    // Add source tags to each stakeholder
    const creativeStakeholders = creativeData.stakeholder_data.map((s: any) => ({
      ...s,
      source: 'creative',
      country: 'Gambia'
    }));
    const operatorStakeholders = operatorData.stakeholder_data.map((s: any) => ({
      ...s,
      source: 'operators',
      country: 'Gambia'
    }));
    const regionalStakeholders = regionalData.stakeholder_data.map((s: any) => ({
      ...s,
      source: 'regional'
    }));
    
    // Combine all data
    setData({
      summary: {},
      stakeholder_data: [...creativeStakeholders, ...operatorStakeholders, ...regionalStakeholders]
    });
  })
```

#### 2. Added Interface Properties (Lines 35-38)
```typescript
interface StakeholderSentiment {
  // ... existing properties
  source?: string;
  country?: string;
  sector?: string;
  sector_category?: string;
}
```

#### 3. Added Tab-based Filtering (Lines 99-108)
```typescript
const [activeTab, setActiveTab] = useState<'creative' | 'operators' | 'regional'>('creative');

// Filter stakeholders based on active tab
const stakeholdersWithReviews = data.stakeholder_data
  .filter(s => s.source === activeTab && s.total_reviews > 0);

// Count by source for tab badges
const sourceCount = {
  creative: data.stakeholder_data.filter(s => s.source === 'creative' && s.total_reviews > 0).length,
  operators: data.stakeholder_data.filter(s => s.source === 'operators' && s.total_reviews > 0).length,
  regional: data.stakeholder_data.filter(s => s.source === 'regional' && s.total_reviews > 0).length
};
```

#### 4. Added Tab Navigation UI (Lines 163-224)
Professional tab navigation with:
- Border-bottom style tabs (Material Design style)
- Tab titles with descriptive subtitles
- Stakeholder count badges
- Emoji icons for visual distinction
- onClick handlers that reset selected stakeholder when switching tabs

#### 5. Added Tab-specific Intro Banners (Lines 229-270)
Each tab shows a contextual banner:
- **Creative Industries**: Green banner explaining Gambia's #2 regional ranking
- **Tour Operators**: Blue banner explaining local tour operator analysis
- **Regional**: Purple banner explaining competitive benchmarking context

## Data Summary

### Combined Dataset
- **Total Stakeholders**: ~68 (12 creative + 11 tour operators + 45 regional)
- **Total Reviews**: ~4,400+
- **Coverage**: Gambia creative industries, Gambia tour operators, and 5 regional countries

### Gambia Tour Operators (New)
- 11 operators
- Review range: 12-128 reviews per operator
- Average sentiment: 0.4-0.8 (positive)
- Includes management response rates

### Regional Competitors (New)
- 45 stakeholders
- Countries: Nigeria (highest sentiment: 0.735), Gambia (0.659), Cape Verde (0.579), Ghana (0.5), Benin (0.465), Senegal (0.391)
- Sectors: Museums & Heritage, Festivals & Events, Markets & Crafts, Tour Operators, Performing Arts
- Detailed theme analysis and comparative metrics

## User Benefits
1. **Organized by Data Type**: Tab-based organization recognizes that creative industries, tour operators, and regional competitors have different analysis needs
2. **Contextual Insights**: Each tab provides specific context and intro text relevant to that data source
3. **Comprehensive Coverage**: All Gambia stakeholders (creative industries + tour operators) plus regional competitors in one unified interface
4. **Easy Navigation**: Professional tab interface with descriptive labels and count badges
5. **Competitive Benchmarking**: Dedicated Regional tab for comparing Gambia against West African competitors
6. **Unified Analysis Framework**: Consistent sentiment analysis methodology across all stakeholder types while respecting their unique characteristics

## Files Modified
- `/Users/alexjeffries/tourism-commons/digital_assessment/dashboard/src/pages/ReviewsSentiment.tsx`

## Files Added
- `/Users/alexjeffries/tourism-commons/digital_assessment/dashboard/public/tour_operators_sentiment.json`
- `/Users/alexjeffries/tourism-commons/digital_assessment/dashboard/public/regional_sentiment.json`

## Date
October 9, 2025

