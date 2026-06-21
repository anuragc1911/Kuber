import { createClient } from '@supabase/supabase-js'
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const SECRET = process.env.SUPABASE_SECRET_KEY

const admin = createClient(URL, SECRET, { auth: { persistSession: false }})

// Make a temp user
const email = `diag-${Date.now()}@kuber.test`
const password = 'diag-password-123'
const { data: created, error: cErr } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
if (cErr) { console.error('createUser:', cErr.message); process.exit(1) }
console.log('created user:', created.user.id)

// Sign in as that user via anon client
const c = createClient(URL, ANON, { auth: { persistSession: false }})
const { error: sErr } = await c.auth.signInWithPassword({ email, password })
if (sErr) { console.error('signIn:', sErr.message); process.exit(1) }

// Get session and check what JWT/access_token we have
const { data: sess } = await c.auth.getSession()
console.log('access_token present:', !!sess?.session?.access_token)
console.log('user from session:', sess?.session?.user?.id)

// Call whoami() RPC
const { data: who, error: whoErr } = await c.rpc('whoami')
console.log('whoami() returned:', who, 'error:', whoErr?.message)

// Cleanup
await admin.auth.admin.deleteUser(created.user.id)
