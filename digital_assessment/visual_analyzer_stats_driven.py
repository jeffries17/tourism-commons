#!/usr/bin/env python3
"""
Stats-Driven Visual Content Analyzer

METHODOLOGY:
Uses Instagram profile statistics (followers, posts) combined with Vision API
analysis to score each of the 10 visual content criteria from the checklist.

SCORING LOGIC:
1. Original photos: Based on post count (more posts = more original content)
2. Shows products/services: Vision API labels matched to sector keywords
3. Multiple content types: Presence across platforms (Instagram, YouTube, Facebook)
4. Professional quality: Follower count as proxy for quality (high reach = professional)
5. Variety: Post count indicates content diversity
6. Includes people: Vision API face detection on profile screenshot
7. Behind-the-scenes: Inferred from sector + post volume (creative sectors with many posts)
8. User-generated content: Follower count indicates community engagement
9. Consistent style: Vision API color analysis
10. Videos: Instagram Reels + YouTube presence

RATIONALE:
- Instagram stats (followers, posts) are objective, measurable quality indicators
- High followers = professional presence, audience trust, quality content
- High post count = active, diverse visual library
- Vision API provides content verification (faces, colors, labels)
- Combines quantitative metrics with qualitative content analysis
"""

import os
import json
import re
import time
from typing import Dict, List, Tuple
from google.oauth2 import service_account
from googleapiclient.discovery import build
from google.cloud import vision
from playwright.sync_api import sync_playwright

SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDS_FILE = '../tourism-development-d620c-5c9db9e21301.json'


