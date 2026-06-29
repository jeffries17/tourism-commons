interface Project {
  region: string
  flag: string
  type: string
  title: string
  summary: string
  href: string
  status: 'live' | 'proposal' | 'findings'
}

const projects: Project[] = [
  {
    region: 'Gambia',
    flag: '🇬🇲',
    type: 'Digital Assessment',
    title: 'Gambia Digital Capacity Assessment',
    summary:
      'Six-dimension digital capacity assessment of 30+ tourism operators and creative industries, covering website, social media, booking, and content capabilities.',
    href: '/gambia-itc',
    status: 'live',
  },
  {
    region: 'Botswana',
    flag: '🇧🇼',
    type: 'Sentiment Analysis',
    title: 'Ecotourism Sentiment Dashboard',
    summary:
      'Structured sentiment analysis of traveller reviews across Botswana ecotourism operators, surfacing key experience themes and product gaps.',
    href: '/botswana',
    status: 'live',
  },
  {
    region: 'Colombia',
    flag: '🇨🇴',
    type: 'Strategic Proposal',
    title: 'TRECC Innovation Proposal',
    summary:
      'Strategic framework for tourism and creative cluster development, exploring competitive positioning and digital innovation pathways.',
    href: '/colombia',
    status: 'proposal',
  },
  {
    region: 'Timor-Leste',
    flag: '🇹🇱',
    type: 'Research Findings',
    title: 'Tourism Competitiveness Findings',
    summary:
      'Research findings on tourism competitiveness, digital readiness, and development opportunities in one of Southeast Asia\'s newest nations.',
    href: '/timorleste',
    status: 'findings',
  },
  {
    region: 'Indian Ocean',
    flag: '🌊',
    type: 'Cluster Development',
    title: 'Blue Tourism Cluster',
    summary:
      'Multi-territory framework for sustainable blue tourism development across six Indian Ocean island destinations.',
    href: '/indian-ocean',
    status: 'findings',
  },
]

const statusLabel: Record<Project['status'], string> = {
  live: 'Live Dashboard',
  proposal: 'Proposal',
  findings: 'Findings',
}

const statusStyle: Record<Project['status'], string> = {
  live: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  proposal: 'bg-blue-50 text-blue-700 border-blue-200',
  findings: 'bg-amber-50 text-amber-700 border-amber-200',
}

export default function Projects() {
  return (
    <section id="projects" className="py-20 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Projects</h2>
          <p className="text-slate-600 max-w-2xl">
            Applied research and analysis delivered with local partners across emerging tourism destinations.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <a
              key={p.href}
              href={p.href}
              className="group bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-3 hover:border-[#0f766e] hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl">{p.flag}</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusStyle[p.status]}`}
                >
                  {statusLabel[p.status]}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#0f766e] uppercase tracking-wide mb-1">
                  {p.region} · {p.type}
                </p>
                <h3 className="text-base font-semibold text-slate-900 group-hover:text-[#0f766e] transition-colors">
                  {p.title}
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed flex-1">{p.summary}</p>
              <span className="text-sm font-medium text-[#0f766e] flex items-center gap-1 mt-auto">
                View project →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
