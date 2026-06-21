'use client'

import Link from 'next/link'
import { AppSidebar } from '@/components/app/sidebar'
import { ChatPanel } from '@/components/app/chat-panel'
import { UserMenu } from '@/components/app/user-menu'
import { KuberMark } from '@/components/ui/kuber-logo'

export function AppShell({
  children,
  alertCount,
  reminderCount,
  userEmail,
  businessName,
}: {
  children: React.ReactNode
  alertCount: number
  reminderCount: number
  userEmail: string | null
  businessName: string
}) {
  return (
    <div className="relative h-screen flex flex-col bg-black overflow-hidden">
      {/* Stationary top bar — full width, always visible */}
      <header className="h-14 shrink-0 z-40 border-b border-white/10 bg-black flex items-stretch">
        {/* logo slot — matches sidebar rail width */}
        <Link
          href="/"
          aria-label="Kuber home"
          className="w-14 shrink-0 flex items-center justify-center border-r border-white/10"
        >
          <KuberMark size="md" />
        </Link>
        <div className="flex-1 flex items-center justify-between px-4 gap-4">
          <div className="text-sm text-white/60">
            <span className="text-white/90">{businessName}</span>
            {userEmail && (
              <>
                <span className="mx-2 text-white/30">·</span>
                <span className="text-white/50">{userEmail}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-white/40">
              {userEmail ? '' : 'demo workspace · sample data'}
            </span>
            <UserMenu email={userEmail} businessName={businessName} />
          </div>
        </div>
      </header>

      {/* Lower row: sidebar | main | chat panel */}
      <div className="flex flex-1 min-h-0">
        <AppSidebar alertCount={alertCount} reminderCount={reminderCount} />
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
        <ChatPanel />
      </div>
    </div>
  )
}
