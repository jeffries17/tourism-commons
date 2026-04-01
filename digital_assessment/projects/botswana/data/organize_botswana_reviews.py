#!/usr/bin/env python3
"""
Organize Botswana TripAdvisor reviews by stakeholder.

Step 2 in the Botswana pipeline. Run after qualifying stakeholders.

What it does:
  - Reads the raw TripAdvisor JSON
  - Splits into one file per stakeholder (qualified operators only)
  - Tags each stakeholder with sector, zone, and price_tier
  - Outputs to data/prepared/<safe_name>_reviews.json

Usage:
  1. Edit QUALIFIED_STAKEHOLDERS below to include only the operators
     that passed the qualification step (copy names from qualification_results.csv).
  2. Optionally edit STAKEHOLDER_TAGS to set sector/zone/tier manually.
  3. Run: python organize_botswana_reviews.py

Input:
  data/raw/<scrape_file>.json
  data/qualification_results.json  (for reference)

Output:
  data/prepared/<stakeholder>_reviews.json  (one per qualified stakeholder)
  data/prepared/botswana_metadata.json      (summary for pipeline)
"""

import json
import re
from pathlib import Path
from collections import defaultdict, Counter

# ── Configuration ──────────────────────────────────────────────────────────────
# After running qualify_botswana_stakeholders.py, paste the INCLUDE list here.
# Leave empty to process ALL stakeholders (no filter).
QUALIFIED_STAKEHOLDERS: list[str] = [
    # ── Core ecotourism / adventure operators (60 from qualification pass) ──
    "4 Rivers Camp - Kwando Safaris",
    "African Bush Lovers Travel & Tours Safaris",
    "African Guide Academy",
    "Baines Baobabs",
    "Boab Prison Tree",
    "CARACAL Biodiversity Center",
    "Central Kalahari Game Reserve",
    "Central Kalahari Wild Tours",
    "Chobe Crocodile Farm",
    "Chobe Marina Lodge",
    "Chobe River Boat Cruises",
    "Crocodile Pools River Safaris",
    "Deception Valley",
    "Desert & Delta Safaris",
    "Gaborone Game Reserve",
    "Gifa's Transport",
    "Gondwana Tours & Safaris",
    "Helicopter Horizons",
    "Jwana Game Park",
    "Kalahari Breeze Safaris",
    "Kalahari Tours",
    "Kgale Hill",
    "Khama III Memorial Museum",
    "Khama Rhino Sanctuary",
    "Khutse Game Reserve",
    "Khwai Concession",
    "Khwai River Bridge",
    "Kubu Island",
    "Kuminda Farm",
    "Lelobu Safaris",
    "Letaka Safaris",
    "Lily's Petting Farm",
    "Mack Air",
    "Makgadikgadi Salt Pan",
    "Manyana Rock Paintings",
    "Matsieng's Footprints",
    "Mogonye Gorge",
    "Mokolodi Nature Reserve",
    "Moremi Game Reserve",
    "Moremi Gorge",
    "Moremi Wildlife Reserve",
    "Nata Bird Sanctuary",
    "Nyala Adventure Safaris",
    "Okavango Delta",
    "Okavango River",
    "Old Palapye",
    "Pangolin Photo Safaris",
    "Pat Mobile Safari",
    "Planet Baobab",
    "Savute Reserve",
    "Serondela Reserve",
    "Shangana Safaris Okavango Botswana",
    "Temogo Safari",
    "Three Chiefs' Statues",
    "Tsodilo Hills",
    "Vuche Vuche Basket Weavers",
    "The Space Botswana",
    "Kuru Art Project",
    "Tawana Self Drive",
    "Bluetree World of Golf",
    # ── Manually reinstated (incorrectly excluded by algorithm) ──────────────
    "Steenbok Safari",       # Legitimate safari operator; 'shopping mall' in reviews referred to nearby area
    "Ultimate Africa Safaris",  # Legitimate operator; 'boutique' in reviews described their small-group style
]

# Optional manual tags per stakeholder.
# If a stakeholder isn't listed here, tags will be inferred from its name.
# sector: "reserve" | "lodge" | "operator" | "activity"
# zone:   "Okavango Delta" | "Chobe" | "Moremi" | "Linyanti" | "Kwai" |
#          "Selinda" | "Makgadikgadi" | "Central Kalahari" | "Other"
# tier:   "budget" | "mid" | "luxury"
STAKEHOLDER_TAGS: dict[str, dict] = {
    # "Chobe Game Lodge": {"sector": "lodge", "zone": "Chobe", "tier": "luxury"},
}

# ── Zone inference rules (keyword → zone name) ─────────────────────────────────
ZONE_KEYWORDS = {
    'okavango': 'Okavango Delta',
    'delta':    'Okavango Delta',
    'maun':     'Okavango Delta',
    'chobe':    'Chobe',
    'kasane':   'Chobe',
    'moremi':   'Moremi',
    'linyanti': 'Linyanti',
    'kwai':     'Kwai',
    'khwai':    'Kwai',
    'selinda':  'Selinda',
    'makgadikgadi': 'Makgadikgadi',
    'nxai':     'Makgadikgadi',
    'kalahari': 'Central Kalahari',
    'deception': 'Central Kalahari',
    'savuti':   'Chobe',
    'savute':   'Chobe',
}

