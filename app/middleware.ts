import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_ROUTES = [
  '/gambia-birdfair',
  '/gambia-birdfair-toolkit',
  '/colombia',
  '/indian-ocean',
  '/botswana',
  '/timorleste',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if this is a protected route
  const isProtected = PROTECTED_ROUTES.some(route =>
    pathname.startsWith(route)
  )

  if (isProtected) {
    // Check for access token in cookie
    const accessToken = request.cookies.get('tc-access-token')?.value

    // For now, allow all — tokens will be validated in the unlock API
    // This is a placeholder for future cookie-based access control
    if (!accessToken) {
      // Optionally redirect to unlock page
      // return NextResponse.redirect(new URL(`/projects/${country}/unlock`, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
