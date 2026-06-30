import { NextRequest, NextResponse } from 'next/server'

// Project-specific passwords
const PROJECT_PASSWORDS: Record<string, string> = {
  gambia: process.env.GAMBIA_PASSWORD || '',
  colombia: process.env.COLOMBIA_PASSWORD || '',
  'indian-ocean': process.env.INDIAN_OCEAN_PASSWORD || '',
  botswana: process.env.BOTSWANA_PASSWORD || '',
  benin: process.env.BENIN_PASSWORD || '',
  timorleste: process.env.TIMORLESTE_PASSWORD || '',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { country, password } = body

    // Validate input
    if (!country || !password) {
      return NextResponse.json(
        { error: 'Missing country or password' },
        { status: 400 }
      )
    }

    // Validate password
    const expectedPassword = PROJECT_PASSWORDS[country]
    if (!expectedPassword || password !== expectedPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Set cookie with the password
    const response = NextResponse.json({ success: true })
    response.cookies.set({
      name: `tc-${country}-access`,
      value: password,
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
