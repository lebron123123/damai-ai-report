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
 *
 * Initialization is lazy and defensive on purpose: a container filesystem
 * permission problem (this bit us once — the non-root Docker user couldn't
 * create .data/) must never take evaluate/recommend down with it. If the DB
 * can't open, history features quietly no-op instead of throwing.
 */

const DB_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DB_DIR, "history.sqlite");

let db: DatabaseSync | null = null;
let initAttempted = false;

function getDb(): DatabaseSync | null {
  if (db) return db;
  if (initAttempted) return null;
  initAttempted = true;
  try {
    fs.mkdirSync(DB_DIR, { recursive: true });
    const instance = new DatabaseSync(DB_PATH);
    instance.exec(`
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
    db = instance;
    return db;
  } catch (err) {
    console.error("[history] failed to open SQLite store — history features disabled, everything else keeps working:", err);
    return null;
  }
}

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

export function saveHistory(entry: NewHistoryEntry): string | null {
  const instance = getDb();
  if (!instance) return null;
  try {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    instance
      .prepare(
        `INSERT INTO history (id, type, query, summary, score, payload, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(id, entry.type, entry.query, entry.summary, entry.score, JSON.stringify(entry.payload), createdAt);
    return id;
  } catch (err) {
    console.error("[history] saveHistory failed:", err);
    return null;
  }
}

export function listHistory(limit = 50): HistoryRecord[] {
  const instance = getDb();
  if (!instance) return [];
  try {
    const rows = instance
      .prepare(
        `SELECT id, type, query, summary, score, created_at as createdAt FROM history ORDER BY created_at DESC LIMIT ?`,
      )
      .all(limit) as unknown as HistoryRecord[];
    // node:sqlite rows aren't plain objects (they fail the Server->Client
    // Component serialization check), so spread each one into a fresh literal.
    return rows.map((r) => ({ ...r }));
  } catch (err) {
    console.error("[history] listHistory failed:", err);
    return [];
  }
}

export function getHistoryById(id: string): (HistoryRecord & { payload: unknown }) | null {
  const instance = getDb();
  if (!instance) return null;
  try {
    const row = instance
      .prepare(`SELECT id, type, query, summary, score, created_at as createdAt, payload FROM history WHERE id = ?`)
      .get(id) as (HistoryRecord & { payload: string }) | undefined;
    if (!row) return null;
    return { ...row, payload: JSON.parse(row.payload) };
  } catch (err) {
    console.error("[history] getHistoryById failed:", err);
    return null;
  }
}

export function deleteHistory(id: string): void {
  const instance = getDb();
  if (!instance) return;
  try {
    instance.prepare(`DELETE FROM history WHERE id = ?`).run(id);
  } catch (err) {
    console.error("[history] deleteHistory failed:", err);
  }
}
