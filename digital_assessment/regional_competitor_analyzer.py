#!/usr/bin/env python3
"""
Regional Competitor Analysis System
Combines Google Search API + Web Scraping + OpenAI for comprehensive digital assessment
of regional creative industry participants across 5 countries
"""

import os
import json
import requests
import time
from datetime import datetime
from typing import Dict, List, Optional
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from google.oauth2 import service_account
from googleapiclient.discovery import build
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration
SHEET_ID = '1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM'
CREDS_FILE = '../tourism-development-d620c-5c9db9e21301.json'
USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'

# API Keys
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY', '')
SEARCH_ENGINE_ID = os.environ.get('GOOGLE_SEARCH_ENGINE_ID', '')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')

# Initialize OpenAI
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None


class RegionalCompetitorAnalyzer:
    """Advanced analyzer combining search, scraping, and AI for comprehensive assessment"""
    
    def __init__(self, verbose=True):
        self.verbose = verbose
        self.sheets_service = self._get_sheets_service()
        
    def _get_sheets_service(self):
        """Initialize Google Sheets API service"""
        with open(CREDS_FILE, 'r') as f:
            creds_dict = json.load(f)
        
        credentials = service_account.Credentials.from_service_account_info(
            creds_dict,
            scopes=['https://www.googleapis.com/auth/spreadsheets']
        )
        return build('sheets', 'v4', credentials=credentials)
    
    def _log(self, message, level="info"):
        """Simple logging"""
        if self.verbose:
            prefix = "🔍" if level == "info" else "✅" if level == "success" else "⚠️" if level == "warn" else "❌"
            print(f"{prefix} {message}")
    
    def google_search(self, query: str, num_results: int = 10) -> List[Dict]:
        """Search using Google Custom Search API"""
        if not GOOGLE_API_KEY or not SEARCH_ENGINE_ID:
            self._log("Google API credentials not configured", "error")
            return []
        
        url = "https://www.googleapis.com/customsearch/v1"
        params = {
            'key': GOOGLE_API_KEY,
            'cx': SEARCH_ENGINE_ID,
            'q': query,
            'num': min(num_results, 10)
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            items = response.json().get('items', [])
            self._log(f"Found {len(items)} search results for '{query}'")
            return items
        except Exception as e:
            self._log(f"Search error: {e}", "error")
            return []
    
    def classify_url(self, url: str) -> str:
        """Classify URL type"""
        url_lower = url.lower()
        
        if 'facebook.com' in url_lower or 'fb.com' in url_lower:
            return 'facebook'
        elif 'instagram.com' in url_lower:
            return 'instagram'
        elif 'tripadvisor' in url_lower:
            return 'tripadvisor'
        elif 'youtube.com' in url_lower or 'youtu.be' in url_lower:
            return 'youtube'
        elif 'linkedin.com' in url_lower:
            return 'linkedin'
        else:
            return 'website'
    
    def is_likely_official_social_media(self, url: str, name: str, platform: str) -> Dict:
        """
        Determine if a social media URL is an official page/profile vs. a post ABOUT the entity.
        Returns dict with 'is_official' (bool), 'confidence' (float 0-1), and 'signals' (list)
        """
        signals = []
        score = 0
        max_score = 0
        
        url_lower = url.lower()
        name_normalized = self._normalize_name(name)[0]
        name_parts = [w for w in name_normalized.split() if len(w) > 3]
        
        if platform == 'facebook':
            max_score += 5  # 3 for URL structure + 2 for username match
            # Official Facebook pages: facebook.com/PageName or facebook.com/pages/...
            # Posts by others: facebook.com/OtherPage/posts/...
            # Photos: facebook.com/photo.php (NOT a page URL)
            
            if '/posts/' in url_lower or '/post/' in url_lower:
                signals.append("✗ URL contains '/posts/' - likely someone posting about the entity")
            elif '/photo.php' in url_lower or '/photos/' in url_lower:
                signals.append("✗ URL is a photo link, not a page/profile")
            elif '/videos/' in url_lower or '/video.php' in url_lower:
                signals.append("✗ URL is a video link, not a page/profile")
            elif '/pages/' in url_lower:
                score += 2
                signals.append("✓ Facebook page URL structure")
            elif url_lower.count('/') <= 4:  # facebook.com/PageName has fewer slashes
                score += 3
                signals.append("✓ Clean Facebook profile URL")
            else:
                score += 1
                signals.append("⚠ Complex URL structure")
            
            # Check if entity name is in the Facebook username
            path_after_fb = url_lower.split('facebook.com/')[-1].split('/')[0]
            if any(part in path_after_fb for part in name_parts if len(part) > 4):
                score += 2
                signals.append(f"✓ Entity name in Facebook username: {path_after_fb}")
        
        elif platform == 'instagram':
            max_score += 5  # 3 for URL structure + 2 for username match
            # Official: instagram.com/username
            # Not official: instagram.com/p/POST_ID or instagram.com/other_user/...
            
            if '/p/' in url_lower or '/reel/' in url_lower or '/tv/' in url_lower:
                signals.append("✗ URL is a post/reel, not a profile")
            elif url_lower.count('/') <= 4:
                score += 3
                signals.append("✓ Instagram profile URL")
            
            # Check username
            username = url_lower.split('instagram.com/')[-1].split('/')[0].split('?')[0]
            if any(part in username for part in name_parts if len(part) > 4):
                score += 2
                signals.append(f"✓ Entity name in Instagram username: {username}")
        
        elif platform == 'tripadvisor':
            max_score += 2
            # TripAdvisor can be tricky - reviews vs official page
            # We'll be more lenient since TripAdvisor is inherently third-party
            if 'attraction_review' in url_lower or 'restaurant_review' in url_lower or 'hotel_review' in url_lower:
                score += 2
                signals.append("✓ TripAdvisor listing (third-party but valid)")
            else:
                score += 1
                signals.append("⚠ TripAdvisor URL (verify it's the right listing)")
        
        elif platform == 'youtube':
            max_score = 3  # Just URL structure check
            # Official: youtube.com/c/ChannelName, youtube.com/@username, youtube.com/channel/ID
            # Not official: youtube.com/watch?v=VIDEO_ID
            
            if '/watch' in url_lower or 'v=' in url_lower:
                signals.append("✗ YouTube video URL, not a channel")
            elif '/c/' in url_lower or '/@' in url_lower or '/channel/' in url_lower:
                score += 3
                signals.append("✓ YouTube channel URL")
            else:
                score += 1
                signals.append("⚠ YouTube URL structure unclear")
        
        elif platform == 'linkedin':
            max_score = 3  # Just URL structure check
            # Official: linkedin.com/company/name or linkedin.com/in/person-name
            # Not official: linkedin.com/posts/...
            
            if '/posts/' in url_lower or '/post/' in url_lower:
                signals.append("✗ LinkedIn post URL, not a profile/company page")
            elif '/company/' in url_lower or '/in/' in url_lower:
                score += 3
                signals.append("✓ LinkedIn profile/company page")
            else:
                score += 1
                signals.append("⚠ LinkedIn URL structure unclear")
        
        # Calculate confidence
        confidence = score / max_score if max_score > 0 else 0
        is_official = confidence >= 0.5  # 50% threshold for social media (more lenient)
        
        return {
            'is_official': is_official,
            'confidence': confidence,
            'score': score,
            'max_score': max_score,
            'signals': signals
        }
    
    def is_likely_official_website(self, url: str, name: str, scraped_data: Optional[Dict] = None) -> Dict:
        """
        Determine if a URL is likely an official website vs. a blog/article ABOUT the entity.
        Returns a dict with 'is_official' (bool), 'confidence' (float 0-1), and 'signals' (list of reasons)
        """
        signals = []
        score = 0
        max_score = 0
        
        import re
        from urllib.parse import urlparse
        
        parsed = urlparse(url)
        domain = parsed.netloc.lower().replace('www.', '')
        path = parsed.path.lower()
        
        # Signal 1: Domain name contains entity name (strong positive)
        max_score += 3
        name_normalized = self._normalize_name(name)[0]  # Get primary variation
        name_parts = [w for w in name_normalized.split() if len(w) > 3]
        domain_cleaned = domain.replace('-', '').replace('.', '')
        
        if name_normalized.replace(' ', '') in domain_cleaned:
            score += 3
            signals.append(f"✓ Entity name '{name}' in domain")
        elif any(part in domain_cleaned for part in name_parts if len(part) > 4):
            score += 2
            signals.append(f"✓ Part of entity name in domain")
        else:
            signals.append(f"✗ Entity name not in domain")
        
        # Signal 2: URL path structure (blog posts have longer, article-like paths)
        max_score += 2
        path_segments = [p for p in path.split('/') if p and p != '']
        
        # Blog/article indicators in path
        blog_indicators = ['blog', 'article', 'post', 'news', 'story', 'review', 
                          'guide', 'travel', 'trip', 'visit', 'discover', 'explore']
        has_blog_path = any(indicator in path for indicator in blog_indicators)
        
        # Check for overly long path (articles tend to have descriptive URLs)
        longest_segment = max([len(seg) for seg in path_segments]) if path_segments else 0
        has_long_segment = longest_segment > 30
        
        # Check for date patterns in URL (common in blogs)
        has_date_pattern = bool(re.search(r'/\d{4}/\d{2}/', path))
        
        if has_blog_path:
            signals.append(f"✗ Blog/article path detected: {path}")
        elif has_long_segment:
            score += 1
            signals.append(f"⚠ Long URL segment (might be article): {longest_segment} chars")
        elif has_date_pattern:
            signals.append(f"✗ Date pattern in URL (likely blog post)")
        elif len(path_segments) <= 2:
            score += 2
            signals.append(f"✓ Clean URL structure (≤2 segments)")
        else:
            score += 1
            signals.append(f"⚠ Multiple path segments: {len(path_segments)}")
        
        # Signal 3: Check scraped content if available
        if scraped_data and scraped_data.get('text'):
            max_score += 3
            text_sample = scraped_data['text'].lower()
            title = scraped_data.get('title', '').lower()
            
            # Check for first-person vs third-person language
            first_person_indicators = ['we ', 'our ', 'us ', 'welcome to our', 'about us', 'contact us']
            third_person_indicators = ['this company', 'the business', 'they ', 'their ', 
                                      'written by', 'posted by', 'author:', 'by ', 
                                      'visit this', 'check out this']
            
            first_person_count = sum(1 for ind in first_person_indicators if ind in text_sample[:2000])
            third_person_count = sum(1 for ind in third_person_indicators if ind in text_sample[:2000])
            
            if first_person_count >= 2 and third_person_count <= 1:
                score += 2
                signals.append(f"✓ First-person language (we/our/us): {first_person_count} instances")
            elif third_person_count >= 2:
                signals.append(f"✗ Third-person language (likely about the entity): {third_person_count} instances")
            else:
                score += 1
                signals.append(f"⚠ Mixed language indicators")
            
            # Check for article/blog post metadata
            article_indicators_title = ['guide to', 'how to', 'things to know', 'festival', 
                                       'celebration', 'event in', 'visit', 'trip to']
            has_article_title = any(ind in title for ind in article_indicators_title)
            
            if has_article_title:
                signals.append(f"✗ Article-style title: '{title}'")
            else:
                score += 1
                signals.append(f"✓ Non-article title")
            
            # Check for navigation/site structure (official sites have menus)
            headings = scraped_data.get('headings', [])
            common_nav_items = ['home', 'about', 'contact', 'services', 'gallery', 
                              'menu', 'book now', 'reservation']
            nav_matches = sum(1 for h in headings if any(nav in h.lower() for nav in common_nav_items))
            
            if nav_matches >= 2:
                score += 1
                signals.append(f"✓ Navigation structure detected ({nav_matches} nav items)")
        
        # Signal 4: Known third-party domains (travel blogs, review sites, directories, guest houses)
        max_score += 2
        third_party_domains = [
            # Travel blogs & guides
            'afktravel', 'kumakonda', 'tripadvisor', 'yelp', 'lonelyplanet', 'travelblog',
            'travelguide', 'wanderlog', 'tripinafrica', 'theculturetrip',
            # Blogging platforms
            'medium.com', 'wordpress.com', 'blogspot.com', 'substack.com',
            # Website builders (often used by third parties)
            'wix.com', 'squarespace.com', 'weebly.com',
            # Guest houses / accommodations
            'guesthouse', 'gjestehus', 'campement', 'hotel', 'resort', 'lodge',
            # Cultural directories / magazines
            'africultures', 'africasacountry', 'contemporaryand', 'artguide',
            # General directories
            'evendo.com', 'mindtrip.ai', 'booking.com', 'hotels.com', 'expedia.com'
        ]
        
        if any(tpd in domain for tpd in third_party_domains if tpd not in name_normalized):
            signals.append(f"✗ Known third-party/blog domain: {domain}")
        else:
            score += 2
            signals.append(f"✓ Not a known third-party domain")
        
        # Calculate confidence
        confidence = score / max_score if max_score > 0 else 0
        is_official = confidence >= 0.6  # 60% threshold
        
        return {
            'is_official': is_official,
            'confidence': confidence,
            'score': score,
            'max_score': max_score,
            'signals': signals
        }
    
    def _normalize_name(self, name: str) -> List[str]:
        """Create multiple variations of a name for flexible matching"""
        import re
        
        variations = []
        
        # Original name
        variations.append(name.lower())
        
        # Remove parenthetical content (e.g., "Museum (IFAN)" -> "Museum")
        name_no_parens = re.sub(r'\([^)]*\)', '', name).strip()
        if name_no_parens != name:
            variations.append(name_no_parens.lower())
        
        # Get just the main words (remove short words)
        main_words = [w for w in name_no_parens.split() if len(w) > 3]
        if len(main_words) >= 2:
            variations.append(' '.join(main_words).lower())
        
        # Remove accents for domain matching
        import unicodedata
        name_no_accents = ''.join(
            c for c in unicodedata.normalize('NFD', name_no_parens)
            if unicodedata.category(c) != 'Mn'
        ).lower()
        variations.append(name_no_accents)
        
        return list(set(variations))  # Remove duplicates
    
    def _check_name_match(self, name: str, text: str, url: str) -> bool:
        """Check if name matches in text or URL with flexible matching"""
        text_lower = text.lower()
        url_lower = url.lower()
        
        # Get name variations
        name_variations = self._normalize_name(name)
        
        # Check each variation
        for variation in name_variations:
            # Direct match in text
            if variation in text_lower:
                return True
            
            # Check in domain (remove common TLDs and protocols)
            domain = url_lower.replace('https://', '').replace('http://', '').split('/')[0]
            domain = domain.replace('www.', '')
            
            # For domain matching, remove spaces and special chars
            name_for_domain = variation.replace(' ', '').replace('-', '').replace('.', '')
            domain_cleaned = domain.replace('-', '').replace('.', '').split('.')[0]
            
            # Check if significant part of name is in domain
            if len(name_for_domain) > 4 and name_for_domain[:5] in domain_cleaned:
                return True
            
            # Check individual significant words in domain
            words = [w for w in variation.split() if len(w) > 3]
            if len(words) >= 2:
                words_in_domain = sum(1 for w in words if w in domain_cleaned)
                if words_in_domain >= 2:
                    return True
        
        return False
    
    def discover_digital_presence(self, name: str, country: str, sector: str) -> Dict:
        """Discover all digital touchpoints for a competitor"""
        self._log(f"Discovering digital presence: {name} ({country}, {sector})")
        
        # Enhanced search strategy with targeted platform searches
        queries = [
            # General searches
            f"{name} {country}",
            f"{name} {sector} {country}",
            f"{name}",
            # Targeted social media searches
            f"{name} facebook",
            f"{name} instagram",
            f"{name} tripadvisor",
            # Platform-specific searches for better discovery
            f"site:facebook.com {name}",
            f"site:instagram.com {name}",
            f"site:tripadvisor.com {name}"
        ]
        
        all_results = []
        for query in queries:
            results = self.google_search(query, num_results=10)
            all_results.extend(results)
            time.sleep(0.5)  # Rate limiting
        
        # Deduplicate by URL
        seen_urls = set()
        unique_results = []
        for result in all_results:
            url = result['link']
            if url not in seen_urls:
                seen_urls.add(url)
                unique_results.append(result)
        
        # Classify results
        discovered = {
            'website': None,
            'facebook': None,
            'instagram': None,
            'tripadvisor': None,
            'youtube': None,
            'linkedin': None,
            'search_results': unique_results
        }
        
        # Process results with flexible matching
        website_candidates = []  # Store candidates with validation scores
        
        for i, result in enumerate(unique_results):
            url = result['link']
            title = result.get('title', '')
            snippet = result.get('snippet', '')
            platform = self.classify_url(url)
            
            if platform == 'website' and not discovered['website']:
                # Use flexible name matching
                is_match = self._check_name_match(name, f"{title} {snippet}", url)
                
                # Quick validation without scraping (URL-based only)
                validation = self.is_likely_official_website(url, name, scraped_data=None)
                
                # Store candidate with its validation score
                website_candidates.append({
                    'url': url,
                    'validation': validation,
                    'result_position': i,
                    'name_match': is_match,
                    'title': title
                })
                
                self._log(f"  Candidate: {url}", "info")
                self._log(f"  Official confidence: {validation['confidence']:.2%}", "info")
                for signal in validation['signals'][:3]:  # Show top 3 signals
                    self._log(f"    {signal}", "info")
                
            elif platform in discovered and not discovered[platform]:
                # Validate social media URLs before accepting
                if platform in ['facebook', 'instagram', 'youtube', 'linkedin']:
                    validation = self.is_likely_official_social_media(url, name, platform)
                    self._log(f"  {platform.title()} candidate: {url}", "info")
                    self._log(f"  Official confidence: {validation['confidence']:.2%}", "info")
                    for signal in validation['signals']:
                        self._log(f"    {signal}", "info")
                    
                    if validation['is_official']:
                        discovered[platform] = url
                    else:
                        self._log(f"  Rejected {platform} URL (not official page/profile)", "warn")
                else:
                    # TripAdvisor is always accepted (it's inherently third-party)
                    discovered[platform] = url
            elif platform in discovered and discovered[platform]:
                # Already found this platform, but might be a better match
                # Keep the first one found
                pass
        
        # Select best website candidate based on validation
        if website_candidates:
            # Sort by: 1) is_official flag, 2) confidence score, 3) result position
            website_candidates.sort(
                key=lambda x: (
                    x['validation']['is_official'],
                    x['validation']['confidence'],
                    -x['result_position']  # Negative to prefer earlier results
                ),
                reverse=True
            )
            
            best_candidate = website_candidates[0]
            if best_candidate['validation']['is_official'] or best_candidate['result_position'] < 5:
                discovered['website'] = best_candidate['url']
                self._log(f"Selected website: {best_candidate['url']} (confidence: {best_candidate['validation']['confidence']:.2%})", "success")
            else:
                self._log(f"No high-confidence official website found (best: {best_candidate['validation']['confidence']:.2%})", "warn")
        
        # Summary
        found = [k for k, v in discovered.items() if v and k != 'search_results']
        self._log(f"Found: {', '.join(found) if found else 'Nothing'}", "success")
        
        # Add validation metadata for transparency
        discovered['_validation_metadata'] = {
            'website_candidates_checked': len(website_candidates),
            'best_website_confidence': website_candidates[0]['validation']['confidence'] if website_candidates else 0.0
        }
        
        return discovered
    
    def scrape_website(self, url: str) -> Dict:
        """Deep scrape of website for analysis"""
        self._log(f"Scraping website: {url}")
        
        try:
            response = requests.get(url, headers={'User-Agent': USER_AGENT}, timeout=15)
            
            if response.status_code != 200:
                return {'error': f'HTTP {response.status_code}', 'text': '', 'meta': {}}
            
            html = response.text
            soup = BeautifulSoup(html, 'html.parser')
            
            # Extract comprehensive data
            data = {
                'url': url,
                'text': soup.get_text()[:5000],  # First 5000 chars
                'title': soup.title.string if soup.title else '',
                'meta_description': '',
                'headings': [],
                'links': [],
                'images': [],
                'forms': [],
                'has_viewport': False,
                'has_schema': False,
                'contact_info': {
                    'emails': [],
                    'phones': [],
                    'addresses': []
                }
            }
            
            # Meta description
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            if meta_desc:
                data['meta_description'] = meta_desc.get('content', '')
            
            # Headings (first 10)
            for i in range(1, 7):
                headings = soup.find_all(f'h{i}')
                data['headings'].extend([h.get_text().strip() for h in headings[:10]])
            
            # Links (analyze first 20)
            links = soup.find_all('a', href=True)[:20]
            data['links'] = [
                {
                    'href': link.get('href'),
                    'text': link.get_text().strip()[:50]
                }
                for link in links
            ]
            
            # Images (first 15)
            images = soup.find_all('img')[:15]
            data['images'] = [
                {
                    'src': img.get('src'),
                    'alt': img.get('alt', '')
                }
                for img in images
            ]
            
            # Forms
            forms = soup.find_all('form')
            data['forms'] = [
                {
                    'action': form.get('action'),
                    'method': form.get('method', 'get').lower()
                }
                for form in forms
            ]
            
            # Mobile-friendly check
            viewport = soup.find('meta', attrs={'name': 'viewport'})
            data['has_viewport'] = bool(viewport)
            
            # Schema markup check
            schema = soup.find_all(['script'], {'type': 'application/ld+json'})
            data['has_schema'] = len(schema) > 0
            
            # Contact info extraction
            import re
            text = data['text']
            
            # Emails
            emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
            data['contact_info']['emails'] = list(set(emails[:5]))
            
            # Phones (international format)
            phones = re.findall(r'\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}', text)
            data['contact_info']['phones'] = list(set(phones[:5]))
            
            self._log(f"Scraped successfully: {len(data['text'])} chars, {len(data['images'])} images", "success")
            return data
            
        except Exception as e:
            self._log(f"Scraping error: {e}", "error")
            return {'error': str(e), 'text': '', 'meta': {}}
    
    def ai_analyze_category(self, category: str, evidence: Dict, sector: str, country: str) -> Dict:
        """Use OpenAI to analyze and score a specific category based on evidence"""
        
        if not client:
            self._log("OpenAI not configured, skipping AI analysis", "warn")
            return {'score': 0, 'reasoning': 'AI not configured', 'confidence': 'none'}
        
        # Category-specific criteria (the 10 criteria for each)
        category_criteria = {
            'Social Media': [
                'Has business account on primary platform (Facebook/Instagram)',
                'Has business account on second platform',
                'Has business account on third platform',
                'Posts monthly in last 6 months',
                'Posts 2x monthly in last 6 months',
                'Posts weekly in last 6 months',
                'Clear, in-focus photos/videos',
                'Shows products/services consistently',
                'Uses platform business features (catalog, hours, etc.)',
                'Contact info clearly visible in bio/about'
            ],
            'Website': [
                'Website exists and loads',
                'Mobile-friendly/responsive',
                'No major usability issues',
                'Services/products clearly described',
                'Contact information clearly visible',
                'Working contact forms',
                'Content updated within last 6 months',
                'Modern, professional design',
                'Multiple pages (not just homepage)',
                'Links to social media accounts'
            ],
            'Visual Content': [
                'Has original photos (not just stock)',
                'Photos show actual products/services/location',
                'Multiple types of visual content',
                'Professional quality (good lighting, composition)',
                'Shows variety (different angles, settings)',
                'Includes people/customers (authentic)',
                'Behind-the-scenes or process content',
                'User-generated content or collaborations',
                'Consistent visual style/branding',
                'Videos or dynamic content'
            ],
            'Discoverability': [
                'Appears in Google search for business name',
                'Has Google My Business / Maps listing',
                'Listed on TripAdvisor or similar',
                'Appears on first page of search results',
                'GMB has photos',
                'Listed on multiple directories',
                'Has customer reviews',
                '5+ reviews on any platform',
                'Responds to reviews',
                'Has backlinks from other sites'
            ],
            'Digital Sales': [
                'Has WhatsApp business button/number',
                'Contact form for inquiries',
                'Prices visible online',
                'Online booking system',
                'Accepts mobile money/online payments',
                'Listed on OTA (Airbnb, Booking.com, etc.)',
                'Clear call-to-action for booking',
                'Digital catalog/menu of services',
                'Testimonials or social proof',
                'FAQ or detailed service info'
            ],
            'Platform Integration': [
                'On Google My Business',
                'On TripAdvisor',
                'On national tourism website',
                'On Airbnb/Booking.com (if applicable)',
                'On GetYourGuide or similar',
                'Featured in tourism campaigns',
                'Partner with hotels/DMCs',
                'Cross-listed on multiple platforms',
                'Profile >75% complete on platforms',
                'Active on tourism directories'
            ]
        }
        
        criteria = category_criteria.get(category, [])
        
        # Build evidence summary
        evidence_summary = {
            'website_found': bool(evidence.get('website_data')),
            'social_platforms': [],
            'website_content': {},
            'search_visibility': len(evidence.get('search_results', []))
        }
        
        # Social platforms found
        for platform in ['facebook', 'instagram', 'tripadvisor', 'youtube', 'linkedin']:
            if evidence.get(platform):
                evidence_summary['social_platforms'].append(platform)
        
        # Website details
        if evidence.get('website_data'):
            wd = evidence['website_data']
            evidence_summary['website_content'] = {
                'title': wd.get('title', ''),
                'has_forms': len(wd.get('forms', [])) > 0,
                'has_contact': len(wd.get('contact_info', {}).get('emails', [])) > 0 or 
                               len(wd.get('contact_info', {}).get('phones', [])) > 0,
                'num_images': len(wd.get('images', [])),
                'mobile_friendly': wd.get('has_viewport', False),
                'text_sample': wd.get('text', '')[:500]
            }
        
        # Create AI prompt
        prompt = f"""You are analyzing the digital presence of a {sector} business in {country} for the category: {category}.

**Category Criteria (score 0-10 based on these):**
{chr(10).join([f"{i+1}. {c}" for i, c in enumerate(criteria)])}

**Evidence Found:**

Search Visibility:
- Appears in {evidence_summary['search_visibility']} search results
- Found on Google search: {'Yes' if evidence_summary['search_visibility'] > 0 else 'No'}

Social Media Presence:
- Platforms found: {', '.join(evidence_summary['social_platforms']) if evidence_summary['social_platforms'] else 'None'}
- Facebook: {evidence.get('facebook', 'Not found')}
- Instagram: {evidence.get('instagram', 'Not found')}
- TripAdvisor: {evidence.get('tripadvisor', 'Not found')}
- YouTube: {evidence.get('youtube', 'Not found')}

Website Analysis:
- Website exists: {evidence_summary['website_found']}
{f"- Title: {evidence_summary['website_content'].get('title', 'N/A')}" if evidence_summary['website_found'] else ''}
{f"- Has contact forms: {evidence_summary['website_content'].get('has_forms', False)}" if evidence_summary['website_found'] else ''}
{f"- Contact info visible: {evidence_summary['website_content'].get('has_contact', False)}" if evidence_summary['website_found'] else ''}
{f"- Number of images: {evidence_summary['website_content'].get('num_images', 0)}" if evidence_summary['website_found'] else ''}
{f"- Mobile-friendly: {evidence_summary['website_content'].get('mobile_friendly', False)}" if evidence_summary['website_found'] else ''}
{f"- Content sample: {evidence_summary['website_content'].get('text_sample', '')}" if evidence_summary['website_found'] else ''}

**Task:**
Based ONLY on the evidence above, evaluate this business for {category}. 

For each of the 10 criteria:
1. Determine if evidence suggests it's met (1 point) or not (0 points)
2. Be conservative - only award points if evidence clearly supports it
3. If evidence is missing or unclear, score 0 for that criterion

Respond in JSON format:
{{
  "score": <total score 0-10>,
  "criteria_scores": [<10 individual scores, 0 or 1>],
  "reasoning": "<2-3 sentence explanation of score>",
  "confidence": "<high/medium/low>",
  "evidence_gaps": "<what evidence is missing that would increase score>"
}}

Only return the JSON, nothing else."""

        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a digital assessment expert. Analyze evidence and score accurately based on objective criteria."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3  # Lower temperature for more consistent scoring
            )
            
            result = json.loads(response.choices[0].message.content)
            self._log(f"{category}: {result['score']}/10 ({result['confidence']} confidence)", "success")
            return result
            
        except Exception as e:
            self._log(f"AI analysis error for {category}: {e}", "error")
            return {
                'score': 0,
                'criteria_scores': [0] * 10,
                'reasoning': f'Error: {str(e)}',
                'confidence': 'none',
                'evidence_gaps': 'Analysis failed'
            }
    
    def analyze_competitor(self, name: str, country: str, sector: str) -> Dict:
        """Complete analysis of one competitor"""
        
        print("\n" + "="*80)
        print(f"ANALYZING: {name}")
        print(f"Country: {country} | Sector: {sector}")
        print("="*80)
        
        # Step 1: Discover digital presence
        presence = self.discover_digital_presence(name, country, sector)
        
        # Step 2: Scrape website if found
        website_data = None
        if presence.get('website'):
            website_data = self.scrape_website(presence['website'])
            time.sleep(1)  # Be nice to servers
        
        # Step 3: Build evidence package
        evidence = {
            'search_results': presence.get('search_results', []),
            'website': presence.get('website'),
            'website_data': website_data,
            'facebook': presence.get('facebook'),
            'instagram': presence.get('instagram'),
            'tripadvisor': presence.get('tripadvisor'),
            'youtube': presence.get('youtube'),
            'linkedin': presence.get('linkedin')
        }
        
        # Step 4: AI analysis for each category
        categories = [
            'Social Media',
            'Website', 
            'Visual Content',
            'Discoverability',
            'Digital Sales',
            'Platform Integration'
        ]
        
        analysis_results = {}
        for category in categories:
            result = self.ai_analyze_category(category, evidence, sector, country)
            analysis_results[category] = result
            time.sleep(0.5)  # Rate limiting
        
        # Step 5: Calculate totals
        total_score = sum(r['score'] for r in analysis_results.values())
        avg_confidence = sum(1 for r in analysis_results.values() if r['confidence'] == 'high') / 6
        
        # Step 6: Compile final result
        final_result = {
            'stakeholder_name': name,
            'country': country,
            'sector': sector,
            'assessment_date': datetime.now().isoformat(),
            'assessment_method': 'ai_enhanced_automated',
            
            # Digital presence
            'digital_presence': {
                'website': presence.get('website'),
                'facebook': presence.get('facebook'),
                'instagram': presence.get('instagram'),
                'tripadvisor': presence.get('tripadvisor'),
                'youtube': presence.get('youtube'),
                'linkedin': presence.get('linkedin')
            },
            
            # Category scores
            'category_scores': {
                'social_media': analysis_results['Social Media']['score'],
                'website': analysis_results['Website']['score'],
                'visual_content': analysis_results['Visual Content']['score'],
                'discoverability': analysis_results['Discoverability']['score'],
                'digital_sales': analysis_results['Digital Sales']['score'],
                'platform_integration': analysis_results['Platform Integration']['score']
            },
            
            # Detailed analysis
            'detailed_analysis': analysis_results,
            
            # Summary
            'total_score': total_score,
            'max_score': 60,
            'percentage': round((total_score / 60) * 100, 1),
            'maturity_level': self._get_maturity_level(total_score),
            'confidence_score': round(avg_confidence * 100, 1)
        }
        
        # Print summary
        print(f"\n📊 RESULTS SUMMARY")
        print(f"{'='*80}")
        print(f"Total Score: {total_score}/60 ({final_result['percentage']}%)")
        print(f"Maturity Level: {final_result['maturity_level']}")
        print(f"Confidence: {final_result['confidence_score']}%")
        print(f"\nCategory Breakdown:")
        for cat, score in final_result['category_scores'].items():
            print(f"  {cat:25} {score}/10")
        
        return final_result
    
    def _get_maturity_level(self, total_score: int) -> str:
        """Determine digital maturity level based on raw score (0-60)"""
        # Convert to percentage and apply standard maturity levels
        percentage = (total_score / 60) * 100
        
        if percentage >= 80:
            return "Expert"
        elif percentage >= 60:
            return "Advanced"
        elif percentage >= 40:
            return "Intermediate"
        elif percentage >= 20:
            return "Emerging"
        else:
            return "Absent/Basic"  # 0-19%
    
    def get_regional_assessment_data(self) -> List[Dict]:
        """Fetch all competitors from Regional Assessment sheet"""
        
        result = self.sheets_service.spreadsheets().values().get(
            spreadsheetId=SHEET_ID,
            range='Regional Assessment!A:C'
        ).execute()
        
        rows = result.get('values', [])
        if not rows:
            return []
        
        headers = rows[0]
        competitors = []
        skipped_rows = []
        
        for i, row in enumerate(rows[1:], start=2):  # Start at row 2 (after header)
            # Only requirement: row must have a name (column A)
            if not row:
                # Completely empty row
                skipped_rows.append((i, "Empty row"))
                continue
            
            if not row[0] or not row[0].strip():
                # No name in column A
                skipped_rows.append((i, "Missing stakeholder name"))
                continue
            
            try:
                # Handle sparse arrays from Google Sheets API
                # If cells are empty, the API doesn't include them in the array
                name = row[0].strip()
                sector = row[1].strip() if len(row) > 1 and row[1] else 'Unknown'
                country = row[2].strip() if len(row) > 2 and row[2] else 'Unknown'
                
                competitors.append({
                    'name': name,
                    'sector': sector,
                    'country': country
                })
            except Exception as e:
                skipped_rows.append((i, f"Error: {str(e)}"))
                continue
        
        # Log skipped rows if in verbose mode
        if skipped_rows and self.verbose:
            self._log(f"Skipped {len(skipped_rows)} rows:", "warn")
            for row_num, reason in skipped_rows[:5]:  # Show first 5
                self._log(f"  Row {row_num}: {reason}", "warn")
            if len(skipped_rows) > 5:
                self._log(f"  ... and {len(skipped_rows) - 5} more", "warn")
        
        return competitors
    
    def save_to_checklist_detail(self, result: Dict):
        """Save detailed criteria scores to Regional Checklist Detail sheet"""
        
        # Find the row for this stakeholder
        search_result = self.sheets_service.spreadsheets().values().get(
            spreadsheetId=SHEET_ID,
            range='Regional Checklist Detail!A:A'
        ).execute()
        
        rows = search_result.get('values', [])
        row_index = None
        
        for i, row in enumerate(rows):
            if not row or not row[0]:
                continue  # Skip empty rows
            
            try:
                if row[0].strip().lower() == result['stakeholder_name'].lower():
                    row_index = i + 1  # 1-indexed
                    break
            except Exception as e:
                self._log(f"Error checking row {i+1}: {e}", "warn")
                continue
        
        if not row_index:
            self._log(f"Could not find {result['stakeholder_name']} in Regional Checklist Detail", "warn")
            self._log("Note: Make sure stakeholder name exists in column A", "warn")
            return False
        
        # Prepare data for Regional Checklist Detail
        # Columns A-E: Basic info
        # Columns F-P: Social Media (10 criteria + total formula)
        # Columns Q-AA: Website (10 criteria + total formula)
        # Columns AB-AL: Visual Content (10 criteria + total formula)
        # Columns AM-AW: Discoverability (10 criteria + total formula)
        # Columns AX-BH: Digital Sales (10 criteria + total formula)
        # Columns BI-BS: Platform Integration (10 criteria + total formula)
        
        analysis = result['detailed_analysis']
        
        # Prepare data in separate chunks to avoid overwriting formula columns
        categories = ['Social Media', 'Website', 'Visual Content', 
                     'Discoverability', 'Digital Sales', 'Platform Integration']
        
        # Column ranges for each category (criteria only, skip totals)
        category_ranges = [
            'F:O',   # Social Media (skip P which has total formula)
            'Q:Z',   # Website (skip AA)
            'AB:AK', # Visual Content (skip AL)
            'AM:AV', # Discoverability (skip AW)
            'AX:BG', # Digital Sales (skip BH)
            'BI:BR'  # Platform Integration (skip BS)
        ]
        
        # Reasoning columns (after all criteria and totals)
        # BT-BY: Reasoning for each category
        reasoning_data = [
            analysis['Social Media']['reasoning'],
            analysis['Website']['reasoning'],
            analysis['Visual Content']['reasoning'],
            analysis['Discoverability']['reasoning'],
            analysis['Digital Sales']['reasoning'],
            analysis['Platform Integration']['reasoning']
        ]
        
        try:
            # First, update basic info (A-E)
            self.sheets_service.spreadsheets().values().update(
                spreadsheetId=SHEET_ID,
                range=f'Regional Checklist Detail!A{row_index}:E{row_index}',
                valueInputOption='RAW',
                body={'values': [[
                    result['stakeholder_name'],
                    result['sector'],
                    result['country'],
                    result['assessment_date'],
                    result['assessment_method']
                ]]}
            ).execute()
            
            # Then, update each category's criteria (skipping total columns)
            for i, category in enumerate(categories):
                criteria_scores = analysis[category]['criteria_scores']
                col_range = category_ranges[i]
                self.sheets_service.spreadsheets().values().update(
                    spreadsheetId=SHEET_ID,
                    range=f'Regional Checklist Detail!{col_range}{row_index}',
                    valueInputOption='RAW',
                    body={'values': [criteria_scores]}
                ).execute()
            
            # Finally, add AI reasoning in columns BT-BY for reference during manual review
            self.sheets_service.spreadsheets().values().update(
                spreadsheetId=SHEET_ID,
                range=f'Regional Checklist Detail!BT{row_index}:BY{row_index}',
                valueInputOption='RAW',
                body={'values': [reasoning_data]}
            ).execute()
            
            self._log(f"Saved detailed criteria for {result['stakeholder_name']} to Regional Checklist Detail", "success")
            return True
            
        except Exception as e:
            self._log(f"Error saving to Regional Checklist Detail: {e}", "error")
            return False
    
    def save_to_sheet(self, result: Dict):
        """Save metadata and URLs to Regional Assessment sheet (totals pulled from Checklist Detail)"""
        
        # Find the row for this stakeholder
        search_result = self.sheets_service.spreadsheets().values().get(
            spreadsheetId=SHEET_ID,
            range='Regional Assessment!A:A'
        ).execute()
        
        rows = search_result.get('values', [])
        row_index = None
        
        for i, row in enumerate(rows):
            if not row or not row[0]:
                continue  # Skip empty rows
            
            try:
                if row[0].strip().lower() == result['stakeholder_name'].lower():
                    row_index = i + 1  # 1-indexed
                    break
            except Exception as e:
                self._log(f"Error checking row {i+1}: {e}", "warn")
                continue
        
        if not row_index:
            self._log(f"Could not find {result['stakeholder_name']} in Regional Assessment", "warn")
            return False
        
        # Prepare data for Regional Assessment
        # Regional Assessment will have formulas to pull scores from Regional Checklist Detail
        # We only write: reasoning, confidence, URLs, and metadata
        
        analysis = result['detailed_analysis']
        presence = result['digital_presence']
        
        update_data = [
            # L-Q: Reasoning
            analysis['Social Media']['reasoning'],
            analysis['Website']['reasoning'],
            analysis['Visual Content']['reasoning'],
            analysis['Discoverability']['reasoning'],
            analysis['Digital Sales']['reasoning'],
            analysis['Platform Integration']['reasoning'],
            
            # R-W: Confidence
            analysis['Social Media']['confidence'],
            analysis['Website']['confidence'],
            analysis['Visual Content']['confidence'],
            analysis['Discoverability']['confidence'],
            analysis['Digital Sales']['confidence'],
            analysis['Platform Integration']['confidence'],
            
            # X-AC: URLs
            presence['website'] or '',
            presence['facebook'] or '',
            presence['instagram'] or '',
            presence['tripadvisor'] or '',
            presence['youtube'] or '',
            presence['linkedin'] or '',
            
            # AD-AE: Metadata
            result['assessment_date'],
            result['assessment_method']
        ]
        
        # Update the row (columns L-AE)
        try:
            self.sheets_service.spreadsheets().values().update(
                spreadsheetId=SHEET_ID,
                range=f'Regional Assessment!L{row_index}:AE{row_index}',
                valueInputOption='RAW',
                body={'values': [update_data]}
            ).execute()
            
            self._log(f"Saved metadata for {result['stakeholder_name']} to Regional Assessment", "success")
            return True
            
        except Exception as e:
            self._log(f"Error saving to Regional Assessment: {e}", "error")
            return False


