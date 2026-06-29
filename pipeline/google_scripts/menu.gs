/**
 * Gambia Creative Industries Digital Assessment - Menu System Only
 * This script only contains the menu system and calls functions from other scripts
 */

function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    ui.createMenu('Gambia Assessment')
      .addSubMenu(ui.createMenu('Setup & Initialization')
        .addItem('Initialize System', 'initializeCompleteSystem')
        .addItem('Verify Data Structure', 'verifySheetStructure')
        .addItem('Add Sample Data', 'addSampleDataFromMenu'))
      
      .addSubMenu(ui.createMenu('Manual Assessment')
        .addItem('Add New Stakeholder', 'addNewStakeholder')
        .addItem('Calculate Scores for Selected Row', 'calculateScoresForSelectedRow')
        .addItem('Calculate All Totals', 'calculateAllTotals')
        .addItem('Validate Framework Compliance', 'validateFrameworkCompliance'))
      
      .addSubMenu(ui.createMenu('Survey Management')
        .addItem('Mark Survey Complete', 'markSurveyComplete')
        .addItem('Survey Status Overview', 'showSurveyStatus')
        .addItem('Calculate Maturity Levels', 'calculateMaturityLevels'))
      
      .addSubMenu(ui.createMenu('Analysis & Reports')
        .addItem('Generate Digital Readiness Matrix', 'refreshDigitalReadinessMatrix')
        .addItem('Generate Baseline Metrics', 'refreshBaselineMetrics')
        .addItem('Generate Technical Analysis', 'refreshTechnicalAnalysis')
        .addItem('Open Public Dashboard (Sidebar Preview)', 'openDashboardSidebar')
        .addSeparator()
        .addItem('View Assessment Statistics', 'viewAssessmentStatisticsFromMenu')
        .addItem('Export Data', 'exportAssessmentData'))
      
      .addSubMenu(ui.createMenu('Help & Reference')
        .addItem('Framework Scoring Guide', 'showFrameworkScoringGuide')
        .addItem('Assessment Instructions', 'showAssessmentInstructions')
        .addItem('Troubleshooting Guide', 'showTroubleshootingGuide'))
      
      .addToUi();
      
  } catch (error) {
    Logger.log(`Error creating menu: ${error.toString()}`);
  }
}

// Simple helper functions that just show alerts (no complex logic)
function showFrameworkScoringGuide() {
  const ui = SpreadsheetApp.getUi();
  
  const guide = `
FLEXIBLE SCORING GUIDE

EXTERNAL ASSESSMENT (70 points total):

SOCIAL MEDIA BUSINESS PRESENCE (0-18):
Enter any number from 0-18 based on assessment
• 0: No business social media presence
• 1-5: Very basic presence
• 6-10: Active but limited presence
• 11-15: Strong multi-platform presence
• 16-18: Excellent comprehensive presence

WEBSITE PRESENCE & FUNCTIONALITY (0-12):
Enter any number from 0-12 based on assessment
• 0: No website exists
• 1-3: Basic presence
• 4-7: Functional website
• 8-11: Professional site
• 12: Excellent web presence

VISUAL CONTENT QUALITY (0-15):
Enter any number from 0-15 based on assessment
• 0: No quality visuals
• 1-4: Basic content
• 5-9: Good quality content
• 10-13: Semi-professional
• 14-15: Professional visual content

ONLINE DISCOVERABILITY (0-12):
Enter any number from 0-12 based on assessment
• 0: Not found in search
• 1-3: Limited visibility
• 4-7: Good visibility
• 8-11: Strong online reputation
• 12: Excellent discoverability

DIGITAL SALES/BOOKING (0-8):
Enter any number from 0-8 based on assessment
• 0: No online capability
• 1-2: Basic inquiry system
• 3-5: Platform-based sales
• 6-7: Digital payment integration
• 8: Full digital commerce

PLATFORM INTEGRATION (0-5):
Enter any number from 0-5 based on assessment
• 0: No platform presence
• 1-2: Basic integration
• 3-4: Good integration
• 5: Excellent platform strategy

SURVEY ASSESSMENT (30 points total):
• Digital Comfort (0-8): Any number 0-8
• Content Strategy (0-8): Any number 0-8
• Platform Breadth (0-7): Any number 0-7
• Investment Capacity (0-4): Any number 0-4
• Challenge Severity (0-3): Any number 0-3

FLEXIBLE SCORING:
You can now use any number within each category's range.
The system will validate that scores are within bounds.
  `;
  
  ui.alert('Flexible Scoring Guide', guide, ui.ButtonSet.OK);
}

function showAssessmentInstructions() {
  const ui = SpreadsheetApp.getUi();
  
  const instructions = `
HOW TO CONDUCT ASSESSMENTS

1. SETUP:
   • Use "Initialize System" to create required sheets
   • Verify structure with "Verify Data Structure"

2. ADD STAKEHOLDERS:
   • Use "Add New Stakeholder" or manually enter in Master Assessment
   • Fill columns A (Name), B (Sector), C (Region)

3. EXTERNAL ASSESSMENT (Columns D-I):
   • Use ONLY framework values (see Scoring Guide)
   • D: Social Media (0,3,7,12,18)
   • E: Website (0,2,6,9,12)
   • F: Visual Content (0,3,6,10,15)
   • G: Discoverability (0,2,5,8,12)
   • H: Digital Sales (0,2,4,6,8)
   • I: Platform Integration (0,1,3,5)

4. SURVEY ASSESSMENT (Columns J-N):
   • J: Digital Comfort (0-8)
   • K: Content Strategy (0-8)
   • L: Platform Breadth (0-7)
   • M: Investment Capacity (0-4)
   • N: Challenge Severity (0-3)

5. CALCULATE TOTALS:
   • Use "Calculate Scores for Selected Row" for individual
   • Use "Calculate All Totals" for bulk calculation

6. GENERATE REPORTS:
   • Digital Readiness Matrix for overview
   • Baseline Metrics for detailed analysis
   • Technical Analysis for implementation planning
  `;
  
  ui.alert('Assessment Instructions', instructions, ui.ButtonSet.OK);
}

function showTroubleshootingGuide() {
  const ui = SpreadsheetApp.getUi();
  
  const guide = `
TROUBLESHOOTING GUIDE

COMMON ISSUES & SOLUTIONS:

1. "TypeError: Cannot convert undefined or null to object"
   ✅ Run "Verify Data Structure" to check for issues
   ✅ Use "Initialize System" to fix missing sheets
   ✅ Ensure Master Assessment has proper data in rows

2. Calculations not working:
   ✅ Use "Calculate All Totals" to recalculate everything
   ✅ Check that scores use exact framework values
   ✅ Ensure no text in numeric columns (D-N)

3. Matrix/Reports not generating:
   ✅ Verify Master Assessment tab exists and has data
   ✅ Check that at least one stakeholder has scores
   ✅ Try running individual report generators

4. Framework compliance errors:
   ✅ Use "Validate Framework Compliance" to check scores
   ✅ Refer to Framework Scoring Guide for exact values
   ✅ Use dropdown validation in score columns

5. Survey data issues:
   ✅ Use "Survey Status Overview" to check completion
   ✅ Ensure numeric values in survey columns (J-N)
   ✅ Use "Mark Survey Complete" after data entry

PREVENTION:
• Always use menu functions instead of manual formulas
• Keep exact framework score values
• Don't delete or rename the main sheets
• Run "Verify Data Structure" regularly
  `;
  
  ui.alert('Troubleshooting Guide', guide, ui.ButtonSet.OK);
}