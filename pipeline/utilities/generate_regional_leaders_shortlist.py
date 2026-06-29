#!/usr/bin/env python3
"""
Generate shortlist of regional digital leaders for best practices analysis.
Outputs: 
- CSV with top performers per sector
- ChatGPT Deep Research prompts for each entity
"""

import json
from collections import defaultdict
from datetime import datetime

# Load regional data
with open('data/dashboard_region_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Configuration
TOP_N_PER_SECTOR = 3  # Top 3 per sector
MIN_SCORE_THRESHOLD = 45  # Only entities scoring 45+ out of 60
TARGET_COUNTRIES = ['Senegal', 'Ghana', 'Cape Verde', 'Nigeria', 'Benin']

# Sector mapping
SECTORS = {
    'Crafts_and_artisan_products': 'Crafts & Artisans',
    'Cultural_heritage_sites_museums': 'Museums & Heritage',
    'Festivals_and_cultural_events': 'Festivals & Events',
    'Music_and_live_venues': 'Music & Venues',
    'Fashion_and_Design': 'Fashion & Design',
    'Performing_and_visual_arts': 'Performing Arts',
    'Audiovisual_film_photography_TV_videography': 'Audiovisual',
    'Publishing_and_marketing': 'Publishing & Media'
}

# Collect all regional entities from category_leaders and sector_analysis
all_entities = []

# From category_leaders (already top performers)
for category, data_dict in data['category_leaders'].items():
    if 'regional' in data_dict:
        all_entities.extend(data_dict['regional'])

# Deduplicate by name + country
seen = set()
unique_entities = []
for entity in all_entities:
    key = (entity['name'], entity['country'])
    if key not in seen:
        seen.add(key)
        unique_entities.append(entity)

# Group entities by sector
entities_by_sector = defaultdict(list)

for entity in unique_entities:
    sector = entity['sector']
    country = entity['country']
    
    # Filter: only target countries and above threshold
    if country in TARGET_COUNTRIES and entity['total_score'] >= MIN_SCORE_THRESHOLD:
        entities_by_sector[sector].append(entity)

# Sort each sector by total_score and select top N
shortlist = []
sector_stats = {}

for sector_key, entities in entities_by_sector.items():
    sector_name = SECTORS.get(sector_key, sector_key)
    
    # Sort by total score descending
    sorted_entities = sorted(entities, key=lambda x: x['total_score'], reverse=True)
    top_entities = sorted_entities[:TOP_N_PER_SECTOR]
    
    sector_stats[sector_name] = {
        'total_in_region': len(entities),
        'selected': len(top_entities),
        'avg_score_selected': sum(e['total_score'] for e in top_entities) / len(top_entities) if top_entities else 0
    }
    
    for entity in top_entities:
        shortlist.append({
            'sector': sector_name,
            'name': entity['name'],
            'country': entity['country'],
            'total_score': entity['total_score'],
            'website': entity.get('website_url', 'N/A'),
            'instagram': entity.get('instagram_url', 'N/A'),
            'facebook': entity.get('facebook_url', 'N/A'),
            'tripadvisor': entity.get('tripadvisor_url', 'N/A'),
            'google_maps': entity.get('google_maps_url', 'N/A'),
            'score_breakdown': {
                'website': entity.get('website_score', 0),
                'social': entity.get('score', 0),  # The 'score' field in category_leaders is the category score
                'seo': entity.get('seo_score', 0),
                'content': entity.get('content_score', 0),
                'reviews': entity.get('reviews_score', 0),
                'technical': entity.get('technical_score', 0)
            }
        })

print(f"\n{'='*80}")
print(f"REGIONAL DIGITAL LEADERS SHORTLIST")
print(f"{'='*80}\n")
print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
print(f"Selection Criteria: Score ≥ {MIN_SCORE_THRESHOLD}/60, Top {TOP_N_PER_SECTOR} per sector")
print(f"Total Selected: {len(shortlist)} entities\n")

# Summary by sector
print("SELECTION SUMMARY BY SECTOR:")
print("-" * 80)
for sector, stats in sorted(sector_stats.items()):
    print(f"{sector:30s} | Selected: {stats['selected']}/{stats['total_in_region']:2d} | Avg Score: {stats['avg_score_selected']:.1f}/60")

# Write CSV
csv_output = "outputs/regional_leaders_shortlist.csv"
with open(csv_output, 'w', encoding='utf-8') as f:
    f.write("Sector,Name,Country,Total Score,Website,Instagram,Facebook,TripAdvisor,Google Maps,Website Score,Social Score,SEO Score,Content Score,Reviews Score,Technical Score\n")
    for entity in shortlist:
        sb = entity['score_breakdown']
        f.write(f'"{entity["sector"]}","{entity["name"]}","{entity["country"]}",{entity["total_score"]},')
        f.write(f'"{entity["website"]}","{entity["instagram"]}","{entity["facebook"]}",')
        f.write(f'"{entity["tripadvisor"]}","{entity["google_maps"]}",')
        f.write(f'{sb["website"]},{sb["social"]},{sb["seo"]},{sb["content"]},{sb["reviews"]},{sb["technical"]}\n')

print(f"\n✅ CSV exported: {csv_output}")

# Generate ChatGPT Deep Research Prompts
prompts_output = "outputs/regional_leaders_chatgpt_prompts.md"
with open(prompts_output, 'w', encoding='utf-8') as f:
    f.write("# ChatGPT Deep Research Prompts - Regional Digital Leaders\n\n")
    f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n")
    f.write(f"**Instructions:**\n")
    f.write("1. Use ChatGPT with **Deep Research** mode (requires ChatGPT Plus/Pro)\n")
    f.write("2. Copy each prompt below into a separate ChatGPT conversation\n")
    f.write("3. ChatGPT will browse the entity's digital presence and analyze it\n")
    f.write("4. Review and validate the findings\n")
    f.write("5. Compile insights into best practices document\n\n")
    f.write("---\n\n")
    
    # Group by sector for organized prompts
    by_sector = defaultdict(list)
    for entity in shortlist:
        by_sector[entity['sector']].append(entity)
    
    for sector in sorted(by_sector.keys()):
        f.write(f"## {sector}\n\n")
        
        for i, entity in enumerate(by_sector[sector], 1):
            f.write(f"### {i}. {entity['name']} ({entity['country']}) - Score: {entity['total_score']}/60\n\n")
            
            # Build prompt
            f.write("```\n")
            f.write(f"TASK: Analyze the digital marketing strategy of {entity['name']}, ")
            f.write(f"a {sector.lower()} organization in {entity['country']}.\n\n")
            
            f.write("DIGITAL PRESENCE TO ANALYZE:\n")
            if entity['website'] != 'N/A':
                f.write(f"- Website: {entity['website']}\n")
            if entity['instagram'] != 'N/A':
                f.write(f"- Instagram: {entity['instagram']}\n")
            if entity['facebook'] != 'N/A':
                f.write(f"- Facebook: {entity['facebook']}\n")
            if entity['tripadvisor'] != 'N/A':
                f.write(f"- TripAdvisor: {entity['tripadvisor']}\n")
            if entity['google_maps'] != 'N/A':
                f.write(f"- Google Maps: {entity['google_maps']}\n")
            
            f.write(f"\nDIGITAL ASSESSMENT SCORES (Context):\n")
            sb = entity['score_breakdown']
            f.write(f"- Website Quality: {sb['website']}/10\n")
            f.write(f"- Social Media: {sb['social']}/10\n")
            f.write(f"- SEO/Discoverability: {sb['seo']}/10\n")
            f.write(f"- Content Quality: {sb['content']}/10\n")
            f.write(f"- Reviews/Reputation: {sb['reviews']}/10\n")
            f.write(f"- Technical Performance: {sb['technical']}/10\n")
            
            f.write("\nANALYSIS FRAMEWORK:\n")
            f.write("Please research and analyze the following dimensions:\n\n")
            
            f.write("1. WEBSITE EXCELLENCE:\n")
            f.write("   - What makes their website effective? (design, UX, content strategy)\n")
            f.write("   - Key features: e-commerce, booking system, multilingual, mobile optimization?\n")
            f.write("   - SEO tactics: meta descriptions, structured data, keywords used?\n")
            f.write("   - Conversion optimization: how many clicks to book/buy?\n\n")
            
            f.write("2. SOCIAL MEDIA STRATEGY:\n")
            f.write("   - Platform mix: which platforms and why?\n")
            f.write("   - Content formula: posting frequency, content types (video/photo/story ratio)\n")
            f.write("   - Engagement tactics: hashtags used, influencer collabs, UGC campaigns\n")
            f.write("   - Growth patterns: follower count, engagement rate\n\n")
            
            f.write("3. CONTENT MARKETING:\n")
            f.write("   - Visual storytelling: quality of photos/videos, behind-the-scenes content\n")
            f.write("   - Video strategy: YouTube presence, reels, stories\n")
            f.write("   - User-generated content: how do they leverage visitor content?\n")
            f.write("   - Content calendar: seasonal alignment, event-driven content\n\n")
            
            f.write("4. DISCOVERABILITY & REPUTATION:\n")
            f.write("   - Google My Business: review count, rating, photo quality, Q&A\n")
            f.write("   - TripAdvisor presence: reviews, ranking, Certificate of Excellence?\n")
            f.write("   - Third-party listings: tourism boards, aggregators, booking platforms\n")
            f.write("   - Media mentions: press coverage, awards, recognition\n\n")
            
            f.write("5. INTEGRATION & CONSISTENCY:\n")
            f.write("   - Cross-platform brand consistency: visual identity, tone of voice\n")
            f.write("   - Customer journey: how do they guide visitors from discovery to booking?\n")
            f.write("   - Email/newsletter: do they have a visible email marketing strategy?\n\n")
            
            f.write("OUTPUT FORMAT:\n")
            f.write("Provide a structured analysis with:\n")
            f.write("- ✅ SUCCESS FACTORS: 3-5 key tactics that make them successful\n")
            f.write("- 🎯 DIFFERENTIATION: What sets them apart from competitors?\n")
            f.write("- 📊 QUANTITATIVE METRICS: Specific numbers (followers, reviews, posting frequency)\n")
            f.write("- 💡 REPLICABILITY: Which tactics could Gambia entities adopt? (rate as Easy/Medium/Hard)\n")
            f.write("- 📋 RESOURCE ESTIMATE: What resources do these tactics require? (time, budget, skills)\n")
            f.write("```\n\n")
            
            f.write("---\n\n")

print(f"✅ ChatGPT prompts generated: {prompts_output}")

# Generate Gambia comparison template
comparison_output = "outputs/gambia_vs_leaders_template.md"
with open(comparison_output, 'w', encoding='utf-8') as f:
    f.write("# Gambia vs Regional Leaders - Comparison Template\n\n")
    f.write("**Use this template to document gaps and action items**\n\n")
    
    for sector in sorted(by_sector.keys()):
        f.write(f"## {sector}\n\n")
        f.write(f"### Regional Leaders Summary\n")
        for entity in by_sector[sector]:
            f.write(f"- **{entity['name']}** ({entity['country']}) - {entity['total_score']}/60\n")
        
        f.write(f"\n### Common Success Factors (to be filled after ChatGPT analysis)\n")
        f.write("- [ ] Factor 1:\n")
        f.write("- [ ] Factor 2:\n")
        f.write("- [ ] Factor 3:\n")
        f.write("- [ ] Factor 4:\n")
        f.write("- [ ] Factor 5:\n\n")
        
        f.write(f"### Gambia's Current State ({sector})\n")
        f.write("- Average Score: ___ /60\n")
        f.write("- Top Gambia Entity: ____________\n")
        f.write("- Current Tactics:\n")
        f.write("  - Website: [ ] Yes [ ] No [ ] Basic\n")
        f.write("  - Social Media: [ ] Active [ ] Sporadic [ ] Minimal\n")
        f.write("  - E-commerce: [ ] Yes [ ] No\n")
        f.write("  - Reviews: ___ reviews on TripAdvisor\n")
        f.write("  - SEO: [ ] Strong [ ] Moderate [ ] Weak\n\n")
        
        f.write("### Gap Analysis\n")
        f.write("| Tactic | Regional Leaders | Gambia | Gap Size | Priority |\n")
        f.write("|--------|-----------------|--------|----------|----------|\n")
        f.write("| Example: Instagram posts/week | 5-7 | 1-2 | HIGH | 🔴 Urgent |\n")
        f.write("| | | | | |\n\n")
        
        f.write("### Priority Actions for Gambia\n")
        f.write("#### Quick Wins (0-3 months)\n")
        f.write("1. [ ] Action 1 (Estimated effort: ___ hours, $___)\n")
        f.write("2. [ ] Action 2\n")
        f.write("3. [ ] Action 3\n\n")
        
        f.write("#### Medium-Term (3-6 months)\n")
        f.write("1. [ ] Action 1\n")
        f.write("2. [ ] Action 2\n\n")
        
        f.write("#### Long-Term (6-12 months)\n")
        f.write("1. [ ] Action 1\n")
        f.write("2. [ ] Action 2\n\n")
        
        f.write("### Estimated Impact\n")
        f.write("- Potential Score Increase: +___ points (from ___ to ___)\n")
        f.write("- Timeline to Implementation: ___ months\n")
        f.write("- Total Investment Required: $___ - $___\n\n")
        
        f.write("---\n\n")

print(f"✅ Comparison template generated: {comparison_output}")

print(f"\n{'='*80}")
print("NEXT STEPS:")
print("1. Review the shortlist CSV: outputs/regional_leaders_shortlist.csv")
print("2. Copy prompts from: outputs/regional_leaders_chatgpt_prompts.md")
print("3. Run ChatGPT Deep Research on each entity (5-10 min per entity)")
print("4. Fill in comparison template: outputs/gambia_vs_leaders_template.md")
print("5. Compile best practices report")
print(f"{'='*80}\n")

