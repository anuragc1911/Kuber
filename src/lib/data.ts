// seeded D2C sample data — "Aroma Co.", a small candle/skincare brand on shopify+razorpay
// numbers in INR. dates ISO. 90 days back from today.

export type Sku = {
  id: string
  name: string
  unitPrice: number
  unitCogs: number
  category: string
}

export type Order = {
  id: string
  date: string
  skuId: string
  qty: number
  revenue: number
  refunded: boolean
  channel: 'shopify' | 'amazon' | 'flipkart'
  customerId: string
  isNewCustomer: boolean
}

export type Expense = {
  id: string
  date: string
  category: 'ads' | 'shipping' | 'payroll' | 'rent' | 'saas' | 'inventory' | 'gst' | 'misc'
  vendor: string
  amount: number
}

export type CashEvent = {
  date: string
  delta: number // positive = inflow, negative = outflow
  label: string
}

export const skus: Sku[] = [
  { id: 'SKU-01', name: 'Sandalwood Candle 200g', unitPrice: 899, unitCogs: 310, category: 'candles' },
  { id: 'SKU-02', name: 'Vetiver Room Spray 100ml', unitPrice: 649, unitCogs: 195, category: 'fragrance' },
  { id: 'SKU-03', name: 'Saffron Body Oil 100ml', unitPrice: 1299, unitCogs: 880, category: 'skincare' },
  { id: 'SKU-04', name: 'Rose Soy Candle 150g', unitPrice: 749, unitCogs: 240, category: 'candles' },
  { id: 'SKU-05', name: 'Neem Face Wash 120ml', unitPrice: 449, unitCogs: 130, category: 'skincare' },
  { id: 'SKU-06', name: 'Festive Gift Box', unitPrice: 2499, unitCogs: 920, category: 'bundles' },
]

const TODAY = new Date('2026-05-04')
const DAY_MS = 86_400_000

function daysAgo(n: number) {
  return new Date(TODAY.getTime() - n * DAY_MS).toISOString().slice(0, 10)
}

// deterministic pseudo-random
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function buildOrders(): Order[] {
  const r = rng(42)
  const orders: Order[] = []
  let oid = 1000
  let cid = 5000
  for (let d = 89; d >= 0; d--) {
    const date = daysAgo(d)
    // ~12-30 orders/day, ramping in last 30 days (post a small ads push)
    const ramp = d < 30 ? 1.35 : 1
    const baseCount = Math.floor((12 + r() * 18) * ramp)
    for (let i = 0; i < baseCount; i++) {
      const sku = skus[Math.floor(r() * skus.length)]
      const qty = r() < 0.15 ? 2 : 1
      // SKU-03 has elevated returns
      const refunded = sku.id === 'SKU-03' ? r() < 0.18 : r() < 0.04
      const channel = r() < 0.78 ? 'shopify' : r() < 0.55 ? 'amazon' : 'flipkart'
      const isNewCustomer = r() < 0.62
      orders.push({
        id: `ORD-${oid++}`,
        date,
        skuId: sku.id,
        qty,
        revenue: sku.unitPrice * qty,
        refunded,
        channel,
        customerId: isNewCustomer ? `CUST-${cid++}` : `CUST-${5000 + Math.floor(r() * (cid - 5000 + 1))}`,
        isNewCustomer,
      })
    }
  }
  return orders
}

function buildExpenses(): Expense[] {
  const r = rng(7)
  const out: Expense[] = []
  let eid = 1
  for (let d = 89; d >= 0; d--) {
    const date = daysAgo(d)
    // daily ads — ramped in last 30
    const adsBase = d < 30 ? 5400 : 3200
    out.push({ id: `EXP-${eid++}`, date, category: 'ads', vendor: 'Meta Ads', amount: Math.round(adsBase * (0.85 + r() * 0.3)) })
    out.push({ id: `EXP-${eid++}`, date, category: 'ads', vendor: 'Google Ads', amount: Math.round(adsBase * 0.6 * (0.85 + r() * 0.3)) })
    out.push({ id: `EXP-${eid++}`, date, category: 'shipping', vendor: 'Shiprocket', amount: Math.round(2200 + r() * 1800) })
  }
  // monthly chunks
  for (const d of [88, 58, 28]) {
    out.push({ id: `EXP-${eid++}`, date: daysAgo(d), category: 'payroll', vendor: 'Payroll', amount: 480_000 })
    out.push({ id: `EXP-${eid++}`, date: daysAgo(d), category: 'rent', vendor: 'Office Rent', amount: 65_000 })
    out.push({ id: `EXP-${eid++}`, date: daysAgo(d - 1), category: 'saas', vendor: 'Shopify+Klaviyo+misc', amount: 28_400 })
  }
  // inventory restocks (quarterly-ish)
  for (const d of [80, 22]) {
    out.push({ id: `EXP-${eid++}`, date: daysAgo(d), category: 'inventory', vendor: 'Vendor — fragrance oils', amount: 280_000 })
  }
  // GST quarterly (last quarter filed, this quarter pending)
  out.push({ id: `EXP-${eid++}`, date: daysAgo(75), category: 'gst', vendor: 'GST Q4', amount: 184_000 })
  return out
}

export const orders: Order[] = buildOrders()
export const expenses: Expense[] = buildExpenses()

export const bankBalanceToday = 24_50_000 // ₹24.5L across hdfc + icici
export const monthlyRecurringRevenueLastMonth = 0 // not a SaaS
export const founderName = 'Aanya'
export const businessName = 'Aroma Co.'
