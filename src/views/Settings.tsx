import { RefreshCcw } from "lucide-react";
import type { FinanceState } from "../lib/types";

interface Props {
  state: FinanceState;
  onUpdate: (patch: Partial<FinanceState>) => void;
  onReset: () => void;
}

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD"];

export default function Settings({ state, onUpdate, onReset }: Props) {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="card p-6">
        <div className="text-[14px] font-medium">Preferences</div>
        <div className="text-[11.5px] text-sub mb-5">Personalize your dashboard.</div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email">
            <input
              value={state.ownerEmail}
              onChange={(e) => onUpdate({ ownerEmail: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Currency">
            <select
              value={state.currency}
              onChange={(e) => onUpdate({ currency: e.target.value })}
              className="input"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Monthly income baseline">
            <input
              type="number"
              min="0"
              value={state.monthlyIncome}
              onChange={(e) => onUpdate({ monthlyIncome: Number(e.target.value) || 0 })}
              className="input num"
            />
          </Field>
          <Field label="Opening balance">
            <input
              type="number"
              value={state.openingBalance}
              onChange={(e) => onUpdate({ openingBalance: Number(e.target.value) || 0 })}
              className="input num"
            />
          </Field>
          <Field label="Daily savings goal">
            <input
              type="number"
              min="0"
              value={state.dailySavingGoal}
              onChange={(e) => onUpdate({ dailySavingGoal: Number(e.target.value) || 0 })}
              className="input num"
            />
          </Field>
        </div>
      </div>

      <div className="card p-6">
        <div className="text-[14px] font-medium">Data</div>
        <div className="text-[11.5px] text-sub mb-5">
          All data lives in your browser. Export from the Integrations tab to back up.
        </div>
        <button
          onClick={onReset}
          className="btn-ghost text-danger border-danger/30 hover:border-danger/50"
        >
          <RefreshCcw size={13} /> Reset to sample data
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label mb-1.5">{label}</div>
      {children}
    </div>
  );
}
