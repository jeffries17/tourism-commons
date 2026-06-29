0) Principles that keep this credible

“Official” is a claim that must be evidenced (best evidence: the tourism website links to the Instagram account, and/or the Instagram profile links back to the tourism website).

Discovery can be automated; verification is partially human (at least early on).

Visitor data must store definitions + sources (year, arrivals vs stays, international vs total, source URL).

1) Data model (MVP for Firebase)
A) Destination record (core)

destination_name

destination_type (country / region / city / island)

country (for cities/regions)

languages (list)

population + population_year + population_source_url

B) Tourism authority record (what you’re really indexing)

official_website_url

website_confidence (0–100)

instagram_handle (or multiple handles with roles: national / city DMO / campaign)

instagram_url

followers + followers_last_checked

C) Visitor record

annual_visitors_value

visitor_year

visitor_metric_definition (arrivals / overnight stays / international only / total visitors, etc.)

visitor_source_url

D) Derived metrics (computed fields)

followers_per_capita

followers_per_annual_visitor

E) Evidence & QA fields (this makes it auditable)

evidence_urls (e.g., “tourism website social page”, “instagram profile link”)

verification_status (unverified / probable / verified)

review_notes

last_reviewed_by + last_reviewed_at

2) Discovery approach using Google search APIs (triangulation strategy)

You’ll get the best results by running multiple query templates per destination and scoring the combined evidence, rather than using one restrictive query.

A) Why Google’s Custom Search / Programmable Search approach

The Custom Search JSON API is designed for programmable web search (paid above free tier) and has daily quota constraints depending on setup. 
Google for Developers

If you were thinking about the Site Restricted JSON API, note Google states it ceased serving traffic on Jan 8, 2025, and they point people toward a transition path. 
Google for Developers

So: plan around the current “Programmable Search / Custom Search JSON API” world, not the deprecated site-restricted endpoint.

B) Query packs (run several per destination)

For each destination, run a “pack” like:

Pack 1: Official tourism website candidates

"<DEST>" tourism board official website

"<DEST>" tourism authority official site

Visit <DEST> official website

"<DEST>" DMO official website

site:.gov "<DEST>" tourism (helpful in some countries)

site:.org "<DEST>" tourism authority

Pack 2: Instagram candidates

"<DEST>" tourism instagram official

Visit <DEST> instagram

"<DEST>" tourism board instagram

"<DEST>" tourism authority instagram

Pack 3: “Link evidence” queries (gold standard)

site:<candidate_website_domain> instagram

site:instagram.com "<DEST>" "visit" "official" (lightly constrained)

You’re not looking for a single “right answer”—you’re building a candidate set with evidence.

C) Candidate scoring (simple and effective)

Assign points like:

+50 if the tourism website links to the Instagram (or vice versa)

+25 if the website domain looks institutional (gov, tourism authority, known DMO)

+15 if multiple independent query packs surface the same site/handle

+10 if the IG profile name/bio matches “official” language and the website brand

−20 if the handle appears to be a content creator / repost page / travel blog

Output per destination:

top 1–3 website candidates

top 1–3 Instagram candidates

a “best pair” recommendation + confidence score

3) Verification workflow (human-in-the-loop, lightweight)

Build a simple internal review screen that shows:

Destination name

Top website candidate + why it scored well (evidence links)

Top IG candidate + why it scored well

Buttons: Verify / Mark Probable / Reject / Add Alternative

Quick edit fields (handle, website, languages)

This is what lets you scale without letting the index become messy.

4) Followers: plan for reality (important)

Meta’s Instagram Basic Display API ended in 2024, and Meta steers developers toward the Instagram Graph API (business/creator contexts). 
Stack Overflow
+1

So for follower counts, your plan should assume:

Some destinations will be easiest to track because they’re business accounts and can be connected properly.

Others you may need to treat as “publicly observed metrics” refreshed periodically with a conservative approach and strong caching.

In the MVP, it’s okay if follower refresh is monthly and occasionally requires manual correction—what matters is the index structure + verification credibility.

5) Visitor data enrichment (with source links)

Visitor stats are the least standardized field, so make this explicit in your system:

Allow a destination to have multiple visitor series (international arrivals vs total visitors), but pick one “primary” series for the index.

Always store: year + metric definition + source URL (your suggested addition is exactly right).

6) Phasing plan (continent → refine → expand → cities)
Phase 1 — Prototype on one continent (2–4 weeks)

Scope: All countries in one continent (e.g., Africa).

Deliverables:

Data model in Firebase

