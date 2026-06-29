const useCases = [
  {
    title: 'Destination Managers',
    body: 'Monitor sector digital readiness, benchmark competitor destinations, and build evidence-based capacity programmes.',
  },
  {
    title: 'Researchers & Consultants',
    body: 'Access open methodologies, replicate assessments in new contexts, and contribute to the growing body of tourism evidence.',
  },
  {
    title: 'Policy Makers',
    body: 'Understand digital and structural gaps across the tourism value chain to inform targeted support and investment decisions.',
  },
  {
    title: 'Community Organizations',
    body: 'Track CBT activities, measure community engagement, and document the outcomes of your tourism initiatives.',
  },
  {
    title: 'Tour Operators',
    body: 'Assess your own digital presence, analyse customer reviews, and identify where to focus improvement efforts.',
  },
  {
    title: 'Tourism Students',
    body: 'Use sentiment analysis for case studies, apply assessment frameworks in coursework, and explore real destination data.',
  },
]

export default function UseCases() {
  return (
    <section id="use-cases" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Who Uses This</h2>
          <p className="text-slate-600 max-w-2xl">
            TourismCommons is built for everyone working to make tourism better—from field consultants to final-year students.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {useCases.map((uc) => (
            <div
              key={uc.title}
              className="p-5 bg-slate-50 rounded-xl border-l-4 border-[#0f766e]"
            >
              <h4 className="font-semibold text-slate-900 mb-1.5">{uc.title}</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{uc.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
