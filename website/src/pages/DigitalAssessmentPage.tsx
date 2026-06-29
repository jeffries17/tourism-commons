const dimensions = [
  {
    icon: '📱',
    name: 'Social Media',
    description:
      'Presence, posting frequency, and engagement across key platforms. Evaluated differently depending on whether the business is consumer-facing or trade-focused.',
  },
  {
    icon: '🌐',
    name: 'Website',
    description:
      'Functionality, mobile-friendliness, content quality, and professional presentation. Is it findable? Does it convert?',
  },
  {
    icon: '📸',
    name: 'Visual Content',
    description:
      'Quality and variety of photos, videos, and visual materials. For tourism and creative businesses, imagery is often the first and most powerful sales channel.',
  },
  {
    icon: '🔍',
    name: 'Discoverability',
    description:
      'Search engine visibility, directory listings, Google Business presence, and online reviews. How easily can a traveller or trade buyer find this business?',
  },
  {
    icon: '💳',
    name: 'Digital Sales',
    description:
      'Online booking, contact forms, WhatsApp Business, digital payment options. Can customers actually buy—or at minimum, enquire—without picking up a phone?',
  },
  {
    icon: '🔗',
    name: 'Platform Integration',
    description:
      'Presence and completeness on tourism platforms, review sites, and trade directories. Is the business visible where buyers and travellers are already looking?',
  },
]

