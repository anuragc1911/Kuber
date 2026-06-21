'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createOrg, type Industry } from '@/lib/supabase/orgs'
import { isSupabaseConfigured } from '@/lib/supabase/server'

export type ActionResult = { ok: true } | { ok: false; error: string }

const INDUSTRIES: Industry[] = ['agency', 'd2c', 'saas', 'services', 'other']

export async function createOrgAction(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "supabase isn't connected yet." }
  }

  const name = String(formData.get('name') ?? '').trim()
  const industryRaw = String(formData.get('industry') ?? '').trim()
  const country = String(formData.get('country') ?? '').trim().toUpperCase()
  const currency = String(formData.get('currency') ?? '').trim().toUpperCase()
  const fyMonth = Number(formData.get('fiscalYearStartMonth') ?? 4)

  if (!name) return { ok: false, error: 'business name is required.' }
  if (!INDUSTRIES.includes(industryRaw as Industry)) {
    return { ok: false, error: 'pick one of the listed industries.' }
  }
  if (!country) return { ok: false, error: 'country is required.' }
  if (!currency) return { ok: false, error: 'currency is required.' }
  if (!Number.isInteger(fyMonth) || fyMonth < 1 || fyMonth > 12) {
    return { ok: false, error: 'fiscal year start must be a month 1–12.' }
  }

  try {
    await createOrg({
      name,
      industry: industryRaw as Industry,
      country,
      currency,
      fiscalYearStartMonth: fyMonth,
    })
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message.toLowerCase() : 'failed to create workspace.',
    }
  }

  revalidatePath('/', 'layout')
  redirect('/app')
}
