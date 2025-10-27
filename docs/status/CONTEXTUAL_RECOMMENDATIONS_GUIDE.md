# Contextual Recommendations Generator - User Guide

## What's Different?

This new script generates recommendations based on **exactly what participants are missing** in their Checklist Detail assessment, rather than just overall scores.

### Old Approach:
- Looked at aggregate scores (e.g., "Website: 4/10")
- Generated generic recommendations

### New Approach:
- Reads specific criteria they're missing (e.g., "No contact form", "Not mobile-friendly")
- Generates targeted recommendations addressing those exact gaps
- Much more actionable!

## Setup

### 1. Set Your OpenAI API Key

```bash
export OPENAI_API_KEY="your-api-key-here"
```

Or add permanently to your shell profile:

```bash
echo 'export OPENAI_API_KEY="your-api-key"' >> ~/.zshrc
source ~/.zshrc
```

### 2. Activate the Virtual Environment

```bash
cd /Users/alexjeffries/tourism-commons/digital_assessment
source regional_analysis_env/bin/activate
```

## Usage

### Test with 1-2 Participants First

```bash
python3 generate_contextual_recommendations.py --test "African Adventure Tours"
```

Or test multiple:

```bash
python3 generate_contextual_recommendations.py --test "African Adventure Tours" "Gambia Experience"
```

This will:
1. Read their Checklist Detail data
2. Show you exactly what criteria they're missing (0s vs 1s)
3. Generate personalized recommendations
4. Update the Recommendations sheet

### Example Output

```
================================================================================
TESTING: African Adventure Tours
================================================================================

📊 Sector: Tour Operator

🔍 Missing Criteria by Category:

  Social Media: Missing 3/10
    • Posts 2x monthly in last 6 months
    • Uses platform business features (catalog, shopping, etc.)
    • Contact info clearly visible in bio/about

  Website: Missing 2/10
    • Content updated within last 6 months
    • Links to social media accounts

  Discover: Missing 4/10
    • Google My Business has photos
    • Listed on multiple national directories
    • 5+ reviews total
    • Responds to reviews

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
GENERATED RECOMMENDATIONS:
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

📌 Social Media:
   African Adventure Tours should increase their posting frequency to at least 
   twice monthly and add WhatsApp Business catalog features to showcase their 
   tour offerings. Make sure contact information is clearly visible in all 
   social media bios.

📌 Website:
   African Adventure Tours could boost their website by adding links to their 
   social media accounts and updating content within the last 6 months to show 
   current tours and pricing.

📌 Discover:
   African Adventure Tours should add photos to their Google My Business 
   listing and get listed on additional tourism directories like My-Gambia and 
   AccessGambia. Focus on getting to 5+ reviews and respond to all reviews 
   professionally.

✅ Updated Recommendations sheet for African Adventure Tours
```

## How It Works

### 1. Reads Checklist Detail

The script reads the actual 0/1 scores from the Checklist Detail sheet:

```
Columns F-O: Social Media (10 criteria)
Columns Q-Z: Website (10 criteria)
Columns AB-AK: Visual Content (10 criteria)
Columns AM-AV: Discoverability (10 criteria)
Columns AX-BG: Digital Sales (10 criteria)
Columns BI-BR: Platform Integration (10 criteria)
```

### 2. Identifies Gaps

For each category, it finds criteria with `0` or empty values:

```python
Missing in Social Media:
  - SM4: Posts monthly in last 6 months [0]
  - SM9: Uses platform business features [0]
```

### 3. Generates Targeted Recommendations

The AI prompt includes:
- Business name (for personalization)
- Sector (for context)
- Specific missing criteria (for precision)
- Request for practical, low-cost advice

### 4. Updates Recommendations Sheet

Writes to the same sheet format as before, so the dashboard displays them automatically.

## Criteria Reference

### Social Media (SM1-SM10)
1. Has business account on primary platform
2. Has business account on second platform  
3. Has business account on third platform
4. Posts monthly in last 6 months
5. Posts 2x monthly in last 6 months
6. Posts weekly in last 6 months
7. Clear, in-focus photos/videos
8. Shows products/services consistently
9. Uses platform business features
10. Contact info clearly visible in bio/about

### Website (WEB1-WEB10)
1. Website exists and loads
2. Mobile-friendly/responsive
3. No major usability issues
4. Services/products clearly described
5. Contact information clearly visible
6. Working contact forms
7. Content updated within last 6 months
8. Modern, professional design
9. Multiple pages (not just homepage)
10. Links to social media accounts

### Visual Content (VIS1-VIS10)
1. Photos are in focus
2. Good lighting
3. Subject is clearly visible
4. Shows products/services
5. Behind-the-scenes content
6. Different angles/perspectives
7. Consistent style/filter
8. Good composition
9. Professional product shots
10. Video content

### Discoverability (DIS1-DIS10)
1. Appears in Google search for business name
2. Google My Business listing exists
3. Listed on one national directory
4. Appears on first page of results
5. Google My Business has photos
6. Listed on multiple national directories
7. Has customer reviews
8. 5+ reviews total
9. Responds to reviews
10. Other websites link to them

### Digital Sales (SAL1-SAL10)
1. Contact form on website
2. WhatsApp Business for orders
3. Phone number clearly visible
4. Facebook/Instagram shopping features
5. WhatsApp catalog
6. Social media posts include pricing
7. Mobile money integration
8. Online payment options
9. Online booking system
10. Full e-commerce website

### Platform Integration (PLAT1-PLAT10)
1. Listed on one Gambian platform
2. Listed on TripAdvisor
3. Listed on one other platform
4. Complete profile information
5. Professional photos uploaded
6. Contact information provided
7. Regular updates on platforms
8. Responds to platform messages
9. Customer reviews visible
10. Cross-platform consistency

## Cost & Time

- **API Cost**: ~$0.02-0.05 per participant
- **Time**: ~30 seconds per participant
- **Test Mode**: Free (just reads data, minimal API calls)

## Troubleshooting

### "Participant not found"
- Check spelling matches exactly as in Checklist Detail sheet
- Names are case-insensitive but must match

### "No gaps found"
- They have perfect 10/10 scores! No recommendations needed.

### API Errors
- Verify OPENAI_API_KEY is set: `echo $OPENAI_API_KEY`
- Check you have API credits
- Rate limiting is built-in (0.5s between categories)

## Next Steps

1. **Test first**: Try with 1-2 participants
2. **Review quality**: Check if recommendations are specific and helpful  
3. **Adjust as needed**: Modify prompts if recommendations aren't hitting the mark
4. **Scale up**: Once happy, can add `--all` mode to process everyone

---

**This approach is much better because it tells participants exactly what to fix, not just vague advice!**

