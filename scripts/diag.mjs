import { createClient } from '@supabase/supabase-js'
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false }})

// Use the service role to query pg_policies via PostgREST… won't work directly.
// But we can query a known table to verify state.

// Check if create_org RPC works as service role
const r = await admin.rpc('create_org', { p_name: 'diag-' + Date.now(), p_industry: 'd2c', p_country: 'IN', p_currency: 'INR', p_fiscal_year_start_month: 4 })
console.log('create_org via service_role:', r.error ? r.error.message : 'ok ' + r.data?.id)

// List orgs
const { data } = await admin.from('orgs').select('id,name,created_by').order('created_at', { ascending: false }).limit(3)
console.log('orgs:', data)

// List memberships
const { data: m } = await admin.from('memberships').select('*')
console.log('memberships count:', m?.length, m)

// cleanup
await admin.from('orgs').delete().like('name', 'diag-%')
await admin.from('orgs').delete().like('name', 'TestOrg-%')
