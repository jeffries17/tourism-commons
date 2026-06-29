import { NextRequest, NextResponse } from 'next/server'

// Token storage — will be replaced with env vars
const ACCESS_TOKENS: Record<string, string> = {
  gambia: process.env.GAMBIA_ACCESS_TOKEN || '',
  colombia: process.env.COLOMBIA_ACCESS_TOKEN || '',
  'indian-ocean': process.env.INDIAN_OCEAN_ACCESS_TOKEN || '',
  botswana: process.env.BOTSWANA_ACCESS_TOKEN || '',
  benin: process.env.BENIN_ACCESS_TOKEN || '',
  timorleste: process.env.TIMORLESTE_ACCESS_TOKEN || '',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { country, token } = body

    // Validate input
    if (!country || !token) {
      return NextResponse.json(
        { error: 'Missing country or token' },
        { status: 400 }
      )
    }

    // Validate token
    const expectedToken = ACCESS_TOKENS[country]
    if (!expectedToken || token !== expectedToken) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      )
    }

    // Set cookie with the token
    const response = NextResponse.json({ success: true })
    response.cookies.set({
      name: `tc-${country}-token`,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
