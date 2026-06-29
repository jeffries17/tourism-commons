export default function Hero() {
  return (
    <header id="top" className="bg-gradient-to-b from-slate-50 to-white px-6 py-20 text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-5">
          Open tools for tourism<br className="hidden sm:block" /> that actually works
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto">
          Field-tested tools, open methodologies, and applied research for tourism
          professionals, destination managers, and researchers—especially in emerging destinations.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="#tools"
            className="bg-[#0f766e] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0d5d56] transition-colors"
          >
            Explore Tools
          </a>
          <a
            href="#about"
            className="border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:border-[#0f766e] hover:text-[#0f766e] transition-colors"
          >
            About the Project
          </a>
        </div>
      </div>
    </header>
  )
}
