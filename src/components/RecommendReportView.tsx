import { Sparkles } from "lucide-react";
import { RankingTable } from "@/components/RankingTable";
import { TrendChart } from "@/components/TrendChart";
import { FactorBars } from "@/components/FactorBars";
import { AnomalyTable } from "@/components/AnomalyTable";
import { CompositeScoreBadge } from "@/components/CompositeScoreBadge";
import type { RecommendReport } from "@/lib/pipeline/recommend";

// Pure presentational report body, shared by the standalone /recommend form
// and the chat's inline report bubble.
export function RecommendReportView({ report }: { report: RecommendReport }) {
  const top = report.ranked[0];

  return (
    <div className="space-y-7">
      <section className="rounded-lg bg-accent-tint p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-accent-text">
            <Sparkles size={13} />
            选品委员会结论
          </h3>
          <span className="text-[11px] text-muted">
            {report.source === "llm" ? "AI生成" : "规则引擎(未配置大模型)"}
          </span>
        </div>
        {top && (
          <div className="mb-2">
            <CompositeScoreBadge score={top.factorReport.compositeScore} size="sm" />
          </div>
        )}
        <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-foreground">{report.narrative}</p>
      </section>

      <section>
        <h3 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wide text-muted">候选排名</h3>
        <div className="rounded-lg border border-border bg-card p-4">
          <RankingTable ranked={report.ranked} />
        </div>
      </section>

      {top && (
        <>
          <section>
            <h3 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wide text-muted">
              首选方案趋势 · {top.product.name}
            </h3>
            <div className="rounded-lg border border-border bg-card p-4">
              <TrendChart
                series={top.product.series}
                anomalyDates={new Set(top.factorReport.anomalies.map((a) => a.date))}
              />
            </div>
          </section>
          <AnomalyTable anomalies={top.factorReport.anomalies} />
          <section>
            <h3 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wide text-muted">首选方案因子明细</h3>
            <div className="rounded-lg border border-border bg-card p-4">
              <FactorBars factors={top.factorReport.factors} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
