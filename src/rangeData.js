// TWIN: ./powerData.js — same shape for a log-metre axis (communication range).
// Range-axis data: typical operating / transmission distance in meters.
// Used by RangeViz and related components.

// ── log-scale axis extent ─────────────────────────────────────────────────────
// 1 mm (1e-3) → 100 000 km (1e8) – an 11-decade window that comfortably covers
// everything from a few-cm inductive coupling to satellite altitudes.
export const LOG_MIN_M = -3; // log10(1e-3)
export const LOG_MAX_M =  8; // log10(1e8)

/** Map a metre value to a normalised 0–1 position on the range axis. */
export function rangeToPosition(m) {
  const logVal = Math.log10(m);
  return (logVal - LOG_MIN_M) / (LOG_MAX_M - LOG_MIN_M);
}

/** Inverse: 0–1 position → meters. */
export function posToMeters(pos) {
  const logVal = pos * (LOG_MAX_M - LOG_MIN_M) + LOG_MIN_M;
  return 10 ** logVal;
}

/** Human-readable distance string. */
export function formatDistance(m) {
  if (m >= 1e3)  return `${(m / 1e3).toPrecision(3)} km`;
  if (m >= 1)    return `${m.toPrecision(3)} m`;
  if (m >= 1e-2) return `${(m * 100).toPrecision(3)} cm`;
  return `${(m * 1e3).toPrecision(3)} mm`;
}

/**
 * Generate log-decade tick marks for the current range-axis view window.
 * Mirrors the logic of generatePowerTicks() in powerData.js.
 */
export function generateRangeTicks(viewStart, viewEnd) {
  const startM  = posToMeters(viewStart);
  const endM    = posToMeters(viewEnd);
  const logSpan = Math.log10(endM / startM);

  let step;
  if (logSpan > 8)      step = 2;
  else if (logSpan > 4) step = 1;
  else if (logSpan > 2) step = 0.5;
  else if (logSpan > 1) step = 0.25;
  else                  step = 0.1;

  const logStart = Math.floor(Math.log10(startM) / step) * step;
  const logEnd   = Math.ceil(Math.log10(endM) / step) * step;

  const ticks = [];
  for (let l = logStart; l <= logEnd + 1e-9; l = +(l + step).toFixed(10)) {
    const m = 10 ** l;
    if (m < startM * 0.998 || m > endM * 1.002) continue;
    ticks.push({ pos: rangeToPosition(m), label: formatDistance(m) });
  }
  return ticks;
}

// ── broad categories (label strip below the colour bar) ──────────────────────
export const RANGE_CATEGORIES = [
  { name: "Millimetres",     mMin: 1e-3, mMax: 1e-2 },
  { name: "Centimetres",     mMin: 1e-2, mMax: 1    },
  { name: "Metres",          mMin: 1,    mMax: 1e3  },
  { name: "Kilometres",      mMin: 1e3,  mMax: 1e6  },
  { name: "Planetary scale", mMin: 1e6,  mMax: 1e8  },
];

// ── detailed range bands (colour bar segments, warm-near → cool-far) ─────────
// Semantics: how far the signal reaches. Contact = hot; global = cold.
export const RANGE_BANDS = [
  {
    name: "Touch",
    abbr: "Touch",
    mMin: 1e-3, mMax: 1e-1,
    color: "#cc2244",
  },
  {
    name: "Personal",
    abbr: "Personal",
    mMin: 1e-1, mMax: 1,
    color: "#ff6622",
  },
  {
    name: "Room",
    abbr: "Room",
    mMin: 1, mMax: 1e2,
    color: "#ffaa22",
  },
  {
    name: "Neighborhood",
    abbr: "Nbrhd",
    mMin: 1e2, mMax: 1e4,
    color: "#ccbb22",
  },
  {
    name: "Regional",
    abbr: "Regional",
    mMin: 1e4, mMax: 1e6,
    color: "#22aa88",
  },
  {
    name: "Planetary",
    abbr: "Planetary",
    mMin: 1e6, mMax: 1e8,
    color: "#2255bb",
  },
];
