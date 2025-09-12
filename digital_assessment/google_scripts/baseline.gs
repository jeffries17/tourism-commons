/**
 * Gambia Creative Industries Digital Assessment - Updated Baseline Metrics Dashboard
 * Enhanced for External Assessment (70pts) + Survey Integration (30pts) framework
 * Advanced analytics with correlation analysis and intervention planning
 */

function generateBaselineMetricsDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterTab = ss.getSheetByName('Master Assessment');
  const metricsTab = ss.getSheetByName('Baseline Metrics');
  
  if (!masterTab || !metricsTab) {
    Logger.log('Required tabs not found');
    return;
  }
  
  // Get assessment data with new structure
  const assessmentData = getAssessmentDataForMetrics(masterTab);
  
  if (assessmentData.length === 0) {
    populateEmptyDashboard(metricsTab);
    return;
  }
  
  // Generate comprehensive metrics with External/Survey analysis
  const metrics = calculateEnhancedBaselineMetrics(assessmentData);
  
  // Clear existing content
  clearMetricsContent(metricsTab);
  
  // Populate enhanced dashboard sections
  populateOverallMaturitySection(metricsTab, metrics);
  populateExternalVsSurveySection(metricsTab, metrics);
  populateSectorPerformanceSection(metricsTab, metrics);
  populatePlatformPresenceSection(metricsTab, metrics);
  populateCoreBaselinesSection(metricsTab, metrics);
  populateKPISection(metricsTab, metrics);
  populateCapacityBuildingMatrix(metricsTab, metrics);
  
  // Apply consistent sheet frame
  applyDefaultSheetFrame(metricsTab);
  
  // Create enhanced charts
  createMaturityDistributionChart(metricsTab, metrics);
  createExternalVsSurveyChart(metricsTab, metrics);
  createSectorPerformanceChart(metricsTab, metrics);
  createInterventionPriorityChart(metricsTab, metrics);
  
  // Add comprehensive timestamp and summary
  metricsTab.getRange('A2').setValue(`📊 Dashboard Updated: ${new Date().toLocaleString()}`);
  metricsTab.getRange('A3').setValue(`📈 Total: ${assessmentData.length} | External: ${metrics.overall.withExternal} | Survey: ${metrics.overall.withSurvey} | Complete: ${metrics.overall.complete}`);
  
  Logger.log('Enhanced Baseline Metrics Dashboard updated successfully');
}

function getAssessmentDataForMetrics(masterTab) {
  const data = masterTab.getDataRange().getValues();
  const assessments = [];
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    // Check if row has stakeholder name
    if (row[0] && row[0].toString().trim() !== '') {
      const assessment = {
        name: row[0],
        sector: row[1] || 'Unknown',
        region: row[2] || 'Unknown',
        
        // External Assessment detailed scores (Columns D-I)
        external: {
          socialMedia: parseFloat(row[3]) || 0,        // D: (0-18)
          website: parseFloat(row[4]) || 0,            // E: (0-12)
          visualContent: parseFloat(row[5]) || 0,      // F: (0-15)
          discoverability: parseFloat(row[6]) || 0,    // G: (0-12)
          digitalSales: parseFloat(row[7]) || 0,       // H: (0-8)
          platformIntegration: parseFloat(row[8]) || 0 // I: (0-5)
        },
        
        // Survey Assessment detailed scores (Columns J-N)
        survey: {
          digitalComfort: parseFloat(row[9]) || 0,     // J: (0-8)
          contentStrategy: parseFloat(row[10]) || 0,   // K: (0-8)
          platformBreadth: parseFloat(row[11]) || 0,   // L: (0-7)
          investmentCapacity: parseFloat(row[12]) || 0,// M: (0-4)
          challengeSeverity: parseFloat(row[13]) || 0  // N: (0-3)
        },
        
        // Calculated totals
        externalTotal: parseFloat(row[14]) || 0,       // O: (0-70)
        surveyTotal: parseFloat(row[15]) || 0,         // P: (0-30)
        combinedScore: parseFloat(row[16]) || 0,       // Q: (0-100)
        maturityLevel: row[17] || 'Basic',             // R: Maturity Level
        correlation: parseFloat(row[18]) || 0,         // S: Correlation Gap
        
        assessmentDate: row[21] || new Date()          // V: Assessment Date
      };
      
      // Calculate performance indicators
      assessment.performance = {
        // External category percentages
        socialMediaPct: Math.round(assessment.external.socialMedia / 18 * 100),
        websitePct: Math.round(assessment.external.website / 12 * 100),
        visualContentPct: Math.round(assessment.external.visualContent / 15 * 100),
        discoverabilityPct: Math.round(assessment.external.discoverability / 12 * 100),
        digitalSalesPct: Math.round(assessment.external.digitalSales / 8 * 100),
        platformIntegrationPct: Math.round(assessment.external.platformIntegration / 5 * 100),
        
        // Survey category percentages
        digitalComfortPct: Math.round(assessment.survey.digitalComfort / 8 * 100),
        contentStrategyPct: Math.round(assessment.survey.contentStrategy / 8 * 100),
        platformBreadthPct: Math.round(assessment.survey.platformBreadth / 7 * 100),
        investmentCapacityPct: Math.round(assessment.survey.investmentCapacity / 4 * 100),
        challengeManagementPct: Math.round((3 - assessment.survey.challengeSeverity) / 3 * 100)
      };
      
      // Assessment completeness tracking
      assessment.hasExternalData = assessment.externalTotal > 0;
      assessment.hasSurveyData = assessment.surveyTotal > 0;
      assessment.isComplete = assessment.hasExternalData && assessment.hasSurveyData;
      
      // Intervention type classification
      if (assessment.isComplete) {
        if (assessment.externalTotal > 45 && assessment.surveyTotal < 15) {
          assessment.interventionType = 'Training & Support';
        } else if (assessment.externalTotal < 35 && assessment.surveyTotal > 20) {
          assessment.interventionType = 'Strategic Guidance';
        } else if (assessment.correlation < 10) {
          assessment.interventionType = 'Balanced Growth';
        } else {
          assessment.interventionType = 'Individual Assessment';
        }
      } else if (assessment.hasExternalData) {
        assessment.interventionType = 'Survey Collection';
      } else {
        assessment.interventionType = 'External Assessment';
      }
      
      assessments.push(assessment);
    }
  }
  
  return assessments;
}

function calculateEnhancedBaselineMetrics(assessments) {
  const metrics = {
    overall: calculateOverallMetrics(assessments),
    sectors: calculateSectorMetrics(assessments),
    regions: calculateRegionMetrics(assessments),
    platforms: calculatePlatformMetrics(assessments),
    categories: calculateCategoryMetrics(assessments),
    interventions: calculateInterventionMetrics(assessments),
    capacity: calculateCapacityMetrics(assessments)
  };
  
  return metrics;
}

