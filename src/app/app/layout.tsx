import { AppShell } from '@/components/app/app-shell'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let userEmail: string | null = null
  try {
    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      userEmail = user?.email ?? null
    }
  } catch {
    // Stay in demo mode if Supabase isn't reachable.
  }

  return <AppShell userEmail={userEmail}>{children}</AppShell>
}
