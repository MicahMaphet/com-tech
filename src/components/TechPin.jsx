import { getTechIcon } from "../icons/getTechIcon";
import { BAR_H, BAR_Y } from "../spectrumMath";

/**
 * A single technology marker anchored to a position on the spectrum bar.
 *
 * All pins point upward from the top of the bar; `idx % 4` staggers the stem
 * length so neighbours at similar frequencies don't collide vertically.
 */
export function TechPin({ tech, idx, x, isSelected, onClick, zoomLevel }) {
  const stemH = 90 + (idx % 4) * 22;
  const iconR = isSelected ? 22 : 17;
  const pinY = BAR_Y; // pins emerge from the top of the bar
  const iconY = pinY - stemH;

  const showLabel = isSelected || zoomLevel > 4;
  const innerSize = (iconR - 3) * 2;

  return (
    <g
      transform={`translate(${x}, 0)`}
      style={{ cursor: "pointer" }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(tech);
      }}
      role="button"
      tabIndex={0}
      aria-label={`${tech.name} — ${tech.freqDisplay}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(tech);
        }
      }}
    >
      {/* stem */}
      <line
        x1={0}
        y1={pinY}
        x2={0}
        y2={iconY}
        stroke={tech.color}
        strokeWidth={isSelected ? 2 : 1.4}
        opacity={0.8}
      />
      {/* circle bubble */}
      <circle
        cx={0}
        cy={iconY}
        r={iconR}
        fill={isSelected ? tech.color : "#12122a"}
        stroke={tech.color}
        strokeWidth={isSelected ? 2.5 : 1.8}
        opacity={0.95}
      />
      {/* icon via foreignObject — React SVG can't nest HTML directly */}
      <foreignObject
        x={-iconR + 3}
        y={iconY - iconR + 3}
        width={innerSize}
        height={innerSize}
        aria-hidden="true"
      >
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
          }}
        >
          {getTechIcon(tech.svgIcon, innerSize - 2, isSelected ? "#fff" : tech.color)}
        </div>
      </foreignObject>
      {/* name label */}
      {showLabel && (
        <text
          x={0}
          y={iconY - iconR - 5}
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
