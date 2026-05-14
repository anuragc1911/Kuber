import {
  Home,
  AlertTriangle,
  Bell,
  Calendar,
  LineChart,
  CheckSquare,
  Plug,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type View =
  | "dashboard"
  | "alerts"
  | "insights"
  | "transactions"
  | "forecast"
  | "savings"
  | "excel"
  | "settings";

interface Props {
  view: View;
  onChange: (v: View) => void;
  alertCount: number;
  insightCount: number;
}

interface Item {
  id: View;
  label: string;
  icon: LucideIcon;
  badge?: number;
  badgeColor?: "danger" | "warn";
}

export default function Sidebar({ view, onChange, alertCount, insightCount }: Props) {
  const top: Item[] = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "alerts", label: "Alerts", icon: AlertTriangle, badge: alertCount, badgeColor: "danger" },
    { id: "insights", label: "Insights", icon: Bell, badge: insightCount, badgeColor: "warn" },
    { id: "transactions", label: "Transactions", icon: Calendar },
    { id: "forecast", label: "Forecast", icon: LineChart },
    { id: "savings", label: "Goals", icon: CheckSquare },
  ];
  const bottom: Item[] = [
    { id: "excel", label: "Integrations", icon: Plug },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-14 shrink-0 border-r border-line bg-bg flex flex-col items-center py-3 gap-1">
      <button
        onClick={() => onChange("dashboard")}
        className="w-9 h-9 rounded-lg bg-accent text-bg grid place-items-center mb-2 hover:bg-accent-soft transition-colors"
        title="kuber"
      >
        <span className="font-bold text-[15px] tracking-tight">K</span>
      </button>

      <nav className="flex flex-col gap-0.5 flex-1">
        {top.map((it) => (
          <NavBtn key={it.id} item={it} active={view === it.id} onClick={() => onChange(it.id)} />
        ))}
      </nav>

      <nav className="flex flex-col gap-0.5">
        {bottom.map((it) => (
          <NavBtn key={it.id} item={it} active={view === it.id} onClick={() => onChange(it.id)} />
        ))}
      </nav>

      <div className="w-9 h-9 rounded-lg bg-elev border border-line grid place-items-center mt-2" title="claude">
        <Sparkles size={15} className="text-accent" />
      </div>
    </aside>
  );
}

function NavBtn({ item, active, onClick }: { item: Item; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      title={item.label}
      className={`relative w-9 h-9 rounded-lg grid place-items-center transition-colors ${
        active ? "bg-elev text-text" : "text-sub hover:text-text hover:bg-elev"
      }`}
    >
      <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
      {!!item.badge && item.badge > 0 && (
        <span
          className={`absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-semibold grid place-items-center text-white ${
            item.badgeColor === "danger" ? "bg-danger" : "bg-warn"
          }`}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
}
