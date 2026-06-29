export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#top" className="text-[#0f766e] font-semibold text-lg tracking-tight">
          TourismCommons
        </a>
        <ul className="hidden sm:flex items-center gap-8 list-none m-0 p-0">
          {[
            { label: 'Tools', href: '#tools' },
            { label: 'Resources', href: '#resources' },
            { label: 'About', href: '#about' },
          ].map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                className="text-slate-600 hover:text-[#0f766e] text-sm font-medium transition-colors"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#contact"
          className="text-sm font-medium bg-[#0f766e] text-white px-4 py-2 rounded-lg hover:bg-[#0d5d56] transition-colors"
        >
          Get in Touch
        </a>
      </div>
    </nav>
  )
}
