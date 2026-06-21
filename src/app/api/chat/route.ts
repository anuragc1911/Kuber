import { convertToModelMessages, streamText, stepCountIs, tool, type UIMessage } from 'ai'
import { z } from 'zod'
import {
  customerCohorts,
  customerStats,
  dailyCashSeries,
  expensesLast,
  grossMarginLast,
  gstStatus,
  inr,
  moneyLeaks,
  revenueLast,
  runwayMonths,
  skuProfitability,
  summary,
} from '@/lib/metrics'
import { businessName, expenses, founderName, orders, skus } from '@/lib/data'
import { alerts, calendarEvents, kpis, reminders, reports } from '@/lib/activity'

export const maxDuration = 60

const SYSTEM = `You are Kuber, an AI CFO for ${businessName} (founder: ${founderName}).

Voice: founder-to-founder, all-lowercase, direct, never corporate. use em dashes for asides. no fluff. answer first, evidence second.

Format: 1-3 short paragraphs, OR a tight bulleted list when comparing items. Always cite numbers (₹ amounts, %, dates) — never vague claims. When you state a number, you must have called a tool to back it.

Currency: INR. Use ₹ symbol. abbreviate ₹1,00,000 as ₹1L and ₹1,00,00,000 as ₹1Cr.

Behavior: prefer calling tools to get real numbers from the user's data over guessing. if asked something outside the data (industry benchmarks, opinions on hiring), be honest — answer briefly and label as your judgment, not data.

Today's date: 2026-05-04.`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: 'anthropic/claude-opus-4-7',
    system: SYSTEM,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(8),
    tools: {
      get_summary: tool({
        description: 'Top-line snapshot: bank balance, revenue 30d, gross margin, runway, burn, leaks, GST status. Call this first for general questions.',
        inputSchema: z.object({}),
        execute: async () => summary(),
      }),
      get_revenue: tool({
        description: 'Revenue total for the last N days (excludes refunded orders).',
        inputSchema: z.object({ days: z.number().int().min(1).max(120) }),
        execute: async ({ days }) => ({ days, revenue: revenueLast(days), formatted: inr(revenueLast(days)) }),
      }),
      get_expenses: tool({
        description: 'Expense total for last N days, optionally filtered by category (ads, shipping, payroll, rent, saas, inventory, gst, misc).',
        inputSchema: z.object({
          days: z.number().int().min(1).max(120),
          category: z.enum(['ads', 'shipping', 'payroll', 'rent', 'saas', 'inventory', 'gst', 'misc']).optional(),
        }),
        execute: async ({ days, category }) => ({
          days,
          category: category || 'all',
          total: expensesLast(days, category),
          formatted: inr(expensesLast(days, category)),
        }),
      }),
      get_runway: tool({
        description: 'Months of runway at current burn, plus burn and balance.',
        inputSchema: z.object({}),
        execute: async () => {
          const r = runwayMonths()
          return {
            months: Number.isFinite(r) ? Number(r.toFixed(1)) : null,
            note: Number.isFinite(r) ? null : 'business is profitable — no burn',
            ...summary(),
          }
        },
      }),
      get_sku_profitability: tool({
        description: 'Per-SKU profitability over 30 days — revenue, refunds, COGS, allocated ads/shipping, contribution margin %.',
        inputSchema: z.object({}),
        execute: async () => skuProfitability(),
      }),
      get_money_leaks: tool({
        description: 'Detected money leaks: losing SKUs, refund spikes, CAC drift, with rupee impact.',
        inputSchema: z.object({}),
        execute: async () => moneyLeaks(),
      }),
      get_customer_metrics: tool({
        description: 'Customer counts, CAC, AOV for last N days plus cohort table by acquisition month.',
        inputSchema: z.object({ days: z.number().int().min(1).max(120).default(30) }),
        execute: async ({ days }) => ({ stats: customerStats(days), cohorts: customerCohorts() }),
      }),
      get_gross_margin: tool({
        description: 'Gross margin % (revenue minus COGS) over last N days.',
        inputSchema: z.object({ days: z.number().int().min(1).max(120) }),
        execute: async ({ days }) => ({ days, marginPct: Number((grossMarginLast(days) * 100).toFixed(2)) }),
      }),
      get_gst_status: tool({
        description: 'GST liability for the current quarter, paid amount, outstanding, due date.',
        inputSchema: z.object({}),
        execute: async () => gstStatus(),
      }),
      get_cash_series: tool({
        description: 'Daily cash balance, inflow, outflow for last N days.',
        inputSchema: z.object({ days: z.number().int().min(7).max(120).default(30) }),
        execute: async ({ days }) => dailyCashSeries(days),
      }),
      list_recent_orders: tool({
        description: 'Recent N orders (most recent first).',
        inputSchema: z.object({ limit: z.number().int().min(1).max(50).default(10) }),
        execute: async ({ limit }) => orders.slice(-limit).reverse(),
      }),
      list_recent_expenses: tool({
        description: 'Recent N expenses (most recent first), optionally filtered by category.',
        inputSchema: z.object({
          limit: z.number().int().min(1).max(50).default(10),
          category: z.enum(['ads', 'shipping', 'payroll', 'rent', 'saas', 'inventory', 'gst', 'misc']).optional(),
        }),
        execute: async ({ limit, category }) => {
          const f = category ? expenses.filter((e) => e.category === category) : expenses
          return f.slice(-limit).reverse()
        },
      }),
      list_skus: tool({
        description: 'All SKUs with prices and unit cost.',
        inputSchema: z.object({}),
        execute: async () => skus,
      }),
      get_alerts: tool({
        description: 'Active alerts the system has flagged: runway dips, refund spikes, SKU losses, GST due, CAC drift. Includes severity and Kuber suggestions.',
        inputSchema: z.object({}),
        execute: async () => alerts(),
      }),
      get_reminders: tool({
        description: 'Upcoming reminders with due dates: GST filing, payroll, TDS, inventory, vendor invoices.',
        inputSchema: z.object({}),
        execute: async () => reminders(),
      }),
      get_calendar: tool({
        description: 'Calendar events for a given month — reminders, revenue spikes, big expenses, milestones. month is 0-indexed (0=Jan).',
        inputSchema: z.object({
          year: z.number().int().min(2024).max(2030),
          month: z.number().int().min(0).max(11),
        }),
        execute: async ({ year, month }) => calendarEvents(year, month),
      }),
      get_kpis: tool({
        description: 'All 12 business KPIs across growth, profitability, efficiency, cash — with trends.',
        inputSchema: z.object({}),
        execute: async () => kpis(),
      }),
      get_reports: tool({
        description: 'List of generated reports (P&L, GST, investor update, SKU, cohort) with periods and summaries.',
        inputSchema: z.object({}),
        execute: async () => reports(),
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
