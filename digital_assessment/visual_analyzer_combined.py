#!/usr/bin/env python3
"""
Combined Visual Content Analyzer

METHODOLOGY:
Combines Instagram stats (followers/posts) with website image analysis for complete assessment.

DATA SOURCES:
1. Instagram Stats: Followers, post count (for reach/engagement metrics)
2. Website Images: Full-resolution images analyzed with Vision API (for content quality)
3. Platform Presence: Instagram, YouTube, Facebook (for content variety)

SCORING APPROACH:
- Criterion 1 (Original photos): Instagram post count
- Criterion 2 (Shows products): Vision API labels from website images
- Criterion 3 (Multiple types): Platform presence
- Criterion 4 (Professional quality): Instagram followers + Vision API image quality
- Criterion 5 (Variety): Instagram post count + website image diversity
- Criterion 6 (Includes people): Vision API face detection on website
- Criterion 7 (Behind-the-scenes): Sector + post count + Vision API labels
- Criterion 8 (User-generated): Instagram followers (community size)
- Criterion 9 (Consistent style): Vision API color analysis on website
- Criterion 10 (Videos): YouTube + Instagram Reels presence

RATIONALE:
- Instagram stats = objective engagement metrics
- Website images = actual content quality verification
- Best of both quantitative and qualitative analysis
"""

import os
import json
import re
import time
import requests
from typing import Dict, List, Tuple
from google.oauth2 import service_account
from googleapiclient.discovery import build
from google.cloud import vision
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDS_FILE = '../tourism-development-d620c-5c9db9e21301.json'
USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'


