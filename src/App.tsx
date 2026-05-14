import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar, { type View } from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./views/Dashboard";
import Transactions from "./views/Transactions";
import SavingsView from "./views/SavingsView";
import ExcelView from "./views/ExcelView";
import Settings from "./views/Settings";
import Alerts from "./views/Alerts";
import Insights from "./views/Insights";
import Forecast from "./views/Forecast";
import AddTransactionModal from "./components/AddTransactionModal";
import { loadState, resetState, saveState } from "./lib/storage";
import { generateInsights } from "./lib/aiCfo";
import { spendByCategory } from "./lib/finance";
import type { Category, FinanceState, Transaction } from "./lib/types";

const titles: Record<View, string> = {
  dashboard: "Home",
  alerts: "Alerts",
  insights: "Insights",
  transactions: "Transactions",
  forecast: "Forecast",
  savings: "Goals & limits",
  excel: "Integrations",
  settings: "Settings",
};

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

  const counts = useMemo(() => {
    const byCat = spendByCategory(state);
    const alerts = state.limits.filter((l) => (byCat[l.category] || 0) > l.monthly).length;
    const insights = generateInsights(state).length;
    return { alerts, insights };
  }, [state]);

  const content = useMemo(() => {
    switch (view) {
      case "dashboard":
        return <Dashboard state={state} />;
      case "alerts":
        return <Alerts state={state} />;
      case "insights":
        return <Insights state={state} />;
      case "transactions":
        return <Transactions state={state} onDelete={deleteTxn} />;
      case "forecast":
        return <Forecast state={state} />;
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
    <div className="flex h-screen w-full overflow-hidden bg-bg text-text">
      <Sidebar
        view={view}
        onChange={setView}
        alertCount={counts.alerts}
        insightCount={counts.insights}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onAdd={() => setAdding(true)} ownerEmail={state.ownerEmail} workspace="personal" />
        <main className="flex-1 overflow-auto">
          <div className="px-6 py-5">
            <div className="flex items-baseline justify-between mb-5">
              <h1 className="text-[20px] font-semibold tracking-tight">{titles[view]}</h1>
              <div className="text-[11.5px] text-sub num">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
            {content}
          </div>
        </main>
      </div>
      <AddTransactionModal open={adding} onClose={() => setAdding(false)} onAdd={addTxn} />
    </div>
  );
}
