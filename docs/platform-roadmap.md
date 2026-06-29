# Tourism Commons — Platform Roadmap

**Version:** 0.1  
**Last updated:** June 2026  
**Status:** Planning

---

## Vision

Tourism Commons is an open platform that improves the visibility, accessibility and market readiness of community-based, specialist and emerging tourism experiences around the world.

Rather than acting as another OTA, Tourism Commons provides destinations, associations, guides and small tourism businesses with practical tools that make them easier to discover and promote. It serves as both a public resource for travellers and a development platform for tourism stakeholders.

---

## Core Principles

- **Visibility** — Help overlooked tourism experiences become discoverable
- **Simplicity** — Information should be easy to find. No hidden PDFs. No confusing websites.
- **Community** — Projects shouldn't rely entirely on us
- **Open** — Resources should be reusable by destinations, NGOs and tourism boards
- **Practical** — Every feature should solve a real problem encountered during consulting projects

---

## Current State (June 2026)

The repository has grown organically across multiple consulting projects. The stack is fragmented:

- **Hosting:** Firebase Hosting (single site, custom build script)
- **Frontend:** Mix of React/Vite SPAs, standalone HTML deliverables, static HTML directories
- **Backend:** Firebase Cloud Functions (Node/Express)
- **Build system:** Custom `scripts/build.js` + `projects.json` registry — assembles a `build/` output dir
- **Design system:** None — every project has its own styles
- **Platform:** No coherent public face — just a routing table

**Active projects:**

| Project | Type | URL | Status |
|---------|------|-----|--------|
| Gambia Birding / BirdFair | Static HTML | `/gambia-birdfair`, `/gambia-birdfair-toolkit` | Live |
| Gambia Workshop | Static HTML | (not deployed) | Local only |
| Colombia (TRECC) | Static HTML | `/colombia` | Live |
| Indian Ocean Blue Tourism | Static HTML | `/indian-ocean` | Live |
| Botswana | React dashboard | `/botswana` | Live |
| Benin | React dashboard | (not deployed) | Local only |
| Timor-Leste | Static HTML | `/timorleste` | Live |
| Digital Assessment / Gambia ITC | React SPA | `/gambia-itc` | Live |
| Sentiment Analysis | React SPA | `/sentiment-analysis` | Live |
| CBT Monitoring | React SPA | `/cbt-monitoring` | Live |
| Instagram Index | React SPA | `/tourism-instagram-index` | Live |

All client projects are **private** — content is protected, but each will have a public landing page.

---

## Target Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) |
| Hosting | Vercel |
| Components | shadcn/ui + shared Tailwind design system |
| Backend (near-term) | Firebase Functions (keep during transition) |
| Backend (long-term) | Supabase (PostgreSQL + Row-Level Security + Storage) |
| CMS | MDX for articles/docs; database-driven for operators/itineraries/destinations |
| Email | Resend (transactional) |
| Auth | Vercel Password Protection (V1); proper auth later |

---

## Build Order

### Step 1: Git Cleanup

The `digital_assessment/` directory was migrated in April 2026 (all content moved to `pipeline/`, `projects/`, `functions/`, `tools/`) but the deletions were never committed. ~750 files are showing as unstaged deletes.

```bash
git add -A
git commit -m "Remove digital_assessment/ — all content migrated to pipeline/, projects/, functions/, tools/"
```

### Step 2: Design System

Create `packages/ui/` as a shared component package.

**Brand tokens** (in `packages/ui/tailwind.config.ts`):
- Primary palette: earthy/natural — to be decided visually
- Typography: `Inter` (body) + one editorial display face (Fraunces or DM Serif)
- Accent: sky/water blue for links and highlights
- Neutral: slate grays for text hierarchy

**Core components to build:**
- `ProjectCard` — country, description, status badge, protected-link indicator
- `CountryHero` — full-width header with image, title, project summary
- `ProtectedLink` — padlock icon + visual treatment for restricted content
- `NavBar` + `Footer` — Tourism Commons branding
- `SectionGrid` — responsive card grid

**Files:**
```
packages/ui/
  components/
  lib/utils.ts
  tailwind.config.ts
  package.json  →  "name": "@tourism-commons/ui"
```

### Step 3: Next.js App

Create `app/` at the repo root (Next.js 15 App Router).

**Route structure:**
```
/                           Home — platform overview + featured destinations
/projects                   All projects (country cards)
/projects/[country]         Public landing page per project
/projects/[country]/unlock  Password entry for protected projects
/tools                      Links to internal SPAs
/resources                  Downloadable reports and guides
```

### Step 4: Project Registry

Create `content/projects/` with one JSON file per project. Structure:

```json
{
  "name": "The Gambia",
  "slug": "gambia",
  "status": "active",
  "year": 2026,
  "client": "ITC YEP",
  "summary": "Two-sentence public description of the work.",
  "themes": ["birding", "capacity building"],
  "protected": true,
  "links": [
    { "label": "BirdFair B2B Toolkit", "href": "/gambia-birdfair-toolkit", "protected": true },
    { "label": "BirdFair Prep Deck", "href": "/gambia-birdfair", "protected": true }
  ]
}
```

Public landing pages are always visible. Protected links require a project access token (shared with the client by email).

### Step 5: Protection Mechanism (V1)

Simple, no user accounts needed:
- Each protected project has a shared access token stored in an env var (e.g. `GAMBIA_ACCESS_TOKEN`)
- `app/middleware.ts` checks a session cookie on protected routes
- `app/projects/[country]/unlock/page.tsx` — password entry form
- `app/api/unlock/route.ts` — validates token, sets cookie

### Step 6: Vercel Setup

1. `vercel link` — link repo to Vercel project
2. Connect custom domain (DNS config in Vercel dashboard)
3. Add `vercel.json` with rewrites for existing static assets during transition:
   ```json
   {
     "rewrites": [
       { "source": "/gambia-birdfair", "destination": "/build/gambia-birdfair/index.html" },
       { "source": "/gambia-birdfair-toolkit/:path*", "destination": "/build/gambia-birdfair-toolkit/:path*" }
     ]
   }
   ```
4. Set environment variables: `NEXT_PUBLIC_SITE_URL`, per-project access tokens
5. Remove Firebase Hosting GitHub Actions workflows once Vercel CI is confirmed working

Firebase Functions (`/api/**`) remain active and are proxied via `vercel.json` rewrites until Supabase migration is planned.

---

## Folder Structure: Current → Target

### Current (messy)
```
tourism-commons/
├── build/                    ← Generated output (gitignored but committed)
├── docs/                     ← Mix of plans, guides, reports
├── firebase.json             ← Firebase Hosting config
├── .firebaserc               ← Firebase project pointer
├── firestore.rules           ← Firestore security rules
├── projects.json             ← Build registry (replaced by content/ later)
├── scripts/build.js          ← Custom build orchestrator (replaced by Next.js)
├── functions/                ← Firebase Cloud Functions
├── pipeline/                 ← Python data processing
├── projects/                 ← Client project files (6 countries)
├── tools/                    ← 4 internal React SPAs
├── website/                  ← Landing page (React Vite — replaced by app/)
└── .github/workflows/        ← Firebase deploy CI
```

### Target (simplified)
```
tourism-commons/
├── app/                      ← NEW: Next.js 15 platform
├── content/                  ← NEW: MDX/JSON project registry
│   └── projects/
├── packages/                 ← NEW: shared design system
│   └── ui/
├── public/                   ← Static assets (migrated from build/)
├── projects/                 ← Client project working files (unchanged)
├── pipeline/                 ← Python analysis pipeline (unchanged)
├── tools/                    ← Internal React tools (kept during transition)
├── functions/                ← Firebase Functions (kept during transition)
├── docs/                     ← Documentation (cleaned up)
├── vercel.json
├── package.json              ← Updated for monorepo (workspaces)
└── tsconfig.json
```

### What to remove as migration completes

| Item | When to remove |
|------|---------------|
| `build/` | After `public/` handles static assets + `.next/` handles app |
| `website/` | After Next.js `app/` is live and serving `/` |
| `scripts/build.js` | After Next.js deployment is confirmed working |
| `projects.json` | After `content/projects/` registry is live |
| `firebase.json` | After all routes migrate to Vercel |
| `.firebaserc` | Same as above |
| `firestore.rules` | After Supabase migration (or if Firestore isn't used in new stack) |
| `.github/workflows/firebase-*.yml` | After Vercel CI is active and confirmed |

---

## Project Pages: Public/Private Logic

Every country project gets:

1. **Public landing page** at `/projects/[country]` — always accessible
   - Project name, year, client, themes, brief description
   - Status (Active / Completed / Ongoing)
   - List of deliverables (visible but locked behind a padlock icon)

2. **Protected content** behind a simple password
   - Client-specific access token
   - Shared with the project client and relevant stakeholders

This allows Tourism Commons to demonstrate the scope and nature of work publicly, while protecting client-specific deliverables.

---

## Later Phases (Not This Sprint)

- Supabase migration (Firebase → PostgreSQL)
- Full operator / itinerary / destination content types
- Public submissions and community contributions
- Multilingual content (English first, then French, Spanish, Portuguese)
- AI itinerary assistant
- AI website / content audit tool
- Converting standalone HTML deliverables to Next.js pages
- Newsletter (Resend or Beehiiv)
- Public API for destination data