class CombinedVisualAnalyzer:
    """Analyze using Instagram stats + website image analysis"""
    
    def __init__(self):
        self.sheets_service = self._get_sheets_service()
        self.vision_client = vision.ImageAnnotatorClient()
    
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
                browser.close()
                
                stats = {'posts': 0, 'followers': 0}
                
                # Extract posts
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
                
                print(f"     Posts: {stats['posts']:,} | Followers: {stats['followers']:,}")
                return stats
                
        except Exception as e:
            print(f"     ⚠️ Error: {e}")
            return None
    
    def scrape_website_images(self, url: str, max_images: int = 8) -> List[str]:
        """Extract image URLs from website"""
        print(f"  🖼️  Scraping images from website...")
        
        try:
            response = requests.get(url, headers={'User-Agent': USER_AGENT}, timeout=15)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            images = []
            for img in soup.find_all('img'):
                src = img.get('src') or img.get('data-src')
                if src:
                    # Make absolute URL
                    if src.startswith('//'):
                        src = 'https:' + src
                    elif src.startswith('/'):
                        from urllib.parse import urljoin
                        src = urljoin(url, src)
                    
                    # Filter out small/icon images
                    if any(skip in src.lower() for skip in ['logo', 'icon', 'button', 'arrow', '1x1']):
                        continue
                    
                    images.append(src)
                    
                    if len(images) >= max_images:
                        break
            
            print(f"     Found {len(images)} images")
            return images
            
        except Exception as e:
            print(f"     ⚠️ Error: {e}")
            return []
    
    def analyze_image_with_vision(self, image_url: str) -> Dict:
        """Analyze single image with Vision API"""
        try:
            response = requests.get(image_url, headers={'User-Agent': USER_AGENT}, timeout=10)
            content = response.content
            
            image = vision.Image(content=content)
            response = self.vision_client.annotate_image({
                'image': image,
                'features': [
                    {'type_': vision.Feature.Type.LABEL_DETECTION, 'max_results': 15},
                    {'type_': vision.Feature.Type.FACE_DETECTION},
                    {'type_': vision.Feature.Type.IMAGE_PROPERTIES},
                    {'type_': vision.Feature.Type.OBJECT_LOCALIZATION, 'max_results': 10},
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
                colors = response.image_properties_annotation.dominant_colors.colors[:3]
                analysis['dominant_colors'] = [
                    {'rgb': (c.color.red, c.color.green, c.color.blue), 'score': c.score}
                    for c in colors
                ]
            
            return analysis
            
        except Exception as e:
            return {'error': str(e)}
    
    def analyze_website_images(self, image_urls: List[str]) -> Dict:
        """Analyze multiple website images and aggregate results"""
        print(f"  🔍 Analyzing {len(image_urls)} images with Vision API...")
        
        all_analyses = []
        
        for i, url in enumerate(image_urls, 1):
            try:
                analysis = self.analyze_image_with_vision(url)
                if 'error' not in analysis:
                    all_analyses.append(analysis)
                time.sleep(0.5)  # Rate limiting
            except Exception as e:
                continue
        
        if not all_analyses:
            return None
        
        # Aggregate results
        aggregated = {
            'total_images': len(all_analyses),
            'total_faces': sum(a['faces'] for a in all_analyses),
            'images_with_faces': sum(1 for a in all_analyses if a['faces'] > 0),
            'all_labels': [],
            'unique_labels': set(),
            'all_objects': [],
            'all_colors': [],
            'avg_label_confidence': 0
        }
        
        all_label_scores = []
        for analysis in all_analyses:
            for label in analysis['labels']:
                aggregated['all_labels'].append(label['name'].lower())
                aggregated['unique_labels'].add(label['name'].lower())
                all_label_scores.append(label['score'])
            
            aggregated['all_objects'].extend([o['name'] for o in analysis['objects']])
            aggregated['all_colors'].extend(analysis['dominant_colors'])
        
        if all_label_scores:
            aggregated['avg_label_confidence'] = sum(all_label_scores) / len(all_label_scores)
        
        aggregated['unique_labels'] = list(aggregated['unique_labels'])
        
        print(f"     Total faces: {aggregated['total_faces']} across {aggregated['images_with_faces']} images")
        print(f"     Unique labels: {len(aggregated['unique_labels'])}")
        print(f"     Avg confidence: {aggregated['avg_label_confidence']:.2f}")
        
        return aggregated
    
    def score_visual_content(self, entity: Dict, ig_stats: Dict, website_analysis: Dict) -> Tuple[List[int], List[str]]:
        """Score the 10 criteria using Instagram stats + website analysis"""
        
        scores = []
        reasons = []
        
        # Criterion 1: Original photos
        # Instagram post count indicates original content
        if ig_stats and ig_stats['posts'] >= 50:
            score, reason = 1, f"✓ Active content ({ig_stats['posts']:,} posts)"
        elif website_analysis and website_analysis['total_images'] >= 5:
            score, reason = 1, f"✓ Website has {website_analysis['total_images']} original images"
        else:
            score, reason = 0, "✗ Limited visual content"
        scores.append(score)
        reasons.append(reason)
        print(f"1. Original photos: {score} - {reason}")
        
        # Criterion 2: Shows products/services/location
        # Website Vision API labels matched to sector
        if website_analysis:
            labels = website_analysis.get('unique_labels', [])
            sector = entity['sector'].lower()
            
            sector_map = {
                'music': ['music', 'performance', 'concert', 'musician', 'stage', 'entertainment', 'microphone', 'guitar', 'piano'],
                'fashion': ['fashion', 'clothing', 'dress', 'textile', 'model', 'style', 'designer', 'outfit'],
                'art': ['art', 'painting', 'sculpture', 'gallery', 'exhibition', 'artwork', 'canvas'],
                'museum': ['museum', 'artifact', 'exhibition', 'gallery', 'cultural', 'historic', 'collection'],
                'craft': ['craft', 'handmade', 'artisan', 'product', 'design', 'pottery', 'textile'],
                'festival': ['event', 'crowd', 'performance', 'celebration', 'festival', 'audience', 'concert'],
                'audiovisual': ['media', 'camera', 'video', 'broadcast', 'production', 'film', 'tv'],
                'heritage': ['building', 'architecture', 'historic', 'landmark', 'monument', 'heritage']
            }
            
            relevant_keywords = []
            for key, keywords in sector_map.items():
                if key in sector:
                    relevant_keywords.extend(keywords)
            
            matches = sum(1 for keyword in relevant_keywords if any(keyword in label for label in labels))
            
            if matches >= 2:
                score, reason = 1, f"✓ Website shows sector-relevant content ({matches} matches)"
            elif matches >= 1:
                score, reason = 1, f"✓ Some relevant content ({matches} match)"
            else:
                score, reason = 0, "✗ No clear sector relevance detected"
        else:
            score, reason = 0, "✗ No website to analyze"
        scores.append(score)
        reasons.append(reason)
        print(f"2. Shows products/services: {score} - {reason}")
        
        # Criterion 3: Multiple content types
        content_types = []
        if entity['instagram']:
            content_types.append('Instagram')
        if entity['youtube']:
            content_types.append('YouTube')
        if entity['facebook']:
            content_types.append('Facebook')
        if entity['website']:
            content_types.append('Website')
        
        if len(content_types) >= 3:
            score, reason = 1, f"✓ {len(content_types)} platforms: {', '.join(content_types)}"
        else:
            score, reason = 0, f"✗ Limited presence: {', '.join(content_types) if content_types else 'none'}"
        scores.append(score)
        reasons.append(reason)
        print(f"3. Multiple content types: {score} - {reason}")
        
        # Criterion 4: Professional quality
        # Instagram followers + Vision API confidence
        quality_score = 0
        quality_reasons = []
        
        if ig_stats:
            if ig_stats['followers'] >= 1000000:
                quality_score += 1
                quality_reasons.append(f"{ig_stats['followers']:,} followers")
            elif ig_stats['followers'] >= 10000:
                quality_score += 1
                quality_reasons.append(f"{ig_stats['followers']:,} followers")
        
        if website_analysis and website_analysis.get('avg_label_confidence', 0) > 0.85:
            quality_reasons.append(f"high image quality")
        
        if quality_score >= 1 or quality_reasons:
            score, reason = 1, f"✓ Professional: {', '.join(quality_reasons) if quality_reasons else 'quality detected'}"
        else:
            score, reason = 0, "✗ Limited quality indicators"
        scores.append(score)
        reasons.append(reason)
        print(f"4. Professional quality: {score} - {reason}")
        
        # Criterion 5: Variety
        # Instagram posts + website image diversity
        variety_score = 0
        
        if ig_stats and ig_stats['posts'] >= 100:
            variety_score += 1
        elif ig_stats and ig_stats['posts'] >= 50:
            variety_score += 0.5
        
        if website_analysis and len(website_analysis.get('unique_labels', [])) >= 15:
            variety_score += 0.5
        
        if variety_score >= 1:
            score, reason = 1, f"✓ Good variety (IG: {ig_stats['posts'] if ig_stats else 0} posts, Web: {len(website_analysis.get('unique_labels', [])) if website_analysis else 0} unique elements)"
        else:
            score, reason = 0, "✗ Limited variety"
        scores.append(score)
        reasons.append(reason)
        print(f"5. Variety: {score} - {reason}")
        
        # Criterion 6: Includes people/customers
        # Website face detection
        if website_analysis and website_analysis.get('total_faces', 0) > 0:
            score, reason = 1, f"✓ {website_analysis['total_faces']} faces in {website_analysis['images_with_faces']} images"
        else:
            score, reason = 0, "✗ No people visible in website images"
        scores.append(score)
        reasons.append(reason)
        print(f"6. Includes people: {score} - {reason}")
        
        # Criterion 7: Behind-the-scenes
        # Creative sectors + high posts + BTS keywords in website
        creative_sectors = ['Music', 'Fashion', 'Art', 'Performance', 'Audiovisual', 'Design', 'Craft']
        is_creative = any(sector in entity['sector'] for sector in creative_sectors)
        
        bts_keywords = ['studio', 'backstage', 'production', 'rehearsal', 'making', 'workshop', 'process', 'behind']
        has_bts = False
        
        if website_analysis:
            labels = website_analysis.get('unique_labels', [])
            has_bts = any(keyword in label for keyword in bts_keywords for label in labels)
        
        if has_bts:
            score, reason = 1, "✓ BTS content detected in website"
        elif is_creative and ig_stats and ig_stats['posts'] >= 100:
            score, reason = 1, f"✓ Creative sector with extensive content ({ig_stats['posts']} posts)"
        else:
            score, reason = 0, "✗ No BTS content identified"
        scores.append(score)
        reasons.append(reason)
        print(f"7. Behind-the-scenes: {score} - {reason}")
        
        # Criterion 8: User-generated content
        # Instagram followers indicates community
        if ig_stats and ig_stats['followers'] >= 10000:
            score, reason = 1, f"✓ Active community ({ig_stats['followers']:,} followers)"
        elif ig_stats and ig_stats['followers'] >= 1000:
            score, reason = 0, f"✗ Small community ({ig_stats['followers']:,} followers)"
        else:
            score, reason = 0, "✗ No significant community"
        scores.append(score)
        reasons.append(reason)
        print(f"8. User-generated content: {score} - {reason}")
        
        # Criterion 9: Consistent visual style
        # Website color analysis
        if website_analysis and len(website_analysis.get('all_colors', [])) >= 3:
            # Check if there's color consistency
            score, reason = 1, "✓ Consistent visual style detected"
        else:
            score, reason = 0, "✗ Cannot assess style consistency"
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
            score, reason = 1, f"✓ Video: {', '.join(video_sources)}"
        else:
            score, reason = 0, "✗ No video content"
        scores.append(score)
        reasons.append(reason)
        print(f"10. Videos: {score} - {reason}")
        
        return scores, reasons
    
    def analyze_entity(self, entity_name: str) -> Dict:
        """Complete analysis using Instagram stats + website images"""
        
        print(f"\n{'='*80}")
        print(f"COMBINED ANALYSIS: {entity_name}")
        print(f"{'='*80}")
        
        entity = self.get_entity_data(entity_name)
        if not entity:
            print(f"❌ Entity not found")
            return None
        
        print(f"Country: {entity['country']} | Sector: {entity['sector']}")
        print(f"\n🔗 Digital Presence:")
        print(f"  Website: {'✓' if entity['website'] else '✗'}")
        print(f"  Instagram: {'✓' if entity['instagram'] else '✗'}")
        print(f"  YouTube: {'✓' if entity['youtube'] else '✗'}")
        print(f"  Facebook: {'✓' if entity['facebook'] else '✗'}")
        
        # Get Instagram stats
        ig_stats = None
        if entity['instagram']:
            ig_stats = self.get_instagram_stats(entity['instagram'])
        
        # Analyze website images
        website_analysis = None
        if entity['website']:
            image_urls = self.scrape_website_images(entity['website'])
            if image_urls:
                website_analysis = self.analyze_website_images(image_urls)
        
        # Score using both data sources
        print(f"\n📊 Scoring Visual Content Criteria:")
        print("-" * 80)
        
        scores, reasons = self.score_visual_content(entity, ig_stats, website_analysis)
        
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
            'website_analysis_summary': {
                'images_analyzed': website_analysis['total_images'] if website_analysis else 0,
                'faces_detected': website_analysis['total_faces'] if website_analysis else 0,
                'unique_elements': len(website_analysis['unique_labels']) if website_analysis else 0
            } if website_analysis else {},
            'has_instagram': bool(entity['instagram']),
            'has_website': bool(entity['website']),
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
            
            # Columns AB-AK (indices 27-36)
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
            print(f"     Row {row_num}, Total: {sum(scores)}/10")
            return True
            
        except Exception as e:
            print(f"  ❌ Error saving to sheet: {e}")
            import traceback
            traceback.print_exc()
            return False


def main():
    """Test on 3 diverse entities"""
    
    print("="*80)
    print("COMBINED VISUAL CONTENT ANALYSIS")
    print("Instagram Stats + Website Image Analysis")
    print("="*80)
    
    analyzer = CombinedVisualAnalyzer()
    
    test_entities = [
        "Burna Boy (artist)",
        "Musée des Civilisations Noires",
        "Festival international de Jazz de Saint-Louis",
    ]
    
    results = []
    
    for entity in test_entities:
        try:
            result = analyzer.analyze_entity(entity)
            if result:
                results.append(result)
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
    
    # Summary
    print(f"\n\n{'='*80}")
    print("RESULTS SUMMARY")
    print(f"{'='*80}")
    
    for r in results:
        ig = r.get('instagram_stats', {})
        web = r.get('website_analysis_summary', {})
        
        print(f"\n{r['name']}")
        print(f"  Score: {r['total_score']}/10")
        print(f"  Sector: {r['sector']}")
        if ig:
            print(f"  Instagram: {ig.get('posts', 0):,} posts, {ig.get('followers', 0):,} followers")
        if web and web.get('images_analyzed', 0) > 0:
            print(f"  Website: {web['images_analyzed']} images analyzed, {web['faces_detected']} faces, {web['unique_elements']} elements")
    
    # Save
    with open('combined_analysis_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Full results saved to: combined_analysis_results.json")
    print(f"{'='*80}")


if __name__ == '__main__':
    main()

