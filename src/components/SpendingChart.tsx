import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtMoney } from "../lib/finance";

interface Props {
  data: { date: string; spending: number; savings: number }[];
  currency: string;
}

export default function SpendingChart({ data, currency }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));
  return (
    <div className="card p-5 h-[340px]">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="label">Cashflow trend</div>
          <div className="font-semibold mt-0.5">Spending vs Savings — last 30 days</div>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-glow-pink" /> Spending
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-400" /> Savings
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="86%">
        <AreaChart data={formatted} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="gradSpend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F472B6" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#F472B6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradSave" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34E0A1" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#34E0A1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "rgba(11,16,32,0.95)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              fontSize: 12,
            }}
            formatter={(v: number) => fmtMoney(v, currency)}
          />
          <Area
            type="monotone"
            dataKey="spending"
            stroke="#F472B6"
            strokeWidth={2}
            fill="url(#gradSpend)"
          />
          <Area
            type="monotone"
            dataKey="savings"
            stroke="#34E0A1"
            strokeWidth={2}
            fill="url(#gradSave)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
