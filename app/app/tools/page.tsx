export const metadata = {
  title: 'Tools — Tourism Commons',
  description: 'Internal tools and dashboards for Tourism Commons.',
}

export default function ToolsPage() {
  const tools = [
    {
      name: 'CBT Monitoring',
      description: 'Community-based tourism monitoring dashboard',
      href: '/cbt-monitoring',
    },
    {
      name: 'Sentiment Analysis',
      description: 'Tourism market sentiment and perception analysis',
      href: '/sentiment-analysis',
    },
    {
      name: 'Tourism Instagram Index',
      description: 'Tourism industry Instagram metrics and analysis',
      href: '/tourism-instagram-index',
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:py-20">
      <h1 className="mb-4 text-4xl font-bold text-neutral-900">Tools</h1>
      <p className="mb-12 text-lg text-neutral-600">
        Internal dashboards and analysis tools developed for Tourism Commons projects.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <a
            key={tool.href}
            href={tool.href}
            className="group rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:border-accent-300 hover:shadow-lg"
          >
            <h3 className="mb-2 font-semibold text-neutral-900 group-hover:text-accent-600">
              {tool.name}
            </h3>
            <p className="text-sm text-neutral-600">{tool.description}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
