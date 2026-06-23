'use client'

import Link from 'next/link'
import { Lock, Sparkles, Timer } from 'lucide-react'
import { AnimatedGroup } from '@/components/ui/animated-group'

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

const PROMISES = [
  { icon: Timer, label: 'two minutes', sub: 'four quick questions' },
  { icon: Lock, label: 'no account', sub: 'no signup wall to start' },
  { icon: Sparkles, label: 'your real numbers', sub: 'your trajectory, not a generic chart' },
]

export default function StartPage() {
  return (
    <section className="relative flex min-h-[calc(100vh-7rem)] items-center justify-center px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <AnimatedGroup variants={transitionVariants}>
          <div className="mb-8 inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-black/80 px-4 py-2 text-sm font-medium tracking-wide text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-[#B0C4DE] shadow-[0_0_8px_#B0C4DE]" />
            your magic moment
          </div>

          <h1 className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-[clamp(2.5rem,6vw,4.25rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-transparent">
            see your future wealth in two minutes.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-[1.6] text-white/55">
            tell <span className="kuber-serif">Kuber</span> four things about your money. it&apos;ll show you where you&apos;re headed at this rate — and the single change that moves the line the most.
          </p>
        </AnimatedGroup>

        <AnimatedGroup
          variants={{
            container: { visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } } },
            ...transitionVariants,
          }}
        >
          <div className="mt-10">
            <Link
              href="/start/setup"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-7 py-3.5 text-[15px] font-medium text-black shadow-[0_24px_48px_rgba(0,0,0,0.4)] transition-all duration-200 hover:bg-white/90"
            >
              start
              <span className="transition-transform duration-200">→</span>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 max-w-xl mx-auto">
            {PROMISES.map((p) => {
              const Icon = p.icon
              return (
                <div
                  key={p.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left"
                >
                  <Icon className="size-4 text-[#B0C4DE]" />
                  <div className="mt-3 text-sm text-white">{p.label}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">{p.sub}</div>
                </div>
              )
            })}
          </div>

          <p className="mt-10 text-[11px] text-white/30">
            we don&apos;t store anything until you say so. your inputs stay on your device.
          </p>
        </AnimatedGroup>
      </div>
    </section>
  )
}
