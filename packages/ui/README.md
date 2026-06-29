# @tourism-commons/ui

Shared component library and design system for Tourism Commons platform.

## Brand Design System

### Color Palette
- **Primary** (earthy/natural): Brown/tan tones for the main brand
- **Accent** (sky/water): Blue tones for links and highlights
- **Neutral** (slate grays): Text hierarchy and backgrounds

### Typography
- **Body**: Inter (system-ui fallback)
- **Display**: Fraunces (editorial headlines)

## Components

- `ProjectCard` — Country project with status, themes, protected indicator
- `CountryHero` — Full-width hero header with image and description
- `ProtectedLink` — Link with padlock icon for restricted content
- `NavBar` — Top navigation bar
- `Footer` — Site footer with column structure
- `SectionGrid` — Responsive card grid (1-4 columns)

## Usage

```tsx
import { ProjectCard, NavBar, SectionGrid } from '@tourism-commons/ui'

export default function Home() {
  return (
    <>
      <NavBar links={[{ label: 'Projects', href: '/projects' }]} />
      <SectionGrid cols={3}>
        <ProjectCard
          name="The Gambia"
          slug="gambia"
          year={2026}
          status="active"
          summary="..."
          themes={['birding', 'capacity']}
          protected
          href="/projects/gambia"
        />
      </SectionGrid>
    </>
  )
}
```

## Development

All components use Tailwind CSS for styling. Brand tokens are defined in `tailwind.config.ts`.
