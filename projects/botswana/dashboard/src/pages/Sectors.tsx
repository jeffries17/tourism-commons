import type { DashboardData } from '../types'
import { THEME_LABELS, THEME_ORDER, sentimentLabel, SECTOR_LABELS } from '../types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'

interface Props { data: DashboardData }

const SECTOR_COLORS: Record<string, string> = {
  reserve:  '#00695C',
  lodge:    '#F59E0B',
  operator: '#3B82F6',
  activity: '#8B5CF6',
}

export default function Sectors({ data }: Props) {
  const { summary } = data
  const sectors = summary.sector_summaries

  // Theme comparison across sectors
  const themeComparisonData = THEME_ORDER.map(t => {
    const row: Record<string, string | number> = { theme: THEME_LABELS[t] }
    Object.entries(sectors).forEach(([sec, s]) => {
      row[sec] = +(s.theme_averages[t] ?? 0).toFixed(3)
    })
    return row
  })

  // Radar per sector
  const radarData = (sector: string) => THEME_ORDER.map(t => ({
    theme: THEME_LABELS[t].replace(' & ', '\n& ').replace(' and ', '\n& '),
    value: Math.round(Math.max(((sectors[sector]?.theme_averages[t] ?? 0) + 0.1) / 0.6 * 100, 0)),
  }))

  const sectorList = Object.keys(sectors)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Sector Comparison</h1>
        <p className="text-[#6B7280] text-sm mt-1">
          How different types of operators perform across all 11 experience themes.
        </p>
      </div>

      {/* Sector summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {sectorList.map(sector => {
          const s = sectors[sector]
          const sl = sentimentLabel(s.avg_sentiment)
          return (
            <div key={sector} className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ background: SECTOR_COLORS[sector] ?? '#6B7280' }} />
                <h3 className="font-semibold text-[#1C1C1E] text-sm">
                  {SECTOR_LABELS[sector] ?? sector}
                </h3>
                <span className="ml-auto text-xs text-[#6B7280]">{s.count} operators</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#6B7280]">Overall Sentiment</span>
                  <span className="text-sm font-bold" style={{ color: sl.color }}>{sl.label}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#6B7280]">Eco-Credibility</span>
                  <span className="text-sm font-semibold text-[#00695C]">{(s.avg_eco_credibility * 100).toFixed(0)}%</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280] mb-1.5">Top theme</p>
                  <p className="text-xs font-medium text-[#374151]">
                    {THEME_LABELS[
                      THEME_ORDER.reduce((best, t) =>
                        (s.theme_averages[t] ?? 0) > (s.theme_averages[best] ?? 0) ? t : best
                      , THEME_ORDER[0])
                    ]}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1.5">Weakest theme</p>
                  <p className="text-xs font-medium text-[#DC2626]">
                    {THEME_LABELS[
                      THEME_ORDER.reduce((worst, t) =>
                        (s.theme_averages[t] ?? 0) < (s.theme_averages[worst] ?? 0) ? t : worst
                      , THEME_ORDER[0])
                    ]}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Theme breakdown by sector */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
        <h2 className="font-semibold text-[#1C1C1E] mb-1">Theme Scores by Sector</h2>
        <p className="text-[#6B7280] text-xs mb-5">Sentiment score per theme — higher is better</p>
        <div className="flex gap-4 mb-4 flex-wrap">
          {sectorList.map(s => (
            <div key={s} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: SECTOR_COLORS[s] ?? '#6B7280' }} />
              <span className="text-xs text-[#6B7280]">{SECTOR_LABELS[s] ?? s}</span>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={themeComparisonData} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" domain={[0, 0.5]} tickFormatter={v => v.toFixed(1)} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
            <YAxis type="category" dataKey="theme" width={160} tick={{ fontSize: 11, fill: '#374151' }} />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: unknown, name: any) => [(v as number).toFixed(3), SECTOR_LABELS[name] ?? name]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
            />
            {sectorList.map(s => (
              <Bar key={s} dataKey={s} fill={SECTOR_COLORS[s] ?? '#6B7280'} radius={[0, 3, 3, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar profiles per sector */}
      <div>
        <h2 className="font-semibold text-[#1C1C1E] mb-1">Experience Profiles by Sector</h2>
        <p className="text-[#6B7280] text-xs mb-5">Radar chart showing relative strength of each sector across experience dimensions</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {sectorList.map(sector => (
            <div key={sector} className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: SECTOR_COLORS[sector] ?? '#6B7280' }} />
                <h3 className="text-sm font-semibold text-[#1C1C1E]">{SECTOR_LABELS[sector] ?? sector}</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData(sector)} margin={{ top: 8, right: 20, bottom: 8, left: 20 }}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="theme" tick={{ fontSize: 8, fill: '#9CA3AF' }} />
                  <Radar
                    dataKey="value"
                    stroke={SECTOR_COLORS[sector] ?? '#6B7280'}
                    fill={SECTOR_COLORS[sector] ?? '#6B7280'}
                    fillOpacity={0.15}
                    strokeWidth={1.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
