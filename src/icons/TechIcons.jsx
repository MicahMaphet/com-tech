// SVG icons for each technology

export function BluetoothIcon({ size = 24, color = "#0082fc" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z" />
    </svg>
  );
}

export function WifiIcon({ size = 24, color = "#00aaff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
    </svg>
  );
}

export function CellularIcon({ size = 24, color = "#ff6600" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M1.5 8.5A13.44 13.44 0 0112 4c4.1 0 7.79 1.84 10.34 4.74L24 7.08A15.93 15.93 0 0012 2 15.93 15.93 0 000 7.08l1.5 1.42zM12 8a9.44 9.44 0 016.6 2.7l1.5-1.42A11.93 11.93 0 0012 6a11.93 11.93 0 00-8.1 3.28l1.5 1.42A9.44 9.44 0 0112 8zm0 4a5.44 5.44 0 013.81 1.56L17.31 12A7.92 7.92 0 0012 10a7.92 7.92 0 00-5.31 2.06l1.5 1.44A5.44 5.44 0 0112 12zm0 4a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
    </svg>
  );
}

export function SatelliteIcon({ size = 24, color = "#ffcc00" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M6.59 3.41L2 8l4.59 4.59 1.41-1.41L5.83 9H8V7H5.83l2.17-2.17-1.41-1.42zm5 7.41L10.18 12l1.41 1.41.91-.91 1.41 1.41-.71.71 1.41 1.41 1.41-1.41-1.41-1.41.71-.71-1.41-1.41-.91.91-1.41-1.41zm-1.41-5l-1.41 1.41L10.17 8.24l5.59 5.59-1.41 1.41 1.41 1.41 1.41-1.41 1.41 1.41 1.42-1.41-1.41-1.41 1.41-1.41L14.59 7l-1.41 1.41-1.41-1.41-1.59 1.41-1.41-1.59zm11 7.59L17.41 17l-1.41-1.41 1.17-1.17H15v-2h2.17L16 11.17l1.41-1.41L22 14.41z" />
    </svg>
  );
}

export function MicrowaveIcon({ size = 24, color = "#ff4400" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <rect x="1" y="5" width="22" height="14" rx="2" ry="2" stroke={color} strokeWidth="1.5" fill="none"/>
      <rect x="3" y="7" width="13" height="10" rx="1" fill="none" stroke={color} strokeWidth="1.2"/>
      <circle cx="19" cy="11" r="1" fill={color}/>
      <circle cx="19" cy="14" r="1" fill={color}/>
      <path d="M6 10 Q9 12 12 10 Q15 8 16 10" stroke={color} strokeWidth="1.2" fill="none"/>
    </svg>
  );
}

export function FiberIcon({ size = 24, color = "#00ffaa" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M2 12 Q6 4 12 12 Q18 20 22 12" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M2 12 Q6 8 12 12 Q18 16 22 12" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
      <circle cx="22" cy="12" r="2" fill={color}/>
      <circle cx="2" cy="12" r="2" fill={color}/>
    </svg>
  );
}

export function NfcIcon({ size = 24, color = "#00c8ff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 14.5h-2V12l-3 2.25V12.5L13 10h2v6.5zM9.5 8C11.43 8 13.1 9.03 14 10.6l-1.7 1.27C11.73 10.72 10.73 10 9.5 10 7.57 10 6 11.57 6 13.5S7.57 17 9.5 17c1.23 0 2.23-.72 2.8-1.87l1.7 1.27C13.1 17.97 11.43 19 9.5 19 6.47 19 4 16.53 4 13.5S6.47 8 9.5 8z" />
    </svg>
  );
}

export function RadarIcon({ size = 24, color = "#00ff88" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.2" fill="none" opacity="0.7"/>
      <circle cx="12" cy="12" r="2" stroke={color} strokeWidth="1.2" fill="none" opacity="0.5"/>
      <line x1="12" y1="12" x2="20" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="18" cy="7.5" r="1.5" fill={color} opacity="0.8"/>
    </svg>
  );
}

export function RemoteIcon({ size = 24, color = "#cc2200" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M8 14H6v-2h2v2zm0 4H6v-2h2v2zm4-4h-2v-2h2v2zm0 4h-2v-2h2v2zm4-4h-2v-2h2v2zm0 4h-2v-2h2v2zM7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h4c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm5 14H6V7c0-1.65 1.35-3 3-3h0c1.65 0 3 1.35 3 3v9z" />
    </svg>
  );
}

export function RfidIcon({ size = 24, color = "#cc44ff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="8" width="12" height="8" rx="1.5" stroke={color} strokeWidth="1.5" fill="none"/>
      <line x1="8" y1="8" x2="8" y2="16" stroke={color} strokeWidth="1.2"/>
      <path d="M17 9.5 Q20 12 17 14.5" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M19 7 Q23 12 19 17" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6"/>
      <circle cx="8" cy="12" r="1.5" fill={color}/>
    </svg>
  );
}

