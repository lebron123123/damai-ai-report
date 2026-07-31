import { CircleCheck, TriangleAlert, CircleX, ListChecks } from "lucide-react";
import type { EvaluateVerdict } from "@/lib/pipeline/evaluate";

const STYLES: Record<
  EvaluateVerdict["verdict"],
  { tint: string; border: string; text: string; icon: typeof CircleCheck }
> = {
  list: { tint: "bg-positive-tint", border: "border-positive-border", text: "text-positive", icon: CircleCheck },
  watch: { tint: "bg-warning-tint", border: "border-warning-border", text: "text-warning", icon: TriangleAlert },
  reject: { tint: "bg-negative-tint", border: "border-negative-border", text: "text-negative", icon: CircleX },
};

export function VerdictCard({ decision }: { decision: EvaluateVerdict }) {
  const style = STYLES[decision.verdict];
  const Icon = style.icon;
  return (
    <div className={`rounded-lg border p-5 ${style.tint} ${style.border}`}>
      <div className="flex items-start justify-between gap-4">
        <div className={`flex items-center gap-2 ${style.text}`}>
          <Icon size={20} strokeWidth={2} />
          <span className="text-[16px] font-semibold">{decision.verdictLabel}</span>
        </div>
        <span className="whitespace-nowrap pt-0.5 text-[11px] text-muted">
          置信度 {(decision.confidence * 100).toFixed(0)}% · {decision.source === "llm" ? "AI决策委员会" : "规则引擎(未配置大模型)"}
        </span>
      </div>
      <p className="mt-2.5 text-[13.5px] leading-relaxed text-foreground">{decision.reasoning}</p>
      {decision.actionItems.length > 0 && (
        <ul className="mt-3.5 space-y-1.5 border-t border-border pt-3.5">
          {decision.actionItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-foreground">
              <ListChecks size={14} strokeWidth={2} className={`mt-0.5 shrink-0 ${style.text}`} />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
