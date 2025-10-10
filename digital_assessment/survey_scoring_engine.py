#!/usr/bin/env python3
"""
Survey Scoring Engine - Option C (Hybrid Approach)
Scores survey responses for columns J-N (30 points) + insights O-R
"""

from typing import Dict, Any, Optional, Tuple
import re


class SurveyScorer:
    """Scores survey responses using Option C methodology"""
    
    def __init__(self, survey_type: str):
        """
        Args:
            survey_type: 'CI' for Creative Industries or 'TO' for Tour Operators
        """
        self.survey_type = survey_type
    
    # =============================================================================
    # COLUMN J: DIGITAL FOUNDATION (6 points)
    # =============================================================================
    
    def score_digital_foundation(self, response: Dict[str, Any]) -> Tuple[float, Dict[str, float]]:
        """
        Score Column J: Digital Foundation (6 points)
        Components: Device Access (2) + Internet Reliability (2) + Analytics Tracking (2)
        """
        breakdown = {}
        
        # 1. Device Access (0-2 points)
        device_q = 'Q25' if self.survey_type == 'CI' else 'Q37'
        devices = self._get_answer(response, device_q, '').lower()
        
        if 'computer' in devices and 'smartphone' in devices:
            breakdown['device_access'] = 2.0
        elif 'tablet' in devices and 'smartphone' in devices:
            breakdown['device_access'] = 1.5
        elif 'smartphone' in devices:
            breakdown['device_access'] = 1.0
        else:
            breakdown['device_access'] = 0.0
        
        # 2. Internet Reliability (0-2 points)
        internet_q = 'Q26' if self.survey_type == 'CI' else 'Q38'
        internet = self._get_answer(response, internet_q, '').lower()
        
        if 'very reliable' in internet or 'rarely have problems' in internet:
            breakdown['internet_reliability'] = 2.0
        elif 'usually reliable' in internet or 'occasional issues' in internet:
            breakdown['internet_reliability'] = 1.5
        elif 'sometimes works' in internet:
            breakdown['internet_reliability'] = 1.0
        elif 'unreliable' in internet or 'frequent problems' in internet:
            breakdown['internet_reliability'] = 0.5
        else:
            breakdown['internet_reliability'] = 0.0
        
        # 3. Analytics & Tracking (0-2 points)
        tracking_q = 'Q27' if self.survey_type == 'CI' else 'Q39'
        tracking = self._get_answer(response, tracking_q, '').lower()
        
        if 'yes' in tracking and 'regularly' in tracking:
            breakdown['analytics_tracking'] = 2.0
        elif 'yes' in tracking and 'occasionally' in tracking:
            breakdown['analytics_tracking'] = 1.5
        elif 'would like to learn' in tracking:
            breakdown['analytics_tracking'] = 0.5
        else:
            breakdown['analytics_tracking'] = 0.0
        
        total = sum(breakdown.values())
        return round(total, 2), breakdown
    
    # =============================================================================
    # COLUMN K: DIGITAL CAPABILITY (8 points)
    # =============================================================================
    
    def score_digital_capability(self, response: Dict[str, Any]) -> Tuple[float, Dict[str, float]]:
        """
        Score Column K: Digital Capability (8 points)
        Components: Comfort Level (3) + Who Manages (3) + Training (2)
        """
        breakdown = {}
        
        # 1. Comfort Level (0-3 points)
        comfort_q = 'Q24' if self.survey_type == 'CI' else 'Q36'
        comfort = self._get_answer(response, comfort_q, '').lower()
        
        if 'very comfortable' in comfort or 'learn new tools quickly' in comfort:
            breakdown['comfort_level'] = 3.0
        elif 'comfortable' in comfort and 'handle most' in comfort:
            breakdown['comfort_level'] = 2.5
        elif 'somewhat comfortable' in comfort or 'basics' in comfort:
            breakdown['comfort_level'] = 1.5
        elif 'not comfortable' in comfort:
            breakdown['comfort_level'] = 0.0
        else:
            breakdown['comfort_level'] = 1.0  # Default middle
        
        # 2. Who Manages Digital Presence (0-3 points)
        who_q = 'Q11' if self.survey_type == 'CI' else 'Q10'
        who = self._get_answer(response, who_q, '').lower()
        
        if 'owner' in who or 'founder' in who or 'personally' in who:
            breakdown['who_manages'] = 3.0
        elif 'dedicated staff' in who or 'staff member' in who:
            breakdown['who_manages'] = 2.5
        elif 'shared' in who or 'team' in who:
            breakdown['who_manages'] = 2.0
        elif 'family' in who or 'friend' in who:
            breakdown['who_manages'] = 1.0
        elif "don't do digital" in who:
            breakdown['who_manages'] = 0.0
        else:
            breakdown['who_manages'] = 1.0
        
        # 3. Training Received (0-2 points)
        training_q = 'Q38' if self.survey_type == 'CI' else 'Q50'
        training = self._get_answer(response, training_q, '').lower()
        
        if 'yes' in training and 'formal' in training:
            breakdown['training_received'] = 2.0
        elif 'yes' in training:
            breakdown['training_received'] = 1.5
        elif 'would be interested' in training or 'but i would' in training:
            breakdown['training_received'] = 0.5
        else:
            breakdown['training_received'] = 0.0
        
        total = sum(breakdown.values())
        return round(total, 2), breakdown
    
    # =============================================================================
    # COLUMN L: PLATFORM ECOSYSTEM (6 points)
    # =============================================================================
    
    def score_platform_ecosystem(self, response: Dict[str, Any]) -> Tuple[float, Dict[str, float]]:
        """
        Score Column L: Platform Ecosystem (6 points)
        Components: Website (2) + Social Media Platforms (3) + Sales Channels (1)
        """
        breakdown = {}
        
        # 1. Website (0-2 points)
        website_q = 'Q17' if self.survey_type == 'CI' else 'Q23'
        website = self._get_answer(response, website_q, '').lower()
        
        if 'yes' in website and 'regularly updated' in website:
            breakdown['website'] = 2.0
        elif 'yes' in website and 'needs updates' in website:
            breakdown['website'] = 1.5
        elif 'yes' in website and 'rarely updated' in website:
            breakdown['website'] = 1.0
        elif 'planning' in website:
            breakdown['website'] = 0.5
        elif 'yes' in website:
            breakdown['website'] = 1.5  # Yes but no detail
        else:
            breakdown['website'] = 0.0
        
        # 2. Social Media Platforms (0-3 points)
        platforms_q = 'Q18' if self.survey_type == 'CI' else 'Q30'
        platforms = self._get_answer(response, platforms_q, '').lower()
        
        # Count platforms mentioned
        platform_count = 0
        for platform in ['facebook', 'instagram', 'whatsapp', 'tiktok', 'youtube', 'twitter', 'linkedin']:
            if platform in platforms:
                platform_count += 1
        
        if platform_count >= 4:
            breakdown['social_platforms'] = 3.0
        elif platform_count == 3:
            breakdown['social_platforms'] = 2.5
        elif platform_count == 2:
            breakdown['social_platforms'] = 2.0
        elif platform_count == 1:
            breakdown['social_platforms'] = 1.0
        else:
            breakdown['social_platforms'] = 0.0
        
        # 3. Sales/Booking Channels (0-1 point)
        if self.survey_type == 'TO':
            sales_q = 'Q28'
            sales = self._get_answer(response, sales_q, '').lower()
            channel_count = 0
            for channel in ['website', 'booking.com', 'social media', 'tripadvisor', 'airbnb']:
                if channel in sales:
                    channel_count += 1
            
            if channel_count >= 3:
                breakdown['sales_channels'] = 1.0
            elif channel_count == 2:
                breakdown['sales_channels'] = 0.7
            elif channel_count == 1:
                breakdown['sales_channels'] = 0.5
            else:
                breakdown['sales_channels'] = 0.0
        else:
            # CI: Check if can buy online
            buy_q = 'Q21'
            buy = self._get_answer(response, buy_q, '').lower()
            if 'yes' in buy:
                breakdown['sales_channels'] = 1.0
            else:
                breakdown['sales_channels'] = 0.0
        
        total = sum(breakdown.values())
        return round(total, 2), breakdown
    
    # =============================================================================
    # COLUMN M: CONTENT & ENGAGEMENT (6 points)
    # =============================================================================
    
    def score_content_engagement(self, response: Dict[str, Any]) -> Tuple[float, Dict[str, float]]:
        """
        Score Column M: Content & Engagement (6 points)
        Components: Post Frequency (3) + Content Creation (2) + Visual Quality (1)
        """
        breakdown = {}
        
        # 1. Posting Frequency (0-3 points)
        frequency_q = 'Q20' if self.survey_type == 'CI' else 'Q32'
        frequency = self._get_answer(response, frequency_q, '').lower()
        
        if 'daily' in frequency or 'multiple times per week' in frequency:
            breakdown['post_frequency'] = 3.0
        elif 'weekly' in frequency:
            breakdown['post_frequency'] = 2.5
        elif 'few times per month' in frequency:
            breakdown['post_frequency'] = 2.0
        elif 'monthly' in frequency:
            breakdown['post_frequency'] = 1.0
        else:
            breakdown['post_frequency'] = 0.0
        
        # 2. Content Creation Methods (0-2 points)
        creation_q = 'Q32' if self.survey_type == 'CI' else 'Q44'
        creation = self._get_answer(response, creation_q, '').lower()
        
        creation_score = 0.0
        if 'own photos' in creation or 'take' in creation and 'photos' in creation:
            creation_score += 0.7
        if 'videos' in creation or 'video' in creation:
            creation_score += 0.7
        if 'write' in creation or 'descriptions' in creation or 'stories' in creation:
            creation_score += 0.6
        
        breakdown['content_creation'] = min(creation_score, 2.0)
        
        # 3. Visual Quality (0-1 point)
        if self.survey_type == 'CI':
            quality_q = 'Q71'
            quality = self._get_answer(response, quality_q, '')
            if quality:
                quality_lower = quality.lower()
                if 'professional' in quality_lower:
                    breakdown['visual_quality'] = 1.0
                elif 'happy with' in quality_lower:
                    breakdown['visual_quality'] = 0.8
                elif 'could be better' in quality_lower:
                    breakdown['visual_quality'] = 0.5
                elif 'phone' in quality_lower or 'basic' in quality_lower:
                    breakdown['visual_quality'] = 0.3
                else:
                    breakdown['visual_quality'] = 0.0
            else:
                # No answer, default to 0
                breakdown['visual_quality'] = 0.0
        else:
            # TO: Award 0.5 if they create own content
            if breakdown['content_creation'] > 0:
                breakdown['visual_quality'] = 0.5
            else:
                breakdown['visual_quality'] = 0.0
        
        total = sum(breakdown.values())
        return round(total, 2), breakdown
    
    # =============================================================================
    # COLUMN N: INVESTMENT & BARRIERS (4 points)
    # =============================================================================
    
    def score_investment_barriers(self, response: Dict[str, Any]) -> Tuple[float, Dict[str, float]]:
        """
        Score Column N: Investment & Barriers (4 points)
        Components: Annual Investment (2) + Monthly Spending (1) + Challenge Severity (1 inverse)
        """
        breakdown = {}
        
        # 1. Annual Investment Capacity (0-2 points)
        investment_q = 'Q40' if self.survey_type == 'CI' else 'Q52'
        investment = self._get_answer(response, investment_q, '').lower()
        
        if 'd15' in investment or '15,000' in investment or 'more than' in investment:
            breakdown['annual_investment'] = 2.0
        elif 'd5' in investment or '5,000-15,000' in investment or '5000-15000' in investment:
            breakdown['annual_investment'] = 1.5
        elif 'd1' in investment or '1,000-5,000' in investment or '1000-5000' in investment:
            breakdown['annual_investment'] = 1.0
        elif 'd500' in investment or '500-1,000' in investment:
            breakdown['annual_investment'] = 0.5
        else:
            breakdown['annual_investment'] = 0.0
        
        # 2. Monthly Digital Spending (0-1 point)
        monthly_q = 'Q37' if self.survey_type == 'CI' else 'Q49'
        monthly = self._get_answer(response, monthly_q, '').lower()
        
        if 'd1000' in monthly or 'd1,000' in monthly or 'more than' in monthly:
            breakdown['monthly_spending'] = 1.0
        elif 'd500' in monthly or '500-1,000' in monthly:
            breakdown['monthly_spending'] = 0.8
        elif 'd300' in monthly or '300-500' in monthly:
            breakdown['monthly_spending'] = 0.6
        elif 'd100' in monthly or '100-300' in monthly:
            breakdown['monthly_spending'] = 0.4
        elif "don't track" in monthly:
            breakdown['monthly_spending'] = 0.2
        else:
            breakdown['monthly_spending'] = 0.2
        
        # 3. Challenge Severity (0-1 point) - INVERSE SCORING
        challenge_q = 'Q30' if self.survey_type == 'CI' else 'Q42'
        challenge = self._get_answer(response, challenge_q, '').lower()
        
        if 'no major' in challenge or 'going well' in challenge:
            breakdown['challenge_severity'] = 1.0
        elif "don't have time" in challenge or 'time' in challenge:
            breakdown['challenge_severity'] = 0.8
        elif 'expensive' in challenge or 'too expensive' in challenge:
            breakdown['challenge_severity'] = 0.6
        elif "don't know which" in challenge or 'which platforms' in challenge:
            breakdown['challenge_severity'] = 0.4
        elif "don't know how" in challenge:
            breakdown['challenge_severity'] = 0.2
        elif "don't see the value" in challenge:
            breakdown['challenge_severity'] = 0.0
        else:
            breakdown['challenge_severity'] = 0.5  # Default middle
        
        total = sum(breakdown.values())
        return round(total, 2), breakdown
    
    # =============================================================================
    # INSIGHT COLUMNS (O-R) - Not scored, but valuable
    # =============================================================================
    
    def calculate_customer_discovery(self, response: Dict[str, Any]) -> Tuple[float, Dict[str, Any]]:
        """
        Column O: Customer Discovery Score (0-10)
        How effectively are customers finding them digitally?
        """
        digital_points = 0.0
        total_mentions = 0
        
        if self.survey_type == 'CI':
            # Q67: How LOCAL customers find products
            local = self._get_answer(response, 'Q67', '').lower()
            # Q69: How INTERNATIONAL tourists find products
            intl = self._get_answer(response, 'Q69', '').lower()
            
            combined = local + ' ' + intl
        else:
            # Q11: How find business partners
            partners = self._get_answer(response, 'Q11', '').lower()
            # Q13: How direct travelers find services
            travelers = self._get_answer(response, 'Q13', '').lower()
            
            combined = partners + ' ' + travelers
        
        # Count digital discovery methods
        if 'social media' in combined:
            digital_points += 2
            total_mentions += 1
        if 'online' in combined or 'website' in combined:
            digital_points += 2
            total_mentions += 1
        if 'google' in combined or 'search' in combined:
            digital_points += 2
            total_mentions += 1
        if 'review' in combined or 'tripadvisor' in combined:
            digital_points += 1.5
            total_mentions += 1
        if 'booking' in combined or 'ota' in combined:
            digital_points += 1
            total_mentions += 1
        
        # Count non-digital methods
        if 'word of mouth' in combined:
            total_mentions += 1
        if 'walk-in' in combined or 'street' in combined:
            total_mentions += 1
        if 'market' in combined and 'visiting' in combined:
            total_mentions += 1
        
        if total_mentions > 0:
            score = (digital_points / max(total_mentions * 2, 1)) * 10
        else:
            score = 0.0
        
        return round(min(score, 10.0), 2), {'digital_points': digital_points, 'total_mentions': total_mentions}
    
    def calculate_digital_commerce(self, response: Dict[str, Any]) -> Tuple[float, Dict[str, Any]]:
        """
        Column P: Digital Commerce Score (0-10)
        Can customers actually complete transactions online?
        """
        score = 0.0
        
        if self.survey_type == 'CI':
            # Q21: Can customers buy online?
            buy = self._get_answer(response, 'Q21', '').lower()
            if 'yes' in buy:
                score += 4.0
            elif 'would like' in buy:
                score += 1.0
            
            # Q72: How do customers place orders?
            orders = self._get_answer(response, 'Q72', '').lower()
            if 'website' in orders or 'online' in orders:
                score += 3.0
            elif 'social media' in orders or 'whatsapp' in orders:
                score += 2.0
            elif 'phone' in orders:
                score += 1.0
        else:
            # Q33: Can customers buy services online?
            buy = self._get_answer(response, 'Q33', '').lower()
            if 'yes' in buy and 'website' in buy:
                score += 6.0
            elif 'yes' in buy:
                score += 4.0
            
            # Q28: Online sales platforms
            platforms = self._get_answer(response, 'Q28', '').lower()
            if 'website' in platforms:
                score += 2.0
            if 'social media' in platforms or 'facebook' in platforms:
                score += 1.0
        
        return round(min(score, 10.0), 2), {}
    
    def calculate_review_presence(self, response: Dict[str, Any]) -> Tuple[float, Dict[str, Any]]:
        """
        Column Q: Review Presence Score (0-10)
        Where do reviews appear? Active management?
        """
        score = 0.0
        
        review_q = 'Q22' if self.survey_type == 'CI' else 'Q34'
        reviews = self._get_answer(response, review_q, '').lower()
        
        if 'tripadvisor' in reviews:
            score += 3.0
        if 'google' in reviews:
            score += 2.0
        if 'facebook' in reviews:
            score += 2.0
        if 'booking' in reviews or 'booking.com' in reviews:
            score += 1.5
        if 'instagram' in reviews:
            score += 0.5
        
        if "don't get reviews" in reviews:
            score = 0.0
        
        return round(min(score, 10.0), 2), {}
    
    def calculate_market_focus(self, response: Dict[str, Any]) -> Tuple[float, str]:
        """
        Column R: Market Focus Score (0-10) + Label
        Tourist-focused vs Local-focused (shapes strategy)
        """
        tourist_percentage = 0.0
        
        if self.survey_type == 'CI':
            # Q74: % sales from tourists vs local
            sales_split = self._get_answer(response, 'Q74', '').lower()
            if 'mostly tourists' in sales_split or '70%' in sales_split:
                tourist_percentage = 75.0
            elif 'balanced' in sales_split:
                tourist_percentage = 50.0
            elif 'mostly local' in sales_split:
                tourist_percentage = 25.0
            else:
                # No direct answer, estimate from demographics
                tourist_percentage = 50.0  # Default balanced
        else:
            # TO: Sum Q15-Q20 for tourist percentage
            european = self._parse_percentage(self._get_answer(response, 'Q15', '0'))
            north_american = self._parse_percentage(self._get_answer(response, 'Q16', '0'))
            other_intl = self._parse_percentage(self._get_answer(response, 'Q17', '0'))
            
            tourist_percentage = european + north_american + other_intl
        
        # Convert to score (0-10)
        if tourist_percentage >= 80:
            score = 10.0
            label = "Highly Tourist-Focused"
        elif tourist_percentage >= 60:
            score = 7.0
            label = "Tourist-Oriented"
        elif tourist_percentage >= 40:
            score = 5.0
            label = "Balanced Market"
        elif tourist_percentage >= 20:
            score = 3.0
            label = "Local-Oriented"
        else:
            score = 1.0
            label = "Local-Focused"
        
        return round(score, 2), label
    
    # =============================================================================
    # MASTER SCORING FUNCTION
    # =============================================================================
    
    def score_complete_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Score a complete survey response
        Returns dict with scores for columns J-R plus breakdowns
        """
        results = {
            'business_name': self._get_answer(response, 'Q2', 'Unknown'),
            'respondent_name': self._get_answer(response, 'Q1', ''),
            'sector': self._get_answer(response, 'Q6' if self.survey_type == 'CI' else 'Q4', ''),
            'contact': self._get_answer(response, 'Q107' if self.survey_type == 'CI' else 'Q55', ''),
            'survey_type': self.survey_type,
        }
        
        # Scored categories (J-N)
        results['J_digital_foundation'], results['J_breakdown'] = self.score_digital_foundation(response)
        results['K_digital_capability'], results['K_breakdown'] = self.score_digital_capability(response)
        results['L_platform_ecosystem'], results['L_breakdown'] = self.score_platform_ecosystem(response)
        results['M_content_engagement'], results['M_breakdown'] = self.score_content_engagement(response)
        results['N_investment_barriers'], results['N_breakdown'] = self.score_investment_barriers(response)
        
        # Calculate total survey score (30 points max)
        results['total_survey_score'] = sum([
            results['J_digital_foundation'],
            results['K_digital_capability'],
            results['L_platform_ecosystem'],
            results['M_content_engagement'],
            results['N_investment_barriers']
        ])
        results['total_survey_score'] = round(results['total_survey_score'], 2)
        
        # Insight columns (O-R)
        results['O_customer_discovery'], results['O_details'] = self.calculate_customer_discovery(response)
        results['P_digital_commerce'], results['P_details'] = self.calculate_digital_commerce(response)
        results['Q_review_presence'], results['Q_details'] = self.calculate_review_presence(response)
        results['R_market_focus'], results['R_label'] = self.calculate_market_focus(response)
        
        return results
    
    # =============================================================================
    # HELPER FUNCTIONS
    # =============================================================================
    
    def _get_answer(self, response: Dict[str, Any], question_id: str, default: str = '') -> str:
        """Get answer to a question from response dict"""
        # Try with period (Q1.)
        key_with_period = f"{question_id}."
        for key in response.keys():
            if key.startswith(key_with_period):
                value = response[key]
                return str(value) if value else default
        
        # Try without period
        for key in response.keys():
            if key.startswith(question_id) and not key[len(question_id):len(question_id)+1].isdigit():
                value = response[key]
                return str(value) if value else default
        
        return default
    
    def _parse_percentage(self, value: str) -> float:
        """Parse percentage from string"""
        try:
            # Extract numbers from string
            numbers = re.findall(r'\d+\.?\d*', str(value))
            if numbers:
                return float(numbers[0])
        except:
            pass
        return 0.0


# =============================================================================
# USAGE EXAMPLE
# =============================================================================

if __name__ == '__main__':
    # Example usage
    ci_scorer = SurveyScorer('CI')
    
    # Sample response (from actual data)
    sample_response = {
        'Q1. Name (first, last)': 'Amadou Bah',
        'Q2. Name of organization/business': 'Galloya Street Arts',
        'Q6. What best describes your creative industry sector?': 'Crafts and artisan products',
        'Q11. Who in your business/organization is primarily responsible for digital marketing and online presence? (Select one)': 'We don\'t do digital marketing',
        'Q17. Do you have a website for your business/organization?': 'Yes, and it\'s regularly updated',
        'Q18. Which social media platforms do you actively use for your business? (Select all that apply)': 'Instagram',
        'Q20. How often do you post content about your work online?': 'Weekly',
        'Q21. Can customers buy your products/services online?': 'No, but I would like this option',
        'Q22. Where do customers typically leave reviews about your business? (Select all that apply)': 'We don\'t get reviews',
        'Q24. How comfortable are you with using digital tools for business?': 'Very comfortable - I learn new tools quickly and do it myself',
        'Q25. What devices do you primarily use for business activities? (Select all that apply)': 'Smartphone only',
        'Q26. How reliable is your internet connection?': 'Usually reliable - occasional issues',
        'Q27. Do you currently track how many people visit your online profiles or see your posts?': 'Yes, I check regularly (weekly/monthly)',
        'Q30. What is your biggest challenge with digital marketing? (Select one)': 'Too expensive (internet, phone data, etc.)',
        'Q32. How do you currently create content for promotion? (Select all that apply)': 'I write my own descriptions/stories about my work',
        'Q37. How much do you typically spend per month on internet/phone data for business?': 'D300-500',
        'Q38. Have you ever received training on digital marketing or online business?': 'No, but I would be interested',
        'Q40. How much could you realistically invest in improving your digital presence?': 'D1,000-5,000 per year',
        'Q107. Contact information for follow-up (phone, WhatsApp, email)': '351 3996'
    }
    
    print("="*80)
    print("SURVEY SCORING ENGINE TEST")
    print("="*80)
    
    results = ci_scorer.score_complete_response(sample_response)
    
    print(f"\nBusiness: {results['business_name']}")
    print(f"Respondent: {results['respondent_name']}")
    print(f"Sector: {results['sector']}")
    print(f"\n{'='*80}")
    print("SCORED CATEGORIES (J-N): {0}/30 points".format(results['total_survey_score']))
    print(f"{'='*80}")
    print(f"J. Digital Foundation:     {results['J_digital_foundation']}/6")
    print(f"   {results['J_breakdown']}")
    print(f"K. Digital Capability:     {results['K_digital_capability']}/8")
    print(f"   {results['K_breakdown']}")
    print(f"L. Platform Ecosystem:     {results['L_platform_ecosystem']}/6")
    print(f"   {results['L_breakdown']}")
    print(f"M. Content & Engagement:   {results['M_content_engagement']}/6")
    print(f"   {results['M_breakdown']}")
    print(f"N. Investment & Barriers:  {results['N_investment_barriers']}/4")
    print(f"   {results['N_breakdown']}")
    
    print(f"\n{'='*80}")
    print("INSIGHT COLUMNS (O-R):")
    print(f"{'='*80}")
    print(f"O. Customer Discovery:     {results['O_customer_discovery']}/10")
    print(f"P. Digital Commerce:       {results['P_digital_commerce']}/10")
    print(f"Q. Review Presence:        {results['Q_review_presence']}/10")
    print(f"R. Market Focus:           {results['R_market_focus']}/10 ({results['R_label']})")
    print()

