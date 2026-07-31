import { NextRequest, NextResponse } from "next/server";
import { deleteHistory, getHistoryById } from "@/lib/history/store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = getHistoryById(id);
  if (!record) return NextResponse.json({ error: "记录不存在" }, { status: 404 });
  return NextResponse.json(record);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  deleteHistory(id);
  return NextResponse.json({ ok: true });
}
