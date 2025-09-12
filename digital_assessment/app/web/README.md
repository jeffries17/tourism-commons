# Digital Assessment Web App

Development

1. Copy `.env.sample` to `.env` and set `VITE_API_URL` if using local API.
2. Start local API: `cd ../../functions && npm run build && npx functions-framework` or use Firebase emulator: `npm run serve` in `functions`.
3. Start web: `npm run dev`.

Environment

Create `.env` in this folder with:

```
VITE_API_URL=http://localhost:8787
```

If deploying to Firebase, the web app will call the Functions rewrite at `/api/*` automatically.
