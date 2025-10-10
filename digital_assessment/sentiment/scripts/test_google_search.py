#!/usr/bin/env python3
"""
Quick test of Google Custom Search API
Run this to verify your API credentials work
"""

import os
import requests
import json

def test_google_search():
    print("=" * 80)
    print("GOOGLE CUSTOM SEARCH API TEST")
    print("=" * 80)
    print()
    
    # Get credentials from environment
    api_key = os.environ.get('GOOGLE_API_KEY')
    search_engine_id = os.environ.get('GOOGLE_SEARCH_ENGINE_ID')
    
    if not api_key:
        print("❌ GOOGLE_API_KEY not set!")
        print("   Set it with: export GOOGLE_API_KEY='your-api-key'")
        return False
        
    if not search_engine_id:
        print("❌ GOOGLE_SEARCH_ENGINE_ID not set!")
        print("   Set it with: export GOOGLE_SEARCH_ENGINE_ID='your-search-engine-id'")
        return False
    
    print(f"✅ API Key: {api_key[:10]}...")
    print(f"✅ Search Engine ID: {search_engine_id}")
    print()
    
    # Test search
    print("🔍 Testing search for 'West African Tours Gambia'...")
    
    try:
        url = "https://www.googleapis.com/customsearch/v1"
        params = {
            'key': api_key,
            'cx': search_engine_id,
            'q': 'West African Tours Gambia',
            'num': 5
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            items = data.get('items', [])
            
            print(f"✅ SUCCESS! Found {len(items)} results")
            print()
            
            for i, item in enumerate(items, 1):
                title = item.get('title', 'No title')
                link = item.get('link', 'No URL')
                snippet = item.get('snippet', 'No description')[:100]
                
                print(f"{i}. {title}")
                print(f"   URL: {link}")
                print(f"   Description: {snippet}...")
                print()
            
            # Test URL classification
            print("🔍 Testing URL classification...")
            for item in items[:2]:
                url = item.get('link', '')
                if 'facebook.com' in url.lower():
                    print(f"   ✅ Facebook: {url}")
                elif 'instagram.com' in url.lower():
                    print(f"   ✅ Instagram: {url}")
                elif any(domain in url.lower() for domain in ['.com', '.org', '.net', '.co']):
                    print(f"   ✅ Website: {url}")
                else:
                    print(f"   ❓ Other: {url}")
            
            print()
            print("🎉 Google Search API is working perfectly!")
            print("   You can now run the full automated assessment!")
            return True
            
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == '__main__':
    success = test_google_search()
    
    if success:
        print()
        print("=" * 80)
        print("READY FOR AUTOMATED ASSESSMENT!")
        print("=" * 80)
        print()
        print("Next steps:")
        print("1. Run: python3 test_automated_assessment.py 'West African Tours'")
        print("2. Or run on all stakeholders with the full script")
        print()
    else:
        print()
        print("=" * 80)
        print("SETUP NEEDED")
        print("=" * 80)
        print()
        print("To set up Google Custom Search API:")
        print("1. Go to: https://console.cloud.google.com/")
        print("2. Enable 'Custom Search API'")
        print("3. Create API key")
        print("4. Go to: https://programmablesearchengine.google.com/")
        print("5. Create search engine")
        print("6. Get Search Engine ID")
        print("7. Set environment variables and run this test again")
