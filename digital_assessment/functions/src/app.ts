import express, { Request, Response } from 'express';
import cors from 'cors';
import { google, sheets_v4 } from 'googleapis';

type Participant = { name: string; sector: string; region?: string };
type MaturityLevel = string;
type SectorKey = string;

type AssessmentStats = {
  totalAssessments: number;
  averageScores: { external: number; survey: number; combined: number };
  maturityDistribution: Record<MaturityLevel, number>;
  sectorBreakdown: Record<SectorKey, {
    count: number;
    totalExternal: number;
    totalSurvey: number;
    totalCombined: number;
    averageExternal: number;
    averageSurvey: number;
    averageCombined: number;
  }>;
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

async function getSheetsClient(): Promise<sheets_v4.Sheets> {
  const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  let auth: any;
  if (keyJson && keyJson.trim().startsWith('{')) {
    const creds = JSON.parse(keyJson);
    auth = new google.auth.JWT(
      creds.client_email,
      undefined,
      creds.private_key,
      scopes
    );
    await auth.authorize();
  } else {
    auth = await google.auth.getClient({ scopes });
  }
  return google.sheets({ version: 'v4', auth });
}

async function getSheetsWriteClient(): Promise<sheets_v4.Sheets> {
  const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  let auth: any;
  if (keyJson && keyJson.trim().startsWith('{')) {
    const creds = JSON.parse(keyJson);
    auth = new google.auth.JWT(
      creds.client_email,
      undefined,
      creds.private_key,
      scopes
    );
    await auth.authorize();
  } else {
    auth = await google.auth.getClient({ scopes });
  }
  return google.sheets({ version: 'v4', auth });
}

async function readMaster(sheetId: string, range?: string) {
  const sheets = await getSheetsClient();
  // If no range specified, read from CI Assessment (v2.0 Creative Industries sheet)
  const sheetRange = range || 'CI Assessment';
  const { data } = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: sheetRange });
  const rows = (data.values || []) as string[][];
  return rows;
}

// Survey scoring data type
interface SurveyScore {
  participantName: string;
  type: string;
  surveyDate: string;
  totalScore: number;
  foundationScore: number;
  capabilityScore: number;
  growthScore: number;
  maturityTier: string;
  maturityDescription: string;
  breakdown: {
    foundation: {
      website: number;
      socialPlatforms: number;
      postingFrequency: number;
      onlineSales: number;
      reviewManagement: number;
    };
    capability: {
      comfortLevel: number;
      deviceAccess: number;
      internet: number;
      analytics: number;
    };
    growth: {
      marketingKnowledge: number;
      challengeType: number;
      contentCreation: number;
      monthlyInvestment: number;
      training: number;
      growthAmbition: number;
    };
  };
}

async function readSurveyScores(sheetId: string): Promise<Map<string, SurveyScore>> {
  const surveyMap = new Map<string, SurveyScore>();
  
  try {
    const rows = await readMaster(sheetId, 'Survey_Scoring');
    if (rows.length < 2) return surveyMap; // No data (just header or empty)
    
    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue; // Skip empty rows
      
      const score: SurveyScore = {
        participantName: (row[0] || '').toString().trim(),
        type: (row[1] || '').toString(),
        surveyDate: (row[2] || '').toString(),
        totalScore: n(row[3]),
        foundationScore: n(row[4]),
        capabilityScore: n(row[5]),
        growthScore: n(row[6]),
        maturityTier: (row[7] || '').toString(),
        maturityDescription: (row[8] || '').toString(),
        breakdown: {
          foundation: {
            website: n(row[10]),
            socialPlatforms: n(row[11]),
            postingFrequency: n(row[12]),
            onlineSales: n(row[13]),
            reviewManagement: n(row[14])
          },
          capability: {
            comfortLevel: n(row[15]),
            deviceAccess: n(row[16]),
            internet: n(row[17]),
            analytics: n(row[18])
          },
          growth: {
            marketingKnowledge: n(row[19]),
            challengeType: n(row[20]),
            contentCreation: n(row[21]),
            monthlyInvestment: n(row[22]),
            training: n(row[23]),
            growthAmbition: n(row[24])
          }
        }
      };
      
      surveyMap.set(score.participantName.toLowerCase(), score);
    }
  } catch (error) {
    console.warn('Survey_Scoring sheet not found or error reading it:', error);
  }
  
  return surveyMap;
}

