// Math utilities for mapping frequencies onto the log-scale spectrum axis.
// Pure functions only — no React, no DOM.

import { formatFrequency, freqToPosition, LOG_MIN, LOG_MAX } from "./spectrumData";

// ─── SVG canvas geometry ─────────────────────────────────────────────────────
export const VB_W = 1000;         // SVG viewBox width
export const BAR_Y = 50;          // Y start of the colour bar
export const BAR_H = 70;          // height of the colour bar
export const PIN_AREA_H = 240;    // space below the bar reserved for pins
export const SVG_H = BAR_Y + BAR_H + PIN_AREA_H; // 360

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
export function posToX(pos, viewStart, viewEnd) {
  return ((pos - viewStart) / (viewEnd - viewStart)) * VB_W;
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
