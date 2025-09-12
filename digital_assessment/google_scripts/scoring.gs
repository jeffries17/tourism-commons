/**
 * Gambia Creative Industries Digital Assessment - Final Scoring Reference Script
 * Research-grounded framework with External Assessment (70pts) + Survey Integration (30pts)
 * Balanced weighting: Social Media (18) ≈ Website (12) for realistic Gambian context
 */

function setupScoringReference() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  createScoringReferenceTab(ss);
  createDropdownValidations();
  Logger.log('Final integrated scoring reference system setup complete!');
}

function createScoringReferenceTab(ss) {
  // Create or get the Scoring Reference tab
  let scoringTab = ss.getSheetByName('Scoring Reference');
  if (scoringTab) {
    scoringTab.clear();
  } else {
    scoringTab = ss.insertSheet('Scoring Reference');
  }
  
  // Get all scoring data with final framework
  const scoringData = getFinalScoringData();
  
  // Write the data to the sheet
  const range = scoringTab.getRange(1, 1, scoringData.length, 4);
  range.setValues(scoringData);
  
  // Format the sheet
  formatScoringReference(scoringTab);
  
  // Apply consistent sheet frame
  applyDefaultSheetFrame(scoringTab);
  
  Logger.log('Final Scoring Reference tab created successfully');
}

