#!/usr/bin/env python3
"""
Add Regional Tours to ITO Tour Analysis Sheet
Simple script to add tour URLs for regional destinations (Senegal, Ghana, etc.)
"""

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from datetime import datetime

SPREADSHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
SHEET_NAME = 'ITO Tour Analysis'


def get_sheets_service():
    """Initialize Google Sheets API"""
    SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
    creds = Credentials.from_service_account_file(
        '../tourism-development-d620c-5c9db9e21301.json',
        scopes=SCOPES
    )
    return build('sheets', 'v4', credentials=creds)


def add_tour_to_sheet(service, operator, operator_country, destination_country, page_type, url):
    """Add a tour URL to the sheet with pending status"""
    
    row_data = [
        operator,
        operator_country,
        destination_country,
        page_type,
        url,
        '⏳ Pending',  # Scraping status
        '',  # Word count (empty until scraped)
        '',  # Sentiment
        '',  # Creative score
        '', '', '',  # Themes
        '',  # Destination %
        '',  # Packaging
        '', '', '', '', '', '', '', '', '', '',  # Sector scores (empty)
        '', '', '', '', '', '', '', '',  # Sector justifications
        '',  # Best cultural quote
        datetime.now().strftime('%Y-%m-%d')
    ]
    
    # Append to sheet
    service.spreadsheets().values().append(
        spreadsheetId=SPREADSHEET_ID,
        range=f'{SHEET_NAME}!A2',
        valueInputOption='RAW',
        insertDataOption='INSERT_ROWS',
        body={'values': [row_data]}
    ).execute()
    
    print(f"  ✅ Added: {operator} - {destination_country} - {page_type}")


def main():
    print("="*80)
    print("ADD REGIONAL TOURS TO SHEET")
    print("="*80)
    print()
    print("This script adds tour URLs to the 'ITO Tour Analysis' sheet.")
    print("After adding URLs, run 'run_ito_tour_level_analysis.py' to scrape & analyze.")
    print()
    print("Available destinations:")
    print("  • Senegal")
    print("  • Cape Verde")
    print("  • Ghana")
    print("  • Nigeria")
    print("  • Benin")
    print("  • Gambia")
    print()
    
    service = get_sheets_service()
    
    tours = []
    
    while True:
        print("-" * 80)
        operator = input("Operator name (or 'done' to finish): ").strip()
        
        if operator.lower() == 'done':
            break
        
        if not operator:
            continue
        
        operator_country = input("  Operator country (e.g., UK, USA, Germany): ").strip()
        destination = input("  Destination country (e.g., Senegal, Ghana): ").strip()
        
        page_type_choice = input("  Page type (1=Destination Page, 2=Tour/Itinerary): ").strip()
        page_type = 'Destination Page' if page_type_choice == '1' else 'Tour/Itinerary'
        
        url = input("  URL: ").strip()
        
        if not url:
            print("  ⚠️  No URL provided, skipping...")
            continue
        
        tours.append({
            'operator': operator,
            'operator_country': operator_country,
            'destination': destination,
            'page_type': page_type,
            'url': url
        })
        
        print(f"  📋 Queued: {operator} - {destination}")
        print()
    
    if not tours:
        print("No tours to add. Exiting.")
        return
    
    print()
    print("="*80)
    print(f"ADDING {len(tours)} TOURS TO SHEET")
    print("="*80)
    print()
    
    for tour in tours:
        add_tour_to_sheet(
            service,
            tour['operator'],
            tour['operator_country'],
            tour['destination'],
            tour['page_type'],
            tour['url']
        )
    
    print()
    print("="*80)
    print("✅ ALL TOURS ADDED")
    print("="*80)
    print()
    print(f"Added {len(tours)} tours to '{SHEET_NAME}' sheet")
    print()
    print("NEXT STEPS:")
    print("1. Review the sheet to verify URLs are correct")
    print("2. Run: python3 run_ito_tour_level_analysis.py")
    print("3. Select option to scrape & analyze the pending tours")
    print()


if __name__ == '__main__':
    main()

