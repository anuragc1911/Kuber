import type { ReactNode } from "react";

interface Props {
  label: string;
  scope?: string;
  value: string;
  subValue?: string;
  delta?: { value: number; positive?: boolean; suffix?: string };
  hint?: ReactNode;
  size?: "lg" | "md";
  action?: ReactNode;
}

export default function KpiCard({ label, scope, value, subValue, delta, hint, size = "md", action }: Props) {
  return (
    <div className="card p-5 card-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="label flex items-center gap-2">
          <span>{label}</span>
          {scope && (
            <>
              <span className="text-muted">·</span>
              <span className="text-sub">{scope}</span>
            </>
          )}
        </div>
        {action}
      </div>
      <div className={`mt-2 num text-text ${size === "lg" ? "text-kpiLg" : "text-kpi"}`}>
        {value}
      </div>
      {subValue && <div className="text-[13px] text-dim mt-1.5 num">{subValue}</div>}
      {(delta || hint) && (
        <div className="mt-3 flex items-center gap-2 text-[12px]">
          {delta && (
            <span
              className={`num font-medium ${
                delta.positive === false ? "text-danger" : "text-accent-glow"
              }`}
            >
              {delta.positive === false ? "↓" : "↑"} {Math.abs(delta.value).toFixed(0)}%
              {delta.suffix ? ` ${delta.suffix}` : " vs prior 30d"}
            </span>
          )}
          {hint && <span className="text-sub">{hint}</span>}
        </div>
      )}
    </div>
  );
}
