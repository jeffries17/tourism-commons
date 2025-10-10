# Visual Content Analysis Methodology

## Overview
This document explains how we score the 10 visual content criteria using a combination of Instagram statistics and website image analysis with Google Vision API.

---

## Data Sources

### 1. Instagram Profile Statistics
**Extracted via web scraping:**
- **Follower count**: Indicates reach, professional status, community size
- **Post count**: Indicates content volume, activity level, variety

### 2. Website Image Analysis  
**Analyzed with Google Vision API:**
- **Labels**: Content classification (e.g., "music", "performance", "art")
- **Face detection**: Identifies people in images
- **Color analysis**: Detects visual consistency and branding
- **Object detection**: Identifies specific items in photos
- **Image quality scores**: Confidence levels from Vision API

### 3. Platform Presence
**Direct observation:**
- Instagram (social media + Reels)
- YouTube (video content)
- Facebook (additional reach)
- Website (owned media)

---

## Scoring Criteria Mapping

### Criterion 1: Has original photos (not just stock)
**Data Source:** Instagram post count + Website images

**Logic:**
- Instagram posts ≥50 = Active content creator = ✓
- OR website has ≥5 images = ✓
- Otherwise = ✗

**Rationale:** High post count indicates ongoing original content creation. Multiple website images suggest investment in visual assets.

**Score:** 0 or 1

---

### Criterion 2: Photos show actual products/services/location
**Data Source:** Website image Vision API labels matched to sector

**Logic:**
- Extract all labels from website images
- Match labels against sector-specific keywords:
  - **Music**: performance, concert, musician, stage, microphone
  - **Fashion**: clothing, dress, textile, model, style, designer
  - **Art**: painting, sculpture, gallery, exhibition, artwork
  - **Museum**: artifact, exhibition, cultural, historic, collection
  - **Craft**: handmade, artisan, product, pottery, textile
  - **Festival**: event, crowd, performance, celebration, audience
  - **Audiovisual**: camera, video, broadcast, production, film
  - **Heritage**: architecture, historic, landmark, monument
- ≥2 keyword matches = ✓
- 1 match = ✓ (some relevance)
- 0 matches = ✗

**Rationale:** Vision API labels detect actual image content. Sector-matched labels prove they show their work.

**Score:** 0 or 1

---

### Criterion 3: Multiple types of visual content
**Data Source:** Platform presence (Instagram, YouTube, Facebook, Website)

**Logic:**
- Count platforms with presence
- ≥3 platforms = ✓
- <3 platforms = ✗

**Rationale:** Different platforms host different content types (photos, videos, stories, posts). Multiple platforms = content variety.

**Score:** 0 or 1

---

### Criterion 4: Professional quality (good lighting, composition)
**Data Source:** Instagram followers + Website Vision API confidence

**Logic:**
- Instagram followers ≥1M = ✓ (major professional presence)
- OR followers ≥10K = ✓ (professional presence)
- High Vision API confidence (>0.85) adds supporting evidence
- Otherwise = ✗

**Rationale:** High follower count indicates audience trust and professional content quality. Vision API confidence scores indicate technically good images.

**Score:** 0 or 1

---

### Criterion 5: Shows variety (different angles, settings)
**Data Source:** Instagram post count + Website image diversity

**Logic:**
- Calculate variety score:
  - Instagram posts ≥100 = +1 point
  - Instagram posts ≥50 = +0.5 points
  - Website unique labels ≥15 = +0.5 points
- Variety score ≥1 = ✓
- Otherwise = ✗

**Rationale:** Many posts = diverse content library. Many unique labels in website images = visual variety detected.

**Score:** 0 or 1

---

### Criterion 6: Includes people/customers (authentic)
**Data Source:** Website image face detection (Vision API)

**Logic:**
- Face detection on website images
- ≥1 face detected = ✓
- 0 faces = ✗

**Rationale:** Face detection is objective and accurate on full-size website images. People in images suggest authentic, human-centered content.

**Score:** 0 or 1

---

### Criterion 7: Behind-the-scenes or process content
**Data Source:** Sector classification + Instagram post count + Website labels

**Logic:**
- Check website labels for BTS keywords: studio, backstage, production, rehearsal, making, workshop, process
- If BTS keywords found = ✓
- OR if creative sector (Music, Fashion, Art, Performance, Audiovisual, Design, Craft) AND ≥100 posts = ✓
- Otherwise = ✗

**Rationale:** BTS keywords in website indicate process content. Creative sectors with high post volume likely share behind-the-scenes content.

**Score:** 0 or 1

---

### Criterion 8: User-generated content or collaborations
**Data Source:** Instagram followers (community size)

