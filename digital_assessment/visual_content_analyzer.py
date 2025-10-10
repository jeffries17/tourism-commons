#!/usr/bin/env python3
"""
Visual Content Analysis Enhancement using Google Vision API
Test with 5 entities first to validate methodology
"""

import os
import json
import requests
from typing import Dict, List
from google.oauth2 import service_account
from googleapiclient.discovery import build
from google.cloud import vision
from bs4 import BeautifulSoup
import time

SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDS_FILE = '../tourism-development-d620c-5c9db9e21301.json'
USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'

# Check if Vision API credentials are available
VISION_ENABLED = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS') is not None


class VisualContentAnalyzer:
    """Analyze visual content quality using Google Vision API"""
    
    def __init__(self, test_mode=True):
        self.test_mode = test_mode
        self.sheets_service = self._get_sheets_service()
        
        if VISION_ENABLED:
            self.vision_client = vision.ImageAnnotatorClient()
            print("✅ Google Vision API enabled")
        else:
            self.vision_client = None
            print("⚠️  Google Vision API not configured - running in analysis-only mode")
            print("   Set GOOGLE_APPLICATION_CREDENTIALS to enable image quality analysis")
    
    def _get_sheets_service(self):
        """Initialize Google Sheets API"""
        with open(CREDS_FILE, 'r') as f:
            creds_dict = json.load(f)
        
        credentials = service_account.Credentials.from_service_account_info(
            creds_dict,
            scopes=['https://www.googleapis.com/auth/spreadsheets']
        )
        return build('sheets', 'v4', credentials=credentials)
    
    def get_entity_urls(self, entity_name: str) -> Dict:
        """Get all URLs for an entity from Regional Assessment"""
        
        result = self.sheets_service.spreadsheets().values().get(
            spreadsheetId=SHEET_ID,
            range='Regional Assessment!A:AC'
        ).execute()
        
        rows = result.get('values', [])
        
        for row in rows[1:]:  # Skip header
            if not row or not row[0]:
                continue
            
            if row[0].strip().lower() == entity_name.lower():
                return {
                    'name': row[0],
                    'sector': row[1] if len(row) > 1 else 'Unknown',
                    'country': row[2] if len(row) > 2 else 'Unknown',
                    'website': row[23] if len(row) > 23 and row[23] else None,
                    'facebook': row[24] if len(row) > 24 and row[24] else None,
                    'instagram': row[25] if len(row) > 25 and row[25] else None,
                    'tripadvisor': row[26] if len(row) > 26 and row[26] else None,
                    'youtube': row[27] if len(row) > 27 and row[27] else None,
                    'linkedin': row[28] if len(row) > 28 and row[28] else None,
                }
        
        return None
    
    def scrape_images_from_url(self, url: str, max_images: int = 10) -> List[str]:
        """Scrape image URLs from a website"""
        
        if not url:
            return []
        
        print(f"  Scraping images from: {url}")
        
        try:
            response = requests.get(url, headers={'User-Agent': USER_AGENT}, timeout=15)
            if response.status_code != 200:
                print(f"    ⚠️  HTTP {response.status_code}")
                return []
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find all img tags
            img_tags = soup.find_all('img', src=True)
            
            image_urls = []
            for img in img_tags[:max_images]:
                src = img.get('src', '')
                
                # Skip tiny images, icons, logos
                if any(skip in src.lower() for skip in ['logo', 'icon', 'avatar', 'button', 'pixel']):
                    continue
                
                # Handle relative URLs
                if src.startswith('//'):
                    src = 'https:' + src
                elif src.startswith('/'):
                    from urllib.parse import urljoin
                    src = urljoin(url, src)
                elif not src.startswith('http'):
                    continue
                
                image_urls.append(src)
            
            print(f"    ✅ Found {len(image_urls)} images")
            return image_urls[:max_images]
            
        except Exception as e:
            print(f"    ❌ Error: {e}")
            return []
    
    def analyze_image_with_vision(self, image_url: str) -> Dict:
        """Analyze a single image with Google Vision API"""
        
        if not self.vision_client:
            return {'error': 'Vision API not configured'}
        
        try:
            # Create image object from URL
            image = vision.Image()
            image.source.image_uri = image_url
            
            # Analyze image properties, labels, and quality
            response = self.vision_client.annotate_image({
                'image': image,
                'features': [
                    {'type_': vision.Feature.Type.IMAGE_PROPERTIES},
                    {'type_': vision.Feature.Type.LABEL_DETECTION, 'max_results': 10},
                    {'type_': vision.Feature.Type.FACE_DETECTION, 'max_results': 5},
                    {'type_': vision.Feature.Type.OBJECT_LOCALIZATION, 'max_results': 10},
                ]
            })
            
            # Extract useful information
            analysis = {
                'url': image_url,
                'dominant_colors': [],
                'labels': [],
                'faces_detected': 0,
                'objects': [],
                'quality_score': 0,
                'cultural_relevance': 0
            }
            
            # Color analysis
            if response.image_properties_annotation:
                colors = response.image_properties_annotation.dominant_colors.colors[:3]
                analysis['dominant_colors'] = [
                    {
                        'rgb': (c.color.red, c.color.green, c.color.blue),
                        'score': c.score,
                        'pixel_fraction': c.pixel_fraction
                    }
                    for c in colors
                ]
            
            # Label detection (what's in the image)
            if response.label_annotations:
                analysis['labels'] = [
                    {'description': label.description, 'score': label.score}
                    for label in response.label_annotations
                ]
            
            # Face detection
            if response.face_annotations:
                analysis['faces_detected'] = len(response.face_annotations)
            
            # Object detection
            if response.localized_object_annotations:
                analysis['objects'] = [
                    {'name': obj.name, 'score': obj.score}
                    for obj in response.localized_object_annotations
                ]
            
            # Calculate quality score (0-10)
            # Based on: number of relevant labels, color diversity, composition
            quality_factors = []
            
            # Label relevance and diversity
            if len(analysis['labels']) >= 5:
                quality_factors.append(3)
            elif len(analysis['labels']) >= 3:
                quality_factors.append(2)
            elif len(analysis['labels']) >= 1:
                quality_factors.append(1)
            
            # Color diversity
            if len(analysis['dominant_colors']) >= 2:
                quality_factors.append(2)
            
            # Human presence (good for cultural content)
            if analysis['faces_detected'] > 0:
                quality_factors.append(2)
            
            # Object detection success
            if len(analysis['objects']) >= 3:
                quality_factors.append(2)
            
            # Professional composition indicator
            if len(analysis['labels']) >= 5 and len(analysis['dominant_colors']) >= 2:
                quality_factors.append(1)
            
            analysis['quality_score'] = min(10, sum(quality_factors))
            
            # Calculate cultural relevance (0-10)
            cultural_keywords = [
                'art', 'culture', 'traditional', 'performance', 'museum', 'gallery',
                'fashion', 'design', 'craft', 'festival', 'music', 'dance', 'theater',
                'heritage', 'costume', 'instrument', 'sculpture', 'painting'
            ]
            
            cultural_matches = sum(
                1 for label in analysis['labels']
                if any(keyword in label['description'].lower() for keyword in cultural_keywords)
            )
            
            analysis['cultural_relevance'] = min(10, cultural_matches * 2)
            
            return analysis
            
        except Exception as e:
            return {'error': str(e), 'url': image_url}
    
    def analyze_entity(self, entity_name: str) -> Dict:
        """Complete visual content analysis for one entity"""
        
        print(f"\n{'='*80}")
        print(f"ANALYZING: {entity_name}")
        print(f"{'='*80}")
        
        # Get URLs
        urls = self.get_entity_urls(entity_name)
        if not urls:
            print(f"❌ Entity not found in Regional Assessment")
            return None
        
        print(f"Country: {urls['country']} | Sector: {urls['sector']}")
        print()
        
        # Collect all images
        all_images = []
        
        # From website
        if urls['website']:
            website_images = self.scrape_images_from_url(urls['website'], max_images=8)
            all_images.extend(website_images)
        
        # Note: Social media scraping is complex due to authentication requirements
        # For now, we'll focus on website images
        # Facebook/Instagram would require API access or specialized scraping
        
        print(f"\n📸 Total images found: {len(all_images)}")
        
        if not all_images:
            print("⚠️  No images found to analyze")
            return {
                'name': entity_name,
                'country': urls['country'],
                'sector': urls['sector'],
                'images_analyzed': 0,
                'avg_quality_score': 0,
                'avg_cultural_relevance': 0,
                'visual_content_score': 0,
                'notes': 'No images found'
            }
        
        # Analyze images with Vision API
        if self.vision_client and not self.test_mode:
            print("\n🔍 Analyzing image quality with Google Vision API...")
            
            analyses = []
            for i, img_url in enumerate(all_images[:8], 1):  # Analyze up to 8 images
                print(f"  [{i}/{min(len(all_images), 8)}] Analyzing...")
                analysis = self.analyze_image_with_vision(img_url)
                if 'error' not in analysis:
                    analyses.append(analysis)
                    print(f"      Quality: {analysis['quality_score']}/10, Cultural: {analysis['cultural_relevance']}/10")
                else:
                    print(f"      ⚠️  {analysis['error']}")
                
                time.sleep(0.5)  # Rate limiting
            
            # Calculate scores
            if analyses:
                avg_quality = sum(a['quality_score'] for a in analyses) / len(analyses)
                avg_cultural = sum(a['cultural_relevance'] for a in analyses) / len(analyses)
                
                # New visual content score (0-10)
                # Based on: quantity, quality, and cultural relevance
                quantity_score = min(3, len(all_images) / 2)  # 0-3 points
                quality_score = min(4, avg_quality / 2.5)      # 0-4 points
                cultural_score = min(3, avg_cultural / 3.3)    # 0-3 points
                
                visual_content_score = round(quantity_score + quality_score + cultural_score, 1)
            else:
                avg_quality = 0
                avg_cultural = 0
                visual_content_score = 0
                analyses = []
        else:
            print("\n⚠️  Vision API analysis skipped (test mode or not configured)")
            avg_quality = 0
            avg_cultural = 0
            visual_content_score = len(all_images) / 2  # Simple count-based score
            analyses = []
        
        result = {
            'name': entity_name,
            'country': urls['country'],
            'sector': urls['sector'],
            'urls': urls,
            'images_found': len(all_images),
            'images_analyzed': len(analyses),
            'avg_quality_score': round(avg_quality, 2),
            'avg_cultural_relevance': round(avg_cultural, 2),
            'visual_content_score': round(visual_content_score, 1),
            'image_analyses': analyses[:3] if analyses else [],  # Include top 3 for review
            'notes': 'Analysis complete'
        }
        
        print(f"\n📊 RESULTS:")
        print(f"  Images found: {result['images_found']}")
        print(f"  Images analyzed: {result['images_analyzed']}")
        print(f"  Avg Quality Score: {result['avg_quality_score']}/10")
        print(f"  Avg Cultural Relevance: {result['avg_cultural_relevance']}/10")
        print(f"  Visual Content Score: {result['visual_content_score']}/10")
        
        return result


