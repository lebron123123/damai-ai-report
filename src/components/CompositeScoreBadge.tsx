export function CompositeScoreBadge({ score, size = "md" }: { score: number; size?: "sm" | "md" }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={`font-mono font-bold tabular-nums text-accent-text ${size === "md" ? "text-[26px]" : "text-[18px]"}`}>
        {score}
      </span>
      <span className="text-[11px] text-muted">/100 综合评分</span>
    </div>
  );
}
