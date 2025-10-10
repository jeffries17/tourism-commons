#!/usr/bin/env python3
"""
Clear and Rebuild Checklist Detail
Clears the problematic data and rebuilds it correctly
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

def clear_and_rebuild():
    """Clear problematic data and rebuild correctly"""
    print("=" * 80)
    print("CLEARING AND REBUILDING CHECKLIST DETAIL")
    print("=" * 80)
    print()
    
    # Clear rows 4-24 (tour operators)
    print("Clearing rows 4-24...")
    service.spreadsheets().values().clear(
        spreadsheetId=SHEET_ID,
        range='Checklist Detail!A4:BW24'
    ).execute()
    
    print("✅ Cleared problematic data")
    print()
    print("Now you can:")
    print("1. Manually enter the correct data")
    print("2. Or run a corrected automated script")
    print()
    print("The correct format should be:")
    print("  • Social Media (F-O): 0,0,0,0,0,0,0,0,0,0")
    print("  • Website (Q-Z): 1,1,1,0,0,1,0,0,0,0 (actual values)")
    print("  • Visual Content (AB-AK): 0,0,0,0,0,0,0,0,0,0")
    print("  • Discoverability (AM-AV): 1,0,1,1,0,0,0,0,0,0 (actual values)")
    print("  • Digital Sales (AX-BG): 0,0,0,0,0,0,0,0,0,0")
    print("  • Platform Integration (BI-BR): 0,0,0,0,0,0,0,0,0,0")
    print()
    print("All values should be 0 or 1 (binary), not empty strings or text")

if __name__ == '__main__':
    clear_and_rebuild()
