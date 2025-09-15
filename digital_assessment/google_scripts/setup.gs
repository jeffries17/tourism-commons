/**
 * Gambia Creative Industries Digital Assessment - Updated Setup Script with Opportunities
 * Creates structure for External Assessment (70pts) + Survey Integration (30pts) framework
 * Includes opportunities columns starting at column AJ
 */

function setupAssessmentSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create the main tabs structure with new framework
  createMasterAssessmentTab(ss);
  createTourismAssessmentTab(ss);
  createRegionalAssessmentTab(ss);
  createDigitalReadinessMatrixTab(ss);
  createTechnicalAnalysisTab(ss);
  createBaselineMetricsTab(ss);
  
  Logger.log('Updated assessment system structure created with opportunities columns and regional analysis!');
  Logger.log('Framework: External (70pts) + Survey (30pts) = 100pts total');
}

function createMasterAssessmentTab(ss) {
  // Create or get the Master Assessment tab
  let masterTab = ss.getSheetByName('Master Assessment');
  if (masterTab) {
    masterTab.clear();
  } else {
    masterTab = ss.insertSheet('Master Assessment');
  }
  
  // Set up the headers with new framework structure + opportunities at AJ
  const headers = [
    'Stakeholder Name',
    'Sector',
    'Region',
    
    // EXTERNAL ASSESSMENT (70 points) - Consultant Observable
    'Social Media Business (0-18)',
    'Website Presence (0-12)', 
    'Visual Content Quality (0-15)',
    'Online Discoverability (0-12)',
    'Digital Sales/Booking (0-8)',
    'Platform Integration (0-5)',
    
    // SURVEY ASSESSMENT (30 points) - Self-Reported  
    'Digital Comfort & Skills (0-8)',
    'Content Strategy (0-8)',
    'Platform Usage Breadth (0-7)',
    'Investment Capacity (0-4)',
    'Challenge Severity (0-3)',
    
    // CALCULATED TOTALS
    'EXTERNAL TOTAL (0-70)',
    'SURVEY TOTAL (0-30)', 
    'COMBINED SCORE (0-100)',
    'DIGITAL MATURITY LEVEL',
    'SURVEY-EXTERNAL CORRELATION',
    
    // SECTOR BONUS
    'SECTOR BONUS POINTS (0-7)',
    
    // META DATA
    'Contact Info',
    'Assessment Date',
    'Notes',
    'Follow-up Required',
    
    // JUSTIFICATIONS (evidence notes per external category)
    'Social Media Justification',
    'Website Functionality',
    'Visual Content Quality',
    'Online Discoverability',
    'Digital Sales/Booking',
    'Platform Integration',
    
    // LINKS (presence URLs)
    'Website',
    'Facebook',
    'Instagram',
    'Tripadvisor',
    'YouTube',
    
    // SOCIAL MEDIA METRICS (followers/reviews tracking)
    'Facebook Followers',
    'Instagram Followers', 
    'Tripadvisor Reviews',
    'YouTube Subscribers',
    
    // OPPORTUNITIES COLUMNS (starting at column AM - column 39)
    'Social Media Opportunities',
    'Website Opportunities', 
    'Visual Content Opportunities',
    'Online Discoverability Opportunities',
    'Digital Sales/Booking Opportunities',
    'Platform Integration Opportunities',
    'Digital Comfort & Skills Opportunities',
    'Content Strategy Opportunities',
    'Platform Usage Breadth Opportunities',
    'Investment Capacity Opportunities',
    'Challenge Severity Opportunities'
  ];
  
  // Write headers
  const headerRange = masterTab.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  
  // Format headers with color coding
  formatMasterAssessmentHeaders(masterTab, headers.length);
  
  // Set column widths
  setMasterAssessmentColumnWidths(masterTab);
  
  Logger.log('Master Assessment tab structure created with opportunities columns at AJ');
}

function formatMasterAssessmentHeaders(sheet, numColumns) {
  const headerRange = sheet.getRange(1, 1, 1, numColumns);
  
  // Basic header formatting
  headerRange.setBackground('#34a853')
            .setFontColor('white')
            .setFontWeight('bold')
            .setFontSize(10)
            .setWrap(true)
            .setVerticalAlignment('middle');
  
  // Color-code different sections for easy navigation
  
  // Core info (A-C): Stakeholder, Sector, Region
  sheet.getRange(1, 1, 1, 3).setBackground('#1c4587'); // Dark blue
  
  // External Assessment (D-I): Social Media through Platform Integration
  sheet.getRange(1, 4, 1, 6).setBackground('#2d7d32'); // Dark green
  
  // Survey Assessment (J-N): Digital Comfort through Challenge Severity  
  sheet.getRange(1, 10, 1, 5).setBackground('#f57c00'); // Orange
  
  // Calculated Totals (O-S): External Total through Correlation
  sheet.getRange(1, 15, 1, 5).setBackground('#7b1fa2'); // Purple
  
  // Sector Bonus (T)
  sheet.getRange(1, 20, 1, 1).setBackground('#c62828'); // Red
  
  // Meta data (U-X): Contact through Follow-up
  sheet.getRange(1, 21, 1, 4).setBackground('#37474f'); // Blue gray

  // Justifications (Y-AD): Evidence notes
  if (numColumns >= 30) {
    sheet.getRange(1, 25, 1, 6).setBackground('#607d8b'); // Gray blue
  }
  
  // Links (AE-AI): Website & social links
  if (numColumns >= 35) {
    sheet.getRange(1, 31, 1, 5).setBackground('#546e7a'); // Darker gray blue
  }
  
  // Social Media Metrics (AJ-AM): Followers/reviews tracking
  if (numColumns >= 39) {
    sheet.getRange(1, 36, 1, 4).setBackground('#795548'); // Brown for metrics
  }
  
  // Opportunities Columns (AN-AX): 11 opportunity columns starting at column 40
  if (numColumns >= 50) {
    sheet.getRange(1, 40, 1, 11).setBackground('#ff6f00'); // Deep orange for opportunities
  }
}

