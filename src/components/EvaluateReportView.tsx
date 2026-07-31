import { TrendChart } from "@/components/TrendChart";
import { FactorBars } from "@/components/FactorBars";
import { VerdictCard } from "@/components/VerdictCard";
import { DebateView } from "@/components/DebateView";
import { AnomalyTable } from "@/components/AnomalyTable";
import { CompositeScoreBadge } from "@/components/CompositeScoreBadge";
import type { EvaluateReport } from "@/lib/pipeline/evaluate";

// Pure presentational report body, shared by the standalone /evaluate form
// and the chat's inline report bubble — the pipeline call and error/loading
// states stay with each caller, this component only ever renders a finished report.
export function EvaluateReportView({ report }: { report: EvaluateReport }) {
  return (
    <div className="space-y-7">
      <section>
        <div className="mb-2 flex items-end justify-between">
          <p className="text-[13px] text-muted">
            {report.product.name} · {report.product.category} · {report.product.currency}
          </p>
          <CompositeScoreBadge score={report.factorReport.compositeScore} />
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <TrendChart
            series={report.product.series}
            anomalyDates={new Set(report.factorReport.anomalies.map((a) => a.date))}
          />
        </div>
      </section>

      <AnomalyTable anomalies={report.factorReport.anomalies} />

      <VerdictCard decision={report.decision} />

      <section>
        <h3 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wide text-muted">看多 / 看空辩论</h3>
        <DebateView bull={report.bull} bear={report.bear} />
      </section>

      <section>
        <h3 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wide text-muted">核心因子分析</h3>
        <div className="rounded-lg border border-border bg-card p-4">
          <FactorBars factors={report.factorReport.factors} />
        </div>
      </section>
    </div>
  );
}
