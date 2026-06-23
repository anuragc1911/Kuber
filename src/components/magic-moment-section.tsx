'use client'

import { useMemo, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { projectWealth, compactINR } from '@/lib/projection'

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

const PRESETS = [
  { label: 'Early career', age: 26, savings: 2_50_000, sip: 15_000 },
  { label: 'Mid-30s pro', age: 32, savings: 12_00_000, sip: 35_000 },
  { label: 'Senior IC', age: 38, savings: 45_00_000, sip: 80_000 },
]

export function MagicMomentSection() {
  const [age, setAge] = useState(28)
  const [savings, setSavings] = useState(5_00_000)
  const [sip, setSip] = useState(25_000)
  const [returnPct, setReturnPct] = useState(12)
  const targetAge = 60

  const base = useMemo(
    () =>
      projectWealth({
        currentAge: age,
        targetAge,
        currentSavings: savings,
        monthlyInvestment: sip,
        annualReturnPct: returnPct,
      }),
    [age, savings, sip, returnPct]
  )
  const boosted = useMemo(
    () =>
      projectWealth({
        currentAge: age,
        targetAge,
        currentSavings: savings,
        monthlyInvestment: sip + 5000,
        annualReturnPct: returnPct,
      }),
    [age, savings, sip, returnPct]
  )

  const chartData = base.points.map((p, idx) => ({
    age: p.age,
    base: p.wealth,
    boosted: boosted.points[idx]?.wealth ?? p.wealth,
  }))

  const milestoneCr = 1_00_00_000
  const reachesCrAt = base.points.find((p) => p.wealth >= milestoneCr)?.age

  return (
    <section id="magic-moment" className="relative overflow-hidden py-24 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[80vw] w-[80vw] max-h-[900px] max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(176, 196, 222, 0.10) 0%, transparent 60%)',
          filter: 'blur(100px)',
        }}
      />

      <div className="mx-auto max-w-7xl px-6">
        <AnimatedGroup variants={transitionVariants}>
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/50 backdrop-blur-md">
              <span className="size-1 rounded-full bg-[#B0C4DE] shadow-[0_0_8px_#B0C4DE]" />
              the magic moment
            </div>
            <h2 className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-balance text-4xl font-semibold tracking-tight text-transparent md:text-5xl">
              your wealth. your trajectory. the one lever.
            </h2>
            <p className="mt-4 text-balance text-base text-white/50">
              move the sliders. the chart updates with your real path — and the gold line shows what an extra ₹5,000/month does to age 60.
            </p>
          </div>
        </AnimatedGroup>

        <AnimatedGroup variants={transitionVariants}>
          <div
            className="relative mx-auto mt-12 max-w-5xl rounded-3xl border border-white/10 p-6 md:p-10 backdrop-blur-md"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 60px -30px rgba(3,7,18,0.9)',
            }}
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-xl">
                <p className="text-xs uppercase tracking-[0.18em] text-white/30">your trajectory · live</p>
                <h3 className="mt-2 text-2xl md:text-[32px] font-semibold tracking-tight leading-tight">
                  at your current rate, you&apos;ll have{' '}
                  <span className="bg-gradient-to-b from-[#d5e1f2] to-[#6b88af] bg-clip-text text-transparent tabular-nums">
                    {compactINR(base.finalWealth)}
                  </span>{' '}
                  <span className="text-white/40 font-normal">by age {targetAge}.</span>
                </h3>
                <p className="mt-2 text-sm text-white/50 leading-relaxed">
                  invest <span className="text-white tabular-nums">₹5,000</span> more each month and that becomes{' '}
                  <span className="bg-gradient-to-b from-[#E9C77B] to-[#9C7E36] bg-clip-text text-transparent font-semibold tabular-nums">
                    {compactINR(boosted.finalWealth)}
                  </span>
                  <span className="text-white/30"> · {compactINR(boosted.finalWealth - base.finalWealth)} more, same effort</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setAge(p.age)
                      setSavings(p.savings)
                      setSip(p.sip)
                    }}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/60 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 h-[280px] sm:h-[320px] -mx-2">
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad-base" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B0C4DE" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#B0C4DE" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="grad-boost" x1="0" y1="0" x2="0" y2="1">
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
                    formatter={(v: unknown, key: unknown) => [compactINR(Number(v)), key === 'boosted' ? 'With +₹5k/mo' : 'Current rate'] as [string, string]}
                    labelFormatter={(l) => `Age ${l}`}
                    contentStyle={{
                      background: 'rgba(8,12,24,0.92)',
                      border: '1px solid rgba(176,196,222,0.2)',
                      borderRadius: 12,
                      backdropFilter: 'blur(10px)',
                    }}
                    labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                  />
                  <Area type="monotone" dataKey="boosted" stroke="#E9C77B" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#grad-boost)" />
                  <Area type="monotone" dataKey="base" stroke="#B0C4DE" strokeWidth={2.2} fill="url(#grad-base)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <Slider label="your age" min={20} max={50} value={age} onChange={setAge} suffix="yrs" />
              <Slider label="expected annual return" min={6} max={18} value={returnPct} onChange={setReturnPct} suffix="%" />
              <Slider label="current savings + investments" min={0} max={5_000_000} step={50_000} value={savings} onChange={setSavings} format={compactINR} />
              <Slider label="monthly investment (SIP)" min={0} max={2_00_000} step={1000} value={sip} onChange={setSip} format={compactINR} />
            </div>

            <div className="mt-6 flex items-center gap-4 text-[12px] text-white/40">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#B0C4DE] shadow-[0_0_8px_#B0C4DE]" />
                your current rate
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#E9C77B] shadow-[0_0_8px_#E9C77B]" />
                with +₹5,000/mo
              </span>
            </div>
          </div>
        </AnimatedGroup>
      </div>
    </section>
  )
}

function Slider({
  label,
  min,
  max,
  value,
  step = 1,
  onChange,
  suffix,
  format,
}: {
  label: string
  min: number
  max: number
  value: number
  step?: number
  onChange: (n: number) => void
  suffix?: string
  format?: (n: number) => string
}) {
  const pctVal = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-[12px] uppercase tracking-wider text-white/40">{label}</label>
        <span className="text-[13px] tabular-nums text-white">
          {format ? format(value) : value}
          {suffix ? <span className="text-white/40"> {suffix}</span> : null}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="kuber-slider mt-2 w-full"
        style={{
          background: `linear-gradient(90deg, #B0C4DE 0%, #d5e1f2 ${pctVal}%, rgba(176,196,222,0.10) ${pctVal}%)`,
        }}
      />
    </div>
  )
}