def main():
    """Test with 5 entities"""
    
    print("="*80)
    print("VISUAL CONTENT ANALYSIS - PILOT TEST")
    print("Testing methodology with 5 entities")
    print("="*80)
    
    # Select 5 diverse entities for testing
    # Mix of countries, sectors, and expected performance levels
    test_entities = [
        "Musée des Civilisations Noires (Dakar)",  # Senegal - Museum
        "Burna Boy (artist)",                       # Nigeria - Music
        "Pistis (Accra)",                          # Ghana - Fashion
        "Canal 3 Bénin",                           # Benin - Audiovisual
        "Palácio da Cultura Ildo Lobo (Praia)",    # Cape Verde - Performing Arts
    ]
    
    analyzer = VisualContentAnalyzer(test_mode=False)
    
    results = []
    for i, entity in enumerate(test_entities, 1):
        print(f"\n[{i}/{len(test_entities)}]")
        try:
            result = analyzer.analyze_entity(entity)
            if result:
                results.append(result)
        except Exception as e:
            print(f"❌ Error analyzing {entity}: {e}")
            import traceback
            traceback.print_exc()
    
    # Save results
    output_file = f"visual_analysis_pilot_{len(results)}_entities.json"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print("\n" + "="*80)
    print("PILOT TEST COMPLETE")
    print("="*80)
    print(f"✅ Analyzed {len(results)}/{len(test_entities)} entities")
    print(f"📄 Results saved to: {output_file}")
    
    if results:
        avg_images = sum(r.get('images_found', 0) for r in results) / len(results)
        avg_score = sum(r.get('visual_content_score', 0) for r in results) / len(results)
        print(f"\n📊 Summary:")
        print(f"  Avg images per entity: {avg_images:.1f}")
        print(f"  Avg visual content score: {avg_score:.1f}/10")
    
    print("\n💡 Next steps:")
    if VISION_ENABLED:
        print("  • Review results to validate methodology")
        print("  • Adjust scoring weights if needed")
        print("  • Run full analysis on all 199 entities")
    else:
        print("  • Set up Google Vision API credentials:")
        print("    export GOOGLE_APPLICATION_CREDENTIALS='path/to/credentials.json'")
        print("  • Re-run test to validate image quality analysis")
    
    print("="*80)


if __name__ == '__main__':
    main()

