import fs from "node:fs";
import path from "node:path";

/**
 * Append-only local history for Mercado Libre products. The ML API only ever
 * gives you a current-moment snapshot (price, cumulative sold_quantity) --
 * there is no "give me the last 60 days" endpoint on this or any major
 * marketplace's public API. So we build our own history the only honest way:
 * record a snapshot every time this product is looked at (or via the /api/snapshot
 * cron route for a watchlist), and derive daily "sales" as the delta in
 * cumulative sold_quantity between consecutive snapshot days.
 *
 * Cold start is real: a freshly-connected product has 0-1 points and the
 * factor engine's own confidence score will correctly read that as "低"
 * rather than us faking data to fill the gap.
 */

interface RawSnapshot {
  date: string; // YYYY-MM-DD
  price: number;
  cumulativeSold: number;
  availableQuantity: number;
}

const STORE_DIR = path.join(process.cwd(), ".data", "snapshots");

function filePath(itemId: string): string {
  return path.join(STORE_DIR, `${itemId}.json`);
}

function readRaw(itemId: string): RawSnapshot[] {
  try {
    return JSON.parse(fs.readFileSync(filePath(itemId), "utf-8")) as RawSnapshot[];
  } catch {
    return [];
  }
}

function writeRaw(itemId: string, snapshots: RawSnapshot[]): void {
  fs.mkdirSync(STORE_DIR, { recursive: true });
  fs.writeFileSync(filePath(itemId), JSON.stringify(snapshots, null, 2), "utf-8");
}

export function recordSnapshot(itemId: string, snapshot: Omit<RawSnapshot, "date">): void {
  const today = new Date().toISOString().slice(0, 10);
  const existing = readRaw(itemId);
  const idx = existing.findIndex((s) => s.date === today);
  const entry: RawSnapshot = { date: today, ...snapshot };
  if (idx >= 0) existing[idx] = entry; // multiple queries same day: keep latest
  else existing.push(entry);
  existing.sort((a, b) => a.date.localeCompare(b.date));
  writeRaw(itemId, existing);
}

export interface DerivedPoint {
  date: string;
  price: number;
  sales: number;
}

export function getSeries(itemId: string): DerivedPoint[] {
  const raw = readRaw(itemId);
  if (raw.length === 0) return [];
  if (raw.length === 1) {
    // one snapshot: no delta possible yet, report it with sales=0 so the UI has
    // something to draw rather than an empty chart.
    return [{ date: raw[0].date, price: raw[0].price, sales: 0 }];
  }
  const series: DerivedPoint[] = [];
  for (let i = 1; i < raw.length; i++) {
    const delta = Math.max(0, raw[i].cumulativeSold - raw[i - 1].cumulativeSold);
    series.push({ date: raw[i].date, price: raw[i].price, sales: delta });
  }
  return series;
}

export function snapshotCount(itemId: string): number {
  return readRaw(itemId).length;
}