function calculateOverallMetrics(assessments) {
  const total = assessments.length;
  const withExternal = assessments.filter(a => a.hasExternalData).length;
  const withSurvey = assessments.filter(a => a.hasSurveyData).length;
  const complete = assessments.filter(a => a.isComplete).length;
  
  const maturityCounts = {
    Expert: assessments.filter(a => a.maturityLevel === 'Expert').length,
    Advanced: assessments.filter(a => a.maturityLevel === 'Advanced').length,
    Intermediate: assessments.filter(a => a.maturityLevel === 'Intermediate').length,
    Basic: assessments.filter(a => a.maturityLevel === 'Basic').length
  };
  
  // Calculate comprehensive averages
  const externalAssessments = assessments.filter(a => a.hasExternalData);
  const surveyAssessments = assessments.filter(a => a.hasSurveyData);
  const completeAssessments = assessments.filter(a => a.isComplete);
  
  const averageExternal = externalAssessments.length > 0 ? 
    Math.round(externalAssessments.reduce((sum, a) => sum + a.externalTotal, 0) / externalAssessments.length * 10) / 10 : 0;
  
  const averageSurvey = surveyAssessments.length > 0 ? 
    Math.round(surveyAssessments.reduce((sum, a) => sum + a.surveyTotal, 0) / surveyAssessments.length * 10) / 10 : 0;
  
  const averageCombined = completeAssessments.length > 0 ? 
    Math.round(completeAssessments.reduce((sum, a) => sum + a.combinedScore, 0) / completeAssessments.length * 10) / 10 : 0;
  
  // Top performers analysis
  const topExternalPerformers = externalAssessments.sort((a, b) => b.externalTotal - a.externalTotal).slice(0, 3);
  const topSurveyPerformers = surveyAssessments.sort((a, b) => b.surveyTotal - a.surveyTotal).slice(0, 3);
  const topCombinedPerformers = completeAssessments.sort((a, b) => b.combinedScore - a.combinedScore).slice(0, 3);
  
  return {
    total,
    withExternal,
    withSurvey,
    complete,
    maturityCounts,
    maturityPercentages: {
      Expert: Math.round(maturityCounts.Expert / total * 100) || 0,
      Advanced: Math.round(maturityCounts.Advanced / total * 100) || 0,
      Intermediate: Math.round(maturityCounts.Intermediate / total * 100) || 0,
      Basic: Math.round(maturityCounts.Basic / total * 100) || 0
    },
    averageExternal,
    averageSurvey,
    averageCombined,
    digitalReadinessPct: Math.round((maturityCounts.Expert + maturityCounts.Advanced) / total * 100) || 0,
    topExternalPerformers,
    topSurveyPerformers,
    topCombinedPerformers,
    targets2026: {
      Expert: Math.ceil(total * 0.25),
      Advanced: Math.ceil(total * 0.35),
      Intermediate: Math.ceil(total * 0.30),
      Basic: Math.floor(total * 0.10)
    }
  };
}

function calculateSectorMetrics(assessments) {
  const sectorData = {};
  
  assessments.forEach(assessment => {
    const sector = assessment.sector;
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
        topCombinedPerformer: null,
        topExternalPerformer: null,
        interventionTypes: {},
        strengthCategories: {},
        weaknessCategories: {}
      };
    }
    
    const data = sectorData[sector];
    data.total++;
    
    if (assessment.hasExternalData) {
      data.withExternal++;
      data.totalExternal += assessment.externalTotal;
    }
    
    if (assessment.hasSurveyData) {
      data.withSurvey++;
      data.totalSurvey += assessment.surveyTotal;
    }
    
    if (assessment.isComplete) {
      data.complete++;
      data.totalCombined += assessment.combinedScore;
    }
    
    data.maturityDistribution[assessment.maturityLevel]++;
    
    // Track top performers
    if (!data.topCombinedPerformer || assessment.combinedScore > data.topCombinedPerformer.score) {
      data.topCombinedPerformer = {
        name: assessment.name,
        score: assessment.combinedScore
      };
    }
    
    if (!data.topExternalPerformer || assessment.externalTotal > data.topExternalPerformer.score) {
      data.topExternalPerformer = {
        name: assessment.name,
        score: assessment.externalTotal
      };
    }
    
    // Track intervention types
    if (!data.interventionTypes[assessment.interventionType]) {
      data.interventionTypes[assessment.interventionType] = 0;
    }
    data.interventionTypes[assessment.interventionType]++;
    
    // Analyze category strengths and weaknesses
    const performance = assessment.performance;
    Object.keys(performance).forEach(category => {
      const pct = performance[category];
      if (pct >= 75) {
        if (!data.strengthCategories[category]) data.strengthCategories[category] = 0;
        data.strengthCategories[category]++;
      } else if (pct <= 25) {
        if (!data.weaknessCategories[category]) data.weaknessCategories[category] = 0;
        data.weaknessCategories[category]++;
      }
    });
  });
  
  // Calculate averages and identify key insights
  Object.keys(sectorData).forEach(sector => {
    const data = sectorData[sector];
    data.averageExternal = data.withExternal > 0 ? Math.round(data.totalExternal / data.withExternal * 10) / 10 : 0;
    data.averageSurvey = data.withSurvey > 0 ? Math.round(data.totalSurvey / data.withSurvey * 10) / 10 : 0;
    data.averageCombined = data.complete > 0 ? Math.round(data.totalCombined / data.complete * 10) / 10 : 0;
    data.completionRate = data.total > 0 ? Math.round(data.complete / data.total * 100) : 0;
    
    // Identify biggest strength and weakness
    data.biggestStrength = Object.keys(data.strengthCategories).reduce((a, b) => 
      data.strengthCategories[a] > data.strengthCategories[b] ? a : b, Object.keys(data.strengthCategories)[0]);
    data.biggestWeakness = Object.keys(data.weaknessCategories).reduce((a, b) => 
      data.weaknessCategories[a] > data.weaknessCategories[b] ? a : b, Object.keys(data.weaknessCategories)[0]);
  });
  
  return sectorData;
}

function calculatePlatformMetrics(assessments) {
  const externalAssessments = assessments.filter(a => a.hasExternalData);
  
  const platformCategories = {
    socialMedia: { name: 'Social Media Business', maxScore: 18, scores: [] },
    website: { name: 'Website Presence', maxScore: 12, scores: [] },
    visualContent: { name: 'Visual Content Quality', maxScore: 15, scores: [] },
    discoverability: { name: 'Online Discoverability', maxScore: 12, scores: [] },
    digitalSales: { name: 'Digital Sales/Booking', maxScore: 8, scores: [] },
    platformIntegration: { name: 'Platform Integration', maxScore: 5, scores: [] }
  };
  
  externalAssessments.forEach(assessment => {
    Object.keys(platformCategories).forEach(categoryKey => {
      platformCategories[categoryKey].scores.push(assessment.external[categoryKey]);
    });
  });
  
  // Calculate statistics for each category
  Object.keys(platformCategories).forEach(categoryKey => {
    const category = platformCategories[categoryKey];
    const scores = category.scores;
    const total = scores.length;
    
    if (total > 0) {
      category.average = Math.round(scores.reduce((sum, score) => sum + score, 0) / total * 10) / 10;
      category.percentageOfMax = Math.round(category.average / category.maxScore * 100);
      category.strongPresence = scores.filter(score => score >= category.maxScore * 0.75).length;
      category.basicPresence = scores.filter(score => score >= category.maxScore * 0.25 && score < category.maxScore * 0.75).length;
      category.noPresence = scores.filter(score => score < category.maxScore * 0.25).length;
      category.improvementPriority = category.noPresence > total * 0.4 ? 'High' : 
                                   category.basicPresence > total * 0.5 ? 'Medium' : 'Low';
    }
  });
  
  return platformCategories;
}

