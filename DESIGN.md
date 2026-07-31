---
name: 大麦AI选品可研报告
description: A dense operator's cockpit for cross-border sellers, where every factor score computes before the AI ever narrates it.
colors:
  amber-ember: "#ad4709"
  amber-ember-hover: "#963e08"
  on-accent: "#ffffff"
  amber-ember-text: "#ad4709"
  amber-ember-tint: "#fdf1e8"
  amber-ember-on-dark: "#f2934d"
  canvas-paper: "#f6f7f9"
  surface-card: "#ffffff"
  hairline: "#e4e7ec"
  ink: "#14161a"
  graphite: "#6b7280"
  console-black: "#12141c"
  console-black-hover: "#1c1f2b"
  console-mist: "#b8bcc8"
  console-white: "#ffffff"
  signal-green: "#188045"
  signal-green-tint: "#ecfbf2"
  signal-green-border: "#b8ecc9"
  signal-amber: "#9c6408"
  signal-amber-tint: "#fef6e7"
  signal-amber-border: "#f5dfa5"
  signal-red: "#b7333c"
  signal-red-tint: "#fdeeee"
  signal-red-border: "#f5c6c8"
typography:
  title:
    fontFamily: "Geist Sans, Arial, Helvetica, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: "normal"
    letterSpacing: "normal"
  body:
    fontFamily: "Geist Sans, Arial, Helvetica, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: "1.6"
    letterSpacing: "normal"
  label:
    fontFamily: "Geist Sans, Arial, Helvetica, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: "normal"
    letterSpacing: "0.05em"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "normal"
    letterSpacing: "normal"
    fontFeature: "tabular-nums"
rounded:
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  2xs: "6px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.amber-ember}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.amber-ember-hover}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  input-field:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  card:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.lg}"
    padding: "16px"
  badge-status:
    backgroundColor: "{colors.signal-green-tint}"
    textColor: "{colors.signal-green}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  nav-item-active:
    backgroundColor: "{colors.console-black-hover}"
    textColor: "{colors.console-white}"
    rounded: "{rounded.md}"
    padding: "10px"
---

# Design System: 大麦AI选品可研报告

## Overview

**Creative North Star: "The Trading Terminal"**

This is an instrument panel, not a brochure. The product's own architecture — deterministic factor scores that an LLM is only ever allowed to narrate, a bull/bear debate that has to disagree before a decision agent commits — is a trading-desk mechanism transplanted onto cross-border e-commerce research, and the surface says so before a single word of copy does: a permanently dark console rail (the amber-on-black of a phosphor terminal, not a marketing sidebar), one warm ember accent held in reserve for verdicts and primary actions, and every other pixel spent on tables, bars, and charts instead of on persuasion. The founding thesis, written into `globals.css` itself, is explicit: reject the generic "AI report" template of gradient hero and icon-cards for a page where every number reads as computed, not generated.

Density follows from that thesis rather than fighting it. Type sits mostly at 11–13.5px, spacing is tight (`gap-1.5`–`gap-2.5` inside components, `space-y-7` between report sections), and the canvas opens directly on the active task's input row — no hero, no chooser screen, no pitch. The one deliberate visual indulgence is the composite score: set in tabular mono at up to 26px, it is the only number on the page allowed to be loud, because it is the one number the whole pipeline exists to produce.

Confirmed rejections, carried from the direction contract and the finish review that enforced it: no gradient hero, no icon-tile cards standing in for real data, no kickers/eyebrows above headings, no emoji or unicode glyphs as icons (the codebase uses `lucide-react` exclusively — verified by grep), no invented shadow system.

**Key Characteristics:**
- Operate-mode density: small type, tight spacing, zero hero real estate.
- A permanently dark "console" rail, independent of the canvas's own light/dark mode.
- One accent color, spent almost entirely on the primary action and the composite score.
- Data rendered as tables, bars, and charts — never as icon-plus-label cards.
- Flat throughout: borders and tint backgrounds carry depth, not shadows.

## Colors

