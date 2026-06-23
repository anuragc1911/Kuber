'use client'

import Link from 'next/link'
import { Lock, Sparkles, Timer, ArrowRight } from 'lucide-react'
import { AnimatedGroup } from '@/components/ui/animated-group'

const transitionVariants = {
  item: {
    hidden: { opacity: 0, filter: 'blur(12px)', y: 12 },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: { type: 'spring', bounce: 0.3, duration: 1.2 },
    },
  },
}

const PROMISES = [
  { icon: Timer, label: 'two minutes', sub: 'four quick questions' },
  { icon: Lock, label: 'no account', sub: 'no signup wall to start' },
  { icon: Sparkles, label: 'your numbers', sub: 'not a generic chart' },
]

export default function StartPage() {
  return (
    <section className="relative flex min-h-[calc(100vh-3.5rem)] flex-col justify-between py-10 pb-8">
      <div className="pt-6">
        <AnimatedGroup variants={transitionVariants}>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/55">
            <span className="size-1 rounded-full bg-[#B0C4DE] shadow-[0_0_8px_#B0C4DE]" />
            magic moment
          </div>

          <h1 className="mt-6 bg-gradient-to-b from-white to-white/70 bg-clip-text text-[clamp(2rem,8vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-transparent">
            see your future wealth — in two minutes.
          </h1>

          <p className="mt-4 text-[15px] leading-[1.55] text-white/55">
            tell <span className="kuber-serif">Kuber</span> four things about your money. it&apos;ll show you where you&apos;re headed at this rate — and the single change that moves the line the most.
          </p>
        </AnimatedGroup>

        <AnimatedGroup
          variants={{
            container: { visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } } },
            ...transitionVariants,
          }}
        >
          <div className="mt-8 space-y-2.5">
            {PROMISES.map((p) => {
              const Icon = p.icon
              return (
                <div
                  key={p.label}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                >
                  <div className="size-9 rounded-xl flex items-center justify-center bg-[#B0C4DE]/10 border border-[#B0C4DE]/15">
                    <Icon className="size-4 text-[#B0C4DE]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white">{p.label}</div>
                    <div className="text-[12px] text-white/40">{p.sub}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </AnimatedGroup>
      </div>

      <AnimatedGroup variants={transitionVariants}>
        <div className="mt-8 space-y-3">
          <Link
            href="/start/setup"
            className="flex w-full min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-white text-[15px] font-medium text-black shadow-[0_24px_48px_rgba(255,255,255,0.06)] active:scale-[0.99] transition-all"
          >
            start
            <ArrowRight className="size-4" />
          </Link>
          <p className="text-center text-[11px] text-white/30 leading-relaxed">
            inputs stay on your device until you save them.
            <br />
            Kuber is a coaching tool, not a registered financial advisor.
          </p>
        </div>
      </AnimatedGroup>
    </section>
  )
}
