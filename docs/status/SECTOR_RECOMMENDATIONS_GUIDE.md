# Sector-Wide Recommendations Generator

This tool generates AI-powered, collaborative recommendations for entire sectors to improve together through workshops, peer learning, and collective initiatives.

## What It Does

Unlike individual participant recommendations that focus on what ONE business should do, sector-wide recommendations focus on:

- **Collaborative Learning**: Peer-to-peer mentorship, workshops, training sessions
- **Collective Action**: Sector associations, joint marketing campaigns
- **Shared Resources**: Pooled budgets, shared platforms, common tools
- **Capacity Building**: Skills development, best practices, standards
- **Partnership Opportunities**: Engaging with government, NGOs, development partners

## How It Works

The script:
1. Analyzes all participants in each sector
2. Calculates sector-wide statistics (averages, maturity distribution, digital presence)
3. Identifies collective strengths and weaknesses
4. Generates 5-7 collaborative recommendations using AI
5. Saves recommendations as JSON files

## Usage

### Prerequisites

```bash
# Set your OpenAI API key (uses the same key as other recommendation generators)
export OPENAI_API_KEY="your-api-key-here"

# Or if you've already set it for the other recommendation generators, you're good to go!

# Ensure you're in the right directory
cd /Users/alexjeffries/tourism-commons/digital_assessment
```

### Run the Generator

```bash
python3 sector_recommendations_generator.py
```

### Output Files

- `sector_recommendations_Tour_Operators.json` - Individual sector files
- `sector_recommendations_Creative_Industries.json`
- `sector_recommendations_all.json` - Combined file with all sectors

## Recommendation Format

Each sector gets:

```json
{
  "sector": "Tour Operators",
  "overall_assessment": "Brief sector overview",
  "key_insight": "Most important insight",
  "recommendations": [
    {
      "title": "Create Tour Operators WhatsApp Learning Network",
      "priority": "high",
      "category": "Collaboration",
      "description": "What and why...",
      "approach": "How to work together...",
      "immediate_actions": [
        "Step 1",
        "Step 2",
        "Step 3"
      ],
      "long_term_vision": "What success looks like",
      "who_leads": "Tour Operators Association",
      "estimated_reach": "30+ tour operators"
    }
  ]
}
```

## Recommendation Categories

- **Collaboration**: Peer learning, mentorship, knowledge sharing
- **Training**: Workshops, capacity building, skills development
- **Infrastructure**: Shared platforms, collective tools
- **Marketing**: Joint campaigns, collective branding
- **Standards**: Best practices, quality benchmarks

## Integration with Dashboard

To display sector recommendations in the dashboard:

1. **Store in Google Sheets**: Upload recommendations to a new "Sector Recommendations" sheet
2. **API Endpoint**: Create `/api/sector/:sectorName/recommendations` endpoint
3. **UI Component**: Add a "Sector-Wide Initiatives" section to the Sector Detail page

## Example Output

### Tour Operators Sector
- **53 participants** with 42% average score
- **Strengths**: Social media presence, visual content
- **Opportunities**: Digital sales, platform integration
- **Recommendations**: 
  - WhatsApp peer learning network
  - Collective TripAdvisor campaign
  - Monthly digital skills workshops
  - Shared booking system pilot

### Creative Industries Sector
- **32 participants** with 38% average score
- **Strengths**: Visual content, Instagram presence
- **Opportunities**: Website creation, e-commerce
- **Recommendations**:
  - Artisan collective online marketplace
  - Photography and portfolio workshops
  - Shared Etsy store for handicrafts
  - Creative industries association digital fund

## Philosophy

These recommendations are designed around **gentle, collaborative moves**:

✅ **DO:**
- Peer learning and mentorship
- Low-cost, high-impact initiatives
- Leverage existing community structures
- Build on sector strengths
- Encourage collective action

❌ **DON'T:**
- Expensive consultant-driven approaches
- Complex technical solutions
- Individual competitive strategies
- One-size-fits-all recommendations
- Ignore local constraints

## Next Steps

1. **Review recommendations** with sector associations
2. **Prioritize initiatives** based on sector input
3. **Identify champions** for each recommendation
4. **Pilot 1-2 initiatives** per sector
5. **Share learnings** across sectors
6. **Scale what works**

---

**Remember**: The goal is to help sectors improve TOGETHER, not create competition. Focus on collaboration, knowledge sharing, and collective growth.

