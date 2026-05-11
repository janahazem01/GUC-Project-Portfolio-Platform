/** Lightweight SVG donut — aligns with accent palette. */

import { useEffect, useId, useMemo, useState } from "react";
import { CHART_COLORS } from "./chartColors.js";

const DEFAULT_COLORS = CHART_COLORS;

function polar(cx, cy, r, angleDeg) {
  const a = (angleDeg - 90) * (Math.PI / 180);
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

/** Blend solid hex color toward white for a subtle inner highlight on ring segments */
function tintTowardWhite(hex, amount = 0.28) {
  const n = String(hex).replace("#", "");
  if (n.length !== 6) return hex;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const L = (c) => Math.min(255, Math.round(c + (255 - c) * amount));
  return `rgb(${L(r)},${L(g)},${L(b)})`;
}

/**
 * Donut chart with a truly hollow center (no fill disk) so the card shows through.
 * Optional `centerFill` adds a soft disc for special layouts; default is open ring only.
 */
export function MiniDonutChart({ segments, size = 160, thickness = 22, centerFill = null }) {
  const uidRaw = useId();
  const uid = uidRaw.replace(/:/g, "");
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const innerR = Math.max(r - thickness, 0);

  const segmentStroke = "rgb(var(--c-bg-surface) / 0.95)";
  const segmentStrokeW = total > 0 && segments.length > 1 ? 1.5 : 0;

  const sliceRows = useMemo(() => {
    let sweep = 0;
    return segments
      .map((seg, i) => {
        const frac = total ? seg.value / total : 0;
        const a0 = sweep;
        sweep += frac * 360;
        const a1 = sweep;
        const color = seg.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
        return { seg, i, frac, a0, a1, color, key: seg.key || seg.label || String(i) };
      })
      .filter((row) => row.frac > 0);
  }, [segments, total]);

  const { defsContent, pathsContent, ariaLabel } = useMemo(() => {
    if (!sliceRows.length) {
      return { defsContent: null, pathsContent: null, ariaLabel: "No data" };
    }

    const defs = [];
    const paths = [];
    const ariaParts = [];

    sliceRows.forEach((row) => {
      const { seg, i, a0, a1, color, key } = row;
      const ir = Math.max(r - thickness, 0);
      const [x1, y1] = polar(cx, cy, r, a0);
      const [x2, y2] = polar(cx, cy, r, a1);
      const [x3, y3] = polar(cx, cy, ir, a1);
      const [x4, y4] = polar(cx, cy, ir, a0);
      const largeArc = a1 - a0 > 180 ? 1 : 0;
      const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${ir} ${ir} 0 ${largeArc} 0 ${x4} ${y4} Z`;
      const midDeg = (a0 + a1) / 2;
      const midRad = ((midDeg - 90) * Math.PI) / 180;
      const ix = cx + Math.cos(midRad) * ir;
      const iy = cy + Math.sin(midRad) * ir;
      const ox = cx + Math.cos(midRad) * r;
      const oy = cy + Math.sin(midRad) * r;
      const gradId = `${uid}-grad-${i}`;
      const pct = total ? ((seg.value / total) * 100).toFixed(1) : "0";
      const label = seg.label ?? seg.key ?? "Segment";
      const titleText = `${label}: ${seg.value} (${pct}% of total)`;

      defs.push(
        <linearGradient
          key={`def-${gradId}`}
          id={gradId}
          gradientUnits="userSpaceOnUse"
          x1={ix}
          y1={iy}
          x2={ox}
          y2={oy}
        >
          <stop offset="0%" stopColor={tintTowardWhite(color)} />
          <stop offset="88%" stopColor={color} />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      );

      paths.push(
        <path
          key={key}
          d={d}
          fill={`url(#${gradId})`}
          stroke={segmentStrokeW ? segmentStroke : "none"}
          strokeWidth={segmentStrokeW || 0}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="cursor-default transition-[filter] duration-200 ease-out hover:brightness-110"
        >
          <title>{titleText}</title>
        </path>
      );

      ariaParts.push(`${label}: ${seg.value} (${pct}%)`);
    });

    return {
      defsContent: defs,
      pathsContent: paths,
      ariaLabel: ariaParts.join("; "),
    };
  }, [sliceRows, cx, cy, r, thickness, segmentStroke, segmentStrokeW, total, uid]);

  const centerDisc =
    centerFill != null && centerFill !== "" ? (
      <circle cx={cx} cy={cy} r={innerR} fill={centerFill} className="pointer-events-none" />
    ) : null;

  const hasData = Boolean(pathsContent);

  return (
    <div
      className="group/donut inline-flex max-w-full justify-center transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none motion-reduce:transform-none group-hover/donut:scale-[1.02]"
      style={{ transformOrigin: "center" }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={`mx-auto shrink-0 max-w-full transition-all duration-500 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:scale-100 ${
          entered ? "opacity-100 scale-100" : "opacity-0 scale-[0.94]"
        } group-hover/donut:drop-shadow-[0_4px_16px_rgb(0_0_0/0.08)]`}
        style={{ transformOrigin: "center center" }}
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          <filter id={`${uid}-ring-shadow`} x="-35%" y="-35%" width="170%" height="170%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.14" />
          </filter>
          {defsContent}
        </defs>
        {!hasData ? (
          <>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              className="animate-pulse motion-reduce:animate-none"
              fill="none"
              stroke="rgb(var(--c-border) / 0.45)"
              strokeWidth="1.25"
            />
            <circle
              cx={cx}
              cy={cy}
              r={innerR}
              className="animate-pulse motion-reduce:animate-none"
              fill="none"
              stroke="rgb(var(--c-border) / 0.32)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
          </>
        ) : (
          <g filter={`url(#${uid}-ring-shadow)`}>
            <circle
              cx={cx}
              cy={cy}
              r={r + 1.25}
              fill="none"
              stroke="rgb(var(--c-border) / 0.18)"
              strokeWidth="1"
              className="pointer-events-none"
            />
            {centerDisc}
            {pathsContent}
          </g>
        )}
      </svg>
    </div>
  );
}

/**
 * GitHub-style language strip: one rounded horizontal bar with proportional segments
 * and a dot + label + % legend (student “My Projects” language mix).
 */
export function LanguageDistributionBar({ rows, total }) {
  if (!rows?.length || !total) {
    return (
      <p className="text-sm text-text-secondary font-sans">
        Add programming languages to your project stacks to see how they split across projects.
      </p>
    );
  }

  const ariaLabel = rows
    .map((row) => {
      const pct = (row.count / total) * 100;
      return `${row.language} ${pct.toFixed(1)}%`;
    })
    .join(", ");

  return (
    <div className="w-full min-w-0">
      <p className="text-xs font-sans font-semibold text-text-primary mb-2">Languages</p>
      <div
        className="flex w-full h-2.5 sm:h-3 rounded-full overflow-hidden bg-border/50 ring-1 ring-border/60"
        role="img"
        aria-label={`Language mix: ${ariaLabel}`}
      >
        {rows.map((row, i) => {
          const widthPct = (row.count / total) * 100;
          const color = DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          return (
            <div
              key={row.language}
              className="h-full shrink-0"
              style={{
                width: `${widthPct}%`,
                minWidth: widthPct > 0 ? "3px" : undefined,
                backgroundColor: color,
              }}
              title={`${row.language}: ${widthPct.toFixed(1)}%`}
            />
          );
        })}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-2 mt-3 list-none p-0 m-0">
        {rows.map((row, i) => {
          const pct = (row.count / total) * 100;
          const color = DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          return (
            <li key={row.language} className="flex items-center gap-1.5 text-xs font-sans">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
                aria-hidden
              />
              <span className="text-text-primary">
                {row.language}
                {" "}
                <span className="text-text-secondary font-mono tabular-nums">{pct.toFixed(1)}%</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
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
