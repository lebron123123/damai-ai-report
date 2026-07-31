import { NextRequest, NextResponse } from "next/server";
import { MercadoLibreDataSource, snapshotCount } from "@/lib/data/mercadolibre/source";
import { isMLConfigured } from "@/lib/data/mercadolibre/oauth";

/**
 * Hits every item ID in ML_WATCHLIST_ITEM_IDS to record today's snapshot, even
 * for products nobody is actively viewing in the UI right now. Wire this to a
 * free scheduler (cron-job.org, GitHub Actions on a schedule, Vercel Cron once
 * deployed) to run once a day -- that daily cadence is what turns single
 * snapshots into a real trend line over the following weeks.
 *
 * Optional light protection: set CRON_SECRET and call with ?secret=... so this
 * isn't a wide-open public endpoint if deployed.
 */
export async function GET(req: NextRequest) {
  if (!isMLConfigured()) {
    return NextResponse.json({ error: "Mercado Libre未配置,无法抓取快照" }, { status: 400 });
  }

  const secret = process.env.CRON_SECRET;
  if (secret && req.nextUrl.searchParams.get("secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const watchlist = (process.env.ML_WATCHLIST_ITEM_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (watchlist.length === 0) {
    return NextResponse.json({ error: "ML_WATCHLIST_ITEM_IDS为空,没有可抓取的商品" }, { status: 400 });
  }

  const source = new MercadoLibreDataSource();
  const results = await Promise.all(
    watchlist.map(async (id) => {
      const product = await source.getProductById(id);
      return { id, ok: Boolean(product), snapshots: snapshotCount(id) };
    }),
  );

  return NextResponse.json({ recordedAt: new Date().toISOString(), results });
}
