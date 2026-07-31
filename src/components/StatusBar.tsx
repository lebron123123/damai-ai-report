import { isLLMConfigured } from "@/lib/llm/client";
import { isMLConfigured } from "@/lib/data/mercadolibre/oauth";

function Chip({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        ok
          ? "border-positive-border bg-positive-tint text-positive"
          : "border-border bg-card text-muted"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-positive" : "bg-muted"}`} />
      {label}
    </span>
  );
}

export function StatusBar() {
  const llmOn = isLLMConfigured();
  const mlOn = isMLConfigured() && process.env.DATA_SOURCE === "mercadolibre";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Chip label={llmOn ? `大模型:${process.env.LLM_MODEL || "已接入"}` : "大模型:规则引擎(未配置)"} ok={llmOn} />
      <Chip label={mlOn ? "数据源:Mercado Libre" : "数据源:模拟数据"} ok={mlOn} />
    </div>
  );
}
