## Digital Assessment Web App – Implementation Plan

### Goal
Deliver a production-ready dashboard and analysis web app that mirrors the Apps Script analyses in `digital_assessment/google_scripts`, powered by a Firebase Functions API reading from the Google Sheet.

### Priority (P1) – Participant & Tour dropdowns and Participant view parity
- [P1][x] Separate sources: `Participant` uses Master Assessment only; `Tour Operators` uses Tourism Assessment only.
- [P1][x] Populate dropdowns with loading states
  - Participant tab: dropdown of all stakeholders from Master; persists last selection.
  - Tour tab: dropdown of tour operators from Tourism; remains on `/tour`.
- [P1][x] Participant tab parity with Apps Script (Dashboard.html) – component checklist
  - [x] Evaluation header (name, sector, region, maturity) with KPI chips (External, Survey, Combined)
  - [x] Presence chips (Website, Facebook, Instagram, Tripadvisor, YouTube) with “not found” state and links
  - [x] External Assessment vs Sector comparison chart (normalized to maxima 18/12/15/12/8/5)
  - [x] External Assessment category cards (scores, bars, sector avg)
  - [x] Opportunities (step‑up targets with actions, timeframe, cost, impact)
  - [x] Quick Wins (small high‑impact actions)
  - [x] Evidence & Justifications (collapsible list per category)
  - [x] Sector Context (priority area + 2–3 recommendations)

### Current State
- Google Sheet connectivity verified (CSV check) and backend Sheets client present.
- Functions API endpoints exist: `/health`, `/sectors`, `/participants`, `/tour-operators`, `/stats`.
- New analysierendpoints added and compiled:
  - `GET /dashboard`
  - `GET /participant/plan?name=...`
  - `GET /participant/justifications?name=...`
  - `GET /participant/presence?name=...`
  - `GET /participant/sector-context?name=...`
- Frontend wired to new endpoints and charts; Participant view parity implemented.

### Assumptions
- Sheet ID: `1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM`
- Local auth uses ADC or `GOOGLE_SERVICE_ACCOUNT_JSON` as single-line JSON if needed.

### Step-by-step Plan
1) Verify Functions API locally with emulators
   - Env from `digital_assessment/functions`:
     - `SHEET_ID=1yxzgYWme1xW9uMX3jSz6t9BFI-tdV14UVmPiDjW_XCM`
     - Auth Option A (ADC): `export GOOGLE_APPLICATION_CREDENTIALS=/Users/alexjeffries/tourism-commons/tourism-development-d620c-5c9db9e21301.json`
     - Auth Option B (inline JSON): `export GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'`
   - Start: `npm run build && npm run serve` in `digital_assessment/functions`
   - Emulator endpoints:
     - Functions: `http://127.0.0.1:5009/tourism-development-d620c/us-central1/api`
     - Hosting: `http://127.0.0.1:5012`
   - Test:
     - `curl -sS http://127.0.0.1:5012/api/health`
     - `curl -sS http://127.0.0.1:5012/api/dashboard | head -n 1`

2) Extend web API client to call new endpoints
   - Add functions for: dashboard, plan, justifications, presence, sector-context
   - Ensure `VITE_API_URL` override works in local dev

3) Overview UI – mirror dashboard.gs
   - Show totals, averages, maturity distribution, sector averages, category averages
   - Basic responsive cards + simple charts scaffolding

4) Participant UI – mirror getParticipantPlan and helpers
   - [P1] Dropdown for participant (Master only) with loading state and last‑selection persistence
   - Show profile, KPI chips, presence chips (links), external breakdown cards + sector avg, external vs sector chart
   - Opportunities, quick wins, evidence/justifications, sector context
   - Print/Save layout

5) Sector view – scaffolding for stacked maturity and comparisons
   - Use `/dashboard` sectorStacked + sector list

6) Integration tests and data validation guardrails
   - Handle empty/malformed rows gracefully (matching Apps Script safety)

7) Deploy to Firebase (Functions + Hosting)
   - Configure secret `SHEET_ID` and deploy
   - Sanity checks via `/api/health` and `/api/dashboard`

### Google Sheets connection checklist
- Service account JSON present (local): `/Users/alexjeffries/tourism-commons/tourism-development-d620c-5c9db9e21301.json`
- Sheets API enabled on the GCP project owning the service account
- The Google Sheet shared with the service account `client_email` as Viewer
- Emulator started with either `GOOGLE_APPLICATION_CREDENTIALS` or `GOOGLE_SERVICE_ACCOUNT_JSON`

