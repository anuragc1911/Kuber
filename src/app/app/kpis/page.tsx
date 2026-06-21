import { kpis, type Kpi } from '@/lib/activity'
import { AskButton } from '@/components/app/ask-button'
import { cn } from '@/lib/utils'

const catLabel: Record<Kpi['category'], string> = {
  growth: 'growth',
  profitability: 'profitability',
  efficiency: 'efficiency',
  cash: 'cash',
}

export default function KpisPage() {
  const all = kpis()
  const groups: Kpi['category'][] = ['growth', 'profitability', 'efficiency', 'cash']

  return (
    <div className="p-6 lg:p-10 max-w-7xl space-y-10">
      <div>
        <div className="text-xs text-[#B0C4DE] uppercase tracking-wider mb-2">• KPIs</div>
        <h1 className="text-2xl md:text-3xl font-medium text-white">every metric a board would ask for.</h1>
        <p className="text-sm text-white/50 mt-2">
          12 KPIs grouped by what they tell you. trends are vs prior period.
        </p>
      </div>

      {groups.map((cat) => {
        const rows = all.filter((k) => k.category === cat)
        if (rows.length === 0) return null
        return (
          <section key={cat} className="space-y-4">
            <div className="text-xs uppercase tracking-wider text-white/40">{catLabel[cat]}</div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {rows.map((k) => (
                <KpiCard key={k.id} k={k} />
              ))}
            </div>
          </section>
        )
      })}

      <div className="rounded-2xl border border-[#B0C4DE]/20 bg-[#B0C4DE]/[0.04] p-6">
        <div className="flex items-start gap-4">
          <div className="size-8 rounded-full bg-[#B0C4DE]/20 flex items-center justify-center text-[#B0C4DE] kuber-serif text-sm">
            K
          </div>
          <div className="flex-1">
            <div className="text-sm text-white">read-out from Kuber</div>
            <div className="text-sm text-white/70 mt-1 leading-relaxed">
              your LTV:CAC is healthy and revenue grew 29% — but refund rate is creeping over benchmark and three SKUs
              are losing money on paid traffic. fix the ad mix before scaling spend.
            </div>
            <div className="mt-3">
              <AskButton
                text="walk me through all 12 KPIs and what to focus on"
                className="text-xs px-3 py-1.5 rounded-full bg-[#B0C4DE] text-black hover:bg-[#B0C4DE]/90"
              >
                deep dive with Kuber →
              </AskButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ k }: { k: Kpi }) {
  const trendArrow = k.trend === 'up' ? '↑' : k.trend === 'down' ? '↓' : '→'
  const trendTone =
    k.trend === 'flat' ? 'text-white/40' : k.good ? 'text-emerald-300/90' : 'text-rose-300/90'
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="text-[11px] uppercase tracking-wider text-white/40">{k.label}</div>
      <div className="mt-2 text-2xl font-semibold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
        {k.value}
      </div>
      <div className="mt-1 text-[11px] text-white/50 leading-relaxed">{k.context}</div>
      <div className={cn('mt-2 text-xs font-mono', trendTone)}>{trendArrow} {k.trend}</div>
    </div>
  )
}
