/**
 * Fixed Digital Readiness Matrix - Focus on Sector Performance Analysis
 * This addresses the empty sector performance table issue
 */

function generateDigitalReadinessMatrix() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const masterTab = ss.getSheetByName('Master Assessment');
    const matrixTab = ss.getSheetByName('Digital Readiness Matrix');
    
    if (!masterTab) {
      Logger.log('Master Assessment tab not found');
      SpreadsheetApp.getUi().alert('Error', 'Master Assessment tab not found. Please create this tab first.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    if (!matrixTab) {
      Logger.log('Digital Readiness Matrix tab not found');
      SpreadsheetApp.getUi().alert('Error', 'Digital Readiness Matrix tab not found. Please create this tab first.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Get assessment data with improved error handling
    const assessmentData = getFixedAssessmentData(masterTab);
    
    Logger.log(`Retrieved ${assessmentData.length} assessments for matrix generation`);
    
    if (assessmentData.length === 0) {
      populateEmptyMatrix(matrixTab);
      return;
    }
    
    // Calculate metrics with fixed sector analysis
    const metrics = calculateFixedMetrics(assessmentData);
    
    Logger.log(`Calculated metrics for ${Object.keys(metrics.sectors).length} sectors`);
    
    // Clear existing content
    clearMatrixContent(matrixTab);
    
    // Populate matrix sections with enhanced analysis
    populateOverallMaturitySection(matrixTab, metrics);
    populateExternalVsSurveySection(matrixTab, metrics);
    populateFixedSectorPerformanceSection(matrixTab, metrics); // Fixed function
    populateFlexibleCorrelationAnalysisSection(matrixTab, metrics);
    populateDetailedBreakdown(matrixTab, assessmentData);
    
    // Add summary statistics
    addMatrixSummaryStats(matrixTab, assessmentData);
    
    // Apply consistent sheet frame
    applyDefaultSheetFrame(matrixTab);
    
    Logger.log('Digital Readiness Matrix generated successfully with fixed sector performance');
    
  } catch (error) {
    Logger.log(`Error in generateDigitalReadinessMatrix: ${error.toString()}`);
    SpreadsheetApp.getUi().alert('Error', `Failed to generate matrix: ${error.toString()}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function getFixedAssessmentData(masterTab) {
  try {
    const dataRange = masterTab.getDataRange();
    if (!dataRange) {
      Logger.log('No data range found in Master Assessment');
      return [];
    }
    
    const data = dataRange.getValues();
    if (!data || data.length <= 1) {
      Logger.log('No data found in Master Assessment');
      return [];
    }
    
    const assessments = [];
    
    // Skip header row, process all data rows
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Safely check if row exists and has content
      if (!row || !Array.isArray(row)) {
        Logger.log(`Row ${i + 1} is not a valid array, skipping`);
        continue;
      }
      
      // Check if row has stakeholder name (not empty)
      const stakeholderName = safeGetValue(row[0]);
      if (!stakeholderName || stakeholderName.toString().trim() === '') {
        continue;
      }
      
      try {
        const assessment = {
          name: stakeholderName,
          sector: safeGetValue(row[1]) || 'Unknown',
          region: safeGetValue(row[2]) || 'Unknown',
          
          // External Assessment scores (Columns D-I) - with safe parsing
          external: {
            socialMedia: safeParseFloat(row[3]),        // D: Social Media (0-18)
            website: safeParseFloat(row[4]),            // E: Website (0-12)
            visualContent: safeParseFloat(row[5]),      // F: Visual Content (0-15)
            discoverability: safeParseFloat(row[6]),    // G: Discoverability (0-12)
            digitalSales: safeParseFloat(row[7]),       // H: Digital Sales (0-8)
            platformIntegration: safeParseFloat(row[8]) // I: Platform Integration (0-5)
          },
          
          // Survey Assessment scores (Columns J-N) - with safe parsing
          survey: {
            digitalComfort: safeParseFloat(row[9]),     // J: Digital Comfort (0-8)
            contentStrategy: safeParseFloat(row[10]),   // K: Content Strategy (0-8)
            platformBreadth: safeParseFloat(row[11]),   // L: Platform Breadth (0-7)
            investmentCapacity: safeParseFloat(row[12]),// M: Investment Capacity (0-4)
            challengeSeverity: safeParseFloat(row[13])  // N: Challenge Severity (0-3)
          },
          
          // Calculated totals (Columns O-S) - with safe parsing
          externalTotal: safeParseFloat(row[14]),       // O: External Total (0-70)
          surveyTotal: safeParseFloat(row[15]),         // P: Survey Total (0-30)
          combinedScore: safeParseFloat(row[16]),       // Q: Combined Score (0-100)
          maturityLevel: safeGetValue(row[17]) || 'Basic', // R: Digital Maturity Level
          correlation: safeParseFloat(row[18]),         // S: Survey-External Correlation
          
          // Meta data - with safe access
          sectorBonus: safeParseFloat(row[19]),         // T: Sector Bonus Points
          contactInfo: safeGetValue(row[20]) || '',     // U: Contact Info
          assessmentDate: safeGetValue(row[21]) || '',  // V: Assessment Date
          notes: safeGetValue(row[22]) || ''           // W: Notes
        };
        
        // Calculate category performance for detailed analysis
        assessment.categoryPerformance = calculateCategoryPerformance(assessment);
        
        // Determine assessment completeness
        assessment.hasExternalData = assessment.externalTotal > 0;
        assessment.hasSurveyData = assessment.surveyTotal > 0;
        assessment.isComplete = assessment.hasExternalData && assessment.hasSurveyData;
        
        assessments.push(assessment);
        
      } catch (rowError) {
        Logger.log(`Error processing row ${i + 1} for ${stakeholderName}: ${rowError.toString()}`);
        continue;
      }
    }
    
    Logger.log(`Successfully processed ${assessments.length} assessments`);
    return assessments;
    
  } catch (error) {
    Logger.log(`Error in getFixedAssessmentData: ${error.toString()}`);
    return [];
  }
}

function calculateFixedMetrics(assessments) {
  try {
    const metrics = {
      overall: calculateOverallMetrics(assessments),
      sectors: calculateFixedSectorMetrics(assessments), // Fixed function
      correlation: calculateCorrelationMetrics(assessments),
      interventions: calculateInterventionMetrics(assessments)
    };
    
    Logger.log(`Metrics calculated - Sectors: ${Object.keys(metrics.sectors).length}`);
    return metrics;
  } catch (error) {
    Logger.log(`Error in calculateFixedMetrics: ${error.toString()}`);
    return {
      overall: getDefaultOverallMetrics(),
      sectors: {},
      correlation: getDefaultCorrelationMetrics(),
      interventions: getDefaultInterventionMetrics()
    };
  }
}

// FIXED: This function was causing the empty sector table
function calculateFixedSectorMetrics(assessments) {
  try {
    const sectorData = {};
    
    Logger.log(`Calculating sector metrics for ${assessments.length} assessments`);
    
    assessments.forEach((assessment, index) => {
      if (!assessment) {
        Logger.log(`Assessment ${index} is null/undefined, skipping`);
        return;
      }
      
      const sector = assessment.sector || 'Unknown';
      
      // Initialize sector data if it doesn't exist
      if (!sectorData[sector]) {
        sectorData[sector] = {
          total: 0,
          withExternal: 0,
          withSurvey: 0,
          complete: 0,
          totalExternal: 0,
          totalSurvey: 0,
          totalCombined: 0,
          maturityDistribution: { Expert: 0, Advanced: 0, Intermediate: 0, Basic: 0 },
          topPerformer: null,
          correlationGaps: [],
          strengthAreas: {},
          weaknessAreas: {},
          assessments: [] // Track individual assessments for debugging
        };
      }
      
      const data = sectorData[sector];
      data.total++;
      data.assessments.push(assessment.name); // For debugging
      
      // Track external assessments
      if (assessment.hasExternalData) {
        data.withExternal++;
        data.totalExternal += assessment.externalTotal || 0;
        
        Logger.log(`${sector}: Added external ${assessment.externalTotal} for ${assessment.name}`);
      }
      
      // Track survey assessments
      if (assessment.hasSurveyData) {
        data.withSurvey++;
        data.totalSurvey += assessment.surveyTotal || 0;
        
        Logger.log(`${sector}: Added survey ${assessment.surveyTotal} for ${assessment.name}`);
      }
      
      // Track complete assessments
      if (assessment.isComplete) {
        data.complete++;
        data.totalCombined += assessment.combinedScore || 0;
      }
      
      // Track maturity distribution
      const maturityLevel = assessment.maturityLevel || 'Basic';
      if (data.maturityDistribution[maturityLevel] !== undefined) {
        data.maturityDistribution[maturityLevel]++;
      } else {
        data.maturityDistribution.Basic++;
        Logger.log(`Unknown maturity level '${maturityLevel}' for ${assessment.name}, defaulting to Basic`);
      }
      
      // Track top performer
      const score = assessment.combinedScore || assessment.externalTotal || 0;
      if (!data.topPerformer || score > data.topPerformer.score) {
        data.topPerformer = {
          name: assessment.name || 'Unknown',
          score: score,
          external: assessment.externalTotal || 0,
          survey: assessment.surveyTotal || 0
        };
      }
      
      // Analyze correlation gaps
      if (assessment.isComplete && (assessment.correlation || 0) > 15) {
        data.correlationGaps.push({
          name: assessment.name || 'Unknown',
          gap: assessment.correlation || 0,
          external: assessment.externalTotal || 0,
          survey: assessment.surveyTotal || 0
        });
      }
    });
    
    // Calculate averages and identify key insights
    Object.keys(sectorData).forEach(sector => {
      const data = sectorData[sector];
      
      // Calculate averages safely
      data.averageExternal = data.withExternal > 0 ? 
        Math.round(data.totalExternal / data.withExternal * 10) / 10 : 0;
      
      data.averageSurvey = data.withSurvey > 0 ? 
        Math.round(data.totalSurvey / data.withSurvey * 10) / 10 : 0;
      
      data.averageCombined = data.complete > 0 ? 
        Math.round(data.totalCombined / data.complete * 10) / 10 : 0;
      
      data.completionRate = data.total > 0 ? 
        Math.round(data.complete / data.total * 100) : 0;
      
      // Determine priority focus area
      if (data.averageExternal > 45 && data.averageSurvey < 15) {
        data.priorityFocus = 'Survey Collection';
      } else if (data.averageSurvey > 20 && data.averageExternal < 35) {
        data.priorityFocus = 'External Improvement';
      } else {
        data.priorityFocus = 'Balanced Growth';
      }
      
      Logger.log(`${sector}: Total=${data.total}, External=${data.averageExternal}, Survey=${data.averageSurvey}, Combined=${data.averageCombined}`);
    });
    
    Logger.log(`Completed sector metrics calculation for ${Object.keys(sectorData).length} sectors`);
    return sectorData;
    
  } catch (error) {
    Logger.log(`Error in calculateFixedSectorMetrics: ${error.toString()}`);
    return {};
  }
}

// FIXED: This function was not properly displaying sector data
function populateFixedSectorPerformanceSection(matrixTab, metrics) {
  try {
    const startRow = 25;
    const t = UITheme();
    
    // Headers
    matrixTab.getRange('A24:I24').setValues([['SECTOR PERFORMANCE COMPARISON', '', '', '', '', '', '', '', '']]);
    matrixTab.getRange('A24:I24').setBackground(t.primary).setFontColor('white').setFontWeight('bold');
    
    // Column headers
    const headers = ['Sector', 'Total', 'External Avg', 'Survey Avg', 'Combined Avg', 'Top Performer', 'Completion Rate', 'Priority Focus', 'Correlation Issues'];
    matrixTab.getRange(startRow, 1, 1, 9).setValues([headers]);
    matrixTab.getRange(startRow, 1, 1, 9).setBackground(t.surface).setFontWeight('bold');
    
    // Check if we have sector data
    if (!metrics.sectors || Object.keys(metrics.sectors).length === 0) {
      Logger.log('No sector data available for display');
      const noDataRow = ['No sector data available - check Master Assessment tab', '', '', '', '', '', '', '', ''];
      matrixTab.getRange(startRow + 1, 1, 1, 9).setValues([noDataRow]);
      return;
    }
    
    // Sort sectors by combined average score (highest first)
    const sortedSectors = Object.entries(metrics.sectors).sort(([,a], [,b]) => {
      const aScore = a.averageCombined || a.averageExternal || 0;
      const bScore = b.averageCombined || b.averageExternal || 0;
      return bScore - aScore;
    });
    
    Logger.log(`Displaying ${sortedSectors.length} sectors in performance table`);
    
    // Prepare sector data for display
    const sectorDisplayData = sortedSectors.map(([sector, data]) => {
      const completionRate = data.completionRate || 0;
      const topPerformerText = data.topPerformer ? 
        `${data.topPerformer.name} (${data.topPerformer.score})` : 'N/A';
      const correlationIssues = (data.correlationGaps && data.correlationGaps.length) || 0;
      
      return [
        sector,
        data.total || 0,
        data.averageExternal || 0,
        data.averageSurvey || 0,
        data.averageCombined || 0,
        topPerformerText,
        `${completionRate}%`,
        data.priorityFocus || 'Assessment Needed',
        correlationIssues
      ];
    });
    
    if (sectorDisplayData.length > 0) {
      // Write the sector data
      matrixTab.getRange(startRow + 1, 1, sectorDisplayData.length, 9).setValues(sectorDisplayData);
      
      // Color-code performance levels
      for (let i = 0; i < sectorDisplayData.length; i++) {
        const combinedScore = sectorDisplayData[i][4] || 0;
        const scoreCell = matrixTab.getRange(startRow + 1 + i, 5);
        
        if (combinedScore >= 70) scoreCell.setBackground(t.successSurface);
        else if (combinedScore >= 50) scoreCell.setBackground(t.warningSurface);
        else if (combinedScore >= 30) scoreCell.setBackground(t.dangerSurface);
        else scoreCell.setBackground(t.danger).setFontColor('white');
      }
      
      Logger.log(`Successfully populated sector performance table with ${sectorDisplayData.length} sectors`);
    } else {
      const noDataRow = ['No valid sector data to display', '', '', '', '', '', '', '', ''];
      matrixTab.getRange(startRow + 1, 1, 1, 9).setValues([noDataRow]);
    }
    
  } catch (error) {
    Logger.log(`Error in populateFixedSectorPerformanceSection: ${error.toString()}`);
    
    // Emergency fallback
    try {
      const startRow = 25;
      const errorRow = [`Error displaying sector data: ${error.toString()}`, '', '', '', '', '', '', '', ''];
      matrixTab.getRange(startRow + 1, 1, 1, 9).setValues([errorRow]);
    } catch (fallbackError) {
      Logger.log(`Even fallback failed: ${fallbackError.toString()}`);
    }
  }
}

// Helper functions with improved error handling
function safeGetValue(cellValue) {
  if (cellValue === null || cellValue === undefined) {
    return '';
  }
  return cellValue;
}

function safeParseFloat(cellValue) {
  if (cellValue === null || cellValue === undefined || cellValue === '' || cellValue === 'SURVEY_REQUIRED') {
    return 0;
  }
  
  const parsed = parseFloat(cellValue);
  return isNaN(parsed) ? 0 : parsed;
}

function calculateCategoryPerformance(assessment) {
  try {
    return {
      // External categories (normalized to percentages)
      socialMediaPct: Math.round((assessment.external.socialMedia / 18) * 100) || 0,
      websitePct: Math.round((assessment.external.website / 12) * 100) || 0,
      visualContentPct: Math.round((assessment.external.visualContent / 15) * 100) || 0,
      discoverabilityPct: Math.round((assessment.external.discoverability / 12) * 100) || 0,
      digitalSalesPct: Math.round((assessment.external.digitalSales / 8) * 100) || 0,
      platformIntegrationPct: Math.round((assessment.external.platformIntegration / 5) * 100) || 0,
      
      // Survey categories (normalized to percentages)
      digitalComfortPct: Math.round((assessment.survey.digitalComfort / 8) * 100) || 0,
      contentStrategyPct: Math.round((assessment.survey.contentStrategy / 8) * 100) || 0,
      platformBreadthPct: Math.round((assessment.survey.platformBreadth / 7) * 100) || 0,
      investmentCapacityPct: Math.round((assessment.survey.investmentCapacity / 4) * 100) || 0,
      challengeManagementPct: Math.round(((3 - assessment.survey.challengeSeverity) / 3) * 100) || 0 // Inverted
    };
  } catch (error) {
    Logger.log(`Error calculating category performance: ${error.toString()}`);
    return {
      socialMediaPct: 0, websitePct: 0, visualContentPct: 0, discoverabilityPct: 0,
      digitalSalesPct: 0, platformIntegrationPct: 0, digitalComfortPct: 0,
      contentStrategyPct: 0, platformBreadthPct: 0, investmentCapacityPct: 0,
      challengeManagementPct: 0
    };
  }
}

// Default metric objects for error recovery
function getDefaultOverallMetrics() {
  return {
    total: 0,
    withExternal: 0,
    withSurvey: 0,
    complete: 0,
    maturityCounts: { Expert: 0, Advanced: 0, Intermediate: 0, Emerging: 0, Absent: 0 },
    maturityPercentages: { Expert: 0, Advanced: 0, Intermediate: 0, Emerging: 0, Absent: 0 },
    averageExternal: 0,
    averageSurvey: 0,
    averageCombined: 0,
    targets2026: { Expert: 0, Advanced: 0, Intermediate: 0, Basic: 0 }
  };
}

function getDefaultCorrelationMetrics() {
  return {
    highExternalLowSurvey: [],
    lowExternalHighSurvey: [],
    balanced: [],
    significantGap: []
  };
}

function getDefaultInterventionMetrics() {
  return {
    'Training & Support': [],
    'Strategic Guidance': [],
    'Balanced Growth': [],
    'Individual Assessment': [],
    'Survey Collection': [],
    'External Assessment': []
  };
}

// Test function to verify data retrieval
function testSectorDataRetrieval() {
  Logger.log('=== Testing Sector Data Retrieval ===');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterTab = ss.getSheetByName('Master Assessment');
  
  if (!masterTab) {
    Logger.log('Master Assessment tab not found');
    return;
  }
  
  const assessmentData = getFixedAssessmentData(masterTab);
  Logger.log(`Retrieved ${assessmentData.length} assessments`);
  
  // Log first few assessments for debugging
  assessmentData.slice(0, 3).forEach((assessment, index) => {
    Logger.log(`Assessment ${index + 1}: ${assessment.name} - Sector: ${assessment.sector} - External: ${assessment.externalTotal} - Survey: ${assessment.surveyTotal}`);
  });
  
  const sectorMetrics = calculateFixedSectorMetrics(assessmentData);
  Logger.log(`Calculated metrics for sectors: ${Object.keys(sectorMetrics).join(', ')}`);
  
  Object.entries(sectorMetrics).forEach(([sector, data]) => {
    Logger.log(`${sector}: ${data.total} total, ${data.averageExternal} avg external, ${data.averageSurvey} avg survey`);
  });
}

/**
 * Missing Functions for digitalreadiness.gs
 * Add these functions to your existing digitalreadiness.gs file
 */

// MISSING FUNCTION 1: clearMatrixContent
function clearMatrixContent(matrixTab) {
  try {
    // Clear content but preserve basic structure
    const lastRow = matrixTab.getLastRow();
    const lastCol = matrixTab.getLastColumn();
    
    if (lastRow > 3 && lastCol > 0) {
      matrixTab.getRange(4, 1, lastRow - 3, lastCol).clearContent();
      matrixTab.getRange(4, 1, lastRow - 3, lastCol).clearFormat();
    }
    
    // Clear any existing charts
    const charts = matrixTab.getCharts();
    charts.forEach(chart => {
      matrixTab.removeChart(chart);
    });
    
    Logger.log('Matrix content cleared successfully');
  } catch (error) {
    Logger.log(`Error in clearMatrixContent: ${error.toString()}`);
  }
}

// MISSING FUNCTION 2: populateEmptyMatrix
function populateEmptyMatrix(matrixTab) {
  try {
    clearMatrixContent(matrixTab);
    matrixTab.getRange('A2').setValue('No assessment data found. Please check Master Assessment tab.');
    matrixTab.getRange('A2').setBackground('#ffcccb');
    Logger.log('Empty matrix populated');
  } catch (error) {
    Logger.log(`Error in populateEmptyMatrix: ${error.toString()}`);
  }
}

// MISSING FUNCTION 3: calculateOverallMetrics (if not already present)
function calculateOverallMetrics(assessments) {
  try {
    const total = assessments.length || 0;
    const withExternal = assessments.filter(a => a && a.hasExternalData).length || 0;
    const withSurvey = assessments.filter(a => a && a.hasSurveyData).length || 0;
    const complete = assessments.filter(a => a && a.isComplete).length || 0;
    
    const maturityCounts = {
      Expert: assessments.filter(a => a && a.maturityLevel === 'Expert').length || 0,
      Advanced: assessments.filter(a => a && a.maturityLevel === 'Advanced').length || 0,
      Intermediate: assessments.filter(a => a && a.maturityLevel === 'Intermediate').length || 0,
      Emerging: assessments.filter(a => a && a.maturityLevel === 'Emerging').length || 0,
      Absent: assessments.filter(a => a && (a.maturityLevel === 'Absent' || !a.maturityLevel)).length || 0
    };
    
    // Calculate averages safely
    const assessmentsWithExternal = assessments.filter(a => a && a.hasExternalData);
    const assessmentsWithSurvey = assessments.filter(a => a && a.hasSurveyData);
    const completeAssessments = assessments.filter(a => a && a.isComplete);
    
    const averageExternal = assessmentsWithExternal.length > 0 ?
      Math.round(assessmentsWithExternal.reduce((sum, a) => sum + (a.externalTotal || 0), 0) / assessmentsWithExternal.length * 10) / 10 : 0;
    
    const averageSurvey = assessmentsWithSurvey.length > 0 ?
      Math.round(assessmentsWithSurvey.reduce((sum, a) => sum + (a.surveyTotal || 0), 0) / assessmentsWithSurvey.length * 10) / 10 : 0;
    
    const averageCombined = completeAssessments.length > 0 ?
      Math.round(completeAssessments.reduce((sum, a) => sum + (a.combinedScore || 0), 0) / completeAssessments.length * 10) / 10 : 0;
    
    return {
      total,
      withExternal,
      withSurvey,
      complete,
      maturityCounts,
      maturityPercentages: {
        Expert: total > 0 ? Math.round(maturityCounts.Expert / total * 100) : 0,
        Advanced: total > 0 ? Math.round(maturityCounts.Advanced / total * 100) : 0,
        Intermediate: total > 0 ? Math.round(maturityCounts.Intermediate / total * 100) : 0,
        Emerging: total > 0 ? Math.round(maturityCounts.Emerging / total * 100) : 0,
        Absent: total > 0 ? Math.round(maturityCounts.Absent / total * 100) : 0
      },
      averageExternal,
      averageSurvey,
      averageCombined,
      digitalReadinessPct: total > 0 ? Math.round((maturityCounts.Expert + maturityCounts.Advanced) / total * 100) : 0,
      targets2026: {
        Expert: Math.ceil(total * 0.25),
        Advanced: Math.ceil(total * 0.35),
        Intermediate: Math.ceil(total * 0.30),
        Basic: Math.floor(total * 0.10)
      }
    };
  } catch (error) {
    Logger.log(`Error in calculateOverallMetrics: ${error.toString()}`);
    return getDefaultOverallMetrics();
  }
}

// MISSING FUNCTION 4: populateOverallMaturitySection
function populateOverallMaturitySection(matrixTab, metrics) {
  try {
    const startRow = 5;
    const t = UITheme();
    
    // Headers
    matrixTab.getRange('A4:F4').setValues([['OVERALL DIGITAL MATURITY DISTRIBUTION', '', '', '', '', '']]);
    matrixTab.getRange('A4:F4').setBackground(t.primary).setFontColor('white').setFontWeight('bold');
    
    // Data with External/Survey split
    const maturityData = [
      ['Maturity Level', 'Count', 'Percentage', '2026 Target', 'Avg External', 'Avg Survey'],
      ['Expert (80-100)', metrics.overall.maturityCounts.Expert, `${metrics.overall.maturityPercentages.Expert}%`, metrics.overall.targets2026.Expert, '', ''],
      ['Advanced (60-79)', metrics.overall.maturityCounts.Advanced, `${metrics.overall.maturityPercentages.Advanced}%`, metrics.overall.targets2026.Advanced, '', ''],
      ['Intermediate (40-59)', metrics.overall.maturityCounts.Intermediate, `${metrics.overall.maturityPercentages.Intermediate}%`, metrics.overall.targets2026.Intermediate, '', ''],
      ['Emerging (20-39)', metrics.overall.maturityCounts.Emerging, `${metrics.overall.maturityPercentages.Emerging}%`, '', '', ''],
      ['Absent (0-19)', metrics.overall.maturityCounts.Absent, `${metrics.overall.maturityPercentages.Absent}%`, '', '', ''],
      ['', '', '', '', '', ''],
      ['ASSESSMENT COMPLETION STATUS', '', '', '', '', ''],
      ['Total Stakeholders', metrics.overall.total, '100%', '', '', ''],
      ['With External Assessment', metrics.overall.withExternal, `${Math.round(metrics.overall.withExternal/Math.max(metrics.overall.total, 1)*100)}%`, '', `${metrics.overall.averageExternal}/70`, ''],
      ['With Survey Data', metrics.overall.withSurvey, `${Math.round(metrics.overall.withSurvey/Math.max(metrics.overall.total, 1)*100)}%`, '', '', `${metrics.overall.averageSurvey}/30`],
      ['Complete (Both)', metrics.overall.complete, `${Math.round(metrics.overall.complete/Math.max(metrics.overall.total, 1)*100)}%`, '', '', '']
    ];
    
    matrixTab.getRange(startRow, 1, maturityData.length, 6).setValues(maturityData);
    
    // Format sections
    matrixTab.getRange(startRow, 1, 1, 6).setBackground(t.surface).setFontWeight('bold');
    matrixTab.getRange(startRow + 6, 1, 1, 6).setBackground(t.accentSurface).setFontWeight('bold');
    
    Logger.log('Overall maturity section populated');
  } catch (error) {
    Logger.log(`Error in populateOverallMaturitySection: ${error.toString()}`);
  }
}

// MISSING FUNCTION 5: populateExternalVsSurveySection
function populateExternalVsSurveySection(matrixTab, metrics) {
  try {
    const startRow = 18;
    const t = UITheme();
    
    // Headers
    matrixTab.getRange('A17:E17').setValues([['EXTERNAL VS SURVEY PERFORMANCE ANALYSIS', '', '', '', '']]);
    matrixTab.getRange('A17:E17').setBackground(t.secondary).setFontColor('white').setFontWeight('bold');
    
    // Safe access to interventions with complete fallback
    let trainingSupport = 0;
    let strategicGuidance = 0;
    let balancedGrowth = 0;
    let individualAssessment = 0;
    let surveyCollection = 0;
    let externalAssessment = 0;
    
    // Use interventions data if available
    if (metrics.interventions) {
      trainingSupport = metrics.interventions['Training & Support'] ? metrics.interventions['Training & Support'].length : 0;
      strategicGuidance = metrics.interventions['Strategic Guidance'] ? metrics.interventions['Strategic Guidance'].length : 0;
      balancedGrowth = metrics.interventions['Balanced Growth'] ? metrics.interventions['Balanced Growth'].length : 0;
      individualAssessment = metrics.interventions['Individual Assessment'] ? metrics.interventions['Individual Assessment'].length : 0;
      surveyCollection = metrics.interventions['Survey Collection'] ? metrics.interventions['Survey Collection'].length : 0;
      externalAssessment = metrics.interventions['External Assessment'] ? metrics.interventions['External Assessment'].length : 0;
    }
    
    const correlationData = [
      ['Analysis Type', 'Count', 'Percentage', 'Intervention Priority', 'Recommended Action'],
      ['High External + Low Survey', trainingSupport, '', 'Training & Support', 'Digital literacy, technical assistance'],
      ['Low External + High Survey', strategicGuidance, '', 'Strategic Guidance', 'Platform optimization, content strategy'],
      ['Balanced Development', balancedGrowth, '', 'Incremental Growth', 'Advanced training, scaling support'],
      ['Significant Gaps', individualAssessment, '', 'Priority Investigation', 'Individual assessment, targeted intervention'],
      ['Missing Survey Data', surveyCollection, '', 'Data Collection', 'Priority survey collection'],
      ['Missing External Data', externalAssessment, '', 'Assessment Completion', 'Complete external assessment']
    ];
    
    matrixTab.getRange(startRow, 1, correlationData.length, 5).setValues(correlationData);
    matrixTab.getRange(startRow, 1, 1, 5).setBackground(t.surface).setFontWeight('bold');
    
    Logger.log('External vs Survey section populated');
  } catch (error) {
    Logger.log(`Error in populateExternalVsSurveySection: ${error.toString()}`);
  }
}

// MISSING FUNCTION 6: calculateCorrelationMetrics
function calculateCorrelationMetrics(assessments) {
  try {
    const completeAssessments = assessments.filter(a => a && a.isComplete);
    
    const correlationTypes = {
      highExternalLowSurvey: completeAssessments.filter(a => (a.externalTotal || 0) > 45 && (a.surveyTotal || 0) < 15),
      lowExternalHighSurvey: completeAssessments.filter(a => (a.externalTotal || 0) < 35 && (a.surveyTotal || 0) > 20),
      balanced: completeAssessments.filter(a => (a.correlation || 0) < 10),
      significantGap: completeAssessments.filter(a => (a.correlation || 0) > 20)
    };
    
    return correlationTypes;
  } catch (error) {
    Logger.log(`Error in calculateCorrelationMetrics: ${error.toString()}`);
    return getDefaultCorrelationMetrics();
  }
}

// MISSING FUNCTION 7: calculateInterventionMetrics
function calculateInterventionMetrics(assessments) {
  try {
    Logger.log('Calculating intervention metrics...');
    
    // Initialize intervention categories
    const interventionTypes = {
      'Training & Support': [],
      'Strategic Guidance': [],
      'Balanced Growth': [],
      'Individual Assessment': [],
      'Survey Collection': [],
      'External Assessment': []
    };

    if (!assessments || assessments.length === 0) {
      Logger.log('No assessments provided for intervention calculation');
      return interventionTypes;
    }

    assessments.forEach(assessment => {
      if (!assessment) return;
      
      try {
        // Determine intervention type based on assessment status and scores
        if (assessment.isComplete) {
          // Complete assessments - analyze the performance gap
          const externalPct = (assessment.externalTotal || 0) / 70 * 100;
          const surveyPct = (assessment.surveyTotal || 0) / 30 * 100;
          const gap = Math.abs(externalPct - surveyPct);
          
          if (externalPct > 65 && surveyPct < 50) {
            interventionTypes['Training & Support'].push(assessment);
          } else if (externalPct < 50 && surveyPct > 65) {
            interventionTypes['Strategic Guidance'].push(assessment);
          } else if (gap < 15) {
            interventionTypes['Balanced Growth'].push(assessment);
          } else {
            interventionTypes['Individual Assessment'].push(assessment);
          }
        } else if (assessment.hasExternalData && !assessment.hasSurveyData) {
          // Has external data but missing survey
          interventionTypes['Survey Collection'].push(assessment);
        } else {
          // Missing external data
          interventionTypes['External Assessment'].push(assessment);
        }
      } catch (assessmentError) {
        Logger.log(`Error processing assessment ${assessment.name}: ${assessmentError.toString()}`);
      }
    });

    Logger.log('Intervention metrics calculated successfully');
    return interventionTypes;
  } catch (error) {
    Logger.log(`Error in calculateInterventionMetrics: ${error.toString()}`);
    return getDefaultInterventionMetrics();
  }
}

// MISSING FUNCTION 8: populateFlexibleCorrelationAnalysisSection
function populateFlexibleCorrelationAnalysisSection(matrixTab, metrics) {
  try {
    const startRow = 37;
    const t = UITheme();
    
    // Headers
    matrixTab.getRange('A36:F36').setValues([['CORRELATION ANALYSIS (Flexible Scoring)', '', '', '', '', '']]);
    matrixTab.getRange('A36:F36').setBackground(t.secondary).setFontColor('white').setFontWeight('bold');
    
    // Safe access to correlation data
    let highExternalLowSurvey = [];
    let lowExternalHighSurvey = [];
    let balanced = [];
    let significantGap = [];
    
    if (metrics.correlation) {
      highExternalLowSurvey = Array.isArray(metrics.correlation.highExternalLowSurvey) ? metrics.correlation.highExternalLowSurvey : [];
      lowExternalHighSurvey = Array.isArray(metrics.correlation.lowExternalHighSurvey) ? metrics.correlation.lowExternalHighSurvey : [];
      balanced = Array.isArray(metrics.correlation.balanced) ? metrics.correlation.balanced : [];
      significantGap = Array.isArray(metrics.correlation.significantGap) ? metrics.correlation.significantGap : [];
    }
    
    // Safely get example names
    const getExampleNames = (array, count = 2) => {
      if (!Array.isArray(array) || array.length === 0) {
        return 'No examples available';
      }
      return array.slice(0, count).map(s => s.name || 'Unknown').join(', ');
    };
    
    const correlationData = [
      ['Correlation Type', 'Count', 'Description', 'Example Stakeholders', 'Recommended Action', 'Priority Level'],
      ['High External, Low Survey', highExternalLowSurvey.length, 'Strong online presence but low self-reported skills',
        getExampleNames(highExternalLowSurvey), 'Digital literacy training', 'Medium'],
      ['Low External, High Survey', lowExternalHighSurvey.length, 'High confidence but weak online presence',
       getExampleNames(lowExternalHighSurvey), 'Technical implementation support', 'High'],
      ['Balanced Development', balanced.length, 'Aligned external presence and self-assessment',
       getExampleNames(balanced), 'Advanced training programs', 'Low'],
      ['Significant Gaps', significantGap.length, 'Major disconnect between assessments',
       getExampleNames(significantGap), 'Individual consultation', 'Critical']
    ];
    
    matrixTab.getRange(startRow, 1, correlationData.length, 6).setValues(correlationData);
    matrixTab.getRange(startRow, 1, 1, 6).setBackground(t.surface).setFontWeight('bold');
    
    Logger.log('Correlation analysis section populated');
  } catch (error) {
    Logger.log(`Error in populateFlexibleCorrelationAnalysisSection: ${error.toString()}`);
  }
}

// MISSING FUNCTION 9: populateDetailedBreakdown
function populateDetailedBreakdown(matrixTab, assessments) {
  try {
    const startRow = 42;
    const t = UITheme();
    
    // Headers
    matrixTab.getRange('A41:J41').setValues([['DETAILED STAKEHOLDER BREAKDOWN', '', '', '', '', '', '', '', '', '']]);
    matrixTab.getRange('A41:J41').setBackground(t.secondary).setFontColor('white').setFontWeight('bold');
    
    const detailHeaders = [
      'Stakeholder', 'Sector', 'Region', 'External Score', 'Survey Score', 'Combined Score',
      'Maturity Level', 'Assessment Status', 'Key Strengths', 'Priority Areas'
    ];
    
    matrixTab.getRange(startRow, 1, 1, 10).setValues([detailHeaders]);
    matrixTab.getRange(startRow, 1, 1, 10).setBackground(t.surface).setFontWeight('bold');
    
    // Sort assessments by combined score (highest first)
    const sortedAssessments = assessments.sort((a, b) => (b.combinedScore || b.externalTotal || 0) - (a.combinedScore || a.externalTotal || 0));
    
    const detailData = sortedAssessments.map(assessment => {
      // Identify key strengths (top performing categories)
      const strengths = [];
      const categoryPerf = assessment.categoryPerformance || {};
      
      if ((categoryPerf.socialMediaPct || 0) >= 75) strengths.push('Social Media');
      if ((categoryPerf.visualContentPct || 0) >= 75) strengths.push('Visual Content');
      if ((categoryPerf.discoverabilityPct || 0) >= 75) strengths.push('Discoverability');
      if ((categoryPerf.digitalComfortPct || 0) >= 75) strengths.push('Digital Skills');
      
      // Identify priority areas (lowest performing categories)
      const priorities = [];
      if ((categoryPerf.socialMediaPct || 0) < 30) priorities.push('Social Media');
      if ((categoryPerf.websitePct || 0) < 30) priorities.push('Website');
      if ((categoryPerf.visualContentPct || 0) < 30) priorities.push('Visual Content');
      if ((categoryPerf.discoverabilityPct || 0) < 30) priorities.push('Discoverability');
      if ((categoryPerf.digitalComfortPct || 0) < 30) priorities.push('Digital Training');
      
      // Assessment status
      let status = 'External Only';
      if (assessment.isComplete) status = 'Complete';
      else if (assessment.hasSurveyData) status = 'Survey Only';
      
      return [
        assessment.name || 'Unknown',
        assessment.sector || 'Unknown',
        assessment.region || 'Unknown',
        assessment.hasExternalData ? `${assessment.externalTotal || 0}/70` : 'Pending',
        assessment.hasSurveyData ? `${assessment.surveyTotal || 0}/30` : 'Pending',
        (assessment.combinedScore || 0) > 0 ? (assessment.combinedScore || 0) : (assessment.externalTotal || 0),
        assessment.maturityLevel || 'Basic',
        status,
        strengths.join(', ') || 'Assessment Needed',
        priorities.join(', ') || 'Maintain Performance'
      ];
    });
    
    // Write detailed data
    if (detailData.length > 0) {
      const range = matrixTab.getRange(startRow + 1, 1, detailData.length, 10);
      range.setValues(detailData);
      
      // Format maturity levels with colors
      for (let i = 0; i < detailData.length; i++) {
        const maturityCell = matrixTab.getRange(startRow + 1 + i, 7);
        const maturityLevel = detailData[i][6];
        
        try {
          switch(maturityLevel) {
            case 'Expert':
              maturityCell.setBackground(t.success).setFontColor('white');
              break;
            case 'Advanced':
              maturityCell.setBackground(t.info).setFontColor('white');
              break;
            case 'Intermediate':
              maturityCell.setBackground(t.warning).setFontColor('black');
              break;
            default:
              maturityCell.setBackground(t.danger).setFontColor('white');
          }
        } catch (formatError) {
          Logger.log(`Error formatting maturity cell for row ${i}: ${formatError.toString()}`);
        }
      }
    }
    
    Logger.log('Detailed breakdown populated');
  } catch (error) {
    Logger.log(`Error in populateDetailedBreakdown: ${error.toString()}`);
  }
}

// MISSING FUNCTION 10: addMatrixSummaryStats
function addMatrixSummaryStats(matrixTab, assessments) {
  try {
    // Add overall statistics at the top
    const timestamp = new Date().toLocaleString();
    const totalAssessments = assessments.length || 0;
    const completeAssessments = assessments.filter(a => a && a.isComplete).length || 0;
    const averageExternal = assessments.filter(a => a && a.hasExternalData).length > 0 ?
      Math.round(assessments.filter(a => a && a.hasExternalData).reduce((sum, a) => sum + (a.externalTotal || 0), 0) / assessments.filter(a => a && a.hasExternalData).length * 10) / 10 : 0;
    
    // Update summary information
    matrixTab.getRange('A2').setValue(`Last Updated: ${timestamp}`);
    matrixTab.getRange('C2').setValue(`Total Stakeholders: ${totalAssessments}`);
    matrixTab.getRange('E2').setValue(`Complete Assessments: ${completeAssessments}`);
    matrixTab.getRange('G2').setValue(`Avg External Score: ${averageExternal}/70`);
    
    Logger.log('Matrix summary stats added');
  } catch (error) {
    Logger.log(`Error in addMatrixSummaryStats: ${error.toString()}`);
  }
}

// MISSING FUNCTION 11: refreshDigitalReadinessMatrix (for menu integration)
function refreshDigitalReadinessMatrix() {
  try {
    generateDigitalReadinessMatrix();
    
    const ui = SpreadsheetApp.getUi();
    ui.alert('Digital Readiness Matrix Updated',
             'The matrix has been refreshed with the latest assessment data using the new External/Survey framework.',
             ui.ButtonSet.OK);
  } catch (error) {
    Logger.log(`Error in refreshDigitalReadinessMatrix: ${error.toString()}`);
    const ui = SpreadsheetApp.getUi();
    ui.alert('Error', `Failed to refresh matrix: ${error.toString()}`, ui.ButtonSet.OK);
  }
}