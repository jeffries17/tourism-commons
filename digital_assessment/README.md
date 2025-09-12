# Digital Assessment (Firebase)

This is the migration of the Apps Script–based assessment into a deployable Firebase web app and API.

Structure

- `app/web`: React + Vite frontend
- `functions`: Firebase Functions (Express) API reading the master Google Sheet
- `firebase.json`: Firebase Hosting + Functions config (rewrites `/api/**`)

Local development

1. API: set env and start emulators

```
cd functions
npm i
export SHEET_ID=YOUR_SHEET_ID
# optional for local auth: export GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
npm run build
npm run serve
```

2. Web: start Vite dev server

```
cd app/web
npm i
# Optional: create .env with VITE_API_URL=http://localhost:8787
npm run dev
```

Open the web app at the printed Vite URL (usually http://localhost:5173). In production it will call the Functions API via `/api/*`.

Deploy

```
cd app/web && npm run build
cd ../../functions && npm run deploy:all
```

Notes

- Functions expect `SHEET_ID` to be configured as a secret in production: `firebase functions:secrets:set SHEET_ID`
- For local dev, plain env vars are sufficient.
