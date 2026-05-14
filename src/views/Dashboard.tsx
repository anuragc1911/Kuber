import KpiCard from "../components/KpiCard";
import CashPositionChart from "../components/CashPositionChart";
import ClaudePanel from "../components/ClaudePanel";
import TransactionTable from "../components/TransactionTable";
import type { FinanceState } from "../lib/types";
import {
  avgMonthlyBurn,
  avgMonthlyIncome,
  currentBalance,
  dailySeries,
  fmtMoney,
  last30VsPrior30,
  runwayMonths,
  spendByCategory,
} from "../lib/finance";

interface Props {
  state: FinanceState;
}

export default function Dashboard({ state }: Props) {
  const balance = currentBalance(state);
  const burn = avgMonthlyBurn(state);
  const income30 = last30VsPrior30(state, "income");
  const savings30 = last30VsPrior30(state, "saving");
  const expense30 = last30VsPrior30(state, "expense");
  const runway = runwayMonths(state);
  const series = dailySeries(state, 60);
  const byCat = spendByCategory(state);
  const totalIncomeLast30 = income30.curr;
  const totalSavingsLast30 = savings30.curr;
  const savingsRate =
    totalIncomeLast30 > 0 ? (totalSavingsLast30 / totalIncomeLast30) * 100 : 0;
  const topCategory = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Top KPI row */}
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiCard
          label="Balance"
          scope="across accounts"
          value={fmtMoney(balance, state.currency)}
          hint={`across ${state.transactions.filter((t) => t.type === "income").length > 0 ? "2 accounts" : "1 account"}`}
          size="lg"
        />
        <KpiCard
          label="Runway"
          scope="at current burn"
          value={
            isFinite(runway)
              ? `${runway.toFixed(1)} mo`
              : "∞"
          }
          hint={`at current burn of ${fmtMoney(burn, state.currency)}/mo`}
          size="lg"
        />
      </div>

      {/* Secondary KPI row */}
      <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiCard
          label="Income"
          scope="30D"
          value={fmtMoney(income30.curr, state.currency)}
          delta={{ value: income30.delta, positive: income30.delta >= 0 }}
        />
        <KpiCard
          label="Savings rate"
          scope="30D"
          value={`${savingsRate.toFixed(0)}%`}
          hint={`${fmtMoney(savings30.curr, state.currency)} saved of ${fmtMoney(
            income30.curr,
            state.currency
          )} earned`}
        />

        {/* Cash position chart spans both cols */}
        <div className="md:col-span-2">
          <CashPositionChart data={series} current={balance} currency={state.currency} />
        </div>

        {/* Mini stats row */}
        <KpiCard
          label="Spent"
          scope="30D"
          value={fmtMoney(expense30.curr, state.currency)}
          delta={{ value: expense30.delta, positive: expense30.delta <= 0 }}
        />
        <KpiCard
          label="Top category"
          scope="this month"
          value={topCategory ? topCategory[0] : "—"}
          hint={topCategory ? fmtMoney(topCategory[1], state.currency) : "no spend yet"}
        />

        <div className="md:col-span-2">
          <TransactionTable
            transactions={state.transactions}
            currency={state.currency}
            limit={8}
            title="Recent activity"
          />
        </div>
      </div>

      {/* Right column — Claude */}
      <div className="col-span-12 lg:col-span-4">
        <div className="sticky top-4">
          <ClaudePanel state={state} />
        </div>
      </div>
    </div>
  );
}
