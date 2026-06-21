import { redirect } from 'next/navigation'
import { isSupabaseConfigured, createClient } from '@/lib/supabase/server'
import { getUserOrgs } from '@/lib/supabase/orgs'
import { CreateOrgForm } from './form'

export const metadata = { title: 'create your workspace — Kuber' }

export default async function CreateOrgPage() {
  if (!isSupabaseConfigured()) redirect('/sign-in')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  // If they already have orgs, send them straight to the app.
  const orgs = await getUserOrgs()
  if (orgs.length > 0) redirect('/app')

  return (
    <div className="w-full max-w-md">
      <div className="text-xs text-[#B0C4DE] uppercase tracking-wider mb-3">• onboarding</div>
      <h1 className="text-3xl font-medium tracking-tight">set up your workspace.</h1>
      <p className="text-sm text-white/55 mt-2 mb-8">
        Kuber tracks finances per business. tell us a bit about yours and we&apos;ll spin one up.
      </p>
      <CreateOrgForm />
    </div>
  )
}
