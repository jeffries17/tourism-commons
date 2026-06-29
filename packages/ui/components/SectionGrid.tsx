import React from 'react'
import { cn } from '../lib/utils'

export interface SectionGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4
}

export const SectionGrid = React.forwardRef<HTMLDivElement, SectionGridProps>(
  ({ children, cols = 3, className, ...props }, ref) => {
    const colsClass = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    }

    return (
      <div
        ref={ref}
        className={cn('grid gap-6', colsClass[cols], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

SectionGrid.displayName = 'SectionGrid'
