# Phase 3: Visual Content Enhancement
## Using Google Vision API for Objective Visual Assessment

---

## Overview

After Phase 1 (URL Discovery) and Phase 2 (AI Scoring) are complete, Phase 3 provides an enhanced, objective assessment of visual content quality using Google Vision API. This addresses the current limitation where visual scoring is subjective and based only on counting images and reading alt text.

---

## Current Visual Content Criteria

Each criterion is scored 0 or 1 (10 criteria = 10 points total):

1. High-quality photos (clear, well-lit)
2. Consistent visual style/branding
3. Professional product shots
4. Good composition and framing
5. Variety of content types
6. Regular content updates
7. Professional editing/retouching
8. Brand-consistent color scheme
9. High-quality video content
10. Visual content drives engagement

---

## Current Limitations

- **Counting, not analyzing**: We count `<img>` tags but don't evaluate quality
- **Subjective AI interpretation**: GPT guesses quality from text descriptions
- **Missing video analysis**: We don't extract or analyze video frames
- **No stock photo detection**: Can't distinguish authentic vs. generic images
- **No composition analysis**: Can't assess framing, lighting, or professional quality

---

## What Google Vision API Provides

### 1. **Image Quality Metrics**
- **Sharpness/Focus**: Detect blurry vs. crisp images
- **Brightness/Exposure**: Measure proper lighting
- **Color Properties**: Extract dominant colors, saturation
- **Noise Detection**: Identify low-quality, grainy images

### 2. **Content Analysis**
- **Object Detection**: Identify what's in the image (confidence scores)
  - Art pieces, performances, fashion, food, landscapes, venues
- **Face Detection**: People presence (authentic vs. stock photos)
- **Landmark Recognition**: Famous locations, cultural sites
- **Logo Detection**: Brand consistency across images
- **Text in Images**: Event posters, signage, cultural context

### 3. **Professional Quality Indicators**
- **Composition**: Face/object positioning (rule of thirds vs. centered)
- **Safe Search**: Filter inappropriate content
- **Label Confidence**: High confidence = professional photography

---

## The Enhanced Flow

### **Step 1: Preparation & Filtering**

Script reads `Regional Assessment` sheet and filters to entities with digital properties:

```
Criteria:
- Has website URL, OR
- Has Instagram URL, OR
- Has Facebook URL, OR
- Has YouTube URL

Result: List of ~150-180 entities (from 199 total)
```

---

### **Step 2: Image Collection**

For each entity, collect 8-12 images:

#### **From Websites:**
- Scrape homepage + key pages: `/gallery`, `/about`, `/portfolio`, `/services`
- Download images > 500px (skip logos, icons, tiny images)
- Prioritize: Hero images, gallery items, product shots
- Target: 5-6 images per website

#### **From Instagram:**
- Last 12 posts (represents ~3 months of weekly posting)
- Download full-resolution images
- Target: Up to 12 images

#### **From Facebook:**
- Last 12 timeline posts with images
- Skip shared content, focus on original posts
- Target: Up to 12 images

#### **From YouTube:**
- Video thumbnails (designed visual)
- Extract 3-5 frames from most recent video
- Target: 3-5 images per channel

**Cost-saving filters:**
- Skip images < 500px (logos, icons)
- Skip duplicate images (same URL)
- Maximum 12 images per entity
- Total: ~1,500-2,000 images for all 199 entities

---

### **Step 3: Google Vision API Analysis**

For each image, request multiple detection types:

```python
features = [
    'IMAGE_PROPERTIES',      # Colors, brightness, sharpness
    'FACE_DETECTION',        # People in images (authenticity)
    'OBJECT_LOCALIZATION',   # What's in the image
    'LABEL_DETECTION',       # Content classification
    'TEXT_DETECTION',        # Signage, posters
    'SAFE_SEARCH_DETECTION'  # Professional appropriateness
]
```

#### **Technical Quality Analysis:**