function setMasterAssessmentColumnWidths(sheet) {
  // Set appropriate column widths for new structure
  const columnWidths = [
    200, // A: Stakeholder Name
    150, // B: Sector  
    120, // C: Region
    
    // External Assessment
    100, // D: Social Media Business (0-18)
    100, // E: Website Presence (0-12)
    100, // F: Visual Content Quality (0-15)
    100, // G: Online Discoverability (0-12)
    100, // H: Digital Sales/Booking (0-8)
    100, // I: Platform Integration (0-5)
    
    // Survey Assessment
    100, // J: Digital Comfort & Skills (0-8)
    100, // K: Content Strategy (0-8)
    100, // L: Platform Usage Breadth (0-7)
    100, // M: Investment Capacity (0-4)
    100, // N: Challenge Severity (0-3)
    
    // Calculated Totals
    120, // O: EXTERNAL TOTAL (0-70)
    120, // P: SURVEY TOTAL (0-30)
    120, // Q: COMBINED SCORE (0-100)
    150, // R: DIGITAL MATURITY LEVEL
    120, // S: SURVEY-EXTERNAL CORRELATION
    
    // Sector Bonus
    120, // T: SECTOR BONUS POINTS (0-7)
    
    // Meta Data
    180, // U: Contact Info
    120, // V: Assessment Date
    200, // W: Notes
    120, // X: Follow-up Required

    // Justifications (evidence)
    220, // Y: Social Media Justification
    220, // Z: Website Functionality
    220, // AA: Visual Content Quality
    220, // AB: Online Discoverability
    220, // AC: Digital Sales/Booking
    220, // AD: Platform Integration

    // Links (presence URLs)
    180, // AE: Website
    150, // AF: Facebook
    150, // AG: Instagram
    150, // AH: Tripadvisor
    150, // AI: YouTube
    
    // Social Media Metrics (followers/reviews tracking)
    120, // AJ: Facebook Followers
    120, // AK: Instagram Followers
    120, // AL: Tripadvisor Reviews
    120, // AM: YouTube Subscribers
    
    // Opportunities Columns (starting at AN - column 40)
    220, // AN: Social Media Opportunities
    220, // AO: Website Opportunities
    220, // AP: Visual Content Opportunities
    220, // AQ: Online Discoverability Opportunities
    220, // AR: Digital Sales/Booking Opportunities
    220, // AS: Platform Integration Opportunities
    220, // AT: Digital Comfort & Skills Opportunities
    220, // AU: Content Strategy Opportunities
    220, // AV: Platform Usage Breadth Opportunities
    220, // AW: Investment Capacity Opportunities
    220  // AX: Challenge Severity Opportunities
  ];
  
  columnWidths.forEach((width, index) => {
    sheet.setColumnWidth(index + 1, width);
  });
}

function setRegionalAssessmentColumnWidths(sheet) {
  // Set appropriate column widths for regional assessment (External Assessment only)
  const columnWidths = [
    200, // A: Stakeholder Name
    150, // B: Sector  
    120, // C: Country
    
    // External Assessment
    100, // D: Social Media Business (0-18)
    100, // E: Website Presence (0-12)
    100, // F: Visual Content Quality (0-15)
    100, // G: Online Discoverability (0-12)
    100, // H: Digital Sales/Booking (0-8)
    100, // I: Platform Integration (0-5)
    
    // Calculated Totals (External only)
    120, // J: EXTERNAL TOTAL (0-70)
    150, // K: DIGITAL MATURITY LEVEL
    
    // Sector Bonus
    120, // L: SECTOR BONUS POINTS (0-7)
    
    // Meta Data
    180, // M: Contact Info
    120, // N: Assessment Date
    200, // O: Notes
    120, // P: Follow-up Required

    // Justifications (evidence)
    220, // Q: Social Media Justification
    220, // R: Website Functionality
    220, // S: Visual Content Quality
    220, // T: Online Discoverability
    220, // U: Digital Sales/Booking
    220, // V: Platform Integration

    // Links (presence URLs)
    180, // W: Website
    150, // X: Facebook
    150, // Y: Instagram
    150, // Z: Tripadvisor
    150, // AA: YouTube
    
    // Social Media Metrics (followers/reviews tracking)
    120, // AB: Facebook Followers
    120, // AC: Instagram Followers
    120, // AD: Tripadvisor Reviews
    120, // AE: YouTube Subscribers
    
    // Opportunities Columns (External only)
    220, // AF: Social Media Opportunities
    220, // AG: Website Opportunities
    220, // AH: Visual Content Opportunities
    220, // AI: Online Discoverability Opportunities
    220, // AJ: Digital Sales/Booking Opportunities
    220  // AK: Platform Integration Opportunities
  ];
  
  columnWidths.forEach((width, index) => {
    sheet.setColumnWidth(index + 1, width);
  });
}

