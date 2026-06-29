# Day 2 Build Brief — Gambia Institutional Capacity Workshop

For use at the start of a new Claude Code session to build `day2-presentation.html`.

---

## What exists

- `workshop/day1-presentation.html` — 48 slides (0–47), fully built, JS correct
- `workshop/day1-facilitator-notes.html` — complete, printable
- `workshop/working-outline.md` — master content reference; Day 2 blocks are fully written (Friday section, from line ~665)
- `workshop/img/` — photo and screenshot library (see below)

---

## What to build

**File:** `workshop/day2-presentation.html`

**Session:** Friday, 8:30–13:00 · 4.5 hours

| Time | Block | Slides (est.) |
|---|---|---|
| 8:30–9:00 | Friday Opening | ~4 |
| 9:00–10:30 | Block 4: Track + Coordinate | ~15 |
| 10:30–10:45 | Break | — |
| 10:45–12:45 | Block 5: Commitments | ~12 |
| 12:45–13:00 | Close | ~3 |
| **Total** | | **~34 slides** |

---

## Design system — copy exactly from Day 1

### CSS root tokens
```css
:root {
  --pink:    #E6007E;
  --navy:    #1A2B4A;
  --text:    #3D3D3D;
  --muted:   #7A7A7A;
  --surface: #F4F4F4;
  --accent:  #0091D4;
  --bg:      #ffffff;
  --bdr:     #E2E2E2;
}
```

### Typography
- Font: `'Inter'` via Google Fonts (`wght@400;600;700;800`)
- Body: 15px, line-height 1.65
- Headlines: `font-size: clamp(1.6rem, 3.5vw, 2.4rem)`, weight 800, color `--navy`
- Body copy: `font-size: clamp(.92rem, 1.6vw, 1.05rem)`, color `--text`

### Layout rules (from Day 1 design brief)
- `--pink` highlights **ONE** element per slide, never more
- Every slide needs a graphic element (chart, stat callout, image, grid, or diagram)
- Left-align all bullets; no centred body text except pull quotes
- No text-only slides
- Avoid small text — if content doesn't fit, split into two slides

### Slide architecture
- Each slide = `<section data-s="N">` with `class="bg-surface"` for grey-bg slides or no extra class for white
- Photo slides = `<section class="photo-section" data-s="N">` with a CSS background-image
- Cover = `<section class="cover" data-s="0">`
- Section dividers = dark navy background (`background: var(--navy); color: #fff`)

### JavaScript pattern
```javascript
const secs = document.querySelectorAll('section');
const total = secs.length;
const SB_ACTIVE = [ /* [from, to] per sidebar item */ ];
```
Sidebar items: `<div class="sb-item" onclick="go(N)">` — each item highlighted across a slide range.

### Component classes used in Day 1 (copy the CSS, reuse as needed)
- `.browser-mock` / `.browser-bar` / `.browser-dots` — screenshot in browser chrome
- `.before-after` / `.ba-before` / `.ba-after` — before/after split
- `.kpi-table` / `.kpi-col-target` — data table with pink target column
- `.briefing-mock` / `.briefing-header` / `.briefing-section` — sample briefing
- `.tier-table` / `.tier-row` — 3-tier layout (govt / creative / operations)
- `.cat-tiles` / `.cat-tile` — map the room category tiles
- `.board-cols` / `.board-col` / `.bc-green` `.bc-amber` `.bc-red` — commitment board
- `.grid-2` — two-column grid
- `.stat-hero` — big stat callout
- `.card-grid` — 4-card L6 layout
- `.steps` / `.step` / `.step-num` — L10 3-step

---

## Image library — `workshop/img/`

### Photos (for `photo-section` or `content+image` layouts)
| File | Subject | Good for |
|---|---|---|
| `aboodi-vesakaran.jpg` | Gambian flag (aerial/detail) | Day 2 cover, national identity slides |
| `ben-tatlow.jpg` | Stormy dramatic sunset | Used on Day 1 slide 2 — avoid reuse |
| `dan-roizer.jpg` | Aerial mangroves/river delta | Used on Day 1 slide 23 — avoid reuse |
| `robert-bye.jpg` | Thatched shelter beach sunset | Used on Day 1 slide 44 — avoid reuse |
| `the-gambia-9VbmW5bEbp0.jpg` | River pirogue on calm river | Used on Day 1 slide 36 — avoid reuse |
| `the-gambia-pfivvKSHE18.jpg` | Empty white sand beach with palms | Available — good for tracking/momentum slides |
| `the-gambia-YBRTHVDB4bQ.jpg` | Aerial resort hotel complex | Available — good for coordination/systemic slides |
| `wim-van-t-einde.jpg` | Beach with sea wall, reflective water | Used on Day 1 slide 47 — avoid reuse |

Best available for Day 2: `aboodi-vesakaran.jpg` (cover), `the-gambia-pfivvKSHE18.jpg`, `the-gambia-YBRTHVDB4bQ.jpg`

### Screenshots (for browser-mock frames)
| File | Content | Day 2 use |
|---|---|---|
| `google_alert_visit_gambia.png` | Google Alerts setup | Can reuse briefly in Block 4 if revisiting monitoring |
| `tripadvisor_gambia_top9.png` | TripAdvisor top 9 | Block 4 tracking demo if needed |
| `visit_the_gambia_homepage.png` | visitthegambia.com homepage | Block 5 commitments — what GT Board could build |
| `whatsapp_catalog.png` | WhatsApp Business catalogue | Block 5 — findability commitments |
| `responsible_travel_gambia_guide.png` | Responsible Travel sidebar | Already used in Day 1 — avoid reuse |
| `visit_gambia_blog_part1.png` / `_part2.png` | Travel blog | Already used in Day 1 — avoid reuse |
| `google_business_gorilla_neighbour.png` | Google Business Profile | Already used in Day 1 — avoid reuse |

