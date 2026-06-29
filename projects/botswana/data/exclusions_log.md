# Botswana Stakeholder Exclusions Log

**Purpose:** Transparency record of operators excluded from the analysis, with the reason for each exclusion. Available for client review on request.

**Total scraped:** 74 stakeholders
**Included in analysis:** 60
**Excluded:** 14
**Data scope:** TripAdvisor reviews, March 2021 onwards

---

## Exclusion Method

Each scraped operator was scored for ecotourism and adventure tourism relevance by scanning all its TripAdvisor reviews for relevant keywords (wildlife, safari, game drive, mokoro, conservation, etc.). Operators were also checked for signals indicating non-ecotourism venues (shopping mall, casino, cinema, boutique, water park, etc.).

- **Score ≥ 0.15 + no exclusion signals** → Included
- **Score < 0.15 or exclusion signals present** → Excluded or flagged

---

## Excluded Operators

| Operator | Reviews | Avg Rating | Reason for Exclusion |
|---|---|---|---|
| Airport Junction | 2 | 5.0 | Shopping mall — no ecotourism/adventure content in reviews |
| Bahurutshe Cultural Village | 1 | 3.0 | Cultural heritage village — outside scope of ecotourism/adventure focus |
| Botswanacraft | 11 | 4.4 | Craft retail boutique — no ecotourism/adventure content |
| Gaborone Dam | 1 | 5.0 | Urban infrastructure site — no ecotourism/adventure content in reviews |
| Gantsi Craft | 1 | 5.0 | Craft shop — outside scope |
| Lentswe-la-Oodi Weavers | 1 | 5.0 | Craft cooperative/weavers — outside scope |
| Lion Park Resort | 5 | 3.6 | Water park and resort — recreational facility, not ecotourism/adventure |
| Motsana | 1 | 4.0 | No ecotourism or adventure content detected in reviews |
| National Assembly Building | 1 | 1.0 | Government/civic building — outside scope |
| National Museum | 3 | 3.0 | General museum — no wildlife or ecotourism content in reviews |
| Riverwalk Mall | 4 | 3.8 | Shopping mall with cinema — outside scope |
| Sri Balaji Temple | 1 | 5.0 | Religious/cultural site — outside scope |

---

## ⚠️ Flagged for Manual Review

Two operators were excluded by the algorithm but are likely **legitimate ecotourism operators** that should be added back. The exclusion was triggered by incidental use of flagged words in reviewer text (e.g. a reviewer describing the operator's "boutique" style, or mentioning a nearby shopping mall for context), not because the operator itself is a non-ecotourism venue.

| Operator | Reviews | Avg Rating | Eco/Adventure Score | Issue |
|---|---|---|---|---|
| **Steenbok Safari** | 4 | 4.5 | High (20 keyword hits: safari, Chobe, guide, crocodile, hippo, Big Five) | Excluded because the word "shopping mall" appeared in a review — likely a reviewer mentioning the nearby area, not the operator's activity |
| **Ultimate Africa Safaris** | 6 | 5.0 | Very high (59 keyword hits: safari, adventure, guide, game drive, Khwai, bush camp) | Excluded because the word "boutique" appeared in reviews — likely reviewers describing the operator's small-group/boutique style, not a retail boutique |

**Decision:** Both operators were manually reviewed and **reinstated** into the analysis. Final included count: **62 operators**.

---

*Generated: 2026-03-20*
*Methodology: keyword-based relevance scoring on TripAdvisor review text*
