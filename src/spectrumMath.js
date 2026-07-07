// Math utilities for mapping frequencies onto the log-scale spectrum axis.
// Pure functions only — no React, no DOM.

import { formatFrequency, freqToPosition, LOG_MIN, LOG_MAX } from "./spectrumData";

// ─── SVG canvas geometry ─────────────────────────────────────────────────────
// Layout (top→bottom): tech-pin area, upper-label strip (ticks + band names),
// colour bar, then a slim strip below for the high-level category labels.
export const VB_W = 1000;         // SVG viewBox width
export const BAR_H = 70;          // height of the colour bar
export const PIN_AREA_H = 224;    // space at the top reserved for pins
export const LABEL_AREA_H = 44;   // room above the bar for ticks & band names
export const CATEGORY_STRIP_H = 22; // room below the bar for category labels
export const BAR_Y = PIN_AREA_H + LABEL_AREA_H; // 268 — top of the colour bar
export const SVG_H = BAR_Y + BAR_H + CATEGORY_STRIP_H; // 360

// ─── zoom limits ─────────────────────────────────────────────────────────────
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 150;

// ─── pure helpers ────────────────────────────────────────────────────────────
export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

/** Inverse of freqToPosition: 0–1 normalised position → Hz. */
export function posToHz(pos) {
  const logVal = pos * (LOG_MAX - LOG_MIN) + LOG_MIN;
  return 10 ** logVal;
}

/** Convert a 0–1 spectrum position to a pixel X inside the SVG viewBox. */
export function posToX(pos, viewStart, viewEnd, width = VB_W) {
  return ((pos - viewStart) / (viewEnd - viewStart)) * width;
}

/**
 * Generate log-decade tick marks that cover the current view window.
 * Step size shrinks as the user zooms in so the axis always has ~5–10 ticks.
 */
export function generateTicks(viewStart, viewEnd) {
  const startHz = posToHz(viewStart);
  const endHz = posToHz(viewEnd);
  const logSpan = Math.log10(endHz / startHz);

  let step;
  if (logSpan > 8) step = 2;
  else if (logSpan > 4) step = 1;
  else if (logSpan > 2) step = 0.5;
  else if (logSpan > 1) step = 0.25;
  else step = 0.1;

  const logStart = Math.floor(Math.log10(startHz) / step) * step;
  const logEnd = Math.ceil(Math.log10(endHz) / step) * step;

  const ticks = [];
  // toFixed(10) counteracts floating-point drift over many small additions.
  for (let l = logStart; l <= logEnd + 1e-9; l = +(l + step).toFixed(10)) {
    const hz = 10 ** l;
    if (hz < startHz * 0.998 || hz > endHz * 1.002) continue;
    ticks.push({ pos: freqToPosition(hz), label: formatFrequency(hz) });
  }
  return ticks;
}
