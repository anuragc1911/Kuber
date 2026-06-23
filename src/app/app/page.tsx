'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { ArrowRight, MessageSquare, Sparkles } from 'lucide-react'
import { useWealthProfile } from '@/lib/wealth-store'
import { compactINR, projectWealth, yearsToTarget } from '@/lib/projection'
import { cn } from '@/lib/utils'

const TARGET_AGE = 60

export default function AppHome() {
  const { profile, hydrated } = useWealthProfile()

  const projection = useMemo(() => {
    if (!profile) return null
    return projectWealth({
      currentAge: profile.currentAge,
      targetAge: TARGET_AGE,
      currentSavings: profile.currentSavings,
      monthlyInvestment: profile.monthlyInvestment,
      annualReturnPct: profile.annualReturnPct,
    })
  }, [profile])

  const yearsToCr = useMemo(() => {
    if (!profile) return null
    return yearsToTarget(1_00_00_000, {
      currentAge: profile.currentAge,
      currentSavings: profile.currentSavings,
      monthlyInvestment: profile.monthlyInvestment,
      annualReturnPct: profile.annualReturnPct,
    })
  }, [profile])

  if (!hydrated) {
    return <div className="p-10 text-white/40">loading…</div>
  }

  if (!profile) {
    return (
      <div className="p-6 lg:p-10 max-w-3xl">
        <div className="rounded-3xl border border-[#B0C4DE]/20 bg-[#B0C4DE]/[0.04] p-10">
          <Sparkles className="size-6 text-[#B0C4DE]" />
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">
            see your trajectory in two minutes.
          </h1>
          <p className="mt-3 text-sm text-white/55 max-w-xl leading-relaxed">
            answer four quick questions — age, income, savings, monthly investing — and Kuber builds your wealth trajectory plus the one lever that changes it.
          </p>
          <div className="mt-7 flex gap-3 flex-wrap">
            <Link
              href="/start/setup"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-white/90"
            >
              start setup <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/app/chat"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm text-white/70 hover:bg-white/[0.08] hover:text-white"
            >
              <MessageSquare className="size-4" /> ask Kuber instead
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const finalWealth = projection?.finalWealth ?? 0
  const savingsRate = profile.monthlyIncome > 0
    ? Math.round((profile.monthlyInvestment / profile.monthlyIncome) * 100)
    : 0

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-6xl">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          <span className="text-[11px] uppercase tracking-wider text-emerald-300">on track</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-medium text-white tracking-tight max-w-3xl">
          at your current rate, you&apos;ll have{' '}
          <span className="bg-gradient-to-b from-[#d5e1f2] to-[#6b88af] bg-clip-text text-transparent tabular-nums">
            {compactINR(finalWealth)}
          </span>{' '}
          by age {TARGET_AGE}.
        </h1>
        <p className="text-sm text-white/55 mt-3 max-w-2xl leading-relaxed">
          {Number.isFinite(yearsToCr ?? Infinity)
            ? `you reach ₹1 Cr in ${yearsToCr!.toFixed(1)} years at age ${Math.round(profile.currentAge + (yearsToCr ?? 0))}. `
            : ''}
          ask Kuber what one move pulls that closer.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric label="net worth today" value={compactINR(profile.currentSavings)} sub={`age ${profile.currentAge}`} />
        <Metric label="monthly SIP" value={compactINR(profile.monthlyInvestment)} sub={`${savingsRate}% of income`} />
        <Metric label="@ age 60" value={compactINR(finalWealth)} sub={`${profile.annualReturnPct}% expected return`} tone="good" />
        <Metric
          label="years to ₹1 Cr"
          value={Number.isFinite(yearsToCr ?? Infinity) ? `${yearsToCr!.toFixed(1)} yrs` : '—'}
          sub={Number.isFinite(yearsToCr ?? Infinity) ? `at age ${Math.round(profile.currentAge + (yearsToCr ?? 0))}` : 'lift SIP to reach'}
        />
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/40">your trajectory</div>
            <div className="text-lg text-white mt-1">age {profile.currentAge} → {TARGET_AGE}</div>
          </div>
          <Link href="/start/trajectory" className="text-xs text-[#B0C4DE] hover:underline">
            open full trajectory →
          </Link>
        </div>
        <div className="h-[240px]">
          <ResponsiveContainer>
            <AreaChart data={projection?.points ?? []} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="h-base" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B0C4DE" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#B0C4DE" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="age"
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={56}
                tickFormatter={(v) => compactINR(v).replace('₹', '')}
              />
              <Tooltip
                cursor={{ stroke: 'rgba(176,196,222,0.25)', strokeWidth: 1 }}
                formatter={(v: number) => [compactINR(v), 'Wealth']}
                labelFormatter={(l) => `Age ${l}`}
                contentStyle={{
                  background: 'rgba(8,12,24,0.92)',
                  border: '1px solid rgba(176,196,222,0.2)',
                  borderRadius: 12,
                }}
              />
              <Area type="monotone" dataKey="wealth" stroke="#B0C4DE" strokeWidth={2.2} fill="url(#h-base)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="rounded-2xl border border-[#B0C4DE]/20 bg-[#B0C4DE]/[0.04] p-6">
        <div className="flex items-start gap-4">
          <div className="size-8 rounded-full bg-[#B0C4DE]/20 flex items-center justify-center text-[#B0C4DE] kuber-serif text-sm">
            K
          </div>
          <div className="flex-1">
            <div className="text-sm text-white">Kuber suggests:</div>
            <div className="text-sm text-white/70 mt-1">
              add <span className="tabular-nums">₹5,000</span>/month to your SIP. that single step shortens your time to ₹1 Cr by roughly {(yearsToCr ? Math.max(0.5, yearsToCr * 0.08) : 1).toFixed(1)} years.
            </div>
            <div className="mt-3 flex gap-2">
              <Link
                href={`/app/chat?q=${encodeURIComponent('what if I add ₹5,000 more to my SIP?')}`}
                className="text-xs px-3 py-1.5 rounded-full bg-[#B0C4DE] text-black hover:bg-[#B0C4DE]/90"
              >
                discuss with Kuber →
              </Link>
              <Link
                href="/start/trajectory"
                className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/60 hover:text-white"
              >
                see the impact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: string
  sub: string
  tone?: 'good' | 'warn' | 'bad'
}) {
  const toneClass =
    tone === 'good'
      ? 'text-emerald-300'
      : tone === 'warn'
        ? 'text-amber-300'
        : tone === 'bad'
          ? 'text-rose-300'
          : 'text-white'
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="text-[11px] uppercase tracking-wider text-white/40">{label}</div>
      <div className={cn('mt-2 text-2xl font-semibold tracking-tight tabular-nums', toneClass)}>
        {value}
      </div>
      <div className="mt-1 text-[12px] text-white/45">{sub}</div>
    </div>
  )
}
