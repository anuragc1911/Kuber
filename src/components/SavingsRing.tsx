import { Flame, Target } from "lucide-react";
import { fmtMoney } from "../lib/finance";
import { computeStreak } from "../lib/aiCfo";
import type { FinanceState } from "../lib/types";

interface Props {
  state: FinanceState;
  todaySaved: number;
}

export default function SavingsRing({ state, todaySaved }: Props) {
  const goal = state.dailySavingGoal;
  const pct = goal > 0 ? Math.min(1, todaySaved / goal) : 0;
  const streak = computeStreak(state);
  const radius = 52;
  const c = 2 * Math.PI * radius;
  const offset = c * (1 - pct);

  return (
    <div className="card p-5 flex items-center gap-5">
      <div className="relative w-32 h-32 shrink-0">
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
          <circle cx="70" cy="70" r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="none" />
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="url(#ringGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34E0A1" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400">Today</div>
            <div className="font-bold text-base">{Math.round(pct * 100)}%</div>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <div className="label flex items-center gap-1.5">
          <Target size={12} /> Daily savings goal
        </div>
        <div className="text-xl font-bold mt-0.5">
          {fmtMoney(todaySaved, state.currency)} <span className="text-slate-500 text-sm font-normal">/ {fmtMoney(goal, state.currency)}</span>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="pill bg-orange-500/10 text-orange-300">
            <Flame size={12} /> {streak}-day streak
          </span>
          <span className="pill bg-cyan-500/10 text-cyan-300">
            {fmtMoney(goal * 30, state.currency)} / mo target
          </span>
        </div>
      </div>
    </div>
  );
}
