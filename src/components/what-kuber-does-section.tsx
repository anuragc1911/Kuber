'use client'

import { AnimatedGroup } from '@/components/ui/animated-group'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'

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

const questions = [
    { q: 'when can I retire?', a: 'at this SIP, age 54. add ₹10k/month and that becomes 51.' },
    { q: 'will I have a crore by 35?', a: 'on current rate, ₹84 L. invest ₹4k more/month and you cross.' },
    { q: 'what if I take a 6-month sabbatical next year?', a: 'shifts your FIRE age by 7 months. still on track.' },
    { q: 'is my savings rate good for someone my age?', a: '34% — above median for 28-yr-olds. top quartile is 42%.' },
    { q: 'where is my money quietly leaking?', a: 'subscriptions and dining — ₹4,800/mo. plugging it adds ₹38 L by 60.' },
    { q: 'should I prepay my home loan or invest?', a: 'at 8.6% rate vs 12% expected return, invest. you keep ₹6.2 L net.' },
]

export function WhatKuberDoesSection() {
    return (
        <section id="what-kuber-does" className="bg-background py-24 md:py-32">
            <div className="mx-auto max-w-3xl px-6">
                <AnimatedGroup variants={transitionVariants}>
                    <div>
                        <h2 className="text-balance text-4xl font-semibold md:text-5xl">
                            ask <span className="kuber-serif">Kuber</span> anything.
                        </h2>
                        <p className="text-muted-foreground mt-4 text-base">
                            plain-language questions. specific, personal, numerically-correct answers — backed by your real numbers and exact calculators (never guessed math).
                        </p>
                    </div>
                </AnimatedGroup>

                <AnimatedGroup variants={transitionVariants}>
                    <Accordion type="single" collapsible className="mt-12 w-full">
                        {questions.map((item, idx) => (
                            <AccordionItem key={idx} value={`item-${idx}`}>
                                <AccordionTrigger className="text-base md:text-lg">
                                    {item.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                                    {item.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </AnimatedGroup>
            </div>
        </section>
    )
}
