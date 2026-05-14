import ExcelSync from "../components/ExcelSync";
import TransactionTable from "../components/TransactionTable";
import type { FinanceState, Transaction } from "../lib/types";

interface Props {
  state: FinanceState;
  onImport: (txns: Transaction[]) => void;
}

export default function ExcelView({ state, onImport }: Props) {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 lg:col-span-5 space-y-4">
        <ExcelSync transactions={state.transactions} onImport={onImport} />
        <div className="card p-5">
          <div className="label">Schema</div>
          <div className="text-[14px] font-medium mt-1 mb-3">Required columns</div>
          <ul className="text-[12.5px] text-dim space-y-1.5">
            <li><span className="text-accent-glow font-mono">Date</span> — YYYY-MM-DD or Excel date</li>
            <li><span className="text-accent-glow font-mono">Description</span> — any text</li>
            <li><span className="text-accent-glow font-mono">Category</span> — Food, Transport, Rent, etc.</li>
            <li><span className="text-accent-glow font-mono">Type</span> — expense / income / saving</li>
            <li><span className="text-accent-glow font-mono">Amount</span> — positive number</li>
            <li><span className="text-sub font-mono">Note</span> — optional</li>
          </ul>
        </div>
      </div>
      <div className="col-span-12 lg:col-span-7">
        <TransactionTable
          transactions={state.transactions}
          currency={state.currency}
          limit={20}
          title="Latest imports"
        />
      </div>
    </div>
  );
}
