import type { Page } from '../App'

const NAV_ITEMS: { id: Page; label: string }[] = [
  { id: 'overview',     label: 'Overview' },
  { id: 'sectors',      label: 'Sectors' },
  { id: 'operators',    label: 'Operators' },
  { id: 'geography',    label: 'Geography' },
  { id: 'methodology',  label: 'Methodology' },
]

export default function Nav({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  return (
    <header className="bg-[#004D40] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span className="font-semibold text-sm tracking-wide">
              Botswana Ecotourism &amp; Adventure
            </span>
            <span className="text-white/30 text-xs hidden sm:block">· Visitor Sentiment Analysis · Baseline 2021–2026</span>
          </div>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setPage(item.id)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  page === item.id
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
