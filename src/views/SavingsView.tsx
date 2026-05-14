import { PiggyBank, Plus } from "lucide-react";
import SavingsRing from "../components/SavingsRing";
import LimitsList from "../components/LimitsList";
import type { Category, FinanceState, Transaction } from "../lib/types";
import { fmtMoney, newTransaction, spendByCategory, todayISO, totalsThisMonth } from "../lib/finance";

interface Props {
  state: FinanceState;
  onAddTxn: (t: Transaction) => void;
  onSetGoal: (n: number) => void;
  onLimitChange: (cat: Category, value: number) => void;
}

export default function SavingsView({ state, onAddTxn, onSetGoal, onLimitChange }: Props) {
  const totals = totalsThisMonth(state);
  const byCat = spendByCategory(state);

  function quickSave() {
    onAddTxn(
      newTransaction({
        type: "saving",
        date: todayISO(),
        description: "Quick save",
        amount: state.dailySavingGoal,
        category: "Savings",
      })
    );
  }

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 lg:col-span-7 space-y-5">
        <SavingsRing state={state} todaySaved={totals.todaySavings} />
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="label">Daily savings goal</div>
              <div className="font-semibold mt-0.5">How much do you want to put aside each day?</div>
            </div>
            <button onClick={quickSave} className="btn-primary">
              <Plus size={15} /> Save {fmtMoney(state.dailySavingGoal, state.currency)} now
            </button>
          </div>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[10, 20, 25, 50, 75, 100].map((v) => (
              <button
                key={v}
                onClick={() => onSetGoal(v)}
                className={`py-2.5 rounded-xl border text-sm font-medium ${
                  state.dailySavingGoal === v
                    ? "border-accent-500/60 bg-accent-500/10 text-accent-400"
                    : "border-white/5 hover:bg-white/[0.04] text-slate-200"
                }`}
              >
                {fmtMoney(v, state.currency)}
              </button>
            ))}
            <input
              type="number"
              min="0"
              value={state.dailySavingGoal}
              onChange={(e) => onSetGoal(Number(e.target.value) || 0)}
              className="input col-span-2 sm:col-span-4 text-center"
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-[11px] text-slate-400">Weekly</div>
              <div className="font-semibold">{fmtMoney(state.dailySavingGoal * 7, state.currency)}</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-[11px] text-slate-400">Monthly</div>
              <div className="font-semibold">{fmtMoney(state.dailySavingGoal * 30, state.currency)}</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-[11px] text-slate-400">Yearly</div>
              <div className="font-semibold">{fmtMoney(state.dailySavingGoal * 365, state.currency)}</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2.5">
            <PiggyBank size={18} className="text-accent-400" />
            <div className="font-semibold">Savings so far this month</div>
            <div className="ml-auto text-xl font-bold">{fmtMoney(totals.savings, state.currency)}</div>
          </div>
        </div>
      </div>
      <div className="col-span-12 lg:col-span-5">
        <LimitsList state={state} byCategory={byCat} onChange={onLimitChange} />
      </div>
    </div>
  );
}
