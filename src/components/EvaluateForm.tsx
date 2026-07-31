"use client";

import { useState } from "react";
import { Loader2, Search, TriangleAlert } from "lucide-react";
import { TrendChart } from "@/components/TrendChart";
import { FactorBars } from "@/components/FactorBars";
import { VerdictCard } from "@/components/VerdictCard";
import { DebateView } from "@/components/DebateView";
import { AnomalyTable } from "@/components/AnomalyTable";
import { CompositeScoreBadge } from "@/components/CompositeScoreBadge";
import type { EvaluateReport } from "@/lib/pipeline/evaluate";

export function EvaluateForm() {
  const [query, setQuery] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<EvaluateReport | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, costPrice: costPrice ? Number(costPrice) : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成报告失败");
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成报告失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-8 sm:py-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例如:充电式电钻套装(接入Mercado Libre后可直接填商品ID,如MLM1443244161)"
          className="flex-1 rounded-md border border-border bg-card px-3.5 py-2.5 text-[13.5px] text-foreground outline-none placeholder:text-muted focus:border-accent"
        />
        <input
          value={costPrice}
          onChange={(e) => setCostPrice(e.target.value)}
          placeholder="可选:成本价"
          type="number"
          className="w-full rounded-md border border-border bg-card px-3.5 py-2.5 text-[13.5px] text-foreground outline-none placeholder:text-muted focus:border-accent sm:w-32"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-4 py-2.5 text-[13.5px] font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          {loading ? "分析中" : "生成报告"}
        </button>
      </form>
      <p className="mt-2 text-[12px] text-muted">
        填成本价可以算出真实毛利率;不填的话毛利率因子会用25%占位值(平台API本来就拿不到这个信息)
      </p>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-negative-border bg-negative-tint px-3.5 py-2.5 text-[13px] text-negative">
          <TriangleAlert size={15} />
          {error}
        </div>
      )}

      {report && (
        <div className="mt-8 space-y-7">
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
      )}
    </div>
  );
}
