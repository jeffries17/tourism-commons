import { useState, useEffect, useMemo } from 'react'
import type { DashboardData } from '../types'
import { THEME_LABELS, sentimentLabel } from '../types'
import { ComposableMap, Geographies, Geography as GeoPath, Marker, ZoomableGroup } from 'react-simple-maps'

interface LocationEntry {
  lat: number
  lon: number
  region: string
}

type LocationsMap = Record<string, LocationEntry>

interface Props {
  data: DashboardData
}

const DISTRICTS_URL = '/botswana/botswana_districts.geojson'

// Map GADM NAME_1 districts → our tourism regions
const DISTRICT_TO_REGION: Record<string, string> = {
  'Chobe':         'Chobe',
  'North-West':    'Okavango',
  'Central':       'Central',
  'North-East':    'Central',
  'Francistown':   'Central',
  'SelibePhikwe':  'Central',
  'Ghanzi':        'Kalahari',
  'Kgalagadi':     'Kalahari',
  'Kweneng':       'Kalahari',
  'Southern':      'Kalahari',
  'Jwaneng':       'Kalahari',
  'South-East':    'Greater Gaborone',
  'Kgatleng':      'Greater Gaborone',
  'Lobatse':       'Greater Gaborone',
  'Gaborone':      'Greater Gaborone',
  'Sowa':          'Makgadikgadi',
}

const THEME_OPTIONS = [
  { key: 'overall', label: 'Overall Sentiment' },
  { key: 'wildlife_experience', label: 'Wildlife Experience' },
  { key: 'eco_conservation', label: 'Eco & Conservation' },
  { key: 'service_hospitality', label: 'Service & Hospitality' },
  { key: 'accommodation_quality', label: 'Accommodation Quality' },
  { key: 'value_money', label: 'Value for Money' },
  { key: 'accessibility_logistics', label: 'Accessibility & Logistics' },
  { key: 'adventure_activities', label: 'Adventure Activities' },
  { key: 'safety', label: 'Safety' },
  { key: 'atmosphere_wilderness', label: 'Atmosphere & Wilderness' },
  { key: 'food_dining', label: 'Food & Dining' },
  { key: 'environmental_sensitivity', label: 'Environmental Sensitivity' },
]

const SECTOR_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'operator', label: 'Tour Operators' },
  { key: 'lodge', label: 'Lodges & Camps' },
  { key: 'reserve', label: 'Reserves & Parks' },
]

const REGIONS_ORDER = ['Okavango', 'Chobe', 'Makgadikgadi', 'Kalahari', 'Greater Gaborone', 'Central', 'Other']

function scoreColor(score: number | null): string {
  if (score === null) return '#D1D5DB'  // gray — no data
  if (score >= 0.6)  return '#15803D'  // dark green
  if (score >= 0.3)  return '#65A30D'  // light green
  if (score >= 0.0)  return '#FDE047'  // yellow
  return '#FCA5A5'                      // red (negative)
}

// Simple centroid from GeoJSON geometry (average of bounding box)
function getCentroid(geometry: { type: string; coordinates: number[][][][] | number[][][] }): [number, number] {
  let coords: number[][]
  if (geometry.type === 'Polygon') {
    coords = (geometry as { type: string; coordinates: number[][][] }).coordinates[0]
  } else {
    // MultiPolygon — pick the largest ring
    const polys = (geometry as { type: string; coordinates: number[][][][] }).coordinates
    coords = polys.reduce((a, b) => a[0].length >= b[0].length ? a : b)[0]
  }
  const lons = coords.map(c => c[0])
  const lats = coords.map(c => c[1])
  const minLon = Math.min(...lons), maxLon = Math.max(...lons)
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  return [(minLon + maxLon) / 2, (minLat + maxLat) / 2]
}

// Skip tiny city/town units — they're too small to label legibly
const SKIP_LABEL = new Set(['Gaborone', 'Francistown', 'Lobatse', 'Jwaneng', 'SelibePhikwe', 'Sowa'])

function markerRadius(totalReviews: number): number {
  // Log scale: 1 review → 4px, 10 → 7px, 100 → 10px, 1000 → 13px
  return 4 + Math.log10(Math.max(totalReviews, 1)) * 3
}

function getThemeScore(stakeholder: DashboardData['stakeholder_data'][0], themeKey: string): number | null {
  if (themeKey === 'overall') return stakeholder.overall_sentiment
  const t = stakeholder.theme_scores[themeKey]
  if (!t || t.mentions === 0) return null
  return t.score
}

