# Individual Participant Recommendations Generator

Generate personalized, AI-powered recommendations for each participant based on their actual digital presence, scores, and sector context.

## Features

✅ **Contextual & Personalized**
- Uses participant's actual name in recommendations
- Considers what they HAVE (website, social media) vs what they NEED
- Compares to sector averages for relevant benchmarking

✅ **Intelligent Analysis**
- Reads scores across all 6 digital categories
- Only generates recommendations where there's room for improvement (score < 9)
- Acknowledges existing digital assets before suggesting improvements

✅ **Practical & Local**
- Recommends free/low-cost tools (Buffer, Canva, WhatsApp Business)
- Context-aware for The Gambia's environment
- Encouraging tone, not prescriptive

## Prerequisites

```bash
# Set your OpenAI API key
export OPENAI_API_KEY="your-api-key-here"

# Make sure you're in the right directory
cd /Users/alexjeffries/tourism-commons/digital_assessment
```

## Usage

### 1. Preview Mode (Test First!)

Before generating recommendations for all participants, test with the first 3:

```bash
python3 generate_participant_recommendations.py --preview
```

or

```bash
python3 generate_participant_recommendations.py -p
```

This will:
- Show you what data is being used
- Generate sample recommendations
- Display them in the console (won't update sheet)

### 2. Full Generation

Once you're happy with the preview, run the full batch:

```bash
python3 generate_participant_recommendations.py
```

This will:
- Process ALL participants
- Generate recommendations for each category (up to 6 per participant)
- Update the "Recommendations" sheet in Google Sheets
- Take ~1-2 minutes per participant (API rate limiting)

## Output

The script updates the **"Recommendations"** sheet with this structure:

| Column | Content |
|--------|---------|
| A | Stakeholder Name |
| B | Sector |
| C | Social Media Score |
| D | **Social Media Recommendation** (personalized) |
| E | Website Score |
| F | **Website Recommendation** (personalized) |
| G | Visual Content Score |
| H | **Visual Content Recommendation** (personalized) |
| I | Discoverability Score |
| J | **Discoverability Recommendation** (personalized) |
| K | Digital Sales Score |
| L | **Digital Sales Recommendation** (personalized) |
| M | Platform Integration Score |
| N | **Platform Integration Recommendation** (personalized) |
| O | Last Updated |

## Example Recommendations

### Before (Generic):
> "Create a website using free platforms like WordPress or Wix."

### After (Personalized & Contextual):
> "African Adventure Tours already has a strong website at africanadventuregambia.com, but could enhance it by adding a blog section with tour stories and travel tips. This helps with SEO and gives potential customers engaging content to explore."

---

### Before (Generic):
> "Schedule weekly posts using a free content calendar app."

### After (Personalized & Contextual):
> "Gambia Experience could boost their social media presence by scheduling posts in advance using Buffer or Later. With existing Facebook and Instagram accounts, aim for 3-4 posts per week showcasing tours, customer testimonials, and Gambian culture."

## How It Works

1. **Reads Assessment Data**: Pulls all participant data from TO Assessment and CI Assessment sheets
2. **Calculates Context**: 
   - Sector averages for benchmarking
   - Digital presence inventory (website, Facebook, Instagram URLs)
   - Maturity levels (Emerging, Developing, Advancing, Leading)
3. **Generates Recommendations**:
   - Uses OpenAI GPT-4o-mini
   - Crafts personalized prompts with participant context
   - Includes business name for personalization
   - Acknowledges existing assets
4. **Updates Sheet**: Writes recommendations back to Google Sheets

## Cost Estimate

- **API Cost**: ~$0.05-0.10 per participant
- **Total for 100 participants**: ~$5-10
- **Time**: ~2-3 minutes per participant (with rate limiting)

## Tips

- **Run Preview First**: Always test with `--preview` to see quality
- **Review Results**: Check the Recommendations sheet and spot-check accuracy
- **Re-run As Needed**: You can re-run for specific improvements
- **Update Data First**: Make sure assessment scores are current before generating

## Troubleshooting

### "No recommendations needed"
This means the participant has excellent scores (>9/10) across all categories. This is good!

### API Errors
- Check your OPENAI_API_KEY is set correctly
- Ensure you have API credits available
- Rate limiting is built-in (1 second delay between participants)

### Sheet Not Updating
- Verify the "Recommendations" sheet exists (run `create_recommendations_sheet.py` if needed)
- Check Google Sheets API permissions
- Look for error messages in console output

## Related Files

- `create_recommendations_sheet.py` - Creates the Recommendations sheet structure
- `sector_recommendations_generator.py` - Generates sector-wide collaborative recommendations
- `functions/src/app.ts` - API endpoint that serves recommendations to dashboard

---

**Remember**: These recommendations should feel personal, acknowledge what businesses already have, and provide practical next steps suitable for The Gambia's context.

