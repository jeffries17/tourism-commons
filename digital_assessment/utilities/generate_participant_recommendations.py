#!/usr/bin/env python3
"""
Individual Participant AI Recommendations Generator

Generates contextual, AI-powered recommendations for each participant
based on:
- Their actual digital presence (website, social media, etc.)
- Their scores in each of 6 categories
- Their sector context and sector averages
- Their maturity level

This populates the "Recommendations" sheet in Google Sheets.
"""

import json
import os
import time
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from openai import OpenAI

SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDS_FILE = '../tourism-development-d620c-5c9db9e21301.json'

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def get_sheets_service():
    with open(CREDS_FILE, 'r') as f:
        creds_dict = json.load(f)
    
    credentials = service_account.Credentials.from_service_account_info(
        creds_dict,
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    return build('sheets', 'v4', credentials=credentials)

def get_survey_breakdown_data(service):
    """Get survey breakdown scores from Survey_Scoring sheet"""
    survey_data = {}
    
    try:
        result = service.spreadsheets().values().get(
            spreadsheetId=SHEET_ID,
            range='Survey_Scoring!A:H'
        ).execute()
        
        rows = result.get('values', [])
        if not rows:
            return survey_data
        
        # Skip header row
        for row in rows[1:]:
            if not row or len(row) < 4:
                continue
            
            name = row[0].strip()
            # Columns: A=Name, B=Type, C=Date, D=Total, E=Foundation, F=Capability, G=Growth, H=Tier
            survey_data[name] = {
                'foundation': float(row[4]) if len(row) > 4 and row[4] else 0,
                'capability': float(row[5]) if len(row) > 5 and row[5] else 0,
                'growth': float(row[6]) if len(row) > 6 and row[6] else 0,
                'tier': str(row[7]).strip() if len(row) > 7 and row[7] else ''
            }
    except Exception as e:
        print(f"⚠️  Could not read Survey_Scoring sheet: {e}")
    
    return survey_data

def get_participant_data(service):
    """Get all participant assessment data including survey breakdown"""
    participants = []
    
    # First, get survey breakdown data from Survey_Scoring sheet
    print("📊 Reading survey breakdown data from Survey_Scoring sheet...")
    survey_breakdown_data = get_survey_breakdown_data(service)
    print(f"   Found survey data for {len(survey_breakdown_data)} participants\n")
    
    for sheet_name in ['TO Assessment', 'CI Assessment']:
        result = service.spreadsheets().values().get(
            spreadsheetId=SHEET_ID,
            range=f'{sheet_name}!A:AN'  # Read up to AN (TikTok Followers)
        ).execute()
        
        rows = result.get('values', [])
        if not rows:
            continue
        
        # Get header row for reference
        header = rows[0] if rows else []
            
        for row in rows[1:]:  # Skip header
            if not row or len(row) < 3:
                continue
                
            name = row[0].strip()
            sector = row[1].strip() if len(row) > 1 else 'Unknown'
            
            if not name or not sector:
                continue
            
            try:
                # External scores (0-10 scale)
                social_media_score = float(row[3]) if len(row) > 3 and row[3] else 0
                website_score = float(row[4]) if len(row) > 4 and row[4] else 0
                visual_score = float(row[5]) if len(row) > 5 and row[5] else 0
                discover_score = float(row[6]) if len(row) > 6 and row[6] else 0
                sales_score = float(row[7]) if len(row) > 7 and row[7] else 0
                platform_score = float(row[8]) if len(row) > 8 and row[8] else 0
                
                # Overall scores
                external_score = float(row[15]) if len(row) > 15 and row[15] else 0
                survey_score = float(row[25]) if len(row) > 25 and row[25] else 0
                combined_score = float(row[26]) if len(row) > 26 and row[26] else external_score
                
                # Get survey breakdown from Survey_Scoring sheet (matched by name)
                survey_breakdown = survey_breakdown_data.get(name, {
                    'foundation': 0,
                    'capability': 0,
                    'growth': 0,
                    'tier': ''
                })
                
                # Digital presence URLs/info
                website_url = str(row[29]).strip() if len(row) > 29 and row[29] else ''
                facebook_url = str(row[30]).strip() if len(row) > 30 and row[30] else ''
                instagram_url = str(row[31]).strip() if len(row) > 31 and row[31] else ''
                
                # Get external maturity tier
                maturity = 'Emerging'
                if combined_score >= 75:
                    maturity = 'Leading'
                elif combined_score >= 50:
                    maturity = 'Advancing'
                elif combined_score >= 25:
                    maturity = 'Developing'
                
                participants.append({
                    'name': name,
                    'sector': sector,
                    'scores': {
                        'social_media': social_media_score,
                        'website': website_score,
                        'visual': visual_score,
                        'discover': discover_score,
                        'sales': sales_score,
                        'platform': platform_score
                    },
                    'combined_score': combined_score,
                    'external_score': external_score,
                    'survey_score': survey_score,
                    'survey_breakdown': survey_breakdown,
                    'has_survey_data': survey_score > 0 and survey_breakdown['foundation'] > 0,
                    'maturity': maturity,
                    'digital_presence': {
                        'website': website_url,
                        'facebook': facebook_url,
                        'instagram': instagram_url
                    }
                })
                    
            except (ValueError, IndexError) as e:
                print(f"⚠️  Error processing {name}: {e}")
                continue
    
    return participants

def calculate_sector_averages(participants):
    """Calculate average scores by sector"""
    sector_stats = {}
    
    for p in participants:
        sector = p['sector']
        if sector not in sector_stats:
            sector_stats[sector] = {
                'count': 0,
                'scores': {
                    'social_media': [],
                    'website': [],
                    'visual': [],
                    'discover': [],
                    'sales': [],
                    'platform': []
                },
                'combined': []
            }
        
        sector_stats[sector]['count'] += 1
        sector_stats[sector]['combined'].append(p['combined_score'])
        for cat, score in p['scores'].items():
            sector_stats[sector]['scores'][cat].append(score)
    
    # Calculate averages
    sector_averages = {}
    for sector, stats in sector_stats.items():
        sector_averages[sector] = {
            'count': stats['count'],
            'avg_combined': sum(stats['combined']) / len(stats['combined']) if stats['combined'] else 0,
            'avg_scores': {}
        }
        for cat, scores in stats['scores'].items():
            sector_averages[sector]['avg_scores'][cat] = sum(scores) / len(scores) if scores else 0
    
    return sector_averages

def generate_recommendation(participant, sector_avg):
    """Generate AI recommendation for a specific category"""
    
    name = participant['name']
    sector = participant['sector']
    scores = participant['scores']
    digital_presence = participant['digital_presence']
    maturity = participant['maturity']
    
    # Build context about what they have
    has_website = bool(digital_presence['website'])
    has_facebook = bool(digital_presence['facebook'])
    has_instagram = bool(digital_presence['instagram'])
    
    # Category details
    categories = {
        'social_media': {
            'name': 'Social Media',
            'score': scores['social_media'],
            'sector_avg': sector_avg['avg_scores']['social_media'],
            'current_state': f"Has Facebook: {has_facebook}, Has Instagram: {has_instagram}"
        },
        'website': {
            'name': 'Website',
            'score': scores['website'],
            'sector_avg': sector_avg['avg_scores']['website'],
            'current_state': f"Has website: {has_website}" + (f" ({digital_presence['website']})" if has_website else "")
        },
        'visual': {
            'name': 'Visual Content',
            'score': scores['visual'],
            'sector_avg': sector_avg['avg_scores']['visual'],
            'current_state': "Photos and visual content available"
        },
        'discover': {
            'name': 'Discoverability',
            'score': scores['discover'],
            'sector_avg': sector_avg['avg_scores']['discover'],
            'current_state': "Online presence and searchability"
        },
        'sales': {
            'name': 'Digital Sales',
            'score': scores['sales'],
            'sector_avg': sector_avg['avg_scores']['sales'],
            'current_state': "Booking and payment capabilities"
        },
        'platform': {
            'name': 'Platform Integration',
            'score': scores['platform'],
            'sector_avg': sector_avg['avg_scores']['platform'],
            'current_state': "Integration with tourism platforms"
        }
    }
    
    # Find the weakest category (but only if score < 7)
    weak_categories = {k: v for k, v in categories.items() if v['score'] < 7}
    if not weak_categories:
        return None  # They're doing well in all categories
    
    # Sort by score to prioritize lowest
    sorted_weak = sorted(weak_categories.items(), key=lambda x: x[1]['score'])
    category_key = sorted_weak[0][0]
    category = sorted_weak[0][1]
    
    # Build the AI prompt
    prompt = f"""You are a digital transformation consultant helping a tourism business in The Gambia.

**Business:** {name}
**Sector:** {sector}
**Maturity Level:** {maturity}
**Overall Digital Score:** {participant['combined_score']:.1f}/100
**Sector Average:** {sector_avg['avg_combined']:.1f}/100

**Current Digital Presence:**
- Website: {'Yes - ' + digital_presence['website'] if has_website else 'No'}
- Facebook: {'Yes - ' + digital_presence['facebook'] if has_facebook else 'No'}
- Instagram: {'Yes - ' + digital_presence['instagram'] if has_instagram else 'No'}

**Focus Category:** {category['name']}
- Their Score: {category['score']:.1f}/10
- Sector Average: {category['sector_avg']:.1f}/10
- Current State: {category['current_state']}

Generate a SPECIFIC, ACTIONABLE recommendation (2-3 sentences) for improving their {category['name']}.

Requirements:
1. Acknowledge what they ALREADY HAVE (don't suggest creating what already exists)
2. Be specific and practical for The Gambia context (low-cost, local resources)
3. Focus on the next logical step given their current level
4. Keep it conversational and encouraging
5. Mention specific tools/platforms if relevant (Buffer, Canva, WhatsApp Business, TripAdvisor, etc.)

Output ONLY the recommendation text, no preamble."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a practical digital transformation consultant for tourism businesses in The Gambia. Focus on low-cost, high-impact recommendations that acknowledge what businesses already have."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=200
        )
        
        recommendation = response.choices[0].message.content.strip()
        return {
            'category': category_key,
            'category_name': category['name'],
            'score': category['score'],
            'recommendation': recommendation
        }
        
    except Exception as e:
        print(f"❌ Error generating recommendation for {name} - {category['name']}: {e}")
        return None

def generate_all_category_recommendations(participant, sector_avg):
    """Generate recommendations for all 6 categories holistically (in one AI call)"""
    
    name = participant['name']
    sector = participant['sector']
    digital_presence = participant['digital_presence']
    has_survey = participant.get('has_survey_data', False)
    survey_breakdown = participant.get('survey_breakdown', {})
    external_score = participant.get('external_score', 0)
    survey_score = participant.get('survey_score', 0)
    
    has_website = bool(digital_presence['website'])
    has_facebook = bool(digital_presence['facebook'])
    has_instagram = bool(digital_presence['instagram'])
    
    # Identify categories that need recommendations (score < 9)
    categories_to_improve = []
    for cat_key, cat_name in [
        ('social_media', 'Social Media'),
        ('website', 'Website'),
        ('visual', 'Visual Content'),
        ('discover', 'Discoverability'),
        ('sales', 'Digital Sales'),
        ('platform', 'Platform Integration')
    ]:
        score = participant['scores'][cat_key]
        if score < 9:
            categories_to_improve.append({
                'key': cat_key,
                'name': cat_name,
                'score': score,
                'sector_avg': sector_avg['avg_scores'][cat_key]
            })
        else:
            print(f"  ✓ {cat_name}: Score {score:.1f}/10 - Excellent, no recommendation needed")
    
    if not categories_to_improve:
        return {}
    
    # Build survey insights section
    survey_insight = ""
    if has_survey:
        foundation = survey_breakdown.get('foundation', 0)
        capability = survey_breakdown.get('capability', 0)
        growth = survey_breakdown.get('growth', 0)
        tier = survey_breakdown.get('tier', '')
        
        weak_areas = []
        if foundation < 5:
            weak_areas.append("limited digital foundation")
        if capability < 5:
            weak_areas.append("technical skills or infrastructure gaps")
        if growth < 5:
            weak_areas.append("knowledge/investment constraints")
        
        external_pct = (external_score / 70) * 100 if external_score else 0
        survey_pct = (survey_score / 30) * 100 if survey_score else 0
        
        discrepancy = ""
        if abs(external_pct - survey_pct) > 20:
            if external_pct > survey_pct:
                discrepancy = f"⚠️ DISCREPANCY: External performance ({external_score:.0f}/70) stronger than internal capacity ({survey_score:.0f}/30). May lack skills/resources to sustain."
            else:
                discrepancy = f"💡 OPPORTUNITY: Internal capacity ({survey_score:.0f}/30) exceeds external performance ({external_score:.0f}/70). Untapped potential!"
        
        survey_insight = f"""
**Survey Assessment (Internal Capacity):**
- Digital Foundation: {foundation:.1f}/10
- Digital Capability: {capability:.1f}/10
- Growth Readiness: {growth:.1f}/10
- Survey Tier: {tier}
{discrepancy}
{f"Key Challenges: {', '.join(weak_areas)}" if weak_areas else "Strong internal capacity"}
"""
    else:
        survey_insight = "**Note:** No survey data - recommendation based on external assessment only."
    
    # Build categories list for prompt
    categories_text = "\n".join([
        f"- **{cat['name']}**: Score {cat['score']:.1f}/10 (Sector avg: {cat['sector_avg']:.1f}/10)"
        for cat in categories_to_improve
    ])
    
    # Generate all recommendations in one call
    prompt = f"""Generate brief, personalized recommendations for {name}, a {sector} business in The Gambia.

**Digital Presence:**
- Website: {'Yes - ' + digital_presence['website'] if has_website else 'No'}
- Facebook: {'Yes - ' + digital_presence['facebook'] if has_facebook else 'No'}
- Instagram: {'Yes - ' + digital_presence['instagram'] if has_instagram else 'No'}

{survey_insight}

**Categories needing improvement:**
{categories_text}

Generate ONE recommendation (2 sentences max) for EACH category listed above.

**CRITICAL REQUIREMENTS:**
1. Use THIRD PERSON with GENTLE language: "{name} could improve..." or "{name} might consider..." (NEVER "should")
2. Each recommendation must be UNIQUE - avoid repetition (don't say "post more regularly" in multiple categories)
3. Focus on PRINCIPLES not tools: "post more regularly" NOT "use Buffer"
4. If survey shows low capability/growth, prioritize simpler steps and training
5. Make recommendations COMPLEMENTARY - they should work together, not repeat
6. Be specific and practical for Gambia context

**OUTPUT FORMAT (JSON):**
{{
  "social_media": "recommendation text here",
  "website": "recommendation text here",
  "visual": "recommendation text here",
  "discover": "recommendation text here",
  "sales": "recommendation text here",
  "platform": "recommendation text here"
}}

Only include categories from the list above. Use null for categories not needing recommendations."""
    
    print(f"  Generating {len(categories_to_improve)} recommendations holistically...")
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a practical digital consultant for Gambian tourism businesses. Give concise, gentle, third-person recommendations that consider both external performance and internal capacity. Focus on PRINCIPLES not tools. Ensure recommendations are UNIQUE and COMPLEMENTARY, not repetitive. Output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500,
            response_format={"type": "json_object"}
        )
        
        # Parse JSON response
        import json as json_lib
        recommendations_json = json_lib.loads(response.choices[0].message.content)
        
        # Filter to only categories that were requested
        recommendations = {}
        for cat in categories_to_improve:
            if cat['key'] in recommendations_json and recommendations_json[cat['key']]:
                recommendations[cat['key']] = recommendations_json[cat['key']]
        
        return recommendations
        
    except Exception as e:
        print(f"    ⚠️  Error generating recommendations: {e}")
        return {}


def generate_category_specific_recommendation(participant, sector_avg, cat_key, cat_name, score):
    """Generate a specific recommendation for one category, incorporating survey insights"""
    
    name = participant['name']
    sector = participant['sector']
    digital_presence = participant['digital_presence']
    has_survey = participant.get('has_survey_data', False)
    survey_breakdown = participant.get('survey_breakdown', {})
    external_score = participant.get('external_score', 0)
    survey_score = participant.get('survey_score', 0)
    
    has_website = bool(digital_presence['website'])
    has_facebook = bool(digital_presence['facebook'])
    has_instagram = bool(digital_presence['instagram'])
    
    # Category-specific context
    context_map = {
        'social_media': f"Current: Facebook {'✓' if has_facebook else '✗'}, Instagram {'✓' if has_instagram else '✗'}",
        'website': f"Current: {'Has website at ' + digital_presence['website'] if has_website else 'No website'}",
        'visual': "Visual content quality and photography",
        'discover': "Online visibility and searchability",
        'sales': "Booking and payment capabilities",
        'platform': "Integration with tourism platforms (TripAdvisor, Booking.com, etc.)"
    }
    
    sector_avg_score = sector_avg['avg_scores'][cat_key]
    
    # Build survey insights section
    survey_insight = ""
    if has_survey:
        foundation = survey_breakdown.get('foundation', 0)
        capability = survey_breakdown.get('capability', 0)
        growth = survey_breakdown.get('growth', 0)
        tier = survey_breakdown.get('tier', '')
        
        # Identify key internal weaknesses
        weak_areas = []
        if foundation < 5:
            weak_areas.append("limited digital foundation (current platforms/presence)")
        if capability < 5:
            weak_areas.append("technical skills or infrastructure gaps")
        if growth < 5:
            weak_areas.append("knowledge/investment constraints")
        
        # Detect discrepancies
        external_pct = (external_score / 70) * 100 if external_score else 0
        survey_pct = (survey_score / 30) * 100 if survey_score else 0
        
        discrepancy = ""
        if abs(external_pct - survey_pct) > 20:
            if external_pct > survey_pct:
                discrepancy = f"⚠️ DISCREPANCY: External performance ({external_score:.0f}/70) is stronger than internal capacity ({survey_score:.0f}/30). They may lack skills/resources to sustain current presence."
            else:
                discrepancy = f"💡 OPPORTUNITY: Internal capacity ({survey_score:.0f}/30) exceeds external performance ({external_score:.0f}/70). They have untapped potential!"
        
        survey_insight = f"""
**Survey Assessment (Internal Capacity):**
- Digital Foundation: {foundation:.1f}/10 (platforms, posting frequency)
- Digital Capability: {capability:.1f}/10 (skills, tools, infrastructure)
- Growth Readiness: {growth:.1f}/10 (knowledge, investment capacity)
- Survey Tier: {tier}
{discrepancy}
{f"Key Challenges: {', '.join(weak_areas)}" if weak_areas else "Strong internal capacity overall"}
"""
    else:
        survey_insight = "**Note:** No survey data available - recommendation based on external assessment only."
    
    prompt = f"""Generate a brief, personalized recommendation for {name}, a {sector} business in The Gambia.

**Category: {cat_name}**
External Score: {score:.1f}/10 (what we observe online)
Sector Average: {sector_avg_score:.1f}/10
{context_map[cat_key]}

{survey_insight}

Requirements:
1. Use THIRD PERSON only - say "{name} should..." or "{name} could..." (never "you" or "your")
2. Keep it SHORT - 2 sentences maximum
3. If they HAVE platforms, suggest IMPROVEMENT not creation
4. Focus on PRINCIPLES and PRACTICES, not specific tools:
   - Say "post more regularly" NOT "use Buffer"
   - Say "plan content in advance" NOT "use a content calendar"
   - Say "create simple visuals" NOT "use Canva"
   - Focus on the THINKING and APPROACH
5. **IMPORTANT**: If survey shows low capability or growth scores, recommendations should prioritize:
   - Simpler, more achievable steps
   - Training or skill-building needs
   - Practical approaches they can implement with what they have
6. If there's a discrepancy (external vs internal), address it:
   - High external, low internal → Focus on sustainability, training, simpler workflows
   - Low external, high internal → Encourage showcasing skills/knowledge more
7. Be specific about the practice/strategy, not the tool

Output only the recommendation text, starting with their name. Keep it concise and in third person."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a practical digital consultant for Gambian tourism businesses. Give concise, third-person recommendations that consider BOTH external performance AND internal capacity. Focus on PRINCIPLES and PRACTICES, not specific tool names. Address skill gaps, resource constraints, and discrepancies. Keep responses to 2 sentences maximum."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=150
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        print(f"    ⚠️  Error: {e}")
        return None

def update_recommendations_sheet(service, participant, recommendations):
    """Update the Recommendations sheet with AI-generated recommendations"""
    
    # Find the row for this participant
    result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range='Recommendations!A:A'
    ).execute()
    
    rows = result.get('values', [])
    row_num = None
    
    for i, row in enumerate(rows):
        if row and row[0] and row[0].strip().lower() == participant['name'].lower():
            row_num = i + 1
            break
    
    # If not found, append new row
    if not row_num:
        row_num = len(rows) + 1
    
    # Build the row data
    # Schema: A=Name, B=Sector, C=SM Score, D=SM Rec, E=Web Score, F=Web Rec, etc.
    row_data = [
        participant['name'],
        participant['sector'],
        participant['scores']['social_media'],
        recommendations.get('social_media', ''),
        participant['scores']['website'],
        recommendations.get('website', ''),
        participant['scores']['visual'],
        recommendations.get('visual', ''),
        participant['scores']['discover'],
        recommendations.get('discover', ''),
        participant['scores']['sales'],
        recommendations.get('sales', ''),
        participant['scores']['platform'],
        recommendations.get('platform', ''),
        datetime.now().strftime('%Y-%m-%d %H:%M')
    ]
    
    # Update the row
    service.spreadsheets().values().update(
        spreadsheetId=SHEET_ID,
        range=f'Recommendations!A{row_num}:O{row_num}',
        valueInputOption='RAW',
        body={'values': [row_data]}
    ).execute()

def preview_mode(service, participants, sector_averages):
    """Preview recommendations for first 3 participants without updating sheet"""
    print("\n" + "="*80)
    print("PREVIEW MODE - Testing with first 3 participants")
    print("="*80 + "\n")
    
    for participant in participants[:3]:
        print(f"\n{'='*80}")
        print(f"PREVIEW: {participant['name']}")
        print(f"Sector: {participant['sector']} | Combined Score: {participant['combined_score']:.1f}/100")
        print(f"\n📊 ASSESSMENT BREAKDOWN:")
        print(f"  External Score: {participant['external_score']:.1f}/70 ({(participant['external_score']/70*100):.0f}%)")
        print(f"  Survey Score: {participant['survey_score']:.1f}/30 ({(participant['survey_score']/30*100):.0f}%)" if participant['survey_score'] > 0 else "  Survey Score: Not completed")
        
        if participant.get('has_survey_data'):
            survey = participant['survey_breakdown']
            print(f"\n  Survey Breakdown:")
            print(f"    • Digital Foundation: {survey['foundation']:.1f}/10")
            print(f"    • Digital Capability: {survey['capability']:.1f}/10")
            print(f"    • Growth Readiness: {survey['growth']:.1f}/10")
            print(f"    • Survey Tier: {survey['tier']}")
            
            # Show discrepancy if exists
            external_pct = (participant['external_score'] / 70) * 100
            survey_pct = (participant['survey_score'] / 30) * 100
            if abs(external_pct - survey_pct) > 20:
                if external_pct > survey_pct:
                    print(f"\n  ⚠️  DISCREPANCY DETECTED: External performance stronger than internal capacity")
                    print(f"      → May need training/support to sustain current digital presence")
                else:
                    print(f"\n  💡 OPPORTUNITY DETECTED: Internal capacity exceeds external performance")
                    print(f"      → Has untapped potential to improve online presence")
        
        print(f"\n📱 Digital Presence:")
        print(f"  Website: {participant['digital_presence']['website'] or 'None'}")
        print(f"  Facebook: {participant['digital_presence']['facebook'] or 'None'}")
        print(f"  Instagram: {participant['digital_presence']['instagram'] or 'None'}")
        
        print(f"\n📈 External Category Scores:")
        for cat, score in participant['scores'].items():
            print(f"  • {cat.replace('_', ' ').title()}: {score:.1f}/10")
        
        print(f"\n{'~'*80}")
        print("GENERATED RECOMMENDATIONS (incorporating survey insights):")
        print(f"{'~'*80}\n")
        
        sector_avg = sector_averages[participant['sector']]
        recommendations = generate_all_category_recommendations(participant, sector_avg)
        
        if recommendations:
            for cat_key, rec_text in recommendations.items():
                cat_display = cat_key.replace('_', ' ').title()
                print(f"📌 {cat_display}:")
                print(f"   {rec_text}\n")
        else:
            print("✓ No recommendations needed - excellent scores across all categories\n")
        
        time.sleep(1)
    
    print("\n" + "="*80)
    print("Preview complete! If these look good, run without --preview to update all.")
    print("="*80 + "\n")

def main():
    import sys
    
    preview = '--preview' in sys.argv or '-p' in sys.argv
    
    print("="*80)
    print("INDIVIDUAL PARTICIPANT AI RECOMMENDATIONS GENERATOR")
    print("="*80)
    print("\nThis will generate personalized, contextual recommendations")
    print("for each participant based on their actual digital presence.\n")
    
    if preview:
        print("🔍 PREVIEW MODE: Will test with first 3 participants only\n")
    
    # Check for API key
    if not os.getenv('OPENAI_API_KEY'):
        print("❌ ERROR: OPENAI_API_KEY environment variable not set")
        print("Please run: export OPENAI_API_KEY='your-api-key'")
        return
    
    service = get_sheets_service()
    
    print("📊 Fetching participant data...")
    participants = get_participant_data(service)
    print(f"✓ Found {len(participants)} participants\n")
    
    print("📈 Calculating sector averages...")
    sector_averages = calculate_sector_averages(participants)
    print(f"✓ Analyzed {len(sector_averages)} sectors\n")
    
    # Display sector stats
    for sector, stats in sector_averages.items():
        print(f"  {sector}: {stats['count']} participants, avg score {stats['avg_combined']:.1f}/100")
    
    # If preview mode, just show first 3
    if preview:
        preview_mode(service, participants, sector_averages)
        return
    
    print("\n" + "="*80)
    print("GENERATING RECOMMENDATIONS FOR ALL PARTICIPANTS")
    print("="*80 + "\n")
    
    total = len(participants)
    survey_count = sum(1 for p in participants if p.get('has_survey_data'))
    print(f"Total Participants: {total}")
    print(f"With Survey Data: {survey_count} ({(survey_count/total*100):.0f}%)")
    print(f"Without Survey Data: {total - survey_count} (recommendations based on external assessment only)\n")
    
    for idx, participant in enumerate(participants, 1):
        print(f"\n[{idx}/{total}] {participant['name']} ({participant['sector']})")
        print(f"  Combined: {participant['combined_score']:.1f}/100 | External: {participant['external_score']:.1f}/70 | Survey: {participant['survey_score']:.1f}/30" if participant.get('has_survey_data') else f"  Score: {participant['combined_score']:.1f}/100 (external only)")
        
        if participant.get('has_survey_data'):
            survey = participant['survey_breakdown']
            print(f"  Survey: Foundation {survey['foundation']:.1f} | Capability {survey['capability']:.1f} | Growth {survey['growth']:.1f}")
        
        sector_avg = sector_averages[participant['sector']]
        
        # Generate recommendations for all categories
        recommendations = generate_all_category_recommendations(participant, sector_avg)
        
        if recommendations:
            print(f"  ✓ Generated {len(recommendations)} recommendations")
            
            # Update the sheet
            try:
                update_recommendations_sheet(service, participant, recommendations)
                print(f"  ✓ Updated Recommendations sheet")
            except Exception as e:
                print(f"  ❌ Error updating sheet: {e}")
        else:
            print(f"  ℹ️  No recommendations needed (high scores across all categories)")
        
        # Rate limiting
        time.sleep(1)
    
    print("\n" + "="*80)
    print("✅ COMPLETE!")
    print("="*80)
    print(f"\nProcessed {total} participants")
    print("Check the 'Recommendations' sheet in Google Sheets for results.\n")

if __name__ == '__main__':
    main()

