import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
    remotePatterns: [],
  },
  rewrites: async () => ({
    beforeFiles: [
      // Temporary rewrites to keep old Firebase routes working during transition
      {
        source: '/gambia-birdfair/:path*',
        destination: '/build/gambia-birdfair/:path*',
      },
      {
        source: '/gambia-birdfair-toolkit/:path*',
        destination: '/build/gambia-birdfair-toolkit/:path*',
      },
      {
        source: '/colombia/:path*',
        destination: '/build/colombia/:path*',
      },
      {
        source: '/indian-ocean/:path*',
        destination: '/build/indian-ocean/:path*',
      },
      {
        source: '/botswana/:path*',
        destination: '/build/botswana/:path*',
      },
      {
        source: '/timorleste/:path*',
        destination: '/build/timorleste/:path*',
      },
      {
        source: '/sentiment-analysis/:path*',
        destination: '/build/sentiment-analysis/:path*',
      },
      {
        source: '/cbt-monitoring/:path*',
        destination: '/build/cbt-monitoring/:path*',
      },
      {
        source: '/tourism-instagram-index/:path*',
        destination: '/build/tourism-instagram-index/:path*',
      },
      {
        source: '/gambia-itc/:path*',
        destination: '/build/gambia-itc/:path*',
      },
    ],
  }),
}

export default nextConfig
