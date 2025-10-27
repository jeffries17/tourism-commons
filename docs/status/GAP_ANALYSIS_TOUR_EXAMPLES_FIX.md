# Gap Analysis Tour Examples Fix

## Issue
In the Gap Analysis tab, all sectors were displaying the same example tours:
- Every sector showed the same "Pure Gambia Tour" example
- The first tour in the list (`https://www.responsibletravel.com/holiday/33807/gambia-and-senegal-river-cruise-holiday`) was actually a Gambia + Senegal tour (multi-country), but was being shown as a "Pure Gambia Tour"
- No multi-country tour examples were being found or displayed

## Root Cause
The code was:
1. Using the same global `gambia_standalone.best_tours` array for all sectors
2. Always showing the first tour `[0]` from the list
3. Not filtering tours to distinguish between pure Gambia tours and multi-country tours
4. The `gambia_standalone.best_tours` array contained both pure Gambia tours and regional tours mixed together

## Solution
Updated the tour selection logic to:

1. **Filter for true Gambia-only tours**: Exclude tours with URLs containing "senegal" or "dakar" to ensure "Pure Gambia Tour" examples are actually Gambia-only.

2. **Separate multi-country tours**: Create a separate list of multi-country tours by filtering for tours that include other countries in their URLs or destinations.

3. **Sort by creative score**: Both lists are sorted by creative score (highest first) to prioritize the best examples.

4. **Rotate examples across sectors**: Use the sector index `idx` to rotate through different tours, so each sector displays a unique example:
   - `tourIndex = idx % Math.max(gambiaOnlyTours.length, 1)`
   - `multiTourIndex = idx % Math.max(multiCountryTours.length, 1)`

## Code Changes

### Before
```typescript
const gambiaOnlyTours = regionalData.gambia_standalone.best_tours || [];
const allRegionalTours = regionalData.top_tours_global || [];

// Always showing first tour [0]
{gambiaOnlyTours[0].operator}
```

### After
```typescript
// Filter and sort tours
const allGambiaTours = regionalData.gambia_standalone.best_tours || [];
const gambiaOnlyTours = allGambiaTours
  .filter((t: any) => !t.url.toLowerCase().includes('senegal') && !t.url.toLowerCase().includes('dakar'))
  .sort((a: any, b: any) => b.creative_score - a.creative_score);

const multiCountryTours = allGambiaTours
  .filter((t: any) => t.url.toLowerCase().includes('senegal') || t.url.toLowerCase().includes('dakar') || (t.destination && t.destination.includes(',')))
  .sort((a: any, b: any) => b.creative_score - a.creative_score);

// Rotate through different tours for each sector
const tourIndex = idx % Math.max(gambiaOnlyTours.length, 1);
const multiTourIndex = idx % Math.max(multiCountryTours.length, 1);

// Use rotated index
{gambiaOnlyTours[tourIndex].operator}
{multiCountryTours[multiTourIndex].operator}
```

## Results
- Each sector now displays a unique tour example (where available)
- "Pure Gambia Tour" examples are truly Gambia-only (no Senegal/regional tours)
- "Multi-Country Tour" examples are properly identified regional tours
- Tours are prioritized by highest creative score within each category
- All 7 sectors now have distinct examples instead of showing the same tour

## Files Modified
- `/Users/alexjeffries/tourism-commons/digital_assessment/dashboard/src/pages/ITOPerception.tsx`

## Date
October 9, 2025

