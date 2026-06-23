'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'

const transitionVariants = {
    item: {
        hidden: { opacity: 0, filter: 'blur(12px)', y: 12 },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: { type: 'spring' as const, bounce: 0.3, duration: 1.5 },
        },
    },
}

export function CTASection() {
    return (
        <section className="py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6">
                <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-b from-muted/50 to-transparent p-12 md:p-20">
                    <div
                        aria-hidden
                        className="absolute inset-0 -z-10">
                        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,hsla(214,40%,75%,.18)_0,transparent_70%)]" />
                        <div className="absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 translate-x-1/4 rounded-full bg-[radial-gradient(ellipse_at_center,hsla(40,60%,65%,.08)_0,transparent_70%)]" />
                    </div>
                    <AnimatedGroup variants={transitionVariants}>
                        <div className="text-center">
                            <h2 className="text-balance text-4xl font-semibold md:text-5xl">
                                see your future. then change it.
                            </h2>
                            <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-balance text-lg">
                                two minutes. no bank login. no card. just your numbers and the lever that matters.
                            </p>
                        </div>
                        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <div className="bg-white/10 rounded-[14px] border p-0.5">
                                <Button
                                    asChild
                                    size="lg"
                                    className="rounded-xl px-6 text-base">
                                    <Link href="#magic-moment">
                                        <span>see your trajectory</span>
                                        <ArrowRight className="ml-2 size-4" />
                                    </Link>
                                </Button>
                            </div>
                            <Button
                                asChild
                                size="lg"
                                variant="ghost"
                                className="rounded-xl px-6 text-base">
                                <Link href="#what-kuber-does">
                                    <span>ask Kuber a question</span>
                                </Link>
                            </Button>
                        </div>
                    </AnimatedGroup>
                </div>
            </div>
        </section>
    )
}
