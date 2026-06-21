'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ComponentType } from 'react'
import {
  AlertTriangle,
  BellRing,
  CalendarDays,
  Home,
  LineChart,
  ListChecks,
  Plug,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type IconType = ComponentType<{ className?: string }>
type Item = { href: string; label: string; icon: IconType }

const groups: { title?: string; items: Item[] }[] = [
  {
    items: [{ href: '/app', label: 'dashboard', icon: Home }],
  },
  {
    title: 'monitor',
    items: [
      { href: '/app/alerts', label: 'alerts', icon: AlertTriangle },
      { href: '/app/reminders', label: 'reminders', icon: BellRing },
      { href: '/app/calendar', label: 'calendar', icon: CalendarDays },
    ],
  },
  {
    title: 'analyze',
    items: [
      { href: '/app/kpis', label: 'KPIs', icon: LineChart },
      { href: '/app/reports', label: 'reports', icon: ListChecks },
    ],
  },
  {
    title: 'workspace',
    items: [
      { href: '/app/connections', label: 'connections', icon: Plug },
      { href: '/app/settings', label: 'settings', icon: Settings },
    ],
  },
]

export function AppSidebar({
  alertCount = 0,
  reminderCount = 0,
}: {
  alertCount?: number
  reminderCount?: number
}) {
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
          expanded ? 'w-60 shadow-[8px_0_24px_rgba(0,0,0,0.6)]' : 'w-14',
        )}
      >
        <nav className="flex-1 overflow-y-auto py-3">
          {groups.map((group, gi) => (
            <div key={gi} className={cn('px-2', gi > 0 && 'mt-3 pt-3 border-t border-white/[0.06]')}>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active =
                    pathname === item.href ||
                    (item.href !== '/app' && pathname.startsWith(item.href))
                  const badge =
                    item.href === '/app/alerts' && alertCount > 0
                      ? alertCount.toString()
                      : item.href === '/app/reminders' && reminderCount > 0
                        ? reminderCount.toString()
                        : undefined
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={item.label}
                      className={cn(
                        'group relative flex items-center rounded-lg transition-colors',
                        expanded ? 'px-3 py-2 gap-3' : 'h-10 justify-center',
                        active
                          ? 'bg-[#B0C4DE]/10 text-[#B0C4DE]'
                          : 'text-[#B0C4DE]/55 hover:text-[#B0C4DE] hover:bg-white/5',
                      )}
                    >
                      <Icon className="size-5 shrink-0" />
                      {expanded && (
                        <span
                          className={cn(
                            'text-sm flex-1 truncate',
                            active ? 'text-white' : 'text-white/70 group-hover:text-white',
                          )}
                        >
                          {item.label}
                        </span>
                      )}
                      {badge && expanded && (
                        <span
                          className={cn(
                            'text-[10px] font-mono rounded-full px-1.5 py-0.5',
                            item.href === '/app/alerts'
                              ? 'bg-rose-400/15 text-rose-300'
                              : 'bg-amber-300/15 text-amber-200',
                          )}
                        >
                          {badge}
                        </span>
                      )}
                      {badge && !expanded && (
                        <span
                          className={cn(
                            'absolute top-1 right-1 size-3.5 rounded-full text-[9px] font-mono flex items-center justify-center',
                            item.href === '/app/alerts'
                              ? 'bg-rose-400/80 text-black'
                              : 'bg-amber-300/80 text-black',
                          )}
                        >
                          {badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {expanded && (
          <div className="px-4 py-3 border-t border-white/10 text-[11px] text-white/40 leading-relaxed shrink-0">
            Kuber is in <span className="text-[#B0C4DE]">demo mode</span>. data shown is generated for
            a sample D2C brand.
          </div>
        )}
      </aside>
    </div>
  )
}