function calculateInterventionMetrics(assessments) {
  const interventionTypes = {
    'Training & Support': assessments.filter(a => a.interventionType === 'Training & Support'),
    'Strategic Guidance': assessments.filter(a => a.interventionType === 'Strategic Guidance'),
    'Balanced Growth': assessments.filter(a => a.interventionType === 'Balanced Growth'),
    'Individual Assessment': assessments.filter(a => a.interventionType === 'Individual Assessment'),
    'Survey Collection': assessments.filter(a => a.interventionType === 'Survey Collection'),
    'External Assessment': assessments.filter(a => a.interventionType === 'External Assessment')
  };
  
  return interventionTypes;
}

function calculateCapacityMetrics(assessments) {
  const surveyAssessments = assessments.filter(a => a.hasSurveyData);
  
  const capacityMatrix = {
    lowInvestmentHighComfort: surveyAssessments.filter(a => a.survey.investmentCapacity <= 1 && a.survey.digitalComfort >= 6),
    highInvestmentLowComfort: surveyAssessments.filter(a => a.survey.investmentCapacity >= 3 && a.survey.digitalComfort <= 3),
    highInvestmentHighComfort: surveyAssessments.filter(a => a.survey.investmentCapacity >= 3 && a.survey.digitalComfort >= 6),
    lowInvestmentLowComfort: surveyAssessments.filter(a => a.survey.investmentCapacity <= 1 && a.survey.digitalComfort <= 3)
  };
  
  return capacityMatrix;
}

function populateOverallMaturitySection(metricsTab, metrics) {
  const startRow = 5;
  const t = UITheme();
  
  // Headers
  metricsTab.getRange('A4:F4').setValues([['OVERALL DIGITAL MATURITY DISTRIBUTION', '', '', '', '', '']]);
  metricsTab.getRange('A4:F4').setBackground(t.primary).setFontColor('white').setFontWeight('bold');
  
  // Enhanced maturity data with External/Survey breakdown
  const maturityData = [
    ['Maturity Level', 'Current Count', 'Current %', '2026 Target', 'Avg External (/70)', 'Avg Survey (/30)'],
    ['Expert (80-100)', metrics.overall.maturityCounts.Expert, `${metrics.overall.maturityPercentages.Expert}%`, metrics.overall.targets2026.Expert, '', ''],
    ['Advanced (60-79)', metrics.overall.maturityCounts.Advanced, `${metrics.overall.maturityPercentages.Advanced}%`, metrics.overall.targets2026.Advanced, '', ''],
    ['Intermediate (40-59)', metrics.overall.maturityCounts.Intermediate, `${metrics.overall.maturityPercentages.Intermediate}%`, metrics.overall.targets2026.Intermediate, '', ''],
    ['Basic (0-39)', metrics.overall.maturityCounts.Basic, `${metrics.overall.maturityPercentages.Basic}%`, metrics.overall.targets2026.Basic, '', ''],
    ['', '', '', '', '', ''],
    ['KEY METRICS SUMMARY', '', '', '', '', ''],
    ['Total Stakeholders', metrics.overall.total, '100%', '', '', ''],
    ['Digital Ready (60+)', metrics.overall.maturityCounts.Expert + metrics.overall.maturityCounts.Advanced, `${metrics.overall.digitalReadinessPct}%`, '', '', ''],
    ['External Assessments Complete', metrics.overall.withExternal, `${Math.round(metrics.overall.withExternal/metrics.overall.total*100)}%`, '', `${metrics.overall.averageExternal}`, ''],
    ['Survey Data Available', metrics.overall.withSurvey, `${Math.round(metrics.overall.withSurvey/metrics.overall.total*100)}%`, '', '', `${metrics.overall.averageSurvey}`],
    ['Complete (Both) Assessments', metrics.overall.complete, `${Math.round(metrics.overall.complete/metrics.overall.total*100)}%`, '', '', `${metrics.overall.averageCombined}`]
  ];
  
  metricsTab.getRange(startRow, 1, maturityData.length, 6).setValues(maturityData);
  
  // Format headers and sections
  metricsTab.getRange(startRow, 1, 1, 6).setBackground(t.surface).setFontWeight('bold');
  metricsTab.getRange(startRow + 6, 1, 1, 6).setBackground(t.accentSurface).setFontWeight('bold');
  
  // Color-code maturity levels
  const maturityColors = {
    'Expert': t.success,
    'Advanced': t.info, 
    'Intermediate': t.warning,
    'Basic': t.danger
  };
  
  for (let i = 1; i <= 4; i++) {
    const level = maturityData[i][0].split(' ')[0];
    if (maturityColors[level]) {
      metricsTab.getRange(startRow + i, 1).setBackground(maturityColors[level]).setFontColor('white');
    }
  }
}

function populateExternalVsSurveySection(metricsTab, metrics) {
  const startRow = 20;
  const t = UITheme();
  
  // Headers
  metricsTab.getRange('A19:F19').setValues([['EXTERNAL VS SURVEY PERFORMANCE COMPARISON', '', '', '', '', '']]);
  metricsTab.getRange('A19:F19').setBackground(t.secondary).setFontColor('white').setFontWeight('bold');
  
  const interventionData = [
    ['Performance Category', 'Count', 'Percentage', 'Investment Priority', 'Expected ROI', 'Recommended Action'],
    ['High External + Low Survey', metrics.interventions['Training & Support'].length, '', 'Medium', 'High', 'Digital literacy training, technical support'],
    ['Low External + High Survey', metrics.interventions['Strategic Guidance'].length, '', 'Low', 'Very High', 'Platform optimization, content strategy'],
    ['Balanced Development', metrics.interventions['Balanced Growth'].length, '', 'High', 'Medium', 'Advanced training, scaling support'],
    ['Assessment Gaps', metrics.interventions['Individual Assessment'].length, '', 'Low', 'Variable', 'Complete assessment, individual planning'],
    ['Missing Survey Data', metrics.interventions['Survey Collection'].length, '', 'Very Low', 'High', 'Priority survey collection'],
    ['Missing External Data', metrics.interventions['External Assessment'].length, '', 'Medium', 'High', 'Complete external assessment']
  ];
  
  metricsTab.getRange(startRow, 1, interventionData.length, 6).setValues(interventionData);
  
  // Format header
  metricsTab.getRange(startRow, 1, 1, 6).setBackground(t.surface).setFontWeight('bold');
  
  // Color-code by investment priority
  for (let i = 1; i < interventionData.length; i++) {
    const priority = interventionData[i][3];
    const priorityCell = metricsTab.getRange(startRow + i, 4);
    
    switch(priority) {
      case 'Very Low':
        priorityCell.setBackground(t.successSurface);
        break;
      case 'Low':
        priorityCell.setBackground(t.warningSurface);
        break;
      case 'Medium':
        priorityCell.setBackground(t.dangerSurface);
        break;
      case 'High':
        priorityCell.setBackground(t.danger);
        break;
    }
  }
}