### Next steps to start using live Google Sheet data
1) Wire Overview UI to `/api/dashboard`
   - Data shown: total, maturity distribution, category averages, sector averages.
   - Dev config: from `digital_assessment/app/web`, set `VITE_API_URL=http://localhost:5012` for Vite dev if needed; in emulator/hosting, `/api/*` is already rewritten.
   - Minimal errors surface (network/auth) with user-friendly message.

2) Wire Participant UI
   - Endpoints: `/api/participant/plan?name=...`, `/api/participant/justifications?name=...`, `/api/participant/presence?name=...`, `/api/participant/sector-context?name=...`.
   - UI: profile card, KPI chips, presence links, external breakdown cards + sector chart, quick wins, opportunities, justifications, sector context, print styles. [Completed]

3) Sector view scaffolding
   - Use `/api/dashboard` → `sectorStacked` and `sectors` arrays.
   - Display stacked maturity per sector and a sortable table of sector averages.

4) Local dev quality-of-life
   - Vite dev: create `.env.local` in `app/web` with `VITE_API_URL=http://localhost:5012` (optional if using Hosting emulator proxy).
   - Scripts: add `npm run dev:all` helper to start functions + web dev concurrently (optional).

5) Production readiness
   - Store secrets in Firebase:
     - `firebase functions:secrets:set SHEET_ID`
     - `firebase functions:secrets:set GOOGLE_SERVICE_ACCOUNT_JSON` (paste single-line JSON)
   - Deploy: `cd digital_assessment/functions && npm run deploy:all` (builds web, deploys hosting + functions per firebase.json).
   - Post-deploy checks:
     - Health: `https://<your-hosting-domain>/api/health`
     - Dashboard: `https://<your-hosting-domain>/api/dashboard`

6) Observability & safeguards
   - Add basic logging around Sheets calls (timings, range used, row counts).
   - Graceful fallbacks when rows are empty or columns missing.
   - Rate-limit client requests if needed (frontend debounce and backend caching window).

7) Optional enhancements
   - Cache layer (in-memory, 60–120s) to reduce Sheets API calls.
   - CSV-export endpoints for snapshots.
   - Feature flag for including Tourism tab when available.


### Risks & Mitigations
- Auth failures reading Sheets: prefer `GOOGLE_SERVICE_ACCOUNT_JSON`; fallback to ADC.
- Sheet schema drift: helpers use indexes; add guards and defaults.
- Emulator availability: if Firebase CLI not configured, run local express server fallback.

### Definition of Done
- All endpoints return expected JSON against the live sheet
- Frontend renders the analyses (overview + participant) without errors
- Deployed and accessible with Hosting rewrites to `/api/*`

### Participant, Sector, and Tour Tabs
- Participant
  - [P1] Dropdown populated from Master Assessment (with loading + persistence)
  - Profile, KPI chips, presence chips, external cards + chart
  - Quick wins, opportunities, evidence, sector context, print
- Sector
  - Metric selector (Combined, External, Survey)
  - Sector comparison chart and participant chips for selected sector
- Tour
  - [P1] Dropdown populated from Tourism Assessment (with loading)
  - Stays on `/tour` (no navigation)

Goal: Provide clear visibility into TripAdvisor presence across participants in The Gambia and surface it in the UI for quality and actionability.

### Sector Intelligence Dashboard - Implementation Plan

#### Goal
Transform the `/sector` tab into a powerful sector intelligence dashboard that drives real development outcomes through data-driven insights, benchmarking, and actionable recommendations.

#### Sector Comparison Logic
- **Creative Industries**: Compare only within creative industries sectors (exclude tour operators)
- **Tour Operators**: Compare against all sectors (creative industries + tour operators)

#### Priority Features (Top 5 - Immediate Implementation)

##### 1. Sector Performance Overview
- [ ] **Sector Health Scorecard**
  - Overall sector score (combined average) with trend indicators
  - Participation rate (completed assessments vs total stakeholders)
  - Maturity distribution (Absent/Emerging/Intermediate/Advanced/Expert)
  - Key performance indicators with visual progress bars
- [ ] **Sector Ranking & Benchmarking**
  - Sector ranking compared to other sectors
  - Sector vs. National Average comparison charts
  - Best performing sectors identification
- [ ] **Sector Leadership & Champions**
  - Top 3 performers in the sector with their scores
  - Sector champions who could mentor others
  - Success stories - what the leaders are doing right

##### 2. Competitive Analysis Dashboard
- [ ] **Cross-Sector Comparison Charts**
  - Radar chart showing sector strengths/weaknesses
  - Bar charts comparing sector averages across categories
  - Sector performance trends over time (if historical data available)
