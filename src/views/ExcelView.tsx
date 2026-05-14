import ExcelSync from "../components/ExcelSync";
import TransactionTable from "../components/TransactionTable";
import type { FinanceState, Transaction } from "../lib/types";

interface Props {
  state: FinanceState;
  onImport: (txns: Transaction[]) => void;
}

export default function ExcelView({ state, onImport }: Props) {
  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 lg:col-span-5">
        <ExcelSync transactions={state.transactions} onImport={onImport} />
        <div className="card p-5 mt-5">
          <div className="label">Schema</div>
          <div className="font-semibold mb-3 mt-0.5">Required columns</div>
          <ul className="text-sm text-slate-300 space-y-1.5">
            <li><span className="text-accent-400 font-mono">Date</span> — YYYY-MM-DD or Excel date</li>
            <li><span className="text-accent-400 font-mono">Description</span> — any text</li>
            <li><span className="text-accent-400 font-mono">Category</span> — Food, Transport, Rent, etc.</li>
            <li><span className="text-accent-400 font-mono">Type</span> — expense / income / saving</li>
            <li><span className="text-accent-400 font-mono">Amount</span> — positive number</li>
            <li><span className="text-slate-500 font-mono">Note</span> — optional</li>
          </ul>
        </div>
      </div>
      <div className="col-span-12 lg:col-span-7">
        <TransactionTable transactions={state.transactions} currency={state.currency} limit={20} compact />
      </div>
    </div>
  );
}
