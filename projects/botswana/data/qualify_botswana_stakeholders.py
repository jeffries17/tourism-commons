#!/usr/bin/env python3
"""
Qualify Botswana TripAdvisor stakeholders for ecotourism / adventure tourism relevance.

Step 1 in the Botswana pipeline. Run this immediately after the TripAdvisor scrape
to identify which of the 50-75 scraped operators belong in the full analysis.

How it works:
  - Scans all reviews per stakeholder for ecotourism / adventure keywords
  - Produces a relevance score (0.0 – 1.0) per stakeholder
  - Outputs a ranked CSV + JSON for quick review
  - Anything below INCLUDE_THRESHOLD is excluded (casinos, malls, etc. score ~0)

Usage:
  python qualify_botswana_stakeholders.py

Input:
  data/raw/<scrape_file>.json   (TripAdvisor JSON from Apify / scraper)

Output:
  data/qualification_results.json
  data/qualification_results.csv  (easy to open in Excel / Sheets)
"""

import json
import csv
import re
from pathlib import Path
from collections import defaultdict

# ── Thresholds ─────────────────────────────────────────────────────────────────
INCLUDE_THRESHOLD = 0.15   # Above this → include in full analysis
REVIEW_THRESHOLD  = 0.05   # Above this but below INCLUDE_THRESHOLD → manual review

# ── Keyword sets ───────────────────────────────────────────────────────────────

ECOTOURISM_KEYWORDS = [
    # Conservation / eco language
    'conservation', 'conservancy', 'conserve', 'ecosystem', 'sustainable',
    'sustainability', 'responsible', 'eco', 'ecotourism', 'carbon', 'footprint',
    'low impact', 'environment', 'environmental', 'protect', 'protection',
    'wilderness', 'pristine', 'untouched', 'concession', 'community benefit',
    'local community', 'natural habitat',
    # Wildlife
    'wildlife', 'animal', 'elephant', 'lion', 'leopard', 'cheetah', 'buffalo',
    'rhino', 'hippo', 'hippopotamus', 'crocodile', 'giraffe', 'zebra',
    'wild dog', 'african wild dog', 'painted dog', 'antelope', 'impala',
    'kudu', 'waterbuck', 'reedbuck', 'eland', 'wildebeest', 'hartebeest',
    'sable', 'roan', 'warthog', 'mongoose', 'jackal', 'hyena', 'vulture',
    'bird', 'birding', 'birdwatching', 'big five', 'big 5', 'predator',
    'game', 'herd', 'sighting', 'spoor', 'track', 'tracking',
    # Safari / reserve
    'safari', 'game drive', 'game viewing', 'game reserve', 'national park',
    'reserve', 'okavango', 'chobe', 'moremi', 'linyanti', 'kwai', 'selinda',
    'makgadikgadi', 'kalahari', 'savuti', 'khwai', 'delta',
    # Guides
    'guide', 'ranger', 'tracker', 'bush walk', 'nature guide',
]

ADVENTURE_KEYWORDS = [
    'mokoro', 'dugout canoe', 'canoe', 'kayak', 'paddle',
    'walking safari', 'bush walk', 'walk', 'on foot',
    'horseback', 'horse riding', 'horse safari',
    'boat cruise', 'boat safari', 'river cruise', 'sundowner cruise',
    'night drive', 'night game drive',
    'fly camp', 'fly-camp', 'fly camping', 'bush camp', 'sleeping under stars',
    'hot air balloon', 'balloon',
    'quad bike', 'quad biking',
    'cycling safari', 'mountain bike',
    'swimming', 'snorkel',
    'adventure', 'thrill', 'adrenaline', 'expedition',
]

# Combined set for scoring
ALL_ECO_ADVENTURE = set(ECOTOURISM_KEYWORDS + ADVENTURE_KEYWORDS)

# Keywords that strongly suggest non-ecotourism venues (auto-exclude signals)
EXCLUSION_SIGNALS = [
    'casino', 'slot machine', 'gambling', 'roulette', 'poker',
    'shopping mall', 'shopping center', 'boutique', 'fashion', 'clothing store',
    'nightclub', 'night club', 'strip club', 'bar crawl',
    'theme park', 'amusement park', 'waterpark', 'water park',
    'cinema', 'movie theater',
]


# ── Core logic ─────────────────────────────────────────────────────────────────

def score_stakeholder(reviews: list) -> dict:
    """
    Score a stakeholder's relevance to ecotourism / adventure tourism.
    Returns a dict with score, matched keywords, review count, and avg rating.
    """
    all_text = ' '.join(
        ((r.get('text') or '') + ' ' + (r.get('title') or '')).lower()
        for r in reviews
    )

    word_count = max(len(all_text.split()), 1)

    # Count eco/adventure keyword hits
    keyword_hits = defaultdict(int)
    for kw in ALL_ECO_ADVENTURE:
        count = all_text.count(kw)
        if count:
            keyword_hits[kw] = count

    total_hits = sum(keyword_hits.values())

    # Check for exclusion signals
    exclusion_hits = [sig for sig in EXCLUSION_SIGNALS if sig in all_text]

    # Normalise: hits per 100 words, capped at 1.0
    raw_score = min((total_hits / word_count) * 100, 1.0)

    # Penalise if strong exclusion signals present
    if exclusion_hits:
        raw_score = raw_score * 0.2

    # Average TripAdvisor rating
    ratings = [r.get('rating') for r in reviews if r.get('rating')]
    avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else None

    # Top matched keywords (for transparency)
    top_keywords = sorted(keyword_hits.items(), key=lambda x: x[1], reverse=True)[:10]

    return {
        'score': round(raw_score, 4),
        'total_reviews': len(reviews),
        'avg_rating': avg_rating,
        'keyword_hits': total_hits,
        'top_keywords': [kw for kw, _ in top_keywords],
        'exclusion_signals': exclusion_hits,
    }


