import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role client. Bypasses Row Level Security entirely.
 *
 * ⚠️  Server-only. Never import this from a Client Component. Never expose the
 * secret key to the browser. Use it for: cron jobs, background ingestion,
 * admin actions where you've validated the actor server-side.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SECRET_KEY
  if (!url || !secret) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in env. ' +
        'Add them to .env.local (see .env.local.example).',
    )
  }
  return createSupabaseClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
