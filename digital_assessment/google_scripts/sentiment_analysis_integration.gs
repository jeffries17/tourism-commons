/**
 * Sentiment Analysis Integration for Google Sheets
 * Creates a separate sentiment analysis sheet and connects it to Master Assessment
 */

function setupSentimentAnalysisSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create or get the Sentiment Analysis tab
  let sentimentTab = ss.getSheetByName('Sentiment Analysis');
  if (sentimentTab) {
    sentimentTab.clear();
  } else {
    sentimentTab = ss.insertSheet('Sentiment Analysis');
  }
  
  // Set up headers for comprehensive sentiment analysis
  const headers = [
    'Stakeholder Name',
    'Project ID',
    'Total Reviews',
    'Overall Sentiment',
    'Average Rating',
    'Language Diversity',
    'Analysis Date',
    'Last Updated',
    
    // Theme Scores
    'Service Quality Score',
    'Service Quality Mentions',
    'Educational Value Score', 
    'Educational Value Mentions',
    'Value Pricing Score',
    'Value Pricing Mentions',
    'Artistic Creative Quality Score',
    'Artistic Creative Quality Mentions',
    'Authenticity Culture Score',
    'Authenticity Culture Mentions',
    'Community Local Impact Score',
    'Community Local Impact Mentions',
    'Accessibility Comfort Score',
    'Accessibility Comfort Mentions',
    'Safety Security Score',
    'Safety Security Mentions',
    'Atmosphere Ambiance Score',
    'Atmosphere Ambiance Mentions',
    'Organization Logistics Score',
    'Organization Logistics Mentions',
    
    // Language Distribution
    'English Reviews',
    'Dutch Reviews', 
    'German Reviews',
    'Spanish Reviews',
    'French Reviews',
    
    // Top Quotes (truncated for display)
    'Top Service Quote',
    'Top Value Quote',
    'Top Educational Quote',
    
    // Connection to Master Assessment
    'Master Assessment Row',
    'Digital Readiness Score',
    'External Assessment Score'
  ];
  
  // Set headers
  sentimentTab.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  const headerRange = sentimentTab.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Set up data validation and formatting
  setupSentimentDataValidation(sentimentTab);
  
  // Create summary dashboard
  createSentimentDashboard(ss);
  
  // Create connection to Master Assessment
  createMasterAssessmentConnection(ss);
  
  Logger.log('Sentiment Analysis sheet created successfully!');
}

