"use client";

import { useState } from "react";
import { Loader2, Search, TriangleAlert } from "lucide-react";
import { TrendChart } from "@/components/TrendChart";
import { FactorBars } from "@/components/FactorBars";
import { AnomalyTable } from "@/components/AnomalyTable";
import { CompositeScoreBadge } from "@/components/CompositeScoreBadge";
import type { ProductRecord } from "@/lib/data/types";
import type { FactorReport } from "@/lib/factors/types";

interface FactorResult {
  product: ProductRecord;
  factorReport: FactorReport;
}

export function FactorLookupForm() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FactorResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/factors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "查询失败");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "查询失败");
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
          placeholder="输入商品名称,只看因子打分,不跑AI辩论(更快)"
          className="flex-1 rounded-md border border-border bg-card px-3.5 py-2.5 text-[13.5px] text-foreground outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-4 py-2.5 text-[13.5px] font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          {loading ? "计算中" : "查因子"}
        </button>
      </form>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-negative-border bg-negative-tint px-3.5 py-2.5 text-[13px] text-negative">
          <TriangleAlert size={15} />
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-7">
          <section>
            <div className="mb-2 flex items-end justify-between">
              <p className="text-[13px] text-muted">
                {result.product.name} · {result.product.category} · {result.product.currency}
              </p>
              <CompositeScoreBadge score={result.factorReport.compositeScore} />
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <TrendChart
                series={result.product.series}
                anomalyDates={new Set(result.factorReport.anomalies.map((a) => a.date))}
              />
            </div>
          </section>

          <AnomalyTable anomalies={result.factorReport.anomalies} />

          <section>
            <h3 className="mb-2.5 text-[12px] font-semibold uppercase tracking-wide text-muted">核心因子明细</h3>
            <div className="rounded-lg border border-border bg-card p-4">
              <FactorBars factors={result.factorReport.factors} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
