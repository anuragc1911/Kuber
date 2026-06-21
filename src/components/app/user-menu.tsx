'use client'

import { useEffect, useRef, useState } from 'react'
import { LogOut, User } from 'lucide-react'
import { signOut } from '@/app/(auth)/actions'
import { cn } from '@/lib/utils'

export function UserMenu({ email, businessName }: { email: string | null; businessName: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const initial = (email?.[0] ?? businessName[0] ?? 'K').toUpperCase()

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="size-8 inline-flex items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-xs text-white hover:bg-white/10"
        aria-label="account menu"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 z-50 rounded-lg border border-white/15 bg-black backdrop-blur-2xl shadow-[0_12px_32px_rgba(0,0,0,0.6)] py-1.5">
          <div className="px-3 py-2 border-b border-white/10">
            <div className="text-sm text-white truncate">{businessName}</div>
            {email && <div className="text-[11px] text-white/50 truncate">{email}</div>}
          </div>
          <div className="py-1">
            <a
              href="/app/settings"
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5 hover:text-white"
            >
              <User className="size-3.5" />
              account settings
            </a>
            <form action={signOut}>
              <button
                type="submit"
                className={cn(
                  'flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs text-rose-300/80 hover:bg-rose-400/[0.06] hover:text-rose-300',
                )}
              >
                <LogOut className="size-3.5" />
                sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
