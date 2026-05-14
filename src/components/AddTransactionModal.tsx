import { useState } from "react";
import { X } from "lucide-react";
import type { Category, Transaction, TxnType } from "../lib/types";
import { newTransaction, todayISO } from "../lib/finance";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (t: Transaction) => void;
}

const CATS: Category[] = [
  "Food",
  "Transport",
  "Rent",
  "Utilities",
  "Shopping",
  "Entertainment",
  "Health",
  "Savings",
  "Income",
  "Other",
];

export default function AddTransactionModal({ open, onClose, onAdd }: Props) {
  const [type, setType] = useState<TxnType>("expense");
  const [date, setDate] = useState(todayISO());
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Food");

  if (!open) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!desc || !amount) return;
    onAdd(
      newTransaction({
        type,
        date,
        description: desc,
        amount: Number(amount),
        category: type === "income" ? "Income" : type === "saving" ? "Savings" : category,
      })
    );
    setDesc("");
    setAmount("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
      <form onSubmit={submit} className="card glow-border w-full max-w-md p-6">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-lg">New transaction</div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5">
            <X size={16} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-5">
          {(["expense", "saving", "income"] as TxnType[]).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setType(t)}
              className={`py-2 rounded-xl text-sm font-medium capitalize border ${
                type === t
                  ? "bg-white/[0.06] border-accent-500/40 text-accent-400"
                  : "bg-transparent border-white/5 text-slate-300 hover:bg-white/[0.04]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <div className="label mb-1.5">Date</div>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
          </div>
          <div>
            <div className="label mb-1.5">Amount</div>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="input"
              required
            />
          </div>
        </div>
        <div className="mt-3">
          <div className="label mb-1.5">Description</div>
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. Coffee shop" className="input" required />
        </div>
        {type === "expense" && (
          <div className="mt-3">
            <div className="label mb-1.5">Category</div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="input"
            >
              {CATS.filter((c) => c !== "Income" && c !== "Savings").map((c) => (
                <option key={c} value={c} className="bg-ink-900">
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
