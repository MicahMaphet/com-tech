# Electromagnetic Spectrum Explorer

An interactive, single-page visualisation of the full electromagnetic spectrum
from **3 Hz to 3 × 10²² Hz** on a logarithmic scale. Zoom up to 150× and pan to
inspect 15 real-world wireless technologies pinned at their exact frequencies.

![screenshot placeholder](public/favicon.svg)

## Stack

- **Vite 8** — bundler + dev server
- **React 19** — functional components + hooks, no external UI library
- **Plain CSS** with custom properties (dark theme)
- **oxlint** — fast Rust-based linter

Only runtime dependencies are `react` and `react-dom`.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173 with HMR
npm run build    # production build → dist/
npm run preview  # serve the built dist/ locally
npm run lint     # oxlint
```

## Controls

| Interaction | Effect |
|---|---|
| Scroll wheel / pinch | Zoom in and out around the cursor |
| Drag / one-finger swipe | Pan |
| `+` / `-` | Zoom in / out around the centre |
| `←` / `→` | Pan left / right |
| `0` | Reset the view |
| `Esc` | Close the info panel |
| Click a pin or chip | Show technology details |

## Project layout

```
src/
├── main.jsx                       # ReactDOM entry
├── App.jsx                        # Thin wrapper
├── SpectrumViz.jsx                # Orchestrator: composes hooks + components
├── index.css                      # All styles (CSS custom properties, dark)
├── spectrumData.js                # SPECTRUM_BANDS, TECHNOLOGIES, formatFrequency, freqToPosition
├── spectrumMath.js                # posToHz, posToX, clamp, generateTicks, geometry constants
├── hooks/
│   ├── useSpectrumView.js         # View state + zoom / pan / focus / reset
│   └── useSpectrumInteractions.js # Wheel, mouse-drag, touch (pinch + swipe)
├── components/
│   ├── TechPin.jsx                # Pin marker on the spectrum bar
│   └── InfoPanel.jsx              # Slide-in details card
└── icons/
    ├── TechIcons.jsx              # One SVG component per technology type
    └── getTechIcon.jsx            # Dispatcher used by the rest of the app
```

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the maths, data model, and
extension notes.

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
  svgIcon: "radio", // reuse an existing icon key
  description: "…",
  examples: ["…", "…", "…", "…"],
  band: "UHF",
  range: "~15 km rural",
  standard: "LoRa Alliance TS001",
}
```

To ship a dedicated icon, add a component to `src/icons/TechIcons.jsx` and
register it in `src/icons/getTechIcon.jsx`.
