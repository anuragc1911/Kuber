import { Plus } from "lucide-react";
import LimitsList from "../components/LimitsList";
import KpiCard from "../components/KpiCard";
import type { Category, FinanceState, Transaction } from "../lib/types";
import {
  fmtMoney,
  newTransaction,
  spendByCategory,
  todayISO,
  totalsThisMonth,
} from "../lib/finance";
import { computeStreak } from "../lib/aiCfo";

interface Props {
  state: FinanceState;
  onAddTxn: (t: Transaction) => void;
  onSetGoal: (n: number) => void;
  onLimitChange: (cat: Category, value: number) => void;
}

export default function SavingsView({ state, onAddTxn, onSetGoal, onLimitChange }: Props) {
  const totals = totalsThisMonth(state);
  const byCat = spendByCategory(state);
  const streak = computeStreak(state);
  const todayPct = state.dailySavingGoal > 0
    ? Math.min(1, totals.todaySavings / state.dailySavingGoal)
    : 0;

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
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          label="Today"
          scope="savings goal"
          value={`${Math.round(todayPct * 100)}%`}
          hint={`${fmtMoney(totals.todaySavings, state.currency)} of ${fmtMoney(state.dailySavingGoal, state.currency)}`}
          action={
            <button onClick={quickSave} className="btn-primary h-7 px-2 text-[11.5px]">
              <Plus size={11} /> Save
            </button>
          }
        />
        <KpiCard
          label="Streak"
          scope="daily saves"
          value={`${streak} days`}
          hint={`${fmtMoney(state.dailySavingGoal * streak, state.currency)} saved in streak`}
        />
        <KpiCard
          label="Saved"
          scope="this month"
          value={fmtMoney(totals.savings, state.currency)}
          hint={`${fmtMoney(state.dailySavingGoal * 30, state.currency)}/mo target`}
        />
      </div>

      <div className="col-span-12 lg:col-span-7 card p-5">
        <div className="label">Daily savings goal</div>
        <div className="text-[15px] font-medium mt-1 mb-4">Set how much to set aside each day</div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {[100, 500, 1000, 1500, 2500, 5000].map((v) => (
            <button
              key={v}
              onClick={() => onSetGoal(v)}
              className={`py-2 rounded-md text-[12px] num transition-colors border ${
                state.dailySavingGoal === v
                  ? "border-accent text-accent-glow bg-accent/5"
                  : "border-line text-dim hover:text-text hover:border-muted"
              }`}
            >
              {fmtMoney(v, state.currency)}
            </button>
          ))}
        </div>
        <input
          type="number"
          min="0"
          value={state.dailySavingGoal}
          onChange={(e) => onSetGoal(Number(e.target.value) || 0)}
          className="input num mt-3 text-center"
        />
        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          <Tile k="Weekly" v={fmtMoney(state.dailySavingGoal * 7, state.currency)} />
          <Tile k="Monthly" v={fmtMoney(state.dailySavingGoal * 30, state.currency)} />
          <Tile k="Yearly" v={fmtMoney(state.dailySavingGoal * 365, state.currency)} />
        </div>
      </div>

      <div className="col-span-12 lg:col-span-5">
        <LimitsList state={state} byCategory={byCat} onChange={onLimitChange} />
      </div>
    </div>
  );
}

function Tile({ k, v }: { k: string; v: string }) {
  return (
    <div className="p-3 rounded-lg bg-elev border border-line">
      <div className="label">{k}</div>
      <div className="num text-text font-medium text-[15px] mt-1">{v}</div>
    </div>
  );
}