**Logic:**
- Followers ≥10,000 = Active community = ✓
- Followers <10,000 = Limited community = ✗

**Rationale:** Large follower base indicates active community engagement. Communities generate UGC through comments, shares, tags, and collaborations.

**Score:** 0 or 1

---

### Criterion 9: Consistent visual style/branding
**Data Source:** Website color analysis (Vision API)

**Logic:**
- Analyze dominant colors across website images
- ≥3 color samples detected = ✓ (can assess consistency)
- <3 samples = ✗ (insufficient data)

**Rationale:** Color consistency across images indicates intentional visual branding. Vision API detects color palettes objectively.

**Score:** 0 or 1

---

### Criterion 10: Videos or dynamic content
**Data Source:** Platform presence (YouTube + Instagram Reels)

**Logic:**
- YouTube presence = ✓
- OR Instagram presence (Reels) = ✓
- Otherwise = ✗

**Rationale:** Direct verification of video platform presence. Instagram inherently has Reels (video), YouTube is video-first.

**Score:** 0 or 1

---

## Total Score Calculation

**Range:** 0-10 (sum of all criteria)

**Interpretation:**
- **9-10/10**: Exceptional visual content (mega-influencers, global brands)
- **7-8/10**: Strong visual presence (professional organizations, active creators)
- **5-6/10**: Good digital presence (regional entities, moderate engagement)
- **3-4/10**: Basic presence (limited content, small following)
- **0-2/10**: Minimal or no visual content

---

## Quality Assurance

### Advantages of This Methodology:
1. **Objective metrics**: Follower counts, post counts, face detection are quantifiable
2. **Actual content analysis**: Vision API analyzes real full-size images from websites
3. **Multi-source validation**: Combines social media stats with owned media analysis
4. **Sector-aware**: Scoring considers industry context (e.g., creative vs institutional)
5. **Scalable**: Can analyze 199 entities efficiently
6. **Defensible**: Every score backed by specific data points

### Limitations:
1. **Website required for content analysis**: Entities without websites rely primarily on Instagram stats
2. **Vision API accuracy**: Depends on image quality and subject matter
3. **Instagram scraping**: May be affected by platform changes or access restrictions
4. **Sector keyword coverage**: May miss niche sector-specific terms

### Cost Considerations:
- **Vision API**: ~$1.50 per 1,000 images
- **For 199 entities × 8 images**: ~1,600 images = **~$2.40 total**
- **Very affordable for comprehensive analysis**

---

## Example Scoring: Burna Boy (artist)

### Input Data:
- **Instagram**: 77 posts, 18,000,000 followers
- **Website**: 8 images analyzed
  - 14 faces detected across 5 images
  - 28 unique labels (including "performance", "entertainment")
  - Average Vision API confidence: 0.80
- **Platforms**: Instagram, YouTube, Facebook, Website

### Scoring:
1. **Original photos**: ✓ (77 posts) = **1**
2. **Shows products**: ✓ (music-related labels detected) = **1**
3. **Multiple types**: ✓ (4 platforms) = **1**
4. **Professional quality**: ✓ (18M followers) = **1**
5. **Variety**: ✓ (77 posts + 28 website elements) = **1**
6. **Includes people**: ✓ (14 faces detected) = **1**
7. **Behind-the-scenes**: ✗ (no BTS keywords, <100 posts) = **0**
8. **User-generated**: ✓ (18M followers) = **1**
9. **Consistent style**: ✓ (colors detected) = **1**
10. **Videos**: ✓ (YouTube + Instagram) = **1**

**Total: 9/10** ✅

---

## Implementation Notes

### Files:
- **Analyzer**: `visual_analyzer_combined.py`
- **Methodology**: `VISUAL_CONTENT_METHODOLOGY.md` (this document)

### Sheet Updates:
- Scores written to: **Regional Checklist Detail** columns AB-AK (10 individual scores)
- Auto-calculated total in: **Regional Assessment** column AL (via VLOOKUP formula)

### Process:
1. Extract entity data from Regional Assessment sheet
2. If Instagram URL exists: scrape follower/post stats
3. If website URL exists: scrape images and analyze with Vision API
4. Score each criterion using combined data
5. Write 10 scores to Regional Checklist Detail
6. Formula auto-updates total in Regional Assessment

---

## Changelog

**2025-10-06**: Initial methodology established
- Developed combined Instagram stats + website analysis approach
- Validated on pilot entities (Burna Boy, Museum, Festival)
- Achieved meaningful score differentiation (7-9/10 range)
- Ready for full 199-entity rollout

---

*This methodology ensures transparent, reproducible, and defensible visual content assessment for competitive analysis.*
