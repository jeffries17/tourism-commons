const pillars = [
  {
    icon: '📂',
    title: 'Open Methodology',
    body: 'Every framework, scoring guide, and data model is documented and freely available. Build on our work or adapt it for your context.',
  },
  {
    icon: '🌍',
    title: 'Field-Tested',
    body: 'Tools are developed through real projects—then refined. What you use here has been validated with operators and communities on the ground.',
  },
  {
    icon: '🤝',
    title: 'Built with Communities',
    body: 'Co-design with stakeholders is non-negotiable. Local voices shape the questions we ask, the indicators we track, and the stories we tell.',
  },
  {
    icon: '🆓',
    title: 'Free to Use',
    body: 'No subscriptions, no paywalls. These tools exist because useful tourism analysis shouldn\'t cost $500/month.',
  },
]

export default function Approach() {
  return (
    <section className="py-20 px-6 bg-[#f0fdfa]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">How We Work</h2>
          <p className="text-slate-600 max-w-2xl">
            The principles behind every project and tool we build.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p) => (
            <div key={p.title} className="bg-white rounded-xl p-6 border border-[#ccfbf1]">
              <div className="text-2xl mb-3">{p.icon}</div>
              <h3 className="font-semibold text-slate-900 mb-2">{p.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
