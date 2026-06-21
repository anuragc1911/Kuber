import { createClient } from '@supabase/supabase-js'
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false }})

// Cleanup all test orgs first
const { data: del1 } = await admin.from('orgs').delete().like('name', 'TestOrg-%').select()
console.log('cleaned', del1?.length ?? 0, 'old test orgs')

// Make a test user, sign in as them, call create_org, inspect what was created
const email = `state-${Date.now()}@kuber.test`
const password = 'pwd-12345678'
const { data: u } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
console.log('user:', u.user.id)

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const c = createClient(URL, ANON, { auth: { persistSession: false }})
await c.auth.signInWithPassword({ email, password })

const r = await c.rpc('create_org', { p_name: 'state-org-' + Date.now(), p_industry: 'd2c', p_country: 'IN', p_currency: 'INR', p_fiscal_year_start_month: 4 }).single()
console.log('create_org returned:', r.error?.message ?? r.data)

// Inspect via service role
const { data: orgs } = await admin.from('orgs').select('*').like('name', 'state-org-%')
console.log('orgs in DB:', orgs)
const { data: mems } = await admin.from('memberships').select('*').eq('user_id', u.user.id)
console.log('memberships for user:', mems)

await admin.auth.admin.deleteUser(u.user.id)
await admin.from('orgs').delete().like('name', 'state-org-%')
