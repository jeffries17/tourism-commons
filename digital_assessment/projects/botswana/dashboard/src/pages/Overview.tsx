import { useState } from 'react'
import type { DashboardData } from '../types'
import { THEME_LABELS, THEME_ORDER, sentimentLabel, COLORS, SECTOR_LABELS } from '../types'
import type { Page } from '../App'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'

interface Props { data: DashboardData; setPage: (p: Page) => void }

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-[#E5E7EB] shadow-sm">
      <p className="text-[#6B7280] text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-bold text-[#1C1C1E]">{value}</p>
      {sub && <p className="text-[#6B7280] text-xs mt-1">{sub}</p>}
    </div>
  )
}

const SECTOR_FILTERS = [
  { key: 'all',      label: 'All' },
  { key: 'operator', label: 'Tour Operators' },
  { key: 'lodge',    label: 'Lodges & Camps' },
  { key: 'reserve',  label: 'Reserves & Parks' },
]

export default function Overview({ data, setPage }: Props) {
  const { summary, metadata, stakeholder_data } = data
  const [ecoFilter, setEcoFilter] = useState<string>('all')
  const [hoveredScatter, setHoveredScatter] = useState<string | null>(null)

  // Radar data
  // Theme bar data — sorted best to worst by sentiment quality
  const themeBarData = [...THEME_ORDER]
    .sort((a, b) => (summary.theme_averages[b] ?? 0) - (summary.theme_averages[a] ?? 0))
    .map(t => ({
      theme: THEME_LABELS[t],
      score: +(summary.theme_averages[t] ?? 0).toFixed(3),
    }))

  // Scatter data: visibility vs quality per theme
  const visMin = 0, visMax = 1
  const qualMin = 0.08, qualMax = 0.35
  const scatterData = THEME_ORDER.map(t => ({
    key: t,
    label: THEME_LABELS[t],
    visibility: summary.theme_visibility?.[t] ?? 0,
    quality: summary.theme_averages[t] ?? 0,
    // Position as % within chart area (0-100), y-inverted
    x: Math.round(((summary.theme_visibility?.[t] ?? 0) - visMin) / (visMax - visMin) * 100),
    y: Math.round((1 - ((summary.theme_averages[t] ?? 0) - qualMin) / (qualMax - qualMin)) * 100),
  }))

  // Year trend
  const yearData = Object.entries(summary.year_distribution ?? {})
    .filter(([yr]) => yr !== '2026')
    .map(([year, count]) => ({ year, count }))

  // Top 3 and bottom 3 themes
  const sorted = [...THEME_ORDER].sort((a, b) => (summary.theme_averages[b] ?? 0) - (summary.theme_averages[a] ?? 0))
  const top3 = sorted.slice(0, 3)
  const bottom3 = sorted.slice(-3).reverse()

  // Positive rate
  const positiveCount = stakeholder_data.filter(s => s.overall_sentiment >= 0.15).length
  const positiveRate = Math.round((positiveCount / stakeholder_data.length) * 100)

  // Avg rating
  const avgRating = (stakeholder_data.reduce((sum, s) => sum + (s.average_rating || 0), 0) / stakeholder_data.length).toFixed(1)

  const themeColor = (score: number) => {
    if (score >= 0.25) return COLORS.positive
    if (score >= 0.1) return COLORS.warning
    return COLORS.negative
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-[#004D40] rounded-2xl p-8 text-white">
        <div className="max-w-xl">
          <p className="text-[#F59E0B] text-xs font-semibold uppercase tracking-widest mb-2">Baseline Analysis · 2021–2026</p>
          <h1 className="text-3xl font-bold mb-3 leading-tight">
            Botswana Ecotourism &amp;<br />Adventure Tourism
          </h1>
          <p className="text-white/70 text-sm leading-relaxed">
            Visitor sentiment analysis across {metadata.total_stakeholders} operators, reserves, and camps —
            based on {metadata.total_reviews.toLocaleString()} TripAdvisor reviews. This baseline establishes the
            current state of Botswana's ecotourism product to inform a 3-year improvement program.
          </p>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Operators Analysed" value={`${metadata.total_stakeholders}`} sub="reserves, lodges & operators" />
        <StatCard label="Reviews Analysed" value={metadata.total_reviews.toLocaleString()} sub="TripAdvisor · Mar 2021–2026" />
        <StatCard label="Positive Operators" value={`${positiveRate}%`} sub={`${positiveCount} of ${metadata.total_stakeholders} score positively`} />
        <StatCard label="Avg TripAdvisor Rating" value={`${avgRating} / 5`} sub="across all operators" />
      </div>

      {/* Theme overview + scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality bar chart */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
          <h2 className="font-semibold text-[#1C1C1E] mb-1">Theme Quality</h2>
          <p className="text-[#6B7280] text-xs mb-4">How positively visitors write about each theme when they mention it</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={themeBarData} layout="vertical" margin={{ left: 8, right: 24 }}>
              <XAxis type="number" domain={[0, 0.4]} tickFormatter={v => v.toFixed(1)} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <YAxis type="category" dataKey="theme" width={160} tick={{ fontSize: 11, fill: '#374151' }} />
              <Tooltip
                formatter={(v: unknown) => [(v as number).toFixed(3), 'Sentiment']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {themeBarData.map((entry, i) => (
                  <Cell key={i} fill={themeColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Visibility vs Quality scatter */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
          <h2 className="font-semibold text-[#1C1C1E] mb-1">Visibility vs. Quality</h2>
          <p className="text-[#6B7280] text-xs mb-4">How often each theme is mentioned (x) vs. positive sentiment score (y)</p>
          <div className="relative" style={{ height: 300 }}>
            {/* Axes */}
            <div className="absolute inset-0 border-b border-l border-[#E5E7EB]" style={{ top: 8, right: 8, bottom: 24, left: 24 }}>
              {/* Quadrant lines */}
              <div className="absolute border-t border-dashed border-[#E5E7EB]" style={{ top: '50%', left: 0, right: 0 }} />
              <div className="absolute border-l border-dashed border-[#E5E7EB]" style={{ left: '50%', top: 0, bottom: 0 }} />
              {/* Quadrant labels */}
              <span className="absolute text-[9px] text-[#9CA3AF] italic" style={{ top: 4, left: '52%' }}>Strength</span>
              <span className="absolute text-[9px] text-[#9CA3AF] italic" style={{ top: 4, left: 4 }}>Opportunity</span>
              <span className="absolute text-[9px] text-[#9CA3AF] italic" style={{ top: '52%', left: '52%' }}>Top priority</span>
              <span className="absolute text-[9px] text-[#9CA3AF] italic" style={{ top: '52%', left: 4 }}>Investment needed</span>

              {/* Label boxes for key themes — name only, scores visible on dot hover */}
              <div className="absolute rounded-lg border-2 border-[#F59E0B] bg-white px-2 py-1 shadow-sm" style={{ left: '1%', top: '22%', zIndex: 10, pointerEvents: 'none' }}>
                <p className="text-[10px] font-bold text-[#92400E] whitespace-nowrap">Adventure Activities</p>
              </div>
              <div className="absolute rounded-lg border-2 border-[#F59E0B] bg-white px-2 py-1 shadow-sm" style={{ left: '58%', top: '57%', zIndex: 10, pointerEvents: 'none' }}>
                <p className="text-[10px] font-bold text-[#92400E] whitespace-nowrap">Eco & Conservation</p>
              </div>

              {/* SVG connector lines from label boxes to dots */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                {scatterData.filter(d => d.key === 'adventure_activities').map(d => (
                  <line key="adv-line" x1="30" y1="37" x2={d.x} y2={d.y} stroke="#F59E0B" strokeWidth="0.7" strokeDasharray="3,2" />
                ))}
                {scatterData.filter(d => d.key === 'eco_conservation').map(d => (
                  <line key="eco-line" x1="58" y1="65" x2={d.x} y2={d.y} stroke="#F59E0B" strokeWidth="0.7" strokeDasharray="3,2" />
                ))}
              </svg>

              {/* All dots */}
              {scatterData.map(d => {
                const isTarget = d.key === 'adventure_activities' || d.key === 'eco_conservation'
                const isWatch = d.key === 'accessibility_logistics'
                const dotColor = isTarget ? COLORS.accent : isWatch ? '#DC2626' : COLORS.primary
                const dotSize = isTarget ? 14 : 10
                return (
                  <div
                    key={d.key}
                    className="absolute cursor-pointer"
                    style={{ left: `${d.x}%`, top: `${d.y}%`, transform: 'translate(-50%, -50%)', zIndex: isTarget ? 5 : 1 }}
                    onMouseEnter={() => setHoveredScatter(d.key)}
                    onMouseLeave={() => setHoveredScatter(null)}
                  >
                    <div
                      className="rounded-full border-2 border-white shadow"
                      style={{ width: dotSize, height: dotSize, background: dotColor, opacity: hoveredScatter && hoveredScatter !== d.key ? 0.4 : 1 }}
                    />
                  </div>
                )
              })}
              {/* X-axis midpoint label */}
              <span className="absolute text-[8px] text-[#9CA3AF]" style={{ bottom: -16, left: '50%', transform: 'translateX(-50%)' }}>{((visMin + visMax) / 2 * 100).toFixed(0)}%</span>
              {/* Y-axis midpoint label */}
              <span className="absolute text-[8px] text-[#9CA3AF]" style={{ top: 'calc(50% - 8px)', left: -20 }}>{(((qualMin + qualMax) / 2) * 100).toFixed(1)}%</span>
            </div>
            {/* Axis labels */}
            <span className="absolute text-[9px] text-[#9CA3AF] tracking-wide" style={{ bottom: 0, left: '50%', transform: 'translateX(-50%)' }}>– VISIBILITY +</span>
            <span className="absolute text-[9px] text-[#9CA3AF] tracking-wide" style={{ left: 0, top: '40%', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>– POSITIVE SENTIMENT +</span>
          </div>
          {/* Fixed hover info panel */}
          <div className="mt-2 h-6 flex items-center">
            {hoveredScatter ? (() => {
              const d = scatterData.find(s => s.key === hoveredScatter)
              if (!d) return null
              return <p className="text-[11px] text-[#374151]"><span className="font-semibold">{d.label}</span> · visibility {(d.visibility * 100).toFixed(0)}% · positive sentiment {(d.quality * 100).toFixed(1)}%</p>
            })() : <p className="text-[10px] text-[#9CA3AF]">Hover any dot to see scores</p>}
          </div>
        </div>
      </div>

      {/* Strengths and gaps quick view */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-[#059669]" />
            <h2 className="font-semibold text-[#1C1C1E] text-sm">Strongest Themes</h2>
          </div>
          <p className="text-[10px] text-[#9CA3AF] mb-4">Avg. positive sentiment score across all reviews</p>
          <div className="space-y-3">
            {top3.map(t => {
              const score = summary.theme_averages[t] ?? 0
              const sl = sentimentLabel(score)
              return (
                <div key={t} className="flex items-center justify-between">
                  <span className="text-sm text-[#374151]">{THEME_LABELS[t]}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-[#E5E7EB] rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${Math.min((score / 0.5) * 100, 100)}%`, backgroundColor: sl.color }}
                      />
                    </div>
                    <span className="text-xs font-medium w-14 text-right" style={{ color: sl.color }}>
                      {(score * 100).toFixed(0)}% sentiment
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} className="text-[#DC2626]" />
            <h2 className="font-semibold text-[#1C1C1E] text-sm">Priority Areas</h2>
          </div>
          <p className="text-[10px] text-[#9CA3AF] mb-4">Avg. positive sentiment score across all reviews</p>
          <div className="space-y-3">
            {bottom3.map(t => {
              const score = summary.theme_averages[t] ?? 0
              const sl = sentimentLabel(score)
              return (
                <div key={t} className="flex items-center justify-between">
                  <span className="text-sm text-[#374151]">{THEME_LABELS[t]}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-[#E5E7EB] rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${Math.min(Math.max((score / 0.5) * 100, 5), 100)}%`, backgroundColor: sl.color }}
                      />
                    </div>
                    <span className="text-xs font-medium w-14 text-right" style={{ color: sl.color }}>
                      {(score * 100).toFixed(0)}% sentiment
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Review volume trend */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
        <h2 className="font-semibold text-[#1C1C1E] mb-1">Review Volume by Year</h2>
        <p className="text-[#6B7280] text-xs mb-4">Growth in visitor engagement as a proxy for demand trajectory (2021–2025)</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={yearData} margin={{ left: 0, right: 16, top: 4, bottom: 0 }}>
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={28} />
            <Tooltip
              formatter={(v: unknown) => [v as number, 'Reviews']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
            />
            <Bar dataKey="count" fill={COLORS.primary} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Methodology link */}
      <div className="flex justify-end">
        <a
          href="#methodology"
          onClick={() => setPage('methodology')}
          className="text-xs text-[#00695C] font-medium hover:underline flex items-center gap-1"
        >
          About this analysis <ArrowRight size={12} />
        </a>
      </div>

      {/* Eco-credibility index */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
          <div>
            <h2 className="font-semibold text-[#1C1C1E] mb-1">Eco-Credibility Index</h2>
            <p className="text-[#6B7280] text-xs">How strongly each operator's reviews reflect conservation, wildlife, wilderness, and environmental sensitivity</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {SECTOR_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setEcoFilter(f.key)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                  ecoFilter === f.key
                    ? 'bg-[#004D40] text-white border-[#004D40]'
                    : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F3F4F6]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sector avg pills */}
        <div className="flex gap-3 mb-5 flex-wrap">
          {Object.entries(summary.sector_summaries).map(([sector, s]) => {
            const active = ecoFilter === sector || ecoFilter === 'all'
            return (
              <div
                key={sector}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                style={{
                  background: active ? '#E0F2F1' : '#F9FAFB',
                  borderColor: active ? '#00695C' : '#E5E7EB',
                  color: active ? '#004D40' : '#9CA3AF',
                }}
              >
                <span>{SECTOR_LABELS[sector] ?? sector}</span>
                <span className="font-bold">{(s.avg_eco_credibility * 100).toFixed(0)}%</span>
              </div>
            )
          })}
        </div>

        {/* Ranked operator list */}
        <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 320 }}>
          {[...stakeholder_data]
            .filter(op => ecoFilter === 'all' || op.sector === ecoFilter)
            .sort((a, b) => b.eco_credibility_score - a.eco_credibility_score)
            .map((op, i) => {
              const pct = Math.round(op.eco_credibility_score * 100)
              const barColor = pct >= 60 ? COLORS.positive : pct >= 35 ? COLORS.warning : COLORS.negative
              return (
                <div key={op.stakeholder_name} className="flex items-center gap-3">
                  <span className="text-[10px] text-[#9CA3AF] w-5 text-right shrink-0">{i + 1}</span>
                  <span className="text-xs text-[#374151] w-44 truncate shrink-0">{op.stakeholder_name}</span>
                  <span className="text-[10px] text-[#6B7280] w-20 shrink-0 hidden sm:block capitalize">
                    {SECTOR_LABELS[op.sector] ?? op.sector}
                  </span>
                  <div className="flex-1 bg-[#E5E7EB] rounded-full h-2">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
                  </div>
                  <span className="text-xs font-semibold w-8 text-right shrink-0" style={{ color: barColor }}>{pct}%</span>
                </div>
              )
            })}
        </div>
      </div>

      {/* Sector snapshot */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
        <h2 className="font-semibold text-[#1C1C1E] mb-1">Sector Snapshot</h2>
        <p className="text-[#6B7280] text-xs mb-5">Average sentiment and eco-credibility by operator type</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(summary.sector_summaries).map(([sector, s]) => {
            const sl = sentimentLabel(s.avg_sentiment)
            return (
              <div key={sector} className="border border-[#E5E7EB] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#1C1C1E] capitalize">
                    {sector === 'reserve' ? 'Reserves & Parks' : sector === 'lodge' ? 'Lodges & Camps' : 'Tour Operators'}
                  </span>
                  <span className="text-xs text-[#6B7280]">{s.count} operators</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6B7280]">Sentiment</span>
                    <span className="font-semibold" style={{ color: sl.color }}>{sl.label}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6B7280]">Eco-credibility</span>
                    <span className="font-semibold text-[#00695C]">{(s.avg_eco_credibility * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
