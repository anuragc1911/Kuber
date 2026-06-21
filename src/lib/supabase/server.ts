import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  )
}

/**
 * Supabase client for use in Server Components, Route Handlers, and Server Actions.
 * Reads/writes the session cookie so auth state survives between requests.
 *
 * Use the publishable key here — it respects RLS. For full bypass (cron jobs,
 * background tasks, admin tools) reach for `createAdminClient` instead.
 *
 * Throws when env isn't configured — wrap callers in `if (isSupabaseConfigured())`
 * during the demo phase before the project URL is set.
 */
export async function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured yet. Set NEXT_PUBLIC_SUPABASE_URL and ' +
        'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.',
    )
  }
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // setAll was called from a Server Component — safe to ignore if you
            // also have a middleware refreshing the session.
          }
        },
      },
    },
  )
}
