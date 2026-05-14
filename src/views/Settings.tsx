import { RefreshCcw } from "lucide-react";
import type { FinanceState } from "../lib/types";

interface Props {
  state: FinanceState;
  onUpdate: (patch: Partial<FinanceState>) => void;
  onReset: () => void;
}

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD"];

export default function Settings({ state, onUpdate, onReset }: Props) {
  return (
    <div className="max-w-2xl space-y-5">
      <div className="card p-6">
        <div className="font-semibold mb-1">Preferences</div>
        <div className="text-xs text-slate-400 mb-5">Personalize your CFO experience.</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="label mb-1.5">Currency</div>
            <select
              value={state.currency}
              onChange={(e) => onUpdate({ currency: e.target.value })}
              className="input"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c} className="bg-ink-900">
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="label mb-1.5">Monthly income baseline</div>
            <input
              type="number"
              min="0"
              value={state.monthlyIncome}
              onChange={(e) => onUpdate({ monthlyIncome: Number(e.target.value) || 0 })}
              className="input"
            />
          </div>
          <div>
            <div className="label mb-1.5">Daily savings goal</div>
            <input
              type="number"
              min="0"
              value={state.dailySavingGoal}
              onChange={(e) => onUpdate({ dailySavingGoal: Number(e.target.value) || 0 })}
              className="input"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="font-semibold mb-1">Data</div>
        <div className="text-xs text-slate-400 mb-5">
          All data is stored locally in your browser. Use the Excel sync page to back it up.
        </div>
        <button onClick={onReset} className="btn-ghost text-pink-300 border-pink-500/20 hover:bg-pink-500/5">
          <RefreshCcw size={15} /> Reset to sample data
        </button>
      </div>
    </div>
  );
}
