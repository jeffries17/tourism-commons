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
  const credentialsJson = requireEnv('GOOGLE_SERVICE_ACCOUNT_JSON');
  const creds = JSON.parse(credentialsJson);
  const auth = new google.auth.JWT(
    creds.client_email,
    undefined,
    creds.private_key,
    ['https://www.googleapis.com/auth/spreadsheets.readonly']
  );
  await auth.authorize();
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
  return list.filter(p => p.sector.toLowerCase().includes('tour'));
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.get('/sectors', async (_req: Request, res: Response) => {
  try {
    const rows = await readMaster(requireEnv('SHEET_ID'));
    const set = new Set<string>();
    rows.slice(1).forEach(r => { if ((r[0] || '').toString().trim()) set.add((r[1] || 'Unknown').toString()); });
    res.json(Array.from(set).sort());
  } catch (e: any) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

app.get('/participants', async (req: Request, res: Response) => {
  try {
    const sector = (req.query.sector || '').toString();
    const rows = await readMaster(requireEnv('SHEET_ID'));
    res.json(parseParticipants(rows, sector || undefined));
  } catch (e: any) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

app.get('/tour-operators', async (_req: Request, res: Response) => {
  try {
    const rows = await readMaster(requireEnv('SHEET_ID'));
    const all = parseParticipants(rows);
    res.json(filterTourOperators(all));
  } catch (e: any) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
