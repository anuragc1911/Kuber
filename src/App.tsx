import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar, { type View } from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./views/Dashboard";
import Transactions from "./views/Transactions";
import SavingsView from "./views/SavingsView";
import ExcelView from "./views/ExcelView";
import Settings from "./views/Settings";
import AddTransactionModal from "./components/AddTransactionModal";
import { loadState, resetState, saveState } from "./lib/storage";
import type { Category, FinanceState, Transaction } from "./lib/types";

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [state, setState] = useState<FinanceState>(() => loadState());
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addTxn = useCallback((t: Transaction) => {
    setState((s) => ({ ...s, transactions: [t, ...s.transactions] }));
  }, []);

  const importTxns = useCallback((txns: Transaction[]) => {
    setState((s) => ({ ...s, transactions: [...txns, ...s.transactions] }));
  }, []);

  const deleteTxn = useCallback((id: string) => {
    setState((s) => ({ ...s, transactions: s.transactions.filter((t) => t.id !== id) }));
  }, []);

  const setLimit = useCallback((cat: Category, value: number) => {
    setState((s) => {
      const exists = s.limits.find((l) => l.category === cat);
      const limits = exists
        ? s.limits.map((l) => (l.category === cat ? { ...l, monthly: value } : l))
        : [...s.limits, { category: cat, monthly: value }];
      return { ...s, limits };
    });
  }, []);

  const updateState = useCallback((patch: Partial<FinanceState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const setDailyGoal = useCallback((n: number) => {
    setState((s) => ({ ...s, dailySavingGoal: n }));
  }, []);

  const reset = useCallback(() => setState(resetState()), []);

  const content = useMemo(() => {
    switch (view) {
      case "dashboard":
        return <Dashboard state={state} />;
      case "transactions":
        return <Transactions state={state} onDelete={deleteTxn} />;
      case "savings":
        return (
          <SavingsView
            state={state}
            onAddTxn={addTxn}
            onSetGoal={setDailyGoal}
            onLimitChange={setLimit}
          />
        );
      case "excel":
        return <ExcelView state={state} onImport={importTxns} />;
      case "settings":
        return <Settings state={state} onUpdate={updateState} onReset={reset} />;
    }
  }, [view, state, addTxn, deleteTxn, setDailyGoal, setLimit, importTxns, updateState, reset]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar view={view} onChange={setView} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onAdd={() => setAdding(true)} />
        <main className="flex-1 overflow-auto px-7 py-6">{content}</main>
      </div>
      <AddTransactionModal open={adding} onClose={() => setAdding(false)} onAdd={addTxn} />
    </div>
  );
}
