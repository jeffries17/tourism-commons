#!/usr/bin/env python3
"""
Sector-Wide AI Recommendations Generator
Generates collaborative, sector-wide recommendations for how entire sectors
can work together to improve their digital presence through workshops,
partnerships, and collective initiatives.
"""

import json
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from openai import OpenAI

SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDS_FILE = '../tourism-development-d620c-5c9db9e21301.json'

# Initialize OpenAI client (uses OPENAI_API_KEY environment variable)
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def get_sheets_service():
    with open(CREDS_FILE, 'r') as f:
        creds_dict = json.load(f)
    
    credentials = service_account.Credentials.from_service_account_info(
        creds_dict,
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    return build('sheets', 'v4', credentials=credentials)

def get_sector_data(service):
    """Get all assessment data and organize by sector"""
    sectors_data = {}
    
    for sheet_name in ['TO Assessment', 'CI Assessment']:
        result = service.spreadsheets().values().get(
            spreadsheetId=SHEET_ID,
            range=f'{sheet_name}!A:AL'
        ).execute()
        
        rows = result.get('values', [])
        if not rows:
            continue
            
        for row in rows[1:]:  # Skip header
            if not row or len(row) < 3:
                continue
                
            name = row[0].strip()
            sector = row[1].strip() if len(row) > 1 else 'Unknown'
            
            if not name or not sector:
                continue
            
            # Get scores
            try:
                external = float(row[15]) if len(row) > 15 and row[15] else 0
                survey = float(row[25]) if len(row) > 25 and row[25] else 0
                combined = float(row[26]) if len(row) > 26 and row[26] else external
                
                # Category scores (raw 0-10)
                social_media = float(row[3]) if len(row) > 3 and row[3] else 0
                website = float(row[4]) if len(row) > 4 and row[4] else 0
                visual = float(row[5]) if len(row) > 5 and row[5] else 0
                discover = float(row[6]) if len(row) > 6 and row[6] else 0
                sales = float(row[7]) if len(row) > 7 and row[7] else 0
                platform = float(row[8]) if len(row) > 8 and row[8] else 0
                
                # Digital presence
                has_website = bool(row[29]) if len(row) > 29 else False
                has_facebook = bool(row[30]) if len(row) > 30 else False
                has_instagram = bool(row[31]) if len(row) > 31 else False
                
                if sector not in sectors_data:
                    sectors_data[sector] = {
                        'participants': [],
                        'total_count': 0,
                        'avg_external': 0,
                        'avg_survey': 0,
                        'avg_combined': 0,
                        'category_scores': {
                            'social_media': [],
                            'website': [],
                            'visual': [],
                            'discover': [],
                            'sales': [],
                            'platform': []
                        },
                        'digital_presence': {
                            'with_website': 0,
                            'with_facebook': 0,
                            'with_instagram': 0
                        }
                    }
                
                sectors_data[sector]['participants'].append({
                    'name': name,
                    'external': external,
                    'survey': survey,
                    'combined': combined
                })
                sectors_data[sector]['category_scores']['social_media'].append(social_media)
                sectors_data[sector]['category_scores']['website'].append(website)
                sectors_data[sector]['category_scores']['visual'].append(visual)
                sectors_data[sector]['category_scores']['discover'].append(discover)
                sectors_data[sector]['category_scores']['sales'].append(sales)
                sectors_data[sector]['category_scores']['platform'].append(platform)
                
                if has_website:
                    sectors_data[sector]['digital_presence']['with_website'] += 1
                if has_facebook:
                    sectors_data[sector]['digital_presence']['with_facebook'] += 1
                if has_instagram:
                    sectors_data[sector]['digital_presence']['with_instagram'] += 1
                    
            except (ValueError, IndexError) as e:
                print(f"Error processing row for {name}: {e}")
                continue
    
    # Calculate averages
    for sector, data in sectors_data.items():
        count = len(data['participants'])
        if count > 0:
            data['total_count'] = count
            data['avg_external'] = sum(p['external'] for p in data['participants']) / count
            data['avg_survey'] = sum(p['survey'] for p in data['participants']) / count
            data['avg_combined'] = sum(p['combined'] for p in data['participants']) / count
            
            # Category averages
            for cat, scores in data['category_scores'].items():
                if scores:
                    data[f'avg_{cat}'] = sum(scores) / len(scores)
    
    return sectors_data

def generate_sector_recommendations(sector_name, sector_data, all_sectors_avg):
    """Generate AI-powered sector-wide recommendations"""
    
    # Prepare sector summary
    count = sector_data['total_count']
    avg_external = sector_data['avg_external']
    avg_combined = sector_data['avg_combined']
    
    # Find strengths and weaknesses
    categories = ['social_media', 'website', 'visual', 'discover', 'sales', 'platform']
    cat_scores = {cat: sector_data.get(f'avg_{cat}', 0) for cat in categories}
    
    # Sort by score
    sorted_cats = sorted(cat_scores.items(), key=lambda x: x[1], reverse=True)
    top_3 = sorted_cats[:3]
    bottom_3 = sorted_cats[-3:]
    
    # Digital presence stats
    pct_website = (sector_data['digital_presence']['with_website'] / count * 100) if count > 0 else 0
    pct_facebook = (sector_data['digital_presence']['with_facebook'] / count * 100) if count > 0 else 0
    pct_instagram = (sector_data['digital_presence']['with_instagram'] / count * 100) if count > 0 else 0
    
    # Maturity distribution
    emerging = len([p for p in sector_data['participants'] if p['combined'] < 25])
    developing = len([p for p in sector_data['participants'] if 25 <= p['combined'] < 50])
    advancing = len([p for p in sector_data['participants'] if 50 <= p['combined'] < 75])
    leading = len([p for p in sector_data['participants'] if p['combined'] >= 75])
    
    prompt = f"""You are a sector development consultant specializing in digital transformation for {sector_name} businesses in The Gambia, West Africa.

SECTOR OVERVIEW:
- Total Participants: {count}
- Average Digital Score: {avg_combined:.1f}%
- Average External Assessment: {avg_external:.1f}%

MATURITY DISTRIBUTION:
- Emerging (0-25%): {emerging} businesses ({emerging/count*100:.0f}%)
- Developing (25-50%): {developing} businesses ({developing/count*100:.0f}%)
- Advancing (50-75%): {advancing} businesses ({advancing/count*100:.0f}%)
- Leading (75-100%): {leading} businesses ({leading/count*100:.0f}%)

DIGITAL PRESENCE:
- Have websites: {pct_website:.0f}%
- Active on Facebook: {pct_facebook:.0f}%
- Active on Instagram: {pct_instagram:.0f}%

SECTOR STRENGTHS (Top 3 Categories):
{chr(10).join(f"- {cat[0].replace('_', ' ').title()}: {cat[1]:.1f}/10" for cat in top_3)}

GROWTH OPPORTUNITIES (Bottom 3 Categories):
{chr(10).join(f"- {cat[0].replace('_', ' ').title()}: {cat[1]:.1f}/10" for cat in bottom_3)}

CONTEXT:
- Limited internet access and technical skills
- Low budgets and resources
- Strong community culture and willingness to collaborate
- Government and development partners available for support
- Existing sector associations (tourism, creative industries)

YOUR TASK:
Generate 5-7 sector-wide recommendations that focus on COLLABORATIVE IMPROVEMENT.

Each recommendation should:
1. Address a clear gap or opportunity for the sector
2. Propose a COLLABORATIVE or GROUP APPROACH (workshops, peer learning, associations, collective marketing)
3. Be practical and achievable in a low-resource environment
4. Leverage sector strengths to address weaknesses
5. Include both immediate actions AND longer-term capacity building
6. Consider The Gambia's specific constraints (internet, budget, skills)

FOCUS ON:
- Peer-to-peer learning and mentorship
- Sector associations and collective action
- Workshops and training sessions
- Shared resources and platforms
- Collective marketing initiatives
- Government/NGO partnership opportunities
- Creating sector-wide standards and best practices

FORMAT YOUR RESPONSE AS JSON:
{{
  "sector": "{sector_name}",
  "overall_assessment": "1-2 sentence overview of sector's digital readiness",
  "key_insight": "The most important insight about this sector's digital transformation needs",
  "recommendations": [
    {{
      "title": "Clear, action-oriented title",
      "priority": "high/medium/low",
      "category": "Collaboration/Training/Infrastructure/Marketing/Standards",
      "description": "2-3 sentences explaining what and why",
      "approach": "HOW the sector should work together on this",
      "immediate_actions": ["Specific action 1", "Specific action 2", "Specific action 3"],
      "long_term_vision": "What success looks like in 1-2 years",
      "who_leads": "Who should champion this (association, government, development partner, businesses)",
      "estimated_reach": "How many businesses this could help"
    }}
  ]
}}

Remember: Focus on GENTLE, COLLABORATIVE moves that bring the sector together. Think peer learning, not expensive consultants. Think WhatsApp groups and local workshops, not complex software. Think collective action, not individual competition."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a sector development expert focused on collaborative digital transformation in low-resource environments."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
        
    except Exception as e:
        print(f"Error generating recommendations for {sector_name}: {e}")
        return None

def main():
    print("="*80)
    print("SECTOR-WIDE AI RECOMMENDATIONS GENERATOR")
    print("="*80)
    
    service = get_sheets_service()
    
    print("\nFetching sector data...")
    sectors_data = get_sector_data(service)
    
    # Calculate overall average
    all_scores = []
    for data in sectors_data.values():
        all_scores.extend([p['combined'] for p in data['participants']])
    all_sectors_avg = sum(all_scores) / len(all_scores) if all_scores else 0
    
    print(f"Found {len(sectors_data)} sectors")
    print(f"Overall average score: {all_sectors_avg:.1f}%\n")
    
    all_recommendations = {}
    
    for sector_name, sector_data in sectors_data.items():
        if sector_data['total_count'] < 3:  # Skip sectors with too few participants
            print(f"⚠️  Skipping {sector_name} (only {sector_data['total_count']} participants)")
            continue
            
        print(f"\nGenerating recommendations for {sector_name}...")
        print(f"  - {sector_data['total_count']} participants")
        print(f"  - Avg score: {sector_data['avg_combined']:.1f}%")
        
        recommendations = generate_sector_recommendations(sector_name, sector_data, all_sectors_avg)
        
        if recommendations:
            all_recommendations[sector_name] = recommendations
            print(f"  ✅ Generated {len(recommendations.get('recommendations', []))} recommendations")
            
            # Save individual sector file (sanitize filename)
            safe_name = sector_name.replace(' ', '_').replace('&', 'and').replace('/', '_').replace('(', '').replace(')', '').replace(',', '')
            filename = f"sector_recommendations_{safe_name}.json"
            with open(filename, 'w') as f:
                json.dump(recommendations, f, indent=2)
            print(f"  💾 Saved to {filename}")
    
    # Save all recommendations
    with open('sector_recommendations_all.json', 'w') as f:
        json.dump(all_recommendations, f, indent=2)
    
    print("\n" + "="*80)
    print(f"✅ COMPLETE! Generated recommendations for {len(all_recommendations)} sectors")
    print("="*80)

if __name__ == "__main__":
    main()

