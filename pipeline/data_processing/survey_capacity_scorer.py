#!/usr/bin/env python3
"""
Survey Capacity Scorer - Scores survey responses on internal digital capacity (0-30 points)
Based on SURVEY_SCORING_FRAMEWORK.md
"""

from typing import Dict, Any, List
import re
from survey_question_mapping import get_question_key


class SurveyCapacityScorer:
    """Scores survey responses for internal digital capacity assessment"""
    
    def __init__(self, survey_type: str):
        """
        Initialize scorer
        
        Args:
            survey_type: 'CI' or 'TO'
        """
        self.survey_type = survey_type
    
    def score_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Score a complete survey response
        
        Returns dict with:
            - foundation_score (0-10)
            - capability_score (0-10)
            - growth_score (0-10)
            - total_score (0-30)
            - tier (Digital Leader/Intermediate/Beginner/Pre-Digital)
            - breakdown (detailed scores for each question)
        """
        
        # Score each section
        foundation_score, foundation_breakdown = self._score_foundation(response)
        capability_score, capability_breakdown = self._score_capability(response)
        growth_score, growth_breakdown = self._score_growth(response)
        
        total_score = foundation_score + capability_score + growth_score
        tier = self._determine_tier(total_score)
        
        return {
            'total_score': round(total_score, 2),
            'foundation_score': round(foundation_score, 2),
            'capability_score': round(capability_score, 2),
            'growth_score': round(growth_score, 2),
            'tier': tier,
            'breakdown': {
                'foundation': foundation_breakdown,
                'capability': capability_breakdown,
                'growth': growth_breakdown
            }
        }
    
    # =========================================================================
    # SECTION 1: DIGITAL FOUNDATION (10 points)
    # =========================================================================
    
    def _score_foundation(self, response: Dict[str, Any]) -> tuple:
        """Score Digital Foundation section (10 points total)"""
        
        scores = {}
        
        # 2.1 Website Presence (2 points)
        scores['website'] = self._score_website(response)
        
        # 2.2 Social Media Platforms (2 points)
        scores['social_platforms'] = self._score_social_platforms(response)
        
        # 2.3 Content Posting Frequency (2 points)
        scores['posting_frequency'] = self._score_posting_frequency(response)
        
        # 2.4 Online Commerce/Booking (2 points)
        scores['online_sales'] = self._score_online_sales(response)
        
        # 2.5 Review Management (2 points)
        scores['review_management'] = self._score_review_management(response)
        
        total = sum(scores.values())
        
        return total, scores
    
    def _score_website(self, response: Dict[str, Any]) -> float:
        """Score website presence (2 points max)"""
        
        if self.survey_type == 'CI':
            key = get_question_key('CI', 'website')
            answer = response.get(key, '').lower()
            
            if 'regularly updated' in answer:
                return 2.0
            elif 'needs updating' in answer:
                return 1.0
            elif 'want one' in answer:
                return 0.5
            else:
                return 0.0
        
        else:  # TO
            key = get_question_key('TO', 'website')
            has_website = response.get(key, '').lower()
            
            share_key = get_question_key('TO', 'website_share')
            willing_to_share = response.get(share_key, '').lower()
            
            if 'yes' in has_website:
                if 'yes:' in willing_to_share or willing_to_share.startswith('http'):
                    return 2.0
                elif 'maybe' in willing_to_share:
                    return 1.0
                else:
                    return 1.0
            elif 'no' in has_website:
                # Check reasons
                reasons_key = get_question_key('TO', 'website_reasons')
                reasons = response.get(reasons_key, '').lower()
                if 'expensive' in reasons or 'technical skills' in reasons:
                    return 0.5  # Interest but barriers
                else:
                    return 0.0
            
            return 0.0
    
    def _score_social_platforms(self, response: Dict[str, Any]) -> float:
        """Score social media platform usage (3 points max - UPDATED)"""
        
        key = get_question_key(self.survey_type, 'social_platforms')
        platforms = response.get(key, '')
        
        if not platforms:
            return 0.0
        
        # Count platforms (splitting by common delimiters)
        platform_list = [p.strip().lower() for p in re.split(r'[,;|]', platforms)]
        
        # Filter out "none" and empty strings
        platform_list = [p for p in platform_list if p and 'none' not in p]
        
        count = len(platform_list)
        
        if count >= 4:
            return 3.0
        elif count == 3:
            return 2.25
        elif count == 2:
            return 1.5
        elif count == 1:
            return 0.75
        else:
            return 0.0
    
    def _score_posting_frequency(self, response: Dict[str, Any]) -> float:
        """Score content posting frequency (2 points max)"""
        
        key = get_question_key(self.survey_type, 'posting_frequency')
        freq = response.get(key, '').lower()
        
        if 'daily' in freq:
            return 2.0
        elif 'weekly' in freq:
            return 1.5
        elif 'monthly' in freq:
            return 1.0
        elif 'rarely' in freq:
            return 0.5
        else:  # Never
            return 0.0
    
    def _score_online_sales(self, response: Dict[str, Any]) -> float:
        """Score online commerce/booking capability (1 point max - UPDATED)"""
        
        key = get_question_key(self.survey_type, 'online_booking' if self.survey_type == 'TO' else 'online_sales')
        answer = response.get(key, '').lower()
        
        if 'own website' in answer:
            return 1.0
        elif 'other platforms' in answer or 'facebook' in answer or 'whatsapp' in answer or 'yes, through' in answer:
            return 0.75
        elif 'would like' in answer:
            return 0.5
        else:
            return 0.0
    
    def _score_review_management(self, response: Dict[str, Any]) -> float:
        """Score review management (2 points max)"""
        
        key = get_question_key(self.survey_type, 'review_platforms')
        reviews = response.get(key, '')
        
        if not reviews:
            return 0.0
        
        reviews_lower = reviews.lower()
        
        # Check for negative indicators
        if "don't get reviews" in reviews_lower or "don't know" in reviews_lower:
            return 0.0
        
        # Count review platforms
        platforms = ['google', 'facebook', 'tripadvisor', 'getyourguide', 'viator']
        count = sum(1 for p in platforms if p in reviews_lower)
        
        if count >= 4:
            return 2.0
        elif count == 3:
            return 1.5
        elif count == 2:
            return 1.0
        elif count == 1:
            return 0.5
        else:
            # Check if only "word of mouth"
            if 'word of mouth' in reviews_lower:
                return 0.0
            return 0.5  # Some platform mentioned
    
    # =========================================================================
    # SECTION 2: DIGITAL CAPABILITY (10 points)
    # =========================================================================
    
    def _score_capability(self, response: Dict[str, Any]) -> tuple:
        """Score Digital Capability section (10 points total)"""
        
        scores = {}
        
        # 3.1 Digital Comfort Level (3 points)
        scores['comfort_level'] = self._score_comfort_level(response)
        
        # 3.2 Device Access (2 points)
        scores['device_access'] = self._score_device_access(response)
        
        # 3.3 Internet Reliability (2 points)
        scores['internet'] = self._score_internet(response)
        
        # 3.4 Analytics Tracking (3 points)
        scores['analytics'] = self._score_analytics(response)
        
        total = sum(scores.values())
        
        return total, scores
    
    def _score_comfort_level(self, response: Dict[str, Any]) -> float:
        """Score digital comfort level (3 points max)"""
        
        key = get_question_key(self.survey_type, 'comfort_level')
        answer = response.get(key, '').lower()
        
        if 'very comfortable' in answer or 'learn new tools quickly' in answer:
            return 3.0
        elif 'somewhat comfortable' in answer or 'basic tasks' in answer:
            return 2.0
        elif 'limited comfort' in answer or 'regular help' in answer:
            return 1.0
        else:  # Not comfortable
            return 0.0
    
    def _score_device_access(self, response: Dict[str, Any]) -> float:
        """Score device access (2 points max)"""
        
        key = get_question_key(self.survey_type, 'devices')
        devices = response.get(key, '').lower()
        
        if not devices or 'none' in devices:
            return 0.0
        
        if 'smartphone only' in devices:
            return 0.5
        
        # Count device types
        has_computer = 'computer' in devices or 'laptop' in devices
        has_phone = 'smartphone' in devices
        has_tablet = 'tablet' in devices
        has_professional = 'professional camera' in devices or 'video equipment' in devices
        
        device_count = sum([has_computer, has_phone, has_tablet, has_professional])
        
        if device_count >= 3:
            return 2.0
        elif device_count == 2 and has_computer:
            return 1.5
        elif device_count == 2:
            return 1.0
        else:
            return 0.5
    
    def _score_internet(self, response: Dict[str, Any]) -> float:
        """Score internet reliability (2 points max)"""
        
        key = get_question_key(self.survey_type, 'internet')
        internet = response.get(key, '').lower()
        
        if 'very reliable' in internet or 'rarely have problems' in internet:
            return 2.0
        elif 'usually reliable' in internet or 'occasional issues' in internet:
            return 1.5
        elif 'unreliable' in internet or 'frequent problems' in internet:
            return 0.5
        else:  # Very poor
            return 0.0
    
    def _score_analytics(self, response: Dict[str, Any]) -> float:
        """Score analytics tracking (3 points max)"""
        
        key = get_question_key(self.survey_type, 'analytics')
        analytics = response.get(key, '').lower()
        
        if 'regularly' in analytics or 'weekly' in analytics or 'monthly' in analytics:
            return 3.0
        elif 'sometimes' in analytics:
            return 2.0
        elif 'would like to learn' in analytics:
            return 1.0
        else:  # Don't think it's important
            return 0.0
    
    # =========================================================================
    # SECTION 3: GROWTH READINESS (10 points)
    # =========================================================================
    
    def _score_growth(self, response: Dict[str, Any]) -> tuple:
        """Score Growth Readiness section (10 points total)"""
        
        scores = {}
        
        # 4.1 Digital Marketing Knowledge (2 points)
        scores['marketing_knowledge'] = self._score_marketing_knowledge(response)
        
        # 4.2 Challenge Understanding (1.5 points)
        scores['challenge_type'] = self._score_challenge_understanding(response)
        
        # 4.3 Content Creation Capability (2 points) - pass posting frequency for bonus
        posting_freq_score = self._score_posting_frequency(response)
        scores['content_creation'] = self._score_content_creation(response, posting_freq_score)
        
        # 4.4 Financial Investment Capacity (2 points)
        scores['monthly_investment'] = self._score_monthly_investment(response)
        
        # 4.5 Training Experience (1 point)
        scores['training'] = self._score_training(response)
        
        # 4.6 Growth Ambition (1.5 points)
        scores['growth_ambition'] = self._score_growth_ambition(response)
        
        total = sum(scores.values())
        
        return total, scores
    
    def _score_marketing_knowledge(self, response: Dict[str, Any]) -> float:
        """Score digital marketing knowledge (2 points max)"""
        
        key = get_question_key(self.survey_type, 'marketing_knowledge')
        knowledge = response.get(key, '').lower()
        
        if not knowledge or "not sure what digital marketing includes" in knowledge:
            return 0.0
        
        # Count recognized components
        components = [
            'social media', 'website', 'advertising', 'email', 'whatsapp',
            'seo', 'search engine', 'reviews', 'e-commerce', 'online sales',
            'content creation', 'photos', 'videos', 'blogs'
        ]
        
        count = sum(1 for comp in components if comp in knowledge)
        
        if count >= 7:
            return 2.0
        elif count >= 5:
            return 1.5
        elif count >= 3:
            return 1.0
        elif count >= 1:
            return 0.5
        else:
            return 0.0
    
    def _score_challenge_understanding(self, response: Dict[str, Any]) -> float:
        """Score challenge understanding (1.5 points max)"""
        
        key = get_question_key(self.survey_type, 'challenge')
        challenge = response.get(key, '').lower()
        
        # Higher sophistication barriers
        if "don't have time" in challenge or "no staff" in challenge:
            return 1.5
        
        # Infrastructure barriers
        if 'expensive' in challenge or 'poor internet' in challenge or 'language' in challenge:
            return 1.0
        
        # Awareness barrier
        if "don't see the value" in challenge:
            return 0.5
        
        # Fundamental skill gap
        if "don't know how" in challenge:
            return 0.0
        
        return 0.5  # Other
    
    def _score_content_creation(self, response: Dict[str, Any], posting_freq_score: float = 0.0) -> float:
        """Score content creation capability (2 points max - UPDATED with posting bonus)"""
        
        key = get_question_key(self.survey_type, 'content_creation')
        content = response.get(key, '').lower()
        
        # Calculate base score from their answer
        base_score = 0.0
        
        if not content or "don't create" in content:
            base_score = 0.0
        else:
            # Check for self-created content
            writes_own = 'write my own' in content or 'i write' in content
            takes_photos = 'take my own photos' in content or 'i take' in content
            makes_videos = 'make my own videos' in content or 'i make' in content
            
            self_created_count = sum([writes_own, takes_photos, makes_videos])
            
            if self_created_count >= 3:
                base_score = 2.0
            elif self_created_count == 2:
                base_score = 1.5
            elif self_created_count == 1:
                base_score = 1.0
            elif 'hire' in content:
                base_score = 1.0  # Hiring professionals shows investment
            elif 'family' in content or 'friends' in content:
                base_score = 0.5
        
        # BONUS LOGIC: If they post regularly, they MUST be creating content!
        # posting_freq_score: 2.0=Daily, 1.5=Weekly, 1.0=Monthly, 0.5=Rarely, 0=Never
        min_score_from_posting = 0.0
        
        if posting_freq_score >= 1.5:  # Weekly or Daily
            min_score_from_posting = 1.5
        elif posting_freq_score >= 1.0:  # Monthly
            min_score_from_posting = 1.0
        
        # Return the higher of base_score or min_score_from_posting
        return max(base_score, min_score_from_posting)
    
    def _score_monthly_investment(self, response: Dict[str, Any]) -> float:
        """Score monthly data/internet investment (2 points max)"""
        
        key = get_question_key(self.survey_type, 'monthly_investment')
        investment = response.get(key, '').lower()
        
        if 'more than' in investment and '500' in investment:
            return 2.0
        elif '300-500' in investment or ('300' in investment and '500' in investment):
            return 1.5
        elif '100-300' in investment or ('100' in investment and '300' in investment):
            return 1.0
        elif 'less than 100' in investment:
            return 0.5
        else:  # Don't track
            return 0.0
    
    def _score_training(self, response: Dict[str, Any]) -> float:
        """Score training experience (1 point max)"""
        
        key = get_question_key(self.survey_type, 'training')
        training = response.get(key, '').lower()
        
        if 'formal training' in training:
            return 1.0
        elif 'informal help' in training or 'friends' in training or 'family' in training:
            return 0.75
        elif 'would be interested' in training:
            return 0.5
        else:  # Don't think I need it
            return 0.0
    
    def _score_growth_ambition(self, response: Dict[str, Any]) -> float:
        """Score growth ambition / investment capacity (1.5 points max)"""
        
        # Try growth ambition first
        key = get_question_key(self.survey_type, 'growth_ambition')
        investment = response.get(key, '').lower()
        
        if not investment:
            # Try affordable services as fallback
            key = get_question_key(self.survey_type, 'affordable_services')
            investment = response.get(key, '').lower()
        
        if not investment:
            return 0.0
        
        # TO Survey values (per year)
        if 'more than' in investment and ('15,000' in investment or '30,000' in investment or '50,000' in investment):
            return 1.5
        elif ('5,000' in investment and '15,000' in investment) or ('15,000' in investment and '30,000' in investment) or ('25,000' in investment and '50,000' in investment):
            return 1.25
        elif ('1,000' in investment and '5,000' in investment) or ('5,000' in investment and not '15,000' in investment):
            return 1.0
        elif 'less than' in investment and ('1,000' in investment or '5,000' in investment or '10,000' in investment):
            return 0.5
        elif 'invest time' in investment:
            return 0.25
        elif 'barter' in investment or 'cannot afford' in investment:
            return 0.0
        
        return 0.25
    
    # =========================================================================
    # TIER DETERMINATION
    # =========================================================================
    
    def _determine_tier(self, total_score: float) -> str:
        """
        Determine capacity tier based on total score (aligned with external assessment)
        30 points = 100%, using same tier labels as external assessment
        """
        
        # Convert to percentage
        percentage = (total_score / 30.0) * 100
        
        if percentage >= 81:  # 25-30 points
            return "Expert"
        elif percentage >= 61:  # 19-24 points
            return "Advanced"
        elif percentage >= 41:  # 13-18 points
            return "Intermediate"
        elif percentage >= 21:  # 7-12 points
            return "Emerging"
        else:  # 0-6 points
            return "Absent/Basic"


def main():
    """Test the scorer with sample data"""
    
    print("\n" + "="*80)
    print("SURVEY CAPACITY SCORER - TEST")
    print("="*80)
    
    # Sample response (you can customize this for testing)
    sample_ci_response = {
        'Q7. Do you have a website for your business/organization?': 'Yes, and it\'s regularly updated',
        'Q8. Which social media platforms do you actively use for your business? (Select all that apply)': 'Facebook, Instagram, WhatsApp Business, YouTube',
        'Q9. How often do you post content about your work online?': 'Weekly',
        'Q10. Can customers buy your products/services online?': 'Yes, through other platforms (Facebook, WhatsApp, etc.)',
        'Q11. Where do customers typically leave reviews about your business? (Select all that apply)': 'Google My Business, Facebook page, TripAdvisor',
        'Q20. How comfortable are you with using digital tools for business?': 'Very comfortable - I learn new tools quickly and do it myself',
        'Q21. What devices do you primarily use for business activities? (Select all that apply)': 'Smartphone, Computer/laptop, Professional camera/video equipment',
        'Q22. How reliable is your internet connection?': 'Usually reliable - occasional issues',
        'Q23. Do you currently track how many people visit your online profiles or see your posts?': 'Yes, I check regularly (weekly/monthly)',
        'Q24. Which of the following do you consider part of digital marketing? (Select all that apply)': 'Social media posting, Having a website, Online advertising, Email marketing, WhatsApp marketing, SEO, Online reviews management',
        'Q25. What is your biggest challenge with digital marketing? (Select one)': 'Don\'t have time',
        'Q26. How do you currently create content for promotion? (Select all that apply)': 'I write my own descriptions, I take my own photos, I make my own videos',
        'Q29. How much do you typically spend per month on internet/phone data for business?': 'D300-500',
        'Q30. Have you ever received training on digital marketing or online business?': 'Yes, informal help from friends/family',
        'Q32. How much could you realistically invest in improving your digital presence?': 'D5,000-15,000 per year'
    }
    
    scorer = SurveyCapacityScorer('CI')
    result = scorer.score_response(sample_ci_response)
    
    print(f"\n📊 SCORE RESULTS:")
    print(f"   Total Score: {result['total_score']}/30")
    print(f"   Tier: {result['tier']}")
    print(f"\n   Foundation: {result['foundation_score']}/10")
    print(f"   Capability: {result['capability_score']}/10")
    print(f"   Growth: {result['growth_score']}/10")
    
    print(f"\n📋 DETAILED BREAKDOWN:")
    print(f"\n   Foundation:")
    for key, value in result['breakdown']['foundation'].items():
        print(f"      {key}: {value}")
    
    print(f"\n   Capability:")
    for key, value in result['breakdown']['capability'].items():
        print(f"      {key}: {value}")
    
    print(f"\n   Growth:")
    for key, value in result['breakdown']['growth'].items():
        print(f"      {key}: {value}")
    
    print("\n" + "="*80)


if __name__ == '__main__':
    main()

