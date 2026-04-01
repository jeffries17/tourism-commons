#!/usr/bin/env python3
"""
Format Botswana sentiment analysis for dashboard consumption.

Step 4 in the Botswana pipeline. Run after run_botswana_sentiment.py.

Converts the raw analysis JSON into the structure expected by the React dashboard,
including sector groupings, zone summaries, eco-credibility index, and seasonal data.

Usage:
  python format_botswana_dashboard.py

Input:
  data/sentiment_outputs/botswana_sentiment_analysis.json

Output:
  dashboard/public/botswana_sentiment_data.json
"""

import json
from pathlib import Path
from datetime import datetime
from collections import Counter, defaultdict


THEMES = [
    'wildlife_experience',
    'eco_conservation',
    'service_hospitality',
    'accommodation_quality',
    'value_money',
    'accessibility_logistics',
    'adventure_activities',
    'safety',
    'atmosphere_wilderness',
    'food_dining',
    'environmental_sensitivity',
]

# Eco-credibility index: weighted combination of themes that proxy
# how well an operator delivers on Botswana's conservation brand promise.
ECO_CREDIBILITY_WEIGHTS = {
    'eco_conservation':         0.40,
    'wildlife_experience':      0.25,
    'atmosphere_wilderness':    0.20,
    'environmental_sensitivity': 0.15,  # high score here = reviews praise lack of crowds
}


def compute_eco_credibility(theme_scores: dict) -> float:
    """Weighted eco-credibility score from 0–1."""
    score = sum(
        theme_scores.get(theme, 0) * weight
        for theme, weight in ECO_CREDIBILITY_WEIGHTS.items()
    )
    return round(min(score, 1.0), 3)


