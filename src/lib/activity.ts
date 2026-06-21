// alerts, reminders, calendar events, kpis — derived from data + metrics

import { expenses, orders, skus } from './data'
import {
  customerStats,
  expensesLast,
  grossMarginLast,
  gstStatus,
  inr,
  moneyLeaks,
  refundsLast,
  revenueLast,
  runwayMonths,
  skuProfitability,
} from './metrics'

export type Severity = 'critical' | 'warn' | 'info'

export type Alert = {
  id: string
  severity: Severity
  title: string
  detail: string
  metric: string
  ts: string // ISO date
  source: string // which check raised it
  suggestion?: string
}

export type Reminder = {
  id: string
  dueDate: string
  title: string
  detail: string
  category: 'tax' | 'payroll' | 'inventory' | 'reporting' | 'vendor' | 'review'
  status: 'pending' | 'done'
}

export type CalendarEvent = {
  date: string
  type: 'reminder' | 'spike' | 'expense' | 'milestone'
  label: string
  amount?: number
  severity?: Severity
}

const TODAY = '2026-05-04'

export function alerts(): Alert[] {
  const out: Alert[] = []
  const r = runwayMonths()
  const s = customerStats(30)
  const refundRate = refundsLast(30) / Math.max(1, revenueLast(30) + refundsLast(30))
  const skuRows = skuProfitability()
  const gst = gstStatus()
  const burn30 = expensesLast(30) - revenueLast(30)

  if (Number.isFinite(r) && r < 6) {
    out.push({
      id: 'a-runway',
      severity: r < 3 ? 'critical' : 'warn',
      title: `runway down to ${r.toFixed(1)} months`,
      detail: `at current burn of ${inr(burn30)}/mo. raise, cut, or grow.`,
      metric: `${r.toFixed(1)} mo`,
      ts: TODAY,
      source: 'runway monitor',
      suggestion: 'pause meta ads on losing SKUs to extend runway by ~1.4 months.',
    })
  }
  if (refundRate > 0.04) {
    out.push({
      id: 'a-refunds',
      severity: refundRate > 0.07 ? 'critical' : 'warn',
      title: 'refund rate elevated',
      detail: `${(refundRate * 100).toFixed(1)}% of gross sales refunded over 30d. SKU-03 driving most of the spike.`,
      metric: `${(refundRate * 100).toFixed(1)}%`,
      ts: TODAY,
      source: 'refund monitor',
      suggestion: 'pull SKU-03 product page for QC review before next ad cycle.',
    })
  }
  for (const sku of skuRows) {
    if (sku.units > 0 && sku.margin < -0.05) {
      out.push({
        id: `a-sku-${sku.id}`,
        severity: sku.margin < -0.2 ? 'critical' : 'warn',
        title: `${sku.id} contribution turned negative`,
        detail: `${(sku.margin * 100).toFixed(0)}% after returns, ads, shipping over 30d. ${inr(-sku.contribution)} loss.`,
        metric: `${(sku.margin * 100).toFixed(0)}%`,
        ts: TODAY,
        source: 'sku profitability',
        suggestion: `pause paid acquisition on ${sku.id} for 7 days; reroute to top performer.`,
      })
    }
  }
  if (gst.outstanding > 0) {
    const days = Math.ceil((Date.parse(gst.dueDate) - Date.parse(TODAY)) / 86_400_000)
    out.push({
      id: 'a-gst',
      severity: days <= 7 ? 'warn' : 'info',
      title: `GST short ${inr(gst.outstanding)} for ${gst.quarter}`,
      detail: `due ${gst.dueDate} · ${days} days from today.`,
      metric: inr(gst.outstanding),
      ts: TODAY,
      source: 'gst monitor',
      suggestion: 'transfer outstanding amount to GST account; Kuber will draft the return on the 15th.',
    })
  }
  if (s.cac > 600) {
    out.push({
      id: 'a-cac',
      severity: 'info',
      title: 'CAC drift over benchmark',
      detail: `₹${Math.round(s.cac)} per new customer over 30d. category benchmark ~₹450.`,
      metric: `₹${Math.round(s.cac)}`,
      ts: TODAY,
      source: 'cac monitor',
    })
  }
  return out.sort((a, b) => sevWeight(a.severity) - sevWeight(b.severity))
}