function getFinalScoringData() {
  return [
    ['GAMBIA CREATIVE INDUSTRIES DIGITAL ASSESSMENT - ENHANCED SCORING REFERENCE', '', '', ''],
    ['External Assessment (70pts) + Survey Integration (30pts) Framework', '', '', ''],
    ['Research Foundation: UNESCO + DESI + ITU | Field-Assessable Criteria', '', '', ''],
    ['Last Updated: ' + new Date().toLocaleDateString(), '', '', ''],
    ['', '', '', ''],
        
    ['EXTERNAL ASSESSMENT - CONSULTANT OBSERVABLE (70 points total)', '', '', ''],
    ['Direct validation using field-assessable criteria', '', '', ''],
    ['', '', '', ''],
        
    ['Social Media Business Presence (0-18 points)', '', '', ''],
    ['Score', 'Description', 'Universal Criteria', 'Field Assessment Notes'],
    [0, 'No business presence', 'No business accounts found', 'Only personal profiles used occasionally for business'],
    [2, 'Basic business setup', 'Has business profile on one platform', 'Contact info visible, posts appear randomly'],
    [4, 'Regular activity emerging', 'Posts 2-3 times per month consistently', 'Uses business features (WhatsApp catalog, Facebook hours)'],
    [6, 'Systematic posting', 'Posts weekly or more', 'Uses consistent hashtags, shares product and behind-scenes'],
    [8, 'Multi-platform coordination', 'Active on 2 platforms with similar content', 'Cross-references platforms, has customer reviews'],
    [10, 'Strategic content planning', 'Different content types: promotional, educational', 'Plans content around events/seasons, engages other businesses'],
    [12, 'Professional management', '3+ platforms with coordinated branding', 'Quick responses (24hr), uses analytics, regular schedule'],
    [14, 'Advanced strategy', 'Collaborates with other businesses/influencers', 'Different content per platform, grown follower base'],
    [16, 'Expert coordination', 'Content calendar evident, professional photos', 'Strategic partnerships, measurable business impact'],
    [18, 'Industry leadership', 'Other businesses share their content', 'Featured by tourism/media, comprehensive ecosystem'],
    ['', '', '', ''],
        
    ['Website Presence & Functionality (0-12 points)', '', '', ''],
    ['Score', 'Description', 'Universal Criteria', 'Field Assessment Notes'],
    [0, 'No website', 'No functioning website found', 'Through search or social media links'],
    [1, 'Under construction/broken', 'Major functionality issues', 'Broken links, images not loading, very outdated'],
    [3, 'Basic static presence', 'Contact info clearly displayed', 'Basic description, some images, loads on mobile'],
    [5, 'Functional business site', 'Services/products clearly described', 'Updated within year, works on mobile, multiple pages'],
    [7, 'Well-maintained site', 'Recent updates evident (within 6 months)', 'Good organization, contact forms work, social links'],
    [9, 'Professional web presence', 'Updated within 3 months', 'Fast loading, professional design, appears in Google search'],
    [12, 'Excellent web presence', 'Comprehensive business showcase', 'E-commerce/booking, updated monthly, strong search presence'],
    ['', '', '', ''],
        
    ['Visual Content Quality (0-15 points)', '', '', ''],
    ['Score', 'Description', 'Universal Criteria', 'Field Assessment Notes'],
    [0, 'No quality visuals', 'Blurry, dark, or shaky images', 'Cannot clearly see product/service/event'],
    [2, 'Basic phone photos', 'In focus and bright enough', 'Basic composition, subject visible, minimal editing'],
    [4, 'Improved photography', 'Good lighting, subject well-positioned', 'Consistent quality, attention to background'],
    [6, 'Thoughtful composition', 'Uses rule of thirds, multiple angles', 'Good backgrounds, basic editing visible'],
    [8, 'Semi-professional elements', 'Consistent style/filter use', 'Professional product shots, brand elements visible'],
    [10, 'Professional standard', 'Studio-quality lighting and composition', 'Professional editing, branded templates, quality video'],
    [12, 'Advanced visual strategy', 'Professional photo shoots evident', 'Consistent brand aesthetic, high-quality video production'],
    [15, 'Exceptional visual content', 'Award-quality photography/videography', 'Innovative approaches, drives significant engagement'],
    ['', '', '', ''],
        
    ['Online Discoverability & Reputation (0-12 points)', '', '', ''],
    ['Score', 'Description', 'Universal Criteria', 'Field Assessment Notes'],
    [0, 'Not discoverable', 'Business name search returns no results', 'Not found in Google search'],
    [1, 'Minimal search presence', 'Appears on page 2-3 of results', 'Basic info scattered, no Google My Business'],
    [3, 'Basic discoverability', 'First page for business name search', 'Basic Google My Business, found on one directory'],
    [5, 'Good visibility', 'Google My Business complete with photos', 'Local search results, 3+ reviews'],
    [7, 'Strong online presence', 'Multiple first-page search results', 'Active Google My Business, 10+ reviews with responses'],
    [9, 'Excellent reputation management', 'Dominates first page search', 'Regular GMB updates, 20+ reviews, professional responses'],
    [12, 'Market-leading discoverability', 'Top results for industry keywords', 'Featured on tourism sites, others link to them'],
    ['', '', '', ''],
        
    ['Digital Sales/Booking Capability (0-8 points)', '', '', ''],
    ['Score', 'Description', 'Universal Criteria', 'Field Assessment Notes'],
    [0, 'No online transactions', 'Cash/in-person only', 'No digital sales capability'],
    [2, 'Basic inquiry system', 'Contact forms, WhatsApp orders', 'Can receive digital inquiries'],
    [4, 'Platform-based sales', 'Facebook/WhatsApp commerce', 'Social media integrated sales'],
    [6, 'Digital payment integration', 'Mobile money, basic e-commerce', 'Multiple payment options'],
    [8, 'Full digital commerce', 'Website + platforms + payments', 'Comprehensive online sales system'],
    ['', '', '', ''],
        
    ['Platform Integration (0-5 points)', '', '', ''],
    ['Score', 'Description', 'Universal Criteria', 'Field Assessment Notes'],
    [0, 'No platform presence', 'Not listed on relevant platforms', 'Missing from tourism/sector platforms'],
    [1, 'Basic platform listing', 'Listed but minimal information', 'VisitTheGambia, TripAdvisor basic presence'],
    [3, 'Good platform integration', 'Active on relevant platforms', 'Updated listings, some optimization'],
    [5, 'Excellent platform strategy', 'Optimized across all relevant platforms', 'Professional platform management'],
    ['', '', '', ''],
        
    ['SURVEY-BASED ASSESSMENT (30 points total)', '', '', ''],
    ['Self-reported capacity, challenges, and context', '', '', ''],
    ['', '', '', ''],
        
    ['Digital Comfort & Skills (0-8 points)', '', '', ''],
    ['Score', 'Description', 'Survey Integration', 'Assessment Notes'],
    [0, 'Not comfortable with digital tools', 'Q3.1: "Not comfortable" + Q3.4: No analytics', 'Needs basic digital literacy training'],
    [2, 'Limited digital comfort', 'Q3.1: "Limited comfort"', 'Basic digital skills, regular support needed'],
    [5, 'Somewhat comfortable', 'Q3.1: "Somewhat comfortable"', 'Good basic skills, occasional help'],
    [8, 'Very comfortable + analytics', 'Q3.1: "Very comfortable" + Q3.4: Regular tracking', 'Advanced digital skills, strategic usage'],
    ['', '', '', ''],
        
    ['Content Strategy Consistency (0-8 points)', '', '', ''],
    ['Score', 'Description', 'Survey Integration', 'Assessment Notes'],
    [0, 'No regular posting', 'Q2.3: "Never"', 'No content strategy'],
    [2, 'Irregular posting', 'Q2.3: "Rarely"', 'Sporadic content creation'],
    [4, 'Monthly posting', 'Q2.3: "Monthly"', 'Some content planning'],
    [6, 'Weekly posting', 'Q2.3: "Weekly"', 'Regular content schedule'],
    [8, 'Daily posting', 'Q2.3: "Daily"', 'Professional content calendar'],
    ['', '', '', ''],
        
    ['Platform Usage Breadth (0-7 points)', '', '', ''],
    ['Score', 'Description', 'Survey Integration', 'Assessment Notes'],
    [0, 'No platforms used', 'Q2.2: "None"', 'No social media presence'],
    [1, 'Single platform', 'Q2.2: 1 platform selected', 'Limited digital reach'],
    [3, 'Two platforms', 'Q2.2: 2 platforms selected', 'Good digital presence'],
    [5, 'Three platforms', 'Q2.2: 3 platforms selected', 'Strong multi-platform strategy'],
    [7, 'Four or more platforms', 'Q2.2: 4+ platforms selected', 'Comprehensive digital strategy'],
    ['', '', '', ''],
        
    ['Investment Capacity Indicator (0-4 points)', '', '', ''],
    ['Score', 'Description', 'Survey Integration', 'Assessment Notes'],
    [0, 'Cannot invest money', 'Q5.2: "Cannot invest money"', 'Resource constraints significant'],
    [1, 'Less than D1,000/year', 'Q5.2: "Less than D1,000"', 'Very limited investment capacity'],
    [2, 'D1,000-5,000/year', 'Q5.2: "D1,000-5,000"', 'Moderate investment capacity'],
    [3, 'D5,000-15,000/year', 'Q5.2: "D5,000-15,000"', 'Good investment capacity'],
    [4, 'More than D15,000/year', 'Q5.2: "More than D15,000"', 'Strong investment capacity'],
    ['', '', '', ''],
        
    ['Digital Challenge Severity (0-3 points)', '', '', ''],
    ['Score', 'Description', 'Survey Integration', 'Assessment Notes'],
    [0, 'Major structural barriers', 'Q4.1: "Poor internet" or "Too expensive"', 'Infrastructure/cost constraints'],
    [1, 'Significant skill gaps', 'Q4.1: "Don\'t know how" or "Language barriers"', 'Training needs priority'],
    [2, 'Minor barriers', 'Q4.1: "Don\'t have time" or "Don\'t see value"', 'Motivation/awareness issues'],
    [3, 'No significant challenges', 'Q4.1: Other minor issues', 'Ready for advanced support'],
    ['', '', '', ''],
        
    ['FIELD ASSESSMENT GUIDANCE', '', '', ''],
    ['', '', '', ''],
        
    ['Assessment Implementation Notes', '', '', ''],
    ['• Use Observable Evidence: Look for specific, visible elements', '', '', ''],
    ['• Check Multiple Touchpoints: Verify consistency across platforms', '', '', ''],
    ['• Test Functionality: Click links, test contact forms, check mobile', '', '', ''],
    ['• Document Examples: Note specific evidence supporting scores', '', '', ''],
    ['• Consider Context: Rural businesses may have infrastructure constraints', '', '', ''],
    ['', '', '', ''],
        
    ['Common Assessment Mistakes to Avoid', '', '', ''],
    ['• Don\'t assume technical complexity equals quality', '', '', ''],
    ['• Don\'t penalize for platform choices (WhatsApp-only can be effective)', '', '', ''],
    ['• Don\'t require expensive equipment for higher scores', '', '', ''],
    ['• Don\'t conflate personal social media with business strategy', '', '', ''],
    ['• Don\'t apply uniform standards across different sectors', '', '', ''],
    ['', '', '', ''],
        
    ['Validation Questions for Borderline Scores', '', '', ''],
    ['• Can customers easily find and contact this business online?', '', '', ''],
    ['• Is digital presence helping or hindering business growth?', '', '', ''],
    ['• Are customers responding positively to online content?', '', '', ''],
    ['• Does online presence accurately represent business capabilities?', '', '', ''],
    ['• Can they reach target audience through current digital channels?', '', '', ''],
    ['', '', '', ''],
        
    ['INTEGRATED SCORING CALCULATION', '', '', ''],
    ['External Total (0-70) + Survey Total (0-30) = Combined Score (0-100)', '', '', ''],
    ['', '', '', ''],
        
    ['DIGITAL MATURITY CLASSIFICATION', '', '', ''],
    ['• Expert Level: 80-100 points | Strong external + high capacity', '', '', ''],
    ['• Advanced Level: 60-79 points | Good external + moderate capacity', '', '', ''],
    ['• Intermediate Level: 40-59 points | Developing performance + basic capacity', '', '', ''],
    ['• Basic Level: 0-39 points | Limited performance + capacity constraints', '', '', '']
  ];
}

