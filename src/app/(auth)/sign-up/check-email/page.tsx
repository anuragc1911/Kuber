import Link from 'next/link'
import { Mail } from 'lucide-react'

export const metadata = { title: 'check your email — Kuber' }

export default function CheckEmailPage() {
  return (
    <div className="w-full max-w-sm text-center">
      <div className="inline-flex size-12 items-center justify-center rounded-full bg-[#B0C4DE]/10 text-[#B0C4DE] mb-6">
        <Mail className="size-5" />
      </div>
      <h1 className="text-3xl font-medium tracking-tight">check your email.</h1>
      <p className="text-sm text-white/55 mt-3 mb-8">
        we sent you a confirmation link. click it to finish setting up your account.
      </p>
      <Link
        href="/sign-in"
        className="inline-flex text-xs text-[#B0C4DE] hover:text-white"
      >
        ← back to sign in
      </Link>
    </div>
  )
}