function populateSectorPerformanceSection(metricsTab, metrics) {
  const startRow = 30;
  const t = UITheme();
  
  // Headers
  metricsTab.getRange('A29:I29').setValues([['SECTOR PERFORMANCE ANALYSIS', '', '', '', '', '', '', '', '']]);
  metricsTab.getRange('A29:I29').setBackground(t.primary).setFontColor('white').setFontWeight('bold');
  
  const sectorData = [['Sector', 'Total', 'Completion Rate', 'Avg External', 'Avg Survey', 'Avg Combined', 'Top Performer', 'Biggest Strength', 'Primary Need']];
  
  // Sort sectors by completion rate and performance
  const sortedSectors = Object.entries(metrics.sectors).sort(([,a], [,b]) => 
    (b.completionRate - a.completionRate) || (b.averageCombined - a.averageCombined)
  );
  
  sortedSectors.forEach(([sector, data]) => {
    const primaryNeed = Object.keys(data.interventionTypes).reduce((a, b) => 
      data.interventionTypes[a] > data.interventionTypes[b] ? a : b, 'Assessment Needed');
    
    sectorData.push([
      sector,
      data.total,
      `${data.completionRate}%`,
      data.averageExternal,
      data.averageSurvey,
      data.averageCombined,
      data.topCombinedPerformer ? `${data.topCombinedPerformer.name} (${data.topCombinedPerformer.score})` : 'N/A',
      data.biggestStrength || 'Assessment Needed',
      primaryNeed
    ]);
  });
  
  metricsTab.getRange(startRow, 1, sectorData.length, 9).setValues(sectorData);
  
  // Format header
  metricsTab.getRange(startRow, 1, 1, 9).setBackground(t.surface).setFontWeight('bold');
  
  // Color-code completion rates
  for (let i = 1; i < sectorData.length; i++) {
    const completionRate = parseFloat(sectorData[i][2].replace('%', ''));
    const completionCell = metricsTab.getRange(startRow + i, 3);
    
    if (completionRate >= 75) completionCell.setBackground(t.successSurface);
    else if (completionRate >= 50) completionCell.setBackground(t.warningSurface);
    else if (completionRate >= 25) completionCell.setBackground(t.dangerSurface);
    else completionCell.setBackground(t.danger);
  }
}

function populatePlatformPresenceSection(metricsTab, metrics) {
  const startRow = 42;
  const t = UITheme();
  
  // Headers
  metricsTab.getRange('A41:F41').setValues([['PLATFORM PRESENCE BREAKDOWN', '', '', '', '', '']]);
  metricsTab.getRange('A41:F41').setBackground(t.secondary).setFontColor('white').setFontWeight('bold');
  
  const platformData = [['Platform Category', 'Avg Score', '% of Max', 'Strong Presence', 'Basic Presence', 'Improvement Priority']];
  
  Object.keys(metrics.platforms).forEach(platformKey => {
    const platform = metrics.platforms[platformKey];
    
    platformData.push([
      platform.name,
      platform.average || 0,
      `${platform.percentageOfMax || 0}%`,
      platform.strongPresence || 0,
      platform.basicPresence || 0,
      platform.improvementPriority || 'N/A'
    ]);
  });
  
  metricsTab.getRange(startRow, 1, platformData.length, 6).setValues(platformData);
  metricsTab.getRange(startRow, 1, 1, 6).setBackground(t.surface).setFontWeight('bold');
}

function populateCoreBaselinesSection(metricsTab, metrics) {
  const startRow = 48;
  const t = UITheme();
  
  // Header
  metricsTab.getRange('A47:G47').setValues([[
    'CORE BASELINES: SOCIAL, WEBSITE, DISCOVERABILITY (TOR-Aligned)', '', '', '', '', '', ''
  ]]);
  metricsTab.getRange('A47:G47').setBackground(t.primary).setFontColor('white').setFontWeight('bold');
  
  const categories = [
    { key: 'socialMedia', label: 'Social Media Business Presence', max: 18 },
    { key: 'website', label: 'Website Presence & Functionality', max: 12 },
    { key: 'discoverability', label: 'Online Discoverability & Reputation', max: 12 }
  ];
  
  const rows = [['Category', 'Avg Score', '% of Max', 'Adoption Rate', 'Strong Presence', 'Basic Presence', 'No Presence']];
  categories.forEach(cat => {
    const c = metrics.categories[cat.key] || {};
    rows.push([
      cat.label,
      c.average || 0,
      `${c.percentageOfMax || 0}%`,
      `${c.adoptionRate || 0}%`,
      c.strongPresence || 0,
      c.basicPresence || 0,
      c.noPresence || 0
    ]);
  });
  
  metricsTab.getRange(startRow, 1, rows.length, 7).setValues(rows);
  metricsTab.getRange(startRow, 1, 1, 7).setBackground(t.surface).setFontWeight('bold');
}

function createMaturityDistributionChart(metricsTab, metrics) {
  const t = UITheme();
  // Create data range for enhanced pie chart
  const chartData = [
    ['Maturity Level', 'Count', 'Target 2026'],
    ['Expert', metrics.overall.maturityCounts.Expert, metrics.overall.targets2026.Expert],
    ['Advanced', metrics.overall.maturityCounts.Advanced, metrics.overall.targets2026.Advanced],
    ['Intermediate', metrics.overall.maturityCounts.Intermediate, metrics.overall.targets2026.Intermediate],
    ['Basic', metrics.overall.maturityCounts.Basic, metrics.overall.targets2026.Basic]
  ];
  
  // Write chart data to a temporary area
  metricsTab.getRange('K5:M9').setValues(chartData);
  
  // Create enhanced pie chart with targets
  const chartRange = metricsTab.getRange('K5:L9');
  const chart = metricsTab.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(chartRange)
    .setPosition(5, 11, 0, 0)
    .setOption('title', '🎯 Current Digital Maturity Distribution')
    .setOption('titleTextStyle', { fontSize: 14, bold: true })
    .setOption('pieSliceTextStyle', { fontSize: 11 })
    .setOption('legend', { position: 'right', textStyle: { fontSize: 10 } })
    .setOption('chartArea', { width: '75%', height: '70%' })
    .setOption('colors', [t.success, t.info, t.warning, t.danger])
    .build();
  
  metricsTab.insertChart(chart);
  
  // Clear temporary data
  metricsTab.getRange('K5:M9').clearContent();
}

