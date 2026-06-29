#!/usr/bin/env python3
"""
Gambia Workshop HTML → PPTX Converter
Full Day 1 (52 slides) + Day 2 (35 slides)
"""

from pathlib import Path
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.oxml.ns import qn
from bs4 import BeautifulSoup
import re

# ── Paths ────────────────────────────────────────────────────────────────────
WORKSHOP = Path(__file__).parent
TEMPLATE = Path('/Users/alexjeffries/Documents/The Gambia/Gambia SME Training/PPT References/master_template_v2.pptx')
HTML_D1  = WORKSHOP / 'day1-presentation.html'
HTML_D2  = WORKSHOP / 'day2-presentation.html'
IMG_DIR  = WORKSHOP / 'img'

# ── Brand palette ─────────────────────────────────────────────────────────────
NAVY    = RGBColor(0x09, 0x2E, 0x49)
PINK    = RGBColor(0xE0, 0x00, 0x59)
ACCENT  = RGBColor(0x00, 0x91, 0xD4)
TEXT    = RGBColor(0x26, 0x26, 0x26)
MUTED   = RGBColor(0x7A, 0x7A, 0x7A)
WHITE   = RGBColor(0xFF, 0xFF, 0xFF)
SURFACE = RGBColor(0xF4, 0xF4, 0xF4)
NAVY_DIM = RGBColor(0xAA, 0xC0, 0xD4)   # light text on navy backgrounds

FONT = 'Calibri'


# ═════════════════════════════════════════════════════════════════════════════
# LOW-LEVEL HELPERS
# ═════════════════════════════════════════════════════════════════════════════

def open_template():
    prs = Presentation(str(TEMPLATE))
    sldIdLst = prs.slides._sldIdLst
    for sldId in list(sldIdLst):
        rId = sldId.get(qn('r:id'))
        sldIdLst.remove(sldId)
        prs.part.drop_rel(rId)
    return prs


def new_slide(prs, bg=None):
    slide = prs.slides.add_slide(prs.slide_layouts[0])
    if bg is not None:
        fill = slide.background.fill
        fill.solid()
        fill.fore_color.rgb = bg
    return slide


def rect(slide, x, y, w, h, color):
    shp = slide.shapes.add_shape(1, Inches(x), Inches(y), Inches(w), Inches(h))
    shp.fill.solid()
    shp.fill.fore_color.rgb = color
    shp.line.fill.background()
    return shp


def tb(slide, text, x, y, w, h, size, color,
       bold=False, italic=False, align=PP_ALIGN.LEFT, wrap=True):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.word_wrap = wrap
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.name  = FONT
    run.font.size  = Pt(size)
    run.font.color.rgb = color
    run.font.bold  = bold
    run.font.italic = italic
    return box


def para_box(slide, lines, x, y, w, h, size=18, color=TEXT,
             spacing=8, bullet=True):
    """Multiple-paragraph text box; optional dash bullet."""
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.word_wrap = True
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_before = Pt(spacing)
        run = p.add_run()
        run.text = (f'–  {line}' if bullet else line)
        run.font.name  = FONT
        run.font.size  = Pt(size)
        run.font.color.rgb = color
    return box


def add_image(slide, img_name, x, y, w, h):
    path = IMG_DIR / img_name if img_name else None
    if path and path.exists():
        slide.shapes.add_picture(str(path), Inches(x), Inches(y), Inches(w), Inches(h))
    else:
        rect(slide, x, y, w, h, SURFACE)
        if img_name:
            tb(slide, f'[{img_name}]', x+0.1, y+h/2-0.15, w-0.2, 0.3,
               9, MUTED, align=PP_ALIGN.CENTER)


def footer(slide, page_num, day='Day 1  ·  Gambia Institutional Workshop'):
    tb(slide, str(page_num), 0.4, 7.1, 0.5, 0.3, 10, MUTED)
    tb(slide, day,           4.5, 7.1, 8.0, 0.3,  9, MUTED)


# ═════════════════════════════════════════════════════════════════════════════
# SLIDE BUILDERS
# ═════════════════════════════════════════════════════════════════════════════

def slide_cover(prs, title, subtitle, meta_items, page_num=1):
    slide = new_slide(prs, NAVY)
    tb(slide, title, 0.85, 1.9, 11.0, 3.2, 54, WHITE, bold=True)
    if subtitle:
        tb(slide, subtitle, 0.85, 5.3, 11.0, 0.5, 18, WHITE)
    if meta_items:
        tb(slide, '  ·  '.join(meta_items), 0.85, 6.45, 10.0, 0.35, 11, NAVY_DIM)
    return slide


def slide_content(prs, eyebrow, title, body_lines=None, img_file=None,
                  subtitle=None, page_num=1, bg=None):
    """Standard content: eyebrow + title + optional body + optional right image."""
    slide = new_slide(prs, bg or WHITE)
    body_w = 7.0 if img_file else 11.8

    if eyebrow:
        tb(slide, eyebrow.upper(), 0.6, 0.85, body_w, 0.3, 10, PINK, bold=True)

    tb(slide, title, 0.6, 1.2, body_w, 0.85, 30, NAVY, bold=True)

    if subtitle:
        tb(slide, subtitle, 0.6, 2.15, body_w, 0.45, 18, MUTED, italic=True)

    if body_lines:
        top = 2.75 if subtitle else 2.2
        para_box(slide, body_lines, 0.6, top, body_w, 4.1)

    if img_file:
        add_image(slide, img_file, 8.0, 2.1, 4.9, 4.65)

    footer(slide, page_num)
    return slide


def slide_dark_section(prs, eyebrow, main_text, caption=None, page_num=1):
    """Dark navy statement / photo-section slide."""
    slide = new_slide(prs, NAVY)
    if eyebrow:
        tb(slide, eyebrow, 1.2, 2.1, 10.8, 0.4, 11, PINK,
           bold=True, align=PP_ALIGN.CENTER)
    tb(slide, main_text, 1.0, 2.65, 11.2, 2.6, 30, WHITE,
       bold=True, align=PP_ALIGN.CENTER)
    if caption:
        tb(slide, caption, 1.8, 5.45, 9.5, 1.0, 18, NAVY_DIM,
           align=PP_ALIGN.CENTER)
    footer(slide, page_num)
    return slide


def slide_divider(prs, eyebrow, title, subtitle=None, deco='', page_num=1):
    """Section break: thin pink left bar + right text."""
    slide = new_slide(prs, WHITE)
    rect(slide, 0, 0, 0.12, 7.5, PINK)
    if deco:
        tb(slide, deco, 0.4, 4.0, 4.5, 3.0, 96,
           RGBColor(0xE5, 0xEE, 0xF4), bold=True)
    if eyebrow:
        tb(slide, eyebrow.upper(), 5.0, 2.1, 7.8, 0.35, 10, PINK, bold=True)
    tb(slide, title, 5.0, 2.55, 7.8, 2.4, 48, NAVY, bold=True)
    if subtitle:
        tb(slide, subtitle, 5.0, 5.1, 7.8, 1.0, 18, TEXT)
    footer(slide, page_num)
    return slide


