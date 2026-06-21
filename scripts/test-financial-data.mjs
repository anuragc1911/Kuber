#!/usr/bin/env node
/**
 * End-to-end test for the core financial data model.
 *
 *   node --env-file=.env.local scripts/test-financial-data.mjs
 *
 * Exercises:
 *   - default categories seeded on org creation
 *   - cross-org RLS isolation on transactions
 *   - dedupe_hash uniqueness blocks duplicates
 *   - viewer role cannot insert
 *   - get_org_summary respects membership
 *   - vendors / subscriptions / accounts / clients basic CRUD with RLS
 *
 * Cleans up users + orgs after running.
 */

import { createHash, randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const SECRET = process.env.SUPABASE_SECRET_KEY
if (!URL || !ANON || !SECRET) {
  console.error('missing env vars. run with: node --env-file=.env.local scripts/test-financial-data.mjs')
  process.exit(1)
}
const admin = createClient(URL, SECRET, { auth: { persistSession: false } })

let passed = 0,
  failed = 0
function check(label, ok, extra) {
  if (ok) {
    passed++
    console.log(`✓ ${label}`)
  } else {
    failed++
    console.log(`✗ ${label}`, extra ?? '')
  }
}

const dedupeHash = (date, amount, raw) =>
  createHash('sha256').update(`${date}|${amount}|${raw}`).digest('hex')

async function makeUser(email, password) {
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
  if (error) throw new Error(`createUser ${email}: ${error.message}`)
  return data.user
}
async function clientFor(email, password) {
  const c = createClient(URL, ANON, { auth: { persistSession: false } })
  const { error } = await c.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`signIn ${email}: ${error.message}`)
  return c
}

