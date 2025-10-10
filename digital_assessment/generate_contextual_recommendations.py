#!/usr/bin/env python3
"""
Contextual Recommendations Generator - Based on Checklist Detail

Reads the actual Checklist Detail sheet to see which specific criteria (0s vs 1s)
each participant is missing, then generates highly targeted, personalized 
recommendations using AI.

Much more specific than generic score-based recommendations!
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

# Initialize OpenAI client (will be initialized in main if API key is present)
client = None

# Criterion definitions (from updated_scoring.md)
CRITERIA = {
    'social_media': [
        "Has business account on primary platform",
        "Has business account on second platform",
        "Has business account on third platform",
        "Posts monthly in last 6 months",
        "Posts 2x monthly in last 6 months",
        "Posts weekly in last 6 months",
        "Clear, in-focus photos/videos",
        "Shows products/services consistently",
        "Uses platform business features (catalog, shopping, etc.)",
        "Contact info clearly visible in bio/about"
    ],
    'website': [
        "Website exists and loads",
        "Mobile-friendly/responsive",
        "No major usability issues (broken links, images not loading)",
        "Services/products clearly described",
        "Contact information clearly visible",
        "Working contact forms",
        "Content updated within last 6 months",
        "Modern, professional design",
        "Multiple pages (not just homepage)",
        "Links to social media accounts"
    ],
    'visual': [
        "Photos are in focus",
        "Good lighting (not too dark/bright)",
        "Subject is clearly visible",
        "Shows products/services",
        "Behind-the-scenes content",
        "Different angles/perspectives",
        "Consistent style/filter",
        "Good composition (rule of thirds, etc.)",
        "Professional product shots",
        "Video content"
    ],
    'discover': [
        "Appears in Google search for business name",
        "Google My Business listing exists",
        "Listed on one national directory",
        "Appears on first page of results",
        "Google My Business has photos",
        "Listed on multiple national directories",
        "Has customer reviews",
        "5+ reviews total",
        "Responds to reviews",
        "Other websites link to them"
    ],
    'sales': [
        "Contact form on website",
        "WhatsApp Business for orders",
        "Phone number clearly visible",
        "Facebook/Instagram shopping features",
        "WhatsApp catalog",
        "Social media posts include pricing",
        "Mobile money integration",
        "Online payment options",
        "Online booking system",
        "Full e-commerce website"
    ],
    'platform': [
        "Listed on one Gambian platform (AccessGambia, My-Gambia, VisitTheGambia)",
        "Listed on TripAdvisor",
        "Listed on one other platform",
        "Complete profile information",
        "Professional photos uploaded",
        "Contact information provided",
        "Regular updates on platforms",
        "Responds to platform messages",
        "Customer reviews visible",
        "Cross-platform consistency"
    ]
}

# Column mapping (0-based indices in Checklist Detail sheet)
COLUMN_MAP = {
    'social_media': list(range(5, 15)),  # F-O
    'website': list(range(16, 26)),      # Q-Z
    'visual': list(range(27, 37)),       # AB-AK
    'discover': list(range(38, 48)),     # AM-AV
    'sales': list(range(49, 59)),        # AX-BG
    'platform': list(range(60, 70))      # BI-BR
}

def get_sheets_service():
    with open(CREDS_FILE, 'r') as f:
        creds_dict = json.load(f)
    
    credentials = service_account.Credentials.from_service_account_info(
        creds_dict,
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    return build('sheets', 'v4', credentials=credentials)

def read_checklist_detail(service):
    """Read all data from Checklist Detail sheet"""
    result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range='Checklist Detail!A2:BS1000'
    ).execute()
    
    return result.get('values', [])

def get_platform_urls(service, name):
    """Get actual platform URLs from TO/CI Assessment sheets"""
    platforms = {
        'website': '',
        'facebook': '',
        'instagram': '',
        'tripadvisor': '',
        'youtube': '',
        'tiktok': '',
        'facebook_followers': '',
        'instagram_followers': '',
        'tiktok_followers': ''
    }
    
    # Try both assessment sheets
    for sheet_name in ['TO Assessment', 'CI Assessment']:
        try:
            result = service.spreadsheets().values().get(
                spreadsheetId=SHEET_ID,
                range=f'{sheet_name}!A:AN'  # Columns A to AN
            ).execute()
            
            rows = result.get('values', [])
            if not rows:
                continue
            
            # Find the participant
            for row in rows[1:]:  # Skip header
                if row and row[0].strip().lower() == name.lower():
                    # Column indices (0-based)
                    # AD=29 (Website), AE=30 (Facebook), AF=31 (Instagram), 
                    # AG=32 (TripAdvisor), AH=33 (YouTube)
                    # AI=34 (FB Followers), AJ=35 (IG Followers)
                    # AM=38 (TikTok), AN=39 (TikTok Followers)
                    
                    if len(row) > 29 and row[29]:
                        platforms['website'] = str(row[29]).strip()
                    if len(row) > 30 and row[30]:
                        platforms['facebook'] = str(row[30]).strip()
                    if len(row) > 31 and row[31]:
                        platforms['instagram'] = str(row[31]).strip()
                    if len(row) > 32 and row[32]:
                        platforms['tripadvisor'] = str(row[32]).strip()
                    if len(row) > 33 and row[33]:
                        platforms['youtube'] = str(row[33]).strip()
                    if len(row) > 38 and row[38]:
                        platforms['tiktok'] = str(row[38]).strip()
                    
                    # Get follower counts too
                    if len(row) > 34 and row[34]:
                        platforms['facebook_followers'] = str(row[34]).strip()
                    if len(row) > 35 and row[35]:
                        platforms['instagram_followers'] = str(row[35]).strip()
                    if len(row) > 39 and row[39]:
                        platforms['tiktok_followers'] = str(row[39]).strip()
                    
                    return platforms
        except Exception as e:
            continue
    
    return platforms

def get_participant_gaps(row, platforms=None):
    """Identify which specific criteria participant is missing (has 0 instead of 1)"""
    if not row or len(row) < 70:
        return None
    
    name = row[0]
    sector = row[1] if len(row) > 1 else 'Unknown'
    
    gaps = {}
    
    for category, col_indices in COLUMN_MAP.items():
        missing_criteria = []
        for i, col_idx in enumerate(col_indices):
            if col_idx < len(row):
                value = str(row[col_idx]).strip()
                # If it's 0 or empty, they're missing this criterion
                if value in ['0', '']:
                    criterion_text = CRITERIA[category][i]
                    missing_criteria.append({
                        'number': i + 1,
                        'text': criterion_text
                    })
        
        if missing_criteria:
            gaps[category] = missing_criteria
    
    return {
        'name': name,
        'sector': sector,
        'gaps': gaps,
        'platforms': platforms or {}
    }

def generate_recommendation_for_gaps(participant, category, missing_criteria):
    """Generate AI recommendation based on specific missing criteria"""
    
    global client
    if not client:
        return "[API key not set - recommendation generation skipped]"
    
    name = participant['name']
    sector = participant['sector']
    platforms = participant.get('platforms', {})
    
    # Build context about what platforms they HAVE
    platform_context = []
    if platforms.get('website'):
        platform_context.append(f"✓ Website: {platforms['website']}")
    if platforms.get('facebook'):
        followers = platforms.get('facebook_followers', '')
        platform_context.append(f"✓ Facebook: {platforms['facebook']}" + (f" ({followers} followers)" if followers else ""))
    if platforms.get('instagram'):
        followers = platforms.get('instagram_followers', '')
        platform_context.append(f"✓ Instagram: {platforms['instagram']}" + (f" ({followers} followers)" if followers else ""))
    if platforms.get('tiktok'):
        followers = platforms.get('tiktok_followers', '')
        platform_context.append(f"✓ TikTok: {platforms['tiktok']}" + (f" ({followers} followers)" if followers else ""))
    if platforms.get('youtube'):
        platform_context.append(f"✓ YouTube: {platforms['youtube']}")
    if platforms.get('tripadvisor'):
        platform_context.append(f"✓ TripAdvisor: {platforms['tripadvisor']}")
    
    platform_text = "\n".join(platform_context) if platform_context else "No platform URLs found"
    
    # Build context about what they're missing
    missing_list = "\n".join([f"  - {c['text']}" for c in missing_criteria[:5]])  # Top 5 gaps
    missing_count = len(missing_criteria)
    
    category_names = {
        'social_media': 'Social Media',
        'website': 'Website',
        'visual': 'Visual Content',
        'discover': 'Discoverability',
        'sales': 'Digital Sales',
        'platform': 'Platform Integration'
    }
    
    cat_display = category_names[category]
    
    prompt = f"""You are a practical digital consultant helping {name}, a {sector} business in The Gambia.