function createExternalVsSurveyChart(metricsTab, metrics) {
  const t = UITheme();
  // Create data for External vs Survey comparison chart
  const completeAssessments = Object.values(metrics.interventions['Training & Support'])
    .concat(Object.values(metrics.interventions['Strategic Guidance']))
    .concat(Object.values(metrics.interventions['Balanced Growth']));
  
  if (completeAssessments.length > 0) {
    const chartData = [['Stakeholder', 'External Score', 'Survey Score']];
    
    // Take top 10 performers for visualization
    completeAssessments.slice(0, 10).forEach(assessment => {
      chartData.push([
        assessment.name.length > 15 ? assessment.name.substring(0, 15) + '...' : assessment.name,
        assessment.externalTotal,
        assessment.surveyTotal * 2.33 // Scale survey to be comparable (30*2.33 ≈ 70)
      ]);
    });
    
    // Write chart data
    metricsTab.getRange('K20:M' + (20 + chartData.length - 1)).setValues(chartData);
    
    // Create scatter chart
    const chartRange = metricsTab.getRange('K20:M' + (20 + chartData.length - 1));
    const chart = metricsTab.newChart()
      .setChartType(Charts.ChartType.SCATTER)
      .addRange(chartRange)
      .setPosition(20, 11, 0, 0)
      .setOption('title', '📊 External vs Survey Performance')
      .setOption('titleTextStyle', { fontSize: 14, bold: true })
      .setOption('hAxis', { title: 'External Assessment Score', titleTextStyle: { fontSize: 11 } })
      .setOption('vAxis', { title: 'Survey Score (scaled)', titleTextStyle: { fontSize: 11 } })
      .setOption('legend', { position: 'none' })
      .setOption('chartArea', { width: '75%', height: '70%' })
      .setOption('colors', [t.secondary])
      .build();
    
    metricsTab.insertChart(chart);
    
    // Clear temporary data
    metricsTab.getRange('K20:M' + (20 + chartData.length - 1)).clearContent();
  }
}

function createSectorPerformanceChart(metricsTab, metrics) {
  const t = UITheme();
  // Create data for sector performance comparison
  const sectorNames = Object.keys(metrics.sectors);
  const chartData = [['Sector', 'Average Score', 'Completion Rate']];
  
  sectorNames.forEach(sector => {
    const data = metrics.sectors[sector];
    chartData.push([
      sector.length > 20 ? sector.substring(0, 20) + '...' : sector,
      data.averageCombined || data.averageExternal || 0,
      data.completionRate
    ]);
  });
  
  // Write chart data
  metricsTab.getRange('K30:M' + (30 + chartData.length - 1)).setValues(chartData);
  
  // Create combination chart
  const chartRange = metricsTab.getRange('K30:M' + (30 + chartData.length - 1));
  const chart = metricsTab.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(chartRange)
    .setPosition(30, 11, 0, 0)
    .setOption('title', '📈 Sector Performance & Completion')
    .setOption('titleTextStyle', { fontSize: 14, bold: true })
    .setOption('hAxis', { title: 'Creative Industry Sectors', titleTextStyle: { fontSize: 11 } })
    .setOption('vAxis', { title: 'Score / Completion %', titleTextStyle: { fontSize: 11 } })
    .setOption('legend', { position: 'top', textStyle: { fontSize: 10 } })
    .setOption('chartArea', { width: '75%', height: '65%' })
    .setOption('colors', [t.primary, t.secondary])
    .build();
  
  metricsTab.insertChart(chart);
  
  // Clear temporary data
  metricsTab.getRange('K30:M' + (30 + chartData.length - 1)).clearContent();
}

function createInterventionPriorityChart(metricsTab, metrics) {
  const t = UITheme();
  // Create data for intervention priority matrix
  const interventionData = [
    ['Intervention Type', 'Count'],
    ['Training & Support', metrics.interventions['Training & Support'].length],
    ['Strategic Guidance', metrics.interventions['Strategic Guidance'].length],
    ['Balanced Growth', metrics.interventions['Balanced Growth'].length],
    ['Survey Collection', metrics.interventions['Survey Collection'].length],
    ['External Assessment', metrics.interventions['External Assessment'].length],
    ['Individual Assessment', metrics.interventions['Individual Assessment'].length]
  ];
  
  // Write chart data
  metricsTab.getRange('K42:L48').setValues(interventionData);
  
  // Create horizontal bar chart
  const chartRange = metricsTab.getRange('K42:L48');
  const chart = metricsTab.newChart()
    .setChartType(Charts.ChartType.BAR)
    .addRange(chartRange)
    .setPosition(42, 11, 0, 0)
    .setOption('title', '🎯 Intervention Priority Distribution')
    .setOption('titleTextStyle', { fontSize: 14, bold: true })
    .setOption('hAxis', { title: 'Number of Stakeholders', titleTextStyle: { fontSize: 11 } })
    .setOption('vAxis', { title: 'Intervention Type', titleTextStyle: { fontSize: 11 } })
    .setOption('legend', { position: 'none' })
    .setOption('chartArea', { width: '70%', height: '70%' })
    .setOption('colors', [t.primary])
    .build();
  
  metricsTab.insertChart(chart);
  
  // Clear temporary data
  metricsTab.getRange('K42:L48').clearContent();
}

function populateKPISection(metricsTab, metrics) {
  const startRow = 55;
  
  // Headers
  metricsTab.getRange('A54:F54').setValues([['KEY PERFORMANCE INDICATORS', '', '', '', '', '']]);
  metricsTab.getRange('A54:F54').setBackground('#c62828').setFontColor('white').setFontWeight('bold');
  
  const kpiData = [
    ['Metric', 'Current Value', 'Baseline Target', 'Status', 'Trend', 'Survey Correlation'],
    ['Assessment Completion Rate', `${Math.round(metrics.overall.complete/metrics.overall.total*100)}%`, '80%', '', '↗', 'High'],
    ['Digital Readiness (60+)', `${metrics.overall.digitalReadinessPct}%`, '60%', '', '↗', 'Medium'],
    ['Average External Score', `${metrics.overall.averageExternal}/70`, '45/70', '', '↗', 'N/A'],
    ['Average Survey Score', `${metrics.overall.averageSurvey}/30`, '20/30', '', '↗', 'N/A'],
    ['Social Media Adoption', `${metrics.platforms.socialMedia ? Math.round(metrics.platforms.socialMedia.percentageOfMax) : 0}%`, '70%', '', '↗', 'High'],
    ['Website Presence', `${metrics.platforms.website ? Math.round(metrics.platforms.website.percentageOfMax) : 0}%`, '50%', '', '→', 'Medium'],
    ['Platform Integration', `${metrics.platforms.platformIntegration ? Math.round(metrics.platforms.platformIntegration.percentageOfMax) : 0}%`, '60%', '', '↗', 'Low'],
    ['Investment Readiness', `${Object.values(metrics.capacity || {}).reduce((sum, arr) => sum + arr.length, 0)}`, 'N/A', '', '→', 'High']
  ];
  
  metricsTab.getRange(startRow, 1, kpiData.length, 6).setValues(kpiData);
  
  // Format header
  metricsTab.getRange(startRow, 1, 1, 6).setBackground('#e8f0fe').setFontWeight('bold');
  
  // Color-code status indicators
  for (let i = 1; i < kpiData.length; i++) {
    const currentValue = parseFloat(kpiData[i][1].toString().replace('%', '').split('/')[0]);
    const targetValue = parseFloat(kpiData[i][2].toString().replace('%', '').split('/')[0]);
    const statusCell = metricsTab.getRange(startRow + i, 4);
    
    if (currentValue >= targetValue) {
      statusCell.setValue('✅ Target Met').setBackground('#d4edda');
    } else if (currentValue >= targetValue * 0.8) {
      statusCell.setValue('🟡 Near Target').setBackground('#fff3cd');
    } else {
      statusCell.setValue('🔴 Below Target').setBackground('#f8d7da');
    }
  }
}

