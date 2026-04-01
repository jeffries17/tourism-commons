import { useState } from 'react'
import type { DashboardData } from '../types'
import { THEME_LABELS, THEME_ORDER } from '../types'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Props { data: DashboardData }

const THEME_KEYWORDS: Record<string, string[]> = {
  wildlife_experience: ['wildlife','animal','elephant','lion','leopard','cheetah','buffalo','rhino','hippo','crocodile','giraffe','zebra','wild dog','african wild dog','painted dog','antelope','impala','kudu','waterbuck','eland','wildebeest','warthog','mongoose','hyena','jackal','vulture','bird','birding','birdwatching','big five','big 5','predator','game','herd','sighting','spoor','track','tracking','game drive','game viewing','safari','ranger','tracker','guide','encounter','spot','spotted','watch','viewing'],
  eco_conservation: ['conservation','conservancy','conserve','ecosystem','sustainable','sustainability','responsible','eco','ecotourism','carbon','footprint','low impact','environment','environmental','protect','protection','wilderness','pristine','untouched','concession','community benefit','local community','natural habitat','green','ethical','no footprint','minimal impact','anti-poaching','poaching','ranger program','research'],
  service_hospitality: ['staff','guide','service','friendly','helpful','knowledgeable','hospitable','welcoming','professional','courteous','attentive','host','informative','passionate','enthusiastic','crew','ranger','tracker','camp manager','cook','chef','pilot','driver','employee','team','exceptional service','above and beyond','personalized'],
  accommodation_quality: ['tent','camp','lodge','chalet','suite','room','bed','comfortable','luxury','facilities','bathroom','shower','toilet','clean','amenities','pool','deck','veranda','view','design','interior','rustic','glamping','bush camp','mobile camp','permanent camp','tented camp','air conditioned','mosquito net','hot water'],
  value_money: ['price','expensive','worth','value','money','cost','fee','affordable','overpriced','budget','luxury','premium','pay','paid','all-inclusive','inclusive','package','reasonable','cheap','pricey','worthwhile','rip off','bargain','investment','splurge'],
  accessibility_logistics: ['transfer','fly','flight','airstrip','road','drive','vehicle','4x4','distance','remote','reach','access','arrive','charter','small plane','offroad','off-road','bush plane','landing strip','pickup','drop-off','long drive','rough road','difficult to reach'],
  adventure_activities: ['mokoro','dugout canoe','canoe','kayak','paddle','walking safari','bush walk','walk on foot','on foot','horseback','horse riding','horse safari','boat cruise','boat safari','river cruise','sundowner cruise','night drive','night game drive','fly camp','fly camping','sleeping under stars','hot air balloon','balloon','quad bike','quad biking','cycling safari','mountain bike','adventure','thrill','adrenaline','expedition','activity','activities','excursion'],
  safety: ['safe','safety','dangerous','danger','risk','risky','malaria','medication','protection','guard','secure','armed','emergency','wildlife safety','attack','charged','close encounter','too close','precaution','careful','cautious','warning','hazard'],
  atmosphere_wilderness: ['wilderness','remote','isolated','peaceful','quiet','stunning','beautiful','breathtaking','dramatic','vast','open','landscape','scenery','sunset','sunrise','star','starlit','stars','milky way','silence','solitude','exclusive','private','pristine','untouched','magical','spectacular','incredible','amazing','unforgettable','once in a lifetime','bucket list','dream','paradise','nature','bush','floodplain','delta','savanna'],
  food_dining: ['food','meal','dinner','lunch','breakfast','chef','cuisine','bush dinner','bush breakfast','bush lunch','sundowner','cocktail','drink','wine','gin','beer','cooking','taste','delicious','excellent food','braai','bbq','barbeque','campfire','fire','fresh','local produce','dietary','vegetarian'],
  environmental_sensitivity: ['crowded','crowd','tourist','people','noise','noisy','other vehicle','other vehicles','too many','busy','overrun','mass tourism','litter','littered','disturb','disturbing','impact','footprint','damage','degraded','overdeveloped','exclusive','no crowds','no other'],
}

