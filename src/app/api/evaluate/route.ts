import { NextRequest, NextResponse } from "next/server";
import { evaluateProduct } from "@/lib/pipeline/evaluate";
import { saveHistory } from "@/lib/history/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    if (!query) {
      return NextResponse.json({ error: "请提供商品名称" }, { status: 400 });
    }
    const costPrice = typeof body?.costPrice === "number" && body.costPrice > 0 ? body.costPrice : undefined;
    const report = await evaluateProduct(query, { costPrice });

    const historyId = saveHistory({
      type: "evaluate",
      query,
      summary: `${report.decision.verdictLabel} · ${report.product.name}`,
      score: report.factorReport.compositeScore,
      payload: report,
    });

    return NextResponse.json({ ...report, historyId });
  } catch (err) {
    console.error("[api/evaluate] failed:", err);
    const message = err instanceof Error ? err.message : "生成报告失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
