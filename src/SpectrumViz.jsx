import { useState, useRef, useCallback, useEffect } from "react";
import {
  SPECTRUM_BANDS,
  TECHNOLOGIES,
  freqToPosition,
  formatFrequency,
  LOG_MIN,
  LOG_MAX,
} from "./spectrumData";
import { getTechIcon } from "./icons/TechIcons";

// ─── constants ───────────────────────────────────────────────────────────────
const VB_W       = 1000;   // SVG viewBox width
const BAR_Y      = 50;     // Y start of the colour bar
const BAR_H      = 70;     // height of the colour bar
const PIN_AREA_H = 240;    // space below bar for pins
const SVG_H      = BAR_Y + BAR_H + PIN_AREA_H;  // 360

const MIN_ZOOM   = 1;
const MAX_ZOOM   = 150;

// ─── helpers ─────────────────────────────────────────────────────────────────
function posToHz(pos) {
  const logVal = pos * (LOG_MAX - LOG_MIN) + LOG_MIN;
  return Math.pow(10, logVal);
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// Convert a 0‑1 spectrum position to a pixel X inside the SVG viewBox
function posToX(pos, viewStart, viewEnd) {
  return ((pos - viewStart) / (viewEnd - viewStart)) * VB_W;
}

// ─── TechPin ─────────────────────────────────────────────────────────────────
function TechPin({ tech, x, isSelected, onClick, zoomLevel }) {
  const idx = TECHNOLOGIES.findIndex((t) => t.id === tech.id);
  const isDown = idx % 2 === 1;
  const stemH  = 42 + (idx % 4) * 16;
  const iconR  = isSelected ? 22 : 17;
  const pinY   = BAR_Y + BAR_H;                 // base of the bar
  const iconY  = isDown ? pinY + stemH : pinY - stemH;

  return (
    <g
      transform={`translate(${x}, 0)`}
      style={{ cursor: "pointer" }}
      onClick={(e) => { e.stopPropagation(); onClick(tech); }}
    >
      {/* stem */}
      <line
        x1={0} y1={pinY}
        x2={0} y2={iconY}
        stroke={tech.color}
        strokeWidth={isSelected ? 2 : 1.4}
        strokeDasharray={isDown ? "none" : "4,3"}
        opacity={0.8}
      />
      {/* circle bubble */}
      <circle
        cx={0} cy={iconY}
        r={iconR}
        fill={isSelected ? tech.color : "#12122a"}
        stroke={tech.color}
        strokeWidth={isSelected ? 2.5 : 1.8}
        opacity={0.95}
      />
      {/* icon via foreignObject */}
      <foreignObject
        x={-iconR + 3} y={iconY - iconR + 3}
        width={(iconR - 3) * 2} height={(iconR - 3) * 2}
      >
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", height: "100%",
          }}
        >
          {getTechIcon(tech.svgIcon, (iconR - 3) * 2 - 2, isSelected ? "#fff" : tech.color)}
        </div>
      </foreignObject>
      {/* name label */}
      {(isSelected || zoomLevel > 4) && (
        <text
          x={0} y={isDown ? iconY + iconR + 14 : iconY - iconR - 5}
          textAnchor="middle"
          fill={tech.color}
          fontSize={isSelected ? 11 : 9}
          fontWeight="700"
          fontFamily="'Courier New', monospace"
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {tech.name}
        </text>
      )}
    </g>
  );
}