function formatScoringReference(sheet) {
  const t = UITheme();
  // Set column widths
  sheet.setColumnWidth(1, 80);  // Score column
  sheet.setColumnWidth(2, 250); // Description column
  sheet.setColumnWidth(3, 300); // Universal Criteria column
  sheet.setColumnWidth(4, 250); // Survey Integration/Assessment Notes column
  
  // Get all header rows (main sections)
  const headerRows = [1, 6, 9, 17, 24, 32, 38, 44, 49, 52, 58, 64, 70, 76, 82, 85, 89, 93, 97, 99, 103, 107, 111, 115, 127];
  
  // Format main sections
  headerRows.forEach(row => {
    const range = sheet.getRange(row, 1, 1, 4);
    range.setBackground(t.primary)
         .setFontColor('white')
         .setFontWeight('bold')
         .setFontSize(12);
  });
  
  // Format main title and subtitle
  sheet.getRange('A1:D1')
       .setFontSize(14)
       .setHorizontalAlignment('center');
  
  sheet.getRange('A2:D3')
       .setFontSize(11)
       .setHorizontalAlignment('center')
       .setFontStyle('italic');
  
  // Format subheader rows (Score, Description, etc.)
  const subHeaderRows = [10, 18, 25, 33, 39, 45, 53, 59, 65, 71, 77];
  subHeaderRows.forEach(row => {
    const range = sheet.getRange(row, 1, 1, 4);
    range.setBackground(t.surface)
         .setFontWeight('bold');
  });
  
  // Add borders to all data sections
  const dataSections = [
    'A10:D15', 'A18:D23', 'A25:D30', 'A33:D37', 'A39:D43', 'A45:D48',
    'A53:D56', 'A59:D63', 'A65:D69', 'A71:D75', 'A77:D80'
  ];
  
  dataSections.forEach(section => {
    sheet.getRange(section).setBorder(true, true, true, true, true, true);
  });
  
  // Color-code the different sections
  sheet.getRange('A6:D50').setBackground('#f8f9fa'); // External Assessment
  sheet.getRange('A52:D81').setBackground(t.successSurface); // Survey Assessment
  sheet.getRange('A82:D98').setBackground('#fff3e0'); // Integration Framework
  sheet.getRange('A99:D115').setBackground(t.accentSurface); // Correlation Analysis
  sheet.getRange('A116:D130').setBackground(t.surfaceAlt); // Bonus Points
  
  // Freeze the first four rows
  sheet.setFrozenRows(4);
}

