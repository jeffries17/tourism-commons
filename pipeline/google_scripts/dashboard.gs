/**
 * Public Dashboard - Apps Script Web App + Sidebar Preview
 */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Dashboard')
    .setTitle('Gambia Creative Industries Dashboard');
}

function openDashboardSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Dashboard')
    .setTitle('Gambia CI Dashboard')
    .setWidth(360);
  SpreadsheetApp.getUi().showSidebar(html);
}

// Core data for dashboard charts and filters
function getDashboardData(includeTourism) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rows = (function collectRows() {
    const master = ss.getSheetByName('Master Assessment');
    if (!master) return [];
    const data = master.getDataRange().getValues();
    const base = (data || []).slice(1).filter(r => r && String(r[0] || '').trim() !== '');
    if (!includeTourism) return base;
    const tour = ss.getSheetByName('TO Assessment');
    if (!tour) return base;
    const tdata = tour.getDataRange().getValues();
    const trows = (tdata || []).slice(1).filter(r => r && String(r[0] || '').trim() !== '');
    return base.concat(trows);
  })();

  if (!rows || rows.length === 0) return { total: 0, sectors: [], maturity: {}, participants: [] };

  // Maturity distribution (5 levels)
  const maturity = { Expert: 0, Advanced: 0, Intermediate: 0, Emerging: 0, Absent: 0 };
  const sectorMap = {};
  const stackedBySector = {};
  const participants = [];

  rows.forEach(r => {
    const name = String(r[0] || '').trim();
    const sector = r[1] || 'Unknown';
    // Normalize maturity level to the 5-level scale
    const rawMaturity = String(r[17] || '').trim();
    const maturityLevel = (function normalizeMaturity(v){
      if (!v) return 'Absent';
      if (v === 'Basic') return 'Emerging';
      const allowed = ['Absent','Emerging','Intermediate','Advanced','Expert'];
      return allowed.indexOf(v) >= 0 ? v : 'Absent';
    })(rawMaturity);
    const external = parseFloat(r[14]) || 0;
    const survey = parseFloat(r[15]) || 0;
    const combined = parseFloat(r[16]) || external;

    if (maturity[maturityLevel] !== undefined) maturity[maturityLevel]++;

    if (!sectorMap[sector]) {
      sectorMap[sector] = { count: 0, totalExternal: 0, totalSurvey: 0, totalCombined: 0, complete: 0 };
    }
    const s = sectorMap[sector];
    s.count++;
    s.totalExternal += external;
    s.totalSurvey += survey;
    s.totalCombined += combined;
    if (external > 0 && survey > 0) s.complete++;

    participants.push({ name: name, sector: sector, external: external, survey: survey, combined: combined, maturity: maturityLevel });

    // Readiness per sector (5-level buckets)
    if (!stackedBySector[sector]) stackedBySector[sector] = { Absent: 0, Emerging: 0, Intermediate: 0, Advanced: 0, Expert: 0, total: 0 };
    stackedBySector[sector][maturityLevel] = (stackedBySector[sector][maturityLevel] || 0) + 1;
    stackedBySector[sector].total++;
  });

  // Overall counts and averages
  const withExternal = rows.filter(r => (parseFloat(r[14])||0) > 0).length;
  const withSurvey = rows.filter(r => (parseFloat(r[15])||0) > 0).length;
  const complete = rows.filter(r => (parseFloat(r[14])||0) > 0 && (parseFloat(r[15])||0) > 0).length;
  const avgExternal = withExternal>0 ? Math.round(rows.reduce((s,r)=>s+(parseFloat(r[14])||0),0)/withExternal*10)/10 : 0;
  const avgSurvey = withSurvey>0 ? Math.round(rows.reduce((s,r)=>s+(parseFloat(r[15])||0),0)/withSurvey*10)/10 : 0;
  const avgCombined = complete>0 ? Math.round(rows.reduce((s,r)=>s+(parseFloat(r[16])||0),0)/complete*10)/10 : 0;

  // Category averages across all with external
  const externalRows = rows.filter(r => (parseFloat(r[14]) || 0) > 0);
  const cat = { socialMedia:0, website:0, visualContent:0, discoverability:0, digitalSales:0, platformIntegration:0 };
  externalRows.forEach(r => {
    cat.socialMedia += parseFloat(r[3])||0;
    cat.website += parseFloat(r[4])||0;
    cat.visualContent += parseFloat(r[5])||0;
    cat.discoverability += parseFloat(r[6])||0;
    cat.digitalSales += parseFloat(r[7])||0;
    cat.platformIntegration += parseFloat(r[8])||0;
  });
  const countExt = Math.max(externalRows.length,1);
  const categoryAverages = {
    socialMedia: Math.round(cat.socialMedia/countExt*10)/10,
    website: Math.round(cat.website/countExt*10)/10,
    visualContent: Math.round(cat.visualContent/countExt*10)/10,
    discoverability: Math.round(cat.discoverability/countExt*10)/10,
    digitalSales: Math.round(cat.digitalSales/countExt*10)/10,
    platformIntegration: Math.round(cat.platformIntegration/countExt*10)/10
  };

  const sectors = Object.keys(sectorMap).map(k => {
    const v = sectorMap[k];
    return {
      sector: k,
      count: v.count,
      avgExternal: v.count ? Math.round((v.totalExternal / v.count) * 10) / 10 : 0,
      avgSurvey: v.count ? Math.round((v.totalSurvey / v.count) * 10) / 10 : 0,
      avgCombined: v.count ? Math.round((v.totalCombined / v.count) * 10) / 10 : 0,
      completionRate: v.count ? Math.round((v.complete / v.count) * 100) : 0
    };
  }).sort((a,b) => b.avgCombined - a.avgCombined);

  return {
    sheetName: ss.getName(),
    total: rows.length,
    maturity: maturity,
    sectors: sectors,
    participants: participants,
    categoryAverages: categoryAverages,
    sectorStacked: stackedBySector,
    overall: {
      withExternal: withExternal,
      withSurvey: withSurvey,
      complete: complete,
      avgExternal: avgExternal,
      avgSurvey: avgSurvey,
      avgCombined: avgCombined
    }
  };
}

