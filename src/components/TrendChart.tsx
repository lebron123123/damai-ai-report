"use client";

import { useSyncExternalStore } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimeSeriesPoint } from "@/lib/data/types";

// Token hex pairs mirroring globals.css's light/dark values — recharts fills are
// plain SVG attributes and don't resolve CSS custom properties reactively, so
// the light/dark swap has to happen here via matchMedia instead.
const PALETTE = {
  light: { muted: "#6b7280", border: "#e4e7ec", bar: "#64748b", line: "#ad4709", anomaly: "#b7333c" },
  dark: { muted: "#8a8f9a", border: "#262931", bar: "#8493ab", line: "#f2934d", anomaly: "#f0666f" },
};

function subscribeToColorScheme(callback: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getColorScheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function getServerColorScheme(): "light" | "dark" {
  return "light";
}
function useColorScheme(): "light" | "dark" {
  return useSyncExternalStore(subscribeToColorScheme, getColorScheme, getServerColorScheme);
}

export function TrendChart({
  series,
  anomalyDates,
}: {
  series: TimeSeriesPoint[];
  anomalyDates?: Set<string>;
}) {
  const scheme = useColorScheme();
  const c = PALETTE[scheme];
  const axisTick = { fontSize: 11, fill: c.muted };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={series} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.border} />
          <XAxis dataKey="date" tick={axisTick} interval={Math.floor(series.length / 8)} stroke={c.border} />
          <YAxis yAxisId="sales" tick={axisTick} stroke={c.border} />
          <YAxis yAxisId="price" orientation="right" tick={axisTick} stroke={c.border} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }}
            labelStyle={{ color: "var(--foreground)" }}
            formatter={(value, name) => [String(value), name === "sales" ? "销量" : "价格"]}
          />
          <Bar yAxisId="sales" dataKey="sales" radius={[2, 2, 0, 0]} name="sales">
            {series.map((p, i) => (
              <Cell key={i} fill={anomalyDates?.has(p.date) ? c.anomaly : c.bar} />
            ))}
          </Bar>
          <Line yAxisId="price" type="monotone" dataKey="price" stroke={c.line} dot={false} strokeWidth={2} name="price" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
