import { cn } from '@/lib/utils'

export function MetricCard({
  label,
  value,
  sub,
  tone = 'default',
}: {
  label: string
  value: string
  sub?: string
  tone?: 'default' | 'good' | 'warn' | 'bad'
}) {
  const subTone =
    tone === 'good'
      ? 'text-emerald-300/80'
      : tone === 'warn'
        ? 'text-amber-300/80'
        : tone === 'bad'
          ? 'text-rose-300/80'
          : 'text-white/50'
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-sm">
      <div className="text-[11px] uppercase tracking-wider text-white/40">{label}</div>
      <div className={cn('mt-2 text-3xl font-semibold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent')}>
        {value}
      </div>
      {sub && <div className={cn('mt-1 text-xs', subTone)}>{sub}</div>}
    </div>
  )
}
