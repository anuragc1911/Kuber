import { AlertTriangle, CheckCircle2, Info, AlertOctagon, type LucideIcon } from "lucide-react";
import type { AIInsight, FinanceState } from "../lib/types";
import { generateInsights } from "../lib/aiCfo";

const toneIcon: Record<AIInsight["tone"], LucideIcon> = {
  positive: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
  danger: AlertOctagon,
};
const toneColor: Record<AIInsight["tone"], string> = {
  positive: "text-accent-glow bg-accent/10",
  warning: "text-warn bg-warn/10",
  info: "text-info bg-info/10",
  danger: "text-danger bg-danger/10",
};

export default function Insights({ state }: { state: FinanceState }) {
  const insights = generateInsights(state);
  return (
    <div className="space-y-3">
      <div className="card p-5">
        <div className="label">Insights</div>
        <div className="text-[14px] font-medium mt-1">
          {insights.length} observation{insights.length === 1 ? "" : "s"} from your data
        </div>
      </div>
      {insights.length === 0 && (
        <div className="card p-10 text-center text-sub text-[13px]">
          Nothing noteworthy. Add more transactions and Claude will surface patterns.
        </div>
      )}
      {insights.map((it) => {
        const Icon = toneIcon[it.tone];
        return (
          <div key={it.id} className="card p-5 flex items-start gap-3">
            <div className={`w-8 h-8 rounded-md grid place-items-center shrink-0 ${toneColor[it.tone]}`}>
              <Icon size={14} />
            </div>
            <div>
              <div className="text-[13.5px] text-text">{it.title}</div>
              <div className="text-[12px] text-dim mt-0.5 leading-relaxed">{it.body}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