def slide_steps(prs, eyebrow, title, steps, caption=None, page_num=1, bg=SURFACE):
    """3-column numbered steps.  steps = [(num, heading, body), ...]"""
    slide = new_slide(prs, bg)
    if eyebrow:
        tb(slide, eyebrow.upper(), 0.6, 0.8, 12.0, 0.3, 10, PINK,
           bold=True, align=PP_ALIGN.CENTER)
    tb(slide, title, 0.6, 1.15, 12.0, 0.75, 30, NAVY,
       bold=True, align=PP_ALIGN.CENTER)
    rect(slide, 5.75, 2.1, 1.8, 0.05, PINK)

    n      = len(steps)
    col_w  = (12.5 - 0.6) / n
    col_y  = 2.35

    for i, (num, heading, body) in enumerate(steps):
        x     = 0.6 + i * col_w
        ncol  = PINK if i == len(steps) - 1 else NAVY
        tb(slide, str(num), x, col_y,       col_w-0.1, 1.1, 48, ncol, bold=True)
        tb(slide, heading,  x, col_y+1.1,   col_w-0.1, 0.5, 18, NAVY, bold=True)
        tb(slide, body,     x, col_y+1.7,   col_w-0.1, 2.8, 16, TEXT, wrap=True)

    if caption:
        tb(slide, caption, 0.6, 6.6, 12.0, 0.35, 12, MUTED,
           italic=True, align=PP_ALIGN.CENTER)
    footer(slide, page_num)
    return slide


def slide_exercise(prs, number, title, time_label, scenario, steps, page_num=1):
    """Navy left panel + numbered steps on right."""
    slide = new_slide(prs, WHITE)
    rect(slide, 0, 0, 4.2, 7.5, NAVY)

    tb(slide, 'EXERCISE',  0.55, 0.9,  3.1, 0.35, 11, WHITE, bold=True)
    tb(slide, number,      0.55, 1.3,  3.1, 2.1,  80, WHITE, bold=True)
    tb(slide, title,       0.55, 4.3,  3.1, 1.6,  22, WHITE, bold=True)
    tb(slide, time_label,  0.55, 6.1,  3.1, 0.45, 14, PINK,  bold=True)

    tb(slide, 'WHAT YOU\'LL DO', 4.75, 0.85, 8.0, 0.3, 10, PINK, bold=True)

    if scenario:
        tb(slide, scenario, 4.75, 1.25, 8.1, 0.9, 16, TEXT, wrap=True)

    step_y = 2.35
    for i, step_text in enumerate(steps[:5]):
        # Small numbered circle (dark square + white number)
        rect(slide, 4.73, step_y - 0.02, 0.46, 0.46, NAVY)
        tb(slide, str(i+1), 4.73, step_y - 0.02, 0.46, 0.46,
           15, WHITE, bold=True, align=PP_ALIGN.CENTER)
        tb(slide, step_text, 5.28, step_y - 0.05, 7.55, 0.75, 16, TEXT, wrap=True)
        step_y += 1.0

    footer(slide, page_num)
    return slide


def slide_quote(prs, eyebrow, quote_text, attribution, source=None, page_num=1):
    """Full-bleed quote on navy."""
    slide = new_slide(prs, NAVY)
    tb(slide, '“', 0.7, 0.5, 2.5, 2.5, 120, PINK, bold=True)
    if eyebrow:
        tb(slide, eyebrow.upper(), 0.85, 1.85, 11.5, 0.3, 10,
           RGBColor(0x88, 0xA0, 0xB8))
    tb(slide, quote_text, 0.85, 2.25, 11.5, 3.0, 22, WHITE, wrap=True)
    rect(slide, 0.85, 5.45, 1.5, 0.06, PINK)
    if attribution:
        tb(slide, attribution, 0.85, 5.65, 11.5, 0.5, 20, WHITE, bold=True)
    if source:
        tb(slide, source, 0.85, 6.25, 11.5, 0.3, 11,
           RGBColor(0x66, 0x88, 0xA0), italic=True)
    footer(slide, page_num)
    return slide


def slide_stats(prs, eyebrow, title, stats, subtitle=None,
                img_file=None, body_lines=None, page_num=1, bg=None):
    """Large-number statistics.  stats = [(value, label, color), ...]"""
    slide = new_slide(prs, bg or WHITE)
    has_img = bool(img_file)
    stat_w  = (7.2 if has_img else 12.2) / max(len(stats), 1)

    if eyebrow:
        tb(slide, eyebrow.upper(), 0.6, 0.85, 11.8, 0.3, 10, PINK, bold=True)
    tb(slide, title, 0.6, 1.2, 11.8, 0.85, 30, NAVY, bold=True)

    if subtitle:
        tb(slide, subtitle, 0.6, 2.1, 11.8, 0.4, 16, MUTED, italic=True)

    top = 2.65 if subtitle else 2.35
    for i, (val, lbl, clr) in enumerate(stats):
        x = 0.6 + i * stat_w
        tb(slide, val, x, top,        stat_w-0.2, 1.3, 52, clr, bold=True)
        tb(slide, lbl, x, top+1.35,   stat_w-0.2, 0.7, 16, MUTED, wrap=True)

    if body_lines:
        y = top + 2.2
        para_box(slide, body_lines, 0.6, y, 7.0 if has_img else 11.8,
                 6.8 - y, size=16)

    if img_file:
        add_image(slide, img_file, 8.0, 2.1, 4.9, 4.65)

    footer(slide, page_num)
    return slide


def slide_bars(prs, eyebrow, title, bars, subtitle=None, note=None,
               page_num=1, bg=None):
    """Horizontal bar chart.  bars = [(label, pct_float, color), ...]"""
    slide = new_slide(prs, bg or WHITE)

    if eyebrow:
        tb(slide, eyebrow.upper(), 0.6, 0.85, 12.0, 0.3, 10, PINK, bold=True)
    tb(slide, title, 0.6, 1.2, 12.0, 0.8, 30, NAVY, bold=True)
    if subtitle:
        tb(slide, subtitle, 0.6, 2.1, 12.0, 0.4, 16, MUTED, italic=True)

    bar_start = 3.0
    bar_max_w = 8.5
    y = 2.65 if subtitle else 2.45
    row_h = 0.65

    for label, pct, clr in bars:
        bar_w = max(bar_max_w * pct, 0.1)
        tb(slide, label, 0.6, y, 2.5, row_h, 16, TEXT)
        rect(slide, bar_start, y + 0.1, bar_w, row_h - 0.22, clr)
        tb(slide, f'{int(round(pct*100))}%',
           bar_start + bar_w + 0.12, y, 0.9, row_h, 16, clr, bold=True)
        y += row_h + 0.12

    if note:
        tb(slide, note, 0.6, y + 0.15, 12.0, 0.6, 14, MUTED, italic=True, wrap=True)

    footer(slide, page_num)
    return slide


def slide_cards(prs, eyebrow, title, cards, subtitle=None,
                page_num=1, bg=None):
    """Card grid.  cards = [(heading, body, bg_rgb, txt_rgb), ...]"""
    slide = new_slide(prs, bg or WHITE)
    n = len(cards)

    if eyebrow:
        tb(slide, eyebrow.upper(), 0.6, 0.85, 12.0, 0.3, 10, PINK, bold=True)
    tb(slide, title, 0.6, 1.2, 12.0, 0.85, 30, NAVY, bold=True)
    if subtitle:
        tb(slide, subtitle, 0.6, 2.1, 12.0, 0.4, 16, MUTED, italic=True)

    card_top = 2.55 if subtitle else 2.3
    card_h   = 4.5
    total_w  = 12.0
    gap      = 0.2
    cw       = (total_w - gap * (n - 1)) / n

    for i, (heading, body, cbg, ctxt) in enumerate(cards):
        x = 0.6 + i * (cw + gap)
        rect(slide, x, card_top, cw, card_h, cbg)
        tb(slide, heading, x+0.2, card_top+0.25, cw-0.4, 0.55, 16, ctxt, bold=True)
        tb(slide, body,    x+0.2, card_top+0.9,  cw-0.4, card_h-1.1, 15, ctxt, wrap=True)

    footer(slide, page_num)
    return slide


