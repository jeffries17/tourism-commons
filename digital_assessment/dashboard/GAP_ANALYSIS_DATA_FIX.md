# Gap Analysis Data Fix

## Issue
The Gap Analysis tab on the ITO Perception page was showing incorrect Digital Readiness scores. Several sectors (Performing Arts, Audiovisual, Fashion & Design) were displaying 0% when they should have shown actual scores from the CI Assessment.

## Root Cause
The `dashboard_ito_data.json` file had incorrect `gambia_capacity` values that were not properly calculated from the CI Assessment data. The Python script `generate_gap_analysis.py` was reading from the wrong columns in the Google Sheet.

## Solution
Updated the `gambia_capacity` values in `dashboard/public/dashboard_ito_data.json` to reflect the correct sector averages from the CI Assessment. The values are stored as raw scores (out of 70), which the UI then converts to percentages.

## Updated Values

| Sector | Old Value | New Value (out of 70) | Displays as |
|--------|-----------|----------------------|-------------|
| Cultural heritage sites/museums | 11.0 | 18.0 | 26% |
| Marketing/advertising/publishing | 38.0 | 60.3 | 86% |
| Crafts and artisan products | 6.5 | 8.3 | 12% |
| Performing and visual arts | 0 | 24.3 | 35% |
| Audiovisual | 0 | 45.4 | 65% |
| Fashion & Design | 0 | 21.0 | 30% |
| Festivals and cultural events | 10.3 | 14.3 | 20% |
| Music | 0 | 0 | 0% |

## Additional Changes
- Removed the "How to Read This" explainer box from the Gap Analysis tab as requested by the user
- Removed the "Strategic Opportunity Quadrants" section (the four boxes showing Competitive Advantage, Hidden Gem, Market Gap, and Low Priority counts) as requested by the user
- The UI already filters out the Music sector from displays since it shows 0 Gambian participants

## Files Modified
- `/Users/alexjeffries/tourism-commons/digital_assessment/dashboard/public/dashboard_ito_data.json`
- `/Users/alexjeffries/tourism-commons/digital_assessment/dashboard/src/pages/ITOPerception.tsx`

## Next Steps
The `generate_gap_analysis.py` script should be fixed to:
1. Read from the correct columns (column P, index 15 for externalTotal)
2. Convert the score to a percentage (divide by 70, multiply by 100)
3. Use the sector names that match the CI Assessment sheet

## Date
October 9, 2025

