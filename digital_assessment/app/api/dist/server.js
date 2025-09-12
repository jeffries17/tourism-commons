import 'dotenv/config';
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
async function readMaster(sheetId, range = 'Master Assessment!A1:AD10000') {
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
    return list.filter(p => p.sector.toLowerCase().includes('tour'));
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
            const rows = await readMaster(requireEnv('SHEET_ID'));
            const all = parseParticipants(rows);
            res.json(filterTourOperators(all));
        }
        catch (e) {
            res.status(500).json({ error: e.message || String(e) });
        }
    });
    return app;
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
