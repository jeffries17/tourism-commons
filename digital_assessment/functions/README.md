# Digital Assessment API (Firebase Functions)

Local development

1. Install deps: `npm i`
2. Set env vars for emulator:

```
export SHEET_ID=YOUR_SHEET_ID
# Optional: service account JSON for local dev (single-line JSON)
# export GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

3. Build: `npm run build`
4. Emulate: `npm run serve`

Endpoints

- GET /api/health
- GET /api/sectors
- GET /api/participants?sector=...
- GET /api/tour-operators
- GET /api/stats

Deployment

- `npm run deploy` (functions only)
- `npm run deploy:all` (functions + hosting)
- Hosting rewrites forward `/api/**` to the `api` function.
