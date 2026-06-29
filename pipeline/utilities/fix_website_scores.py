#!/usr/bin/env python3
"""
Fix website scores for entities without URLs
Sets all website scores to 0 where website URL is empty
"""
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
import csv
from datetime import datetime

SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
DRY_RUN = True  # Set to False to actually make changes

creds = Credentials.from_service_account_file(
    '../tourism-development-d620c-5c9db9e21301.json', 
    scopes=['https://www.googleapis.com/auth/spreadsheets']
)
service = build('sheets', 'v4', credentials=creds)

def get_sheet_data(sheet_name, range_spec):
    """Fetch data from a specific sheet"""
    try:
        result = service.spreadsheets().values().get(
            spreadsheetId=SHEET_ID, 
            range=f'{sheet_name}!{range_spec}'
        ).execute()
        return result.get('values', [])
    except Exception as e:
        print(f"Error fetching {sheet_name}: {e}")
        return []

def update_cell(sheet_name, cell_range, value):
    """Update a single cell"""
    if DRY_RUN:
        print(f"      [DRY RUN] Would update {sheet_name}!{cell_range} to {value}")
        return True
    
    try:
        service.spreadsheets().values().update(
            spreadsheetId=SHEET_ID,
            range=f'{sheet_name}!{cell_range}',
            valueInputOption='RAW',
            body={'values': [[value]]}
        ).execute()
        return True
    except Exception as e:
        print(f"      Error updating {cell_range}: {e}")
        return False

def batch_update_cells(sheet_name, updates):
    """Update multiple cells at once"""
    if DRY_RUN:
        print(f"      [DRY RUN] Would batch update {len(updates)} cells in {sheet_name}")
        for update in updates[:3]:  # Show first 3 as examples
            print(f"        {update['range']}: {update['values'][0][0]}")
        if len(updates) > 3:
            print(f"        ... and {len(updates)-3} more")
        return True
    
    try:
        body = {
            'valueInputOption': 'RAW',
            'data': [{'range': f"{sheet_name}!{u['range']}", 'values': u['values']} for u in updates]
        }
        service.spreadsheets().values().batchUpdate(
            spreadsheetId=SHEET_ID,
            body=body
        ).execute()
        return True
    except Exception as e:
        print(f"      Error in batch update: {e}")
        return False

def fix_assessment_sheet(sheet_name, is_regional=False):
    """Fix website scores in assessment sheet"""
    print(f"\n{'='*80}")
    print(f"FIXING: {sheet_name}")
    print('='*80)
    
    rows = get_sheet_data(sheet_name, 'A:AC')
    if not rows:
        print(f"  No data found in {sheet_name}")
        return []
    
    fixes = []
    
    # Column indices
    name_col = 0
    website_score_col = 4
    website_url_col = 23
    
    print(f"\n  Processing {len(rows)-1} rows...")
    
    for i, row in enumerate(rows[1:], start=2):
        if not row or len(row) == 0:
            continue
        
        name = row[name_col].strip() if len(row) > name_col and row[name_col] else ""
        if not name:
            continue
        
        # Get website score and URL
        try:
            website_score = float(row[website_score_col]) if len(row) > website_score_col and row[website_score_col] else 0
        except (ValueError, TypeError):
            website_score = 0
        
        website_url = row[website_url_col].strip() if len(row) > website_url_col and row[website_url_col] else ""
        
        # Fix if score > 0 but no URL
        if website_score > 0 and not website_url:
            print(f"\n  📝 Row {i}: {name}")
            print(f"      Current score: {website_score}/10 → Will set to 0")
            
            # Update the score in the assessment sheet (column E)
            col_letter = chr(65 + website_score_col)  # E
            cell_range = f"{col_letter}{i}"
            
            if update_cell(sheet_name, cell_range, 0):
                fixes.append({
                    'sheet': sheet_name,
                    'row': i,
                    'name': name,
                    'old_score': website_score,
                    'new_score': 0
                })
    
    print(f"\n  Fixed: {len(fixes)} entities")
    return fixes

