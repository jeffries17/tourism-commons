#!/usr/bin/env python3
"""
Organize regional TripAdvisor reviews by country and stakeholder.

Processes the complete regional CI dataset with 3,244 reviews across 49 stakeholders.
"""

import json
import os
from pathlib import Path
from collections import defaultdict

# Paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
SOURCE_FILE = PROJECT_ROOT / "sentiment/data/sentiment_data/to_be_sorted/regional_ci_v2_dataset_tripadvisor-reviews_2025-10-07_08-54-34-063.json"
OUTPUT_BASE = PROJECT_ROOT / "sentiment/data/sentiment_data/raw_reviews/oct_2025"

# Canonical stakeholder info (name -> sector, country)
STAKEHOLDER_INFO = {
    "Capvertdesign+Artesanato (Mindelo)": {"sector": "Fashion & Design", "country": "Cape Verde"},
    "Musée Ethnographique de Porto-Novo": {"sector": "Cultural heritage sites/museums", "country": "Benin"},
    "SWOPA – Sirigu Women's Org. for Pottery & Art (Sirigu)": {"sector": "Crafts and artisan products", "country": "Ghana"},
    "Manufacture Sénégalaise des Arts Décoratifs (Thiès)": {"sector": "Crafts and artisan products", "country": "Senegal"},
    "Centro Cultural do Mindelo": {"sector": "Performing and visual arts", "country": "Cape Verde"},
    "Art D'Cretcheu (Mindelo)": {"sector": "Crafts and artisan products", "country": "Cape Verde"},
    "Cesária Évora": {"sector": "Music (artists, production, venues, education)", "country": "Cape Verde"},
    "Djunta Mo Art (Sal)": {"sector": "Crafts and artisan products", "country": "Cape Verde"},
    "Visões Africanas (Sal)": {"sector": "Performing and visual arts", "country": "Cape Verde"},
    "Osun-Osogbo Sacred Grove (Osun State)": {"sector": "Cultural heritage sites/museums", "country": "Nigeria"},
    "Palais des Rois d'Abomey (Royal Palaces)": {"sector": "Cultural heritage sites/museums", "country": "Benin"},
    "Musée de la Fondation Zinsou (Ouidah)": {"sector": "Cultural heritage sites/museums", "country": "Benin"},
    "Ouidah Museum of History (Portuguese Fort)": {"sector": "Cultural heritage sites/museums", "country": "Benin"},
    "Sukur Cultural Landscape (Adamawa)": {"sector": "Cultural heritage sites/museums", "country": "Nigeria"},
    "MUSON Centre (Lagos)": {"sector": "Performing and visual arts", "country": "Nigeria"},
    "National Museum, Lagos": {"sector": "Cultural heritage sites/museums", "country": "Nigeria"},
    "National Theatre, Lagos": {"sector": "Performing and visual arts", "country": "Nigeria"},
    "Nike Art Foundation (Lagos/Abuja/Oshogbo)": {"sector": "Crafts and artisan products", "country": "Nigeria"},
    "Lekki Arts & Crafts Market (Lagos)": {"sector": "Crafts and artisan products", "country": "Nigeria"},
    "Elmina Castle (Central Region)": {"sector": "Cultural heritage sites/museums", "country": "Ghana"},
    "Cape Coast Castle (Central Region)": {"sector": "Cultural heritage sites/museums", "country": "Ghana"},
    "Fortaleza Real de São Filipe (Cidade Velha)": {"sector": "Cultural heritage sites/museums", "country": "Cape Verde"},
    "Musée Théodore Monod (IFAN)": {"sector": "Cultural heritage sites/museums", "country": "Senegal"},
    "Île de Gorée (Gorée Island)": {"sector": "Cultural heritage sites/museums", "country": "Senegal"},
    "La Maison des Esclaves (House of Slaves)": {"sector": "Cultural heritage sites/museums", "country": "Senegal"},
    "Monument de la Renaissance Africaine": {"sector": "Cultural heritage sites/museums", "country": "Senegal"},
    "Village artisanal de Soumbédioune": {"sector": "Crafts and artisan products", "country": "Senegal"},
    "Le Sandaga": {"sector": "Crafts and artisan products", "country": "Senegal"},
    "Village des Arts de Dakar": {"sector": "Crafts and artisan products", "country": "Senegal"},
    "Marché Dantokpa": {"sector": "Crafts and artisan products", "country": "Benin"},
    "Cotonou Artisanal Center (Marché des Arts)": {"sector": "Crafts and artisan products", "country": "Benin"},
    "Abuja Arts & Craft Village": {"sector": "Crafts and artisan products", "country": "Nigeria"},
    "Artists Alliance Gallery (Accra)": {"sector": "Performing and visual arts", "country": "Ghana"},
    "National Museum of Ghana (Accra)": {"sector": "Cultural heritage sites/museums", "country": "Ghana"},
    "Kwame Nkrumah Mausoleum & Memorial Park (Accra)": {"sector": "Cultural heritage sites/museums", "country": "Ghana"},
    "National Theatre of Ghana (Accra)": {"sector": "Performing and visual arts", "country": "Ghana"},
    "Osu Castle (Christiansborg, Accra)": {"sector": "Cultural heritage sites/museums", "country": "Ghana"},
    "Christie Brown (Accra)": {"sector": "Fashion & Design", "country": "Ghana"},
    "Bonwire Kente Museum & Weaving (Ashanti)": {"sector": "Crafts and artisan products", "country": "Ghana"},
    "Global Mamas (Krobo beads & batik)": {"sector": "Crafts and artisan products", "country": "Ghana"},
    "Musée Royal Honmé (Porto-Novo Royal Palace)": {"sector": "Performing and visual arts", "country": "Benin"},
    "Sala-Museu Amílcar Cabral": {"sector": "Cultural heritage sites/museums", "country": "Cape Verde"},
    "Museu da Tabanca (Chã de Tanque)": {"sector": "Cultural heritage sites/museums", "country": "Cape Verde"},
    "Omenka Gallery (Lagos)": {"sector": "Performing and visual arts", "country": "Nigeria"},
    "New Afrika Shrine (Lagos) – venue": {"sector": "Music (artists, production, venues, education)", "country": "Nigeria"},
    "Museu Etnográfico da Praia": {"sector": "Cultural heritage sites/museums", "country": "Cape Verde"},
    "School of Performing Arts, Univ. of Ghana (Legon)": {"sector": "Music (artists, production, venues, education)", "country": "Ghana"},
}

