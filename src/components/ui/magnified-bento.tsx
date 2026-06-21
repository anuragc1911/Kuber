'use client'

import React from 'react'
import {
    AlertTriangle,
    Telescope,
    Banknote,
    Flame,
    Plane,
    TrendingUp,
    PieChart,
    Repeat,
    Heart,
    IndianRupee,
    FileCheck,
    Receipt,
    BarChart3,
    Wallet,
    Users,
} from 'lucide-react'
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion'
import { cn } from '@/lib/utils'

type TagItem = {
    id: string
    icon: React.ComponentType<{ className?: string; size?: number | string }>
    label: string
}

const TAG_ROWS: TagItem[][] = [
    [
        { id: 'leaks', icon: AlertTriangle, label: 'Money Leaks' },
        { id: 'forecasts', icon: Telescope, label: 'Forecasts' },
        { id: 'cashflow', icon: Banknote, label: 'Cash Flow' },
        { id: 'burn', icon: Flame, label: 'Burn Rate' },
        { id: 'runway', icon: Plane, label: 'Runway' },
    ],
    [
        { id: 'growth', icon: TrendingUp, label: 'Revenue Growth' },
        { id: 'margin', icon: PieChart, label: 'Margin Analysis' },
        { id: 'cac', icon: Repeat, label: 'CAC Payback' },
        { id: 'ltv', icon: Heart, label: 'LTV' },
        { id: 'mrr', icon: IndianRupee, label: 'MRR / ARR' },
    ],
    [
        { id: 'gst', icon: FileCheck, label: 'GST Compliance' },
        { id: 'tax', icon: Receipt, label: 'Tax Liability' },
        { id: 'pnl', icon: BarChart3, label: 'P&L' },
        { id: 'expenses', icon: Wallet, label: 'Expense Tracking' },
        { id: 'cohorts', icon: Users, label: 'Cohort Analysis' },
    ],
]

const CONFIG = {
    title: 'every job a CFO does.',
    description:
        'Kuber tracks margins, runway, burn, taxes, cohorts, and leaks — automatically. drag the lens to explore.',
    containerHeight: 'h-[200px] sm:h-[240px]',
    lensSize: 92,
}