// Tourism Assessment tab with identical schema to Master Assessment (including opportunities)
function createTourismAssessmentTab(ss) {
  // Allow direct execution without params
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  
  // Create or get the Tourism Assessment tab
  let tourismTab = ss.getSheetByName('Tourism Assessment');
  if (tourismTab) {
    tourismTab.clear();
  } else {
    tourismTab = ss.insertSheet('Tourism Assessment');
  }
  
  // Reuse the same headers as Master Assessment to ensure schema parity (including opportunities)
  const headers = [
    'Stakeholder Name',
    'Sector',
    'Region',
    
    // EXTERNAL ASSESSMENT (70 points)
    'Social Media Business (0-18)',
    'Website Presence (0-12)', 
    'Visual Content Quality (0-15)',
    'Online Discoverability (0-12)',
    'Digital Sales/Booking (0-8)',
    'Platform Integration (0-5)',
    
    // SURVEY ASSESSMENT (30 points)
    'Digital Comfort & Skills (0-8)',
    'Content Strategy (0-8)',
    'Platform Usage Breadth (0-7)',
    'Investment Capacity (0-4)',
    'Challenge Severity (0-3)',
    
    // CALCULATED TOTALS
    'EXTERNAL TOTAL (0-70)',
    'SURVEY TOTAL (0-30)', 
    'COMBINED SCORE (0-100)',
    'DIGITAL MATURITY LEVEL',
    'SURVEY-EXTERNAL CORRELATION',
    
    // SECTOR BONUS
    'SECTOR BONUS POINTS (0-7)',
    
    // META DATA
    'Contact Info',
    'Assessment Date',
    'Notes',
    'Follow-up Required',
    
    // JUSTIFICATIONS
    'Social Media Justification',
    'Website Functionality',
    'Visual Content Quality',
    'Online Discoverability',
    'Digital Sales/Booking',
    'Platform Integration',
    
    // LINKS
    'Website',
    'Facebook',
    'Instagram',
    'Tripadvisor',
    'YouTube',
    
    // SOCIAL MEDIA METRICS (followers/reviews tracking)
    'Facebook Followers',
    'Instagram Followers', 
    'Tripadvisor Reviews',
    'YouTube Subscribers',
    
    // OPPORTUNITIES COLUMNS (starting at column AM)
    'Social Media Opportunities',
    'Website Opportunities', 
    'Visual Content Opportunities',
    'Online Discoverability Opportunities',
    'Digital Sales/Booking Opportunities',
    'Platform Integration Opportunities',
    'Digital Comfort & Skills Opportunities',
    'Content Strategy Opportunities',
    'Platform Usage Breadth Opportunities',
    'Investment Capacity Opportunities',
    'Challenge Severity Opportunities'
  ];
  
  const headerRange = tourismTab.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  
  // Reuse formatting helpers
  formatMasterAssessmentHeaders(tourismTab, headers.length);
  setMasterAssessmentColumnWidths(tourismTab);
  
  // Apply validations and formulas automatically
  try {
    if (typeof createDropdownValidationsForSheet === 'function') {
      createDropdownValidationsForSheet('Tourism Assessment');
    }
  } catch (e) {
    Logger.log('Tourism validations not applied: ' + e);
  }
  try {
    addTourismCalculationFormulas();
  } catch (e2) {
    Logger.log('Tourism formulas not applied: ' + e2);
  }
  
  Logger.log('Tourism Assessment tab created with identical schema including opportunities at AJ');
}

function createDigitalReadinessMatrixTab(ss) {
  let matrixTab = ss.getSheetByName('Digital Readiness Matrix');
  if (matrixTab) {
    matrixTab.clear();
  } else {
    matrixTab = ss.insertSheet('Digital Readiness Matrix');
  }
  
  // Create basic structure - will be populated by matrix generation script
  const headers = [
    ['DIGITAL READINESS MATRIX - AUTO-UPDATED FROM MASTER ASSESSMENT'],
    [''],
    ['SUMMARY BY SECTOR'],
    ['Sector', 'Total Count', 'Expert (80+)', 'Advanced (60-79)', 'Intermediate (40-59)', 'Basic (0-39)', 'Avg Score', 'Avg External', 'Avg Survey'],
    [''],
    ['SUMMARY BY REGION'], 
    ['Region', 'Total Count', 'Expert (80+)', 'Advanced (60-79)', 'Intermediate (40-59)', 'Basic (0-39)', 'Avg Score', 'Avg External', 'Avg Survey'],
    [''],
    ['DETAILED BREAKDOWN'],
    ['Stakeholder', 'Sector', 'Region', 'External Score', 'Survey Score', 'Total Score', 'Maturity Level', 'Key Strengths', 'Priority Areas']
  ];
  
  headers.forEach((row, index) => {
    const range = matrixTab.getRange(index + 1, 1, 1, row.length);
    range.setValues([row]);
  });
  
  // Format headers
  matrixTab.getRange('A1:I1').setBackground('#1c4587').setFontColor('white').setFontWeight('bold');
  matrixTab.getRange('A3:I3').setBackground('#2d7d32').setFontColor('white').setFontWeight('bold');
  matrixTab.getRange('A6:I6').setBackground('#f57c00').setFontColor('white').setFontWeight('bold');
  matrixTab.getRange('A9:I9').setBackground('#7b1fa2').setFontColor('white').setFontWeight('bold');
  
  Logger.log('Digital Readiness Matrix tab structure created');
}

function createTechnicalAnalysisTab(ss) {
  let techTab = ss.getSheetByName('Technical Analysis');
  if (techTab) {
    techTab.clear();
  } else {
    techTab = ss.insertSheet('Technical Analysis');
  }
  
  // Create structure for technical performance analysis
  const headers = [
    ['TECHNICAL PERFORMANCE ANALYSIS - AUTO-UPDATED'],
    [''],
    ['CRITICAL ISSUES (External Score 0-20)'],
    ['Stakeholder', 'Sector', 'Issue Type', 'Current Score', 'Max Score', 'Impact Level', 'Fix Complexity', 'Priority'],
    [''],
    ['QUICK WINS (High Impact, Low Effort)'],
    ['Stakeholder', 'Sector', 'Improvement Area', 'Current Score', 'Potential Score', 'Effort Required', 'ROI', 'Instructions'],
    [''],
    ['SURVEY-EXTERNAL CORRELATION ANALYSIS'],
    ['Stakeholder', 'Sector', 'External Score', 'Survey Score', 'Correlation Gap', 'Intervention Type', 'Recommended Action'],
    [''],
    ['PERFORMANCE BENCHMARKS BY SECTOR'],
    ['Sector', 'Avg External Score', 'Avg Survey Score', 'Top External Performer', 'Highest Potential', 'Priority Focus Area']
  ];
  
  headers.forEach((row, index) => {
    const range = techTab.getRange(index + 1, 1, 1, row.length);
    range.setValues([row]);
  });
  
  Logger.log('Technical Analysis tab structure created');
}

