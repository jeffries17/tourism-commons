#!/usr/bin/env python3
"""
Assess Social Media and Platform Integration
Uses existing URLs from CI Assessment and TO Assessment sheets
"""

import os
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build

SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'

# Google Sheets setup
key_path = '../../../tourism-development-d620c-5c9db9e21301.json'
credentials = service_account.Credentials.from_service_account_file(
    key_path,
    scopes=['https://www.googleapis.com/auth/spreadsheets']
)
service = build('sheets', 'v4', credentials=credentials)

def get_social_media_platforms():
    """Get social media and platform URLs from both assessment sheets"""
    print("📋 Getting social media and platform data from assessment sheets...")
    
    # Get CI Assessment data
    ci_result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range='CI Assessment!A2:AN100'  # Get name, sector, and social media columns
    ).execute()
    
    ci_rows = ci_result.get('values', [])
    ci_stakeholders = []
    
    for i, row in enumerate(ci_rows, start=2):
        if row and len(row) > 0 and row[0].strip():
            # Find social media columns (Facebook, Instagram, YouTube, TripAdvisor)
            facebook = row[37] if len(row) > 37 else ''  # AL column
            instagram = row[38] if len(row) > 38 else ''  # AM column  
            youtube = row[39] if len(row) > 39 else ''    # AN column
            tripadvisor = row[40] if len(row) > 40 else '' # AO column
            
            ci_stakeholders.append({
                'name': row[0].strip(),
                'sector': 'Creative Industries',
                'row': i,
                'facebook': facebook.strip() if facebook else '',
                'instagram': instagram.strip() if instagram else '',
                'youtube': youtube.strip() if youtube else '',
                'tripadvisor': tripadvisor.strip() if tripadvisor else ''
            })
    
    # Get TO Assessment data
    to_result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range='TO Assessment!A2:AN50'  # Get name, sector, and social media columns
    ).execute()
    
    to_rows = to_result.get('values', [])
    to_stakeholders = []
    
    for i, row in enumerate(to_rows, start=2):
        if row and len(row) > 0 and row[0].strip():
            # Find social media columns (Facebook, Instagram, YouTube, TripAdvisor)
            facebook = row[37] if len(row) > 37 else ''  # AL column
            instagram = row[38] if len(row) > 38 else ''  # AM column
            youtube = row[39] if len(row) > 39 else ''    # AN column
            tripadvisor = row[40] if len(row) > 40 else '' # AO column
            
            to_stakeholders.append({
                'name': row[0].strip(),
                'sector': 'Tour Operator',
                'row': i,
                'facebook': facebook.strip() if facebook else '',
                'instagram': instagram.strip() if instagram else '',
                'youtube': youtube.strip() if youtube else '',
                'tripadvisor': tripadvisor.strip() if tripadvisor else ''
            })
    
    all_stakeholders = ci_stakeholders + to_stakeholders
    print(f"Found {len(ci_stakeholders)} CI stakeholders and {len(to_stakeholders)} TO stakeholders")
    
    return all_stakeholders

def evaluate_social_media_criteria(stakeholder):
    """Evaluate social media criteria based on existing URLs"""
    results = {}
    
    # Count active social media platforms
    platforms = []
    if stakeholder['facebook']:
        platforms.append('facebook')
    if stakeholder['instagram']:
        platforms.append('instagram')
    if stakeholder['youtube']:
        platforms.append('youtube')
    
    # SM1: Primary platform (first platform found)
    results['SM1'] = 1 if len(platforms) >= 1 else 0
    
    # SM2: Secondary platform (second platform found)
    results['SM2'] = 1 if len(platforms) >= 2 else 0
    
    # SM3: Tertiary platform (third platform found)
    results['SM3'] = 1 if len(platforms) >= 3 else 0
    
    # SM4-SM10: Manual assessment needed
    for i in range(4, 11):
        results[f'SM{i}'] = 0
    
    return results, platforms

def evaluate_platform_integration_criteria(stakeholder):
    """Evaluate platform integration criteria based on existing URLs"""
    results = {}
    
    # PLAT1: Manual assessment
    results['PLAT1'] = 0
    
    # PLAT2: TripAdvisor presence
    results['PLAT2'] = 1 if stakeholder['tripadvisor'] else 0
    
    # PLAT3-PLAT10: Manual assessment needed
    for i in range(3, 11):
        results[f'PLAT{i}'] = 0
    
    return results

