'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageSquare, Target, Wallet, User } from 'lucide-react'
import { cn } from '@/lib/utils'

type IconType = React.ComponentType<{ className?: string }>

const TABS: { href: string; label: string; icon: IconType; soon?: boolean }[] = [
  { href: '/app', label: 'home', icon: Home },
  { href: '/app/chat', label: 'chat', icon: MessageSquare },
  { href: '/app/goals', label: 'goals', icon: Target, soon: true },
  { href: '/app/money', label: 'money', icon: Wallet, soon: true },
  { href: '/app/profile', label: 'profile', icon: User, soon: true },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="primary"
      className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto max-w-md px-3 pb-2">
        <div className="rounded-2xl border border-white/10 bg-black/85 backdrop-blur-2xl shadow-[0_-12px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.04)_inset]">
          <ul className="flex items-stretch justify-between px-1">
            {TABS.map((t) => {
              const Icon = t.icon
              const active =
                !t.soon &&
                (pathname === t.href ||
                  (t.href !== '/app' && pathname.startsWith(t.href)))
              const Comp: React.ElementType = t.soon ? 'div' : Link
              return (
                <li key={t.href} className="flex-1">
                  <Comp
                    {...(t.soon ? {} : { href: t.href })}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 min-h-[56px] py-2 rounded-xl transition-colors',
                      t.soon
                        ? 'text-white/20 cursor-not-allowed'
                        : active
                          ? 'text-white'
                          : 'text-white/45 active:bg-white/[0.04] hover:text-white/80',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <div className="relative">
                      <Icon className="size-5" />
                      {active && (
                        <span
                          aria-hidden
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-[#B0C4DE] shadow-[0_0_6px_#B0C4DE]"
                        />
                      )}
                    </div>
                    <span className="text-[10px] tracking-wide">{t.label}</span>
                  </Comp>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </nav>
  )
}