function setupSentimentDataValidation(sheet) {
  // Add data validation for sentiment scores (0-1)
  const sentimentColumns = [4, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39];
  
  sentimentColumns.forEach(col => {
    const range = sheet.getRange(2, col, 1000, 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireNumberBetween(0, 1)
      .setAllowInvalid(false)
      .setHelpText('Sentiment score must be between 0 and 1')
      .build();
    range.setDataValidation(rule);
  });
  
  // Format sentiment columns as percentages
  sentimentColumns.forEach(col => {
    sheet.getRange(2, col, 1000, 1).setNumberFormat('0.00%');
  });
}

function createSentimentDashboard(ss) {
  // Create or get the Sentiment Dashboard tab
  let dashboardTab = ss.getSheetByName('Sentiment Dashboard');
  if (dashboardTab) {
    dashboardTab.clear();
  } else {
    dashboardTab = ss.insertSheet('Sentiment Dashboard');
  }
  
  // Create KPI cards
  dashboardTab.getRange('A1').setValue('SENTIMENT ANALYSIS DASHBOARD');
  dashboardTab.getRange('A1').setFontSize(16).setFontWeight('bold');
  
  // Summary statistics
  dashboardTab.getRange('A3').setValue('Total Stakeholders:');
  dashboardTab.getRange('B3').setFormula('=COUNTA(Sentiment Analysis!A:A)-1');
  
  dashboardTab.getRange('A4').setValue('Total Reviews:');
  dashboardTab.getRange('B4').setFormula('=SUM(Sentiment Analysis!C:C)');
  
  dashboardTab.getRange('A5').setValue('Average Sentiment:');
  dashboardTab.getRange('B5').setFormula('=AVERAGE(Sentiment Analysis!D:D)');
  
  dashboardTab.getRange('A6').setValue('Average Rating:');
  dashboardTab.getRange('B6').setFormula('=AVERAGE(Sentiment Analysis!E:E)');
  
  // Top performers
  dashboardTab.getRange('A8').setValue('TOP PERFORMERS BY SENTIMENT:');
  dashboardTab.getRange('A8').setFontWeight('bold');
  
  // Create a sorted list of top performers
  dashboardTab.getRange('A9').setFormula('=SORT(Sentiment Analysis!A2:D, 4, FALSE)');
  
  // Theme analysis
  dashboardTab.getRange('F3').setValue('THEME PERFORMANCE:');
  dashboardTab.getRange('F3').setFontWeight('bold');
  
  // Create theme performance summary
  const themeHeaders = ['Theme', 'Avg Score', 'Total Mentions'];
  dashboardTab.getRange('F4:H4').setValues([themeHeaders]);
  
  // Add theme formulas
  const themes = [
    'Service Quality', 'Educational Value', 'Value Pricing', 
    'Artistic Creative Quality', 'Authenticity Culture', 'Community Local Impact'
  ];
  
  themes.forEach((theme, index) => {
    const row = 5 + index;
    dashboardTab.getRange(`F${row}`).setValue(theme);
    dashboardTab.getRange(`G${row}`).setFormula(`=AVERAGE(Sentiment Analysis!I:I)`); // Adjust column as needed
    dashboardTab.getRange(`H${row}`).setFormula(`=SUM(Sentiment Analysis!J:J)`); // Adjust column as needed
  });
}

function createMasterAssessmentConnection(ss) {
  // This function creates a connection between Sentiment Analysis and Master Assessment
  const masterTab = ss.getSheetByName('Master Assessment');
  const sentimentTab = ss.getSheetByName('Sentiment Analysis');
  
  if (!masterTab || !sentimentTab) {
    Logger.log('Required sheets not found');
    return;
  }
  
  // Add a formula to link stakeholders
  // This assumes Master Assessment has stakeholder names in column A
  const lastRow = sentimentTab.getLastRow();
  
  for (let i = 2; i <= lastRow; i++) {
    const stakeholderName = sentimentTab.getRange(i, 1).getValue();
    
    // Find matching row in Master Assessment
    const masterData = masterTab.getDataRange().getValues();
    let masterRow = 0;
    
    for (let j = 1; j < masterData.length; j++) {
      if (masterData[j][0] && masterData[j][0].toString().toLowerCase().includes(stakeholderName.toLowerCase())) {
        masterRow = j + 1;
        break;
      }
    }
    
    // Set the connection
    if (masterRow > 0) {
      sentimentTab.getRange(i, 36).setValue(masterRow); // Master Assessment Row column
      
      // Pull some data from Master Assessment
      sentimentTab.getRange(i, 37).setFormula(`=INDIRECT("Master Assessment!Z${masterRow}")`); // Digital Readiness Score
      sentimentTab.getRange(i, 38).setFormula(`=INDIRECT("Master Assessment!AA${masterRow}")`); // External Assessment Score
    }
  }
}

function importSentimentDataFromFirebase() {
  // This function would import data from Firebase
  // For now, it's a placeholder for the Firebase integration
  
  Logger.log('Firebase import function - to be implemented with Firebase API');
  
  // Example of how this would work:
  // 1. Connect to Firebase
  // 2. Retrieve sentiment analysis data
  // 3. Populate the Sentiment Analysis sheet
  // 4. Update the dashboard
}

function updateSentimentAnalysis() {
  // This function updates the sentiment analysis data
  // It can be triggered manually or on a schedule
  
  Logger.log('Updating sentiment analysis...');
  
  // 1. Import latest data from Firebase
  importSentimentDataFromFirebase();
  
  // 2. Refresh dashboard
  const dashboardTab = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sentiment Dashboard');
  if (dashboardTab) {
    dashboardTab.getRange('A1').setValue('Last Updated: ' + new Date());
  }
  
  // 3. Update Master Assessment connections
  createMasterAssessmentConnection(SpreadsheetApp.getActiveSpreadsheet());
  
  Logger.log('Sentiment analysis updated successfully!');
}

// Menu function to add custom menu
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Sentiment Analysis')
    .addItem('Setup Sentiment Analysis', 'setupSentimentAnalysisSheet')
    .addItem('Update Analysis Data', 'updateSentimentAnalysis')
    .addItem('Import from Firebase', 'importSentimentDataFromFirebase')
    .addToUi();
}
