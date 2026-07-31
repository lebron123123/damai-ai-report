import { dataSource } from "../data";
import type { ProductRecord } from "../data/types";
import { computeFactors } from "../factors/engine";
import type { FactorReport } from "../factors/types";
import { chatComplete, chatCompleteJSON, isLLMConfigured } from "../llm/client";
import { factorSummaryForPrompt, SYSTEM_ANALYST } from "../llm/prompts";

export interface DebateArgument {
  stance: "bull" | "bear";
  text: string;
  points: string[];
  source: "llm" | "rule";
}

export type Verdict = "list" | "watch" | "reject";

export interface EvaluateVerdict {
  verdict: Verdict;
  verdictLabel: string;
  confidence: number;
  reasoning: string;
  actionItems: string[];
  source: "llm" | "rule";
}

export interface EvaluateReport {
  product: ProductRecord;
  factorReport: FactorReport;
  bull: DebateArgument;
  bear: DebateArgument;
  decision: EvaluateVerdict;
}

function ruleBasedBull(report: FactorReport): DebateArgument {
  const top = [...report.factors].sort((a, b) => b.score - a.score).slice(0, 3);
  return {
    stance: "bull",
    text: `看多理由:${top.map((f) => f.label).join("、")}表现较好。`,
    points: top.map((f) => `${f.label}(${f.score}/100): ${f.explanation}`),
    source: "rule",
  };
}

function ruleBasedBear(report: FactorReport): DebateArgument {
  const bottom = [...report.factors].sort((a, b) => a.score - b.score).slice(0, 3);
  const anomalyPoint =
    report.anomalies.length > 0
      ? [`检测到${report.anomalies.length}次异常销量峰值,需排查是否为刷单/短期活动而非稳定需求`]
      : [];
  return {
    stance: "bear",
    text: `看空理由:${bottom.map((f) => f.label).join("、")}存在风险。`,
    points: [...bottom.map((f) => `${f.label}(${f.score}/100): ${f.explanation}`), ...anomalyPoint],
    source: "rule",
  };
}

function ruleBasedDecision(
  report: FactorReport,
  bull: DebateArgument,
  bear: DebateArgument,
): EvaluateVerdict {
  const { compositeScore, confidence } = report;
  let verdict: Verdict;
  if (compositeScore >= 65 && confidence >= 0.5) verdict = "list";
  else if (compositeScore >= 45) verdict = "watch";
  else verdict = "reject";

  // low data confidence caps an otherwise-good score at "watch" rather than an outright "list"
  if (verdict === "list" && confidence < 0.5) verdict = "watch";

  const verdictLabel = { list: "建议上架", watch: "建议观察", reject: "不建议上架" }[verdict];

  return {
    verdict,
    verdictLabel,
    confidence: report.confidence,
    reasoning: `综合评分${compositeScore}/100,数据置信度${report.confidenceLabel}。看多方指出${bull.points.length}项优势,看空方指出${bear.points.length}项风险,权衡后给出"${verdictLabel}"结论。`,
    actionItems:
      verdict === "list"
        ? ["确认供应链起订量与交期", "上架前补充3-5张差异化卖点素材", "设置价格监控,防止陷入价格战"]
        : verdict === "watch"
          ? ["持续观察2-4周销量趋势是否稳定", "核查异常峰值背后的真实原因", "小批量测款而非大批量压货"]
          : ["排查是否存在更优细分品类", "重新评估供应链成本以提升毛利空间"],
    source: "rule",
  };
}

async function buildBullCase(product: ProductRecord, report: FactorReport): Promise<DebateArgument> {
  const summary = factorSummaryForPrompt(product, report);
  const text = await chatComplete([
    { role: "system", content: SYSTEM_ANALYST },
    {
      role: "user",
      content: `以下是商品的因子数据:\n${summary}\n\n请你扮演"看多分析师",基于以上数据用3-4条要点论证这个商品值得上架销售。只能引用给定的数字,不要编造新数据。用简短的要点列表输出。`,
    },
  ]);
  if (!text) return ruleBasedBull(report);
  return { stance: "bull", text, points: text.split(/\n+/).filter(Boolean), source: "llm" };
}

async function buildBearCase(product: ProductRecord, report: FactorReport): Promise<DebateArgument> {
  const summary = factorSummaryForPrompt(product, report);
  const text = await chatComplete([
    { role: "system", content: SYSTEM_ANALYST },
    {
      role: "user",
      content: `以下是商品的因子数据:\n${summary}\n\n请你扮演"看空分析师",基于以上数据用3-4条要点指出这个商品上架销售的风险点。只能引用给定的数字,不要编造新数据。用简短的要点列表输出。`,
    },
  ]);
  if (!text) return ruleBasedBear(report);
  return { stance: "bear", text, points: text.split(/\n+/).filter(Boolean), source: "llm" };
}

interface LLMDecisionShape {
  verdict: Verdict;
  reasoning: string;
  actionItems: string[];
}

async function buildDecision(
  product: ProductRecord,
  report: FactorReport,
  bull: DebateArgument,
  bear: DebateArgument,
): Promise<EvaluateVerdict> {
  const summary = factorSummaryForPrompt(product, report);
  const result = await chatCompleteJSON<LLMDecisionShape>([
    { role: "system", content: SYSTEM_ANALYST },
    {
      role: "user",
      content: `因子数据:\n${summary}\n\n看多方观点:\n${bull.text}\n\n看空方观点:\n${bear.text}\n\n请你扮演"决策委员会",综合以上信息给出最终结论。严格按以下JSON格式输出:\n{"verdict": "list" | "watch" | "reject", "reasoning": "结论理由,100字以内", "actionItems": ["行动建议1", "行动建议2", "行动建议3"]}\nverdict含义: list=建议上架, watch=建议观察不急于上架, reject=不建议上架。数据置信度较低(低于0.5)时不要给出list结论。`,
    },
  ]);

  if (!result || !result.verdict) return ruleBasedDecision(report, bull, bear);

  const verdictLabel = { list: "建议上架", watch: "建议观察", reject: "不建议上架" }[result.verdict];
  return {
    verdict: result.verdict,
    verdictLabel,
    confidence: report.confidence,
    reasoning: result.reasoning,
    actionItems: result.actionItems ?? [],
    source: "llm",
  };
}

export interface EvaluateOptions {
  // Real marketplaces (Mercado Libre etc.) can't know your cost basis, so the
  // data layer fills marginRate with a placeholder. Pass your real per-unit
  // cost here to get an accurate margin factor instead of the placeholder.
  costPrice?: number;
}

export async function evaluateProduct(query: string, options: EvaluateOptions = {}): Promise<EvaluateReport> {
  const product = await dataSource.getProductByName(query);
  if (!product) throw new Error("未找到该商品,请换个名称重试");

  if (options.costPrice !== undefined && options.costPrice > 0) {
    const latestPrice = product.series.at(-1)?.price ?? options.costPrice;
    product.marginRate = Math.max(0, Math.min(1, (latestPrice - options.costPrice) / latestPrice));
  }

  const factorReport = computeFactors(product);
  const [bull, bear] = await Promise.all([
    buildBullCase(product, factorReport),
    buildBearCase(product, factorReport),
  ]);
  const decision = await buildDecision(product, factorReport, bull, bear);

  return { product, factorReport, bull, bear, decision };
}

export function llmStatus() {
  return { configured: isLLMConfigured() };
}