function createDropdownValidations() {
  // Backward-compatible: apply to Master Assessment by default
  createDropdownValidationsForSheet('Master Assessment');
}

// Generalized validations for any assessment sheet with the standard schema
function createDropdownValidationsForSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    Logger.log(`${sheetName} tab not found`);
    return;
  }
  
  const dropdownData = getFinalDropdownOptions();
  const lastRow = 500;
  
  // Sector and Region
  const sectorRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(dropdownData.sectors)
    .build();
  sheet.getRange(2, 2, lastRow, 1).setDataValidation(sectorRule);
  
  const regionRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(dropdownData.regions)
    .build();
  sheet.getRange(2, 3, lastRow, 1).setDataValidation(regionRule);
  
  // External
  createScoringValidation(sheet, 4, dropdownData.socialMediaScores, lastRow);
  createScoringValidation(sheet, 5, dropdownData.websiteScores, lastRow);
  createScoringValidation(sheet, 6, dropdownData.visualContentScores, lastRow);
  createScoringValidation(sheet, 7, dropdownData.discoverabilityScores, lastRow);
  createScoringValidation(sheet, 8, dropdownData.digitalSalesScores, lastRow);
  createScoringValidation(sheet, 9, dropdownData.platformIntegrationScores, lastRow);
  
  // Survey
  createScoringValidation(sheet, 10, dropdownData.digitalComfortScores, lastRow);
  createScoringValidation(sheet, 11, dropdownData.contentStrategyScores, lastRow);
  createScoringValidation(sheet, 12, dropdownData.platformBreadthScores, lastRow);
  createScoringValidation(sheet, 13, dropdownData.investmentCapacityScores, lastRow);
  createScoringValidation(sheet, 14, dropdownData.challengeSeverityScores, lastRow);
  
  Logger.log(`Dropdown validations applied to ${sheetName}`);
}