function parseParticipants(rows: string[][], sectorFilter?: string): Participant[] {
  const body = rows.slice(1).filter(r => (r[0] || '').toString().trim() !== '');
  return body
    .filter(r => !sectorFilter || r[1] === sectorFilter)
    .map(r => ({ name: (r[0] || '').toString().trim(), sector: (r[1] || 'Unknown').toString() }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function filterTourOperators(list: Participant[]): Participant[] {
  const namePattern = /(\btour\b|\btravel\b|\bsafari\b|\bexcursion\b|\bexpeditions?\b|\bguide\b)/i;
  return list.filter(p => (
    (p.sector || '').toLowerCase().includes('tour') || namePattern.test(p.name || '')
  ));
}

// Auth types
interface AuthUser {
  fullName: string;
  username: string;
  role: 'admin' | 'participant';
  organizationName: string;
  loginCount: number;
  lastLogin: string;
}

async function readAuthSheet(sheetId: string): Promise<AuthUser[]> {
  const sheets = await getSheetsClient();
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'dashboard_auth!A2:F200'
  });
  
  const rows = result.data.values || [];
  return rows
    .filter(row => row && row[0] && row[1]) // Has name and username
    .map(row => ({
      fullName: row[0] || '',
      username: (row[1] || '').toLowerCase().trim(),
      role: (row[2] || 'participant').toLowerCase() as 'admin' | 'participant',
      organizationName: row[0] || '',
      loginCount: parseInt(row[4] || '0', 10),
      lastLogin: row[5] || ''
    }));
}

async function updateLoginCount(sheetId: string, username: string): Promise<void> {
  const sheets = await getSheetsWriteClient();
  
  // Find the row for this user
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'dashboard_auth!B2:F200'
  });
  
  const rows = result.data.values || [];
  let rowIndex = -1;
  
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] && rows[i][0].toLowerCase().trim() === username.toLowerCase().trim()) {
      rowIndex = i + 2; // +2 because we start at row 2
      break;
    }
  }
  
  if (rowIndex > 0) {
    const currentCount = parseInt(rows[rowIndex - 2][3] || '0', 10);
    const newCount = currentCount + 1;
    const now = new Date().toISOString();
    
    // Update columns E (login_count) and F (last_login)
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `dashboard_auth!E${rowIndex}:F${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[newCount.toString(), now]]
      }
    });
  }
}

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  // Authentication endpoints
  app.post('/auth/login', async (req: Request, res: Response) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }
      
      const sheetId = requireEnv('SHEET_ID');
      const users = await readAuthSheet(sheetId);
      
      // Find user by username (case-insensitive)
      const user = users.find(u => u.username === username.toLowerCase().trim());
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid username' });
      }
      
      // Update login count asynchronously (don't wait)
      updateLoginCount(sheetId, username).catch(err => 
        console.error('Failed to update login count:', err)
      );
      
      // Return user data
      res.json({
        user: {
          fullName: user.fullName,
          username: user.username,
          role: user.role,
          organizationName: user.organizationName,
          loginCount: user.loginCount + 1 // Return the new count
        }
      });
    } catch (e: any) {
      console.error('Login error:', e);
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  app.get('/sectors', async (_req: Request, res: Response) => {
    try {
      const sheetId = requireEnv('SHEET_ID');
      const rowsCI = await readMaster(sheetId, 'CI Assessment');
      let rowsTourism: string[][] = [];
      try {
        rowsTourism = await readMaster(sheetId, 'TO Assessment');
      } catch {
        rowsTourism = [];
      }
      
      const set = new Set<string>();
      
      // Add sectors from CI Assessment (Creative Industries)
      rowsCI.slice(1).forEach(r => { 
        if ((r[0] || '').toString().trim()) set.add((r[1] || 'Unknown').toString()); 
      });
      
      // Add sectors from TO Assessment
      rowsTourism.slice(1).forEach(r => { 
        if ((r[0] || '').toString().trim()) set.add((r[1] || 'Unknown').toString()); 
      });
      
      // Add Tour Operator as a special sector option if not already present
      set.add('Tour Operator');
      
      res.json(Array.from(set).sort());
    } catch (e: any) {
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  app.get('/participants', async (req: Request, res: Response) => {
    try {
      const sector = (req.query.sector || '').toString();
      const sheetId = requireEnv('SHEET_ID');
      const rowsCI = await readMaster(sheetId, 'CI Assessment');
      let rowsTourism: string[][] = [];
      try {
        rowsTourism = await readMaster(sheetId, 'TO Assessment');
      } catch {
        rowsTourism = [];
      }
      
      // Read survey scores
      const surveyScores = await readSurveyScores(sheetId);
      
      // Map with sheet type indicator
      const ciAssessments = rowsCI.slice(1)
        .filter(r => (r[0] || '').toString().trim() !== '')
        .map(r => mapRowToAssessment(r, 'CI'));
      const toAssessments = rowsTourism.slice(1)
        .filter(r => (r[0] || '').toString().trim() !== '')
        .map(r => mapRowToAssessment(r, 'TO'));
      
      let allAssessments = [...ciAssessments, ...toAssessments];
      
      // Merge survey data
      allAssessments = allAssessments.map(a => {
        const survey = surveyScores.get(a.name.toLowerCase());
        if (survey) {
          return {
            ...a,
            surveyFoundation: survey.foundationScore,
            surveyCapability: survey.capabilityScore,
            surveyGrowth: survey.growthScore,
            surveyTier: survey.maturityTier,
            surveyDate: survey.surveyDate,
            surveyTotal: survey.totalScore,
            surveyBreakdown: survey.breakdown,
            surveyDescription: survey.maturityDescription
          };
        }
        return a;
      });
      
      // Filter by sector if provided
      const filtered = sector 
        ? allAssessments.filter(a => a.sector === sector)
        : allAssessments;
      
      res.json(filtered.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (e: any) {
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  app.get('/tour-operators', async (_req: Request, res: Response) => {
    try {
      const sheetId = requireEnv('SHEET_ID');
      const rowsCI = await readMaster(sheetId, 'CI Assessment');
      let rowsTourism: string[][] = [];
      try {
        rowsTourism = await readMaster(sheetId, 'TO Assessment');
      } catch {
        rowsTourism = [];
      }
      
      // Read survey scores
      const surveyScores = await readSurveyScores(sheetId);
      
      // Map with sheet type indicator
      const ciAssessments = rowsCI.slice(1)
        .filter(r => (r[0] || '').toString().trim() !== '')
        .map(r => mapRowToAssessment(r, 'CI'));
      const toAssessments = rowsTourism.slice(1)
        .filter(r => (r[0] || '').toString().trim() !== '')
        .map(r => mapRowToAssessment(r, 'TO'));
      
      let allAssessments = [...ciAssessments, ...toAssessments];
      
      // Merge survey data
      allAssessments = allAssessments.map(a => {
        const survey = surveyScores.get(a.name.toLowerCase());
        if (survey) {
          return {
            ...a,
            surveyFoundation: survey.foundationScore,
            surveyCapability: survey.capabilityScore,
            surveyGrowth: survey.growthScore,
            surveyTier: survey.maturityTier,
            surveyDate: survey.surveyDate,
            surveyTotal: survey.totalScore,
            surveyBreakdown: survey.breakdown,
            surveyDescription: survey.maturityDescription
          };
        }
        return a;
      });
      
      // Filter for tour operators
      const namePattern = /(\btour\b|\btravel\b|\bsafari\b|\bexcursion\b|\bexpeditions?\b|\bguide\b)/i;
      const filtered = allAssessments.filter(p => (
        (p.sector || '').toLowerCase().includes('tour') || namePattern.test(p.name || '')
      ));
      
      res.json(filtered);
    } catch (e: any) {
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  app.get('/stats', async (_req: Request, res: Response) => {
    try {
      const rows = await readMaster(requireEnv('SHEET_ID'));
      const stats = computeStats(rows);
      res.json(stats);
    } catch (e: any) {
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  // Dashboard data (mirrors getDashboardData in Apps Script at a high level)
  app.get('/dashboard', async (req: Request, res: Response) => {
    try {
      const sheetId = requireEnv('SHEET_ID');
      const rowsCI = await readMaster(sheetId, 'CI Assessment');
      let rowsTourism: string[][] = [];
      try {
        rowsTourism = await readMaster(sheetId, 'TO Assessment');
      } catch {
        rowsTourism = [];
      }
      
      // Combine data from both sheets
      const allRows = rowsCI.slice(1).concat(rowsTourism.length ? rowsTourism.slice(1) : []);
      const dataRows = allRows.filter(r => (r[0] || '').toString().trim() !== '');
      
      const result = buildDashboardFromRows(dataRows);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  // Participant plan (simplified port of getParticipantPlan)
  app.get('/participant/plan', async (req: Request, res: Response) => {
    try {
      const name = (req.query.name || '').toString().trim();
      if (!name) return res.status(400).json({ error: 'Missing name' });
      const sheetId = requireEnv('SHEET_ID');
      const rowsCI = await readMaster(sheetId, 'CI Assessment');
      let rowsTourism: string[][] = [];
      try { rowsTourism = await readMaster(sheetId, 'TO Assessment'); } catch { rowsTourism = []; }
      
      // Read survey scores
      const surveyScores = await readSurveyScores(sheetId);
      
      // Map with sheet type indicator
      const ciAssessments = rowsCI.slice(1)
        .filter(r => (r[0] || '').toString().trim() !== '')
        .map(r => mapRowToAssessment(r, 'CI'));
      const toAssessments = rowsTourism.slice(1)
        .filter(r => (r[0] || '').toString().trim() !== '')
        .map(r => mapRowToAssessment(r, 'TO'));
      
      let assessments = [...ciAssessments, ...toAssessments];
      
      // Merge survey data
      assessments = assessments.map(a => {
        const survey = surveyScores.get(a.name.toLowerCase());
        if (survey) {
          return {
            ...a,
            surveyFoundation: survey.foundationScore,
            surveyCapability: survey.capabilityScore,
            surveyGrowth: survey.growthScore,
            surveyTier: survey.maturityTier,
            surveyDate: survey.surveyDate,
            surveyTotal: survey.totalScore,
            surveyBreakdown: survey.breakdown,
            surveyDescription: survey.maturityDescription
          };
        }
        return a;
      });
      
      const assessment = assessments.find(a => a.name.toLowerCase() === name.toLowerCase());
      if (!assessment) return res.status(404).json({ error: 'Participant not found' });

      const sectorAssessments = assessments.filter(a => a.sector === assessment.sector);
      const avgOf = (key: keyof Pick<ReturnType<typeof mapRowToAssessment>, 'socialMedia'|'website'|'visualContent'|'discoverability'|'digitalSales'|'platformIntegration'>) => {
        const vals = sectorAssessments.map(a => a[key] || 0);
        return vals.length ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10 : 0;
      };

      // v2.0: All categories now use raw scores (0-10)
      // Users see simple scores like 7/10, 9/10, etc.
      // The weighted total is used for the overall percentage
      const max = { 
        socialMedia: 10,
        website: 10,
        visualContent: 10,
        discoverability: 10,
        digitalSales: 10,
        platformIntegration: 10
      };
      const externalBreakdown = [
        { key: 'socialMedia', label: 'Social Media', score: assessment.socialMedia || 0, sectorAvg: avgOf('socialMedia'), max: max.socialMedia },
        { key: 'website', label: 'Website', score: assessment.website || 0, sectorAvg: avgOf('website'), max: max.website },
        { key: 'visualContent', label: 'Visual Content', score: assessment.visualContent || 0, sectorAvg: avgOf('visualContent'), max: max.visualContent },
        { key: 'discoverability', label: 'Discoverability', score: assessment.discoverability || 0, sectorAvg: avgOf('discoverability'), max: max.discoverability },
        { key: 'digitalSales', label: 'Digital Sales', score: assessment.digitalSales || 0, sectorAvg: avgOf('digitalSales'), max: max.digitalSales },
        { key: 'platformIntegration', label: 'Platform Integration', score: assessment.platformIntegration || 0, sectorAvg: avgOf('platformIntegration'), max: max.platformIntegration }
      ];

      // Helper function for market label
      const getMarketLabel = (score: number): string => {
        if (score >= 8) return 'Highly Tourist-Focused';
        if (score >= 6) return 'Tourist-Oriented';
        if (score >= 4) return 'Balanced Market';
        if (score >= 2) return 'Local-Oriented';
        return 'Local-Focused';
      };

      // Generate checkbox-specific opportunities and quick wins
      const checkboxGuidance = await generateCheckboxGuidance(name, assessment.sector);
      const opportunities = checkboxGuidance.opportunities;
      const quickWins = checkboxGuidance.quickWins;
      const reasons = buildSimpleReasons();

      res.json({
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
            // Survey scores (Option C)
            surveyFoundation: assessment.surveyFoundation || 0,
            surveyCapability: assessment.surveyCapability || 0,
            surveyGrowth: assessment.surveyGrowth || 0,
            // Totals
            externalTotal: assessment.externalTotal,
            surveyTotal: assessment.surveyTotal,
            combined: assessment.combinedScore
          },
          insights: {
            surveyTier: assessment.surveyTier || 'Unknown'
          },
          // Digital Presence URLs
          websiteUrl: assessment.websiteUrl || null,
          facebookUrl: assessment.facebookUrl || null,
          instagramUrl: assessment.instagramUrl || null,
          tripadvisorUrl: assessment.tripadvisorUrl || null,
          youtubeUrl: assessment.youtubeUrl || null,
          // Social Metrics
          facebookFollowers: assessment.facebookFollowers || 0,
          instagramFollowers: assessment.instagramFollowers || 0,
          tripadvisorReviews: assessment.tripadvisorReviews || 0,
          youtubeSubscribers: assessment.youtubeSubscribers || 0
        },
        external: { breakdown: externalBreakdown },
        opportunities,
        quickWins,
        reasons
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  // Participant justifications (columns Y-AD)
  app.get('/participant/justifications', async (req: Request, res: Response) => {
    try {
      const name = (req.query.name || '').toString().trim();
      if (!name) return res.status(400).json({ error: 'Missing name' });
      const sheetId = requireEnv('SHEET_ID');
      const rowsCI = await readMaster(sheetId, 'CI Assessment');
      let rowsTourism: string[][] = [];
      try { rowsTourism = await readMaster(sheetId, 'Tourism Assessment'); } catch { rowsTourism = []; }
      const data = rowsCI.concat(rowsTourism.length ? rowsTourism : []);
      const row = data.find((r, i) => i > 0 && (r[0] || '').toString().trim().toLowerCase() === name.toLowerCase());
      if (!row) return res.json({});
      const j = (v: any) => (v || '').toString().trim();
      res.json({
        socialMedia: j(row[24]),
        website: j(row[25]),
        visualContent: j(row[26]),
        discoverability: j(row[27]),
        digitalSales: j(row[28]),
        platformIntegration: j(row[29])
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  // Participant presence links (Website, Facebook, Instagram, Tripadvisor, YouTube)
  app.get('/participant/presence', async (req: Request, res: Response) => {
    try {
      const name = (req.query.name || '').toString().trim();
      if (!name) return res.status(400).json({ error: 'Missing name' });
      const sheetId = requireEnv('SHEET_ID');
      const rowsCI = await readMaster(sheetId, 'CI Assessment');
      let rowsTourism: string[][] = [];
      try { rowsTourism = await readMaster(sheetId, 'TO Assessment'); } catch { rowsTourism = []; }
      const rows = rowsCI.concat(rowsTourism.length ? rowsTourism : []);
      const headers = (rows[0] || []).map(h => (h || '').toString().toLowerCase().trim());
      const idx: Record<string, number> = {};
      const map: Record<string, string> = { 
        website: 'website url', 
        facebook: 'facebook', 
        instagram: 'instagram', 
        tripadvisor: 'tripadvisor', 
        youtube: 'youtube',
        tiktok: 'tiktok',
        facebookFollowers: 'facebook followers',
        instagramFollowers: 'instagram followers', 
        tripadvisorReviews: 'tripadvisor reviews',
        youtubeSubscribers: 'youtube subscribers',
        tiktokFollowers: 'tiktok followers'
      };
      Object.keys(map).forEach(k => { 
        idx[k] = headers.indexOf(map[k]); 
        // Try without "url" suffix if not found
        if (idx[k] < 0 && k === 'website') {
          idx[k] = headers.indexOf('website');
        }
      });
      
      // Fallback to column indices if header names not found (updated for restructured schema)
      if (idx.website < 0) idx.website = 29; // Column AD
      if (idx.facebook < 0) idx.facebook = 30; // Column AE  
      if (idx.instagram < 0) idx.instagram = 31; // Column AF
      if (idx.tripadvisor < 0) idx.tripadvisor = 32; // Column AG
      if (idx.youtube < 0) idx.youtube = 33; // Column AH
      if (idx.facebookFollowers < 0) idx.facebookFollowers = 34; // Column AI
      if (idx.instagramFollowers < 0) idx.instagramFollowers = 35; // Column AJ
      if (idx.tripadvisorReviews < 0) idx.tripadvisorReviews = 36; // Column AK
      if (idx.youtubeSubscribers < 0) idx.youtubeSubscribers = 37; // Column AL
      if (idx.tiktok < 0) idx.tiktok = 38; // Column AM
      if (idx.tiktokFollowers < 0) idx.tiktokFollowers = 39; // Column AN
      
      const row = rows.find((r, i) => i > 0 && (r[0] || '').toString().trim().toLowerCase() === name.toLowerCase());
      if (!row) return res.json({});
      const normalize = (v: any) => {
        const s = (v || '').toString().trim();
        if (!s) return '';
        if (/^https?:\/\//i.test(s)) return s;
        return '';
      };
      const normalizeNumber = (v: any) => {
        const s = (v || '').toString().trim();
        if (!s) return null;
        const num = parseFloat(s.replace(/[^\d.-]/g, ''));
        return isNaN(num) ? null : num;
      };
      res.json({
        website: normalize(idx.website >= 0 ? row[idx.website] : ''),
        facebook: normalize(idx.facebook >= 0 ? row[idx.facebook] : ''),
        instagram: normalize(idx.instagram >= 0 ? row[idx.instagram] : ''),
        tripadvisor: normalize(idx.tripadvisor >= 0 ? row[idx.tripadvisor] : ''),
        youtube: normalize(idx.youtube >= 0 ? row[idx.youtube] : ''),
        tiktok: normalize(idx.tiktok >= 0 ? row[idx.tiktok] : ''),
        socialMediaMetrics: {
          facebookFollowers: normalizeNumber(idx.facebookFollowers >= 0 ? row[idx.facebookFollowers] : ''),
          instagramFollowers: normalizeNumber(idx.instagramFollowers >= 0 ? row[idx.instagramFollowers] : ''),
          tripadvisorReviews: normalizeNumber(idx.tripadvisorReviews >= 0 ? row[idx.tripadvisorReviews] : ''),
          youtubeSubscribers: normalizeNumber(idx.youtubeSubscribers >= 0 ? row[idx.youtubeSubscribers] : ''),
          tiktokFollowers: normalizeNumber(idx.tiktokFollowers >= 0 ? row[idx.tiktokFollowers] : '')
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  // Sector context for participant (priority area + recommendations)
  app.get('/participant/sector-context', async (req: Request, res: Response) => {
    try {
      const name = (req.query.name || '').toString().trim();
      if (!name) return res.status(400).json({ error: 'Missing name' });
      const sheetId = requireEnv('SHEET_ID');
      const rowsCI = await readMaster(sheetId, 'CI Assessment!A1:AO10000');
      let rowsTourism: string[][] = [];
      try { rowsTourism = await readMaster(sheetId, 'TO Assessment'); } catch { rowsTourism = []; }
      
      // Map with sheet type indicator
      const ciAssessments = rowsCI.slice(1)
        .filter(r => (r[0] || '').toString().trim() !== '')
        .map(r => mapRowToAssessment(r, 'CI'));
      const toAssessments = rowsTourism.slice(1)
        .filter(r => (r[0] || '').toString().trim() !== '')
        .map(r => mapRowToAssessment(r, 'TO'));
      
      const assessments = [...ciAssessments, ...toAssessments];
      const a = assessments.find(x => x.name.toLowerCase() === name.toLowerCase());
      if (!a) return res.json({});
      const guidanceMap = generateSectorGuidance(assessments);
      const g = guidanceMap[a.sector] || {} as any;
      res.json({
        sector: a.sector || 'Unknown',
        priorityArea: g.priorityArea || '',
        recommendations: (g.recommendations || []).slice(0, 2),
        total: g.total || 0
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  // Checkbox-specific guidance - reads from Checklist Detail
  app.get('/participant/guidance', async (req: Request, res: Response) => {
    try {
      const name = (req.query.name || '').toString().trim();
      if (!name) return res.status(400).json({ error: 'Missing name' });
      
      const sheetId = requireEnv('SHEET_ID');
      const sheets = await getSheetsClient();
      
      // Read Checklist Detail sheet
      const { data } = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Checklist Detail!A2:BS1000'
      });
      
      const rows = (data.values || []) as string[][];
      const stakeholderRow = rows.find(r => r[0]?.toString().trim().toLowerCase() === name.toLowerCase());
      
      if (!stakeholderRow) {
        return res.status(404).json({ error: 'Stakeholder not found in Checklist Detail' });
      }
      
      // Parse stakeholder data
      const sector = stakeholderRow[1] || 'Unknown';
      const weights = getSectorWeights(sector);
      
      // Parse checkboxes by category (columns F-BS)
      const categories = [
        { 
          name: 'Social Media', 
          startCol: 5, endCol: 14, 
          weight: weights.socialMedia,
          criteria: getCategoryCriteria('socialMedia')
        },
        { 
          name: 'Website', 
          startCol: 16, endCol: 25, 
          weight: weights.website,
          criteria: getCategoryCriteria('website')
        },
        { 
          name: 'Visual Content', 
          startCol: 27, endCol: 36, 
          weight: weights.visualContent,
          criteria: getCategoryCriteria('visualContent')
        },
        { 
          name: 'Discoverability', 
          startCol: 38, endCol: 47, 
          weight: weights.discoverability,
          criteria: getCategoryCriteria('discoverability')
        },
        { 
          name: 'Digital Sales', 
          startCol: 49, endCol: 58, 
          weight: weights.digitalSales,
          criteria: getCategoryCriteria('digitalSales')
        },
        { 
          name: 'Platform Integration', 
          startCol: 60, endCol: 69, 
          weight: weights.platformIntegration,
          criteria: getCategoryCriteria('platformIntegration')
        }
      ];
      
      // Generate guidance for each category
      const guidance = categories.map(cat => {
        const checkboxes = [];
        const missing = [];
        
        for (let i = cat.startCol; i <= cat.endCol; i++) {
          const value = stakeholderRow[i];
          const isChecked = String(value) === '1' || String(value) === 'true';
          const criterionIndex = i - cat.startCol;
          
          if (isChecked) {
            checkboxes.push(criterionIndex);
          } else {
            missing.push({
              index: criterionIndex,
              description: cat.criteria[criterionIndex] || `Criterion ${criterionIndex + 1}`,
              action: getActionForCriterion(cat.name, criterionIndex, sector),
              benefit: getBenefitForCriterion(cat.name, criterionIndex, sector),
              effort: getEffortForCriterion(cat.name, criterionIndex),
              timeframe: getTimeframeForCriterion(cat.name, criterionIndex),
              cost: getCostForCriterion(cat.name, criterionIndex)
            });
          }
        }
        
        const score = checkboxes.length;
        const maxScore = 10;
        const priority = cat.weight > 1.5 ? 'HIGH' : cat.weight > 1.0 ? 'MEDIUM' : 'LOW';
        
        return {
          category: cat.name,
          score,
          maxScore,
          weight: cat.weight,
          priority,
          percentComplete: Math.round((score / maxScore) * 100),
          checkedCriteria: checkboxes.map(idx => cat.criteria[idx]),
          missingCriteria: missing.slice(0, 5) // Top 5 missing items
        };
      });
      
      // Sort by priority (high weight categories first)
      guidance.sort((a, b) => b.weight - a.weight);
      
      res.json({
        stakeholder: name,
        sector,
        categories: guidance
      });
      
    } catch (e: any) {
      console.error('Error generating guidance:', e);
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  // Feedback endpoint - writes to Feedback tab
  app.post('/feedback', async (req: Request, res: Response) => {
    try {
      const { type, participant, sector, message, contact } = req.body;
      const sheets = await getSheetsWriteClient();
      const sheetId = requireEnv('SHEET_ID');
      
      // Get current timestamp
      const timestamp = new Date().toISOString();
      
      // Prepare the row data for the Feedback tab
      const rowData = [
        timestamp,
        type || 'correction',
        participant || '',
        sector || '',
        message || '',
        contact || '',
        'Submitted via web app'
      ];
      
      // Append to the Feedback tab
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'Feedback!A:G',
        valueInputOption: 'RAW',
        requestBody: {
          values: [rowData]
        }
      });
      
      res.json({ success: true, message: 'Feedback submitted successfully' });
    } catch (e: any) {
      console.error('Error submitting feedback:', e);
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  // Add participant endpoint - writes to Master Assessment tab
  app.post('/participants', async (req: Request, res: Response) => {
    try {
      const { name, sector, contact, notes } = req.body;
      const sheets = await getSheetsWriteClient();
      const sheetId = requireEnv('SHEET_ID');
      
      // Get current timestamp
      const timestamp = new Date().toISOString();
      
      // Prepare the row data for the Master Assessment tab
      // This will add a new participant with basic info, ready for assessment
      const rowData = [
        name || '',
        sector || '',
        '', // Region (empty for now)
        '', // External score (empty for now)
        '', // Survey score (empty for now)
        '', // Combined score (empty for now)
        '', // Maturity level (empty for now)
        contact || '',
        notes || '',
        'Added via web app',
        timestamp
      ];
      
      // Append to the Master Assessment tab
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'Master Assessment!A:K',
        valueInputOption: 'RAW',
        requestBody: {
          values: [rowData]
        }
      });
      
      res.json({ success: true, message: 'Participant added successfully' });
    } catch (e: any) {
      console.error('Error adding participant:', e);
      res.status(500).json({ error: e.message || String(e) });
    }
  });
 // Participant opportunities endpoint - AI-powered recommendations
  app.get('/participant/opportunities', async (req: Request, res: Response) => {
    try {
      const name = (req.query.name || '').toString();
      if (!name) {
        res.status(400).json({ error: 'Name parameter required' });
        return;
      }
      
      const sheetId = requireEnv('SHEET_ID');
      
      // Read AI recommendations from Recommendations sheet
      const recsRows = await readMaster(sheetId, 'Recommendations');
      
      // Find the recommendation row for this participant
      // Schema: A=Name, B=Sector, C=SM Score, D=SM Rec, E=Web Score, F=Web Rec, etc.
      const recRow = recsRows.find((row, index) => 
        index > 0 && String(row[0] || '').trim().toLowerCase() === name.trim().toLowerCase()
      );
      
      if (!recRow) {
        // Fallback to empty recommendations if not found
        res.json({
          recommendations: []
        });
        return;
      }
      
      // Parse AI recommendations with icons
      const recommendations = [
        {
          category: 'Social Media',
          icon: '📱',
          score: parseInt(recRow[2] || '0'),
          recommendation: recRow[3] || '',
          color: 'bg-blue-50 border-blue-200'
        },
        {
          category: 'Website',
          icon: '🌐',
          score: parseInt(recRow[4] || '0'),
          recommendation: recRow[5] || '',
          color: 'bg-green-50 border-green-200'
        },
        {
          category: 'Visual Content',
          icon: '📸',
          score: parseInt(recRow[6] || '0'),
          recommendation: recRow[7] || '',
          color: 'bg-purple-50 border-purple-200'
        },
        {
          category: 'Discoverability',
          icon: '🔍',
          score: parseInt(recRow[8] || '0'),
          recommendation: recRow[9] || '',
          color: 'bg-yellow-50 border-yellow-200'
        },
        {
          category: 'Digital Sales',
          icon: '💳',
          score: parseInt(recRow[10] || '0'),
          recommendation: recRow[11] || '',
          color: 'bg-red-50 border-red-200'
        },
        {
          category: 'Platform Integration',
          icon: '🔗',
          score: parseInt(recRow[12] || '0'),
          recommendation: recRow[13] || '',
          color: 'bg-indigo-50 border-indigo-200'
        }
      ].filter(r => r.recommendation); // Only include categories with recommendations
      
      res.json({
        recommendations
      });
    } catch (e: any) {
      console.error('Error fetching recommendations:', e);
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  // Helper function to get data from appropriate sheet based on sector
  async function getSectorData(sectorName: string) {
    const sheetId = requireEnv('SHEET_ID');
    const rowsCI = await readMaster(sheetId, 'CI Assessment');
    let rowsTourism: string[][] = [];
    
    // If sector is "Tour Operator", read from TO Assessment sheet
    if (sectorName.toLowerCase().includes('tour operator')) {
      try {
        rowsTourism = await readMaster(sheetId, 'TO Assessment');
      } catch {
        rowsTourism = [];
      }
    }
    
    // Combine data from both CI Assessment and TO Assessment sheets
    return rowsCI.concat(rowsTourism.length ? rowsTourism : []);
  }

  // Sector Intelligence Dashboard endpoints
  app.get('/sector/overview', async (req: Request, res: Response) => {
    try {
      const sectorName = (req.query.name || '').toString();
      if (!sectorName) {
        res.status(400).json({ error: 'Sector name required' });
        return;
      }
      
      const rows = await getSectorData(sectorName);
      
      // Filter participants by sector
      const sectorParticipants = rows
        .slice(1)
        .map(row => mapRowToAssessment(row))
        .filter(p => p.sector === sectorName && p.name);
      
      if (sectorParticipants.length === 0) {
        res.status(404).json({ error: 'Sector not found' });
        return;
      }
      
      // Calculate sector metrics
      const totalStakeholders = sectorParticipants.length;
      const withExternal = sectorParticipants.filter(p => p.externalTotal > 0).length;
      const withSurvey = sectorParticipants.filter(p => p.surveyTotal > 0).length;
      const complete = sectorParticipants.filter(p => p.externalTotal > 0 && p.surveyTotal > 0).length;
      
      const avgExternal = withExternal ? sectorParticipants.reduce((sum, p) => sum + p.externalTotal, 0) / withExternal : 0;
      const avgSurvey = withSurvey ? sectorParticipants.reduce((sum, p) => sum + p.surveyTotal, 0) / withSurvey : 0;
      const avgCombined = complete ? sectorParticipants.reduce((sum, p) => sum + p.combinedScore, 0) / complete : 0;
      
      // Maturity distribution
      const maturityDistribution: Record<string, number> = { Expert: 0, Advanced: 0, Intermediate: 0, Emerging: 0, Absent: 0 };
      sectorParticipants.forEach(p => {
        const maturity = normalizeMaturity(p.maturityLevel);
        maturityDistribution[maturity] = (maturityDistribution[maturity] || 0) + 1;
      });
      
      // Category averages
      const categoryAverages = {
        socialMedia: sectorParticipants.reduce((sum, p) => sum + p.socialMedia, 0) / totalStakeholders,
        website: sectorParticipants.reduce((sum, p) => sum + p.website, 0) / totalStakeholders,
        visualContent: sectorParticipants.reduce((sum, p) => sum + p.visualContent, 0) / totalStakeholders,
        discoverability: sectorParticipants.reduce((sum, p) => sum + p.discoverability, 0) / totalStakeholders,
        digitalSales: sectorParticipants.reduce((sum, p) => sum + p.digitalSales, 0) / totalStakeholders,
        platformIntegration: sectorParticipants.reduce((sum, p) => sum + p.platformIntegration, 0) / totalStakeholders
      };
      
      res.json({
        sector: sectorName,
        totalStakeholders,
        participationRate: Math.round((complete / totalStakeholders) * 100),
        avgExternal: Math.round(avgExternal * 10) / 10,
        avgSurvey: Math.round(avgSurvey * 10) / 10,
        avgCombined: Math.round(avgCombined * 10) / 10,
        maturityDistribution,
        categoryAverages: Object.fromEntries(
          Object.entries(categoryAverages).map(([k, v]) => [k, Math.round(v * 10) / 10])
        ),
        completionStats: {
          withExternal,
          withSurvey,
          complete,
          externalRate: Math.round((withExternal / totalStakeholders) * 100),
          surveyRate: Math.round((withSurvey / totalStakeholders) * 100)
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  app.get('/sector/ranking', async (req: Request, res: Response) => {
    try {
      const type = (req.query.type || 'all').toString(); // 'creative' or 'all'
      const sheetId = requireEnv('SHEET_ID');
      const rowsCI = await readMaster(sheetId, 'CI Assessment');
      let rowsTourism: string[][] = [];
      try {
        rowsTourism = await readMaster(sheetId, 'TO Assessment');
      } catch {
        rowsTourism = [];
      }
      const rows = rowsCI.concat(rowsTourism.length ? rowsTourism : []);
      
      // Get all sectors
      const allSectors = new Set<string>();
      rows.slice(1).forEach(row => {
        const sector = (row[1] || '').toString().trim();
        if (sector) allSectors.add(sector);
      });
      
      // Filter sectors based on type
      let sectorsToCompare = Array.from(allSectors);
      if (type === 'creative') {
        sectorsToCompare = sectorsToCompare.filter(s => 
          !s.toLowerCase().includes('tour operator') && 
          !s.toLowerCase().includes('tourism')
        );
      }
      
      // Calculate sector metrics
      const sectorMetrics = sectorsToCompare.map(sector => {
        const sectorParticipants = rows
          .slice(1)
          .map(row => mapRowToAssessment(row))
          .filter(p => p.sector === sector && p.name);
        
        const complete = sectorParticipants.filter(p => p.externalTotal > 0 && p.surveyTotal > 0);
        const avgCombined = complete.length ? complete.reduce((sum, p) => sum + p.combinedScore, 0) / complete.length : 0;
        const participationRate = sectorParticipants.length ? Math.round((complete.length / sectorParticipants.length) * 100) : 0;
        
        return {
          sector,
          avgCombined: Math.round(avgCombined * 10) / 10,
          participationRate,
          totalStakeholders: sectorParticipants.length,
          completeAssessments: complete.length
        };
      });
      
      // Sort by average combined score
      sectorMetrics.sort((a, b) => b.avgCombined - a.avgCombined);
      
      // Add ranking
      const rankedSectors = sectorMetrics.map((sector, index) => ({
        ...sector,
        rank: index + 1
      }));
      
      res.json({
        type,
        sectors: rankedSectors,
        totalSectors: rankedSectors.length
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  app.get('/sector/leaders', async (req: Request, res: Response) => {
    try {
      const sectorName = (req.query.name || '').toString();
      if (!sectorName) {
        res.status(400).json({ error: 'Sector name required' });
        return;
      }
      
      const rows = await getSectorData(sectorName);
      
      // Filter participants by sector
      const sectorParticipants = rows
        .slice(1)
        .map(row => mapRowToAssessment(row))
        .filter(p => p.sector === sectorName && p.name && p.externalTotal > 0)
        .sort((a, b) => b.combinedScore - a.combinedScore)
        .slice(0, 3); // Top 3
      
      res.json({
        sector: sectorName,
        leaders: sectorParticipants.map(p => ({
          name: p.name,
          combinedScore: p.combinedScore,
          externalScore: p.externalTotal,
          surveyScore: p.surveyTotal,
          maturityLevel: p.maturityLevel,
          region: p.region
        }))
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  app.get('/sector/category-comparison', async (req: Request, res: Response) => {
    try {
      const sectorName = (req.query.name || '').toString();
      const compareWith = (req.query.compare || 'all').toString(); // 'creative' or 'all'
      
      if (!sectorName) {
        res.status(400).json({ error: 'Sector name required' });
        return;
      }
      
      const rows = await getSectorData(sectorName);
      
      // Get all sectors for comparison
      const allSectors = new Set<string>();
      rows.slice(1).forEach(row => {
        const sector = (row[1] || '').toString().trim();
        if (sector) allSectors.add(sector);
      });
      
      // Filter sectors based on comparison type
      let sectorsToCompare = Array.from(allSectors);
      if (compareWith === 'creative') {
        sectorsToCompare = sectorsToCompare.filter(s => 
          !s.toLowerCase().includes('tour operator') && 
          !s.toLowerCase().includes('tourism')
        );
      }
      
      // Calculate category averages for each sector
      const sectorCategoryData = sectorsToCompare.map(sector => {
        const sectorParticipants = rows
          .slice(1)
          .map(row => mapRowToAssessment(row))
          .filter(p => p.sector === sector && p.name && p.externalTotal > 0);
        
        if (sectorParticipants.length === 0) return null;
        
        const categoryAverages = {
          socialMedia: sectorParticipants.reduce((sum, p) => sum + p.socialMedia, 0) / sectorParticipants.length,
          website: sectorParticipants.reduce((sum, p) => sum + p.website, 0) / sectorParticipants.length,
          visualContent: sectorParticipants.reduce((sum, p) => sum + p.visualContent, 0) / sectorParticipants.length,
          discoverability: sectorParticipants.reduce((sum, p) => sum + p.discoverability, 0) / sectorParticipants.length,
          digitalSales: sectorParticipants.reduce((sum, p) => sum + p.digitalSales, 0) / sectorParticipants.length,
          platformIntegration: sectorParticipants.reduce((sum, p) => sum + p.platformIntegration, 0) / sectorParticipants.length
        };
        
        return {
          sector,
          categoryAverages: Object.fromEntries(
            Object.entries(categoryAverages).map(([k, v]) => [k, Math.round(v * 10) / 10])
          ),
          participantCount: sectorParticipants.length
        };
      }).filter(Boolean);
      
      // Find the target sector data
      const targetSector = sectorCategoryData.find(s => s?.sector === sectorName);
      const otherSectors = sectorCategoryData.filter(s => s?.sector !== sectorName);
      
      res.json({
        targetSector,
        otherSectors,
        comparisonType: compareWith,
        categories: ['socialMedia', 'website', 'visualContent', 'discoverability', 'digitalSales', 'platformIntegration'],
        categoryLabels: {
          socialMedia: 'Social Media',
          website: 'Website',
          visualContent: 'Visual Content',
          discoverability: 'Discoverability',
          digitalSales: 'Digital Sales',
          platformIntegration: 'Platform Integration'
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  // Update scores endpoint for manual assessment
  app.post('/update_scores', async (req: Request, res: Response) => {
    try {
      const { stakeholder_id, category, criterion, value } = req.body;
      
      if (!stakeholder_id || !category || !criterion || value === undefined) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: stakeholder_id, category, criterion, or value' 
        });
      }

      const sheets = await getSheetsWriteClient();
      const sheetId = requireEnv('SHEET_ID');
      
      // Calculate column position based on category and criterion (Checklist Detail sheet)
      const categoryColumns = {
        'social_media': 5,    // Column F (0-based index 5) - criteria in F-O
        'website': 16,        // Column Q (0-based index 16) - criteria in Q-Z
        'visual_content': 27, // Column AB (0-based index 27) - criteria in AB-AK
        'discoverability': 38, // Column AM (0-based index 38) - criteria in AM-AV
        'digital_sales': 49,  // Column AX (0-based index 49) - criteria in AX-BG
        'platform_integration': 60 // Column BI (0-based index 60) - criteria in BI-BR
      };
      
      // Extract criterion number (e.g., "SM1" -> 1, "WEB2" -> 2)
      const criterionNum = parseInt(criterion.replace(/[A-Z]+/, ''));
      if (isNaN(criterionNum) || criterionNum < 1 || criterionNum > 10) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid criterion format. Expected format like SM1, WEB2, etc.' 
        });
      }
      
      // Calculate the exact column (0-based index)
      const columnIndex = categoryColumns[category as keyof typeof categoryColumns] + criterionNum - 1;
      
      // Convert to Excel column letter (A=0, B=1, etc.)
      const colLetter = String.fromCharCode(65 + columnIndex);
      
      // Ensure value is 0 or 1
      const scoreValue = value ? 1 : 0;
      
      console.log(`Updating ${category} ${criterion} for stakeholder ${stakeholder_id} to ${scoreValue} in cell ${colLetter}${stakeholder_id}`);
      
      // Update the cell in the Checklist Detail sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `Checklist Detail!${colLetter}${stakeholder_id}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[scoreValue]]
        }
      });
      
      res.json({ success: true });
      
    } catch (e: any) {
      console.error('Error updating scores:', e);
      res.status(500).json({ 
        success: false, 
        error: e.message || String(e) 
      });
    }
  });

  // Sector Baseline Endpoint
  app.get('/sector/:sectorName/baseline', async (req: Request, res: Response) => {
    try {
      const sectorName = decodeURIComponent(req.params.sectorName);
      const sheetId = requireEnv('SHEET_ID');
      const sheets = await getSheetsClient();
      
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'CI Assessment!A2:AN1000'
      });
      
      const rows = result.data.values || [];
      
      // Filter participants by sector
      const sectorParticipants = rows
        .map(row => mapRowToAssessment(row))
        .filter(p => p.name && p.sector === sectorName);
      
      if (sectorParticipants.length === 0) {
        return res.status(404).json({ error: 'Sector not found' });
      }
      
      // Digital Presence Statistics
      const withWebsite = sectorParticipants.filter(p => p.websiteUrl && p.websiteUrl.length > 0).length;
      const withFacebook = sectorParticipants.filter(p => p.facebookUrl && p.facebookUrl.length > 0).length;
      const withInstagram = sectorParticipants.filter(p => p.instagramUrl && p.instagramUrl.length > 0).length;
      const withTripAdvisor = sectorParticipants.filter(p => p.tripadvisorUrl && p.tripadvisorUrl.length > 0).length;
      const withYoutube = sectorParticipants.filter(p => p.youtubeUrl && p.youtubeUrl.length > 0).length;
      const withTiktok = sectorParticipants.filter(p => p.tiktokUrl && p.tiktokUrl.length > 0).length;
      
      // Social Media Reach
      const fbFollowers = sectorParticipants
        .map(p => p.facebookFollowers || 0)
        .filter(f => f > 0);
      const igFollowers = sectorParticipants
        .map(p => p.instagramFollowers || 0)
        .filter(f => f > 0);
      const taReviews = sectorParticipants
        .map(p => p.tripadvisorReviews || 0)
        .filter(r => r > 0);
      const ytSubscribers = sectorParticipants
        .map(p => p.youtubeSubscribers || 0)
        .filter(s => s > 0);
      const tiktokFollowers = sectorParticipants
        .map(p => p.tiktokFollowers || 0)
        .filter(f => f > 0);
      
      const avgFbFollowers = fbFollowers.length > 0 ? Math.round(fbFollowers.reduce((a, b) => a + b, 0) / fbFollowers.length) : 0;
      const avgIgFollowers = igFollowers.length > 0 ? Math.round(igFollowers.reduce((a, b) => a + b, 0) / igFollowers.length) : 0;
      const avgTaReviews = taReviews.length > 0 ? Math.round(taReviews.reduce((a, b) => a + b, 0) / taReviews.length) : 0;
      const avgYtSubscribers = ytSubscribers.length > 0 ? Math.round(ytSubscribers.reduce((a, b) => a + b, 0) / ytSubscribers.length) : 0;
      const avgTiktokFollowers = tiktokFollowers.length > 0 ? Math.round(tiktokFollowers.reduce((a, b) => a + b, 0) / tiktokFollowers.length) : 0;
      
      const totalFbFollowers = fbFollowers.reduce((a, b) => a + b, 0);
      const totalIgFollowers = igFollowers.reduce((a, b) => a + b, 0);
      const totalTaReviews = taReviews.reduce((a, b) => a + b, 0);
      const totalYtSubscribers = ytSubscribers.reduce((a, b) => a + b, 0);
      const totalTiktokFollowers = tiktokFollowers.reduce((a, b) => a + b, 0);
      
      // Platform usage stats
      const platformsPerStakeholder = sectorParticipants.map(p => {
        let count = 0;
        if (p.websiteUrl && p.websiteUrl.length > 0) count++;
        if (p.facebookUrl && p.facebookUrl.length > 0) count++;
        if (p.instagramUrl && p.instagramUrl.length > 0) count++;
        if (p.tripadvisorUrl && p.tripadvisorUrl.length > 0) count++;
        if (p.youtubeUrl && p.youtubeUrl.length > 0) count++;
        if (p.tiktokUrl && p.tiktokUrl.length > 0) count++;
        return count;
      });
      
      const avgPlatforms = platformsPerStakeholder.length > 0 
        ? Math.round((platformsPerStakeholder.reduce((a, b) => a + b, 0) / platformsPerStakeholder.length) * 10) / 10 
        : 0;
      
      // Most popular platform
      const platformPopularity = [
        { name: 'Facebook', count: withFacebook },
        { name: 'Instagram', count: withInstagram },
        { name: 'TripAdvisor', count: withTripAdvisor },
        { name: 'YouTube', count: withYoutube },
        { name: 'TikTok', count: withTiktok },
        { name: 'Website', count: withWebsite }
      ].sort((a, b) => b.count - a.count);
      
      const mostPopularPlatform = platformPopularity[0]?.name || 'None';
      
      const baseline = {
        totalStakeholders: sectorParticipants.length,
        digitalPresence: {
          withWebsite,
          withFacebook,
          withInstagram,
          withTripAdvisor,
          withYoutube,
          withTiktok,
          percentWithWebsite: Math.round((withWebsite / sectorParticipants.length) * 100),
          percentWithFacebook: Math.round((withFacebook / sectorParticipants.length) * 100),
          percentWithInstagram: Math.round((withInstagram / sectorParticipants.length) * 100),
          percentWithTripAdvisor: Math.round((withTripAdvisor / sectorParticipants.length) * 100),
          percentWithYoutube: Math.round((withYoutube / sectorParticipants.length) * 100),
          percentWithTiktok: Math.round((withTiktok / sectorParticipants.length) * 100)
        },
        socialMediaReach: {
          avgFacebookFollowers: avgFbFollowers,
          avgInstagramFollowers: avgIgFollowers,
          avgTripAdvisorReviews: avgTaReviews,
          avgYoutubeSubscribers: avgYtSubscribers,
          avgTiktokFollowers: avgTiktokFollowers,
          totalFacebookFollowers: totalFbFollowers,
          totalInstagramFollowers: totalIgFollowers,
          totalTripAdvisorReviews: totalTaReviews,
          totalYoutubeSubscribers: totalYtSubscribers,
          totalTiktokFollowers: totalTiktokFollowers,
          stakeholdersWithFbFollowers: fbFollowers.length,
          stakeholdersWithIgFollowers: igFollowers.length,
          stakeholdersWithTaReviews: taReviews.length,
          stakeholdersWithYtSubscribers: ytSubscribers.length,
          stakeholdersWithTiktokFollowers: tiktokFollowers.length
        },
        commonPatterns: {
          avgPlatformsPerStakeholder: avgPlatforms,
          mostPopularPlatform: mostPopularPlatform,
          platformPopularity: platformPopularity
        }
      };
      
      res.json(baseline);
    } catch (error) {
      console.error('Error fetching sector baseline:', error);
      res.status(500).json({ error: 'Failed to fetch sector baseline' });
    }
  });

  // Platform Adoption Endpoints
  app.get('/platform-adoption/overall', async (_req: Request, res: Response) => {
    try {
      const sheetId = requireEnv('SHEET_ID');
      const sheets = await getSheetsClient();
      
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'CI Assessment!A2:AN1000'
      });
      
      const rows = result.data.values || [];
      const allParticipants = rows
        .map(row => mapRowToAssessment(row, 'CI'))
        .filter(p => p.name);
      
      const total = allParticipants.length;
      
      // Count participants with each platform
      const withWebsite = allParticipants.filter(p => p.websiteUrl && p.websiteUrl.length > 0).length;
      const withFacebook = allParticipants.filter(p => p.facebookUrl && p.facebookUrl.length > 0).length;
      const withInstagram = allParticipants.filter(p => p.instagramUrl && p.instagramUrl.length > 0).length;
      const withYoutube = allParticipants.filter(p => p.youtubeUrl && p.youtubeUrl.length > 0).length;
      const withTiktok = allParticipants.filter(p => p.tiktokUrl && p.tiktokUrl.length > 0).length;
      const withTripAdvisor = allParticipants.filter(p => p.tripadvisorUrl && p.tripadvisorUrl.length > 0).length;
      
      res.json({
        total,
        platforms: {
          website: { count: withWebsite, percentage: Math.round((withWebsite / total) * 100) },
          facebook: { count: withFacebook, percentage: Math.round((withFacebook / total) * 100) },
          instagram: { count: withInstagram, percentage: Math.round((withInstagram / total) * 100) },
          youtube: { count: withYoutube, percentage: Math.round((withYoutube / total) * 100) },
          tiktok: { count: withTiktok, percentage: Math.round((withTiktok / total) * 100) },
          tripadvisor: { count: withTripAdvisor, percentage: Math.round((withTripAdvisor / total) * 100) }
        }
      });
    } catch (error) {
      console.error('Error fetching overall platform adoption:', error);
      res.status(500).json({ error: 'Failed to fetch platform adoption data' });
    }
  });

  app.get('/platform-adoption/by-sector', async (_req: Request, res: Response) => {
    try {
      const sheetId = requireEnv('SHEET_ID');
      const sheets = await getSheetsClient();
      
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'CI Assessment!A2:AN1000'
      });
      
      const rows = result.data.values || [];
      const allParticipants = rows
        .map(row => mapRowToAssessment(row, 'CI'))
        .filter(p => p.name);
      
      // Group by sector
      const sectorMap: Record<string, any[]> = {};
      allParticipants.forEach(p => {
        if (!sectorMap[p.sector]) sectorMap[p.sector] = [];
        sectorMap[p.sector].push(p);
      });
      
      // Calculate platform adoption for each sector (excluding TripAdvisor)
      const sectorData = Object.keys(sectorMap).map(sector => {
        const participants = sectorMap[sector];
        const total = participants.length;
        
        return {
          sector,
          total,
          platforms: {
            website: Math.round((participants.filter(p => p.websiteUrl && p.websiteUrl.length > 0).length / total) * 100),
            facebook: Math.round((participants.filter(p => p.facebookUrl && p.facebookUrl.length > 0).length / total) * 100),
            instagram: Math.round((participants.filter(p => p.instagramUrl && p.instagramUrl.length > 0).length / total) * 100),
            youtube: Math.round((participants.filter(p => p.youtubeUrl && p.youtubeUrl.length > 0).length / total) * 100),
            tiktok: Math.round((participants.filter(p => p.tiktokUrl && p.tiktokUrl.length > 0).length / total) * 100)
          }
        };
      }).sort((a, b) => b.total - a.total); // Sort by total participants
      
      res.json({ sectors: sectorData });
    } catch (error) {
      console.error('Error fetching platform adoption by sector:', error);
      res.status(500).json({ error: 'Failed to fetch platform adoption by sector' });
    }
  });

  // Technical Audit Endpoints
  app.get('/technical-audit/summary', async (_req: Request, res: Response) => {
    try {
      const sheetId = requireEnv('SHEET_ID');
      const sheets = await getSheetsClient();
      
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Technical Audit!A2:Y100'
      });
      
      const rows = result.data.values || [];
      
      const totalWebsites = rows.length;
      let performanceSum = 0;
      let seoSum = 0;
      let excellentCount = 0;
      let poorCount = 0;
      let criticalIssuesTotal = 0;
      let lastAuditDate = '';
      
      rows.forEach(row => {
        const perfScore = parseInt(row[6]) || 0;  // Column G
        const seoScore = parseInt(row[7]) || 0;   // Column H
        const criticalIssues = parseInt(row[13]) || 0;  // Column N
        
        performanceSum += perfScore;
        seoSum += seoScore;
        criticalIssuesTotal += criticalIssues;
        
        if (perfScore >= 90) excellentCount++;
        if (perfScore < 50 && perfScore > 0) poorCount++;
        
        if (row[4] && row[4] > lastAuditDate) {
          lastAuditDate = row[4];  // Column E
        }
      });
      
      const summary = {
        totalWebsites,
        averagePerformance: totalWebsites > 0 ? Math.round(performanceSum / totalWebsites * 10) / 10 : 0,
        averageSEO: totalWebsites > 0 ? Math.round(seoSum / totalWebsites * 10) / 10 : 0,
        excellentSites: excellentCount,
        poorSites: poorCount,
        criticalIssuesTotal,
        lastAuditDate: lastAuditDate || new Date().toISOString().split('T')[0]
      };
      
      res.json(summary);
    } catch (error) {
      console.error('Error fetching technical audit summary:', error);
      res.status(500).json({ error: 'Failed to fetch technical audit summary' });
    }
  });

  app.get('/technical-audit/:stakeholderName', async (req: Request, res: Response) => {
    try {
      const stakeholderName = decodeURIComponent(req.params.stakeholderName);
      const sheetId = requireEnv('SHEET_ID');
      const sheets = await getSheetsClient();
      
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Technical Audit!A2:Y100'
      });
      
      const rows = result.data.values || [];
      
      const stakeholderRow = rows.find(row => row[0] === stakeholderName);
      
      if (!stakeholderRow) {
        return res.status(404).json({ error: 'Stakeholder not found in technical audit' });
      }
      
      const audit = {
        stakeholderName: stakeholderRow[0] || '',
        assessmentType: stakeholderRow[1] || '',
        sector: stakeholderRow[2] || '',
        website: stakeholderRow[3] || '',
        auditDate: stakeholderRow[4] || '',
        status: stakeholderRow[5] || '',
        performanceScore: parseInt(stakeholderRow[6]) || 0,
        seoScore: parseInt(stakeholderRow[7]) || 0,
        accessibilityScore: parseInt(stakeholderRow[8]) || 0,
        bestPracticesScore: parseInt(stakeholderRow[9]) || 0,
        performanceStatus: stakeholderRow[10] || '',
        seoStatus: stakeholderRow[11] || '',
        overallStatus: stakeholderRow[12] || '',
        criticalIssues: parseInt(stakeholderRow[13]) || 0,
        highIssues: parseInt(stakeholderRow[14]) || 0,
        mediumIssues: parseInt(stakeholderRow[15]) || 0,
        lowIssues: parseInt(stakeholderRow[16]) || 0,
        totalIssues: parseInt(stakeholderRow[17]) || 0,
        topIssue1: stakeholderRow[18] || '',
        topIssue2: stakeholderRow[19] || '',
        topIssue3: stakeholderRow[20] || '',
        httpsEnabled: stakeholderRow[21] || '',
        mobileResponsive: stakeholderRow[22] || '',
        hasMetaDescription: stakeholderRow[23] || '',
        lastUpdated: stakeholderRow[24] || ''
      };
      
      res.json(audit);
    } catch (error) {
      console.error('Error fetching stakeholder technical audit:', error);
      res.status(500).json({ error: 'Failed to fetch technical audit' });
    }
  });

  app.get('/technical-audit', async (_req: Request, res: Response) => {
    try {
      const sheetId = requireEnv('SHEET_ID');
      const sheets = await getSheetsClient();
      
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Technical Audit!A1:Y100'
      });
      
      const rows = result.data.values || [];
      const dataRows = rows.slice(1);
      
      const audits = dataRows.map(row => ({
        stakeholderName: row[0] || '',
        assessmentType: row[1] || '',
        sector: row[2] || '',
        website: row[3] || '',
        auditDate: row[4] || '',
        status: row[5] || '',
        performanceScore: parseInt(row[6]) || 0,
        seoScore: parseInt(row[7]) || 0,
        accessibilityScore: parseInt(row[8]) || 0,
        bestPracticesScore: parseInt(row[9]) || 0,
        performanceStatus: row[10] || '',
        seoStatus: row[11] || '',
        overallStatus: row[12] || '',
        criticalIssues: parseInt(row[13]) || 0,
        highIssues: parseInt(row[14]) || 0,
        mediumIssues: parseInt(row[15]) || 0,
        lowIssues: parseInt(row[16]) || 0,
        totalIssues: parseInt(row[17]) || 0,
        topIssue1: row[18] || '',
        topIssue2: row[19] || '',
        topIssue3: row[20] || '',
        httpsEnabled: row[21] || '',
        mobileResponsive: row[22] || '',
        hasMetaDescription: row[23] || '',
        lastUpdated: row[24] || ''
      }));
      
      res.json(audits);
    } catch (error) {
      console.error('Error fetching all technical audits:', error);
      res.status(500).json({ error: 'Failed to fetch technical audits' });
    }
  });

  return app;
}

