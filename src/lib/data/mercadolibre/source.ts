import type { CandidateQuery, DataSource, ProductRecord } from "../types";
import { getItem, getItemReviews, searchItems, type MLItem } from "./client";
import { getSeries, recordSnapshot, snapshotCount } from "./snapshot-store";

const SITE_ID = process.env.ML_SITE_ID || "MLM";

// ML's public API has no cost-basis field (it can't know what you paid your
// supplier), so margin can't be computed from ML data alone. This placeholder
// keeps the factor engine from dividing by an unknown; pass a real costPrice
// through the evaluate pipeline to override it with an accurate number.
const PLACEHOLDER_MARGIN_RATE = 0.25;

async function estimateCompetitors(categoryId: string, titleKeywords: string, excludeId: string) {
  try {
    const res = await searchItems(SITE_ID, titleKeywords, 50);
    const prices = res.results.filter((r) => r.id !== excludeId && r.category_id === categoryId).map((r) => r.price);
    if (prices.length === 0) {
      return { competitorCount: 0, avgPrice: 0, priceStdDev: 0 };
    }
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((a, p) => a + (p - avg) ** 2, 0) / prices.length;
    return { competitorCount: prices.length, avgPrice: avg, priceStdDev: Math.sqrt(variance) };
  } catch (err) {
    console.error("[mercadolibre] competitor search failed:", err);
    return { competitorCount: 0, avgPrice: 0, priceStdDev: 0 };
  }
}

async function itemToProduct(item: MLItem): Promise<ProductRecord> {
  // side effect: this read also extends this product's local history by one day
  recordSnapshot(item.id, {
    price: item.price,
    cumulativeSold: item.sold_quantity,
    availableQuantity: item.available_quantity,
  });

  const [reviews, competitor] = await Promise.all([
    getItemReviews(item.id).catch(() => null),
    estimateCompetitors(item.category_id, item.title, item.id),
  ]);

  return {
    id: item.id,
    name: item.title,
    category: item.category_id,
    currency: item.currency_id,
    series: getSeries(item.id),
    competitor,
    rating: reviews?.rating_average ?? 0,
    reviewCount: reviews?.paging.total ?? 0,
    marginRate: PLACEHOLDER_MARGIN_RATE,
    sourceStock: item.available_quantity,
  };
}

export class MercadoLibreDataSource implements DataSource {
  async getProductById(id: string): Promise<ProductRecord | null> {
    try {
      const item = await getItem(id);
      return await itemToProduct(item);
    } catch (err) {
      console.error("[mercadolibre] getProductById failed:", err);
      return null;
    }
  }

  async getProductByName(name: string): Promise<ProductRecord | null> {
    try {
      const results = await searchItems(SITE_ID, name, 1);
      const first = results.results[0];
      if (!first) return null;
      return this.getProductById(first.id);
    } catch (err) {
      console.error("[mercadolibre] getProductByName failed:", err);
      return null;
    }
  }

  async searchCandidates(query: CandidateQuery): Promise<ProductRecord[]> {
    try {
      const results = await searchItems(SITE_ID, query.keyword, query.limit ?? 6);
      // fetch full detail per candidate (reviews + competitor snapshot) so the
      // factor engine has the same shape of data as the single-product path
      const products = await Promise.all(
        results.results.slice(0, query.limit ?? 6).map((r) => this.getProductById(r.id)),
      );
      return products.filter((p): p is ProductRecord => p !== null);
    } catch (err) {
      console.error("[mercadolibre] searchCandidates failed:", err);
      return [];
    }
  }
}

export { snapshotCount };