// Convenience function specific to Tourism Assessment
function createTourismDropdownValidations() {
  createDropdownValidationsForSheet('Tourism Assessment');
}

function getFinalDropdownOptions() {
  return {
    sectors: [
      'Festivals and cultural events',
      'Audiovisual (film, photography, TV, videography)',
      'Marketing/advertising/publishing', 
      'Crafts and artisan products',
      'Fashion & Design',
      'Music (artists, production, venues, education)',
      'Performing and visual arts',
      'Cultural heritage sites/museums'
    ],
        
    regions: [
      'Greater Banjul Area',
      'West Coast Region',
      'North Bank Region', 
      'Lower River Region',
      'Central River Region',
      'Upper River Region'
    ],
        
    // UPDATED EXTERNAL ASSESSMENT scoring options with all intermediate levels
    socialMediaScores: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18],
    websiteScores: [0, 1, 3, 5, 7, 9, 12],
    visualContentScores: [0, 2, 4, 6, 8, 10, 12, 15],
    discoverabilityScores: [0, 1, 3, 5, 7, 9, 12],
    digitalSalesScores: [0, 2, 4, 6, 8],
    platformIntegrationScores: [0, 1, 3, 5],
        
    // SURVEY ASSESSMENT scoring options (unchanged)
    digitalComfortScores: [0, 2, 5, 8],
    contentStrategyScores: [0, 2, 4, 6, 8],
    platformBreadthScores: [0, 1, 3, 5, 7],
    investmentCapacityScores: [0, 1, 2, 3, 4],
    challengeSeverityScores: [0, 1, 2, 3]
  };
}

