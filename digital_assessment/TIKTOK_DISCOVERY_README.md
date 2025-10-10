# TikTok Discovery Tool

Simple tool to search for TikTok accounts for stakeholders in the CI Assessment sheet.

## How It Works

1. Reads stakeholder names and sectors from the **CI Assessment** sheet
2. Searches Google for: `"{name} The Gambia tiktok"`
3. Extracts TikTok profile URLs from results
4. Adds URLs to column **AM** (TikTok)
5. Creates empty column **AN** (TikTok Followers) for manual entry

## Column Locations

- **Column AM**: TikTok URL
- **Column AN**: TikTok Followers (you fill in manually)

These come right after:
- Column AL: YouTube Subscribers

## Usage

### Test Mode (Recommended First)
Run on first 2 stakeholders without updating the sheet:

```bash
cd digital_assessment
source temp_env/bin/activate  # or your virtual environment
python discover_tiktok.py
```

### Test with Different Stakeholders
```bash
python discover_tiktok.py --start 5 --limit 3
# Tests stakeholders 6-8 (zero-indexed)
```

### Live Mode (Updates Sheet)
Once you're happy with the results:

```bash
python discover_tiktok.py --live --limit 10
# Processes first 10 stakeholders without TikTok URLs
```

### Full Batch
```bash
python discover_tiktok.py --live --limit 100
# Processes all stakeholders without TikTok
```

## What It Does

✅ **Finds**: TikTok profile URLs like `https://tiktok.com/@username`  
❌ **Skips**: Video links, posts (extracts profile from video URLs)  
🔍 **Search**: Simple Google search (no quote exclusions)  
💾 **Updates**: Sheet directly (no JSON files)  

## After Running

1. Check any found URLs in the sheet (column AM)
2. Manually fill in follower counts in column AN
3. Run again on remaining stakeholders if needed

## Requirements

- Google Search API credentials in `.env` file:
  - `GOOGLE_API_KEY`
  - `GOOGLE_SEARCH_ENGINE_ID`

## Rate Limiting

- 2 second delay between searches
- Google Custom Search: 100 queries/day (free tier)
- Plan accordingly for large batches

## Example Output

```
🔍 Searching: QTV Gambia The Gambia tiktok
✅ Found TikTok: https://tiktok.com/@qtvgambia
✅ Updated row 3

---
SUMMARY
---
Searched: 2 stakeholders
Found TikTok: 1

✅ Accounts found:
  • QTV Gambia: https://tiktok.com/@qtvgambia

⚠️  No TikTok found for 1 stakeholders:
  • West Coast Radio
```

