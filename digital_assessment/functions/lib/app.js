import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
function requireEnv(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing env var: ${name}`);
    return v;
}
async function getSheetsClient() {
    const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
    const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    let auth;
    if (keyJson && keyJson.trim().startsWith('{')) {
        const creds = JSON.parse(keyJson);
        auth = new google.auth.JWT(creds.client_email, undefined, creds.private_key, scopes);
        await auth.authorize();
    }
    else {
        auth = await google.auth.getClient({ scopes });
    }
    return google.sheets({ version: 'v4', auth });
}
async function readMaster(sheetId, range = 'Master Assessment!A1:AI10000') {
    const sheets = await getSheetsClient();
    const { data } = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
    const rows = (data.values || []);
    return rows;
}
function parseParticipants(rows, sectorFilter) {
    const body = rows.slice(1).filter(r => (r[0] || '').toString().trim() !== '');
    return body
        .filter(r => !sectorFilter || r[1] === sectorFilter)
        .map(r => ({ name: (r[0] || '').toString().trim(), sector: (r[1] || 'Unknown').toString() }))
        .sort((a, b) => a.name.localeCompare(b.name));
}
function filterTourOperators(list) {
    const namePattern = /(\btour\b|\btravel\b|\bsafari\b|\bexcursion\b|\bexpeditions?\b|\bguide\b)/i;
    return list.filter(p => ((p.sector || '').toLowerCase().includes('tour') || namePattern.test(p.name || '')));
}
export function createApp() {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.get('/health', (_req, res) => {
        res.json({ ok: true });
    });
    app.get('/sectors', async (_req, res) => {
        try {
            const rows = await readMaster(requireEnv('SHEET_ID'));
            const set = new Set();
            rows.slice(1).forEach(r => { if ((r[0] || '').toString().trim())
                set.add((r[1] || 'Unknown').toString()); });
            res.json(Array.from(set).sort());
        }
        catch (e) {
            res.status(500).json({ error: e.message || String(e) });
        }
    });
    app.get('/participants', async (req, res) => {
        try {
            const sector = (req.query.sector || '').toString();
            const rows = await readMaster(requireEnv('SHEET_ID'));
            res.json(parseParticipants(rows, sector || undefined));
        }
        catch (e) {
            res.status(500).json({ error: e.message || String(e) });
        }
    });
    app.get('/tour-operators', async (_req, res) => {
        try {
            const sheetId = requireEnv('SHEET_ID');
            const rowsMaster = await readMaster(sheetId, 'Master Assessment!A1:AI10000');
            let rowsTourism = [];
            try {
                rowsTourism = await readMaster(sheetId, 'Tourism Assessment!A1:AI10000');
            }
            catch {
                rowsTourism = [];
            }
            const all = parseParticipants(rowsMaster).concat(parseParticipants(rowsTourism));
            const filtered = filterTourOperators(all);
            res.json(filtered);
        }
        catch (e) {
            res.status(500).json({ error: e.message || String(e) });
        }
    });
    app.get('/stats', async (_req, res) => {
        try {
            const rows = await readMaster(requireEnv('SHEET_ID'));
            const stats = computeStats(rows);
            res.json(stats);
        }
        catch (e) {
            res.status(500).json({ error: e.message || String(e) });
        }
    });
    // Dashboard data (mirrors getDashboardData in Apps Script at a high level)
    app.get('/dashboard', async (req, res) => {
        try {
            const includeTourism = String(req.query.includeTourism || 'false') === 'true';
            const rows = await readMaster(requireEnv('SHEET_ID'));
            const body = rows.slice(1).filter(r => (r[0] || '').toString().trim() !== '');
            const dataRows = body; // Single sheet for now; tourism sheet can be added later if needed
            const result = buildDashboardFromRows(dataRows);
            res.json(result);
        }
        catch (e) {
            res.status(500).json({ error: e.message || String(e) });
        }
    });
    // Participant plan (simplified port of getParticipantPlan)
    app.get('/participant/plan', async (req, res) => {
        try {
            const name = (req.query.name || '').toString().trim();
            if (!name)
                return res.status(400).json({ error: 'Missing name' });
            const sheetId = requireEnv('SHEET_ID');
            const rowsMaster = await readMaster(sheetId, 'Master Assessment!A1:AI10000');
            let rowsTourism = [];
            try {
                rowsTourism = await readMaster(sheetId, 'Tourism Assessment!A1:AI10000');
            }
            catch {
                rowsTourism = [];
            }
            const rows = rowsMaster.concat(rowsTourism.length ? rowsTourism : []);
            const body = rows.slice(1).filter(r => (r[0] || '').toString().trim() !== '');
            const assessments = body.map(mapRowToAssessment);
            const assessment = assessments.find(a => a.name.toLowerCase() === name.toLowerCase());
            if (!assessment)
                return res.status(404).json({ error: 'Participant not found' });
            const sectorAssessments = assessments.filter(a => a.sector === assessment.sector);
            const avgOf = (key) => {
                const vals = sectorAssessments.map(a => a[key] || 0);
                return vals.length ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10 : 0;
            };
            const max = { socialMedia: 18, website: 12, visualContent: 15, discoverability: 12, digitalSales: 8, platformIntegration: 5 };
            const externalBreakdown = [
                { key: 'socialMedia', label: 'Social Media', score: assessment.socialMedia || 0, sectorAvg: avgOf('socialMedia'), max: max.socialMedia },
                { key: 'website', label: 'Website', score: assessment.website || 0, sectorAvg: avgOf('website'), max: max.website },
                { key: 'visualContent', label: 'Visual Content', score: assessment.visualContent || 0, sectorAvg: avgOf('visualContent'), max: max.visualContent },
                { key: 'discoverability', label: 'Discoverability', score: assessment.discoverability || 0, sectorAvg: avgOf('discoverability'), max: max.discoverability },
                { key: 'digitalSales', label: 'Digital Sales', score: assessment.digitalSales || 0, sectorAvg: avgOf('digitalSales'), max: max.digitalSales },
                { key: 'platformIntegration', label: 'Platform Integration', score: assessment.platformIntegration || 0, sectorAvg: avgOf('platformIntegration'), max: max.platformIntegration }
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
        }
        catch (e) {
            res.status(500).json({ error: e.message || String(e) });
        }
    });
    // Participant justifications (columns Y-AD)
    app.get('/participant/justifications', async (req, res) => {
        try {
            const name = (req.query.name || '').toString().trim();
            if (!name)
                return res.status(400).json({ error: 'Missing name' });
            const sheetId = requireEnv('SHEET_ID');
            const rowsMaster = await readMaster(sheetId, 'Master Assessment!A1:AI10000');
            let rowsTourism = [];
            try {
                rowsTourism = await readMaster(sheetId, 'Tourism Assessment!A1:AI10000');
            }
            catch {
                rowsTourism = [];
            }
            const data = rowsMaster.concat(rowsTourism.length ? rowsTourism : []);
            const row = data.find((r, i) => i > 0 && (r[0] || '').toString().trim().toLowerCase() === name.toLowerCase());
            if (!row)
                return res.json({});
            const j = (v) => (v || '').toString().trim();
            res.json({
                socialMedia: j(row[24]),
                website: j(row[25]),
                visualContent: j(row[26]),
                discoverability: j(row[27]),
                digitalSales: j(row[28]),
                platformIntegration: j(row[29])
            });
        }
        catch (e) {
            res.status(500).json({ error: e.message || String(e) });
        }
    });
    // Participant presence links (Website, Facebook, Instagram, Tripadvisor, YouTube)
    app.get('/participant/presence', async (req, res) => {
        try {
            const name = (req.query.name || '').toString().trim();
            if (!name)
                return res.status(400).json({ error: 'Missing name' });
            const sheetId = requireEnv('SHEET_ID');
            const rowsMaster = await readMaster(sheetId, 'Master Assessment!A1:AI10000');
            let rowsTourism = [];
            try {
                rowsTourism = await readMaster(sheetId, 'Tourism Assessment!A1:AI10000');
            }
            catch {
                rowsTourism = [];
            }
            const rows = rowsMaster.concat(rowsTourism.length ? rowsTourism : []);
            const headers = (rows[0] || []).map(h => (h || '').toString().toLowerCase().trim());
            const idx = {};
            const map = { website: 'website', facebook: 'facebook', instagram: 'instagram', tripadvisor: 'tripadvisor', youtube: 'youtube' };
            Object.keys(map).forEach(k => { idx[k] = headers.indexOf(map[k]); });
            const row = rows.find((r, i) => i > 0 && (r[0] || '').toString().trim().toLowerCase() === name.toLowerCase());
            if (!row)
                return res.json({});
            const normalize = (v) => {
                const s = (v || '').toString().trim();
                if (!s)
                    return '';
                if (/^https?:\/\//i.test(s))
                    return s;
                return '';
            };
            res.json({
                website: normalize(idx.website >= 0 ? row[idx.website] : ''),
                facebook: normalize(idx.facebook >= 0 ? row[idx.facebook] : ''),
                instagram: normalize(idx.instagram >= 0 ? row[idx.instagram] : ''),
                tripadvisor: normalize(idx.tripadvisor >= 0 ? row[idx.tripadvisor] : ''),
                youtube: normalize(idx.youtube >= 0 ? row[idx.youtube] : '')
            });
        }
        catch (e) {
            res.status(500).json({ error: e.message || String(e) });
        }
    });
    // Sector context for participant (priority area + recommendations)
    app.get('/participant/sector-context', async (req, res) => {
        try {
            const name = (req.query.name || '').toString().trim();
            if (!name)
                return res.status(400).json({ error: 'Missing name' });
            const sheetId = requireEnv('SHEET_ID');
            const rowsMaster = await readMaster(sheetId, 'Master Assessment!A1:AD10000');
            let rowsTourism = [];
            try {
                rowsTourism = await readMaster(sheetId, 'Tourism Assessment!A1:AD10000');
            }
            catch {
                rowsTourism = [];
            }
            const rows = rowsMaster.concat(rowsTourism.length ? rowsTourism : []);
            const assessments = rows.slice(1).filter(r => (r[0] || '').toString().trim() !== '').map(mapRowToAssessment);
            const a = assessments.find(x => x.name.toLowerCase() === name.toLowerCase());
            if (!a)
                return res.json({});
            const guidanceMap = generateSectorGuidance(assessments);
            const g = guidanceMap[a.sector] || {};
            res.json({
                sector: a.sector || 'Unknown',
                priorityArea: g.priorityArea || '',
                recommendations: (g.recommendations || []).slice(0, 2),
                total: g.total || 0
            });
        }
        catch (e) {
            res.status(500).json({ error: e.message || String(e) });
        }
    });
    return app;
}
function computeStats(rows) {
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
    const maturityDistribution = {};
    const sectorBreakdown = {};
    for (const r of body) {
        const name = (r[0] || '').toString().trim();
        if (!name)
            continue;
        const sector = (r[sectorIndex] || 'Unknown').toString();
        const external = Number(r[externalTotalIndex] || 0) || 0;
        const survey = Number(r[surveyTotalIndex] || 0) || 0;
        const combined = Number(r[combinedTotalIndex] || 0) || 0;
        const maturity = (r[maturityIndex] || '').toString();
        totalAssessments++;
        totalExternal += external;
        totalSurvey += survey;
        totalCombined += combined;
        if (maturity)
            maturityDistribution[maturity] = (maturityDistribution[maturity] || 0) + 1;
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
function n(v) {
    const num = Number(v);
    return Number.isFinite(num) ? num : 0;
}
function mapRowToAssessment(row) {
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
function buildDashboardFromRows(rows) {
    const maturity = { Expert: 0, Advanced: 0, Intermediate: 0, Emerging: 0, Absent: 0 };
    const sectorMap = {};
    const participants = [];
    rows.forEach(r => {
        const a = mapRowToAssessment(r);
        if (!a.name)
            return;
        const maturityLevel = normalizeMaturity(a.maturityLevel);
        maturity[maturityLevel] = (maturity[maturityLevel] || 0) + 1;
        if (!sectorMap[a.sector])
            sectorMap[a.sector] = { count: 0, totalExternal: 0, totalSurvey: 0, totalCombined: 0, complete: 0 };
        const s = sectorMap[a.sector];
        s.count++;
        s.totalExternal += a.externalTotal || 0;
        s.totalSurvey += a.surveyTotal || 0;
        s.totalCombined += a.combinedScore || 0;
        if ((a.externalTotal || 0) > 0 && (a.surveyTotal || 0) > 0)
            s.complete++;
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
    const sectorStacked = {};
    participants.forEach(p => {
        if (!sectorStacked[p.sector])
            sectorStacked[p.sector] = { Absent: 0, Emerging: 0, Intermediate: 0, Advanced: 0, Expert: 0, total: 0 };
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
function normalizeMaturity(v) {
    if (!v)
        return 'Absent';
    if (v === 'Basic')
        return 'Emerging';
    const allowed = ['Absent', 'Emerging', 'Intermediate', 'Advanced', 'Expert'];
    return allowed.includes(v) ? v : 'Absent';
}
function generateSimpleOpportunities(a) {
    const items = [];
    // Pick two weakest external categories
    const categories = [
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
function generateSimpleQuickWins(a) {
    const wins = [];
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
    };
}
function generateSectorGuidance(assessments) {
    const map = {};
    for (const a of assessments) {
        if (!map[a.sector])
            map[a.sector] = { total: 0, sums: { socialMedia: 0, website: 0, visualContent: 0, discoverability: 0, digitalSales: 0 }, gaps: { socialMedia: 0, website: 0, visualContent: 0, discoverability: 0, digitalSales: 0 } };
        const g = map[a.sector];
        g.total++;
        g.sums.socialMedia += a.socialMedia;
        g.sums.website += a.website;
        g.sums.visualContent += a.visualContent;
        g.sums.discoverability += a.discoverability;
        g.sums.digitalSales += a.digitalSales;
        if (a.socialMedia < 10)
            g.gaps.socialMedia++;
        if (a.website < 6)
            g.gaps.website++;
        if (a.visualContent < 8)
            g.gaps.visualContent++;
        if (a.discoverability < 6)
            g.gaps.discoverability++;
        if (a.digitalSales < 4)
            g.gaps.digitalSales++;
    }
    const recFor = {
        socialMedia: ['Weekly posting cadence', 'Enable business features', 'Request testimonials'],
        website: ['Add clear services and contact', 'Improve mobile performance', 'Add WhatsApp CTA'],
        visualContent: ['Improve photo lighting', 'Consistent brand style', 'Short product videos'],
        discoverability: ['Claim Google profile', 'Get 5+ reviews', 'List on sector directories'],
        digitalSales: ['Add inquiry/order form', 'Enable mobile money', 'Publish clear pricing where possible']
    };
    Object.keys(map).forEach(sector => {
        const g = map[sector];
        const gapEntries = Object.entries(g.gaps);
        const priorityArea = (gapEntries.sort((a, b) => (b[1] - a[1]))[0] || ['General', 0])[0];
        g.priorityArea = priorityArea;
        g.recommendations = recFor[priorityArea] || ['General improvement'];
    });
    return map;
}
