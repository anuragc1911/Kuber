import { reports, type Report } from '@/lib/activity'
import { AskButton } from '@/components/app/ask-button'

const catStyle: Record<Report['category'], string> = {
  'P&L': 'bg-[#B0C4DE]/10 text-[#B0C4DE] border-[#B0C4DE]/30',
  tax: 'bg-amber-300/10 text-amber-200 border-amber-300/30',
  investor: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
  sku: 'bg-rose-400/10 text-rose-300 border-rose-400/30',
  cohort: 'bg-purple-300/10 text-purple-200 border-purple-300/30',
}

export default function ReportsPage() {
  const all = reports()
  return (
    <div className="p-6 lg:p-10 max-w-5xl space-y-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-xs text-[#B0C4DE] uppercase tracking-wider mb-2">• reports</div>
          <h1 className="text-2xl md:text-3xl font-medium text-white">your books, written.</h1>
          <p className="text-sm text-white/50 mt-2">
            Kuber drafts P&L, GST workings, investor updates, and ad-hoc analyses — automatically.
          </p>
        </div>
        <AskButton
          text="draft a new report for me"
          className="text-xs px-4 py-2 rounded-full bg-[#B0C4DE] text-black hover:bg-[#B0C4DE]/90 shrink-0"
        >
          + draft new report
        </AskButton>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(['P&L', 'tax', 'investor', 'sku', 'cohort'] as Report['category'][]).map((c) => {
          const count = all.filter((r) => r.category === c).length
          return (
            <div key={c} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-[11px] uppercase tracking-wider text-white/40">{c}</div>
              <div className="text-xl text-white mt-1">{count}</div>
            </div>
          )
        })}
      </div>

      <div className="space-y-3">
        {all.map((r) => (
          <div key={r.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-center text-white/40 text-sm shrink-0">
                ☰
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] uppercase tracking-wider rounded-full border px-2 py-0.5 ${catStyle[r.category]}`}>
                    {r.category}
                  </span>
                  <span className="text-[11px] text-white/40 font-mono">{r.period}</span>
                  <span className="text-[11px] text-white/30">· generated {r.generatedAt} · {r.size}</span>
                </div>
                <div className="mt-2 text-base text-white">{r.title}</div>
                <div className="mt-1 text-sm text-white/60">{r.summary}</div>
                <div className="mt-3 flex items-center gap-1 text-xs">
                  <button className="text-white/60 hover:text-white transition-colors">view</button>
                  <span className="text-white/20 mx-2">·</span>
                  <button className="text-white/60 hover:text-white transition-colors">download PDF</button>
                  <span className="text-white/20 mx-2">·</span>
                  <button className="text-white/60 hover:text-white transition-colors">share</button>
                  <AskButton
                    text={`explain the ${r.title}`}
                    className="ml-auto text-[#B0C4DE] hover:text-white transition-colors"
                  >
                    ask Kuber about this →
                  </AskButton>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