function createBaselineMetricsTab(ss) {
  let metricsTab = ss.getSheetByName('Baseline Metrics');
  if (metricsTab) {
    metricsTab.clear();
  } else {
    metricsTab = ss.insertSheet('Baseline Metrics');
  }
  
  // Create KPI dashboard structure
  const headers = [
    ['BASELINE METRICS DASHBOARD - AUTO-UPDATED'],
    [''],
    ['OVERALL DIGITAL MATURITY DISTRIBUTION'],
    ['Maturity Level', 'Count', 'Percentage', '2026 Target', 'External Avg', 'Survey Avg'],
    [''],
    ['EXTERNAL VS SURVEY PERFORMANCE COMPARISON'],
    ['Performance Category', 'High External/Low Survey', 'Low External/High Survey', 'Balanced Development', 'No Survey Data'],
    [''],
    ['SECTOR PERFORMANCE ANALYSIS'],
    ['Sector', 'Count', 'Avg External', 'Avg Survey', 'Avg Combined', 'Top Performer', 'Biggest Gap'],
    [''],
    ['PLATFORM PRESENCE BREAKDOWN'],
    ['Platform Category', 'Total Assessed', 'Strong Presence', 'Basic Presence', 'No Presence', 'Improvement Priority'],
    [''],
    ['KEY PERFORMANCE INDICATORS'],
    ['Metric', 'Current Value', 'Baseline Target', 'Status', 'Trend', 'Survey Correlation'],
    [''],
    ['CAPACITY BUILDING PRIORITY MATRIX'],
    ['Priority Level', 'Stakeholder Count', 'Avg External Gap', 'Avg Survey Indicator', 'Investment Needed', 'Expected ROI']
  ];
  
  headers.forEach((row, index) => {
    const range = metricsTab.getRange(index + 1, 1, 1, row.length);
    range.setValues([row]);
  });
  
  Logger.log('Baseline Metrics tab structure created');
}

// Function to add social media metrics columns to existing sheets without affecting existing content
function addSocialMediaMetricsColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ['Master Assessment', 'Tourism Assessment'];
  
  const socialMediaMetricsHeaders = [
    'Facebook Followers',
    'Instagram Followers', 
    'Tripadvisor Reviews',
    'YouTube Subscribers'
  ];
  
  sheets.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log(`Sheet ${sheetName} not found, skipping`);
      return;
    }
    
    // Check if social media metrics columns already exist
    const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const hasSocialMetrics = headerRow.some(header => 
      header && (header.toString().includes('Facebook Followers') || 
                header.toString().includes('Instagram Followers') ||
                header.toString().includes('Tripadvisor Reviews') ||
                header.toString().includes('YouTube Subscribers'))
    );
    
    if (hasSocialMetrics) {
      Logger.log(`${sheetName} already has social media metrics columns`);
      return;
    }
    
    // Find the position after the YouTube column (AI) to insert social media metrics
    const youtubeColIndex = headerRow.findIndex(header => 
      header && header.toString().toLowerCase().includes('youtube')
    );
    
    if (youtubeColIndex === -1) {
      Logger.log(`YouTube column not found in ${sheetName}, cannot determine insert position`);
      return;
    }
    
    // Insert position is after YouTube column (youtubeColIndex + 2 because arrays are 0-indexed and we want after)
    const insertPosition = youtubeColIndex + 2;
    
    // Insert 4 new columns for social media metrics
    sheet.insertColumns(insertPosition, 4);
    
    // Add the social media metrics headers
    const headerRange = sheet.getRange(1, insertPosition, 1, socialMediaMetricsHeaders.length);
    headerRange.setValues([socialMediaMetricsHeaders]);
    
    // Format the new headers
    headerRange.setBackground('#795548') // Brown for metrics
              .setFontColor('white')
              .setFontWeight('bold')
              .setFontSize(10)
              .setWrap(true)
              .setVerticalAlignment('middle');
    
    // Set column widths for social media metrics
    for (let i = 0; i < socialMediaMetricsHeaders.length; i++) {
      sheet.setColumnWidth(insertPosition + i, 120);
    }
    
    Logger.log(`Added ${socialMediaMetricsHeaders.length} social media metrics columns to ${sheetName} starting at column ${getColumnLetter(insertPosition)}`);
  });
  
  Logger.log('Social media metrics columns added to existing sheets');
}

// Function to add opportunities columns to existing sheets without recreating
function addOpportunitiesColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ['Master Assessment', 'Tourism Assessment'];
  
  const opportunityHeaders = [
    'Social Media Opportunities',
    'Website Opportunities', 
    'Visual Content Opportunities',
    'Online Discoverability Opportunities',
    'Digital Sales/Booking Opportunities',
    'Platform Integration Opportunities',
    'Digital Comfort & Skills Opportunities',
    'Content Strategy Opportunities',
    'Platform Usage Breadth Opportunities',
    'Investment Capacity Opportunities',
    'Challenge Severity Opportunities'
  ];
  
  sheets.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log(`Sheet ${sheetName} not found, skipping`);
      return;
    }
    
    // Check if opportunities columns already exist
    const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const hasOpportunities = headerRow.some(header => 
      header && header.toString().toLowerCase().includes('opportunities')
    );
    
    if (hasOpportunities) {
      Logger.log(`${sheetName} already has opportunities columns`);
      return;
    }
    
    // Add opportunities at the end (after existing columns including social media metrics)
    const insertPosition = sheet.getLastColumn() + 1;
    
    // Add the opportunity headers
    const headerRange = sheet.getRange(1, insertPosition, 1, opportunityHeaders.length);
    headerRange.setValues([opportunityHeaders]);
    
    // Format the new headers
    headerRange.setBackground('#ff6f00') // Deep orange for opportunities
              .setFontColor('white')
              .setFontWeight('bold')
              .setFontSize(10)
              .setWrap(true)
              .setVerticalAlignment('middle');
    
    // Set column widths for opportunities
    for (let i = 0; i < opportunityHeaders.length; i++) {
      sheet.setColumnWidth(insertPosition + i, 220);
    }
    
    Logger.log(`Added ${opportunityHeaders.length} opportunities columns to ${sheetName} starting at column ${getColumnLetter(insertPosition)}`);
  });
  
  Logger.log('Opportunities columns added to existing sheets');
}

