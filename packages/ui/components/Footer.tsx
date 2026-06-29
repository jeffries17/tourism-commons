import React from 'react'
import { cn } from '../lib/utils'

export interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: Array<{
    title: string
    links: Array<{ label: string; href: string }>
  }>
}

export const Footer = React.forwardRef<HTMLDivElement, FooterProps>(
  ({ columns, className, ...props }, ref) => {
    return (
      <footer
        ref={ref}
        className={cn('border-t border-neutral-200 bg-neutral-50', className)}
        {...props}
      >
        <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
          {/* Columns */}
          {columns && columns.length > 0 && (
            <div className="mb-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {columns.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 font-semibold text-neutral-900">{col.title}</h4>
                  <ul className="space-y-2">
                    {col.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          className="text-sm text-neutral-600 transition-colors hover:text-accent-600"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Copyright */}
          <div className="border-t border-neutral-200 pt-8">
            <p className="text-center text-sm text-neutral-600">
              © {new Date().getFullYear()} Tourism Commons. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    )
  }
)

Footer.displayName = 'Footer'
