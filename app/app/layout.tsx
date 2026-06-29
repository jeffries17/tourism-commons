import type { Metadata } from 'next'
import { NavBar, Footer } from '@tourism-commons/ui'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tourism Commons — Community-Based Tourism Platform',
  description: 'Discover, develop, and promote community-based, specialist, and emerging tourism experiences worldwide.',
  keywords: ['tourism', 'destinations', 'community-based tourism', 'capacity building'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Tourism Commons',
    description: 'Community-based tourism platform',
  },
}

const navLinks = [
  { label: 'Projects', href: '/projects' },
  { label: 'Resources', href: '/resources' },
  { label: 'Tools', href: '/tools' },
]

const footerColumns = [
  {
    title: 'Projects',
    links: [
      { label: 'All Projects', href: '/projects' },
      { label: 'The Gambia', href: '/projects/gambia' },
      { label: 'Colombia', href: '/projects/colombia' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Reports', href: '/resources' },
      { label: 'Guides', href: '/resources' },
      { label: 'Data', href: '/resources' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Vision', href: '/#vision' },
      { label: 'Platform', href: '/#platform' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="flex flex-col min-h-screen">
        <NavBar links={navLinks} logo="Tourism Commons" />
        <main className="flex-1">{children}</main>
        <Footer columns={footerColumns} />
      </body>
    </html>
  )
}
