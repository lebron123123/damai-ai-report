import { NextRequest, NextResponse } from "next/server";
import { dataSource } from "@/lib/data";
import { computeFactors } from "@/lib/factors/engine";

// Deliberately skips the LLM bull/bear/decision pipeline — this is the
// lightweight "just show me the numbers" lookup, not saved to 我的记录
// (that's reserved for full decision-grade evaluate/recommend reports).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    if (!query) {
      return NextResponse.json({ error: "请提供商品名称" }, { status: 400 });
    }
    const product = await dataSource.getProductByName(query);
    if (!product) {
      return NextResponse.json({ error: "未找到该商品,请换个名称重试" }, { status: 404 });
    }
    const factorReport = computeFactors(product);
    return NextResponse.json({ product, factorReport });
  } catch (err) {
    console.error("[api/factors] failed:", err);
    const message = err instanceof Error ? err.message : "查询失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