**Sharpness Detection:**
- High confidence labels = sharp focus
- Low confidence = blurry/poor quality

**Lighting/Brightness:**
- Extract dominant colors' pixelFraction and RGB values
- Good lighting: Brightness 40-80% (not too dark/blown out)

**Color Consistency:**
- Extract 3 dominant colors per image
- Compare across all entity images
- Score: % of images sharing 2+ dominant colors

**Noise/Grain:**
- Low label confidence + low color saturation = grainy/low-quality

#### **Content Analysis:**

**Object Detection:**
- Confidence > 85% = professional shot with clear subject
- Count unique object categories (variety)
- Detect: people, art, performances, venues, products, food, landscapes

**Face Detection:**
- Faces present = authentic, people-focused content
- No faces + generic objects = possible stock photos

**Composition:**
- Face/object bounding boxes → assess positioning
- Centered vs. rule-of-thirds placement

---

### **Step 4: Enhanced Scoring Logic**

Map Vision API results to our 10 criteria:

#### **Criterion 1: High-quality photos (clear, well-lit)**
- Score 1 if: **70%+ of images** have:
  - High label confidence (> 80%) = sharp focus
  - Brightness score 40-80% = good lighting
- **Current**: Guess based on image existence
- **Enhanced**: Measured technical quality

#### **Criterion 2: Consistent visual style/branding**
- Score 1 if: **60%+ of images** share 2-3 dominant colors
- **Current**: AI subjective judgment from text
- **Enhanced**: Mathematical color palette analysis

#### **Criterion 3: Professional product shots**
- Score 1 if: Object detection confidence **> 85%** on primary subject
- Bonus: Face detection + high object confidence = authentic shots
- **Enhanced**: Measure subject clarity and focus

#### **Criterion 4: Good composition and framing**
- Score 1 if: **60%+ of images** show good positioning:
  - Faces/objects positioned using rule-of-thirds
  - NOT all dead-centered (indicates amateur)
- **Enhanced**: Bounding box analysis for composition

#### **Criterion 5: Variety of content types**
- Score 1 if: Detect **4+ different object categories**:
  - People, performances, art, venue, products, food, landscapes, events
- **Current**: Guess from HTML structure
- **Enhanced**: Actual content classification

#### **Criterion 6: Regular content updates**
- Keep current method: Check post dates from social media
- No change needed

#### **Criterion 7: Professional editing/retouching**
- Score 1 if: **70%+ of images** show:
  - Low noise (high saturation + sharp edges)
  - Good exposure (balanced brightness)
  - High confidence scores = clean, edited images
- **Enhanced**: Technical quality indicators

#### **Criterion 8: Brand-consistent color scheme**
- Score 1 if: **2-3 colors** repeat across **60%+ of images**
- Calculate: Extract color palettes, find most common colors
- **Enhanced**: Precise color consistency measurement

#### **Criterion 9: High-quality video content**
- Extract **5 frames** from most recent YouTube video
- Apply same quality metrics (sharpness, lighting, composition)
- Score 1 if: Video frames meet quality thresholds
- **Enhanced**: Actual video quality assessment

#### **Criterion 10: Visual content drives engagement**
- Keep current method: Scrape like/comment counts
- No change needed

---

### **Step 5: Update Scores in Google Sheets**

**Target Sheet**: `Regional Checklist Detail`

**Target Columns**: AB through AK (Visual Content criteria 1-10)

**Process:**
1. Read existing scores (for comparison)
2. Calculate new scores based on Vision API analysis
3. Update only columns AB-AK (leave all other scores untouched)
4. Column AL (Visual Content Total) recalculates automatically via SUM formula
5. `Regional Assessment` sheet pulls updated totals via VLOOKUP

**Transparency:**
- Save detailed analysis to JSON file:
  - Images analyzed per entity
  - Quality scores per image
  - Before/after comparison
  - Reasoning for each criterion score

---

## Cost Analysis

### **Google Vision API Pricing**
- **$1.50 per 1,000 images** (first 1,000 units/month)
- Feature bundling: Multiple detections = 1 unit per image

