import CashPositionChart from "../components/CashPositionChart";
import KpiCard from "../components/KpiCard";
import type { FinanceState } from "../lib/types";
import {
  avgMonthlyBurn,
  avgMonthlyIncome,
  currentBalance,
  dailySeries,
  fmtMoney,
  runwayMonths,
} from "../lib/finance";

export default function Forecast({ state }: { state: FinanceState }) {
  const balance = currentBalance(state);
  const burn = avgMonthlyBurn(state);
  const income = avgMonthlyIncome(state);
  const runway = runwayMonths(state);
  const series = dailySeries(state, 60);

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          label="Avg monthly income"
          scope="last 3 months"
          value={fmtMoney(income, state.currency)}
        />
        <KpiCard
          label="Avg monthly burn"
          scope="last 3 months"
          value={fmtMoney(burn, state.currency)}
        />
        <KpiCard
          label="Runway"
          scope="at current burn"
          value={isFinite(runway) ? `${runway.toFixed(1)} mo` : "∞"}
          hint={`balance ${fmtMoney(balance, state.currency)}`}
        />
      </div>
      <div className="col-span-12">
        <CashPositionChart data={series} current={balance} currency={state.currency} />
      </div>
    </div>
  );
}