# Mapping from TripAdvisor names to canonical stakeholder names
TRIPADVISOR_TO_CANONICAL = {
    "Capvertdesign+Artesanato": "Capvertdesign+Artesanato (Mindelo)",
    "Ethnographique Museum of Porto Novo": "Musée Ethnographique de Porto-Novo",
    "SWOPA Ecolodge and Restaurant": "SWOPA – Sirigu Women's Org. for Pottery & Art (Sirigu)",
    "Village Artisanal de Thies": "Manufacture Sénégalaise des Arts Décoratifs (Thiès)",
    "Centro Cultural do Mindelo": "Centro Cultural do Mindelo",
    "Art D'Cretcheu": "Art D'Cretcheu (Mindelo)",
    "Musee Cesaria Evora": "Cesária Évora",
    "Djunta Mo Art": "Djunta Mo Art (Sal)",
    "Visoes Africanas": "Visões Africanas (Sal)",
    "Osun-Osogbo Sacred Grove": "Osun-Osogbo Sacred Grove (Osun State)",
    "Palais des rois d'Abomey": "Palais des Rois d'Abomey (Royal Palaces)",
    "Musee de la Fondation Zinsou": "Musée de la Fondation Zinsou (Ouidah)",
    "Ouidah Museum of History": "Ouidah Museum of History (Portuguese Fort)",
    "Sukur": "Sukur Cultural Landscape (Adamawa)",
    "The Muson Centre": "MUSON Centre (Lagos)",
    "The National Museum": "National Museum, Lagos",
    "National Art Theatre": "National Theatre, Lagos",
    "Nike Centre For Art And Culture": "Nike Art Foundation (Lagos/Abuja/Oshogbo)",
    "Lekki Market": "Lekki Arts & Crafts Market (Lagos)",
    "Elmina Castle": "Elmina Castle (Central Region)",
    "Cape Coast Castle": "Cape Coast Castle (Central Region)",
    "Torre de Belem": "Fortaleza Real de São Filipe (Cidade Velha)",
    "IFAN Museum (African Arts Museum)": "Musée Théodore Monod (IFAN)",
    "Island of Goree": "Île de Gorée (Gorée Island)",
    "La Maison des Esclaves": "La Maison des Esclaves (House of Slaves)",
    "Le Monument de la Renaissance Africaine": "Monument de la Renaissance Africaine",
    "Market Soumbedioune": "Village artisanal de Soumbédioune",
    "Marche Sandaga": "Le Sandaga",
    "Village des Arts": "Village des Arts de Dakar",
    "Marche Dantokpa": "Marché Dantokpa",
    "Artisanal Center": "Cotonou Artisanal Center (Marché des Arts)",
    "Abuja Arts & Crafts Village": "Abuja Arts & Craft Village",
    "Artists Alliance Gallery": "Artists Alliance Gallery (Accra)",
    "National Museum of Ghana": "National Museum of Ghana (Accra)",
    "Kwame Nkrumah Memorial Park": "Kwame Nkrumah Mausoleum & Memorial Park (Accra)",
    "The National Theatre": "National Theatre of Ghana (Accra)",
    "Osu Castle": "Osu Castle (Christiansborg, Accra)",
    "Christie Brown Ghana": "Christie Brown (Accra)",
    "Kente Weaving Village": "Bonwire Kente Museum & Weaving (Ashanti)",
    "Global Mamas Cultural Workshops": "Global Mamas (Krobo beads & batik)",
    "Musee Honme (Palais Royal)": "Musée Royal Honmé (Porto-Novo Royal Palace)",
    "Sala-Museu Amilcar Cabral": "Sala-Museu Amílcar Cabral",
    "Museum de Tabanka": "Museu da Tabanca (Chã de Tanque)",
    "Omenka Gallery": "Omenka Gallery (Lagos)",
    "The New Afrika Shrine": "New Afrika Shrine (Lagos) – venue",
    "Ethnography Museum": "Museu Etnográfico da Praia",
    "Academy for African Music and Arts": "School of Performing Arts, Univ. of Ghana (Legon)",
    # Special case - different building names
    "Fortaleza Real de San Felipe": "Fortaleza Real de São Filipe (Cidade Velha)",
    "Basilica of the Immaculate Conception": None,  # Not in user's list
}

