import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
    remotePatterns: [],
  },
  redirects: async () => [
    // Temporary rewrites to keep old Firebase routes working during transition
    {
      source: '/gambia-birdfair/:path*',
      destination: '/build/gambia-birdfair/:path*',
      permanent: false,
    },
    {
      source: '/gambia-birdfair-toolkit/:path*',
      destination: '/build/gambia-birdfair-toolkit/:path*',
      permanent: false,
    },
    {
      source: '/colombia/:path*',
      destination: '/build/colombia/:path*',
      permanent: false,
    },
    {
      source: '/indian-ocean/:path*',
      destination: '/build/indian-ocean/:path*',
      permanent: false,
    },
    {
      source: '/botswana/:path*',
      destination: '/build/botswana/:path*',
      permanent: false,
    },
    {
      source: '/timorleste/:path*',
      destination: '/build/timorleste/:path*',
      permanent: false,
    },
  ],
}

export default nextConfig
