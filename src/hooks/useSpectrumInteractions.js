import { useEffect, useRef, useState } from "react";

/**
 * Wires up wheel-zoom, mouse-drag pan, and touch (pinch-zoom + single-finger
 * pan) on a container ref. Also owns an `isDragging` flag so the cursor can
 * flip between `grab` and `grabbing` reactively.
 */
export function useSpectrumInteractions(containerRef, { applyZoom, applyPan }) {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ active: false, lastX: 0 });
  const pinchRef = useRef({ dist: null, mid: 0 });

  // ── wheel (non-passive so we can preventDefault) ──────────────────────
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
  }, [containerRef, applyZoom]);

  // ── mouse drag ────────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current.active) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const delta = (e.clientX - dragRef.current.lastX) / rect.width;
      dragRef.current.lastX = e.clientX;
      applyPan(delta);
    };
    const onUp = () => {
      if (dragRef.current.active) {
        dragRef.current.active = false;
        setIsDragging(false);
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [containerRef, applyPan]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    dragRef.current = { active: true, lastX: e.clientX };
    setIsDragging(true);
  };

  // ── touch: 1 finger = pan, 2 fingers = pinch zoom ─────────────────────
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      const rect = containerRef.current?.getBoundingClientRect();
      pinchRef.current.dist = Math.hypot(dx, dy);
      pinchRef.current.mid = rect
        ? ((e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left) / rect.width
        : 0.5;
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
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const delta = (e.touches[0].clientX - dragRef.current.lastX) / rect.width;
      dragRef.current.lastX = e.touches[0].clientX;
      applyPan(delta);
    }
  };

  const handleTouchEnd = () => {
    dragRef.current.active = false;
    pinchRef.current.dist = null;
  };

  return {
    isDragging,
    handleMouseDown,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
