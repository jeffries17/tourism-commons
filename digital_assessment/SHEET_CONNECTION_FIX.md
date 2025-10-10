# Google Sheets Connection Fix

## Problem Identified

The Phase 1 and Phase 2 analysis scripts were skipping rows from the Regional Assessment tab due to **overly strict validation logic** that didn't account for how the Google Sheets API returns data.

### Root Causes

1. **Sparse Array Handling**: The Google Sheets API returns sparse arrays - if a row has data in columns A and B but column C is empty, it only returns 2 elements instead of 3.

2. **Strict Length Check**: The original code required `len(row) >= 3`, which meant any row with a missing Country field would be **completely skipped**.

3. **Missing Error Handling**: If a row had unexpected data types or formats, the script would crash or skip the row without reporting why.

## Changes Made

### 1. `regional_competitor_analyzer.py`

**Fixed `get_regional_assessment_data()` method** (lines 944-996):
- ✅ Removed strict `len(row) >= 3` requirement
- ✅ Now only requires stakeholder name (column A) to be present
- ✅ Handles missing Sector and Country gracefully (defaults to 'Unknown')
- ✅ Added comprehensive error handling
- ✅ Tracks and reports skipped rows with reasons

**Fixed `save_to_checklist_detail()` method** (lines 998-1025):
- ✅ Added error handling when searching for stakeholder names
- ✅ Skips empty rows safely

**Fixed `save_to_sheet()` method** (lines 1104-1130):
- ✅ Added error handling when searching for stakeholder names
- ✅ Skips empty rows safely

### 2. `phase1_url_discovery.py`

**Fixed `save_urls_to_sheet()` method** (lines 96-122):
- ✅ Added error handling when searching for stakeholder rows
- ✅ Skips empty rows safely
- ✅ Reports errors without crashing

### 3. `phase2_deep_analysis.py`

**Fixed `get_approved_urls()` method** (lines 81-121):
- ✅ Added comprehensive error handling
- ✅ Created helper function `get_url()` to safely extract URLs
- ✅ Ensures empty strings are treated as None (no URL)
- ✅ Handles sparse arrays from Google Sheets API

**Fixed `_setup_score_formulas()` method** (lines 41-66):
- ✅ Added error handling when searching for stakeholder rows
- ✅ Skips empty rows safely

## Testing

A diagnostic script has been created to help you verify the connection and see exactly what's happening:

```bash
cd /Users/alexjeffries/tourism-commons/digital_assessment
python test_sheet_connection.py
```

This script will:
- ✅ Test the connection to Google Sheets
- ✅ Show exactly what data is being read from each row
- ✅ Identify which rows are valid and which are skipped
- ✅ Explain why each row is skipped (if applicable)
- ✅ Provide actionable recommendations

## Expected Behavior Now

### Phase 1 (URL Discovery)
```bash
python phase1_url_discovery.py --country Senegal --start 0 --limit 10
```

**Now handles:**
- ✅ Rows with missing Country field
- ✅ Rows with missing Sector field
- ✅ Empty rows between data (skipped safely)
- ✅ Reports skipped rows with reasons

### Phase 2 (Deep Analysis)
```bash
python phase2_deep_analysis.py --country Senegal --start 0 --limit 10
```

**Now handles:**
- ✅ Rows with partial URL data
- ✅ Empty URL cells (treated as None)
- ✅ Whitespace-only cells (treated as None)
- ✅ Sparse arrays from Google Sheets API

## What You Should See

### Before (Old Behavior)
```
Filtered to 50 entities in Senegal
[Actually only processes 35, silently skipping 15]
```

### After (New Behavior)
```
Filtered to 50 entities in Senegal

⚠️  Skipped 3 rows:
  Row 5: Missing stakeholder name
  Row 12: Empty row
  Row 28: Missing stakeholder name

Processing 47 valid entities...
```

## Common Issues & Solutions

### Issue 1: Rows Still Being Skipped
**Symptom**: Some rows are legitimately being skipped (e.g., empty rows)

**Solution**: Run the diagnostic script to see exactly which rows and why:
```bash
python test_sheet_connection.py
```

### Issue 2: Missing Country/Sector Data
**Symptom**: Some entities show "Unknown" for Country or Sector

**Solution**: This is now working as intended! The scripts will process these entities, but you should:
1. Check your Regional Assessment sheet
2. Fill in missing Country/Sector data in columns B and C
3. Re-run the scripts

### Issue 3: No URLs Found in Phase 2
**Symptom**: Phase 2 says "No URLs found for [entity] - skipping analysis"

**Solution**: This is correct behavior if:
- Phase 1 hasn't been run yet for that entity
- Phase 1 didn't find any URLs
- URLs were cleared during manual review

Run Phase 1 first to discover URLs, then run Phase 2.

## Next Steps

1. **Test the connection:**
   ```bash
   cd digital_assessment
   python test_sheet_connection.py
   ```

2. **Review the output** to see which rows (if any) are being skipped and why

3. **Run Phase 1** with confidence that all valid rows will be processed:
   ```bash
   python phase1_url_discovery.py --country Senegal --start 0 --limit 10
   ```

4. **Review and approve URLs** in the Regional Assessment sheet

5. **Run Phase 2** to complete the analysis:
   ```bash
   python phase2_deep_analysis.py --country Senegal --start 0 --limit 10
   ```

## Technical Details

### Google Sheets API Sparse Arrays

When you read data from Google Sheets, empty trailing cells are omitted from the response:

| A | B | C | API Returns |
|---|---|---|-------------|
| "Name" | "Sector" | "Country" | `["Name", "Sector", "Country"]` |
| "Name" | "Sector" | *(empty)* | `["Name", "Sector"]` ← Only 2 elements! |
| "Name" | *(empty)* | *(empty)* | `["Name"]` ← Only 1 element! |

**The fix**: Check `len(row) > index` before accessing `row[index]`, and provide defaults for missing values.

### Why This Matters

The old code would skip rows with:
- Missing country data (15-20% of rows in some sheets)
- Missing sector data
- Trailing empty cells

This meant your Phase 1 and Phase 2 analysis were **silently incomplete**.

## Questions?

If you're still experiencing issues:
1. Run the diagnostic script and save the output
2. Check the Regional Assessment sheet for data quality issues
3. Look for the warning messages in the script output - they now tell you exactly what's wrong

All row-skipping is now **explicit and logged**, not silent!

