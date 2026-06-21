'use client'

import { Briefcase, Code2, TrendingUp, Heart } from 'lucide-react'
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

const personas = [
    {
        icon: Briefcase,
        title: 'salaried professionals',
        description:
            'see where the next promotion actually lands you. compare a job offer vs your current path. find the SIP bump that buys an extra year of freedom.',
    },
    {
        icon: Code2,
        title: 'freelancers & consultants',
        description:
            'turn lumpy income into a clear trajectory. retirement and emergency planning when no one withholds for you. tax-aware nudges.',
    },
    {
        icon: TrendingUp,
        title: 'self-directed investors',
        description:
            'track real returns across MFs, stocks, FDs, gold, and real estate — one net-worth number. every "what if" answered in seconds.',
    },
    {
        icon: Heart,
        title: 'couples & families',
        description:
            'one shared trajectory. plan a home, a baby, a sabbatical — and see exactly when each becomes affordable without guesswork.',
    },
]

export function WhoItsForSection() {
    return (
        <section id="who-its-for" className="py-12 md:py-20">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <AnimatedGroup variants={transitionVariants}>
                    <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                        <h2 className="text-balance text-4xl font-medium lg:text-5xl">
                            built for everyone who manages their own money.
                        </h2>
                        <p className="text-muted-foreground">
                            <span className="kuber-serif">Kuber</span> works from your real numbers and adapts to your life — whether you have a salary, invoices, a portfolio, or a partner sharing the goal.
                        </p>
                    </div>
                </AnimatedGroup>

                <AnimatedGroup
                    variants={{
                        container: {
                            visible: {
                                transition: { staggerChildren: 0.1, delayChildren: 0.3 },
                            },
                        },
                        ...transitionVariants,
                    }}
                    className="relative mx-auto grid max-w-2xl overflow-hidden rounded-2xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:max-w-4xl lg:grid-cols-2">
                    {personas.map((persona) => {
                        const Icon = persona.icon
                        return (
                            <div key={persona.title} className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Icon className="size-4 text-[#B0C4DE]" />
                                    <h3 className="text-sm font-medium">{persona.title}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {persona.description}
                                </p>
                            </div>
                        )
                    })}
                </AnimatedGroup>
            </div>
        </section>
    )
}
