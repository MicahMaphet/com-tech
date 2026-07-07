// TWIN: ./spectrumData.js + ./spectrumMath.js — same shape for the log-Hz axis.
// Power-axis data: technology transmit / radiated power levels in Watts.
// Used by PowerViz and related components.

// ── log-scale axis extent ─────────────────────────────────────────────────────
// 100 nW (1e-7) → 10 MW (1e7) – a 14-decade window that comfortably covers
// everything from a PET radiotracer to a large radar or broadcast transmitter.
export const LOG_MIN_W = -7; // log10(1e-7)
export const LOG_MAX_W =  7; // log10(1e7)

/** Map a watt value to a normalised 0–1 position on the power axis. */
export function powerToPosition(w) {
  const logVal = Math.log10(w);
  return (logVal - LOG_MIN_W) / (LOG_MAX_W - LOG_MIN_W);
}

/** Inverse: 0–1 position → Watts. */
export function posToWatts(pos) {
  const logVal = pos * (LOG_MAX_W - LOG_MIN_W) + LOG_MIN_W;
  return 10 ** logVal;
}

/** Human-readable power string. */
export function formatPower(w) {
  if (w >= 1e6)  return `${(w / 1e6).toPrecision(3)} MW`;
  if (w >= 1e3)  return `${(w / 1e3).toPrecision(3)} kW`;
  if (w >= 1)    return `${w.toPrecision(3)} W`;
  if (w >= 1e-3) return `${(w * 1e3).toPrecision(3)} mW`;
  if (w >= 1e-6) return `${(w * 1e6).toPrecision(3)} μW`;
  return `${(w * 1e9).toPrecision(3)} nW`;
}

/**
 * Generate log-decade tick marks for the current power-axis view window.
 * Mirrors the logic of generateTicks() in spectrumMath.js.
 */
export function generatePowerTicks(viewStart, viewEnd) {
  const startW  = posToWatts(viewStart);
  const endW    = posToWatts(viewEnd);
  const logSpan = Math.log10(endW / startW);

  let step;
  if (logSpan > 8)      step = 2;
  else if (logSpan > 4) step = 1;
  else if (logSpan > 2) step = 0.5;
  else if (logSpan > 1) step = 0.25;
  else                  step = 0.1;

  const logStart = Math.floor(Math.log10(startW) / step) * step;
  const logEnd   = Math.ceil(Math.log10(endW) / step) * step;

  const ticks = [];
  for (let l = logStart; l <= logEnd + 1e-9; l = +(l + step).toFixed(10)) {
    const w = 10 ** l;
    if (w < startW * 0.998 || w > endW * 1.002) continue;
    ticks.push({ pos: powerToPosition(w), label: formatPower(w) });
  }
  return ticks;
}

// ── broad categories (label strip below the colour bar) ──────────────────────
export const POWER_CATEGORIES = [
  { name: "Sub-milliwatt", wMin: 1e-7, wMax: 1e-3 },
  { name: "Milliwatts",    wMin: 1e-3, wMax: 1    },
  { name: "Watts",         wMin: 1,    wMax: 1e3  },
  { name: "Kilowatts",     wMin: 1e3,  wMax: 1e6  },
  { name: "Megawatts",     wMin: 1e6,  wMax: 1e7  },
];

// ── detailed power bands (colour bar segments, cool → hot) ────────────────────
export const POWER_BANDS = [
  {
    name: "nW",
    abbr: "nW",
    wMin: 1e-7, wMax: 1e-6,
    color: "#190044",
  },
  {
    name: "μW",
    abbr: "μW",
    wMin: 1e-6, wMax: 1e-3,
    color: "#3300aa",
  },
  {
    name: "mW",
    abbr: "mW",
    wMin: 1e-3, wMax: 1e-1,
    color: "#0088cc",
  },
  {
    name: "W",
    abbr: "W",
    wMin: 1e-1, wMax: 1e3,
    color: "#66cc00",
  },
  {
    name: "kW",
    abbr: "kW",
    wMin: 1e3, wMax: 1e6,
    color: "#ff9900",
  },
  {
    name: "MW",
    abbr: "MW",
    wMin: 1e6, wMax: 1e7,
    color: "#880000",
  },
];