function computeStats(rows: string[][]): AssessmentStats {
  const header = rows[0] || [];
  const body = rows.slice(1);

  const maturityIndex = 17; // Column R (0-based)
  const sectorIndex = 1; // Column B
  const externalTotalIndex = 14; // Column O
  const surveyTotalIndex = 15; // Column P
  const combinedTotalIndex = 16; // Column Q

  let totalAssessments = 0;
  let totalExternal = 0;
  let totalSurvey = 0;
  let totalCombined = 0;
  const maturityDistribution: Record<MaturityLevel, number> = {};
  const sectorBreakdown: AssessmentStats['sectorBreakdown'] = {};

  for (const r of body) {
    const name = (r[0] || '').toString().trim();
    if (!name) continue;

    const sector = (r[sectorIndex] || 'Unknown').toString();
    const external = Number(r[externalTotalIndex] || 0) || 0;
    const survey = Number(r[surveyTotalIndex] || 0) || 0;
    const combined = Number(r[combinedTotalIndex] || 0) || 0;
    const maturity = (r[maturityIndex] || '').toString() as MaturityLevel;

    totalAssessments++;
    totalExternal += external;
    totalSurvey += survey;
    totalCombined += combined;

    if (maturity) maturityDistribution[maturity] = (maturityDistribution[maturity] || 0) + 1;

    if (!sectorBreakdown[sector]) {
      sectorBreakdown[sector] = {
        count: 0,
        totalExternal: 0,
        totalSurvey: 0,
        totalCombined: 0,
        averageExternal: 0,
        averageSurvey: 0,
        averageCombined: 0
      };
    }
    sectorBreakdown[sector].count++;
    sectorBreakdown[sector].totalExternal += external;
    sectorBreakdown[sector].totalSurvey += survey;
    sectorBreakdown[sector].totalCombined += combined;
  }

  // Compute averages
  const averageScores = {
    external: totalAssessments ? Math.round((totalExternal / totalAssessments) * 10) / 10 : 0,
    survey: totalAssessments ? Math.round((totalSurvey / totalAssessments) * 10) / 10 : 0,
    combined: totalAssessments ? Math.round((totalCombined / totalAssessments) * 10) / 10 : 0
  };

  // Sector averages
  Object.keys(sectorBreakdown).forEach(sector => {
    const s = sectorBreakdown[sector];
    if (s.count > 0) {
      s.averageExternal = Math.round((s.totalExternal / s.count) * 10) / 10;
      s.averageSurvey = Math.round((s.totalSurvey / s.count) * 10) / 10;
      s.averageCombined = Math.round((s.totalCombined / s.count) * 10) / 10;
    }
  });

  return {
    totalAssessments,
    averageScores,
    maturityDistribution,
    sectorBreakdown
  };
}



