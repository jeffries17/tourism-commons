#!/usr/bin/env python3
"""
Regional ITO Tour Discovery
Searches existing tour operator websites for Senegal, Cape Verde, Ghana, Nigeria, Benin tours
"""

import requests
from bs4 import BeautifulSoup
import time
from typing import Dict, List
import json

# Regional countries to search for
COUNTRIES = {
    'senegal': ['senegal', 'sénégal', 'dakar'],
    'cape-verde': ['cape-verde', 'cape verde', 'cabo-verde', 'cabo verde', 'praia', 'mindelo'],
    'ghana': ['ghana', 'accra', 'kumasi'],
    'nigeria': ['nigeria', 'lagos', 'abuja'],
    'benin': ['benin', 'bénin', 'cotonou', 'porto-novo']
}

# Operators with Gambia tours (from our analysis)
OPERATORS = [
    {'name': 'Intrepid Travel', 'domain': 'intrepidtravel.com', 'patterns': ['/destinations/', '/trips/']},
    {'name': 'Explore', 'domain': 'explore.co.uk', 'patterns': ['/destinations/', '/tours/']},
    {'name': 'Responsible Travel', 'domain': 'responsibletravel.com', 'patterns': ['/holidays/']},
    {'name': 'G Adventures', 'domain': 'gadventures.com', 'patterns': ['/trips/', '/destinations/']},
    {'name': 'Exodus Travels', 'domain': 'exodustravels.com', 'patterns': ['/holidays/', '/destinations/']},
    {'name': 'Wildlife Worldwide', 'domain': 'wildlifeworldwide.com', 'patterns': ['/holidays/', '/destinations/']},
    {'name': 'Naturetrek', 'domain': 'naturetrek.co.uk', 'patterns': ['/tours/', '/destinations/']},
    {'name': 'The Gambia Experience', 'domain': 'gambia.co.uk', 'patterns': ['/holidays/']},
    {'name': 'Adventure Life', 'domain': 'adventure-life.com', 'patterns': ['/trips/', '/destinations/']},
    {'name': 'Overlanding West Africa', 'domain': 'overlandingwestafrica.com', 'patterns': ['/tours/', '/trips/']},
]


def try_url_patterns(operator: Dict, country: str, keywords: List[str]) -> List[str]:
    """Try common URL patterns for finding destination pages"""
    found_urls = []
    domain = operator['domain']
    patterns = operator['patterns']
    
    for pattern in patterns:
        for keyword in keywords:
            # Try various URL combinations
            test_urls = [
                f"https://www.{domain}{pattern}{keyword}",
                f"https://www.{domain}{pattern}africa/{keyword}",
                f"https://www.{domain}{pattern}west-africa/{keyword}",
                f"https://{domain}{pattern}{keyword}",
            ]
            
            for url in test_urls:
                try:
                    response = requests.head(url, timeout=5, allow_redirects=True)
                    if response.status_code == 200:
                        found_urls.append(url)
                        print(f"   ✅ Found: {url}")
                        break
                except:
                    pass
                
                time.sleep(0.5)  # Rate limiting
    
    return found_urls


def google_site_search(operator: Dict, country: str, keywords: List[str]) -> List[str]:
    """Use Google to search within operator site"""
    domain = operator['domain']
    search_terms = ' OR '.join(keywords)
    
    # Note: This would require Google Custom Search API or scraping Google results
    # For now, return the query that would be used
    queries = [
        f"site:{domain} {search_terms} tours",
        f"site:{domain} {search_terms} holidays",
        f"site:{domain} {search_terms} travel",
    ]
    
    print(f"   🔍 Google search queries:")
    for q in queries:
        print(f"      {q}")
    
    return queries


def find_tours_for_operator(operator: Dict) -> Dict:
    """Search for regional tours on a single operator's website"""
    print(f"\n{'='*80}")
    print(f"🔍 Searching: {operator['name']} ({operator['domain']})")
    print(f"{'='*80}")
    
    results = {}
    
    for country, keywords in COUNTRIES.items():
        print(f"\n📍 {country.upper()}")
        print("-" * 80)
        
        # Try URL patterns
        found_urls = try_url_patterns(operator, country, keywords)
        
        # Show Google search queries (actual implementation would use API)
        google_queries = google_site_search(operator, country, keywords)
        
        results[country] = {
            'found_urls': found_urls,
            'google_queries': google_queries,
            'status': 'Found' if found_urls else 'Manual search needed'
        }
        
        if not found_urls:
            print(f"   ℹ️  No automatic match - try Google queries above")
    
    return results


def main():
    """Main discovery process"""
    print("=" * 80)
    print("🌍 REGIONAL ITO TOUR DISCOVERY")
    print("=" * 80)
    print()
    print(f"Searching {len(OPERATORS)} operators for tours to:")
    for country in COUNTRIES.keys():
        print(f"  • {country.title()}")
    print()
    print("This will take ~5-10 minutes...")
    print()
    
    all_results = {}
    
    for operator in OPERATORS[:3]:  # Start with first 3 for testing
        results = find_tours_for_operator(operator)
        all_results[operator['name']] = results
        
        time.sleep(2)  # Rate limiting between operators
    
    # Save results
    output_file = 'regional_ito_discovery_results.json'
    with open(output_file, 'w') as f:
        json.dump(all_results, f, indent=2)
    
    print()
    print("=" * 80)
    print("📊 DISCOVERY SUMMARY")
    print("=" * 80)
    print()
    
    # Count findings
    total_urls_found = 0
    by_country = {c: 0 for c in COUNTRIES.keys()}
    
    for op_name, op_results in all_results.items():
        for country, country_data in op_results.items():
            count = len(country_data['found_urls'])
            total_urls_found += count
            by_country[country] += count
    
    print(f"Total URLs discovered: {total_urls_found}")
    print()
    print("By country:")
    for country, count in by_country.items():
        print(f"  • {country.title():15s} {count:3d} URLs")
    
    print()
    print(f"✅ Results saved to: {output_file}")
    print()
    print("NEXT STEPS:")
    print("1. Review discovered URLs manually")
    print("2. Add Google Custom Search API key for better discovery")
    print("3. Run scraping pipeline on found URLs")
    print("4. Analyze with ito_ai_analyzer.py")
    print()


if __name__ == '__main__':
    main()