### **Estimated Cost for Full Analysis**

**Scenario 1: Conservative (8 images per entity)**
- 199 entities × 8 images = 1,592 images
- Cost: **$2.39**

**Scenario 2: Moderate (10 images per entity)**
- 199 entities × 10 images = 1,990 images
- Cost: **$2.99**

**Scenario 3: Comprehensive (12 images per entity)**
- 199 entities × 12 images = 2,388 images
- Cost: **$3.58**

**Compared to Current Phase 2 Costs:**
- Phase 2 AI Analysis: ~$30-40 for all 199 entities
- Phase 3 Visual Enhancement: ~$3 for all 199 entities
- **Very affordable upgrade!**

---

## Implementation Strategy

### **Script: `phase3_visual_analysis.py`**

**Command-line options:**
```bash
# Run for specific country
python phase3_visual_analysis.py --country Senegal

# Run for specific range
python phase3_visual_analysis.py --start 0 --limit 40

# Run for all entities with URLs
python phase3_visual_analysis.py --all

# Dry run (analyze but don't update sheets)
python phase3_visual_analysis.py --all --dry-run
```

**Output:**
```
================================================================================
PHASE 3: VISUAL CONTENT ENHANCEMENT
Using Google Vision API for objective quality assessment
================================================================================

Analyzing: Festival international de Jazz de Saint-Louis
Sources: Website, Instagram (12 posts)
Downloaded: 8 images

Image Analysis:
- Quality: 7/8 sharp and well-lit ✓
- Consistency: 3 dominant colors (blue #1A4D7E, gold #F4C430, black #1C1C1C)
  appearing in 6/8 images (75%) ✓
- Variety: 5 content types detected (performers, instruments, audience, venue, posters) ✓
- Professional: Average confidence 92% ✓
- Composition: 6/8 images well-framed ✓
- Video: 1 video analyzed, 4/5 frames high quality ✓

Visual Content Scores:
  Before: 3/10
  After:  7/10 (+4 points)

Updated criteria:
  ✓ High-quality photos → 1 (was 0)
  ✓ Consistent style → 1 (was 0)
  ✓ Professional shots → 1 (was 1)
  ✓ Good composition → 1 (was 0)
  ✓ Variety → 1 (was 1)
  ✓ Video content → 1 (was 0)

Total Score: 22/60 → 26/60
Maturity Level: Emerging (unchanged)

================================================================================
✅ PHASE 3 COMPLETE!
Analyzed 40 entities
Average visual score improvement: +2.1 points

Summary:
- 25 entities improved
- 10 entities unchanged  
- 5 entities decreased (lower quality than assumed)
- Cost: $0.48 (320 images analyzed)
================================================================================
```

---

## Benefits of Phase 3

### **1. Objectivity**
- Mathematical measurements vs. subjective AI interpretation
- Consistent scoring across all entities
- Reproducible results

### **2. Accuracy**
- Actually measure photo quality, not guess from metadata
- Detect stock photos vs. authentic content
- Identify professional editing and composition

### **3. Cost-Effective**
- Only ~$3 for all 199 entities
- Much cheaper than Phase 2 AI analysis
- Can re-run easily if entities update content

### **4. Non-Invasive**
- Only updates Visual Content columns (AB-AK)
- Doesn't touch Social Media, Website, or other scores
- All formulas continue working automatically

### **5. Transparency**
- Detailed JSON output shows exactly why scores changed
- Can review specific images that were analyzed
- Easy to explain to stakeholders: "Based on 8 images from your website/Instagram"

---

## When to Run Phase 3

**Recommended sequence:**

1. ✅ **Phase 1**: URL Discovery & Validation → Review & Approve URLs
2. ✅ **Phase 2**: Deep AI Analysis → Get initial scores
3. **Pause**: Review results, identify entities to focus on
4. ⏳ **Phase 3**: Visual Content Enhancement → Improve visual scoring
5. **Final Review**: Compare Phase 2 vs. Phase 3 results