def slide_table(prs, eyebrow, title, headers, rows,
                subtitle=None, page_num=1, bg=None):
    """Simple data table with navy header row."""
    slide = new_slide(prs, bg or WHITE)

    if eyebrow:
        tb(slide, eyebrow.upper(), 0.6, 0.85, 12.0, 0.3, 10, PINK, bold=True)
    tb(slide, title, 0.6, 1.2, 12.0, 0.8, 30, NAVY, bold=True)
    if subtitle:
        tb(slide, subtitle, 0.6, 2.1, 12.0, 0.4, 16, MUTED, italic=True)

    table_top = 2.6 if subtitle else 2.4
    n_cols = len(headers)
    n_rows = len(rows) + 1

    tbl = slide.shapes.add_table(
        n_rows, n_cols,
        Inches(0.6), Inches(table_top),
        Inches(12.0), Inches(6.8 - table_top)
    ).table

    for j, h in enumerate(headers):
        cell = tbl.cell(0, j)
        cell.fill.solid(); cell.fill.fore_color.rgb = NAVY
        p = cell.text_frame.paragraphs[0]
        r = p.add_run(); r.text = h
        r.font.name = FONT; r.font.size = Pt(13)
        r.font.bold = True; r.font.color.rgb = WHITE

    for i, row in enumerate(rows):
        for j, val in enumerate(row):
            cell = tbl.cell(i+1, j)
            if i % 2:
                cell.fill.solid(); cell.fill.fore_color.rgb = SURFACE
            p = cell.text_frame.paragraphs[0]
            r = p.add_run(); r.text = str(val)
            r.font.name = FONT; r.font.size = Pt(13)
            r.font.color.rgb = TEXT

    footer(slide, page_num)
    return slide


# ═════════════════════════════════════════════════════════════════════════════
# CONTENT EXTRACTION HELPERS
# ═════════════════════════════════════════════════════════════════════════════

def clean(el):
    return el.get_text(separator=' ', strip=True) if el else ''


def eyebrow_of(sec):
    return clean(sec.find(class_='eyebrow'))


def title_of(sec):
    h = sec.find(['h1', 'h2', 'h3'])
    return clean(h)


def img_of(sec):
    img = sec.find('img')
    return Path(img['src']).name if img else None


def li_texts(sec):
    steps = []
    for li in sec.find_all('li'):
        spans = [s for s in li.find_all('span')
                 if 'step-num' not in s.get('class', [])]
        if spans:
            steps.append(' '.join(s.get_text(strip=True) for s in spans))
        else:
            t = li.get_text(strip=True)
            if t:
                steps.append(t)
    return steps


def para_texts(sec, skip_eyebrow=True):
    """All <p> text in a section, skipping empty ones."""
    out = []
    for p in sec.find_all('p'):
        if skip_eyebrow and p.parent and 'eyebrow' in p.get('class', []):
            continue
        t = p.get_text(separator=' ', strip=True)
        if t:
            out.append(t)
    return out


def market_bars(sec):
    """Extract (label, pct, color) from .market-row elements."""
    bars = []
    for row in sec.find_all(class_='market-row'):
        label = clean(row.find(class_='market-label'))
        bar   = row.find(class_='market-bar')
        if not bar:
            continue
        pct_text = bar.get_text(strip=True).replace('%', '')
        try:
            pct = float(pct_text) / 100
        except ValueError:
            continue
        # Highlight The Gambia in pink
        clr = PINK if 'Gambia' in label else NAVY
        bars.append((label, pct, clr))
    return bars


def step_items(sec):
    """Extract (num, heading, body) triples from .step-item elements."""
    items = []
    for it in sec.find_all(class_='step-item'):
        num  = clean(it.find(class_='step-num-lg') or it.find(class_='step-num'))
        head = clean(it.find(['h3', 'h4']))
        body = clean(it.find('p'))
        items.append((num or str(len(items)+1), head, body))
    return items


def exercise_data(sec):
    """Return (number, title, time, scenario, steps) from an exercise-card."""
    title    = clean(sec.find('h3'))
    time_lbl = clean(sec.find(class_='exercise-time'))
    scenario = clean(sec.find(class_='exercise-scenario'))
    steps    = li_texts(sec)
    return title, time_lbl, scenario, steps


# ═════════════════════════════════════════════════════════════════════════════
# SLIDE ROUTER — DAY 1
# ═════════════════════════════════════════════════════════════════════════════

