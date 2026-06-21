import Link from 'next/link'
import { KuberLogo } from '@/components/ui/kuber-logo'
import { Waves } from '@/components/ui/wave-background'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <header className="relative z-10 px-6 py-5 flex items-center justify-between">
        <Link href="/" aria-label="Kuber home">
          <KuberLogo size="md" />
        </Link>
        <Link href="/" className="text-xs text-white/50 hover:text-white">
          ← back to site
        </Link>
      </header>

      <div className="flex-1 grid sm:grid-cols-2 gap-0 min-h-0">
        {/* Form column */}
        <main className="flex items-center justify-center px-6 py-12">{children}</main>

        {/* Wave column — pure decoration, hidden on small screens */}
        <aside className="relative hidden sm:block border-l border-white/5 overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(60,120,200,0.18)_0%,transparent_70%)]"
          />
          <Waves
            strokeColor="rgba(176, 196, 222, 0.45)"
            backgroundColor="transparent"
            pointerSize={0.4}
          />
        </aside>
      </div>
    </div>
  )
}