def format_botswana_for_dashboard():
    base_dir = Path(__file__).parent
    input_file = base_dir / 'sentiment_outputs' / 'botswana_sentiment_analysis.json'

    if not input_file.exists():
        print(f"❌ Analysis file not found: {input_file}")
        print("   Run run_botswana_sentiment.py first.")
        raise SystemExit(1)

    with open(input_file) as f:
        analysis = json.load(f)

    # ── Format individual stakeholders ────────────────────────────────────────
    formatted_stakeholders = []

    for s in analysis['stakeholder_data']:
        meta = s.get('metadata', {})
        detailed = s.get('detailed_theme_analysis', {})
        raw_scores = s.get('theme_scores', {})

        # Theme scores in dashboard format
        theme_scores = {}
        for theme in THEMES:
            if theme in detailed:
                d = detailed[theme]
                theme_scores[theme] = {
                    'score': round(d.get('score', 0), 3),
                    'mentions': d.get('mentions', 0),
                    'sentiment_score': round(d.get('sentiment_score', 0), 3),
                    'distribution': {
                        'positive': d.get('positive', 0),
                        'neutral': d.get('neutral', 0),
                        'negative': d.get('negative', 0),
                    },
                }
            else:
                theme_scores[theme] = {
                    'score': round(raw_scores.get(theme, 0), 3),
                    'mentions': 0,
                    'sentiment_score': 0,
                    'distribution': {'positive': 0, 'neutral': 0, 'negative': 0},
                }

        eco_score = compute_eco_credibility(raw_scores)
        avg_rating = meta.get('average_rating')
        if avg_rating is None:
            avg_rating = round((s['overall_sentiment'] + 1) * 2.5 + 2.5, 1)
            avg_rating = max(1.0, min(5.0, avg_rating))

        formatted_stakeholders.append({
            'stakeholder_name': s['stakeholder_name'],
            'sector': meta.get('sector', 'operator'),
            'zone': meta.get('zone', 'Other'),
            'tier': meta.get('tier', 'mid'),
            'total_reviews': s['total_reviews'],
            'average_rating': avg_rating,
            'overall_sentiment': round(s['overall_sentiment'], 3),
            'eco_credibility_score': eco_score,
            'tripadvisor_url': meta.get('tripadvisor_url'),
            'year_distribution': meta.get('year_distribution', {}),
            'season_distribution': meta.get('season_distribution', {}),
            'theme_scores': theme_scores,
        })

    # ── Sector summaries ──────────────────────────────────────────────────────
    by_sector: dict = defaultdict(list)
    for s in formatted_stakeholders:
        by_sector[s['sector']].append(s)

    sector_summaries = {}
    for sector, items in by_sector.items():
        theme_avgs = {}
        for theme in THEMES:
            scores = [i['theme_scores'][theme]['sentiment_score'] for i in items]
            theme_avgs[theme] = round(sum(scores) / len(scores), 3) if scores else 0

        sector_summaries[sector] = {
            'count': len(items),
            'avg_sentiment': round(sum(i['overall_sentiment'] for i in items) / len(items), 3),
            'avg_eco_credibility': round(sum(i['eco_credibility_score'] for i in items) / len(items), 3),
            'theme_averages': theme_avgs,
            'stakeholders': [i['stakeholder_name'] for i in items],
        }

    # ── Zone summaries ────────────────────────────────────────────────────────
    by_zone: dict = defaultdict(list)
    for s in formatted_stakeholders:
        by_zone[s['zone']].append(s)

    zone_summaries = {}
    for zone, items in by_zone.items():
        zone_summaries[zone] = {
            'count': len(items),
            'avg_sentiment': round(sum(i['overall_sentiment'] for i in items) / len(items), 3),
            'avg_eco_credibility': round(sum(i['eco_credibility_score'] for i in items) / len(items), 3),
            'stakeholders': [i['stakeholder_name'] for i in items],
        }

    # ── Aggregate theme averages (sentiment / quality) ───────────────────────
    theme_averages = {}
    for theme in THEMES:
        scores = [s['theme_scores'][theme]['sentiment_score'] for s in formatted_stakeholders]
        theme_averages[theme] = round(sum(scores) / len(scores), 3) if scores else 0

    # ── Aggregate theme visibility (mention frequency score) ─────────────────
    theme_visibility = {}
    for theme in THEMES:
        scores = [s['theme_scores'][theme]['score'] for s in formatted_stakeholders]
        theme_visibility[theme] = round(sum(scores) / len(scores), 3) if scores else 0

    # ── Year distribution aggregate ───────────────────────────────────────────
    year_totals: dict = Counter()
    for s in formatted_stakeholders:
        for year, count in s.get('year_distribution', {}).items():
            year_totals[year] += count

    # ── Seasonal aggregate ────────────────────────────────────────────────────
    season_totals: dict = Counter()
    for s in formatted_stakeholders:
        for season, count in s.get('season_distribution', {}).items():
            season_totals[season] += count

    # ── Assemble dashboard payload ────────────────────────────────────────────
    dashboard_data = {
        'metadata': {
            'generated_at': datetime.now().isoformat(),
            'title': 'Botswana Ecotourism & Adventure Sentiment Analysis',
            'total_stakeholders': len(formatted_stakeholders),
            'total_reviews': analysis['metadata']['total_reviews'],
            'themes': THEMES,
            'eco_credibility_weights': ECO_CREDIBILITY_WEIGHTS,
        },
        'summary': {
            'avg_sentiment': round(analysis['summary']['average_sentiment'], 3),
            'theme_averages': theme_averages,
            'theme_visibility': theme_visibility,
            'year_distribution': dict(sorted(year_totals.items())),
            'sector_summaries': sector_summaries,
            'zone_summaries': zone_summaries,
            'season_distribution': dict(season_totals),
        },
        'stakeholder_data': formatted_stakeholders,
    }

    # ── Save ──────────────────────────────────────────────────────────────────
    output_dir = base_dir.parent / 'dashboard' / 'public'
    output_dir.mkdir(parents=True, exist_ok=True)
    out_file = output_dir / 'botswana_sentiment_data.json'

    with open(out_file, 'w') as f:
        json.dump(dashboard_data, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 70)
    print("BOTSWANA DASHBOARD DATA READY")
    print("=" * 70)
    print(f"Stakeholders : {len(formatted_stakeholders)}")
    print(f"Total reviews: {analysis['metadata']['total_reviews']}")
    print(f"\nTheme Sentiment Averages:")
    for theme, score in sorted(theme_averages.items(), key=lambda x: x[1], reverse=True):
        print(f"  {theme:<30}: {score:+.3f}")
    print(f"\nSector Summary:")
    for sec, data in sector_summaries.items():
        print(f"  {sec:<15}: {data['count']} operators, "
              f"sentiment={data['avg_sentiment']:+.3f}, eco={data['avg_eco_credibility']:.3f}")
    print(f"\nZone Summary:")
    for zone, data in zone_summaries.items():
        print(f"  {zone:<25}: {data['count']} operators, sentiment={data['avg_sentiment']:+.3f}")
    print(f"\n✅ Saved to: {out_file}")
    print("=" * 70)

    return out_file


if __name__ == '__main__':
    format_botswana_for_dashboard()
