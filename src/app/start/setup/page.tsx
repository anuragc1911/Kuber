'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft } from 'lucide-react'
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
      transition: { type: 'spring' as const, bounce: 0.3, duration: 1.2 },
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
    hint: 'compound time is your biggest lever.',
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
    hint: 'bank, FDs, MFs, stocks, EPF, gold — all of it.',
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
    hint: 'SIPs, NPS, EPF — anything headed toward your future.',
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
    inputRef.current?.focus({ preventScroll: true })
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
    <section className="relative flex min-h-[calc(100vh-3.5rem)] flex-col justify-between py-6 pb-8">
      <div>
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-white/40">
          <button
            onClick={back}
            className="inline-flex items-center gap-1.5 min-h-[40px] hover:text-white transition active:scale-95"
            aria-label="back"
          >
            <ArrowLeft className="size-3.5" />
            back
          </button>
          <span className="tabular-nums">
            {step + 1} <span className="text-white/20">/</span> {STEPS.length}
          </span>
        </div>

        <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#B0C4DE] to-[#d5e1f2] transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <AnimatedGroup key={step} variants={transitionVariants}>
          <div className="mt-8 text-[11px] uppercase tracking-[0.18em] text-[#B0C4DE]/70">
            question {step + 1}
          </div>
          <h1 className="mt-2 text-[clamp(1.625rem,6vw,2.125rem)] font-semibold tracking-tight leading-[1.15]">
            {cur.prompt}
          </h1>
          {cur.hint && (
            <p className="mt-2.5 text-[13px] text-white/45 leading-relaxed">{cur.hint}</p>
          )}

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wider text-white/35">your answer</div>
              <div className="mt-2 text-[clamp(2rem,9vw,2.75rem)] font-semibold tracking-tight tabular-nums leading-none">
                {display}
                {cur.suffix ? <span className="ml-2 text-base text-white/40 align-middle">{cur.suffix}</span> : null}
              </div>
            </div>
            <input
              ref={inputRef}
              type="range"
              min={cur.min}
              max={cur.max}
              step={cur.step}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="kuber-slider mt-6 w-full"
              style={{
                background: `linear-gradient(90deg, #B0C4DE 0%, #d5e1f2 ${pctVal}%, rgba(176,196,222,0.10) ${pctVal}%)`,
              }}
            />
            {cur.quickHints && (
              <div className="mt-5 grid grid-cols-4 gap-1.5">
                {cur.quickHints.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => setValue(q.value)}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-2 py-2.5 text-[12px] text-white/60 active:scale-95 active:bg-white/[0.08] transition"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </AnimatedGroup>
      </div>

      <div className="mt-8 sticky bottom-4">
        <button
          onClick={next}
          className="flex w-full min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-white text-[15px] font-medium text-black shadow-[0_24px_48px_rgba(255,255,255,0.06)] active:scale-[0.99] transition-all"
        >
          {step < STEPS.length - 1 ? 'next' : 'show my trajectory'}
          <ArrowRight className="size-4" />
        </button>
      </div>
    </section>
  )
}
