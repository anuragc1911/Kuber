'use client'

import { useState, useTransition } from 'react'
import { createOrgAction } from './actions'

const INDUSTRIES = [
  { id: 'd2c', label: 'D2C brand', hint: 'shopify / amazon / razorpay' },
  { id: 'saas', label: 'SaaS', hint: 'stripe / chargebee' },
  { id: 'agency', label: 'agency', hint: 'retainers + project work' },
  { id: 'services', label: 'services', hint: 'consulting / freelance' },
  { id: 'other', label: 'other', hint: 'something else' },
] as const

const COUNTRIES = [
  { code: 'IN', label: 'India',          currency: 'INR', fiscalStart: 4 },
  { code: 'US', label: 'United States',  currency: 'USD', fiscalStart: 1 },
  { code: 'GB', label: 'United Kingdom', currency: 'GBP', fiscalStart: 4 },
  { code: 'CA', label: 'Canada',         currency: 'CAD', fiscalStart: 1 },
  { code: 'AU', label: 'Australia',      currency: 'AUD', fiscalStart: 7 },
  { code: 'SG', label: 'Singapore',      currency: 'SGD', fiscalStart: 4 },
  { code: 'AE', label: 'UAE',            currency: 'AED', fiscalStart: 1 },
  { code: 'DE', label: 'Germany',        currency: 'EUR', fiscalStart: 1 },
] as const

export function CreateOrgForm() {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [industry, setIndustry] = useState<string>('d2c')

  return (
    <form
      action={(formData) => {
        setError(null)
        formData.set('industry', industry)
        startTransition(async () => {
          const result = await createOrgAction(formData)
          if (result && !result.ok) setError(result.error)
        })
      }}
      className="space-y-5"
    >
      <div>
        <label className="text-[11px] uppercase tracking-wider text-white/50">business name</label>
        <input
          name="name"
          type="text"
          required
          autoFocus
          placeholder="aroma co."
          className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#B0C4DE]/40"
        />
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-wider text-white/50 mb-2">industry</div>
        <div className="grid grid-cols-2 gap-2">
          {INDUSTRIES.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => setIndustry(i.id)}
              className={`text-left rounded-lg border px-3 py-2.5 transition-colors ${
                industry === i.id
                  ? 'border-[#B0C4DE]/50 bg-[#B0C4DE]/[0.08]'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20'
              }`}
            >
              <div className="text-sm text-white">{i.label}</div>
              <div className="text-[11px] text-white/45 mt-0.5">{i.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[11px] uppercase tracking-wider text-white/50">country</label>
        <select
          name="country"
          defaultValue="IN"
          className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-[#B0C4DE]/40"
          onChange={(e) => {
            const c = COUNTRIES.find((x) => x.code === e.target.value)
            if (!c) return
            const cur = document.querySelector<HTMLInputElement>('input[name="currency"]')
            const fy = document.querySelector<HTMLInputElement>('input[name="fiscalYearStartMonth"]')
            if (cur) cur.value = c.currency
            if (fy) fy.value = String(c.fiscalStart)
          }}
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code} className="bg-black">
              {c.label} ({c.code})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] uppercase tracking-wider text-white/50">currency</label>
          <input
            name="currency"
            type="text"
            required
            defaultValue="INR"
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-[#B0C4DE]/40 uppercase"
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-wider text-white/50">FY starts</label>
          <input
            name="fiscalYearStartMonth"
            type="number"
            min={1}
            max={12}
            required
            defaultValue={4}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-[#B0C4DE]/40"
          />
        </div>
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
        {pending ? 'creating workspace…' : 'create workspace →'}
      </button>
    </form>
  )
}
