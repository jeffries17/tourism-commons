import { CountryHero, SectionGrid, ProjectCard } from '@tourism-commons/ui'

export default function Home() {
  return (
    <>
      {/* Hero */}
      <CountryHero
        title="Tourism Commons"
        subtitle="Platform"
        description="Improving the visibility, accessibility and market readiness of community-based, specialist and emerging tourism experiences worldwide."
      />

      {/* Featured Projects Section */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:py-20">
        <div className="mb-12">
          <h2 className="mb-4 text-3xl font-bold text-neutral-900">Featured Projects</h2>
          <p className="text-lg text-neutral-600">
            Explore our current work across key destinations and regions.
          </p>
        </div>

        <SectionGrid cols={3}>
          <ProjectCard
            name="The Gambia"
            slug="gambia"
            year={2026}
            status="active"
            summary="Capacity building and market positioning for Gambian tourism operators and guides."
            themes={['birding', 'capacity building']}
            protected
            href="/projects/gambia"
          />
          <ProjectCard
            name="Colombia"
            slug="colombia"
            year={2026}
            status="active"
            summary="Digital strategy and market readiness for Colombian tourism businesses."
            themes={['digital transformation', 'market readiness']}
            protected
            href="/projects/colombia"
          />
          <ProjectCard
            name="Indian Ocean Blue Tourism"
            slug="indian-ocean"
            year={2025}
            status="ongoing"
            summary="Regional tourism cluster development across 6 Indian Ocean territories."
            themes={['regional cooperation', 'blue economy']}
            protected
            href="/projects/indian-ocean"
          />
        </SectionGrid>
      </section>

      {/* Vision Section */}
      <section id="vision" className="bg-neutral-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <h2 className="mb-12 text-3xl font-bold text-neutral-900">Our Approach</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Visibility',
                description: 'Help overlooked tourism experiences become discoverable',
              },
              {
                title: 'Simplicity',
                description: 'Information should be easy to find. No hidden PDFs. No confusing websites.',
              },
              {
                title: 'Community',
                description: 'Projects should not rely entirely on us for ongoing support',
              },
              {
                title: 'Open',
                description: 'Resources should be reusable by destinations, NGOs and tourism boards',
              },
              {
                title: 'Practical',
                description: 'Every feature solves a real problem encountered during consulting',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-neutral-200 bg-white p-6">
                <h3 className="mb-2 font-semibold text-neutral-900">{item.title}</h3>
                <p className="text-sm text-neutral-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:py-20">
        <div className="rounded-lg bg-accent-50 p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-neutral-900">
            Explore All Projects
          </h2>
          <p className="mb-8 text-lg text-neutral-600">
            View the complete portfolio of work across destinations and sectors.
          </p>
          <a
            href="/projects"
            className="inline-block rounded-lg bg-accent-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-700"
          >
            View Projects
          </a>
        </div>
      </section>
    </>
  )
}
