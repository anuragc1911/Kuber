import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { fmtMoney } from "../lib/finance";
import type { Category } from "../lib/types";

interface Props {
  data: Record<Category, number>;
  currency: string;
}

const COLORS = ["#34E0A1", "#22D3EE", "#8B5CF6", "#F472B6", "#F59E0B", "#60A5FA", "#A78BFA", "#FB7185", "#10B981", "#94A3B8"];

export default function CategoryDonut({ data, currency }: Props) {
  const entries = Object.entries(data)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((a, [, v]) => a + v, 0);
  const chartData = entries.map(([name, value]) => ({ name, value }));

  return (
    <div className="card p-5 h-[340px]">
      <div className="label">Where your money went</div>
      <div className="font-semibold mt-0.5 mb-2">By category — this month</div>
      <div className="grid grid-cols-5 gap-4 h-[82%]">
        <div className="col-span-2 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={56}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "rgba(11,16,32,0.95)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(v: number) => fmtMoney(v, currency)}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-[10px] uppercase tracking-widest text-slate-400">Total</div>
            <div className="font-bold text-lg">{fmtMoney(total, currency)}</div>
          </div>
        </div>
        <div className="col-span-3 overflow-auto pr-1 space-y-2">
          {entries.map(([name, value], i) => {
            const pct = total > 0 ? (value / total) * 100 : 0;
            return (
              <div key={name} className="flex items-center gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <span className="text-sm text-slate-200 w-24 truncate">{name}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: COLORS[i % COLORS.length],
                    }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-20 text-right">{fmtMoney(value, currency)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
