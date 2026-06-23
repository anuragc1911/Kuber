import Link from 'next/link'
import { KuberMark } from '@/components/ui/kuber-logo'

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-black flex flex-col">
      <div
        aria-hidden
        className="pointer-events-none fixed -top-[20vh] -right-[10vw] h-[80vw] w-[80vw] max-h-[600px] max-w-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(176, 196, 222, 0.08) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-[20vh] -left-[10vw] h-[60vw] w-[60vw] max-h-[500px] max-w-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(100, 150, 255, 0.04) 0%, transparent 60%)',
          filter: 'blur(70px)',
        }}
      />

      <header className="sticky top-0 z-40 h-14 border-b border-white/10 bg-black/85 backdrop-blur-xl flex items-center justify-between px-4 pt-[env(safe-area-inset-top)]">
        <Link href="/" aria-label="back home" className="inline-flex items-center gap-2">
          <KuberMark size="md" />
          <span className="text-sm text-white/80 kuber-serif">Kuber</span>
        </Link>
        <Link href="/" className="text-[12px] text-white/40 hover:text-white transition">
          exit
        </Link>
      </header>

      <main className="relative z-10 flex-1">
        <div className="mx-auto w-full max-w-md px-5 sm:max-w-lg">{children}</div>
      </main>
    </div>
  )
}
