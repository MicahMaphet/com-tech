import { useCallback, useState } from "react";
import { freqToPosition } from "../spectrumData";
import { clamp, MAX_ZOOM, MIN_ZOOM } from "../spectrumMath";

// How wide a window `focusTech` opens when clicking a chip.
const FOCUS_SPAN = 0.045;

/**
 * Owns the 0–1 viewport window `{s, e}` and exposes helpers to zoom, pan,
 * focus a specific technology, and reset. All updates are atomic functional
 * updates so consecutive events (e.g. wheel spam) never see stale state.
 */
export function useSpectrumView() {
  const [view, setView] = useState({ s: 0, e: 1 });

  const applyZoom = useCallback((focalFrac, factor) => {
    setView((v) => {
      const range = v.e - v.s;
      const focalAbs = v.s + focalFrac * range;
      const newRange = clamp(range / factor, 1 / MAX_ZOOM, 1 / MIN_ZOOM);
      let ns = focalAbs - focalFrac * newRange;
      let ne = ns + newRange;
      if (ns < 0) {
        ns = 0;
        ne = newRange;
      }
      if (ne > 1) {
        ne = 1;
        ns = 1 - newRange;
      }
      return { s: ns, e: ne };
    });
  }, []);

  const applyPan = useCallback((deltaNorm) => {
    setView((v) => {
      const r = v.e - v.s;
      let ns = v.s - deltaNorm * r;
      let ne = v.e - deltaNorm * r;
      if (ns < 0) {
        ns = 0;
        ne = r;
      }
      if (ne > 1) {
        ne = 1;
        ns = 1 - r;
      }
      return { s: ns, e: ne };
    });
  }, []);

  const focusTech = useCallback((tech) => {
    const pos = tech.isIR ? freqToPosition(300e9) : freqToPosition(tech.frequency);
    let s = pos - FOCUS_SPAN / 2;
    let e = pos + FOCUS_SPAN / 2;
    if (s < 0) {
      s = 0;
      e = FOCUS_SPAN;
    }
    if (e > 1) {
      e = 1;
      s = 1 - FOCUS_SPAN;
    }
    setView({ s, e });
  }, []);

  const resetView = useCallback(() => setView({ s: 0, e: 1 }), []);

  return { view, applyZoom, applyPan, focusTech, resetView };
}
