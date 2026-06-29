#!/usr/bin/env python3
"""
Run sentiment analysis on Botswana ecotourism / adventure tourism data.

Step 3 in the Botswana pipeline. Run after organize_botswana_reviews.py.

No translation step needed — Botswana TripAdvisor reviews are predominantly
English (with some German and Dutch), and TextBlob performs well on English.

Usage:
  python run_botswana_sentiment.py

Input:
  data/prepared/<stakeholder>_reviews.json  (one per stakeholder)
  data/prepared/botswana_metadata.json

Output:
  data/sentiment_outputs/botswana_sentiment_analysis.json

Next step: run format_botswana_dashboard.py
"""

import json
import sys
import importlib.util
from pathlib import Path
from datetime import datetime
from collections import Counter, defaultdict

# ── Load Botswana theme analyzer ───────────────────────────────────────────────
_here = Path(__file__).parent
_analyzer_path = _here / 'botswana_theme_analyzer.py'
spec = importlib.util.spec_from_file_location('botswana_theme_analyzer', _analyzer_path)
_mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(_mod)
BotswanaThemeAnalyzer = _mod.BotswanaThemeAnalyzer


def detect_season(date_str: str) -> str:
    """Map a review date string to Botswana's tourist seasons."""
    if not date_str or len(date_str) < 7:
        return 'unknown'
    try:
        month = int(date_str[5:7])
    except (ValueError, IndexError):
        return 'unknown'
    # Dry season (prime safari): May–Oct
    if 5 <= month <= 10:
        return 'dry'
    # Wet / green season: Nov–Apr
    return 'wet'