async function main() {
  const stamp = Date.now()
  const aEmail = `fin-a-${stamp}@kuber.test`
  const bEmail = `fin-b-${stamp}@kuber.test`
  const vEmail = `fin-v-${stamp}@kuber.test`
  const pwd = 'kuber-test-password-123'

  let userA, userB, userV
  let orgA, orgB
  try {
    userA = await makeUser(aEmail, pwd)
    userB = await makeUser(bEmail, pwd)
    userV = await makeUser(vEmail, pwd)

    const aClient = await clientFor(aEmail, pwd)
    const bClient = await clientFor(bEmail, pwd)
    const vClient = await clientFor(vEmail, pwd)

    // ─── Setup: A and B each create an org ───
    {
      const r = await aClient
        .rpc('create_org', { p_name: `OrgA-${stamp}`, p_industry: 'd2c', p_country: 'IN', p_currency: 'INR', p_fiscal_year_start_month: 4 })
        .single()
      orgA = r.data
      check('A creates orgA', !r.error && !!orgA?.id, r.error)
    }
    {
      const r = await bClient
        .rpc('create_org', { p_name: `OrgB-${stamp}`, p_industry: 'saas', p_country: 'US', p_currency: 'USD', p_fiscal_year_start_month: 1 })
        .single()
      orgB = r.data
      check('B creates orgB', !r.error && !!orgB?.id, r.error)
    }

    // ─── 1. default categories seeded ───
    {
      const { data: catsA } = await aClient.from('categories').select('*').eq('org_id', orgA.id)
      check('orgA has 13 default categories', (catsA ?? []).length === 13, catsA?.length)
      check(
        'all defaults are is_system=true',
        (catsA ?? []).every((c) => c.is_system === true),
      )
      check(
        'defaults include Software & SaaS',
        (catsA ?? []).some((c) => c.name === 'Software & SaaS' && c.type === 'expense'),
      )
      check(
        'defaults include Sales',
        (catsA ?? []).some((c) => c.name === 'Sales' && c.type === 'income'),
      )
    }

    // ─── 2. cross-org isolation: B cannot see orgA's categories ───
    {
      const { data } = await bClient.from('categories').select('*').eq('org_id', orgA.id)
      check('B cannot see orgA categories', (data ?? []).length === 0, data?.length)
    }

    // ─── 3. account creation + RLS on accounts ───
    let accountA
    {
      const r = await aClient
        .from('accounts')
        .insert({ org_id: orgA.id, name: 'HDFC Current', type: 'bank', currency: 'INR', opening_balance: 100000 })
        .select()
        .single()
      accountA = r.data
      check('A creates account in orgA', !r.error && !!accountA?.id, r.error)
    }
    {
      const r = await bClient
        .from('accounts')
        .insert({ org_id: orgA.id, name: 'evil', type: 'bank', currency: 'INR' })
      check('B cannot create account in orgA', !!r.error, r.error)
    }
    {
      const { data } = await bClient.from('accounts').select('*').eq('org_id', orgA.id)
      check('B cannot read orgA accounts', (data ?? []).length === 0, data?.length)
    }

    // ─── 4. vendor + transaction + dedupe ───
    let vendorA
    {
      const r = await aClient
        .from('vendors')
        .insert({ org_id: orgA.id, canonical_name: 'Amazon', aliases: ['AMZN MKTP', 'Amazon.in'], vendor_type: 'marketplace' })
        .select()
        .single()
      vendorA = r.data
      check('A creates vendor', !r.error && !!vendorA?.id, r.error)
    }
    {
      const r = await aClient.from('vendors').insert({ org_id: orgA.id, canonical_name: 'Amazon' })
      check('vendor canonical_name unique per org', !!r.error, r.error)
    }
    // Use today's date so it lands inside get_org_summary's "this month" window.
    let txDate = new Date().toISOString().slice(0, 10),
      txAmount = -1234.56,
      txRaw = 'AMAZON.IN PURCHASE 9999'
    let txHash = dedupeHash(txDate, txAmount, txRaw)
    {
      const r = await aClient
        .from('transactions')
        .insert({
          org_id: orgA.id,
          account_id: accountA.id,
          date: txDate,
          amount: txAmount,
          currency: 'INR',
          raw_description: txRaw,
          vendor_id: vendorA.id,
          source: 'csv_upload',
          dedupe_hash: txHash,
        })
        .select()
        .single()
      check('A inserts transaction', !r.error && !!r.data?.id, r.error)
    }
    {
      const r = await aClient.from('transactions').insert({
        org_id: orgA.id,
        account_id: accountA.id,
        date: txDate,
        amount: txAmount,
        currency: 'INR',
        raw_description: txRaw,
        source: 'csv_upload',
        dedupe_hash: txHash,
      })
      check('duplicate dedupe_hash blocked', !!r.error, r.error)
    }
    {
      const { data } = await bClient.from('transactions').select('*').eq('org_id', orgA.id)
      check('B cannot read orgA transactions', (data ?? []).length === 0, data?.length)
    }

    // ─── 5. viewer role cannot insert ───
    {
      const add = await aClient
        .from('memberships')
        .insert({ user_id: userV.id, org_id: orgA.id, role: 'viewer' })
      check('A adds V as viewer', !add.error, add.error)
    }
    {
      const r = await vClient
        .from('transactions')
        .insert({
          org_id: orgA.id,
          account_id: accountA.id,
          date: '2026-04-16',
          amount: -100,
          currency: 'INR',
          raw_description: 'sneak',
          source: 'manual',
          dedupe_hash: dedupeHash('2026-04-16', -100, 'sneak'),
        })
      check('viewer cannot insert transaction', !!r.error, r.error)
    }
    {
      const { data } = await vClient.from('transactions').select('*').eq('org_id', orgA.id)
      check('viewer can SELECT transactions', (data ?? []).length === 1, data?.length)
    }
    {
      const r = await vClient.from('accounts').delete().eq('id', accountA.id)
      check('viewer cannot delete account', (r.count ?? 0) === 0, r.error ?? r.count)
    }

    // ─── 6. clients + subscriptions ───
    {
      const r = await aClient
        .from('clients')
        .insert({ org_id: orgA.id, name: 'Acme Co', email: 'ap@acme.test' })
        .select()
        .single()
      check('A creates client', !r.error && !!r.data?.id, r.error)
    }
    {
      const r = await aClient
        .from('subscriptions')
        .insert({
          org_id: orgA.id,
          vendor_id: vendorA.id,
          amount: 999,
          currency: 'INR',
          frequency: 'monthly',
          first_charged_at: '2026-01-01',
        })
        .select()
        .single()
      check('A creates subscription', !r.error && !!r.data?.id, r.error)
    }
    {
      const r = await aClient.from('subscriptions').insert({
        org_id: orgA.id,
        vendor_id: vendorA.id,
        amount: 999,
        currency: 'INR',
        frequency: 'monthly',
      })
      check('duplicate subscription (org/vendor/amount/frequency) blocked', !!r.error, r.error)
    }

    // ─── 7. get_org_summary ───
    {
      const r = await aClient.rpc('get_org_summary', { p_org_id: orgA.id })
      const ok =
        !r.error &&
        r.data?.account_count >= 1 &&
        r.data?.transaction_count >= 1 &&
        Number(r.data?.total_outflow_this_month) > 0
      check('A get_org_summary returns counts + totals', ok, r.data ?? r.error)
    }
    {
      const r = await bClient.rpc('get_org_summary', { p_org_id: orgA.id })
      // Should return zeros for non-member, no error
      const isolated =
        !r.error &&
        Number(r.data?.transaction_count) === 0 &&
        Number(r.data?.account_count) === 0
      check('B get_org_summary on orgA returns zeros (no leak)', isolated, r.data ?? r.error)
    }
  } finally {
    console.log('→ cleaning up')
    if (orgA) await admin.from('orgs').delete().eq('id', orgA.id).then(() => {}, () => {})
    if (orgB) await admin.from('orgs').delete().eq('id', orgB.id).then(() => {}, () => {})
    if (userA) await admin.auth.admin.deleteUser(userA.id).catch(() => {})
    if (userB) await admin.auth.admin.deleteUser(userB.id).catch(() => {})
    if (userV) await admin.auth.admin.deleteUser(userV.id).catch(() => {})
  }

  console.log(`\n${passed} passed · ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('fatal:', err)
  process.exit(1)
})
