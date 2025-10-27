"""
Survey Question Mapping
Maps actual survey column names to scoring framework
"""

# CI Survey Question Mapping (actual column names from the sheet)
CI_QUESTIONS = {
    'business_name': 'Q2. Name of organization/business',
    'sector': 'Q6. What best describes your creative industry sector?',
    'location': 'Q7. Where is your organization/business located?',
    
    # Foundation Questions
    'website': 'Q17. Do you have a website for your business/organization?',
    'social_platforms': 'Q18. Which social media platforms do you actively use for your business? (Select all that apply)',
    'posting_frequency': 'Q20. How often do you post content about your work online?',
    'online_sales': 'Q21. Can customers buy your products/services online?',
    'online_booking': 'Q21. Can customers buy your products/services online?',  # Same question
    'review_platforms': 'Q22. Where do customers typically leave reviews about your business? (Select all that apply)',
    
    # Capability Questions
    'comfort_level': 'Q24. How comfortable are you with using digital tools for business?',
    'devices': 'Q25. What devices do you primarily use for business activities? (Select all that apply)',
    'internet': 'Q26. How reliable is your internet connection?',
    'analytics': 'Q27. Do you currently track how many people visit your online profiles or see your posts?',
    
    # Growth Questions
    'marketing_knowledge': 'Q28. Which of the following do you consider part of digital marketing? (Select all that apply)',
    'challenge': 'Q29. What is your biggest challenge with digital marketing? (Select one)',
    'content_creation': 'Q30. How do you currently create content for promotion? (Select all that apply)',
    'monthly_investment': 'Q33. How much do you typically spend per month on internet/phone data for business?',
    'training': 'Q35. Have you ever received training on digital marketing or online business?',
    'growth_ambition': 'Q38. How much could you realistically invest in improving your digital presence?',
    'affordable_services': 'Q36. What could you realistically afford to pay for website development or digital advertising services?',
}

# TO Survey Question Mapping (actual column names from the sheet)
TO_QUESTIONS = {
    'business_name': 'Q2. Name of your organization/business',
    'main_activity': 'Q4. What is your main business activity?',
    'location': 'Q8. Where is your business/organization located?',
    
    # Foundation Questions
    'website': 'Q23. Do you have a website for your business/organization?',
    'website_share': 'Q24. Would you be willing to share your website URL for a more detailed analysis to help improve your business\'s performance online?',
    'website_reasons': 'Q26. What are the reasons you don\'t have a website? (Select all that apply)',
    'booking_platforms': 'Q27. Which online platforms do you use to sell your tours? (Select all that apply)',
    'social_platforms': 'Q30. Which social media platforms do you actively use for your business? (Select all that apply)',
    'posting_frequency': 'Q32. How often do you post content about your work online?',
    'online_booking': 'Q33. Can customers book your services online?',
    'review_platforms': 'Q34. Where do customers typically leave reviews about your business? (Select all that apply)',
    
    # Capability Questions
    'comfort_level': 'Q36. How comfortable are you with using digital tools for business?',
    'devices': 'Q37. What devices do you primarily use for business activities? (Select all that apply)',
    'internet': 'Q38. How reliable is your internet connection?',
    'analytics': 'Q39. Do you currently track how many people visit your online profiles or see your posts?',
    
    # Growth Questions
    'marketing_knowledge': 'Q40. Which of the following do you consider part of digital marketing? (Select all that apply)',
    'challenge': 'Q41. What is your biggest challenge with digital marketing? (Select one)',
    'content_creation': 'Q42. How do you currently create content for promotion? (Select all that apply)',
    'monthly_investment': 'Q45. How much do you typically spend per month on internet/phone data for business?',
    'training': 'Q47. Have you ever received training on digital marketing or online business?',
    'growth_ambition': 'Q50. How much could you realistically invest in improving your digital presence?',
    'affordable_services': 'Q48. What could you realistically afford to pay for website development or digital advertising services?',
}


def get_question_key(survey_type: str, question_name: str) -> str:
    """Get the actual column name for a question"""
    mapping = CI_QUESTIONS if survey_type == 'CI' else TO_QUESTIONS
    return mapping.get(question_name, '')

