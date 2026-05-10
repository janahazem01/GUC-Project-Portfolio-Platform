/** Lightweight SVG donut — aligns with accent palette. */

import { CHART_COLORS } from "./chartColors.js";

const DEFAULT_COLORS = CHART_COLORS;

function polar(cx, cy, r, angleDeg) {
  const a = (angleDeg - 90) * (Math.PI / 180);
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

export function MiniDonutChart({ segments, size = 160, thickness = 22, holeFill = "#0D0F14" }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  let angle = 0;
  const arcs =
    total <= 0
      ? []
      : segments
          .map((seg, i) => {
            const frac = seg.value / total;
            const a0 = angle;
            angle += frac * 360;
            const a1 = angle;
            if (frac <= 0) return null;
            const innerR = Math.max(r - thickness, 0);
            const [x1, y1] = polar(cx, cy, r, a0);
            const [x2, y2] = polar(cx, cy, r, a1);
            const [x3, y3] = polar(cx, cy, innerR, a1);
            const [x4, y4] = polar(cx, cy, innerR, a0);
            const largeArc = a1 - a0 > 180 ? 1 : 0;
            const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
            const color = seg.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
            return <path key={seg.key || seg.label} d={d} fill={color} className="transition-opacity hover:opacity-90" />;
          })
          .filter(Boolean);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto shrink-0" role="img" aria-label={segments.map((s) => `${s.label}: ${s.value}`).join(", ")}>
      {!arcs.length ? (
        <circle cx={cx} cy={cy} r={r - thickness / 2} fill="#1E2430" stroke="#252B38" strokeWidth="1" />
      ) : (
        <>
          <g>{arcs}</g>
          <circle cx={cx} cy={cy} r={r - thickness} fill={holeFill} />
        </>
      )}
    </svg>
  );
}

/** Vertical bars with light grid and axis hints (employer / admin dashboards). */
export function ColumnBarChart({
  buckets,
  chartHeightPx = 176,
  summary,
  yAxisLabel = "Listings",
  xAxisLabel = "Month posted",
}) {
  const maxVal = Math.max(1, ...buckets.map((b) => b.value));
  const tickTop = maxVal;
  const tickMid = Math.max(0, Math.round(maxVal / 2));
  const plotH = chartHeightPx;

  return (
    <div className="w-full">
      {summary ? (
        <p className="text-xs text-text-secondary font-sans leading-relaxed mb-3">{summary}</p>
      ) : null}
      <div className="flex gap-3 items-stretch">
        <div className="flex flex-col items-end justify-between text-[10px] font-mono text-text-secondary shrink-0 w-9 pt-1 pb-9 select-none" style={{ height: plotH }}>
          <span className="tabular-nums" title="Maximum count on this chart">
            {tickTop}
          </span>
          <span className="tabular-nums text-text-secondary/80">{tickMid}</span>
          <span>0</span>
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <p className="text-[10px] font-mono uppercase tracking-wider text-text-secondary/90 mb-1">{yAxisLabel}</p>
          <div
            className="relative rounded-lg border border-border bg-bg-elevated/25 px-2 sm:px-3 overflow-hidden"
            style={{ height: plotH }}
          >
            <div className="pointer-events-none absolute inset-x-2 top-[12%] border-t border-border/40" />
            <div className="pointer-events-none absolute inset-x-2 top-[50%] border-t border-dashed border-border/35" />
            <div className="pointer-events-none absolute inset-x-2 bottom-10 border-t border-border/40" />
            <div className="relative flex items-end justify-between gap-1 sm:gap-2 h-full pb-9 pt-2">
              {buckets.map((b, i) => {
                const pct = Math.max((b.value / maxVal) * 100, b.value ? 14 : 0);
                const color = b.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
                const title = b.fullLabel ?? b.label;
                return (
                  <div key={b.key} className="flex-1 flex flex-col items-center justify-end min-w-0 h-full gap-0.5 group">
                    <span className="text-[10px] font-mono text-text-secondary tabular-nums leading-none mb-0.5">{b.value}</span>
                    <div
                      className="w-full max-w-[2.75rem] rounded-t-md transition-opacity group-hover:opacity-95 mx-auto"
                      style={{
                        height: `${pct}%`,
                        minHeight: b.value ? 8 : 0,
                        backgroundColor: color,
                      }}
                      title={`${title}: ${b.value} listing${b.value === 1 ? "" : "s"}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-between gap-1 px-1 mt-1 min-h-[2.25rem]">
            {buckets.map((b) => (
              <div key={`${b.key}-lab`} className="flex-1 min-w-0 text-center">
                <span className="text-[10px] font-sans text-text-secondary leading-tight block truncate" title={b.fullLabel ?? b.label}>
                  {b.label}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-sans text-text-secondary text-center mt-1.5">{xAxisLabel}</p>
        </div>
      </div>
    </div>
  );
}
