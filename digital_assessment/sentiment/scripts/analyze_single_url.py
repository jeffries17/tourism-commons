#!/usr/bin/env python3
"""
Single URL ITO Analysis Tool
Analyzes a single tour operator URL and outputs results
"""

import os
import sys
import json
import argparse
from datetime import datetime
from typing import Dict, Any

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

import requests
from bs4 import BeautifulSoup
from complete_ito_assessment import CompleteITOAssessment
from itos_data_models import ITOAssessment

def scrape_url(url: str) -> str:
    """Scrape content from URL"""
    try:
        print(f"🌐 Scraping: {url}")
        
        session = requests.Session()
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        response = session.get(url, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove scripts, styles, nav, footer
        for element in soup(['script', 'style', 'nav', 'footer', 'header']):
            element.decompose()
        
        text = soup.get_text()
        text = ' '.join(text.split())
        
        print(f"✅ Scraped {len(text)} characters")
        return text
        
    except Exception as e:
        print(f"❌ Failed to scrape: {e}")
        return ""

def analyze_url(url: str, operator_name: str = None, country: str = None) -> Dict[str, Any]:
    """Analyze a single URL and return results"""
    
    # Extract operator name from URL if not provided
    if not operator_name:
        operator_name = url.split('//')[1].split('/')[0].replace('www.', '')
        operator_name = operator_name.replace('.com', '').replace('.co.uk', '').replace('.org', '')
        operator_name = operator_name.replace('-', ' ').replace('_', ' ').title()
    
    if not country:
        country = "Unknown"
    
    print(f"📊 Analyzing: {operator_name}")
    print(f"🌍 Country: {country}")
    print(f"🔗 URL: {url}")
    print("-" * 60)
    
    # Scrape content
    content = scrape_url(url)
    if not content:
        return {
            "error": "Failed to scrape content from URL",
            "operator_name": operator_name,
            "url": url
        }
    
    # Run analysis
    print("🔍 Running analysis...")
    assessor = CompleteITOAssessment()
    
    # Create a basic data dict for the assessor
    ito_data = {
        'operator_name': operator_name,
        'country': country,
        'website_url': "",
        'gambia_page_url': url,
        'gambia_tour_pages': []
    }
    
    assessment = assessor.assess_ito(ito_data, {'content': content})
    
    # Format results
    results = {
        "operator_name": operator_name,
        "country": country,
        "url": url,
        "analysis_timestamp": datetime.now().isoformat(),
        "content_length": len(content),
        "scrape_success": True,
        "assessment": assessment.to_dict()
    }
    
    return results

def print_results(results: Dict[str, Any]):
    """Print formatted results to console"""
    
    if "error" in results:
        print(f"❌ Error: {results['error']}")
        return
    
    assessment = results["assessment"]
    activities = assessment.get("activity_presence", {})
    
    print("\n" + "=" * 60)
    print("📊 ITO ASSESSMENT RESULTS")
    print("=" * 60)
    
    print(f"\n🏢 OPERATOR INFO")
    print(f"   Name: {results['operator_name']}")
    print(f"   Country: {results['country']}")
    print(f"   URL: {results['url']}")
    print(f"   Content: {results['content_length']:,} characters")
    
    print(f"\n📈 PRODUCT ANALYSIS")
    print(f"   Type: {assessment.get('product_type', 'Unknown')}")
    print(f"   Visibility: {assessment.get('visibility_level', 'Unknown')}")
    print(f"   Itinerary Depth: {assessment.get('itinerary_depth', {}).get('gambia_percentage', 'Unknown')}%")
    print(f"   Detail Level: {assessment.get('itinerary_depth', {}).get('detail_level', 'Unknown')}")
    
    print(f"\n🏖️  TOURISM CORE ACTIVITIES")
    tourism_core = [
        ("Sun & Beach", activities.get("sun_beach", False)),
        ("Nature & Wildlife", activities.get("nature_wildlife", False)),
        ("Adventure", activities.get("adventure", False)),
        ("Culture & Heritage", activities.get("culture_heritage", False))
    ]
    
    for name, present in tourism_core:
        status = "✅ Yes" if present else "❌ No"
        print(f"   {name:<20} {status}")
    
    print(f"\n🎨 CREATIVE INDUSTRIES")
    creative_industries = [
        ("Festivals & Events", activities.get("festivals_events", False)),
        ("Audiovisual", activities.get("audiovisual", False)),
        ("Marketing/Advertising", activities.get("marketing_advertising_publishing", False)),
        ("Crafts & Artisan", activities.get("crafts_artisan", False)),
        ("Fashion & Design", activities.get("fashion_design", False)),
        ("Music", activities.get("music", False)),
        ("Performing & Visual Arts", activities.get("performing_visual_arts", False)),
        ("Heritage Sites & Museums", activities.get("heritage_sites_museums", False))
    ]
    
    for name, present in creative_industries:
        status = "✅ Yes" if present else "❌ No"
        print(f"   {name:<20} {status}")
    
    # Count activities
    total_activities = sum(activities.values())
    tourism_count = sum([activities.get(k, False) for k in ["sun_beach", "nature_wildlife", "adventure", "culture_heritage"]])
    creative_count = sum([activities.get(k, False) for k in ["festivals_events", "audiovisual", "marketing_advertising_publishing", "crafts_artisan", "fashion_design", "music", "performing_visual_arts", "heritage_sites_museums"]])
    
    print(f"\n📊 SUMMARY")
    print(f"   Total Activities: {total_activities}/12")
    print(f"   Tourism Core: {tourism_count}/4")
    print(f"   Creative Industries: {creative_count}/8")
    
    print(f"\n🎯 TARGET AUDIENCES")
    audiences = assessment.get("target_audiences", {})
    if audiences:
        for audience, confidence in audiences.items():
            print(f"   {audience}: {confidence:.1%} confidence")
    else:
        print("   No specific audiences detected")
    
    print(f"\n💰 OTHER METRICS")
    print(f"   Price Transparency: {assessment.get('price_transparency', 'Unknown')}")
    print(f"   Language Availability: {assessment.get('language_availability', 'Unknown')}")
    print(f"   Local Partnerships: {assessment.get('local_integration', {}).get('partnerships', 'Unknown')}")
    print(f"   Seasonality: {assessment.get('seasonality_framing', 'Unknown')}")

def main():
    parser = argparse.ArgumentParser(description='Analyze a single tour operator URL')
    parser.add_argument('url', help='URL to analyze')
    parser.add_argument('--name', help='Operator name (optional)')
    parser.add_argument('--country', help='Country (optional)')
    parser.add_argument('--output', help='Output file (JSON)')
    parser.add_argument('--quiet', action='store_true', help='Quiet mode (JSON output only)')
    
    args = parser.parse_args()
    
    # Validate URL
    if not args.url.startswith(('http://', 'https://')):
        args.url = 'https://' + args.url
    
    # Run analysis
    results = analyze_url(args.url, args.name, args.country)
    
    # Output results
    if args.quiet:
        print(json.dumps(results, indent=2))
    else:
        print_results(results)
    
    # Save to file if requested
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\n💾 Results saved to: {args.output}")

if __name__ == "__main__":
    main()
