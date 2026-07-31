import { NextRequest, NextResponse } from "next/server";
import { evaluateProduct } from "@/lib/pipeline/evaluate";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    if (!query) {
      return NextResponse.json({ error: "请提供商品名称" }, { status: 400 });
    }
    const costPrice = typeof body?.costPrice === "number" && body.costPrice > 0 ? body.costPrice : undefined;
    const report = await evaluateProduct(query, { costPrice });
    return NextResponse.json(report);
  } catch (err) {
    console.error("[api/evaluate] failed:", err);
    const message = err instanceof Error ? err.message : "生成报告失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
