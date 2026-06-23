'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { DEFAULT_PROFILE, writeProfile } from '@/lib/wealth-store'
import type { WealthProfile } from '@/lib/projection'
import { compactINR } from '@/lib/projection'

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

type StepDef = {
  key: keyof WealthProfile
  prompt: string
  hint?: string
  min: number
  max: number
  step: number
  suffix?: string
  format?: (n: number) => string
  quickHints?: { label: string; value: number }[]
}

const STEPS: StepDef[] = [
  {
    key: 'currentAge',
    prompt: 'how old are you?',
    hint: 'compound time is your biggest lever — even one year matters.',
    min: 18,
    max: 65,
    step: 1,
    suffix: 'yrs',
    quickHints: [
      { label: '25', value: 25 },
      { label: '30', value: 30 },
      { label: '35', value: 35 },
      { label: '40', value: 40 },
    ],
  },
  {
    key: 'monthlyIncome',
    prompt: 'what do you take home each month?',
    hint: 'after tax. used to size your savings rate.',
    min: 10_000,
    max: 10_00_000,
    step: 5_000,
    format: compactINR,
    quickHints: [
      { label: '₹50k', value: 50_000 },
      { label: '₹1L', value: 1_00_000 },
      { label: '₹2L', value: 2_00_000 },
      { label: '₹5L', value: 5_00_000 },
    ],
  },
  {
    key: 'currentSavings',
    prompt: 'savings + investments today.',
    hint: 'bank, FDs, MFs, stocks, EPF, gold — all of it. your best estimate is fine.',
    min: 0,
    max: 5_00_00_000,
    step: 50_000,
    format: compactINR,
    quickHints: [
      { label: '₹2L', value: 2_00_000 },
      { label: '₹10L', value: 10_00_000 },
      { label: '₹50L', value: 50_00_000 },
      { label: '₹2 Cr', value: 2_00_00_000 },
    ],
  },
  {
    key: 'monthlyInvestment',
    prompt: 'how much do you invest each month?',
    hint: 'SIPs, NPS, EPF, recurring deposits — anything that\'s headed toward your future.',
    min: 0,
    max: 5_00_000,
    step: 1_000,
    format: compactINR,
    quickHints: [
      { label: '₹10k', value: 10_000 },
      { label: '₹25k', value: 25_000 },
      { label: '₹50k', value: 50_000 },
      { label: '₹1L', value: 1_00_000 },
    ],
  },
]

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<WealthProfile>(DEFAULT_PROFILE)
  const cur = STEPS[step]
  const value = profile[cur.key]
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [step])

  function setValue(n: number) {
    const clamped = Math.max(cur.min, Math.min(cur.max, n))
    setProfile((p) => ({ ...p, [cur.key]: clamped }))
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      writeProfile(profile)
      router.push('/start/trajectory')
    }
  }

  function back() {
    if (step === 0) router.push('/start')
    else setStep((s) => s - 1)
  }

  const pctVal = ((value - cur.min) / (cur.max - cur.min)) * 100
  const display = cur.format ? cur.format(value) : value.toString()

  return (
    <section className="relative px-6 py-12 md:py-20">
      <div className="mx-auto max-w-xl">
        <div className="mb-10 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-white/40">
          <button
            onClick={back}
            className="hover:text-white transition"
          >
            ← back
          </button>
          <span>
            step {step + 1} <span className="text-white/20">/</span> {STEPS.length}
          </span>
        </div>

        <div className="mb-8 h-px w-full bg-white/[0.05] overflow-hidden rounded-full">
          <div
            className="h-full bg-gradient-to-r from-[#B0C4DE] to-[#d5e1f2] transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <AnimatedGroup key={step} variants={transitionVariants}>
          <div className="text-[12px] uppercase tracking-[0.18em] text-[#B0C4DE]/70">
            question {step + 1} of {STEPS.length}
          </div>
          <h1 className="mt-3 text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-tight leading-[1.1]">
            {cur.prompt}
          </h1>
          {cur.hint && (
            <p className="mt-3 text-sm text-white/45 leading-relaxed">{cur.hint}</p>
          )}

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] uppercase tracking-wider text-white/40">your answer</span>
              <span className="text-3xl font-semibold tracking-tight tabular-nums">
                {display}
                {cur.suffix ? <span className="ml-1 text-base text-white/40">{cur.suffix}</span> : null}
              </span>
            </div>
            <input
              ref={inputRef}
              type="range"
              min={cur.min}
              max={cur.max}
              step={cur.step}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="kuber-slider mt-5 w-full"
              style={{
                background: `linear-gradient(90deg, #B0C4DE 0%, #d5e1f2 ${pctVal}%, rgba(176,196,222,0.10) ${pctVal}%)`,
              }}
            />
            {cur.quickHints && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {cur.quickHints.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => setValue(q.value)}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/55 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={next}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white px-7 py-3.5 text-[15px] font-medium text-black shadow-[0_24px_48px_rgba(0,0,0,0.4)] transition-all duration-200 hover:bg-white/90 sm:w-auto"
          >
            {step < STEPS.length - 1 ? 'next' : 'show me my trajectory'}
            <ArrowRight className="size-4" />
          </button>
        </AnimatedGroup>
      </div>
    </section>
  )
}