Discovery pipeline running query packs per country

Review screen + verification statuses

Initial population ingestion

Visitor stats: start with “best available” for each country + source links

Compute the two derived metrics

Success criteria:

≥80% of countries have a verified website + IG handle pair

Clear handling for edge cases (multiple official accounts, ministries vs DMOs)

Phase 2 — Improve discovery accuracy (1–2 iterations)

Refinements based on what you see in Phase 1:

Expand query packs for multilingual contexts (French/Spanish/Portuguese/Arabic variants)

Improve scoring rules for countries with fragmented tourism entities

Add “multiple handles per destination” support (national + campaign)

Success criteria:

Reviewer time per country drops significantly (because candidates are better)

Phase 3 — Next continent(s) (repeatable factory)

Scope: add another continent, same workflow.

Deliverables:

Batch runs + review queue

A public Tourism Commons page that:

lists countries

shows followers, visitors, population, ratios, last updated

links to the visitor data source

Phase 4 — City layer within each country (the big expansion)

This is where you’ll want a structured approach:

4A) Start with capitals + top tourism cities

Use a seed list (capitals are easy; top tourism cities can be from reputable lists you choose)

Run the same discovery + verification method

4B) Then “tier 2” cities

Expand within-country using a consistent rule (population threshold, or tourism priority list)

4C) Handle account fragmentation
Cities often have:

city government accounts

DMO accounts

“VisitCity” campaign accounts
Your verification rubric is what keeps this consistent.

7) What the Tourism Commons “mini tool” page should do (MVP)

Public view:

Filter by destination type, continent, country

Show: website, IG, followers, population, visitors (year/definition), ratios

Display verification badge (verified/probable)

Link out to visitor source

Admin/reviewer view:

“Run discovery” (country batch)

Review queue

Overrides + notes

“Refresh followers” (batch) and show deltas

8) Working implementation checklist (living document)

This section is meant to be updated as work progresses. Use the checkboxes to track what’s done.

- [ ] **App scaffolding and wiring**
  - [x] Create a new Vite + React + TypeScript app under `tools/tourism-instagram-index/`
  - [x] Add `package.json`, `tsconfig` files, Tailwind/PostCSS config, and `vite.config.ts` (using `base: '/tourism-instagram-index/'`)
  - [x] Add an `index.html` with Tourism Commons meta/title and root div
  - [x] Wire the app into the root `package.json` `build:tools` script so it’s built and copied into `build/` like the other tools
  - [x] Add a Firebase Hosting rewrite so `/tourism-instagram-index/**` serves the built index page

- [ ] **Firebase & Firestore setup**
  - [x] Confirm usage of the existing `tourism-development-d620c` / `tourism-commons` Firebase project (same as other tools)
  - [x] Add a `firebase.ts` config in the frontend that reuses the existing project keys
  - [x] Define a `destinations` collection with fields: `id`, `name`, `type` (`country` | `city`), `country_code`, `continent`, `region`, `population`, `population_year`, `population_source_url`, `languages`
  - [x] Define a `tourismProfiles` (or similarly named) collection with fields: `destination_id`, `official_website_url`, `website_confidence`, `instagram_handle`, `instagram_url`, `followers`, `followers_last_checked`, `verification_status`, `evidence_urls`, `review_notes`, `last_reviewed_by`, `last_reviewed_at`
  - [x] Define a `visitorSeries` collection for visitor stats with fields: `destination_id`, `is_primary`, `annual_visitors_value`, `visitor_year`, `visitor_metric_definition`, `visitor_source_url`
  - [x] Decide whether to store `followers_per_capita` and `followers_per_annual_visitor` as materialized fields or compute them on read (decision: **materialize on `tourismProfiles` and recompute via backend when inputs change**)
  - [ ] Add any needed Firestore composite indexes for filters (e.g., `continent + type`, `country_code + type`, `size_bucket`)