// ----------------------
// Helpers for analysis
// ----------------------

function n(v: any): number {
  const num = Number(v);
  return Number.isFinite(num) ? num : 0;
}

// Helper functions for checkbox-specific guidance

/**
 * Generate checkbox-specific opportunities and quick wins
 * Returns data in the SAME format as before, but with checkbox-specific content
 */
async function generateCheckboxGuidance(name: string, sector: string) {
  try {
    const sheetId = requireEnv('SHEET_ID');
    const sheets = await getSheetsClient();
    
    // Read Checklist Detail sheet
    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Checklist Detail!A2:BS1000'
    });
    
    const rows = (data.values || []) as string[][];
    const stakeholderRow = rows.find(r => r[0]?.toString().trim().toLowerCase() === name.toLowerCase());
    
    if (!stakeholderRow) {
      // Fallback to old system if not found
      return {
        opportunities: [],
        quickWins: []
      };
    }
    
    // Parse checkboxes by category (columns F-BS)
    const categories = [
      { name: 'Social Media', startCol: 5, endCol: 14, key: 'socialMedia' },
      { name: 'Website', startCol: 16, endCol: 25, key: 'website' },
      { name: 'Visual Content', startCol: 27, endCol: 36, key: 'visualContent' },
      { name: 'Discoverability', startCol: 38, endCol: 47, key: 'discoverability' },
      { name: 'Digital Sales', startCol: 49, endCol: 58, key: 'digitalSales' },
      { name: 'Platform Integration', startCol: 60, endCol: 69, key: 'platformIntegration' }
    ];
    
    const weights = getSectorWeights(sector);
    
    // Collect all missing criteria across categories
    const allMissing: Array<{
      category: string;
      score: number;
      maxScore: number;
      weight: number;
      missing: Array<{
        index: number;
        description: string;
        action: string;
        benefit: string;
        effort: string;
        timeframe: string;
        cost: string;
      }>;
    }> = [];
    
    for (const cat of categories) {
      const criteria = getCategoryCriteria(cat.key);
      const missing = [];
      let checkedCount = 0;
      
      for (let i = cat.startCol; i <= cat.endCol; i++) {
        const value = stakeholderRow[i];
        const isChecked = String(value) === '1' || String(value) === 'true';
        const criterionIndex = i - cat.startCol;
        
        if (isChecked) {
          checkedCount++;
        } else if (criterionIndex < criteria.length) {
          missing.push({
            index: criterionIndex,
            description: criteria[criterionIndex],
            action: getActionForCriterion(cat.key, criterionIndex, sector),
            benefit: getBenefitForCriterion(cat.key, criterionIndex, sector),
            effort: getEffortForCriterion(cat.key, criterionIndex),
            timeframe: getTimeframeForCriterion(cat.key, criterionIndex),
            cost: getCostForCriterion(cat.key, criterionIndex)
          });
        }
      }
      
      if (missing.length > 0) {
        allMissing.push({
          category: cat.name,
          score: checkedCount,
          maxScore: 10,
          weight: (weights as any)[cat.key] || 1.0,
          missing
        });
      }
    }
    
    // Sort by weight (highest priority first)
    allMissing.sort((a, b) => b.weight - a.weight);
    
    // Generate OPPORTUNITIES: Top 2 priority categories with their next steps
    const opportunities = allMissing.slice(0, 2).map(cat => {
      const topMissing = cat.missing.slice(0, 3); // Top 3 missing criteria
      const target = Math.min(cat.maxScore, cat.score + topMissing.length);
      
      return {
        category: cat.category,
        current: `${cat.score}/10`,
        target: `${target}/10`,
        actions: topMissing.map(m => m.action),
        timeframe: topMissing[0]?.timeframe || '1-2 weeks',
        cost: topMissing[0]?.cost || 'Low',
        impact: cat.weight > 1.5 ? 'High' : (cat.weight > 1.0 ? 'Medium' : 'Low')
      };
    });
    
    // Generate QUICK WINS: Low-effort, high-impact items across all categories
    const quickWinCandidates: Array<{
      opportunity: string;
      category: string;
      currentToTarget: string;
      actions: string[];
      timeframe: string;
      cost: string;
      impact: string;
      effortScore: number;
    }> = [];
    
    for (const cat of allMissing) {
      // Find low-effort items (effort = "Low")
      const lowEffortItems = cat.missing.filter(m => m.effort === 'Low');
      
      for (const item of lowEffortItems.slice(0, 2)) {
        quickWinCandidates.push({
          opportunity: item.description,
          category: cat.category,
          currentToTarget: `${cat.score} → ${cat.score + 1}`,
          actions: [item.action, item.benefit],
          timeframe: item.timeframe,
          cost: item.cost,
          impact: cat.weight > 1.5 ? 'High' : 'Medium',
          effortScore: 1 // Low effort = 1
        });
      }
    }
    
    // Sort quick wins by impact (weight) and take top 3
    const quickWins = quickWinCandidates
      .sort((a, b) => {
        // Sort by impact first (High > Medium > Low)
        const impactOrder: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
        return (impactOrder[b.impact] || 0) - (impactOrder[a.impact] || 0);
      })
      .slice(0, 3)
      .map(qw => ({
        opportunity: qw.opportunity,
        currentToTarget: qw.currentToTarget,
        actions: qw.actions,
        timeframe: qw.timeframe,
        cost: qw.cost,
        impact: qw.impact
      }));
    
    return { opportunities, quickWins };
    
  } catch (error) {
    console.error('Error generating checkbox guidance:', error);
    // Fallback to empty arrays
    return {
      opportunities: [],
      quickWins: []
    };
  }
}

