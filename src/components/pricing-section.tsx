'use client'

import Link from 'next/link'
import { Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { BorderBeam } from '@/components/ui/border-beam'
import { cn } from '@/lib/utils'

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

const plans = [
    {
        name: 'free',
        price: '₹0',
        period: 'forever',
        description: 'feel the magic moment. start tracking.',
        features: [
            'wealth trajectory + the one lever',
            'basic net-worth tracking',
            'one savings goal',
            'limited chat (20 messages/month)',
        ],
        cta: 'get early access',
        highlighted: false,
    },
    {
        name: 'Pro',
        price: '₹299',
        period: '/month',
        description: 'the serious wealth-builder\'s plan.',
        features: [
            'everything in Free',
            'unlimited Kuber Chat & what-ifs',
            'unlimited goals',
            'monthly AI check-in',
            'statement upload (CSV/PDF)',
            'email-statement parsing',
        ],
        cta: 'start with Pro',
        highlighted: true,
    },
    {
        name: 'Pro + Connect',
        price: '₹599',
        period: '/month',
        description: 'set it up once. never log in to update.',
        features: [
            'everything in Pro',
            'bank connection via Account Aggregator',
            'auto-sync transactions & holdings',
            'advanced projection models',
            'priority support',
        ],
        cta: 'join the v2 waitlist',
        highlighted: false,
    },
]

export function PricingSection() {
    return (
        <section id="pricing" className="relative overflow-hidden bg-black py-24 md:py-32">
            <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsla(0,0%,85%,.06)_0,transparent_50%)]"
            />
            <div className="mx-auto max-w-7xl px-6">
                <AnimatedGroup variants={transitionVariants}>
                    <div className="text-center">
                        <h2 className="text-balance text-4xl font-semibold md:text-5xl">
                            free to feel the magic.
                        </h2>
                        <p className="text-muted-foreground mt-4 text-lg">
                            pay for depth and automation. cancel anytime.
                        </p>
                    </div>
                </AnimatedGroup>

                <AnimatedGroup
                    variants={{
                        container: {
                            visible: {
                                transition: { staggerChildren: 0.15, delayChildren: 0.3 },
                            },
                        },
                        ...transitionVariants,
                    }}
                    className="mt-16 grid gap-6 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={cn(
                                'relative flex flex-col rounded-2xl border p-8 transition-all duration-300',
                                plan.highlighted
                                    ? 'border-white/20 bg-gradient-to-b from-foreground/[0.08] to-transparent shadow-lg shadow-zinc-950/10 dark:shadow-zinc-950/30'
                                    : 'bg-gradient-to-b from-muted/30 to-transparent hover:border-white/10'
                            )}>
                            {plan.highlighted && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-[#B0C4DE] rounded-full px-4 py-1 text-xs font-semibold text-foreground">
                                        Most popular
                                    </span>
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-semibold">{plan.name}</h3>
                                <div className="mt-4 flex items-baseline gap-1">
                                    <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                                </div>
                                <p className="text-muted-foreground mt-2 text-sm">{plan.description}</p>
                            </div>
                            <ul className="mt-8 flex-1 space-y-3">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm">
                                        <Check className="text-foreground mt-0.5 size-4 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8">
                                <div className={cn(
                                    plan.highlighted && 'bg-white/10 rounded-[14px] border p-0.5'
                                )}>
                                    <Button
                                        asChild
                                        size="lg"
                                        variant={plan.highlighted ? 'default' : 'outline'}
                                        className="w-full rounded-xl">
                                        <Link href="#">{plan.cta} &rarr;</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </AnimatedGroup>

                <AnimatedGroup variants={transitionVariants}>
                    <div className="mx-auto mt-12 max-w-2xl">
                        <div className="relative overflow-hidden rounded-2xl border border-[#B0C4DE]/30 bg-gradient-to-b from-[#B0C4DE]/10 to-transparent p-8 md:p-10">
                            <BorderBeam
                                lightWidth={320}
                                duration={8}
                                borderWidth={1.5}
                                gradient="radial-gradient(ellipse at center, #d5e1f2 0%, #B0C4DE 25%, #6b88af 55%, transparent 75%)"
                            />
                            <div className="absolute right-4 top-4">
                                <Star className="size-5 text-[#B0C4DE]" />
                            </div>
                            <h3 className="text-xl font-semibold">founding 100</h3>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-4xl font-bold tracking-tight">₹4,999</span>
                                <span className="text-muted-foreground text-sm">one-time · lifetime Pro</span>
                            </div>
                            <p className="text-muted-foreground mt-2 text-sm">
                                pay once. use forever. you help shape the magic moment with the team.
                            </p>
                            <p className="mt-4 text-sm">
                                effectively <span className="font-semibold">₹83/month</span> if you use it for 5 years — locked.
                            </p>
                            <p className="text-muted-foreground mt-1 text-sm">
                                limited to the first 100 users.
                            </p>
                            <div className="mt-6">
                                <div className="bg-white/10 rounded-[14px] border p-0.5 w-fit">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="rounded-xl px-6">
                                        <Link href="#">claim founding access &rarr;</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimatedGroup>

                <AnimatedGroup variants={transitionVariants}>
                    <p className="text-muted-foreground mx-auto mt-8 max-w-xl text-center text-sm">
                        pricing is indicative — being validated with real users. you&apos;ll never be charged without a clear yes.
                    </p>
                </AnimatedGroup>
            </div>
        </section>
    )
}
