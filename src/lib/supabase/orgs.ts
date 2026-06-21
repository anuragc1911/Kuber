import { createClient } from '@/lib/supabase/server'

export type Industry = 'agency' | 'd2c' | 'saas' | 'services' | 'other'
export type Role = 'owner' | 'admin' | 'accountant' | 'viewer'

export type Org = {
  id: string
  name: string
  industry: Industry
  country: string
  currency: string
  fiscal_year_start_month: number
  created_at: string
}

export type OrgWithRole = Org & { role: Role }

export type CreateOrgInput = {
  name: string
  industry: Industry
  country: string
  currency: string
  fiscalYearStartMonth?: number
}

/** RPC: create org + owner membership in one transaction. */
export async function createOrg(input: CreateOrgInput) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .rpc('create_org', {
      p_name: input.name,
      p_industry: input.industry,
      p_country: input.country,
      p_currency: input.currency,
      p_fiscal_year_start_month: input.fiscalYearStartMonth ?? 4,
    })
    .single<Org>()
  if (error) throw error
  return data
}

/** RPC: every org the current user belongs to, with their role. */
export async function getUserOrgs(): Promise<OrgWithRole[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_user_orgs')
  if (error) throw error
  return (data as OrgWithRole[] | null) ?? []
}
