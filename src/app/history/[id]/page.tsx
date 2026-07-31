import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { EvaluateReportView } from "@/components/EvaluateReportView";
import { RecommendReportView } from "@/components/RecommendReportView";
import { getHistoryById } from "@/lib/history/store";
import type { EvaluateReport } from "@/lib/pipeline/evaluate";
import type { RecommendReport } from "@/lib/pipeline/recommend";

export default async function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = getHistoryById(id);
  if (!record) notFound();

  return (
    <main className="flex min-h-full flex-1 flex-col">
      <PageHeader
        title={record.query}
        subtitle={`${new Date(record.createdAt).toLocaleString("zh-CN")} · ${record.type === "recommend" ? "选品推荐" : "单品诊断"}`}
      />
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
        {record.type === "evaluate" ? (
          <EvaluateReportView report={record.payload as EvaluateReport} />
        ) : (
          <RecommendReportView report={record.payload as RecommendReport} />
        )}
      </div>
    </main>
  );
}
