import { TriangleAlert } from "lucide-react";
import type { AnomalyEvent } from "@/lib/factors/types";

export function AnomalyTable({ anomalies }: { anomalies: AnomalyEvent[] }) {
  if (anomalies.length === 0) return null;

  return (
    <div className="rounded-lg border border-negative-border bg-negative-tint p-4">
      <h3 className="mb-2.5 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-negative">
        <TriangleAlert size={13} />
        异常峰值 · {anomalies.length}次
      </h3>
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-negative-border/60 text-[11px] uppercase tracking-wide text-muted">
            <th className="py-1.5 pr-3 font-medium">日期</th>
            <th className="py-1.5 pr-3 font-medium">销量</th>
            <th className="py-1.5 pr-3 font-medium">偏离程度(z)</th>
          </tr>
        </thead>
        <tbody>
          {anomalies.map((a) => (
            <tr key={a.date} className="border-b border-negative-border/30 last:border-0">
              <td className="py-1.5 pr-3 font-mono tabular-nums text-foreground">{a.date}</td>
              <td className="py-1.5 pr-3 font-mono tabular-nums text-foreground">{a.sales}</td>
              <td className="py-1.5 pr-3 font-mono tabular-nums text-negative">{a.zScore.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