**You can run Phase 3:**
- After all Phase 2 analyses are complete
- For specific countries/sectors where visual content matters most
- As a one-time enhancement or quarterly update
- To re-score specific entities that updated their visuals

---

## Alternative: Run Phase 3 First for High-Visual Sectors

For sectors where visual content is critical (Fashion, Visual Arts, Festivals), you could:

1. Run Phase 1 (URL discovery)
2. Run Phase 3 (Visual analysis) **before** Phase 2
3. Use Vision API results to inform Phase 2 AI analysis
4. GPT receives: "This entity has 8 high-quality images with consistent blue/gold branding showing performers and venues"

**Benefit**: More accurate AI scoring by providing concrete visual data

**Tradeoff**: Slightly more complex workflow

---

## Future Enhancements

### **Advanced Analysis** (Potential v2)
- **Cultural Authenticity Detection**: Train model to recognize traditional dress, instruments, art styles
- **Stock Photo Detection**: Compare against known stock photo databases
- **Brand Logo Recognition**: Track consistent logo usage
- **Image Freshness**: Detect outdated fashion, technology in images
- **Social Media Engagement Correlation**: Does image quality predict engagement?

### **Batch Processing**
- Process images in parallel for faster analysis
- Cache results to avoid re-analyzing same images
- Progressive updates: Analyze new entities as they're added

---

## Technical Requirements

**Python Libraries:**
```bash
pip install google-cloud-vision
pip install pillow  # Image processing
pip install requests  # Download images
```

**Google Cloud Setup:**
1. Enable Vision API in Google Cloud Console
2. Use existing service account credentials
3. No additional authentication needed (reuse tourism-development credentials)

**Storage:**
- Temporary: Download images to `/tmp/` during analysis
- Delete after processing (don't store permanently)
- Keep only analysis results (JSON)

---

## Example Output Files

**`phase3_visual_Senegal_20251004.json`**
```json
{
  "country": "Senegal",
  "analyzed_count": 40,
  "total_images": 320,
  "cost": "$0.48",
  "entities": [
    {
      "name": "Festival international de Jazz de Saint-Louis",
      "images_analyzed": 8,
      "sources": ["website", "instagram"],
      "quality_metrics": {
        "avg_sharpness": 0.92,
        "avg_brightness": 0.65,
        "color_consistency": 0.75,
        "variety_score": 5
      },
      "scores": {
        "before": 3,
        "after": 7,
        "change": +4
      },
      "criteria_changes": {
        "high_quality_photos": {"before": 0, "after": 1},
        "consistent_style": {"before": 0, "after": 1},
        "good_composition": {"before": 0, "after": 1},
        "video_content": {"before": 0, "after": 1}
      }
    }
  ],
  "summary": {
    "improved": 25,
    "unchanged": 10,
    "decreased": 5,
    "avg_improvement": 2.1
  }
}
```

---

## Questions to Consider Before Implementation

1. **Priority Countries**: Start with Senegal? Or high-visual sectors across all countries?
2. **Image Count**: 8, 10, or 12 images per entity?
3. **Update Frequency**: One-time? Quarterly? On-demand per entity?
4. **Threshold Adjustments**: Are 70% and 60% the right thresholds, or should they be stricter?
5. **Video Priority**: Should we prioritize video analysis for festivals/performances?

---

## Next Steps

When ready to implement:

1. Review and approve this plan
2. Set up Google Vision API (enable in Cloud Console)
3. Create `phase3_visual_analysis.py` script
4. Test on 5-10 Senegal entities (dry run)
5. Review results and adjust thresholds
6. Run for all entities with visual content
7. Compare Phase 2 vs. Phase 3 results

---

**Document Status**: Planning / Not Yet Implemented
**Last Updated**: October 4, 2025
**Cost Estimate**: $3-5 for all 199 entities
**Expected Timeline**: 30-45 minutes to analyze all entities

