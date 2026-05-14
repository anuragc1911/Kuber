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
      <div className="label">Budget pacing</div>
      <div className="text-[15px] font-medium mt-1 mb-4">This month's category limits</div>
      <div className="space-y-3.5">
        {state.limits.map((l) => {
          const spent = byCategory[l.category] || 0;
          const pct = l.monthly > 0 ? Math.min(1, spent / l.monthly) : 0;
          const over = spent > l.monthly;
          const near = !over && pct > 0.8;
          const color = over ? "#EF4444" : near ? "#F59E0B" : "#22C55E";
          return (
            <div key={l.category}>
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-text">{l.category}</span>
                <span className="text-dim num">
                  <span className={over ? "text-danger" : "text-text"}>{fmtMoney(spent, state.currency)}</span>
                  <span className="text-muted"> / </span>
                  {onChange ? (
                    <input
                      type="number"
                      value={l.monthly}
                      onChange={(e) => onChange(l.category, Number(e.target.value) || 0)}
                      className="w-24 bg-elev border border-line rounded-md px-1.5 py-0.5 text-right text-[11.5px] focus:outline-none focus:border-muted num"
                    />
                  ) : (
                    fmtMoney(l.monthly, state.currency)
                  )}
                </span>
              </div>
              <div className="mt-1.5 h-1 rounded-full bg-line overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${pct * 100}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