function populateCapacityBuildingMatrix(metricsTab, metrics) {
  const startRow = 67;
  
  // Headers
  metricsTab.getRange('A66:G66').setValues([['CAPACITY BUILDING PRIORITY MATRIX', '', '', '', '', '', '']]);
  metricsTab.getRange('A66:G66').setBackground('#37474f').setFontColor('white').setFontWeight('bold');
  
  const capacityData = [
    ['Priority Level', 'Stakeholder Count', 'Avg External Gap', 'Avg Survey Score', 'Investment Capacity', 'Expected ROI', 'Resource Allocation'],
    ['High Priority (Low External + High Survey)', metrics.interventions['Strategic Guidance'].length, '', '', 'Medium-High', 'Very High', '30%'],
    ['Medium Priority (High External + Low Survey)', metrics.interventions['Training & Support'].length, '', '', 'Low-Medium', 'High', '25%'],
    ['Growth Ready (Balanced Performance)', metrics.interventions['Balanced Growth'].length, '', '', 'Medium-High', 'Medium', '20%'],
    ['Assessment Needed (Incomplete Data)', 
     metrics.interventions['Survey Collection'].length + metrics.interventions['External Assessment'].length + metrics.interventions['Individual Assessment'].length, 
     '', '', 'Unknown', 'Variable', '15%'],
    ['', '', '', '', '', '', ''],
    ['CAPACITY INDICATORS', '', '', '', '', '', ''],
    ['High Investment + High Comfort', metrics.capacity?.highInvestmentHighComfort?.length || 0, '', '', 'D5,000-15,000+', 'Very High', 'Advanced Training'],
    ['High Investment + Low Comfort', metrics.capacity?.highInvestmentLowComfort?.length || 0, '', '', 'D5,000-15,000+', 'High', 'Intensive Training'],
    ['Low Investment + High Comfort', metrics.capacity?.lowInvestmentHighComfort?.length || 0, '', '', 'D0-1,000', 'Medium', 'Strategic Guidance'],
    ['Low Investment + Low Comfort', metrics.capacity?.lowInvestmentLowComfort?.length || 0, '', '', 'D0-1,000', 'Low', 'Basic Support']
  ];
  
  metricsTab.getRange(startRow, 1, capacityData.length, 7).setValues(capacityData);
  
  // Format headers and sections
  metricsTab.getRange(startRow, 1, 1, 7).setBackground('#e8f0fe').setFontWeight('bold');
  metricsTab.getRange(startRow + 5, 1, 1, 7).setBackground('#f3e5f5').setFontWeight('bold');
  
  // Color-code ROI indicators
  for (let i = 1; i < 5; i++) {
    const roiCell = metricsTab.getRange(startRow + i, 6);
    const roi = capacityData[i][5];
    
    switch(roi) {
      case 'Very High':
        roiCell.setBackground('#28a745').setFontColor('white');
        break;
      case 'High':
        roiCell.setBackground('#17a2b8').setFontColor('white');
        break;
      case 'Medium':
        roiCell.setBackground('#ffc107');
        break;
      default:
        roiCell.setBackground('#6c757d').setFontColor('white');
    }
  }
}

function clearMetricsContent(metricsTab) {
  const lastRow = metricsTab.getLastRow();
  const lastCol = metricsTab.getLastColumn();
  
  if (lastRow > 4) {
    metricsTab.getRange(5, 1, lastRow - 4, lastCol).clearContent();
  }
  
  // Clear any existing charts
  const charts = metricsTab.getCharts();
  charts.forEach(chart => {
    metricsTab.removeChart(chart);
  });
}

function populateEmptyDashboard(metricsTab) {
  metricsTab.getRange('A2').setValue('📊 No assessment data available yet');
  metricsTab.getRange('A4').setValue('Please complete stakeholder assessments in the Master Assessment tab');
  metricsTab.getRange('A5').setValue('Run the dashboard again after adding assessment data');
}

// Menu integration functions
function refreshBaselineMetrics() {
  generateBaselineMetricsDashboard();
  
  const ui = SpreadsheetApp.getUi();
  ui.alert('Enhanced Baseline Metrics Updated', 
           'The metrics dashboard has been refreshed with External/Survey analysis and intervention planning.',
           ui.ButtonSet.OK);
}

function exportEnhancedMetricsReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const metricsTab = ss.getSheetByName('Baseline Metrics');
  
  if (!metricsTab) {
    Logger.log('Baseline Metrics tab not found');
    return;
  }
  
  const data = metricsTab.getDataRange().getValues();
  const exportData = {
    generatedAt: new Date().toISOString(),
    framework: 'External Assessment (70pts) + Survey Integration (30pts)',
    dashboardSections: {
      maturityDistribution: data.slice(4, 16),
      externalVsSurvey: data.slice(19, 26),
      sectorPerformance: data.slice(29, 40),
      platformPresence: data.slice(41, 48),
      kpiTracking: data.slice(54, 63),
      capacityMatrix: data.slice(66, 78)
    }
  };
  
  Logger.log('Enhanced Baseline Metrics Export:', JSON.stringify(exportData, null, 2));
  return exportData;
}

// Automated refresh function
function autoRefreshMetrics() {
  // This function can be triggered by time-based triggers
  generateBaselineMetricsDashboard();
  Logger.log('Baseline metrics dashboard auto-refreshed');
}

/**
 * Missing Functions and Improvements for baseline.gs
 * Adds proper baseline metrics for ongoing monitoring per TOR requirements
 */

// MISSING FUNCTION 1: calculateRegionMetrics
function calculateRegionMetrics(assessments) {
  try {
    const regionData = {};
    
    assessments.forEach(assessment => {
      const region = assessment.region || 'Unknown';
      if (!regionData[region]) {
        regionData[region] = {
          total: 0,
          withExternal: 0,
          withSurvey: 0,
          complete: 0,
          totalExternal: 0,
          totalSurvey: 0,
          totalCombined: 0,
          maturityDistribution: { Expert: 0, Advanced: 0, Intermediate: 0, Basic: 0 },
          topPerformer: null,
          averageExternal: 0,
          averageSurvey: 0,
          averageCombined: 0,
          digitalReadinessPct: 0,
          completionRate: 0
        };
      }
      
      const data = regionData[region];
      data.total++;
      
      if (assessment.hasExternalData) {
        data.withExternal++;
        data.totalExternal += assessment.externalTotal || 0;
      }
      
      if (assessment.hasSurveyData) {
        data.withSurvey++;
        data.totalSurvey += assessment.surveyTotal || 0;
      }
      
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
      }
      
      // Track top performer
      const score = assessment.combinedScore || assessment.externalTotal || 0;
      if (!data.topPerformer || score > data.topPerformer.score) {
        data.topPerformer = {
          name: assessment.name,
          score: score
        };
      }
    });
    
    // Calculate averages and key metrics
    Object.keys(regionData).forEach(region => {
      const data = regionData[region];
      data.averageExternal = data.withExternal > 0 ? Math.round(data.totalExternal / data.withExternal * 10) / 10 : 0;
      data.averageSurvey = data.withSurvey > 0 ? Math.round(data.totalSurvey / data.withSurvey * 10) / 10 : 0;
      data.averageCombined = data.complete > 0 ? Math.round(data.totalCombined / data.complete * 10) / 10 : 0;
      data.digitalReadinessPct = data.total > 0 ? Math.round((data.maturityDistribution.Expert + data.maturityDistribution.Advanced) / data.total * 100) : 0;
      data.completionRate = data.total > 0 ? Math.round(data.complete / data.total * 100) : 0;
    });
    
    return regionData;
  } catch (error) {
    Logger.log(`Error in calculateRegionMetrics: ${error.toString()}`);
    return {};
  }
}