- [ ] **Discovery & follower-refresh Cloud Functions**
  - [x] Extend the shared Cloud Functions module at `digital_assessment/functions` with new TypeScript logic for the Tourism Instagram Index (via `setupTiiRoutes` and `/tii/discovery`)
  - [x] Implement a “run discovery” HTTP endpoint (`POST /api/tii/discovery`) that:
    - [x] Accepts an optional list of destinations in the request body, and falls back to a small default set of European countries for early testing
    - [x] Uses the existing Google Programmable Search Engine + API key (via `GOOGLE_SEARCH_API_KEY` and `GOOGLE_SEARCH_CX` env vars)
    - [x] Executes the query packs from this doc to get candidate websites and Instagram accounts
    - [x] Applies a simple scoring heuristic based on domain patterns and “official” language (rubric v0; can be refined after testing)
    - [x] Writes top candidates + evidence into Firestore under `destinations` and `tourismProfiles` with `verification_status = 'unverified'`
  - [x] Implement a “refresh followers” HTTP endpoint (`POST /api/tii/refresh-followers`) that:
    - [x] Iterates over tourism profiles with an `instagramHandle` using a conservative batch size
    - [x] Uses Google Programmable Search snippets (e.g., “… 304K+ followers”) to extract approximate follower counts
    - [x] Updates `followers` and `followers_last_checked` on the corresponding `tourismProfiles` documents
  - [x] Implement visitor discovery + debugging endpoints:
    - [x] `POST /api/tii/visitor-discovery` to populate `visitorSeries` with a primary approximate series per destination (latest full year, filtered + sanity-checked)
    - [x] `POST /api/tii/visitor-debug` to inspect raw CSE snippets and parsed values for tuning
  - [x] Implement a temporary admin override endpoint:
    - [x] `POST /api/tii/admin/update-destination` to update `tourismProfiles` and primary `visitorSeries` for a destination from the admin UI
  - [ ] Add appropriate security/auth (admin-only) for these endpoints

- [ ] **Public index UI (DMO/marketer-facing)**
  - [x] Create a single public page with:
    - [x] Filters: continent + free-text search (destination / country code / handle); region, destination type, and size bucket still to come
    - [x] Sortable table columns: destination, country, continent, website, Instagram handle, followers, visitors (with year); verification status is only displayed on the admin view
    - [x] A short “Methodology & caveats” section explaining discovery, verification statuses, and limitations (current text is “very early draft”)
  - [x] Ensure the page is responsive and matches the general Tourism Commons visual style (typography, colors)

- [ ] **Admin/reviewer UI**
  - [x] Add an admin-only affordance under the same app
    - [x] Expose a dedicated `/admin` route (e.g., `/tourism-instagram-index/admin`) for the review dashboard (temporary auth model; will later reuse central `admin` role)
  - [ ] Implement a review queue listing destinations with unverified or probable profiles
  - [x] Build a per-destination detail view showing:
    - [x] Current website + editable field
    - [x] Current Instagram handle/URL + editable fields
    - [x] Followers + editable numeric field
    - [x] Primary visitor series fields: value, year, definition, source URL (all editable)
  - [x] Add actions/controls for verification status:
    - [x] Dropdown to mark profile as Unverified / Probable / Verified
  - [ ] Add controls to trigger “Run discovery” (for a region like Europe) and “Refresh followers” (batch), clearly marked as admin operations

- [ ] **Europe Phase 1 dataset**
  - [x] Prepare a seed list of all European countries using ISO country codes (country layer only for the first pass) inside the Cloud Functions module (`europeanCountries` in `tii-discovery.ts`)
  - [ ] Run the discovery + visitor + follower refresh functions for all European countries (countries only), e.g. via:
    - [ ] `POST /api/tii/run-europe-batch` to populate `destinations`, `tourismProfiles` (website + IG) and `visitorSeries`
    - [ ] `POST /api/tii/refresh-followers` to backfill follower counts for the new profiles
  - [ ] Complete initial admin review on a representative subset to validate quality and refine parsing/scoring
  - [x] Add at least a minimal visitor series entry for each tested country so far (primary series) with source URLs:
    - [x] Fully exercised for France, Spain, Italy, Germany, Greece, Portugal (mix of automatic parsing + manual overrides via admin)
  - [ ] After country layer is stable, define a capital city record for each country using the `country_code + city_slug` ID pattern and reuse the same discovery + review flow

- [ ] **Polish, documentation, and future phases**
  - [ ] Write a short README in this folder explaining the tool’s purpose, how to run it locally, and how to deploy
  - [ ] Document the verification rubric, discovery query packs, and any known edge cases in this file
  - [ ] Implement and surface derived metrics:
    - [ ] `followers_per_capita` (followers divided by resident population) to capture how intensively a destination’s social presence scales with its size
    - [ ] `followers_per_annual_visitor` (followers divided by primary visitor series) to approximate social reach per tourist
    - [ ] Expose these metrics as additional sortable columns once the underlying inputs (population and visitors) are populated for the majority of destinations
  - [ ] Add notes on how to extend to new continents (Phase 3) and city tiers (Phase 4) reusing the same pipeline
  - [ ] Revisit and update this checklist as steps are completed or the scope evolves