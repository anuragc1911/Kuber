'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { ArrowRight, MessageSquare, Sparkles } from 'lucide-react'
import { useWealthProfile } from '@/lib/wealth-store'
import { compactINR, projectWealth, yearsToTarget } from '@/lib/projection'

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
    return <div className="py-12 text-center text-white/40 text-sm">loading…</div>
  }

  if (!profile) {
    return (
      <div className="py-8">
        <div className="rounded-2xl border border-[#B0C4DE]/20 bg-[#B0C4DE]/[0.04] p-6">
          <div className="size-9 rounded-full bg-[#B0C4DE]/20 flex items-center justify-center text-[#B0C4DE]">
            <Sparkles className="size-4" />
          </div>
          <h1 className="mt-5 text-[26px] font-semibold tracking-tight leading-tight">
            see your trajectory in two minutes.
          </h1>
          <p className="mt-3 text-[14px] text-white/55 leading-relaxed">
            answer four quick questions — age, income, savings, monthly investing — and <span className="kuber-serif">Kuber</span> builds your wealth trajectory plus the one lever that changes it.
          </p>
          <div className="mt-6 space-y-2">
            <Link
              href="/start/setup"
              className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-white text-[14px] font-medium text-black active:scale-[0.99] transition"
            >
              start setup <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/app/chat"
              className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] text-[13px] text-white/75 active:bg-white/[0.08] transition"
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
    <div className="py-6 pb-10 space-y-5">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] uppercase tracking-wider text-emerald-300">on track</span>
        </div>
        <h1 className="mt-4 text-[22px] font-semibold tracking-tight leading-tight">
          at your current rate,
          <br />
          you&apos;ll have{' '}
          <span className="bg-gradient-to-b from-[#d5e1f2] to-[#6b88af] bg-clip-text text-transparent tabular-nums">
            {compactINR(finalWealth)}
          </span>{' '}
          by age {TARGET_AGE}.
        </h1>
        <p className="text-[13px] text-white/55 mt-3 leading-relaxed">
          {Number.isFinite(yearsToCr ?? Infinity)
            ? `you reach ₹1 Cr in ${yearsToCr!.toFixed(1)} years at age ${Math.round(profile.currentAge + (yearsToCr ?? 0))}.`
            : 'ask Kuber what one move pulls your target closer.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric label="net worth" value={compactINR(profile.currentSavings)} sub={`age ${profile.currentAge}`} />
        <Metric label="monthly SIP" value={compactINR(profile.monthlyInvestment)} sub={`${savingsRate}% of income`} />
        <Metric label="@ age 60" value={compactINR(finalWealth)} sub={`${profile.annualReturnPct}% return`} tone="good" />
        <Metric
          label="to ₹1 Cr"
          value={Number.isFinite(yearsToCr ?? Infinity) ? `${yearsToCr!.toFixed(1)} yr` : '—'}
          sub={Number.isFinite(yearsToCr ?? Infinity) ? `age ${Math.round(profile.currentAge + (yearsToCr ?? 0))}` : 'lift SIP'}
        />
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40">trajectory</div>
            <div className="text-[14px] text-white mt-0.5">age {profile.currentAge} → {TARGET_AGE}</div>
          </div>
          <Link href="/start/trajectory" className="text-[11px] text-[#B0C4DE] active:underline">
            full view →
          </Link>
        </div>
        <div className="h-[200px] -mx-2">
          <ResponsiveContainer>
            <AreaChart data={projection?.points ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="h-base" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B0C4DE" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#B0C4DE" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="age"
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={44}
                tickFormatter={(v) => compactINR(v).replace('₹', '')}
              />
              <Tooltip
                cursor={{ stroke: 'rgba(176,196,222,0.25)', strokeWidth: 1 }}
                formatter={(v: unknown) => [compactINR(Number(v)), 'Wealth'] as [string, string]}
                labelFormatter={(l) => `Age ${l}`}
                contentStyle={{
                  background: 'rgba(8,12,24,0.92)',
                  border: '1px solid rgba(176,196,222,0.2)',
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="wealth" stroke="#B0C4DE" strokeWidth={2} fill="url(#h-base)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="rounded-2xl border border-[#B0C4DE]/20 bg-[#B0C4DE]/[0.05] p-5">
        <div className="flex items-start gap-3">
          <div className="size-8 shrink-0 rounded-full bg-[#B0C4DE]/20 flex items-center justify-center text-[#B0C4DE] kuber-serif text-sm">
            K
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-white">Kuber suggests</div>
            <div className="text-[13px] text-white/70 mt-1 leading-relaxed">
              add <span className="tabular-nums">₹5,000</span>/month to your SIP. shortens time to ₹1 Cr by ~{(yearsToCr ? Math.max(0.5, yearsToCr * 0.08) : 1).toFixed(1)} years.
            </div>
          </div>
        </div>
        <Link
          href={`/app/chat?q=${encodeURIComponent('what if I add ₹5,000 more to my SIP?')}`}
          className="mt-4 flex w-full min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-[#B0C4DE] text-black text-[13px] font-medium active:scale-[0.99] transition"
        >
          discuss with Kuber →
        </Link>
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
      <div className={`mt-1.5 text-[20px] font-semibold tracking-tight tabular-nums leading-none ${toneClass}`}>
        {value}
      </div>
      <div className="mt-1.5 text-[11px] text-white/45 leading-snug">{sub}</div>
    </div>
  )
}
