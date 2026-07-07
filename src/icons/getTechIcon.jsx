// Runtime dispatcher for tech icons. Kept in its own file so the components
// module can be Fast Refresh-friendly (only-export-components lint rule).

import {
  BluetoothIcon,
  CellularIcon,
  FiberIcon,
  MicrowaveIcon,
  NfcIcon,
  RadarIcon,
  RadioIcon,
  RemoteIcon,
  RfidIcon,
  SatelliteIcon,
  WifiIcon,
} from "./TechIcons";

const ICONS = {
  bluetooth: BluetoothIcon,
  wifi: WifiIcon,
  cellular: CellularIcon,
  satellite: SatelliteIcon,
  microwave: MicrowaveIcon,
  fiber: FiberIcon,
  nfc: NfcIcon,
  radar: RadarIcon,
  remote: RemoteIcon,
  rfid: RfidIcon,
  radio: RadioIcon,
};

/** Render the icon component for a given `svgIcon` key, or `null`. */
export function getTechIcon(svgIcon, size, color) {
  const Icon = ICONS[svgIcon];
  return Icon ? <Icon size={size} color={color} /> : null;
}
