import type { CandidateQuery, DataSource, ProductRecord, TimeSeriesPoint } from "./types";

// Deterministic string hash -> 32-bit seed
function hashSeed(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

// mulberry32 seeded PRNG so the same product name always regenerates the same series
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CATEGORIES = [
  "电动工具",
  "家居收纳",
  "户外露营",
  "厨房小电",
  "宠物用品",
  "美容个护",
];

interface SeriesProfile {
  basePrice: number;
  priceVolatility: "low" | "medium" | "high";
  demandTrend: "rising" | "flat" | "declining";
  anomalyChance: number;
  days: number;
}

function generateSeries(rng: () => number, profile: SeriesProfile): TimeSeriesPoint[] {
  const { basePrice, priceVolatility, demandTrend, anomalyChance, days } = profile;
  const points: TimeSeriesPoint[] = [];
  const start = new Date("2025-03-15T00:00:00Z");

  const trendSlope = demandTrend === "rising" ? 0.9 : demandTrend === "declining" ? -0.6 : 0.05;
  const volFactor = priceVolatility === "high" ? 0.22 : priceVolatility === "medium" ? 0.1 : 0.03;

  let price = basePrice;
  const baseSales = 40 + rng() * 40;

  for (let i = 0; i < days; i++) {
    // occasional price step change (promo / repricing)
    if (rng() < 0.12) {
      price = basePrice * (1 - volFactor * (0.5 + rng()));
    } else if (rng() < 0.06) {
      price = basePrice * (1 + volFactor * 0.4);
    }

    const priceRatio = price / basePrice;
    // demand responds inversely to price (elasticity baked into generator)
    const elasticityEffect = (1 - priceRatio) * 2.2;
    const trend = baseSales + trendSlope * i;
    const noise = (rng() - 0.5) * baseSales * 0.35;

    let sales = Math.max(0, Math.round(trend + trend * elasticityEffect + noise));

    // anomaly spike (promo blast / viral moment)
    if (rng() < anomalyChance) {
      sales = Math.round(sales * (4 + rng() * 6));
    }

    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + i);

    points.push({
      date: date.toISOString().slice(0, 10),
      price: Math.round(price * 100) / 100,
      sales,
    });
  }

  return points;
}

function buildProduct(id: string, name: string, category?: string): ProductRecord {
  const seed = hashSeed(id + "|" + name);
  const rng = mulberry32(seed);

  const cat = category ?? CATEGORIES[Math.floor(rng() * CATEGORIES.length)];
  const demandTrend = (["rising", "flat", "declining"] as const)[Math.floor(rng() * 3)];
  const priceVolatility = (["low", "medium", "high"] as const)[Math.floor(rng() * 3)];

  const series = generateSeries(rng, {
    basePrice: 15 + rng() * 260,
    priceVolatility,
    demandTrend,
    anomalyChance: 0.02 + rng() * 0.05,
    days: 61,
  });

  const competitorCount = Math.round(3 + rng() * 60);
  const avgPrice = series.reduce((s, p) => s + p.price, 0) / series.length;

  return {
    id,
    name,
    category: cat,
    currency: "MXN",
    series,
    competitor: {
      competitorCount,
      avgPrice: Math.round(avgPrice * (0.85 + rng() * 0.3) * 100) / 100,
      priceStdDev: Math.round(avgPrice * (0.05 + rng() * 0.25) * 100) / 100,
    },
    rating: Math.round((3 + rng() * 2) * 10) / 10,
    reviewCount: Math.round(rng() * rng() * 4000),
    marginRate: Math.round((0.12 + rng() * 0.38) * 100) / 100,
    sourceStock: Math.round(50 + rng() * 5000),
    moq: [1, 5, 10, 50, 100][Math.floor(rng() * 5)],
  };
}

const CANDIDATE_ADJECTIVES = ["升级款", "便携式", "多功能", "静音", "大容量", "迷你", "户外款", "USB充电款"];

export class MockDataSource implements DataSource {
  async getProductById(id: string): Promise<ProductRecord | null> {
    if (!id.trim()) return null;
    return buildProduct(id, id);
  }

  async getProductByName(name: string): Promise<ProductRecord | null> {
    if (!name.trim()) return null;
    return buildProduct(`name:${name}`, name);
  }

  async searchCandidates(query: CandidateQuery): Promise<ProductRecord[]> {
    const limit = query.limit ?? 6;
    const keyword = query.keyword.trim() || "热销品类";
    const rng = mulberry32(hashSeed("candidates|" + keyword));

    const candidates: ProductRecord[] = [];
    for (let i = 0; i < limit; i++) {
      const adj = CANDIDATE_ADJECTIVES[Math.floor(rng() * CANDIDATE_ADJECTIVES.length)];
      const name = `${adj}${keyword} 方案${i + 1}`;
      candidates.push(buildProduct(`cand:${keyword}:${i}`, name, query.category));
    }
    return candidates;
  }
}