// Formulas for Tourism Assessment tab (match Master Assessment logic)
function addTourismCalculationFormulas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tourismTab = ss.getSheetByName('Tourism Assessment');
  
  if (!tourismTab) {
    Logger.log('Tourism Assessment tab not found');
    return;
  }
  
  // Cover all existing (and a buffer of future) rows
  const lastRow = Math.max(tourismTab.getLastRow() || 0, tourismTab.getMaxRows() || 0, 500);
  tourismTab.getRange(`O2:S${lastRow}`).clearContent();
  tourismTab.getRange(`V2:V${lastRow}`).clearContent(); // Assessment Date column
  
  const externalTotalFormula = '=IF(COUNTA(D2:I2)>0,SUM(D2:I2),"")';
  tourismTab.getRange('O2').setFormula(externalTotalFormula);
  
  const surveyTotalFormula = '=IF(COUNTA(J2:N2)>0,SUM(J2:N2),"")';
  tourismTab.getRange('P2').setFormula(surveyTotalFormula);
  
  const combinedTotalFormula = '=IF(AND(O2<>"",P2<>""),O2+P2,IF(O2<>"",O2,""))';
  tourismTab.getRange('Q2').setFormula(combinedTotalFormula);
  
  const maturityFormula = '=IF(Q2="","",IF(Q2>=80,"Expert",IF(Q2>=60,"Advanced",IF(Q2>=40,"Intermediate",IF(Q2>=20,"Emerging","Absent")))))';
  tourismTab.getRange('R2').setFormula(maturityFormula);
  
  const correlationFormula = '=IF(AND(O2<>"",P2<>""),ROUND(ABS((O2/70*100)-(P2/30*100)),1),"")';
  tourismTab.getRange('S2').setFormula(correlationFormula);
  
  tourismTab.getRange('V2').setFormula('=IF(A2<>"",TODAY(),"")'); // Assessment Date
  
  tourismTab.getRange('O2:S2').copyTo(tourismTab.getRange(`O2:S${lastRow}`));
  tourismTab.getRange('V2').copyTo(tourismTab.getRange(`V2:V${lastRow}`));
  
  Logger.log('Tourism Assessment formulas added');
}

function addCalculationFormulas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterTab = ss.getSheetByName('Master Assessment');
  
  if (!masterTab) {
    Logger.log('Master Assessment tab not found');
    return;
  }
  
  // Clear existing formulas first
  const lastRow = 200;
  masterTab.getRange(`O2:S${lastRow}`).clearContent();
  masterTab.getRange(`V2:V${lastRow}`).clearContent(); // Assessment Date column
  
  // External Assessment Total (column O) - Sum D through I (Social Media to Platform Integration)
  const externalTotalFormula = '=IF(COUNTA(D2:I2)>0,SUM(D2:I2),"")';
  masterTab.getRange('O2').setFormula(externalTotalFormula);
  
  // Survey Assessment Total (column P) - Sum J through N (Digital Comfort to Challenge Severity)
  const surveyTotalFormula = '=IF(COUNTA(J2:N2)>0,SUM(J2:N2),"")';
  masterTab.getRange('P2').setFormula(surveyTotalFormula);
  
  // Combined Total Score (column Q) - External + Survey (with fallback to External only)
  const combinedTotalFormula = '=IF(AND(O2<>"",P2<>""),O2+P2,IF(O2<>"",O2,""))';
  masterTab.getRange('Q2').setFormula(combinedTotalFormula);
  
  // Digital Maturity Level (column R) - Five-level scale
  const maturityFormula = `=IF(Q2="","",IF(Q2>=80,"Expert",IF(Q2>=60,"Advanced",IF(Q2>=40,"Intermediate",IF(Q2>=20,"Emerging","Absent")))))`;
  masterTab.getRange('R2').setFormula(maturityFormula);
  
  // Survey-External Correlation (column S) - Percentage difference indicator
  const correlationFormula = '=IF(AND(O2<>"",P2<>""),ROUND(ABS((O2/70*100)-(P2/30*100)),1),"")';
  masterTab.getRange('S2').setFormula(correlationFormula);
  
  // Assessment date formula (column V)
  masterTab.getRange('V2').setFormula('=IF(A2<>"",TODAY(),"")');
  
  // Copy formulas down for multiple rows
  masterTab.getRange('O2:S2').copyTo(masterTab.getRange(`O2:S${lastRow}`));
  masterTab.getRange('V2').copyTo(masterTab.getRange(`V2:V${lastRow}`));
  
  Logger.log('New framework calculation formulas added successfully');
  Logger.log('External Assessment: D-I (70pts) | Survey Assessment: J-N (30pts)');
  Logger.log('Combined Score: O+P (100pts) | Correlation Analysis: Column S');
}