function getCategoryCriteria(category: string): string[] {
  const criteria: Record<string, string[]> = {
    socialMedia: [
      'Has business account on primary platform (Facebook/Instagram)',
      'Has business account on second platform',
      'Has business account on third platform (TikTok/YouTube/LinkedIn)',
      'Posts monthly (6+ times in last 6 months)',
      'Posts 2x monthly (12+ times in last 6 months)',
      'Posts weekly (24+ times in last 6 months)',
      'Uses professional content (not just phone snapshots)',
      'Engages with followers (responds to comments/DMs)',
      'Uses platform business features (shops, reservations, insights)',
      'Has 100+ followers/subscribers on main platform'
    ],
    website: [
      'Has a website (any type)',
      'Website is mobile-responsive',
      'Has custom domain (not free hosting)',
      'Clear contact information visible',
      'Has photo gallery (6+ professional images)',
      'Content updated in last 12 months',
      'Has about/story section',
      'Has booking/inquiry form or call-to-action',
      'Fast loading speed (under 3 seconds)',
      'Has analytics tracking (Google Analytics or similar)'
    ],
    visualContent: [
      'Has 10+ photos available online',
      'Has 20+ photos available online',
      'Has 50+ photos available online',
      'Photos are professional quality',
      'Photos show products/services in action',
      'Has video content (any platform)',
      'Has 3+ video clips',
      'Has promotional video (60+ seconds)',
      'Visual content shows people/experience',
      'Content is original (not stock photos)'
    ],
    discoverability: [
      'Has Google Business Profile',
      'Google Profile is verified/claimed',
      'Google Profile has 10+ photos',
      'Has TripAdvisor or similar review platform listing',
      'Has 5+ reviews on any platform',
      'Has 10+ reviews across platforms',
      'Responds to reviews (50%+ response rate)',
      'Listed in online directories (2+)',
      'Appears on page 1 of Google for business name',
      'Appears on page 1 of Google for relevant keywords'
    ],
    digitalSales: [
      'Accepts digital payments (mobile money, cards)',
      'Has online booking/inquiry system',
      'Has automated confirmation (email/SMS)',
      'Displays pricing online',
      'Offers online gift cards or vouchers',
      'Has e-commerce capability (sell products online)',
      'Uses booking platform (Airbnb, Booking.com, etc.)',
      'Has payment gateway integration',
      'Offers refund/cancellation policy online',
      'Has secure checkout (SSL certificate)'
    ],
    platformIntegration: [
      'Listed on TripAdvisor or Google Travel',
      'Listed on booking platforms (Airbnb, Booking.com, Expedia)',
      'Listed on sector-specific platforms (OpenTable, Viator, etc.)',
      'Integrated with Google Maps',
      'Has WhatsApp Business with catalog',
      'Uses social media shopping features',
      'Accepts reservations via multiple channels',
      'Has CRM or customer database',
      'Uses email marketing platform',
      'Has integration between booking and payment systems'
    ]
  };
  return criteria[category] || [];
}

