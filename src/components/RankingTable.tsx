import type { RankedCandidate } from "@/lib/pipeline/recommend";

function scoreColor(score: number): string {
  if (score >= 65) return "text-positive";
  if (score >= 45) return "text-warning";
  return "text-negative";
}

export function RankingTable({ ranked }: { ranked: RankedCandidate[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
            <th className="py-2 pr-3 font-medium">排名</th>
            <th className="py-2 pr-3 font-medium">候选商品</th>
            <th className="py-2 pr-3 font-medium">综合评分</th>
            <th className="py-2 pr-3 font-medium">数据置信度</th>
            <th className="py-2 pr-3 font-medium">类目</th>
            <th className="py-2 pr-3 font-medium">预估毛利率</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((c) => (
            <tr key={c.product.id} className="border-b border-border last:border-0">
              <td className="py-2.5 pr-3 font-mono tabular-nums text-muted">#{c.rank}</td>
              <td className="py-2.5 pr-3 font-medium text-foreground">{c.product.name}</td>
              <td className={`py-2.5 pr-3 font-mono tabular-nums font-semibold ${scoreColor(c.factorReport.compositeScore)}`}>
                {c.factorReport.compositeScore}
              </td>
              <td className="py-2.5 pr-3 text-muted">{c.factorReport.confidenceLabel}</td>
              <td className="py-2.5 pr-3 text-muted">{c.product.category}</td>
              <td className="py-2.5 pr-3 font-mono tabular-nums text-muted">{(c.product.marginRate * 100).toFixed(0)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
