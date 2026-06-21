'use client'

import { useState, useTransition } from 'react'
import { signIn } from '../actions'

export function SignInForm() {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <form
      action={(formData) => {
        setError(null)
        startTransition(async () => {
          const result = await signIn(formData)
          if (result && !result.ok) setError(result.error)
        })
      }}
      className="space-y-4"
    >
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
        <div className="flex items-baseline justify-between">
          <label className="text-[11px] uppercase tracking-wider text-white/50">password</label>
          <a href="#" className="text-[11px] text-white/50 hover:text-white">forgot?</a>
        </div>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-[#B0C4DE]/40"
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
        {pending ? 'signing in…' : 'sign in →'}
      </button>
    </form>
  )
}
