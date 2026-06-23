'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts'
import { ArrowRight, MessageSquare, RotateCcw } from 'lucide-react'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { DEFAULT_PROFILE, useWealthProfile } from '@/lib/wealth-store'
import { compactINR, projectWealth, yearsToTarget } from '@/lib/projection'

const transitionVariants = {
  item: {
    hidden: { opacity: 0, filter: 'blur(12px)', y: 12 },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: { type: 'spring', bounce: 0.3, duration: 1.5 },
    },
  },
}

const TARGET_AGE = 60

export default function TrajectoryPage() {
  const router = useRouter()
  const { profile: stored, hydrated, setProfile } = useWealthProfile()
  const [profile, setLocal] = useState(stored ?? DEFAULT_PROFILE)
  const [sipBoost, setSipBoost] = useState(5000)

  useEffect(() => {
    if (hydrated && stored) setLocal(stored)
  }, [hydrated, stored])

  useEffect(() => {
    if (hydrated && !stored) {
      router.replace('/start/setup')
    }
  }, [hydrated, stored, router])

  const base = useMemo(
    () =>
      projectWealth({
        currentAge: profile.currentAge,
        targetAge: TARGET_AGE,
        currentSavings: profile.currentSavings,
        monthlyInvestment: profile.monthlyInvestment,
        annualReturnPct: profile.annualReturnPct,
      }),
    [profile],
  )

  const boosted = useMemo(
    () =>
      projectWealth({
        currentAge: profile.currentAge,
        targetAge: TARGET_AGE,
        currentSavings: profile.currentSavings,
        monthlyInvestment: profile.monthlyInvestment + sipBoost,
        annualReturnPct: profile.annualReturnPct,
      }),
    [profile, sipBoost],
  )

  const chartData = base.points.map((p, idx) => ({
    age: p.age,
    base: p.wealth,
    boosted: boosted.points[idx]?.wealth ?? p.wealth,
  }))

  const milestoneCr = 1_00_00_000
  const reachesCrAt = base.points.find((p) => p.wealth >= milestoneCr)?.age
  const yearsToCr = yearsToTarget(milestoneCr, {
    currentAge: profile.currentAge,
    currentSavings: profile.currentSavings,
    monthlyInvestment: profile.monthlyInvestment,
    annualReturnPct: profile.annualReturnPct,
  })

  function saveAndUpdate(next: typeof profile) {
    setLocal(next)
    setProfile(next)
  }

  function startOver() {
    if (typeof window !== 'undefined' && confirm('clear your answers and start over?')) {
      window.localStorage.removeItem('kuber:wealth-profile:v1')
      router.push('/start')
    }
  }

  const delta = boosted.finalWealth - base.finalWealth
  const savingsRate = profile.monthlyIncome > 0
    ? Math.round((profile.monthlyInvestment / profile.monthlyIncome) * 100)
    : 0

  return (
    <section className="relative px-5 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-5xl">
        <AnimatedGroup variants={transitionVariants}>
          <div className="text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/55 backdrop-blur-md">
              <span className="size-1 rounded-full bg-[#B0C4DE] shadow-[0_0_8px_#B0C4DE]" />
              your trajectory
            </div>
            <h1 className="mx-auto max-w-3xl bg-gradient-to-b from-white to-white/70 bg-clip-text text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-transparent">
              at your current rate, you&apos;ll have{' '}
              <span className="bg-gradient-to-b from-[#d5e1f2] to-[#6b88af] bg-clip-text text-transparent tabular-nums">
                {compactINR(base.finalWealth)}
              </span>{' '}
              by age {TARGET_AGE}.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-white/55 leading-relaxed">
              invest <span className="text-white tabular-nums">{compactINR(sipBoost)}</span> more each month and that becomes{' '}
              <span className="bg-gradient-to-b from-[#E9C77B] to-[#9C7E36] bg-clip-text text-transparent font-semibold tabular-nums">
                {compactINR(boosted.finalWealth)}
              </span>{' '}
              <span className="text-white/40">— {compactINR(delta)} more, same effort.</span>
            </p>
          </div>
        </AnimatedGroup>

        <AnimatedGroup variants={transitionVariants}>
          <div
            className="relative mt-10 rounded-3xl border border-white/10 p-6 md:p-8 backdrop-blur-md"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 60px -30px rgba(3,7,18,0.9)',
            }}
          >
            <div className="h-[280px] sm:h-[340px] -mx-2">
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="t-base" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B0C4DE" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#B0C4DE" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="t-boost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E9C77B" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#E9C77B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="age"
                    tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={56}
                    tickFormatter={(v) => compactINR(v).replace('₹', '')}
                  />
                  {reachesCrAt && (
                    <ReferenceLine
                      x={reachesCrAt}
                      stroke="rgba(233,199,123,0.55)"
                      strokeDasharray="3 4"
                      label={{ value: `₹1 Cr @ ${reachesCrAt}`, position: 'insideTopLeft', fill: '#E9C77B', fontSize: 10, dx: 8 }}
                    />
                  )}
                  <Tooltip
                    cursor={{ stroke: 'rgba(176,196,222,0.25)', strokeWidth: 1 }}
                    formatter={(v: number, key) => [compactINR(v), key === 'boosted' ? `+${compactINR(sipBoost)}/mo` : 'Current rate']}
                    labelFormatter={(l) => `Age ${l}`}
                    contentStyle={{
                      background: 'rgba(8,12,24,0.92)',
                      border: '1px solid rgba(176,196,222,0.2)',
                      borderRadius: 12,
                      backdropFilter: 'blur(10px)',
                    }}
                    labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                  />
                  <Area type="monotone" dataKey="boosted" stroke="#E9C77B" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#t-boost)" />
                  <Area type="monotone" dataKey="base" stroke="#B0C4DE" strokeWidth={2.2} fill="url(#t-base)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 flex items-center gap-4 text-[12px] text-white/40">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#B0C4DE] shadow-[0_0_8px_#B0C4DE]" />
                your current rate
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#E9C77B] shadow-[0_0_8px_#E9C77B]" />
                with +{compactINR(sipBoost)}/mo
              </span>
            </div>
          </div>
        </AnimatedGroup>

        <AnimatedGroup variants={transitionVariants}>
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-baseline justify-between">
                <div className="text-[11px] uppercase tracking-wider text-white/40">the one lever</div>
                <span className="text-[11px] text-white/30">drag to feel the impact</span>
              </div>
              <h3 className="mt-2 text-xl font-semibold tracking-tight">
                add <span className="tabular-nums">{compactINR(sipBoost)}</span>/month to your investing.
              </h3>
              <p className="mt-2 text-sm text-white/55 leading-relaxed">
                that&apos;s {compactINR(sipBoost * 12)} a year. by age {TARGET_AGE} it compounds into{' '}
                <span className="text-white font-medium tabular-nums">{compactINR(delta)}</span> of extra wealth.
              </p>

              <input
                type="range"
                min={0}
                max={50_000}
                step={1000}
                value={sipBoost}
                onChange={(e) => setSipBoost(Number(e.target.value))}
                className="kuber-slider mt-5 w-full"
                style={{
                  background: `linear-gradient(90deg, #E9C77B 0%, #fff0c5 ${(sipBoost / 50_000) * 100}%, rgba(233,199,123,0.10) ${(sipBoost / 50_000) * 100}%)`,
                }}
              />
              <div className="mt-2 flex justify-between text-[11px] tabular-nums text-white/35">
                <span>₹0</span>
                <span>+{compactINR(sipBoost)}/mo</span>
                <span>₹50k</span>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <Stat
                label="years to your first crore"
                value={Number.isFinite(yearsToCr) ? `${yearsToCr.toFixed(1)} yrs` : '—'}
                sub={Number.isFinite(yearsToCr) ? `at age ${Math.round(profile.currentAge + yearsToCr)}` : 'not at this rate'}
              />
              <Stat
                label="your savings rate"
                value={`${savingsRate}%`}
                sub={savingsRate >= 30 ? 'top quartile · keep going' : savingsRate >= 15 ? 'okay — add ₹5k to step up' : 'lifting this is your biggest lever'}
              />
            </div>
          </div>
        </AnimatedGroup>

        <AnimatedGroup variants={transitionVariants}>
          <div className="mt-10 rounded-3xl border border-[#B0C4DE]/20 bg-[#B0C4DE]/[0.05] p-8 md:p-10 text-center">
            <div className="mx-auto size-10 rounded-full bg-[#B0C4DE]/20 flex items-center justify-center text-[#B0C4DE] kuber-serif text-base">
              K
            </div>
            <h3 className="mt-5 text-2xl font-semibold tracking-tight">
              this is just the start. ask <span className="kuber-serif">Kuber</span> anything.
            </h3>
            <p className="mt-3 text-sm text-white/55 max-w-xl mx-auto leading-relaxed">
              &ldquo;when can I retire?&rdquo; · &ldquo;what if I take a sabbatical?&rdquo; · &ldquo;should I prepay my loan or invest?&rdquo; — your answers, your numbers, calculated exactly.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/app/chat"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-medium text-black shadow-[0_24px_48px_rgba(0,0,0,0.4)] transition hover:bg-white/90"
              >
                <MessageSquare className="size-4" />
                ask Kuber
                <ArrowRight className="size-4" />
              </Link>
              <button
                onClick={() => saveAndUpdate(profile)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-[14px] text-white/80 transition hover:bg-white/[0.08] hover:text-white"
              >
                save my trajectory
              </button>
              <button
                onClick={startOver}
                className="inline-flex items-center gap-2 text-[13px] text-white/40 transition hover:text-white"
              >
                <RotateCcw className="size-3.5" />
                start over
              </button>
            </div>
          </div>
        </AnimatedGroup>

        <p className="mt-12 text-center text-[11px] text-white/30">
          assumes a {profile.annualReturnPct}% annual return, monthly compounding. real returns vary. Kuber is a coaching tool, not financial advice.
        </p>
      </div>
    </section>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="text-[11px] uppercase tracking-wider text-white/40">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
      <div className="mt-1 text-[12px] text-white/45">{sub}</div>
    </div>
  )
}
