import { createClient } from '@supabase/supabase-js'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const secret = process.env.SUPABASE_SECRET_KEY
const admin = createClient(url, secret, { auth: { persistSession: false }})

// Try calling the helpers directly
const { data: f1, error: e1 } = await admin.rpc('is_org_member', { p_org_id: '00000000-0000-0000-0000-000000000000' })
console.log('is_org_member exists?', e1 ? `NO — ${e1.message}` : `YES (returned ${f1})`)

const { data: f2, error: e2 } = await admin.rpc('has_org_role', { p_org_id: '00000000-0000-0000-0000-000000000000', p_roles: ['owner'] })
console.log('has_org_role exists?', e2 ? `NO — ${e2.message}` : `YES (returned ${f2})`)
