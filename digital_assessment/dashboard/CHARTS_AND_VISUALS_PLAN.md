# Charts & Visualizations Plan

## ✅ What We Have Now

### Dashboard Page
- Sector cards with stats
- Maturity distribution (numbers)
- Category performance bars

### Participant Detail Page
- Overall scores
- Category breakdown with progress bars
- Digital presence indicators
- AI recommendations

## 🎨 Recommended Additions

### 1. Dashboard Enhancements

#### Sector Comparison Chart
```
[Chart: Horizontal bar chart comparing sectors]
- X-axis: Average score (0-100%)
- Y-axis: Sector names
- Color-coded by performance level
```

#### Maturity Distribution Pie/Donut Chart
```
[Chart: Donut chart of maturity levels]
- Segments: Absent, Emerging, Intermediate, Advanced, Expert
- Shows percentage of participants in each level
```

#### Category Performance Radar Chart
```
[Chart: Radar/spider chart]
- 6 axes: Social Media, Website, Visual Content, etc.
- Shows average performance across all categories
```

### 2. Participant Detail Enhancements

#### External vs Sector Comparison
```
[Chart: Grouped bar chart]
- For each category, show:
  - Participant's score (blue)
  - Sector average (gray)
- Makes it easy to see where they're above/below average
```

#### Progress Over Time (if historical data available)
```
[Chart: Line chart]
- Track score changes over multiple assessments
```

### 3. New: Sector Analysis Page

#### Sector Deep Dive
```
/sector/{sector-name}

- Top performers (leaderboard)
- Category heatmap
- Distribution charts
- Comparison with other sectors
```

## 🛠️ Implementation Options

### Option A: Recharts (Recommended - Already Installed)
```typescript
import { BarChart, Bar, PieChart, Pie, RadarChart, Radar } from 'recharts';

// Sector comparison
<BarChart data={sectorData}>
  <Bar dataKey="avgScore" fill="#1565c0" />
</BarChart>

// Maturity distribution
<PieChart>
  <Pie data={maturityData} dataKey="value" nameKey="name" />
</PieChart>
```

### Option B: Chart.js
More customizable but heavier

### Option C: Simple CSS-based charts
Lightweight, limited functionality

## 📊 Quick Wins (Can Add Now)

### 1. Sparklines for Dashboard
Small inline charts showing trends for each sector card:
```
[Sector Card]
Fashion & Design
13 participants
22.3% avg ▲ [mini line chart]
```

### 2. Mini Category Charts on Participant List
Show a small bar chart in each row:
```
| Name | Sector | Score | [▮▮▮▮▯▯] Categories |
```

### 3. Comparison View Toggle
Switch between:
- List view (current)
- Card view (with mini charts)
- Chart view (pure visualization)

## 🎯 Priority Implementation Order

1. **Sector Comparison Bar Chart** (Dashboard)
   - High visual impact
   - Easy to implement
   - Useful for stakeholders

2. **External vs Sector Chart** (Participant Detail)
   - Core feature per original plan
   - Shows participant performance context

3. **Maturity Distribution Donut** (Dashboard)
   - Quick visual summary
   - Eye-catching

4. **Category Radar Chart** (Dashboard)
   - Shows overall ecosystem health
   - Good for presentations

5. **Sector Deep Dive Page** (New)
   - Advanced analytics
   - Comparative insights

## 💻 Sample Component: Sector Comparison

```typescript
// components/charts/SectorComparisonChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SectorComparisonChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" domain={[0, 100]} />
        <YAxis dataKey="sector" type="category" width={200} />
        <Tooltip />
        <Bar dataKey="avgCombined" fill="#1565c0" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Usage in Dashboard.tsx
<SectorComparisonChart data={dashboardData.sectors} />
```

## 📱 Mobile Considerations

- Use responsive containers
- Stack charts vertically on small screens
- Simplify charts for mobile (fewer data points)
- Consider swipeable chart galleries

## 🚀 Next Steps

1. Install Recharts types: `npm install --save-dev @types/recharts`
2. Create `src/components/charts/` directory
3. Build SectorComparisonChart component
4. Add to Dashboard page
5. Build ExternalVsSectorChart component  
6. Add to Participant Detail page

---

*Would you like me to implement any of these charts right now?*

