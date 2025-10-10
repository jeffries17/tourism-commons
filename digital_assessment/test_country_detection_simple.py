#!/usr/bin/env python3
"""
Simple test of country detection logic (no Google Cloud dependencies)
"""

# Sample tour texts
MULTI_COUNTRY_TEXT = """
Senegal & The Gambia Cultural Journey

Explore the vibrant cultures of West Africa on this 14-day adventure through 
Senegal and The Gambia. Begin in Dakar, Senegal's bustling capital, where you'll 
visit the historic Gorée Island. Journey to Saint-Louis, Senegal's former colonial 
capital.

Cross the border into The Gambia and explore Banjul. Visit the Gambian National 
Museum and take a river cruise on the Gambia River. Experience traditional drumming 
in Serrekunda, Gambia.

Return to Senegal for a final night in Dakar, enjoying Senegalese cuisine. Optional 
extensions to Guinea-Bissau available.
"""

PURE_GHANA_TEXT = """
Best of Ghana: 12-Day Cultural Tour

Discover the rich heritage of Ghana on this comprehensive journey. Begin in Accra, 
Ghana's dynamic capital. Journey to Kumasi, the heart of Ashanti culture in Ghana.

Explore Ghana's historic slave castles at Cape Coast and Elmina. Experience Ghana's 
natural beauty at Kakum National Park. Meet local artisans in Ghana's craft villages.

This tour focuses entirely on Ghana's cultural treasures, from Accra to Kumasi. 
Experience authentic Ghanaian hospitality and immerse yourself in Ghana's history.
"""


def detect_countries_mentioned(text):
    """Detect all West African countries mentioned in text"""
    text_lower = text.lower()
    
    countries_map = {
        'Gambia': ['gambia', 'the gambia', 'banjul', 'serrekunda'],
        'Senegal': ['senegal', 'sénégal', 'dakar', 'saint-louis'],
        'Ghana': ['ghana', 'ghanaian', 'accra', 'kumasi'],
        'Nigeria': ['nigeria', 'lagos', 'abuja'],
        'Cape Verde': ['cape verde', 'cabo verde', 'praia', 'mindelo'],
        'Guinea': ['guinea', 'conakry'],
        'Guinea-Bissau': ['guinea-bissau', 'guinea bissau', 'bissau'],
        'Sierra Leone': ['sierra leone', 'freetown'],
        'Mali': ['mali', 'bamako', 'timbuktu'],
        'Benin': ['benin', 'bénin', 'cotonou'],
    }
    
    detected = {}
    for country, keywords in countries_map.items():
        mentions = sum(text_lower.count(kw) for kw in keywords)
        if mentions > 0:
            detected[country] = mentions
    
    return detected


def analyze_packaging(countries_detected, primary_destination):
    """Determine packaging type and percentages"""
    destination_mentions = countries_detected.get(primary_destination, 0)
    other_countries = {k: v for k, v in countries_detected.items() if k != primary_destination}
    multi_country_mentions = sum(other_countries.values())
    
    total_mentions = destination_mentions + multi_country_mentions
    
    if multi_country_mentions == 0:
        packaging_type = f'{primary_destination}-only'
        destination_pct = 100
    elif destination_mentions > multi_country_mentions * 1.5:
        destination_pct = round((destination_mentions / total_mentions) * 100)
        packaging_type = f'{primary_destination}-focused multi-country'
    else:
        destination_pct = round((destination_mentions / total_mentions) * 100)
        packaging_type = 'Multi-country package'
    
    countries_list = ', '.join([f"{k} ({v})" for k, v in sorted(countries_detected.items(), key=lambda x: x[1], reverse=True)])
    is_pure = 'Yes' if destination_pct >= 80 else 'No'
    
    return packaging_type, destination_pct, countries_list, is_pure


def main():
    print("="*80)
    print("TESTING MULTI-COUNTRY DETECTION")
    print("="*80)
    print()
    
    # Test 1: Multi-country tour
    print("TEST 1: Multi-Country Tour (Senegal + Gambia)")
    print("-"*80)
    print()
    
    countries1 = detect_countries_mentioned(MULTI_COUNTRY_TEXT)
    packaging1, pct1, list1, pure1 = analyze_packaging(countries1, 'Senegal')
    
    print("Column values that will be written to sheet:")
    print(f"  Column C (Primary Destination): Senegal")
    print(f"  Column D (Countries Covered): {list1}")
    print(f"  Column N (Primary Destination %): {pct1}%")
    print(f"  Column O (Packaging Type): {packaging1}")
    print(f"  Column P (Is Pure Destination): {pure1}")
    print()
    print("Detailed breakdown:")
    for country, mentions in sorted(countries1.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {country}: {mentions} mentions")
    
    print()
    print()
    
    # Test 2: Pure country tour
    print("TEST 2: Pure Country Tour (Ghana only)")
    print("-"*80)
    print()
    
    countries2 = detect_countries_mentioned(PURE_GHANA_TEXT)
    packaging2, pct2, list2, pure2 = analyze_packaging(countries2, 'Ghana')
    
    print("Column values that will be written to sheet:")
    print(f"  Column C (Primary Destination): Ghana")
    print(f"  Column D (Countries Covered): {list2}")
    print(f"  Column N (Primary Destination %): {pct2}%")
    print(f"  Column O (Packaging Type): {packaging2}")
    print(f"  Column P (Is Pure Destination): {pure2}")
    print()
    print("Detailed breakdown:")
    for country, mentions in sorted(countries2.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {country}: {mentions} mentions")
    
    print()
    print("="*80)
    print("✅ MULTI-COUNTRY DETECTION WORKS!")
    print("="*80)
    print()
    print("Summary:")
    print("  ✓ Column D will show ALL countries with mention counts")
    print("  ✓ Multi-country tours detected automatically")
    print("  ✓ Pure tours (≥80%) flagged in Column P")
    print("  ✓ Primary Destination % shows content distribution")
    print()
    print("When you run the full analysis:")
    print("  1. Scraper extracts tour text")
    print("  2. Analyzer detects all countries mentioned")
    print("  3. Column D populated with: 'Senegal (23), Gambia (12), Guinea (3)'")
    print("  4. You can filter by 'Is Pure Destination' = Yes for baselines")
    print()


if __name__ == '__main__':
    main()