def clean_name_for_folder(name: str) -> str:
    """Convert stakeholder name to a clean folder name."""
    # Remove parenthetical location info
    name = name.split('(')[0].strip() if '(' in name else name
    # Replace special characters
    name = name.lower()
    name = name.replace('&', 'and')
    name = name.replace('+', '_')
    name = name.replace('–', '-')
    name = name.replace(' - ', '_')
    name = name.replace(' ', '_')
    name = name.replace("'", '')
    name = name.replace(',', '')
    name = name.replace('.', '')
    name = name.replace('é', 'e')
    name = name.replace('á', 'a')
    name = name.replace('í', 'i')
    name = name.replace('õ', 'o')
    name = name.replace('ã', 'a')
    name = name.replace('ú', 'u')
    name = name.replace('ç', 'c')
    # Remove multiple underscores
    while '__' in name:
        name = name.replace('__', '_')
    return name.strip('_')

def main():
    print("Loading regional review data...")
    with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"Loaded {len(data):,} entries")
    
    # Group reviews by stakeholder
    reviews_by_stakeholder = defaultdict(list)
    stakeholder_metadata = {}
    unmatched_places = set()
    
    for entry in data:
        # Skip entries that are just metadata without review content
        if 'title' not in entry or 'text' not in entry:
            continue
        
        place_name = entry['placeInfo']['name']
        
        # Use the mapping to get canonical name
        canonical_name = TRIPADVISOR_TO_CANONICAL.get(place_name)
        
        if canonical_name:
            reviews_by_stakeholder[canonical_name].append(entry)
            if canonical_name not in stakeholder_metadata:
                stakeholder_metadata[canonical_name] = entry['placeInfo']
        else:
            unmatched_places.add(place_name)
    
    # Print unmatched places (if any)
    if unmatched_places:
        print("\n⚠️  Unmatched places (not in user's stakeholder list):")
        for place in sorted(unmatched_places):
            print(f"   - {place}")
    
    print(f"\nMatched {len(reviews_by_stakeholder)} stakeholders")
    print(f"Total reviews organized: {sum(len(reviews) for reviews in reviews_by_stakeholder.values()):,}")
    
    # Organize by country and save
    country_stats = defaultdict(lambda: {'stakeholders': 0, 'reviews': 0})
    
    for stakeholder_name, reviews in sorted(reviews_by_stakeholder.items()):
        info = STAKEHOLDER_INFO[stakeholder_name]
        country = info['country'].lower().replace(' ', '_')
        sector = info['sector']
        
        # Create directory structure
        country_dir = OUTPUT_BASE / country / "creative_industries"
        stakeholder_folder = clean_name_for_folder(stakeholder_name)
        stakeholder_dir = country_dir / stakeholder_folder
        stakeholder_dir.mkdir(parents=True, exist_ok=True)
        
        # Save master stakeholder file
        master_data = {
            "name": stakeholder_name,
            "folder_name": stakeholder_folder,
            "sector": sector,
            "country": info['country'],
            "placeInfo": stakeholder_metadata[stakeholder_name],
            "total_reviews": len(reviews),
            "source": "TripAdvisor",
            "scraped_date": "2025-10-07"
        }
        
        master_file = stakeholder_dir / f"{stakeholder_folder}_master.json"
        with open(master_file, 'w', encoding='utf-8') as f:
            json.dump(master_data, f, indent=2, ensure_ascii=False)
        
        # Save individual review files
        for i, review in enumerate(reviews, 1):
            review_file = stakeholder_dir / f"{stakeholder_folder}_review_{i:04d}.json"
            with open(review_file, 'w', encoding='utf-8') as f:
                json.dump(review, f, indent=2, ensure_ascii=False)
        
        # Update stats
        country_stats[country]['stakeholders'] += 1
        country_stats[country]['reviews'] += len(reviews)
        
        print(f"✅ {info['country']:15} {stakeholder_name:60} ({len(reviews):3} reviews)")
    
    # Print summary
    print("\n" + "="*80)
    print("SUMMARY BY COUNTRY")
    print("="*80)
    total_stakeholders = 0
    total_reviews = 0
    for country in sorted(country_stats.keys()):
        stats = country_stats[country]
        total_stakeholders += stats['stakeholders']
        total_reviews += stats['reviews']
        print(f"{country.replace('_', ' ').title():20} {stats['stakeholders']:2} stakeholders, {stats['reviews']:4} reviews")
    
    print(f"\n{'TOTAL':20} {total_stakeholders:2} stakeholders, {total_reviews:4} reviews")
    print(f"\n✅ Organization complete!")
    print(f"📁 Output: {OUTPUT_BASE}")

if __name__ == "__main__":
    main()
