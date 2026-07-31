import type { DataSource } from "./types";
import { MockDataSource } from "./mock-source";
import { MercadoLibreDataSource } from "./mercadolibre/source";
import { isMLConfigured } from "./mercadolibre/oauth";

// Single swap point, chosen by DATA_SOURCE env var. Every pipeline/route imports
// the DataSource interface from here, never a concrete implementation directly.
// Falls back to mock (with a console warning) if mercadolibre is selected but
// credentials aren't configured yet, so the app never hard-crashes on missing env.
function selectDataSource(): DataSource {
  const mode = process.env.DATA_SOURCE || "mock";
  if (mode === "mercadolibre") {
    if (!isMLConfigured()) {
      console.warn(
        "[data] DATA_SOURCE=mercadolibre but ML_CLIENT_ID/ML_CLIENT_SECRET/ML_REFRESH_TOKEN are missing — falling back to MockDataSource",
      );
      return new MockDataSource();
    }
    return new MercadoLibreDataSource();
  }
  return new MockDataSource();
}

export const dataSource: DataSource = selectDataSource();

export type { DataSource, ProductRecord, TimeSeriesPoint, CandidateQuery, CompetitorSnapshot } from "./types";