const maturityLevels = [
  { range: '0–20%', label: 'Starting Out', color: 'bg-red-50 border-red-200 text-red-800' },
  { range: '21–40%', label: 'Developing', color: 'bg-orange-50 border-orange-200 text-orange-800' },
  { range: '41–60%', label: 'Established', color: 'bg-amber-50 border-amber-200 text-amber-800' },
  { range: '61–80%', label: 'Advanced', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  { range: '81–100%', label: 'Leading', color: 'bg-teal-50 border-teal-200 text-teal-800' },
]

const process = [
  {
    step: '01',
    title: 'External Presence Audit',
    body: 'Objective evaluation of every publicly visible digital asset: websites, social media, review platforms, directories. No surveys needed — this is the view a potential customer actually has.',
  },
  {
    step: '02',
    title: 'Self-Assessment Survey',
    body: "Optional survey where businesses share internal digital practices and tools that don't appear publicly. Captures what's happening behind the scenes.",
  },
  {
    step: '03',
    title: 'Sector-Weighted Scoring',
    body: 'Raw scores are adjusted by sector-specific multipliers. A craft artist is scored differently from a tour operator — because what drives their success is different.',
  },
  {
    step: '04',
    title: 'Personalised Recommendations',
    body: 'Each participant receives prioritised, practical recommendations based on their maturity level, sector, and the gaps most likely to hold them back.',
  },
]

export default function DigitalAssessmentPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-[#0f766e] font-semibold text-lg tracking-tight">
            TourismCommons
          </a>
          <a
            href="/#contact"
            className="text-sm font-medium bg-[#0f766e] text-white px-4 py-2 rounded-lg hover:bg-[#0d5d56] transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </nav>

      {/* Hero */}
      <header className="bg-gradient-to-b from-slate-50 to-white px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#0f766e] text-sm font-semibold uppercase tracking-wide mb-3">
            Digital Assessment Service
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-5">
            Where does your destination stand—digitally?
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            A structured, evidence-based audit of digital capacity across tourism operators and
            creative industries. Built for destinations that want a clear picture of where they are
            and a practical path forward.
          </p>
          <a
            href="/#contact"
            className="inline-block bg-[#0f766e] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0d5d56] transition-colors"
          >
            Discuss your destination →
          </a>
        </div>
      </header>

      {/* Six Dimensions */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Six assessment dimensions</h2>
            <p className="text-slate-600 max-w-2xl">
              Every business is evaluated across six areas of digital capability. Each is scored
              0–10 on objective, observable criteria — no guesswork.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {dimensions.map((d) => (
              <div
                key={d.name}
                className="bg-slate-50 rounded-xl p-6 border border-slate-200"
              >
                <div className="text-2xl mb-3">{d.icon}</div>
                <h3 className="font-semibold text-slate-900 mb-2">{d.name}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sector Weighting */}
      <section className="py-20 px-6 bg-[#f0fdfa]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Sector-specific, not one-size-fits-all
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                A craft artist's business lives or dies on Instagram. A tour operator's bookings
                come through Google search and platform listings. Treating them identically would
                produce meaningless scores.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                After calculating raw scores, we apply <strong>sector-specific multipliers</strong>{' '}
                that weight each dimension by its real-world importance to that business type. The
                multipliers always sum to the same total — so scores remain comparable across
                sectors.
              </p>
              <p className="text-slate-600 leading-relaxed">
                This produces a final percentage score (0–100%) that is both fair and meaningful:
                high scores genuinely reflect digital strength for that business type.
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h4 className="font-semibold text-slate-900 mb-3">🎨 Creative industries example</h4>
                <div className="space-y-1.5 text-sm">
                  {[
                    { label: '📱 Social Media', weight: '2.2×', highlight: true },
                    { label: '📸 Visual Content', weight: '2.0×', highlight: true },
                    { label: '🌐 Website', weight: '1.0×', highlight: false },
                    { label: '🔍 Discoverability', weight: '0.8×', highlight: false },
                    { label: '💳 Digital Sales', weight: '0.5×', highlight: false },
                    { label: '🔗 Platform Integration', weight: '0.5×', highlight: false },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-slate-700">{row.label}</span>
                      <span
                        className={
                          row.highlight
                            ? 'font-semibold text-[#0f766e]'
                            : 'text-slate-500'
                        }
                      >
                        {row.weight}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                  Social media and visual content are primary sales channels for artisans
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h4 className="font-semibold text-slate-900 mb-3">🚌 Tour operators example</h4>
                <div className="space-y-1.5 text-sm">
                  {[
                    { label: '🔍 Discoverability', weight: '2.1×', highlight: true },
                    { label: '🌐 Website', weight: '1.2×', highlight: true },
                    { label: '📱 Social Media', weight: '1.1×', highlight: false },
                    { label: '💳 Digital Sales', weight: '1.0×', highlight: false },
                    { label: '📸 Visual Content', weight: '0.8×', highlight: false },
                    { label: '🔗 Platform Integration', weight: '0.8×', highlight: false },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-slate-700">{row.label}</span>
                      <span
                        className={
                          row.highlight
                            ? 'font-semibold text-[#0f766e]'
                            : 'text-slate-500'
                        }
                      >
                        {row.weight}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                  Travellers search Google months before they arrive; discoverability is critical
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Maturity Levels */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Five maturity levels</h2>
            <p className="text-slate-600 max-w-2xl">
              Final percentage scores place each business on a maturity spectrum — making it easy
              to understand the distribution across a destination and track progress over time.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {maturityLevels.map((level) => (
              <div
                key={level.label}
                className={`rounded-xl border p-4 text-center ${level.color}`}
              >
                <div className="text-sm font-mono font-bold mb-1">{level.range}</div>
                <div className="font-semibold text-sm">{level.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creative Tourism Score */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Creative Tourism Score
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Alongside the digital maturity assessment, we offer a complementary metric that
                evaluates how international tour operators and travel trade actually position and
                market a destination's creative and cultural assets.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                Rather than assessing operators' own digital capability, this score asks: are
                cultural experiences — heritage, crafts, music, festivals, performing arts — being
                meaningfully promoted as selling points, or are they buried under generic beach-and-nature
                descriptions?
              </p>
              <p className="text-slate-600 leading-relaxed">
                Scores run 0–100, from "beach/nature focus" through to "culture-led tourism."
                The gap between a destination's actual cultural richness and how it's being marketed
                is often where the most valuable opportunity sits.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">
                Eight creative sectors evaluated
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: '🏛️', label: 'Heritage Sites & Museums' },
                  { icon: '🎨', label: 'Crafts & Artisan Products' },
                  { icon: '🎵', label: 'Music' },
                  { icon: '🎭', label: 'Performing & Visual Arts' },
                  { icon: '🎪', label: 'Festivals & Cultural Events' },
                  { icon: '🎬', label: 'Audiovisual & Film' },
                  { icon: '✨', label: 'Fashion & Design' },
                  { icon: '📚', label: 'Publishing & Storytelling' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700"
                  >
                    <span>{s.icon}</span>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">How it works</h2>
            <p className="text-slate-600 max-w-2xl">
              From audit to action in four steps.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((p) => (
              <div key={p.step} className="flex flex-col gap-3">
                <div className="text-3xl font-bold text-[#ccfbf1] font-mono">{p.step}</div>
                <h3 className="font-semibold text-slate-900">{p.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to assess your destination?
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            The assessment is adaptable to any destination size and sector mix. Get in touch to
            discuss scope, timeline, and what the outputs would look like for your context.
          </p>
          <a
            href="/#contact"
            className="inline-block bg-[#0f766e] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#0d5d56] transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 bg-slate-900 border-t border-slate-800 text-center">
        <p className="text-slate-500 text-sm">
          © TourismCommons · Open tools, open knowledge ·{' '}
          <a
            href="https://passportcreative.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-300 transition-colors"
          >
            Passport Creative
          </a>
        </p>
      </footer>
    </div>
  )
}
