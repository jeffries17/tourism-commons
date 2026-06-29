import React from 'react'
import { cn } from '../lib/utils'

export interface ProjectCardProps {
  name: string
  slug: string
  year: number
  status: 'active' | 'completed' | 'ongoing'
  summary: string
  themes: string[]
  protected?: boolean
  href: string
  className?: string
}

export const ProjectCard = React.forwardRef<HTMLDivElement, ProjectCardProps>(
  ({ name, year, status, summary, themes, protected: isProtected, href, className }, ref) => {
    const statusColor = {
      active: 'bg-accent-100 text-accent-800',
      completed: 'bg-neutral-100 text-neutral-700',
      ongoing: 'bg-primary-100 text-primary-800',
    }

    return (
      <a href={href} className={cn('block', className)}>
        <div
          ref={ref}
          className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:border-accent-300 hover:shadow-lg"
        >
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-neutral-900">{name}</h3>
              <p className="text-sm text-neutral-500">{year}</p>
            </div>
            {isProtected && (
              <div className="text-neutral-400" title="Protected content">
                🔒
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="mb-4 inline-block">
            <span className={cn('rounded-full px-3 py-1 text-xs font-semibold uppercase', statusColor[status])}>
              {status}
            </span>
          </div>

          {/* Description */}
          <p className="mb-4 line-clamp-2 text-sm text-neutral-600">{summary}</p>

          {/* Themes */}
          {themes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {themes.map((theme) => (
                <span key={theme} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600">
                  {theme}
                </span>
              ))}
            </div>
          )}
        </div>
      </a>
    )
  }
)

ProjectCard.displayName = 'ProjectCard'
