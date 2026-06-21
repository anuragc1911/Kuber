import { redirect } from 'next/navigation'
import { AppShell } from '@/components/app/app-shell'
import { alertsCount, pendingRemindersCount } from '@/lib/activity'
import { businessName as demoBusiness } from '@/lib/data'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { getUserOrgs } from '@/lib/supabase/orgs'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const aCount = alertsCount().total
  const rCount = pendingRemindersCount()

  // Try to read the signed-in user. Falls through to the demo profile when
  // Supabase isn't configured (no NEXT_PUBLIC_SUPABASE_URL set).
  let userEmail: string | null = null
  let business = demoBusiness
  try {
    if (isSupabaseConfigured()) {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        userEmail = user.email ?? null

        // Gate: signed-in users without an org go to onboarding.
        try {
          const orgs = await getUserOrgs()
          if (orgs.length === 0) redirect('/onboarding/create-org')
          // Use the most recent org's name as the displayed workspace.
          business = orgs[0].name
        } catch {
          // Tables not provisioned yet — fall back to user metadata / demo.
          const meta = (user.user_metadata ?? {}) as { business_name?: string | null }
          business = meta.business_name || user.email?.split('@')[0] || demoBusiness
        }
      }
    }
  } catch (err) {
    // Re-throw `redirect()` errors; swallow anything else and stay in demo mode.
    if (err && typeof err === 'object' && 'digest' in err) throw err
  }

  return (
    <AppShell
      alertCount={aCount}
      reminderCount={rCount}
      userEmail={userEmail}
      businessName={business}
    >
      {children}
    </AppShell>
  )
}