function avgOf(nums: (number | null)[]): number | null {
  const valid = nums.filter((n): n is number => n !== null)
  if (!valid.length) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

export default function Geography({ data }: Props) {
  const [locations, setLocations] = useState<LocationsMap>({})
  const [selectedTheme, setSelectedTheme] = useState<string>('overall')
  const [selectedSector, setSelectedSector] = useState<string>('all')
  const [hoveredStakeholder, setHoveredStakeholder] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [mapZoom, setMapZoom] = useState<number>(1)

  useEffect(() => {
    fetch('/botswana/botswana_locations.json')
      .then(r => r.json())
      .then((d: LocationsMap) => setLocations(d))
      .catch(console.error)
  }, [])

  const filteredStakeholders = data.stakeholder_data.filter(s => {
    if (selectedSector === 'all') return true
    return s.sector === selectedSector
  })

  // Build per-region stats
  type RegionStats = {
    name: string
    count: number
    avgSentiment: number | null
    topTheme: string
    totalReviews: number
  }

  const regionMap: Record<string, { scores: (number | null)[]; totalReviews: number; stakeholders: DashboardData['stakeholder_data'] }> = {}

  for (const s of filteredStakeholders) {
    const loc = locations[s.stakeholder_name]
    if (!loc) continue
    const region = loc.region
    if (!regionMap[region]) regionMap[region] = { scores: [], totalReviews: 0, stakeholders: [] }
    regionMap[region].scores.push(getThemeScore(s, selectedTheme))
    regionMap[region].totalReviews += s.total_reviews
    regionMap[region].stakeholders.push(s)
  }

  const regionStats: RegionStats[] = Object.entries(regionMap)
    .map(([name, info]) => {
      const themeTotals: Record<string, number> = {}
      for (const s of info.stakeholders) {
        for (const [tk, tv] of Object.entries(s.theme_scores)) {
          if (tv.mentions > 0) themeTotals[tk] = (themeTotals[tk] ?? 0) + tv.score
        }
      }
      const topThemeKey = Object.entries(themeTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
      return {
        name,
        count: info.stakeholders.length,
        avgSentiment: avgOf(info.scores),
        topTheme: THEME_LABELS[topThemeKey] ?? topThemeKey,
        totalReviews: info.totalReviews,
      }
    })
    .sort((a, b) => (b.avgSentiment ?? -1) - (a.avgSentiment ?? -1))

  const orderedRegionStats = [
    ...REGIONS_ORDER.map(r => regionStats.find(rs => rs.name === r)).filter(Boolean),
    ...regionStats.filter(rs => !REGIONS_ORDER.includes(rs.name)),
  ] as RegionStats[]

  const selectedThemeLabel = THEME_OPTIONS.find(t => t.key === selectedTheme)?.label ?? 'Overall Sentiment'

  const hoveredData = hoveredStakeholder
    ? data.stakeholder_data.find(s => s.stakeholder_name === hoveredStakeholder)
    : null

  // Pre-compute jittered coordinates: operators sharing the same ~location get spread in a circle
  const jitteredPositions = useMemo<Record<string, [number, number]>>(() => {
    const result: Record<string, [number, number]> = {}
    // Group by location rounded to 0.05° (~5km)
    const groups: Record<string, string[]> = {}
    for (const s of filteredStakeholders) {
      const loc = locations[s.stakeholder_name]
      if (!loc) continue
      const key = `${Math.round(loc.lat * 20) / 20},${Math.round(loc.lon * 20) / 20}`
      if (!groups[key]) groups[key] = []
      groups[key].push(s.stakeholder_name)
    }
    for (const names of Object.values(groups)) {
      const n = names.length
      if (n === 1) {
        const loc = locations[names[0]]
        result[names[0]] = [loc.lon, loc.lat]
      } else {
        // Spread in a circle; radius grows with cluster size, capped at 0.45°
        const radius = Math.min(0.08 + n * 0.06, 0.45)
        names.forEach((name, i) => {
          const loc = locations[name]
          const angle = (2 * Math.PI * i) / n - Math.PI / 2
          result[name] = [loc.lon + radius * Math.cos(angle), loc.lat + radius * Math.sin(angle)]
        })
      }
    }
    return result
  }, [filteredStakeholders, locations])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Geographic Distribution</h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Sentiment scores mapped across Botswana's tourism regions — {filteredStakeholders.length} operators shown
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider whitespace-nowrap">
              Theme
            </label>
            <select
              value={selectedTheme}
              onChange={e => setSelectedTheme(e.target.value)}
              className="text-sm border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-[#1C1C1E] bg-white focus:outline-none focus:ring-2 focus:ring-[#00695C] focus:border-transparent"
            >
              {THEME_OPTIONS.map(t => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wider whitespace-nowrap">
              Sector
            </label>
            <div className="flex gap-1">
              {SECTOR_FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setSelectedSector(f.key)}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    selectedSector === f.key
                      ? 'bg-[#004D40] text-white'
                      : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          {/* Legend */}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-[#6B7280]">Score:</span>
            {[
              { color: '#15803D', label: '≥0.6' },
              { color: '#65A30D', label: '≥0.3' },
              { color: '#FDE047', label: '≥0.0' },
              { color: '#FCA5A5', label: '<0.0' },
              { color: '#D1D5DB', label: 'No data' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-[#6B7280]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map + Sidebar */}
      <div className="flex gap-4">
        {/* Map */}
        <div className="flex-1 bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden relative">
          <div className="px-5 py-3 border-b border-[#E5E7EB]">
            <h2 className="text-sm font-semibold text-[#1C1C1E]">{selectedThemeLabel} by Location</h2>
          </div>
          <div className="relative" style={{ height: 500 }}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ center: [23.8, -22.0], scale: 1800 }}
              style={{ width: '100%', height: '100%' }}
            >
              <ZoomableGroup onMoveEnd={({ zoom }) => setMapZoom(zoom)}>
                <Geographies geography={DISTRICTS_URL}>
                  {({ geographies }) =>
                    geographies.map((geo: { rsmKey: string; properties: Record<string, string> }) => {
                      const districtName = geo.properties.NAME_1 ?? geo.properties.shapeName ?? ''
                      const region = DISTRICT_TO_REGION[districtName] ?? 'Other'
                      const regionStat = regionStats.find(r => r.name === region)
                      const fill = regionStat ? scoreColor(regionStat.avgSentiment) : '#F5F0DC'
                      const centroid = getCentroid(geo.geometry)
                      const showLabel = !SKIP_LABEL.has(districtName)
                      return (
                        <g key={geo.rsmKey}>
                          <GeoPath
                            geography={geo}
                            fill={fill}
                            fillOpacity={0.6}
                            stroke="#6B7280"
                            strokeWidth={0.5}
                            style={{
                              default: { outline: 'none' },
                              hover: { outline: 'none', fillOpacity: 0.8 },
                              pressed: { outline: 'none' },
                            }}
                          />
                          {showLabel && (
                            <Marker coordinates={centroid}>
                              <text
                                fontSize={7}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#374151"
                                stroke="white"
                                strokeWidth={2.5}
                                paintOrder="stroke"
                                style={{ pointerEvents: 'none', fontWeight: 600 }}
                              >
                                {districtName}
                              </text>
                            </Marker>
                          )}
                        </g>
                      )
                    })
                  }
                </Geographies>

                {filteredStakeholders.map(s => {
                  const coords = jitteredPositions[s.stakeholder_name]
                  if (!coords) return null
                  const score = getThemeScore(s, selectedTheme)
                  // Divide by zoom so dots stay ~fixed screen size
                  const baseR = markerRadius(s.total_reviews)
                  const r = baseR / mapZoom
                  const isHovered = hoveredStakeholder === s.stakeholder_name
                  const showLabel = mapZoom >= 2
                  const fontSize = 9 / mapZoom
                  const labelOffset = r + 1.5 / mapZoom

                  return (
                    <Marker
                      key={s.stakeholder_name}
                      coordinates={coords}
                      onMouseEnter={(evt: React.MouseEvent) => {
                        setHoveredStakeholder(s.stakeholder_name)
                        const rect = (evt.currentTarget as Element).closest('svg')?.getBoundingClientRect()
                        if (rect) {
                          setTooltipPos({ x: evt.clientX - rect.left, y: evt.clientY - rect.top })
                        }
                      }}
                      onMouseLeave={() => setHoveredStakeholder(null)}
                    >
                      <circle
                        r={isHovered ? r * 1.4 : r}
                        fill={scoreColor(score)}
                        stroke="white"
                        strokeWidth={1.5 / mapZoom}
                        style={{ cursor: 'pointer' }}
                      />
                      {showLabel && (
                        <text
                          x={labelOffset}
                          y={fontSize / 2}
                          fontSize={fontSize}
                          fill="#1C1C1E"
                          stroke="white"
                          strokeWidth={fontSize * 0.35}
                          paintOrder="stroke"
                          style={{ pointerEvents: 'none', fontWeight: 600 }}
                        >
                          {s.stakeholder_name}
                        </text>
                      )}
                    </Marker>
                  )
                })}
              </ZoomableGroup>
            </ComposableMap>

            {/* Tooltip */}
            {hoveredStakeholder && hoveredData && (
              <div
                className="absolute pointer-events-none z-10 bg-white border border-[#E5E7EB] rounded-lg shadow-lg px-3 py-2 text-sm"
                style={{
                  left: Math.min(tooltipPos.x + 12, 600),
                  top: Math.max(tooltipPos.y - 40, 8),
                  maxWidth: 220,
                }}
              >
                <p className="font-semibold text-[#1C1C1E] text-xs leading-tight mb-1">
                  {hoveredStakeholder}
                </p>
                <p className="text-[#6B7280] text-xs">
                  {selectedThemeLabel}:{' '}
                  {(() => {
                    const s = getThemeScore(hoveredData, selectedTheme)
                    return s === null
                      ? <span className="text-[#9CA3AF] italic">No data</span>
                      : <span className="font-semibold" style={{ color: sentimentLabel(s).color }}>{s.toFixed(3)}</span>
                  })()}
                </p>
                <p className="text-[#6B7280] text-xs">{hoveredData.total_reviews} reviews</p>
                <p className="text-[#9CA3AF] text-xs">{locations[hoveredStakeholder]?.region}</p>
              </div>
            )}
          </div>
          <div className="px-5 py-2 border-t border-[#E5E7EB] bg-[#FAFAF8]">
            <p className="text-xs text-[#9CA3AF]">
              Marker size reflects number of reviews · Hover for details
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-72 shrink-0 bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <div className="px-5 py-3 border-b border-[#E5E7EB]">
            <h2 className="text-sm font-semibold text-[#1C1C1E]">Region Breakdown</h2>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 500 }}>
            {orderedRegionStats.map(rs => {
              const sl = rs.avgSentiment !== null ? sentimentLabel(rs.avgSentiment) : { color: '#9CA3AF' }
              const barPct = rs.avgSentiment !== null ? Math.round(rs.avgSentiment * 100 / 0.35 * 100) / 100 : 0
              return (
                <div key={rs.name} className="bg-[#FAFAF8] rounded-lg p-3 border border-[#E5E7EB]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-[#1C1C1E]">{rs.name}</span>
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded"
                      style={{ color: sl.color, backgroundColor: sl.color + '18' }}
                    >
                      {rs.avgSentiment !== null ? rs.avgSentiment.toFixed(3) : '—'}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] mb-2">
                    {rs.count} operator{rs.count !== 1 ? 's' : ''} · {rs.totalReviews.toLocaleString()} reviews
                  </p>
                  <div className="w-full bg-[#E5E7EB] rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.max(0, barPct))}%`,
                        backgroundColor: scoreColor(rs.avgSentiment),
                      }}
                    />
                  </div>
                </div>
              )
            })}
            {orderedRegionStats.length === 0 && (
              <p className="text-sm text-[#9CA3AF] text-center py-6">No data for selected filters</p>
            )}
          </div>
        </div>
      </div>

      {/* Region Summary Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-sm font-semibold text-[#1C1C1E]">Region Summary</h2>
          <p className="text-xs text-[#6B7280] mt-0.5">Sorted by average sentiment score</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Region
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Operators
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Avg Sentiment
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Top Theme
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Reviews
                </th>
              </tr>
            </thead>
            <tbody>
              {regionStats.map((rs, i) => {
                const sl = rs.avgSentiment !== null ? sentimentLabel(rs.avgSentiment) : { color: '#9CA3AF' }
                return (
                  <tr
                    key={rs.name}
                    className={`border-b border-[#F3F4F6] ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'} hover:bg-[#F0FDF4] transition-colors`}
                  >
                    <td className="px-5 py-3 font-medium text-[#1C1C1E]">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: scoreColor(rs.avgSentiment) }}
                        />
                        {rs.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-[#374151]">{rs.count}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ color: sl.color, backgroundColor: sl.color + '18' }}
                      >
                        {rs.avgSentiment !== null ? rs.avgSentiment.toFixed(3) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#374151] text-xs">{rs.topTheme || '—'}</td>
                    <td className="px-4 py-3 text-center text-[#374151]">{rs.totalReviews.toLocaleString()}</td>
                  </tr>
                )
              })}
              {regionStats.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[#9CA3AF] text-sm">
                    No data available for selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
