'use client'

import Link from 'next/link'
import { BottomNav } from '@/components/app/bottom-nav'
import { UserMenu } from '@/components/app/user-menu'
import { KuberMark } from '@/components/ui/kuber-logo'

export function AppShell({
  children,
  userEmail,
}: {
  children: React.ReactNode
  userEmail: string | null
}) {
  return (
    <div className="relative min-h-screen bg-black flex flex-col">
      <header className="sticky top-0 z-40 h-14 shrink-0 border-b border-white/10 bg-black/85 backdrop-blur-xl flex items-center justify-between px-4 pt-[env(safe-area-inset-top)]">
        <Link href="/" aria-label="Kuber home" className="inline-flex items-center gap-2">
          <KuberMark size="md" />
          <span className="text-sm text-white/80 kuber-serif">Kuber</span>
        </Link>
        <div className="flex items-center gap-2">
          {userEmail && (
            <span className="hidden xs:inline text-[11px] text-white/40 truncate max-w-[140px]">
              {userEmail}
            </span>
          )}
          <UserMenu email={userEmail} businessName="" />
        </div>
      </header>

      <main className="flex-1 pb-[calc(96px+env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-md px-4 sm:max-w-lg sm:px-5">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
