/**
 * Gambia Creative Industries - Enhanced Technical Analysis Script
 * Progressive guidance framework with field-assessable advancement pathways
 */

function generateTechnicalAnalysis() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const masterTab = ss.getSheetByName('Master Assessment');
    const techTab = ss.getSheetByName('Technical Analysis');
    
    if (!masterTab || !techTab) {
      Logger.log('Required tabs not found');
      SpreadsheetApp.getUi().alert('Error', 'Master Assessment or Technical Analysis tab not found', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Get assessment data
    const assessmentData = getTechnicalAssessmentData(masterTab);
    
    if (assessmentData.length === 0) {
      populateEmptyTechnicalAnalysis(techTab);
      return;
    }
    
    Logger.log(`Analyzing ${assessmentData.length} stakeholders for progressive technical guidance`);
    
    // Perform enhanced technical analysis
    const analysis = {
      progressionOpportunities: generateProgressionOpportunities(assessmentData),
      contextualQuickWins: identifyContextualQuickWins(assessmentData),
      sectorSpecificGuidance: generateSectorSpecificGuidance(assessmentData),
      priorityInterventions: generatePriorityInterventions(assessmentData),
      implementationRoadmap: createImplementationRoadmap(assessmentData)
    };
    
    // Clear and populate enhanced analysis
    clearTechnicalContent(techTab);
    populateEnhancedTechnicalAnalysis(techTab, analysis);
    
    // Add comprehensive summary
    techTab.getRange('A2').setValue(`Enhanced Technical Analysis: ${new Date().toLocaleString()}`);
    techTab.getRange('A3').setValue(`Progression Opportunities: ${analysis.progressionOpportunities.length} | Quick Wins: ${analysis.contextualQuickWins.length} | Priority Interventions: ${analysis.priorityInterventions.length}`);
    
    Logger.log('Enhanced Technical Analysis completed successfully');
    
  } catch (error) {
    Logger.log(`Error in generateTechnicalAnalysis: ${error.toString()}`);
    SpreadsheetApp.getUi().alert('Error', `Enhanced technical analysis failed: ${error.toString()}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function getTechnicalAssessmentData(masterTab) {
  try {
    const data = masterTab.getDataRange().getValues();
    const assessments = [];
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      if (!row[0] || row[0].toString().trim() === '') continue;
      
      const assessment = {
        name: row[0],
        sector: row[1] || 'Unknown',
        region: row[2] || 'Unknown',
        
        // External scores with enhanced ranges
        socialMedia: safeParseFloat(row[3]),        // 0-18
        website: safeParseFloat(row[4]),            // 0-12
        visualContent: safeParseFloat(row[5]),      // 0-15
        discoverability: safeParseFloat(row[6]),    // 0-12
        digitalSales: safeParseFloat(row[7]),       // 0-8
        platformIntegration: safeParseFloat(row[8]), // 0-5
        
        // Survey scores
        digitalComfort: safeParseFloat(row[9]),     // 0-8
        contentStrategy: safeParseFloat(row[10]),   // 0-8
        platformBreadth: safeParseFloat(row[11]),   // 0-7
        investmentCapacity: safeParseFloat(row[12]), // 0-4
        challengeSeverity: safeParseFloat(row[13]), // 0-3
        
        // Totals
        externalTotal: safeParseFloat(row[14]),
        surveyTotal: safeParseFloat(row[15]),
        combinedScore: safeParseFloat(row[16]),
        maturityLevel: row[17] || 'Basic',
        
        // Contact for follow-up
        contactInfo: row[20] || ''
      };
      
      // Enhanced analysis
      assessment.hasExternalData = assessment.externalTotal > 0;
      assessment.hasSurveyData = assessment.surveyTotal > 0;
      assessment.readinessFactors = assessReadinessForAdvancement(assessment);
      assessment.currentCapabilities = analyzeCurrentCapabilities(assessment);
      
      assessments.push(assessment);
    }
    
    Logger.log(`Retrieved ${assessments.length} assessments for enhanced technical analysis`);
    return assessments;
    
  } catch (error) {
    Logger.log(`Error getting technical assessment data: ${error.toString()}`);
    return [];
  }
}

function generateProgressionOpportunities(assessments) {
  const opportunities = [];
  
  assessments.forEach(assessment => {
    // Social Media progression analysis
    if (assessment.socialMedia < 18) {
      const socialMediaOpportunity = analyzeSocialMediaProgression(assessment);
      if (socialMediaOpportunity) opportunities.push(socialMediaOpportunity);
    }
    
    // Website progression analysis
    if (assessment.website < 12) {
      const websiteOpportunity = analyzeWebsiteProgression(assessment);
      if (websiteOpportunity) opportunities.push(websiteOpportunity);
    }
    
    // Visual Content progression analysis
    if (assessment.visualContent < 15) {
      const visualOpportunity = analyzeVisualContentProgression(assessment);
      if (visualOpportunity) opportunities.push(visualOpportunity);
    }
    
    // Discoverability progression analysis
    if (assessment.discoverability < 12) {
      const discoverabilityOpportunity = analyzeDiscoverabilityProgression(assessment);
      if (discoverabilityOpportunity) opportunities.push(discoverabilityOpportunity);
    }
    
    // Digital Sales progression analysis
    if (assessment.digitalSales < 8) {
      const salesOpportunity = analyzeDigitalSalesProgression(assessment);
      if (salesOpportunity) opportunities.push(salesOpportunity);
    }
  });
  
  return opportunities.sort((a, b) => {
    const impactOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    const effortOrder = { 'Low': 0, 'Medium': 1, 'High': 2 };
    
    if (impactOrder[a.impact] !== impactOrder[b.impact]) {
      return impactOrder[a.impact] - impactOrder[b.impact];
    }
    return effortOrder[a.effort] - effortOrder[b.effort];
  });
}

function analyzeSocialMediaProgression(assessment) {
  const current = assessment.socialMedia;
  const nextLevel = getNextSocialMediaLevel(current);
  const stretchLevel = getNextSocialMediaLevel(nextLevel);
  
  return {
    stakeholder: assessment.name,
    sector: assessment.sector,
    category: 'Social Media Business Presence',
    currentScore: current,
    currentDescription: getSocialMediaDescription(current),
    nextLevel: nextLevel,
    nextDescription: getSocialMediaDescription(nextLevel),
    stretchLevel: stretchLevel,
    stretchDescription: getSocialMediaDescription(stretchLevel),
    immediateActions: getSocialMediaActions(current, nextLevel),
    stretchActions: getSocialMediaActions(nextLevel, stretchLevel),
    effort: determineSocialMediaEffort(current, nextLevel),
    impact: determineSocialMediaImpact(current, nextLevel, assessment.sector),
    timeframe: getSocialMediaTimeframe(current, nextLevel),
    estimatedCost: getSocialMediaCost(current, nextLevel),
    sectorSpecific: getSectorSpecificSocialMediaGuidance(assessment.sector, current)
  };
}

function analyzeWebsiteProgression(assessment) {
  const current = assessment.website;
  const nextLevel = getNextWebsiteLevel(current);
  const stretchLevel = getNextWebsiteLevel(nextLevel);
  
  return {
    stakeholder: assessment.name,
    sector: assessment.sector,
    category: 'Website Presence & Functionality',
    currentScore: current,
    currentDescription: getWebsiteDescription(current),
    nextLevel: nextLevel,
    nextDescription: getWebsiteDescription(nextLevel),
    stretchLevel: stretchLevel,
    stretchDescription: getWebsiteDescription(stretchLevel),
    immediateActions: getWebsiteActions(current, nextLevel),
    stretchActions: getWebsiteActions(nextLevel, stretchLevel),
    effort: determineWebsiteEffort(current, nextLevel),
    impact: determineWebsiteImpact(current, nextLevel, assessment.sector),
    timeframe: getWebsiteTimeframe(current, nextLevel),
    estimatedCost: getWebsiteCost(current, nextLevel),
    sectorSpecific: getSectorSpecificWebsiteGuidance(assessment.sector, current)
  };
}

function analyzeVisualContentProgression(assessment) {
  const current = assessment.visualContent;
  const nextLevel = getNextVisualContentLevel(current);
  const stretchLevel = getNextVisualContentLevel(nextLevel);
  
  return {
    stakeholder: assessment.name,
    sector: assessment.sector,
    category: 'Visual Content Quality',
    currentScore: current,
    currentDescription: getVisualContentDescription(current),
    nextLevel: nextLevel,
    nextDescription: getVisualContentDescription(nextLevel),
    stretchLevel: stretchLevel,
    stretchDescription: getVisualContentDescription(stretchLevel),
    immediateActions: getVisualContentActions(current, nextLevel),
    stretchActions: getVisualContentActions(nextLevel, stretchLevel),
    effort: determineVisualContentEffort(current, nextLevel),
    impact: 'Critical', // Always critical for creative industries
    timeframe: getVisualContentTimeframe(current, nextLevel),
    estimatedCost: getVisualContentCost(current, nextLevel),
    sectorSpecific: getSectorSpecificVisualGuidance(assessment.sector, current)
  };
}

function analyzeDiscoverabilityProgression(assessment) {
  const current = assessment.discoverability;
  const nextLevel = getNextDiscoverabilityLevel(current);
  const stretchLevel = getNextDiscoverabilityLevel(nextLevel);
  
  return {
    stakeholder: assessment.name,
    sector: assessment.sector,
    category: 'Online Discoverability & Reputation',
    currentScore: current,
    currentDescription: getDiscoverabilityDescription(current),
    nextLevel: nextLevel,
    nextDescription: getDiscoverabilityDescription(nextLevel),
    stretchLevel: stretchLevel,
    stretchDescription: getDiscoverabilityDescription(stretchLevel),
    immediateActions: getDiscoverabilityActions(current, nextLevel),
    stretchActions: getDiscoverabilityActions(nextLevel, stretchLevel),
    effort: determineDiscoverabilityEffort(current, nextLevel),
    impact: determineDiscoverabilityImpact(current, nextLevel, assessment.sector),
    timeframe: getDiscoverabilityTimeframe(current, nextLevel),
    estimatedCost: getDiscoverabilityCost(current, nextLevel),
    sectorSpecific: getSectorSpecificDiscoverabilityGuidance(assessment.sector, current)
  };
}

function analyzeDigitalSalesProgression(assessment) {
  const current = assessment.digitalSales;
  const nextLevel = getNextDigitalSalesLevel(current);
  const stretchLevel = getNextDigitalSalesLevel(nextLevel);
  
  return {
    stakeholder: assessment.name,
    sector: assessment.sector,
    category: 'Digital Sales/Booking Capability',
    currentScore: current,
    currentDescription: getDigitalSalesDescription(current),
    nextLevel: nextLevel,
    nextDescription: getDigitalSalesDescription(nextLevel),
    stretchLevel: stretchLevel,
    stretchDescription: getDigitalSalesDescription(stretchLevel),
    immediateActions: getDigitalSalesActions(current, nextLevel),
    stretchActions: getDigitalSalesActions(nextLevel, stretchLevel),
    effort: determineDigitalSalesEffort(current, nextLevel),
    impact: determineDigitalSalesImpact(current, nextLevel, assessment.sector),
    timeframe: getDigitalSalesTimeframe(current, nextLevel),
    estimatedCost: getDigitalSalesCost(current, nextLevel),
    sectorSpecific: getSectorSpecificSalesGuidance(assessment.sector, current)
  };
}

// Level progression functions
function getNextSocialMediaLevel(current) {
  const levels = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];
  const currentIndex = levels.findIndex(level => level >= current);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : 18;
}

function getNextWebsiteLevel(current) {
  const levels = [0, 1, 3, 5, 7, 9, 12];
  const currentIndex = levels.findIndex(level => level >= current);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : 12;
}

function getNextVisualContentLevel(current) {
  const levels = [0, 2, 4, 6, 8, 10, 12, 15];
  const currentIndex = levels.findIndex(level => level >= current);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : 15;
}

function getNextDiscoverabilityLevel(current) {
  const levels = [0, 1, 3, 5, 7, 9, 12];
  const currentIndex = levels.findIndex(level => level >= current);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : 12;
}

function getNextDigitalSalesLevel(current) {
  const levels = [0, 2, 4, 6, 8];
  const currentIndex = levels.findIndex(level => level >= current);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : 8;
}

// Description functions
function getSocialMediaDescription(score) {
  const descriptions = {
    0: 'No business presence',
    2: 'Basic business setup',
    4: 'Regular activity emerging',
    6: 'Systematic posting',
    8: 'Multi-platform coordination',
    10: 'Strategic content planning',
    12: 'Professional management',
    14: 'Advanced strategy',
    16: 'Expert coordination',
    18: 'Industry leadership'
  };
  return descriptions[score] || 'Custom level';
}

function getWebsiteDescription(score) {
  const descriptions = {
    0: 'No website',
    1: 'Under construction/broken',
    3: 'Basic static presence',
    5: 'Functional business site',
    7: 'Well-maintained site',
    9: 'Professional web presence',
    12: 'Excellent web presence'
  };
  return descriptions[score] || 'Custom level';
}

function getVisualContentDescription(score) {
  const descriptions = {
    0: 'No quality visuals',
    2: 'Basic phone photos',
    4: 'Improved photography',
    6: 'Thoughtful composition',
    8: 'Semi-professional elements',
    10: 'Professional standard',
    12: 'Advanced visual strategy',
    15: 'Exceptional visual content'
  };
  return descriptions[score] || 'Custom level';
}

function getDiscoverabilityDescription(score) {
  const descriptions = {
    0: 'Not discoverable',
    1: 'Minimal search presence',
    3: 'Basic discoverability',
    5: 'Good visibility',
    7: 'Strong online presence',
    9: 'Excellent reputation management',
    12: 'Market-leading discoverability'
  };
  return descriptions[score] || 'Custom level';
}

function getDigitalSalesDescription(score) {
  const descriptions = {
    0: 'No online transactions',
    2: 'Basic inquiry system',
    4: 'Platform-based sales',
    6: 'Digital payment integration',
    8: 'Full digital commerce'
  };
  return descriptions[score] || 'Custom level';
}

// Action generation functions
function getSocialMediaActions(current, target) {
  const actionMap = {
    '0to2': [
      'Set up Facebook Business page with complete profile information',
      'Add business contact details, description, and location',
      'Upload profile photo and cover image representing your business'
    ],
    '2to4': [
      'Enable WhatsApp Business with catalog feature',
      'Post business content 2-3 times per month consistently',
      'Use business features like operating hours and location services',
      'Start responding to customer inquiries through business accounts'
    ],
    '4to6': [
      'Establish weekly posting schedule with diverse content',
      'Create content showcasing products/services and behind-the-scenes work',
      'Use relevant local hashtags (#GambianCrafts, #VisitGambia, #[YourSector])',
      'Begin responding to comments and messages within 24 hours'
    ],
    '6to8': [
      'Set up second platform (Instagram if using Facebook, or vice versa)',
      'Cross-reference platforms in posts ("See more on our Instagram")',
      'Encourage and actively respond to customer reviews',
      'Start engaging with other local businesses and sharing their content'
    ],
    '8to10': [
      'Plan content around events, seasons, and business cycles',
      'Create different content types: promotional, educational, community engagement',
      'Develop relationships with other local creative businesses online',
      'Use platform-specific features (Instagram Stories, Facebook Events)'
    ],
    '10to12': [
      'Coordinate branding across 3+ platforms with consistent logos and messaging',
      'Establish daily or every-other-day posting schedule',
      'Begin using basic analytics to understand audience preferences',
      'Create and share customer testimonials and success stories'
    ],
    '12to14': [
      'Collaborate with other businesses and local influencers',
      'Tailor content specifically for each platform\'s audience',
      'Track and celebrate follower growth milestones',
      'Create content series or themes for consistent engagement'
    ],
    '14to16': [
      'Develop evident content calendar with themed days and strategic timing',
      'Use professional photography across all platforms',
      'Form strategic partnerships with tourism boards or cultural organizations',
      'Measure and report on business impact from social media efforts'
    ],
    '16to18': [
      'Become a reference point that other businesses share and mention',
      'Get featured by tourism organizations, media, or industry publications',
      'Create comprehensive digital ecosystem linking all platforms seamlessly',
      'Mentor other businesses in social media best practices'
    ]
  };
  
  const key = `${current}to${target}`;
  return actionMap[key] || ['Focus on consistent, quality content creation'];
}

function getWebsiteActions(current, target) {
  const actionMap = {
    '0to1': [
      'Research web hosting options (start with free platforms like Wix or WordPress.com)',
      'Register a domain name related to your business',
      'Choose a template that matches your industry'
    ],
    '1to3': [
      'Add complete contact information including phone, email, and physical address',
      'Write a clear business description explaining your products/services',
      'Upload 3-5 high-quality images showcasing your work',
      'Ensure the site loads properly on mobile phones'
    ],
    '3to5': [
      'Create separate pages for different services or product categories',
      'Add customer testimonials or reviews if available',
      'Update content to reflect current offerings and recent work',
      'Test all contact forms and ensure they work properly'
    ],
    '5to7': [
      'Update website content at least every 6 months with fresh information',
      'Improve site navigation so visitors can easily find what they need',
      'Add links to your social media accounts',
      'Optimize images so the site loads quickly on mobile data'
    ],
    '7to9': [
      'Implement basic SEO by adding relevant keywords to page titles and descriptions',
      'Update content every 3 months with news, events, or new work',
      'Add professional photography throughout the site',
      'Ensure fast loading times on both mobile and desktop'
    ],
    '9to12': [
      'Add e-commerce functionality or booking system if relevant to your business',
      'Implement comprehensive business showcase with portfolio or catalog',
      'Update content monthly with blog posts, news, or featured work',
      'Optimize for search engines so customers can find you through Google'
    ]
  };
  
  const key = `${current}to${target}`;
  return actionMap[key] || ['Focus on regular updates and improved functionality'];
}

function getVisualContentActions(current, target) {
  const actionMap = {
    '0to2': [
      'Take clear, well-lit photos using smartphone camera',
      'Ensure subjects are in focus and well-centered in frame',
      'Use natural lighting when possible (near windows or outdoors)',
      'Practice basic composition - fill the frame with your subject'
    ],
    '2to4': [
      'Learn basic smartphone photography techniques (rule of thirds, lighting)',
      'Pay attention to backgrounds - keep them clean and uncluttered',
      'Take multiple shots from different angles',
      'Use consistent lighting conditions for product photos'
    ],
    '4to6': [
      'Learn basic photo editing using free phone apps (brightness, contrast, crop)',
      'Develop consistent style or approach to your photography',
      'Show products/services from multiple angles and in different contexts',
      'Start incorporating your brand colors or elements into photos'
    ],
    '6to8': [
      'Create professional-looking product shots with consistent backgrounds',
      'Use consistent filters or editing style across all images',
      'Begin creating action shots that tell the story of your work',
      'Ensure brand elements (logos, colors) are visible in visual content'
    ],
    '8to10': [
      'Invest in basic photography equipment (tripod, reflector, or simple lighting)',
      'Create branded templates for social media posts',
      'Start creating short video content showcasing your work process',
      'Develop signature visual style that customers recognize'
    ],
    '10to12': [
      'Plan and execute professional photo shoots for key products/services',
      'Create high-quality video content with good audio and stable footage',
      'Develop comprehensive visual brand guidelines',
      'Use advanced editing techniques to enhance professional appearance'
    ],
    '12to15': [
      'Create award-quality visual content that sets industry standards',
      'Develop innovative visual approaches unique to your business',
      'Use professional equipment and advanced techniques consistently',
      'Create visual content that drives significant engagement and sharing'
    ]
  };
  
  const key = `${current}to${target}`;
  return actionMap[key] || ['Focus on improving photo quality and consistency'];
}

function getDiscoverabilityActions(current, target) {
  const actionMap = {
    '0to1': [
      'Google your business name to see what currently appears',
      'Create basic online presence through social media or directory listings',
      'Ensure business information is consistent wherever it appears online'
    ],
    '1to3': [
      'Claim your Google My Business listing using Google Business Profile',
      'Add complete business information including hours, location, and contact details',
      'Upload 3-5 photos of your business, products, or services to Google My Business'
    ],
    '3to5': [
      'Complete Google My Business profile with detailed description and categories',
      'Ask satisfied customers to leave reviews on Google and Facebook',
      'List your business on relevant local directories (tourism, industry-specific)',
      'Ensure consistent business name, address, phone across all platforms'
    ],
    '5to7': [
      'Regularly update Google My Business with posts about events, news, or offers',
      'Actively seek customer reviews and respond to all reviews professionally',
      'Get listed on tourism platforms like VisitTheGambia.com or My-Gambia.com',
      'Create content that helps you appear in local search results'
    ],
    '7to9': [
      'Maintain 20+ customer reviews with professional responses to all feedback',
      'Regularly post updates on Google My Business (weekly if possible)',
      'Get featured on multiple tourism and industry websites',
      'Monitor and manage your online reputation actively'
    ],
    '9to12': [
      'Dominate first page search results for your business name and relevant keywords',
      'Become a featured business on tourism board websites',
      'Have other businesses and organizations link to or mention your business',
      'Establish yourself as a recognized leader in your sector online'
    ]
  };
  
  const key = `${current}to${target}`;
  return actionMap[key] || ['Focus on improving search visibility and online reputation'];
}

function getDigitalSalesActions(current, target) {
  const actionMap = {
    '0to2': [
      'Set up WhatsApp Business with product catalog feature',
      'Create contact forms on your website or social media',
      'Enable messaging on Facebook/Instagram for customer inquiries',
      'Clearly display phone number and email for customer contact'
    ],
    '2to4': [
      'Use Facebook Shop or Instagram Shopping features',
      'Set up WhatsApp Business catalog with product photos and prices',
      'Create social media posts that encourage direct messaging for orders',
      'Establish clear process for taking orders through social media'
    ],
    '4to6': [
      'Set up mobile money payment options (Orange Money, QMoney)',
      'Integrate basic payment systems into your social media or website',
      'Create simple order forms that customers can fill out online',
      'Offer multiple payment methods to accommodate different customers'
    ],
    '6to8': [
      'Implement full e-commerce website with shopping cart functionality',
      'Integrate multiple payment options including mobile money and bank transfers',
      'Create comprehensive online ordering system',
      'Set up automated confirmation emails for orders and payments'
    ]
  };
  
  const key = `${current}to${target}`;
  return actionMap[key] || ['Focus on improving digital payment and ordering capabilities'];
}

// Effort, impact, timeframe, and cost determination functions
function determineSocialMediaEffort(current, target) {
  const effortGap = target - current;
  if (effortGap <= 2) return 'Low';
  if (effortGap <= 4) return 'Medium';
  return 'High';
}

function determineSocialMediaImpact(current, target, sector) {
  // Social media is critical for all creative industries
  if (current < 6) return 'Critical';
  if (current < 12) return 'High';
  return 'Medium';
}

function getSocialMediaTimeframe(current, target) {
  const gap = target - current;
  if (gap <= 2) return '1-2 weeks';
  if (gap <= 4) return '3-4 weeks';
  return '2-3 months';
}

function getSocialMediaCost(current, target) {
  const gap = target - current;
  if (gap <= 4) return 'D0-500';
  if (gap <= 8) return 'D500-2,000';
  return 'D2,000-5,000';
}

// Similar functions for other categories (abbreviated for space)
function determineWebsiteEffort(current, target) {
  if (current === 0 && target > 0) return 'High';
  if (target - current <= 2) return 'Low';
  return 'Medium';
}

function determineWebsiteImpact(current, target, sector) {
  const professionalSectors = ['Marketing/advertising/publishing', 'Audiovisual'];
  if (professionalSectors.includes(sector) && current < 5) return 'High';
  return 'Medium';
}

function getWebsiteTimeframe(current, target) {
  if (current === 0) return '4-8 weeks';
  if (target - current <= 2) return '2-3 weeks';
  return '4-6 weeks';
}

function getWebsiteCost(current, target) {
  if (current === 0) return 'D2,000-8,000';
  if (target - current <= 2) return 'D500-2,000';
  return 'D2,000-5,000';
}

function determineVisualContentEffort(current, target) {
  if (target - current <= 2) return 'Low';
  if (target - current <= 4) return 'Medium';
  return 'High';
}

function getVisualContentTimeframe(current, target) {
  const gap = target - current;
  if (gap <= 2) return '1-2 weeks';
  if (gap <= 4) return '3-4 weeks';
  return '1-2 months';
}

function getVisualContentCost(current, target) {
  const gap = target - current;
  if (gap <= 2) return 'D0-500';
  if (gap <= 4) return 'D500-2,000';
  return 'D2,000-8,000';
}

function determineDiscoverabilityEffort(current, target) {
  if (target - current <= 2) return 'Low';
  return 'Medium';
}

function determineDiscoverabilityImpact(current, target, sector) {
  if (current < 3) return 'Critical';
  if (current < 7) return 'High';
  return 'Medium';
}

function getDiscoverabilityTimeframe(current, target) {
  if (target - current <= 2) return '1-2 weeks';
  return '3-4 weeks';
}

function getDiscoverabilityCost(current, target) {
  return 'D0-500'; // Most discoverability improvements are free
}

function determineDigitalSalesEffort(current, target) {
  if (current === 0 && target >= 4) return 'High';
  if (target - current <= 2) return 'Low';
  return 'Medium';
}

function determineDigitalSalesImpact(current, target, sector) {
  const commerceSectors = ['Crafts and artisan products', 'Fashion & Design'];
  if (commerceSectors.includes(sector) && current < 4) return 'High';
  return 'Medium';
}

function getDigitalSalesTimeframe(current, target) {
  if (target - current <= 2) return '2-3 weeks';
  if (target - current <= 4) return '4-6 weeks';
  return '2-3 months';
}

function getDigitalSalesCost(current, target) {
  const gap = target - current;
  if (gap <= 2) return 'D0-1,000';
  if (gap <= 4) return 'D1,000-3,000';
  return 'D3,000-8,000';
}

// Sector-specific guidance functions
function getSectorSpecificSocialMediaGuidance(sector, currentScore) {
  const sectorGuidance = {
    'Festivals and cultural events': [
      'Focus on event promotion timeline and live coverage',
      'Create countdown posts and behind-the-scenes content',
      'Share live updates during events with photos and videos',
      'Post recap content and highlights after events'
    ],
    'Crafts and artisan products': [
      'Showcase production process with step-by-step photos',
      'Feature finished products with professional product shots',
      'Share stories about traditional techniques and cultural significance',
      'Use relevant craft hashtags and connect with export markets'
    ],
    'Music (artists, production, venues, education)': [
      'Document performance and rehearsal processes',
      'Share music clips and performance videos',
      'Promote upcoming shows and events',
      'Connect with other musicians and venues'
    ],
    'Audiovisual (film, photography, TV, videography)': [
      'Create professional portfolio showcases',
      'Share before/after examples of work',
      'Post client testimonials and case studies',
      'Network with other creative professionals'
    ],
    'Audiovisual (film, photography, TV, videography, digital content creation)': [
      'Publish before/after edits and short case reels',
      'Share lighting/camera BTS and timelapses',
      'Post client testimonials with deliverable clips'
    ],
    'Marketing/advertising/publishing': [
      'Share carousel case studies with metrics',
      'Post creative breakdowns (brief → concept → result)',
      'Publish content cadence tips and templates'
    ],
    'Fashion & Design (design, production, textiles)': [
      'Run drop calendars with teaser → launch → styling reels',
      'Share sizing/fit tips and fabric stories',
      'Feature maker/designer behind-the-scenes'
    ],
    'Performing and visual arts (dance, fine arts, galleries, photography, theatre)': [
      'Post rehearsal/process clips and artist statements',
      'Invite to openings/previews; share highlights after',
      'Use carousels to tell work-in-progress stories'
    ],
    'Cultural heritage sites/museums': [
      'Weekly “Object of the Week” carousel with curator voice',
      'Visitor Q&A prompts in captions',
      'Event/education program recap reels'
    ],
    'Tour operators / guides': [
      '30–60s itinerary snippet reels',
      'Guide intro videos; guest testimonials',
      'Short tips (what to bring, best time to visit)'
    ],
    'Tour operators': [
      '30–60s itinerary snippet reels',
      'Guide intro videos; guest testimonials',
      'Short tips (what to bring, best time to visit)'
    ]
  };
  
  return sectorGuidance[sector] || ['Focus on showcasing your unique creative work and connecting with your audience'];
}

function getSectorSpecificWebsiteGuidance(sector, currentScore) {
  const sectorGuidance = {
    'Festivals and cultural events': [
      'Include event calendar and ticket information',
      'Feature photo galleries from past events',
      'Provide visitor information and logistics'
    ],
    'Crafts and artisan products': [
      'Create comprehensive product catalog with pricing',
      'Include information about custom orders and shipping',
      'Feature the story behind your craft and techniques'
    ],
    'Music (artists, production, venues, education)': [
      'Include music samples and performance videos',
      'Provide booking information and contact for events',
      'Feature upcoming show dates and venues'
    ],
    'Cultural heritage sites/museums': [
      'Include visitor information, hours, and admission',
      'Feature virtual tours or photo galleries',
      'Provide educational content about collections'
    ],
    'Audiovisual (film, photography, TV, videography, digital content creation)': [
      'Build service pages with portfolio examples per service',
      'Show rate/brief ranges and contact form',
      'Add client testimonials and case studies'
    ],
    'Marketing/advertising/publishing': [
      'Create offer pages with outcomes and proof',
      'Add lead magnet and short quote form',
      'Publish 2 SEO articles answering buyer questions'
    ],
    'Fashion & Design (design, production, textiles)': [
      'Collection landing pages with size charts',
      'Fabric/care details and model photos',
      'Wholesale/stockist enquiry page'
    ],
    'Performing and visual arts (dance, fine arts, galleries, photography, theatre)': [
      'Exhibition/show pages with artist statements',
      'Price list or enquiry form; visit info',
      'Gallery/events calendar'
    ],
    'Tour operators / guides': [
      'Dedicated page per tour: price, duration, essentials',
      'Map, photo gallery and FAQs',
      'Clear “Book now” or WhatsApp CTA'
    ],
    'Tour operators': [
      'Dedicated page per tour: price, duration, essentials',
      'Map, photo gallery and FAQs',
      'Clear “Book now” or WhatsApp CTA'
    ]
  };
  
  return sectorGuidance[sector] || ['Focus on clearly presenting your services and how customers can engage with you'];
}

function getSectorSpecificVisualGuidance(sector, currentScore) {
  const sectorGuidance = {
    'Festivals and cultural events': [
      'Capture energy and atmosphere of events',
      'Document cultural performances and traditions',
      'Show crowd engagement and participation'
    ],
    'Crafts and artisan products': [
      'Professional product photography with clean backgrounds',
      'Process shots showing craftsmanship',
      'Detail shots highlighting quality and techniques'
    ],
    'Music (artists, production, venues, education)': [
      'High-quality performance photography',
      'Professional headshots and promotional images',
      'Behind-the-scenes content from recording or rehearsals'
    ],
    'Fashion & Design': [
      'Professional model photography or styled product shots',
      'Detail shots of construction and design elements',
      'Lifestyle images showing clothing in use'
    ],
    'Fashion & Design (design, production, textiles)': [
      'Editorial hero images per look',
      'Macro stitching/fabric details',
      'Lifestyle shots showing fit and motion'
    ],
    'Audiovisual (film, photography, TV, videography, digital content creation)': [
      '12‑image highlight set per service',
      'Before/after graded vs RAW frames',
      'Storyboard frames / lighting diagrams'
    ],
    'Performing and visual arts (dance, fine arts, galleries, photography, theatre)': [
      'Installation shots and detail crops',
      'Performance stills and rehearsal images',
      'Curator/artist portraits'
    ],
    'Tour operators / guides': [
      'Guest‑perspective experience clips',
      'Highlights reel for each route',
      'Guide portrait photos'
    ],
    'Tour operators': [
      'Guest‑perspective experience clips',
      'Highlights reel for each route',
      'Guide portrait photos'
    ]
  };
  
  return sectorGuidance[sector] || ['Focus on high-quality images that showcase your creative work professionally'];
}

function getSectorSpecificDiscoverabilityGuidance(sector, currentScore) {
  const sectorGuidance = {
    'Festivals and cultural events': [
      'List on tourism platforms like VisitTheGambia.com',
      'Connect with tourism board and cultural ministry',
      'Get featured in event calendars and cultural guides'
    ],
    'Crafts and artisan products': [
      'List on craft and artisan directories',
      'Connect with export promotion agencies',
      'Get featured on cultural tourism platforms'
    ],
    'Cultural heritage sites/museums': [
      'List on TripAdvisor and other tourism platforms',
      'Connect with tour operators and travel agencies',
      'Get featured in cultural and historical guides'
    ],
    'Audiovisual (film, photography, TV, videography, digital content creation)': [
      'Optimize Google Business Profile services',
      'Create geo‑targeted service pages',
      'Request 5 photo reviews from clients'
    ],
    'Marketing/advertising/publishing': [
      'List in industry directories and agency platforms',
      'Publish two SEO posts targeting buyer questions',
      'Post thought‑leadership on LinkedIn'
    ],
    'Fashion & Design (design, production, textiles)': [
      'Create stockist/press page; submit to fashion directories',
      'Set up Google Merchant Center feed',
      'Apply for relevant marketplaces'
    ],
    'Performing and visual arts (dance, fine arts, galleries, photography, theatre)': [
      'List exhibitions/shows on event calendars and art directories',
      'Pitch 3 critics/blogs with press kit',
      'Create artist discoverability pages'
    ],
    'Tour operators / guides': [
      'Publish products on Viator/GetYourGuide',
      'Upgrade Tripadvisor listing with products and images',
      'Establish partnerships with local hotels for referrals'
    ],
    'Tour operators': [
      'Publish products on Viator/GetYourGuide',
      'Upgrade Tripadvisor listing with products and images',
      'Establish partnerships with local hotels for referrals'
    ]
  };
  
  return sectorGuidance[sector] || ['Focus on relevant industry platforms and directories for your sector'];
}

function getSectorSpecificSalesGuidance(sector, currentScore) {
  const sectorGuidance = {
    'Festivals and cultural events': [
      'Set up online ticket sales if applicable',
      'Create merchandise sales channels',
      'Enable sponsorship inquiry systems'
    ],
    'Crafts and artisan products': [
      'Implement e-commerce for product sales',
      'Set up international shipping capabilities',
      'Create custom order inquiry systems'
    ],
    'Music (artists, production, venues, education)': [
      'Enable booking and inquiry systems',
      'Set up merchandise and music sales',
      'Create lesson or service booking capabilities'
    ],
    'Audiovisual (film, photography, TV, videography, digital content creation)': [
      'Enable 15‑min consult scheduling',
      'Project brief intake form',
      'Send payment links for deposits'
    ],
    'Marketing/advertising/publishing': [
      'Discovery call booking flow',
      'Pre‑call questionnaire and proposal template',
      'Simple contract + payment link'
    ],
    'Fashion & Design (design, production, textiles)': [
      'Enable variants and size/colour options',
      'Custom order form for tailoring',
      'Deposit/payment link checkout'
    ],
    'Performing and visual arts (dance, fine arts, galleries, photography, theatre)': [
      'Request price/availability form',
      'Viewing appointment slots',
      'Donation/membership or ticket link'
    ],
    'Cultural heritage sites/museums': [
      'Timed entry ticketing',
      'School/group booking forms',
      'Donate/membership CTAs'
    ],
    'Tour operators / guides': [
      'Booking engine or WhatsApp prefilled itinerary',
      'Instant quote template',
      'Payment link confirmation'
    ],
    'Tour operators': [
      'Booking engine or WhatsApp prefilled itinerary',
      'Instant quote template',
      'Payment link confirmation'
    ]
  };
  
  return sectorGuidance[sector] || ['Focus on systems that allow customers to purchase your products or services'];
}

function identifyContextualQuickWins(assessments) {
  const quickWins = [];
  
  assessments.forEach(assessment => {
    // Analyze readiness and potential impact
    const readiness = assessReadinessForAdvancement(assessment);
    
    // Sector-aware Google Business/Profile tune-up
    if (assessment.discoverability <= 3 && readiness.infrastructure >= 0.5) {
      const gmbTitle = (assessment.sector && assessment.sector.toLowerCase().includes('tour'))
        ? 'Tripadvisor & Google Profile Upgrade'
        : 'Google Business Profile Tune‑Up';
      quickWins.push({
        stakeholder: assessment.name,
        sector: assessment.sector,
        opportunity: gmbTitle,
        currentScore: assessment.discoverability,
        targetScore: assessment.discoverability + 2,
        effort: 'Low',
        impact: 'High',
        timeframe: '2-3 hours',
        cost: 'Free',
        specificActions: (assessment.sector && assessment.sector.toLowerCase().includes('tour')) ? [
          'Upgrade Tripadvisor listing with products, images, hours',
          'Claim/complete Google Business Profile',
          'Request 5 guest reviews with photos'
        ] : [
          'Claim and verify Google Business Profile',
          'Add complete info, categories and high‑quality photos',
          'Request 5 customer reviews and respond'
        ],
        expectedOutcome: 'Immediate improvement in local search visibility',
        readinessFactors: ['Free to implement', 'No technical skills required', 'Immediate results']
      });
    }
    
    // Social media consistency - for those with basic presence
    if (assessment.socialMedia >= 2 && assessment.socialMedia <= 6 && readiness.digital >= 0.6) {
      quickWins.push({
        stakeholder: assessment.name,
        sector: assessment.sector,
        opportunity: 'Social Media Consistency Boost',
        currentScore: assessment.socialMedia,
        targetScore: assessment.socialMedia + 2,
        effort: 'Low',
        impact: 'High',
        timeframe: '1-2 weeks',
        cost: 'D0-200',
        specificActions: [
          'Create weekly posting schedule',
          'Enable all business features on current platforms',
          'Start engaging with customer comments daily'
        ],
        expectedOutcome: 'More professional appearance and better customer engagement',
        readinessFactors: ['Building on existing presence', 'Uses familiar platforms', 'Low cost']
      });
    }
    
    // Visual content improvement - basic training
    if (assessment.visualContent >= 2 && assessment.visualContent <= 6) {
      quickWins.push({
        stakeholder: assessment.name,
        sector: assessment.sector,
        opportunity: 'Smartphone Photography Skills',
        currentScore: assessment.visualContent,
        targetScore: assessment.visualContent + 2,
        effort: 'Low',
        impact: 'Critical',
        timeframe: '4-6 hours training',
        cost: 'D0-500',
        specificActions: [
          'Learn basic composition and lighting techniques',
          'Practice product photography with phone camera',
          'Start basic editing using free phone apps'
        ],
        expectedOutcome: 'Dramatically improved visual presentation across all digital platforms',
        readinessFactors: ['Uses existing phone', 'Immediate visual improvement', 'Essential for creative industries']
      });
    }

    // Website presence starter (sector‑aware one‑page)
    if (assessment.website === 0 || assessment.website === 1) {
      quickWins.push({
        stakeholder: assessment.name,
        sector: assessment.sector,
        opportunity: (assessment.sector && assessment.sector.toLowerCase().includes('tour')) ? 'Tour One‑Page Launch' : 'One‑Page Website Launch',
        currentScore: assessment.website,
        targetScore: Math.min(assessment.website + 3, 3),
        effort: 'Low',
        impact: 'High',
        timeframe: '1 week',
        cost: 'D0-500',
        specificActions: (assessment.sector && assessment.sector.toLowerCase().includes('tour')) ? [
          'Create one page per tour: price, duration, essentials',
          'Add map, 6 photos and FAQs',
          'Add WhatsApp “Book now” button'
        ] : [
          'Create a one‑page site (e.g., Google Sites)',
          'Add contact info, value proposition and 6 photos',
          'Link to WhatsApp and social profiles'
        ],
        expectedOutcome: 'Basic web presence discoverable from search and profiles',
        readinessFactors: ['Template-based', 'Low cost', 'Non-technical']
      });
    }

    // Discoverability listings & reviews
    if (assessment.discoverability <= 5) {
      quickWins.push({
        stakeholder: assessment.name,
        sector: assessment.sector,
        opportunity: 'Directory Listings & Reviews Sprint',
        currentScore: assessment.discoverability,
        targetScore: Math.min(assessment.discoverability + 2, 7),
        effort: 'Low',
        impact: 'High',
        timeframe: '2-3 hours',
        cost: 'Free',
        specificActions: [
          'Claim/update profiles on two relevant platforms',
          'Request 3 customer reviews and respond professionally',
          'Ensure NAP consistency across listings'
        ],
        expectedOutcome: 'Better first-page presence and trust signals',
        readinessFactors: ['No special tools', 'Immediate visibility gains']
      });
    }

    // Digital sales quick step (sector‑aware)
    if (assessment.digitalSales === 0 || assessment.digitalSales === 2) {
      quickWins.push({
        stakeholder: assessment.name,
        sector: assessment.sector,
        opportunity: (assessment.sector && assessment.sector.toLowerCase().includes('fashion')) ? 'Order & Customization Flow' : 'Inquiry‑to‑Order Flow',
        currentScore: assessment.digitalSales,
        targetScore: Math.min(assessment.digitalSales + 2, 4),
        effort: 'Low',
        impact: 'Medium',
        timeframe: '1 week',
        cost: 'D0-200',
        specificActions: (assessment.sector && assessment.sector.toLowerCase().includes('fashion')) ? [
          'Enable variants and size/colour options',
          'Add custom order form with measurements',
          'Set up deposit/payment link'
        ] : [
          'Add an order/inquiry form or prefilled WhatsApp',
          'Define response template and 24h turnaround',
          'Track inquiries in a shared sheet'
        ],
        expectedOutcome: 'Structured intake process enabling quicker conversion',
        readinessFactors: ['Uses existing tools', 'No dev required']
      });
    }
  });
  
  // Rank then pick up to three distinct opportunities for variety
  const impactOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
  const effortOrder = { 'Low': 0, 'Medium': 1, 'High': 2 };
  const sorted = quickWins.sort((a, b) => {
    if (impactOrder[a.impact] !== impactOrder[b.impact]) {
      return impactOrder[a.impact] - impactOrder[b.impact];
    }
    return effortOrder[a.effort] - effortOrder[b.effort];
  });

  const seen = new Set();
  const diversified = [];
  for (const item of sorted) {
    if (!seen.has(item.opportunity)) {
      seen.add(item.opportunity);
      diversified.push(item);
    }
    if (diversified.length >= 3) break;
  }
  return diversified;
}

function generateSectorSpecificGuidance(assessments) {
  const sectorGuidance = {};
  
  // Group assessments by sector
  assessments.forEach(assessment => {
    if (!sectorGuidance[assessment.sector]) {
      sectorGuidance[assessment.sector] = {
        total: 0,
        averageScores: {},
        commonGaps: {},
        readyForAdvancement: [],
        needsBasicSupport: [],
        topPerformers: []
      };
    }
    
    const guidance = sectorGuidance[assessment.sector];
    guidance.total++;
    
    // Track performance patterns
    const scores = {
      socialMedia: assessment.socialMedia,
      website: assessment.website,
      visualContent: assessment.visualContent,
      discoverability: assessment.discoverability,
      digitalSales: assessment.digitalSales
    };
    
    Object.keys(scores).forEach(category => {
      if (!guidance.averageScores[category]) guidance.averageScores[category] = 0;
      guidance.averageScores[category] += scores[category];
      
      // Track common gaps
      if (scores[category] < getCategoryTarget(category, assessment.sector)) {
        if (!guidance.commonGaps[category]) guidance.commonGaps[category] = 0;
        guidance.commonGaps[category]++;
      }
    });
    
    // Categorize by advancement readiness
    const readiness = assessReadinessForAdvancement(assessment);
    if (readiness.overall >= 0.7) {
      guidance.readyForAdvancement.push(assessment.name);
    } else if (assessment.externalTotal < 20) {
      guidance.needsBasicSupport.push(assessment.name);
    }
    
    // Track top performers
    if (assessment.externalTotal >= 40) {
      guidance.topPerformers.push({
        name: assessment.name,
        score: assessment.externalTotal
      });
    }
  });
  
  // Calculate averages and generate recommendations
  Object.keys(sectorGuidance).forEach(sector => {
    const guidance = sectorGuidance[sector];
    
    Object.keys(guidance.averageScores).forEach(category => {
      guidance.averageScores[category] = Math.round(guidance.averageScores[category] / guidance.total * 10) / 10;
    });
    
    guidance.priorityArea = Object.keys(guidance.commonGaps).reduce((a, b) => 
      guidance.commonGaps[a] > guidance.commonGaps[b] ? a : b, 
      Object.keys(guidance.commonGaps)[0]
    ) || 'General improvement';
    
    guidance.recommendations = generateSectorRecommendations(sector, guidance);
  });
  
  return sectorGuidance;
}

function generatePriorityInterventions(assessments) {
  const interventions = [];
  
  // Mass Google My Business setup
  const needsGMB = assessments.filter(a => a.discoverability <= 3);
  if (needsGMB.length >= 10) {
    interventions.push({
      type: 'Mass Training',
      title: 'Google My Business Setup Workshop',
      stakeholdersAffected: needsGMB.length,
      priority: 'High',
      effort: 'Medium',
      cost: 'D5,000-15,000',
      timeframe: '2-3 weeks',
      expectedImpact: 'Immediate search visibility for most stakeholders',
      implementation: [
        'Organize group training sessions',
        'Provide step-by-step guides',
        'Offer individual assistance for complex cases',
        'Follow up to ensure completion'
      ]
    });
  }
  
  // Visual content training program
  const needsVisualTraining = assessments.filter(a => a.visualContent <= 6);
  if (needsVisualTraining.length >= 15) {
    interventions.push({
      type: 'Skills Training',
      title: 'Smartphone Photography Workshop Series',
      stakeholdersAffected: needsVisualTraining.length,
      priority: 'Critical',
      effort: 'Medium',
      cost: 'D10,000-25,000',
      timeframe: '4-6 weeks',
      expectedImpact: 'Dramatic improvement in visual presentation across creative industries',
      implementation: [
        'Develop sector-specific photography modules',
        'Provide hands-on practice sessions',
        'Create follow-up support system',
        'Share equipment recommendations for different budgets'
      ]
    });
  }
  
  // Social media strategy program
  const needsSocialStrategy = assessments.filter(a => a.socialMedia >= 4 && a.socialMedia <= 10);
  if (needsSocialStrategy.length >= 12) {
    interventions.push({
      type: 'Strategic Development',
      title: 'Social Media Strategy Development Program',
      stakeholdersAffected: needsSocialStrategy.length,
      priority: 'High',
      effort: 'High',
      cost: 'D15,000-30,000',
      timeframe: '6-8 weeks',
      expectedImpact: 'Advanced social media capabilities and strategic thinking',
      implementation: [
        'Develop customized content calendars',
        'Provide platform-specific training',
        'Create peer mentoring networks',
        'Establish ongoing support system'
      ]
    });
  }
  
  return interventions.sort((a, b) => {
    const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function createImplementationRoadmap(assessments) {
  const roadmap = {
    phase1: { // 0-4 weeks
      title: 'Foundation Building',
      focus: 'Critical gaps and universal quick wins',
      activities: [],
      expectedOutcomes: []
    },
    phase2: { // 1-3 months
      title: 'Skill Development',
      focus: 'Training programs and capability building',
      activities: [],
      expectedOutcomes: []
    },
    phase3: { // 3-6 months
      title: 'Strategic Implementation',
      focus: 'Advanced features and optimization',
      activities: [],
      expectedOutcomes: []
    },
    phase4: { // 6-12 months
      title: 'Excellence and Leadership',
      focus: 'Industry leadership and mentoring others',
      activities: [],
      expectedOutcomes: []
    }
  };
  
  // Analyze needs across all assessments
  const totalAssessments = assessments.length;
  const criticalIssues = assessments.filter(a => a.externalTotal < 20).length;
  const intermediateLevel = assessments.filter(a => a.externalTotal >= 20 && a.externalTotal < 45).length;
  const advancedLevel = assessments.filter(a => a.externalTotal >= 45).length;
  
  // Phase 1 activities
  roadmap.phase1.activities = [
    `Google My Business setup for ${assessments.filter(a => a.discoverability <= 3).length} stakeholders`,
    `Basic social media training for ${criticalIssues} stakeholders with minimal presence`,
    `Smartphone photography basics for ${assessments.filter(a => a.visualContent <= 4).length} stakeholders`
  ];
  
  roadmap.phase1.expectedOutcomes = [
    'All stakeholders discoverable through Google search',
    'Basic professional social media presence established',
    'Acceptable visual content quality achieved'
  ];
  
  // Phase 2 activities
  roadmap.phase2.activities = [
    `Strategic social media training for ${intermediateLevel} stakeholders`,
    `Website development support for ${assessments.filter(a => a.website <= 3).length} stakeholders`,
    `Advanced photography workshops for promising practitioners`
  ];
  
  roadmap.phase2.expectedOutcomes = [
    '70% of stakeholders achieving intermediate digital presence',
    'Functional websites for professional service providers',
    'Consistent quality visual content across sectors'
  ];
  
  // Phase 3 activities
  roadmap.phase3.activities = [
    `E-commerce integration for ${assessments.filter(a => a.digitalSales <= 4).length} product-based businesses`,
    `Advanced platform integration and optimization`,
    `Sector-specific digital marketing strategies`
  ];
  
  roadmap.phase3.expectedOutcomes = [
    'Digital sales capabilities for relevant sectors',
    'Advanced multi-platform digital strategies',
    'Sector leadership in digital presence'
  ];
  
  // Phase 4 activities
  roadmap.phase4.activities = [
    'Peer mentoring program establishment',
    'Digital marketing innovation projects',
    'International market integration support'
  ];
  
  roadmap.phase4.expectedOutcomes = [
    'Self-sustaining digital improvement culture',
    'Industry recognition and leadership',
    'Export market digital integration'
  ];
  
  return roadmap;
}

// Analysis helper functions
function assessReadinessForAdvancement(assessment) {
  const readiness = {
    digital: 0,
    infrastructure: 0,
    investment: 0,
    overall: 0
  };
  
  // Digital readiness based on current capabilities
  readiness.digital = Math.min(assessment.externalTotal / 35, 1); // 35 = halfway to maximum
  
  // Infrastructure readiness (from survey data if available)
  if (assessment.hasSurveyData) {
    readiness.infrastructure = (3 - assessment.challengeSeverity) / 3;
    readiness.investment = assessment.investmentCapacity / 4;
  } else {
    // Estimate based on current performance
    readiness.infrastructure = assessment.externalTotal > 15 ? 0.7 : 0.4;
    readiness.investment = assessment.externalTotal > 25 ? 0.6 : 0.3;
  }
  
  readiness.overall = (readiness.digital + readiness.infrastructure + readiness.investment) / 3;
  
  return readiness;
}

function analyzeCurrentCapabilities(assessment) {
  return {
    strongAreas: getStrongAreas(assessment),
    developmentAreas: getDevelopmentAreas(assessment),
    nextPriority: getNextPriority(assessment),
    timeToImprovement: estimateTimeToImprovement(assessment)
  };
}

function getStrongAreas(assessment) {
  const areas = [];
  if (assessment.socialMedia >= 8) areas.push('Social Media');
  if (assessment.website >= 6) areas.push('Website');
  if (assessment.visualContent >= 8) areas.push('Visual Content');
  if (assessment.discoverability >= 6) areas.push('Discoverability');
  if (assessment.digitalSales >= 4) areas.push('Digital Sales');
  return areas;
}

function getDevelopmentAreas(assessment) {
  const areas = [];
  if (assessment.socialMedia < 6) areas.push('Social Media');
  if (assessment.website < 3) areas.push('Website');
  if (assessment.visualContent < 6) areas.push('Visual Content');
  if (assessment.discoverability < 3) areas.push('Discoverability');
  if (assessment.digitalSales < 2) areas.push('Digital Sales');
  return areas;
}

function getNextPriority(assessment) {
  const scores = {
    'Social Media': assessment.socialMedia / 18,
    'Visual Content': assessment.visualContent / 15,
    'Discoverability': assessment.discoverability / 12,
    'Website': assessment.website / 12,
    'Digital Sales': assessment.digitalSales / 8
  };
  
  // Find the area with lowest relative score that's still improvable
  let lowestScore = 1;
  let priority = 'Social Media'; // Default
  
  Object.keys(scores).forEach(area => {
    if (scores[area] < lowestScore && scores[area] < 0.8) { // Don't prioritize areas already at 80%+
      lowestScore = scores[area];
      priority = area;
    }
  });
  
  return priority;
}

function estimateTimeToImprovement(assessment) {
  const readiness = assessReadinessForAdvancement(assessment);
  if (readiness.overall >= 0.7) return '2-4 weeks';
  if (readiness.overall >= 0.4) return '1-2 months';
  return '3-6 months';
}

function getCategoryTarget(category, sector) {
  // Sector-specific targets for different categories
  const targets = {
    'Social Media': 10,
    'Website': 6,
    'Visual Content': 8,
    'Discoverability': 6,
    'Digital Sales': 4
  };
  
  // Adjust for sector-specific needs
  if (sector === 'Audiovisual' && category === 'Website') return 8;
  if (sector === 'Crafts and artisan products' && category === 'Digital Sales') return 6;
  if (sector === 'Cultural heritage sites/museums' && category === 'Discoverability') return 8;
  
  return targets[category] || 6;
}

function generateSectorRecommendations(sector, guidance) {
  const recommendations = [];
  
  // Priority area recommendation
  recommendations.push(`Priority Focus: ${guidance.priorityArea} - affecting ${guidance.commonGaps[guidance.priorityArea] || 0} stakeholders`);
  
  // Ready for advancement
  if (guidance.readyForAdvancement.length > 0) {
    recommendations.push(`${guidance.readyForAdvancement.length} stakeholders ready for advanced training`);
  }
  
  // Basic support needed
  if (guidance.needsBasicSupport.length > 0) {
    recommendations.push(`${guidance.needsBasicSupport.length} stakeholders need foundational digital support`);
  }
  
  // Sector-specific guidance
  const sectorSpecific = {
    'Festivals and cultural events': 'Focus on event promotion cycles and tourism integration',
    'Crafts and artisan products': 'Prioritize product photography and e-commerce capabilities',
    'Music (artists, production, venues, education)': 'Emphasize performance documentation and streaming presence',
    'Audiovisual': 'Develop professional portfolios and client showcase systems'
  };
  
  if (sectorSpecific[sector]) {
    recommendations.push(`Sector Strategy: ${sectorSpecific[sector]}`);
  }
  
  return recommendations;
}

function populateEnhancedTechnicalAnalysis(techTab, analysis) {
  let currentRow = 5;
  applyDefaultSheetFrame(techTab);
  
  // Progression Opportunities Section
  currentRow = populateProgressionOpportunitiesSection(techTab, analysis.progressionOpportunities, currentRow);
  currentRow += 3;
  
  // Contextual Quick Wins Section
  currentRow = populateContextualQuickWinsSection(techTab, analysis.contextualQuickWins, currentRow);
  currentRow += 3;
  
  // Sector-Specific Guidance Section
  currentRow = populateSectorGuidanceSection(techTab, analysis.sectorSpecificGuidance, currentRow);
  currentRow += 3;
  
  // Priority Interventions Section
  currentRow = populatePriorityInterventionsSection(techTab, analysis.priorityInterventions, currentRow);
  currentRow += 3;
  
  // Implementation Roadmap Section
  currentRow = populateImplementationRoadmapSection(techTab, analysis.implementationRoadmap, currentRow);
}

function populateProgressionOpportunitiesSection(techTab, opportunities, startRow) {
  const t = UITheme();
  // Header
  techTab.getRange(startRow - 1, 1, 1, 10).setValues([['PROGRESSION OPPORTUNITIES - Step-by-Step Advancement Pathways', '', '', '', '', '', '', '', '', '']]);
  techTab.getRange(startRow - 1, 1, 1, 10).setBackground(t.primary).setFontColor('white').setFontWeight('bold');
  
  // Column headers
  const headers = ['Stakeholder', 'Category', 'Current Level', 'Next Target', 'Key Actions', 'Effort', 'Impact', 'Timeframe', 'Cost', 'Expected Outcome'];
  techTab.getRange(startRow, 1, 1, 10).setValues([headers]);
  techTab.getRange(startRow, 1, 1, 10).setBackground(t.surfaceAlt).setFontWeight('bold');
  
  // Data
  if (opportunities.length > 0) {
    const opportunityData = opportunities.slice(0, 30).map(opp => [
      opp.stakeholder,
      opp.category,
      `${opp.currentScore} - ${opp.currentDescription}`,
      `${opp.nextLevel} - ${opp.nextDescription}`,
      opp.immediateActions.slice(0, 2).join('; '),
      opp.effort,
      opp.impact,
      opp.timeframe,
      opp.estimatedCost,
      `Move to ${opp.nextDescription} level`
    ]);
    
    techTab.getRange(startRow + 1, 1, opportunityData.length, 10).setValues(opportunityData);
    
    // Color-code by impact
    for (let i = 0; i < opportunityData.length; i++) {
      const impact = opportunityData[i][6];
      const impactCell = techTab.getRange(startRow + 1 + i, 7);
      
      switch (impact) {
        case 'Critical':
          impactCell.setBackground(t.danger).setFontColor('white');
          break;
        case 'High':
          impactCell.setBackground(t.warning).setFontColor('white');
          break;
        case 'Medium':
          impactCell.setBackground(t.warningSurface);
          break;
      }
    }
    
    return startRow + opportunityData.length + 1;
  } else {
    techTab.getRange(startRow + 1, 1).setValue('No progression opportunities identified');
    return startRow + 2;
  }
}

function populateContextualQuickWinsSection(techTab, quickWins, startRow) {
  const t = UITheme();
  // Header
  techTab.getRange(startRow - 1, 1, 1, 9).setValues([['CONTEXTUAL QUICK WINS - High-Impact, Low-Effort Opportunities', '', '', '', '', '', '', '', '']]);
  techTab.getRange(startRow - 1, 1, 1, 9).setBackground(t.success).setFontColor('white').setFontWeight('bold');
  
  // Column headers
  const headers = ['Stakeholder', 'Opportunity', 'Current → Target', 'Key Actions', 'Effort', 'Impact', 'Timeframe', 'Cost', 'Expected Outcome'];
  techTab.getRange(startRow, 1, 1, 9).setValues([headers]);
  techTab.getRange(startRow, 1, 1, 9).setBackground(t.successSurface).setFontWeight('bold');
  
  // Data
  if (quickWins.length > 0) {
    const winData = quickWins.slice(0, 25).map(win => [
      win.stakeholder,
      win.opportunity,
      `${win.currentScore} → ${win.targetScore}`,
      win.specificActions.slice(0, 2).join('; '),
      win.effort,
      win.impact,
      win.timeframe,
      win.cost,
      win.expectedOutcome
    ]);
    
    techTab.getRange(startRow + 1, 1, winData.length, 9).setValues(winData);
    
    return startRow + winData.length + 1;
  } else {
    techTab.getRange(startRow + 1, 1).setValue('No contextual quick wins identified');
    return startRow + 2;
  }
}

function populateSectorGuidanceSection(techTab, sectorGuidance, startRow) {
  const t = UITheme();
  // Header
  techTab.getRange(startRow - 1, 1, 1, 7).setValues([['SECTOR-SPECIFIC GUIDANCE', '', '', '', '', '', '']]);
  techTab.getRange(startRow - 1, 1, 1, 7).setBackground(t.primary).setFontColor('white').setFontWeight('bold');
  
  // Column headers
  const headers = ['Sector', 'Total', 'Priority Area', 'Ready for Advancement', 'Need Basic Support', 'Top Performers', 'Key Recommendations'];
  techTab.getRange(startRow, 1, 1, 7).setValues([headers]);
  techTab.getRange(startRow, 1, 1, 7).setBackground(t.surface).setFontWeight('bold');
  
  // Data
  const sectorData = Object.entries(sectorGuidance).map(([sector, data]) => [
    sector,
    data.total,
    data.priorityArea,
    data.readyForAdvancement.length,
    data.needsBasicSupport.length,
    data.topPerformers.length,
    data.recommendations.slice(0, 2).join('; ')
  ]);
  
  if (sectorData.length > 0) {
    techTab.getRange(startRow + 1, 1, sectorData.length, 7).setValues(sectorData);
    return startRow + sectorData.length + 1;
  } else {
    techTab.getRange(startRow + 1, 1).setValue('No sector guidance available');
    return startRow + 2;
  }
}

function populatePriorityInterventionsSection(techTab, interventions, startRow) {
  const t = UITheme();
  // Header
  techTab.getRange(startRow - 1, 1, 1, 7).setValues([['PRIORITY INTERVENTIONS - Mass Training Opportunities', '', '', '', '', '', '']]);
  techTab.getRange(startRow - 1, 1, 1, 7).setBackground(t.secondary).setFontColor('white').setFontWeight('bold');
  
  // Column headers
  const headers = ['Intervention Type', 'Title', 'Stakeholders', 'Priority', 'Effort', 'Cost', 'Timeframe'];
  techTab.getRange(startRow, 1, 1, 7).setValues([headers]);
  techTab.getRange(startRow, 1, 1, 7).setBackground(t.surface).setFontWeight('bold');
  
  // Data
  if (interventions.length > 0) {
    const interventionData = interventions.map(intervention => [
      intervention.type,
      intervention.title,
      intervention.stakeholdersAffected,
      intervention.priority,
      intervention.effort,
      intervention.cost,
      intervention.timeframe
    ]);
    
    techTab.getRange(startRow + 1, 1, interventionData.length, 7).setValues(interventionData);
    return startRow + interventionData.length + 1;
  } else {
    techTab.getRange(startRow + 1, 1).setValue('No priority interventions identified');
    return startRow + 2;
  }
}

function populateImplementationRoadmapSection(techTab, roadmap, startRow) {
  const t = UITheme();
  // Header
  techTab.getRange(startRow - 1, 1, 1, 4).setValues([[ 'IMPLEMENTATION ROADMAP', '', '', '' ]]);
  techTab.getRange(startRow - 1, 1, 1, 4).setBackground(t.primary).setFontColor('white').setFontWeight('bold');

  // Column headers
  const headers = ['Phase', 'Focus', 'Key Activities', 'Expected Outcomes'];
  techTab.getRange(startRow, 1, 1, 4).setValues([headers]);
  techTab.getRange(startRow, 1, 1, 4).setBackground(t.surfaceAlt).setFontWeight('bold');

  const rows = [
    ['Phase 1: ' + roadmap.phase1.title, roadmap.phase1.focus, (roadmap.phase1.activities || []).join(' | '), (roadmap.phase1.expectedOutcomes || []).join(' | ')],
    ['Phase 2: ' + roadmap.phase2.title, roadmap.phase2.focus, (roadmap.phase2.activities || []).join(' | '), (roadmap.phase2.expectedOutcomes || []).join(' | ')],
    ['Phase 3: ' + roadmap.phase3.title, roadmap.phase3.focus, (roadmap.phase3.activities || []).join(' | '), (roadmap.phase3.expectedOutcomes || []).join(' | ')],
    ['Phase 4: ' + roadmap.phase4.title, roadmap.phase4.focus, (roadmap.phase4.activities || []).join(' | '), (roadmap.phase4.expectedOutcomes || []).join(' | ')]
  ];

  techTab.getRange(startRow + 1, 1, rows.length, 4).setValues(rows);
  return startRow + rows.length + 1;
}

function clearTechnicalContent(techTab) {
  // Preserve header rows 1-4, clear below
  const lastRow = techTab.getMaxRows();
  const lastCol = techTab.getMaxColumns();
  if (lastRow > 4 && lastCol > 0) {
    techTab.getRange(5, 1, lastRow - 4, lastCol).clearContent().clearFormat();
  }
}

function populateEmptyTechnicalAnalysis(techTab) {
  clearTechnicalContent(techTab);
  techTab.getRange('A2').setValue('Enhanced Technical Analysis: ' + new Date().toLocaleString());
  techTab.getRange('A3').setValue('No assessment data found. Complete entries in the Master Assessment tab.');
}

function safeParseFloat(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number' && isFinite(value)) return value;
  const n = parseFloat(String(value).trim());
  return isNaN(n) || !isFinite(n) ? 0 : n;
}