import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  FileSpreadsheet,
  Settings,
  Sparkles,
  PiggyBank,
  type LucideIcon,
} from "lucide-react";

export type View = "dashboard" | "transactions" | "savings" | "excel" | "settings";

interface Props {
  view: View;
  onChange: (v: View) => void;
}

const items: { id: View; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", icon: Wallet },
  { id: "savings", label: "Savings & Limits", icon: PiggyBank },
  { id: "excel", label: "Excel Sync", icon: FileSpreadsheet },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ view, onChange }: Props) {
  return (
    <aside className="w-60 shrink-0 border-r border-white/5 bg-ink-900/40 backdrop-blur-xl flex flex-col">
      <div className="px-5 py-5 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-400 to-glow-cyan grid place-items-center shadow-glow">
          <TrendingUp size={18} className="text-ink-950" />
        </div>
        <div>
          <div className="font-bold text-base leading-tight">Kuber</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">AI CFO Suite</div>
        </div>
      </div>

      <nav className="px-3 mt-2 space-y-1 flex-1">
        {items.map((it) => {
          const Icon = it.icon;
          const active = view === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onChange(it.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-white/[0.06] text-white shadow-soft border border-white/5"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <Icon size={17} className={active ? "text-accent-400" : ""} />
              <span>{it.label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-400 shadow-[0_0_8px_#34e0a1]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="m-3 p-3.5 card glow-border">
        <div className="flex items-center gap-2 text-xs text-accent-400 font-semibold">
          <Sparkles size={14} /> Pro tip
        </div>
        <div className="text-xs text-slate-300 mt-1.5 leading-relaxed">
          Import your bank Excel and Kuber's CFO will spot anomalies in seconds.
        </div>
      </div>
    </aside>
  );
}
