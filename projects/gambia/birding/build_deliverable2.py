"""
Build Deliverable 2 Word document: Buyer and Stakeholder Mapping
Global Birdfair 2026 — Gambia Birdwatching Tourism / ITC EU YEP
"""
from docx import Document
from docx.shared import Pt, RGBColor, Inches, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import copy

doc = Document()

# ── Page margins ──────────────────────────────────────────────────────────────
for section in doc.sections:
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(2.5)
    section.right_margin = Cm(2.5)

# ── Style helpers ─────────────────────────────────────────────────────────────
def set_font(run, size=11, bold=False, color=None):
    run.font.name = 'Calibri'
    run.font.size = Pt(size)
    run.bold = bold
    if color:
        run.font.color.rgb = RGBColor(*color)

def add_heading(doc, text, level=1):
    p = doc.add_heading(text, level=level)
    for run in p.runs:
        run.font.name = 'Calibri'
        if level == 1:
            run.font.size = Pt(16)
            run.font.color.rgb = RGBColor(0x1F, 0x39, 0x64)  # ITC dark blue
        elif level == 2:
            run.font.size = Pt(13)
            run.font.color.rgb = RGBColor(0x1F, 0x39, 0x64)
        elif level == 3:
            run.font.size = Pt(11)
            run.font.color.rgb = RGBColor(0x1F, 0x39, 0x64)
    return p

def add_para(doc, text, bold_prefix=None, indent=False):
    p = doc.add_paragraph()
    if indent:
        p.paragraph_format.left_indent = Cm(0.8)
    if bold_prefix:
        r = p.add_run(bold_prefix + ' ')
        set_font(r, bold=True)
    r = p.add_run(text)
    set_font(r)
    p.paragraph_format.space_after = Pt(6)
    return p

