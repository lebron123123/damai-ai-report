import type { ProductRecord } from "../data/types";
import type { FactorReport } from "../factors/types";

export function factorSummaryForPrompt(product: ProductRecord, report: FactorReport): string {
  const lines = report.factors.map(
    (f) => `- ${f.label}: ${f.score}/100 (原始值 ${f.rawValue}${f.unit ?? ""}) — ${f.explanation}`,
  );
  const anomalyLine =
    report.anomalies.length > 0
      ? `异常峰值 ${report.anomalies.length} 次,例如 ${report.anomalies
          .slice(0, 3)
          .map((a) => `${a.date}(销量${a.sales}, z=${a.zScore})`)
          .join("、")}`
      : "未检测到明显异常峰值";

  return [
    `商品: ${product.name} (类目: ${product.category})`,
    `综合评分: ${report.compositeScore}/100, 数据置信度: ${report.confidenceLabel}(${report.confidence})`,
    ...lines,
    anomalyLine,
  ].join("\n");
}

export const SYSTEM_ANALYST =
  "你是大麦数据平台的跨境电商选品分析师。你的所有结论必须基于给定的因子数据,禁止编造未提供的数字。回答使用简体中文,语气专业、克制,不要用夸张的营销口吻。";