SECTOR_KEYWORDS = {
    'lodge': 'lodge',
    'camp':  'lodge',
    'tented': 'lodge',
    'hotel': 'lodge',
    'reserve': 'reserve',
    'national park': 'reserve',
    'game reserve': 'reserve',
    'concession': 'reserve',
    'mokoro': 'activity',
    'canoe': 'activity',
    'kayak': 'activity',
    'walk': 'activity',
    'horseback': 'activity',
    'horse': 'activity',
    'balloon': 'activity',
    'safari': 'operator',
    'tours': 'operator',
    'expeditions': 'operator',
    'adventures': 'operator',
}

TIER_KEYWORDS = {
    'luxury': 'luxury',
    'exclusive': 'luxury',
    'five star': 'luxury',
    '5 star': 'luxury',
    'premier': 'luxury',
    'budget': 'budget',
    'backpacker': 'budget',
    'affordable': 'budget',
}


def infer_tags(name: str) -> dict:
    name_lower = name.lower()
    zone = next((v for k, v in ZONE_KEYWORDS.items() if k in name_lower), 'Other')
    sector = next((v for k, v in SECTOR_KEYWORDS.items() if k in name_lower), 'operator')
    tier = next((v for k, v in TIER_KEYWORDS.items() if k in name_lower), 'mid')
    return {'sector': sector, 'zone': zone, 'tier': tier}


def safe_filename(name: str) -> str:
    return re.sub(r'[^a-z0-9_]', '', name.lower().replace(' ', '_'))


def organize_reviews(raw_file: Path, output_dir: Path):
    print(f"\nLoading reviews from: {raw_file}")
    with open(raw_file, 'r') as f:
        reviews = json.load(f)
    print(f"Total reviews: {len(reviews)}")

    # Group by stakeholder
    by_stakeholder = defaultdict(list)
    for r in reviews:
        name = r.get('placeInfo', {}).get('name') or r.get('locationName', 'Unknown')
        by_stakeholder[name].append(r)

    # Apply qualification filter
    if QUALIFIED_STAKEHOLDERS:
        stakeholders = {k: v for k, v in by_stakeholder.items() if k in QUALIFIED_STAKEHOLDERS}
        print(f"Filtering to {len(stakeholders)} qualified stakeholders")
    else:
        stakeholders = dict(by_stakeholder)
        print(f"No filter applied — processing all {len(stakeholders)} stakeholders")

    output_dir.mkdir(parents=True, exist_ok=True)

    metadata = {
        'stakeholders': [],
        'total_reviews': 0,
        'years': Counter(),
        'languages': Counter(),
    }

    for name, stk_reviews in sorted(stakeholders.items()):
        tags = STAKEHOLDER_TAGS.get(name) or infer_tags(name)

        # Year and language distribution
        for r in stk_reviews:
            date_str = r.get('publishedDate') or r.get('date', '')
            if date_str and len(date_str) >= 4:
                try:
                    metadata['years'][date_str[:4]] += 1
                except Exception:
                    pass

        url = next(
            (r.get('placeInfo', {}).get('webUrl') for r in stk_reviews if r.get('placeInfo', {}).get('webUrl')),
            None
        )
        ratings = [r.get('rating') for r in stk_reviews if r.get('rating')]
        avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else None

        # Save per-stakeholder file
        fname = safe_filename(name) + '_reviews.json'
        out_file = output_dir / fname
        with open(out_file, 'w') as f:
            json.dump(stk_reviews, f, indent=2, ensure_ascii=False)

        metadata['stakeholders'].append({
            'name': name,
            'filename': fname,
            'total_reviews': len(stk_reviews),
            'avg_rating': avg_rating,
            'sector': tags['sector'],
            'zone': tags['zone'],
            'tier': tags['tier'],
            'tripadvisor_url': url,
        })
        metadata['total_reviews'] += len(stk_reviews)

        print(f"  ✓ {name:<45}  reviews={len(stk_reviews)}  "
              f"sector={tags['sector']}  zone={tags['zone']}  tier={tags['tier']}")

    # Save metadata
    metadata['years'] = dict(metadata['years'])
    meta_file = output_dir / 'botswana_metadata.json'
    with open(meta_file, 'w') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Organised {len(metadata['stakeholders'])} stakeholders")
    print(f"   Total reviews : {metadata['total_reviews']}")
    print(f"   Metadata saved: {meta_file}")
    print("\nNext step: run run_botswana_sentiment.py")


if __name__ == '__main__':
    base = Path(__file__).parent
    raw_files = list((base / 'raw').glob('*.json'))

    if not raw_files:
        print("❌ No raw JSON found in data/raw/")
        raise SystemExit(1)

    organize_reviews(raw_file=raw_files[0], output_dir=base / 'prepared')
