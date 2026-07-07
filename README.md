# Electromagnetic Spectrum Explorer

An interactive, single-page visualisation of the full electromagnetic spectrum
from **3 Hz to 3 × 10²² Hz** on a logarithmic scale. Zoom up to 150× and pan
to inspect 26 real-world technologies pinned at their exact frequencies.

## Stack

| | |
|---|---|
| Bundler | Vite 8 |
| Framework | React 19 (functional components + hooks) |
| Styling | Plain CSS with custom properties — dark theme |
| Linter | oxlint |
| Runtime deps | `react`, `react-dom` only |

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173 — HMR enabled
npm run build    # production build → dist/
npm run preview  # serve dist/ locally
npm run lint     # oxlint
```

## Controls

| Input | Effect |
|---|---|
| Scroll wheel / pinch | Zoom in or out around the cursor / pinch midpoint |
| Click + drag / one-finger swipe | Pan left or right |
| `+` / `=` | Zoom in around centre |
| `-` | Zoom out around centre |
| `←` / `→` | Pan left / right |
| `0` | Reset to full-spectrum view |
| `Esc` | Close the info panel |
| Click a pin or chip | Open technology detail panel |
| Click background | Dismiss detail panel |

## Technologies covered

26 technologies spanning ELF radio waves to gamma rays:

| Frequency | Technology |
|---|---|
| 60 Hz | AC Mains Power |
| 150 kHz | Qi Wireless Charging |
| 13.56 MHz | NFC |
| 1 MHz | AM Radio |
| 27 MHz | CB Radio |
| 100 MHz | FM Radio |
| 462 MHz | Walkie-Talkie (FRS/GMRS) |
| 915 MHz | RFID |
| 1.575 GHz | GPS Satellite |
| 1.8 GHz | 4G LTE |
| 2.4 GHz | Bluetooth |
| 2.45 GHz | Wi-Fi 2.4 GHz |
| 2.45 GHz | Microwave Oven |
| 5.5 GHz | Wi-Fi 5 GHz |
| 6.5 GHz | UWB (Apple U1) |
| 10 GHz | Radar |
| 20 GHz | Satellite Internet |
| 28 GHz | 5G |
| 77 GHz | Automotive Radar |
| ~300 GHz | IR Remote |
| 193 THz | Fiber Optic |
| 319 THz | Apple TrueDepth (Face ID) |
| 500 THz | LED Light |
| 1.18 PHz | UV-C Sterilizer |
| 3×10¹⁸ Hz | Medical X-Ray |
| 1.24×10²⁰ Hz | PET / Gamma Imaging |

## Project layout

```
src/
├── main.jsx                       # ReactDOM entry
├── App.jsx                        # Thin wrapper → <SpectrumViz />
├── SpectrumViz.jsx                # Orchestrator: state, hooks, SVG render
├── index.css                      # All styles (CSS custom properties, dark theme)
├── spectrumData.js                # SPECTRUM_CATEGORIES, SPECTRUM_BANDS, TECHNOLOGIES
│                                  #   + freqToPosition, formatFrequency
├── spectrumMath.js                # Geometry constants, posToHz, posToX,
│                                  #   clamp, generateTicks
├── hooks/
│   ├── useSpectrumView.js         # View window {s,e} + zoom/pan/focus/reset
│   └── useSpectrumInteractions.js # Wheel, drag, and touch event handling
├── components/
│   ├── TechPin.jsx                # Upward pin marker with staggered stems
│   └── InfoPanel.jsx              # Slide-in detail card (Esc to close)
└── icons/
    ├── TechIcons.jsx              # 20 hand-drawn SVG icon components
    └── getTechIcon.jsx            # key → JSX dispatcher
```

## Adding a new technology

Append an entry to `TECHNOLOGIES` in `src/spectrumData.js`:

```js
{
  id: "lora",
  name: "LoRa",
  fullName: "Long Range (LoRaWAN)",
  frequency: 915e6,
  freqDisplay: "868 / 915 MHz",
  color: "#ff44aa",
  svgIcon: "radio",   // reuse an existing icon key
  description: "Low-power wide-area radio for IoT devices.",
  examples: ["Smart meters", "Asset tracking", "Agriculture sensors", "City sensors"],
  band: "UHF",
  range: "~15 km rural",
  standard: "LoRa Alliance TS001",
}
```

To add a dedicated icon: export a component from `src/icons/TechIcons.jsx` and
register it in `src/icons/getTechIcon.jsx`.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full technical reference:
coordinate math, SVG layout geometry, component architecture, state model,
design decisions, and extension guide.