// ─── InfoPanel ────────────────────────────────────────────────────────────────
function InfoPanel({ tech, onClose }) {
  if (!tech) return null;
  return (
    <div className="info-panel" onClick={(e) => e.stopPropagation()}>
      <button className="close-btn" onClick={onClose}>✕</button>
      <div className="info-header">
        <div className="info-icon">
          {getTechIcon(tech.svgIcon, 44, tech.color)}
        </div>
        <div>
          <h2 style={{ color: tech.color, margin: 0 }}>{tech.name}</h2>
          <p className="full-name">{tech.fullName}</p>
        </div>
      </div>
      <div className="info-grid">
        <div className="info-item">
          <span className="label">Frequency</span>
          <span className="value freq-val" style={{ color: tech.color }}>{tech.freqDisplay}</span>
        </div>
        <div className="info-item">
          <span className="label">Band</span>
          <span className="value">{tech.band}</span>
        </div>
        <div className="info-item">
          <span className="label">Range</span>
          <span className="value">{tech.range}</span>
        </div>
        <div className="info-item">
          <span className="label">Standard</span>
          <span className="value">{tech.standard}</span>
        </div>
      </div>
      <p className="description">{tech.description}</p>
      <div className="examples">
        <h4>Real-World Examples</h4>
        <ul>
          {tech.examples.map((ex, i) => (
            <li key={i} style={{ "--c": tech.color }}>{ex}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── SpectrumViz ──────────────────────────────────────────────────────────────
export default function SpectrumViz() {
  const containerRef = useRef(null);
  const [view, setView] = useState({ s: 0, e: 1 });
  const [selectedTech, setSelectedTech] = useState(null);

  const viewRange  = view.e - view.s;
  const zoomLevel  = 1 / viewRange;

  // ── atomic zoom ────────────────────────────────────────────────────────
  const applyZoom = useCallback((focalFrac, factor) => {
    setView((v) => {
      const range    = v.e - v.s;
      const focalAbs = v.s + focalFrac * range;
      let newRange   = clamp(range / factor, 1 / MAX_ZOOM, 1 / MIN_ZOOM);
      let ns         = focalAbs - focalFrac * newRange;
      let ne         = ns + newRange;
      if (ns < 0) { ns = 0; ne = newRange; }
      if (ne > 1) { ne = 1; ns = 1 - newRange; }
      return { s: ns, e: ne };
    });
  }, []);

  const applyPan = useCallback((deltaNorm) => {
    setView((v) => {
      const r = v.e - v.s;
      let ns = v.s - deltaNorm * r;
      let ne = v.e - deltaNorm * r;
      if (ns < 0) { ns = 0; ne = r; }
      if (ne > 1) { ne = 1; ns = 1 - r; }
      return { s: ns, e: ne };
    });
  }, []);

  // ── wheel ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const frac = (e.clientX - rect.left) / rect.width;
      applyZoom(frac, e.deltaY < 0 ? 1.2 : 1 / 1.2);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [applyZoom]);

  // ── mouse drag ─────────────────────────────────────────────────────────
  const dragRef = useRef({ active: false, lastX: 0 });

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    dragRef.current = { active: true, lastX: e.clientX };
  };
  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current.active) return;
      const rect = containerRef.current.getBoundingClientRect();
      const delta = (e.clientX - dragRef.current.lastX) / rect.width;
      dragRef.current.lastX = e.clientX;
      applyPan(delta);
    };
    const onUp = () => { dragRef.current.active = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
  }, [applyPan]);

  // ── pinch / touch ──────────────────────────────────────────────────────
  const pinchRef = useRef({ dist: null, mid: 0, lastX: 0 });

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      pinchRef.current.dist = Math.hypot(dx, dy);
      const rect = containerRef.current.getBoundingClientRect();
      pinchRef.current.mid =
        ((e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left) / rect.width;
    } else if (e.touches.length === 1) {
      dragRef.current = { active: true, lastX: e.touches[0].clientX };
    }
  };
  const handleTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 2 && pinchRef.current.dist !== null) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      const nd = Math.hypot(dx, dy);
      applyZoom(pinchRef.current.mid, nd / pinchRef.current.dist);
      pinchRef.current.dist = nd;
    } else if (e.touches.length === 1 && dragRef.current.active) {
      const rect = containerRef.current.getBoundingClientRect();
      const delta = (e.touches[0].clientX - dragRef.current.lastX) / rect.width;
      dragRef.current.lastX = e.touches[0].clientX;
      applyPan(delta);
    }
  };
  const handleTouchEnd = () => {
    dragRef.current.active = false;
    pinchRef.current.dist = null;
  };

  // ── focus a tech ──────────────────────────────────────────────────────
  const focusTech = (tech) => {
    const pos  = tech.isIR ? freqToPosition(300e9) : freqToPosition(tech.frequency);
    const span = 0.045;
    let s = pos - span / 2;
    let e = pos + span / 2;
    if (s < 0) { s = 0; e = span; }
    if (e > 1) { e = 1; s = 1 - span; }
    setView({ s, e });
    setSelectedTech(tech);
  };

  // ── visible items ─────────────────────────────────────────────────────
  const visibleBands = SPECTRUM_BANDS.filter((b) => {
    const bS = freqToPosition(b.freqMin);
    const bE = freqToPosition(b.freqMax);
    return bE > view.s && bS < view.e;
  });

  const visibleTechs = TECHNOLOGIES.filter((t) => {
    const p = t.isIR ? freqToPosition(300e9) : freqToPosition(t.frequency);
    return p >= view.s - viewRange * 0.05 && p <= view.e + viewRange * 0.05;
  });

  const freqLeft  = posToHz(view.s);
  const freqRight = posToHz(view.e);

  // ── ticks ─────────────────────────────────────────────────────────────
  const ticks = generateTicks(view.s, view.e);

  // ── render ────────────────────────────────────────────────────────────
  return (
    <div className="app-root">
      {/* header */}
      <header className="app-header">
        <div className="header-content">
          <h1>
            <span className="rainbow-text">Electromagnetic Spectrum</span>
            <span className="subtitle"> Interactive Explorer</span>
          </h1>
          <div className="header-controls">
            <button onClick={() => applyZoom(0.5, 1.3)} title="Zoom in">＋</button>
            <button onClick={() => applyZoom(0.5, 1 / 1.3)} title="Zoom out">－</button>
            <button
              onClick={() => { setView({ s: 0, e: 1 }); setSelectedTech(null); }}
              className="reset-btn"
            >
              ⌂ Reset
            </button>
            <span className="zoom-display">{zoomLevel.toFixed(1)}×</span>
          </div>
        </div>
        <p className="hint">Scroll or pinch to zoom · drag to pan · click a pin for details</p>
      </header>

      {/* tech quick-nav */}
      <nav className="tech-nav">
        {TECHNOLOGIES.map((t) => (
          <button
            key={t.id}
            className={`tech-chip ${selectedTech?.id === t.id ? "active" : ""}`}
            style={{ "--chip-color": t.color }}
            onClick={() => focusTech(t)}
          >
            {getTechIcon(t.svgIcon, 14, t.color)}
            <span>{t.name}</span>
          </button>
        ))}
      </nav>

      {/* viz */}
      <div
        ref={containerRef}
        className="viz-container"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setSelectedTech(null)}
        style={{ cursor: dragRef.current?.active ? "grabbing" : "grab", userSelect: "none" }}
      >
        <svg
          viewBox={`0 0 ${VB_W} ${SVG_H}`}
          width="100%"
          height={SVG_H}
          preserveAspectRatio="none"
          className="spectrum-svg"
          style={{ display: "block" }}
        >
          <defs>
            <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"    stopColor="#7b00ff"/>
              <stop offset="14.3%" stopColor="#4400ff"/>
              <stop offset="28.6%" stopColor="#0000ff"/>
              <stop offset="42.9%" stopColor="#00aaff"/>
              <stop offset="57.1%" stopColor="#00ee00"/>
              <stop offset="71.4%" stopColor="#ffff00"/>
              <stop offset="85.7%" stopColor="#ff8800"/>
              <stop offset="100%"  stopColor="#ff0000"/>
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* ── Band segments ── */}
          {visibleBands.map((band) => {
            const bS = freqToPosition(band.freqMin);
            const bE = freqToPosition(band.freqMax);
            const x  = posToX(bS, view.s, view.e);
            const w  = (bE - bS) / viewRange * VB_W;
            const wFrac = (bE - bS) / viewRange;

            return (
              <g key={band.abbr}>
                <rect
                  x={x} y={BAR_Y} width={w} height={BAR_H}
                  fill={band.color === "rainbow" ? "url(#rainbow)" : band.color}
                  opacity={0.85}
                  stroke="#111" strokeWidth={0.5}
                />
                {/* inner band label */}
                {wFrac > 0.03 && (
                  <text
                    x={x + w / 2} y={BAR_Y + BAR_H / 2 + 5}
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
                {/* above-bar name */}
                {wFrac > 0.06 && (
                  <text
                    x={x + w / 2} y={BAR_Y - 8}
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

          {/* ── Tick marks ── */}
          {ticks.map(({ pos, label }, i) => {
            const x = posToX(pos, view.s, view.e);
            if (x < -20 || x > VB_W + 20) return null;
            return (
              <g key={i}>
                <line x1={x} y1={BAR_Y + BAR_H} x2={x} y2={BAR_Y + BAR_H + 10}
                  stroke="#666" strokeWidth={1}/>
                <text
                  x={x} y={BAR_Y + BAR_H + 22}
                  textAnchor="middle"
                  fill="#888" fontSize={9}
                  fontFamily="'Courier New', monospace"
                  style={{ pointerEvents: "none" }}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* ── Technology pins ── */}
          {visibleTechs.map((tech) => {
            const p = tech.isIR ? freqToPosition(300e9) : freqToPosition(tech.frequency);
            const x = posToX(p, view.s, view.e);
            return (
              <TechPin
                key={tech.id}
                tech={tech}
                x={x}
                isSelected={selectedTech?.id === tech.id}
                onClick={(t) => setSelectedTech((prev) => prev?.id === t.id ? null : t)}
                zoomLevel={zoomLevel}
              />
            );
          })}
        </svg>

        {/* overlay info panel */}
        {selectedTech && (
          <InfoPanel tech={selectedTech} onClose={() => setSelectedTech(null)} />
        )}
      </div>

      {/* footer */}
      <footer className="freq-footer">
        <span className="freq-label">{formatFrequency(freqLeft)}</span>
        <div className="minimap">
          <div
            className="minimap-view"
            style={{
              left:  `${view.s * 100}%`,
              width: `${(view.e - view.s) * 100}%`,
            }}
          />
        </div>
        <span className="freq-label">{formatFrequency(freqRight)}</span>
      </footer>
    </div>
  );
}

// ─── tick generator ───────────────────────────────────────────────────────────
function generateTicks(viewStart, viewEnd) {
  const ticks   = [];
  const startHz = posToHz(viewStart);
  const endHz   = posToHz(viewEnd);
  const logSpan = Math.log10(endHz / startHz);

  let step;
  if      (logSpan > 8)  step = 2;
  else if (logSpan > 4)  step = 1;
  else if (logSpan > 2)  step = 0.5;
  else if (logSpan > 1)  step = 0.25;
  else                   step = 0.1;

  const logStart = Math.floor(Math.log10(startHz) / step) * step;
  const logEnd   = Math.ceil(Math.log10(endHz)   / step) * step;

  for (let l = logStart; l <= logEnd + 1e-9; l = +(l + step).toFixed(10)) {
    const hz = Math.pow(10, l);
    if (hz < startHz * 0.998 || hz > endHz * 1.002) continue;
    ticks.push({ pos: freqToPosition(hz), label: formatFrequency(hz) });
  }
  return ticks;
}