def main():
    """Main execution"""
    
    print("="*80)
    print("REGIONAL COMPETITOR ANALYSIS SYSTEM")
    print("AI-Enhanced Automated Assessment")
    print("="*80)
    
    # Check API keys
    missing_keys = []
    if not GOOGLE_API_KEY:
        missing_keys.append("GOOGLE_API_KEY")
    if not SEARCH_ENGINE_ID:
        missing_keys.append("GOOGLE_SEARCH_ENGINE_ID")
    if not OPENAI_API_KEY:
        missing_keys.append("OPENAI_API_KEY")
    
    if missing_keys:
        print(f"\n❌ Missing API keys: {', '.join(missing_keys)}")
        print("\nSet them with:")
        for key in missing_keys:
            print(f"  export {key}='your-key-here'")
        return
    
    analyzer = RegionalCompetitorAnalyzer(verbose=True)
    
    # Ask user for mode
    print("\n" + "="*80)
    print("SELECT MODE:")
    print("1. Test single competitor (recommended for first run)")
    print("2. Analyze all Regional Assessment competitors")
    print("3. Analyze specific country")
    print("="*80)
    
    mode = input("\nEnter choice (1/2/3): ").strip()
    
    if mode == "1":
        # Test mode - single competitor
        name = input("Enter competitor name: ").strip()
        country = input("Enter country: ").strip()
        sector = input("Enter sector: ").strip()
        
        result = analyzer.analyze_competitor(name, country, sector)
        
        # Save to JSON
        output_file = f"regional_analysis_{name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        
        print(f"\n✅ Results saved to: {output_file}")
        
        # Ask if should save to sheet
        save = input("\nSave to sheets? (y/n): ").strip().lower()
        if save == 'y':
            # Save to Regional Checklist Detail (all 60 criteria)
            analyzer.save_to_checklist_detail(result)
            # Save to Regional Assessment (metadata, reasoning, URLs)
            analyzer.save_to_sheet(result)
    
    elif mode == "2":
        # Analyze all
        competitors = analyzer.get_regional_assessment_data()
        
        print(f"\n📋 Found {len(competitors)} competitors in Regional Assessment")
        confirm = input(f"\nAnalyze all {len(competitors)} competitors? (y/n): ").strip().lower()
        
        if confirm != 'y':
            print("Cancelled")
            return
        
        results = []
        for i, comp in enumerate(competitors, 1):
            print(f"\n[{i}/{len(competitors)}]")
            try:
                result = analyzer.analyze_competitor(
                    comp['name'],
                    comp['country'],
                    comp['sector']
                )
                results.append(result)
                analyzer.save_to_checklist_detail(result)
                analyzer.save_to_sheet(result)
                
                # Save checkpoint every 10
                if i % 10 == 0:
                    checkpoint_file = f"regional_analysis_checkpoint_{i}.json"
                    with open(checkpoint_file, 'w') as f:
                        json.dump(results, f, indent=2)
                    print(f"💾 Checkpoint saved: {checkpoint_file}")
                
                time.sleep(2)  # Be nice to APIs
                
            except Exception as e:
                print(f"❌ Error analyzing {comp['name']}: {e}")
                continue
        
        # Save final results
        final_file = f"regional_analysis_complete_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(final_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n✅ Complete! Results saved to: {final_file}")
        
    elif mode == "3":
        # Analyze by country
        country = input("Enter country name: ").strip()
        competitors = analyzer.get_regional_assessment_data()
        filtered = [c for c in competitors if c['country'].lower() == country.lower()]
        
        print(f"\n📋 Found {len(filtered)} competitors in {country}")
        confirm = input(f"\nAnalyze all {len(filtered)} competitors? (y/n): ").strip().lower()
        
        if confirm != 'y':
            print("Cancelled")
            return
        
        results = []
        for i, comp in enumerate(filtered, 1):
            print(f"\n[{i}/{len(filtered)}]")
            try:
                result = analyzer.analyze_competitor(
                    comp['name'],
                    comp['country'],
                    comp['sector']
                )
                results.append(result)
                analyzer.save_to_checklist_detail(result)
                analyzer.save_to_sheet(result)
                time.sleep(2)
                
            except Exception as e:
                print(f"❌ Error analyzing {comp['name']}: {e}")
                continue
        
        # Save results
        output_file = f"regional_analysis_{country}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n✅ Complete! Results saved to: {output_file}")


if __name__ == '__main__':
    main()

