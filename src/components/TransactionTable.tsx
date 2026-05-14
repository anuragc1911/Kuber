import { Trash2 } from "lucide-react";
import { fmtMoney } from "../lib/finance";
import type { Transaction } from "../lib/types";

interface Props {
  transactions: Transaction[];
  currency: string;
  onDelete?: (id: string) => void;
  limit?: number;
  compact?: boolean;
}

const typeStyle: Record<Transaction["type"], string> = {
  income: "bg-accent-500/10 text-accent-400",
  expense: "bg-pink-500/10 text-pink-300",
  saving: "bg-cyan-500/10 text-cyan-300",
};

export default function TransactionTable({ transactions, currency, onDelete, limit, compact }: Props) {
  const rows = [...transactions]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit ?? transactions.length);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div>
          <div className="label">{compact ? "Recent activity" : "All transactions"}</div>
          <div className="font-semibold">{rows.length} entries</div>
        </div>
      </div>
      <div className="overflow-auto max-h-[520px]">
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-white/[0.02]">
            <tr>
              <th className="text-left font-medium px-5 py-3">Date</th>
              <th className="text-left font-medium px-5 py-3">Description</th>
              <th className="text-left font-medium px-5 py-3">Category</th>
              <th className="text-left font-medium px-5 py-3">Type</th>
              <th className="text-right font-medium px-5 py-3">Amount</th>
              {onDelete && <th className="px-3" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="px-5 py-3 text-slate-400 whitespace-nowrap">
                  {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </td>
                <td className="px-5 py-3 font-medium">{t.description}</td>
                <td className="px-5 py-3 text-slate-300">{t.category}</td>
                <td className="px-5 py-3">
                  <span className={`pill ${typeStyle[t.type]} capitalize`}>{t.type}</span>
                </td>
                <td
                  className={`px-5 py-3 text-right font-semibold ${
                    t.type === "income" ? "text-accent-400" : t.type === "saving" ? "text-cyan-300" : "text-slate-100"
                  }`}
                >
                  {t.type === "expense" ? "−" : t.type === "income" ? "+" : ""}{fmtMoney(t.amount, currency)}
                </td>
                {onDelete && (
                  <td className="px-3">
                    <button
                      onClick={() => onDelete(t.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-pink-300 hover:bg-pink-500/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={6} className="text-center text-slate-500 py-10">
                  No transactions yet. Add one or import from Excel.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
