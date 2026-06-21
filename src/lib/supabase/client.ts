'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client for use in browser-side React components.
 * Reads cookies for the current session — safe to expose the publishable key.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
}
