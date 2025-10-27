#!/usr/bin/env python3
"""
ITO AI Analyzer - Uses Google Cloud Natural Language API + keyword analysis
to assess creative tourism content in ITO pages
"""

import re
from collections import Counter
from google.cloud import language_v1


class ITOAnalyzer:
    """Analyzes ITO content for creative tourism sectors"""
    
    def __init__(self):
        self.client = language_v1.LanguageServiceClient()
        
        # Creative sector keywords (improved with context filtering)
        self.SECTOR_KEYWORDS = {
            'Heritage': [
                'heritage', 'heritage site', 'unesco', 'historical', 'history', 
                'museum', 'fort', 'colonial', 'roots', 'kunta kinteh', 'james island',
                'wassu', 'stone circles', 'slave trade', 'slavery', 'historic'
            ],
            'Crafts': [
                'craft', 'crafts', 'artisan', 'handmade', 'woodcarving', 'woodcarver',
                'batik', 'tie-dye', 'tie dye', 'weaving', 'pottery', 'basket', 'market', 
                'souvenir', 'handicraft'
            ],
            'Music': [
                'music', 'kora', 'drum', 'drummer', 'drumming', 'live music', 
                'musician', 'concert', 'balafon', 'griot', 'djembe', 'performance music'
            ],
            'Performing_Arts': [
                'dance', 'dancer', 'dancing', 'theater', 'theatre', 'drama', 
                'performance', 'performing', 'kankurang', 'mask dance', 'cultural performance'
            ],
            'Festivals': [
                'festival', 'ceremony', 'celebration', 'carnival', 'feast', 
                'cultural event', 'fanado', 'difuntu', 'roots homecoming'
            ],
            'Audiovisual': [
                'film', 'cinema', 'photo', 'photograph', 'photography', 'photographer',
                'tv', 'television', 'documentary', 'video production', 'videography'
            ],
            'Fashion': [
                'fashion', 'design', 'textile', 'fabric', 'tailor', 'tailoring',
                'dress', 'clothing', 'attire', 'garment', 'style', 'outfit'
            ],
            'Publishing': [
                'author', 'writer', 'poet', 'literature', 'story', 'storytelling',
                'publication', 'print', 'magazine', 'journal', 'writing'
            ]
        }
        
        # Context filters - exclude these phrases from matching
        self.CONTEXT_FILTERS = {
            'Publishing': [
                r'\bbook now\b', r'\bbook by\b', r'\bbook your\b', r'\bbook a\b',
                r'\bbook the\b', r'\bto book\b', r'\bbooking\b', r'\breserve\b',
                r'\bbook early\b', r'\bbook online\b', r'\bbook in advance\b'
            ],
            'Audiovisual': [
                r'\bvideo player\b', r'\bvideo call\b', r'\bvideo conference\b',
                r'\bwatch video\b', r'\bvideo below\b', r'\bvideo above\b',
                r'\bplay video\b', r'\bvideo tour\b'
            ]
        }
    
    def _should_filter_keyword(self, keyword, context_text, sector):
        """Check if keyword should be filtered based on context"""
        if sector not in self.CONTEXT_FILTERS:
            return False
        
        # Check if any filter pattern matches in the surrounding context
        for pattern in self.CONTEXT_FILTERS[sector]:
            if re.search(pattern, context_text, re.IGNORECASE):
                return True
        return False
    
    def _extract_keyword_context(self, text, keyword, window=50):
        """Extract surrounding context for a keyword match"""
        pattern = re.compile(r'\b' + re.escape(keyword) + r'\b', re.IGNORECASE)
        matches = []
        
        for match in pattern.finditer(text):
            start = max(0, match.start() - window)
            end = min(len(text), match.end() + window)
            context = text[start:end]
            matches.append(context)
        
        return matches
    
    def analyze_creative_sectors(self, text):
        """Analyze creative sector mentions with improved context filtering"""
        sector_scores = {}
        sector_details = {}
        sector_justifications = {}
        
        for sector, keywords in self.SECTOR_KEYWORDS.items():
            mentions = []
            unique_terms = set()
            
            for keyword in keywords:
                # Find all contexts where this keyword appears
                contexts = self._extract_keyword_context(text, keyword)
                
                # Filter out false positives
                valid_mentions = 0
                for context in contexts:
                    if not self._should_filter_keyword(keyword, context, sector):
                        valid_mentions += 1
                        unique_terms.add(keyword)
                
                mentions.extend([keyword] * valid_mentions)
            
            # Score based on mention count and term diversity
            mention_count = len(mentions)
            unique_count = len(unique_terms)
            
            if mention_count == 0:
                score = 0
                detail = ""
                justification = ""
            elif mention_count == 1:
                score = 1
                detail = f"Brief mention (1×): {', '.join(unique_terms)}"
                justification = f"Brief mention (1×): {', '.join(unique_terms)}"
            elif mention_count <= 3:
                score = 2 if unique_count == 1 else 3
                detail = f"Brief mention ({mention_count}×): {', '.join(sorted(unique_terms))}"
                justification = f"Brief mention ({mention_count}×): {', '.join(sorted(unique_terms))}"
            elif mention_count <= 8:
                # Described level
                diversity_bonus = 1 if unique_count >= 3 else 0
                score = 4 + unique_count + diversity_bonus
                score = min(score, 6)
                terms_str = ', '.join(sorted(unique_terms)[:5])
                detail = f"Described ({mention_count} mentions, {unique_count} unique terms): {terms_str}"
                justification = f"Described ({mention_count} mentions, {unique_count} unique terms): {terms_str}"
            elif mention_count <= 15:
                # Featured level
                diversity_bonus = 1 if unique_count >= 4 else 0
                score = 7 + diversity_bonus
                score = min(score, 9)
                terms_str = ', '.join(sorted(unique_terms)[:6])
                detail = f"Featured ({mention_count} mentions across {unique_count} terms): {terms_str}..."
                justification = f"Featured ({mention_count} mentions, {unique_count} unique terms): {terms_str}{'... [+1 for diversity]' if diversity_bonus else ''}"
            else:
                # Heavily featured
                diversity_bonus = 1 if unique_count >= 5 else 0
                score = 10
                terms_str = ', '.join(sorted(unique_terms)[:8])
                detail = f"Heavily featured ({mention_count} mentions, {unique_count} unique terms): {terms_str}{'... [+1 for diversity]' if diversity_bonus else ''}"
                justification = f"Heavily featured ({mention_count} mentions, {unique_count} unique terms): {terms_str}{'... [+1 for diversity]' if diversity_bonus else ''}"
            
            sector_scores[sector.lower()] = score
            sector_details[sector.lower()] = detail
            sector_justifications[sector.lower()] = justification
        
        return sector_scores, sector_details, sector_justifications
    
    def get_sentiment(self, text):
        """Get sentiment score using Google NL API"""
        try:
            document = language_v1.Document(
                content=text[:10000],  # API limit
                type_=language_v1.Document.Type.PLAIN_TEXT
            )
            
            sentiment = self.client.analyze_sentiment(
                request={'document': document}
            ).document_sentiment
            
            return round(sentiment.score, 2)
        except Exception as e:
            print(f"  ⚠️  Sentiment analysis failed: {e}")
            return 0.0
    
    def identify_themes(self, text):
        """Identify primary themes in the text"""
        themes = []
        
        # Theme keywords
        theme_keywords = {
            'Beach/Resort': ['beach', 'resort', 'sun', 'swimming', 'relaxation', 'ocean', 'sand', 'coastal'],
            'Wildlife/Nature': ['wildlife', 'nature', 'bird', 'animal', 'park', 'reserve', 'safari', 'hippo', 'crocodile', 'chimpanzee'],
            'Cultural Heritage': ['culture', 'heritage', 'history', 'museum', 'traditional', 'village', 'colonial', 'unesco'],
            'Adventure': ['adventure', 'expedition', 'trekking', 'hiking', 'kayaking', 'explore', 'discovery'],
            'Birding/Specialist': ['birding', 'birdwatching', 'ornithology', 'species', 'endemic']
        }
        
        text_lower = text.lower()
        theme_scores = {}
        
        for theme, keywords in theme_keywords.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            theme_scores[theme] = score
        
        # Get top 3 themes
        sorted_themes = sorted(theme_scores.items(), key=lambda x: x[1], reverse=True)
        themes = [theme for theme, score in sorted_themes[:3] if score > 0]
        
        return themes
    
    def detect_countries_mentioned(self, text):
        """Detect all West African countries mentioned in text"""
        text_lower = text.lower()
        
        # Country detection with mention counts
        countries_map = {
            'Gambia': ['gambia', 'the gambia', 'banjul', 'serrekunda'],
            'Senegal': ['senegal', 'sénégal', 'dakar', 'saint-louis'],
            'Ghana': ['ghana', 'accra', 'kumasi'],
            'Nigeria': ['nigeria', 'lagos', 'abuja'],
            'Cape Verde': ['cape verde', 'cabo verde', 'praia', 'mindelo', 'sal island'],
            'Guinea': ['guinea', 'conakry'],
            'Guinea-Bissau': ['guinea-bissau', 'guinea bissau', 'bissau'],
            'Sierra Leone': ['sierra leone', 'freetown'],
            'Mali': ['mali', 'bamako', 'timbuktu'],
            'Mauritania': ['mauritania', 'nouakchott'],
            'Benin': ['benin', 'bénin', 'cotonou', 'porto-novo'],
            'Togo': ['togo', 'lomé', 'lome'],
            'Burkina Faso': ['burkina faso', 'ouagadougou'],
            'Ivory Coast': ['ivory coast', 'côte d\'ivoire', 'cote d\'ivoire', 'abidjan'],
            'Liberia': ['liberia', 'monrovia']
        }
        
        detected = {}
        for country, keywords in countries_map.items():
            mentions = sum(text_lower.count(kw) for kw in keywords)
            if mentions > 0:
                detected[country] = mentions
        
        return detected
    
    def determine_packaging(self, text, destination_country='Gambia', url=''):
        """Determine if destination is sold alone or in a package"""
        text_lower = text.lower()
        destination_lower = destination_country.lower()
        
        # Detect all countries mentioned
        countries_detected = self.detect_countries_mentioned(text)
        
        # Get mentions of primary destination
        destination_mentions = countries_detected.get(destination_country, 0)
        
        # Get mentions of other countries
        other_countries = {k: v for k, v in countries_detected.items() if k != destination_country}
        multi_country_mentions = sum(other_countries.values())
        
        # Determine packaging type
        if multi_country_mentions == 0 or destination_mentions >= destination_mentions + multi_country_mentions * 0.8:
            packaging_type = f'{destination_country}-only'
            destination_pct = 100
        elif destination_mentions > multi_country_mentions * 1.5:
            destination_pct = round((destination_mentions / (destination_mentions + multi_country_mentions)) * 100)
            packaging_type = f'{destination_country}-focused multi-country'
        else:
            destination_pct = round((destination_mentions / (destination_mentions + multi_country_mentions)) * 100) if (destination_mentions + multi_country_mentions) > 0 else 0
            packaging_type = 'Multi-country package'
        
        # Format countries detected as comma-separated string
        countries_list = ', '.join([f"{k} ({v})" for k, v in sorted(countries_detected.items(), key=lambda x: x[1], reverse=True)])
        
        return packaging_type, destination_pct, countries_list, countries_detected
    
    def analyze_content(self, page_name, text, destination_country='Gambia'):
        """Full analysis of ITO content"""
        print(f"="*80)
        print(f"Analyzing: {page_name} ({destination_country})")
        print(f"="*80)
        
        # Get sentiment
        sentiment = self.get_sentiment(text)
        
        # Analyze creative sectors
        sector_scores, sector_details, sector_justifications = self.analyze_creative_sectors(text)
        
        # Calculate overall creative score
        creative_score = round(sum(sector_scores.values()) * 1.25, 1)
        
        # Identify themes
        themes = self.identify_themes(text)
        
        # Packaging analysis
        packaging_type, destination_pct, countries_list, countries_detected = self.determine_packaging(text, destination_country)
        
        # Print summary
        sentiment_label = "Neutral"
        if sentiment > 0.2:
            sentiment_label = "Positive"
        if sentiment > 0.4:
            sentiment_label = "Very Positive"
        if sentiment < -0.2:
            sentiment_label = "Negative"
        
        print(f"📊 ANALYSIS SUMMARY:")
        print(f"  Sentiment: {sentiment:.2f} ({sentiment_label})")
        print(f"  Creative Tourism Score: {creative_score}/100")
        print(f"  Top Themes: {', '.join(themes) if themes else 'None identified'}")
        
        # Print non-zero sector scores
        print(f"  Sector Scores:")
        for sector, score in sorted(sector_scores.items(), key=lambda x: x[1], reverse=True):
            if score > 0:
                detail = sector_details[sector]
                print(f"    {sector.replace('_', ' ').title()}: {score}/10")
                print(f"      → {detail}")
        
        return {
            'sentiment': sentiment,
            'creative_score': creative_score,
            'themes': themes,
            'sector_scores': sector_scores,
            'sector_details': sector_details,
            'sector_justifications': sector_justifications,
            'packaging_type': packaging_type,
            'destination_percentage': destination_pct,
            'countries_detected': countries_list,
            'countries_dict': countries_detected,
            # Keep old key for backwards compatibility
            'gambia_percentage': destination_pct
        }

