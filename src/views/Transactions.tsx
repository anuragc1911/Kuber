import { useMemo, useState } from "react";
import TransactionTable from "../components/TransactionTable";
import type { Category, FinanceState, TxnType } from "../lib/types";

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
      <div className="flex flex-wrap items-center gap-2">
        <input
          placeholder="Search description…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="input max-w-xs"
        />
        <div className="flex gap-1 p-1 bg-elev rounded-lg border border-line">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1 rounded-md text-[12px] capitalize transition-colors ${
                type === t ? "bg-bg text-text" : "text-sub hover:text-text"
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
          <option value="all">All categories</option>
          {cats.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="ml-auto text-[11px] text-sub">
          {rows.length} of {state.transactions.length}
        </div>
      </div>
      <TransactionTable
        transactions={rows}
        currency={state.currency}
        onDelete={onDelete}
        title="Transactions"
      />
    </div>
  );
}