function ThemeKeywords({ theme }: { theme: string }) {
  const [open, setOpen] = useState(false)
  const keywords = THEME_KEYWORDS[theme] ?? []
  return (
    <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-[#F9FAFB] transition-colors text-left"
      >
        <span className="text-sm font-medium text-[#1C1C1E]">{THEME_LABELS[theme]}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6B7280]">{keywords.length} keywords</span>
          {open ? <ChevronUp size={14} className="text-[#6B7280]" /> : <ChevronDown size={14} className="text-[#6B7280]" />}
        </div>
      </button>
      {open && (
        <div className="px-4 py-3 bg-[#FAFAF8] border-t border-[#E5E7EB]">
          <div className="flex flex-wrap gap-1.5">
            {keywords.map(kw => (
              <span key={kw} className="text-xs bg-[#E0F2F1] text-[#00695C] px-2 py-0.5 rounded-full font-medium">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Methodology({ data }: Props) {
  const { metadata } = data

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Methodology</h1>
        <p className="text-[#6B7280] text-sm mt-1">
          How the analysis was conducted, what data was used, and how scores are calculated.
        </p>
      </div>

      {/* Data scope */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-[#1C1C1E]">Data Scope</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Source', value: 'TripAdvisor' },
            { label: 'Reviews', value: metadata.total_reviews.toLocaleString() },
            { label: 'Operators', value: `${metadata.total_stakeholders}` },
            { label: 'Period', value: 'Mar 2021 – 2026' },
          ].map(item => (
            <div key={item.label} className="bg-[#FAFAF8] rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-[#1C1C1E]">{item.value}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="text-sm text-[#374151] space-y-2 pt-2 border-t border-[#E5E7EB]">
          <p>
            <strong>Review period:</strong> Reviews from March 2021 onwards were selected to reflect post-pandemic operations.
            Reviews from March 2020–February 2021 were excluded as COVID-19 significantly disrupted tourism operations and
            visitor experiences during this period do not reflect the current product offering.
          </p>
          <p>
            <strong>Operator selection:</strong> 74 operators were scraped from TripAdvisor's "Things to Do" category for Botswana.
            Each was scored for ecotourism and adventure tourism relevance using keyword density analysis.
            62 operators were included; 12 were excluded (shopping malls, temples, government buildings, and similar non-tourism venues).
            A full exclusions log is available on request.
          </p>
          <p>
            <strong>Language harmonization:</strong> Reviews were translated to English using Google Cloud Translation.
            94.4% of reviews were in English; the remainder were in French, German, Spanish, Dutch, Italian, and Chinese.
            Original language metadata is preserved for all reviews.
          </p>
        </div>
      </div>

      {/* Sentiment scoring */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm space-y-3">
        <h2 className="font-semibold text-[#1C1C1E]">Sentiment Scoring</h2>
        <p className="text-sm text-[#374151]">
          Sentiment is calculated using <strong>TextBlob</strong>, a Python natural language processing library.
          Each review is scored on a polarity scale from −1 (very negative) to +1 (very positive).
          Scores are calculated at the sentence level for theme-specific sentiment, and at the full-review level for overall sentiment.
        </p>
        <p className="text-sm text-[#374151]">
          Theme scores reflect the sentiment of sentences containing that theme's keywords — not just whether the
          keyword was mentioned. A review mentioning "wildlife" in a negative context will score negatively on
          Wildlife Experience.
        </p>
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { label: 'Strong', range: '≥ 0.30', color: '#059669', bg: '#F0FDF4' },
            { label: 'Positive', range: '0.15 – 0.29', color: '#16A34A', bg: '#F0FDF4' },
            { label: 'Mixed', range: '0.05 – 0.14', color: '#D97706', bg: '#FFFBEB' },
            { label: 'Needs Attention', range: '< 0.05', color: '#DC2626', bg: '#FEF2F2' },
          ].map(item => (
            <div key={item.label} className="rounded-lg p-3 text-center" style={{ background: item.bg }}>
              <p className="text-sm font-semibold" style={{ color: item.color }}>{item.label}</p>
              <p className="text-xs mt-0.5" style={{ color: item.color }}>{item.range}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Eco-credibility */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm space-y-3">
        <h2 className="font-semibold text-[#1C1C1E]">Eco-Credibility Index</h2>
        <p className="text-sm text-[#374151]">
          The Eco-Credibility Index is a composite metric derived from review language — a proxy for how well
          an operator delivers on Botswana's conservation-first brand promise. It is calculated as a weighted
          combination of four themes:
        </p>
        <div className="space-y-2 pt-1">
          {Object.entries(metadata.eco_credibility_weights).map(([theme, weight]) => (
            <div key={theme} className="flex items-center justify-between">
              <span className="text-sm text-[#374151]">{THEME_LABELS[theme] ?? theme}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-[#E5E7EB] rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-[#00695C]" style={{ width: `${weight * 100}%` }} />
                </div>
                <span className="text-xs font-medium text-[#00695C] w-8 text-right">{Math.round(weight * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Theme keywords */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
        <h2 className="font-semibold text-[#1C1C1E] mb-1">Theme Keyword Lists</h2>
        <p className="text-[#6B7280] text-sm mb-4">
          Each theme is detected by scanning review text for these keywords. Click a theme to expand the full keyword list.
        </p>
        <div className="space-y-2">
          {THEME_ORDER.map(t => <ThemeKeywords key={t} theme={t} />)}
        </div>
      </div>
    </div>
  )
}
