'use client'

import { AnimatedGroup } from '@/components/ui/animated-group'
import { TrendingUp, Clock, BarChart3, Zap } from 'lucide-react'

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

const stats = [
  { icon: TrendingUp, value: '₹38', suffix: 'L+', label: 'avg projected gain', sub: 'from one ₹5k SIP nudge' },
  { icon: Clock, value: '2', suffix: 'min', label: 'to your magic moment', sub: 'before any account login' },
  { icon: BarChart3, value: '4', suffix: 'yrs', label: 'earlier to FIRE', sub: 'for the median user' },
  { icon: Zap, value: '<5', suffix: 'sec', label: 'to answer any', sub: 'wealth question' },
]

export function WhyKuberSection() {
  return (
    <section id="why-kuber" className="relative overflow-hidden py-24 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[60vw] w-[60vw] max-h-[700px] max-w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(176, 196, 222, 0.06) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }}
      />
      <div className="mx-auto max-w-7xl px-6">
        <AnimatedGroup variants={transitionVariants}>
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/50 backdrop-blur-md">
              <span className="size-1 rounded-full bg-[#B0C4DE] shadow-[0_0_8px_#B0C4DE]" />
              why Kuber
            </div>
            <h2 className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-balance text-4xl font-semibold tracking-tight text-transparent md:text-5xl">
              the clarity wealthy people pay an advisor for — for the price of a coffee.
            </h2>
            <p className="mt-4 text-balance text-base text-white/50">
              good advisors are expensive, gatekept, and not built for someone managing their own money. <span className="kuber-serif">Kuber</span> is.
            </p>
          </div>
        </AnimatedGroup>

        <AnimatedGroup
          variants={{
            container: { visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } },
            ...transitionVariants,
          }}
          className="mt-20 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative bg-[#030303] p-8 transition-colors duration-300 hover:bg-white/[0.02]"
            >
              <div className="flex items-start justify-between">
                <stat.icon
                  className="size-4 text-white/30 transition-colors duration-300 group-hover:text-[#B0C4DE]"
                  strokeWidth={1.5}
                />
                <span className="size-1 translate-y-1.5 rounded-full bg-[#B0C4DE] opacity-0 shadow-[0_0_8px_#B0C4DE] transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <div className="mt-10 flex items-baseline gap-1">
                <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-5xl font-semibold tracking-tight text-transparent md:text-[3.5rem]">
                  {stat.value}
                </span>
                <span className="text-2xl font-medium text-white/30">{stat.suffix}</span>
              </div>
              <div className="mt-3 space-y-0.5">
                <p className="text-sm font-medium text-white/80">{stat.label}</p>
                <p className="text-xs text-white/30">{stat.sub}</p>
              </div>
            </div>
          ))}
        </AnimatedGroup>
      </div>
    </section>
  )
}