function getActionForCriterion(category: string, index: number, sector: string): string {
  // Sector-specific action guidance
  const isTourism = sector.toLowerCase().includes('tour operator');
  
  const actions: Record<string, string[]> = {
    socialMedia: [
      'Create a Facebook Business Page with complete profile',
      isTourism ? 'Set up Instagram Business account showcasing destinations' : 'Set up Instagram Business account showcasing your work',
      isTourism ? 'Create TikTok account for destination reels' : 'Create LinkedIn account for professional networking',
      'Develop a posting schedule for at least 6 posts per month',
      'Increase posting frequency to 12+ times per month (3x per week)',
      'Post 24+ times per month (weekly or more)',
      'Invest in a smartphone with good camera or hire photographer for 1 session',
      'Set aside 15 minutes daily to respond to all comments and DMs',
      isTourism ? 'Enable Instagram Shopping and Facebook Reservations' : 'Enable business features: appointments, catalogs, or insights',
      isTourism ? 'Run a campaign to reach 100 followers through destination content' : 'Engage with 50 potential customers to grow to 100+ followers'
    ],
    website: [
      'Create a one-page website using Wix, Squarespace, or WordPress',
      'Ensure website template is mobile-friendly (most free templates are)',
      'Purchase a custom domain ($10-15/year) and connect to your site',
      'Add contact section with phone, email, WhatsApp, and location',
      'Upload 10-15 professional photos in a gallery section',
      'Add a news/blog post or update your about section',
      'Write a compelling about/story section (200-300 words)',
      'Add a prominent "Book Now" button or contact form',
      'Optimize images (compress to under 200KB each) and choose fast hosting',
      'Set up Google Analytics (free) to track visitors'
    ],
    visualContent: [
      'Collect 15-20 photos from your phone or past projects',
      'Reach 25+ photos by photographing your workspace/products/services',
      'Build library to 50+ photos over 3 months (photograph each client/project)',
      'Hire a photographer for 1-2 hours ($50-150) or take online photography course',
      isTourism ? 'Photograph guests on tours (with permission) and destinations' : 'Photograph your work in action: process, before/after, demonstrations',
      'Record 3-5 short clips (15-30 seconds each) on your phone',
      'Create 5+ short-form videos for social media',
      isTourism ? 'Produce a 60-90 second tour highlights video' : 'Create a 60-90 second promotional video showing your expertise',
      'Feature real people: staff, customers, collaborators in your content',
      'Photograph your own work instead of using stock images'
    ],
    discoverability: [
      'Go to google.com/business and create your free profile',
      'Complete verification (Google will mail you a postcard with code)',
      'Upload 15+ photos: exterior, interior, products, services, team',
      isTourism ? 'Claim your TripAdvisor listing and complete all fields' : 'Create listing on relevant review platform (Yelp, industry directories)',
      'Ask 5-10 recent customers for reviews via email or WhatsApp',
      'Systematically request reviews after each transaction (aim for 20+ total)',
      'Respond to every review within 48 hours (thank positive, address concerns)',
      isTourism ? 'Get listed in tourism directories, regional tourism websites' : 'Get listed in 2-3 industry directories or chamber of commerce',
      'Ensure your business name, address, and phone are consistent everywhere online',
      isTourism ? 'Optimize for keywords like "[destination] tours" or "[activity] [location]"' : 'Optimize website for "[service] [location]" keywords'
    ],
    digitalSales: [
      'Set up mobile money acceptance (MTN, Orange, Airtel, etc.) or card reader',
      'Add a contact form, WhatsApp booking button, or use free tools like Calendly',
      'Set up auto-reply messages on WhatsApp Business or email templates',
      'Create a pricing page or menu on your website',
      'Offer digital vouchers via email or printable PDFs',
      'Set up a simple online store with Shopify, WooCommerce, or Etsy',
      isTourism ? 'Create listings on Viator, GetYourGuide, or Airbnb Experiences' : 'Join relevant marketplace for your sector',
      'Integrate payment gateway (Stripe, PayPal, Flutterwave) to your website',
      'Write clear refund/cancellation policy and display on booking pages',
      'Get SSL certificate (free with most hosting) and display security badges'
    ],
    platformIntegration: [
      isTourism ? 'Complete your TripAdvisor listing and claim Google Travel profile' : 'Claim your Google Business profile and connect to Google Travel/Maps',
      isTourism ? 'Create listings on Booking.com, Airbnb Experiences, or Viator' : 'Join industry-specific platforms relevant to your sector',
      isTourism ? 'List on sector platforms: GetYourGuide, Expedia Local Expert, Klook' : 'Research and join 1-2 platforms where your customers search',
      'Verify your location on Google Maps and keep hours updated',
      'Set up WhatsApp Business catalog with 10-15 products/services',
      'Enable Instagram Shop or Facebook Shop to sell directly on social',
      'Accept bookings via phone, email, WhatsApp, and website form',
      'Start collecting customer emails in a spreadsheet or use free CRM (HubSpot)',
      'Use Mailchimp (free tier) to send monthly newsletter to past customers',
      'Connect your booking system to payment processor so payments sync automatically'
    ]
  };
  
  return (actions[category] && actions[category][index]) || 'Complete this criterion';
}