function addSampleData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterTab = ss.getSheetByName('Master Assessment');
  
  if (!masterTab) {
    Logger.log('Master Assessment tab not found');
    return;
  }
  
  // Add sample stakeholders for testing new framework
  const sampleData = [
    ['Kankurang Festival', 'Festivals and cultural events', 'Greater Banjul Area', 
     '', '', '', '', '', '', // External Assessment (to be filled)
     '', '', '', '', '', // Survey Assessment (to be filled) 
     '', '', '', '', '', '', // Calculated totals (auto-calculated)
     '', '', '', '', // Meta data (Contact, Date, Notes, Follow-up)
     // Justifications (placeholders)
     '', '', '', '', '', '',
     // Links (placeholders)
     '', '', '', '', '',
     // Social Media Metrics (placeholders)
     '', '', '', '',
     // Opportunities columns (placeholders) - will be at AN-AX
     '', '', '', '', '', '', '', '', '', '', ''],
    ['Serrekunda Craft Market', 'Crafts and artisan products', 'West Coast Region',
     '', '', '', '', '', '', 
     '', '', '', '', '', 
     '', '', '', '', '', '', 
     '', '', '', '',
     '', '', '', '', '', '',
     '', '', '', '', '',
     '', '', '', '',
     '', '', '', '', '', '', '', '', '', '', ''],
    ['Gambia National Museum', 'Cultural heritage sites/museums', 'Greater Banjul Area',
     '', '', '', '', '', '', 
     '', '', '', '', '', 
     '', '', '', '', '', '', 
     '', '', '', '',
     '', '', '', '', '', '',
     '', '', '', '', '',
     '', '', '', '',
     '', '', '', '', '', '', '', '', '', '', ''],
    ['Jaliba Kuyateh', 'Music (artists, production, venues, education)', 'West Coast Region',
     '', '', '', '', '', '', 
     '', '', '', '', '', 
     '', '', '', '', '', '', 
     '', '', '', '',
     '', '', '', '', '', '',
     '', '', '', '', '',
     '', '', '', '',
     '', '', '', '', '', '', '', '', '', '', '']
  ];
  
  // Ensure rows match current header count by padding with blanks
  const totalCols = masterTab.getLastColumn();
  const padded = sampleData.map(row => {
    const copy = row.slice();
    while (copy.length < totalCols) copy.push('');
    return copy;
  });
  
  const dataRange = masterTab.getRange(2, 1, padded.length, totalCols);
  dataRange.setValues(padded);
  
  Logger.log('Sample data added to Master Assessment with opportunities columns structure');
}

// Convenience: apply formulas to both Master and Tourism
function applyAllFormulas() {
  try {
    addCalculationFormulas(); // Master Assessment formulas
  } catch (e) {
    Logger.log('Master formula update failed: ' + e);
  }
  try {
    addTourismCalculationFormulas(); // Tourism Assessment formulas
  } catch (e2) {
    Logger.log('Tourism formula update failed: ' + e2);
  }
  Logger.log('All formulas applied to both sheets');
}

// One-shot initializer for Tourism sheet
function initializeTourismAssessmentStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  createTourismAssessmentTab(ss);
  try {
    if (typeof createDropdownValidationsForSheet === 'function') {
      createDropdownValidationsForSheet('Tourism Assessment');
    }
  } catch (e) {
    Logger.log('Validation setup skipped or failed: ' + e);
  }
  addTourismCalculationFormulas();
  Logger.log('Tourism Assessment structure complete with opportunities columns');
}

// Regional Assessment tab with identical schema to Master Assessment (including social media metrics)
function createRegionalAssessmentTab(ss) {
  // Allow direct execution without params
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  
  // Create or get the Regional Assessment tab
  let regionalTab = ss.getSheetByName('Regional Assessment');
  if (regionalTab) {
    regionalTab.clear();
  } else {
    regionalTab = ss.insertSheet('Regional Assessment');
  }
  
  // Regional Assessment headers - External Assessment only (no survey data)
  const headers = [
    'Stakeholder Name',
    'Sector',
    'Country', // Changed from 'Region' to 'Country' for regional analysis
    
    // EXTERNAL ASSESSMENT ONLY (70 points)
    'Social Media Business (0-18)',
    'Website Presence (0-12)', 
    'Visual Content Quality (0-15)',
    'Online Discoverability (0-12)',
    'Digital Sales/Booking (0-8)',
    'Platform Integration (0-5)',
    
    // CALCULATED TOTALS (External only)
    'EXTERNAL TOTAL (0-70)',
    'DIGITAL MATURITY LEVEL',
    
    // SECTOR BONUS
    'SECTOR BONUS POINTS (0-7)',
    
    // META DATA
    'Contact Info',
    'Assessment Date',
    'Notes',
    'Follow-up Required',
    
    // JUSTIFICATIONS (External only)
    'Social Media Justification',
    'Website Functionality',
    'Visual Content Quality',
    'Online Discoverability',
    'Digital Sales/Booking',
    'Platform Integration',
    
    // LINKS
    'Website',
    'Facebook',
    'Instagram',
    'Tripadvisor',
    'YouTube',
    
    // SOCIAL MEDIA METRICS (followers/reviews tracking)
    'Facebook Followers',
    'Instagram Followers', 
    'Tripadvisor Reviews',
    'YouTube Subscribers',
    
    // OPPORTUNITIES COLUMNS (External only)
    'Social Media Opportunities',
    'Website Opportunities', 
    'Visual Content Opportunities',
    'Online Discoverability Opportunities',
    'Digital Sales/Booking Opportunities',
    'Platform Integration Opportunities'
  ];
  
  const headerRange = regionalTab.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  
  // Apply formatting for regional assessment
  formatMasterAssessmentHeaders(regionalTab, headers.length);
  setRegionalAssessmentColumnWidths(regionalTab);
  
  // Apply validations and formulas automatically
  try {
    if (typeof createDropdownValidationsForSheet === 'function') {
      createDropdownValidationsForSheet('Regional Assessment');
    }
  } catch (e) {
    Logger.log('Regional validations not applied: ' + e);
  }
  try {
    addRegionalCalculationFormulas();
  } catch (e2) {
    Logger.log('Regional formulas not applied: ' + e2);
  }
  
  Logger.log('Regional Assessment tab created with identical schema including social media metrics');
}

