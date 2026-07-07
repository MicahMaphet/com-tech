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

export function getTechIcon(svgIcon, size, color) {
  switch (svgIcon) {
    case "bluetooth": return <BluetoothIcon size={size} color={color} />;
    case "wifi": return <WifiIcon size={size} color={color} />;
    case "cellular": return <CellularIcon size={size} color={color} />;
    case "satellite": return <SatelliteIcon size={size} color={color} />;
    case "microwave": return <MicrowaveIcon size={size} color={color} />;
    case "fiber": return <FiberIcon size={size} color={color} />;
    case "nfc": return <NfcIcon size={size} color={color} />;
    case "radar": return <RadarIcon size={size} color={color} />;
    case "remote": return <RemoteIcon size={size} color={color} />;
    case "rfid": return <RfidIcon size={size} color={color} />;
    case "radio": return <RadioIcon size={size} color={color} />;
    default: return null;
  }
}