function getSectors() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const master = ss.getSheetByName('Master Assessment');
  if (!master) return [];
  const data = master.getDataRange().getValues().slice(1);
  const set = {};
  data.forEach(r => { if (r && String(r[0] || '').trim() !== '') set[r[1] || 'Unknown'] = true; });
  return Object.keys(set).sort();
}

function getParticipants(sector) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const master = ss.getSheetByName('Master Assessment');
  if (!master) return [];
  const data = master.getDataRange().getValues().slice(1);
  return data.filter(r => r && String(r[0] || '').trim() !== '' && (!sector || r[1] === sector))
             .map(r => ({ name: String(r[0]).trim(), sector: r[1] || 'Unknown' }))
             .sort((a,b) => a.name.localeCompare(b.name));
}

// Return participants whose sector appears to be tour-related
function getTourOperators() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const master = ss.getSheetByName('Master Assessment');
  if (!master) return [];
  const data = master.getDataRange().getValues().slice(1);
  const isTour = s => String(s || '').toLowerCase().indexOf('tour') >= 0;
  return data.filter(r => r && String(r[0] || '').trim() !== '' && isTour(r[1]))
             .map(r => ({ name: String(r[0]).trim(), sector: r[1] || 'Unknown' }))
             .sort((a,b) => a.name.localeCompare(b.name));
}