def route_day1(prs, soup, day_label):
    pg = 1

    def ex(number, sec):
        nonlocal pg
        t, tm, sc, st = exercise_data(sec)
        slide_exercise(prs, number, t, tm or '15 min', sc, st, page_num=pg)
        pg += 1

    def ft(pg): return footer  # just a reminder — footer is called inside builders

    # ── s0 · Cover ──────────────────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '0'})
    slide_cover(prs,
        title      = clean(s.find('h1')),
        subtitle   = clean(s.find('p')),
        meta_items = [sp.get_text(strip=True)
                      for div in s.find_all(class_='cover-meta')
                      for sp in div.find_all('span')],
        page_num=pg); pg += 1

    # ── s1 · Content + image ─────────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '1'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines=li_texts(s), img_file=img_of(s), page_num=pg); pg += 1

    # ── s2 · Photo section ───────────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '2'})
    ps = s.find_all('p')
    slide_dark_section(prs,
        eyebrow   = eyebrow_of(s),
        main_text = clean(ps[0]) if ps else '',
        caption   = clean(ps[1]) if len(ps) > 1 else None,
        page_num=pg); pg += 1

    # ── s3 · Steps ───────────────────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '3'})
    cap_ps = [p for p in s.find_all('p') if 'step' not in str(p.get('class', ''))]
    slide_steps(prs, eyebrow_of(s), title_of(s),
        steps   = step_items(s),
        caption = clean(cap_ps[-1]) if cap_ps else None,
        page_num=pg); pg += 1

    # ── s4 · Exercise: Map the room ──────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '4'})
    ex('01', s)

    # ── s5 · Divider: The Evidence ───────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '5'})
    slide_divider(prs, eyebrow_of(s), title_of(s),
        subtitle = clean(s.find('p')),
        deco     = clean(s.find(class_='divider-deco')),
        page_num=pg); pg += 1

    # ── s6 · Exercise: Three words Part 1 ────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '6'})
    ex('02', s)

    # ── s7 · Exercise: Three words Part 2 ────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '7'})
    ex('03', s)

    # ── s8 · Methodology: We looked in two directions (SVG → text) ───────────
    s = soup.find('section', attrs={'data-s': '8'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        subtitle   = 'Two reports. One story. The gap = the institutional opportunity.',
        body_lines = [
            'D1 (Supply side): 61 stakeholders assessed across 7 creative sectors — what exists inside The Gambia.',
            'D2 (Demand side): 239 international operator pages + 5,682 visitor reviews — what the world sees.',
            'Both reports used publicly available sources. No proprietary data. A systematic approach. You can do this yourselves.',
        ], page_num=pg); pg += 1

    # ── s9 · Stats: 95 / 91 / 9 + image ─────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '9'})
    slide_stats(prs, eyebrow_of(s), title_of(s),
        stats = [
            ('95%', 'Beach & resort content',     NAVY),
            ('91%', 'Wildlife & nature content',  NAVY),
            ('9%',  'Creative & cultural content', PINK),
        ],
        subtitle  = 'Share of 239 international operator pages analysed',
        img_file  = img_of(s),
        page_num=pg); pg += 1

    # ── s10 · Bars: regional comparison ──────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '10'})
    note_ps = [p.get_text(strip=True) for p in s.find_all('p')
               if p.get_text(strip=True) and not p.find_parent(class_='market-chart')]
    slide_bars(prs, eyebrow_of(s), title_of(s),
        bars     = market_bars(s),
        subtitle = 'Share of operator pages that include creative & cultural content, by destination',
        note     = note_ps[0] if note_ps else None,
        page_num=pg); pg += 1

    # ── s11 · Stats: Creative Tourism Score ──────────────────────────────────
    s = soup.find('section', attrs={'data-s': '11'})
    slide_stats(prs, eyebrow_of(s),
        title  = 'The Gambia scores 16.9 out of 100',
        stats  = [
            ('16.9', 'The Gambia creative tourism score',  NAVY),
            ('30.9', 'Regional mean',                      MUTED),
            ('33.9', 'Senegal+Gambia packages',            ACCENT),
        ],
        body_lines = [
            'Creative content mentioned on operator pages.',
            'Whether it is prominently featured or a passing mention.',
            'Whether specific products are named and bookable.',
            'Benchmarked against 5 regional peers.',
        ],
        img_file = img_of(s),
        page_num=pg); pg += 1

    # ── s12 · Comparison: 16.9 vs 33.9 ──────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '12'})
    slide_stats(prs, eyebrow_of(s), title_of(s),
        stats = [
            ('16.9', 'The Gambia — pure Gambia tours',     NAVY),
            ('vs',   '',                                    MUTED),
            ('33.9', 'Senegal+Gambia packages',             ACCENT),
        ],
        body_lines = [
            'Regional framing already doubles the creative tourism score — without changing the product.',
            'The Gambia\'s creative offer is valued when visitors can see it.',
        ],
        page_num=pg); pg += 1

    # ── s13 · Bars: visitor origins ──────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '13'})
    slide_bars(prs, eyebrow_of(s), title_of(s),
        bars = [
            ('UK & Anglophone',      0.45, NAVY),
            ('Dutch & Belgian',      0.34, ACCENT),
            ('Francophone',          0.15, NAVY),
            ('German / Swiss',       0.03, MUTED),
            ('Southern European',    0.03, MUTED),
        ],
        note = 'Dutch/Belgian visitors are the most satisfied (avg 4.56 / 5). UK visitors dominate volume.',
        page_num=pg); pg += 1

    # ── s14 · Quote ──────────────────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '14'})
    slide_quote(prs,
        eyebrow     = eyebrow_of(s),
        quote_text  = clean(s.find(class_='big-quote')),
        attribution = clean(s.find(class_='quote-sub')),
        source      = clean(s.find('p')) if s.find('p') else None,
        page_num=pg); pg += 1

    # ── s15 · Content + image: safety #1 ─────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '15'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines = [clean(p) for p in s.find_all('p') if clean(p)],
        img_file   = img_of(s),
        page_num=pg); pg += 1

    # ── s16 · Stats: supply-side picture ─────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '16'})
    slide_stats(prs, eyebrow_of(s), title_of(s),
        stats = [
            ('61%', 'of stakeholders are Absent or Basic digital maturity', NAVY),
            ('64%', 'post less than once a month',                          NAVY),
            ('16%', 'have digital booking or payment',                      PINK),
        ],
        subtitle = 'Minimal or no digital footprint · 7 sectors · 61 stakeholders assessed',
        page_num=pg); pg += 1

    # ── s17 · Content: sector maturity ───────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '17'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        subtitle   = clean(s.find('p')) if s.find('p') else None,
        body_lines = [
            'Audiovisual / Photography (Photographers Assn) — 41% Intermediate or above',
            'Performing & Visual Arts (Music Union, Visual Arts Assn) — ~20% Intermediate',
            'Festivals & Cultural Events — Polarised: some strong, most weak',
            'Cultural Heritage Sites — Below average across the board',
            'Crafts & Artisan Products — Largely absent or basic',
            'Fashion & Design — Least digitally visible sector overall',
        ],
        page_num=pg); pg += 1

    # ── s18 · Content + image: local leaders ─────────────────────────────────
    s = soup.find('section', attrs={'data-s': '18'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines = [clean(p) for p in s.find_all('p') if clean(p)][:4],
        img_file   = img_of(s),
        page_num=pg); pg += 1

    # ── s19 · Content: tools ─────────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '19'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        subtitle   = 'No proprietary data required — publicly accessible sources, a systematic approach, and clear questions.',
        body_lines = [
            'TripAdvisor destination page — Most recent reviews, ratings, themes',
            'Google Trends — Search interest over time by region',
            'International operator websites — How The Gambia is described and positioned',
            'Google Alerts — New online content mentioning The Gambia tourism',
        ],
        page_num=pg); pg += 1

    # ── s20 · Exercise: Find your sector Part 1 ──────────────────────────────
    s = soup.find('section', attrs={'data-s': '20'})
    ex('04', s)

    # ── s21 · Cards: What did you find? ──────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '21'})
    slide_cards(prs, 'Activity — Find your sector · Part 2', 'What did you find?',
        cards = [
            ('Present & findable',
             'Your organisation or members appear clearly in search results — name, contact, what they offer.',
             NAVY, WHITE),
            ('Visible but not bookable',
             'Something comes up — a mention, a review — but no way to contact or book directly.',
             ACCENT, WHITE),
            ('Effectively invisible',
             'Nothing appears, or what appears isn\'t your sector at all.',
             PINK, WHITE),
        ],
        subtitle = 'Pairs (8 min) → Share-back (7 min): Where on the spectrum did you land?',
        page_num=pg); pg += 1

    # ── s22 · Divider: Four things ────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '22'})
    slide_divider(prs, eyebrow_of(s), title_of(s),
        subtitle = clean(s.find('p')),
        deco     = clean(s.find(class_='divider-deco')),
        page_num=pg); pg += 1

    # ── s23 · Content + image: not the marketer ──────────────────────────────
    s = soup.find('section', attrs={'data-s': '23'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines = [clean(p) for p in s.find_all('p') if clean(p)][:4],
        img_file   = img_of(s),
        page_num=pg); pg += 1

    # ── s24 · Cards: Four things institutions can do ──────────────────────────
    slide_cards(prs, 'Block 2 — Overview',
        'Four things institutions can do',
        cards = [
            ('Monitor',
             'Read the landscape systematically. Know what visitors are saying and operators are showing — before your members ask.',
             NAVY, WHITE),
            ('Make findable',
             'Aggregate your sector so operators and tourists can find your members — one authoritative, maintained place.',
             ACCENT, WHITE),
            ('Open a door',
             'Broker access SMEs can\'t reach alone — operators, journalists, trade fairs, national portals.',
             NAVY, WHITE),
            ('Brief',
             'Produce one quarterly intelligence note. Nine associations. Hundreds of businesses. Two hours of work.',
             PINK, WHITE),
        ],
        subtitle  = 'That individual SMEs cannot',
        page_num=pg); pg += 1

    # ── s25 · Content + image: read the landscape ────────────────────────────
    s = soup.find('section', attrs={'data-s': '25'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines = [clean(p) for p in s.find_all('p') if clean(p)][:4],
        img_file   = img_of(s),
        page_num=pg); pg += 1

    # ── s26 · Cards: Four free tools ─────────────────────────────────────────
    slide_cards(prs, 'Thing 1 — Monitor · Tools',
        'Four free tools. Starting Monday.',
        cards = [
            ('Google Alerts',
             'Set for "Gambia tourism" + your sector. New content delivered to your inbox. Free, no expertise required.',
             NAVY, WHITE),
            ('TripAdvisor',
             'Monthly scan: 20 most recent destination reviews. What themes recur? What\'s missing? What needs a response?',
             ACCENT, WHITE),
            ('Operator spot-check',
             'Quarterly: 5–10 operator websites. How is The Gambia described? Is your sector present or absent?',
             NAVY, WHITE),
            ('Google Trends',
             'Track search interest in "The Gambia tourism" vs regional peers. Free, no account required.',
             PINK, WHITE),
        ],
        page_num=pg); pg += 1

    # ── s27 · Content + image: Google Trends ─────────────────────────────────
    s = soup.find('section', attrs={'data-s': '27'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines = [clean(p) for p in s.find_all('p') if clean(p)][:3],
        img_file   = img_of(s),
        page_num=pg); pg += 1

    # ── s28 · Content: Google Search Console ─────────────────────────────────
    s = soup.find('section', attrs={'data-s': '28'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        subtitle   = 'For institutions with websites — free once verified. Data flows automatically.',
        body_lines = [
            'Search queries — what visitors typed before finding you. Intent, not traffic.',
            'Pages — which pages attract visitors from search, and which don\'t.',
            'Countries — where searchers are located. Useful for prioritising languages and messaging.',
            'Impressions vs clicks — are you appearing in search but not being chosen?',
        ],
        page_num=pg); pg += 1

    # ── s29 · Exercise: Set up Google Alert ──────────────────────────────────
    s = soup.find('section', attrs={'data-s': '29'})
    ex('05', s)

    # ── s30 · Content + image: TripAdvisor ───────────────────────────────────
    s = soup.find('section', attrs={'data-s': '30'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines = [clean(p) for p in s.find_all('p') if clean(p)][:4],
        img_file   = img_of(s),
        page_num=pg); pg += 1

    # ── s31 · Table: track four numbers ──────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '31'})
    slide_table(prs, eyebrow_of(s), title_of(s),
        headers  = ['Indicator', 'Baseline 2025', 'Target 2026'],
        rows     = [
            ['ITO creative tourism visibility',    '52%',      '60%'],
            ['Average visitor sentiment score',    '+0.24',    '+0.30'],
            ['Verified TripAdvisor reviews',       'Baseline', '+25%'],
            ['Average review rating',              'Baseline', '+0.2'],
        ],
        subtitle = 'These indicators come directly from D2 Table 20. Ready-made — you don\'t need to design your own framework.',
        page_num=pg); pg += 1

    # ── s32 · Content + image: creative item 8 ───────────────────────────────
    s = soup.find('section', attrs={'data-s': '32'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines = [clean(p) for p in s.find_all('p') if clean(p)][:4],
        img_file   = img_of(s),
        page_num=pg); pg += 1

    # ── s33 · Content + image: one place ─────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '33'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines = [clean(p) for p in s.find_all('p') if clean(p)][:4],
        img_file   = img_of(s),
        page_num=pg); pg += 1

    # ── s34 · Cards: institution examples ────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '34'})
    # Parse board-col or repeated divs — hardcode the 3-column content
    slide_cards(prs, eyebrow_of(s), title_of(s),
        cards = [
            ('GT Board — VisitTheGambia.com',
             'A functional creative industries section: bookable experiences, sector contacts, events calendar.',
             NAVY, WHITE),
            ('Craft Market Federation — Member directory',
             'Names, photos, specialisms, WhatsApp. A tourist reads about vibrant craft markets — this is where they find who to contact.',
             ACCENT, WHITE),
            ('Tour Guide Association — Verified guide list',
             'Name, languages, specialisms, contact. One page. Operators reference it. Tourists find it.',
             NAVY, WHITE),
        ],
        page_num=pg); pg += 1

    # ── s35 · Content + image: national portal ───────────────────────────────
    s = soup.find('section', attrs={'data-s': '35'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines = [clean(p) for p in s.find_all('p') if clean(p)][:4],
        img_file   = img_of(s),
        page_num=pg); pg += 1

    # ── s36 · Exercise: Is your member findable? ──────────────────────────────
    s = soup.find('section', attrs={'data-s': '36'})
    ex('06', s)

    # ── s37 · Divider: Things 3 + 4 ──────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '37'})
    slide_divider(prs, eyebrow_of(s), title_of(s),
        subtitle = clean(s.find('p')),
        deco     = clean(s.find(class_='divider-deco')),
        page_num=pg); pg += 1

    # ── s38 · Cards: skills + doors ───────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '38'})
    slide_cards(prs, 'Block 3 · Things 3 + 4',
        'Three things SMEs need that training alone cannot deliver',
        cards = [
            ('Visibility',
             'Being findable by the right audiences — international operators, travel journalists, and platforms SMEs can\'t reach alone.',
             NAVY, WHITE),
            ('Credibility',
             'Being trusted by buyers and booking platforms. A trained SME still needs institutional endorsement to be taken seriously.',
             PINK, WHITE),
            ('Access',
             'Being connected to markets, events, and decision-makers. Institutions open doors individuals cannot.',
             ACCENT, WHITE),
        ],
        subtitle = clean(s.find('p')) if s.find('p') else None,
        page_num=pg); pg += 1

    # ── s39 · Content + image: the door ──────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '39'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines = [clean(p) for p in s.find_all('p') if clean(p)][:4],
        img_file   = img_of(s),
        page_num=pg); pg += 1

    # ── s40 · Content: closing the gap ───────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '40'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines = [clean(p) for p in s.find_all('p') if clean(p)][:4],
        page_num=pg); pg += 1

    # ── s41 · Content: identify one door ─────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '41'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines = [clean(p) for p in s.find_all('p') if clean(p)][:4],
        page_num=pg); pg += 1

    # ── s42 · Exercise: What door can your institution open? ──────────────────
    s = soup.find('section', attrs={'data-s': '42'})
    ex('07', s)

    # ── s43 · Content + image: intelligence ──────────────────────────────────
    s = soup.find('section', attrs={'data-s': '43'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines = [clean(p) for p in s.find_all('p') if clean(p)][:4],
        img_file   = img_of(s),
        page_num=pg); pg += 1

    # ── s44 · Steps: briefing format ─────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '44'})
    slide_steps(prs, eyebrow_of(s), title_of(s),
        steps = [
            ('1', 'Section 1 — What we saw',
             'Key findings from monitoring — 2–3 bullet points. What\'s new, what\'s changed, what\'s still missing.'),
            ('2', 'Section 2 — What it means for you',
             'Practical implications for members. Not analysis — direct guidance relevant to their businesses.'),
            ('3', 'Section 3 — One thing to do',
             'A concrete action members can take this month. Specific and checkable.'),
        ],
        caption  = 'Tone: peers sharing intelligence, not management reporting down.',
        page_num=pg); pg += 1

    # ── s45 · Steps: monitoring routine ──────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '45'})
    slide_steps(prs, eyebrow_of(s), title_of(s),
        steps = [
            ('1', 'Check 3–4 sources',
             'Google Alert digest, 20 TripAdvisor reviews, 5 operator pages. What\'s new, changing, or worth acting on?'),
            ('2', 'Note 2–3 findings',
             'What did you see that your members don\'t know? What trend is emerging? What gap is still there?'),
            ('3', 'Write one paragraph. Share.',
             'Send by WhatsApp, email, or raise at your next sector meeting. Done. 2 hours per quarter.'),
        ],
        page_num=pg); pg += 1

    # ── s46 · Exercise: Your multiplier ──────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '46'})
    ex('08', s)

    # ── s47 · Content: multiplier logic (SVG → text) ──────────────────────────
    s = soup.find('section', attrs={'data-s': '47'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        subtitle   = 'GT Board produces one quarterly brief. Nine associations each distribute to their members.',
        body_lines = [
            'One document reaches the whole ecosystem — with 2 hours of work.',
            'Associations: Music Union · Photographers Association · Visual Arts · Craft Market · Collecting Society · Bird Watchers · Tour Guides · Chef Association · Tourist Security Guard Association',
            'Each association multiplies the reach: one brief → hundreds of individual businesses.',
        ],
        page_num=pg); pg += 1

    # ── s48 · Photo section: from evidence to commitment ──────────────────────
    s = soup.find('section', attrs={'data-s': '48'})
    ps = s.find_all('p')
    slide_dark_section(prs,
        eyebrow   = eyebrow_of(s),
        main_text = clean(ps[0]) if ps else 'From evidence to commitment',
        caption   = clean(ps[1]) if len(ps) > 1 else None,
        page_num=pg); pg += 1

    # ── s49 · Exercise: journalist test ──────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '49'})
    ex('09', s)

    # ── s50 · Exercise: one thing in 30 days ─────────────────────────────────
    s = soup.find('section', attrs={'data-s': '50'})
    ex('10', s)

    # ── s51 · Closing + image ─────────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '51'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines = [clean(p) for p in s.find_all('p') if clean(p)][:5],
        img_file   = img_of(s),
        page_num=pg); pg += 1

    return prs


# ═════════════════════════════════════════════════════════════════════════════
# MAIN
# ═════════════════════════════════════════════════════════════════════════════

def build_day1():
    soup = BeautifulSoup(HTML_D1.read_text(encoding='utf-8'), 'lxml')
    prs  = open_template()
    route_day1(prs, soup, 'Day 1  ·  Gambia Institutional Workshop')
    out = WORKSHOP / 'day1-presentation.pptx'
    prs.save(str(out))
    print(f'Day 1 → {out}  ({len(prs.slides)} slides)')


# ═════════════════════════════════════════════════════════════════════════════
# SLIDE ROUTER — DAY 2
# ═════════════════════════════════════════════════════════════════════════════

def route_day2(prs, soup):
    pg  = 1
    DAY = 'Day 2  ·  Gambia Institutional Workshop'

    def ex(number, sec):
        nonlocal pg
        t, tm, sc, st = exercise_data(sec)
        slide_exercise(prs, number, t, tm or '15 min', sc, st, page_num=pg)
        pg += 1

    # ── s0 · Cover ──────────────────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '0'})
    slide_cover(prs,
        title      = clean(s.find('h2') or s.find('h1')),
        subtitle   = clean(s.find('p')),
        meta_items = [sp.get_text(strip=True)
                      for div in s.find_all(class_='cover-meta')
                      for sp in div.find_all('span')],
        page_num=pg); pg += 1

    # ── s1 · Cards: What we agreed on Day 1 ─────────────────────────────────
    slide_cards(prs, 'Yesterday\'s commitments', 'What we agreed on Day 1',
        cards = [
            ('Monitor',
             'Track what the world sees about The Gambia — consistently, not occasionally.',
             NAVY, WHITE),
            ('Make findable',
             'Ensure your sector and members appear where operators and tourists search.',
             ACCENT, WHITE),
            ('Open a door',
             'Connect at least one SME to an operator, platform, or journalist they couldn\'t reach alone.',
             NAVY, WHITE),
            ('Share + coordinate',
             'Act on intelligence together — at least one joint action per quarter.',
             PINK, WHITE),
        ],
        subtitle  = 'Today we return to these — to confirm, refine, and coordinate.',
        page_num=pg); pg += 1

    # ── s2 · Content: today's arc ────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '2'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines = [
            'Yesterday was about what exists and what each of you can do — individually, within your mandate, with free tools.',
            'Today is about two things: how you know it\'s working, and where doing this together produces more than doing it separately.',
        ],
        page_num=pg); pg += 1

    # ── s3 · Programme ───────────────────────────────────────────────────────
    slide_content(prs, 'Friday · 8:30 – 13:00', 'Today\'s programme',
        body_lines = [
            '8:30 – 9:00    Opening — recap of Day 1 commitments, arc of today',
            '9:00 – 10:00   Session 5 · Digital Ecosystem and Institutional Visibility — governance, SEO, partnerships, seasonal presence, crisis',
            '10:00 – 11:00  Session 6 · Monitoring Progress — framework, KPIs, coordination, exercises',
            '11:00 – 11:15  Break',
            '11:15 – 13:00  Wrap-Up · Priorities, Commitments, and Coordination — synthesis, 30-day commitments, coordination mechanism, close',
        ],
        page_num=pg); pg += 1

    # ══════════════════════════════════════════════════════════════════════════
    # SESSION 5 — DIGITAL ECOSYSTEM AND INSTITUTIONAL VISIBILITY
    # ══════════════════════════════════════════════════════════════════════════

    slide_divider(prs,
        eyebrow  = 'Session 5',
        title    = 'Digital Ecosystem and\nInstitutional Visibility',
        subtitle = 'Who maintains what, who owns what, and what falls through the gaps.',
        deco     = '5',
        page_num=pg); pg += 1

    # ── Platform governance (digital orphans) ────────────────────────────────
    s = soup.find('section', attrs={'data-s': '12'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        subtitle   = 'Platform governance is an organisational question, not a technical one.',
        body_lines = [
            'For each official platform — website, social media, Google Business profile — who has admin access?',
            'Who is responsible for updates? What happens when that person leaves?',
            'Digital orphans: platforms created for projects that ended without a handover plan. Still live, still appearing credible to visitors, but containing outdated information.',
            'Starting action: one spreadsheet, one hour — list every official digital touchpoint, note when it was last updated, identify who has access.',
        ],
        img_file   = img_of(s),
        page_num=pg); pg += 1

    # ── Institutional role in destination-level SEO ──────────────────────────
    slide_content(prs,
        eyebrow    = 'Destination-level SEO',
        title      = 'The institutional role in how The Gambia appears in search',
        body_lines = [
            'Individual operators appear in search results for their own names — but who ensures The Gambia appears as a destination for visitors who don\'t yet know which operator to book with?',
            'This is the destination-level search problem. It is not solved by any individual SME — it requires coordinated institutional action.',
            'Content aggregation: a single authoritative source of what The Gambia offers — maintained consistently, shared across partner platforms and media.',
            'Search engines reward consistency: the same correct, updated information appearing across GT Board, NCAC listings, and verified operator profiles.',
        ],
        img_file   = 'visit_the_gambia_homepage.png',
        page_num=pg); pg += 1

    # ── OTA / media / influencer partnerships ────────────────────────────────
    slide_content(prs,
        eyebrow    = 'What institutions can broker',
        title      = 'Partnerships SMEs cannot open alone',
        body_lines = [
            'OTAs — negotiating creative tourism categories on GetYourGuide, Viator, or Booking Experiences requires institutional credibility, not just individual applications.',
            'Travel media — pitching The Gambia to Lonely Planet, BBC Travel, or specialist press is more effective from a national institution than from an individual artisan.',
            'Influencer programmes — a curated programme managed by GT Board, where institutions vet, brief, and facilitate, gives far greater control over messaging than ad hoc SME arrangements.',
            'Trade fairs — World Travel Market, ITB Berlin: institutions attend and can carry SME profiles into rooms those SMEs will never enter alone.',
        ],
        page_num=pg); pg += 1

    # ── Seasonal visibility / off-season problem ─────────────────────────────
    slide_content(prs,
        eyebrow    = 'The off-season problem',
        title      = 'Keeping The Gambia visible year-round',
        body_lines = [
            'The Gambia\'s main tourist season runs October–April. Between May and September, search interest drops sharply — while competitor destinations maintain their content and campaigns.',
            'The visibility gap: a potential visitor searching in July finds stale content from the previous peak season. The destination loses consideration at the planning stage.',
            'Institutional role: schedule consistent content updates, press releases, and social media activity regardless of season. The same effort in August has greater impact because so few competitors are active.',
            'Practical anchor: a quarterly content calendar, maintained by GT Board and shared with associations — agreed topics, agreed timing, consistent presence.',
        ],
        img_file   = 'gambia_senegal_googletrends.png',
        page_num=pg); pg += 1

    # ── Crisis and reputation management ─────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '11'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines = [
            'Your monitoring routine will surface problems. Institutions need an agreed protocol before a crisis, not during one.',
            'Designate one person per institution responsible for weekly monitoring. Set a Google Alert for "The Gambia" + your sector name.',
            'Agree a response threshold — any review below 3 stars on an official platform, or any factual error, triggers a response within 24 hours.',
            'Share patterns of negative reviews at the quarterly call — don\'t manage reputation in isolation.',
        ],
        img_file   = img_of(s),
        page_num=pg); pg += 1

    # ══════════════════════════════════════════════════════════════════════════
    # SESSION 6 — MONITORING PROGRESS
    # ══════════════════════════════════════════════════════════════════════════

    slide_divider(prs,
        eyebrow  = 'Session 6',
        title    = 'Monitoring Progress:\nBuilding a Simple Intelligence Routine',
        subtitle = 'A simple check done consistently is more valuable than a comprehensive study done once every two years.',
        deco     = '6',
        page_num=pg); pg += 1

    # ── Quote ────────────────────────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '5'})
    slide_quote(prs,
        eyebrow     = eyebrow_of(s),
        quote_text  = clean(s.find(class_='big-quote')),
        attribution = clean(s.find(class_='quote-sub')),
        source      = clean(s.find('p')) if s.find('p') else None,
        page_num=pg); pg += 1

    # ── Three monitoring questions ────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '6'})
    slide_steps(prs, eyebrow_of(s), title_of(s),
        steps = [
            ('1', 'Are we being found?',
             'By the right audiences, on the platforms they use to plan and book.'),
            ('2', 'Right experience?',
             'Are visitors having the experience we want them to have and report?'),
            ('3', 'Improving over time?',
             'Consistency matters more than any single data point. Is the trend moving?'),
        ],
        page_num=pg); pg += 1

    # ── Three tools overview ──────────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '7'})
    slide_steps(prs, eyebrow_of(s), title_of(s),
        steps = [
            ('Q', 'Operator catalogue check',
             'Visit 10 key operators each quarter — same ones each time. Note what they feature. 2 hours / quarter.'),
            ('M', 'Review sentiment scan',
             'Read 20 most recent TripAdvisor reviews monthly. Note themes, flag issues. 1 hour / month.'),
            ('A', 'Annual benchmarking snapshot',
             'Same D1 dimensions — social media, website currency, discoverability, booking. Half a day / year.'),
        ],
        page_num=pg); pg += 1

    # ── Quarterly catalogue check ─────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '8'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines = [
            'Visit the websites of 10 key operators selling The Gambia — same 10 each quarter.',
            'Note: How is The Gambia described? Which experiences are featured? What images are used? Is your sector present?',
            'Record in a simple shared spreadsheet. Compare quarter-on-quarter — the trend matters more than any single snapshot.',
            '2 hours per quarter. No login, no account, no cost.',
        ],
        page_num=pg); pg += 1

    # ── Monthly sentiment scan ────────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '9'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines = [
            'Read the 20 most recent TripAdvisor reviews for The Gambia destination page and 2–3 key attractions.',
            'Note recurring themes — both positive and negative.',
            'Flag anything requiring a response: below 3 stars, specific complaint, or factual error.',
            'Track direction of travel: improving / stable / declining. The Gambia\'s current baseline is +0.24.',
        ],
        img_file   = img_of(s),
        page_num=pg); pg += 1

    # ── Annual benchmarking ───────────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '10'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines = [
            'Once a year: assess The Gambia\'s digital presence using the same D1 dimensions.',
            'Social media activity, website currency, discoverability, booking capability.',
            'Compare year-on-year to track overall progress across sectors.',
            'D1 and D2 baselines provide the Year 1 starting point — already done.',
        ],
        img_file   = img_of(s),
        page_num=pg); pg += 1

    # ── Shared tracking template ──────────────────────────────────────────────
    slide_content(prs,
        eyebrow    = 'The shared tracking template',
        title      = 'One spreadsheet. Three tools. All institutions.',
        body_lines = [
            'The template has three tabs: Operator Catalogue (quarterly), Sentiment Scan (monthly), Annual Benchmarking.',
            'Each institution records its own findings. GT Board maintains the master copy and adds a summary column.',
            'Format: institution name · date · finding · direction (↑ ↓ →) · flag for joint action (Y/N).',
            'Review the shared template at each quarterly coordination call — this is what turns individual monitoring into shared intelligence.',
        ],
        page_num=pg); pg += 1

    # ── KPI starting set ──────────────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '13'})
    slide_table(prs, eyebrow_of(s), title_of(s),
        headers = ['Indicator', '2025 Baseline', '2026 Target', 'How to track'],
        rows    = [
            ['ITO creative tourism visibility',   '52%',      '60%',    'Quarterly operator catalogue check'],
            ['Average visitor sentiment score',   '+0.24',    '+0.30',  'Monthly TripAdvisor scan'],
            ['Verified TripAdvisor reviews',      'Baseline', '+25%',   'Monthly TripAdvisor scan'],
            ['Average review rating',             'Baseline', '+0.2',   'Monthly TripAdvisor scan'],
        ],
        subtitle = 'Ready-made from D2 Table 20. You don\'t need to design your own starting framework.',
        page_num=pg); pg += 1

    # ── From monitoring to SME guidance ──────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '14'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines = [
            'Monitoring shared only within institutions has limited value. The goal is to translate intelligence into guidance SMEs can act on.',
            'Quarterly briefing note: one page, what the data shows, what it means for operators. 2 hours to produce. Distribute via WhatsApp or email.',
            'Short alert: when something significant changes — a new operator selling The Gambia, a cluster of negative reviews. Triggered, not scheduled.',
            'Tone: "here is what we are seeing and what it might mean for you" — not evaluation or judgement.',
        ],
        img_file   = img_of(s),
        page_num=pg); pg += 1

    # ── Monitoring together ───────────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '15'})
    ps = s.find_all('p')
    slide_dark_section(prs,
        eyebrow   = eyebrow_of(s),
        main_text = 'Monitoring done by one institution produces one view.\nMonitoring shared by three produces a picture no single institution could create alone.',
        caption   = 'The quarterly call is the mechanism. GT Board convenes. NCAC, associations, and sector bodies share what they\'ve seen.',
        page_num=pg); pg += 1

    # ── Quarterly coordination call ───────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '16'})
    slide_steps(prs, eyebrow_of(s), title_of(s),
        steps = [
            ('1', 'Share',
             'What has each institution observed in the past quarter? One thing each — a trend, a finding, a flag.'),
            ('2', 'Identify',
             'What\'s new, changing, or worth acting on together? Where do findings from different institutions point in the same direction?'),
            ('3', 'Agree',
             'Is there one joint response this quarter? Assign it to a named person before the call ends.'),
        ],
        page_num=pg); pg += 1

    # ── Who convenes? ─────────────────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '17'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines = [
            'GT Board — Lead coordinator and custodian of shared KPI data. Convenes the quarterly call. Maintains the monitoring spreadsheet. Distributes the annual benchmarking summary.',
            'NCAC + associations — Core participants. Each brings their sector\'s observation from the past quarter. Contribute to operator catalogue check where mandates align.',
            'Ministry of Tourism — Observer and escalation point. Summary note shared after each quarterly meeting. Not required to convene.',
            'Key criterion: not who should be there — who will reliably show up.',
        ],
        page_num=pg); pg += 1

    # ── Exercise: Read TripAdvisor ────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '18'})
    ex('01', s)

    # ── TripAdvisor share-back ────────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '19'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        subtitle   = 'Groups of 3 — compare notes. Then share back to the room.',
        body_lines = [
            'What was the main positive theme repeated across reviews?',
            'Was there a recurring complaint or criticism?',
            'Was your sector or institution mentioned anywhere?',
            'What would change if an institution read this monthly instead of never?',
        ],
        img_file   = img_of(s),
        page_num=pg); pg += 1

    # ── Exercise: Draft your three indicators ─────────────────────────────────
    s = soup.find('section', attrs={'data-s': '20'})
    ex('02', s)

    # ── Exercise: Pairs exchange ──────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '21'})
    ex('03', s)

    # ══════════════════════════════════════════════════════════════════════════
    # WRAP-UP — PRIORITIES, COMMITMENTS, AND COORDINATION
    # ══════════════════════════════════════════════════════════════════════════

    s = soup.find('section', attrs={'data-s': '22'})
    slide_divider(prs,
        eyebrow  = 'Wrap-Up',
        title    = 'Priorities, Commitments,\nand Coordination',
        subtitle = 'Specific. Checkable. Realistic. — and agreed before you leave the room.',
        deco     = '↗',
        page_num=pg); pg += 1

    # ── Facilitator synthesis ─────────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '23'})
    slide_content(prs, 'Part 1 — What we learned · 30 min', 'Facilitator synthesis',
        subtitle   = '3–4 themes from across the two days — populated live by the facilitator.',
        body_lines = [
            '[ Theme 1 — facilitator completes live ]',
            '[ Theme 2 — facilitator completes live ]',
            '[ Theme 3 — facilitator completes live ]',
            '"What confirmed existing assumptions, and what challenged them? Both are useful — but they call for different responses."',
        ],
        page_num=pg); pg += 1

    # ── One thing that stuck ──────────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '24'})
    slide_quote(prs,
        eyebrow     = eyebrow_of(s),
        quote_text  = 'In one sentence: the finding or idea that was most useful or most surprising.',
        attribution = 'Round the table. One sentence each. No extended discussion yet.',
        source      = 'Facilitator: note any themes that haven\'t been captured — they may surface here.',
        page_num=pg); pg += 1

    # ── Exercise: One concrete action in 30 days ──────────────────────────────
    s = soup.find('section', attrs={'data-s': '25'})
    ex('04', s)

    # ── Commitments board ─────────────────────────────────────────────────────
    slide_cards(prs, 'Part 2 — Priority actions · 45 min', 'Commitments board — capture by theme',
        cards = [
            ('Monitor',
             'Track what the world sees — consistently, not occasionally.',
             NAVY, WHITE),
            ('Make findable',
             'Ensure your sector and members are discoverable where operators and tourists search.',
             ACCENT, WHITE),
            ('Open a door',
             'Connect one operator, platform, or journalist to one SME they couldn\'t reach alone.',
             NAVY, WHITE),
            ('Share + coordinate',
             'Act on intelligence together — at least one joint action per quarter.',
             PINK, WHITE),
        ],
        subtitle  = 'Facilitator collects commitments and groups them on the board by category.',
        page_num=pg); pg += 1

    # ── Exercise: Draft one briefing paragraph ────────────────────────────────
    s = soup.find('section', attrs={'data-s': '27'})
    ex('05', s)

    # ── Where coordination amplifies ──────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '28'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        subtitle   = 'Look at the board: where would two institutions working together produce more than two working separately?',
        body_lines = [
            '"One quarterly operator spot-check, shared between GT Board and NCAC, covers more ground than two separate ones."',
            '"A joint press release from GT Board + NCAC carries more authority than one from either alone."',
            '"If Tour Guide Association and Craft Market Federation both briefed visitors about each other, both sectors would benefit."',
        ],
        page_num=pg); pg += 1

    # ── Minimum viable mechanism ─────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '29'})
    slide_steps(prs, 'Part 3 — Coordination mechanism · 30 min', 'A minimum viable mechanism',
        steps = [
            ('1', 'Quarterly check-in',
             'GT Board + NCAC + willing associations. Start here. Nothing more required.'),
            ('2', 'Share observations',
             'Each institution shares what they\'ve observed and one thing they\'ve done in the past quarter.'),
            ('3', 'Agree joint response',
             'Is there one thing worth doing together this quarter? Assign it to a named person. Done.'),
        ],
        caption  = '"Format: a call, a brief meeting, or a shared document — whatever is most likely to actually happen."',
        page_num=pg); pg += 1

    # ── If there's appetite for more ─────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '30'})
    slide_content(prs, eyebrow_of(s), title_of(s),
        body_lines = [
            'A lightweight quarterly briefing note — shared across institutions and select SMEs — summarising what the monitoring data shows.',
            'Designed to be produced in 2 hours. Distributed via WhatsApp or email.',
            'Not a new project. It is what consistent monitoring produces.',
            'Before leaving: agree the date of the first quarterly check-in, who convenes, and what format.',
        ],
        page_num=pg); pg += 1

    # ── Before leaving the room ───────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '31'})
    slide_steps(prs, 'Before you leave', 'Three things to agree before the room empties',
        steps = [
            ('1', 'Date of the first quarterly check-in',
             'A specific date — not "sometime in Q3." Write it down. Put it in a calendar before you leave.'),
            ('2', 'Who convenes',
             'A specific person, not an institution. The convener sends the invite, sets the agenda, keeps the notes.'),
            ('3', 'One action, agreed in the room',
             'One thing — specific, with a name against it — that at least two institutions commit to doing before the next meeting.'),
        ],
        page_num=pg); pg += 1

    # ── Closing quote ─────────────────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '32'})
    slide_quote(prs,
        eyebrow     = eyebrow_of(s),
        quote_text  = clean(s.find(class_='big-quote') or s.find('p')),
        attribution = 'The SMEs you met this week are building their digital presence.',
        source      = 'The infrastructure they need to connect to the world is what you build next.',
        page_num=pg); pg += 1

    # ── One word round the room ───────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '33'})
    ex('06', s)

    # ── Close cover: Thank you ────────────────────────────────────────────────
    s = soup.find('section', attrs={'data-s': '34'})
    slide_cover(prs,
        title      = clean(s.find('h1') or s.find('h2')),
        subtitle   = clean(s.find('p')),
        meta_items = ['ITC EU Youth Empowerment Project', 'Banjul, The Gambia', 'May 2026'],
        page_num=pg); pg += 1

    return prs


def build_day2():
    soup = BeautifulSoup(HTML_D2.read_text(encoding='utf-8'), 'lxml')
    prs  = open_template()
    route_day2(prs, soup)
    out = WORKSHOP / 'day2-presentation.pptx'
    prs.save(str(out))
    print(f'Day 2 → {out}  ({len(prs.slides)} slides)')


if __name__ == '__main__':
    import sys
    day = sys.argv[1] if len(sys.argv) > 1 else 'both'
    if day in ('1', 'both'):
        print('Building Day 1 (52 slides)…')
        build_day1()
    if day in ('2', 'both'):
        print('Building Day 2 (35 slides)…')
        build_day2()