export function MagnifiedBento() {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const lensX = useMotionValue(0)
    const lensY = useMotionValue(0)

    const clipPath = useMotionTemplate`circle(30px at calc(50% + ${lensX}px - 10px) calc(50% + ${lensY}px - 10px))`
    const inverseMask = useMotionTemplate`radial-gradient(circle 30px at calc(50% + ${lensX}px - 10px) calc(50% + ${lensY}px - 10px), transparent 100%, black 100%)`

    return (
        <div className="not-prose flex w-full items-center justify-center p-4 sm:p-6">
            <div className="group relative w-full max-w-[420px] overflow-hidden rounded-[2rem] border bg-card p-1.5 shadow-2xl shadow-primary/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-primary/10 sm:rounded-[2.5rem] sm:p-2">
                <div
                    ref={containerRef}
                    className={cn(
                        'relative w-full overflow-hidden rounded-[1.6rem] bg-muted/30 sm:rounded-[2rem]',
                        CONFIG.containerHeight,
                    )}>
                    <div className="relative flex h-full w-full flex-col items-center justify-center">
                        {/* base layer */}
                        <motion.div
                            style={{ WebkitMaskImage: inverseMask, maskImage: inverseMask }}
                            className="flex h-full w-full flex-col justify-center gap-4">
                            {TAG_ROWS.map((row, rowIndex) => (
                                <motion.div
                                    key={`row-${rowIndex}`}
                                    className="flex w-max gap-4"
                                    animate={{
                                        x:
                                            rowIndex % 2 === 0
                                                ? ['0%', '-33.333%']
                                                : ['-33.333%', '0%'],
                                    }}
                                    transition={{
                                        duration: 25,
                                        ease: 'linear',
                                        repeat: Infinity,
                                    }}>
                                    {[...row, ...row, ...row].map((item, idx) => (
                                        <div
                                            key={`${item.id}-${idx}`}
                                            className="border-border/50 bg-background/50 flex w-fit items-center gap-2 whitespace-nowrap rounded-full border p-2 px-3 text-xs text-muted-foreground backdrop-blur-sm">
                                            <item.icon size={14} />
                                            <span>{item.label}</span>
                                        </div>
                                    ))}
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* reveal layer */}
                        <motion.div
                            className="pointer-events-none absolute inset-0 z-10 flex select-none flex-col justify-center gap-4"
                            style={{ clipPath }}>
                            {TAG_ROWS.map((row, rowIndex) => (
                                <motion.div
                                    key={`row-reveal-${rowIndex}`}
                                    className="flex w-max gap-4"
                                    animate={{
                                        x:
                                            rowIndex % 2 === 0
                                                ? ['0%', '-33.333%']
                                                : ['-33.333%', '0%'],
                                    }}
                                    transition={{
                                        duration: 25,
                                        ease: 'linear',
                                        repeat: Infinity,
                                    }}>
                                    {[...row, ...row, ...row].map((item, idx) => (
                                        <div
                                            key={`${item.id}-${idx}-reveal`}
                                            className="border-primary/20 bg-background ml-6 flex w-fit scale-125 items-center gap-2 whitespace-nowrap rounded-full border p-2 px-3 text-xs text-foreground shadow-sm">
                                            <item.icon size={14} className="text-primary" />
                                            <span className="font-medium text-primary">
                                                {item.label}
                                            </span>
                                        </div>
                                    ))}
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* lens */}
                        <motion.div
                            className="absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 cursor-grab drop-shadow-xl active:cursor-grabbing"
                            drag
                            dragMomentum={false}
                            dragConstraints={containerRef}
                            style={{ x: lensX, y: lensY }}>
                            <div className="relative">
                                <MagnifyingLens size={CONFIG.lensSize} />
                                <div className="pointer-events-none absolute left-[6px] top-[6px] h-[60px] w-[60px] rounded-full bg-white/10" />
                            </div>
                        </motion.div>
                    </div>

                    <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-20 w-1/4 bg-gradient-to-r to-transparent" />
                    <div className="from-background pointer-events-none absolute inset-y-0 right-0 z-20 w-1/4 bg-gradient-to-l to-transparent" />
                </div>

                <div className="p-4 px-4 pb-6 sm:p-6 sm:pb-8">
                    <h3 className="text-xl font-medium tracking-tight text-foreground">
                        {CONFIG.title}
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                        {CONFIG.description}
                    </p>
                </div>
            </div>
        </div>
    )
}

const MagnifyingLens = ({ size = 92 }: { size?: number }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
                d="M365.424 335.392L342.24 312.192L311.68 342.736L334.88 365.936L365.424 335.392Z"
                fill="#B0BDC6"
            />
            <path
                d="M358.08 342.736L334.88 319.552L319.04 335.392L342.24 358.584L358.08 342.736Z"
                fill="#DFE9EF"
            />
            <path
                d="M352.368 321.808L342.752 312.192L312.208 342.752L321.824 352.36L352.368 321.808Z"
                fill="#B0BDC6"
            />
            <path
                d="M332 332C260 404 142.4 404 69.6001 332C-2.3999 260 -2.3999 142.4 69.6001 69.6C141.6 -3.20003 259.2 -2.40002 332 69.6C404.8 142.4 404.8 260 332 332ZM315.2 87.2C252 24 150.4 24 88.0001 87.2C24.8001 150.4 24.8001 252 88.0001 314.4C151.2 377.6 252.8 377.6 315.2 314.4C377.6 252 377.6 150.4 315.2 87.2Z"
                fill="#DFE9EF"
            />
            <path
                d="M319.2 319.2C254.4 384 148.8 384 83.2001 319.2C18.4001 254.4 18.4001 148.8 83.2001 83.2C148 18.4 253.6 18.4 319.2 83.2C384 148.8 384 254.4 319.2 319.2ZM310.4 92C250.4 32 152 32 92.0001 92C32.0001 152 32.0001 250.4 92.0001 310.4C152 370.4 250.4 370.4 310.4 310.4C370.4 250.4 370.4 152 310.4 92Z"
                fill="#7A858C"
            />
            <path
                d="M484.104 428.784L373.8 318.472L318.36 373.912L428.672 484.216L484.104 428.784Z"
                fill="#333333"
            />
            <path
                d="M471.664 441.224L361.344 330.928L330.8 361.48L441.12 471.76L471.664 441.224Z"
                fill="#575B5E"
            />
            <path
                d="M495.2 423.2C504 432 432.8 504 423.2 495.2L417.6 489.6C408.8 480.8 480 408.8 489.6 417.6L495.2 423.2Z"
                fill="#B0BDC6"
            />
            <path
                d="M483.2 435.2C492 444 444.8 492 435.2 483.2L429.6 477.6C420.8 468.8 468 420.8 477.6 429.6L483.2 435.2Z"
                fill="#DFE9EF"
            />
        </svg>
    )
}
