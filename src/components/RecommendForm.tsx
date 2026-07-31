"use client";

import { useState } from "react";
import { Loader2, Search, TriangleAlert } from "lucide-react";
import { RecommendReportView } from "@/components/RecommendReportView";
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

      {report && <div className="mt-8"><RecommendReportView report={report} /></div>}
    </div>
  );
}
