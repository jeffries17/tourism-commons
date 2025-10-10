#!/usr/bin/env python3
"""
Visual Content Analysis - Aligned with Regional Checklist Detail Criteria
Scores each of the 10 visual content criteria using Vision API + web scraping
"""

import os
import json
import requests
from typing import Dict, List, Tuple
from google.oauth2 import service_account
from googleapiclient.discovery import build
from google.cloud import vision
from bs4 import BeautifulSoup
import time
from collections import Counter

SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDS_FILE = '../tourism-development-d620c-5c9db9e21301.json'
USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'


class VisualContentChecker:
    """Score visual content according to Regional Checklist Detail criteria"""
    
    def __init__(self):
        self.sheets_service = self._get_sheets_service()
        self.vision_client = vision.ImageAnnotatorClient()
        
        # The 10 criteria from Regional Checklist Detail
        self.criteria = [
            "Has original photos (not just stock)",
            "Photos show actual products/services/location", 
            "Multiple types of visual content",
            "Professional quality (good lighting, composition)",
            "Shows variety (different angles, settings)",
            "Includes people/customers (authentic)",
            "Behind-the-scenes or process content",
            "User-generated content or collaborations",
            "Consistent visual style/branding",
            "Videos or dynamic content"
        ]
    
    def _get_sheets_service(self):
        with open(CREDS_FILE, 'r') as f:
            creds_dict = json.load(f)
        credentials = service_account.Credentials.from_service_account_info(
            creds_dict, scopes=['https://www.googleapis.com/auth/spreadsheets']
        )
        return build('sheets', 'v4', credentials=credentials)
    
    def get_entity_data(self, entity_name: str) -> Dict:
        """Get entity URLs from Regional Assessment"""
        result = self.sheets_service.spreadsheets().values().get(
            spreadsheetId=SHEET_ID,
            range='Regional Assessment!A:AC'
        ).execute()
        
        for row in result.get('values', [])[1:]:
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
                }
        return None
    
    def scrape_website_visual_data(self, url: str) -> Dict:
        """Scrape images and videos from website"""
        if not url:
            return {'images': [], 'videos': [], 'has_video': False}
        
        try:
            response = requests.get(url, headers={'User-Agent': USER_AGENT}, timeout=15)
            if response.status_code != 200:
                return {'images': [], 'videos': [], 'has_video': False}
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Get images
            image_urls = []
            for img in soup.find_all('img', src=True)[:20]:
                src = img.get('src', '')
                if any(skip in src.lower() for skip in ['logo', 'icon', 'button', 'pixel']):
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
            
            # Check for videos
            has_video = bool(soup.find_all('video') or soup.find_all('iframe', src=lambda x: x and 'youtube' in x))
            
            return {
                'images': image_urls[:15],
                'videos': [],
                'has_video': has_video
            }
        except Exception as e:
            return {'images': [], 'videos': [], 'has_video': False}
    
    def analyze_image_with_vision(self, image_url: str) -> Dict:
        """Analyze single image with Vision API"""
        try:
            image = vision.Image()
            image.source.image_uri = image_url
            
            response = self.vision_client.annotate_image({
                'image': image,
                'features': [
                    {'type_': vision.Feature.Type.IMAGE_PROPERTIES},
                    {'type_': vision.Feature.Type.LABEL_DETECTION, 'max_results': 15},
                    {'type_': vision.Feature.Type.FACE_DETECTION, 'max_results': 10},
                    {'type_': vision.Feature.Type.OBJECT_LOCALIZATION, 'max_results': 15},
                    {'type_': vision.Feature.Type.WEB_DETECTION},
                ]
            })
            
            analysis = {
                'labels': [{'name': l.description, 'score': l.score} for l in response.label_annotations] if response.label_annotations else [],
                'faces': len(response.face_annotations) if response.face_annotations else 0,
                'objects': [{'name': o.name, 'score': o.score} for o in response.localized_object_annotations] if response.localized_object_annotations else [],
                'dominant_colors': [],
                'is_stock': False,
                'quality_indicators': {}
            }
            
            # Color analysis
            if response.image_properties_annotation:
                colors = response.image_properties_annotation.dominant_colors.colors[:5]
                analysis['dominant_colors'] = [
                    {'rgb': (c.color.red, c.color.green, c.color.blue), 'score': c.score}
                    for c in colors
                ]
            
            # Stock photo detection
            if response.web_detection and response.web_detection.web_entities:
                # If image matches many generic web entities, likely stock
                generic_matches = sum(1 for e in response.web_detection.web_entities if e.score > 0.7)
                analysis['is_stock'] = generic_matches > 5
            
            # Quality indicators
            analysis['quality_indicators'] = {
                'has_faces': analysis['faces'] > 0,
                'label_diversity': len(analysis['labels']),
                'object_count': len(analysis['objects']),
                'color_diversity': len(analysis['dominant_colors'])
            }
            
            return analysis
            
        except Exception as e:
            return {'error': str(e)}
    
    def score_criterion_1_original_photos(self, analyses: List[Dict]) -> Tuple[int, str]:
        """Criterion 1: Has original photos (not just stock)"""
        if not analyses:
            return 0, "No images found"
        
        # Check if images appear to be stock photos
        stock_count = sum(1 for a in analyses if a.get('is_stock', False))
        stock_ratio = stock_count / len(analyses)
        
        if stock_ratio < 0.3:  # Less than 30% appear to be stock
            return 1, f"✓ Appears to use original photos ({len(analyses)-stock_count}/{len(analyses)} authentic)"
        else:
            return 0, f"✗ High proportion of stock photos detected ({stock_count}/{len(analyses)})"
    
    def score_criterion_2_shows_products(self, analyses: List[Dict], sector: str) -> Tuple[int, str]:
        """Criterion 2: Photos show actual products/services/location"""
        if not analyses:
            return 0, "No images to analyze"
        
        # Check for sector-relevant content in labels
        sector_keywords = {
            'Cultural heritage': ['museum', 'artifact', 'heritage', 'building', 'architecture'],
            'Crafts': ['craft', 'handmade', 'product', 'art', 'design'],
            'Festivals': ['festival', 'event', 'celebration', 'crowd', 'performance'],
            'Performing': ['performance', 'stage', 'theater', 'art', 'performer'],
            'Music': ['music', 'instrument', 'performance', 'concert', 'stage'],
            'Fashion': ['fashion', 'clothing', 'model', 'design', 'textile'],
            'Audiovisual': ['camera', 'studio', 'production', 'video', 'film'],
            'Marketing': ['design', 'publication', 'media', 'advertisement']
        }
        
        # Find relevant keywords
        relevant_keywords = []
        for key, keywords in sector_keywords.items():
            if key.lower() in sector.lower():
                relevant_keywords.extend(keywords)
        
        # Check if images contain sector-relevant content
        relevant_count = 0
        for analysis in analyses:
            labels = [l['name'].lower() for l in analysis.get('labels', [])]
            if any(keyword in label for keyword in relevant_keywords for label in labels):
                relevant_count += 1
        
        if relevant_count >= len(analyses) * 0.5:  # At least 50% show relevant content
            return 1, f"✓ {relevant_count}/{len(analyses)} images show sector-relevant content"
        else:
            return 0, f"✗ Only {relevant_count}/{len(analyses)} images show relevant content"
    
    def score_criterion_3_multiple_types(self, analyses: List[Dict], has_video: bool) -> Tuple[int, str]:
        """Criterion 3: Multiple types of visual content"""
        types = set()
        
        # Check for different object types in images
        all_objects = []
        for analysis in analyses:
            all_objects.extend([o['name'] for o in analysis.get('objects', [])])
        
        # Categorize objects
        if any('person' in obj.lower() for obj in all_objects):
            types.add('people')
        if any(obj.lower() in ['building', 'house', 'architecture'] for obj in all_objects):
            types.add('location')
        if any('product' in obj.lower() or 'object' in obj.lower() for obj in all_objects):
            types.add('products')
        
        if has_video:
            types.add('video')
        
        if len(types) >= 2:
            return 1, f"✓ Multiple content types: {', '.join(types)}"
        else:
            return 0, f"✗ Limited content variety ({len(types)} type{'s' if len(types) != 1 else ''})"
    
    def score_criterion_4_professional_quality(self, analyses: List[Dict]) -> Tuple[int, str]:
        """Criterion 4: Professional quality (good lighting, composition)"""
        if not analyses:
            return 0, "No images to analyze"
        
        # Quality indicators: label diversity, color richness, object detection success
        quality_scores = []
        for analysis in analyses:
            score = 0
            qi = analysis.get('quality_indicators', {})
            
            # Rich labeling indicates good composition
            if qi.get('label_diversity', 0) >= 5:
                score += 3
            elif qi.get('label_diversity', 0) >= 3:
                score += 2
            
            # Multiple objects detected = good composition
            if qi.get('object_count', 0) >= 3:
                score += 2
            
            # Color diversity = good lighting/exposure
            if qi.get('color_diversity', 0) >= 3:
                score += 2
            
            quality_scores.append(min(score, 7))
        
        avg_quality = sum(quality_scores) / len(quality_scores) if quality_scores else 0
        
        if avg_quality >= 5:
            return 1, f"✓ Good professional quality (avg score: {avg_quality:.1f}/7)"
        else:
            return 0, f"✗ Quality needs improvement (avg score: {avg_quality:.1f}/7)"
    
    def score_criterion_5_variety(self, analyses: List[Dict]) -> Tuple[int, str]:
        """Criterion 5: Shows variety (different angles, settings)"""
        if len(analyses) < 3:
            return 0, f"✗ Too few images to show variety ({len(analyses)})"
        
        # Check object and label diversity across images
        all_objects = set()
        all_labels = set()
        
        for analysis in analyses:
            all_objects.update([o['name'] for o in analysis.get('objects', [])])
            all_labels.update([l['name'] for l in analysis.get('labels', [])])
        
        # High diversity suggests different settings/angles
        diversity_score = len(all_objects) + len(all_labels)
        
        if diversity_score >= 20:
            return 1, f"✓ Good variety across images ({len(all_objects)} object types, {len(all_labels)} labels)"
        else:
            return 0, f"✗ Limited variety ({len(all_objects)} object types, {len(all_labels)} labels)"
    
    def score_criterion_6_includes_people(self, analyses: List[Dict]) -> Tuple[int, str]:
        """Criterion 6: Includes people/customers (authentic)"""
        if not analyses:
            return 0, "No images to analyze"
        
        images_with_faces = sum(1 for a in analyses if a.get('faces', 0) > 0)
        
        if images_with_faces >= 1:
            total_faces = sum(a.get('faces', 0) for a in analyses)
            return 1, f"✓ {images_with_faces} images include people ({total_faces} faces detected)"
        else:
            return 0, "✗ No people/customers visible in images"
    
    def score_criterion_7_behind_scenes(self, analyses: List[Dict]) -> Tuple[int, str]:
        """Criterion 7: Behind-the-scenes or process content"""
        # Look for indicators of behind-the-scenes content
        process_keywords = ['workshop', 'studio', 'production', 'making', 'working', 'process', 'creation']
        
        bts_count = 0
        for analysis in analyses:
            labels = [l['name'].lower() for l in analysis.get('labels', [])]
            if any(keyword in label for keyword in process_keywords for label in labels):
                bts_count += 1
        
        if bts_count >= 1:
            return 1, f"✓ {bts_count} images show behind-the-scenes/process content"
        else:
            return 0, "✗ No behind-the-scenes content detected"
    
    def score_criterion_8_user_content(self, analyses: List[Dict]) -> Tuple[int, str]:
        """Criterion 8: User-generated content or collaborations"""
        # This is hard to detect automatically - check for collaborative indicators
        collab_keywords = ['event', 'group', 'team', 'collaboration', 'community']
        
        collab_count = 0
        for analysis in analyses:
            labels = [l['name'].lower() for l in analysis.get('labels', [])]
            # Multiple people + event context might indicate user/collaborative content
            if analysis.get('faces', 0) >= 3 and any(keyword in label for keyword in collab_keywords for label in labels):
                collab_count += 1
        
        if collab_count >= 1:
            return 1, f"✓ {collab_count} images suggest collaborative/community content"
        else:
            return 0, "✗ No clear user-generated/collaborative content"
    
    def score_criterion_9_consistent_style(self, analyses: List[Dict]) -> Tuple[int, str]:
        """Criterion 9: Consistent visual style/branding"""
        if len(analyses) < 3:
            return 0, "✗ Too few images to assess consistency"
        
        # Check color palette consistency
        all_colors = []
        for analysis in analyses:
            for color in analysis.get('dominant_colors', []):
                all_colors.append(color['rgb'])
        
        if not all_colors:
            return 0, "✗ Cannot assess color consistency"
        
        # Simple consistency check: count most common color families
        # (This is simplified - real branding analysis would be more sophisticated)
        color_families = Counter()
        for r, g, b in all_colors:
            # Categorize into rough color families
            if r > 180 and g > 180 and b > 180:
                color_families['light'] += 1
            elif r < 75 and g < 75 and b < 75:
                color_families['dark'] += 1
            elif r > g and r > b:
                color_families['warm'] += 1
            elif b > r and b > g:
                color_families['cool'] += 1
        
        # If one family dominates, suggests consistency
        if color_families and max(color_families.values()) / len(all_colors) > 0.4:
            dominant = color_families.most_common(1)[0][0]
            return 1, f"✓ Consistent visual style ({dominant} tones dominate)"
        else:
            return 0, "✗ Inconsistent visual styling"
    
    def score_criterion_10_videos(self, has_video: bool, has_youtube: bool) -> Tuple[int, str]:
        """Criterion 10: Videos or dynamic content"""
        if has_video or has_youtube:
            return 1, "✓ Video content present"
        else:
            return 0, "✗ No video content detected"
    
    def analyze_entity(self, entity_name: str) -> Dict:
        """Complete visual content analysis for one entity"""
        print(f"\n{'='*80}")
        print(f"ANALYZING: {entity_name}")
        print(f"{'='*80}")
        
        # Get entity data
        entity = self.get_entity_data(entity_name)
        if not entity:
            print(f"❌ Entity not found")
            return None
        
        print(f"Country: {entity['country']} | Sector: {entity['sector']}")
        
        # Scrape visual content
        print("\n📸 Scraping visual content...")
        visual_data = self.scrape_website_visual_data(entity['website'])
        has_youtube = bool(entity.get('youtube'))
        
        print(f"  Found {len(visual_data['images'])} images")
        print(f"  Video content: {'Yes' if visual_data['has_video'] or has_youtube else 'No'}")
        
        if not visual_data['images']:
            print("\n⚠️  No images to analyze - scoring 0/10")
            return {
                'name': entity_name,
                'country': entity['country'],
                'sector': entity['sector'],
                'criteria_scores': [0] * 10,
                'total_score': 0,
                'reasoning': 'No images found on website'
            }
        
        # Analyze images with Vision API
        print(f"\n🔍 Analyzing images with Vision API...")
        analyses = []
        for i, img_url in enumerate(visual_data['images'][:8], 1):
            print(f"  [{i}/{min(len(visual_data['images']), 8)}]", end=" ")
            analysis = self.analyze_image_with_vision(img_url)
            if 'error' not in analysis:
                analyses.append(analysis)
                print("✓")
            else:
                print(f"✗ {analysis['error'][:30]}")
            time.sleep(0.3)
        
        print(f"\n✅ Successfully analyzed {len(analyses)} images")
        
        # Score each criterion
        print(f"\n📊 Scoring 10 Visual Content Criteria:")
        print("-" * 80)
        
        scores = []
        reasons = []
        
        score, reason = self.score_criterion_1_original_photos(analyses)
        scores.append(score)
        reasons.append(reason)
        print(f"1. Original photos: {score} - {reason}")
        
        score, reason = self.score_criterion_2_shows_products(analyses, entity['sector'])
        scores.append(score)
        reasons.append(reason)
        print(f"2. Shows products/services: {score} - {reason}")
        
        score, reason = self.score_criterion_3_multiple_types(analyses, visual_data['has_video'] or has_youtube)
        scores.append(score)
        reasons.append(reason)
        print(f"3. Multiple content types: {score} - {reason}")
        
        score, reason = self.score_criterion_4_professional_quality(analyses)
        scores.append(score)
        reasons.append(reason)
        print(f"4. Professional quality: {score} - {reason}")
        
        score, reason = self.score_criterion_5_variety(analyses)
        scores.append(score)
        reasons.append(reason)
        print(f"5. Variety: {score} - {reason}")
        
        score, reason = self.score_criterion_6_includes_people(analyses)
        scores.append(score)
        reasons.append(reason)
        print(f"6. Includes people: {score} - {reason}")
        
        score, reason = self.score_criterion_7_behind_scenes(analyses)
        scores.append(score)
        reasons.append(reason)
        print(f"7. Behind-the-scenes: {score} - {reason}")
        
        score, reason = self.score_criterion_8_user_content(analyses)
        scores.append(score)
        reasons.append(reason)
        print(f"8. User-generated content: {score} - {reason}")
        
        score, reason = self.score_criterion_9_consistent_style(analyses)
        scores.append(score)
        reasons.append(reason)
        print(f"9. Consistent style: {score} - {reason}")
        
        score, reason = self.score_criterion_10_videos(visual_data['has_video'], has_youtube)
        scores.append(score)
        reasons.append(reason)
        print(f"10. Videos: {score} - {reason}")
        
        total_score = sum(scores)
        print("-" * 80)
        print(f"TOTAL SCORE: {total_score}/10")
        
        return {
            'name': entity_name,
            'country': entity['country'],
            'sector': entity['sector'],
            'criteria_scores': scores,
            'total_score': total_score,
            'reasoning': ' | '.join(reasons),
            'images_analyzed': len(analyses)
        }


