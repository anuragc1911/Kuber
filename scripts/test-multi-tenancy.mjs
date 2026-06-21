#!/usr/bin/env node
/**
 * End-to-end test for orgs + memberships RLS.
 *
 *   node --env-file=.env.local scripts/test-multi-tenancy.mjs
 *
 * Creates two ephemeral users, exercises every scenario, cleans up.
 * Exits non-zero on any failed assertion.
 */

import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const SECRET = process.env.SUPABASE_SECRET_KEY

if (!URL || !ANON || !SECRET) {
  console.error('missing env vars. run with: node --env-file=.env.local scripts/test-multi-tenancy.mjs')
  process.exit(1)
}

const admin = createClient(URL, SECRET, {
  auth: { autoRefreshToken: false, persistSession: false },
})

let passed = 0
let failed = 0
function check(label, ok, extra) {
  if (ok) {
    passed++
    console.log(`✓ ${label}`)
  } else {
    failed++
    console.log(`✗ ${label}`, extra ?? '')
  }
}

async function makeUser(email, password) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) throw new Error(`createUser ${email}: ${error.message}`)
  return data.user
}

async function clientFor(email, password) {
  const c = createClient(URL, ANON, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { error } = await c.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`signIn ${email}: ${error.message}`)
  return c
}

async function main() {
  const stamp = Date.now()
  const aEmail = `kuber-test-a-${stamp}@example.com`
  const bEmail = `kuber-test-b-${stamp}@example.com`
  const pwd = 'kuber-test-password-123'

  let userA, userB
  try {
    console.log('→ creating test users')
    userA = await makeUser(aEmail, pwd)
    userB = await makeUser(bEmail, pwd)

    const aClient = await clientFor(aEmail, pwd)
    const bClient = await clientFor(bEmail, pwd)

    // 1. A creates org
    const { data: orgA, error: createErr } = await aClient
      .rpc('create_org', {
        p_name: `TestOrg-${stamp}`,
        p_industry: 'd2c',
        p_country: 'IN',
        p_currency: 'INR',
        p_fiscal_year_start_month: 4,
      })
      .single()
    check('A can create an org via RPC', !createErr && !!orgA?.id, createErr)
    if (createErr || !orgA?.id) {
      console.log('\nAborting — apply the migration first.')
      console.log('  → supabase/migrations/0001_orgs_memberships.sql\n')
      return
    }

    // 2. A is owner
    const { data: aMembership } = await aClient
      .from('memberships')
      .select('role')
      .eq('org_id', orgA.id)
      .eq('user_id', userA.id)
      .single()
    check("A's membership is 'owner'", aMembership?.role === 'owner', aMembership)

    // 3. B cannot see A's org
    const { data: bView1 } = await bClient.from('orgs').select('*').eq('id', orgA.id)
    check('B cannot see A1 before being added', (bView1 ?? []).length === 0, bView1)

    // 4. B cannot insert themselves into A's org
    const { error: selfAddErr } = await bClient
      .from('memberships')
      .insert({ user_id: userB.id, org_id: orgA.id, role: 'viewer' })
    check('B cannot self-add to A1', !!selfAddErr, selfAddErr)

    // 5. A adds B as accountant
    const { error: addErr } = await aClient
      .from('memberships')
      .insert({ user_id: userB.id, org_id: orgA.id, role: 'accountant' })
    check('A (owner) can add B as accountant', !addErr, addErr)

    // 6. B can now see A1
    const { data: bView2 } = await bClient.from('orgs').select('*').eq('id', orgA.id)
    check('B can see A1 after being added', (bView2 ?? []).length === 1, bView2)

    // 7. B (accountant) cannot delete A1
    const { error: bDelErr, count: bDelCount } = await bClient
      .from('orgs')
      .delete({ count: 'exact' })
      .eq('id', orgA.id)
    check(
      'B (accountant) cannot delete A1',
      (bDelCount ?? 0) === 0 && !bDelErr,
      { count: bDelCount, error: bDelErr },
    )

    // 8. B (accountant) cannot promote themselves
    const { error: promoteErr, count: promoteCount } = await bClient
      .from('memberships')
      .update({ role: 'owner' }, { count: 'exact' })
      .eq('user_id', userB.id)
      .eq('org_id', orgA.id)
    check(
      'B cannot promote themselves to owner',
      (promoteCount ?? 0) === 0 && !promoteErr,
      { count: promoteCount, error: promoteErr },
    )

    // 9. get_user_orgs returns A's org for both users now
    const { data: aOrgs } = await aClient.rpc('get_user_orgs')
    const { data: bOrgs } = await bClient.rpc('get_user_orgs')
    check('get_user_orgs() returns A1 for A', (aOrgs ?? []).some((o) => o.id === orgA.id))
    check('get_user_orgs() returns A1 for B', (bOrgs ?? []).some((o) => o.id === orgA.id))

    // 10. A deletes A1 → membership cascades
    const { error: aDelErr, count: aDelCount } = await aClient
      .from('orgs')
      .delete({ count: 'exact' })
      .eq('id', orgA.id)
    check('A (owner) can delete A1', (aDelCount ?? 0) === 1 && !aDelErr, {
      count: aDelCount,
      error: aDelErr,
    })
  } finally {
    console.log('→ cleaning up users')
    if (userA) await admin.auth.admin.deleteUser(userA.id).catch(() => {})
    if (userB) await admin.auth.admin.deleteUser(userB.id).catch(() => {})
  }

  console.log(`\n${passed} passed · ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('fatal:', err)
  process.exit(1)
})
