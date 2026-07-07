import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InfoPanel } from "./components/InfoPanel";
import { TechPin } from "./components/TechPin";
import { useSpectrumInteractions } from "./hooks/useSpectrumInteractions";
import { useSpectrumView } from "./hooks/useSpectrumView";
import { getTechIcon } from "./icons/getTechIcon";
import {
  formatFrequency,
  freqToPosition,
  SPECTRUM_BANDS,
  TECHNOLOGIES,
} from "./spectrumData";
import {
  BAR_H,
  BAR_Y,
  generateTicks,
  posToHz,
  posToX,
  SVG_H,
  VB_W,
} from "./spectrumMath";

// Tunable: how much wheel/keyboard zoom multiplies per event.
const KEY_ZOOM_STEP = 1.3;
const KEY_PAN_STEP = 0.15; // fraction of the current view range

export default function SpectrumViz() {
  const containerRef = useRef(null);
  const { view, applyZoom, applyPan, focusTech, resetView } = useSpectrumView();
  const [selectedTech, setSelectedTech] = useState(null);

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

  // ── selection helpers ─────────────────────────────────────────────────
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

  // ── keyboard shortcuts (global) ───────────────────────────────────────
  useEffect(() => {
    const onKey = (ev) => {
      // Don't hijack keys while typing in a form control.
      const t = ev.target;
      if (t instanceof HTMLElement && /^(input|textarea|select)$/i.test(t.tagName)) {
        return;
      }
      switch (ev.key) {
        case "+":
        case "=":
          applyZoom(0.5, KEY_ZOOM_STEP);
          break;
        case "-":
        case "_":
          applyZoom(0.5, 1 / KEY_ZOOM_STEP);
          break;
        case "ArrowLeft":
          applyPan(KEY_PAN_STEP);
          break;
        case "ArrowRight":
          applyPan(-KEY_PAN_STEP);
          break;
        case "0":
          reset();
          break;
        default:
          return;
      }
      ev.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [applyPan, applyZoom, reset]);

  // ── derived render data ───────────────────────────────────────────────
  const visibleBands = useMemo(
    () =>
      SPECTRUM_BANDS.filter((b) => {
        const bS = freqToPosition(b.freqMin);
        const bE = freqToPosition(b.freqMax);
        return bE > s && bS < e;
      }),
    [s, e],
  );

  // Filter pins with a small overscan so half-visible ones don't pop.
  const visibleTechs = useMemo(() => {
    const pad = viewRange * 0.05;
    return TECHNOLOGIES.map((tech, idx) => ({ tech, idx })).filter(({ tech }) => {
      const p = tech.isIR ? freqToPosition(300e9) : freqToPosition(tech.frequency);
      return p >= s - pad && p <= e + pad;
    });
  }, [s, e, viewRange]);

  const ticks = useMemo(() => generateTicks(s, e), [s, e]);

  const freqLeft = posToHz(s);
  const freqRight = posToHz(e);

  // ── render ────────────────────────────────────────────────────────────
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-content">
          <h1>
            <span className="rainbow-text">Electromagnetic Spectrum</span>
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
          viewBox={`0 0 ${VB_W} ${SVG_H}`}
          width="100%"
          height={SVG_H}
          preserveAspectRatio="none"
          className="spectrum-svg"
          role="img"
          aria-label="Electromagnetic spectrum visualisation from 3 Hz to 3 × 10²² Hz"
        >
          <defs>
            <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7b00ff" />
              <stop offset="14.3%" stopColor="#4400ff" />
              <stop offset="28.6%" stopColor="#0000ff" />
              <stop offset="42.9%" stopColor="#00aaff" />
              <stop offset="57.1%" stopColor="#00ee00" />
              <stop offset="71.4%" stopColor="#ffff00" />
              <stop offset="85.7%" stopColor="#ff8800" />
              <stop offset="100%" stopColor="#ff0000" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Band segments */}
          {visibleBands.map((band) => {
            const bS = freqToPosition(band.freqMin);
            const bE = freqToPosition(band.freqMax);
            const x = posToX(bS, s, e);
            const w = ((bE - bS) / viewRange) * VB_W;
            const wFrac = (bE - bS) / viewRange;

            return (
              <g key={band.abbr}>
                <rect
                  x={x}
                  y={BAR_Y}
                  width={w}
                  height={BAR_H}
                  fill={band.color === "rainbow" ? "url(#rainbow)" : band.color}
                  opacity={0.85}
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
                    y={BAR_Y - 8}
                    textAnchor="middle"
                    fill={band.color === "rainbow" ? "#ffdd44" : band.color}
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

          {/* Tick marks */}
          {ticks.map(({ pos, label }) => {
            const x = posToX(pos, s, e);
            if (x < -20 || x > VB_W + 20) return null;
            return (
              <g key={label}>
                <line
                  x1={x}
                  y1={BAR_Y + BAR_H}
                  x2={x}
                  y2={BAR_Y + BAR_H + 10}
                  stroke="#666"
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={BAR_Y + BAR_H + 22}
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
            const p = tech.isIR ? freqToPosition(300e9) : freqToPosition(tech.frequency);
            const x = posToX(p, s, e);
            return (
              <TechPin
                key={tech.id}
                tech={tech}
                idx={idx}
                x={x}
                isSelected={selectedTech?.id === tech.id}
                onClick={togglePin}
                zoomLevel={zoomLevel}
              />
            );
          })}
        </svg>

        {selectedTech && (
          <InfoPanel tech={selectedTech} onClose={() => setSelectedTech(null)} />
        )}
      </div>

      <footer className="freq-footer">
        <span className="freq-label freq-label-left">{formatFrequency(freqLeft)}</span>
        <div
          className="minimap"
          role="img"
          aria-label={`Viewing ${formatFrequency(freqLeft)} to ${formatFrequency(freqRight)}`}
        >
          <div
            className="minimap-view"
            style={{
              left: `${s * 100}%`,
              width: `${viewRange * 100}%`,
            }}
          />
        </div>
        <span className="freq-label freq-label-right">{formatFrequency(freqRight)}</span>
      </footer>
    </div>
  );
}
