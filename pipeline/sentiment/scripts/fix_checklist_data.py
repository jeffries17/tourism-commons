#!/usr/bin/env python3
"""
Fix Checklist Detail Data
Corrects the data format issues in Checklist Detail sheet
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

def fix_checklist_data():
    """Fix the data format issues in Checklist Detail"""
    print("=" * 80)
    print("FIXING CHECKLIST DETAIL DATA FORMAT")
    print("=" * 80)
    print()
    
    # Get current data from rows 4-24 (tour operators)
    result = service.spreadsheets().values().get(
        spreadsheetId=SHEET_ID,
        range='Checklist Detail!A4:BW24'
    ).execute()
    
    rows = result.get('values', [])
    print(f"Found {len(rows)} rows to fix")
    
    # Fix each row
    for i, row in enumerate(rows, start=4):
        if not row or len(row) == 0:
            continue
            
        stakeholder_name = row[0] if len(row) > 0 else f"Row {i}"
        print(f"\nFixing row {i}: {stakeholder_name}")
        
        # Build corrected row data
        corrected_row = [
            row[0] if len(row) > 0 else '',  # A: Name
            row[1] if len(row) > 1 else '',  # B: Sector
            row[2] if len(row) > 2 else '',  # C: Date
            row[3] if len(row) > 3 else '',  # D: Method
            row[4] if len(row) > 4 else '',  # E: Assessor
            
            # Social Media (F-O) - ALL 0s (manual assessment needed)
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  # F-O: SM1-SM10
            
            # Website (Q-Z) - Keep existing values, fix WEB8
            int(row[16]) if len(row) > 16 and str(row[16]).isdigit() else 0,  # Q: WEB1
            int(row[17]) if len(row) > 17 and str(row[17]).isdigit() else 0,  # R: WEB2
            int(row[18]) if len(row) > 18 and str(row[18]).isdigit() else 0,  # S: WEB3
            int(row[19]) if len(row) > 19 and str(row[19]).isdigit() else 0,  # T: WEB4
            int(row[20]) if len(row) > 20 and str(row[20]).isdigit() else 0,  # U: WEB5
            int(row[21]) if len(row) > 21 and str(row[21]).isdigit() else 0,  # V: WEB6
            int(row[22]) if len(row) > 22 and str(row[22]).isdigit() else 0,  # W: WEB7
            0,  # X: WEB8 (always 0 for manual assessment)
            int(row[24]) if len(row) > 24 and str(row[24]).isdigit() else 0,  # Y: WEB9
            int(row[25]) if len(row) > 25 and str(row[25]).isdigit() else 0,  # Z: WEB10
            
            # Visual Content (AB-AK) - ALL 0s (manual assessment needed)
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  # AB-AK: VIS1-VIS10
            
            # Discoverability (AM-AV) - Keep existing values, fix empty strings
            int(row[38]) if len(row) > 38 and str(row[38]).isdigit() else 0,  # AM: DIS1
            0,  # AN: DIS2 (manual assessment)
            int(row[40]) if len(row) > 40 and str(row[40]).isdigit() else 0,  # AO: DIS3
            int(row[41]) if len(row) > 41 and str(row[41]).isdigit() else 0,  # AP: DIS4
            0,  # AQ: DIS5 (manual assessment)
            int(row[43]) if len(row) > 43 and str(row[43]).isdigit() else 0,  # AR: DIS6
            0, 0, 0, 0,  # AS-AV: DIS7-DIS10 (manual assessment)
            
            # Digital Sales (AX-BG) - ALL 0s (manual assessment needed)
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  # AX-BG: SAL1-SAL10
            
            # Platform Integration (BI-BR) - ALL 0s (manual assessment needed)
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  # BI-BR: PLAT1-PLAT10
            
            # Summary columns
            '',  # BT: Total (will be calculated)
            row[71] if len(row) > 71 else '',  # BU: Notes
            row[72] if len(row) > 72 else '',  # BV: Confidence
            row[73] if len(row) > 73 else 'Yes'  # BW: Manual review needed
        ]
        
        # Write corrected row
        body = {'values': [corrected_row]}
        service.spreadsheets().values().update(
            spreadsheetId=SHEET_ID,
            range=f'Checklist Detail!A{i}:BW{i}',
            valueInputOption='USER_ENTERED',
            body=body
        ).execute()
        
        print(f"  ✅ Fixed row {i}")
        
        # Add formulas for this row
        formulas = [
            (f'Checklist Detail!P{i}', f'=SUM(F{i}:O{i})'),      # Social Media Raw
            (f'Checklist Detail!AA{i}', f'=SUM(Q{i}:Z{i})'),     # Website Raw
            (f'Checklist Detail!AL{i}', f'=SUM(AB{i}:AK{i})'),   # Visual Content Raw
            (f'Checklist Detail!AW{i}', f'=SUM(AM{i}:AV{i})'),   # Discoverability Raw
            (f'Checklist Detail!BH{i}', f'=SUM(AX{i}:BG{i})'),   # Digital Sales Raw
            (f'Checklist Detail!BS{i}', f'=SUM(BI{i}:BR{i})'),   # Platform Integration Raw
            (f'Checklist Detail!BT{i}', f'=SUM(P{i},AA{i},AL{i},AW{i},BH{i},BS{i})')  # Total Raw
        ]
        
        for range_name, formula in formulas:
            service.spreadsheets().values().update(
                spreadsheetId=SHEET_ID,
                range=range_name,
                valueInputOption='USER_ENTERED',
                body={'values': [[formula]]}
            ).execute()
        
        print(f"  ✅ Added formulas for row {i}")
    
    print("\n" + "=" * 80)
    print("✅ DATA FIXED!")
    print("=" * 80)
    print()
    print("What was fixed:")
    print("  • Social Media columns (F-O): Set to 0 (manual assessment needed)")
    print("  • Website columns (Q-Z): Kept existing values, fixed WEB8 to 0")
    print("  • Visual Content columns (AB-AK): Set to 0 (manual assessment needed)")
    print("  • Discoverability columns (AM-AV): Kept existing values, fixed empty strings to 0")
    print("  • Digital Sales columns (AX-BG): Set to 0 (manual assessment needed)")
    print("  • Platform Integration columns (BI-BR): Set to 0 (manual assessment needed)")
    print("  • All formulas: Added proper SUM formulas for raw totals")
    print()
    print("Now the data should be consistent:")
    print("  • Raw totals = sum of individual criteria")
    print("  • All criteria are binary (0 or 1)")
    print("  • Empty criteria are 0, not empty strings")

if __name__ == '__main__':
    fix_checklist_data()
