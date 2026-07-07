import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PowerInfoPanel } from "./components/PowerInfoPanel";
import { TechPin } from "./components/TechPin";
import { useSpectrumInteractions } from "./hooks/useSpectrumInteractions";
import { usePowerView } from "./hooks/usePowerView";
import { getTechIcon } from "./icons/getTechIcon";
import { TECHNOLOGIES } from "./spectrumData";
import {
  formatPower,
  generatePowerTicks,
  posToWatts,
  powerToPosition,
  POWER_BANDS,
  POWER_CATEGORIES,
} from "./powerData";
import {
  BAR_H,
  BAR_Y,
  posToX,
  SVG_H,
  VB_W,
} from "./spectrumMath";

const KEY_ZOOM_STEP = 1.3;
const KEY_PAN_STEP  = 0.15;

export default function PowerViz() {
  const containerRef = useRef(null);
  const { view, applyZoom, applyPan, focusTech, resetView } = usePowerView();
  const [selectedTech, setSelectedTech] = useState(null);
  const [width, setWidth] = useState(VB_W);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(Math.max(el.clientWidth, 1));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { s, e } = view;
  const viewRange = e - s;
  const zoomLevel = 1 / viewRange;

  const {
    isDragging,
    handleMouseDown,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useSpectrumInteractions(containerRef, { applyZoom, applyPan });

  const togglePin = useCallback((tech) => {
    setSelectedTech((prev) => (prev?.id === tech.id ? null : tech));
  }, []);

  const jumpToTech = useCallback(
    (tech) => {
      focusTech(tech);
      setSelectedTech(tech);
    },
    [focusTech],
  );

  const reset = useCallback(() => {
    resetView();
    setSelectedTech(null);
  }, [resetView]);

  // ── keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (ev) => {
      const t = ev.target;
      if (t instanceof HTMLElement && /^(input|textarea|select)$/i.test(t.tagName)) return;
      switch (ev.key) {
        case "+": case "=": applyZoom(0.5, KEY_ZOOM_STEP); break;
        case "-": case "_": applyZoom(0.5, 1 / KEY_ZOOM_STEP); break;
        case "ArrowLeft":   applyPan(KEY_PAN_STEP); break;
        case "ArrowRight":  applyPan(-KEY_PAN_STEP); break;
        case "0": reset(); break;
        default: return;
      }
      ev.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [applyPan, applyZoom, reset]);

  // ── derived render data ───────────────────────────────────────────────────
  const visibleBands = useMemo(
    () =>
      POWER_BANDS.filter((b) => {
        const bS = powerToPosition(b.wMin);
        const bE = powerToPosition(b.wMax);
        return bE > s && bS < e;
      }),
    [s, e],
  );

  const visibleCategories = useMemo(
    () =>
      POWER_CATEGORIES.filter((c) => {
        const cS = powerToPosition(c.wMin);
        const cE = powerToPosition(c.wMax);
        return cE > s && cS < e;
      }),
    [s, e],
  );

  const visibleTechs = useMemo(() => {
    const pad = viewRange * 0.05;
    return TECHNOLOGIES.map((tech, idx) => ({ tech, idx })).filter(({ tech }) => {
      const p = powerToPosition(tech.powerW);
      return p >= s - pad && p <= e + pad;
    });
  }, [s, e, viewRange]);

  const ticks = useMemo(() => generatePowerTicks(s, e), [s, e]);

  const wattsLeft  = posToWatts(s);
  const wattsRight = posToWatts(e);

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-content">
          <h1>
            <span className="power-text">Signal Power Levels</span>
            <span className="subtitle"> Interactive Explorer</span>
          </h1>
          <div className="header-controls">
            <button
              type="button"
              onClick={() => applyZoom(0.5, KEY_ZOOM_STEP)}
              aria-label="Zoom in"
              title="Zoom in (+)"
            >
              ＋
            </button>
            <button
              type="button"
              onClick={() => applyZoom(0.5, 1 / KEY_ZOOM_STEP)}
              aria-label="Zoom out"
              title="Zoom out (−)"
            >
              －
            </button>
            <button
              type="button"
              onClick={reset}
              className="reset-btn"
              title="Reset view (0)"
            >
              ⌂ Reset
            </button>
            <span
              className="zoom-display"
              aria-label={`Current zoom level ${zoomLevel.toFixed(1)}x`}
            >
              {zoomLevel.toFixed(1)}×
            </span>
          </div>
        </div>
        <p className="hint">
          Scroll or pinch to zoom · drag or ← → to pan · click a pin for details · press 0 to reset
        </p>
      </header>

      <nav className="tech-nav" aria-label="Jump to technology">
        {TECHNOLOGIES.map((t) => (
          <button
            type="button"
            key={t.id}
            className={`tech-chip ${selectedTech?.id === t.id ? "active" : ""}`}
            style={{ "--chip-color": t.color }}
            onClick={() => jumpToTech(t)}
          >
            <span aria-hidden="true">{getTechIcon(t.svgIcon, 14, t.color)}</span>
            <span>{t.name}</span>
          </button>
        ))}
      </nav>

      <div
        ref={containerRef}
        className={`viz-container${isDragging ? " is-dragging" : ""}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setSelectedTech(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${SVG_H}`}
          width="100%"
          height={SVG_H}
          preserveAspectRatio="none"
          className="spectrum-svg"
          role="img"
          aria-label="Signal power levels from 100 nW to 10 MW"
        >
          <defs>
            {/* Cool-to-hot gradient: represents increasing power */}
            <linearGradient id="powerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"    stopColor="#190044" />
              <stop offset="14.3%" stopColor="#3300aa" />
              <stop offset="28.6%" stopColor="#0044cc" />
              <stop offset="42.9%" stopColor="#00aacc" />
              <stop offset="57.1%" stopColor="#00bb66" />
              <stop offset="71.4%" stopColor="#cccc00" />
              <stop offset="85.7%" stopColor="#ff9900" />
              <stop offset="100%" stopColor="#ff3300" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Power band segments */}
          {visibleBands.map((band) => {
            const bS = powerToPosition(band.wMin);
            const bE = powerToPosition(band.wMax);
            const x  = posToX(bS, s, e, width);
            const w  = ((bE - bS) / viewRange) * width;
            const wFrac = (bE - bS) / viewRange;

            return (
              <g key={band.abbr}>
                <rect
                  x={x}
                  y={BAR_Y}
                  width={w}
                  height={BAR_H}
                  fill={band.color}
                  opacity={0.9}
                  stroke="#111"
                  strokeWidth={0.5}
                />
                {wFrac > 0.03 && (
                  <text
                    x={x + w / 2}
                    y={BAR_Y + BAR_H / 2 + 5}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={wFrac > 0.1 ? 14 : 10}
                    fontWeight="800"
                    fontFamily="'Courier New', monospace"
                    style={{ pointerEvents: "none" }}
                    filter={wFrac > 0.12 ? "url(#glow)" : undefined}
                  >
                    {band.abbr}
                  </text>
                )}
                {wFrac > 0.06 && (
                  <text
                    x={x + w / 2}
                    y={BAR_Y - 32}
                    textAnchor="middle"
                    fill={band.color}
                    fontSize={wFrac > 0.12 ? 11 : 9}
                    fontFamily="'Courier New', monospace"
                    style={{ pointerEvents: "none" }}
                  >
                    {wFrac > 0.14 ? band.name : band.abbr}
                  </text>
                )}
              </g>
            );
          })}

          {/* Broad category labels below the bar */}
          {visibleCategories.map((cat) => {
            const cS = powerToPosition(cat.wMin);
            const cE = powerToPosition(cat.wMax);
            const vS = Math.max(cS, s);
            const vE = Math.min(cE, e);
            const midPos = (vS + vE) / 2;
            const x = posToX(midPos, s, e, width);
            const wFrac = (vE - vS) / viewRange;
            if (wFrac < 0.04) return null;
            return (
              <text
                key={cat.name}
                x={x}
                y={BAR_Y + BAR_H + 16}
                textAnchor="middle"
                fill="#e8e8ff"
                fontSize={13}
                fontWeight="700"
                fontFamily="'Segoe UI', system-ui, sans-serif"
                style={{ pointerEvents: "none" }}
              >
                {cat.name}
              </text>
            );
          })}

          {/* Tick marks (immediately above the bar) */}
          {ticks.map(({ pos, label }) => {
            const x = posToX(pos, s, e, width);
            if (x < -20 || x > width + 20) return null;
            return (
              <g key={label}>
                <line
                  x1={x} y1={BAR_Y - 10}
                  x2={x} y2={BAR_Y}
                  stroke="#666"
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={BAR_Y - 16}
                  textAnchor="middle"
                  fill="#888"
                  fontSize={9}
                  fontFamily="'Courier New', monospace"
                  style={{ pointerEvents: "none" }}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Technology pins */}
          {visibleTechs.map(({ tech, idx }) => {
            const p = powerToPosition(tech.powerW);
            const x = posToX(p, s, e, width);
            return (
              <TechPin
                key={tech.id}
                tech={tech}
                idx={idx}
                x={x}
                isSelected={selectedTech?.id === tech.id}
                onClick={togglePin}
                zoomLevel={zoomLevel}
                displayLabel={tech.powerDisplay}
              />
            );
          })}
        </svg>

        {selectedTech && (
          <PowerInfoPanel tech={selectedTech} onClose={() => setSelectedTech(null)} />
        )}
      </div>

      <footer className="freq-footer">
        <span className="freq-label freq-label-left">{formatPower(wattsLeft)}</span>
        <div
          className="minimap power-minimap"
          role="img"
          aria-label={`Viewing ${formatPower(wattsLeft)} to ${formatPower(wattsRight)}`}
        >
          <div
            className="minimap-view"
            style={{
              left:  `${s * 100}%`,
              width: `${viewRange * 100}%`,
            }}
          />
        </div>
        <span className="freq-label freq-label-right">{formatPower(wattsRight)}</span>
      </footer>
    </div>
  );
}
