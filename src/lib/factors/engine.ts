import type { ProductRecord } from "../data/types";
import type { AnomalyEvent, FactorReport, FactorScore } from "./types";

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
}

function stddev(xs: number[]): number {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}

function clamp(x: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, x));
}

// ordinary least squares slope of y over index 0..n-1
function linregSlope(ys: number[]): number {
  const n = ys.length;
  if (n < 2) return 0;
  const xs = ys.map((_, i) => i);
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 2) return 0;
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    dx += (xs[i] - mx) ** 2;
    dy += (ys[i] - my) ** 2;
  }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? 0 : num / den;
}

function detectAnomalies(series: ProductRecord["series"]): AnomalyEvent[] {
  const sales = series.map((p) => p.sales);
  const m = mean(sales);
  const sd = stddev(sales) || 1;
  const events: AnomalyEvent[] = [];
  series.forEach((p, i) => {
    const z = (sales[i] - m) / sd;
    if (z >= 2.5) {
      events.push({ date: p.date, sales: p.sales, zScore: Math.round(z * 100) / 100 });
    }
  });
  return events;
}

/**
 * Deterministic, explainable factor computation. This is the only place raw
 * numbers get turned into 0-100 scores — the LLM layer only ever narrates
 * these pre-computed values, it never invents them.
 */
export function computeFactors(product: ProductRecord): FactorReport {
  const sales = product.series.map((p) => p.sales);
  const prices = product.series.map((p) => p.price);
  const n = sales.length;

  const avgSales = mean(sales);
  const salesStd = stddev(sales);
  const anomalies = detectAnomalies(product.series);

  // 1. Sales trend: slope normalized to %/day relative to average level
  const slope = linregSlope(sales);
  const trendPctPerDay = avgSales > 0 ? (slope / avgSales) * 100 : 0;
  const trendScore = clamp(50 + trendPctPerDay * 12);

  // 2. Volatility (excluding anomaly days so one viral spike doesn't read as "unstable")
  const anomalyDates = new Set(anomalies.map((a) => a.date));
  const cleanSales = product.series.filter((p) => !anomalyDates.has(p.date)).map((p) => p.sales);
  const cov = mean(cleanSales) > 0 ? stddev(cleanSales) / mean(cleanSales) : 1;
  const volatilityScore = clamp(100 - cov * 90);

  // 3. Price elasticity: correlation between price and sales, expect negative
  const corr = pearson(prices, sales);
  // healthy: some negative responsiveness (-0.7 to -0.15). Too close to 0 = pricing has no
  // effect (odd/unreliable data); too extreme = customers only show up on deep discounts.
  const elasticityScore = clamp(100 - Math.abs(corr + 0.4) * 110);

  // 4. Competition density
  const { competitorCount, priceStdDev, avgPrice } = product.competitor;
  const priceClusterTightness = avgPrice > 0 ? priceStdDev / avgPrice : 0.2;
  const competitionScore = clamp(100 - competitorCount * 1.1 + priceClusterTightness * 60);

  // 5. Review quality / social proof
  const reviewVolumeScore = clamp(Math.log10(product.reviewCount + 1) * 28);
  const ratingScore = clamp(((product.rating - 2.5) / 2.5) * 100);
  const reviewQualityScore = clamp(reviewVolumeScore * 0.4 + ratingScore * 0.6);

  // 6. Margin health
  const marginScore = clamp(product.marginRate * 220);

  // Data confidence: more days + fewer anomaly-dominated points + non-degenerate variance = higher trust
  const sampleConfidence = clamp((n / 60) * 100) / 100;
  const anomalyRatio = anomalies.length / n;
  const anomalyPenalty = clamp(1 - anomalyRatio * 3, 0, 1);
  const varianceOk = salesStd > 0 ? 1 : 0.4;
  const confidence = Math.round(sampleConfidence * anomalyPenalty * varianceOk * 100) / 100;

  const factors: FactorScore[] = [
    {
      key: "trend",
      label: "销量趋势",
      score: Math.round(trendScore),
      rawValue: Math.round(trendPctPerDay * 100) / 100,
      unit: "%/天",
      weight: 0.2,
      explanation:
        trendPctPerDay > 0.3
          ? `销量呈上升趋势,日均增长约${trendPctPerDay.toFixed(2)}%`
          : trendPctPerDay < -0.3
            ? `销量呈下降趋势,日均下降约${Math.abs(trendPctPerDay).toFixed(2)}%`
            : "销量整体走平,无明显趋势",
    },
    {
      key: "volatility",
      label: "销量稳定性",
      score: Math.round(volatilityScore),
      rawValue: Math.round(cov * 100) / 100,
      unit: "变异系数",
      weight: 0.1,
      explanation:
        cov < 0.4
          ? "剔除异常峰值后,日销量波动较小,需求可预测性较好"
          : "日销量波动较大,补货和库存节奏需要更谨慎",
    },
    {
      key: "elasticity",
      label: "价格敏感度",
      score: Math.round(elasticityScore),
      rawValue: Math.round(corr * 100) / 100,
      unit: "相关系数",
      weight: 0.15,
      explanation:
        corr < -0.5
          ? "价格与销量强负相关,市场对价格非常敏感,降价能显著拉动销量但也压缩利润"
          : corr > -0.15
            ? "价格变化对销量影响很弱,可能存在刚需属性或数据样本不足"
            : "价格与销量呈健康的负相关,具备一定的促销杠杆空间",
    },
    {
      key: "competition",
      label: "竞争强度",
      score: Math.round(competitionScore),
      rawValue: competitorCount,
      unit: "个竞品",
      weight: 0.2,
      explanation:
        competitorCount > 40
          ? `同类目在售竞品约${competitorCount}个,竞争激烈,需要差异化卖点`
          : competitorCount > 15
            ? `同类目竞品约${competitorCount}个,竞争中等`
            : `同类目竞品约${competitorCount}个,竞争相对空白`,
    },
    {
      key: "reviewQuality",
      label: "口碑与社会认可度",
      score: Math.round(reviewQualityScore),
      rawValue: product.rating,
      unit: "星",
      weight: 0.15,
      explanation: `评分${product.rating}星,累计${product.reviewCount}条评价`,
    },
    {
      key: "margin",
      label: "毛利健康度",
      score: Math.round(marginScore),
      rawValue: product.marginRate,
      unit: "毛利率",
      weight: 0.2,
      explanation:
        product.marginRate >= 0.35
          ? `预估毛利率${(product.marginRate * 100).toFixed(0)}%,盈利空间充足`
          : product.marginRate >= 0.2
            ? `预估毛利率${(product.marginRate * 100).toFixed(0)}%,处于合理区间`
            : `预估毛利率仅${(product.marginRate * 100).toFixed(0)}%,抗风险能力弱`,
    },
  ];

  const compositeScore = Math.round(
    factors.reduce((sum, f) => sum + f.score * f.weight, 0),
  );

  const confidenceLabel: FactorReport["confidenceLabel"] =
    confidence >= 0.75 ? "高" : confidence >= 0.45 ? "中" : "低";

  return {
    factors,
    anomalies,
    compositeScore: clamp(compositeScore),
    confidence,
    confidenceLabel,
  };
}