**What they ALREADY HAVE:**
{platform_text}

**{cat_display} - Missing {missing_count}/10 criteria:**
{missing_list}

Generate a concise, actionable recommendation (2-3 sentences max) that:
1. STARTS with their business name: "{name} should..." or "{name} could..."
2. ACKNOWLEDGES what platforms they already have (don't recommend creating them!)
3. Focuses on USING/IMPROVING existing platforms rather than creating new ones
4. If they lack a platform, only recommend it if it's truly essential for the missing criteria
5. Is specific and practical for The Gambia context (low-cost tools, local resources)
6. Mentions free/affordable tools when relevant (Canva, Buffer, WhatsApp Business, Google My Business, etc.)
7. Be direct and action-focused - NO generic encouragement phrases like "keep up the great work" or "this will make a big impact"

IMPORTANT: 
- If they already have Instagram, don't say "create an Instagram account" - say "post more frequently on Instagram"!
- Focus ONLY on concrete actions they should take
- Skip motivational language - just tell them what to do

Output only the recommendation text."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a supportive digital consultant for Gambian tourism businesses. Give specific, personalized recommendations that start with the business name."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=150
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        print(f"    ⚠️  Error generating recommendation: {e}")
        return None

def update_recommendations_sheet(service, participant, recommendations):
    """Update the Recommendations sheet with generated recommendations"""
    
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
    
    # Calculate scores based on gaps
    def calc_score(category):
        gaps = participant['gaps'].get(category, [])
        return 10 - len(gaps)
    
    # Build the row data
    row_data = [
        participant['name'],
        participant['sector'],
        calc_score('social_media'),
        recommendations.get('social_media', ''),
        calc_score('website'),
        recommendations.get('website', ''),
        calc_score('visual'),
        recommendations.get('visual', ''),
        calc_score('discover'),
        recommendations.get('discover', ''),
        calc_score('sales'),
        recommendations.get('sales', ''),
        calc_score('platform'),
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

def test_mode(service, test_names):
    """Test mode - generate recommendations for specific participants"""
    print("\n" + "="*80)
    print(f"TEST MODE - Generating recommendations for {len(test_names)} participant(s)")
    print("="*80 + "\n")
    
    rows = read_checklist_detail(service)
    
    for test_name in test_names:
        print(f"\n{'='*80}")
        print(f"TESTING: {test_name}")
        print(f"{'='*80}")
        
        # Find the participant
        row_found = None
        for row in rows:
            if row and row[0].strip().lower() == test_name.lower():
                row_found = row
                break
        
        if not row_found:
            print(f"❌ Participant '{test_name}' not found in Checklist Detail")
            continue
        
        # Get their platform URLs
        print(f"\n🔍 Reading platform URLs from assessment sheets...")
        platforms = get_platform_urls(service, test_name)
        
        # Get gaps
        participant = get_participant_gaps(row_found, platforms)
        if not participant or not participant['gaps']:
            print(f"✓ No gaps found - {test_name} has perfect scores!")
            continue
        
        print(f"\n📊 Sector: {participant['sector']}")
        
        # Show what platforms they have
        print(f"\n✅ Existing Platforms:")
        has_platforms = False
        if platforms.get('website'):
            print(f"   • Website: {platforms['website']}")
            has_platforms = True
        if platforms.get('facebook'):
            followers = f" ({platforms.get('facebook_followers')} followers)" if platforms.get('facebook_followers') else ""
            print(f"   • Facebook: {platforms['facebook']}{followers}")
            has_platforms = True
        if platforms.get('instagram'):
            followers = f" ({platforms.get('instagram_followers')} followers)" if platforms.get('instagram_followers') else ""
            print(f"   • Instagram: {platforms['instagram']}{followers}")
            has_platforms = True
        if platforms.get('tiktok'):
            followers = f" ({platforms.get('tiktok_followers')} followers)" if platforms.get('tiktok_followers') else ""
            print(f"   • TikTok: {platforms['tiktok']}{followers}")
            has_platforms = True
        if platforms.get('youtube'):
            print(f"   • YouTube: {platforms['youtube']}")
            has_platforms = True
        if platforms.get('tripadvisor'):
            print(f"   • TripAdvisor: {platforms['tripadvisor']}")
            has_platforms = True
        
        if not has_platforms:
            print(f"   (No platform URLs found in assessment)")
        
        print(f"\n🔍 Missing Criteria by Category:\n")
        
        for category, missing in participant['gaps'].items():
            cat_display = category.replace('_', ' ').title()
            print(f"  {cat_display}: Missing {len(missing)}/10")
            for criterion in missing[:3]:  # Show first 3
                print(f"    • {criterion['text']}")
            if len(missing) > 3:
                print(f"    ... and {len(missing) - 3} more")
            print()
        
        print(f"{'~'*80}")
        print("GENERATED RECOMMENDATIONS:")
        print(f"{'~'*80}\n")
        
        # Generate recommendations for each category with gaps
        recommendations = {}
        for category, missing in participant['gaps'].items():
            cat_display = category.replace('_', ' ').title()
            print(f"📌 {cat_display}:")
            
            rec = generate_recommendation_for_gaps(participant, category, missing)
            if rec:
                recommendations[category] = rec
                print(f"   {rec}\n")
                time.sleep(0.5)
            else:
                print(f"   ⚠️ Failed to generate recommendation\n")
        
        # Update sheet
        if recommendations:
            try:
                update_recommendations_sheet(service, participant, recommendations)
                print(f"✅ Updated Recommendations sheet for {test_name}")
            except Exception as e:
                print(f"❌ Error updating sheet: {e}")
        
        print(f"\n{'='*80}\n")
        time.sleep(1)
    
    print("\n✅ Test complete!")

def batch_mode(service, start_idx=1, count=20):
    """Process a batch of participants"""
    print("\n" + "="*80)
    print(f"BATCH MODE - Processing {count} participants starting from #{start_idx}")
    print("="*80 + "\n")
    
    rows = read_checklist_detail(service)
    
    # Skip header row (index 0), then get the batch
    end_idx = start_idx + count
    batch_rows = rows[start_idx:end_idx]
    
    print(f"📊 Found {len(rows)} total participants in Checklist Detail")
    print(f"🎯 Processing batch: #{start_idx} to #{end_idx-1}\n")
    
    successful = 0
    skipped = 0
    errors = 0
    
    for idx, row in enumerate(batch_rows, start_idx):
        if not row or not row[0]:
            continue
        
        name = row[0]
        print(f"\n[{idx}/{len(rows)}] {name}")
        
        # Get platform URLs
        platforms = get_platform_urls(service, name)
        
        # Get gaps
        participant = get_participant_gaps(row, platforms)
        
        if not participant or not participant['gaps']:
            print(f"  ✓ No gaps - perfect scores!")
            skipped += 1
            continue
        
        # Show brief summary
        sector = participant['sector']
        gap_count = sum(len(gaps) for gaps in participant['gaps'].values())
        print(f"  Sector: {sector} | {len(participant['gaps'])} categories with gaps ({gap_count} total)")
        
        # Generate recommendations
        recommendations = {}
        for category, missing in participant['gaps'].items():
            rec = generate_recommendation_for_gaps(participant, category, missing)
            if rec and not rec.startswith("[API key"):
                recommendations[category] = rec
            time.sleep(0.5)  # Rate limiting
        
        # Update sheet
        if recommendations:
            try:
                update_recommendations_sheet(service, participant, recommendations)
                print(f"  ✅ Generated {len(recommendations)} recommendations")
                successful += 1
            except Exception as e:
                print(f"  ❌ Error updating sheet: {e}")
                errors += 1
        
        time.sleep(0.5)  # Additional rate limiting between participants
    
    print("\n" + "="*80)
    print("BATCH COMPLETE!")
    print("="*80)
    print(f"✅ Successful: {successful}")
    print(f"⏭️  Skipped (no gaps): {skipped}")
    print(f"❌ Errors: {errors}")
    print(f"\nNext batch would start at: #{end_idx}")
    print("="*80 + "\n")

def main():
    import sys
    global client
    
    print("="*80)
    print("CONTEXTUAL RECOMMENDATIONS GENERATOR")
    print("Based on Checklist Detail Gaps")
    print("="*80 + "\n")
    
    # Check for API key and initialize client
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ ERROR: OPENAI_API_KEY environment variable not set")
        print("\nTo set it up:")
        print("  export OPENAI_API_KEY='your-api-key-here'")
        print("\nOr add it to your shell profile (~/.zshrc or ~/.bash_profile):")
        print("  echo 'export OPENAI_API_KEY=\"your-api-key\"' >> ~/.zshrc")
        return
    
    client = OpenAI(api_key=api_key)
    
    service = get_sheets_service()
    
    # Check for test mode
    if '--test' in sys.argv:
        # Get test participant names
        test_idx = sys.argv.index('--test')
        if len(sys.argv) > test_idx + 1:
            test_names = sys.argv[test_idx + 1:]
            test_mode(service, test_names)
        else:
            print("❌ Please provide participant names after --test")
            print("Example: python3 generate_contextual_recommendations.py --test \"African Adventure Tours\"")
        return
    
    # Check for batch mode
    if '--batch' in sys.argv:
        batch_idx = sys.argv.index('--batch')
        start = 1
        count = 20
        
        # Get start index if provided
        if len(sys.argv) > batch_idx + 1:
            try:
                start = int(sys.argv[batch_idx + 1])
            except:
                pass
        
        # Get count if provided
        if len(sys.argv) > batch_idx + 2:
            try:
                count = int(sys.argv[batch_idx + 2])
            except:
                pass
        
        batch_mode(service, start, count)
        return
    
    print("Usage:")
    print("  Test mode:   python3 generate_contextual_recommendations.py --test \"Participant Name\"")
    print("  Batch mode:  python3 generate_contextual_recommendations.py --batch [start] [count]")
    print("               Example: --batch 1 20  (process first 20)")
    print("               Example: --batch 21 20 (process next 20)")
    print("\nStart with --test to try 1-2 participants first!")

if __name__ == '__main__':
    main()

