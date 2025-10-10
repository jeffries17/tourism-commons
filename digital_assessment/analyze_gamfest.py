#!/usr/bin/env python3
"""
Comprehensive Discovery and Analysis for GamFest/GamMusic Festival
Replaces incorrect "Gambi Fest" data
"""

import os
import sys
sys.path.append(os.path.dirname(__file__))

from regional_competitor_analyzer import RegionalCompetitorAnalyzer

def main():
    print("\n" + "="*80)
    print("GAMFEST/GAMMUSIC FESTIVAL - COMPREHENSIVE ANALYSIS")
    print("="*80)
    
    print("\nSearch Terms to Use:")
    print("  - GamMusic Festival Gambia")
    print("  - GamFestival Gambia")
    print("  - Music Union of The Gambia / MUSIGAM")
    print("  - Galla Awards Gambia / Gala Awards Gambia")
    
    print("\nKey Information:")
    print("  - Official names: GamMusic Festival, GamFestival")
    print("  - Implementing org: Music Union of The Gambia (MUSIGAM)")
    print("  - 500+ artist members")
    print("  - Reviving iconic national cultural event")
    print("  - Includes Galla Awards Night")
    print("  - Contact: Mr. Momodou M. Sarr, Kairaba Avenue, KMC")
    
    print("\n" + "="*80)
    print("RUNNING PHASE 1: URL DISCOVERY")
    print("="*80)
    
    analyzer = RegionalCompetitorAnalyzer(verbose=True)
    
    # Try multiple search variations
    search_variations = [
        ("GamMusic Festival", "The Gambia", "Festivals and cultural events"),
        ("GamFestival Gambia", "The Gambia", "Festivals and cultural events"),
        ("Music Union of The Gambia MUSIGAM", "The Gambia", "Festivals and cultural events"),
    ]
    
    all_results = {}
    
    for name, country, sector in search_variations:
        print(f"\n{'='*80}")
        print(f"Searching: {name}")
        print(f"{'='*80}")
        
        presence = analyzer.discover_digital_presence(name, country, sector)
        
        # Merge results (keep non-empty values)
        for key, value in presence.items():
            if value and (key not in all_results or not all_results[key]):
                all_results[key] = value
        
        # Print what we found
        found = [k for k, v in presence.items() if v and not k.startswith('_')]
        if found:
            print(f"✅ Found: {', '.join(found)}")
        else:
            print(f"⚠️  No results for this variation")
    
    print("\n" + "="*80)
    print("CONSOLIDATED URL DISCOVERY RESULTS")
    print("="*80)
    
    for platform, url in all_results.items():
        if url and not platform.startswith('_'):
            print(f"  {platform.upper()}: {url}")
    
    if not any(v for k, v in all_results.items() if not k.startswith('_')):
        print("  ⚠️  No URLs discovered - may need manual search")
        print("\n  Recommended manual searches:")
        print("  - Facebook: search 'GamMusic Festival' or 'MUSIGAM'")
        print("  - Instagram: @gambifest, @musigam, @gamfestival")
        print("  - Google: 'Music Union of The Gambia'")
        return
    
    print("\n" + "="*80)
    print("RUNNING PHASE 2: DEEP ANALYSIS")
    print("="*80)
    
    # Run full analysis with discovered URLs
    final_assessment = analyzer.analyze_stakeholder(
        name="GamMusic Festival (GamFest)",
        country="The Gambia",
        sector="Festivals and cultural events",
        urls={
            'website': all_results.get('website'),
            'facebook': all_results.get('facebook'),
            'instagram': all_results.get('instagram'),
            'tripadvisor': all_results.get('tripadvisor'),
            'youtube': all_results.get('youtube'),
            'linkedin': all_results.get('linkedin'),
        }
    )
    
    print("\n" + "="*80)
    print("ANALYSIS COMPLETE - SCORES")
    print("="*80)
    
    scores = final_assessment.get('scores', {})
    for category, score in scores.items():
        if isinstance(score, (int, float)):
            print(f"  {category}: {score}")
    
    print("\n" + "="*80)
    print("NEXT STEPS")
    print("="*80)
    print("1. Review the discovered URLs above")
    print("2. Update the 'Gambi Fest' row in CI Assessment sheet:")
    print("   - Change name to: GamMusic Festival (GamFest)")
    print("   - Update all discovered URLs")
    print("   - Update scores based on analysis")
    print("3. Add notes about MUSIGAM connection and Galla Awards")
    print("="*80)
    
    return final_assessment


if __name__ == '__main__':
    result = main()

