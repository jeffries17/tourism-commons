import React from 'react'
import { cn } from '../lib/utils'

export interface NavBarProps extends React.HTMLAttributes<HTMLDivElement> {
  logo?: React.ReactNode
  links?: Array<{ label: string; href: string }>
}

export const NavBar = React.forwardRef<HTMLDivElement, NavBarProps>(
  ({ logo, links, className, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn('border-b border-neutral-200 bg-white', className)}
        {...props}
      >
        <div className="mx-auto max-w-6xl px-6 py-4 sm:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="text-lg font-semibold text-neutral-900">
              {logo || 'Tourism Commons'}
            </div>

            {/* Links */}
            {links && links.length > 0 && (
              <ul className="hidden gap-8 md:flex">
                {links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm font-medium text-neutral-600 transition-colors hover:text-accent-600"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </nav>
    )
  }
)

NavBar.displayName = 'NavBar'
