export default function About() {
  return (
    <section id="about" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-5">About TourismCommons</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              TourismCommons is a platform for sharing tools, open research, and community-driven
              tourism development. It exists to make serious tourism analysis accessible—especially
              in destinations that are often underserved by expensive proprietary platforms.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              Every tool is free to use. Every methodology is openly documented. Every project
              is designed to leave something useful behind—not just a report on a shelf.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Alex M. Jeffries</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              International consultant and researcher specialising in tourism development,
              digital capacity, and destination competitiveness. Through{' '}
              <strong>Passport Creative</strong>, Alex brings together research, practice, and
              design to help tourism genuinely work for people—communities, operators, and
              destinations alike.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Current work spans the Indian Ocean, West Africa, Southeast Asia, and Latin America,
              with a focus on applied tools that outlast the project engagement.
            </p>
            <div className="mt-6 border-t border-slate-100 pt-6">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Values</h4>
              <ul className="space-y-2">
                {[
                  'Accessible tools for all—free, practical, and community-shaped',
                  'Transparency in data and methodology',
                  'Sustainability in every dimension: environmental, cultural, economic',
                  'Empowerment over dependency—build local capacity',
                ].map((v) => (
                  <li key={v} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-[#0f766e] mt-0.5 shrink-0">✓</span>
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
