import { getAccessToken } from "./oauth";

const BASE_URL = "https://api.mercadolibre.com";

export async function mlGet<T>(path: string): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Mercado Libre API请求失败 ${path} (${res.status}): ${body}`);
  }
  return (await res.json()) as T;
}

// -- Response shapes, per ML's long-documented (but not live-verified by us --
// authenticated calls need credentials we don't have yet) item/search/review APIs.
// If field names have drifted, adjust the mappers in source.ts, not the shapes here.

export interface MLItem {
  id: string;
  title: string;
  price: number;
  currency_id: string;
  available_quantity: number;
  sold_quantity: number;
  category_id: string;
  condition: string;
  permalink: string;
}

export interface MLSearchResult {
  results: Array<{
    id: string;
    title: string;
    price: number;
    sold_quantity: number;
    available_quantity: number;
    category_id: string;
  }>;
  paging: { total: number };
}

export interface MLReviews {
  rating_average: number;
  paging: { total: number };
}

export function getItem(itemId: string) {
  return mlGet<MLItem>(`/items/${itemId}`);
}

export function searchItems(siteId: string, query: string, limit = 10) {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  return mlGet<MLSearchResult>(`/sites/${siteId}/search?${params.toString()}`);
}

export function getItemReviews(itemId: string) {
  return mlGet<MLReviews>(`/reviews/item/${itemId}`);
}
