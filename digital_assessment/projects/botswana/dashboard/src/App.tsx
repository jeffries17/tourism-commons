import { useState, useEffect } from 'react'
import type { DashboardData } from './types'
import Nav from './components/Nav'
import Overview from './pages/Overview'
import Sectors from './pages/Sectors'
import Operators from './pages/Operators'
import Methodology from './pages/Methodology'
import Geography from './pages/Geography'

export type Page = 'overview' | 'sectors' | 'operators' | 'geography' | 'methodology'
const VALID_PAGES: Page[] = ['overview', 'sectors', 'operators', 'geography', 'methodology']

function pageFromHash(): Page {
  const h = window.location.hash.slice(1) as Page
  return VALID_PAGES.includes(h) ? h : 'overview'
}

export default function App() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [page, setPage] = useState<Page>(pageFromHash)

  useEffect(() => {
    fetch('/botswana/botswana_sentiment_data.json')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
  }, [])

  useEffect(() => {
    window.location.hash = page
  }, [page])

  useEffect(() => {
    const handler = () => setPage(pageFromHash())
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#00695C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#6B7280] text-sm">Loading analysis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Nav page={page} setPage={setPage} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {page === 'overview'    && <Overview data={data} setPage={setPage} />}
        {page === 'sectors'     && <Sectors data={data} />}
        {page === 'operators'   && <Operators data={data} />}
        {page === 'geography'   && <Geography data={data} />}
        {page === 'methodology' && <Methodology data={data} />}
      </main>
    </div>
  )
}
