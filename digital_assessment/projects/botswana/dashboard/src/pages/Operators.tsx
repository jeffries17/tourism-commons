import { useState } from 'react'
import type { DashboardData, Stakeholder } from '../types'
import { THEME_LABELS, THEME_ORDER, sentimentLabel, SECTOR_LABELS } from '../types'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'

interface Props { data: DashboardData }

type SortKey = 'name' | 'sentiment' | 'eco' | 'reviews' | 'rating'
type SectorFilter = 'all' | 'reserve' | 'lodge' | 'operator' | 'activity'

const ECO_BAR_COLOR = '#00695C'

function EcoBar({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-[#E5E7EB] rounded-full h-1.5">
        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: ECO_BAR_COLOR }} />
      </div>
      <span className="text-xs font-medium text-[#00695C] w-8 text-right">{pct}%</span>
    </div>
  )
}

function OperatorCard({ op, expanded, onToggle }: { op: Stakeholder; expanded: boolean; onToggle: () => void }) {
  const sl = sentimentLabel(op.overall_sentiment)
  const radarData = THEME_ORDER.map(t => ({
    theme: THEME_LABELS[t].split(' ').slice(0, 2).join(' '),
    value: Math.round(Math.max(((op.theme_scores[t]?.sentiment_score ?? 0) + 0.1) / 0.6 * 100, 0)),
  }))

  // Top and bottom themes for this operator
  const rankedThemes = [...THEME_ORDER]
    .filter(t => (op.theme_scores[t]?.mentions ?? 0) > 0)
    .sort((a, b) => (op.theme_scores[b]?.sentiment_score ?? 0) - (op.theme_scores[a]?.sentiment_score ?? 0))

  const totalMentions = Object.values(op.theme_scores).reduce((s, v) => s + (v.mentions ?? 0), 0)
  const lowData = op.total_reviews < 5

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs text-[#6B7280] capitalize">
                {SECTOR_LABELS[op.sector] ?? op.sector}
              </span>
              {op.zone !== 'Other' && (
                <>
                  <span className="text-[#D1D5DB]">·</span>
                  <span className="text-xs text-[#6B7280]">{op.zone}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[#1C1C1E] text-sm leading-snug truncate">{op.stakeholder_name}</h3>
              {lowData && (
                <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                  Low data
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-xs font-semibold" style={{ color: sl.color }}>{sl.label}</span>
              <span className="text-xs text-[#6B7280]">{op.total_reviews} reviews</span>
              {op.average_rating > 0 && (
                <span className="text-xs text-[#6B7280]">★ {op.average_rating.toFixed(1)}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {op.tripadvisor_url && (
              <a
                href={op.tripadvisor_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6B7280] hover:text-[#00695C] transition-colors"
                onClick={e => e.stopPropagation()}
              >
                <ExternalLink size={14} />
              </a>
            )}
            <button
              onClick={onToggle}
              className="text-[#6B7280] hover:text-[#1C1C1E] transition-colors"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Eco bar */}
        <div className="mt-3">
          <div className="flex justify-between mb-1">
            <span className="group/eco relative text-xs text-[#6B7280] cursor-help underline decoration-dotted">
              Eco-credibility
              <span className="absolute bottom-full left-0 mb-2 w-56 px-3 py-2 rounded-lg bg-[#1C1C1E] text-white text-[10px] leading-relaxed opacity-0 group-hover/eco:opacity-100 transition-opacity pointer-events-none shadow-lg z-10">
                Composite score based on how often reviews mention conservation, wildlife, wilderness, and environmental sensitivity — and how positively.
              </span>
            </span>
          </div>
          <EcoBar score={op.eco_credibility_score} />
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#E5E7EB] p-4 bg-[#FAFAF8]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Radar */}
            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-0.5">Theme Sentiment Profile</p>
              <p className="text-[10px] text-[#9CA3AF] mb-3">How positively visitors write about each theme</p>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData} margin={{ top: 4, right: 16, bottom: 4, left: 16 }}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="theme" tick={{ fontSize: 8, fill: '#9CA3AF' }} />
                  <Radar dataKey="value" stroke="#00695C" fill="#00695C" fillOpacity={0.15} strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
              {lowData && (
                <p className="text-[10px] text-[#D97706] mt-1 text-center">⚠ Shape based on {totalMentions} total mentions — interpret with caution</p>
              )}
            </div>

            {/* Theme scores */}
            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-0.5">Theme Breakdown</p>
              <p className="text-[10px] text-[#9CA3AF] mb-3">Sentiment quality · faded rows have fewer than 3 mentions</p>
              <div className="space-y-2">
                {rankedThemes.slice(0, 6).map(t => {
                  const score = op.theme_scores[t]?.sentiment_score ?? 0
                  const mentions = op.theme_scores[t]?.mentions ?? 0
                  const lowMentions = mentions < 3
                  const color = score >= 0.2 ? '#059669' : score >= 0.05 ? '#D97706' : '#DC2626'
                  return (
                    <div key={t} className="flex items-center gap-2" style={{ opacity: lowMentions ? 0.4 : 1 }}>
                      <div className="w-28 text-xs text-[#374151] truncate shrink-0">{THEME_LABELS[t]}</div>
                      <div className="flex-1 bg-[#E5E7EB] rounded-full h-1">
                        <div
                          className="h-1 rounded-full"
                          style={{ width: `${Math.min(Math.max((score / 0.4) * 100, 5), 100)}%`, background: color }}
                        />
                      </div>
                      <span className="text-xs text-[#9CA3AF] w-14 text-right shrink-0">{mentions} mentions</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Operators({ data }: Props) {
  const [sort, setSort] = useState<SortKey>('sentiment')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filter, setFilter] = useState<SectorFilter>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const handleSort = (key: SortKey) => {
    if (sort === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSort(key); setSortDir('desc') }
  }

  const filtered = data.stakeholder_data.filter(op =>
    filter === 'all' || op.sector === filter
  )

  const sorted = [...filtered].sort((a, b) => {
    let av = 0, bv = 0
    if (sort === 'name')      { av = a.stakeholder_name.localeCompare(b.stakeholder_name); bv = 0 }
    if (sort === 'sentiment') { av = a.overall_sentiment; bv = b.overall_sentiment }
    if (sort === 'eco')       { av = a.eco_credibility_score; bv = b.eco_credibility_score }
    if (sort === 'reviews')   { av = a.total_reviews; bv = b.total_reviews }
    if (sort === 'rating')    { av = a.average_rating; bv = b.average_rating }
    if (sort === 'name') return sortDir === 'asc' ? av : -av
    return sortDir === 'asc' ? av - bv : bv - av
  })

  const sectors = ['all', ...Array.from(new Set(data.stakeholder_data.map(o => o.sector)))] as SectorFilter[]

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => handleSort(k)}
      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
        sort === k ? 'bg-[#00695C] text-white' : 'bg-white text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F3F4F6]'
      }`}
    >
      {label} {sort === k ? (sortDir === 'desc' ? '↓' : '↑') : ''}
    </button>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Operators</h1>
        <p className="text-[#6B7280] text-sm mt-1">
          {filtered.length} operators — click any row to expand the full theme profile.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 flex-wrap">
          {sectors.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors capitalize ${
                filter === s
                  ? 'bg-[#004D40] text-white border-[#004D40]'
                  : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F3F4F6]'
              }`}
            >
              {s === 'all' ? 'All' : SECTOR_LABELS[s] ?? s}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-[#E5E7EB] hidden sm:block" />
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-[#6B7280] self-center">Sort:</span>
          <SortBtn k="sentiment" label="Sentiment" />
          <SortBtn k="eco" label="Eco-credibility" />
          <SortBtn k="reviews" label="Reviews" />
          <SortBtn k="rating" label="Rating" />
          <SortBtn k="name" label="Name" />
        </div>
      </div>

      {/* Operator list */}
      <div className="space-y-3">
        {sorted.map(op => (
          <OperatorCard
            key={op.stakeholder_name}
            op={op}
            expanded={expanded === op.stakeholder_name}
            onToggle={() => setExpanded(expanded === op.stakeholder_name ? null : op.stakeholder_name)}
          />
        ))}
      </div>
    </div>
  )
}
