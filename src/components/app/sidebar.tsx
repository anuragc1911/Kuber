'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ComponentType } from 'react'
import { Home, MessageSquare, Target, Wallet, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

type IconType = ComponentType<{ className?: string }>
type Item = { href: string; label: string; icon: IconType; soon?: boolean }

const groups: { title?: string; items: Item[] }[] = [
  {
    items: [
      { href: '/app', label: 'home', icon: Home },
      { href: '/app/chat', label: 'chat', icon: MessageSquare },
    ],
  },
  {
    title: 'coming soon',
    items: [
      { href: '/app/goals', label: 'goals', icon: Target, soon: true },
      { href: '/app/money', label: 'money', icon: Wallet, soon: true },
      { href: '/app/settings', label: 'settings', icon: Settings, soon: true },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [hover, setHover] = useState(false)
  const expanded = hover

  return (
    <div className="relative w-14 shrink-0">
      <aside
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={cn(
          'absolute inset-y-0 left-0 z-30 border-r border-white/10 bg-black flex flex-col transition-[width] duration-200 ease-out overflow-hidden',
          expanded ? 'w-56 shadow-[8px_0_24px_rgba(0,0,0,0.6)]' : 'w-14',
        )}
      >
        <nav className="flex-1 overflow-y-auto py-3">
          {groups.map((group, gi) => (
            <div key={gi} className={cn('px-2', gi > 0 && 'mt-3 pt-3 border-t border-white/[0.06]')}>
              {expanded && group.title && (
                <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.18em] text-white/30">
                  {group.title}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active =
                    !item.soon &&
                    (pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href)))
                  const Comp: React.ElementType = item.soon ? 'div' : Link
                  return (
                    <Comp
                      key={item.href}
                      {...(item.soon ? {} : { href: item.href })}
                      title={item.soon ? `${item.label} — coming soon` : item.label}
                      className={cn(
                        'group relative flex items-center rounded-lg transition-colors',
                        expanded ? 'px-3 py-2 gap-3' : 'h-10 justify-center',
                        item.soon
                          ? 'text-white/20 cursor-not-allowed'
                          : active
                            ? 'bg-[#B0C4DE]/10 text-[#B0C4DE]'
                            : 'text-[#B0C4DE]/55 hover:text-[#B0C4DE] hover:bg-white/5',
                      )}
                    >
                      <Icon className="size-5 shrink-0" />
                      {expanded && (
                        <span
                          className={cn(
                            'text-sm flex-1 truncate',
                            item.soon ? 'text-white/35' : active ? 'text-white' : 'text-white/70 group-hover:text-white',
                          )}
                        >
                          {item.label}
                        </span>
                      )}
                      {expanded && item.soon && (
                        <span className="text-[9px] uppercase tracking-wider text-white/30 rounded-full bg-white/[0.04] px-1.5 py-0.5">
                          soon
                        </span>
                      )}
                    </Comp>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {expanded && (
          <div className="px-4 py-3 border-t border-white/10 text-[11px] text-white/40 leading-relaxed shrink-0">
            v1 ships with the magic-moment loop only. dashboard, goals & money are next.
          </div>
        )}
      </aside>
    </div>
  )
}
