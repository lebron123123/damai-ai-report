# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Cross-border e-commerce sellers/operators (currently the requester and their team) who list products on Mercado Libre Mexico (site MLM, MXN pricing) and need to decide what to list and whether a specific product is worth listing. Today this replaces ad-hoc manual research; the tool may later be offered to other cross-border sellers as a product.

## Product Purpose

A full-pipeline AI product-research copilot: 数据收集 → 核心因子分析 → 分析报告 → 上架建议. Two entry points — `/recommend` ("我应该上架卖什么", ranks candidate products for a described goal) and `/evaluate` ("这个产品怎么样", single-product GO/NO-GO). Success is a confident, explainable listing decision backed by transparent, auditable factors rather than an opaque LLM guess.

## Positioning

The incumbent in this space (damaishuju.com / 大麦数据, referenced by the requester as the visual and functional benchmark) offers a single-button "AI报告": enter a product ID, get a chart plus LLM commentary, with no visible separation between computed data and generated narrative. This product's mechanism a neighbor can't casually copy: factor scores are computed by deterministic code (sales trend, volatility, price elasticity, competition density, review quality, margin health, anomaly detection, data-confidence) and the LLM is only ever allowed to narrate those pre-computed numbers, never invent them. Decisions go through a bull/bear debate plus an independent decision agent (architecture borrowed from proven multi-agent trading-decision frameworks, not a single model talking itself into a conclusion), and it covers the full pipeline including "what should I sell" discovery, not just single-product reports.

## Operating Context

Researching products before listing on Mercado Libre Mexico. Currently runs on a deterministic mock data generator by default; a real Mercado Libre `DataSource` adapter exists (OAuth token flow, item/search/reviews client, local daily-snapshot accumulator) but is blocked on the requester needing a Mexican RFC tax ID to register an ML developer app — pending a local partner or third-party data provider. LLM narration goes through an OpenAI-compatible client (currently wired to DeepSeek) with a rule-based fallback when no key is configured, so the product must always keep working with zero external dependencies.

## Capabilities and Constraints

- Mock data is the default and must stay fully functional standalone; the Mercado Libre adapter is real code, not a stub, but unverified end-to-end (no live credentials yet).
- No marketplace anywhere publishes a historical sales/price time-series API (verified by hand against Mercado Libre, true industry-wide) — real trend data can only be built by accumulating one snapshot per day per product; a freshly-connected product legitimately starts with 0-1 history points and the factor engine must show that as low confidence, never backfill or fabricate history.
- Margin rate requires a user-supplied cost price (no marketplace API can know it); falls back to a labeled placeholder otherwise.
- No auth, no multi-user, no report persistence yet (reports are lost on refresh) — explicitly deferred, not yet decided whether/when to build.
- Deployment target still undecided; needs to be reachable from within mainland China without a VPN (a prior unrelated project on Vercel was not reachable domestically) — open decision, platform not yet chosen.

## Brand Commitments

None yet. No confirmed product name beyond the working title "大麦AI选品可研报告", no logo, no locked color/type identity. The damaishuju.com AI报告 screenshot is competitive evidence/a quality bar to meet or exceed — not a brand to imitate verbatim.

## Evidence on Hand

One screenshot of damaishuju.com's existing "AI报告" page: dark left sidebar nav, orange primary-action button, dual-axis price/sales bar+line trend chart, a structured anomaly/event table, right-side floating contact widget. This is competitor visual evidence, not an owned asset — do not reuse their copy, logo, or literal layout wholesale.

## Product Principles

1. Numbers before narrative — every factor score traces to an inspectable deterministic calculation; the LLM explains, it never invents.
2. Debate over single verdict — opposing AI viewpoints (bull/bear) surface disagreement before one decision agent commits, rather than one model talking itself into a conclusion.
3. Real data grows honestly — sparse or cold-start real data reads as low confidence in the UI, never gets padded with invented history to look complete.
4. Internal speed first, brand-ready later — current priority is dense, fast, decision-grade UI (Operate mode); persuasion/marketing polish is explicitly deferred until the external-product decision is made (see Users).
