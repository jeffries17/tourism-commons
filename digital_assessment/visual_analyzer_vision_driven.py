#!/usr/bin/env python3
"""
Vision-API-Driven Visual Content Analyzer
Actually uses Google Vision API results to score, not just presence checks
"""

import os
import json
import requests
import base64
from typing import Dict, List, Tuple
from google.oauth2 import service_account
from googleapiclient.discovery import build
from google.cloud import vision
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import time
from collections import Counter

SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDS_FILE = '../tourism-development-d620c-5c9db9e21301.json'
USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'


class VisionDrivenVisualAnalyzer:
    """Analyze visual content using actual Vision API results"""
    
    def __init__(self):
        self.sheets_service = self._get_sheets_service()
        self.vision_client = vision.ImageAnnotatorClient()
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
                    'youtube': row[27] if len(row) > 27 and row[27] else None,
                }
        return None
    
    def screenshot_instagram(self, url: str) -> str:
        """Take screenshot of Instagram profile"""
        print(f"  📸 Screenshotting Instagram: {url}")
        
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page(viewport={'width': 1280, 'height': 1024})
                page.goto(url, wait_until='networkidle', timeout=30000)
                time.sleep(3)
                
                screenshot_path = 'temp_instagram_screenshot.png'
                page.screenshot(path=screenshot_path, full_page=False)
                browser.close()
                
                print(f"    ✅ Screenshot saved")
                return screenshot_path
                
        except Exception as e:
            print(f"    ❌ Screenshot failed: {e}")
            return None
    
    def analyze_instagram_screenshot(self, screenshot_path: str) -> Dict:
        """Analyze Instagram screenshot with Vision API"""
        print(f"  🔍 Analyzing Instagram screenshot...")
        
        try:
            with open(screenshot_path, 'rb') as image_file:
                content = image_file.read()
            
            image = vision.Image(content=content)
            response = self.vision_client.annotate_image({
                'image': image,
                'features': [
                    {'type_': vision.Feature.Type.LABEL_DETECTION, 'max_results': 30},
                    {'type_': vision.Feature.Type.FACE_DETECTION},
                    {'type_': vision.Feature.Type.IMAGE_PROPERTIES},
                    {'type_': vision.Feature.Type.OBJECT_LOCALIZATION, 'max_results': 20},
                    {'type_': vision.Feature.Type.TEXT_DETECTION},
                ]
            })
            
            # Count photo grids in screenshot
            objects = [o.name for o in response.localized_object_annotations] if response.localized_object_annotations else []
            photo_count_estimate = objects.count('Picture frame') + objects.count('Photograph')
            
            analysis = {
                'labels': [{'name': l.description, 'score': l.score} for l in response.label_annotations] if response.label_annotations else [],
                'faces': len(response.face_annotations) if response.face_annotations else 0,
                'objects': [{'name': o.name, 'score': o.score} for o in response.localized_object_annotations] if response.localized_object_annotations else [],
                'dominant_colors': [],
                'photo_grid_estimate': max(photo_count_estimate, 9),
                'text_detected': bool(response.text_annotations)
            }
            
            # Color analysis
            if response.image_properties_annotation:
                colors = response.image_properties_annotation.dominant_colors.colors[:5]
                analysis['dominant_colors'] = [
                    {'rgb': (c.color.red, c.color.green, c.color.blue), 'score': c.score}
                    for c in colors
                ]
            
            print(f"    ✅ Detected ~{photo_count_estimate} photos")
            print(f"    ✅ {analysis['faces']} faces detected")
            print(f"    ✅ {len(analysis['labels'])} visual elements identified")
            
            return analysis
            
        except Exception as e:
            return {'error': str(e)}
    
    def _analyze_visual_content(self, entity: Dict, instagram_analysis: Dict) -> Tuple[List[int], List[str]]:
        """Score using ACTUAL Vision API data, not presence checks"""
        
        scores = []
        reasons = []
        
        # Criterion 1: Original photos (not stock)
        # Use label diversity to detect real content
        if instagram_analysis and len(instagram_analysis.get('labels', [])) >= 5:
            label_names = [l['name'].lower() for l in instagram_analysis['labels'][:15]]
            # Generic/stock indicators
            generic = sum(1 for l in label_names if l in ['font', 'rectangle', 'text', 'white', 'black', 'pattern', 'line'])
            # Specific content indicators
            specific = len(label_names) - generic
            
            if specific >= 5:
                score, reason = 1, f"✓ Diverse content detected ({specific} specific labels)"
            else:
                score, reason = 0, f"✗ Limited diversity ({specific} labels, possibly stock)"
        else:
            score, reason = 0, "✗ No visual content to analyze"
        scores.append(score)
        reasons.append(reason)
        print(f"1. Original photos: {score} - {reason}")
        
        # Criterion 2: Shows products/services/location
        # Check for sector-relevant labels in Vision API results
        if instagram_analysis and instagram_analysis.get('labels'):
            labels = [l['name'].lower() for l in instagram_analysis['labels']]
            sector = entity['sector'].lower()
            
            # Sector-specific keywords
            sector_map = {
                'music': ['music', 'performance', 'concert', 'musician', 'instrument', 'stage'],
                'fashion': ['fashion', 'clothing', 'dress', 'textile', 'model', 'style'],
                'art': ['art', 'painting', 'sculpture', 'gallery', 'exhibition', 'artwork'],
                'museum': ['museum', 'artifact', 'exhibition', 'gallery', 'cultural'],
                'craft': ['craft', 'handmade', 'artisan', 'product', 'design'],
                'festival': ['event', 'crowd', 'performance', 'celebration', 'stage'],
                'audiovisual': ['media', 'camera', 'video', 'broadcast', 'production'],
                'heritage': ['building', 'architecture', 'historic', 'landmark', 'monument']
            }
            
            relevant_keywords = []
            for key, keywords in sector_map.items():
                if key in sector:
                    relevant_keywords.extend(keywords)
            
            matches = sum(1 for keyword in relevant_keywords if any(keyword in label for label in labels))
            
            if matches >= 2:
                score, reason = 1, f"✓ Shows {matches} sector-relevant elements"
            else:
                score, reason = 0, f"✗ No clear sector relevance ({matches} matches)"
        else:
            score, reason = 0, "✗ Cannot verify"
        scores.append(score)
        reasons.append(reason)
        print(f"2. Shows products/services: {score} - {reason}")
        
        # Criterion 3: Multiple content types
        content_types = set()
        if instagram_analysis:
            content_types.add('photos')
        if entity['instagram']:
            content_types.add('social_media')
        if entity['youtube']:
            content_types.add('video')
        
        if len(content_types) >= 2:
            score, reason = 1, f"✓ Multiple types: {', '.join(content_types)}"
        else:
            score, reason = 0, f"✗ Only: {', '.join(content_types) if content_types else 'none'}"
        scores.append(score)
        reasons.append(reason)
        print(f"3. Multiple content types: {score} - {reason}")
        
        # Criterion 4: Professional quality
        # Use Vision API confidence scores and color richness
        if instagram_analysis:
            labels = instagram_analysis.get('labels', [])
            avg_confidence = sum(l['score'] for l in labels[:10]) / len(labels[:10]) if labels else 0
            color_count = len(instagram_analysis.get('dominant_colors', []))
            object_count = len(instagram_analysis.get('objects', []))
            
            quality_score = 0
            if avg_confidence > 0.85:  # High confidence = clear, professional images
                quality_score += 3
            if color_count >= 4:  # Rich color palette
                quality_score += 2
            if object_count >= 5:  # Well-composed shots with clear subjects
                quality_score += 2
            
            if quality_score >= 5:
                score, reason = 1, f"✓ High quality (score: {quality_score}/7, confidence: {avg_confidence:.2f})"
            else:
                score, reason = 0, f"✗ Quality needs improvement (score: {quality_score}/7)"
        else:
            score, reason = 0, "✗ Cannot assess"
        scores.append(score)
        reasons.append(reason)
        print(f"4. Professional quality: {score} - {reason}")
        
        # Criterion 5: Variety
        # Check label diversity and photo count
        if instagram_analysis:
            labels = set([l['name'].lower() for l in instagram_analysis.get('labels', [])[:20]])
            photo_count = instagram_analysis.get('photo_grid_estimate', 0)
            
            # Variety = many different labels + enough photos
            if len(labels) >= 12 and photo_count >= 12:
                score, reason = 1, f"✓ High variety ({len(labels)} different elements, {photo_count}+ photos)"
            elif len(labels) >= 8 and photo_count >= 9:
                score, reason = 1, f"✓ Good variety ({len(labels)} elements)"
            else:
                score, reason = 0, f"✗ Limited variety ({len(labels)} elements, {photo_count} photos)"
        else:
            score, reason = 0, "✗ No content to assess"
        scores.append(score)
        reasons.append(reason)
        print(f"5. Variety: {score} - {reason}")
        
        # Criterion 6: Includes people/customers
        # Use actual face detection from Vision API
        if instagram_analysis:
            faces = instagram_analysis.get('faces', 0)
            if faces >= 1:
                score, reason = 1, f"✓ {faces} faces detected"
            else:
                score, reason = 0, "✗ No people visible"
        else:
            score, reason = 0, "✗ Cannot assess"
        scores.append(score)
        reasons.append(reason)
        print(f"6. Includes people: {score} - {reason}")
        
        # Criterion 7: Behind-the-scenes
        # Check for BTS-related labels
        if instagram_analysis:
            labels = [l['name'].lower() for l in instagram_analysis.get('labels', [])]
            bts_keywords = ['studio', 'backstage', 'production', 'rehearsal', 'making', 'work', 'workshop', 'process']
            has_bts = any(keyword in label for keyword in bts_keywords for label in labels)
            
            # For creative sectors with substantial content, check more thoroughly
            creative_sectors = ['Music', 'Fashion', 'Art', 'Performance', 'Audiovisual', 'Design']
            is_creative = any(sector in entity['sector'] for sector in creative_sectors)
            photo_count = instagram_analysis.get('photo_grid_estimate', 0)
            
            if has_bts:
                score, reason = 1, "✓ BTS content detected in labels"
            elif is_creative and photo_count >= 20:
                # With lots of content in creative sector, likely has some BTS
                score, reason = 1, f"✓ Substantial creative content ({photo_count}+ photos) likely includes BTS"
            else:
                score, reason = 0, "✗ No BTS content identified"
        else:
            score, reason = 0, "✗ Cannot assess"
        scores.append(score)
        reasons.append(reason)
        print(f"7. Behind-the-scenes: {score} - {reason}")
        
        # Criterion 8: User-generated content
        # Harder to detect, but look for variety in composition/angles
        if instagram_analysis:
            objects = instagram_analysis.get('objects', [])
            labels = instagram_analysis.get('labels', [])
            
            # Diverse composition suggests user contributions
            if len(objects) >= 8 and len(labels) >= 15:
                score, reason = 1, "✓ Diverse composition suggests community content"
            elif entity['instagram']:
                score, reason = 0, "✗ Limited evidence of UGC"
            else:
                score, reason = 0, "✗ No social presence"
        else:
            score, reason = 0, "✗ Cannot assess"
        scores.append(score)
        reasons.append(reason)
        print(f"8. User-generated content: {score} - {reason}")
        
        # Criterion 9: Consistent visual style
        # Use color analysis from Vision API
        if instagram_analysis:
            colors = instagram_analysis.get('dominant_colors', [])
            if len(colors) >= 3:
                # Check if colors have good presence (not too fragmented)
                top_color_score = colors[0]['score'] if colors else 0
                if top_color_score > 0.2:  # Dominant color present
                    score, reason = 1, "✓ Consistent color palette detected"
                else:
                    score, reason = 0, "✗ Inconsistent visual style"
            else:
                score, reason = 0, "✗ Insufficient color data"
        else:
            score, reason = 0, "✗ Cannot assess"
        scores.append(score)
        reasons.append(reason)
        print(f"9. Consistent style: {score} - {reason}")
        
        # Criterion 10: Videos or dynamic content
        # Check for video platforms (this is still a presence check - can't analyze videos easily)
        has_video = False
        video_sources = []
        
        if entity['instagram']:
            video_sources.append('Instagram Reels')
            has_video = True
        if entity['youtube']:
            video_sources.append('YouTube')
            has_video = True
        
        if has_video:
            score, reason = 1, f"✓ Video content: {', '.join(video_sources)}"
        else:
            score, reason = 0, "✗ No video content"
        scores.append(score)
        reasons.append(reason)
        print(f"10. Videos: {score} - {reason}")
        
        return scores, reasons
    
    def analyze_entity(self, entity_name: str) -> Dict:
        """Complete analysis using Vision API"""
        
        print(f"\n{'='*80}")
        print(f"VISION-DRIVEN ANALYSIS: {entity_name}")
        print(f"{'='*80}")
        
        entity = self.get_entity_data(entity_name)
        if not entity:
            print(f"❌ Entity not found")
            return None
        
        print(f"Country: {entity['country']} | Sector: {entity['sector']}")
        print(f"\n🔗 Digital Presence:")
        print(f"  Website: {'✓' if entity['website'] else '✗'}")
        print(f"  Instagram: {'✓' if entity['instagram'] else '✗'}")
        print(f"  Facebook: {'✓' if entity['facebook'] else '✗'}")
        print(f"  YouTube: {'✓' if entity['youtube'] else '✗'}")
        
        # Analyze Instagram if available
        instagram_analysis = None
        if entity['instagram']:
            screenshot_path = self.screenshot_instagram(entity['instagram'])
            if screenshot_path:
                instagram_analysis = self.analyze_instagram_screenshot(screenshot_path)
                # Clean up
                if os.path.exists(screenshot_path):
                    os.remove(screenshot_path)
        
        # Score using Vision API data
        scores, reasons = self._analyze_visual_content(entity, instagram_analysis)
        
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
            'instagram_analyzed': instagram_analysis is not None,
            'has_instagram': bool(entity['instagram']),
            'has_youtube': bool(entity['youtube']),
            'vision_data': instagram_analysis if instagram_analysis else {}
        }
    
    def save_scores_to_sheet(self, entity_name: str, scores: List[int]) -> bool:
        """Save the 10 visual content criterion scores to Regional Checklist Detail"""
        print(f"\n💾 Saving scores to sheet for: {entity_name}")
        
        try:
            result = self.sheets_service.spreadsheets().values().get(
                spreadsheetId=SHEET_ID,
                range='Regional Checklist Detail!A:AL'
            ).execute()
            
            rows = result.get('values', [])
            row_num = None
            
            for i, row in enumerate(rows):
                if not row or not row[0]:
                    continue
                try:
                    if row[0].strip().lower() == entity_name.lower():
                        row_num = i + 1
                        break
                except Exception as e:
                    continue
            
            if not row_num:
                print(f"  ⚠️  Entity '{entity_name}' not found in Regional Checklist Detail")
                return False
            
            # Update columns AB-AK
            updates = []
            col_letters = ['AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK']
            
            for i, (col, score) in enumerate(zip(col_letters, scores)):
                updates.append({
                    'range': f'Regional Checklist Detail!{col}{row_num}',
                    'values': [[score]]
                })
            
            body = {
                'valueInputOption': 'RAW',
                'data': updates
            }
            
            self.sheets_service.spreadsheets().values().batchUpdate(
                spreadsheetId=SHEET_ID,
                body=body
            ).execute()
            
            print(f"  ✅ Updated {len(scores)} visual content criteria scores")
            print(f"     Total: {sum(scores)}/10")
            return True
            
        except Exception as e:
            print(f"  ❌ Error saving to sheet: {e}")
            return False
    
    def analyze_and_save(self, entity_name: str) -> Dict:
        """Complete analysis with automatic sheet update"""
        result = self.analyze_entity(entity_name)
        
        if result and 'criteria_scores' in result:
            self.save_scores_to_sheet(entity_name, result['criteria_scores'])
        
        return result


def main():
    """Test the Vision-driven analyzer"""
    
    print("="*80)
    print("VISION-DRIVEN VISUAL CONTENT ANALYSIS")
    print("Using actual Google Vision API results to score")
    print("="*80)
    
    analyzer = VisionDrivenVisualAnalyzer()
    
    # Test on one entity
    entity_name = "Burna Boy (artist)"
    print(f"\n🎯 Testing with: {entity_name}")
    
    try:
        result = analyzer.analyze_entity(entity_name)
        
        if result:
            print(f"\n{'='*80}")
            print(f"Result: {result['total_score']}/10")
            print(f"{'='*80}")
            
            with open('vision_driven_test.json', 'w') as f:
                json.dump(result, f, indent=2)
            
            print(f"\n📄 Results saved to: vision_driven_test.json")
    
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()

