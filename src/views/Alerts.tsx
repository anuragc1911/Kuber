import { AlertOctagon } from "lucide-react";
import type { FinanceState } from "../lib/types";
import { fmtMoney, spendByCategory } from "../lib/finance";

interface Props {
  state: FinanceState;
}

export default function Alerts({ state }: Props) {
  const byCat = spendByCategory(state);
  const breaches = state.limits.filter((l) => (byCat[l.category] || 0) > l.monthly);
  const near = state.limits.filter((l) => {
    const s = byCat[l.category] || 0;
    return l.monthly > 0 && s <= l.monthly && s / l.monthly > 0.8;
  });

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="label">Alerts</div>
        <div className="text-[14px] font-medium mt-1">
          {breaches.length === 0 && near.length === 0
            ? "All clear"
            : `${breaches.length + near.length} item${breaches.length + near.length === 1 ? "" : "s"} need attention`}
        </div>
      </div>
      {breaches.length === 0 && near.length === 0 && (
        <div className="card p-10 text-center">
          <div className="text-sub text-[13px]">Nothing flagged. You're within every category limit.</div>
        </div>
      )}
      {breaches.map((l) => {
        const spent = byCat[l.category] || 0;
        return (
          <div key={l.category} className="card p-5 flex items-start gap-3 border-danger/30">
            <div className="w-8 h-8 rounded-md bg-danger/10 grid place-items-center shrink-0">
              <AlertOctagon size={14} className="text-danger" />
            </div>
            <div>
              <div className="text-[13.5px] text-text">Over budget on {l.category}</div>
              <div className="text-[12px] text-dim mt-0.5">
                Spent {fmtMoney(spent, state.currency)} vs limit {fmtMoney(l.monthly, state.currency)}.
                Over by {fmtMoney(spent - l.monthly, state.currency)}.
              </div>
            </div>
          </div>
        );
      })}
      {near.map((l) => {
        const spent = byCat[l.category] || 0;
        return (
          <div key={l.category} className="card p-5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-md bg-warn/10 grid place-items-center shrink-0">
              <AlertOctagon size={14} className="text-warn" />
            </div>
            <div>
              <div className="text-[13.5px] text-text">
                {l.category} at {Math.round((spent / l.monthly) * 100)}% of limit
              </div>
              <div className="text-[12px] text-dim mt-0.5">
                {fmtMoney(l.monthly - spent, state.currency)} left for the month.
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
