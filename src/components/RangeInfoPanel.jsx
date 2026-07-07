// TWIN: ./PowerInfoPanel.jsx — same card layout, promotes range to the hero row.
import { useEffect } from "react";
import { getTechIcon } from "../icons/getTechIcon";

/**
 * Slide-in detail card for the range page.
 * Shows operational distance prominently alongside the usual tech metadata.
 */
export function RangeInfoPanel({ tech, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!tech) return null;

  return (
    <div
      className="info-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="range-panel-title"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="close-btn"
        onClick={onClose}
        aria-label="Close details panel"
      >
        ✕
      </button>
      <div className="info-header">
        <div className="info-icon" aria-hidden="true">
          {getTechIcon(tech.svgIcon, 44, tech.color)}
        </div>
        <div>
          <h2 id="range-panel-title" style={{ color: tech.color, margin: 0 }}>
            {tech.name}
          </h2>
          <p className="full-name">{tech.fullName}</p>
        </div>
      </div>
      <dl className="info-grid">
        <div className="info-item" style={{ gridColumn: "1 / -1" }}>
          <dt className="label">Operational Range</dt>
          <dd className="value freq-val" style={{ color: tech.color }}>
            {tech.rangeDisplay ?? tech.range}
          </dd>
        </div>
        <div className="info-item">
          <dt className="label">Frequency</dt>
          <dd className="value">{tech.freqDisplay}</dd>
        </div>
        <div className="info-item">
          <dt className="label">Power</dt>
          <dd className="value">{tech.powerDisplay}</dd>
        </div>
        <div className="info-item">
          <dt className="label">Band</dt>
          <dd className="value">{tech.band}</dd>
        </div>
        <div className="info-item">
          <dt className="label">Standard</dt>
          <dd className="value">{tech.standard}</dd>
        </div>
      </dl>
      <p className="description">{tech.description}</p>
      <div className="examples">
        <h4>Real-World Examples</h4>
        <ul>
          {tech.examples.map((ex) => (
            <li key={ex} style={{ "--c": tech.color }}>
              {ex}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
