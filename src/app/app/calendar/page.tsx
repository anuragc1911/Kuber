import { calendarEvents, type CalendarEvent, type Severity } from '@/lib/activity'
import { inr } from '@/lib/metrics'
import { cn } from '@/lib/utils'

const TODAY = new Date('2026-05-04')

function buildGrid(year: number, month: number) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startDow = first.getDay() // 0=sun
  const cells: { iso: string | null; day: number | null }[] = []
  for (let i = 0; i < startDow; i++) cells.push({ iso: null, day: null })
  for (let d = 1; d <= last.getDate(); d++) {
    const iso = new Date(Date.UTC(year, month, d)).toISOString().slice(0, 10)
    cells.push({ iso, day: d })
  }
  while (cells.length % 7 !== 0) cells.push({ iso: null, day: null })
  return cells
}

const TYPE_DOT: Record<CalendarEvent['type'], string> = {
  reminder: 'bg-amber-300',
  spike: 'bg-emerald-400',
  expense: 'bg-rose-400',
  milestone: 'bg-[#B0C4DE]',
}

const SEV_TONE: Record<Severity, string> = {
  critical: 'text-rose-300',
  warn: 'text-amber-200',
  info: 'text-[#B0C4DE]',
}

export default function CalendarPage() {
  const year = TODAY.getFullYear()
  const month = TODAY.getMonth()
  const monthName = TODAY.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  const events = calendarEvents(year, month)
  const cells = buildGrid(year, month)

  // group events by date
  const byDate: Record<string, CalendarEvent[]> = {}
  for (const e of events) {
    byDate[e.date] ??= []
    byDate[e.date].push(e)
  }

  const todayIso = TODAY.toISOString().slice(0, 10)

  return (
    <div className="p-6 lg:p-10 max-w-7xl space-y-8">
      <div>
        <div className="text-xs text-[#B0C4DE] uppercase tracking-wider mb-2">• calendar</div>
        <h1 className="text-2xl md:text-3xl font-medium text-white">your business month, at a glance.</h1>
        <p className="text-sm text-white/50 mt-2">
          revenue spikes, big expenses, due dates, and milestones — all in one view.
        </p>
      </div>

      <div className="flex items-center gap-4 text-xs text-white/50">
        <span className="text-white/80 text-base lowercase">{monthName.toLowerCase()}</span>
        <Legend dot="bg-amber-300" label="reminders" />
        <Legend dot="bg-emerald-400" label="revenue spikes" />
        <Legend dot="bg-rose-400" label="big expenses" />
        <Legend dot="bg-[#B0C4DE]" label="milestones" />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.025] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
        <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.04]">
          {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((d) => (
            <div key={d} className="px-3 py-2.5 text-[10px] uppercase tracking-wider text-white/50">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((c, i) => {
            const evs = c.iso ? byDate[c.iso] || [] : []
            const isToday = c.iso === todayIso
            const isPast = c.iso && c.iso < todayIso
            return (
              <div
                key={i}
                className={cn(
                  'min-h-[112px] border-b border-r border-white/[0.07] p-2 last:border-r-0',
                  i % 7 === 6 && 'border-r-0',
                  !c.iso && 'bg-white/[0.015]',
                  isPast && c.iso && 'bg-white/[0.01]',
                  isToday && 'bg-[#B0C4DE]/15 ring-1 ring-inset ring-[#B0C4DE]/40',
                )}
              >
                {c.day && (
                  <>
                    <div
                      className={cn(
                        'flex items-center gap-2 text-xs mb-1.5',
                        isToday ? 'text-[#B0C4DE] font-medium' : 'text-white/50',
                      )}
                    >
                      <span className="font-mono">{c.day}</span>
                      {isToday && <span className="text-[10px] uppercase">today</span>}
                    </div>
                    <div className="space-y-1">
                      {evs.slice(0, 3).map((e, ei) => (
                        <div
                          key={ei}
                          className="text-[11px] flex items-start gap-1.5 text-white/70"
                          title={e.label}
                        >
                          <span className={cn('size-1.5 rounded-full mt-1 shrink-0', TYPE_DOT[e.type])} />
                          <span className="truncate">{e.label}</span>
                        </div>
                      ))}
                      {evs.length > 3 && (
                        <div className="text-[10px] text-white/30">+{evs.length - 3} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <section>
        <div className="text-xs uppercase tracking-wider text-white/40 mb-4">upcoming this month</div>
        <div className="space-y-2">
          {events
            .filter((e) => !e.date || e.date >= todayIso)
            .map((e, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
              >
                <div className="font-mono text-xs text-white/40 w-20">{e.date}</div>
                <span className={cn('size-1.5 rounded-full', TYPE_DOT[e.type])} />
                <div className="flex-1 text-sm text-white/80">{e.label}</div>
                {e.amount && <div className="font-mono text-xs text-white/60">{inr(e.amount)}</div>}
                {e.severity && (
                  <span className={cn('text-[10px] uppercase tracking-wider', SEV_TONE[e.severity])}>
                    {e.severity}
                  </span>
                )}
              </div>
            ))}
        </div>
      </section>
    </div>
  )
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('size-1.5 rounded-full', dot)} />
      {label}
    </span>
  )
}
