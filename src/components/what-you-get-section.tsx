'use client'

import { AnimatedGroup } from '@/components/ui/animated-group'
import { MagnifiedBento } from '@/components/ui/magnified-bento'

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

const FLOW_TAGS = [
    'Wealth Trajectory',
    'Net Worth',
    'Savings Rate',
    'FIRE Number',
    'Years to Retire',
    'SIP Boost',
    'Goal Pacing',
    'Tax Saving',
    'Asset Allocation',
    'Compounding Curve',
    'Emergency Fund',
    'Lifestyle Drift',
    'Monthly Surplus',
    'Real Returns',
    'Inflation Hedge',
]

const repeated = [...FLOW_TAGS, ...FLOW_TAGS, ...FLOW_TAGS]

export function WhatYouGetSection() {
    return (
        <section id="what-you-get" className="relative overflow-hidden bg-background py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
                    <AnimatedGroup variants={transitionVariants}>
                        <div className="max-w-xl">
                            <h2 className="text-balance text-4xl font-semibold md:text-5xl">
                                a coach that reads your numbers, not your spending.
                            </h2>
                            <div className="mt-8 space-y-6 text-lg text-muted-foreground leading-relaxed">
                                <p>
                                    <span className="kuber-serif">Kuber</span> takes your real income, savings, and investments — and turns them into a clear picture of where you&apos;re headed.
                                </p>
                                <p>
                                    daily trajectory that updates as you do. nudges when something drifts. answers to questions like &quot;when can I retire?&quot; — backed by exact math, not vibes.
                                </p>
                                <p className="text-foreground font-medium">
                                    built to grow your wealth, not just track your spend.
                                </p>
                            </div>
                        </div>
                    </AnimatedGroup>

                    <AnimatedGroup variants={transitionVariants}>
                        <div className="relative isolate min-h-[520px]">
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 -z-10 [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(to right, rgba(176, 196, 222, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(176, 196, 222, 0.12) 1px, transparent 1px)',
                                }}
                            />

                            <div
                                aria-hidden
                                className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                                style={{
                                    background:
                                        'radial-gradient(circle, rgba(176, 196, 222, 0.18) 0%, transparent 60%)',
                                    filter: 'blur(60px)',
                                }}
                            />

                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 flex -translate-y-1/2 flex-col gap-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_15%,black_85%,transparent_100%)]">
                                <div className="animate-scroll-left flex gap-3 whitespace-nowrap">
                                    {repeated.map((tag, i) => (
                                        <span
                                            key={`f1-${i}`}
                                            className="border-[#B0C4DE]/15 text-[#B0C4DE]/40 flex w-fit shrink-0 items-center rounded-full border bg-[#B0C4DE]/[0.03] px-3 py-2 text-xs">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="animate-scroll-right flex gap-3 whitespace-nowrap">
                                    {repeated.slice().reverse().map((tag, i) => (
                                        <span
                                            key={`f2-${i}`}
                                            className="border-[#B0C4DE]/15 text-[#B0C4DE]/40 flex w-fit shrink-0 items-center rounded-full border bg-[#B0C4DE]/[0.03] px-3 py-2 text-xs">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="animate-scroll-left flex gap-3 whitespace-nowrap">
                                    {repeated.map((tag, i) => (
                                        <span
                                            key={`f3-${i}`}
                                            className="border-[#B0C4DE]/15 text-[#B0C4DE]/40 flex w-fit shrink-0 items-center rounded-full border bg-[#B0C4DE]/[0.03] px-3 py-2 text-xs">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <MagnifiedBento />
                        </div>
                    </AnimatedGroup>
                </div>
            </div>
        </section>
    )
}
