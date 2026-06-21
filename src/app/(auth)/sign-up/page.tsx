import Link from 'next/link'
import { SignUpForm } from './form'

export const metadata = { title: 'sign up — Kuber' }

export default function SignUpPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-xs text-[#B0C4DE] uppercase tracking-wider mb-3">• sign up</div>
      <h1 className="text-3xl font-medium tracking-tight">hire your CFO.</h1>
      <p className="text-sm text-white/55 mt-2 mb-8">
        15 days free. no card. cancel anytime.
      </p>
      <SignUpForm />
      <p className="text-sm text-white/55 mt-6">
        already have an account?{' '}
        <Link href="/sign-in" className="text-[#B0C4DE] hover:text-white">
          sign in →
        </Link>
      </p>
    </div>
  )
}
