import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  label: string;
  value: string;
  delta?: number;
  icon?: ReactNode;
  accent?: "green" | "violet" | "cyan" | "pink";
  hint?: string;
}

const accentMap = {
  green: "from-accent-500/20 to-accent-500/0 text-accent-400",
  violet: "from-glow-violet/20 to-glow-violet/0 text-violet-300",
  cyan: "from-glow-cyan/20 to-glow-cyan/0 text-cyan-300",
  pink: "from-glow-pink/20 to-glow-pink/0 text-pink-300",
};

export default function StatCard({ label, value, delta, icon, accent = "green", hint }: Props) {
  return (
    <div className="card card-hover p-5 relative overflow-hidden">
      <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${accentMap[accent]} blur-2xl opacity-60`} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="label">{label}</div>
          <div className="text-2xl font-bold mt-2 tracking-tight">{value}</div>
          {hint && <div className="text-[11px] text-slate-400 mt-1">{hint}</div>}
        </div>
        {icon && <div className={`p-2.5 rounded-xl bg-white/[0.04] ${accentMap[accent].split(" ").pop()}`}>{icon}</div>}
      </div>
      {delta !== undefined && (
        <div
          className={`pill mt-3 ${
            delta >= 0 ? "bg-accent-500/10 text-accent-400" : "bg-glow-pink/10 text-pink-300"
          }`}
        >
          {delta >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(delta).toFixed(1)}% vs last period
        </div>
      )}
    </div>
  );
}
