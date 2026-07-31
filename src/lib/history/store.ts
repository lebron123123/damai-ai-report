import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/**
 * "我的选品记录" persistence. Uses node:sqlite (built into Node 22+, no native
 * build step — this is why the Dockerfile base image is node:24-alpine).
 *
 * Honest limitation: this writes to a file on the container's local disk
 * (.data/history.sqlite, gitignored, same as the Mercado Libre snapshot
 * store). On the current Tencent CloudBase 云托管 deployment that disk is
 * NOT guaranteed to survive a redeploy or restart — containers are stateless
 * by default there. Local dev and any host with a persistent volume mount
 * are unaffected. Swapping in CloudBase's own database (already provisioned
 * in your environment) is the real fix for production durability; this
 * module is the single place that would change — nothing above it
 * (the API routes, the history page) needs to know how records are stored.
 */

const DB_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DB_DIR, "history.sqlite");

fs.mkdirSync(DB_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS history (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('evaluate', 'recommend')),
    query TEXT NOT NULL,
    summary TEXT NOT NULL,
    score INTEGER,
    payload TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

export type HistoryType = "evaluate" | "recommend";

export interface HistoryRecord {
  id: string;
  type: HistoryType;
  query: string;
  summary: string;
  score: number | null;
  createdAt: string;
}

export interface NewHistoryEntry {
  type: HistoryType;
  query: string;
  summary: string;
  score: number | null;
  payload: unknown;
}

export function saveHistory(entry: NewHistoryEntry): string {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO history (id, type, query, summary, score, payload, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(id, entry.type, entry.query, entry.summary, entry.score, JSON.stringify(entry.payload), createdAt);
  return id;
}

export function listHistory(limit = 50): HistoryRecord[] {
  const rows = db
    .prepare(`SELECT id, type, query, summary, score, created_at as createdAt FROM history ORDER BY created_at DESC LIMIT ?`)
    .all(limit) as unknown as HistoryRecord[];
  // node:sqlite rows aren't plain objects (they fail the Server->Client
  // Component serialization check), so spread each one into a fresh literal.
  return rows.map((r) => ({ ...r }));
}

export function getHistoryById(id: string): (HistoryRecord & { payload: unknown }) | null {
  const row = db
    .prepare(`SELECT id, type, query, summary, score, created_at as createdAt, payload FROM history WHERE id = ?`)
    .get(id) as (HistoryRecord & { payload: string }) | undefined;
  if (!row) return null;
  return { ...row, payload: JSON.parse(row.payload) };
}

export function deleteHistory(id: string): void {
  db.prepare(`DELETE FROM history WHERE id = ?`).run(id);
}
