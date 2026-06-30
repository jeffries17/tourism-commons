# Vercel Setup Guide

This document walks through deploying Tourism Commons to Vercel.

## Prerequisites

- Vercel account
- Custom domain: tourismcommons.org (DNS configured in Vercel dashboard)
- Node.js 18+

## Steps

### 1. Link Repository to Vercel

```bash
cd tourism-commons
vercel link
```

Follow the prompts:
- Create new project: **tourism-commons**
- Framework preset: **Next.js**
- Root directory: **app/**
- Build command: `npm run build` (Vercel will auto-detect)
- Output directory: `.next` (auto-detected)

### 2. Configure Environment Variables

In the Vercel dashboard (project settings → Environment Variables), add:

```
GAMBIA_PASSWORD=<password you control>
COLOMBIA_PASSWORD=<password you control>
INDIAN_OCEAN_PASSWORD=<password you control>
BOTSWANA_PASSWORD=<password you control>
BENIN_PASSWORD=<password you control>
TIMORLESTE_PASSWORD=<password you control>
```

These are the passwords you'll share with each project's client when they need access to protected content.

### 3. Connect Custom Domain

In Vercel dashboard:
1. Go to project settings → Domains
2. Add domain: **tourismcommons.org**
3. Follow DNS configuration (Vercel will provide CNAME/A records)
4. Update DNS at your registrar

### 4. Deploy

```bash
vercel deploy --prod
```

Or push to main branch — Vercel CI will auto-deploy.

## Architecture

```
Incoming request to tourismcommons.org
           ↓
Next.js App Router (app/)
           ↓
    Route handling:
    - / → Home page
    - /projects → Project listing
    - /projects/[country] → Dynamic project pages
    - /projects/[country]/unlock → Password entry
    - /api/unlock → Validation API
           ↓
    Rewrites to legacy routes:
    - /gambia-birdfair/* → /build/gambia-birdfair/*
    - /botswana/* → /build/botswana/*
    - etc. (during transition)
```

## Transition Timeline

### Phase 1 (Now)
- Next.js app serving `/`, `/projects`, `/tools`, `/resources`
- Rewrites keep old Firebase routes working (`/gambia-birdfair`, etc.)
- Old Firebase Hosting stays live as backup

### Phase 2 (After testing)
- Migrate static assets from `build/` to `public/`
- Migrate internal React SPAs from `tools/` to Next.js routes
- Decommission Firebase Hosting

### Phase 3 (Later)
- Supabase migration (Firebase → PostgreSQL)
- Full operator/itinerary content types
- API for destinations data

## Rollback

If issues occur:
1. Firebase Hosting is still active at the old URL
2. Update DNS to point back to Firebase (temporarily)
3. Vercel deployment can be rolled back in dashboard

## Notes

- `vercel.json` defines build/dev commands, env vars, and rewrites
- Root `package.json` uses npm workspaces (packages/ui, app)
- Build happens in `app/` only; `packages/ui` is bundled as dependency
- Public static assets go in `app/public/` (currently using `/build/` rewrites)
