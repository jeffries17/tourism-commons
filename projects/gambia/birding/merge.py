"""Merge Pass 1 lowpri triage + Pass 2 research blocks into final outputs."""
import csv, re, os

BIRDING = '/Users/alexjeffries/Tourism/tourism-commons/projects/gambia/birding'

# Parse research.md per-org blocks
with open(f'{BIRDING}/pass2/research.md') as f:
    text = f.read()

# Blocks are separated by lines containing only `---`
raw_blocks = re.split(r'\n---\n', text)
deepdive = []
for block in raw_blocks:
    if 'Organization:' not in block:
        continue
    def get(field, default=''):
        m = re.search(rf'^{field}:\s*(.+?)$', block, re.MULTILINE)
        return m.group(1).strip() if m else default
    def get_section(name):
        m = re.search(rf'^{name}:\s*\n(.+?)(?=\n[A-Z][^:\n]*:|\Z)', block, re.MULTILINE | re.DOTALL)
        return (m.group(1).strip() if m else '').replace('\n', ' ')
    name = get('Organization')
    if not name:
        continue
    deepdive.append({
        'name': name,
        'website': get('Website'),
        'country': get('Country'),
        'category': get('Category'),
        'priority': get('Priority Level'),
        'summary': get_section('Summary'),
        'why_relevant': get_section('Why Relevant'),
        'engagement_goal': get_section('Suggested Engagement Goal'),
        'source': 'pass2',
    })

print(f'Parsed {len(deepdive)} deepdive blocks')

# Pass 1 lowpri rows -> all auto-D / Low
with open(f'{BIRDING}/triage.csv') as f:
    triage_rows = list(csv.DictReader(f))
lowpri = []
deepdive_names = {d['name'] for d in deepdive}
for r in triage_rows:
    if r['bucket'] != 'lowpri':
        continue
    lowpri.append({
        'name': r['name'],
        'website': '',
        'country': r['country'],
        'category': 'D',
        'priority': 'Low',
        'summary': r['pass1_note'],
        'why_relevant': 'Triaged from name+country signal; not a primary trade/conservation target for Gambian birding outreach.',
        'engagement_goal': 'Skip or courtesy visit only.',
        'source': 'pass1',
    })

# Combine
all_orgs = deepdive + lowpri
print(f'Total orgs in output: {len(all_orgs)}')

# Write CSV
csv_path = f'{BIRDING}/gambia_birdfair_classification.csv'
fields = ['name', 'country', 'category', 'priority', 'website', 'summary', 'why_relevant', 'engagement_goal', 'source']
with open(csv_path, 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    for o in all_orgs:
        w.writerow({k: o.get(k, '') for k in fields})
print('wrote', csv_path)

# Write final markdown grouped by category+priority
PRIORITY_ORDER = {'High': 0, 'Medium': 1, 'Low': 2}
CATEGORY_ORDER = {'A': 0, 'B': 1, 'C': 2, 'D': 3}
CATEGORY_LABEL = {
    'A': 'A — Existing Gambia Sellers',
    'B': 'B — West Africa / Regional Birding Specialists',
    'C': 'C — International Birding & Nature Tourism Operators (potential future fit)',
    'D': 'D — Institutional / Conservation / Media / Ecosystem Stakeholders',
}

# Sort
def sort_key(o):
    return (CATEGORY_ORDER.get(o['category'], 99),
            PRIORITY_ORDER.get(o['priority'], 99),
            o['name'].lower())
all_orgs.sort(key=sort_key)

from collections import Counter
by_cat = Counter(o['category'] for o in all_orgs)
by_cat_pri = Counter((o['category'], o['priority']) for o in all_orgs)

md = []
md.append('# Global Birdfair 2026 — Gambia Trade-Fair Prep')
md.append('')
md.append('**Source list:** Rutland Global Birdfair Exhibitors workbook (228 organisations across 46 countries).')
md.append('**Methodology:** Two-pass triage. Pass 1 classified obvious non-targets from name + country signal alone. Pass 2 visited the website of every plausible trade buyer, regional specialist, conservation body and US operator (63 organisations) and produced full A/B/C/D classification blocks with priority levels and engagement goals.')
md.append('')
md.append('## Category legend')
md.append('')
md.append('- **A** — Existing Gambia Seller (verified active Gambia tour or programme)')
md.append('- **B** — West Africa / Regional Birding Specialist (visible W Africa focus, even if not Gambia today)')
md.append('- **C** — International Birding & Nature Tourism Operator (global/multi-region birding op without current W Africa focus — potential future fit)')
md.append('- **D** — Institutional / Conservation / Media / Ecosystem Stakeholder')
md.append('')
md.append('## Counts')
md.append('')
md.append('| Category | High | Medium | Low | Total |')
md.append('|----------|------|--------|-----|-------|')
for cat in ['A','B','C','D']:
    high = by_cat_pri.get((cat, 'High'), 0)
    med  = by_cat_pri.get((cat, 'Medium'), 0)
    low  = by_cat_pri.get((cat, 'Low'), 0)
    md.append(f'| {cat} | {high} | {med} | {low} | {by_cat.get(cat, 0)} |')
md.append('')
md.append('---')
md.append('')

# Group
from itertools import groupby
for cat in ['A','B','C','D']:
    cat_orgs = [o for o in all_orgs if o['category'] == cat]
    if not cat_orgs:
        continue
    md.append(f'## {CATEGORY_LABEL[cat]}')
    md.append('')
    for prio in ['High', 'Medium', 'Low']:
        prio_orgs = [o for o in cat_orgs if o['priority'] == prio]
        if not prio_orgs:
            continue
        md.append(f'### Priority: {prio} ({len(prio_orgs)})')
        md.append('')
        for o in prio_orgs:
            md.append(f"**{o['name']}**  ")
            md.append(f"_{o['country']}_  ")
            if o['website']:
                md.append(f"Website: {o['website']}  ")
            md.append('')
            md.append(f"**Summary:** {o['summary']}")
            md.append('')
            md.append(f"**Why relevant:** {o['why_relevant']}")
            md.append('')
            md.append(f"**Engagement goal:** {o['engagement_goal']}")
            md.append('')
            md.append('---')
            md.append('')

out_md = f'{BIRDING}/gambia_birdfair_classification.md'
with open(out_md, 'w') as f:
    f.write('\n'.join(md))
print('wrote', out_md)
print()
print('Category counts:', dict(by_cat))
print('By cat+priority:')
for k in sorted(by_cat_pri):
    print(f'  {k}: {by_cat_pri[k]}')
