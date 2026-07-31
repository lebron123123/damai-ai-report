export interface FactorScore {
  key: string;
  label: string;
  score: number; // 0-100, higher = more favorable for listing
  rawValue: number;
  unit?: string;
  weight: number; // contribution weight in composite score, sums to 1 across factors
  explanation: string;
}

export interface AnomalyEvent {
  date: string;
  sales: number;
  zScore: number;
}

export interface FactorReport {
  factors: FactorScore[];
  anomalies: AnomalyEvent[];
  compositeScore: number; // 0-100
  confidence: number; // 0-1, how much to trust compositeScore given sample size/noise
  confidenceLabel: "低" | "中" | "高";
}
