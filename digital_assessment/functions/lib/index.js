import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { createApp } from './app.js';
const app = createApp();
export const api = onRequest({
    region: 'us-central1',
    cors: true,
    invoker: 'public',
    secrets: ['SHEET_ID', 'GOOGLE_SERVICE_ACCOUNT_JSON']
}, (req, res) => {
    logger.debug('Incoming request', { path: req.path, method: req.method });
    // Support Firebase Hosting rewrites that keep the /api prefix
    if (req.url === '/api')
        req.url = '/';
    else if (req.url.startsWith('/api/'))
        req.url = req.url.slice(4);
    return app(req, res);
});
