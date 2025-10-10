# Backend Survey Integration Summary
**Date**: October 8, 2025  
**Status**: ✅ Complete - Ready for Testing

---

## 🎯 What Was Done

Updated the Firebase Functions backend (`functions/src/app.ts`) to read and serve the new survey assessment data from Google Sheets.

---

## 📊 Changes Made

### 1. Updated `mapRowToAssessment` Function
**Key Changes:**
- Added `sheetType` parameter to handle CI vs TO sheets (different column layouts)
- Updated column mappings to read from new survey columns
- Removed old/unused survey column references

**New Survey Fields Read:**
```typescript
surveyFoundation: number;      // 0-10
surveyCapability: number;      // 0-10
surveyGrowth: number;          // 0-10
surveyTier: string;            // Absent/Basic, Emerging, Intermediate, Advanced, Expert
surveyDate: string;            // Date completed
surveyTotal: number;           // 0-30 total score
```

**Column Mappings:**
- **CI Assessment** (45 columns):
  - Column Z (#26): Survey Total
  - Column AO (#41): Survey Foundation
  - Column AP (#42): Survey Capability
  - Column AQ (#43): Survey Growth
  - Column AR (#44): Survey Tier
  - Column AS (#45): Survey Date

- **TO Assessment** (43 columns):
  - Column Z (#26): Survey Total
  - Column AM (#39): Survey Foundation
  - Column AN (#40): Survey Capability
  - Column AO (#41): Survey Growth
  - Column AP (#42): Survey Tier
  - Column AQ (#43): Survey Date

### 2. Updated All API Endpoints
Fixed 4 endpoints to properly handle both sheet types:
- `/participants` - List all participants
- `/tour-operators` - Filter for tour operators
- `/participant/plan` - Individual participant plan
- `/participant/sector-context` - Sector recommendations

**Pattern Used:**
```typescript
// Map CI rows with 'CI' type
const ciAssessments = rowsCI.slice(1)
  .filter(r => (r[0] || '').toString().trim() !== '')
  .map(r => mapRowToAssessment(r, 'CI'));

// Map TO rows with 'TO' type
const toAssessments = rowsTourism.slice(1)
  .filter(r => (r[0] || '').toString().trim() !== '')
  .map(r => mapRowToAssessment(r, 'TO'));

// Combine
const allAssessments = [...ciAssessments, ...toAssessments];
```

### 3. Updated TypeScript Types
**File**: `dashboard/src/types/index.ts`

Updated `Assessment` interface to include:
```typescript
export interface Assessment {
  // ... existing fields ...
  // NEW Survey Assessment (October 2025)
  surveyFoundation?: number;     // 0-10
  surveyCapability?: number;     // 0-10
  surveyGrowth?: number;         // 0-10
  surveyTier?: string;           // Absent/Basic, Emerging, Intermediate, Advanced, Expert
  surveyDate?: string;           // Date survey was completed
  // Totals
  externalTotal: number;         // 0-70
  surveyTotal?: number;          // 0-30
  combinedScore: number;         // 0-100
  maturityLevel: string;         // Based on external assessment
}
```

---

## 🚀 Next Steps

### 1. Compile TypeScript
```bash
cd functions
npm run build
```

### 2. Test Locally (Optional)
```bash
cd functions
npm run serve
```

### 3. Deploy to Firebase
```bash
firebase deploy --only functions
```

### 4. Verify API Responses
Test that the new fields appear in API responses:
```bash
curl https://YOUR-PROJECT.cloudfunctions.net/api/participants
```

Expected response should now include:
```json
{
  "name": "Flex Fuzion Entertainment & Dance Academy",
  "externalTotal": 45,
  "surveyTotal": 17,
  "surveyFoundation": 6,
  "surveyCapability": 6,
  "surveyGrowth": 5,
  "surveyTier": "Intermediate",
  "surveyDate": "2025-10-08",
  "maturityLevel": "Developing"
}
```

---

## 🎨 Frontend Updates Needed

### Overview Dashboard
- De-emphasize "completion rate"
- Show External vs Survey scores side-by-side
- Add filter for "Has Survey Data"
- Display survey tier badges

### Individual Participant Pages
**If participant has survey data:**
```tsx
<div className="survey-section">
  <h3>Survey Assessment</h3>
  <div className="score-display">
    <span className="score">{surveyTotal}/30</span>
    <span className="tier">{surveyTier}</span>
  </div>
  <div className="breakdown">
    <div>Foundation: {surveyFoundation}/10</div>
    <div>Capability: {surveyCapability}/10</div>
    <div>Growth: {surveyGrowth}/10</div>
  </div>
</div>
```

**If participant does NOT have survey data:**
```tsx
<div className="survey-callout">
  <h3>Want Deeper Insights?</h3>
  <p>Complete our digital capacity survey to get personalized recommendations...</p>
  <button>Take Survey</button>
</div>
```

---

## 📋 Testing Checklist

- [ ] Compile TypeScript successfully
- [ ] Deploy functions to Firebase
- [ ] Test `/participants` endpoint returns survey data
- [ ] Verify CI participants (45 columns) read correctly
- [ ] Verify TO participants (43 columns) read correctly
- [ ] Check that participants WITHOUT survey data have `surveyTotal: 0` or `undefined`
- [ ] Confirm 7 participants with survey data show correct scores
- [ ] Test dashboard UI displays external vs survey separately
- [ ] Test individual pages show survey section conditionally

---

## 🐛 Troubleshooting

### Survey data not appearing?
1. Check column indices are correct for your sheet
2. Verify sheet names match ('CI Assessment', 'TO Assessment')
3. Check that survey columns exist in both sheets

### Different values for CI vs TO?
- CI and TO sheets have different column counts
- Survey columns are at different positions
- The `sheetType` parameter handles this automatically

### TypeScript errors?
- Run `npm install` in functions directory
- Check types are exported correctly in `index.ts`
- Rebuild with `npm run build`

---

## 📊 Data Flow

```
Google Sheets
  ↓
mapRowToAssessment() [with sheetType]
  ↓
Assessment Object (with survey fields)
  ↓
API Endpoints (/participants, /tour-operators, etc.)
  ↓
Dashboard Frontend
  ↓
Display Survey & External Separately
```

---

## ✅ Files Modified

1. `functions/src/app.ts` - Backend API logic
2. `dashboard/src/types/index.ts` - TypeScript interfaces
3. (Next) Dashboard components for UI display

---

## 🎉 Result

The backend now:
- ✅ Reads survey data from both CI and TO sheets
- ✅ Handles different column layouts automatically
- ✅ Serves survey scores via API
- ✅ Maintains backward compatibility
- ✅ Ready for frontend integration

Survey scores are now available in the API and ready to be displayed in the dashboard!

