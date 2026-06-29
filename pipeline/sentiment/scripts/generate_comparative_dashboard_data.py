#!/usr/bin/env python3
"""
Generate comprehensive dashboard data with Gambia vs Regional comparisons
Includes sector analysis, theme insights, and learning opportunities
"""

import json
from pathlib import Path
from collections import defaultdict
from datetime import datetime

class ComparativeDashboardGenerator:
    def __init__(self):
        self.data_file = Path("../output/regional_sentiment/integrated_gambia_regional_analysis.json")
        self.output_dir = Path("../../dashboard/public")
    
    def load_data(self):
        """Load integrated analysis data"""
        with open(self.data_file, 'r') as f:
            return json.load(f)
    
    def analyze_by_sector(self, data: dict) -> dict:
        """Detailed sector-by-sector comparison"""
        sectors = {}
        
        # Group stakeholders by sector
        for stakeholder in data['stakeholder_data']:
            sector = stakeholder['sector_category']
            if sector not in sectors:
                sectors[sector] = defaultdict(list)
            
            country = stakeholder['country']
            sectors[sector][country].append({
                'name': stakeholder['stakeholder_name'],
                'sentiment': stakeholder['avg_sentiment'],
                'rating': stakeholder['avg_rating'],
                'reviews': stakeholder['total_reviews'],
                'positive_rate': stakeholder['positive_rate'],
                'themes': stakeholder['theme_analysis']
            })
        
        # Calculate sector averages per country
        sector_analysis = {}
        for sector, countries in sectors.items():
            sector_stats = {}
            gambia_data = None
            regional_avg = []
            
            for country, stakeholders in countries.items():
                total_reviews = sum(s['reviews'] for s in stakeholders)
                avg_sentiment = sum(s['sentiment'] * s['reviews'] for s in stakeholders) / total_reviews if total_reviews > 0 else 0
                avg_rating = sum(s['rating'] * s['reviews'] for s in stakeholders if s['rating'] > 0) / total_reviews if total_reviews > 0 else 0
                
                country_data = {
                    'stakeholder_count': len(stakeholders),
                    'total_reviews': total_reviews,
                    'avg_sentiment': round(avg_sentiment, 3),
                    'avg_rating': round(avg_rating, 2),
                    'top_performer': max(stakeholders, key=lambda x: x['sentiment']) if stakeholders else None
                }
                
                sector_stats[country] = country_data
                
                if country == 'Gambia':
                    gambia_data = country_data
                else:
                    regional_avg.append(avg_sentiment)
            
            # Calculate gap if Gambia has data in this sector
            if gambia_data and regional_avg:
                regional_avg_sentiment = sum(regional_avg) / len(regional_avg)
                gap = gambia_data['avg_sentiment'] - regional_avg_sentiment
                gambia_rank = sum(1 for c, d in sector_stats.items() if d['avg_sentiment'] > gambia_data['avg_sentiment']) + 1
            else:
                gap = None
                gambia_rank = None
            
            sector_analysis[sector] = {
                'by_country': sector_stats,
                'gambia_position': {
                    'has_data': gambia_data is not None,
                    'rank': gambia_rank,
                    'gap': round(gap, 3) if gap is not None else None,
                    'status': 'Leading' if gap and gap > 0.1 else ('Competitive' if gap and gap > -0.05 else 'Growth Opportunity')
                } if gambia_data else None
            }
        
        return sector_analysis
    
    def analyze_themes(self, data: dict) -> dict:
        """Analyze performance by theme across countries"""
        themes = defaultdict(lambda: defaultdict(list))
        
        # Collect theme scores by country
        for stakeholder in data['stakeholder_data']:
            country = stakeholder['country']
            for theme, theme_data in stakeholder['theme_analysis'].items():
                themes[theme][country].append({
                    'sentiment': theme_data['avg_sentiment'],
                    'stakeholder': stakeholder['stakeholder_name'],
                    'mentions': theme_data.get('mentions', theme_data.get('reviews_mentioning', 0))
                })
        
        # Calculate theme averages
        theme_analysis = {}
        for theme, countries in themes.items():
            theme_stats = {}
            gambia_score = None
            regional_scores = []
            
            for country, scores in countries.items():
                avg_score = sum(s['sentiment'] for s in scores) / len(scores) if scores else 0
                total_mentions = sum(s['mentions'] for s in scores)
                
                theme_stats[country] = {
                    'avg_sentiment': round(avg_score, 3),
                    'stakeholder_count': len(scores),
                    'total_mentions': total_mentions,
                    'top_performer': max(scores, key=lambda x: x['sentiment'])['stakeholder'] if scores else None
                }
                
                if country == 'Gambia':
                    gambia_score = avg_score
                else:
                    regional_scores.append(avg_score)
            
            # Calculate Gambia's position on this theme
            if gambia_score is not None and regional_scores:
                regional_avg = sum(regional_scores) / len(regional_scores)
                gap = gambia_score - regional_avg
                rank = sum(1 for c, d in theme_stats.items() if d['avg_sentiment'] > gambia_score) + 1
                
                theme_analysis[theme] = {
                    'by_country': theme_stats,
                    'gambia_position': {
                        'score': round(gambia_score, 3),
                        'rank': rank,
                        'gap': round(gap, 3),
                        'regional_avg': round(regional_avg, 3),
                        'status': 'Strength' if gap > 0.05 else ('Competitive' if gap > -0.05 else 'Improvement Area')
                    }
                }
            else:
                theme_analysis[theme] = {
                    'by_country': theme_stats,
                    'gambia_position': None
                }
        
        return theme_analysis
    
    def identify_learning_opportunities(self, data: dict) -> dict:
        """Identify specific learning opportunities from top performers"""
        opportunities = {
            'top_performers_by_sector': {},
            'theme_leaders': {},
            'best_practices': []
        }
        
        # Get top 3 performers in each sector (non-Gambia)
        sectors = defaultdict(list)
        for stakeholder in data['stakeholder_data']:
            if stakeholder['country'] != 'Gambia':
                sectors[stakeholder['sector_category']].append(stakeholder)
        
        for sector, stakeholders in sectors.items():
            top_3 = sorted(stakeholders, key=lambda x: x['avg_sentiment'], reverse=True)[:3]
            opportunities['top_performers_by_sector'][sector] = [
                {
                    'name': s['stakeholder_name'],
                    'country': s['country'],
                    'sentiment': s['avg_sentiment'],
                    'rating': s['avg_rating'],
                    'reviews': s['total_reviews'],
                    'top_themes': s['top_themes'][:2],
                    'positive_rate': s['positive_rate']
                }
                for s in top_3
            ]
        
        # Identify theme leaders
        themes = defaultdict(list)
        for stakeholder in data['stakeholder_data']:
            for theme, theme_data in stakeholder['theme_analysis'].items():
                themes[theme].append({
                    'stakeholder': stakeholder['stakeholder_name'],
                    'country': stakeholder['country'],
                    'sentiment': theme_data['avg_sentiment'],
                    'sector': stakeholder['sector_category']
                })
        
        for theme, scores in themes.items():
            # Get top 3, excluding Gambia
            non_gambia = [s for s in scores if s['country'] != 'Gambia']
            top_3 = sorted(non_gambia, key=lambda x: x['sentiment'], reverse=True)[:3]
            
            # Get Gambia's best in this theme
            gambia_best = [s for s in scores if s['country'] == 'Gambia']
            gambia_best = sorted(gambia_best, key=lambda x: x['sentiment'], reverse=True)[:1]
            
            opportunities['theme_leaders'][theme] = {
                'regional_leaders': top_3,
                'gambia_best': gambia_best[0] if gambia_best else None
            }
        
        # Generate best practices based on Nigeria (top performer)
        nigeria_stakeholders = [s for s in data['stakeholder_data'] if s['country'] == 'Nigeria']
        nigeria_themes = defaultdict(list)
        
        for stakeholder in nigeria_stakeholders:
            for theme, theme_data in stakeholder['theme_analysis'].items():
                nigeria_themes[theme].append(theme_data['avg_sentiment'])
        
        nigeria_avg_themes = {
            theme: round(sum(scores) / len(scores), 3)
            for theme, scores in nigeria_themes.items()
            if scores
        }
        
        # Compare with Gambia
        gambia_stakeholders = [s for s in data['stakeholder_data'] if s['country'] == 'Gambia']
        gambia_themes = defaultdict(list)
        
        for stakeholder in gambia_stakeholders:
            for theme, theme_data in stakeholder['theme_analysis'].items():
                gambia_themes[theme].append(theme_data['avg_sentiment'])
        
        gambia_avg_themes = {
            theme: round(sum(scores) / len(scores), 3)
            for theme, scores in gambia_themes.items()
            if scores
        }
        
        # Identify gaps
        for theme in set(list(nigeria_avg_themes.keys()) + list(gambia_avg_themes.keys())):
            nigeria_score = nigeria_avg_themes.get(theme, 0)
            gambia_score = gambia_avg_themes.get(theme, 0)
            gap = nigeria_score - gambia_score
            
            if gap > 0.1:  # Significant gap
                opportunities['best_practices'].append({
                    'theme': theme,
                    'nigeria_score': nigeria_score,
                    'gambia_score': gambia_score,
                    'gap': round(gap, 3),
                    'recommendation': self.generate_recommendation(theme, gap)
                })
        
        # Sort by gap
        opportunities['best_practices'].sort(key=lambda x: x['gap'], reverse=True)
        
        return opportunities
    
    def generate_recommendation(self, theme: str, gap: float) -> str:
        """Generate contextual recommendations"""
        recommendations = {
            'staff_service': 'Focus on staff training and customer service excellence',
            'facilities_infrastructure': 'Invest in facility upgrades and maintenance',
            'educational_value': 'Enhance interpretive materials and guided tour quality',
            'art_creativity': 'Showcase more diverse artistic expressions and exhibitions',
            'cultural_heritage': 'Strengthen cultural authenticity and storytelling',
            'atmosphere_experience': 'Improve overall visitor experience and ambiance',
            'value_pricing': 'Review pricing strategy and value proposition',
            'accessibility_location': 'Improve access, signage, and transportation options'
        }
        
        return recommendations.get(theme, f'Study top performers in {theme.replace("_", " ")}')
    
    def generate_dashboard_data(self):
        """Generate comprehensive dashboard data"""
        print("📊 GENERATING COMPARATIVE DASHBOARD DATA")
        print("=" * 70)
        
        # Load integrated data
        data = self.load_data()
        print(f"✅ Loaded data: {len(data['stakeholder_data'])} stakeholders")
        
        # Generate sector analysis
        print("🎯 Analyzing by sector...")
        sector_analysis = self.analyze_by_sector(data)
        
        # Generate theme analysis
        print("🎨 Analyzing by theme...")
        theme_analysis = self.analyze_themes(data)
        
        # Identify learning opportunities
        print("💡 Identifying learning opportunities...")
        learning_opportunities = self.identify_learning_opportunities(data)
        
        # Compile dashboard data
        dashboard_data = {
            'overview': {
                'gambia': {
                    'stakeholder_count': len([s for s in data['stakeholder_data'] if s['country'] == 'Gambia']),
                    'total_reviews': sum(s['total_reviews'] for s in data['stakeholder_data'] if s['country'] == 'Gambia'),
                    'avg_sentiment': data['gambia_comparison']['sentiment'],
                    'avg_rating': round(sum(s['avg_rating'] * s['total_reviews'] for s in data['stakeholder_data'] if s['country'] == 'Gambia' and s['avg_rating'] > 0) / 
                                      sum(s['total_reviews'] for s in data['stakeholder_data'] if s['country'] == 'Gambia' and s['avg_rating'] > 0), 2),
                    'rank': data['gambia_comparison']['rank'],
                    'gap_vs_regional': data['gambia_comparison']['gap']
                },
                'regional': {
                    'total_stakeholders': data['summary']['total_stakeholders'],
                    'total_reviews': data['summary']['total_reviews'],
                    'avg_sentiment': data['gambia_comparison']['regional_avg'],
                    'avg_rating': data['summary']['avg_rating'],
                    'countries': list(data['by_country'].keys())
                }
            },
            'country_rankings': [
                {
                    'rank': idx + 1,
                    'country': country,
                    'sentiment': country_data['avg_sentiment'],
                    'rating': country_data['avg_rating'],
                    'stakeholders': country_data['total_stakeholders'],
                    'reviews': country_data['total_reviews'],
                    'positive_rate': country_data['positive_rate'],
                    'is_gambia': country == 'Gambia'
                }
                for idx, (country, country_data) in enumerate(
                    sorted(data['by_country'].items(), key=lambda x: x[1]['avg_sentiment'], reverse=True)
                )
            ],
            'sector_analysis': sector_analysis,
            'theme_analysis': theme_analysis,
            'learning_opportunities': learning_opportunities,
            'by_country': data['by_country'],
            'metadata': {
                'generated_at': datetime.now().isoformat(),
                'total_countries': len(data['by_country']),
                'total_stakeholders': len(data['stakeholder_data']),
                'total_reviews': data['summary']['total_reviews']
            }
        }
        
        # Save to dashboard public folder
        output_file = self.output_dir / "comparative_sentiment_data.json"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(dashboard_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Dashboard data saved: {output_file}")
        
        # Print summary
        self.print_summary(dashboard_data)
        
        return dashboard_data
    
    def print_summary(self, data: dict):
        """Print generation summary"""
        print("\n" + "=" * 70)
        print("📊 DASHBOARD DATA SUMMARY")
        print("=" * 70)
        
        print(f"\n🇬🇲 Gambia Overview:")
        gambia = data['overview']['gambia']
        print(f"   Rank: #{gambia['rank']} out of {data['metadata']['total_countries']} countries")
        print(f"   Sentiment: {gambia['avg_sentiment']:.3f}")
        print(f"   Gap vs Regional: {gambia['gap_vs_regional']:+.3f}")
        
        print(f"\n🎯 Sector Analysis Generated:")
        for sector, sector_data in data['sector_analysis'].items():
            if sector_data['gambia_position']:
                gp = sector_data['gambia_position']
                if gp['has_data']:
                    print(f"   • {sector}: Rank #{gp['rank']}, Gap {gp['gap']:+.3f} ({gp['status']})")
        
        print(f"\n🎨 Theme Analysis Generated:")
        gambia_themes = {theme: theme_data['gambia_position'] 
                        for theme, theme_data in data['theme_analysis'].items() 
                        if theme_data['gambia_position']}
        
        strengths = [(t, p) for t, p in gambia_themes.items() if p['status'] == 'Strength']
        improvements = [(t, p) for t, p in gambia_themes.items() if p['status'] == 'Improvement Area']
        
        print(f"   Strengths ({len(strengths)}): {', '.join(t.replace('_', ' ') for t, _ in strengths[:3])}")
        print(f"   Improvement Areas ({len(improvements)}): {', '.join(t.replace('_', ' ') for t, _ in improvements[:3])}")
        
        print(f"\n💡 Learning Opportunities:")
        print(f"   Best Practices Identified: {len(data['learning_opportunities']['best_practices'])}")
        print(f"   Sectors Analyzed: {len(data['learning_opportunities']['top_performers_by_sector'])}")

if __name__ == "__main__":
    generator = ComparativeDashboardGenerator()
    generator.generate_dashboard_data()