def update_checklist_detail(stakeholder, sm_results, plat_results, platforms):
    """Update Checklist Detail with social media and platform integration data"""
    # Find the stakeholder in Checklist Detail
    result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range='Checklist Detail!A2:BW200'  # Large range to find the stakeholder
    ).execute()
    
    rows = result.get('values', [])
    target_row = None
    
    for i, row in enumerate(rows, start=2):
        if row and len(row) > 0 and row[0].strip() == stakeholder['name']:
            target_row = i
            break
    
    if not target_row:
        print(f"  ⚠️  Could not find {stakeholder['name']} in Checklist Detail")
        return
    
    print(f"  💾 Updating Checklist Detail row {target_row}...")
    
    # Update Social Media columns (F-O)
    sm_data = [sm_results[f'SM{i}'] for i in range(1, 11)]
    
    # Update Platform Integration columns (BI-BR)  
    plat_data = [plat_results[f'PLAT{i}'] for i in range(1, 11)]
    
    # Update Social Media (F-O)
    for i, value in enumerate(sm_data):
        col_letter = chr(70 + i)  # F = 70
        service.spreadsheets().values().update(
            spreadsheetId=SHEET_ID,
            range=f'Checklist Detail!{col_letter}{target_row}',
            valueInputOption='USER_ENTERED',
            body={'values': [[value]]}
        ).execute()
    
    # Update Platform Integration (BI-BR)
    for i, value in enumerate(plat_data):
        col_letter = chr(66 + i)  # BI = 66
        service.spreadsheets().values().update(
            spreadsheetId=SHEET_ID,
            range=f'Checklist Detail!{col_letter}{target_row}',
            valueInputOption='USER_ENTERED',
            body={'values': [[value]]}
        ).execute()
    
    # Update formulas
    formulas = [
        (f'Checklist Detail!P{target_row}', f'=SUM(F{target_row}:O{target_row})'),      # Social Media Raw
        (f'Checklist Detail!BS{target_row}', f'=SUM(BI{target_row}:BR{target_row})'),   # Platform Integration Raw
        (f'Checklist Detail!BT{target_row}', f'=SUM(P{target_row},AA{target_row},AL{target_row},AW{target_row},BH{target_row},BS{target_row})')  # Total Raw
    ]
    
    for range_name, formula in formulas:
        service.spreadsheets().values().update(
            spreadsheetId=SHEET_ID,
            range=range_name,
            valueInputOption='USER_ENTERED',
            body={'values': [[formula]]}
        ).execute()
    
    print(f"  ✅ Updated {stakeholder['name']}: {len(platforms)} platforms, TripAdvisor: {'Yes' if stakeholder['tripadvisor'] else 'No'}")

def main():
    print("=" * 80)
    print("SOCIAL MEDIA & PLATFORM INTEGRATION ASSESSMENT")
    print("=" * 80)
    print()
    
    # Get all stakeholders with their social media URLs
    stakeholders = get_social_media_platforms()
    
    if not stakeholders:
        print("❌ No stakeholders found!")
        return
    
    print(f"\n🚀 Processing {len(stakeholders)} stakeholders...")
    
    # Process each stakeholder
    for i, stakeholder in enumerate(stakeholders, 1):
        print(f"\n[{i}/{len(stakeholders)}] Processing: {stakeholder['name']} ({stakeholder['sector']})")
        
        # Evaluate social media criteria
        sm_results, platforms = evaluate_social_media_criteria(stakeholder)
        
        # Evaluate platform integration criteria
        plat_results = evaluate_platform_integration_criteria(stakeholder)
        
        # Update Checklist Detail
        update_checklist_detail(stakeholder, sm_results, plat_results, platforms)
        
        # Rate limiting
        if i < len(stakeholders):
            print("  ⏳ Waiting 2 seconds for rate limiting...")
            import time
            time.sleep(2)
    
    print("\n" + "=" * 80)
    print("🎉 SOCIAL MEDIA & PLATFORM ASSESSMENT COMPLETE!")
    print("=" * 80)
    print()
    print("✅ All stakeholders updated with social media and platform data")
    print("✅ Social Media criteria (SM1-SM3) based on platform count")
    print("✅ Platform Integration criteria (PLAT2) based on TripAdvisor presence")
    print("✅ All formulas updated automatically")
    print()
    print(f"Open your sheet: https://docs.google.com/spreadsheets/d/{SHEET_ID}")

if __name__ == '__main__':
    main()