export function RadioIcon({ size = 24, color = "#ff9900" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12c0 1.1.89 2 2 2h16c1.11 0 2-.9 2-2V8c0-1.11-.89-2-2-2H6.3l8.26-3.34L13.85 1 3.24 6.15zM13 18H7v-2h6v2zm4-6c-1.11 0-2-.9-2-2s.89-2 2-2 2 .9 2 2-.89 2-2 2zm-6.5-3a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
    </svg>
  );
}

export function AcPowerIcon({ size = 24, color = "#ffdd44" }) {
  // Sine wave with a small lightning bolt over it — mains alternating current.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M2 14 C 4 6, 8 6, 10 14 S 16 22, 18 14 S 22 6, 22 14"
        stroke={color}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M13 2 L8 11 L11.5 11 L10 18"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function ChargingIcon({ size = 24, color = "#66ff88" }) {
  // Battery outline with a lightning bolt through it — wireless charging.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="16" height="10" rx="1.5" stroke={color} strokeWidth="1.6" fill="none" />
      <rect x="19" y="10" width="2" height="4" fill={color} />
      <path d="M12 8 L8 13 L11 13 L10 16" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function WalkieTalkieIcon({ size = 24, color = "#ffaa22" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="8" y="7" width="9" height="15" rx="1.2" fill={color} />
      <rect x="9.5" y="9" width="6" height="3" rx="0.5" fill="#12122a" />
      <line x1="14" y1="7" x2="14" y2="2" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="14" cy="2" r="1" fill={color} />
      <circle cx="10.5" cy="14.5" r="0.7" fill="#12122a" />
      <circle cx="12.5" cy="14.5" r="0.7" fill="#12122a" />
      <circle cx="14.5" cy="14.5" r="0.7" fill="#12122a" />
      <rect x="10" y="17" width="5" height="1" fill="#12122a" />
      <rect x="10" y="19" width="5" height="1" fill="#12122a" />
    </svg>
  );
}

export function UwbIcon({ size = 24, color = "#22ddff" }) {
  // Crosshair + concentric rings — precision indoor positioning.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="2" fill={color} />
      <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.3" opacity="0.8" />
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.2" opacity="0.5" strokeDasharray="2 2" />
      <g stroke={color} strokeWidth="1.4" strokeLinecap="round">
        <line x1="12" y1="1" x2="12" y2="3.5" />
        <line x1="12" y1="20.5" x2="12" y2="23" />
        <line x1="1" y1="12" x2="3.5" y2="12" />
        <line x1="20.5" y1="12" x2="23" y2="12" />
      </g>
    </svg>
  );
}

export function TrueDepthIcon({ size = 24, color = "#ff5566" }) {
  // Face-ID style: viewfinder brackets around a simple face.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <g stroke={color} strokeWidth="1.6" strokeLinecap="round">
        <path d="M4 8 L4 5 L7 5" />
        <path d="M20 8 L20 5 L17 5" />
        <path d="M4 16 L4 19 L7 19" />
        <path d="M20 16 L20 19 L17 19" />
      </g>
      <circle cx="10" cy="11" r="1" fill={color} />
      <circle cx="14" cy="11" r="1" fill={color} />
      <path d="M10 15 Q12 17 14 15" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function LightbulbIcon({ size = 24, color = "#ffee66" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
      <rect x="9" y="19" width="6" height="1.5" rx="0.4" />
      <rect x="9.5" y="21" width="5" height="1.5" rx="0.4" />
    </svg>
  );
}

export function UvIcon({ size = 24, color = "#aa55ff" }) {
  // Sun with rays — short-wavelength UV light source.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" fill={color} />
      <g stroke={color} strokeWidth="1.6" strokeLinecap="round">
        <line x1="12" y1="1" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="23" />
        <line x1="1" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="23" y2="12" />
        <line x1="4.2" y1="4.2" x2="6.5" y2="6.5" />
        <line x1="17.5" y1="17.5" x2="19.8" y2="19.8" />
        <line x1="4.2" y1="19.8" x2="6.5" y2="17.5" />
        <line x1="17.5" y1="6.5" x2="19.8" y2="4.2" />
      </g>
    </svg>
  );
}

export function XrayIcon({ size = 24, color = "#bb00ff" }) {
  // International radiation trefoil — recognizable ionizing-radiation glyph.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 3 A 9 9 0 0 1 19.79 7.5 L15.46 10 A 4 4 0 0 0 12 8 Z" />
      <path d="M19.79 16.5 A 9 9 0 0 1 12 21 L12 16 A 4 4 0 0 0 15.46 14 Z" />
      <path d="M4.21 16.5 A 9 9 0 0 1 4.21 7.5 L8.54 10 A 4 4 0 0 0 8.54 14 Z" />
    </svg>
  );
}

export function GammaIcon({ size = 24, color = "#ff44ff" }) {
  // Stylised atom — evokes nuclear/gamma emission.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="2" fill={color} />
      <g stroke={color} strokeWidth="1.4" fill="none">
        <ellipse cx="12" cy="12" rx="10" ry="4" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)" />
      </g>
    </svg>
  );
}


