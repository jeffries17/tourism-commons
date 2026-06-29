#!/usr/bin/env python3
"""
Web Scraper for ITOs Analysis
Follows links in Google Sheets and scrapes content from Gambia-specific pages
"""

import json
import os
import re
import time
import logging
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from urllib.parse import urljoin, urlparse
from dataclasses import dataclass

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

try:
    import requests
    from bs4 import BeautifulSoup
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry
    WEB_SCRAPING_AVAILABLE = True
except ImportError:
    WEB_SCRAPING_AVAILABLE = False
    logger.warning("Web scraping libraries not available. Install: pip install requests beautifulsoup4")

@dataclass
class ScrapedContent:
    """Results of web scraping"""
    url: str
    title: str
    description: str
    content: str
    marketing_text: List[str]
    services: List[str]
    success: bool
    error_message: Optional[str] = None
    response_time: float = 0.0

class ITOsWebScraper:
    """Web scraper for ITOs Gambia-specific pages"""
    
    def __init__(self, max_retries: int = 3, delay: float = 1.0):
        self.max_retries = max_retries
        self.delay = delay
        self.session = None
        self.scraped_content = {}
        
        if WEB_SCRAPING_AVAILABLE:
            self._setup_session()
    
    def _setup_session(self):
        """Setup requests session with retry strategy"""
        self.session = requests.Session()
        
        # Retry strategy
        retry_strategy = Retry(
            total=self.max_retries,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        # Set headers to mimic a real browser
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
    
    def scrape_gambia_page(self, url: str, company_name: str) -> ScrapedContent:
        """Scrape content from a Gambia-specific page"""
        if not WEB_SCRAPING_AVAILABLE:
            return ScrapedContent(
                url=url,
                title="",
                description="",
                content="",
                marketing_text=[],
                services=[],
                success=False,
                error_message="Web scraping libraries not available"
            )
        
        start_time = time.time()
        
        try:
            logger.info(f"Scraping {company_name}: {url}")
            
            # Make request
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract content
            title = self._extract_title(soup)
            description = self._extract_description(soup)
            content = self._extract_main_content(soup)
            marketing_text = self._extract_marketing_text(soup)
            services = self._extract_services(soup)
            
            response_time = time.time() - start_time
            
            # Store scraped content
            scraped = ScrapedContent(
                url=url,
                title=title,
                description=description,
                content=content,
                marketing_text=marketing_text,
                services=services,
                success=True,
                response_time=response_time
            )
            
            self.scraped_content[company_name] = scraped
            logger.info(f"✅ Successfully scraped {company_name} ({response_time:.2f}s)")
            
            return scraped
            
        except Exception as e:
            response_time = time.time() - start_time
            error_msg = f"Error scraping {url}: {str(e)}"
            logger.error(error_msg)
            
            return ScrapedContent(
                url=url,
                title="",
                description="",
                content="",
                marketing_text=[],
                services=[],
                success=False,
                error_message=error_msg,
                response_time=response_time
            )
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract page title"""
        title_tag = soup.find('title')
        if title_tag:
            return title_tag.get_text().strip()
        
        # Try h1 tag as fallback
        h1_tag = soup.find('h1')
        if h1_tag:
            return h1_tag.get_text().strip()
        
        return ""
    
    def _extract_description(self, soup: BeautifulSoup) -> str:
        """Extract meta description"""
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc:
            return meta_desc.get('content', '').strip()
        
        # Try Open Graph description
        og_desc = soup.find('meta', attrs={'property': 'og:description'})
        if og_desc:
            return og_desc.get('content', '').strip()
        
        return ""
    
    def _extract_main_content(self, soup: BeautifulSoup) -> str:
        """Extract main content from the page"""
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
        
        # Try to find main content areas
        main_content = ""
        
        # Look for common content containers
        content_selectors = [
            'main', 'article', '.content', '.main-content', 
            '.page-content', '.post-content', '#content'
        ]
        
        for selector in content_selectors:
            content_elem = soup.select_one(selector)
            if content_elem:
                main_content = content_elem.get_text()
                break
        
        # If no main content found, get all text
        if not main_content:
            main_content = soup.get_text()
        
        # Clean up the text
        main_content = re.sub(r'\s+', ' ', main_content).strip()
        
        return main_content
    
    def _extract_marketing_text(self, soup: BeautifulSoup) -> List[str]:
        """Extract marketing-focused text"""
        marketing_text = []
        
        # Look for marketing-specific elements
        marketing_selectors = [
            'h1', 'h2', 'h3', '.hero', '.banner', '.marketing',
            '.promo', '.highlight', '.feature', '.benefit'
        ]
        
        for selector in marketing_selectors:
            elements = soup.select(selector)
            for elem in elements:
                text = elem.get_text().strip()
                if text and len(text) > 10:  # Filter out very short text
                    marketing_text.append(text)
        
        # Remove duplicates and limit length
        marketing_text = list(dict.fromkeys(marketing_text))[:10]
        
        return marketing_text
    
    def _extract_services(self, soup: BeautifulSoup) -> List[str]:
        """Extract services or tour offerings"""
        services = []
        
        # Look for service-related elements
        service_selectors = [
            '.service', '.tour', '.package', '.offering', '.product',
            '.itinerary', '.program', '.activity', 'li', '.list-item'
        ]
        
        for selector in service_selectors:
            elements = soup.select(selector)
            for elem in elements:
                text = elem.get_text().strip()
                # Filter for service-like text
                if (text and len(text) > 5 and len(text) < 200 and 
                    any(keyword in text.lower() for keyword in ['tour', 'package', 'service', 'experience', 'adventure', 'safari', 'excursion'])):
                    services.append(text)
        
        # Remove duplicates and limit length
        services = list(dict.fromkeys(services))[:15]
        
        return services
    
    def scrape_all_itos_from_sheet(self, itos_data: List[Dict]) -> Dict:
        """Scrape all ITOs from Google Sheets data"""
        logger.info(f"Starting web scraping for {len(itos_data)} ITOs")
        
        results = {
            'scraped_itos': [],
            'failed_scrapes': [],
            'summary': {
                'total_itos': len(itos_data),
                'successful_scrapes': 0,
                'failed_scrapes': 0,
                'total_content_length': 0,
                'average_response_time': 0.0
            }
        }
        
        total_response_time = 0.0
        
        for i, ito in enumerate(itos_data, 1):
            company_name = ito.get('company_name', f'ITO_{i}')
            gambia_page_link = ito.get('gambia_page_link', '')
            
            logger.info(f"Processing {i}/{len(itos_data)}: {company_name}")
            
            if not gambia_page_link or not self._is_valid_url(gambia_page_link):
                logger.warning(f"Skipping {company_name}: Invalid or missing URL")
                results['failed_scrapes'].append({
                    'company_name': company_name,
                    'url': gambia_page_link,
                    'error': 'Invalid or missing URL'
                })
                continue
            
            # Scrape the page
            scraped = self.scrape_gambia_page(gambia_page_link, company_name)
            
            if scraped.success:
                results['scraped_itos'].append({
                    'company_name': company_name,
                    'url': scraped.url,
                    'title': scraped.title,
                    'description': scraped.description,
                    'content': scraped.content,
                    'marketing_text': scraped.marketing_text,
                    'services': scraped.services,
                    'response_time': scraped.response_time,
                    'content_length': len(scraped.content)
                })
                
                results['summary']['successful_scrapes'] += 1
                results['summary']['total_content_length'] += len(scraped.content)
                total_response_time += scraped.response_time
            else:
                results['failed_scrapes'].append({
                    'company_name': company_name,
                    'url': scraped.url,
                    'error': scraped.error_message
                })
            
            # Add delay between requests to be respectful
            if i < len(itos_data):
                time.sleep(self.delay)
        
        # Calculate summary statistics
        results['summary']['failed_scrapes'] = len(results['failed_scrapes'])
        if results['summary']['successful_scrapes'] > 0:
            results['summary']['average_response_time'] = total_response_time / results['summary']['successful_scrapes']
        
        logger.info(f"Scraping completed: {results['summary']['successful_scrapes']} successful, {results['summary']['failed_scrapes']} failed")
        
        return results
    
    def _is_valid_url(self, url: str) -> bool:
        """Check if URL is valid"""
        if not url or not isinstance(url, str):
            return False
        
        # Check if it's a descriptive text instead of URL
        if not url.startswith(('http://', 'https://')):
            return False
        
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except:
            return False
    
    def save_scraped_data(self, results: Dict, output_dir: str = "../output") -> str:
        """Save scraped data to file"""
        os.makedirs(output_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"itos_scraped_data_{timestamp}.json"
        filepath = os.path.join(output_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False, default=str)
        
        logger.info(f"Scraped data saved to {filepath}")
        return filepath

def main():
    """Test the web scraper"""
    if not WEB_SCRAPING_AVAILABLE:
        print("❌ Web scraping libraries not available. Please install:")
        print("pip install requests beautifulsoup4")
        return
    
    # Test with sample data
    sample_itos = [
        {
            'company_name': 'Adventure Life',
            'gambia_page_link': 'https://www.adventure-life.com/africa/gambia'
        },
        {
            'company_name': 'Intrepid Travel',
            'gambia_page_link': 'https://www.intrepidtravel.com/gambia'
        }
    ]
    
    scraper = ITOsWebScraper()
    results = scraper.scrape_all_itos_from_sheet(sample_itos)
    
    print(f"Scraping Results:")
    print(f"  Successful: {results['summary']['successful_scrapes']}")
    print(f"  Failed: {results['summary']['failed_scrapes']}")
    print(f"  Total Content: {results['summary']['total_content_length']} characters")
    print(f"  Average Response Time: {results['summary']['average_response_time']:.2f}s")

if __name__ == "__main__":
    main()