// Formulas for Regional Assessment tab (External Assessment only)
function addRegionalCalculationFormulas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const regionalTab = ss.getSheetByName('Regional Assessment');
  
  if (!regionalTab) {
    Logger.log('Regional Assessment tab not found');
    return;
  }
  
  // Cover all existing (and a buffer of future) rows
  const lastRow = Math.max(regionalTab.getLastRow() || 0, regionalTab.getMaxRows() || 0, 500);
  regionalTab.getRange(`J2:K${lastRow}`).clearContent(); // External Total and Maturity Level
  regionalTab.getRange(`N2:N${lastRow}`).clearContent(); // Assessment Date column
  
  // External Assessment Total (column J) - Sum D through I (Social Media to Platform Integration)
  const externalTotalFormula = '=IF(COUNTA(D2:I2)>0,SUM(D2:I2),"")';
  regionalTab.getRange('J2').setFormula(externalTotalFormula);
  
  // Digital Maturity Level (column K) - Based on External score only (70 points max)
  const maturityFormula = '=IF(J2="","",IF(J2>=56,"Expert",IF(J2>=42,"Advanced",IF(J2>=28,"Intermediate",IF(J2>=14,"Emerging","Absent")))))';
  regionalTab.getRange('K2').setFormula(maturityFormula);
  
  // Assessment date formula (column N)
  regionalTab.getRange('N2').setFormula('=IF(A2<>"",TODAY(),"")');
  
  // Copy formulas down for multiple rows
  regionalTab.getRange('J2:K2').copyTo(regionalTab.getRange(`J2:K${lastRow}`));
  regionalTab.getRange('N2').copyTo(regionalTab.getRange(`N2:N${lastRow}`));
  
  Logger.log('Regional Assessment formulas added (External Assessment only)');
}

// One-shot initializer for Regional sheet
function initializeRegionalAssessmentStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  createRegionalAssessmentTab(ss);
  try {
    if (typeof createDropdownValidationsForSheet === 'function') {
      createDropdownValidationsForSheet('Regional Assessment');
    }
  } catch (e) {
    Logger.log('Regional validation setup skipped or failed: ' + e);
  }
  addRegionalCalculationFormulas();
  Logger.log('Regional Assessment structure complete with social media metrics');
}

// Test function to verify regional assessment structure
function testRegionalAssessmentStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const regionalTab = ss.getSheetByName('Regional Assessment');
  
  if (!regionalTab) {
    Logger.log('Regional Assessment tab not found');
    return;
  }
  
  // Get all headers
  const headers = regionalTab.getRange(1, 1, 1, regionalTab.getLastColumn()).getValues()[0];
  
  // Check for key differences from Master Assessment
  const hasCountryColumn = headers.includes('Country');
  const hasSocialMetrics = headers.includes('Facebook Followers') && headers.includes('Instagram Followers');
  const hasOpportunities = headers.some(header => header && header.toString().toLowerCase().includes('opportunities'));
  const hasExternalOnly = headers.includes('EXTERNAL TOTAL (0-70)') && !headers.includes('SURVEY TOTAL (0-30)');
  const hasNoSurveyColumns = !headers.some(header => header && header.toString().includes('Digital Comfort & Skills'));
  
  Logger.log('Regional Assessment Test Results:');
  Logger.log(`Has Country column (instead of Region): ${hasCountryColumn ? '✅' : '❌'}`);
  Logger.log(`Has Social Media Metrics: ${hasSocialMetrics ? '✅' : '❌'}`);
  Logger.log(`Has Opportunities columns: ${hasOpportunities ? '✅' : '❌'}`);
  Logger.log(`External Assessment only (no survey): ${hasExternalOnly ? '✅' : '❌'}`);
  Logger.log(`No survey columns present: ${hasNoSurveyColumns ? '✅' : '❌'}`);
  Logger.log(`Total columns: ${headers.length}`);
  
  // Check column positions
  const countryCol = headers.indexOf('Country') + 1;
  const facebookFollowersCol = headers.indexOf('Facebook Followers') + 1;
  const externalTotalCol = headers.indexOf('EXTERNAL TOTAL (0-70)') + 1;
  
  Logger.log(`Country column: ${getColumnLetter(countryCol)} (${countryCol})`);
  Logger.log(`Facebook Followers column: ${getColumnLetter(facebookFollowersCol)} (${facebookFollowersCol})`);
  Logger.log(`External Total column: ${getColumnLetter(externalTotalCol)} (${externalTotalCol})`);
  
  if (hasCountryColumn && hasSocialMetrics && hasOpportunities && hasExternalOnly && hasNoSurveyColumns) {
    Logger.log('✅ Regional Assessment structure properly created (External Assessment only)!');
    return true;
  } else {
    Logger.log('❌ Regional Assessment structure issue detected');
    return false;
  }
}

// Main initialization function for new framework
function initializeUpdatedAssessmentStructure() {
  setupAssessmentSystem();
  addCalculationFormulas();
  addSampleData();
  
  Logger.log('Updated assessment system structure complete with opportunities columns and regional analysis!');
  Logger.log('New Framework Summary:');
  Logger.log('- External Assessment (70 points): Social Media (18) + Website (12) + Visual (15) + Discoverability (12) + Sales (8) + Platform (5)');
  Logger.log('- Survey Assessment (30 points): Comfort (8) + Strategy (8) + Breadth (7) + Investment (4) + Challenges (3)');
  Logger.log('- Social Media Metrics columns added at AJ-AM (4 columns: Facebook Followers, Instagram Followers, Tripadvisor Reviews, YouTube Subscribers)');
  Logger.log('- Opportunities columns added at AN-AX (11 columns total)');
  Logger.log('- Regional Assessment tab created with Country column instead of Region');
  Logger.log('- Phased implementation: External first, Survey integration later');
  Logger.log('Next steps:');
  Logger.log('1. Run initializeFinalScoringSystem() from scoring.gs');
  Logger.log('2. Create separate opportunities script for logic');
  Logger.log('3. Test with sample assessments');
  Logger.log('4. Generate analysis reports');
  Logger.log('5. Use Regional Assessment for cross-country comparative analysis');
}

