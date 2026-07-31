import { NextRequest, NextResponse } from "next/server";
import { recommendProducts } from "@/lib/pipeline/recommend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = typeof body?.query === "string" ? body.query.trim() : "";
    const category = typeof body?.category === "string" ? body.category.trim() || undefined : undefined;
    if (!query) {
      return NextResponse.json({ error: "请描述你想上架的方向,例如目标品类、预算或市场" }, { status: 400 });
    }
    const report = await recommendProducts(query, category);
    return NextResponse.json(report);
  } catch (err) {
    console.error("[api/recommend] failed:", err);
    const message = err instanceof Error ? err.message : "生成推荐失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
