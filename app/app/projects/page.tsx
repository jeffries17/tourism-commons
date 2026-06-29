import { SectionGrid, ProjectCard } from '@tourism-commons/ui'

// This will be replaced with dynamic content from the registry
const projectsData = [
  {
    name: 'The Gambia',
    slug: 'gambia',
    year: 2026,
    status: 'active' as const,
    summary: 'Capacity building and market positioning for Gambian tourism operators and guides.',
    themes: ['birding', 'capacity building'],
    protected: true,
  },
  {
    name: 'Colombia',
    slug: 'colombia',
    year: 2026,
    status: 'active' as const,
    summary: 'Digital strategy and market readiness for Colombian tourism businesses.',
    themes: ['digital transformation', 'market readiness'],
    protected: true,
  },
  {
    name: 'Indian Ocean Blue Tourism',
    slug: 'indian-ocean',
    year: 2025,
    status: 'ongoing' as const,
    summary: 'Regional tourism cluster development across 6 Indian Ocean territories.',
    themes: ['regional cooperation', 'blue economy'],
    protected: true,
  },
  {
    name: 'Botswana',
    slug: 'botswana',
    year: 2025,
    status: 'ongoing' as const,
    summary: 'Ecotourism analysis and market positioning for Botswana operators.',
    themes: ['ecotourism', 'market analysis'],
    protected: true,
  },
  {
    name: 'Benin',
    slug: 'benin',
    year: 2026,
    status: 'active' as const,
    summary: 'Cultural tourism development and positioning strategy.',
    themes: ['cultural tourism', 'capacity building'],
    protected: true,
  },
  {
    name: 'Timor-Leste',
    slug: 'timorleste',
    year: 2024,
    status: 'completed' as const,
    summary: 'Tourism sector analysis and development roadmap.',
    themes: ['sector analysis', 'strategic planning'],
    protected: true,
  },
]

export const metadata = {
  title: 'Projects — Tourism Commons',
  description: 'Explore Tourism Commons projects across key destinations.',
}

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:py-20">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold text-neutral-900">All Projects</h1>
        <p className="text-lg text-neutral-600">
          Tourism Commons works across multiple destinations and regions. Each project includes
          public resources, capacity building materials, and strategic analysis.
        </p>
      </div>

      <SectionGrid cols={3}>
        {projectsData.map((project) => (
          <ProjectCard
            key={project.slug}
            {...project}
            href={`/projects/${project.slug}`}
          />
        ))}
      </SectionGrid>
    </div>
  )
}
