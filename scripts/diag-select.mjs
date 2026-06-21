import { createClient } from '@supabase/supabase-js'
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const SECRET = process.env.SUPABASE_SECRET_KEY
const admin = createClient(URL, SECRET, { auth: { persistSession: false }})

const email = `sel-${Date.now()}@kuber.test`
const password = 'pwd-12345678'
const { data: u } = await admin.auth.admin.createUser({ email, password, email_confirm: true })

const c = createClient(URL, ANON, { auth: { persistSession: false }})
await c.auth.signInWithPassword({ email, password })

// Create org
const r = await c.rpc('create_org', { p_name: 'sel-' + Date.now(), p_industry: 'd2c', p_country: 'IN', p_currency: 'INR', p_fiscal_year_start_month: 4 }).single()
console.log('create_org:', r.error?.message ?? r.data?.id)

// Try SELECT memberships as the signed-in user
const sel1 = await c.from('memberships').select('*')
console.log('SELECT memberships (no filter):', sel1.error?.message ?? `${sel1.data?.length} rows`, sel1.data)

const sel2 = await c.from('memberships').select('role').eq('user_id', u.user.id).eq('org_id', r.data.id)
console.log('SELECT membership filtered:', sel2.error?.message ?? `${sel2.data?.length} rows`, sel2.data)

// Try INSERT another member as the owner
const { data: u2 } = await admin.auth.admin.createUser({ email: `sel2-${Date.now()}@kuber.test`, password, email_confirm: true })
const ins = await c.from('memberships').insert({ user_id: u2.user.id, org_id: r.data.id, role: 'accountant' })
console.log('INSERT another member:', ins.error?.message ?? 'ok')

// Cleanup
await admin.from('orgs').delete().eq('id', r.data.id)
await admin.auth.admin.deleteUser(u.user.id)
await admin.auth.admin.deleteUser(u2.user.id)
