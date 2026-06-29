import React from 'react'
import { cn } from '../lib/utils'

export interface CountryHeroProps {
  title: string
  subtitle?: string
  description: string
  imageUrl?: string
  imageAlt?: string
  className?: string
}

export const CountryHero = React.forwardRef<HTMLDivElement, CountryHeroProps>(
  ({ title, subtitle, description, imageUrl, imageAlt, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full overflow-hidden bg-gradient-to-b from-primary-50 to-white',
          className
        )}
      >
        {/* Background Image */}
        {imageUrl && (
          <div className="absolute inset-0 opacity-20">
            <img
              src={imageUrl}
              alt={imageAlt || title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 sm:px-8 lg:py-20">
          {subtitle && (
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary-600">
              {subtitle}
            </p>
          )}
          <h1 className="mb-6 font-display text-4xl font-bold text-neutral-900 sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="max-w-2xl text-lg text-neutral-700">
            {description}
          </p>
        </div>
      </div>
    )
  }
)

CountryHero.displayName = 'CountryHero'
