'use client'

import React from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { KuberLogo } from '@/components/ui/kuber-logo'
import { cn } from '@/lib/utils'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main className="relative overflow-hidden">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-[20vh] -right-[10vw] h-[80vw] w-[80vw] max-h-[1000px] max-w-[1000px] rounded-full opacity-100"
                    style={{
                        background:
                            'radial-gradient(circle, rgba(176, 196, 222, 0.12) 0%, transparent 60%)',
                        filter: 'blur(100px)',
                    }}
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-[20vh] -left-[10vw] h-[60vw] w-[60vw] max-h-[800px] max-w-[800px] rounded-full"
                    style={{
                        background:
                            'radial-gradient(circle, rgba(100, 150, 255, 0.05) 0%, transparent 60%)',
                        filter: 'blur(80px)',
                    }}
                />

                <section className="pointer-events-none relative z-30">
                    <div className="relative flex min-h-[100vh] items-center justify-center pt-32 pb-20 md:pt-40">
                        <div className="pointer-events-auto mx-auto max-w-[880px] px-6 text-center flex flex-col items-center">
                            <AnimatedGroup variants={transitionVariants}>
                                <div className="mb-8 inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-black/80 px-4 py-2 text-sm font-medium tracking-wide text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-md">
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="size-3.5 fill-none stroke-current stroke-2"
                                        aria-hidden>
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                    <span>your AI wealth coach</span>
                                </div>

                                <h1 className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-[clamp(3rem,6vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-transparent">
                                    see your future wealth — and the one move <span className="kuber-serif">Kuber</span> says will change it.
                                </h1>

                                <h2 className="mt-4 mb-8 text-[clamp(1.25rem,3vw,1.75rem)] font-normal tracking-[-0.01em] text-white/50">
                                    in two minutes. without a spreadsheet, advisor, or guessing.
                                </h2>

                                <p className="mx-auto mb-12 max-w-[680px] text-lg leading-[1.6] font-normal text-white/50">
                                    an AI coach that turns your real numbers into a clear picture of where you&apos;re headed. when you&apos;ll be wealthy, when you can retire, and the single highest-impact change you can make — in plain language, backed by exact math.
                                </p>

                                <div className="mb-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 text-[15px] text-white/30">
                                    <div className="flex items-center gap-2">
                                        <span className="size-1 rounded-full bg-[#B0C4DE] shadow-[0_0_8px_#B0C4DE]" />
                                        no spreadsheet to keep alive.
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="size-1 rounded-full bg-[#B0C4DE] shadow-[0_0_8px_#B0C4DE]" />
                                        no advisor to chase.
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="size-1 rounded-full bg-[#B0C4DE] shadow-[0_0_8px_#B0C4DE]" />
                                        no bank login to start.
                                    </div>
                                </div>
                            </AnimatedGroup>

                            <AnimatedGroup
                                variants={{
                                    container: {
                                        visible: {
                                            transition: {
                                                staggerChildren: 0.05,
                                                delayChildren: 0.5,
                                            },
                                        },
                                    },
                                    ...transitionVariants,
                                }}>
                                <div
                                    className="inline-flex items-center rounded-full border border-white/10 p-1.5 backdrop-blur-[40px] backdrop-saturate-150"
                                    style={{
                                        background: 'rgba(18, 18, 20, 0.65)',
                                        boxShadow:
                                            'inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -1px 1px rgba(0,0,0,0.5), 0 24px 48px rgba(0,0,0,0.6), inset 40px 0 60px rgba(100,150,255,0.03), inset -40px 0 60px rgba(176, 196, 222,0.03)',
                                    }}>
                                    <Link
                                        href="/app"
                                        className="group/btn flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-7 py-3.5 text-[15px] font-medium text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-200 hover:border-white/10 hover:bg-black/30">
                                        <span>see your trajectory</span>
                                        <span className="transition-transform duration-200 group-hover/btn:translate-x-1">→</span>
                                    </Link>
                                    <div
                                        aria-hidden
                                        className="mx-1 h-6 w-px"
                                        style={{
                                            background:
                                                'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                                        }}
                                    />
                                    <Link
                                        href="#magic-moment"
                                        className="group/btn flex items-center gap-2 rounded-full border border-transparent px-7 py-3.5 text-[15px] font-medium text-white/50 transition-all duration-200 hover:bg-white/[0.03] hover:text-white">
                                        <span>try it now</span>
                                        <span className="transition-transform duration-200 group-hover/btn:translate-x-1">→</span>
                                    </Link>
                                </div>
                            </AnimatedGroup>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}

const menuItems = [
    { name: 'How it works', href: '#magic-moment' },
    { name: 'Product', href: '#what-you-get' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'For you', href: '#who-its-for' },
]

const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-2 group">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2">
                                <KuberLogo />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-white/10 bg-black/60 backdrop-blur-2xl backdrop-saturate-150 p-6 shadow-[0_24px_64px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-0">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:items-center sm:gap-3 sm:space-y-0 md:w-fit">
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className={cn(isScrolled && 'lg:hidden')}>
                                    <Link href="/app">
                                        <span>Login</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className={cn(isScrolled && 'lg:hidden')}>
                                    <Link href="/app">
                                        <span>Get early access</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}>
                                    <Link href="/app">
                                        <span>See trajectory</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
