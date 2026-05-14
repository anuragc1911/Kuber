import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtINR } from "../lib/finance";

interface Props {
  data: { date: string; balance: number }[];
  current: number;
  currency: string;
}

export default function CashPositionChart({ data, current }: Props) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="label flex items-center gap-2">
            <span>Cash position</span>
            <span className="text-muted">·</span>
            <span className="text-sub">60 days</span>
          </div>
          <div className="mt-2 text-[28px] num font-semibold tracking-tight">
            {fmtINR(current)} <span className="text-dim font-normal text-[15px]">on hand today</span>
          </div>
        </div>
        <button className="text-[12px] text-dim hover:text-text transition-colors">
          forecast next 90 days →
        </button>
      </div>
      <div className="h-[280px] mt-5">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#1F1F1F" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#737373", fontSize: 11 }}
              axisLine={{ stroke: "#1F1F1F" }}
              tickLine={false}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              }}
              minTickGap={40}
            />
            <YAxis
              tick={{ fill: "#737373", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => fmtINR(v).replace("₹", "")}
              width={48}
            />
            <Tooltip
              contentStyle={{
                background: "#0A0A0A",
                border: "1px solid #1F1F1F",
                borderRadius: 10,
                fontSize: 12,
                color: "#FAFAFA",
              }}
              labelStyle={{ color: "#737373", fontSize: 11 }}
              formatter={(v: number) => [fmtINR(v), "balance"]}
              labelFormatter={(v) =>
                new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
              }
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#FAFAFA"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: "#FAFAFA" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