def fix_checklist_detail(entities_to_fix):
    """Fix detailed website criteria scores in Checklist Detail sheets"""
    print(f"\n{'='*80}")
    print(f"FIXING: Checklist Detail sheets")
    print('='*80)
    
    # Process CI entities
    ci_entities = [e for e in entities_to_fix if 'CI Assessment' in e['sheet'] or 'TO Assessment' in e['sheet']]
    if ci_entities:
        print(f"\n  Processing {len(ci_entities)} Gambia entities in Checklist Detail...")
        fix_checklist_detail_sheet('Checklist Detail', ci_entities)
    
    # Process Regional entities
    regional_entities = [e for e in entities_to_fix if 'Regional' in e['sheet']]
    if regional_entities:
        print(f"\n  Processing {len(regional_entities)} regional entities in Regional Checklist Detail...")
        fix_checklist_detail_sheet('Regional Checklist Detail', regional_entities)

def fix_checklist_detail_sheet(sheet_name, entities):
    """Fix a specific checklist detail sheet"""
    rows = get_sheet_data(sheet_name, 'A:BS')
    if not rows:
        print(f"    No data found in {sheet_name}")
        return
    
    for entity in entities:
        name = entity['name']
        
        # Find the row for this entity
        row_num = None
        for i, row in enumerate(rows[1:], start=2):
            if row and len(row) > 0 and row[0].strip().lower() == name.lower():
                row_num = i
                break
        
        if not row_num:
            print(f"    ⚠️  Could not find {name} in {sheet_name}")
            continue
        
        print(f"\n    📝 {name} (row {row_num})")
        
        # Zero out all 10 website criteria (columns Q-Z, indices 16-25)
        # Column Q = index 16, Z = index 25, AA = index 26 (total)
        updates = []
        for col_idx in range(16, 27):  # 16-26 inclusive (Q through AA)
            if col_idx < 26:
                col_letter = chr(65 + col_idx)  # Q through Z
            else:
                col_letter = chr(65) + chr(65)  # AA
            
            updates.append({
                'range': f"{col_letter}{row_num}",
                'values': [[0]]
            })
        
        # Batch update all criteria at once
        batch_update_cells(sheet_name, updates)

# Main execution
print("\n" + "="*80)
print("WEBSITE SCORE FIX SCRIPT")
print(f"Mode: {'DRY RUN (no changes will be made)' if DRY_RUN else 'LIVE (will make actual changes)'}")
print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("="*80)

if DRY_RUN:
    print("\n⚠️  DRY RUN MODE: No actual changes will be made to the spreadsheet")
    print("    Set DRY_RUN = False in the script to make real changes\n")
else:
    print("\n🔴 LIVE MODE: Changes WILL be written to the spreadsheet!")
    print("    Backing up current state...\n")
    # TODO: Add backup functionality here

all_fixes = []

# Fix Assessment sheets (scores visible in dashboard)
all_fixes.extend(fix_assessment_sheet('CI Assessment', is_regional=False))
all_fixes.extend(fix_assessment_sheet('TO Assessment', is_regional=False))
all_fixes.extend(fix_assessment_sheet('Regional Assessment', is_regional=True))

# Fix Checklist Detail sheets (individual criteria)
fix_checklist_detail(all_fixes)

# Summary
print("\n" + "="*80)
print("SUMMARY")
print("="*80)
print(f"\nTotal entities fixed: {len(all_fixes)}")

if DRY_RUN:
    print("\n✅ Dry run completed successfully!")
    print("   Review the output above. If it looks correct, set DRY_RUN = False and run again.")
else:
    print("\n✅ Fix completed successfully!")
    print("   All website scores have been zeroed out for entities without URLs.")

# Save fix log
output_file = f'outputs/website_score_fixes_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
with open(output_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['sheet', 'row', 'name', 'old_score', 'new_score'])
    writer.writeheader()
    writer.writerows(all_fixes)

print(f"\n📄 Fix log saved to: {output_file}")

print("\n" + "="*80)
print("NEXT STEPS:")
print("="*80)
print("""
1. Review the changes in the CSV log
2. If DRY RUN: Set DRY_RUN = False and run again to apply changes
3. After applying changes:
   - Regenerate dashboard data
   - Verify changes in Google Sheets
   - Update any cached/exported data files
4. Consider adding validation rules to prevent this in future
""")