// MISSING FUNCTION 2: calculateCategoryMetrics (referenced but not defined)
function calculateCategoryMetrics(assessments) {
  try {
    const externalAssessments = assessments.filter(a => a.hasExternalData);
    
    const categoryMetrics = {
      socialMedia: calculateCategoryStats(externalAssessments, 'socialMedia', 18),
      website: calculateCategoryStats(externalAssessments, 'website', 12),
      visualContent: calculateCategoryStats(externalAssessments, 'visualContent', 15),
      discoverability: calculateCategoryStats(externalAssessments, 'discoverability', 12),
      digitalSales: calculateCategoryStats(externalAssessments, 'digitalSales', 8),
      platformIntegration: calculateCategoryStats(externalAssessments, 'platformIntegration', 5)
    };
    
    return categoryMetrics;
  } catch (error) {
    Logger.log(`Error in calculateCategoryMetrics: ${error.toString()}`);
    return {};
  }
}

function calculateCategoryStats(assessments, categoryKey, maxScore) {
  const scores = assessments.map(a => a.external[categoryKey] || 0);
  const total = scores.length;
  
  if (total === 0) {
    return {
      name: categoryKey,
      average: 0,
      percentageOfMax: 0,
      strongPresence: 0,
      basicPresence: 0,
      noPresence: 0,
      improvementPotential: 0,
      adoptionRate: 0,
      totalStakeholders: 0
    };
  }
  
  const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / total * 10) / 10;
  const percentageOfMax = Math.round(average / maxScore * 100);
  const adopted = scores.filter(score => score > 0).length;
  const adoptionRate = Math.round(adopted / total * 100);
  
  return {
    name: categoryKey,
    average: average,
    percentageOfMax: percentageOfMax,
    strongPresence: scores.filter(score => score >= maxScore * 0.75).length,
    basicPresence: scores.filter(score => score >= maxScore * 0.25 && score < maxScore * 0.75).length,
    noPresence: scores.filter(score => score < maxScore * 0.25).length,
    improvementPotential: Math.round((maxScore - average) / maxScore * 100),
    adoptionRate: adoptionRate,
    totalStakeholders: total
  };
}

// ENHANCED FUNCTION: Proper baseline KPI tracking
function populateEnhancedKPISection(metricsTab, metrics) {
  const startRow = 55;
  
  // Headers
  metricsTab.getRange('A54:G54').setValues([['BASELINE KEY PERFORMANCE INDICATORS', '', '', '', '', '', '']]);
  metricsTab.getRange('A54:G54').setBackground('#c62828').setFontColor('white').setFontWeight('bold');
  
  // Get baseline date (when assessment started)
  const baselineDate = new Date().getFullYear();
  
  const kpiData = [
    ['KPI Indicator', 'Current Value', 'Baseline Target', 'Status', 'Trend', '2026 Target', 'Monitoring Frequency'],
    
    // CORE DIGITAL READINESS INDICATORS
    ['Digital Readiness Rate (60+ scores)', `${metrics.overall.digitalReadinessPct}%`, '40%', '', '↗', '75%', 'Quarterly'],
    ['Assessment Completion Rate', `${Math.round(metrics.overall.complete/metrics.overall.total*100)}%`, '80%', '', '↗', '95%', 'Monthly'],
    ['Average External Performance', `${metrics.overall.averageExternal}/70`, '35/70', '', '↗', '50/70', 'Monthly'],
    ['Average Survey Engagement', `${metrics.overall.averageSurvey}/30`, '18/30', '', '→', '24/30', 'Quarterly'],
    
    // PLATFORM ADOPTION INDICATORS
    ['Social Media Business Adoption', `${metrics.platforms?.socialMedia?.percentageOfMax || 0}%`, '60%', '', '↗', '85%', 'Monthly'],
    ['Website Presence Rate', `${metrics.platforms?.website?.percentageOfMax || 0}%`, '40%', '', '→', '70%', 'Quarterly'],
    ['Online Discoverability', `${metrics.platforms?.discoverability?.percentageOfMax || 0}%`, '50%', '', '↗', '80%', 'Monthly'],
    ['Digital Sales Capability', `${metrics.platforms?.digitalSales?.percentageOfMax || 0}%`, '30%', '', '↗', '60%', 'Quarterly'],
    
    // CAPACITY BUILDING INDICATORS
    ['High Digital Comfort Rate', calculateHighComfortRate(metrics), '40%', '', '↗', '70%', 'Quarterly'],
    ['Investment Readiness Rate', calculateInvestmentReadiness(metrics), '30%', '', '↗', '55%', 'Quarterly'],
    ['Training Completion Rate', 'TBD', '0%', '', '→', '90%', 'Monthly'],
    
    // SECTOR DEVELOPMENT INDICATORS
    ['Sectors with >50% Completion', countSectorsAboveThreshold(metrics.sectors, 50), '3', '', '↗', '6', 'Quarterly'],
    ['Cross-Platform Integration', `${metrics.platforms?.platformIntegration?.percentageOfMax || 0}%`, '35%', '', '↗', '75%', 'Quarterly'],
    
    // CORRELATION & QUALITY INDICATORS
    ['Balanced Development Rate', calculateBalancedDevelopmentRate(metrics), '60%', '', '→', '80%', 'Quarterly'],
    ['Survey-External Alignment', calculateSurveyAlignment(metrics), '75%', '', '↗', '90%', 'Monthly']
  ];
  
  metricsTab.getRange(startRow, 1, kpiData.length, 7).setValues(kpiData);
  
  // Format header
  metricsTab.getRange(startRow, 1, 1, 7).setBackground('#e8f0fe').setFontWeight('bold');
  
  // Color-code status indicators
  for (let i = 1; i < kpiData.length; i++) {
    const currentValue = parseKPIValue(kpiData[i][1]);
    const targetValue = parseKPIValue(kpiData[i][2]);
    const statusCell = metricsTab.getRange(startRow + i, 4);
    
    if (currentValue >= targetValue) {
      statusCell.setValue('✅ Target Met').setBackground('#d4edda');
    } else if (currentValue >= targetValue * 0.8) {
      statusCell.setValue('🟡 Near Target').setBackground('#fff3cd');
    } else if (currentValue >= targetValue * 0.5) {
      statusCell.setValue('🟠 In Progress').setBackground('#ffeaa7');
    } else {
      statusCell.setValue('🔴 Below Target').setBackground('#f8d7da');
    }
  }
}

