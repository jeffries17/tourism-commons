# Tourism Commons — Repo Refactor Checklist

**Goal:** One logical home per concern. All client dashboards in `projects/`. All generic tools in `tools/`. Python pipeline in `pipeline/`. Firebase Functions at top-level `functions/`. No more fragile build script chain.

**Live URLs must not change** — only internal folder structure changes.

---

## Phase 1 — Python Pipeline (`digital_assessment/` → `pipeline/`)

Move the Python data processing scripts out of `digital_assessment/` into a top-level `pipeline/` folder. The React dashboards and Firebase Functions will move separately in later phases.

- [x] Create `pipeline/` at repo root
- [x] Move `digital_assessment/sentiment/` → `pipeline/sentiment/`
- [x] Move `digital_assessment/data_processing/` → `pipeline/data_processing/`
- [x] Move `digital_assessment/analysis/` → `pipeline/analysis/`
- [x] Move `digital_assessment/core/` → `pipeline/core/`
- [x] Move `digital_assessment/utilities/` → `pipeline/utilities/`
- [x] Move `digital_assessment/data/` → `pipeline/data/`
- [x] Move `digital_assessment/config/` → `pipeline/config/`
- [x] Move `digital_assessment/google_scripts/` → `pipeline/google_scripts/`
- [x] Move `digital_assessment/deliverables/` → `pipeline/deliverables/`
- [x] Move `digital_assessment/docs/` → `pipeline/docs/`
- [x] Move `digital_assessment/storage/` → `pipeline/storage/`
- [x] Move `digital_assessment/outputs/` → `pipeline/outputs/`
- [x] Move `digital_assessment/scripts/`, `shared/`, `archived/`, `hosting/` → `pipeline/`
- [x] Move `digital_assessment/requirements*.txt` and `README.md` → `pipeline/`
- [x] Delete empty `digital_assessment/dashboard/`
- [ ] Check any relative imports between pipeline scripts and update paths if needed

---

## Phase 2 — Client Dashboards into `projects/`

Consolidate `digital_assessment/projects/*` into the top-level `projects/` folder so all client deliverables live in one place. The existing `projects/` already has Colombia, Timorleste, Indian Ocean — they stay put.

- [x] Move `digital_assessment/projects/botswana/` → `projects/botswana/`
- [x] Move `digital_assessment/projects/benin/` → `projects/benin/` (replaced placeholder)
- [x] Move `digital_assessment/projects/gambia/` → `projects/gambia/`
- [x] Check `projects/botswana/dashboard/` for hardcoded `digital_assessment/...` paths — none found
- [x] Check `projects/benin/dashboard/` — fixed stale path in README.md only
- [x] Check `projects/gambia/` — no dashboard src yet, nothing to fix
- [x] Delete `digital_assessment/projects/` (now empty)

---

## Phase 3 — Firebase Functions to Top-Level

Move the API backend out of `digital_assessment/` to top-level `functions/` — it serves the whole platform, not just the assessment tool.

- [x] Move `digital_assessment/functions/` → `functions/`
- [x] Update `firebase.json`: `"source"` → `"functions"`
- [ ] Verify `functions/package.json` build/deploy scripts still work from new location
- [x] Check `functions/src/` for `digital_assessment/...` references — none found

---

## Phase 4 — Tools Cleanup

Minor renames to reduce nesting and inconsistency in `tools/`.

- [x] Flatten `tools/tourism-sentiment/frontend/` → `tools/sentiment/` (sibling files moved in too)
- [x] Rename `tools/tourism-instagram-index/` → `tools/instagram-index/`
- [ ] Check internal config/references inside moved tools if build fails

---

## Phase 5 — Build System Overhaul

Replace the fragile `cd && npm build && cp -r` chain in root `package.json` with a config-driven Node script.

- [x] Create `projects.json` at repo root:
  ```json
  {
    "tools": [
      { "id": "gambia-itc",                "type": "react",  "src": "tools/digital-assessment" },
      { "id": "sentiment-analysis",        "type": "react",  "src": "tools/sentiment" },
      { "id": "cbt-monitoring",            "type": "react",  "src": "tools/cbt-monitoring" },
      { "id": "tourism-instagram-index",   "type": "react",  "src": "tools/instagram-index" }
    ],
    "projects": [
      { "id": "botswana",     "type": "react",  "src": "projects/botswana/dashboard" },
      { "id": "benin",        "type": "react",  "src": "projects/benin/dashboard" },
      { "id": "colombia",     "type": "static-file",   "src": "projects/colombia/trecc-innovation-proposal.html", "dest": "colombia/index.html" },
      { "id": "timorleste",   "type": "static-dir",    "src": "projects/timorleste/findings" },
      { "id": "indian-ocean", "type": "static-dir",    "src": "projects/indian-ocean" }
    ]
  }
  ```
- [x] Create `scripts/build.js` — reads `projects.json`, builds React apps, copies static files to `build/`
- [x] Update root `package.json` build script to: `"build": "node scripts/build.js"`
- [x] `build:website` step integrated into `scripts/build.js`
- [ ] Test: `npm run build` populates `build/` correctly for all entries

---

## Phase 6 — Firebase Config Cleanup

- [x] Update `functions.source` path (done in Phase 3)
- [x] Remove dead rewrite: `/benin-sentiment` → `/gambia-itc/index.html`
- [x] Review and reorder all rewrites (API first, then SPAs, then static pages, then catch-all)
- [x] Fix misplaced `cleanUrls`/`trailingSlash` indentation (were outside hosting block)
- [ ] Add `/benin/**` rewrite when Benin dashboard is deployed

---

## Phase 7 — Verify & Deploy

- [x] `npm run build` — all 8 entries built without errors ✓
- [ ] `firebase deploy --only hosting` — deploy when ready
- [ ] Check live URLs after deploy:
  - [ ] `/` — landing page loads
  - [ ] `/botswana` — Botswana dashboard loads
  - [ ] `/gambia-itc` — Gambia dashboard loads
  - [ ] `/sentiment-analysis` — Sentiment tool loads
  - [ ] `/cbt-monitoring` — CBT monitoring loads
  - [ ] `/tourism-instagram-index` — Instagram index loads
  - [ ] `/colombia` — Colombia proposal loads
  - [ ] `/timorleste` — Timorleste findings load
- [ ] `firebase deploy --only functions` — API deploys from new `functions/` path
- [ ] Hit `/api/health` — Cloud Functions are live
- [x] `digital_assessment/` deleted — gone ✓
- [ ] Optional: clean up stale files at `build/` root (old JSON data files, backup folder)

---

## Notes

- Do phases in order — later phases reference paths established by earlier ones
- Commit after each phase so it's easy to roll back if something breaks
- The `build/` directory is generated — don't commit it
- Python relative imports between pipeline scripts may need path updates (check `import` statements that reference sibling folders)
