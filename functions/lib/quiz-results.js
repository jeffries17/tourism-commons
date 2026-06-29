import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import { google } from 'googleapis';
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
async function getSheetsWriteClient() {
    const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
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
export const onQuizResultCreated = onDocumentCreated({
    document: 'quiz_results/{docId}',
    region: 'us-central1',
    secrets: ['GOOGLE_SERVICE_ACCOUNT_JSON', 'QUIZ_SHEET_ID'],
}, async (event) => {
    const data = event.data?.data();
    if (!data)
        return;
    const sheetId = process.env.QUIZ_SHEET_ID;
    if (!sheetId) {
        logger.error('QUIZ_SHEET_ID secret not set');
        return;
    }
    const sheets = await getSheetsWriteClient();
    const tabName = 'Resultados';
    // Check if the sheet tab exists and has headers; add them if not
    try {
        const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
        const tabExists = meta.data.sheets?.some(s => s.properties?.title === tabName);
        if (!tabExists) {
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: sheetId,
                requestBody: {
                    requests: [{ addSheet: { properties: { title: tabName } } }],
                },
            });
            await sheets.spreadsheets.values.append({
                spreadsheetId: sheetId,
                range: `${tabName}!A1`,
                valueInputOption: 'RAW',
                requestBody: { values: [HEADERS] },
            });
        }
        else {
            // Check if row 1 is empty (no headers yet)
            const existing = await sheets.spreadsheets.values.get({
                spreadsheetId: sheetId,
                range: `${tabName}!A1`,
            });
            if (!existing.data.values?.length) {
                await sheets.spreadsheets.values.append({
                    spreadsheetId: sheetId,
                    range: `${tabName}!A1`,
                    valueInputOption: 'RAW',
                    requestBody: { values: [HEADERS] },
                });
            }
        }
    }
    catch (e) {
        logger.warn('Could not verify/create headers — proceeding anyway', e);
    }
    const savedAt = data.savedAt?.toDate?.()?.toISOString() ?? new Date().toISOString();
    const row = [
        savedAt,
        data.name ?? '',
        data.email ?? '',
        data.nicheMainEs ?? '',
        data.nicheMain ?? '',
        data.nicheSecondary ?? '',
        data.modifierEs ?? '',
        data.positioningPhrase ?? '',
        data.cbiUrl ?? '',
        data.docLevel ?? '',
    ];
    await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${tabName}!A1`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [row] },
    });
    logger.info('Quiz result written to sheet', { name: data.name, niche: data.nicheMain });
});
