"use client";

import { useState } from "react";
import Link from "next/link";
import { Compass, Scale, Trash2 } from "lucide-react";
import type { HistoryRecord } from "@/lib/history/store";

function scoreColor(score: number | null): string {
  if (score === null) return "text-muted";
  if (score >= 65) return "text-positive";
  if (score >= 45) return "text-warning";
  return "text-negative";
}

export function HistoryList({ initialRecords }: { initialRecords: HistoryRecord[] }) {
  const [records, setRecords] = useState(initialRecords);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/history/${id}`, { method: "DELETE" });
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  if (records.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card px-4 py-8 text-center text-[13.5px] text-muted">
        还没有记录。去「AI助手」跑一轮选品或诊断,报告会自动存在这里。
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[640px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
            <th className="py-2.5 pl-4 pr-3 font-medium">类型</th>
            <th className="py-2.5 pr-3 font-medium">查询</th>
            <th className="py-2.5 pr-3 font-medium">结果摘要</th>
            <th className="py-2.5 pr-3 font-medium">评分</th>
            <th className="py-2.5 pr-3 font-medium">时间</th>
            <th className="py-2.5 pr-4 font-medium" />
          </tr>
        </thead>
        <tbody>
          {records.map((r) => {
            const Icon = r.type === "recommend" ? Compass : Scale;
            return (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="py-2.5 pl-4 pr-3">
                  <span className="inline-flex items-center gap-1.5 text-muted">
                    <Icon size={13} />
                    {r.type === "recommend" ? "选品" : "诊断"}
                  </span>
                </td>
                <td className="py-2.5 pr-3">
                  <Link href={`/history/${r.id}`} className="font-medium text-foreground hover:underline">
                    {r.query}
                  </Link>
                </td>
                <td className="py-2.5 pr-3 text-muted">{r.summary}</td>
                <td className={`py-2.5 pr-3 font-mono tabular-nums font-semibold ${scoreColor(r.score)}`}>
                  {r.score ?? "—"}
                </td>
                <td className="py-2.5 pr-3 text-muted">{new Date(r.createdAt).toLocaleString("zh-CN")}</td>
                <td className="py-2.5 pr-4 text-right">
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={deletingId === r.id}
                    className="rounded-md p-1.5 text-muted transition-colors hover:bg-negative-tint hover:text-negative disabled:opacity-50"
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
