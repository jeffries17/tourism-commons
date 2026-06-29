export default function Contact() {
  return (
    <section id="contact" className="py-20 px-6 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-center">
          <div className="sm:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-3">Get Involved</h2>
            <p className="text-slate-400 leading-relaxed mb-2">
              These tools are open and free. If you'd like to collaborate on a project,
              adapt a tool for your destination, or contribute improvements, we'd love to
              hear from you.
            </p>
            <p className="text-xs text-slate-500">
              All tools respect user privacy. Data collection is opt-in only.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href="mailto:alex.jeffries@gmail.com"
              className="block text-center bg-[#0f766e] text-white font-medium px-5 py-3 rounded-lg hover:bg-[#0d5d56] transition-colors"
            >
              Send a Message
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
