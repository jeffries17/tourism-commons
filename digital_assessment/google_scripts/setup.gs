/**
 * Gambia Creative Industries Digital Assessment - Updated Setup Script
 * Creates structure for External Assessment (70pts) + Survey Integration (30pts) framework
 * Balanced weighting: Social Media (18) ≈ Website (12) for Gambian context
 */

function setupAssessmentSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create the main tabs structure with new framework
  createMasterAssessmentTab(ss);
  createDigitalReadinessMatrixTab(ss);
  createTechnicalAnalysisTab(ss);
  createBaselineMetricsTab(ss);
  
  Logger.log('Updated assessment system structure created!');
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
  
  // Set up the headers with new framework structure
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
    'YouTube'
  ];
  
  // Write headers
  const headerRange = masterTab.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  
  // Format headers with color coding
  formatMasterAssessmentHeaders(masterTab, headers.length);
  
  // Set column widths
  setMasterAssessmentColumnWidths(masterTab);
  
  Logger.log('Master Assessment tab structure created with new framework');
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
    150  // AI: YouTube
  ];
  
  columnWidths.forEach((width, index) => {
    sheet.setColumnWidth(index + 1, width);
  });
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
    ['Sector', 'Total Count', 'Expert (80-100)', 'Advanced (60-79)', 'Intermediate (40-59)', 'Emerging (20-39)', 'Absent (0-19)', 'Avg Score', 'Avg External', 'Avg Survey'],
    [''],
    ['SUMMARY BY REGION'], 
    ['Region', 'Total Count', 'Expert (80-100)', 'Advanced (60-79)', 'Intermediate (40-59)', 'Emerging (20-39)', 'Absent (0-19)', 'Avg Score', 'Avg External', 'Avg Survey'],
    [''],
    ['DETAILED BREAKDOWN'],
    ['Stakeholder', 'Sector', 'Region', 'External Score', 'Survey Score', 'Total Score', 'Maturity Level', 'Key Strengths', 'Priority Areas']
  ];
  
  headers.forEach((row, index) => {
    const range = matrixTab.getRange(index + 1, 1, 1, row.length);
    range.setValues([row]);
  });
  
  // Format headers
  matrixTab.getRange('A1:J1').setBackground('#1c4587').setFontColor('white').setFontWeight('bold');
  matrixTab.getRange('A3:J3').setBackground('#2d7d32').setFontColor('white').setFontWeight('bold');
  matrixTab.getRange('A6:J6').setBackground('#f57c00').setFontColor('white').setFontWeight('bold');
  matrixTab.getRange('A9:J9').setBackground('#7b1fa2').setFontColor('white').setFontWeight('bold');
  
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

// Tourism Assessment tab with identical schema to Master Assessment
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
  
  // Reuse the same headers as Master Assessment to ensure schema parity
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
    'YouTube'
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
  
  Logger.log('Tourism Assessment tab created with identical schema, validations, and formulas');
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
  tourismTab.getRange(`V2:V${lastRow}`).clearContent();
  
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
  
  tourismTab.getRange('V2').setFormula('=IF(A2<>"",TODAY(),"")');
  
  tourismTab.getRange('O2:S2').copyTo(tourismTab.getRange(`O2:S${lastRow}`));
  tourismTab.getRange('V2').copyTo(tourismTab.getRange(`V2:V${lastRow}`));
  
  Logger.log('Tourism Assessment formulas added');
}

// Convenience: apply formulas to both Master and Tourism
function applyAllFormulas() {
  try {
    if (typeof updateCalculationFormulas === 'function') updateCalculationFormulas();
  } catch (e) {
    Logger.log('Master formula update failed: ' + e);
  }
  try {
    addTourismCalculationFormulas();
  } catch (e2) {
    Logger.log('Tourism formula update failed: ' + e2);
  }
  Logger.log('All formulas applied');
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
  Logger.log('Tourism Assessment structure complete');
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
     '', '', '', '', ''],
    ['Serrekunda Craft Market', 'Crafts and artisan products', 'West Coast Region',
     '', '', '', '', '', '', 
     '', '', '', '', '', 
     '', '', '', '', '', '', 
     '', '', '', '',
     '', '', '', '', '', '',
     '', '', '', '', ''],
    ['Gambia National Museum', 'Cultural heritage sites/museums', 'Greater Banjul Area',
     '', '', '', '', '', '', 
     '', '', '', '', '', 
     '', '', '', '', '', '', 
     '', '', '', '',
     '', '', '', '', '', '',
     '', '', '', '', ''],
    ['Jaliba Kuyateh', 'Music (artists, production, venues, education)', 'West Coast Region',
     '', '', '', '', '', '', 
     '', '', '', '', '', 
     '', '', '', '', '', '', 
     '', '', '', '',
     '', '', '', '', '', '',
     '', '', '', '', '']
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
  
  Logger.log('Sample data added to Master Assessment with new framework structure');
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
  masterTab.getRange(`V2:V${lastRow}`).clearContent();
  
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

// Main initialization function for new framework
function initializeUpdatedAssessmentStructure() {
  setupAssessmentSystem();
  addCalculationFormulas();
  addSampleData();
  
  Logger.log('Updated assessment system structure complete!');
  Logger.log('New Framework Summary:');
  Logger.log('- External Assessment (70 points): Social Media (18) + Website (12) + Visual (15) + Discoverability (12) + Sales (8) + Platform (5)');
  Logger.log('- Survey Assessment (30 points): Comfort (8) + Strategy (8) + Breadth (7) + Investment (4) + Challenges (3)');
  Logger.log('- Phased implementation: External first, Survey integration later');
  Logger.log('Next steps:');
  Logger.log('1. Run initializeFinalScoringSystem() from scoring.gs');
  Logger.log('2. Test with sample assessments');
  Logger.log('3. Generate analysis reports');
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
  
  if (externalTotal === 42 && surveyTotal === 17 && combinedScore === 59 && maturityLevel === 'Intermediate') {
    Logger.log('✅ Framework calculations working correctly!');
  } else {
    Logger.log('❌ Framework calculation issue detected');
  }
  
  return { externalTotal, surveyTotal, combinedScore, maturityLevel, correlation };
}