function createScoringValidation(sheet, column, scores, lastRow) {
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(scores.map(String))
    .build();
  sheet.getRange(2, column, lastRow, 1).setDataValidation(rule);
}

// Updated calculation functions for new structure
function updateCalculationFormulas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterTab = ss.getSheetByName('Master Assessment');
  
  if (!masterTab) {
    Logger.log('Master Assessment tab not found');
    return;
  }
  
  // Clear existing formulas first
  const lastRow = 500;
  masterTab.getRange(`O2:S${lastRow}`).clearContent();
  masterTab.getRange(`V2:V${lastRow}`).clearContent();
  
  // External Assessment Total (column O) - Sum D through I
  const externalTotalFormula = '=IF(COUNTA(D2:I2)>0,SUM(D2:I2),"")';
  masterTab.getRange('O2').setFormula(externalTotalFormula);
  
  // Survey Assessment Total (column P) - Sum J through N  
  const surveyTotalFormula = '=IF(COUNTA(J2:N2)>0,SUM(J2:N2),"")';
  masterTab.getRange('P2').setFormula(surveyTotalFormula);
  
  // Combined Total Score (column Q) - External + Survey
  const combinedTotalFormula = '=IF(AND(O2<>"",P2<>""),O2+P2,IF(O2<>"",O2,""))';
  masterTab.getRange('Q2').setFormula(combinedTotalFormula);
  
  // Digital Maturity Level (column R) - Five-level scale
  const maturityFormula = `=IF(Q2="","",IF(Q2>=80,"Expert",IF(Q2>=60,"Advanced",IF(Q2>=40,"Intermediate",IF(Q2>=20,"Emerging","Absent")))))`;
  masterTab.getRange('R2').setFormula(maturityFormula);
  
  // Survey-External Correlation (column S) - Simple difference indicator
  const correlationFormula = '=IF(AND(O2<>"",P2<>""),ABS(O2/70*100-P2/30*100),"")';
  masterTab.getRange('S2').setFormula(correlationFormula);
  
  // Assessment date formula (column V)
  masterTab.getRange('V2').setFormula('=IF(A2<>"",TODAY(),"")');
  
  // Copy formulas down for multiple rows
  masterTab.getRange('O2:S2').copyTo(masterTab.getRange(`O2:S${lastRow}`));
  masterTab.getRange('V2').copyTo(masterTab.getRange(`V2:V${lastRow}`));
  
  Logger.log('Final calculation formulas applied successfully');
  Logger.log('External: D-I (70pts) | Survey: J-N (30pts) | Combined: O+P (100pts)');
}