---

## Day 2 content — key slides to build

### Friday Opening (~4 slides, 8:30–9:00)
1. **Cover** (L1): "Day 2 of 2 · Tracking Progress & Institutional Coordination · ITC YEP · Banjul · May 2026" — use `aboodi-vesakaran.jpg`
2. **What we agreed yesterday** (L3): Recap of Day 1 commitment board themes — 4 theme chips (Monitor / Make findable / Open a door / Share + coordinate). Note: populated live based on yesterday's cards. The slide should show the four categories as visual chips/labels, not a list of specific commitments.
3. **Arc of today** (L3 or L10): "Yesterday: what exists and what you can do. Today: how you know it's working, and what you agree to do together." Pink accent on "together."

### Block 4 — Track + Coordinate (~15 slides, 9:00–10:30)
Key slides (see working-outline.md "BLOCK 4" section for full content):
- **Section divider** (L2 dark navy): "Block 4 · Tracking and Coordination"
- **Pull quote** (L7 navy bg): *"Routine beats sophistication."* — "The goal is awareness, not analysis. Three questions. Monthly. Shared."
- **Three monitoring questions** (L10 3-step): Are we being found? Are visitors having the right experience? Are things improving over time?
- **Quarterly operator catalogue check** (L3): what to check, how long it takes, what to record
- **Monthly TripAdvisor review scan** (L3): 20 reviews, 4 things to look for, 1 hour/month
- **Annual benchmarking snapshot** (L3): D1 dimensions as the checklist; Year 1 baseline is already done
- **KPI starting set** (data table with pink target column, same as Day 1 slide 29 but now as a tracking slide): D2 Table 20
- **Monitoring as coordination** (L3): shared monitoring → shared picture → shared action. The quarterly call.
- **Quarterly coordination call** (L10 3-step): Share → Identify → Agree
- **Who convenes?** (L3 or tier-table variant): GT Board leads, NCAC + associations participate, Ministry invited
- **Activity: Draft your three indicators** (L9 exercise): each institution drafts 3 indicators + responsible person + sharing channel

### Block 5 — Commitments (~12 slides, 10:45–12:45)
Key slides (see working-outline.md "BLOCK 5" section for full content):
- **Section divider** (L2): "Block 5 · Commitments and Coordination"
- **Facilitator synthesis** (L3 with space for live notes): 3–4 themes from across the two days — leave visual space for the facilitator to add themes dynamically. Could be a slide with 3 large empty-ish cards.
- **One thing that stuck** (L7 pull quote style): prompt slide — "In one sentence: the finding or idea that was most useful or most surprising." Round-table, no extended discussion.
- **One concrete action in 30 days** (L9 exercise): Revisit yesterday's commitment board. Same four categories. Specific + checkable + realistic.
- **Where does coordination amplify?** (L3 discussion): Look at the board — where would two institutions doing it together produce more than two doing it separately? Give 1–2 examples as prompts.
- **Minimum viable mechanism** (L10 3-step pink on Step 1): Quarterly check-in → Each shares what observed → Agree any joint responses
- **If there's appetite for more** (L3 discussion prompts): 3 questions to agree before leaving. Before leaving the room, agree: date / convener / format.
- **Close: One word round the room** (L9 exercise): brief, personal close

### Close (~3 slides, 12:45–13:00)
- **Pull quote** (L7 dark navy): *"Maintain momentum. Don't start something new."* — sub: "The SMEs you met this week are building their digital presence. The infrastructure they need to connect to the world is what you build next."
- **One word round the room** (L9 exercise): "One word: what are you taking away?"
- **Thank you** (L1 close variant): Contact for follow-up. ITC YEP logo/badge.

---

## Design notes from Alex (accumulated across the project)

1. **Not too text-heavy, not small text.** If a slide is getting crowded, add a slide rather than compress. Better to have more slides with less on each.
2. **Visuals over bullet points.** If there's an opportunity to show something (a screenshot, a real page, a chart), use it instead of a text point. The audience should see how they too can participate.
3. **Facilitator NB boxes go in the separate notes doc, not the presentation.** The presentation is what gets projected — keep it clean.
4. **Carousel pattern** (two sequential slides for a two-step activity) works well and should be used for Block 5 activities that have individual → group steps.
5. **One pink element per slide.** Restraint is the rule. The pink draws the eye to what matters most on that slide.
6. **Activity slides** (L9) should be clean and spacious — the instruction text should be legible at distance. Use large font and generous padding.
7. **The commitment board** (board-cols with green/amber/red top borders) worked well in Day 1 — reuse the pattern for the Day 2 commitments board.
8. **Day 2 has one block** that is genuinely open (facilitator synthesis, slide B5-1). Don't try to prescribe the content — build a visually spacious slide with a framework structure that the facilitator fills in live. Think: 3 large card shapes with blank interiors and just a category label.

---

## What Day 2 should feel like

Day 1 was evidence and tools — structured, data-heavy, some new skills. Day 2 is reflection and commitment — slower, more conversational, the facilitator's role is prompting and synthesising rather than presenting. The slide design should reflect this: fewer dense slides, more spacious exercise layouts, more pull-quote moments. The final 90 minutes (Block 5) should feel like a working session, not a presentation.

If the slide count pushes above 38, consider whether a slide is presenting content that should instead be facilitated conversation. Day 2 leans toward the latter.
