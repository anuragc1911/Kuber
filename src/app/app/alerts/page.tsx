import { alerts, type Severity, type Alert } from '@/lib/activity'
import { KuberMark } from '@/components/ui/kuber-logo'
import { AskButton } from '@/components/app/ask-button'
import { cn } from '@/lib/utils'

const TODAY = '2026-05-04'

const sev: Record<
  Severity,
  { label: string; rail: string; railText: string; dot: string; metric: string }
> = {
  critical: {
    label: 'critical',
    rail: 'bg-rose-500/[0.08] border-rose-400/20',
    railText: 'text-rose-300',
    dot: 'bg-rose-400',
    metric: 'text-rose-300',
  },
  warn: {
    label: 'warning',
    rail: 'bg-amber-400/[0.06] border-amber-300/20',
    railText: 'text-amber-200',
    dot: 'bg-amber-300',
    metric: 'text-amber-200',
  },
  info: {
    label: 'info',
    rail: 'bg-[#B0C4DE]/[0.05] border-[#B0C4DE]/20',
    railText: 'text-[#B0C4DE]',
    dot: 'bg-[#B0C4DE]',
    metric: 'text-[#B0C4DE]',
  },
}

function relativeTime(iso: string) {
  const days = Math.round((Date.parse(TODAY) - Date.parse(iso)) / 86_400_000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days}d ago`
}

export default function AlertsPage() {
  const all = alerts()
  const counts = {
    critical: all.filter((a) => a.severity === 'critical').length,
    warn: all.filter((a) => a.severity === 'warn').length,
    info: all.filter((a) => a.severity === 'info').length,
  }

  return (
    <div className="p-6 lg:p-10 max-w-5xl space-y-8">
      <div>
        <div className="text-xs text-[#B0C4DE] uppercase tracking-wider mb-2">• alerts</div>
        <h1 className="text-2xl md:text-3xl font-medium text-white">what needs your attention.</h1>
        <p className="text-sm text-white/50 mt-2">
          {all.length} active · grouped by severity · latest first.
        </p>
      </div>

      {/* compact severity bar */}
      <div className="flex items-center gap-px overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
        {(['critical', 'warn', 'info'] as Severity[]).map((s) => (
          <div key={s} className="relative flex-1 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className={cn('size-1.5 rounded-full', sev[s].dot)} />
              <span className="text-[10px] uppercase tracking-wider text-white/40">{sev[s].label}</span>
            </div>
            <div className={cn('mt-1 text-2xl font-semibold tabular-nums', sev[s].railText)}>
              {counts[s]}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {all.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-white/50">
            no alerts. clean run.
          </div>
        )}
        {all.map((a) => (
          <AlertRow key={a.id} a={a} />
        ))}
      </div>
    </div>
  )
}

function AlertRow({ a }: { a: Alert }) {
  const s = sev[a.severity]
  return (
    <article className="group grid grid-cols-[10rem_1fr] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors">
      {/* left rail — severity, metric, date */}
      <div className={cn('relative flex flex-col justify-between gap-4 border-r border-white/5 p-5', s.rail)}>
        <div className="flex items-center gap-1.5">
          <span className={cn('size-1.5 rounded-full', s.dot)} />
          <span className={cn('text-[10px] uppercase tracking-[0.12em] font-medium', s.railText)}>
            {s.label}
          </span>
        </div>
        <div className={cn('font-mono text-2xl font-semibold tabular-nums leading-none', s.metric)}>
          {a.metric}
        </div>
        <div className="text-[10px] text-white/30 font-mono">
          {a.ts} · {relativeTime(a.ts)}
        </div>
      </div>

      {/* right column — content */}
      <div className="p-5">
        <div className="text-[10px] uppercase tracking-[0.12em] text-white/40">{a.source}</div>
        <h3 className="mt-2 text-base font-medium text-white">{a.title}</h3>
        <p className="mt-1 text-sm text-white/55 leading-relaxed">{a.detail}</p>

        {a.suggestion && (
          <div className="mt-4 flex items-start gap-3 border-l-2 border-[#B0C4DE]/40 pl-3">
            <KuberMark size="sm" className="mt-0.5" />
            <p className="text-sm italic text-white/70">{a.suggestion}</p>
          </div>
        )}

        <div className="mt-5 flex items-center gap-1 text-xs">
          <AskButton
            text={`walk me through the alert: ${a.title}`}
            className="text-[#B0C4DE] hover:text-white transition-colors"
          >
            ask Kuber →
          </AskButton>
          <span className="text-white/20 mx-2">·</span>
          <button className="text-white/50 hover:text-white transition-colors">mark resolved</button>
          <span className="text-white/20 mx-2">·</span>
          <button className="text-white/40 hover:text-white transition-colors">snooze</button>
        </div>
      </div>
    </article>
  )
}
