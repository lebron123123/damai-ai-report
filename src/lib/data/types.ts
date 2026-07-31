export interface TimeSeriesPoint {
  date: string; // ISO date, e.g. 2025-03-15
  price: number;
  sales: number;
}

export interface CompetitorSnapshot {
  competitorCount: number;
  avgPrice: number;
  priceStdDev: number;
}

export interface ProductRecord {
  id: string;
  name: string;
  category: string;
  currency: string;
  series: TimeSeriesPoint[];
  competitor: CompetitorSnapshot;
  rating: number; // 0-5
  reviewCount: number;
  marginRate: number; // 0-1 estimated gross margin
  sourceStock?: number;
  moq?: number;
}

export interface CandidateQuery {
  keyword: string;
  category?: string;
  limit?: number;
}

/**
 * Adapter boundary: everything above the data layer talks to this interface only.
 * Swap MockDataSource for a real Damai/Mercado Libre-backed implementation later
 * without touching the factor engine or pipelines.
 */
export interface DataSource {
  getProductById(id: string): Promise<ProductRecord | null>;
  getProductByName(name: string): Promise<ProductRecord | null>;
  searchCandidates(query: CandidateQuery): Promise<ProductRecord[]>;
}