def recommend(score: float, exclusion_signals: list) -> str:
    if exclusion_signals:
        return 'EXCLUDE'
    if score >= INCLUDE_THRESHOLD:
        return 'INCLUDE'
    if score >= REVIEW_THRESHOLD:
        return 'REVIEW'
    return 'EXCLUDE'


def qualify_stakeholders(raw_file: Path, output_dir: Path):
    print(f"\nLoading raw reviews from: {raw_file}")
    with open(raw_file, 'r') as f:
        reviews = json.load(f)

    print(f"Total reviews loaded: {len(reviews)}")

    # Group by stakeholder
    by_stakeholder = defaultdict(list)
    for r in reviews:
        name = r.get('placeInfo', {}).get('name') or r.get('locationName', 'Unknown')
        by_stakeholder[name].append(r)

    print(f"Unique stakeholders found: {len(by_stakeholder)}\n")

    results = []
    for name, stk_reviews in sorted(by_stakeholder.items()):
        scores = score_stakeholder(stk_reviews)
        rec = recommend(scores['score'], scores['exclusion_signals'])

        url = None
        for r in stk_reviews:
            url = r.get('placeInfo', {}).get('webUrl')
            if url:
                break

        results.append({
            'name': name,
            'recommendation': rec,
            'eco_adventure_score': scores['score'],
            'total_reviews': scores['total_reviews'],
            'avg_rating': scores['avg_rating'],
            'keyword_hits': scores['keyword_hits'],
            'top_keywords': scores['top_keywords'],
            'exclusion_signals': scores['exclusion_signals'],
            'tripadvisor_url': url,
        })

    # Sort by score descending
    results.sort(key=lambda x: x['eco_adventure_score'], reverse=True)

    # Print summary
    include = [r for r in results if r['recommendation'] == 'INCLUDE']
    review  = [r for r in results if r['recommendation'] == 'REVIEW']
    exclude = [r for r in results if r['recommendation'] == 'EXCLUDE']

    print("=" * 70)
    print(f"QUALIFICATION RESULTS  ({len(results)} total stakeholders)")
    print("=" * 70)
    print(f"  ✅ INCLUDE : {len(include)}")
    print(f"  ⚠️  REVIEW  : {len(review)}")
    print(f"  ❌ EXCLUDE : {len(exclude)}")
    print()

    for rec_label, group in [('✅ INCLUDE', include), ('⚠️  REVIEW', review), ('❌ EXCLUDE', exclude)]:
        print(f"\n{rec_label}")
        print("-" * 50)
        for r in group:
            print(f"  {r['name']:<40}  score={r['eco_adventure_score']:.3f}  reviews={r['total_reviews']}")
            if r['top_keywords']:
                print(f"    keywords: {', '.join(r['top_keywords'][:5])}")
            if r['exclusion_signals']:
                print(f"    ⚠ exclusion signals: {', '.join(r['exclusion_signals'])}")

    # Save JSON
    output_dir.mkdir(parents=True, exist_ok=True)
    json_out = output_dir / 'qualification_results.json'
    with open(json_out, 'w') as f:
        json.dump({'thresholds': {'include': INCLUDE_THRESHOLD, 'review': REVIEW_THRESHOLD},
                   'summary': {'total': len(results), 'include': len(include),
                               'review': len(review), 'exclude': len(exclude)},
                   'results': results}, f, indent=2, ensure_ascii=False)

    # Save CSV (easy review in Excel / Sheets)
    csv_out = output_dir / 'qualification_results.csv'
    with open(csv_out, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'recommendation', 'name', 'eco_adventure_score', 'total_reviews',
            'avg_rating', 'keyword_hits', 'top_keywords', 'exclusion_signals', 'tripadvisor_url'
        ])
        writer.writeheader()
        for r in results:
            writer.writerow({**r,
                             'top_keywords': ', '.join(r['top_keywords']),
                             'exclusion_signals': ', '.join(r['exclusion_signals'])})

    print(f"\n📁 JSON saved  : {json_out}")
    print(f"📁 CSV saved   : {csv_out}")
    print("\nNext step: review the REVIEW-flagged entries manually, then run organize_botswana_reviews.py")


if __name__ == '__main__':
    base = Path(__file__).parent

    # Auto-detect the raw scrape file (first .json in data/raw/)
    raw_files = list((base / 'raw').glob('*.json'))
    if not raw_files:
        print("❌ No raw JSON file found in data/raw/")
        print("   Drop the TripAdvisor scrape file into data/raw/ and re-run.")
        raise SystemExit(1)
    if len(raw_files) > 1:
        print(f"Multiple files found in data/raw/, using: {raw_files[0].name}")

    qualify_stakeholders(raw_file=raw_files[0], output_dir=base)