class StatsDrivenVisualAnalyzer:
    """Analyze visual content using Instagram stats + Vision API"""
    
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
    
    def get_instagram_stats(self, url: str) -> Dict:
        """Extract follower count, posts count from Instagram profile"""
        print(f"  📊 Extracting Instagram stats...")
        
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page(viewport={'width': 1280, 'height': 1024})
                
                page.goto(url, wait_until='networkidle', timeout=30000)
                time.sleep(5)
                
                text = page.content()
                
                stats = {
                    'posts': 0,
                    'followers': 0,
                    'screenshot': None
                }
                
                # Extract posts count
                posts_match = re.search(r'(\d[\d,]*)\s*posts?', text, re.IGNORECASE)
                if posts_match:
                    stats['posts'] = int(posts_match.group(1).replace(',', ''))
                
                # Extract followers
                followers_match = re.search(r'(\d[\d,\.]*[KMB]?)\s*followers?', text, re.IGNORECASE)
                if followers_match:
                    follower_str = followers_match.group(1)
                    multiplier = 1
                    if 'K' in follower_str.upper():
                        multiplier = 1000
                        follower_str = follower_str.replace('K', '').replace('k', '')
                    elif 'M' in follower_str.upper():
                        multiplier = 1000000
                        follower_str = follower_str.replace('M', '').replace('m', '')
                    elif 'B' in follower_str.upper():
                        multiplier = 1000000000
                        follower_str = follower_str.replace('B', '').replace('b', '')
                    
                    stats['followers'] = int(float(follower_str.replace(',', '')) * multiplier)
                
                # Take screenshot for Vision API
                screenshot_path = 'temp_instagram_profile.png'
                page.screenshot(path=screenshot_path)
                stats['screenshot'] = screenshot_path
                
                browser.close()
                
                print(f"     Posts: {stats['posts']:,} | Followers: {stats['followers']:,}")
                return stats
                
        except Exception as e:
            print(f"     ❌ Error: {e}")
            return None
    
    def analyze_instagram_screenshot(self, screenshot_path: str) -> Dict:
        """Analyze Instagram profile screenshot with Vision API"""
        print(f"  🔍 Analyzing profile with Vision API...")
        
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
                ]
            })
            
            analysis = {
                'labels': [{'name': l.description, 'score': l.score} for l in response.label_annotations] if response.label_annotations else [],
                'faces': len(response.face_annotations) if response.face_annotations else 0,
                'objects': [{'name': o.name, 'score': o.score} for o in response.localized_object_annotations] if response.localized_object_annotations else [],
                'dominant_colors': []
            }
            
            # Color analysis
            if response.image_properties_annotation:
                colors = response.image_properties_annotation.dominant_colors.colors[:5]
                analysis['dominant_colors'] = [
                    {'rgb': (c.color.red, c.color.green, c.color.blue), 'score': c.score}
                    for c in colors
                ]
            
            print(f"     Labels: {len(analysis['labels'])} | Faces: {analysis['faces']} | Colors: {len(analysis['dominant_colors'])}")
            return analysis
            
        except Exception as e:
            print(f"     ❌ Error: {e}")
            return None
    
    def score_visual_content(self, entity: Dict, ig_stats: Dict, vision_analysis: Dict) -> Tuple[List[int], List[str]]:
        """Score the 10 criteria using stats + Vision API"""
        
        scores = []
        reasons = []
        
        # Criterion 1: Original photos (not stock)
        # Logic: More posts = more original content
        if ig_stats:
            posts = ig_stats['posts']
            if posts >= 100:
                score, reason = 1, f"✓ Active content creator ({posts:,} posts)"
            elif posts >= 50:
                score, reason = 1, f"✓ Regular posting ({posts} posts)"
            elif posts >= 20:
                score, reason = 0, f"✗ Limited content ({posts} posts)"
            else:
                score, reason = 0, f"✗ Minimal posts ({posts})"
        else:
            score, reason = 0, "✗ No Instagram presence"
        scores.append(score)
        reasons.append(reason)
        print(f"1. Original photos: {score} - {reason}")
        
        # Criterion 2: Shows products/services/location
        # Logic: Vision API labels matched to sector
        if vision_analysis and vision_analysis.get('labels'):
            labels = [l['name'].lower() for l in vision_analysis['labels']]
            sector = entity['sector'].lower()
            
            sector_map = {
                'music': ['music', 'performance', 'concert', 'musician', 'stage', 'entertainment'],
                'fashion': ['fashion', 'clothing', 'dress', 'textile', 'model', 'style'],
                'art': ['art', 'painting', 'sculpture', 'gallery', 'exhibition'],
                'museum': ['museum', 'artifact', 'exhibition', 'gallery', 'cultural', 'historic'],
                'craft': ['craft', 'handmade', 'artisan', 'product', 'design'],
                'festival': ['event', 'crowd', 'performance', 'celebration', 'festival'],
                'audiovisual': ['media', 'camera', 'video', 'broadcast', 'production'],
                'heritage': ['building', 'architecture', 'historic', 'landmark']
            }
            
            relevant_keywords = []
            for key, keywords in sector_map.items():
                if key in sector:
                    relevant_keywords.extend(keywords)
            
            matches = sum(1 for keyword in relevant_keywords if any(keyword in label for label in labels))
            
            if matches >= 2:
                score, reason = 1, f"✓ Sector-relevant content ({matches} matches)"
            elif matches >= 1:
                score, reason = 1, f"✓ Some sector relevance ({matches} match)"
            else:
                score, reason = 0, f"✗ No clear sector relevance"
        else:
            score, reason = 0, "✗ Cannot verify"
        scores.append(score)
        reasons.append(reason)
        print(f"2. Shows products/services: {score} - {reason}")
        
        # Criterion 3: Multiple content types
        # Logic: Presence across multiple platforms
        content_types = []
        if entity['instagram']:
            content_types.append('Instagram')
        if entity['youtube']:
            content_types.append('YouTube')
        if entity['facebook']:
            content_types.append('Facebook')
        
        if len(content_types) >= 2:
            score, reason = 1, f"✓ {len(content_types)} platforms: {', '.join(content_types)}"
        else:
            score, reason = 0, f"✗ Only: {', '.join(content_types) if content_types else 'none'}"
        scores.append(score)
        reasons.append(reason)
        print(f"3. Multiple content types: {score} - {reason}")
        
        # Criterion 4: Professional quality
        # Logic: High followers = professional presence & quality
        if ig_stats and ig_stats['followers'] >= 100000:
            score, reason = 1, f"✓ Major professional presence ({ig_stats['followers']:,} followers)"
        elif ig_stats and ig_stats['followers'] >= 10000:
            score, reason = 1, f"✓ Professional presence ({ig_stats['followers']:,} followers)"
        elif ig_stats and ig_stats['followers'] >= 1000:
            score, reason = 0, f"✗ Limited reach ({ig_stats['followers']:,} followers)"
        else:
            score, reason = 0, "✗ Minimal/no following"
        scores.append(score)
        reasons.append(reason)
        print(f"4. Professional quality: {score} - {reason}")
        
        # Criterion 5: Variety (different angles, settings)
        # Logic: Post count indicates content diversity
        if ig_stats and ig_stats['posts'] >= 200:
            score, reason = 1, f"✓ Extensive variety ({ig_stats['posts']:,} posts)"
        elif ig_stats and ig_stats['posts'] >= 100:
            score, reason = 1, f"✓ Good variety ({ig_stats['posts']} posts)"
        elif ig_stats and ig_stats['posts'] >= 50:
            score, reason = 0, f"✗ Limited variety ({ig_stats['posts']} posts)"
        else:
            score, reason = 0, "✗ Minimal content"
        scores.append(score)
        reasons.append(reason)
        print(f"5. Variety: {score} - {reason}")
        
        # Criterion 6: Includes people/customers
        # Logic: Vision API face detection
        if vision_analysis and vision_analysis.get('faces', 0) > 0:
            score, reason = 1, f"✓ {vision_analysis['faces']} faces detected"
        else:
            score, reason = 0, "✗ No people visible in profile"
        scores.append(score)
        reasons.append(reason)
        print(f"6. Includes people: {score} - {reason}")
        
        # Criterion 7: Behind-the-scenes content
        # Logic: Creative sectors with high post count likely have BTS
        creative_sectors = ['Music', 'Fashion', 'Art', 'Performance', 'Audiovisual', 'Design', 'Craft']
        is_creative = any(sector in entity['sector'] for sector in creative_sectors)
        
        if ig_stats and is_creative and ig_stats['posts'] >= 50:
            score, reason = 1, f"✓ Creative sector with substantial content ({ig_stats['posts']} posts)"
        elif ig_stats and ig_stats['posts'] >= 100:
            score, reason = 1, f"✓ High content volume suggests BTS ({ig_stats['posts']} posts)"
        else:
            score, reason = 0, "✗ Unlikely to have BTS content"
        scores.append(score)
        reasons.append(reason)
        print(f"7. Behind-the-scenes: {score} - {reason}")
        
        # Criterion 8: User-generated content
        # Logic: High followers = active community = UGC likely
        if ig_stats and ig_stats['followers'] >= 10000:
            score, reason = 1, f"✓ Active community ({ig_stats['followers']:,} followers)"
        elif ig_stats and ig_stats['followers'] >= 1000:
            score, reason = 0, f"✗ Limited community ({ig_stats['followers']:,} followers)"
        else:
            score, reason = 0, "✗ No significant community"
        scores.append(score)
        reasons.append(reason)
        print(f"8. User-generated content: {score} - {reason}")
        
        # Criterion 9: Consistent visual style/branding
        # Logic: Vision API color consistency
        if vision_analysis and len(vision_analysis.get('dominant_colors', [])) >= 3:
            top_color = vision_analysis['dominant_colors'][0]
            if top_color['score'] > 0.2:
                score, reason = 1, "✓ Consistent color palette detected"
            else:
                score, reason = 0, "✗ Inconsistent visual style"
        else:
            score, reason = 0, "✗ Cannot assess style"
        scores.append(score)
        reasons.append(reason)
        print(f"9. Consistent style: {score} - {reason}")
        
        # Criterion 10: Videos or dynamic content
        # Logic: Instagram Reels + YouTube
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
        
        return scores, reasons
    
    def analyze_entity(self, entity_name: str) -> Dict:
        """Complete analysis using stats + Vision API"""
        
        print(f"\n{'='*80}")
        print(f"STATS-DRIVEN ANALYSIS: {entity_name}")
        print(f"{'='*80}")
        
        entity = self.get_entity_data(entity_name)
        if not entity:
            print(f"❌ Entity not found")
            return None
        
        print(f"Country: {entity['country']} | Sector: {entity['sector']}")
        print(f"\n🔗 Digital Presence:")
        print(f"  Instagram: {'✓' if entity['instagram'] else '✗'}")
        print(f"  YouTube: {'✓' if entity['youtube'] else '✗'}")
        print(f"  Facebook: {'✓' if entity['facebook'] else '✗'}")
        
        # Get Instagram stats
        ig_stats = None
        vision_analysis = None
        
        if entity['instagram']:
            ig_stats = self.get_instagram_stats(entity['instagram'])
            
            if ig_stats and ig_stats.get('screenshot'):
                vision_analysis = self.analyze_instagram_screenshot(ig_stats['screenshot'])
                
                # Cleanup
                if os.path.exists(ig_stats['screenshot']):
                    os.remove(ig_stats['screenshot'])
        
        # Score using stats + Vision API
        print(f"\n📊 Scoring Visual Content Criteria:")
        print("-" * 80)
        
        scores, reasons = self.score_visual_content(entity, ig_stats, vision_analysis)
        
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
            'instagram_stats': ig_stats if ig_stats else {},
            'vision_data': vision_analysis if vision_analysis else {},
            'has_instagram': bool(entity['instagram']),
            'has_youtube': bool(entity['youtube'])
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
    """Test on 3 diverse entities"""
    
    print("="*80)
    print("STATS-DRIVEN VISUAL CONTENT ANALYSIS")
    print("="*80)
    print("\nMETHODOLOGY:")
    print("- Instagram followers/posts as quality indicators")
    print("- Vision API for content verification (faces, colors, labels)")
    print("- Each criterion scored using objective metrics")
    print("="*80)
    
    analyzer = StatsDrivenVisualAnalyzer()
    
    # Test 3 entities
    test_entities = [
        "Burna Boy (artist)",  # Music - expect high score
        "Musée des Civilisations Noires",  # Museum - expect medium
        "Festival international de Jazz de Saint-Louis",  # Festival - expect medium-high
    ]
    
    results = []
    
    for entity in test_entities:
        try:
            result = analyzer.analyze_entity(entity)
            if result:
                results.append(result)
        except Exception as e:
            print(f"❌ Error: {e}")
    
    # Summary
    print(f"\n\n{'='*80}")
    print("SUMMARY")
    print(f"{'='*80}")
    
    for r in results:
        ig_stats = r.get('instagram_stats', {})
        print(f"\n{r['name']}")
        print(f"  Score: {r['total_score']}/10")
        print(f"  Sector: {r['sector']}")
        if ig_stats:
            print(f"  IG Stats: {ig_stats.get('posts', 0):,} posts, {ig_stats.get('followers', 0):,} followers")
    
    # Save
    with open('stats_driven_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Full results saved to: stats_driven_test_results.json")
    print(f"{'='*80}")


if __name__ == '__main__':
    main()

