import { useMemo, useState } from "react";
import TransactionTable from "../components/TransactionTable";
import type { Category, FinanceState, Transaction, TxnType } from "../lib/types";

interface Props {
  state: FinanceState;
  onDelete: (id: string) => void;
}

const TYPES: ("all" | TxnType)[] = ["all", "expense", "income", "saving"];

export default function Transactions({ state, onDelete }: Props) {
  const [type, setType] = useState<(typeof TYPES)[number]>("all");
  const [cat, setCat] = useState<Category | "all">("all");
  const [q, setQ] = useState("");

  const cats = useMemo(() => {
    const s = new Set<Category>();
    state.transactions.forEach((t) => s.add(t.category));
    return Array.from(s);
  }, [state.transactions]);

  const rows = state.transactions.filter((t) => {
    if (type !== "all" && t.type !== type) return false;
    if (cat !== "all" && t.category !== cat) return false;
    if (q && !t.description.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="card p-4 flex flex-wrap gap-2 items-center">
        <input
          placeholder="Search description..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="input max-w-xs"
        />
        <div className="flex gap-1.5">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize border ${
                type === t
                  ? "bg-white/[0.06] border-accent-500/40 text-accent-400"
                  : "border-white/5 text-slate-300 hover:bg-white/[0.04]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value as Category | "all")}
          className="input max-w-[180px]"
        >
          <option value="all" className="bg-ink-900">All categories</option>
          {cats.map((c) => (
            <option key={c} value={c} className="bg-ink-900">
              {c}
            </option>
          ))}
        </select>
        <div className="ml-auto text-xs text-slate-400">
          {rows.length} of {state.transactions.length} shown
        </div>
      </div>
      <TransactionTable transactions={rows} currency={state.currency} onDelete={onDelete} />
    </div>
  );
}
