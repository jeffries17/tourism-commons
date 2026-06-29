import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './config/firebase'
import type { Destination, TourismProfile, VerificationStatus, VisitorSeries } from './types'

type DestinationRow = {
  id: string
  name: string
  countryCode: string
  continent: string
  region?: string
  websiteUrl?: string | null
  instagramHandle?: string | null
  instagramUrl?: string | null
  followers?: number | null
  visitors?: number | null
  visitorYear?: number | null
  verificationStatus: VerificationStatus
}

function App() {
  const [rows, setRows] = useState<DestinationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)
  const [continentFilter, setContinentFilter] = useState<string>('all')
  const [search, setSearch] = useState<string>('')
  const [sortKey, setSortKey] = useState<'name' | 'followers' | 'visitors'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Simple route split: `/tourism-instagram-index/` for public view,
  // `/tourism-instagram-index/admin` for the admin review dashboard.
  const isAdminRoute =
    typeof window !== 'undefined' && window.location.pathname.endsWith('/admin')

  useEffect(() => {
    async function load() {
      try {
        const [destSnap, profileSnap, visitorsSnap] = await Promise.all([
          getDocs(collection(db, 'destinations')),
          getDocs(collection(db, 'tourismProfiles')),
          getDocs(collection(db, 'visitorSeries')),
        ])

        const destinations = new Map<string, Destination>()
        destSnap.forEach((doc) => {
          const data = doc.data() as any
          destinations.set(doc.id, {
            id: doc.id,
            name: data.name ?? doc.id,
            type: data.type ?? 'country',
            countryCode: data.countryCode ?? doc.id,
            continent: data.continent ?? '',
            region: data.region ?? undefined,
            population: data.population,
            populationYear: data.populationYear,
            populationSourceUrl: data.populationSourceUrl,
            languages: data.languages,
          })
        })

        const visitorByDestination = new Map<string, VisitorSeries>()
        visitorsSnap.forEach((doc) => {
          const data = doc.data() as VisitorSeries
          if (!data.destinationId) return
          // For now we assume one primary series per destination; overwrite if we see isPrimary true
          if (data.isPrimary) {
            visitorByDestination.set(data.destinationId, data)
          } else if (!visitorByDestination.has(data.destinationId)) {
            visitorByDestination.set(data.destinationId, data)
          }
        })

        const rows: DestinationRow[] = []
        profileSnap.forEach((doc) => {
          const data = doc.data() as TourismProfile
          const dest = destinations.get(data.destinationId ?? doc.id)
          if (!dest) return

          const visitor = visitorByDestination.get(dest.id)
          rows.push({
            id: doc.id,
            name: dest.name,
            countryCode: dest.countryCode,
            continent: dest.continent,
            region: dest.region,
            websiteUrl: data.officialWebsiteUrl ?? null,
            instagramHandle: data.instagramHandle ?? null,
            instagramUrl: data.instagramUrl ?? null,
            followers: data.followers ?? null,
            visitors: visitor?.annualVisitorsValue ?? null,
            visitorYear: visitor?.visitorYear ?? null,
            verificationStatus: data.verificationStatus ?? 'unverified',
          })
        })

        rows.sort((a, b) => a.name.localeCompare(b.name))
        setRows(rows)
      } catch (e: any) {
        console.error('Failed to load destinations', e)
        setError(e?.message ?? 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const filteredRows = (isAdminRoute ? rows : rows.filter((r) => r.verificationStatus === 'verified'))
    .filter((r) => continentFilter === 'all' || r.continent === continentFilter)
    .filter((r) => {
      const q = search.trim().toLowerCase()
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        r.countryCode.toLowerCase().includes(q) ||
        (r.instagramHandle ?? '').toLowerCase().includes(q)
      )
    })

  const visibleRows = [...filteredRows].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    if (sortKey === 'name') {
      return a.name.localeCompare(b.name) * dir
    }
    if (sortKey === 'followers') {
      const av = a.followers ?? -1
      const bv = b.followers ?? -1
      if (av === bv) return a.name.localeCompare(b.name) * dir
      return (av - bv) * dir
    }
    if (sortKey === 'visitors') {
      const av = a.visitors ?? -1
      const bv = b.visitors ?? -1
      if (av === bv) return a.name.localeCompare(b.name) * dir
      return (av - bv) * dir
    }
    return 0
  })

  const continents = Array.from(new Set(rows.map((r) => r.continent).filter(Boolean))).sort()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-heading font-semibold tracking-tight">
              Tourism Instagram Index
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Compare how destinations perform on Instagram relative to their size and visitor volumes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              {!isAdminRoute && (
                <>
                  <span className="font-medium">Continent:</span>
                  <select
                    className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                    value={continentFilter}
                    onChange={(e) => setContinentFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    {continents.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <input
                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                placeholder="Search destination or handle…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="text-xs uppercase tracking-wide text-slate-500">
              Tourism Commons
            </span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <section className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-semibold">Current discovery snapshot</h2>
              <p className="mt-1 text-xs text-slate-600">
                This table is reading live from Firestore. The public view only includes destinations that
                have been marked as <span className="font-semibold">Verified</span> in the admin dashboard.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {loading ? 'Loading…' : `${visibleRows.length} destinations`}
            </span>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          {!loading && rows.length === 0 && !error && (
            <p className="text-sm text-slate-600">
              No tourism profiles found yet. Run the discovery function to populate initial data.
            </p>
          )}

          {visibleRows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th
                      className="px-3 py-2 cursor-pointer select-none"
                      onClick={() =>
                        setSortKey((prev) => {
                          setSortDir(prev === 'name' && sortDir === 'asc' ? 'desc' : 'asc')
                          return 'name'
                        })
                      }
                    >
                      Destination{' '}
                      {sortKey === 'name' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                    </th>
                    <th className="px-3 py-2">Country</th>
                    <th className="px-3 py-2">Continent</th>
                    <th className="px-3 py-2">Website</th>
                    <th className="px-3 py-2">Instagram</th>
                    <th
                      className="px-3 py-2 text-right cursor-pointer select-none"
                      onClick={() =>
                        setSortKey((prev) => {
                          const nextDir =
                            prev === 'followers' && sortDir === 'asc' ? 'desc' : 'asc'
                          setSortDir(nextDir)
                          return 'followers'
                        })
                      }
                    >
                      Followers {sortKey === 'followers' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                    </th>
                    <th
                      className="px-3 py-2 text-right cursor-pointer select-none"
                      onClick={() =>
                        setSortKey((prev) => {
                          const nextDir =
                            prev === 'visitors' && sortDir === 'asc' ? 'desc' : 'asc'
                          setSortDir(nextDir)
                          return 'visitors'
                        })
                      }
                    >
                      Visitors {sortKey === 'visitors' && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                    </th>
                    {isAdminRoute && <th className="px-3 py-2">Status</th>}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr
                      key={row.id}
                      className={`border-b last:border-0 hover:bg-slate-50/80 ${
                        isAdminRoute && selectedId === row.id ? 'bg-slate-50' : ''
                      }`}
                      onClick={() => {
                        if (!isAdminRoute) return
                        setSelectedId((prev) => (prev === row.id ? null : row.id))
                        setAdminError(null)
                      }}
                    >
                      <td className="px-3 py-2 text-slate-900">
                        <div className="font-medium">{row.name}</div>
                        {row.region && (
                          <div className="text-xs text-slate-500">
                            {row.region}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-700 text-xs">
                        {row.countryCode}
                      </td>
                      <td className="px-3 py-2 text-slate-700 text-xs">
                        {row.continent}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {row.websiteUrl ? (
                          <a
                            href={row.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline break-all"
                          >
                            {new URL(row.websiteUrl).hostname}
                          </a>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {row.instagramUrl ? (
                          <a
                            href={row.instagramUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline break-all"
                          >
                            {row.instagramHandle ? `@${row.instagramHandle}` : row.instagramUrl}
                          </a>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs text-right tabular-nums text-slate-800">
                        {row.followers != null ? row.followers.toLocaleString() : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-3 py-2 text-xs text-right tabular-nums text-slate-800">
                        {row.visitors != null ? (
                          <>
                            {row.visitors.toLocaleString()}
                            {row.visitorYear && (
                              <span className="ml-1 text-[11px] text-slate-500">
                                ({row.visitorYear})
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      {isAdminRoute && (
                        <td className="px-3 py-2 text-xs">
                          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize
                            border-amber-300 bg-amber-50 text-amber-800">
                            {row.verificationStatus}
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {isAdminRoute && selectedId && (
          <section className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-2">
              Admin override for{' '}
              <span className="font-heading">
                {rows.find((r) => r.id === selectedId)?.name ?? selectedId}
              </span>
            </h3>
            <p className="mb-3 text-xs text-slate-600">
              This form lets you correct discovery guesses with a better website, Instagram handle, follower
              count, and a primary visitor number with source. Changes are saved via the backend override
              endpoint and will refresh the public view.
            </p>
            {adminError && (
              <div className="mb-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {adminError}
              </div>
            )}
            <AdminEditor
              row={rows.find((r) => r.id === selectedId)!}
              saving={saving}
              onSavingChange={setSaving}
              onError={setAdminError}
            />
          </section>
        )}

        <section className="rounded-lg border border-dashed border-slate-300 bg-slate-50/80 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Methodology (very early draft)
          </h3>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            For now, this prototype runs a small pack of Google Programmable Search queries per country to identify
            candidate official tourism websites and Instagram accounts, then stores the top-scoring pair in Firestore
            as <span className="font-mono text-[11px]">destinations</span> and <span className="font-mono text-[11px]">tourismProfiles</span>.
            Everything shown here is still marked as <span className="font-semibold">unverified</span> until it goes
            through a lightweight human review step.
          </p>
        </section>
      </main>
    </div>
  )
}

export default App

type AdminEditorProps = {
  row: DestinationRow
  saving: boolean
  onSavingChange: (saving: boolean) => void
  onError: (msg: string | null) => void
}

function AdminEditor({ row, saving, onSavingChange, onError }: AdminEditorProps) {
  const [websiteUrl, setWebsiteUrl] = useState(row.websiteUrl ?? '')
  const [instagramHandle, setInstagramHandle] = useState(row.instagramHandle ?? '')
  const [instagramUrl, setInstagramUrl] = useState(row.instagramUrl ?? '')
  const [followers, setFollowers] = useState(row.followers?.toString() ?? '')
  const [visitors, setVisitors] = useState(row.visitors?.toString() ?? '')
  const [visitorYear, setVisitorYear] = useState(row.visitorYear?.toString() ?? '')
  const [visitorSourceUrl, setVisitorSourceUrl] = useState('')
  const [visitorDefinition, setVisitorDefinition] = useState(
    'Total visitors (manual override)',
  )
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(
    row.verificationStatus,
  )

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    onError(null)
    onSavingChange(true)
    try {
      const followersValue =
        followers.trim() === '' ? null : Number.isNaN(Number(followers)) ? null : Number(followers)
      const visitorsValue =
        visitors.trim() === '' ? null : Number.isNaN(Number(visitors)) ? null : Number(visitors)
      const yearValue =
        visitorYear.trim() === '' ? null : Number.isNaN(Number(visitorYear)) ? null : Number(visitorYear)

      const body: any = {
        destinationId: row.id,
        websiteUrl: websiteUrl.trim() || null,
        instagramHandle: instagramHandle.trim() || null,
        instagramUrl: instagramUrl.trim() || null,
        followers: followersValue,
        verificationStatus,
      }

      if (visitorsValue !== null || yearValue !== null || visitorSourceUrl.trim()) {
        body.visitorSeries = {
          annualVisitorsValue: visitorsValue,
          visitorYear: yearValue,
          visitorMetricDefinition: visitorDefinition || 'Total visitors (manual override)',
          visitorSourceUrl: visitorSourceUrl.trim() || null,
        }
      }

      const res = await fetch('/api/tii/admin/update-destination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Request failed with status ${res.status}`)
      }
      // Easiest way to reflect changes: reload the page.
      window.location.reload()
    } catch (err: any) {
      onError(err?.message ?? 'Failed to save changes')
    } finally {
      onSavingChange(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-3 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block font-medium mb-1">Website URL</label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Instagram handle</label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
            value={instagramHandle}
            onChange={(e) => setInstagramHandle(e.target.value)}
            placeholder="@explorefrance"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Instagram URL</label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://www.instagram.com/..."
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Followers</label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
            value={followers}
            onChange={(e) => setFollowers(e.target.value)}
            placeholder="e.g. 304000"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Visitors (primary series)</label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
            value={visitors}
            onChange={(e) => setVisitors(e.target.value)}
            placeholder="e.g. 65000000"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Visitor year</label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
            value={visitorYear}
            onChange={(e) => setVisitorYear(e.target.value)}
            placeholder="e.g. 2024"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block font-medium mb-1">Visitor source URL</label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
            value={visitorSourceUrl}
            onChange={(e) => setVisitorSourceUrl(e.target.value)}
            placeholder="Link to article or stats source"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block font-medium mb-1">Visitor metric definition</label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
            value={visitorDefinition}
            onChange={(e) => setVisitorDefinition(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Verification status</label>
          <select
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
            value={verificationStatus}
            onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
          >
            <option value="unverified">Unverified</option>
            <option value="probable">Probable</option>
            <option value="verified">Verified</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-md bg-sky-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-1 disabled:opacity-60"
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save overrides'}
        </button>
        <span className="text-[11px] text-slate-500">
          Admin mode is active because you are viewing the{' '}
          <code className="font-mono text-[11px]">/admin</code> route.
        </span>
      </div>
    </form>
  )
}