- [ ] **Sector-Specific Insights**
  - Common strengths across the sector
  - Shared challenges and barriers
  - Sector-specific recommendations based on patterns

##### 3. Actionable Intelligence & Recommendations
- [ ] **Sector-Wide Quick Wins**
  - High-impact, low-effort improvements for the entire sector
  - Sector-wide training needs identification
  - Resource allocation guidance for development organizations
- [ ] **Priority Areas for Improvement**
  - Category-specific improvement opportunities
  - Sector-wide intervention recommendations
  - Policy recommendations based on performance data

##### 4. Stakeholder Engagement & Collaboration
- [ ] **Peer Learning Opportunities**
  - Connect high performers with emerging ones
  - Identify complementary sectors for collaboration
  - Cross-sector learning opportunities
- [ ] **Progress Tracking & Motivation**
  - Sector progress tracking over time
  - Success celebration and achievement highlights
  - Peer pressure/competition elements ("Your sector is 15% behind Tourism Services")

##### 5. Advanced Analytics & Insights
- [ ] **Sector Performance Deep Dive**
  - Category-level performance analysis
  - Stakeholder distribution and engagement metrics
  - Sector-specific success factors identification
- [ ] **Development Impact Metrics**
  - ROI indicators for sector development programs
  - Evidence for funding requests
  - Strategic planning insights for policymakers

#### Additional Features (Future Implementation)

##### 6. Interactive Sector Explorer
- [ ] **Dynamic Filtering & Sorting**
  - Filter by maturity level, region, performance range
  - Sort by various metrics (score, participation, growth)
  - Search and filter stakeholders within sector
- [ ] **Detailed Sector Profiles**
  - Individual sector deep-dive pages
  - Historical performance tracking
  - Sector-specific recommendations and action plans

##### 7. Collaboration & Networking Tools
- [ ] **Sector Champion Network**
  - Identify and highlight sector leaders
  - Facilitate peer-to-peer learning
  - Mentorship program recommendations
- [ ] **Sector Events & Training**
  - Training needs analysis
  - Event recommendations based on sector gaps
  - Resource sharing platform

##### 8. Reporting & Export Features
- [ ] **Sector Reports Generation**
  - Automated sector performance reports
  - PDF export functionality
  - Customizable report templates
- [ ] **Data Export & Integration**
  - CSV export for further analysis
  - API endpoints for external tools
  - Integration with other development platforms

#### Technical Implementation Requirements

##### Backend API Endpoints
- [ ] `GET /sector/overview?name={sector}` - Sector health overview
- [ ] `GET /sector/ranking?type={creative|all}` - Sector ranking and benchmarking
- [ ] `GET /sector/leaders?name={sector}` - Top performers and champions
- [ ] `GET /sector/comparison?name={sector}&compare={other_sectors}` - Cross-sector comparison
- [ ] `GET /sector/insights?name={sector}` - Sector-specific insights and recommendations
- [ ] `GET /sector/quick-wins?name={sector}` - Sector-wide quick wins
- [ ] `GET /sector/progress?name={sector}` - Progress tracking over time

##### Frontend Components
- [ ] **SectorOverviewCard** - Health scorecard with key metrics
- [ ] **SectorRankingChart** - Competitive benchmarking visualization
- [ ] **SectorLeadersList** - Top performers and champions display
- [ ] **SectorComparisonRadar** - Strengths/weaknesses radar chart
- [ ] **SectorInsightsPanel** - Actionable recommendations
- [ ] **SectorProgressChart** - Performance trends over time
- [ ] **SectorQuickWinsList** - High-impact improvement opportunities

##### Data Processing Logic
- [ ] **Sector Filtering Logic** - Separate creative industries vs all sectors
- [ ] **Performance Calculations** - Sector averages, rankings, trends
- [ ] **Insight Generation** - Pattern recognition and recommendation engine
- [ ] **Champion Identification** - Top performer detection and highlighting

#### Success Metrics
- [ ] **User Engagement** - Time spent on sector tab, return visits
- [ ] **Actionability** - Users taking recommended actions
- [ ] **Sector Improvement** - Measurable sector performance improvements
- [ ] **Stakeholder Satisfaction** - Feedback on usefulness and clarity
- [ ] **Development Impact** - Evidence of sector development outcomes

#### Implementation Timeline
- **Phase 1 (Week 1-2)**: Core sector overview and ranking features
- **Phase 2 (Week 3-4)**: Competitive analysis and insights
- **Phase 3 (Week 5-6)**: Actionable intelligence and recommendations
- **Phase 4 (Week 7-8)**: Advanced analytics and stakeholder engagement
- **Phase 5 (Week 9-10)**: Reporting, export, and collaboration features


