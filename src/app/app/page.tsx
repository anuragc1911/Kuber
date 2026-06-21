import { MetricCard } from '@/components/app/metric-card'
import { CashChart } from '@/components/app/cash-chart'
import { AskButton } from '@/components/app/ask-button'
import {
  summary,
  inr,
  dailyCashSeries,
  skuProfitability,
  customerCohorts,
} from '@/lib/metrics'
import { alerts } from '@/lib/activity'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const s = summary()
  const cash = dailyCashSeries(60)
  const skuRows = skuProfitability()
  const cohorts = customerCohorts().slice(-4)
  const allAlerts = alerts()
  const critical = allAlerts.filter((a) => a.severity === 'critical')
  const warn = allAlerts.filter((a) => a.severity === 'warn')

  const revGrowth = s.revenuePrev30d ? ((s.revenue30d - s.revenuePrev30d) / s.revenuePrev30d) * 100 : 0
  const leakImpact = s.leaks.reduce((n, l) => n + l.impact, 0)

  const status: 'critical' | 'attention' | 'healthy' =
    critical.length > 0 ? 'critical' : warn.length > 0 ? 'attention' : 'healthy'

  const statusMeta = {
    critical: { dot: 'bg-rose-400', label: `${critical.length} critical · needs you now`, accent: 'text-rose-300' },
    attention: { dot: 'bg-amber-300', label: `${warn.length} item${warn.length > 1 ? 's' : ''} need a look`, accent: 'text-amber-200' },
    healthy: { dot: 'bg-emerald-400', label: 'business is healthy', accent: 'text-emerald-300' },
  }[status]

  const headline =
    status === 'critical'
      ? `${critical.length} ${critical.length === 1 ? 'leak is' : 'leaks are'} costing you ${inr(leakImpact)} a month.`
      : status === 'attention'
        ? warn[0].title.toLowerCase() + '.'
        : `you're up ${revGrowth.toFixed(0)}% this month. runway is healthy.`

  const sub =
    status === 'critical'
      ? `the upside — revenue is up ${revGrowth.toFixed(0)}% vs last month and you have ${s.runwayMonths.toFixed(1)} months of runway. fix the leak and you compound.`
      : status === 'attention'
        ? `${s.runwayMonths.toFixed(1)} months runway, ${(s.grossMargin30d * 100).toFixed(0)}% margin. otherwise you're in good shape.`
        : `revenue ${inr(s.revenue30d)} this month, ${(s.grossMargin30d * 100).toFixed(0)}% margin. keep going — last month's ad shift is paying off.`

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
          <span className={cn('size-1.5 rounded-full', statusMeta.dot)} />
          <span className={cn('text-[11px] uppercase tracking-wider', statusMeta.accent)}>
            {statusMeta.label}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-medium text-white tracking-tight max-w-3xl">
          {headline}
        </h1>
        <p className="text-sm text-white/55 mt-3 max-w-2xl leading-relaxed">{sub}</p>
        <p className="text-[11px] text-white/30 mt-4 font-mono">
          last refresh just now · 4 sources connected · 1,847 transactions analyzed
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="bank balance" value={inr(s.bankBalance)} sub="across 2 accounts" />
        <MetricCard
          label="runway"
          value={Number.isFinite(s.runwayMonths) ? `${s.runwayMonths.toFixed(1)} mo` : '∞'}
          sub={`at current burn of ${inr(s.netBurn30d)}/mo`}
          tone={s.runwayMonths < 6 ? 'bad' : s.runwayMonths < 12 ? 'warn' : 'good'}
        />
        <MetricCard
          label="revenue · 30d"
          value={inr(s.revenue30d)}
          sub={`${revGrowth >= 0 ? '↑' : '↓'} ${Math.abs(revGrowth).toFixed(0)}% vs prior 30d`}
          tone={revGrowth >= 0 ? 'good' : 'warn'}
        />
        <MetricCard
          label="gross margin · 30d"
          value={`${(s.grossMargin30d * 100).toFixed(0)}%`}
          sub={`after COGS · ${inr(s.refunds30d)} refunded`}
        />
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/40">cash position · 60 days</div>
            <div className="text-lg text-white mt-1">{inr(s.bankBalance)} on hand today</div>
          </div>
          <AskButton
            text="forecast my cash for the next 90 days"
            className="text-xs text-[#B0C4DE] hover:underline"
          >
            forecast next 90 days →
          </AskButton>
        </div>
        <CashChart data={cash} />
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-baseline justify-between mb-4">
            <div className="text-xs uppercase tracking-wider text-white/40">money leaks · 30d</div>
            <span className="text-[11px] text-rose-300/70">{s.leaks.length} active</span>
          </div>
          <div className="space-y-3">
            {s.leaks.length === 0 && <div className="text-sm text-white/50">none detected. clean run.</div>}
            {s.leaks.map((l, i) => (
              <div key={i} className="flex gap-3 items-start border-b border-white/5 pb-3 last:border-0">
                <div className="size-1.5 rounded-full bg-rose-300/80 mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">{l.title}</div>
                  <div className="text-xs text-white/50 mt-0.5">{l.detail}</div>
                </div>
                <div className="text-xs text-rose-300/80 font-mono shrink-0">-{inr(l.impact)}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-baseline justify-between mb-4">
            <div className="text-xs uppercase tracking-wider text-white/40">SKU contribution · 30d</div>
            <span className="text-[11px] text-white/40">after COGS · returns · ads · shipping</span>
          </div>
          <div className="space-y-2">
            {skuRows.map((s) => (
              <div key={s.id} className="flex items-center gap-3 text-sm">
                <span className="font-mono text-xs text-white/40 w-14">{s.id}</span>
                <span className="flex-1 truncate text-white/80">{s.name}</span>
                <span
                  className={
                    s.margin < 0
                      ? 'text-rose-300 font-mono text-xs'
                      : s.margin < 0.15
                        ? 'text-amber-300/90 font-mono text-xs'
                        : 'text-emerald-300/90 font-mono text-xs'
                  }
                >
                  {(s.margin * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="text-xs uppercase tracking-wider text-white/40 mb-4">GST · {s.gst.quarter}</div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-[11px] text-white/40">est. liability</div>
              <div className="text-white font-mono mt-1">{inr(s.gst.estimatedLiability)}</div>
            </div>
            <div>
              <div className="text-[11px] text-white/40">paid</div>
              <div className="text-white font-mono mt-1">{inr(s.gst.paid)}</div>
            </div>
            <div>
              <div className="text-[11px] text-white/40">outstanding</div>
              <div className="text-amber-300 font-mono mt-1">{inr(s.gst.outstanding)}</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-amber-200/70">
            file by {s.gst.dueDate}. Kuber will draft the return 5 days prior.
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="text-xs uppercase tracking-wider text-white/40 mb-4">customer cohorts</div>
          <div className="space-y-2 text-sm">
            {cohorts.map((c) => (
              <div key={c.month} className="flex items-center gap-3">
                <span className="font-mono text-xs text-white/40 w-20">{c.month}</span>
                <span className="text-white/70 w-24">{c.customers} customers</span>
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#B0C4DE]/70"
                    style={{ width: `${Math.min(100, (c.ltv / 4000) * 100)}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-white/60 w-20 text-right">{inr(c.ltv)} LTV</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="rounded-2xl border border-[#B0C4DE]/20 bg-[#B0C4DE]/[0.04] p-6">
        <div className="flex items-start gap-4">
          <div className="size-8 rounded-full bg-[#B0C4DE]/20 flex items-center justify-center text-[#B0C4DE] kuber-serif text-sm">
            K
          </div>
          <div className="flex-1">
            <div className="text-sm text-white">Kuber suggests:</div>
            <div className="text-sm text-white/70 mt-1">
              pause meta ads on SKU-03 for 7 days and route the {inr(15000)} into SKU-01 retargeting. last week&apos;s SKU-01 ROAS
              was 4.2x while SKU-03 was 0.8x after returns.
            </div>
            <div className="mt-3 flex gap-2">
              <AskButton
                text="walk me through the SKU-03 vs SKU-01 ad reallocation"
                className="text-xs px-3 py-1.5 rounded-full bg-[#B0C4DE] text-black hover:bg-[#B0C4DE]/90"
              >
                discuss with Kuber →
              </AskButton>
              <button className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/60 hover:text-white">
                dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
