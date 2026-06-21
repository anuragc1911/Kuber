'use client'

import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

type Status = 'connected' | 'available'
type Tool = { name: string; status: Status }
type Category = { name: string; tools: Tool[] }

const CATEGORIES: Category[] = [
  {
    name: 'payments',
    tools: [
      { name: 'razorpay', status: 'connected' },
      { name: 'stripe', status: 'available' },
      { name: 'cashfree', status: 'available' },
      { name: 'phonepe', status: 'available' },
      { name: 'paypal', status: 'available' },
    ],
  },
  {
    name: 'commerce',
    tools: [
      { name: 'shopify', status: 'connected' },
      { name: 'amazon', status: 'available' },
      { name: 'flipkart', status: 'available' },
      { name: 'woocommerce', status: 'available' },
      { name: 'magento', status: 'available' },
    ],
  },
  {
    name: 'banks',
    tools: [
      { name: 'hdfc', status: 'connected' },
      { name: 'icici', status: 'connected' },
      { name: 'axis', status: 'available' },
      { name: 'kotak', status: 'available' },
      { name: 'sbi', status: 'available' },
    ],
  },
  {
    name: 'CRM',
    tools: [
      { name: 'hubspot', status: 'available' },
      { name: 'salesforce', status: 'available' },
      { name: 'zoho', status: 'available' },
      { name: 'pipedrive', status: 'available' },
    ],
  },
  {
    name: 'accounting',
    tools: [
      { name: 'quickbooks', status: 'available' },
      { name: 'zoho books', status: 'available' },
      { name: 'tally', status: 'available' },
      { name: 'xero', status: 'available' },
    ],
  },
  {
    name: 'ads',
    tools: [
      { name: 'meta ads', status: 'connected' },
      { name: 'google ads', status: 'available' },
      { name: 'linkedin ads', status: 'available' },
    ],
  },
  {
    name: 'logistics',
    tools: [
      { name: 'shiprocket', status: 'available' },
      { name: 'delhivery', status: 'available' },
      { name: 'bluedart', status: 'available' },
    ],
  },
]

type Filter = 'all' | 'connected' | 'available'

export default function ConnectionsPage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const totalConnected = CATEGORIES.flatMap((c) => c.tools).filter((t) => t.status === 'connected').length
  const totalAll = CATEGORIES.flatMap((c) => c.tools).length

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CATEGORIES.map((cat) => {
      const tools = cat.tools.filter((t) => {
        const matchesQ = !q || t.name.toLowerCase().includes(q) || cat.name.toLowerCase().includes(q)
        const matchesF = filter === 'all' || t.status === filter
        return matchesQ && matchesF
      })
      return { ...cat, tools }
    }).filter((c) => c.tools.length > 0)
  }, [query, filter])

  const visibleCount = filtered.reduce((n, c) => n + c.tools.length, 0)

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-6xl">
      <div>
        <div className="text-xs text-[#B0C4DE] uppercase tracking-wider mb-2">• connections</div>
        <h1 className="text-2xl md:text-3xl font-medium text-white">your stack, in one place.</h1>
        <p className="text-sm text-white/50 mt-2">
          {totalConnected} connected · {totalAll - totalConnected} available · read-only access · data stays yours.
        </p>
      </div>

      {/* search + filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search 50+ integrations — stripe, shopify, hdfc, hubspot…"
            className="w-full rounded-xl border border-white/10 bg-white/[0.02] pl-11 pr-10 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#B0C4DE]/40"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white px-2 py-1"
            >
              clear
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {(['all', 'connected', 'available'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border transition-colors',
                filter === f
                  ? 'border-[#B0C4DE]/40 bg-[#B0C4DE]/10 text-white'
                  : 'border-white/10 text-white/50 hover:text-white',
              )}
            >
              {f}
              {f !== 'all' && (
                <span className="ml-1.5 text-[10px] text-white/40">
                  {f === 'connected' ? totalConnected : totalAll - totalConnected}
                </span>
              )}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-white/30 font-mono">
            {visibleCount} {visibleCount === 1 ? 'result' : 'results'}
          </span>
        </div>
      </div>

      {/* results */}
      <div className="space-y-8">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
            <div className="text-sm text-white/60">
              no integrations match {query ? <span className="text-white">&ldquo;{query}&rdquo;</span> : 'this filter'}.
            </div>
            <div className="mt-2 text-xs text-white/40">
              don&apos;t see your tool? <span className="text-[#B0C4DE]">tell us</span> — we&apos;ll build it.
            </div>
          </div>
        )}
        {filtered.map((cat) => (
          <section key={cat.name}>
            <div className="text-xs uppercase tracking-wider text-white/40 mb-3">{cat.name}</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {cat.tools.map((t) => (
                <div
                  key={t.name}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm text-white">
                      {highlight(t.name, query)}
                    </div>
                    <div
                      className={
                        t.status === 'connected'
                          ? 'text-[10px] uppercase tracking-wider text-emerald-300/80 mt-1'
                          : 'text-[10px] uppercase tracking-wider text-white/30 mt-1'
                      }
                    >
                      {t.status === 'connected' ? '● live' : '○ available'}
                    </div>
                  </div>
                  <button className="text-[11px] text-white/50 hover:text-white border border-white/10 rounded-full px-2.5 py-1">
                    {t.status === 'connected' ? 'manage' : 'connect'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/60">
        don&apos;t see your tool? <span className="text-[#B0C4DE]">tell us</span> — we&apos;ll build it.
      </div>
    </div>
  )
}

function highlight(text: string, q: string) {
  const trimmed = q.trim()
  if (!trimmed) return text
  const lower = text.toLowerCase()
  const i = lower.indexOf(trimmed.toLowerCase())
  if (i === -1) return text
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-[#B0C4DE]/20 text-[#B0C4DE] rounded px-0.5">{text.slice(i, i + trimmed.length)}</mark>
      {text.slice(i + trimmed.length)}
    </>
  )
}
