interface Tool {
  title: string
  badge?: string
  description: string
  features: string[]
  href: string
  cta: string
}

const tools: Tool[] = [
  {
    title: 'Sentiment Analysis Tool',
    badge: 'New',
    description:
      'Analyse tourism reviews with customisable theme-based sentiment detection. Export results to Google Sheets.',
    features: [
      'Upload reviews via CSV or paste',
      'Custom theme & keyword detection',
      'Visual charts & report export',
      'Save & compare sessions',
    ],
    href: '/sentiment-analysis',
    cta: 'Try It Now',
  },
  {
    title: 'CBT Monitoring Dashboard',
    description:
      'Real-time monitoring for Community-Based Tourism activities. Track engagement, status, and content production.',
    features: [
      'Quick field update forms',
      'Status tracking & alerts',
      'Automated reminders',
      'Regional filtering',
    ],
    href: '/cbt-monitoring',
    cta: 'View Dashboard',
  },
]

export default function Tools() {
  return (
    <section id="tools" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Free Tools & Dashboards</h2>
          <p className="text-slate-600 max-w-2xl">
            Open-source tools designed for tourism stakeholders, researchers, and communities.
            No sign-up required.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <div
              key={tool.href}
              className="border border-slate-200 rounded-xl p-6 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all bg-white"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-[#0f766e]">{tool.title}</h3>
                {tool.badge && (
                  <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {tool.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{tool.description}</p>
              <ul className="space-y-1">
                {tool.features.map((f) => (
                  <li key={f} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-[#0f766e] mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={tool.href}
                className="mt-auto block text-center bg-[#0f766e] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#0d5d56] transition-colors"
              >
                {tool.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
