'use client'

import { cn } from '@/lib/utils'
import React from 'react'

type FeatureType = {
    title: string
    subtitle?: string
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    description: string
    outcome?: string
}

type FeatureCardProps = React.ComponentProps<'div'> & {
    feature: FeatureType
}

export function FeatureCard({ feature, className, ...props }: FeatureCardProps) {
    const [pattern, setPattern] = React.useState<number[][] | null>(null)

    React.useEffect(() => {
        setPattern(genRandomPattern())
    }, [])

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl border bg-gradient-to-b from-muted/50 to-transparent p-8 md:p-10 transition-all duration-300 hover:border-white/10 hover:shadow-lg hover:shadow-zinc-950/5 dark:hover:shadow-zinc-950/20',
                className,
            )}
            {...props}>
            <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
                <div className="from-foreground/5 to-foreground/1 absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] opacity-100">
                    {pattern && (
                        <GridPattern
                            width={20}
                            height={20}
                            x="-12"
                            y="4"
                            squares={pattern}
                            className="fill-foreground/5 stroke-foreground/25 absolute inset-0 h-full w-full mix-blend-overlay"
                        />
                    )}
                </div>
            </div>

            <div className="relative z-10">
                <feature.icon className="text-foreground/75 size-6" strokeWidth={1} aria-hidden />
                <h3 className="mt-8 text-2xl font-semibold">{feature.title}</h3>
                {feature.subtitle && (
                    <p className="text-muted-foreground mt-1 text-base italic">{feature.subtitle}</p>
                )}
                <p className="text-muted-foreground mt-4 text-[15px] leading-relaxed">
                    {feature.description}
                </p>
                {feature.outcome && (
                    <p className="mt-6 text-sm font-medium">
                        <span className="text-muted-foreground">&rarr; </span>
                        {feature.outcome}
                    </p>
                )}
            </div>
        </div>
    )
}

function GridPattern({
    width,
    height,
    x,
    y,
    squares,
    ...props
}: React.ComponentProps<'svg'> & {
    width: number
    height: number
    x: string
    y: string
    squares?: number[][]
}) {
    const patternId = React.useId()

    return (
        <svg aria-hidden="true" {...props}>
            <defs>
                <pattern id={patternId} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
                    <path d={`M.5 ${height}V.5H${width}`} fill="none" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
            {squares && (
                <svg x={x} y={y} className="overflow-visible">
                    {squares.map(([sx, sy], index) => (
                        <rect
                            strokeWidth="0"
                            key={index}
                            width={width + 1}
                            height={height + 1}
                            x={sx * width}
                            y={sy * height}
                        />
                    ))}
                </svg>
            )}
        </svg>
    )
}

function genRandomPattern(length?: number): number[][] {
    length = length ?? 5
    return Array.from({ length }, () => [
        Math.floor(Math.random() * 4) + 7,
        Math.floor(Math.random() * 6) + 1,
    ])
}
