import type { FactorScore } from "@/lib/factors/types";

function scoreColor(score: number): string {
  if (score >= 65) return "bg-positive";
  if (score >= 45) return "bg-warning";
  return "bg-negative";
}

export function FactorBars({ factors }: { factors: FactorScore[] }) {
  return (
    <div className="space-y-4">
      {factors.map((f) => (
        <div key={f.key}>
          <div className="flex items-baseline justify-between">
            <span className="text-[13.5px] font-medium text-foreground">{f.label}</span>
            <span className="font-mono text-[12.5px] tabular-nums text-muted">{f.score}/100</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-border">
            <div
              className={`h-1.5 rounded-full ${scoreColor(f.score)}`}
              style={{ width: `${Math.max(2, f.score)}%` }}
            />
          </div>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{f.explanation}</p>
        </div>
      ))}
    </div>
  );
}
