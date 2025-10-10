#!/usr/bin/env python3
"""
ITO Content Scraper
Intelligently extracts meaningful content from tour operator pages
"""

import asyncio
import json
import re
from datetime import datetime
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
from typing import Dict, List, Optional

class ITOContentScraper:
    def __init__(self):
        self.results = []
    
    def scrape_page(self, url: str, page_type: str = 'tour_page') -> Dict:
        """Synchronous wrapper for async scrape_page_async"""
        return asyncio.run(self.scrape_page_async(url, page_type))
    
    async def scrape_page_async(self, url: str, page_type: str) -> Dict:
        """
        Scrape a single page and extract meaningful content
        
        Args:
            url: URL to scrape
            page_type: 'gambia_page' or 'tour_page'
        
        Returns:
            Dict with extracted content
        """
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            try:
                print(f"  Scraping: {url[:80]}...")
                
                # Load page with extended timeout for JS-heavy sites
                await page.goto(url, wait_until='networkidle', timeout=45000)
                
                # Wait for common content containers to load
                try:
                    await page.wait_for_selector('main, article, .content, #content', timeout=5000)
                except:
                    pass  # Continue even if selector not found
                
                # Scroll to load lazy-loaded content
                await page.evaluate('window.scrollTo(0, document.body.scrollHeight/2)')
                await page.wait_for_timeout(1000)
                await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
                await page.wait_for_timeout(2000)
                
                # Additional wait for dynamic content
                await page.wait_for_timeout(3000)
                
                # Get HTML content
                html = await page.content()
                soup = BeautifulSoup(html, 'html.parser')
                
                # Extract metadata
                title = soup.find('title')
                title_text = title.get_text().strip() if title else ''
                
                meta_desc = soup.find('meta', attrs={'name': 'description'})
                meta_description = meta_desc.get('content', '').strip() if meta_desc else ''
                
                # Extract special sections for creative tourism analysis
                special_sections = self._extract_special_sections(soup)
                
                # Extract main content
                main_content = self._extract_main_content(soup)
                
                # Extract headers (important for themes)
                headers = self._extract_headers(soup)
                
                # ENHANCED: Weighted content assembly for creative tourism
                # Priority order reflects importance for cultural/creative positioning:
                # 1. Title + Meta (positioning keywords) - 1x
                # 2. Headers (themes and structure) - 1x
                # 3. Overview (marketing language) - 1.5x
                # 4. Highlights (key selling points) - 2x
                # 5. Itinerary (detailed cultural activities) - 2x
                # 6. Image descriptions (visual cultural content) - 1x
                # 7. Main content (catch-all) - 1x
                
                weighted_content = []
                weighted_content.append(title_text)
                weighted_content.append(meta_description)
                weighted_content.append(headers)
                
                # Overview - 1.5x weight
                if special_sections['overview']:
                    weighted_content.append(special_sections['overview'])
                    weighted_content.append(special_sections['overview'][:len(special_sections['overview'])//2])
                
                # Highlights - 2x weight (key cultural selling points)
                if special_sections['highlights']:
                    weighted_content.append(special_sections['highlights'])
                    weighted_content.append(special_sections['highlights'])
                
                # Itinerary - 2x weight (detailed cultural activities)
                if special_sections['itinerary']:
                    weighted_content.append(special_sections['itinerary'])
                    weighted_content.append(special_sections['itinerary'])
                
                # Image descriptions - 1x weight
                if special_sections['image_descriptions']:
                    weighted_content.append(special_sections['image_descriptions'])
                
                # Main content - 1x weight
                weighted_content.append(main_content)
                
                # Assemble and clean
                full_text = '\n\n'.join(weighted_content)
                full_text = self._clean_text(full_text)
                
                word_count = len(full_text.split())
                
                result = {
                    'url': url,
                    'page_type': page_type,
                    'success': True,
                    'title': title_text,
                    'meta_description': meta_description,
                    'headers': headers,
                    'highlights': special_sections['highlights'][:500],  # First 500 chars
                    'itinerary': special_sections['itinerary'][:1000],  # First 1000 chars
                    'main_content': main_content[:3000],  # First 3000 chars
                    'full_text': full_text,
                    'word_count': word_count,
                    'scraped_at': datetime.now().isoformat()
                }
                
                print(f"    ✅ Extracted {word_count} words")
                return result
                
            except Exception as e:
                print(f"    ❌ Error: {str(e)[:100]}")
                return {
                    'url': url,
                    'page_type': page_type,
                    'success': False,
                    'error': str(e),
                    'full_text': '',
                    'word_count': 0
                }
            finally:
                await browser.close()
    
    def _extract_special_sections(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Extract specific sections important for creative tourism analysis"""
        sections = {}
        
        # Highlights/What's Included (weighted 2x in analysis)
        highlights_selectors = [
            '.highlights', '.tour-highlights', '[class*="highlight"]',
            '.inclusions', '.whats-included', '.included',
            '.features', '.tour-features'
        ]
        highlights = []
        for selector in highlights_selectors:
            elements = soup.select(selector)
            for elem in elements:
                text = elem.get_text(separator=' ', strip=True)
                if text and len(text) > 20:
                    highlights.append(text)
        sections['highlights'] = ' '.join(highlights) if highlights else ''
        
        # Itinerary/Day-by-Day (weighted 2x - most detailed cultural info)
        itinerary_selectors = [
            '.itinerary', '.day-by-day', '.tour-itinerary',
            '[class*="itinerary"]', '[class*="day-"]',
            '.daily-schedule', '.tour-schedule'
        ]
        itinerary = []
        for selector in itinerary_selectors:
            elements = soup.select(selector)
            for elem in elements:
                text = elem.get_text(separator=' ', strip=True)
                if text and len(text) > 50:
                    itinerary.append(text)
        sections['itinerary'] = ' '.join(itinerary) if itinerary else ''
        
        # Overview/Description (weighted 1.5x - positioning language)
        overview_selectors = [
            '.overview', '.tour-overview', '.trip-overview',
            '.description', '.tour-description', '.trip-description',
            '.about', '.introduction'
        ]
        overview = []
        for selector in overview_selectors:
            elements = soup.select(selector)
            for elem in elements:
                text = elem.get_text(separator=' ', strip=True)
                if text and len(text) > 50:
                    overview.append(text)
        sections['overview'] = ' '.join(overview) if overview else ''
        
        # Image alt text (often contains activity descriptions)
        image_alts = []
        for img in soup.find_all('img', alt=True):
            alt_text = img['alt'].strip()
            if alt_text and len(alt_text) > 10 and len(alt_text) < 200:
                image_alts.append(alt_text)
        sections['image_descriptions'] = ' '.join(image_alts) if image_alts else ''
        
        return sections
    
    def _extract_main_content(self, soup: BeautifulSoup) -> str:
        """Extract main content, filtering out navigation/footer/ads"""
        
        # Remove unwanted elements
        for element in soup(['nav', 'footer', 'script', 'style', 'aside', 
                            'header', 'menu', 'iframe', 'noscript']):
            element.decompose()
        
        # Try to find main content areas (in priority order)
        content_selectors = [
            # Itinerary-specific selectors (HIGH PRIORITY for creative tourism)
            '.itinerary',
            '.itinerary-content',
            '.day-by-day',
            '.tour-itinerary',
            '[class*="itinerary"]',
            '[class*="day-"]',
            # Tour description selectors
            '.tour-description',
            '.trip-description',
            '.overview',
            '.highlights',
            '.inclusions',
            # General content selectors
            'article',
            'main',
            '[role="main"]',
            '.content',
            '.main-content',
            '.article-content',
            '.description',
            '.destination-content',
            '#content',
            '#main'
        ]
        
        extracted_text = []
        
        for selector in content_selectors:
            elements = soup.select(selector)
            if elements:
                for elem in elements:
                    text = elem.get_text(separator=' ', strip=True)
                    if len(text) > 100:  # Only include substantial content
                        extracted_text.append(text)
        
        # If no main content found, fall back to body (less ideal)
        if not extracted_text:
            body = soup.find('body')
            if body:
                extracted_text.append(body.get_text(separator=' ', strip=True))
        
        return ' '.join(extracted_text)
    
    def _extract_headers(self, soup: BeautifulSoup) -> str:
        """Extract all headers (H1-H3) as they often contain key themes"""
        headers = []
        for tag in ['h1', 'h2', 'h3']:
            for header in soup.find_all(tag):
                text = header.get_text().strip()
                if text and len(text) > 2:
                    headers.append(text)
        return ' | '.join(headers)
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove common UI elements
        text = re.sub(r'(Cookie|Privacy Policy|Terms|Subscribe|Share|Tweet|Facebook)', '', text, flags=re.IGNORECASE)
        # Remove email/phone patterns (not useful for sentiment)
        text = re.sub(r'\S+@\S+', '', text)
        text = re.sub(r'\+?\d[\d\s\-()]{8,}', '', text)
        return text.strip()


async def scrape_operator_urls(operator_name: str, gambia_urls: List[str], tour_urls: List[str]) -> Dict:
    """
    Scrape all URLs for a single operator
    
    Returns:
        Dict with combined content from all pages
    """
    scraper = ITOContentScraper()
    
    print(f"\n{'='*80}")
    print(f"Scraping: {operator_name}")
    print(f"{'='*80}")
    
    all_content = {
        'operator': operator_name,
        'gambia_pages': [],
        'tour_pages': [],
        'total_word_count': 0,
        'combined_text': '',
        'scraped_at': datetime.now().isoformat()
    }
    
    # Scrape Gambia pages
    if gambia_urls:
        print(f"📄 Gambia Pages ({len(gambia_urls)}):")
        for url in gambia_urls:
            if url and url.strip():
                result = await scraper.scrape_page_async(url.strip(), 'gambia_page')
                all_content['gambia_pages'].append(result)
                if result['success']:
                    all_content['total_word_count'] += result['word_count']
                    all_content['combined_text'] += f"\n\n{result['full_text']}"
    
    # Scrape tour pages
    if tour_urls:
        print(f"🎫 Tour Pages ({len(tour_urls)}):")
        for url in tour_urls:
            if url and url.strip():
                result = await scraper.scrape_page_async(url.strip(), 'tour_page')
                all_content['tour_pages'].append(result)
                if result['success']:
                    all_content['total_word_count'] += result['word_count']
                    all_content['combined_text'] += f"\n\n{result['full_text']}"
    
    print(f"✅ Total extracted: {all_content['total_word_count']} words")
    
    return all_content


async def main():
    """Test the scraper with a few examples"""
    
    # Test with a couple of operators
    test_cases = [
        {
            'operator': 'Explore',
            'gambia_urls': ['https://www.explore.co.uk/destinations/africa/the-gambia'],
            'tour_urls': ['https://www.explore.co.uk/holidays/senegal-and-the-gambia']
        },
        {
            'operator': 'Naturetrek',
            'gambia_urls': ['https://www.naturetrek.co.uk/destinations/africa/gambia'],
            'tour_urls': ['https://www.naturetrek.co.uk/tours/the-gambia-in-style']
        }
    ]
    
    all_results = []
    
    for test in test_cases:
        result = await scrape_operator_urls(
            test['operator'],
            test['gambia_urls'],
            test['tour_urls']
        )
        all_results.append(result)
        
        # Save individual result
        filename = f"ito_content_{test['operator'].lower().replace(' ', '_')}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        print(f"💾 Saved to {filename}")
    
    print(f"\n{'='*80}")
    print(f"✅ Scraping complete! Tested {len(all_results)} operators")
    print(f"{'='*80}")


if __name__ == '__main__':
    asyncio.run(main())

