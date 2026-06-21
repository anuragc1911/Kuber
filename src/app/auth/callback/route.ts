import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserOrgs } from '@/lib/supabase/orgs'

/**
 * Email-confirmation + OAuth callback. Exchanges the `code` for a session,
 * then sends the user to onboarding (no org yet) or `/app` (or ?next=).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`)
  }

  // Decide landing: explicit `next` wins, otherwise route by org membership.
  if (next) return NextResponse.redirect(`${origin}${next}`)

  try {
    const orgs = await getUserOrgs()
    if (orgs.length === 0) {
      return NextResponse.redirect(`${origin}/onboarding/create-org`)
    }
  } catch {
    // If the orgs table isn't set up yet, fall through to /app.
  }
  return NextResponse.redirect(`${origin}/app`)
}