// Updated statistics function for new structure
function getScoringStatistics() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterTab = ss.getSheetByName('Master Assessment');
  
  if (!masterTab) {
    Logger.log('Master Assessment tab not found');
    return;
  }
  
  const data = masterTab.getDataRange().getValues();
  const stats = {
    totalAssessments: 0,
    averageScores: {
      external: 0,
      survey: 0,
      combined: 0
    },
    maturityDistribution: {
      'Expert': 0,
      'Advanced': 0, 
      'Intermediate': 0,
      'Basic': 0
    },
    sectorBreakdown: {},
    correlationAnalysis: {
      highExternalLowSurvey: 0,
      lowExternalHighSurvey: 0,
      balanced: 0
    }
  };
  
  let totalExternal = 0, totalSurvey = 0, totalCombined = 0;
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    // Check if row has data (stakeholder name exists)
    if (row[0] && row[0].trim() !== '') {
      stats.totalAssessments++;
      
      // Get scores (updated column positions)
      const sector = row[1];
      const externalScore = parseFloat(row[14]) || 0; // Column O
      const surveyScore = parseFloat(row[15]) || 0; // Column P
      const combinedScore = parseFloat(row[16]) || 0; // Column Q
      const maturityLevel = row[17] || 'Basic'; // Column R
      const correlation = parseFloat(row[18]) || 0; // Column S
      
      // Accumulate scores
      totalExternal += externalScore;
      totalSurvey += surveyScore;
      totalCombined += combinedScore;
      
      // Count maturity distribution
      if (maturityLevel && stats.maturityDistribution[maturityLevel] !== undefined) {
        stats.maturityDistribution[maturityLevel]++;
      }
      
      // Correlation analysis
      if (correlation < 10) stats.correlationAnalysis.balanced++;
      else if (externalScore > surveyScore * 2) stats.correlationAnalysis.highExternalLowSurvey++;
      else if (surveyScore * 2 > externalScore) stats.correlationAnalysis.lowExternalHighSurvey++;
      
      // Track sector breakdown
      if (sector) {
        if (!stats.sectorBreakdown[sector]) {
          stats.sectorBreakdown[sector] = {
            count: 0,
            totalExternal: 0,
            totalSurvey: 0,
            totalCombined: 0,
            averageExternal: 0,
            averageSurvey: 0,
            averageCombined: 0
          };
        }
        stats.sectorBreakdown[sector].count++;
        stats.sectorBreakdown[sector].totalExternal += externalScore;
        stats.sectorBreakdown[sector].totalSurvey += surveyScore;
        stats.sectorBreakdown[sector].totalCombined += combinedScore;
      }
    }
  }
  
  // Calculate averages
  if (stats.totalAssessments > 0) {
    stats.averageScores.external = Math.round(totalExternal / stats.totalAssessments * 10) / 10;
    stats.averageScores.survey = Math.round(totalSurvey / stats.totalAssessments * 10) / 10;
    stats.averageScores.combined = Math.round(totalCombined / stats.totalAssessments * 10) / 10;
  }
  
  // Calculate sector averages
  Object.keys(stats.sectorBreakdown).forEach(sector => {
    const sectorData = stats.sectorBreakdown[sector];
    if (sectorData.count > 0) {
      sectorData.averageExternal = Math.round(sectorData.totalExternal / sectorData.count * 10) / 10;
      sectorData.averageSurvey = Math.round(sectorData.totalSurvey / sectorData.count * 10) / 10;
      sectorData.averageCombined = Math.round(sectorData.totalCombined / sectorData.count * 10) / 10;
    }
  });
  
  Logger.log('Assessment Statistics:');
  Logger.log(`Total Assessments: ${stats.totalAssessments}`);
  Logger.log(`Average External: ${stats.averageScores.external}/70`);
  Logger.log(`Average Survey: ${stats.averageScores.survey}/30`);
  Logger.log(`Average Combined: ${stats.averageScores.combined}/100`);
  Logger.log('Maturity Distribution:', stats.maturityDistribution);
  Logger.log('Correlation Analysis:', stats.correlationAnalysis);
  
  return stats;
}

// Main function to set up everything
function initializeFinalScoringSystem() {
  setupScoringReference();
  updateCalculationFormulas();
  getScoringStatistics();
  
  Logger.log('Final integrated scoring system fully initialized!');
  Logger.log('Framework: External (70pts) + Survey (30pts) = 100pts total');
  Logger.log('Social Media (18) ≈ Website (12) balance optimized for Gambian context');
  Logger.log('Ready for phased assessment: External first, Survey integration later');
}