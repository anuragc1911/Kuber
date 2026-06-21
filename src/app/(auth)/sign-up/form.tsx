'use client'

import { useState, useTransition } from 'react'
import { signUp } from '../actions'

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <form
      action={(formData) => {
        setError(null)
        startTransition(async () => {
          const result = await signUp(formData)
          if (result && !result.ok) setError(result.error)
        })
      }}
      className="space-y-4"
    >
      <div>
        <label className="text-[11px] uppercase tracking-wider text-white/50">business name</label>
        <input
          name="businessName"
          type="text"
          autoComplete="organization"
          placeholder="aroma co."
          className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#B0C4DE]/40"
        />
      </div>
      <div>
        <label className="text-[11px] uppercase tracking-wider text-white/50">email</label>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@yourbusiness.com"
          className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#B0C4DE]/40"
        />
      </div>
      <div>
        <label className="text-[11px] uppercase tracking-wider text-white/50">password</label>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="at least 8 characters"
          className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#B0C4DE]/40"
        />
      </div>
      {error && (
        <div className="text-xs text-rose-300/90 border border-rose-400/20 bg-rose-400/[0.06] rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[#B0C4DE] text-black text-sm font-medium py-2.5 hover:bg-[#B0C4DE]/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? 'creating account…' : 'start free trial →'}
      </button>
      <p className="text-[11px] text-white/40 leading-relaxed">
        by signing up you agree to our{' '}
        <a href="#" className="underline hover:text-white">terms</a> and{' '}
        <a href="#" className="underline hover:text-white">privacy policy</a>. read-only access to
        your data — yours stays yours.
      </p>
    </form>
  )
}
