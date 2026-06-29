# Colombia Programme — Market Intelligence Process

## Purpose
Extract structured intelligence from CBI market potential (and later, market entry) documents for each of the 11 niches selected by the 30 programme participants. This intelligence:
- Informs the pitch translation exercise (Day 1, Bloque 2)
- Populates buyer cards and roleplay scenarios (Day 2, Bloque 2 & simulacro)
- Connects RTA responsible tourism indicators to what specific European markets actually value
- Supports weekly outreach preparation between sessions

---

## Niche Status — 11 Niches

| # | Niche | Market Potential | Market Entry | Notes |
|---|-------|-----------------|--------------|-------|
| 1 | Birdwatching | ✅ Available | ⏳ Pending Phase 3 | |
| 2 | Community-Based Tourism | ✅ Available | ⏳ Pending Phase 3 | |
| 3 | Cultural Tourism | ✅ Available | ⏳ Pending Phase 3 | |
| 4 | Ecotourism | ✅ Available | ⏳ Pending Phase 3 | |
| 5 | Food Tourism | ✅ Available | ⏳ Pending Phase 3 | |
| 6 | Nature Tourism | ✅ Available | ⏳ Pending Phase 3 | |
| 7 | Sun & Beach Tourism | ✅ Available | ⏳ Pending Phase 3 | |
| 8 | Urban Experiences | ✅ Available | ⏳ Pending Phase 3 | |
| 9 | Wellness Tourism | ✅ Available | ⏳ Pending Phase 3 | |
| 10 | Agritourism | ✅ Available | ⏳ Pending Phase 3 | Colombia coffee tour cited as CBI example |
| 11 | Adventure Tourism | ✅ Available | ⏳ Pending Phase 3 | Wiwa Tour Colombia cited as best-practice case |

---

## To-Do

### Phase 1 — Market Potential Extraction ✅
- [x] Confirm document structure (CBT pilot read — 30 pages, 4 sections)
- [x] Define extraction schema
- [x] Extract intelligence from all 11 market potential docs → `market-intelligence.md`
- [ ] Create buyer persona cards (3 types × priority niches) for Day 2 roleplay
- [ ] Create pitch translation worked examples per niche for Day 1, Bloque 2
- [x] Map RTA indicators to European market expectations per niche (cross-niche matrix added)

### Phase 2 — Missing Niches ✅
- [x] Download agritourism market potential PDF → `market-potential/agritourism.pdf` (2026-05-13)
- [x] Download adventure tourism market potential PDF → `market-potential/adventure_tourism_market_potential.pdf` (2026-05-13)
- [x] Extract and add both to `market-intelligence.md`

### Phase 3 — Market Entry Documents *(post-bootcamp, for Module 3 outreach)*
- [ ] Retrieve market entry docs for all 11 niches
  - URL pattern: `cbi.eu/market-information/tourism/[niche]/market-entry`
  - Note: server-side fetch blocked on cbi.eu — save locally as PDFs
- [ ] Extract from each: buyer company lists, trade fair calendar, certification requirements, channel recommendations
- [ ] Compile into outreach guide for Module 3 (June follow-up)
- [ ] Cross-reference companies with LinkedIn for targeted prospecting per participant

---

## Document Structure (CBI Market Potential — confirmed)

Every document follows this 4-section structure:
1. **Product description** — niche definition, experience types, consumer segmentation by age/motivation
2. **What makes Europe an interesting market** — outbound volumes, sustainability attitudes, recovery post-COVID
3. **Which European countries offer most opportunities** — Germany, UK, France, Netherlands, Spain, Sweden (each with spend, booking behavior, top decision factors)
4. **Which trends offer opportunities or pose threats** — niche-specific growth drivers and risks

Key limitation: these are analytical market intelligence docs, not buyer directories.
Company names appear only as illustrative examples (typically 2–4 per document).
→ Specific buyer lists come from market entry docs (Phase 3).

---

## Extraction Schema (applied to all niches)

Each niche entry in `market-intelligence.md` follows this structure:

1. Top European source markets (ranked, with stat + reason)
2. Primary consumer profile (segment, motivation, spend, booking/research behavior)
3. What this niche buyer specifically wants (4–6 criteria)
4. Companies mentioned (name, country, type)
5. Key trends — opportunities
6. Key trends — threats
7. Responsible tourism as selling point (how RT/sustainability adds value in this niche)
8. Colombia angle (where our operators fit naturally)
9. Key pitch language (phrases that resonate with European buyers)
