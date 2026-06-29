import { google } from 'googleapis';
const creds = JSON.parse(process.env.SA);
const auth = new google.auth.JWT(creds.client_email, undefined, creds.private_key, ['https://www.googleapis.com/auth/spreadsheets.readonly']);
await auth.authorize();
const sheets = google.sheets({ version: 'v4', auth });
const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SID,
    range: 'Resultados!A1:J100',
});
const [, ...rows] = res.data.values;
rows.forEach(r => console.log(`${(r[4] ?? '').padEnd(6)} | ${(r[6] ?? '').padEnd(32)} | ${r[7] ?? ''}`));
