import { useCallback, useState } from "react";
import { powerToPosition } from "../powerData";
import { clamp, MAX_ZOOM, MIN_ZOOM } from "../spectrumMath";

// How wide a window `focusTech` opens when clicking a chip.
const FOCUS_SPAN = 0.045;

/**
 * Identical contract to useSpectrumView but positions technologies by their
 * `powerW` field using the log-Watts axis instead of the log-Hz axis.
 */
export function usePowerView() {
  const [view, setView] = useState({ s: 0, e: 1 });

  const applyZoom = useCallback((focalFrac, factor) => {
    setView((v) => {
      const range = v.e - v.s;
      const focalAbs = v.s + focalFrac * range;
      const newRange = clamp(range / factor, 1 / MAX_ZOOM, 1 / MIN_ZOOM);
      let ns = focalAbs - focalFrac * newRange;
      let ne = ns + newRange;
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

  const focusTech = useCallback((tech) => {
    const pos = powerToPosition(tech.powerW);
    let s = pos - FOCUS_SPAN / 2;
    let e = pos + FOCUS_SPAN / 2;
    if (s < 0) { s = 0; e = FOCUS_SPAN; }
    if (e > 1) { e = 1; s = 1 - FOCUS_SPAN; }
    setView({ s, e });
  }, []);

  const resetView = useCallback(() => setView({ s: 0, e: 1 }), []);

  return { view, applyZoom, applyPan, focusTech, resetView };
}
