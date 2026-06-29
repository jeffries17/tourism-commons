import React from 'react'
import { cn } from '../lib/utils'

export interface ProtectedLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  label: string
  protected?: boolean
  children?: React.ReactNode
}

export const ProtectedLink = React.forwardRef<HTMLAnchorElement, ProtectedLinkProps>(
  ({ label, protected: isProtected = true, className, children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 transition-all hover:border-accent-300 hover:bg-accent-50',
          isProtected && 'opacity-75',
          className
        )}
        {...props}
      >
        {isProtected && <span className="text-base">🔒</span>}
        <span className="font-medium text-neutral-900">{label}</span>
        {children}
      </a>
    )
  }
)

ProtectedLink.displayName = 'ProtectedLink'
