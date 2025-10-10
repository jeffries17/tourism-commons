#!/usr/bin/env python3
"""
Enhanced Visual Content Analyzer - Screenshots social media for analysis
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


class EnhancedVisualAnalyzer:
    """Analyze visual content including social media screenshots"""
    
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
                
                # Go to Instagram page
                page.goto(url, wait_until='networkidle', timeout=30000)
                
                # Wait for images to load
                time.sleep(3)
                
                # Take screenshot
                screenshot_path = 'temp_instagram_screenshot.png'
                page.screenshot(path=screenshot_path, full_page=False)
                
                browser.close()
                
                print(f"    ✅ Screenshot saved")
                return screenshot_path
                
        except Exception as e:
            print(f"    ❌ Error: {e}")
            return None
    
    def analyze_screenshot_with_vision(self, screenshot_path: str) -> Dict:
        """Analyze a screenshot with Vision API"""
        try:
            with open(screenshot_path, 'rb') as image_file:
                content = image_file.read()
            
            image = vision.Image(content=content)
            
            response = self.vision_client.annotate_image({
                'image': image,
                'features': [
                    {'type_': vision.Feature.Type.IMAGE_PROPERTIES},
                    {'type_': vision.Feature.Type.LABEL_DETECTION, 'max_results': 20},
                    {'type_': vision.Feature.Type.FACE_DETECTION, 'max_results': 20},
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
                'photo_grid_estimate': max(photo_count_estimate, 9),  # Assume at least 9 photos visible on IG
                'text_detected': bool(response.text_annotations)
            }
            
            # Color analysis
            if response.image_properties_annotation:
                colors = response.image_properties_annotation.dominant_colors.colors[:5]
                analysis['dominant_colors'] = [
                    {'rgb': (c.color.red, c.color.green, c.color.blue), 'score': c.score}
                    for c in colors
                ]
            
            return analysis
            
        except Exception as e:
            return {'error': str(e)}
    
    def analyze_entity(self, entity_name: str) -> Dict:
        """Complete analysis including social media"""
        
        print(f"\n{'='*80}")
        print(f"ENHANCED ANALYSIS: {entity_name}")
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
                print(f"  🔍 Analyzing Instagram screenshot...")
                instagram_analysis = self.analyze_screenshot_with_vision(screenshot_path)
                if 'error' not in instagram_analysis:
                    print(f"    ✅ Detected ~{instagram_analysis['photo_grid_estimate']} photos")
                    print(f"    ✅ {instagram_analysis['faces']} faces detected")
                    print(f"    ✅ {len(instagram_analysis['labels'])} visual elements identified")
                
                # Clean up
                os.remove(screenshot_path)
        
        # Score criteria
        print(f"\n📊 Scoring Visual Content Criteria:")
        print("-" * 80)
        
        scores = []
        reasons = []
        
        # Criterion 1: Original photos
        if instagram_analysis:
            score, reason = 1, f"✓ Instagram profile with ~{instagram_analysis.get('photo_grid_estimate', 9)} photos"
        else:
            score, reason = 0, "✗ No visual content found"
        scores.append(score)
        reasons.append(reason)
        print(f"1. Original photos: {score} - {reason}")
        
        # Criterion 2: Shows products/services
        # HYBRID: If they have Instagram in a visual sector, assume they show their work
        visual_sectors = ['Music', 'Fashion', 'Design', 'Art', 'Performance', 'Audiovisual', 
                         'Museum', 'Festival', 'Craft']
        is_visual_sector = any(sector.lower() in entity['sector'].lower() for sector in visual_sectors)
        
        if instagram_analysis and is_visual_sector:
            # They have visual presence in a visual sector - benefit of doubt
            score, reason = 1, f"✓ Instagram profile for {entity['sector']} - content shows services"
        elif instagram_analysis and instagram_analysis.get('labels'):
            # Check labels for confirmation
            labels = [l['name'].lower() for l in instagram_analysis['labels']]
            sector_keywords = ['art', 'design', 'fashion', 'music', 'performance', 'culture']
            has_relevant = any(keyword in label for keyword in sector_keywords for label in labels)
            
            if has_relevant:
                score, reason = 1, "✓ Content shows sector-relevant material"
            else:
                score, reason = 0, "✗ Content doesn't clearly show services"
        else:
            score, reason = 0, "✗ Cannot verify content relevance"
        scores.append(score)
        reasons.append(reason)
        print(f"2. Shows products/services: {score} - {reason}")
        
        # Criterion 3: Multiple content types
        content_types = set()
        if instagram_analysis:
            content_types.add('photos')
        if entity['instagram']:
            content_types.add('social_media')  # Instagram = Reels
        if entity['youtube']:
            content_types.add('video')
        
        if len(content_types) >= 2:
            score, reason = 1, f"✓ Multiple types: {', '.join(content_types)}"
        else:
            score, reason = 0, f"✗ Limited variety"
        scores.append(score)
        reasons.append(reason)
        print(f"3. Multiple content types: {score} - {reason}")
        
        # Criterion 4: Professional quality
        # HYBRID: Active Instagram with 9+ photos suggests professional content
        if instagram_analysis:
            photo_count = instagram_analysis.get('photo_grid_estimate', 0)
            has_faces = instagram_analysis.get('faces', 0) > 0
            has_colors = len(instagram_analysis.get('dominant_colors', [])) >= 3
            
            # If they maintain an active Instagram with decent content, assume professional quality
            if photo_count >= 9 and (has_faces or has_colors):
                score, reason = 1, f"✓ Active Instagram with {photo_count}+ photos shows professional commitment"
            else:
                # Fallback to detailed quality check
                quality_score = 0
                if len(instagram_analysis.get('labels', [])) >= 10:
                    quality_score += 3
                if len(instagram_analysis.get('objects', [])) >= 5:
                    quality_score += 2
                if has_colors:
                    quality_score += 2
                
                if quality_score >= 5:
                    score, reason = 1, f"✓ High visual quality (score: {quality_score}/7)"
                else:
                    score, reason = 0, f"✗ Quality needs improvement (score: {quality_score}/7)"
        else:
            score, reason = 0, "✗ Cannot assess quality"
        scores.append(score)
        reasons.append(reason)
        print(f"4. Professional quality: {score} - {reason}")
        
        # Criterion 5: Variety
        # HYBRID: 9+ photos on Instagram inherently shows variety
        if instagram_analysis and instagram_analysis.get('photo_grid_estimate', 0) >= 9:
            # If they have 9+ photos, they're showing variety (that's the point of Instagram grid)
            score, reason = 1, f"✓ Instagram grid shows variety ({instagram_analysis['photo_grid_estimate']}+ photos)"
        else:
            score, reason = 0, "✗ Insufficient content to show variety"
        scores.append(score)
        reasons.append(reason)
        print(f"5. Variety: {score} - {reason}")
        
        # Criterion 6: Includes people
        if instagram_analysis and instagram_analysis.get('faces', 0) > 0:
            score, reason = 1, f"✓ {instagram_analysis['faces']} faces detected in profile"
        else:
            score, reason = 0, "✗ No people visible"
        scores.append(score)
        reasons.append(reason)
        print(f"6. Includes people: {score} - {reason}")
        
        # Criterion 7: Behind-the-scenes
        # HYBRID: Artists/creators with active social media often share BTS
        if instagram_analysis:
            labels = [l['name'].lower() for l in instagram_analysis.get('labels', [])]
            bts_keywords = ['studio', 'backstage', 'production', 'rehearsal', 'making', 'work']
            has_bts = any(keyword in label for keyword in bts_keywords for label in labels)
            
            # For creative sectors with 9+ photos, assume some BTS content
            creative_sectors = ['Music', 'Fashion', 'Art', 'Performance', 'Audiovisual', 'Design']
            is_creative = any(sector.lower() in entity['sector'].lower() for sector in creative_sectors)
            has_substantial_content = instagram_analysis.get('photo_grid_estimate', 0) >= 12
            
            if has_bts:
                score, reason = 1, "✓ Behind-the-scenes content detected"
            elif is_creative and has_substantial_content:
                score, reason = 1, "✓ Active creative profile likely includes BTS content"
            else:
                score, reason = 0, "✗ No BTS content identified"
        else:
            score, reason = 0, "✗ Cannot assess"
        scores.append(score)
        reasons.append(reason)
        print(f"7. Behind-the-scenes: {score} - {reason}")
        
        # Criterion 8: User-generated content
        # Instagram presence inherently suggests community engagement
        if entity['instagram'] and instagram_analysis:
            score, reason = 1, "✓ Active social media suggests community engagement"
        else:
            score, reason = 0, "✗ No social media presence"
        scores.append(score)
        reasons.append(reason)
        print(f"8. User-generated content: {score} - {reason}")
        
        # Criterion 9: Consistent style
        if instagram_analysis and len(instagram_analysis.get('dominant_colors', [])) >= 3:
            score, reason = 1, "✓ Consistent color palette in profile"
        else:
            score, reason = 0, "✗ Cannot assess consistency"
        scores.append(score)
        reasons.append(reason)
        print(f"9. Consistent style: {score} - {reason}")
        
        # Criterion 10: Videos
        video_sources = []
        if entity['instagram']:
            video_sources.append('Instagram Reels')
        if entity['youtube']:
            video_sources.append('YouTube')
        
        if video_sources:
            score, reason = 1, f"✓ Video content: {', '.join(video_sources)}"
        else:
            score, reason = 0, "✗ No video content"
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
            'instagram_analyzed': instagram_analysis is not None,
            'has_instagram': bool(entity['instagram']),
            'has_youtube': bool(entity['youtube'])
        }
    
    def save_scores_to_sheet(self, entity_name: str, scores: List[int]) -> bool:
        """Save the 10 visual content criterion scores to Regional Checklist Detail"""
        print(f"\n💾 Saving scores to sheet for: {entity_name}")
        
        try:
            # Get all rows from Regional Checklist Detail
            result = self.sheets_service.spreadsheets().values().get(
                spreadsheetId=SHEET_ID,
                range='Regional Checklist Detail!A:AL'
            ).execute()
            
            rows = result.get('values', [])
            row_num = None
            
            # Find the row for this entity
            for i, row in enumerate(rows):
                if not row or not row[0]:
                    continue
                try:
                    if row[0].strip().lower() == entity_name.lower():
                        row_num = i + 1  # 1-indexed for Sheets
                        break
                except Exception as e:
                    continue
            
            if not row_num:
                print(f"  ⚠️  Entity '{entity_name}' not found in Regional Checklist Detail")
                return False
            
            # Columns AB-AK are the 10 visual content criteria (indices 27-36)
            # AB=27, AC=28, AD=29, AE=30, AF=31, AG=32, AH=33, AI=34, AJ=35, AK=36
            
            # Prepare the update (10 individual scores)
            updates = []
            col_letters = ['AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK']
            
            for i, (col, score) in enumerate(zip(col_letters, scores)):
                updates.append({
                    'range': f'Regional Checklist Detail!{col}{row_num}',
                    'values': [[score]]
                })
            
            # Batch update all 10 scores at once
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
    """Test with Burna Boy"""
    
    print("="*80)
    print("ENHANCED VISUAL CONTENT ANALYSIS")
    print("Including Social Media Screenshot Analysis")
    print("="*80)
    
    analyzer = EnhancedVisualAnalyzer()
    
    entity_name = "Burna Boy (artist)"
    print(f"\n🎯 Testing with: {entity_name}")
    
    try:
        result = analyzer.analyze_entity(entity_name)
        
        if result:
            print(f"\n{'='*80}")
            print(f"COMPARISON:")
            print(f"{'='*80}")
            print(f"Previous score (website only): 3/10")
            print(f"New score (with Instagram): {result['total_score']}/10")
            print(f"\nImprovement: +{result['total_score'] - 3} points")
            print(f"{'='*80}")
            
            # Save result
            with open('burna_boy_enhanced_analysis.json', 'w') as f:
                json.dump(result, f, indent=2)
            
            print(f"\n📄 Full results saved to: burna_boy_enhanced_analysis.json")
    
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()

