import { TrendingUp, TrendingDown } from "lucide-react";
import type { DebateArgument } from "@/lib/pipeline/evaluate";

export function DebateView({ bull, bear }: { bull: DebateArgument; bear: DebateArgument }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="mb-2.5 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-positive">
          <TrendingUp size={14} strokeWidth={2.25} />
          看多分析师
        </h4>
        <ul className="space-y-2 text-[13px] leading-relaxed text-foreground">
          {bull.points.map((p, i) => (
            <li key={i}>{p.replace(/^[-*•]\s*/, "")}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="mb-2.5 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-negative">
          <TrendingDown size={14} strokeWidth={2.25} />
          看空分析师
        </h4>
        <ul className="space-y-2 text-[13px] leading-relaxed text-foreground">
          {bear.points.map((p, i) => (
            <li key={i}>{p.replace(/^[-*•]\s*/, "")}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