Restrained: a near-neutral canvas and card surface, one warm accent kept rare, and three semantic colors that do double duty as both status color and data-visualization color. Most tokens theme-swap between light and dark canvas mode; the frontmatter above records each token's light-mode (default `:root`) value as canonical, and this section notes the dark-mode counterpart in parentheses wherever it differs. A handful of tokens are pinned to a single value in both modes — these are called out explicitly, since they are deliberate exceptions, not omissions.

### Primary
- **Amber Ember** (`amber-ember`, #ad4709, fixed in both light and dark canvas mode): the solid accent fill. Used only behind white text — the primary-action button, the active state color for icons — never as a text color on its own background.
- **Amber Ember Hover** (`amber-ember-hover`, #963e08, fixed): darkened hover state for the same fills.
- **On Accent** (`on-accent`, #ffffff): the white text/icon color paired with every `amber-ember` fill.
- **Amber Ember Text** (`amber-ember-text`, #ad4709 light / #f2934d dark): the accent tuned for use as *text or an icon* sitting on `amber-ember-tint`, e.g. the composite score digits, the "选品委员会结论" section label. Never used as a fill.
- **Amber Ember Tint** (`amber-ember-tint`, #fdf1e8 light / #2a1c11 dark): the pale accent background that `amber-ember-text` sits on (the recommend page's committee-verdict panel).
- **Amber Ember On Dark** (`amber-ember-on-dark`, #f2934d, fixed in both modes): the sidebar-only bright variant, used exclusively for active/hover nav icon color inside the permanently-dark console rail, where the theme-swapped `amber-ember-text` would go muddy against near-black.

### Neutral
- **Canvas Paper** (`canvas-paper`, #f6f7f9 light / #0a0b0d dark): the page background.
- **Surface Card** (`surface-card`, #ffffff light / #16181d dark): every card, table container, and chart panel.
- **Hairline** (`hairline`, #e4e7ec light / #262931 dark): all borders and row dividers.
- **Ink** (`ink`, #14161a light / #e9eaed dark): primary text.
- **Graphite** (`graphite`, #6b7280 light / #8a8f9a dark): secondary/muted text — labels, captions, table metadata.
- **Console Black** (`console-black`, #12141c, fixed in both modes): the sidebar background.
- **Console Black Hover** (`console-black-hover`, #1c1f2b, fixed): sidebar row hover/active background.
- **Console Mist** (`console-mist`, #b8bcc8, fixed): sidebar default (non-active) text and icon color.
- **Console White** (`console-white`, #ffffff, fixed): sidebar active-state text.

### Semantic
- **Signal Green** (`signal-green`, #188045 light / #3fc274 dark), with `signal-green-tint` (#ecfbf2 / #0f2318) and `signal-green-border` (#b8ecc9 / #1f4a30): positive verdicts ("list"), high factor scores, "on" status chips.
- **Signal Amber** (`signal-amber`, #9c6408 light / #e0a83c dark), with `signal-amber-tint` (#fef6e7 / #2a2110) and `signal-amber-border` (#f5dfa5 / #4d3c14): watch verdicts, mid-range factor scores.
- **Signal Red** (`signal-red`, #b7333c light / #f0666f dark), with `signal-red-tint` (#fdeeee / #2a1517) and `signal-red-border` (#f5c6c8 / #4d2226): reject verdicts, low factor scores, anomaly rows and the anomaly table.

### Named Rules
**The Console Independence Rule.** The sidebar (`console-black`, `console-black-hover`, `console-mist`, `console-white`, `amber-ember-on-dark`) never theme-swaps. It stays near-black regardless of whether the canvas is in light or dark mode, because it represents the operations console, not a themed surface — the one part of the screen that is always "on."

**The Three-Faced Accent Rule.** A single accent hex cannot satisfy both "solid fill behind white text" and "colored text on a themed tint" across two color schemes at once, so the accent is deliberately split into three tokens: `amber-ember` (fixed fill, paired with `on-accent` white text, same value in both modes), `amber-ember-text` (theme-swapped, for accent-colored text/icons on `amber-ember-tint`), and `amber-ember-on-dark` (fixed bright variant, sidebar-only). Collapsing these back into one variable will break contrast in at least one of the three contexts — do not simplify.

**The One Meaning, One Color Rule.** Each semantic color (green/amber/red) means exactly one thing — positive/warning/negative — and is reused identically everywhere that meaning appears: factor-score bar fills, verdict card tint/text/icon, anomaly table text, status chips. There is never a second red for "error" and a different red for "danger"; if the meaning is the same, the token is the same.

## Typography

**Body Font:** Geist Sans (with Arial, Helvetica, sans-serif fallback)
**Label/Mono Font:** Geist Mono (with ui-monospace, monospace fallback)

**Character:** A workhorse UI sans throughout — deliberately not a display serif or anything with editorial personality, because this is an Operate-mode console, not a marketing surface. Geist Mono is reserved for one job only: real measurement digits.

### Hierarchy
- **Title** (600, 15px, normal line-height): page headers (`PageHeader`'s `<h1>`) and the verdict label inside `VerdictCard` (same role at 16px/600).
- **Body** (400, 13.5px, 1.6 line-height): paragraph copy, form inputs, table cell text, debate points, factor explanations.
- **Label** (500, 11px, 0.05em tracking, uppercase in practice): section eyebrows inside content ("核心因子分析", "候选排名"), table column headers, status-chip text. Always uppercase with wide tracking — this is the one place letter-spacing departs from normal.
- **Mono** (400, 13px base, tabular-nums): dates, z-scores, ranks, percentages, table numeric columns. Scales up to 700-weight 18px and 26px specifically for `CompositeScoreBadge`'s two sizes — the single loudest text on the page.

### Named Rules
**The Mono-For-Measurement Rule.** `font-mono` with `tabular-nums` is used exclusively for real computed digits — factor scores, z-scores, dates, percentages, ranks, the composite score. It never appears as a decorative "technical-looking" treatment on non-numeric text.

## Layout

The sidebar (`Sidebar.tsx`) is the sole navigation surface. `/` performs a server redirect straight to `/recommend`; there is no landing or chooser page, and the direction contract states this explicitly — the canvas opens on the active task's input row, not a hero. Every content page shares the same shape: a `PageHeader` (title + subtitle + `StatusBar`) atop a single-column form-then-report flow, capped at `max-w-3xl` and centered, with report sections stacked in `space-y-7`.

The sidebar itself is responsive by collapsing, not by hiding: below Tailwind's `sm` breakpoint it narrows to a 64px icon-only rail (labels, sub-labels, section eyebrow, and the pipeline caption at the bottom all drop via `hidden sm:block`/`sm:flex`), rather than becoming a hamburger drawer. Report content reflows to a single column below `md`; the ranking table scrolls horizontally on narrow viewports (`overflow-x-auto`, `min-w-[560px]`) rather than collapsing its columns.

Spacing runs tight inside components (6–10px gaps) and opens up between report sections (24–32px), so the rhythm reads as "dense within a block, clearly separated between blocks."

## Elevation & Depth

Fully flat. There is no shadow vocabulary anywhere in the codebase — no `box-shadow` on cards, buttons, inputs, or the sidebar. Depth and grouping are carried entirely by `hairline` borders and tint backgrounds (`surface-card` panels on `canvas-paper`, semantic tint panels for verdicts/anomalies/status). This is a confirmed invariant of the build, not a gap to fill in later.

### Named Rules
**The Flat-By-Default Rule.** Never add `box-shadow` to a component. If a surface needs to read as distinct or elevated, give it a `hairline` border and/or a tint background instead.

## Shapes

Two radii cover the entire system: `rounded-md` (6px) for buttons, inputs, badges, and sidebar nav rows, and `rounded-lg` (8px) for cards, panels, and chart/table containers — nothing goes larger. `rounded-full` appears twice, both for genuinely pill/track shapes: the `StatusBar` chips and the `FactorBars` progress-bar track. Borders are uniformly 1px solid `hairline` (or a semantic `-border` token on tinted panels); there is no double-border, inset, or dashed-border convention.

## Components

### Buttons
- **Shape:** `rounded-md` (6px).
- **Primary:** `amber-ember` background, `on-accent` (white) text, `10px 16px` padding, 13.5px/500 label with a leading `lucide-react` icon (`Search`/`Loader2`). This is the only filled button in the system — used for "生成报告" / "生成推荐" submit actions.
- **Hover / Focus:** background shifts to `amber-ember-hover`; disabled state drops to `opacity-60`. No ghost or secondary button variant exists in the codebase — every actionable surface is either the one primary button or a plain nav/table row.

### Chips (Status badges)
- **Style:** `rounded-full` pill, 1px border, tint background, colored text, plus a small solid dot matching the text color. "On" state uses `signal-green`/`signal-green-tint`/`signal-green-border`; "off" state falls back to plain `surface-card`/`hairline`/`graphite` — i.e. the off state is deliberately inert, not a second semantic color.
- **Use:** `StatusBar`'s LLM-connected and data-source-connected indicators, always visible in `PageHeader`.

### Cards / Containers
- **Corner Style:** `rounded-lg` (8px).
- **Background:** `surface-card`, or a semantic tint (`amber-ember-tint`, `signal-red-tint`) for verdict/anomaly/committee panels.
- **Shadow Strategy:** none — see Elevation & Depth.
- **Border:** 1px `hairline`, or the matching semantic `-border` token on tinted panels.
- **Internal Padding:** 16px (`p-4`), 20px (`p-5`) for the verdict card specifically.

### Inputs / Fields
- **Style:** `surface-card` background, 1px `hairline` border, `rounded-md`, 13.5px body text, `graphite` placeholder.
- **Focus:** border color shifts to `amber-ember` (`focus:border-accent`) — no glow, ring, or shadow.
- **Error / Disabled:** form-level errors render as a `signal-red-tint` banner below the form (icon + message), not inline per-field; submit buttons disable with `opacity-60` during loading.

### Navigation (Sidebar)
- **Style:** fixed-width rail (64px icon-only below `sm`, 240px with labels at `sm+`), `console-black` background throughout, one section eyebrow ("AI功能") in the Label typographic role, two nav entries each with a `lucide-react` icon plus a two-line label/sub-label stack.
- **States:** default text is `console-mist` with icon at 70% opacity; active or hovered rows get `console-black-hover` background, `console-white` text, and the icon switches to `amber-ember-on-dark`.
- **Mobile treatment:** collapses to icon-only with a `title` tooltip attribute rather than hiding or becoming a drawer — the rail is always present.

### Composite Score Badge (signature component)
The one place the system allows itself a loud number: `font-mono font-bold tabular-nums`, in `amber-ember-text`, at 26px (`md`, primary report view) or 18px (`sm`, ranking-table row context), followed by a small `/100 综合评分` label in `graphite`. Every report screen (`EvaluateForm`, `RecommendForm`) leads with this badge before any chart or table — it is the single number the whole factor pipeline exists to produce, and typography is the only thing allowed to make it stand out.

## Do's and Don'ts

### Do:
- **Do** keep the sidebar (`console-black` family) fixed regardless of canvas theme — it represents the always-on console, not a themed surface.
- **Do** use `amber-ember-text`/`amber-ember-tint` (never `amber-ember` itself) for accent-colored text sitting on a tinted background; reserve solid `amber-ember` fills for buttons/badges paired with white text.
- **Do** render every factor score, verdict, and anomaly through the same semantic color for its meaning (green/amber/red), never a second color for the same meaning in a different component.
- **Do** use `font-mono`/`tabular-nums` for computed digits only — scores, dates, z-scores, percentages, ranks.
- **Do** carry depth with a `hairline` border and/or tint background; never add a shadow.
- **Do** keep every accent-colored icon a single-stroke `lucide-react` icon, never an emoji or unicode glyph.

### Don't:
- **Don't** render data as icon-plus-heading-plus-text cards. The founding thesis is tables, bars, and charts; icon-tile cards are the generic "AI report" pattern this build explicitly rejected.
- **Don't** add a kicker or eyebrow label above a heading — section labels (the Label typographic role) sit as their own line, never stacked immediately above an `<h1>`/`<h3>` as a category tag.
- **Don't** introduce a second button variant (ghost/secondary/outline) without evidence it's needed — the system currently has exactly one filled button style and plain rows/links for everything else.
- **Don't** add a shadow, glow, or ring anywhere; flat surfaces plus borders are the entire depth system.
- **Don't** make the sidebar collapse into a hamburger/drawer on mobile — it narrows to a 64px icon rail instead, and stays visible at every breakpoint.