def main():
    """Test with 5 entities"""
    print("="*80)
    print("VISUAL CONTENT ANALYSIS - CHECKLIST DETAIL ALIGNED")
    print("Scoring according to 10 Regional Checklist Detail criteria")
    print("="*80)
    
    test_entities = [
        "Burna Boy (artist)",
        "Pistis (Accra)",
        "Canal 3 Bénin",
        "Musée des Civilisations Noires (Dakar)",
        "Palácio da Cultura Ildo Lobo (Praia)",
    ]
    
    checker = VisualContentChecker()
    
    results = []
    for i, entity in enumerate(test_entities, 1):
        print(f"\n[{i}/{len(test_entities)}]")
        try:
            result = checker.analyze_entity(entity)
            if result:
                results.append(result)
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
    
    # Save results
    output_file = f"visual_analysis_checklist_aligned.json"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print("\n" + "="*80)
    print("ANALYSIS COMPLETE")
    print("="*80)
    print(f"✅ Analyzed {len(results)} entities")
    print(f"📄 Results: {output_file}")
    
    if results:
        avg_score = sum(r['total_score'] for r in results) / len(results)
        print(f"\n📊 Average Visual Content Score: {avg_score:.1f}/10")
        
        # Show distribution
        for r in results:
            print(f"  {r['name']}: {r['total_score']}/10")
    
    print("\n💡 Ready to run on all 199 entities!")
    print("="*80)


if __name__ == '__main__':
    main()

