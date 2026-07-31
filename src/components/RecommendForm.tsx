"use client";

import { useState } from "react";
import { Loader2, Search, TriangleAlert, Sparkles } from "lucide-react";
import { RankingTable } from "@/components/RankingTable";
import { TrendChart } from "@/components/TrendChart";
import { FactorBars } from "@/components/FactorBars";
import { AnomalyTable } from "@/components/AnomalyTable";
import { CompositeScoreBadge } from "@/components/CompositeScoreBadge";
import type { RecommendReport } from "@/lib/pipeline/recommend";

export function RecommendForm() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<RecommendReport | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, category: category || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成推荐失败");
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成推荐失败");
    } finally {
      setLoading(false);
    }
  }

  const top = report?.ranked[0];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-8 sm:py-8">
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例如:适合墨西哥市场的户外露营小家电"
          className="w-full rounded-md border border-border bg-card px-3.5 py-2.5 text-[13.5px] text-foreground outline-none placeholder:text-muted focus:border-accent"
        />
        <div className="flex gap-2">
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="可选:限定类目"
            className="flex-1 rounded-md border border-border bg-card px-3.5 py-2.5 text-[13.5px] text-foreground outline-none placeholder:text-muted focus:border-accent"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-4 py-2.5 text-[13.5px] font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            {loading ? "分析中" : "生成推荐"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-negative-border bg-negative-tint px-3.5 py-2.5 text-[13px] text-negative">
          <TriangleAlert size={15} />
          {error}
        </div>
      )}

      {report && (
        <div className="mt-8 space-y-7">
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
      )}
    </div>
  );
}