def analyze_botswana_sentiment():
    base_dir = _here
    # Use translated/ if it exists, otherwise fall back to prepared/
    translated_dir = base_dir / 'translated'
    prepared_dir   = base_dir / 'prepared'
    input_dir = translated_dir if translated_dir.exists() and any(translated_dir.glob('*_reviews.json')) \
                else prepared_dir

    output_dir = base_dir / 'sentiment_outputs'
    output_dir.mkdir(exist_ok=True)

    print("\n🚀 Botswana Sentiment Analysis")
    print(f"   Reading from: {input_dir.name}/")
    print("=" * 70)

    # Load metadata for sector/zone/tier tags
    meta_file = prepared_dir / 'botswana_metadata.json'
    stakeholder_meta = {}
    if meta_file.exists():
        with open(meta_file) as f:
            meta = json.load(f)
        for s in meta.get('stakeholders', []):
            stakeholder_meta[s['filename']] = s

    analyzer = BotswanaThemeAnalyzer()
    review_files = sorted(input_dir.glob('*_reviews.json'))

    if not review_files:
        print("❌ No review files found in data/prepared/")
        print("   Run organize_botswana_reviews.py first.")
        raise SystemExit(1)

    print(f"📁 Found {len(review_files)} stakeholder files\n")

    all_stakeholders = []

    for file in review_files:
        print(f"🔍 Analysing: {file.name}")

        with open(file) as f:
            reviews = json.load(f)

        # Combine all review text and titles
        # Prefer translated_text/translated_title if available (post-translation step)
        texts = [
            (r.get('translated_title') or r.get('title') or '') + ' ' +
            (r.get('translated_text')  or r.get('text')  or '')
            for r in reviews
        ]
        combined = ' '.join(texts)

        if not combined.strip():
            print(f"   ⚠️  No text found, skipping")
            continue

        # Theme analysis
        theme_analysis = analyzer.analyze_text_for_themes_with_sentiment(combined)
        overall_sentiment = analyzer.get_sentiment_score(combined)

        # Detailed theme format
        detailed_themes = {
            theme: {
                'score': data['score'],
                'sentiment_score': data['sentiment_score'],
                'mentions': data['mentions'],
                'positive': data['sentiment_breakdown']['positive'],
                'negative': data['sentiment_breakdown']['negative'],
                'neutral': data['sentiment_breakdown']['neutral'],
            }
            for theme, data in theme_analysis.items()
            if data['mentions'] > 0
        }

        # Ratings
        ratings = [r.get('rating') for r in reviews if r.get('rating')]
        avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else None

        # Language distribution (from translation step metadata)
        lang_dist: Counter = Counter()
        for r in reviews:
            lang = r.get('original_language', 'unknown')
            lang_dist[lang] += 1

        # Year and season distribution from review dates
        year_dist: Counter = Counter()
        season_dist: Counter = Counter()
        for r in reviews:
            date_str = r.get('publishedDate') or r.get('date', '')
            if date_str and len(date_str) >= 4:
                year_dist[date_str[:4]] += 1
                season_dist[detect_season(date_str)] += 1

        # TripAdvisor URL
        url = next(
            (r.get('placeInfo', {}).get('webUrl') for r in reviews
             if r.get('placeInfo', {}).get('webUrl')),
            None
        )

        # Tags from metadata (or defaults)
        tags = stakeholder_meta.get(file.name, {})

        stakeholder_data = {
            'stakeholder_name': file.stem.replace('_reviews', '').replace('_', ' ').title(),
            'filename': file.name,
            'total_reviews': len(reviews),
            'overall_sentiment': overall_sentiment,
            'theme_scores': {t: d['score'] for t, d in theme_analysis.items()},
            'detailed_theme_analysis': detailed_themes,
            'metadata': {
                'analysed_at': datetime.now().isoformat(),
                'source': 'tripadvisor',
                'average_rating': avg_rating,
                'language_distribution': dict(lang_dist),
                'tripadvisor_url': url,
                'sector': tags.get('sector', 'operator'),
                'zone': tags.get('zone', 'Other'),
                'tier': tags.get('tier', 'mid'),
                'year_distribution': dict(year_dist),
                'season_distribution': dict(season_dist),
            },
        }

        all_stakeholders.append(stakeholder_data)
        print(f"   ✓ {len(reviews)} reviews | sentiment={overall_sentiment:.3f} | "
              f"sector={tags.get('sector','?')} | zone={tags.get('zone','?')}")

    if not all_stakeholders:
        print("❌ No stakeholders were analysed.")
        raise SystemExit(1)

    # Summary statistics
    total_reviews = sum(s['total_reviews'] for s in all_stakeholders)
    avg_sentiment = sum(s['overall_sentiment'] for s in all_stakeholders) / len(all_stakeholders)

    theme_totals: dict = defaultdict(list)
    for s in all_stakeholders:
        for theme, score in s['theme_scores'].items():
            theme_totals[theme].append(score)
    theme_averages = {t: sum(v) / len(v) for t, v in theme_totals.items() if v}

    # Sector-level aggregates
    by_sector: dict = defaultdict(list)
    for s in all_stakeholders:
        by_sector[s['metadata']['sector']].append(s['overall_sentiment'])
    sector_averages = {sec: round(sum(v) / len(v), 3) for sec, v in by_sector.items()}

    # Zone-level aggregates
    by_zone: dict = defaultdict(list)
    for s in all_stakeholders:
        by_zone[s['metadata']['zone']].append(s['overall_sentiment'])
    zone_averages = {zone: round(sum(v) / len(v), 3) for zone, v in by_zone.items()}

    output = {
        'metadata': {
            'generated_at': datetime.now().isoformat(),
            'project': 'botswana',
            'focus': 'ecotourism_adventure',
            'total_stakeholders': len(all_stakeholders),
            'total_reviews': total_reviews,
            'overall_sentiment': avg_sentiment,
        },
        'summary': {
            'total_reviews': total_reviews,
            'total_stakeholders': len(all_stakeholders),
            'average_sentiment': avg_sentiment,
            'theme_averages': theme_averages,
            'sector_averages': sector_averages,
            'zone_averages': zone_averages,
        },
        'stakeholder_data': all_stakeholders,
    }

    out_file = output_dir / 'botswana_sentiment_analysis.json'
    with open(out_file, 'w') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 70)
    print("ANALYSIS SUMMARY")
    print("=" * 70)
    print(f"Stakeholders : {len(all_stakeholders)}")
    print(f"Total reviews: {total_reviews}")
    print(f"Avg sentiment: {avg_sentiment:.3f}")

    print("\nTheme Averages:")
    for theme, score in sorted(theme_averages.items(), key=lambda x: x[1], reverse=True):
        print(f"  {theme:<30}: {score:.3f}")

    print("\nSector Averages:")
    for sec, score in sorted(sector_averages.items(), key=lambda x: x[1], reverse=True):
        print(f"  {sec:<20}: {score:.3f}")

    print("\nZone Averages:")
    for zone, score in sorted(zone_averages.items(), key=lambda x: x[1], reverse=True):
        print(f"  {zone:<25}: {score:.3f}")

    print(f"\n✅ Saved to: {out_file}")
    print("=" * 70)

    return output


if __name__ == '__main__':
    analyze_botswana_sentiment()
