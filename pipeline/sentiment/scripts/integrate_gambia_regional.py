#!/usr/bin/env python3
"""
Integrate Gambia sentiment data with regional competitor analysis
Creates a unified comparative analysis across all 6 countries
"""

import json
from pathlib import Path
from collections import defaultdict
from datetime import datetime

class GambiaRegionalIntegrator:
    def __init__(self):
        self.sector_mapping = {
            'Cultural heritage sites/museums': 'Museums & Heritage',
            'Crafts and artisan products': 'Crafts & Artisans',
            'Performing and visual arts': 'Performing Arts',
            'Music (artists, production, venues, education)': 'Music & Venues',
            'Festivals and cultural events': 'Festivals',
            'Fashion & Design': 'Fashion & Design',
            'Marketing/advertising/publishing': 'Media & Publishing',
        }
    
    def normalize_gambia_stakeholder(self, stakeholder: dict) -> dict:
        """Convert Gambia stakeholder data to match regional format"""
        # Map Gambia theme scores to regional format
        theme_analysis = {}
        
        # Map specific Gambia themes
        theme_mappings = {
            'service_quality': ('staff_service', 'service_quality_score', 'service_quality_mentions'),
            'educational_value': ('educational_value', 'educational_value_score', 'educational_value_mentions'),
            'value_pricing': ('value_pricing', 'value_pricing_score', 'value_pricing_mentions'),
            'artistic_creative_quality': ('art_creativity', 'artistic_creative_quality_score', 'artistic_creative_quality_mentions'),
            'authenticity_culture': ('cultural_heritage', 'authenticity_culture_score', 'authenticity_culture_mentions'),
            'infrastructure': ('facilities_infrastructure', 'infrastructure_score', 'infrastructure_mentions'),
        }
        
        for theme, (regional_key, score_key, mentions_key) in theme_mappings.items():
            if score_key in stakeholder and mentions_key in stakeholder:
                theme_analysis[regional_key] = {
                    'avg_sentiment': stakeholder[score_key],
                    'mentions': stakeholder[mentions_key],
                    'reviews_mentioning': stakeholder[mentions_key]
                }
        
        # Extract language distribution
        language_dist = {}
        traveler_personas = {}
        
        language_to_region = {
            'english_reviews': 'English-speaking (Global)',
            'dutch_reviews': 'Dutch/Belgian',
            'german_reviews': 'German-speaking',
            'spanish_reviews': 'Spanish-speaking',
            'french_reviews': 'French-speaking'
        }
        
        for lang_key, region_name in language_to_region.items():
            if lang_key in stakeholder and stakeholder[lang_key] > 0:
                lang_code = lang_key.replace('_reviews', '')[:2]
                language_dist[lang_code] = stakeholder[lang_key]
                traveler_personas[region_name] = stakeholder[lang_key]
        
        # Determine sector - Gambia doesn't have explicit sector, infer from name
        sector = 'Museums & Heritage'  # Default for most Gambia sites
        stakeholder_name = stakeholder.get('stakeholder_name', '').lower()
        
        if 'market' in stakeholder_name or 'craft' in stakeholder_name:
            sector = 'Crafts & Artisans'
        elif 'museum' in stakeholder_name or 'fort' in stakeholder_name or 'arch' in stakeholder_name:
            sector = 'Museums & Heritage'
        elif 'gallery' in stakeholder_name or 'art' in stakeholder_name:
            sector = 'Performing Arts'
        
        return {
            'stakeholder_name': stakeholder['stakeholder_name'].replace('_', ' ').title(),
            'country': 'Gambia',
            'sector': sector,
            'sector_category': sector,
            'total_reviews': stakeholder['total_reviews'],
            'avg_sentiment': stakeholder['overall_sentiment'],
            'avg_rating': stakeholder['average_rating'],
            'positive_rate': stakeholder['positive_rate'],
            'sentiment_distribution': {
                'positive': int(stakeholder['positive_rate'] * stakeholder['total_reviews'] / 100),
                'neutral': 0,  # Not tracked separately in Gambia data
                'negative': stakeholder['total_reviews'] - int(stakeholder['positive_rate'] * stakeholder['total_reviews'] / 100)
            },
            'theme_analysis': theme_analysis,
            'language_distribution': language_dist,
            'traveler_personas': traveler_personas,
            'year_distribution': stakeholder.get('year_distribution', {}),
            'positive_quotes': [],  # Not in Gambia format
            'negative_quotes': [],
            'top_themes': sorted(theme_analysis.items(), 
                               key=lambda x: x[1]['avg_sentiment'], 
                               reverse=True)[:3] if theme_analysis else []
        }
    
    def aggregate_by_country(self, all_stakeholders: list) -> dict:
        """Aggregate analysis by country including Gambia"""
        country_data = {}
        
        for country in set(s['country'] for s in all_stakeholders):
            country_stakeholders = [s for s in all_stakeholders if s['country'] == country]
            
            total_reviews = sum(s['total_reviews'] for s in country_stakeholders)
            avg_sentiment = sum(s['avg_sentiment'] * s['total_reviews'] for s in country_stakeholders) / total_reviews if total_reviews > 0 else 0
            avg_rating = sum(s['avg_rating'] * s['total_reviews'] for s in country_stakeholders if s['avg_rating'] > 0) / total_reviews if total_reviews > 0 else 0
            
            # Aggregate themes
            country_themes = defaultdict(lambda: {'sentiment_scores': [], 'mentions': 0})
            for stakeholder in country_stakeholders:
                for theme, data in stakeholder['theme_analysis'].items():
                    country_themes[theme]['sentiment_scores'].append(data['avg_sentiment'])
                    country_themes[theme]['mentions'] += data.get('mentions', data.get('reviews_mentioning', 0))
            
            theme_summary = {
                theme: {
                    'avg_sentiment': round(sum(data['sentiment_scores']) / len(data['sentiment_scores']), 3),
                    'total_mentions': data['mentions'],
                    'stakeholders_mentioning': len(data['sentiment_scores'])
                }
                for theme, data in country_themes.items()
                if data['sentiment_scores']
            }
            
            # Aggregate traveler personas
            country_travelers = defaultdict(int)
            for stakeholder in country_stakeholders:
                for persona, count in stakeholder['traveler_personas'].items():
                    country_travelers[persona] += count
            
            # Sector distribution
            from collections import Counter
            sector_dist = Counter(s['sector_category'] for s in country_stakeholders)
            
            country_data[country] = {
                'total_stakeholders': len(country_stakeholders),
                'total_reviews': total_reviews,
                'avg_sentiment': round(avg_sentiment, 3),
                'avg_rating': round(avg_rating, 2),
                'positive_rate': round(sum(s['positive_rate'] * s['total_reviews'] for s in country_stakeholders) / total_reviews, 1) if total_reviews > 0 else 0,
                'theme_analysis': theme_summary,
                'traveler_personas': dict(country_travelers),
                'sector_distribution': dict(sector_dist),
                'top_performers': sorted(country_stakeholders, 
                                       key=lambda x: x['avg_sentiment'], 
                                       reverse=True)[:5]
            }
        
        return country_data
    
    def integrate(self):
        """Integrate Gambia and regional data"""
        print("🔄 INTEGRATING GAMBIA + REGIONAL DATA")
        print("=" * 70)
        
        # Load Gambia data
        gambia_file = Path("../output/creative_industries_sentiment_analysis_results.json")
        with open(gambia_file, 'r') as f:
            gambia_data = json.load(f)
        
        print(f"✅ Loaded Gambia data: {len(gambia_data['stakeholder_data'])} stakeholders")
        
        # Load regional data
        regional_file = Path("../output/regional_sentiment/regional_sentiment_analysis.json")
        with open(regional_file, 'r') as f:
            regional_data = json.load(f)
        
        print(f"✅ Loaded Regional data: {len(regional_data['stakeholder_data'])} stakeholders")
        
        # Normalize Gambia stakeholders
        gambia_normalized = [
            self.normalize_gambia_stakeholder(s) 
            for s in gambia_data['stakeholder_data']
        ]
        
        print(f"✅ Normalized Gambia data to regional format")
        
        # Combine all stakeholders
        all_stakeholders = regional_data['stakeholder_data'] + gambia_normalized
        
        print(f"\n📊 COMBINED ANALYSIS:")
        print(f"   Total stakeholders: {len(all_stakeholders)}")
        print(f"   Total reviews: {sum(s['total_reviews'] for s in all_stakeholders):,}")
        
        # Regenerate country-level analysis
        country_insights = self.aggregate_by_country(all_stakeholders)
        
        # Calculate overall metrics
        total_reviews = sum(s['total_reviews'] for s in all_stakeholders)
        overall_summary = {
            'total_stakeholders': len(all_stakeholders),
            'total_reviews': total_reviews,
            'avg_sentiment': round(sum(s['avg_sentiment'] * s['total_reviews'] for s in all_stakeholders) / total_reviews, 3),
            'avg_rating': round(sum(s['avg_rating'] * s['total_reviews'] for s in all_stakeholders if s['avg_rating'] > 0) / total_reviews, 2),
            'countries_analyzed': len(country_insights),
            'gambia_rank': None,  # Will calculate
        }
        
        # Calculate Gambia's rank
        countries_by_sentiment = sorted(country_insights.items(), 
                                       key=lambda x: x[1]['avg_sentiment'], 
                                       reverse=True)
        for rank, (country, _) in enumerate(countries_by_sentiment, 1):
            if country == 'Gambia':
                overall_summary['gambia_rank'] = rank
                overall_summary['gambia_sentiment'] = country_insights['Gambia']['avg_sentiment']
                break
        
        # Create integrated results
        integrated_results = {
            'summary': overall_summary,
            'stakeholder_data': all_stakeholders,
            'by_country': country_insights,
            'by_sector': regional_data['by_sector'],  # Keep regional sector analysis
            'traveler_personas': regional_data['traveler_personas'],
            'gambia_comparison': {
                'rank': overall_summary['gambia_rank'],
                'sentiment': country_insights['Gambia']['avg_sentiment'],
                'regional_avg': round(sum(d['avg_sentiment'] for c, d in country_insights.items() if c != 'Gambia') / (len(country_insights) - 1), 3),
                'gap': round(country_insights['Gambia']['avg_sentiment'] - 
                           sum(d['avg_sentiment'] for c, d in country_insights.items() if c != 'Gambia') / (len(country_insights) - 1), 3),
            },
            'generated_at': datetime.now().isoformat()
        }
        
        # Save integrated results
        output_file = Path("../output/regional_sentiment/integrated_gambia_regional_analysis.json")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(integrated_results, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Saved integrated analysis: {output_file}")
        
        # Print summary
        self.print_summary(integrated_results)
        
        return integrated_results
    
    def print_summary(self, results: dict):
        """Print comprehensive summary"""
        print("\n" + "=" * 70)
        print("📊 INTEGRATED ANALYSIS SUMMARY")
        print("=" * 70)
        
        summary = results['summary']
        print(f"\n🌍 Overall (6 Countries):")
        print(f"   Total Stakeholders: {summary['total_stakeholders']}")
        print(f"   Total Reviews: {summary['total_reviews']:,}")
        print(f"   Avg Sentiment: {summary['avg_sentiment']:.3f}")
        print(f"   Avg Rating: {summary['avg_rating']:.1f}/5")
        
        print(f"\n🇬🇲 GAMBIA POSITION:")
        gambia_comp = results['gambia_comparison']
        print(f"   Rank: #{gambia_comp['rank']} out of 6 countries")
        print(f"   Sentiment: {gambia_comp['sentiment']:.3f}")
        print(f"   Regional Avg: {gambia_comp['regional_avg']:.3f}")
        print(f"   Gap: {gambia_comp['gap']:+.3f} {'(Above avg)' if gambia_comp['gap'] > 0 else '(Below avg)'}")
        
        print(f"\n📍 COUNTRY RANKINGS (by sentiment):")
        for rank, (country, data) in enumerate(sorted(results['by_country'].items(), 
                                                      key=lambda x: x[1]['avg_sentiment'], 
                                                      reverse=True), 1):
            marker = " 🇬🇲" if country == 'Gambia' else ""
            print(f"   {rank}. {country}{marker}: {data['avg_sentiment']:.3f} ({data['total_stakeholders']} stakeholders, {data['total_reviews']:,} reviews)")

if __name__ == "__main__":
    integrator = GambiaRegionalIntegrator()
    integrator.integrate()

