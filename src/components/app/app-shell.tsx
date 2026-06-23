'use client'

import Link from 'next/link'
import { BottomNav } from '@/components/app/bottom-nav'
import { KuberMark } from '@/components/ui/kuber-logo'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-black flex flex-col">
      <header className="sticky top-0 z-40 h-14 shrink-0 border-b border-white/10 bg-black/85 backdrop-blur-xl flex items-center justify-between px-4 pt-[env(safe-area-inset-top)]">
        <Link href="/" aria-label="Kuber home" className="inline-flex items-center gap-2">
          <KuberMark size="md" />
          <span className="text-sm text-white/80 kuber-serif">Kuber</span>
        </Link>
        <Link
          href="/"
          className="text-[12px] text-white/40 hover:text-white transition"
        >
          exit
        </Link>
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
