import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { google, sheets_v4 } from 'googleapis';

type Participant = { name: string; sector: string; region?: string };

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

async function readMaster(sheetId: string, range = 'Master Assessment!A1:AD10000') {
  const sheets = await getSheetsClient();
  const { data } = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
  const rows = (data.values || []) as string[][];
  return rows;
}

function parseParticipants(rows: string[][], sectorFilter?: string): Participant[] {
  const body = rows.slice(1).filter(r => (r[0] || '').toString().trim() !== '');
  return body
    .filter(r => !sectorFilter || r[1] === sectorFilter)
    .map(r => ({ name: (r[0] || '').toString().trim(), sector: (r[1] || 'Unknown').toString() }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function filterTourOperators(list: Participant[]): Participant[] {
  return list.filter(p => 
    (p.sector || '').toLowerCase().includes('tour operator')
  );
}

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.get('/sectors', async (_req: Request, res: Response) => {
    try {
      const sheetId = requireEnv('SHEET_ID');
      const rowsMaster = await readMaster(sheetId, 'Master Assessment!A1:AD10000');
      let rowsTourism: string[][] = [];
      try {
        rowsTourism = await readMaster(sheetId, 'Tourism Assessment!A1:AD10000');
      } catch {
        rowsTourism = [];
      }
      const rows = rowsMaster.concat(rowsTourism.length ? rowsTourism : []);
      const set = new Set<string>();
      rows.slice(1).forEach(r => { 
        const name = (r[0] || '').toString().trim();
        const sector = (r[1] || '').toString().trim();
        if (name && sector && sector !== 'Sector' && sector !== 'Unknown') {
          set.add(sector);
        }
      });
      res.json(Array.from(set).sort());
    } catch (e: any) {
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  app.get('/participants', async (req: Request, res: Response) => {
    try {
      const sector = (req.query.sector || '').toString();
      const sheetId = requireEnv('SHEET_ID');
      const rowsMaster = await readMaster(sheetId, 'Master Assessment!A1:AD10000');
      let rowsTourism: string[][] = [];
      try {
        rowsTourism = await readMaster(sheetId, 'Tourism Assessment!A1:AD10000');
      } catch {
        rowsTourism = [];
      }
      const rows = rowsMaster.concat(rowsTourism.length ? rowsTourism : []);
      res.json(parseParticipants(rows, sector || undefined));
    } catch (e: any) {
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  app.get('/tour-operators', async (_req: Request, res: Response) => {
    try {
      const sheetId = requireEnv('SHEET_ID');
      const rowsMaster = await readMaster(sheetId, 'Master Assessment!A1:AD10000');
      let rowsTourism: string[][] = [];
      try {
        rowsTourism = await readMaster(sheetId, 'Tourism Assessment!A1:AD10000');
      } catch {
        rowsTourism = [];
      }
      const all = parseParticipants(rowsMaster).concat(parseParticipants(rowsTourism));
      const filtered = filterTourOperators(all);
      res.json(filtered);
    } catch (e: any) {
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  // Aggregate stats (backwards compatible endpoint used by existing UI)
  app.get('/stats', async (_req: Request, res: Response) => {
    try {
      const rows = await readMaster(requireEnv('SHEET_ID'));
      const stats = computeStats(rows);
      res.json(stats);
    } catch (e: any) {
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  // Dashboard data
  app.get('/dashboard', async (_req: Request, res: Response) => {
    try {
      const sheetId = requireEnv('SHEET_ID');
      const rowsMaster = await readMaster(sheetId, 'Master Assessment!A1:AD10000');
      let rowsTourism: string[][] = [];
      try {
        rowsTourism = await readMaster(sheetId, 'Tourism Assessment!A1:AD10000');
      } catch {
        rowsTourism = [];
      }
      const rows = rowsMaster.concat(rowsTourism.length ? rowsTourism : []);
      const body = rows.slice(1).filter(r => (r[0] || '').toString().trim() !== '');
      const result = buildDashboardFromRows(body);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  // Participant plan
  app.get('/participant/plan', async (req: Request, res: Response) => {
    try {
      const name = (req.query.name || '').toString().trim();
      if (!name) return res.status(400).json({ error: 'Missing name' });
      const sheetId = requireEnv('SHEET_ID');
      const rowsMaster = await readMaster(sheetId, 'Master Assessment!A1:AD10000');
      let rowsTourism: string[][] = [];
      try {
        rowsTourism = await readMaster(sheetId, 'Tourism Assessment!A1:AD10000');
      } catch {
        rowsTourism = [];
      }
      const rows = rowsMaster.concat(rowsTourism.length ? rowsTourism : []);
      const body = rows.slice(1).filter(r => (r[0] || '').toString().trim() !== '');
      const assessments = body.map(mapRowToAssessment);
      const assessment = assessments.find(a => a.name.toLowerCase() === name.toLowerCase());
      if (!assessment) return res.status(404).json({ error: 'Participant not found' });

      const sectorAssessments = assessments.filter(a => a.sector === assessment.sector);
      const avgOf = (key: keyof Pick<ReturnType<typeof mapRowToAssessment>, 'socialMedia'|'website'|'visualContent'|'discoverability'|'digitalSales'>) => {
        const vals = sectorAssessments.map(a => a[key] || 0);
        return vals.length ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10 : 0;
      };

      const max = { socialMedia: 18, website: 12, visualContent: 15, discoverability: 12, digitalSales: 8, platformIntegration: 5 };
      const externalBreakdown = [
        { key: 'socialMedia', label: 'Social Media', score: assessment.socialMedia || 0, sectorAvg: avgOf('socialMedia'), max: max.socialMedia },
        { key: 'website', label: 'Website', score: assessment.website || 0, sectorAvg: avgOf('website'), max: max.website },
        { key: 'visualContent', label: 'Visual Content', score: assessment.visualContent || 0, sectorAvg: avgOf('visualContent'), max: max.visualContent },
        { key: 'discoverability', label: 'Discoverability', score: assessment.discoverability || 0, sectorAvg: avgOf('discoverability'), max: max.discoverability },
        { key: 'digitalSales', label: 'Digital Sales', score: assessment.digitalSales || 0, sectorAvg: avgOf('digitalSales'), max: max.digitalSales }
      ];

      const opportunities = generateSimpleOpportunities(assessment);
      const quickWins = generateSimpleQuickWins(assessment);
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
            externalTotal: assessment.externalTotal,
            surveyTotal: assessment.surveyTotal,
            combined: assessment.combinedScore
          }
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

  // Participant justifications
  app.get('/participant/justifications', async (req: Request, res: Response) => {
    try {
      const name = (req.query.name || '').toString().trim();
      if (!name) return res.status(400).json({ error: 'Missing name' });
      const sheetId = requireEnv('SHEET_ID');
      const rowsMaster = await readMaster(sheetId, 'Master Assessment!A1:AD10000');
      let rowsTourism: string[][] = [];
      try {
        rowsTourism = await readMaster(sheetId, 'Tourism Assessment!A1:AD10000');
      } catch {
        rowsTourism = [];
      }
      const data = rowsMaster.concat(rowsTourism.length ? rowsTourism : []);
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

  // Participant presence links
  app.get('/participant/presence', async (req: Request, res: Response) => {
    try {
      const name = (req.query.name || '').toString().trim();
      if (!name) return res.status(400).json({ error: 'Missing name' });
      const sheetId = requireEnv('SHEET_ID');
      const rowsMaster = await readMaster(sheetId, 'Master Assessment!A1:AI10000');
      let rowsTourism: string[][] = [];
      try {
        rowsTourism = await readMaster(sheetId, 'Tourism Assessment!A1:AI10000');
      } catch {
        rowsTourism = [];
      }
      const rows = rowsMaster.concat(rowsTourism.length ? rowsTourism : []);
      const headers = (rows[0] || []).map(h => (h || '').toString().toLowerCase().trim());
      const idx: Record<string, number> = {};
      const map: Record<string, string> = { website: 'website', facebook: 'facebook', instagram: 'instagram', tripadvisor: 'tripadvisor', youtube: 'youtube' };
      Object.keys(map).forEach(k => { idx[k] = headers.indexOf(map[k]); });
      
      // Fallback to column indices if header names not found (AE=30, AF=31, AG=32, AH=33, AI=34)
      if (idx.website < 0) idx.website = 30; // Column AE
      if (idx.facebook < 0) idx.facebook = 31; // Column AF  
      if (idx.instagram < 0) idx.instagram = 32; // Column AG
      if (idx.tripadvisor < 0) idx.tripadvisor = 33; // Column AH
      if (idx.youtube < 0) idx.youtube = 34; // Column AI
      const row = rows.find((r, i) => i > 0 && (r[0] || '').toString().trim().toLowerCase() === name.toLowerCase());
      if (!row) return res.json({});
      const normalize = (v: any) => {
        const s = (v || '').toString().trim();
        if (!s) return '';
        if (/^https?:\/\//i.test(s)) return s;
        return '';
      };
      res.json({
        website: normalize(idx.website >= 0 ? row[idx.website] : ''),
        facebook: normalize(idx.facebook >= 0 ? row[idx.facebook] : ''),
        instagram: normalize(idx.instagram >= 0 ? row[idx.instagram] : ''),
        tripadvisor: normalize(idx.tripadvisor >= 0 ? row[idx.tripadvisor] : ''),
        youtube: normalize(idx.youtube >= 0 ? row[idx.youtube] : '')
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  // Sector context for participant
  app.get('/participant/sector-context', async (req: Request, res: Response) => {
    try {
      const name = (req.query.name || '').toString().trim();
      if (!name) return res.status(400).json({ error: 'Missing name' });
      const sheetId = requireEnv('SHEET_ID');
      const rowsMaster = await readMaster(sheetId, 'Master Assessment!A1:AD10000');
      let rowsTourism: string[][] = [];
      try {
        rowsTourism = await readMaster(sheetId, 'Tourism Assessment!A1:AD10000');
      } catch {
        rowsTourism = [];
      }
      const rows = rowsMaster.concat(rowsTourism.length ? rowsTourism : []);
      const assessments = rows.slice(1).filter(r => (r[0] || '').toString().trim() !== '').map(mapRowToAssessment);
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

  // Generate opportunities and quick wins for a participant
  app.get('/participant/opportunities', async (req: Request, res: Response) => {
    try {
      const name = (req.query.name || '').toString();
      if (!name) {
        res.status(400).json({ error: 'Name parameter required' });
        return;
      }
      
      const sheetId = requireEnv('SHEET_ID');
      const rows = await readMaster(sheetId, 'Master Assessment!A1:AI10000');
      
      // Find the row for this participant
      const participantRow = rows.find((row, index) => 
        index > 0 && String(row[0] || '').trim() === name.trim()
      );
      
      if (!participantRow) {
        res.status(404).json({ error: 'Participant not found' });
        return;
      }
      
      // Extract participant data
      const participant = {
        name: String(participantRow[0] || '').trim(),
        sector: String(participantRow[1] || '').trim(),
        region: String(participantRow[2] || '').trim(),
        socialMedia: parseFloat(participantRow[3]) || 0,
        website: parseFloat(participantRow[4]) || 0,
        visualContent: parseFloat(participantRow[5]) || 0,
        discoverability: parseFloat(participantRow[6]) || 0,
        digitalSales: parseFloat(participantRow[7]) || 0,
        platformIntegration: parseFloat(participantRow[8]) || 0,
        digitalComfort: parseFloat(participantRow[9]) || 0,
        contentStrategy: parseFloat(participantRow[10]) || 0,
        platformBreadth: parseFloat(participantRow[11]) || 0,
        investmentCapacity: parseFloat(participantRow[12]) || 0,
        challengeSeverity: parseFloat(participantRow[13]) || 0,
        externalTotal: parseFloat(participantRow[14]) || 0,
        surveyTotal: parseFloat(participantRow[15]) || 0,
        combinedScore: parseFloat(participantRow[16]) || 0,
        maturityLevel: String(participantRow[17] || '').trim()
      };
      
      // Generate opportunities and quick wins
      const opportunities = generateOpportunities(participant);
      const quickWins = generateQuickWins(participant);
      
      res.json({
        opportunities,
        quickWins
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  // Sector Intelligence Dashboard Endpoints

  // Get sector overview with health metrics
  app.get('/sector/overview', async (req: Request, res: Response) => {
    try {
      const sectorName = (req.query.name || '').toString();
      if (!sectorName) {
        res.status(400).json({ error: 'Sector name required' });
        return;
      }
      
      const sheetId = requireEnv('SHEET_ID');
      const rows = await readMaster(sheetId, 'Master Assessment!A1:AI10000');
      
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
      const maturityDistribution = { Expert: 0, Advanced: 0, Intermediate: 0, Emerging: 0, Absent: 0 };
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

  // Get sector ranking and benchmarking
  app.get('/sector/ranking', async (req: Request, res: Response) => {
    try {
      const type = (req.query.type || 'all').toString(); // 'creative' or 'all'
      const sheetId = requireEnv('SHEET_ID');
      const rows = await readMaster(sheetId, 'Master Assessment!A1:AI10000');
      
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

  // Get sector leaders and champions
  app.get('/sector/leaders', async (req: Request, res: Response) => {
    try {
      const sectorName = (req.query.name || '').toString();
      if (!sectorName) {
        res.status(400).json({ error: 'Sector name required' });
        return;
      }
      
      const sheetId = requireEnv('SHEET_ID');
      const rows = await readMaster(sheetId, 'Master Assessment!A1:AI10000');
      
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

  // Get sector category comparison for radar chart
  app.get('/sector/category-comparison', async (req: Request, res: Response) => {
    try {
      const sectorName = (req.query.name || '').toString();
      const compareWith = (req.query.compare || 'all').toString(); // 'creative' or 'all'
      
      if (!sectorName) {
        res.status(400).json({ error: 'Sector name required' });
        return;
      }
      
      const sheetId = requireEnv('SHEET_ID');
      const rows = await readMaster(sheetId, 'Master Assessment!A1:AI10000');
      
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

  return app;
}

// ----------------------
// Helpers for analysis and dashboards
// ----------------------

function n(v: any): number {
  const num = Number(v);
  return Number.isFinite(num) ? num : 0;
}

function mapRowToAssessment(row: string[]) {
  return {
    name: (row[0] || '').toString().trim(),
    sector: (row[1] || 'Unknown').toString(),
    region: (row[2] || 'Unknown').toString(),
    socialMedia: n(row[3]),
    website: n(row[4]),
    visualContent: n(row[5]),
    discoverability: n(row[6]),
    digitalSales: n(row[7]),
    platformIntegration: n(row[8]),
    digitalComfort: n(row[9]),
    contentStrategy: n(row[10]),
    platformBreadth: n(row[11]),
    investmentCapacity: n(row[12]),
    challengeSeverity: n(row[13]),
    externalTotal: n(row[14]),
    surveyTotal: n(row[15]),
    combinedScore: n(row[16]) || n(row[14]),
    maturityLevel: (row[17] || '').toString() || 'Absent'
  };
}

function normalizeMaturity(v: string): string {
  if (!v) return 'Absent';
  if (v === 'Basic') return 'Emerging';
  const allowed = ['Absent', 'Emerging', 'Intermediate', 'Advanced', 'Expert'];
  return allowed.includes(v) ? v : 'Absent';
}

function buildDashboardFromRows(rows: string[][]) {
  const maturity: Record<string, number> = { Expert: 0, Advanced: 0, Intermediate: 0, Emerging: 0, Absent: 0 };
  const sectorMap: Record<string, { count: number; totalExternal: number; totalSurvey: number; totalCombined: number; complete: number; }> = {};
  const participants: Array<{ name: string; sector: string; external: number; survey: number; combined: number; maturity: string }> = [];

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

  const withExternal = rows.filter(r => n(r[14]) > 0).length;
  const withSurvey = rows.filter(r => n(r[15]) > 0).length;
  const complete = rows.filter(r => n(r[14]) > 0 && n(r[15]) > 0).length;
  const avgExternal = withExternal ? Math.round(rows.reduce((s, r) => s + n(r[14]), 0) / withExternal * 10) / 10 : 0;
  const avgSurvey = withSurvey ? Math.round(rows.reduce((s, r) => s + n(r[15]), 0) / withSurvey * 10) / 10 : 0;
  const avgCombined = complete ? Math.round(rows.reduce((s, r) => s + (n(r[16]) || n(r[14])), 0) / complete * 10) / 10 : 0;

  const externalRows = rows.filter(r => n(r[14]) > 0);
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
    sheetName: 'Master Assessment',
    total: rows.length,
    maturity,
    sectors,
    participants,
    categoryAverages,
    sectorStacked,
    overall: { withExternal, withSurvey, complete, avgExternal, avgSurvey, avgCombined }
  };
}

function generateSimpleOpportunities(a: ReturnType<typeof mapRowToAssessment>) {
  const items: Array<{ category: string; current: string; target: string; actions: string[]; timeframe: string; cost: string; impact: string; }> = [];
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
  const wins: Array<{ opportunity: string; currentToTarget: string; actions: string[]; timeframe: string; cost: string; impact: string; }> = [];
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

function computeStats(rows: string[][]): AssessmentStats {
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

  const averageScores = {
    external: totalAssessments ? Math.round((totalExternal / totalAssessments) * 10) / 10 : 0,
    survey: totalAssessments ? Math.round((totalSurvey / totalAssessments) * 10) / 10 : 0,
    combined: totalAssessments ? Math.round((totalCombined / totalAssessments) * 10) / 10 : 0
  };

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

// Helper function for sector guidance
function generateSectorGuidance(assessments: any[]) {
  const sectorGuidance: Record<string, any> = {};
  
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
    const scores: Record<string, number> = {
      socialMedia: assessment.socialMedia,
      website: assessment.website,
      visualContent: assessment.visualContent,
      discoverability: assessment.discoverability,
      digitalSales: assessment.digitalSales
    };
    
    Object.keys(scores).forEach(category => {
      if (!guidance.averageScores[category]) guidance.averageScores[category] = 0;
      guidance.averageScores[category] += scores[category];
    });
    
    // Categorize by advancement readiness
    if (assessment.externalTotal >= 40) {
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
    
    guidance.priorityArea = 'General improvement';
    guidance.recommendations = [
      `Focus on digital presence development for ${guidance.total} stakeholders`,
      `Priority areas: Social Media and Visual Content`
    ];
  });
  
  return sectorGuidance;
}

// Helper functions for generating opportunities and quick wins
function generateOpportunities(participant: any) {
  const opportunities = [];
  
  // Social Media progression
  if (participant.socialMedia < 18) {
    const nextLevel = getNextSocialMediaLevel(participant.socialMedia);
    if (nextLevel > participant.socialMedia) {
      opportunities.push({
        category: 'Social Media Business Presence',
        current: `${participant.socialMedia} - ${getSocialMediaDescription(participant.socialMedia)}`,
        target: `${nextLevel} - ${getSocialMediaDescription(nextLevel)}`,
        actions: getSocialMediaActions(participant.socialMedia, nextLevel),
        timeframe: getSocialMediaTimeframe(participant.socialMedia, nextLevel),
        cost: getSocialMediaCost(participant.socialMedia, nextLevel),
        impact: determineSocialMediaImpact(participant.socialMedia, nextLevel, participant.sector)
      });
    }
  }
  
  // Website progression
  if (participant.website < 12) {
    const nextLevel = getNextWebsiteLevel(participant.website);
    if (nextLevel > participant.website) {
      opportunities.push({
        category: 'Website Presence & Functionality',
        current: `${participant.website} - ${getWebsiteDescription(participant.website)}`,
        target: `${nextLevel} - ${getWebsiteDescription(nextLevel)}`,
        actions: getWebsiteActions(participant.website, nextLevel),
        timeframe: getWebsiteTimeframe(participant.website, nextLevel),
        cost: getWebsiteCost(participant.website, nextLevel),
        impact: determineWebsiteImpact(participant.website, nextLevel, participant.sector)
      });
    }
  }
  
  // Visual Content progression
  if (participant.visualContent < 15) {
    const nextLevel = getNextVisualContentLevel(participant.visualContent);
    if (nextLevel > participant.visualContent) {
      opportunities.push({
        category: 'Visual Content Quality',
        current: `${participant.visualContent} - ${getVisualContentDescription(participant.visualContent)}`,
        target: `${nextLevel} - ${getVisualContentDescription(nextLevel)}`,
        actions: getVisualContentActions(participant.visualContent, nextLevel),
        timeframe: getVisualContentTimeframe(participant.visualContent, nextLevel),
        cost: getVisualContentCost(participant.visualContent, nextLevel),
        impact: 'Critical' // Always critical for creative industries
      });
    }
  }
  
  // Discoverability progression
  if (participant.discoverability < 12) {
    const nextLevel = getNextDiscoverabilityLevel(participant.discoverability);
    if (nextLevel > participant.discoverability) {
      opportunities.push({
        category: 'Online Discoverability & Reputation',
        current: `${participant.discoverability} - ${getDiscoverabilityDescription(participant.discoverability)}`,
        target: `${nextLevel} - ${getDiscoverabilityDescription(nextLevel)}`,
        actions: getDiscoverabilityActions(participant.discoverability, nextLevel),
        timeframe: getDiscoverabilityTimeframe(participant.discoverability, nextLevel),
        cost: getDiscoverabilityCost(participant.discoverability, nextLevel),
        impact: determineDiscoverabilityImpact(participant.discoverability, nextLevel, participant.sector)
      });
    }
  }
  
  // Digital Sales progression
  if (participant.digitalSales < 8) {
    const nextLevel = getNextDigitalSalesLevel(participant.digitalSales);
    if (nextLevel > participant.digitalSales) {
      opportunities.push({
        category: 'Digital Sales/Booking Capability',
        current: `${participant.digitalSales} - ${getDigitalSalesDescription(participant.digitalSales)}`,
        target: `${nextLevel} - ${getDigitalSalesDescription(nextLevel)}`,
        actions: getDigitalSalesActions(participant.digitalSales, nextLevel),
        timeframe: getDigitalSalesTimeframe(participant.digitalSales, nextLevel),
        cost: getDigitalSalesCost(participant.digitalSales, nextLevel),
        impact: determineDigitalSalesImpact(participant.digitalSales, nextLevel, participant.sector)
      });
    }
  }
  
  return opportunities;
}

function generateQuickWins(participant: any) {
  const quickWins = [];
  
  // Google Business Profile tune-up
  if (participant.discoverability <= 3) {
    const isTourOperator = participant.sector && participant.sector.toLowerCase().includes('tour');
    quickWins.push({
      opportunity: isTourOperator ? 'Tripadvisor & Google Profile Upgrade' : 'Google Business Profile Tune-Up',
      currentToTarget: `${participant.discoverability} → ${participant.discoverability + 2}`,
      actions: isTourOperator ? [
        'Upgrade Tripadvisor listing with products, images, hours',
        'Claim/complete Google Business Profile',
        'Request 5 guest reviews with photos'
      ] : [
        'Claim and verify Google Business Profile',
        'Add complete info, categories and high-quality photos',
        'Request 5 customer reviews and respond'
      ],
      timeframe: '2-3 hours',
      cost: 'Free',
      impact: 'High'
    });
  }
  
  // Social media consistency
  if (participant.socialMedia >= 2 && participant.socialMedia <= 6) {
    quickWins.push({
      opportunity: 'Social Media Consistency Boost',
      currentToTarget: `${participant.socialMedia} → ${participant.socialMedia + 2}`,
      actions: [
        'Create weekly posting schedule',
        'Enable all business features on current platforms',
        'Start engaging with customer comments daily'
      ],
      timeframe: '1-2 weeks',
      cost: 'D0-200',
      impact: 'High'
    });
  }
  
  // Visual content improvement
  if (participant.visualContent >= 2 && participant.visualContent <= 6) {
    quickWins.push({
      opportunity: 'Smartphone Photography Skills',
      currentToTarget: `${participant.visualContent} → ${participant.visualContent + 2}`,
      actions: [
        'Learn basic composition and lighting techniques',
        'Practice product photography with phone camera',
        'Start basic editing using free phone apps'
      ],
      timeframe: '4-6 hours training',
      cost: 'D0-500',
      impact: 'Critical'
    });
  }
  
  // Website presence starter
  if (participant.website === 0 || participant.website === 1) {
    const isTourOperator = participant.sector && participant.sector.toLowerCase().includes('tour');
    quickWins.push({
      opportunity: isTourOperator ? 'Tour One-Page Launch' : 'One-Page Website Launch',
      currentToTarget: `${participant.website} → ${Math.min(participant.website + 3, 3)}`,
      actions: isTourOperator ? [
        'Create one page per tour: price, duration, essentials',
        'Add map, 6 photos and FAQs',
        'Add WhatsApp "Book now" button'
      ] : [
        'Create a one-page site (e.g., Google Sites)',
        'Add contact info, value proposition and 6 photos',
        'Link to WhatsApp and social profiles'
      ],
      timeframe: '1 week',
      cost: 'D0-500',
      impact: 'High'
    });
  }
  
  // Digital sales quick step
  if (participant.digitalSales === 0 || participant.digitalSales === 2) {
    const isFashion = participant.sector && participant.sector.toLowerCase().includes('fashion');
    quickWins.push({
      opportunity: isFashion ? 'Order & Customization Flow' : 'Inquiry-to-Order Flow',
      currentToTarget: `${participant.digitalSales} → ${Math.min(participant.digitalSales + 2, 4)}`,
      actions: isFashion ? [
        'Enable variants and size/colour options',
        'Add custom order form with measurements',
        'Set up deposit/payment link'
      ] : [
        'Add an order/inquiry form or prefilled WhatsApp',
        'Define response template and 24h turnaround',
        'Track inquiries in a shared sheet'
      ],
      timeframe: '1 week',
      cost: 'D0-200',
      impact: 'Medium'
    });
  }
  
  return quickWins.slice(0, 3); // Return top 3 quick wins
}

// Level progression functions
function getNextSocialMediaLevel(current: number) {
  const levels = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];
  const currentIndex = levels.findIndex(level => level >= current);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : 18;
}

function getNextWebsiteLevel(current: number) {
  const levels = [0, 1, 3, 5, 7, 9, 12];
  const currentIndex = levels.findIndex(level => level >= current);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : 12;
}

function getNextVisualContentLevel(current: number) {
  const levels = [0, 2, 4, 6, 8, 10, 12, 15];
  const currentIndex = levels.findIndex(level => level >= current);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : 15;
}

function getNextDiscoverabilityLevel(current: number) {
  const levels = [0, 1, 3, 5, 7, 9, 12];
  const currentIndex = levels.findIndex(level => level >= current);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : 12;
}

function getNextDigitalSalesLevel(current: number) {
  const levels = [0, 2, 4, 6, 8];
  const currentIndex = levels.findIndex(level => level >= current);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : 8;
}

// Description functions
function getSocialMediaDescription(score: number) {
  const descriptions: Record<number, string> = {
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

function getWebsiteDescription(score: number) {
  const descriptions: Record<number, string> = {
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

function getVisualContentDescription(score: number) {
  const descriptions: Record<number, string> = {
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

function getDiscoverabilityDescription(score: number) {
  const descriptions: Record<number, string> = {
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

function getDigitalSalesDescription(score: number) {
  const descriptions: Record<number, string> = {
    0: 'No online transactions',
    2: 'Basic inquiry system',
    4: 'Platform-based sales',
    6: 'Digital payment integration',
    8: 'Full digital commerce'
  };
  return descriptions[score] || 'Custom level';
}

// Action generation functions (simplified versions)
function getSocialMediaActions(current: number, target: number) {
  const actionMap: Record<string, string[]> = {
    '0to2': [
      'Set up Facebook Business page with complete profile information',
      'Add business contact details, description, and location',
      'Upload profile photo and cover image representing your business'
    ],
    '2to4': [
      'Enable WhatsApp Business with catalog feature',
      'Post business content 2-3 times per month consistently',
      'Use business features like operating hours and location services'
    ],
    '4to6': [
      'Establish weekly posting schedule with diverse content',
      'Create content showcasing products/services and behind-the-scenes work',
      'Use relevant local hashtags (#GambianCrafts, #VisitGambia)'
    ],
    '6to8': [
      'Set up second platform (Instagram if using Facebook, or vice versa)',
      'Cross-reference platforms in posts ("See more on our Instagram")',
      'Encourage and actively respond to customer reviews'
    ],
    '8to10': [
      'Plan content around events, seasons, and business cycles',
      'Create different content types: promotional, educational, community engagement',
      'Develop relationships with other local creative businesses online'
    ],
    '10to12': [
      'Coordinate branding across 3+ platforms with consistent logos and messaging',
      'Establish daily or every-other-day posting schedule',
      'Begin using basic analytics to understand audience preferences'
    ],
    '12to14': [
      'Collaborate with other businesses and local influencers',
      'Tailor content specifically for each platform\'s audience',
      'Track and celebrate follower growth milestones'
    ],
    '14to16': [
      'Develop evident content calendar with themed days and strategic timing',
      'Use professional photography across all platforms',
      'Form strategic partnerships with tourism boards or cultural organizations'
    ],
    '16to18': [
      'Become a reference point that other businesses share and mention',
      'Get featured by tourism organizations, media, or industry publications',
      'Create comprehensive digital ecosystem linking all platforms seamlessly'
    ]
  };
  
  const key = `${current}to${target}`;
  return actionMap[key] || ['Focus on consistent, quality content creation'];
}

function getWebsiteActions(current: number, target: number) {
  const actionMap: Record<string, string[]> = {
    '0to1': [
      'Research web hosting options (start with free platforms like Wix or WordPress.com)',
      'Register a domain name related to your business',
      'Choose a template that matches your industry'
    ],
    '1to3': [
      'Add complete contact information including phone, email, and physical address',
      'Write a clear business description explaining your products/services',
      'Upload 3-5 high-quality images showcasing your work'
    ],
    '3to5': [
      'Create separate pages for different services or product categories',
      'Add customer testimonials or reviews if available',
      'Update content to reflect current offerings and recent work'
    ],
    '5to7': [
      'Update website content at least every 6 months with fresh information',
      'Improve site navigation so visitors can easily find what they need',
      'Add links to your social media accounts'
    ],
    '7to9': [
      'Implement basic SEO by adding relevant keywords to page titles and descriptions',
      'Update content every 3 months with news, events, or new work',
      'Add professional photography throughout the site'
    ],
    '9to12': [
      'Add e-commerce functionality or booking system if relevant to your business',
      'Implement comprehensive business showcase with portfolio or catalog',
      'Update content monthly with blog posts, news, or featured work'
    ]
  };
  
  const key = `${current}to${target}`;
  return actionMap[key] || ['Focus on regular updates and improved functionality'];
}

function getVisualContentActions(current: number, target: number) {
  const actionMap: Record<string, string[]> = {
    '0to2': [
      'Take clear, well-lit photos using smartphone camera',
      'Ensure subjects are in focus and well-centered in frame',
      'Use natural lighting when possible (near windows or outdoors)'
    ],
    '2to4': [
      'Learn basic smartphone photography techniques (rule of thirds, lighting)',
      'Pay attention to backgrounds - keep them clean and uncluttered',
      'Take multiple shots from different angles'
    ],
    '4to6': [
      'Learn basic photo editing using free phone apps (brightness, contrast, crop)',
      'Develop consistent style or approach to your photography',
      'Show products/services from multiple angles and in different contexts'
    ],
    '6to8': [
      'Create professional-looking product shots with consistent backgrounds',
      'Use consistent filters or editing style across all images',
      'Begin creating action shots that tell the story of your work'
    ],
    '8to10': [
      'Invest in basic photography equipment (tripod, reflector, or simple lighting)',
      'Create branded templates for social media posts',
      'Start creating short video content showcasing your work process'
    ],
    '10to12': [
      'Plan and execute professional photo shoots for key products/services',
      'Create high-quality video content with good audio and stable footage',
      'Develop comprehensive visual brand guidelines'
    ],
    '12to15': [
      'Create award-quality visual content that sets industry standards',
      'Develop innovative visual approaches unique to your business',
      'Use professional equipment and advanced techniques consistently'
    ]
  };
  
  const key = `${current}to${target}`;
  return actionMap[key] || ['Focus on improving photo quality and consistency'];
}

function getDiscoverabilityActions(current: number, target: number) {
  const actionMap: Record<string, string[]> = {
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
      'List your business on relevant local directories (tourism, industry-specific)'
    ],
    '5to7': [
      'Regularly update Google My Business with posts about events, news, or offers',
      'Actively seek customer reviews and respond to all reviews professionally',
      'Get listed on tourism platforms like VisitTheGambia.com or My-Gambia.com'
    ],
    '7to9': [
      'Maintain 20+ customer reviews with professional responses to all feedback',
      'Regularly post updates on Google My Business (weekly if possible)',
      'Get featured on multiple tourism and industry websites'
    ],
    '9to12': [
      'Dominate first page search results for your business name and relevant keywords',
      'Become a featured business on tourism board websites',
      'Have other businesses and organizations link to or mention your business'
    ]
  };
  
  const key = `${current}to${target}`;
  return actionMap[key] || ['Focus on improving search visibility and online reputation'];
}

function getDigitalSalesActions(current: number, target: number) {
  const actionMap: Record<string, string[]> = {
    '0to2': [
      'Set up WhatsApp Business with product catalog feature',
      'Create contact forms on your website or social media',
      'Enable messaging on Facebook/Instagram for customer inquiries'
    ],
    '2to4': [
      'Use Facebook Shop or Instagram Shopping features',
      'Set up WhatsApp Business catalog with product photos and prices',
      'Create social media posts that encourage direct messaging for orders'
    ],
    '4to6': [
      'Set up mobile money payment options (Orange Money, QMoney)',
      'Integrate basic payment systems into your social media or website',
      'Create simple order forms that customers can fill out online'
    ],
    '6to8': [
      'Implement full e-commerce website with shopping cart functionality',
      'Integrate multiple payment options including mobile money and bank transfers',
      'Create comprehensive online ordering system'
    ]
  };
  
  const key = `${current}to${target}`;
  return actionMap[key] || ['Focus on improving digital payment and ordering capabilities'];
}

// Impact, timeframe, and cost determination functions
function determineSocialMediaImpact(current: number, target: number, sector: string) {
  if (current < 6) return 'Critical';
  if (current < 12) return 'High';
  return 'Medium';
}

function determineWebsiteImpact(current: number, target: number, sector: string) {
  const professionalSectors = ['Marketing/advertising/publishing', 'Audiovisual'];
  if (professionalSectors.includes(sector) && current < 5) return 'High';
  return 'Medium';
}

function determineDiscoverabilityImpact(current: number, target: number, sector: string) {
  if (current < 3) return 'Critical';
  if (current < 7) return 'High';
  return 'Medium';
}

function determineDigitalSalesImpact(current: number, target: number, sector: string) {
  const commerceSectors = ['Crafts and artisan products', 'Fashion & Design'];
  if (commerceSectors.includes(sector) && current < 4) return 'High';
  return 'Medium';
}

function getSocialMediaTimeframe(current: number, target: number) {
  const gap = target - current;
  if (gap <= 2) return '1-2 weeks';
  if (gap <= 4) return '3-4 weeks';
  return '2-3 months';
}

function getWebsiteTimeframe(current: number, target: number) {
  if (current === 0) return '4-8 weeks';
  if (target - current <= 2) return '2-3 weeks';
  return '4-6 weeks';
}

function getVisualContentTimeframe(current: number, target: number) {
  const gap = target - current;
  if (gap <= 2) return '1-2 weeks';
  if (gap <= 4) return '3-4 weeks';
  return '1-2 months';
}

function getDiscoverabilityTimeframe(current: number, target: number) {
  if (target - current <= 2) return '1-2 weeks';
  return '3-4 weeks';
}

function getDigitalSalesTimeframe(current: number, target: number) {
  if (target - current <= 2) return '2-3 weeks';
  if (target - current <= 4) return '4-6 weeks';
  return '2-3 months';
}

function getSocialMediaCost(current: number, target: number) {
  const gap = target - current;
  if (gap <= 4) return 'D0-500';
  if (gap <= 8) return 'D500-2,000';
  return 'D2,000-5,000';
}

function getWebsiteCost(current: number, target: number) {
  if (current === 0) return 'D2,000-8,000';
  if (target - current <= 2) return 'D500-2,000';
  return 'D2,000-5,000';
}

function getVisualContentCost(current: number, target: number) {
  const gap = target - current;
  if (gap <= 2) return 'D0-500';
  if (gap <= 4) return 'D500-2,000';
  return 'D2,000-8,000';
}

function getDiscoverabilityCost(current: number, target: number) {
  return 'D0-500'; // Most discoverability improvements are free
}

function getDigitalSalesCost(current: number, target: number) {
  const gap = target - current;
  if (gap <= 2) return 'D0-1,000';
  if (gap <= 4) return 'D1,000-3,000';
  return 'D3,000-8,000';
}

// Local dev entrypoint
if (process.env.NODE_ENV !== 'production') {
  const app = createApp();
  const port = Number(process.env.PORT || 8787);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${port}`);
  });
}


