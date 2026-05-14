import { fmtMoney } from "../lib/finance";
import type { Category, FinanceState } from "../lib/types";

interface Props {
  state: FinanceState;
  byCategory: Record<Category, number>;
  onChange?: (cat: Category, value: number) => void;
}

export default function LimitsList({ state, byCategory, onChange }: Props) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="label">Spending limits</div>
          <div className="font-semibold">This month's budget pacing</div>
        </div>
      </div>
      <div className="space-y-3.5">
        {state.limits.map((l) => {
          const spent = byCategory[l.category] || 0;
          const pct = l.monthly > 0 ? Math.min(1, spent / l.monthly) : 0;
          const over = spent > l.monthly;
          const near = !over && pct > 0.8;
          const color = over ? "#F472B6" : near ? "#FBBF24" : "#34E0A1";
          return (
            <div key={l.category}>
              <div className="flex items-center justify-between text-sm">
                <div className="font-medium">{l.category}</div>
                <div className="text-slate-300">
                  <span className={over ? "text-pink-300" : "text-slate-100"}>{fmtMoney(spent, state.currency)}</span>
                  <span className="text-slate-500"> / </span>
                  {onChange ? (
                    <input
                      type="number"
                      value={l.monthly}
                      onChange={(e) => onChange(l.category, Number(e.target.value) || 0)}
                      className="w-20 bg-ink-800 border border-white/5 rounded-md px-2 py-0.5 text-right text-xs focus:outline-none focus:border-accent-500/60"
                    />
                  ) : (
                    fmtMoney(l.monthly, state.currency)
                  )}
                </div>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-white/[0.05] overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct * 100}%`, background: color, boxShadow: `0 0 12px ${color}55` }}
                />
              </div>
              {over && (
                <div className="text-[11px] text-pink-300 mt-1">
                  Over by {fmtMoney(spent - l.monthly, state.currency)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