function getBenefitForCriterion(category: string, index: number, sector: string): string {
  const isTourism = sector.toLowerCase().includes('tour operator');
  
  const benefits: Record<string, string[]> = {
    socialMedia: [
      'Appears professional and legitimate to customers; 70% check social before booking',
      'Doubles your reach by being on 2 platforms; captures different audiences',
      isTourism ? 'Reaches younger travelers (60% of under-30s use TikTok for travel ideas)' : 'Expands professional network; increases B2B opportunities by 40%',
      'Keeps you visible; brands posting monthly see 25% more engagement',
      'Algorithm favors consistency; 12+ posts/month increases reach by 40%',
      'Weekly posting (24+/month) triples visibility; you appear in feeds 3x more',
      'Professional content gets 5x more engagement and shares',
      'Customers who get responses are 60% more likely to book/purchase',
      'Business features increase conversions by 30%; customers can book without leaving the app',
      '100+ followers signals credibility; boosts algorithm visibility by 50%'
    ],
    website: [
      'Establishes legitimacy; 85% of customers check for a website before purchasing',
      '60% of web traffic is mobile; mobile-friendly sites convert 2x better',
      'Custom domain looks 5x more professional than "yourname.wix.com"',
      'Clear contact info increases inquiries by 40%; reduces customer drop-off',
      'Visual galleries increase booking rates by 70%; customers see what they\'re getting',
      'Fresh content signals active business; increases trust by 35%',
      'Story builds emotional connection; increases customer loyalty by 50%',
      'CTAs increase conversion by 80%; visitors are 3x more likely to take action',
      'Fast sites rank higher on Google; 1-second delay reduces conversions by 7%',
      'Analytics reveals what works; data-driven decisions improve ROI by 40%'
    ],
    visualContent: [
      'Visual content gets 40x more engagement than text on social media',
      '20+ photos gives variety for social posts and website',
      '50+ photo library ensures always fresh content; never run out',
      'Professional photos increase perceived value by 60% and justify higher prices',
      isTourism ? 'Shows real experiences; customers 80% more likely to book when they see themselves in photos' : 'Shows your expertise and process; builds trust with potential customers',
      'Video content gets 1200% more shares than text and images combined',
      'Multiple videos allow variety; keeps social media fresh and engaging',
      'Promotional videos increase conversions by 80%; customers watch before booking',
      'People in photos increase engagement by 38%; shows the human side',
      'Original content builds brand identity; 5x more memorable than stock images'
    ],
    discoverability: [
      'Google Business gets 5x more clicks than organic search results',
      'Verified businesses appear more legitimate; increases trust by 50%',
      'Photos increase profile views by 70% and customer actions by 35%',
      isTourism ? 'TripAdvisor listings get 20M views/day; critical for tourism sector' : 'Review platforms drive 40% of local business discovery',
      '5+ reviews increases likelihood of customer action by 270%',
      '10+ reviews signals credibility; customers 4x more likely to choose you',
      'Responding to reviews increases customer retention by 33%',
      'Directory listings improve SEO; you appear in more searches',
      'Page 1 of Google gets 92% of all clicks; invisible beyond that',
      'Keyword ranking drives qualified traffic; customers actively searching for your service'
    ],
    digitalSales: [
      'Digital payments increase transaction speed by 80%; fewer abandoned sales',
      'Online booking converts 3x better than phone-only; customers book 24/7',
      'Automated confirmations reduce no-shows by 40% and increase trust',
      'Transparent pricing increases conversions by 25%; customers don\'t have to ask',
      'Gift cards generate 20% more revenue; often spent on more than card value',
      'E-commerce expands market reach; sell beyond local area',
      isTourism ? 'Platform listings reach millions; Airbnb gets 300M visitors/month' : 'Marketplace platforms bring built-in customer traffic',
      'Payment integration reduces manual work by 70%; fewer errors',
      'Clear policies reduce refund disputes by 50%; sets expectations upfront',
      'SSL certificate increases trust by 40%; customers feel safe entering payment info'
    ],
    platformIntegration: [
      isTourism ? 'TripAdvisor/Google Travel drive 60% of tourism research; essential visibility' : 'Google integration puts you on the map; customers find you via navigation',
      isTourism ? 'Booking platforms reach 1B+ travelers; expands market 10x' : 'Platform listings bring pre-qualified customers actively looking to book',
      'Sector platforms target your exact audience; higher conversion rates (2-3x)',
      'Google Maps integration shows you to nearby searchers; drives walk-ins',
      'WhatsApp catalog makes browsing easy; increases inquiry conversion by 50%',
      'Social shopping reduces friction; customers purchase without leaving app (35% higher conversion)',
      'Multi-channel booking captures all customer preferences; increases bookings by 45%',
      'CRM improves customer relationships; repeat business increases by 40%',
      'Email marketing has 4200% ROI; brings back past customers',
      'Integrated systems save 10+ hours/week on admin; fewer manual errors'
    ]
  };
  
  return (benefits[category] && benefits[category][index]) || 'Improves your digital presence';
}

function getEffortForCriterion(category: string, index: number): string {
  // Simple effort estimation
  const effortMap: Record<string, string[]> = {
    socialMedia: ['Low', 'Low', 'Low', 'Medium', 'Medium', 'High', 'Medium', 'Low', 'Low', 'Medium'],
    website: ['Low', 'Low', 'Low', 'Low', 'Medium', 'Low', 'Low', 'Low', 'Medium', 'Low'],
    visualContent: ['Low', 'Low', 'Medium', 'Medium', 'Medium', 'Low', 'Medium', 'Medium', 'Low', 'Low'],
    discoverability: ['Low', 'Low', 'Medium', 'Low', 'Medium', 'High', 'Low', 'Medium', 'Medium', 'High'],
    digitalSales: ['Medium', 'Medium', 'Medium', 'Low', 'Low', 'High', 'Medium', 'Medium', 'Low', 'Medium'],
    platformIntegration: ['Low', 'Medium', 'Medium', 'Low', 'Medium', 'Medium', 'Low', 'Low', 'Low', 'Medium']
  };
  return (effortMap[category] && effortMap[category][index]) || 'Medium';
}

function getTimeframeForCriterion(category: string, index: number): string {
  const timeframes: Record<string, string[]> = {
    socialMedia: ['1-2 hours', '1-2 hours', '1-2 hours', '1-2 weeks', '2-4 weeks', '1-2 months', '1-2 weeks', 'Ongoing', '2-4 hours', '1-3 months'],
    website: ['1 day', '1-2 hours', '15 minutes', '1 hour', '2-4 hours', '1 hour', '2-3 hours', '1-2 hours', '2-4 hours', '30 minutes'],
    visualContent: ['1-2 days', '1 week', '1-3 months', '1 day + practice', '1-2 weeks', '1 day', '1-2 weeks', '1-2 days', '1-2 weeks', '1-2 weeks'],
    discoverability: ['30 minutes', '1-2 weeks', '2-3 hours', '1 hour', '1-2 weeks', '1-3 months', 'Ongoing', '2-3 hours', '1-2 weeks', '2-6 months'],
    digitalSales: ['1-2 hours', '2-4 hours', '1-2 hours', '2-3 hours', '1-2 hours', '1-2 weeks', '1-2 days', '1 day', '1 hour', '1-2 hours'],
    platformIntegration: ['1-2 hours', '1 day', '2-3 hours', '30 minutes', '2-3 hours', '1-2 days', 'Ongoing', '1-2 weeks', '1-2 weeks', '1-2 days']
  };
  return (timeframes[category] && timeframes[category][index]) || '1-2 weeks';
}

function getCostForCriterion(category: string, index: number): string {
  const costs: Record<string, string[]> = {
    socialMedia: ['Free', 'Free', 'Free', 'Free', 'Free', 'Free', 'Low ($50-150)', 'Free', 'Free', 'Free'],
    website: ['Low ($10-20/mo)', 'Free', 'Low ($10-15/yr)', 'Free', 'Low ($50-200)', 'Free', 'Free', 'Free', 'Free-Low', 'Free'],
    visualContent: ['Free', 'Free', 'Free', 'Low ($50-200)', 'Free-Low', 'Free', 'Free', 'Medium ($100-500)', 'Free', 'Free'],
    discoverability: ['Free', 'Free', 'Free', 'Free', 'Free', 'Free', 'Free', 'Free-Low', 'Free', 'Low-Medium'],
    digitalSales: ['Low ($0-50)', 'Free-Low', 'Free', 'Free', 'Free', 'Medium ($30-100/mo)', 'Free-Low', 'Low (2-3%)', 'Free', 'Free-Low'],
    platformIntegration: ['Free', 'Free-Low', 'Free-Low', 'Free', 'Free', 'Free', 'Free', 'Free-Low', 'Free', 'Low']
  };
  return (costs[category] && costs[category][index]) || 'Low';
}

function getSectorWeights(sector: string) {
  // Simple default weights - not used in new schema but needed for checkbox guidance
  return {
    socialMedia: 1,
    website: 1,
    visualContent: 1,
    discoverability: 1,
    digitalSales: 1,
    platformIntegration: 1
  };
}

