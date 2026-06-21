import Link from 'next/link'
import { SignInForm } from './form'

export const metadata = { title: 'sign in — Kuber' }

export default function SignInPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-xs text-[#B0C4DE] uppercase tracking-wider mb-3">• sign in</div>
      <h1 className="text-3xl font-medium tracking-tight">welcome back.</h1>
      <p className="text-sm text-white/55 mt-2 mb-8">
        your CFO is waiting. one second and we&apos;ll have the numbers up.
      </p>
      <SignInForm />
      <p className="text-sm text-white/55 mt-6">
        new here?{' '}
        <Link href="/sign-up" className="text-[#B0C4DE] hover:text-white">
          create an account →
        </Link>
      </p>
    </div>
  )
}
