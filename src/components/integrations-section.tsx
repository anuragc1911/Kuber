'use client'

import { AnimatedGroup } from '@/components/ui/animated-group'
import { Button } from '@/components/ui/button'
import { GlowCard } from '@/components/ui/glow-card'
import { Shield, Database } from 'lucide-react'

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

const dataSourceGroups = [
    { category: 'manual entry', tools: 'a 2-minute setup. four numbers. that\'s the magic moment.' },
    { category: 'statement upload', tools: 'CSV or PDF from any bank, broker, or MF house. Kuber categorises everything.' },
    { category: 'email parsing', tools: 'opt-in. ICICI, HDFC, SBI, Axis transaction alerts auto-import in the background.' },
    { category: 'bank accounts', tools: 'read-only via Account Aggregator (Setu, Finvu) — RBI-regulated, consent-based.' },
    { category: 'investments', tools: 'mutual funds (CAMS, Karvy), stocks (Zerodha, Groww, Upstox), NPS, EPF.' },
    { category: 'liabilities', tools: 'home loan, education loan, credit-card balances — auto-amortised.' },
    { category: 'global (v2)', tools: 'Plaid for international users, multi-currency net worth.' },
]

const SOURCES_ROW1 = [
    { label: 'HDFC', initials: 'H' },
    { label: 'ICICI', initials: 'I' },
    { label: 'Axis', initials: 'A' },
    { label: 'Kotak', initials: 'K' },
    { label: 'SBI', initials: 'S' },
    { label: 'Yes', initials: 'Y' },
    { label: 'IDFC', initials: 'F' },
]

const SOURCES_ROW2 = [
    { label: 'Zerodha', initials: 'Z' },
    { label: 'Groww', initials: 'G' },
    { label: 'Upstox', initials: 'U' },
    { label: 'CAMS', initials: 'C' },
    { label: 'EPFO', initials: 'E' },
    { label: 'NPS', initials: 'N' },
    { label: 'Setu', initials: 'St' },
]

const repeatedSources = <T,>(items: T[], repeat = 4): T[] =>
    Array.from({ length: repeat }).flatMap(() => items)

export function IntegrationsSection() {
    return (
        <section id="integrations" className="relative overflow-hidden py-24 md:py-32">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px]"
            />

            <div className="relative mx-auto max-w-7xl px-6">
                <AnimatedGroup variants={transitionVariants}>
                    <div className="text-center">
                        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-sm text-foreground">
                            <Database className="size-3.5" />
                            data sources
                        </span>
                        <h1 className="text-balance text-4xl font-bold tracking-tight lg:text-6xl">
                            start with what you know. add as you go.
                        </h1>
                        <p className="mx-auto mt-4 max-w-xl text-lg text-white/50">
                            four numbers gets you the magic moment. statement uploads make it richer. bank connection comes when you&apos;re ready.
                        </p>
                        <Button
                            variant="default"
                            className="mt-8 rounded-lg bg-white px-6 py-3 font-medium text-black transition hover:bg-white/90">
                            See your trajectory
                        </Button>
                    </div>
                </AnimatedGroup>

                <div className="relative mt-12 overflow-hidden pb-2">
                    <div className="animate-scroll-left flex gap-10 whitespace-nowrap">
                        {repeatedSources(SOURCES_ROW1, 4).map((s, i) => (
                            <div
                                key={`r1-${i}`}
                                className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md"
                                title={s.label}
                            >
                                <span className="text-base font-semibold text-white/70">{s.initials}</span>
                            </div>
                        ))}
                    </div>

                    <div className="animate-scroll-right mt-6 flex gap-10 whitespace-nowrap">
                        {repeatedSources(SOURCES_ROW2, 4).map((s, i) => (
                            <div
                                key={`r2-${i}`}
                                className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md"
                                title={s.label}
                            >
                                <span className="text-base font-semibold text-white/70">{s.initials}</span>
                            </div>
                        ))}
                    </div>

                    <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-[#050608] to-transparent" />
                    <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[#050608] to-transparent" />
                </div>

                <AnimatedGroup
                    variants={{
                        container: {
                            visible: {
                                transition: { staggerChildren: 0.08, delayChildren: 0.3 },
                            },
                        },
                        ...transitionVariants,
                    }}
                    className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {dataSourceGroups.map((group) => (
                        <div
                            key={group.category}
                            className="rounded-2xl border bg-gradient-to-b from-muted/30 to-transparent p-6 transition-all duration-300 hover:border-white/10">
                            <p className="text-sm font-semibold tracking-wider uppercase text-foreground">
                                {group.category}
                            </p>
                            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                                {group.tools}
                            </p>
                        </div>
                    ))}
                </AnimatedGroup>

                <AnimatedGroup variants={transitionVariants}>
                    <div className="mt-12 space-y-6">
                        <p className="text-center text-lg font-medium">
                            read-only. consent-based. encrypted before it touches our database.
                        </p>
                        <p className="text-muted-foreground text-center text-sm">
                            your data, your call — export or delete in one tap.
                        </p>
                        <GlowCard
                            customSize
                            glowColor="silver"
                            className="mx-auto max-w-xl p-6">
                            <div className="flex items-start gap-3">
                                <Shield className="mt-0.5 size-5 shrink-0 text-[#B0C4DE]" />
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Account Aggregator (RBI-regulated) for bank links · SOC 2 in progress · we never sell your data, ever.
                                </p>
                            </div>
                        </GlowCard>
                    </div>
                </AnimatedGroup>
            </div>
        </section>
    )
}
