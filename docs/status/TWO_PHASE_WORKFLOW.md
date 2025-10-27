# Two-Phase Regional Analysis Workflow

## Overview

The regional competitor analysis is now split into two phases to save costs and enable human review:

### **Phase 1: URL Discovery & Validation** 
- **Cost**: ~$0.01-0.02 per entity
- **Time**: ~10-15 seconds per entity
- **What it does**: 
  - Searches Google for entity URLs
  - Validates URLs (filters out blogs, guest houses, photo links, etc.)
  - Writes URLs to Regional Assessment sheet
  - **NO expensive AI analysis yet**

### **Phase 2: Deep Digital Analysis**
- **Cost**: ~$0.10-0.20 per entity  
- **Time**: ~30-40 seconds per entity
- **What it does**:
  - Reads approved URLs from sheet
  - Scrapes websites
  - Runs AI analysis (OpenAI) on 6 categories × 10 criteria
  - Writes scores to sheets

## Workflow

```
┌──────────────────────┐
│  Phase 1: Discovery  │  Run on all entities → URLs appear in sheet
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Human Review       │  You review/edit URLs (10-15 mins per 50)
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Phase 2: Analysis   │  Deep analysis on approved URLs only
└──────────────────────┘
```

## Commands

### Phase 1: URL Discovery

Discover URLs for first 10 Senegal entities:
```bash
cd /Users/alexjeffries/tourism-commons/digital_assessment
source regional_analysis_env/bin/activate
python phase1_url_discovery.py --country Senegal --start 0 --limit 10
```

Discover next batch:
```bash
python phase1_url_discovery.py --country Senegal --start 10 --limit 10
```

All entities (no filter):
```bash
python phase1_url_discovery.py --start 0 --limit 50
```

### Review URLs

1. Open Regional Assessment sheet
2. Check columns X-AC (Website, Facebook, Instagram, etc.)
3. Edit/correct any URLs
4. Clear invalid URLs

### Phase 2: Deep Analysis

Analyze first 10 approved Senegal entities:
```bash
python phase2_deep_analysis.py --country Senegal --start 0 --limit 10
```

Analyze next batch:
```bash
python phase2_deep_analysis.py --country Senegal --start 10 --limit 10
```

## URL Validation

Phase 1 automatically filters:

**Websites:**
- ✗ Guest houses (tinting.no, campement, hotel, etc.)
- ✗ Magazines/directories (africultures.com, contemporaryand.com)
- ✗ Booking sites (booking.com, hotels.com, tripadvisor)
- ✗ Travel blogs (kumakonda.com, afktravel.com)
- ✗ Blog platforms (wordpress.com, medium.com)

**Social Media:**
- ✗ Facebook photo links (/photo.php)
- ✗ Facebook posts by others (/posts/)
- ✗ Instagram posts (/p/) instead of profiles
- ✗ YouTube videos instead of channels

## Benefits

1. ✅ **Save money** - Don't analyze wrong URLs
2. ✅ **Human oversight** - Approve URLs before expensive analysis
3. ✅ **Fix issues early** - Correct URLs before deep dive
4. ✅ **Flexibility** - Re-run Phase 2 without re-searching
5. ✅ **Transparency** - See what was found before scoring

## Cost Comparison

### Old Way (Single Phase):
- 100 entities × $0.12 = **$12.00**
- Some entities analyzed with wrong URLs = wasted money

### New Way (Two Phase):
- Phase 1: 100 entities × $0.02 = $2.00
- Review: 15 minutes of your time
- Phase 2: 100 entities × $0.12 = $12.00
- **Total: $14.00** but with quality control

## Tips

- Run Phase 1 in batches of 50
- Review URLs same day while fresh
- Use `fix_invalid_urls.py --clear` to auto-clear known bad patterns
- Phase 2 can be run multiple times if needed (URLs don't change)

