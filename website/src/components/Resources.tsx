const resources = [
  {
    icon: '📊',
    title: 'Digital Assessment Methodology',
    description:
      'Six-dimension framework, sector-specific weightings, and scoring guides. Includes maturity level definitions and the Creative Tourism Score approach.',
    href: '/digital-assessment',
    linkLabel: 'View methodology →',
  },
  {
    icon: '💬',
    title: 'Sentiment Analysis Guide',
    description:
      'Theme definitions, keyword strategies, and best practices for structuring tourism review analysis. Covers theme detection, scoring, and how to interpret results.',
    href: '/sentiment-analysis',
    linkLabel: 'Try the tool →',
  },
  {
    icon: '🌍',
    title: 'CBT Monitoring Framework',
    description:
      'Indicators, tracking logic, and field update structures for community-based tourism monitoring. Designed for low-bandwidth field contexts.',
    href: '/cbt-monitoring',
    linkLabel: 'View dashboard →',
  },
  {
    icon: '🔬',
    title: 'Research Approach',
    description:
      'How TourismCommons designs assessments: combining external audits, stakeholder surveys, and sector-specific analysis to produce evidence that holds up in policy contexts.',
    href: '/#about',
    linkLabel: 'Read about our approach →',
  },
]

export default function Resources() {
  return (
    <section id="resources" className="py-20 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Resources & Methodology</h2>
          <p className="text-slate-600 max-w-2xl">
            Open frameworks and implementation guides behind every tool we build.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {resources.map((r) => (
            <div
              key={r.title}
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-3"
            >
              <div className="text-2xl">{r.icon}</div>
              <h4 className="font-semibold text-slate-900">{r.title}</h4>
              <p className="text-sm text-slate-600 leading-relaxed flex-1">{r.description}</p>
              <a href={r.href} className="text-sm font-medium text-[#0f766e] hover:underline">
                {r.linkLabel}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
