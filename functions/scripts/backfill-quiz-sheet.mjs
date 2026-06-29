/**
 * One-shot script: re-syncs all quiz_results Firestore docs to the Google Sheet.
 *
 * Auth strategy:
 *   - Firestore: signs in anonymously with the quiz's public API key
 *     (security rules allow read: if request.auth != null — anon auth satisfies this)
 *   - Sheets: uses the service account from GOOGLE_SERVICE_ACCOUNT_JSON
 *
 * Usage:
 *   GOOGLE_SERVICE_ACCOUNT_JSON='...' QUIZ_SHEET_ID='...' node functions/scripts/backfill-quiz-sheet.mjs
 */

import { google } from 'googleapis';

const FIRESTORE_API_KEY = 'AIzaSyD_oUwfnUATP48ah2K48AWSaNEYJLgoaW4';
const PROJECT_ID = 'tourism-development-d620c';
const COLLECTION = 'quiz_results';
const TAB = 'Resultados';
const HEADERS = [
    'Fecha y hora',
    'Operación',
    'Email',
    'Nicho principal (ES)',
    'Nicho principal (EN)',
    'Nicho secundario',
    'Modificador',
    'Frase de posicionamiento',
    'CBI URL',
    'Nivel documentación',
];

// ── validate env ──────────────────────────────────────────────────────────────

const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const sheetId = process.env.QUIZ_SHEET_ID;
if (!keyJson || !sheetId) {
    console.error('Set GOOGLE_SERVICE_ACCOUNT_JSON and QUIZ_SHEET_ID before running.');
    process.exit(1);
}
const creds = JSON.parse(keyJson);

// ── step 1: read all quiz_results from Firestore (rules: allow read: if true) ─

console.log('Fetching quiz_results from Firestore…');
const base = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION}`;
const allDocs = [];
let pageToken = null;

do {
    const sep = pageToken ? `&pageToken=${pageToken}` : '';
    const url = `${base}?key=${FIRESTORE_API_KEY}&pageSize=300${sep}`;
    const res = await fetch(url);
    const body = await res.json();
    if (body.error) {
        console.error('Firestore read error:', JSON.stringify(body.error));
        process.exit(1);
    }
    if (body.documents) allDocs.push(...body.documents);
    pageToken = body.nextPageToken ?? null;
} while (pageToken);

console.log(`  Found ${allDocs.length} documents`);

// ── step 3: parse documents ───────────────────────────────────────────────────

function field(doc, name) {
    const f = doc.fields?.[name];
    if (!f) return '';
    return f.stringValue ?? f.integerValue ?? f.doubleValue ?? f.booleanValue ?? '';
}

function savedAt(doc) {
    const f = doc.fields?.savedAt;
    if (!f) {
        // fall back to document create time from the name / metadata
        return doc.createTime ?? '';
    }
    // could be a timestampValue or stringValue
    return f.timestampValue ?? f.stringValue ?? '';
}

const parsed = allDocs.map(doc => ({
    savedAt: savedAt(doc),
    name: field(doc, 'name'),
    email: field(doc, 'email'),
    nicheMainEs: field(doc, 'nicheMainEs'),
    nicheMain: field(doc, 'nicheMain'),
    nicheSecondary: field(doc, 'nicheSecondary'),
    modifierEs: field(doc, 'modifierEs'),
    positioningPhrase: field(doc, 'positioningPhrase'),
    cbiUrl: field(doc, 'cbiUrl'),
    docLevel: field(doc, 'docLevel'),
    _raw: doc.fields, // keep for diagnostics
}));

parsed.sort((a, b) => a.savedAt.localeCompare(b.savedAt));

// ── step 4: write to Google Sheets ───────────────────────────────────────────

const auth = new google.auth.JWT(creds.client_email, undefined, creds.private_key, [
    'https://www.googleapis.com/auth/spreadsheets',
]);
await auth.authorize();
const sheets = google.sheets({ version: 'v4', auth });

console.log('Clearing existing data rows in sheet…');
await sheets.spreadsheets.values.clear({ spreadsheetId: sheetId, range: `${TAB}!A2:Z` });
await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${TAB}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [HEADERS] },
});

const rows = parsed.map(d => [
    d.savedAt, d.name, d.email, d.nicheMainEs, d.nicheMain,
    d.nicheSecondary, d.modifierEs, d.positioningPhrase, d.cbiUrl, d.docLevel,
]);

console.log(`Writing ${rows.length} rows…`);
await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${TAB}!A2`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: rows },
});

console.log('\nDone. Rows written:');
rows.forEach(r => console.log(`  ${String(r[0]).slice(0, 19)}  ${r[2]}  ${r[4]}`));