function mapRowToAssessment(row: string[], sheetType: 'CI' | 'TO' = 'CI') {
  // UPDATED Schema (October 2025 - Survey Assessment Integration):
  // Columns D-I (3-8): RAW External scores (0-10 each)
  // Columns J-O (9-14): WEIGHTED External scores (sector-specific)
  // Column P (15): Adjusted External Score (0-70)
  // Column Z (25): Survey Total (0-30) - NEW (both sheets)
  // Column AA (26): Combined Score (0-100)
  // Column AB (27): External Digital Maturity Level
  // Column AC (28): Assessment Date
  // Columns AD-AH (29-33): URLs (Website, Facebook, Instagram, TripAdvisor, YouTube)
  // Columns AI-AL (34-37): Social Metrics (FB Followers, IG Followers, TA Reviews, YT Subscribers)
  // Columns AM-AN (38-39): TikTok URL and TikTok Followers
  
  // Survey columns differ between sheets:
  // CI Assessment (45 cols): AO-AS (40-44): Foundation, Capability, Growth, Tier, Date
  // TO Assessment (43 cols): AM-AQ (38-42): Foundation, Capability, Growth, Tier, Date
  const surveyOffset = sheetType === 'CI' ? 40 : 38;
  
  return {
    name: (row[0] || '').toString().trim(),
    sector: (row[1] || 'Unknown').toString(),
    region: (row[2] || 'Unknown').toString(),
    // RAW External assessment scores (columns D-I, indices 3-8) - These are 0-10
    socialMedia: n(row[3]),        // Column D: Social Media Raw (0-10)
    website: n(row[4]),            // Column E: Website Raw (0-10)
    visualContent: n(row[5]),      // Column F: Visual Content Raw (0-10)
    discoverability: n(row[6]),    // Column G: Discoverability Raw (0-10)
    digitalSales: n(row[7]),       // Column H: Digital Sales Raw (0-10)
    platformIntegration: n(row[8]), // Column I: Platform Integration Raw (0-10)
    // NEW Survey Assessment scores (October 2025)
    surveyFoundation: n(row[surveyOffset]),      // CI: AO (40) | TO: AM (38): Survey Foundation (0-10)
    surveyCapability: n(row[surveyOffset + 1]),  // CI: AP (41) | TO: AN (39): Survey Capability (0-10)
    surveyGrowth: n(row[surveyOffset + 2]),      // CI: AQ (42) | TO: AO (40): Survey Growth (0-10)
    surveyTier: (row[surveyOffset + 3] || '').toString(),  // CI: AR (43) | TO: AP (41): Survey Tier
    surveyDate: (row[surveyOffset + 4] || '').toString(),  // CI: AS (44) | TO: AQ (42): Survey Date
    // Totals
    externalTotal: n(row[15]),       // Column P: Adjusted External Score (0-70) - uses weighted scores
    surveyTotal: n(row[25]),         // Column Z: Survey Total (0-30)
    combinedScore: n(row[26]),       // Column AA: Combined Score (0-100)
    maturityLevel: (row[27] || '').toString() || 'Absent',  // Column AB: External Digital Maturity Level
    // URLs (columns AD-AH, indices 29-33)
    websiteUrl: (row[29] || '').toString(),
    facebookUrl: (row[30] || '').toString(),
    instagramUrl: (row[31] || '').toString(),
    tripadvisorUrl: (row[32] || '').toString(),    // Column AG: TripAdvisor
    youtubeUrl: (row[33] || '').toString(),        // Column AH: YouTube
    // Social Metrics (columns AI-AL, indices 34-37)
    facebookFollowers: n(row[34]),
    instagramFollowers: n(row[35]),
    tripadvisorReviews: n(row[36]),                // Column AK: TripAdvisor Reviews
    youtubeSubscribers: n(row[37]),                // Column AL: YouTube Subscribers
    // TikTok (columns AM-AN, indices 38-39) - CI Assessment only, TO uses these for survey
    tiktokUrl: sheetType === 'CI' ? (row[38] || '').toString() : '',      // Column AM: TikTok (CI only)
    tiktokFollowers: sheetType === 'CI' ? n(row[39]) : 0                  // Column AN: TikTok Followers (CI only)
  };
}

function buildDashboardFromRows(rows: string[][]) {
  const maturity: Record<string, number> = { Expert: 0, Advanced: 0, Intermediate: 0, Emerging: 0, Absent: 0 };
  const sectorMap: Record<string, { count: number; totalExternal: number; totalSurvey: number; totalCombined: number; complete: number; }>
    = {};
  const participants: Array<{ name: string; sector: string; external: number; survey: number; combined: number; maturity: string }>
    = [];

  rows.forEach(r => {
    const a = mapRowToAssessment(r);
    if (!a.name) return;
    const maturityLevel = normalizeMaturity(a.maturityLevel);
    maturity[maturityLevel] = (maturity[maturityLevel] || 0) + 1;
    if (!sectorMap[a.sector]) sectorMap[a.sector] = { count: 0, totalExternal: 0, totalSurvey: 0, totalCombined: 0, complete: 0 };
    const s = sectorMap[a.sector];
    s.count++;
    s.totalExternal += a.externalTotal || 0;
    s.totalSurvey += a.surveyTotal || 0;
    s.totalCombined += a.combinedScore || 0;
    if ((a.externalTotal || 0) > 0 && (a.surveyTotal || 0) > 0) s.complete++;
    participants.push({ name: a.name, sector: a.sector, external: a.externalTotal, survey: a.surveyTotal, combined: a.combinedScore, maturity: maturityLevel });
  });

  const withExternal = rows.filter(r => n(r[15]) > 0).length;
  const withSurvey = rows.filter(r => n(r[25]) > 0).length;
  const complete = rows.filter(r => n(r[15]) > 0 && n(r[25]) > 0).length;
  const avgExternal = withExternal ? Math.round(rows.reduce((s, r) => s + n(r[15]), 0) / withExternal * 10) / 10 : 0;
  const avgSurvey = withSurvey ? Math.round(rows.reduce((s, r) => s + n(r[25]), 0) / withSurvey * 10) / 10 : 0;
  const avgCombined = complete ? Math.round(rows.reduce((s, r) => s + (n(r[26]) || n(r[15])), 0) / complete * 10) / 10 : 0;

  const externalRows = rows.filter(r => n(r[15]) > 0);
  const cat = { socialMedia: 0, website: 0, visualContent: 0, discoverability: 0, digitalSales: 0, platformIntegration: 0 };
  externalRows.forEach(r => {
    cat.socialMedia += n(r[3]);
    cat.website += n(r[4]);
    cat.visualContent += n(r[5]);
    cat.discoverability += n(r[6]);
    cat.digitalSales += n(r[7]);
    cat.platformIntegration += n(r[8]);
  });
  const countExt = Math.max(externalRows.length, 1);
  const categoryAverages = {
    socialMedia: Math.round(cat.socialMedia / countExt * 10) / 10,
    website: Math.round(cat.website / countExt * 10) / 10,
    visualContent: Math.round(cat.visualContent / countExt * 10) / 10,
    discoverability: Math.round(cat.discoverability / countExt * 10) / 10,
    digitalSales: Math.round(cat.digitalSales / countExt * 10) / 10,
    platformIntegration: Math.round(cat.platformIntegration / countExt * 10) / 10
  };

  const sectorStacked: Record<string, any> = {};
  participants.forEach(p => {
    if (!sectorStacked[p.sector]) sectorStacked[p.sector] = { Absent: 0, Emerging: 0, Intermediate: 0, Advanced: 0, Expert: 0, total: 0 };
    sectorStacked[p.sector][p.maturity] = (sectorStacked[p.sector][p.maturity] || 0) + 1;
    sectorStacked[p.sector].total++;
  });

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
  }).sort((a, b) => b.avgCombined - a.avgCombined);

  return {
    sheetName: 'CI Assessment',
    total: rows.length,
    maturity,
    sectors,
    participants,
    categoryAverages,
    sectorStacked,
    overall: { withExternal, withSurvey, complete, avgExternal, avgSurvey, avgCombined }
  };
}

function normalizeMaturity(v: string): string {
  if (!v) return 'Absent';
  if (v === 'Basic') return 'Emerging';
  const allowed = ['Absent', 'Emerging', 'Intermediate', 'Advanced', 'Expert'];
  return allowed.includes(v) ? v : 'Absent';
}

function generateSimpleOpportunities(a: ReturnType<typeof mapRowToAssessment>) {
  const items: Array<{ category: string; current: string; target: string; actions: string[]; timeframe: string; cost: string; impact: string; }>= [];
  // Pick two weakest external categories
  const categories: Array<{ key: string; label: string; score: number; max: number }> = [
    { key: 'socialMedia', label: 'Social Media', score: a.socialMedia, max: 18 },
    { key: 'website', label: 'Website', score: a.website, max: 12 },
    { key: 'visualContent', label: 'Visual Content', score: a.visualContent, max: 15 },
    { key: 'discoverability', label: 'Discoverability', score: a.discoverability, max: 12 },
    { key: 'digitalSales', label: 'Digital Sales', score: a.digitalSales, max: 8 }
  ];
  const sorted = categories.sort((x, y) => (x.score / x.max) - (y.score / y.max)).slice(0, 2);
  for (const c of sorted) {
    const next = Math.min(c.max, c.score + Math.ceil(c.max * 0.2));
    items.push({
      category: c.label,
      current: `${c.score}`,
      target: `${next}`,
      actions: [
        'Define 2-3 concrete actions for the next step',
        'Allocate 2-3 hours to complete them this week',
        'Measure the change next month'
      ],
      timeframe: '2-4 weeks',
      cost: 'Low',
      impact: (c.label === 'Visual Content' ? 'Critical' : 'High')
    });
  }
  return items;
}

function generateSimpleQuickWins(a: ReturnType<typeof mapRowToAssessment>) {
  const wins: Array<{ opportunity: string; currentToTarget: string; actions: string[]; timeframe: string; cost: string; impact: string; }>= [];
  if (a.discoverability <= 3) {
    wins.push({
      opportunity: 'Google/Tripadvisor profile tune‑up',
      currentToTarget: `${a.discoverability} → ${Math.min(a.discoverability + 2, 7)}`,
      actions: ['Claim/complete profile', 'Add photos and request 3 reviews', 'Respond to existing reviews'],
      timeframe: '2-3 hours',
      cost: 'Free',
      impact: 'High'
    });
  }
  if (a.website <= 1) {
    wins.push({
      opportunity: 'One‑page website starter',
      currentToTarget: `${a.website} → ${Math.min(a.website + 3, 3)}`,
      actions: ['Create basic one‑pager', 'Add contact + 6 photos', 'Link WhatsApp'],
      timeframe: '1 week',
      cost: 'Low',
      impact: 'High'
    });
  }
  if (a.socialMedia >= 2 && a.socialMedia <= 6) {
    wins.push({
      opportunity: 'Social posting consistency',
      currentToTarget: `${a.socialMedia} → ${a.socialMedia + 2}`,
      actions: ['Weekly schedule', 'Enable business features', 'Reply to DMs within 24h'],
      timeframe: '1-2 weeks',
      cost: 'Low',
      impact: 'High'
    });
  }
  return wins.slice(0, 3);
}

function buildSimpleReasons() {
  return {
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
    }
  } as const;
}

function generateSectorGuidance(assessments: Array<ReturnType<typeof mapRowToAssessment>>) {
  const map: Record<string, any> = {};
  for (const a of assessments) {
    if (!map[a.sector]) map[a.sector] = { total: 0, sums: { socialMedia: 0, website: 0, visualContent: 0, discoverability: 0, digitalSales: 0 }, gaps: { socialMedia: 0, website: 0, visualContent: 0, discoverability: 0, digitalSales: 0 } };
    const g = map[a.sector];
    g.total++;
    g.sums.socialMedia += a.socialMedia;
    g.sums.website += a.website;
    g.sums.visualContent += a.visualContent;
    g.sums.discoverability += a.discoverability;
    g.sums.digitalSales += a.digitalSales;
    if (a.socialMedia < 10) g.gaps.socialMedia++;
    if (a.website < 6) g.gaps.website++;
    if (a.visualContent < 8) g.gaps.visualContent++;
    if (a.discoverability < 6) g.gaps.discoverability++;
    if (a.digitalSales < 4) g.gaps.digitalSales++;
  }
  const recFor: Record<string, string[]> = {
    socialMedia: ['Weekly posting cadence', 'Enable business features', 'Request testimonials'],
    website: ['Add clear services and contact', 'Improve mobile performance', 'Add WhatsApp CTA'],
    visualContent: ['Improve photo lighting', 'Consistent brand style', 'Short product videos'],
    discoverability: ['Claim Google profile', 'Get 5+ reviews', 'List on sector directories'],
    digitalSales: ['Add inquiry/order form', 'Enable mobile money', 'Publish clear pricing where possible']
  };
  Object.keys(map).forEach(sector => {
    const g = map[sector];
    const gapEntries = Object.entries(g.gaps) as Array<[string, number]>;
    const priorityArea = (gapEntries.sort((a, b) => (b[1] - a[1]))[0] || ['General', 0])[0];
    g.priorityArea = priorityArea;
    g.recommendations = recFor[priorityArea] || ['General improvement'];
  });
  return map;
}

