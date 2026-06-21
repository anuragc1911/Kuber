import { createClient } from '@supabase/supabase-js'
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false }})

// Service role bypasses RLS — let's see actual membership data
const m = await admin.from('memberships').select('*').limit(5)
console.log('memberships:', m.data?.length ?? 0, 'rows', m.error?.message ?? '')

const o = await admin.from('orgs').select('id, name, created_by').limit(5)
console.log('orgs:', o.data)

// Check if the leftover orgs from previous runs pollute things
const cleanup = await admin.from('orgs').delete().like('name', 'TestOrg-%').select()
console.log('cleaned up test orgs:', cleanup.data?.length ?? 0)
