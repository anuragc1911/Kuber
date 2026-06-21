'use client'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type Pt = { date: string; balance: number }

export function CashChart({ data }: { data: Pt[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cashfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B0C4DE" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#B0C4DE" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            tickFormatter={(v) => v.slice(5)}
            axisLine={false}
            tickLine={false}
            interval={9}
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
            width={50}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(10,12,20,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
            formatter={(v: number) => [`₹${(v / 100000).toFixed(2)}L`, 'balance']}
          />
          <Area type="monotone" dataKey="balance" stroke="#B0C4DE" strokeWidth={2} fill="url(#cashfill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
