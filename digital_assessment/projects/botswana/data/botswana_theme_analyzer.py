#!/usr/bin/env python3
"""
Botswana-specific Theme Analyzer

11 themes tailored to ecotourism and adventure tourism in Botswana.
Replaces the Benin enhanced_theme_analyzer for this project.

Themes:
  1.  wildlife_experience      — sightings, guides, encounter quality
  2.  eco_conservation         — sustainability, responsible practices
  3.  service_hospitality      — staff, rangers, camp management
  4.  accommodation_quality    — tents, camps, lodges, facilities
  5.  value_money              — price-to-experience ratio
  6.  accessibility_logistics  — transfers, flights, getting there
  7.  adventure_activities     — mokoro, walking safari, horseback, boat, fly-camp
  8.  safety                   — wildlife safety, camp security
  9.  atmosphere_wilderness    — remoteness, exclusivity, landscape, silence
  10. food_dining              — bush meals, sundowners, dining quality
  11. environmental_sensitivity — crowding, noise, over-tourism concerns
"""

import re
from collections import defaultdict
from typing import Dict
from textblob import TextBlob


class BotswanaThemeAnalyzer:

    def __init__(self):
        self.themes = {

            'wildlife_experience': {
                'display_name': 'Wildlife Experience',
                'keywords': [
                    'wildlife', 'animal', 'elephant', 'lion', 'leopard', 'cheetah',
                    'buffalo', 'rhino', 'hippo', 'hippopotamus', 'crocodile',
                    'giraffe', 'zebra', 'wild dog', 'african wild dog', 'painted dog',
                    'antelope', 'impala', 'kudu', 'waterbuck', 'eland', 'wildebeest',
                    'warthog', 'mongoose', 'hyena', 'jackal', 'vulture',
                    'bird', 'birding', 'birdwatching',
                    'big five', 'big 5', 'predator', 'game', 'herd',
                    'sighting', 'spoor', 'track', 'tracking', 'game drive',
                    'game viewing', 'safari', 'ranger', 'tracker', 'guide',
                    'encounter', 'spot', 'spotted', 'see', 'saw', 'watch', 'viewing',
                ],
                'weight': 1.2,
            },

            'eco_conservation': {
                'display_name': 'Eco & Conservation',
                'keywords': [
                    'conservation', 'conservancy', 'conserve', 'ecosystem',
                    'sustainable', 'sustainability', 'responsible', 'eco', 'ecotourism',
                    'carbon', 'footprint', 'low impact', 'environment', 'environmental',
                    'protect', 'protection', 'wilderness', 'pristine', 'untouched',
                    'concession', 'community benefit', 'local community', 'natural habitat',
                    'green', 'ethical', 'no footprint', 'minimal impact',
                    'anti-poaching', 'poaching', 'ranger program', 'research',
                ],
                'weight': 1.1,
            },

            'service_hospitality': {
                'display_name': 'Service & Hospitality',
                'keywords': [
                    'staff', 'guide', 'service', 'friendly', 'helpful',
                    'knowledgeable', 'hospitable', 'welcoming', 'professional',
                    'courteous', 'attentive', 'host', 'informative', 'passionate',
                    'enthusiastic', 'crew', 'ranger', 'tracker', 'camp manager',
                    'cook', 'chef', 'pilot', 'driver', 'employee', 'team',
                    'exceptional service', 'above and beyond', 'personalized',
                ],
                'weight': 1.0,
            },

            'accommodation_quality': {
                'display_name': 'Accommodation Quality',
                'keywords': [
                    'tent', 'camp', 'lodge', 'chalet', 'suite', 'room', 'bed',
                    'comfortable', 'luxury', 'facilities', 'bathroom', 'shower',
                    'toilet', 'clean', 'amenities', 'pool', 'deck', 'veranda',
                    'view', 'design', 'interior', 'rustic', 'glamping',
                    'bush camp', 'mobile camp', 'permanent camp', 'tented camp',
                    'air conditioned', 'mosquito net', 'hot water',
                ],
                'weight': 1.0,
            },

            'value_money': {
                'display_name': 'Value for Money',
                'keywords': [
                    'price', 'expensive', 'worth', 'value', 'money', 'cost',
                    'fee', 'affordable', 'overpriced', 'budget', 'luxury', 'premium',
                    'pay', 'paid', 'all-inclusive', 'inclusive', 'package',
                    'reasonable', 'cheap', 'pricey', 'worthwhile', 'rip off',
                    'bargain', 'investment', 'splurge',
                ],
                'weight': 1.0,
            },

            'accessibility_logistics': {
                'display_name': 'Accessibility & Logistics',
                'keywords': [
                    'transfer', 'fly', 'flight', 'airstrip', 'road', 'drive',
                    'vehicle', '4x4', 'distance', 'remote', 'reach', 'access',
                    'arrive', 'charter', 'small plane', 'offroad', 'off-road',
                    'bush plane', 'landing strip', 'pickup', 'drop-off',
                    'long drive', 'rough road', 'difficult to reach',
                ],
                'weight': 1.0,
            },

            'adventure_activities': {
                'display_name': 'Adventure Activities',
                'keywords': [
                    'mokoro', 'dugout canoe', 'canoe', 'kayak', 'paddle',
                    'walking safari', 'bush walk', 'walk on foot', 'on foot',
                    'horseback', 'horse riding', 'horse safari',
                    'boat cruise', 'boat safari', 'river cruise', 'sundowner cruise',
                    'night drive', 'night game drive',
                    'fly camp', 'fly-camp', 'fly camping', 'sleeping under stars',
                    'hot air balloon', 'balloon',
                    'quad bike', 'quad biking',
                    'cycling safari', 'mountain bike',
                    'adventure', 'thrill', 'adrenaline', 'expedition',
                    'activity', 'activities', 'excursion',
                ],
                'weight': 1.1,
            },

            'safety': {
                'display_name': 'Safety',
                'keywords': [
                    'safe', 'safety', 'dangerous', 'danger', 'risk', 'risky',
                    'malaria', 'medication', 'protection', 'guard', 'secure',
                    'armed', 'emergency', 'wildlife safety', 'attack', 'charged',
                    'close encounter', 'too close', 'precaution', 'careful',
                    'cautious', 'warning', 'hazard',
                ],
                'weight': 1.0,
            },

            'atmosphere_wilderness': {
                'display_name': 'Atmosphere & Wilderness',
                'keywords': [
                    'wilderness', 'remote', 'isolated', 'peaceful', 'quiet',
                    'stunning', 'beautiful', 'breathtaking', 'dramatic', 'vast',
                    'open', 'landscape', 'scenery', 'sunset', 'sunrise',
                    'star', 'starlit', 'stars', 'milky way', 'silence', 'solitude',
                    'exclusive', 'private', 'pristine', 'untouched', 'magical',
                    'spectacular', 'incredible', 'amazing', 'unforgettable',
                    'once in a lifetime', 'bucket list', 'dream', 'paradise',
                    'nature', 'bush', 'floodplain', 'delta', 'savanna',
                ],
                'weight': 1.0,
            },

            'food_dining': {
                'display_name': 'Food & Dining',
                'keywords': [
                    'food', 'meal', 'dinner', 'lunch', 'breakfast', 'chef', 'cuisine',
                    'bush dinner', 'bush breakfast', 'bush lunch',
                    'sundowner', 'cocktail', 'drink', 'wine', 'gin', 'beer',
                    'cooking', 'taste', 'delicious', 'excellent food',
                    'braai', 'bbq', 'barbeque', 'campfire', 'fire',
                    'fresh', 'local produce', 'dietary', 'vegetarian',
                ],
                'weight': 0.9,
            },

            'environmental_sensitivity': {
                'display_name': 'Environmental Sensitivity',
                'keywords': [
                    'crowded', 'crowd', 'tourist', 'people', 'noise', 'noisy',
                    'other vehicle', 'other vehicles', 'too many', 'busy', 'overrun',
                    'mass tourism', 'litter', 'littered', 'disturb', 'disturbing',
                    'impact', 'footprint', 'damage', 'degraded', 'overdeveloped',
                    'exclusive', 'no crowds', 'no other',
                ],
                'weight': 0.9,
            },
        }

    def analyze_text_for_themes_with_sentiment(self, text: str) -> Dict[str, Dict]:
        """
        Analyze text and return theme scores with sentiment breakdown.

        Returns:
            {
                'theme_key': {
                    'score': float,           # relevance 0-1
                    'mentions': int,
                    'sentiment_score': float, # -1 to +1
                    'sentiment_breakdown': {'positive': int, 'negative': int, 'neutral': int}
                }
            }
        """
        text_lower = text.lower()
        sentences = re.split(r'[.!?]+', text)
        results = {}

        for theme_key, config in self.themes.items():
            # Count keyword mentions
            total_mentions = sum(text_lower.count(kw) for kw in config['keywords'])

            if total_mentions == 0:
                results[theme_key] = {
                    'score': 0.0,
                    'mentions': 0,
                    'sentiment_score': 0.0,
                    'sentiment_breakdown': {'positive': 0, 'negative': 0, 'neutral': 0},
                }
                continue

            # Find sentences containing at least one keyword
            theme_sentences = []
            for sentence in sentences:
                s_lower = sentence.lower().strip()
                if not s_lower:
                    continue
                if any(kw in s_lower for kw in config['keywords']):
                    theme_sentences.append(sentence.strip())

            # Sentiment per sentence
            sentiment_scores = []
            pos = neg = neu = 0
            for sentence in theme_sentences:
                try:
                    polarity = TextBlob(sentence).sentiment.polarity
                    sentiment_scores.append(polarity)
                    if polarity > 0.1:
                        pos += 1
                    elif polarity < -0.1:
                        neg += 1
                    else:
                        neu += 1
                except Exception:
                    neu += 1

            weighted_sentiment = (sum(sentiment_scores) / len(sentiment_scores)
                                  if sentiment_scores else 0.0)

            word_count = max(len(text.split()), 1)
            normalized = (total_mentions / (word_count / 100))
            theme_score = min(normalized * config['weight'], 1.0)

            results[theme_key] = {
                'score': theme_score,
                'mentions': total_mentions,
                'sentiment_score': weighted_sentiment,
                'sentiment_breakdown': {'positive': pos, 'negative': neg, 'neutral': neu},
            }

        return results

    def get_sentiment_score(self, text: str) -> float:
        try:
            return TextBlob(text).sentiment.polarity
        except Exception:
            return 0.0


if __name__ == '__main__':
    analyzer = BotswanaThemeAnalyzer()
    test = ("The mokoro trip through the Okavango Delta was absolutely incredible. "
            "Our guide was knowledgeable and spotted a family of elephants just metres away. "
            "The camp was beautifully set up under the stars — truly a wilderness experience.")
    results = analyzer.analyze_text_for_themes_with_sentiment(test)
    print("Test analysis results:")
    for theme, data in results.items():
        if data['mentions'] > 0:
            print(f"  {theme}: mentions={data['mentions']}, sentiment={data['sentiment_score']:.2f}, "
                  f"breakdown={data['sentiment_breakdown']}")