// Individual improvement plan using existing analysis logic
function getParticipantPlan(name) {
  if (!name) return { error: 'Missing name' };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterTab = ss.getSheetByName('Master Assessment');
  if (!masterTab) return { error: 'Master Assessment tab not found' };

  const assessments = getTechnicalAssessmentData(masterTab) || [];
  const assessment = assessments.find(a => a.name && a.name.toString().trim() === name.toString().trim());
  if (!assessment) return { error: 'Participant not found' };

  // Sector averages for comparison
  const sectorAssessments = assessments.filter(a => a.sector === (assessment.sector || ''));
  const max = ScoreMax ? ScoreMax() : { socialMedia: 18, website: 12, visualContent: 15, discoverability: 12, digitalSales: 8, platformIntegration: 5 };
  const averageOf = (key) => {
    if (sectorAssessments.length === 0) return 0;
    const sum = sectorAssessments.reduce((s, a) => s + (Number(a[key]) || 0), 0);
    return Math.round(sum / sectorAssessments.length * 10) / 10;
  };
  const externalBreakdown = [
    { key: 'socialMedia', label: 'Social Media', score: assessment.socialMedia || 0, sectorAvg: averageOf('socialMedia'), max: max.socialMedia },
    { key: 'website', label: 'Website', score: assessment.website || 0, sectorAvg: averageOf('website'), max: max.website },
    { key: 'visualContent', label: 'Visual Content', score: assessment.visualContent || 0, sectorAvg: averageOf('visualContent'), max: max.visualContent },
    { key: 'discoverability', label: 'Discoverability', score: assessment.discoverability || 0, sectorAvg: averageOf('discoverability'), max: max.discoverability },
    { key: 'digitalSales', label: 'Digital Sales', score: assessment.digitalSales || 0, sectorAvg: averageOf('digitalSales'), max: max.digitalSales },
    { key: 'platformIntegration', label: 'Platform Integration', score: assessment.platformIntegration || 0, sectorAvg: averageOf('platformIntegration'), max: max.platformIntegration }
  ];

  const opps = generateProgressionOpportunities([assessment]) || [];
  const wins = identifyContextualQuickWins([assessment]) || [];

  // Per-category reason snippets for clearer explanations when score is low
  const reasons = {
    website: {
      0: 'No functioning website or link found.',
      1: 'Under construction or major functionality issues.',
      3: 'Basic static site; missing depth or updates.',
      5: 'Functional site; needs clearer structure or updates.',
      7: 'Well-maintained; can improve SEO and performance.',
      9: 'Professional; optimize for conversions and search.',
      12: 'Excellent web presence.'
    },
    socialMedia: {
      0: 'No business profiles identified.',
      2: 'Basic profile on one platform with sporadic posting.',
      4: 'Emerging regular activity; enable business features.',
      6: 'Weekly posting; increase coordination and analytics.',
      8: 'Active on 2 platforms; strengthen reviews and tailoring.',
      10: 'Strategic planning evident; diversify content types.',
      12: 'Professional management; expand cross-platform branding.',
      14: 'Advanced strategy; collaborations growing.',
      16: 'Expert coordination with pro visuals.',
      18: 'Industry leadership.'
    },
    visualContent: {
      0: 'Images/video lack quality; hard to assess offerings.',
      2: 'Basic phone photos; improve lighting and focus.',
      4: 'Better composition; keep quality consistent.',
      6: 'Thoughtful composition; enhance editing.',
      8: 'Semi-professional; unify style and branding.',
      10: 'Professional standard visuals.',
      12: 'Advanced visual strategy in place.',
      15: 'Exceptional, distinctive visuals.'
    },
    discoverability: {
      0: 'Not found in Google search for business name.',
      1: 'Minimal search presence; claim Google profile.',
      3: 'Basic discoverability; add directories and reviews.',
      5: 'Good visibility; build more reviews and posts.',
      7: 'Strong presence; maintain responses and updates.',
      9: 'Excellent reputation management.',
      12: 'Market-leading discoverability.'
    },
    digitalSales: {
      0: 'No online inquiry or ordering capability found.',
      2: 'Can receive inquiries (forms/WhatsApp) but no ordering.',
      4: 'Platform-based sales available; expand options.',
      6: 'Digital payments integrated; streamline flows.',
      8: 'Full digital commerce implemented.'
    },
    platformIntegration: {
      0: 'Not listed on relevant platforms for the sector.',
      1: 'Basic listing; minimal information.',
      3: 'Active listings with updates and optimization.',
      5: 'Comprehensive, optimized platform strategy.'
    }
  };

  // Simplify for UI
  const opportunities = opps.map(o => ({
    category: o.category,
    current: `${o.currentScore} - ${o.currentDescription}`,
    target: `${o.nextLevel} - ${o.nextDescription}`,
    actions: o.immediateActions.slice(0, 3),
    timeframe: o.timeframe,
    cost: o.estimatedCost,
    impact: o.impact
  }));

  const quickWins = wins.map(w => ({
    opportunity: w.opportunity,
    currentToTarget: `${w.currentScore} → ${w.targetScore}`,
    actions: w.specificActions.slice(0, 3),
    timeframe: w.timeframe,
    cost: w.cost,
    impact: w.impact
  }));

  return {
    profile: {
      name: assessment.name,
      sector: assessment.sector,
      region: assessment.region,
      maturity: assessment.maturityLevel,
      scores: {
        socialMedia: assessment.socialMedia,
        website: assessment.website,
        visualContent: assessment.visualContent,
        discoverability: assessment.discoverability,
        digitalSales: assessment.digitalSales,
        platformIntegration: assessment.platformIntegration,
        externalTotal: assessment.externalTotal,
        surveyTotal: assessment.surveyTotal,
        digitalComfort: assessment.digitalComfort,
        contentStrategy: assessment.contentStrategy,
        platformBreadth: assessment.platformBreadth,
        investmentCapacity: assessment.investmentCapacity,
        challengeSeverity: assessment.challengeSeverity,
        combined: assessment.combinedScore
      }
    },
    external: { breakdown: externalBreakdown },
    opportunities: opportunities,
    quickWins: quickWins,
    reasons: reasons
  };
}

