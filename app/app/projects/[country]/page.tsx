import { CountryHero, ProtectedLink, SectionGrid } from '@tourism-commons/ui'
import { notFound } from 'next/navigation'

// Temporary data — will be replaced with registry lookup
const projectsBySlug: Record<string, any> = {
  gambia: {
    name: 'The Gambia',
    year: 2026,
    status: 'active',
    summary: 'Capacity building and market positioning for Gambian tourism operators and guides.',
    description:
      'Working with the International Trade Centre (ITC) to build capacity and market positioning for tourism stakeholders in The Gambia.',
    themes: ['birding', 'capacity building', 'market positioning'],
    links: [
      {
        label: 'BirdFair B2B Toolkit',
        href: '/gambia-birdfair-toolkit',
        protected: true,
      },
      {
        label: 'BirdFair Prep Deck',
        href: '/gambia-birdfair',
        protected: true,
      },
    ],
  },
  colombia: {
    name: 'Colombia',
    year: 2026,
    status: 'active',
    summary: 'Digital strategy and market readiness for Colombian tourism businesses.',
    description:
      'Strategic digital transformation and market readiness assessment for Colombian tourism sector.',
    themes: ['digital transformation', 'market readiness', 'business development'],
    links: [
      {
        label: 'Market Analysis',
        href: '/colombia',
        protected: true,
      },
    ],
  },
}

interface PageProps {
  params: Promise<{ country: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { country } = await params
  const project = projectsBySlug[country]

  if (!project) {
    return { title: 'Project not found' }
  }

  return {
    title: `${project.name} — Tourism Commons`,
    description: project.summary,
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { country } = await params
  const project = projectsBySlug[country]

  if (!project) {
    notFound()
  }

  return (
    <>
      <CountryHero
        title={project.name}
        subtitle={`Year: ${project.year}`}
        description={project.description}
      />

      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:py-20">
        {/* Status and Themes */}
        <div className="mb-12">
          <div className="mb-6 inline-block">
            <span className="rounded-full bg-accent-100 px-4 py-2 text-sm font-semibold uppercase text-accent-800">
              {project.status}
            </span>
          </div>

          {project.themes.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-3 font-semibold text-neutral-900">Themes</h3>
              <div className="flex flex-wrap gap-2">
                {project.themes.map((theme: string) => (
                  <span
                    key={theme}
                    className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Deliverables */}
        {project.links && project.links.length > 0 && (
          <div>
            <h2 className="mb-6 text-2xl font-bold text-neutral-900">Deliverables</h2>
            <SectionGrid cols={2}>
              {project.links.map((link: any) => (
                <ProtectedLink
                  key={link.href}
                  label={link.label}
                  href={link.href}
                  protected={link.protected}
                  className="w-full"
                />
              ))}
            </SectionGrid>
          </div>
        )}

        {/* Placeholder for future sections */}
        <div className="mt-16 border-t border-neutral-200 pt-16">
          <p className="text-neutral-600">
            More project details, team information, and resources coming soon.
          </p>
        </div>
      </div>
    </>
  )
}

export async function generateStaticParams() {
  return Object.keys(projectsBySlug).map((slug) => ({
    country: slug,
  }))
}
