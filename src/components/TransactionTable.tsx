import { Trash2 } from "lucide-react";
import { fmtMoney } from "../lib/finance";
import type { Transaction } from "../lib/types";

interface Props {
  transactions: Transaction[];
  currency: string;
  onDelete?: (id: string) => void;
  limit?: number;
  title?: string;
}

const typeColor: Record<Transaction["type"], string> = {
  income: "text-accent-glow",
  expense: "text-text",
  saving: "text-info",
};

const typeDot: Record<Transaction["type"], string> = {
  income: "bg-accent",
  expense: "bg-muted",
  saving: "bg-info",
};

export default function TransactionTable({ transactions, currency, onDelete, limit, title }: Props) {
  const rows = [...transactions]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit ?? transactions.length);

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-line flex items-center justify-between">
        <div className="label">{title || "Activity"}</div>
        <div className="text-[11px] text-sub">{rows.length} entries</div>
      </div>
      <div className="overflow-auto max-h-[520px]">
        <table className="w-full text-[13px]">
          <thead className="text-[10.5px] uppercase tracking-widest2 text-sub">
            <tr>
              <th className="text-left font-medium px-5 py-2.5">Date</th>
              <th className="text-left font-medium px-5 py-2.5">Description</th>
              <th className="text-left font-medium px-5 py-2.5">Category</th>
              <th className="text-right font-medium px-5 py-2.5">Amount</th>
              {onDelete && <th className="px-3" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-t border-line hover:bg-elev/60 transition-colors">
                <td className="px-5 py-3 text-sub whitespace-nowrap num">
                  {new Date(t.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                </td>
                <td className="px-5 py-3 text-text">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${typeDot[t.type]}`} />
                    {t.description}
                  </div>
                </td>
                <td className="px-5 py-3 text-dim">{t.category}</td>
                <td className={`px-5 py-3 text-right font-medium num ${typeColor[t.type]}`}>
                  {t.type === "expense" ? "−" : t.type === "income" ? "+" : ""}
                  {fmtMoney(t.amount, currency)}
                </td>
                {onDelete && (
                  <td className="px-3">
                    <button
                      onClick={() => onDelete(t.id)}
                      className="p-1.5 rounded-md text-sub hover:text-danger hover:bg-danger/10"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={5} className="text-center text-sub py-10">
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