// Utility function to test the new structure
function testNewFrameworkStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterTab = ss.getSheetByName('Master Assessment');
  
  if (!masterTab) {
    Logger.log('Master Assessment tab not found');
    return;
  }
  
  // Add test data to verify calculations
  const testData = [
    'Test Creative Business', 
    'Crafts and artisan products', 
    'West Coast Region',
    // External Assessment
    12, // D: Social Media (out of 18)
    6,  // E: Website (out of 12)
    9,  // F: Visual Content (out of 15)
    8,  // G: Discoverability (out of 12)
    4,  // H: Digital Sales (out of 8)
    3,  // I: Platform Integration (out of 5)
    // Survey Assessment
    5,  // J: Digital Comfort (out of 8)
    4,  // K: Content Strategy (out of 8)
    4,  // L: Platform Breadth (out of 7)
    2,  // M: Investment Capacity (out of 4)
    2   // N: Challenge Severity (out of 3)
  ];
  
  // Add empty values for remaining columns
  while (testData.length < masterTab.getLastColumn()) {
    testData.push('');
  }
  
  // Expected results:
  // External Total: 12+6+9+8+4+3 = 42/70 (60%)
  // Survey Total: 5+4+4+2+2 = 17/30 (57%)
  // Combined Score: 42+17 = 59 (Intermediate level)
  
  const range = masterTab.getRange(2, 1, 1, testData.length);
  range.setValues([testData]);
  
  // Check if calculations worked
  Utilities.sleep(1000); // Wait for formula calculation
  
  const externalTotal = masterTab.getRange('O2').getValue();
  const surveyTotal = masterTab.getRange('P2').getValue();
  const combinedScore = masterTab.getRange('Q2').getValue();
  const maturityLevel = masterTab.getRange('R2').getValue();
  const correlation = masterTab.getRange('S2').getValue();
  
  Logger.log('Framework Test Results:');
  Logger.log(`External Total: ${externalTotal}/70 (Expected: 42)`);
  Logger.log(`Survey Total: ${surveyTotal}/30 (Expected: 17)`);
  Logger.log(`Combined Score: ${combinedScore}/100 (Expected: 59)`);
  Logger.log(`Maturity Level: ${maturityLevel} (Expected: Intermediate)`);
  Logger.log(`Correlation: ${correlation}% (Expected: ~3%)`);
  Logger.log(`Social Media Metrics columns available: AJ-AM (columns 36-39)`);
  Logger.log(`Opportunities columns available: AN-AX (columns 40-50)`);
  
  if (externalTotal === 42 && surveyTotal === 17 && combinedScore === 59 && maturityLevel === 'Intermediate') {
    Logger.log('✅ Framework calculations working correctly with opportunities structure!');
  } else {
    Logger.log('❌ Framework calculation issue detected');
  }
  
  return { externalTotal, surveyTotal, combinedScore, maturityLevel, correlation };
}

// Test function to verify social media metrics columns are properly added
function testSocialMediaMetricsColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterTab = ss.getSheetByName('Master Assessment');
  
  if (!masterTab) {
    Logger.log('Master Assessment tab not found');
    return;
  }
  
  // Get all headers
  const headers = masterTab.getRange(1, 1, 1, masterTab.getLastColumn()).getValues()[0];
  
  // Check for social media metrics columns
  const expectedMetrics = ['Facebook Followers', 'Instagram Followers', 'Tripadvisor Reviews', 'YouTube Subscribers'];
  const foundMetrics = expectedMetrics.filter(metric => headers.includes(metric));
  
  Logger.log('Social Media Metrics Test Results:');
  Logger.log(`Expected metrics: ${expectedMetrics.join(', ')}`);
  Logger.log(`Found metrics: ${foundMetrics.join(', ')}`);
  Logger.log(`Success rate: ${foundMetrics.length}/${expectedMetrics.length} (${Math.round(foundMetrics.length/expectedMetrics.length*100)}%)`);
  
  // Check column positions
  const facebookFollowersCol = headers.indexOf('Facebook Followers') + 1;
  const instagramFollowersCol = headers.indexOf('Instagram Followers') + 1;
  const tripadvisorReviewsCol = headers.indexOf('Tripadvisor Reviews') + 1;
  const youtubeSubscribersCol = headers.indexOf('YouTube Subscribers') + 1;
  
  Logger.log('Column positions:');
  Logger.log(`Facebook Followers: Column ${getColumnLetter(facebookFollowersCol)} (${facebookFollowersCol})`);
  Logger.log(`Instagram Followers: Column ${getColumnLetter(instagramFollowersCol)} (${instagramFollowersCol})`);
  Logger.log(`Tripadvisor Reviews: Column ${getColumnLetter(tripadvisorReviewsCol)} (${tripadvisorReviewsCol})`);
  Logger.log(`YouTube Subscribers: Column ${getColumnLetter(youtubeSubscribersCol)} (${youtubeSubscribersCol})`);
  
  // Verify they are in the expected range (AJ-AM, columns 36-39)
  const expectedRange = [36, 37, 38, 39];
  const actualPositions = [facebookFollowersCol, instagramFollowersCol, tripadvisorReviewsCol, youtubeSubscribersCol];
  const inRange = actualPositions.every(pos => expectedRange.includes(pos));
  
  if (foundMetrics.length === expectedMetrics.length && inRange) {
    Logger.log('✅ Social Media Metrics columns properly added and positioned!');
    return true;
  } else {
    Logger.log('❌ Social Media Metrics columns issue detected');
    return false;
  }
}

// Utility to get column letter from number (for reference)
function getColumnLetter(columnNumber) {
  let letter = '';
  while (columnNumber > 0) {
    const remainder = (columnNumber - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    columnNumber = Math.floor((columnNumber - remainder) / 26);
  }
  return letter;
}