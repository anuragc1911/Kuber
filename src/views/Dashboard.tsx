import { Wallet, TrendingDown, TrendingUp, PiggyBank } from "lucide-react";
import StatCard from "../components/StatCard";
import SpendingChart from "../components/SpendingChart";
import CategoryDonut from "../components/CategoryDonut";
import SavingsRing from "../components/SavingsRing";
import LimitsList from "../components/LimitsList";
import TransactionTable from "../components/TransactionTable";
import AICfoPanel from "../components/AICfoPanel";
import type { FinanceState } from "../lib/types";
import { dailySeries, fmtMoney, spendByCategory, totalsThisMonth } from "../lib/finance";

interface Props {
  state: FinanceState;
}

export default function Dashboard({ state }: Props) {
  const totals = totalsThisMonth(state);
  const series = dailySeries(state, 30);
  const byCat = spendByCategory(state);
  const balance = totals.income - totals.expenses;

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 xl:col-span-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Balance"
            value={fmtMoney(balance, state.currency)}
            delta={6.4}
            icon={<Wallet size={18} />}
            accent="green"
            hint="Month to date"
          />
          <StatCard
            label="Spent"
            value={fmtMoney(totals.expenses, state.currency)}
            delta={-2.1}
            icon={<TrendingDown size={18} />}
            accent="pink"
          />
          <StatCard
            label="Saved"
            value={fmtMoney(totals.savings, state.currency)}
            delta={12.8}
            icon={<PiggyBank size={18} />}
            accent="cyan"
          />
          <StatCard
            label="Income"
            value={fmtMoney(totals.income, state.currency)}
            delta={0}
            icon={<TrendingUp size={18} />}
            accent="violet"
          />
        </div>
        <SpendingChart data={series} currency={state.currency} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SavingsRing state={state} todaySaved={totals.todaySavings} />
          <LimitsList state={state} byCategory={byCat} />
        </div>
        <CategoryDonut data={byCat} currency={state.currency} />
        <TransactionTable transactions={state.transactions} currency={state.currency} limit={8} compact />
      </div>
      <div className="col-span-12 xl:col-span-4">
        <AICfoPanel state={state} />
      </div>
    </div>
  );
}
