import { dataSource } from "../data";
import type { ProductRecord } from "../data/types";
import { computeFactors } from "../factors/engine";
import type { FactorReport } from "../factors/types";
import { chatComplete } from "../llm/client";
import { factorSummaryForPrompt, SYSTEM_ANALYST } from "../llm/prompts";

export interface RankedCandidate {
  product: ProductRecord;
  factorReport: FactorReport;
  rank: number;
}

export interface RecommendReport {
  query: string;
  ranked: RankedCandidate[];
  narrative: string;
  source: "llm" | "rule";
}

function ruleBasedNarrative(query: string, ranked: RankedCandidate[]): string {
  const top = ranked[0];
  const runnerUp = ranked[1];
  if (!top) return `没有找到与"${query}"相关的候选商品,建议换个关键词重试。`;

  const topStrength = [...top.factorReport.factors].sort((a, b) => b.score - a.score)[0];
  const topWeak = [...top.factorReport.factors].sort((a, b) => a.score - b.score)[0];

  const lines = [
    `围绕"${query}",从${ranked.length}个候选方案中综合评分排名第一的是「${top.product.name}」,综合评分${top.factorReport.compositeScore}/100(数据置信度:${top.factorReport.confidenceLabel})。`,
    `优势在于${topStrength.label}(${topStrength.score}/100):${topStrength.explanation}`,
    `需要注意的短板是${topWeak.label}(${topWeak.score}/100):${topWeak.explanation}`,
  ];
  if (runnerUp) {
    lines.push(
      `次优方案「${runnerUp.product.name}」评分${runnerUp.factorReport.compositeScore}/100,可作为备选或组合测款。`,
    );
  }
  lines.push("建议先小批量测款验证,再决定是否加大投入。");
  return lines.join("\n");
}

async function buildCommitteeNarrative(
  query: string,
  ranked: RankedCandidate[],
): Promise<{ text: string; source: "llm" | "rule" }> {
  if (ranked.length === 0) {
    return { text: `没有找到与"${query}"相关的候选商品,建议换个关键词重试。`, source: "rule" };
  }

  const top3 = ranked.slice(0, 3);
  const summaries = top3
    .map(
      (c, i) =>
        `候选${i + 1}: ${factorSummaryForPrompt(c.product, c.factorReport)}`,
    )
    .join("\n\n");

  const text = await chatComplete([
    { role: "system", content: SYSTEM_ANALYST },
    {
      role: "user",
      content: `用户想要上架的方向是:"${query}"。以下是排名前${top3.length}的候选商品因子数据:\n\n${summaries}\n\n请你扮演"选品投资委员会",横向对比这几个候选,给出：1)最推荐上架哪一个及原因；2)该候选的主要风险；3)其余候选是否值得作为备选。只能引用给定的数字,不要编造新数据。控制在250字以内。`,
    },
  ]);

  if (!text) return { text: ruleBasedNarrative(query, ranked), source: "rule" };
  return { text, source: "llm" };
}

export async function recommendProducts(query: string, category?: string): Promise<RecommendReport> {
  const candidates = await dataSource.searchCandidates({ keyword: query, category, limit: 6 });

  const scored = candidates.map((product) => ({ product, factorReport: computeFactors(product) }));
  scored.sort((a, b) => b.factorReport.compositeScore - a.factorReport.compositeScore);

  const ranked: RankedCandidate[] = scored.map((c, i) => ({ ...c, rank: i + 1 }));
  const { text, source } = await buildCommitteeNarrative(query, ranked);

  return { query, ranked, narrative: text, source };
}