def add_bullet(doc, text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    if bold_prefix:
        r = p.add_run(bold_prefix + ' ')
        set_font(r, bold=True)
    r = p.add_run(text)
    set_font(r)
    p.paragraph_format.space_after = Pt(3)
    return p

def shade_row(row, hex_color='D6E4F0'):
    for cell in row.cells:
        tc = cell._tc
        tcPr = tc.get_or_add_tcPr()
        shd = OxmlElement('w:shd')
        shd.set(qn('w:val'), 'clear')
        shd.set(qn('w:color'), 'auto')
        shd.set(qn('w:fill'), hex_color)
        tcPr.append(shd)

def style_table_cell(cell, text, bold=False, size=9, wrap=True):
    cell.text = ''
    p = cell.paragraphs[0]
    r = p.add_run(text)
    r.font.name = 'Calibri'
    r.font.size = Pt(size)
    r.bold = bold
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.space_before = Pt(2)
    cell.vertical_alignment = WD_ALIGN_VERTICAL.TOP

# ═══════════════════════════════════════════════════════════════════════════════
# TITLE PAGE
# ═══════════════════════════════════════════════════════════════════════════════
doc.add_paragraph()
doc.add_paragraph()

title_para = doc.add_paragraph()
title_para.alignment = WD_ALIGN_PARAGRAPH.LEFT
r = title_para.add_run('Buyer and Stakeholder Mapping')
r.font.name = 'Calibri'
r.font.size = Pt(22)
r.bold = True
r.font.color.rgb = RGBColor(0x1F, 0x39, 0x64)

sub_para = doc.add_paragraph()
r = sub_para.add_run('Global Birdfair 2026 — Gambia Birdwatching Tourism')
r.font.name = 'Calibri'
r.font.size = Pt(14)
r.font.color.rgb = RGBColor(0x1F, 0x39, 0x64)

doc.add_paragraph()
meta_para = doc.add_paragraph()
r = meta_para.add_run('Prepared for: ITC EU Youth Empowerment Project (YEP) – Tourism and Creative Industries, The Gambia\n')
r.font.name = 'Calibri'; r.font.size = Pt(10)
r = meta_para.add_run('Deliverable 2 — Buyer and Stakeholder Mapping\n')
r.font.name = 'Calibri'; r.font.size = Pt(10); r.bold = True
r = meta_para.add_run('May 2026\n')
r.font.name = 'Calibri'; r.font.size = Pt(10)

doc.add_page_break()

# ═══════════════════════════════════════════════════════════════════════════════
# TABLE OF CONTENTS
# ═══════════════════════════════════════════════════════════════════════════════
add_heading(doc, 'Table of Contents', level=2)
toc_items = [
    '1.  Introduction and Purpose',
    '2.  Market Segmentation Framework',
    '3.  Priority Stakeholder Shortlist',
    '4.  Broader Reference: Medium-Priority Exhibitors',
    '5.  Outreach and Engagement Recommendations',
    '6.  Engagement Priorities',
    '7.  Conclusion and Next Steps',
]
for item in toc_items:
    p = doc.add_paragraph(item)
    for run in p.runs:
        run.font.name = 'Calibri'
        run.font.size = Pt(11)
    p.paragraph_format.space_after = Pt(3)
doc.add_page_break()

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 1 — INTRODUCTION AND PURPOSE
# ═══════════════════════════════════════════════════════════════════════════════
add_heading(doc, '1.  Introduction and Purpose', level=2)

paras_s1 = [
    ("", "This report has been prepared as part of the International Trade Centre (ITC) EU Youth Empowerment Project (YEP) – Tourism and Creative Industries in The Gambia. It constitutes Deliverable 2 of the assignment: a buyer and stakeholder mapping to support Gambian birdwatching and nature tourism operators in preparing for targeted B2B engagement at Global Birdfair 2026, taking place in Rutland, United Kingdom, from 10 to 12 July 2026."),
    ("", "Global Birdfair is the world's largest birdwatching and nature tourism trade event. Each year it brings together specialist tour operators, conservation organisations, media, equipment brands, and birding enthusiasts from across the globe. For a destination such as The Gambia — which offers one of Africa's most accessible and species-rich birdwatching experiences — the fair represents a significant opportunity to reinforce existing trade relationships, introduce Gambian guide expertise to new buyers, and position The Gambia more prominently within the international specialist market."),
    ("", "The purpose of this mapping exercise is to provide ITC and the participating Gambian operators with a structured, evidence-based picture of the international buyers and stakeholders attending Birdfair 2026 who are most relevant for direct engagement. It builds directly on the findings of Deliverable 1, which assessed the readiness of four BWA guide representatives — Yaya Barry, Lamin Sidibeh, Fatounding Colley, and Pa Ousman Jallow — to engage with international buyers. That assessment found strong underlying product quality and extensive local expertise, while identifying the need to strengthen the collective visibility and structured B2B presentation of the BWA guide cohort ahead of the fair."),
    ("Methodology.", "The mapping was developed by reviewing the full confirmed exhibitor list for Global Birdfair 2026, comprising 227 registered organisations. Each exhibitor was reviewed against three criteria: confirmed or potential relevance to The Gambia as a destination; geographic and market-segment alignment; and strategic value as a conservation or institutional partner. Exhibitors were then classified into four segments and assigned a priority level. This report presents a shortlist of 14 priority organisations in Section 3, alongside a broader reference table of 15 additional medium-priority targets in Section 4. Key contact research for all 14 shortlist entries was conducted using publicly available sources including operator websites, LinkedIn profiles, company registers, and trade press."),
    ("Structure of this report.", "Section 2 explains the market segmentation framework used to organise the exhibitor database. Section 3 presents the priority shortlist with organisation profiles, key contacts, and engagement goals. Section 4 provides a broader reference table of medium-priority operators for wider fair-floor engagement. Section 5 sets out outreach and engagement recommendations, including pre-fair preparation steps and Gambia positioning themes. Section 6 summarises engagement priorities by tier. Section 7 provides conclusions and recommended next steps."),
]
for bold_prefix, text in paras_s1:
    add_para(doc, text, bold_prefix=bold_prefix if bold_prefix else None)

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 2 — MARKET SEGMENTATION FRAMEWORK
# ═══════════════════════════════════════════════════════════════════════════════
add_heading(doc, '2.  Market Segmentation Framework', level=2)

add_para(doc, "To support targeted and efficient engagement at Global Birdfair, all 227 confirmed exhibitors were reviewed and assigned to one of four segments. The segmentation is intended to reflect the nature of each organisation's relationship to The Gambia and the type of engagement that is realistic within the context of the fair.")

segments = [
    ("Existing Gambia Sellers", "are tour operators and nature tourism companies that already include confirmed Gambia departures in their current programme. These organisations represent the highest priority for engagement, as they are already committed to the destination. The objective in meeting them is to reinforce the existing relationship, introduce the collective BWA guide team, and ensure continuity of product quality and ground-level support for the coming season."),
    ("West Africa and Strategic Partners", "are organisations that either operate across the wider West Africa region or hold strategic institutional value as conservation bodies, data platforms, or membership organisations. These partners are not necessarily tour sellers, but their influence over the perception of The Gambia as a birding destination — through member communications, conservation publications, digital platforms, and certification — makes them high-priority contacts for relationship development."),
    ("International Birding and Nature Operators", "are specialist tour operators and nature travel companies that do not currently sell Gambia but operate in adjacent markets — typically East or Southern Africa, or other West African destinations. These represent the medium-term new business pipeline: operators who are already working with the target customer profile and who may be ready to consider adding a Gambia itinerary with the right introduction and support."),
    ("Other Stakeholders", "include optics and equipment brands, wildlife media organisations, academic publishers, and other entities that do not route tourists into destinations directly. These are long-term visibility contacts: building a relationship with a major optics brand or wildlife magazine does not produce bookings in the short term, but may generate editorial coverage, social media exposure, or endorsement that strengthens The Gambia's profile within the specialist birding community over time."),
]
for name, description in segments:
    add_para(doc, description, bold_prefix=name)

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 3 — PRIORITY STAKEHOLDER SHORTLIST
# ═══════════════════════════════════════════════════════════════════════════════
add_heading(doc, '3.  Priority Stakeholder Shortlist', level=2)

add_para(doc, "The following 14 organisations have been identified as the highest-priority contacts for structured engagement at Global Birdfair 2026. They are divided into two groups: Group A (Existing Gambia Sellers) and Group B (West Africa and Strategic Partners). Key contacts were sourced from public operator websites, LinkedIn profiles, company records, and trade press, and are accurate as of May 2026.")

add_para(doc, "Guide references used in the Engagement Goal column: Yaya Barry = BWA President | Lamin Sidibeh = BWA Adviser | Fatounding Colley = Birding Adventures Gambia | Pa Ousman Jallow = Pa Birding Tours.")

# ─── Group A ──────────────────────────────────────────────────────────────────
add_heading(doc, 'Group A — Existing Gambia Sellers (9 operators)', level=3)

group_a = [
    {
        'org': 'Naturetrek',
        'country': 'UK',
        'priority': 'High',
        'why': "The UK's largest wildlife and birding operator (700+ tours/year). Confirmed active Gambia seller with two distinct products: an 11/12-day River Gambia birding tour and a year-round monthly 'Gambia in Style' holiday from Mandina Lodges. The single most important UK trade buyer by volume of UK clients sent.",
        'contact': 'Barney Jones, Operations & Private Groups Mgr (Africa); barney@naturetrek.co.uk',
        'goal': 'Brief Africa product team on the BWA guide cohort; introduce Yaya Barry (BWA) and Fatounding Colley (Birding Adventures Gambia) as local specialists; explore co-marketing for the 2026/27 season.',
    },
    {
        'org': 'Oriole Birding Limited',
        'country': 'UK (Norfolk)',
        'priority': 'High',
        'why': 'Confirmed Gambia seller with two distinct products (7-day coastal tour; 4-centre upcountry itinerary featuring Egyptian Plover). Has run Gambia coastal tours for 15+ years — a core relationship with deep destination knowledge.',
        'contact': 'Ashley Saunders, Director & Tour Leader; info@oriolebirding.com',
        'goal': 'Confirm 2026/27 departure schedule; introduce Lamin Sidibeh (BWA founding member) and Fatounding Colley (Birding Adventures Gambia) as potential upcountry co-leaders; brief on new BWA guide cohort.',
    },
    {
        'org': 'Birdfinders',
        'country': 'UK',
        'priority': 'High',
        'why': 'Confirmed 15-day Gambia tour (Egyptian Plover, Martial Eagle, African Finfoot, Marakissa forest birding). Long-running annual departure with a loyal repeat-client base of committed UK birders.',
        'contact': 'Vaughan Ashby, Founder & Director; birdfinders@aol.co.uk',
        'goal': 'Introduce Pa Birding Tours (Pa Ousman Jallow) and Birding Adventures Gambia (Fatounding Colley) as BWA-affiliated specialist co-guiding options; confirm 2026/27 dates; explore upcountry extension.',
    },
    {
        'org': 'Limosa Holidays',
        'country': 'UK',
        'priority': 'High',
        'why': "One of the UK's longest-established specialist bird tour operators. Confirmed Gambia seller with guides who have led in The Gambia for many years. Now part of the same group as Wildwings — shared group-level commitment to Gambia.",
        'contact': 'Chris Collins, MD (Birds & Wildlife Ltd / Limosa group); tours@limosaholidays.co.uk (general)',
        'goal': 'Reconfirm ground supplier relationships; introduce Pa Ousman Jallow (Pa Birding Tours) as a BWA-licensed local specialist for future upcountry additions; align on 2026/27 departures.',
    },
    {
        'org': 'Heatherlea Birdwatching Ltd',
        'country': 'UK (Scotland)',
        'priority': 'High',
        'why': "35-year-old Scottish ATOL-licensed birding operator. Confirmed 11-day Gambia holiday across three centres covering mangroves, tidal estuaries, riverine forest and the West African forest edge. Complements Naturetrek's southern UK catchment with a Scottish/northern England audience.",
        'contact': 'Emma McBride, Managing Director; via heatherlea.co.uk enquiry form',
        'goal': 'Maintain product relationship; introduce Yaya Barry (BWA) and Fatounding Colley (Birding Adventures Gambia) as upcountry/Senegal extension options; brief on new BWA guide cohort.',
    },
    {
        'org': 'Wildlife Worldwide & The Travelling Naturalist',
        'country': 'UK',
        'priority': 'High',
        'why': "Sister brands under one roof both selling Gambia: Wildlife Worldwide's group tours and The Travelling Naturalist's 12-day 'Gambia & Senegal: Superb West African Birdwatching' (from £3,495 incl. flights). High-value relationship routing both serious birders and naturalist generalists into Gambia.",
        'contact': 'Dan Free, General Manager (LinkedIn); Nick Joynes, Director — contact via company',
        'goal': 'Meet product director to refresh ground supplier contacts; introduce BWA licensed guide team — Birding Adventures Gambia and Pa Birding Tours — as current BWA-affiliated ground options; offer fam-trip support.',
    },
    {
        'org': 'Rockjumper Birding Tours',
        'country': 'South Africa',
        'priority': 'High',
        'why': "One of the world's largest specialist birding tour operators. Confirmed 'Gambia & Senegal' set-departure in their Africa programme, reaching a global serious-birder market beyond the UK.",
        'contact': 'Keith Valentine, Managing Director; LinkedIn: linkedin.com/in/keith-valentine-61216b32',
        'goal': 'Meet Africa product manager to introduce Pa Birding Tours and Birding Adventures Gambia as BWA-affiliated ground partners; review service quality and align on 2026/27 departure support.',
    },
    {
        'org': 'Bluetail Birding',
        'country': 'UK',
        'priority': 'Medium',
        'why': 'Specialist small-group and custom operator with confirmed active Gambia & Senegal product (evidenced by UK/Europe Gambia surcharge in booking system). Smaller scale than Naturetrek/Birdfinders but a growing relationship.',
        'contact': 'TBC',
        'goal': 'Confirm 2026/27 Gambia departures; introduce Pa Birding Tours and BWA as local specialist ground partners for small-group and custom tour support.',
    },
    {
        'org': 'Eco Terra Adventures Limited',
        'country': 'UK',
        'priority': 'Medium',
        'why': "Confirmed 10-day reptile & amphibian holiday in The Gambia. Niche herpetology positioning diversifies Gambia's wildlife-tourism offer beyond birding — a complementary ground relationship to develop.",
        'contact': 'TBC',
        'goal': 'Discuss existing Gambia ground-supplier setup; explore birding cross-sell modules with Fatounding Colley (Birding Adventures Gambia) or Pa Ousman Jallow (Pa Birding Tours).',
    },
]

# Build table
headers_a = ['Organisation', 'Country / Priority', 'Why Relevant', 'Key Contact', 'Engagement Goal']
col_widths_a = [Cm(3), Cm(2.5), Cm(5), Cm(4), Cm(5)]

table_a = doc.add_table(rows=1, cols=5)
table_a.style = 'Table Grid'
table_a.alignment = WD_TABLE_ALIGNMENT.LEFT
hdr_cells = table_a.rows[0].cells
for i, h in enumerate(headers_a):
    style_table_cell(hdr_cells[i], h, bold=True, size=9)
    hdr_cells[i].width = col_widths_a[i]
shade_row(table_a.rows[0], 'D6E4F0')

for org in group_a:
    row = table_a.add_row()
    style_table_cell(row.cells[0], org['org'], bold=True, size=9)
    style_table_cell(row.cells[1], f"{org['country']}\n{org['priority']} priority", size=9)
    style_table_cell(row.cells[2], org['why'], size=9)
    style_table_cell(row.cells[3], org['contact'], size=9)
    style_table_cell(row.cells[4], org['goal'], size=9)
    for i, w in enumerate(col_widths_a):
        row.cells[i].width = w

doc.add_paragraph()

# ─── Group B ──────────────────────────────────────────────────────────────────
add_heading(doc, 'Group B — West Africa and Strategic Partners (5 organisations)', level=3)

group_b = [
    {
        'org': 'African Bird Club',
        'country': 'UK',
        'priority': 'High',
        'why': 'UK-registered charity (1,200 members in 70+ countries) with active Gambia engagement: funded projects include a Gambia bird ringing scheme and Common Nightingale tracking programme. Members are exactly the high-spend, specialist birding audience Gambia wants to attract.',
        'contact': 'Keith Betton, Chair; chairman@africanbirdclub.org. Solomon Jallow, Gambia Country Rep; gambia@africanbirdclub.org',
        'goal': "Coordinate on ABC's Gambia country page and conservation pipeline; invite ABC to feature the BWA guide team (Barry, Sidibeh, Colley, Jallow) in a member newsletter ahead of Birdfair; explore Gambia birding event endorsement.",
    },
    {
        'org': 'BirdLife International',
        'country': 'Belgium / Global',
        'priority': 'High',
        'why': "World's largest nature conservation partnership. West Africa partners include WABSA (Gambia's own national BirdLife partner, led by Yaya Barry). Runs flyway and seabird programmes covering the Gambia coast and inland wetlands — the strategic umbrella for pan-West Africa conservation positioning.",
        'contact': 'Tharcisse Ukizintambara, Head of Dakar Office (West Africa); BirdLife Dakar. Lamin Jobaate, WABSA Executive Director; info@wabsa.org',
        'goal': 'Coordinate with BirdLife Africa and WABSA on Atlantic Flyway storytelling; explore site-IBA tourism overlays that benefit BWA guides\' key sites (Abuko, Tanji, Kiang West, Bao Bolong).',
    },
    {
        'org': 'Cornell Lab of Ornithology — eBird & Merlin',
        'country': 'USA',
        'priority': 'High',
        'why': 'Operator of eBird (world\'s largest bird-monitoring dataset) and Merlin Bird ID — platforms used by virtually every international birder visiting Gambia. Accurate eBird hotspot data and Merlin pack coverage for Gambia directly determine whether international birders select the destination over competitors.',
        'contact': 'Ian Davies, eBird International Strategy Lead; ian.davies@cornell.edu',
        'goal': 'Discuss Gambia eBird hotspot accuracy and Merlin West Africa pack coverage; explore a Cornell Lab–BWA data-quality partnership linking BWA guides\' key sites to verified eBird hotspots.',
    },
    {
        'org': 'Ashanti African Tours Limited',
        'country': 'Ghana / West Africa',
        'priority': 'High',
        'why': "West Africa's dominant B2B incoming handler for birding and nature tours — over 90% of major international birding companies use their ground services across the region. No current Gambia product but geographically adjacent. Strategic to engage as a regional peer/coopetitor.",
        'contact': 'Janet Aggrey, MD/COO; info@ashantiafricantours.com',
        'goal': 'Open regional cooperation conversation; explore joint Gambia + Senegal + Ghana multi-country itinerary routing Birding Adventures Gambia and Pa Birding Tours as the Gambia ground leg.',
    },
    {
        'org': 'Birding the Islands Ltd',
        'country': 'UK',
        'priority': 'Medium',
        'why': 'Macaronesia specialist (Canary Islands, Madeira, Azores, Cape Verde). Cape Verde sits in the West African flyway and is a natural gateway pairing for a Gambia/Senegal mainland extension — a strong candidate for joint regional product development.',
        'contact': 'TBC',
        'goal': 'Explore Cape Verde + Gambia combined itinerary concept; introduce Fatounding Colley (Birding Adventures Gambia) and Pa Ousman Jallow (Pa Birding Tours) as specialist Gambia legs.',
    },
]

table_b = doc.add_table(rows=1, cols=5)
table_b.style = 'Table Grid'
table_b.alignment = WD_TABLE_ALIGNMENT.LEFT
hdr_cells_b = table_b.rows[0].cells
for i, h in enumerate(headers_a):
    style_table_cell(hdr_cells_b[i], h, bold=True, size=9)
    hdr_cells_b[i].width = col_widths_a[i]
shade_row(table_b.rows[0], 'D6E4F0')

for org in group_b:
    row = table_b.add_row()
    style_table_cell(row.cells[0], org['org'], bold=True, size=9)
    style_table_cell(row.cells[1], f"{org['country']}\n{org['priority']} priority", size=9)
    style_table_cell(row.cells[2], org['why'], size=9)
    style_table_cell(row.cells[3], org['contact'], size=9)
    style_table_cell(row.cells[4], org['goal'], size=9)
    for i, w in enumerate(col_widths_a):
        row.cells[i].width = w

doc.add_paragraph()

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 4 — BROADER REFERENCE TABLE
# ═══════════════════════════════════════════════════════════════════════════════
add_heading(doc, '4.  Broader Reference: Medium-Priority Exhibitors', level=2)

add_para(doc, "The following 15 organisations were classified as medium-priority in the exhibitor review. They are not included in the Section 3 shortlist but are recommended for opportunistic fair-floor engagement where time and capacity allow. All are specialist operators or relevant stakeholders attending Global Birdfair 2026, and all represent potential future interest in The Gambia as a destination or partner.")

section4_data = [
    ('2by2 Holidays', 'UK', 'International Birding & Nature Operator'),
    ('Birder.Travel (Sicklebill Safaris)', 'Australia (exhibiting from UK)', 'International Birding & Nature Operator'),
    ("Bird's Wildlife & Nature Tours", 'UK', 'International Birding & Nature Operator'),
    ('Birding Direct', 'UK', 'International Birding & Nature Operator'),
    ('Greentours Natural History Holidays', 'UK', 'International Birding & Nature Operator'),
    ('Reef and Rainforest Tours Ltd', 'UK', 'International Birding & Nature Operator'),
    ('Travel The Unknown', 'UK', 'International Birding & Nature Operator'),
    ('Wildfoot Travel', 'UK', 'International Birding & Nature Operator'),
    ('Wildwings Travel', 'UK', 'International Birding & Nature Operator'),
    ('Partnership for International Birding (PIB)', 'USA (Denver, CO)', 'International Birding & Nature Operator'),
    ('Tropical Birding', 'USA / global', 'International Birding & Nature Operator'),
    ('Southern Sky Adventures', 'USA', 'International Birding & Nature Operator'),
    ('Fauna & Flora', 'UK (Cambridge HQ)', 'Other Stakeholder'),
    ('Global Wildlife Fair (Asian Adventures)', 'India / online (listed US)', 'Other Stakeholder'),
    ('Princeton Nature (Princeton University Press)', 'USA', 'Other Stakeholder'),
]

table4 = doc.add_table(rows=1, cols=4)
table4.style = 'Table Grid'
table4.alignment = WD_TABLE_ALIGNMENT.LEFT
h4 = ['Organisation', 'Country', 'Segment', 'Priority']
col4_w = [Cm(5.5), Cm(4), Cm(6), Cm(2.5)]
for i, h in enumerate(h4):
    style_table_cell(table4.rows[0].cells[i], h, bold=True, size=9)
    table4.rows[0].cells[i].width = col4_w[i]
shade_row(table4.rows[0], 'D6E4F0')

for org, country, segment in section4_data:
    row = table4.add_row()
    style_table_cell(row.cells[0], org, bold=False, size=9)
    style_table_cell(row.cells[1], country, size=9)
    style_table_cell(row.cells[2], segment, size=9)
    style_table_cell(row.cells[3], 'Medium', size=9)
    for i, w in enumerate(col4_w):
        row.cells[i].width = w

doc.add_paragraph()
note_p = add_para(doc, "Note: Wildwings Travel is under the same ownership as Limosa Holidays (Birds & Wildlife Ltd). Group-level engagement through Chris Collins (Limosa MD) covers both brands. Partnership for International Birding (PIB) has prior confirmed Gambia/West Africa coverage in their Africa programme and represents a valuable US-market channel.")
note_p.runs[0].font.size = Pt(9)
note_p.runs[0].italic = True

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 5 — OUTREACH AND ENGAGEMENT RECOMMENDATIONS
# ═══════════════════════════════════════════════════════════════════════════════
add_heading(doc, '5.  Outreach and Engagement Recommendations', level=2)

add_heading(doc, '5.1  Pre-Fair Outreach Rationale', level=3)

pre_fair_paras = [
    "Direct engagement on the floor of Global Birdfair is most productive when it is preceded by at least some prior contact. Specialist operators and conservation professionals attend the fair with full schedules; arriving at a stand without prior introduction — particularly for a destination whose profile in the market may not yet be well established — risks being allocated only a brief, unfocused conversation. A structured pre-fair outreach process is therefore strongly recommended.",
    "The June 2026 Virtual Trade Fair, which precedes the Rutland event, represents the first and most important contact opportunity. This online event gives Gambian operators a structured format to introduce themselves to buyers before the in-person fair, establish name recognition, and request a follow-up meeting at Rutland. Operators should aim to participate in the virtual fair with a consistent collective presentation under the BWA banner, alongside individual operator identities where appropriate.",
    "For the ten to fifteen highest-priority contacts identified in this report, a structured pre-fair virtual outreach sequence is recommended, comprising a brief introductory email in late June, followed by a personalised message ahead of the fair. The framing for this outreach should position the four BWA-affiliated guides — Yaya Barry (BWA President), Lamin Sidibeh (BWA Adviser), Fatounding Colley (Birding Adventures Gambia), and Pa Ousman Jallow (Pa Birding Tours) — as a professional guide cohort with combined expertise across coastal, upcountry, and cross-border Senegal itineraries, rather than as individual operators competing for attention. The BWA website and the shared association identity should be the primary anchor for all outreach.",
]
for p in pre_fair_paras:
    add_para(doc, p)

add_heading(doc, '5.2  Gambia Positioning Themes', level=3)

add_para(doc, "For all pre-fair and at-fair communication, the following five positioning themes are recommended as the core of The Gambia's value proposition to international specialist buyers. These themes are grounded in the destination's genuine competitive strengths and reflect the type of information that specialist tour operators use when evaluating a new or existing ground partner.")

themes = [
    ("Accessible West African birding.", "The Gambia is one of the most convenient African destinations for UK and European birders. Direct flights from major UK airports reach Banjul in approximately six hours, no visa is required for UK passport holders, and the compact geography of the country means that top birding sites — from coastal scrub at Fajara and Kotu to riverine forest at Abuko and Marakissa, and Sahel woodland further upcountry — are accessible within short driving distances. For operators building West African itineraries, The Gambia represents a low-friction entry point."),
    ("Winter-sun birding season.", "The Gambia's peak birdwatching season (November to February) coincides precisely with the UK winter travel peak. This seasonal alignment is commercially important for UK tour operators: Gambia departures fill a window when domestic birding interest is high and clients are actively looking for warm-weather alternatives. The combination of wintering Palearctic migrants and resident West African species during this period produces exceptional birding variety."),
    ("Compact geography, high species density.", "The Gambia is one of the smallest countries in continental Africa, yet supports over 550 confirmed bird species. This ratio of species richness to surface area is among the highest on the continent, making it possible for operators to build high-quality 7- to 15-day programmes that comfortably cover multiple habitat types and target species within a single country. For clients with limited holiday time, this density is a significant selling point."),
    ("Licensed local guide expertise.", "All four BWA guides involved in this programme are licensed by the Gambia Tourism Board and bring significant combined expertise across The Gambia's key birding habitats and species. Several have led tours with established UK operators for over a decade. This professional licensing and demonstrable track record provides operators with the assurance of quality that underpins their product. The BWA affiliation additionally signals a collective standard and accountability structure beyond the individual guide."),
    ("Community and conservation connection.", "Birdwatching tourism in The Gambia is closely connected to community-based lodges, upcountry conservation areas, and national parks. The Gambia is represented nationally by WABSA (West African Bird Study Association) as the national BirdLife International partner, and local ringing and monitoring programmes have been supported by major UK conservation bodies. For operators whose clients value ethical and conservation-aligned travel, this connection to a functioning conservation infrastructure is a genuine differentiator."),
]
for name, description in themes:
    add_para(doc, description, bold_prefix=name)

add_heading(doc, '5.3  Meeting Goals by Engagement Tier', level=3)

meeting_goals = [
    ("Existing Gambia Sellers (Group A — highest priority).", "The primary goal in meetings with existing sellers is relationship reinforcement and guide introduction. These operators already value The Gambia as a destination; the objective is to ensure they know who the licensed BWA guides are, to open dialogue about the 2026/27 season, and to identify any ground-service gaps or improvement opportunities. A secondary goal is to explore whether any operator would be open to an extension or new itinerary element — for example, a upcountry addition, a Senegal border crossing, or a cross-sell with a herpetology or general wildlife departure."),
    ("West Africa and Strategic Partners (Group B — high priority).", "For conservation bodies, membership organisations, and data platforms, the meeting goal is relationship-building and collaboration rather than sales. With the African Bird Club, the goal is to explore member communications opportunities and Gambia country page engagement. With BirdLife International and WABSA, the priority is to align on Atlantic Flyway storytelling and conservation-tourism integration at key IBAs. With Cornell Lab/eBird, the goal is to discuss Gambia hotspot data quality and Merlin pack accuracy — both of which directly affect whether international birders select The Gambia over competitor destinations. With Ashanti African Tours, the goal is to open a regional peer conversation about joint West Africa routing."),
    ("Medium Priority Operators (Section 4).", "For operators who do not currently run Gambia tours but are active in the specialist market, the fair-floor meeting goal is simple: make a brief introduction, leave a strong impression, and create the conditions for follow-up. No operator partnership is realistically concluded at a trade fair stand; the objective is to move from unknown to known."),
]
for name, description in meeting_goals:
    add_para(doc, description, bold_prefix=name)

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 6 — ENGAGEMENT PRIORITIES
# ═══════════════════════════════════════════════════════════════════════════════
add_heading(doc, '6.  Engagement Priorities', level=2)

add_heading(doc, 'Highest Priority — Existing Sellers and Strategic Institutional Partners', level=3)
add_para(doc, "The following organisations are recommended as the highest priority for structured engagement at Global Birdfair 2026, combining pre-fair outreach, a request for a scheduled meeting, and a prepared, operator-specific conversation:")

highest = [
    ("Naturetrek", "The UK's most significant Gambia seller by client volume; Barney Jones (Africa, Operations) is the named programme contact."),
    ("Birdfinders", "Long-running Gambia tour; Vaughan Ashby (Founder/Director) co-leads the tour personally and is accessible directly."),
    ("Oriole Birding", "15+ years of Gambia departures; Ashley Saunders (Director) has personally birded in The Gambia."),
    ("Limosa Holidays", "One of the UK's oldest bird tour operators with confirmed multi-year Gambia commitment; Chris Collins (MD, Birds & Wildlife Ltd group)."),
    ("Heatherlea Birdwatching", "Scottish market coverage complementing southern England operators; Emma McBride (MD)."),
    ("Wildlife Worldwide / The Travelling Naturalist", "Two brands, one team, confirmed Gambia products across the birding and naturalist market; Dan Free (GM)."),
    ("Rockjumper Birding Tours", "Only non-UK operator currently running a confirmed Gambia set-departure; Keith Valentine (MD) is the right contact for a global ground-partner introduction."),
    ("African Bird Club", "Direct Gambia project funding history; Keith Betton (Chair) and Solomon Jallow (Gambia Country Representative) provide two entry points."),
    ("BirdLife International / WABSA", "Strategic conservation umbrella with Gambia national partner; Tharcisse Ukizintambara (BirdLife Dakar) and Lamin Jobaate (WABSA Executive Director)."),
    ("Cornell Lab of Ornithology / eBird", "Platform-level influence on destination visibility; Ian Davies (eBird International Strategy Lead) has a direct institutional email."),
]
for name, desc in highest:
    add_bullet(doc, desc, bold_prefix=name)

add_heading(doc, 'Medium Priority — Wider Specialist Operators', level=3)
add_para(doc, "The following operators are recommended for fair-floor engagement rather than pre-scheduled meetings. A brief, well-targeted conversation at their stand — supported by a concise Gambia fact sheet — is the appropriate ambition:")

medium_bullets = [
    ("Bluetail Birding and Eco Terra Adventures", "(already in shortlist, Gambia sellers; engagement at stand to confirm season and introduce BWA)"),
    ("Wildwings Travel", "(sister to Limosa under Birds & Wildlife Ltd ownership — group-level relationship already being developed through Chris Collins)"),
    ("Greentours Natural History Holidays, Reef and Rainforest Tours, Travel The Unknown, Birding Direct, 2by2 Holidays", "(UK specialists, no confirmed Gambia product, accessible target market)"),
    ("Partnership for International Birding (PIB)", "(Denver-based; confirmed prior Africa/Gambia coverage; strong US-market reach worth developing)"),
    ("Tropical Birding", "(global specialist; US market access beyond current UK-centric operator base)"),
    ("Birding the Islands", "(Macaronesia specialist; Cape Verde–Gambia combination itinerary potential)"),
    ("Ashanti African Tours", "(regional West Africa peer/coopetitor; open a partnership conversation)"),
]
for name, desc in medium_bullets:
    add_bullet(doc, desc, bold_prefix=name)

add_heading(doc, 'Long-Term and Relationship-Building', level=3)
add_para(doc, "The following exhibitor categories are lower priority for active engagement in 2026 but relevant for longer-term profile-building:")

ltb = [
    ("Optics and equipment brands", "(Swarovski Optik, Leica, Zeiss, Kowa, Nikon): These companies frequently support destination photography competitions, ambassador programmes, and editorial features. Introducing The Gambia's BWA guides to optics brand representatives begins a relationship that may yield promotional value over time."),
    ("Wildlife media and publishing", "(BBC Wildlife Magazine, Princeton Nature, other publishers with Africa lists): Media contacts at Birdfair can result in destination features or guide profiles that carry significant weight with the specialist audience."),
    ("Conservation and science organisations", "(Fauna & Flora, academic institutions): These bodies can endorse conservation credentials and provide third-party validation of The Gambia's conservation value proposition."),
]
for name, desc in ltb:
    add_bullet(doc, desc, bold_prefix=name)

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 7 — CONCLUSION AND NEXT STEPS
# ═══════════════════════════════════════════════════════════════════════════════
add_heading(doc, '7.  Conclusion and Next Steps', level=2)

concl_paras = [
    "Global Birdfair 2026 represents a well-timed opportunity for The Gambia's birdwatching tourism sector to consolidate and expand its position within the international specialist market. The mapping undertaken in this report confirms that the destination already has a meaningful footprint among the UK's most established birding tour operators — Naturetrek, Birdfinders, Limosa, Heatherlea, Oriole, and Wildlife Worldwide/The Travelling Naturalist all run confirmed Gambia departures — and that Rockjumper Birding Tours extends this presence into the global serious-birder market from South Africa.",
    "This existing footprint is a significant asset. Rather than approaching the fair as a prospecting exercise, The Gambia's delegation should treat Birdfair 2026 primarily as an opportunity to deepen existing relationships, introduce the collective BWA guide team formally to operators who may know The Gambia as a destination but not yet know the individual guides behind it, and signal the professionalism and organisation of the BWA as the representative body for Gambian birdwatching tourism.",
    "Sustainable success in the specialist birding market is built on trust, continuity, and consistent quality. International operators return to ground partners who are reliable, communicative, and who actively improve the client experience from one season to the next. The fair is the beginning of a sustained relationship-building process, not the point at which outcomes should be expected. Follow-up after Birdfair — whether by email, a shared product factsheet, or an invitation to consider a familiarisation visit — is as important as the conversations at the fair itself.",
]
for p in concl_paras:
    add_para(doc, p)

add_heading(doc, 'Recommended next steps following delivery of this report:', level=3)

next_steps = [
    "Distribute this mapping to ITC and the four participating BWA guides to ensure shared awareness of priority targets and recommended engagement goals before the June virtual fair.",
    "Develop a concise collective Gambia one-pager for use at the fair, presenting the BWA guide team under a single identity alongside individual operator details — Birding Adventures Gambia and Pa Birding Tours — for operators who prefer direct ground-supplier contacts.",
    "Use the June Virtual Trade Fair as the first structured contact point with the ten highest-priority exhibitors identified in this report. Pre-schedule brief introductory meetings where possible.",
    "Prepare operator-specific talking points for the seven existing Gambia sellers ahead of Rutland, drawing on the engagement goals set out in Section 3.",
    "After the fair (July–August 2026), follow up with all engaged contacts by email within one week, referencing the specific conversation held and proposing a concrete next step.",
    "Consider a post-fair review session with the BWA guides to capture what was learned, which contacts were most receptive, and what product or materials improvements would strengthen the 2027 participation.",
]
for i, step in enumerate(next_steps, 1):
    p = doc.add_paragraph(style='List Number')
    r = p.add_run(step)
    r.font.name = 'Calibri'
    r.font.size = Pt(11)
    p.paragraph_format.space_after = Pt(4)

# ═══════════════════════════════════════════════════════════════════════════════
# SAVE
# ═══════════════════════════════════════════════════════════════════════════════
output_path = '/Users/alexjeffries/Tourism/tourism-commons/projects/gambia/birding/Gambia Birding - Deliverable 2 - Buyer Mapping - 280526.docx'
doc.save(output_path)
print(f'Saved: {output_path}')
