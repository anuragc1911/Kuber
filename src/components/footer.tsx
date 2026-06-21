'use client'

import { motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { AtSign, Globe } from 'lucide-react'
import { KuberLogo } from '@/components/ui/kuber-logo'

type FooterLink = {
  title: string
  href: string
  external?: boolean
  icon?: React.ComponentType<{ className?: string }>
}

type FooterColumn = { label: string; links: FooterLink[] }

const columns: FooterColumn[] = [
  {
    label: 'product',
    links: [
      { title: 'trajectory', href: '#magic-moment' },
      { title: 'features', href: '#what-you-get' },
      { title: 'data sources', href: '#integrations' },
      { title: 'pricing', href: '#pricing' },
    ],
  },
  {
    label: 'company',
    links: [
      { title: 'about', href: '#' },
      { title: 'roadmap', href: 'https://github.com/users/anuragc1911/projects/2/views/1', external: true },
      { title: 'blog', href: '#' },
      { title: 'careers', href: '#' },
    ],
  },
  {
    label: 'trust',
    links: [
      { title: 'privacy', href: '#' },
      { title: 'security', href: '#' },
      { title: 'terms', href: '#' },
      { title: 'not financial advice', href: '#' },
    ],
  },
  {
    label: 'connect',
    links: [
      { title: 'twitter', href: '#', icon: AtSign },
      { title: 'linkedin', href: '#', icon: Globe },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center rounded-t-4xl border-t bg-[radial-gradient(35%_128px_at_50%_0%,rgba(176,196,222,0.08),transparent)] px-6 py-12 md:rounded-t-[3rem] lg:py-16">
      <div className="bg-white/20 absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur" />

      <div className="grid w-full gap-8 xl:grid-cols-3 xl:gap-8">
        <AnimatedContainer className="space-y-4">
          <Link href="/" aria-label="Kuber home" className="inline-block">
            <KuberLogo size="lg" />
          </Link>
          <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
            your AI wealth coach. see your future, understand the one lever, act on it. built on Claude.
          </p>
          <p className="text-muted-foreground/70 mt-8 text-xs md:mt-0">
            © {new Date().getFullYear()} Kuber. a coaching tool — not a registered financial advisor.
          </p>
        </AnimatedContainer>

        <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-2 xl:mt-0">
          {columns.map((section, index) => (
            <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
              <div className="mb-10 md:mb-0">
                <h3 className="text-xs uppercase tracking-wider text-foreground">{section.label}</h3>
                <ul className="text-muted-foreground mt-4 space-y-2 text-sm">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      <Link
                        href={link.href}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        className="hover:text-white inline-flex items-center transition-all duration-300"
                      >
                        {link.icon && <link.icon className="me-1.5 size-3.5" />}
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </footer>
  )
}

type ViewAnimationProps = {
  delay?: number
  className?: ComponentProps<typeof motion.div>['className']
  children: ReactNode
}

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className as string}>{children}</div>
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