function sevWeight(s: Severity) {
  return s === 'critical' ? 0 : s === 'warn' ? 1 : 2
}

export function reminders(): Reminder[] {
  return [
    {
      id: 'r-gst',
      dueDate: '2026-05-20',
      title: 'file GST Q1 FY26',
      detail: '₹64.3k outstanding. Kuber will draft on 2026-05-15.',
      category: 'tax',
      status: 'pending',
    },
    {
      id: 'r-payroll',
      dueDate: '2026-05-07',
      title: 'monthly payroll · ₹4.80 L',
      detail: 'auto-debit on the 7th. confirm bank balance covers payout.',
      category: 'payroll',
      status: 'pending',
    },
    {
      id: 'r-tds',
      dueDate: '2026-05-07',
      title: 'TDS deposit · April',
      detail: 'deposit by 7th to avoid 1.5% interest.',
      category: 'tax',
      status: 'pending',
    },
    {
      id: 'r-inventory',
      dueDate: '2026-05-12',
      title: 'restock fragrance oils',
      detail: 'projected stockout on SKU-02, SKU-04 by 2026-05-18 at current run-rate.',
      category: 'inventory',
      status: 'pending',
    },
    {
      id: 'r-vendor',
      dueDate: '2026-05-15',
      title: 'shiprocket invoice · ₹47k',
      detail: 'NET-15 terms. settle to keep COD discount.',
      category: 'vendor',
      status: 'pending',
    },
    {
      id: 'r-review',
      dueDate: '2026-05-30',
      title: 'monthly close + investor update',
      detail: 'Kuber will assemble the May P&L and runway update for review.',
      category: 'reporting',
      status: 'pending',
    },
    {
      id: 'r-pf',
      dueDate: '2026-05-15',
      title: 'PF/ESI filing · April',
      detail: 'EPFO portal · returns + challan.',
      category: 'tax',
      status: 'done',
    },
  ].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

export function calendarEvents(year: number, month: number): CalendarEvent[] {
  // month is 0-indexed (JS Date convention)
  const out: CalendarEvent[] = []

  // reminders that fall in this month
  for (const r of reminders()) {
    const d = new Date(r.dueDate)
    if (d.getFullYear() === year && d.getMonth() === month) {
      out.push({
        date: r.dueDate,
        type: 'reminder',
        label: r.title,
        severity: r.status === 'done' ? 'info' : 'warn',
      })
    }
  }

  // revenue spike days (top 3 in this month)
  const monthOrders = orders.filter((o) => {
    const d = new Date(o.date)
    return d.getFullYear() === year && d.getMonth() === month && !o.refunded
  })
  const byDate: Record<string, number> = {}
  for (const o of monthOrders) byDate[o.date] = (byDate[o.date] || 0) + o.revenue
  const sorted = Object.entries(byDate).sort((a, b) => b[1] - a[1])
  for (const [date, amt] of sorted.slice(0, 3)) {
    out.push({ date, type: 'spike', label: 'top revenue day', amount: amt, severity: 'info' })
  }

  // big expense days
  const monthExp = expenses.filter((e) => {
    const d = new Date(e.date)
    return d.getFullYear() === year && d.getMonth() === month && e.amount >= 100_000
  })
  for (const e of monthExp) {
    out.push({
      date: e.date,
      type: 'expense',
      label: `${e.vendor} · ${e.category}`,
      amount: e.amount,
      severity: 'warn',
    })
  }

  return out.sort((a, b) => a.date.localeCompare(b.date))
}

// KPIs

export type Kpi = {
  id: string
  label: string
  value: string
  context: string
  trend: 'up' | 'down' | 'flat'
  trendPct?: number
  good: boolean // is the trend favorable?
  category: 'growth' | 'profitability' | 'efficiency' | 'cash'
}

export function kpis(): Kpi[] {
  const rev30 = revenueLast(30)
  const rev60 = revenueLast(60) - rev30 // prior 30
  const margin30 = grossMarginLast(30)
  const margin60 = grossMarginLast(60)
  const stats30 = customerStats(30)
  const ads30 = expensesLast(30, 'ads')
  const refundRate30 = refundsLast(30) / Math.max(1, rev30 + refundsLast(30))
  const allOrders30 = orders.filter((o) => Date.parse(o.date) >= Date.parse(TODAY) - 30 * 86_400_000)
  const repeatOrders = allOrders30.filter((o) => !o.isNewCustomer && !o.refunded).length
  const totalOrders = allOrders30.filter((o) => !o.refunded).length
  const repeatRate = totalOrders ? repeatOrders / totalOrders : 0

  // approximate LTV — avg revenue per customer (90d window)
  const customers = new Set(orders.filter((o) => !o.refunded).map((o) => o.customerId))
  const ltv = orders.filter((o) => !o.refunded).reduce((s, o) => s + o.revenue, 0) / Math.max(1, customers.size)

  const cacPayback = stats30.cac > 0 && margin30 > 0 ? stats30.cac / (stats30.avgOrderValue * margin30) : 0
  // ROAS = revenue from ads-attributable customers / ads spend. Approx: new-customer revenue / ads.
  const newCustRev = orders
    .filter((o) => Date.parse(o.date) >= Date.parse(TODAY) - 30 * 86_400_000 && o.isNewCustomer && !o.refunded)
    .reduce((s, o) => s + o.revenue, 0)
  const roas = ads30 ? newCustRev / ads30 : 0

  const revGrowthPct = rev60 ? ((rev30 - rev60) / rev60) * 100 : 0
  const marginDelta = (margin30 - margin60) * 100

  return [
    {
      id: 'rev30',
      label: 'revenue · 30d',
      value: inr(rev30),
      context: `${revGrowthPct >= 0 ? '+' : ''}${revGrowthPct.toFixed(0)}% vs prior 30d`,
      trend: revGrowthPct > 1 ? 'up' : revGrowthPct < -1 ? 'down' : 'flat',
      trendPct: revGrowthPct,
      good: revGrowthPct >= 0,
      category: 'growth',
    },
    {
      id: 'gross-margin',
      label: 'gross margin',
      value: `${(margin30 * 100).toFixed(0)}%`,
      context: `${marginDelta >= 0 ? '+' : ''}${marginDelta.toFixed(1)} pts vs 60d avg`,
      trend: marginDelta > 0.5 ? 'up' : marginDelta < -0.5 ? 'down' : 'flat',
      trendPct: marginDelta,
      good: marginDelta >= 0,
      category: 'profitability',
    },
    {
      id: 'aov',
      label: 'avg order value',
      value: inr(stats30.avgOrderValue),
      context: `across ${totalOrders} orders`,
      trend: 'flat',
      good: true,
      category: 'profitability',
    },
    {
      id: 'cac',
      label: 'CAC',
      value: `₹${Math.round(stats30.cac)}`,
      context: `${stats30.newCustomers} new customers · ${inr(ads30)} ad spend`,
      trend: stats30.cac > 600 ? 'up' : 'flat',
      good: stats30.cac <= 600,
      category: 'efficiency',
    },
    {
      id: 'ltv',
      label: 'LTV (90d)',
      value: inr(ltv),
      context: `across ${customers.size.toLocaleString('en-IN')} customers`,
      trend: 'flat',
      good: true,
      category: 'growth',
    },
    {
      id: 'ltv-cac',
      label: 'LTV : CAC',
      value: stats30.cac ? `${(ltv / stats30.cac).toFixed(1)}x` : '∞',
      context: '3.0x is healthy · 1.0x means breakeven',
      trend: ltv / stats30.cac >= 3 ? 'up' : 'down',
      good: ltv / stats30.cac >= 3,
      category: 'efficiency',
    },
    {
      id: 'cac-payback',
      label: 'CAC payback',
      value: cacPayback > 0 ? `${cacPayback.toFixed(1)} orders` : '—',
      context: 'orders to recover acquisition cost',
      trend: 'flat',
      good: cacPayback < 2,
      category: 'efficiency',
    },
    {
      id: 'roas',
      label: 'paid ROAS',
      value: `${roas.toFixed(1)}x`,
      context: 'new-customer revenue ÷ ad spend',
      trend: roas >= 2 ? 'up' : 'down',
      good: roas >= 2,
      category: 'efficiency',
    },
    {
      id: 'repeat-rate',
      label: 'repeat rate',
      value: `${(repeatRate * 100).toFixed(0)}%`,
      context: `${repeatOrders} of ${totalOrders} orders from returning customers`,
      trend: 'flat',
      good: repeatRate > 0.3,
      category: 'growth',
    },
    {
      id: 'refund-rate',
      label: 'refund rate',
      value: `${(refundRate30 * 100).toFixed(1)}%`,
      context: `${inr(refundsLast(30))} refunded / 30d`,
      trend: refundRate30 > 0.04 ? 'up' : 'flat',
      good: refundRate30 <= 0.04,
      category: 'profitability',
    },
    {
      id: 'burn',
      label: 'monthly burn',
      value: inr(Math.max(0, expensesLast(30) - rev30)),
      context: 'expenses minus revenue',
      trend: 'flat',
      good: expensesLast(30) - rev30 < 500_000,
      category: 'cash',
    },
    {
      id: 'runway',
      label: 'runway',
      value: Number.isFinite(runwayMonths()) ? `${runwayMonths().toFixed(1)} mo` : '∞',
      context: 'at current burn',
      trend: 'flat',
      good: runwayMonths() >= 6,
      category: 'cash',
    },
  ]
}

// reports

export type Report = {
  id: string
  title: string
  period: string
  generatedAt: string
  category: 'P&L' | 'tax' | 'investor' | 'sku' | 'cohort'
  size: string
  summary: string
}

export function reports(): Report[] {
  return [
    {
      id: 'rep-pl-april',
      title: 'profit & loss · april 2026',
      period: '2026-04-01 → 2026-04-30',
      generatedAt: '2026-05-01',
      category: 'P&L',
      size: '4 pages',
      summary: `revenue ${inr(revenueLast(34) - revenueLast(4))}, gross margin ~60%, net burn ~${inr(280_000)}.`,
    },
    {
      id: 'rep-gst-q1',
      title: 'GST Q1 FY26 working',
      period: '2026-01-01 → 2026-03-31',
      generatedAt: '2026-04-30',
      category: 'tax',
      size: '6 pages',
      summary: `output GST ₹2.48L, input credit ₹1.84L, net payable ₹64.3k. ready for filing.`,
    },
    {
      id: 'rep-investor-q1',
      title: 'Q1 FY26 investor update',
      period: '2026-01-01 → 2026-03-31',
      generatedAt: '2026-04-15',
      category: 'investor',
      size: '8 pages',
      summary: 'highlights, KPIs, runway scenarios. drafted by Kuber, reviewed by founder.',
    },
    {
      id: 'rep-sku-30d',
      title: 'SKU profitability · last 30 days',
      period: TODAY,
      generatedAt: TODAY,
      category: 'sku',
      size: '2 pages',
      summary: `3 SKUs negative contribution. SKU-05, SKU-03, SKU-02 leak ${inr(60_700)} combined.`,
    },
    {
      id: 'rep-cohort',
      title: 'cohort retention · march signups',
      period: '2026-03-01 → 2026-04-30',
      generatedAt: '2026-05-02',
      category: 'cohort',
      size: '3 pages',
      summary: 'march cohort delivers 40% higher LTV than feb. retention curve attached.',
    },
    {
      id: 'rep-pl-mar',
      title: 'profit & loss · march 2026',
      period: '2026-03-01 → 2026-03-31',
      generatedAt: '2026-04-02',
      category: 'P&L',
      size: '4 pages',
      summary: `revenue ${inr(revenueLast(60) - revenueLast(30))}, first profitable month since launch.`,
    },
  ]
}

export function alertsCount() {
  const a = alerts()
  return {
    total: a.length,
    critical: a.filter((x) => x.severity === 'critical').length,
    warn: a.filter((x) => x.severity === 'warn').length,
    info: a.filter((x) => x.severity === 'info').length,
  }
}

export function pendingRemindersCount() {
  return reminders().filter((r) => r.status === 'pending').length
}
