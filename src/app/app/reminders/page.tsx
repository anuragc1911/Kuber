import { reminders, type Reminder } from '@/lib/activity'
import { AskButton } from '@/components/app/ask-button'
import { cn } from '@/lib/utils'

const TODAY = '2026-05-04'

const catLabel: Record<Reminder['category'], string> = {
  tax: 'tax',
  payroll: 'payroll',
  inventory: 'inventory',
  reporting: 'reporting',
  vendor: 'vendor',
  review: 'review',
}

function daysUntil(iso: string) {
  return Math.ceil((Date.parse(iso) - Date.parse(TODAY)) / 86_400_000)
}

export default function RemindersPage() {
  const all = reminders()
  const pending = all.filter((r) => r.status === 'pending')
  const done = all.filter((r) => r.status === 'done')

  return (
    <div className="p-6 lg:p-10 max-w-4xl space-y-8">
      <div>
        <div className="text-xs text-[#B0C4DE] uppercase tracking-wider mb-2">• reminders</div>
        <h1 className="text-2xl md:text-3xl font-medium text-white">what you owe, when.</h1>
        <p className="text-sm text-white/50 mt-2">
          {pending.length} pending · {done.length} done · Kuber will remind you 3 days before each due date.
        </p>
      </div>

      <section className="space-y-3">
        <div className="text-xs uppercase tracking-wider text-white/40">pending</div>
        {pending.map((r) => {
          const d = daysUntil(r.dueDate)
          const tone = d <= 3 ? 'rose' : d <= 7 ? 'amber' : 'blue'
          return (
            <div key={r.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex items-start gap-4">
              <div
                className={cn(
                  'shrink-0 w-16 text-center rounded-xl py-2 border',
                  tone === 'rose' && 'border-rose-400/30 bg-rose-400/10 text-rose-300',
                  tone === 'amber' && 'border-amber-300/30 bg-amber-300/10 text-amber-200',
                  tone === 'blue' && 'border-[#B0C4DE]/30 bg-[#B0C4DE]/10 text-[#B0C4DE]',
                )}
              >
                <div className="font-mono text-xs uppercase opacity-70">{r.dueDate.slice(5, 7)}</div>
                <div className="text-xl font-semibold leading-none">{r.dueDate.slice(8, 10)}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider rounded-full border border-white/10 px-2 py-0.5 text-white/50">
                    {catLabel[r.category]}
                  </span>
                  <span className="text-[11px] text-white/40 font-mono">
                    {d <= 0 ? 'today' : d === 1 ? 'tomorrow' : `in ${d} days`}
                  </span>
                </div>
                <div className="mt-2 text-base text-white">{r.title}</div>
                <div className="mt-1 text-sm text-white/60">{r.detail}</div>
                <div className="mt-3 flex gap-2">
                  <AskButton
                    text={`help me with: ${r.title}`}
                    className="text-xs px-3 py-1.5 rounded-full bg-[#B0C4DE] text-black hover:bg-[#B0C4DE]/90"
                  >
                    ask Kuber →
                  </AskButton>
                  <button className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/60 hover:text-white">
                    mark done
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </section>

      {done.length > 0 && (
        <section className="space-y-3">
          <div className="text-xs uppercase tracking-wider text-white/40">recently done</div>
          {done.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 flex items-center gap-4 opacity-60"
            >
              <span className="text-emerald-300/80 text-sm">✓</span>
              <div className="flex-1">
                <div className="text-sm text-white/70 line-through">{r.title}</div>
                <div className="text-xs text-white/40">{r.dueDate} · {catLabel[r.category]}</div>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
