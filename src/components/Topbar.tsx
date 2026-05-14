import { Bell, Search, Plus } from "lucide-react";

interface Props {
  onAdd: () => void;
}

export default function Topbar({ onAdd }: Props) {
  return (
    <header className="flex items-center gap-3 px-7 py-4 border-b border-white/5 bg-ink-900/20 backdrop-blur-xl">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
        <div className="font-semibold text-lg leading-tight">Good morning — here's your money.</div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            placeholder="Search transactions, categories..."
            className="input pl-9 w-72"
          />
        </div>
        <button className="btn-ghost px-2.5 py-2.5 relative">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-glow-pink" />
        </button>
        <button onClick={onAdd} className="btn-primary">
          <Plus size={16} /> Add transaction
        </button>
      </div>
    </header>
  );
}