// Helper functions for KPI calculations
function calculateHighComfortRate(metrics) {
  // Calculate percentage of stakeholders with high digital comfort (6+ out of 8)
  if (!metrics.capacity) return '0%';
  const total = Object.values(metrics.capacity).reduce((sum, arr) => sum + arr.length, 0);
  const highComfort = (metrics.capacity.highInvestmentHighComfort?.length || 0) + 
                     (metrics.capacity.lowInvestmentHighComfort?.length || 0);
  return total > 0 ? `${Math.round(highComfort / total * 100)}%` : '0%';
}

function calculateInvestmentReadiness(metrics) {
  if (!metrics.capacity) return '0%';
  const total = Object.values(metrics.capacity).reduce((sum, arr) => sum + arr.length, 0);
  const highInvestment = (metrics.capacity.highInvestmentHighComfort?.length || 0) + 
                        (metrics.capacity.highInvestmentLowComfort?.length || 0);
  return total > 0 ? `${Math.round(highInvestment / total * 100)}%` : '0%';
}

function countSectorsAboveThreshold(sectors, threshold) {
  if (!sectors) return 0;
  return Object.values(sectors).filter(sector => (sector.completionRate || 0) >= threshold).length;
}

function calculateBalancedDevelopmentRate(metrics) {
  if (!metrics.interventions || !metrics.interventions['Balanced Growth']) return '0%';
  const total = Object.values(metrics.interventions).reduce((sum, arr) => sum + arr.length, 0);
  const balanced = metrics.interventions['Balanced Growth'].length;
  return total > 0 ? `${Math.round(balanced / total * 100)}%` : '0%';
}

function calculateSurveyAlignment(metrics) {
  // Calculate how well survey data aligns with external assessment
  if (!metrics.correlation) return '0%';
  const total = Object.values(metrics.correlation).reduce((sum, arr) => sum + arr.length, 0);
  const aligned = metrics.correlation.balanced?.length || 0;
  return total > 0 ? `${Math.round(aligned / total * 100)}%` : '0%';
}

function parseKPIValue(value) {
  if (typeof value === 'string') {
    const numMatch = value.match(/[\d.]+/);
    return numMatch ? parseFloat(numMatch[0]) : 0;
  }
  return parseFloat(value) || 0;
}

// ENHANCED FUNCTION: Monitoring and Trend Tracking
function addMonitoringAndTrendTracking(metricsTab, assessments) {
  const startRow = 75;
  
  // Headers
  metricsTab.getRange('A74:F74').setValues([['MONITORING & TREND TRACKING', '', '', '', '', '']]);
  metricsTab.getRange('A74:F74').setBackground('#37474f').setFontColor('white').setFontWeight('bold');
  
  // Current monitoring setup
  const monitoringData = [
    ['Monitoring Category', 'Current Status', 'Next Review Date', 'Responsible Party', 'Data Source', 'Alert Threshold'],
    ['Assessment Completion', `${assessments.length} stakeholders tracked`, addDaysToDate(new Date(), 30), 'Program Manager', 'Master Assessment', '<80% completion'],
    ['Digital Performance', 'External scores tracked monthly', addDaysToDate(new Date(), 7), 'Digital Marketing Expert', 'External Assessment', '<35/70 average'],
    ['Survey Engagement', 'Survey data collection ongoing', addDaysToDate(new Date(), 14), 'Field Team', 'Survey Assessment', '<60% response rate'],
    ['Sector Progress', Object.keys(assessments.reduce((acc, a) => ({...acc, [a.sector]: true}), {})).length + ' sectors monitored', addDaysToDate(new Date(), 90), 'Sector Coordinators', 'Sector Analysis', '<3 sectors above 50%'],
    ['Regional Distribution', Object.keys(assessments.reduce((acc, a) => ({...acc, [a.region]: true}), {})).length + ' regions tracked', addDaysToDate(new Date(), 90), 'Regional Coordinators', 'Regional Analysis', 'Uneven distribution'],
    ['Intervention Effectiveness', 'Tracking implementation outcomes', addDaysToDate(new Date(), 60), 'Program Team', 'Follow-up Assessments', '<70% improvement rate']
  ];
  
  metricsTab.getRange(startRow, 1, monitoringData.length, 6).setValues(monitoringData);
  metricsTab.getRange(startRow, 1, 1, 6).setBackground('#e8f0fe').setFontWeight('bold');
}

function addDaysToDate(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toLocaleDateString();
}

// ENHANCED FUNCTION: Baseline Establishment
function establishProgramBaselines(metricsTab, metrics) {
  const startRow = 85;
  
  // Headers
  metricsTab.getRange('A84:E84').setValues([['PROGRAM BASELINES ESTABLISHED', '', '', '', '']]);
  metricsTab.getRange('A84:E84').setBackground('#1c4587').setFontColor('white').setFontWeight('bold');
  
  const baselineDate = new Date().toLocaleDateString();
  
  const baselineData = [
    ['Baseline Metric', 'Initial Value', 'Measurement Date', 'Target 2026', 'Measurement Method'],
    ['Total Creative Industry Stakeholders', metrics.overall.total, baselineDate, Math.ceil(metrics.overall.total * 1.5), 'Direct assessment count'],
    ['Average Digital Maturity Score', metrics.overall.averageCombined, baselineDate, Math.min(metrics.overall.averageCombined + 25, 80), 'Combined external + survey scores'],
    ['Digital Readiness Rate', `${metrics.overall.digitalReadinessPct}%`, baselineDate, '75%', 'Percentage scoring 60+ points'],
    ['Sector Coverage Completeness', calculateSectorCoverage(metrics.sectors), baselineDate, '95%', 'Sectors with >80% completion rate'],
    ['Platform Integration Level', calculatePlatformIntegration(metrics.platforms), baselineDate, '80%', 'Average cross-platform presence'],
    ['Survey Response Rate', calculateSurveyResponseRate(metrics.overall), baselineDate, '90%', 'Survey completion vs external assessment'],
    ['Regional Digital Equity Index', 'TBD', baselineDate, '85%', 'Coefficient of variation across regions'],
    ['Intervention Success Rate', 'TBD', baselineDate, '80%', 'Post-intervention improvement rate']
  ];
  
  metricsTab.getRange(startRow, 1, baselineData.length, 5).setValues(baselineData);
  metricsTab.getRange(startRow, 1, 1, 5).setBackground('#e8f0fe').setFontWeight('bold');
}

function calculateSectorCoverage(sectors) {
  if (!sectors) return '0%';
  const totalSectors = Object.keys(sectors).length;
  const completeSectors = Object.values(sectors).filter(s => s.completionRate >= 80).length;
  return totalSectors > 0 ? `${Math.round(completeSectors / totalSectors * 100)}%` : '0%';
}

function calculatePlatformIntegration(platforms) {
  if (!platforms) return '0%';
  const platformValues = Object.values(platforms).map(p => p.percentageOfMax || 0);
  const average = platformValues.reduce((sum, val) => sum + val, 0) / platformValues.length;
  return `${Math.round(average)}%`;
}

function calculateSurveyResponseRate(overall) {
  if (overall.total === 0) return '0%';
  return `${Math.round(overall.withSurvey / overall.total * 100)}%`;
}