// Return assessor justifications for external categories for a participant
function getParticipantJustifications(name) {
  try {
    if (!name) return {};
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const master = ss.getSheetByName('Master Assessment');
    if (!master) return {};
    const data = master.getDataRange().getValues();
    const row = data.find((r, i) => i > 0 && String(r[0] || '').trim() === String(name).trim());
    if (!row) return {};
    // Columns: Y-AD (25-30) → indexes 24..29
    const j = v => String(v || '').trim();
    return {
      socialMedia: j(row[24]),
      website: j(row[25]),
      visualContent: j(row[26]),
      discoverability: j(row[27]),
      digitalSales: j(row[28]),
      platformIntegration: j(row[29])
    };
  } catch (e) {
    return {};
  }
}

// Sector-specific context (priority area and key recommendations) for participant's sector
function getSectorContextForParticipant(name) {
  try {
    if (!name) return {};
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const masterTab = ss.getSheetByName('Master Assessment');
    if (!masterTab) return {};
    const assessments = getTechnicalAssessmentData(masterTab) || [];
    const a = assessments.find(x => x.name && x.name.toString().trim() === name.toString().trim());
    if (!a) return {};
    const guidanceMap = generateSectorSpecificGuidance(assessments) || {};
    const g = guidanceMap[a.sector] || {};
    return {
      sector: a.sector || 'Unknown',
      priorityArea: g.priorityArea || '',
      recommendations: (g.recommendations || []).slice(0, 2),
      total: g.total || 0
    };
  } catch (e) {
    return {};
  }
}

// Return digital presence links for a participant based on columns in Master Assessment
function getParticipantPresence(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const master = ss.getSheetByName('Master Assessment');
  if (!master || !name) return {};
  const lastCol = master.getLastColumn();
  const data = master.getDataRange().getValues();
  const headers = (data[0] || []).map(h => String(h || '').toLowerCase().trim());
  const keyToHeader = {
    website: 'website',
    facebook: 'facebook',
    instagram: 'instagram',
    tripadvisor: 'tripadvisor',
    youtube: 'youtube'
  };
  const idx = {};
  Object.keys(keyToHeader).forEach(k => {
    const h = keyToHeader[k];
    idx[k] = headers.indexOf(h);
  });
  // find row by name (column A)
  const row = data.find((r, i) => i > 0 && String(r[0] || '').trim() === String(name).trim());
  if (!row) return {};
  const normalize = v => {
    const s = String(v || '').trim();
    if (!s) return '';
    if (/^https?:\/\//i.test(s)) return s;
    return '';
  };
  return {
    website: normalize(idx.website >= 0 ? row[idx.website] : ''),
    facebook: normalize(idx.facebook >= 0 ? row[idx.facebook] : ''),
    instagram: normalize(idx.instagram >= 0 ? row[idx.instagram] : ''),
    tripadvisor: normalize(idx.tripadvisor >= 0 ? row[idx.tripadvisor] : ''),
    youtube: normalize(idx.youtube >= 0 ? row[idx.youtube] : '')
  };
}

// Simple correction submission - logs to a Feedback sheet and optionally emails admin
function submitCorrection(participantName, message) {
  try {
    const now = new Date();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // Ensure Feedback sheet exists with headers
    let sheet = ss.getSheetByName('Feedback');
    if (!sheet) {
      sheet = ss.insertSheet('Feedback');
      sheet.appendRow(['Timestamp', 'Participant', 'Message']);
    }
    sheet.appendRow([now, participantName || '', message || '']);

    // Try email, but don't fail if not permitted
    let emailOk = true;
    let emailError = '';
    try {
      const to = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL')
        || 'alex.jeffries@gmail.com';
      const subject = `Dashboard correction for: ${participantName}`;
      const body = `Participant: ${participantName}\n\nMessage:\n${message || ''}\n\nSent: ${now.toLocaleString()}`;
      MailApp.sendEmail({ to: to, subject: subject, body: body });
    } catch (e) {
      emailOk = false;
      emailError = e && e.toString ? e.toString() : String(e);
    }

    return { ok: true, logged: true, emailOk: emailOk, emailError: emailError };
  } catch (err) {
    return { ok: false, logged: false, error: err && err.toString ? err.toString() : String(err) };
  }
}


