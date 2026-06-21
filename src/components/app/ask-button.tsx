'use client'

import { cn } from '@/lib/utils'

/**
 * Drop-in replacement for `<Link href="/app/chat?q=...">` patterns.
 * Dispatches a `kuber:ask` event that the right-side ChatPanel (and AppShell) listen for.
 * Opens the war room and submits the question without navigating away.
 */
export function AskButton({
  text,
  children,
  className,
}: {
  text: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent('kuber:ask', { detail: text }))
      }}
      className={cn('cursor-pointer', className)}
    >
      {children}
    </button>
  )
}
