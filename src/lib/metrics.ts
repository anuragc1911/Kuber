import { orders, expenses, skus, bankBalanceToday, type Order, type Expense } from './data'

export function inr(n: number) {
  if (Math.abs(n) >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`
  if (Math.abs(n) >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)} L`
  if (Math.abs(n) >= 1_000) return `₹${(n / 1_000).toFixed(1)}k`
  return `₹${Math.round(n)}`
}

const skuById = Object.fromEntries(skus.map((s) => [s.id, s]))

function within(daysBack: number, iso: string) {
  const ms = new Date('2026-05-04').getTime() - new Date(iso).getTime()
  return ms <= daysBack * 86_400_000 && ms >= 0
}

export function revenueLast(days: number) {
  return orders
    .filter((o) => within(days, o.date) && !o.refunded)
    .reduce((s, o) => s + o.revenue, 0)
}

export function refundsLast(days: number) {
  return orders
    .filter((o) => within(days, o.date) && o.refunded)
    .reduce((s, o) => s + o.revenue, 0)
}

export function expensesLast(days: number, cat?: Expense['category']) {
  return expenses
    .filter((e) => within(days, e.date) && (!cat || e.category === cat))
    .reduce((s, e) => s + e.amount, 0)
}

export function cogsLast(days: number) {
  return orders
    .filter((o) => within(days, o.date) && !o.refunded)
    .reduce((s, o) => s + skuById[o.skuId].unitCogs * o.qty, 0)
}

export function grossMarginLast(days: number) {
  const rev = revenueLast(days)
  if (rev === 0) return 0
  return (rev - cogsLast(days)) / rev
}

export function netBurnLast30() {
  // cash basis: total expenses (incl. inventory restocks) minus revenue.
  // we do not also add cogs — inventory line already captures cash out for goods.
  const rev = revenueLast(30)
  const exp = expensesLast(30)
  return exp - rev // positive = burning
}

export function runwayMonths() {
  const burn = netBurnLast30()
  if (burn <= 0) return Infinity
  return bankBalanceToday / burn
}

export function dailyCashSeries(days = 60) {
  const series: { date: string; balance: number; inflow: number; outflow: number }[] = []
  // walk forward from days ago → today, end at bankBalanceToday
  const byDate: Record<string, { in: number; out: number }> = {}
  for (const o of orders) {
    if (!within(days + 1, o.date) || o.refunded) continue
    byDate[o.date] ??= { in: 0, out: 0 }
    byDate[o.date].in += o.revenue
  }
  for (const e of expenses) {
    if (!within(days + 1, e.date)) continue
    byDate[e.date] ??= { in: 0, out: 0 }
    byDate[e.date].out += e.amount
  }
  // build daily totals walking backwards from today
  const dates: string[] = []
  for (let d = days; d >= 0; d--) {
    const iso = new Date(Date.parse('2026-05-04') - d * 86_400_000).toISOString().slice(0, 10)
    dates.push(iso)
  }
  // back-derive starting balance so we end at bankBalanceToday
  let cum = 0
  for (const d of dates) cum += (byDate[d]?.in || 0) - (byDate[d]?.out || 0)
  let bal = bankBalanceToday - cum
  for (const d of dates) {
    bal += (byDate[d]?.in || 0) - (byDate[d]?.out || 0)
    series.push({ date: d, balance: bal, inflow: byDate[d]?.in || 0, outflow: byDate[d]?.out || 0 })
  }
  return series
}

export function skuProfitability() {
  type Agg = { revenue: number; refunds: number; cogs: number; units: number; orderCount: number }
  const agg: Record<string, Agg> = {}
  for (const o of orders) {
    if (!within(30, o.date)) continue
    agg[o.skuId] ??= { revenue: 0, refunds: 0, cogs: 0, units: 0, orderCount: 0 }
    agg[o.skuId].orderCount += 1
    if (o.refunded) {
      agg[o.skuId].refunds += o.revenue
    } else {
      agg[o.skuId].revenue += o.revenue
      agg[o.skuId].cogs += skuById[o.skuId].unitCogs * o.qty
      agg[o.skuId].units += o.qty
    }
  }
  const totalOrders30 = orders.filter((o) => within(30, o.date)).length || 1
  const adsPerOrder = expensesLast(30, 'ads') / totalOrders30
  const shipPerOrder = expensesLast(30, 'shipping') / totalOrders30
  return skus
    .map((s) => {
      const a = agg[s.id] || { revenue: 0, refunds: 0, cogs: 0, units: 0, orderCount: 0 }
      const allocAds = adsPerOrder * a.orderCount
      const allocShipping = shipPerOrder * a.orderCount
      const contribution = a.revenue - a.cogs - a.refunds - allocAds - allocShipping
      const margin = a.revenue ? contribution / a.revenue : 0
      return { ...s, ...a, allocAds, allocShipping, contribution, margin }
    })
    .sort((a, b) => a.margin - b.margin)
}

export function customerCohorts() {
  // group customers by their first order month
  const firstOrder: Record<string, string> = {}
  for (const o of [...orders].sort((a, b) => a.date.localeCompare(b.date))) {
    if (!firstOrder[o.customerId]) firstOrder[o.customerId] = o.date
  }
  const cohorts: Record<string, { customers: Set<string>; revenue: number; orders: number }> = {}
  for (const o of orders) {
    if (o.refunded) continue
    const month = firstOrder[o.customerId].slice(0, 7)
    cohorts[month] ??= { customers: new Set(), revenue: 0, orders: 0 }
    cohorts[month].customers.add(o.customerId)
    cohorts[month].revenue += o.revenue
    cohorts[month].orders += 1
  }
  return Object.entries(cohorts)
    .map(([month, c]) => ({
      month,
      customers: c.customers.size,
      revenue: c.revenue,
      orders: c.orders,
      ltv: c.revenue / Math.max(1, c.customers.size),
      ordersPerCustomer: c.orders / Math.max(1, c.customers.size),
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

export function moneyLeaks() {
  const leaks: { title: string; impact: number; detail: string }[] = []
  // SKU with negative or low contribution
  for (const s of skuProfitability()) {
    if (s.units > 0 && s.margin < -0.05) {
      leaks.push({
        title: `${s.id} (${s.name}) is losing money`,
        impact: -s.contribution,
        detail: `${(s.margin * 100).toFixed(0)}% contribution after returns, ads, shipping over 30d.`,
      })
    }
  }
  // refund spike
  const refundRate = refundsLast(30) / Math.max(1, revenueLast(30) + refundsLast(30))
  if (refundRate > 0.05) {
    leaks.push({
      title: 'elevated refund rate',
      impact: refundsLast(30),
      detail: `${(refundRate * 100).toFixed(1)}% of gross sales refunded over the last 30 days.`,
    })
  }
  // ads efficiency
  const ads = expensesLast(30, 'ads')
  const newCustomers = new Set(orders.filter((o) => within(30, o.date) && o.isNewCustomer && !o.refunded).map((o) => o.customerId)).size
  const cac = newCustomers ? ads / newCustomers : 0
  if (cac > 600) {
    leaks.push({
      title: `CAC drift — ₹${Math.round(cac)} per new customer`,
      impact: ads * 0.2,
      detail: `up vs benchmark. paid spend ${inr(ads)} / ${newCustomers} new customers.`,
    })
  }
  return leaks.sort((a, b) => b.impact - a.impact)
}

export function gstStatus() {
  // Q1 2026 (Jan-Mar): take a notional 18% on revenue then subtract paid
  const q1Revenue = orders
    .filter((o) => !o.refunded && o.date >= '2026-01-01' && o.date <= '2026-03-31')
    .reduce((s, o) => s + o.revenue, 0)
  const liability = Math.round(q1Revenue * 0.18)
  const paid = expenses.filter((e) => e.category === 'gst').reduce((s, e) => s + e.amount, 0)
  return {
    quarter: 'Q1 FY26 (Jan-Mar)',
    estimatedLiability: liability,
    paid,
    outstanding: Math.max(0, liability - paid),
    dueDate: '2026-05-20',
  }
}

export function customerStats(days = 30) {
  const f = orders.filter((o) => within(days, o.date) && !o.refunded)
  const newCust = new Set(f.filter((o) => o.isNewCustomer).map((o) => o.customerId))
  const allCust = new Set(f.map((o) => o.customerId))
  const ads = expensesLast(days, 'ads')
  return {
    newCustomers: newCust.size,
    totalCustomers: allCust.size,
    cac: newCust.size ? ads / newCust.size : 0,
    avgOrderValue: f.length ? f.reduce((s, o) => s + o.revenue, 0) / f.length : 0,
  }
}

export function summary() {
  return {
    bankBalance: bankBalanceToday,
    revenue30d: revenueLast(30),
    revenuePrev30d: revenueLast(60) - revenueLast(30),
    grossMargin30d: grossMarginLast(30),
    netBurn30d: netBurnLast30(),
    runwayMonths: runwayMonths(),
    refunds30d: refundsLast(30),
    customers: customerStats(30),
    leaks: moneyLeaks(),
    gst: gstStatus(),
  }
}
