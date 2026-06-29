import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { initializeApp as initializeAdminApp } from 'firebase-admin/app';
import { createApp } from './app.js';
export { sendWeeklyReminders } from './cbtEmailReminders.js';
export { onQuizResultCreated } from './quiz-results.js';
// Initialize the Firebase Admin SDK once for all functions
initializeAdminApp();
const app = createApp();
export const api = onRequest({
    region: 'us-central1',
    cors: true,
    invoker: 'public',
    // Secrets only used in production, local dev uses .env.local
    ...(process.env.FUNCTIONS_EMULATOR
        ? {}
        : {
            secrets: [
                'SHEET_ID',
                'QUIZ_SHEET_ID',
                'GOOGLE_SERVICE_ACCOUNT_JSON',
                'GMAIL_USER',
                'GMAIL_APP_PASSWORD',
                'GOOGLE_SEARCH_API_KEY',
                'GOOGLE_SEARCH_CX',
                'ANTHROPIC_KEY',
            ],
        })
}, (req, res) => {
    logger.debug('Incoming request', { path: req.path, method: req.method });
    // Support Firebase Hosting rewrites that keep the /api prefix
    if (req.url === '/api')
        req.url = '/';
    else if (req.url.startsWith('/api/'))
        req.url = req.url.slice(4);
    return app(req, res);
});
