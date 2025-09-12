Digital Assessment API

A minimal Express + TypeScript API that reads your Google Sheet and exposes:

- GET /health
- GET /sectors
- GET /participants?sector=Art
- GET /tour-operators

Setup

1. Create a Google Cloud service account with Sheets API access.
2. Share your Google Sheet with the service account email (viewer is fine).
3. Copy your Sheet ID (the long ID in the URL).
4. Create `.env` in this folder with:

PORT=8787
SHEET_ID=your_google_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n","client_email":"...@...gserviceaccount.com","client_id":"...","token_uri":"https://oauth2.googleapis.com/token"}

Note the private key newlines must be escaped as `\n`.

Run

npm install
npm run dev

Then visit http://localhost:8787/health

