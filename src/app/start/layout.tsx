import Link from 'next/link'
import { KuberLogo } from '@/components/ui/kuber-logo'

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[20vh] -right-[10vw] h-[80vw] w-[80vw] max-h-[1000px] max-w-[1000px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(176, 196, 222, 0.10) 0%, transparent 60%)',
          filter: 'blur(100px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[20vh] -left-[10vw] h-[60vw] w-[60vw] max-h-[800px] max-w-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(100, 150, 255, 0.05) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }}
      />

      <header className="relative z-20 px-6 py-5">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Link href="/" aria-label="back to home" className="inline-flex">
            <KuberLogo />
          </Link>
          <Link
            href="/"
            className="text-xs text-white/40 hover:text-white transition"
          >
            ← back
          </Link>
        </div>
      </header>

      <main className="relative z-10">{children}</main>
    </div>
  )
}
