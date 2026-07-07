# Electromagnetic Spectrum Explorer — Architecture & Reference

## Overview

A single-page React app (Vite + React 18, no external UI libraries) that renders
the full electromagnetic spectrum from **3 Hz to 3 × 10²² Hz** on a logarithmic
scale. Users can zoom up to 150× and pan to inspect 14 real-world wireless
technologies pinned at their exact frequencies.

---

## Stack

| Layer | Choice |
|---|---|
| Bundler | Vite 8 |
| Framework | React 18 (functional components + hooks only) |
| Styling | Plain CSS custom properties — no CSS-in-JS, no Tailwind |
| Icons | Hand-written inline SVG components (no icon library) |
| Dependencies | Only React + ReactDOM (24 packages total) |

Run:
```
npm run dev    # dev server (HMR)
npm run build  # production build → dist/
```

---

## File Map

```
com-tech/
├── index.html                  # Vite entry; sets page title
└── src/
    ├── main.jsx                # ReactDOM.createRoot mount
    ├── App.jsx                 # Thin wrapper → <SpectrumViz />
    ├── index.css               # All styles (CSS custom props, dark theme)
    ├── spectrumData.js         # Pure data + math utilities
    ├── SpectrumViz.jsx         # Main component (all interaction logic + SVG)
    └── icons/
        └── TechIcons.jsx       # One SVG component per technology type
```

---

## Coordinate System & Math

### Log-scale mapping

The entire spectrum is mapped to a normalised **position** in **[0, 1]** using:

```
LOG_MIN = log10(3)          // ≈ 0.477  (3 Hz)
LOG_MAX = log10(3e22)       // ≈ 22.477 (3 × 10²² Hz)

freqToPosition(hz) = (log10(hz) − LOG_MIN) / (LOG_MAX − LOG_MIN)
```

The inverse (used for tick labels and footer display):
```
posToHz(pos) = 10 ^ (pos × (LOG_MAX − LOG_MIN) + LOG_MIN)
```

### View state

Two numbers describe the current viewport:

```js
{ s: 0..1,   // viewStart — left edge of the visible window
  e: 0..1 }  // viewEnd   — right edge of the visible window
```

`viewRange = e − s`. At full zoom `s=0, e=1`. At 150× zoom `viewRange ≈ 0.0067`.

### SVG coordinates

The SVG uses a fixed **viewBox `0 0 1000 360`** (`VB_W = 1000`).
Any 0–1 spectrum position converts to a pixel X with:

```js
posToX(pos, s, e) = ((pos − s) / (e − s)) × 1000
```

This means all SVG geometry (band rects, pin lines, tick marks) is always in
absolute viewBox pixels — no SVG `transform scale` tricks needed.

### SVG vertical layout

```
Y=0   ┌────────────────────────────┐
      │  above-band name labels    │  BAR_Y = 50 px
Y=50  ├────────────────────────────┤
      │  coloured band bar         │  BAR_H = 70 px
Y=120 ├────────────────────────────┤  ← pin base (pinY)
      │  technology pins           │  PIN_AREA_H = 240 px
Y=360 └────────────────────────────┘  SVG_H = 360
```

Pins alternate **up** (above bar, dashed stem) and **down** (below bar, solid
stem) based on `idx % 2`. Stem height is staggered by `42 + (idx % 4) × 16` px
to reduce label collisions at low zoom levels.

---

## Component Architecture

```
App
└── SpectrumViz               (all state lives here)
    ├── <header>              sticky; zoom +/− buttons, reset, zoom readout
    ├── <nav.tech-nav>        quick-jump chips for all 14 technologies
    ├── <div.viz-container>   touch-action:none; captures all pointer events
    │   ├── <svg viewBox>     the spectrum canvas
    │   │   ├── <defs>        rainbow gradient, glow filter
    │   │   ├── Band rects    one <rect> per visible SPECTRUM_BAND
    │   │   ├── Tick marks    <line> + <text> per generated tick
    │   │   └── TechPin ×N   one per visible TECHNOLOGY
    │   │       ├── <line>    stem
    │   │       ├── <circle>  bubble
    │   │       ├── <foreignObject> → SVG icon component
    │   │       └── <text>    name label (shown when selected OR zoom > 4×)
    │   └── InfoPanel         absolute overlay, shown when selectedTech != null
    └── <footer.freq-footer>  left freq · minimap · right freq
```

### State (all in `SpectrumViz`)

| State | Type | Description |
|---|---|---|
| `view` | `{s, e}` | Current viewport 0–1 window |
| `selectedTech` | `Technology \| null` | Drives `TechPin` highlight + `InfoPanel` |

No global state, no context, no reducers.

### Key interactions → state changes

| Interaction | Handler | Effect |
|---|---|---|
| Scroll wheel | `wheel` event (non-passive) | `applyZoom(cursorFrac, factor)` |
| Mouse drag | `mousedown` + global `mousemove` | `applyPan(deltaNorm)` |
| Pinch (2-finger touch) | `touchstart/move` | `applyZoom(midFrac, newDist/oldDist)` |
| Swipe (1-finger touch) | `touchstart/move` | `applyPan(deltaNorm)` |
| Quick-nav chip click | `focusTech(tech)` | Sets `view` to a ±0.0225 window around tech; sets `selectedTech` |
| Pin click | `onClick` in `TechPin` | Toggles `selectedTech` |
| Background click | `onClick` on `.viz-container` | Clears `selectedTech` |
| + / − buttons | `applyZoom(0.5, 1.3 or 1/1.3)` | Zooms around centre |
| Reset | inline handler | `view = {s:0, e:1}`, clears selection |

### `applyZoom(focalFrac, factor)`

Atomic functional update — avoids stale-closure issues with two separate `useState` calls:

```js
setView((v) => {
  const range    = v.e - v.s;
  const focalAbs = v.s + focalFrac * range;          // absolute pos of focal point
  let newRange   = clamp(range / factor, 1/MAX_ZOOM, 1/MIN_ZOOM);
  let ns         = focalAbs - focalFrac * newRange;   // keep focal point stationary
  let ne         = ns + newRange;
  // clamp to [0, 1]
  if (ns < 0) { ns = 0; ne = newRange; }
  if (ne > 1) { ne = 1; ns = 1 - newRange; }
  return { s: ns, e: ne };
});
```

### Tick generation (`generateTicks`)

Chooses a log-decade step based on the visible log-span:

| Log span (decades) | Step |
|---|---|
| > 8 | 2 decades |
| > 4 | 1 decade |
| > 2 | 0.5 decades |
| > 1 | 0.25 decades |
| ≤ 1 | 0.1 decades |

Walks from `floor(log10(startHz)/step)*step` to `ceil(log10(endHz)/step)*step`,
converts each back to Hz and passes through `formatFrequency`.

---

## Data Model

### `SPECTRUM_BANDS` — 16 entries

```ts
{
  name: string          // "Ultra High Frequency"
  abbr: string          // "UHF"
  freqMin: number       // Hz
  freqMax: number       // Hz
  unit: string          // display hint only
  color: string         // hex, or "rainbow" (triggers SVG gradient fill)
  wavelengthMin: string // human-readable
  wavelengthMax: string
}
```

Full band list in order:
`ELF → SLF → ULF → VLF → LF → MF → HF → VHF → UHF → SHF → EHF → IR → VIS → UV → X → γ`

Spans: **3 Hz → 3 × 10²² Hz** (≈ 22 decades on the log axis).

### `TECHNOLOGIES` — 14 entries

```ts
{
  id: string            // unique, kebab-case
  name: string          // short display name
  fullName: string      // long name for info panel
  frequency: number     // Hz — canonical pin position on spectrum
  freqDisplay: string   // human-readable range string
  color: string         // hex — used for pin, chip border, info panel accent
  svgIcon: string       // key into getTechIcon() switch
  description: string
  examples: string[]    // 4 real-world examples
  band: string          // ITU band abbreviation(s)
  range: string
  standard: string
  isIR?: boolean        // if true, pin is placed at freqToPosition(300e9) instead
                        // of freqToPosition(frequency), because the frequency
                        // field stores the carrier (38 kHz) not the IR wavelength
}
```

#### Technology index & pin positions

| # | id | frequency (Hz) | Pin direction | Color |
|---|---|---|---|---|
| 0 | nfc | 13.56 MHz | Up | `#00c8ff` |
| 1 | am-radio | 1 MHz | Down | `#ff9900` |
| 2 | fm-radio | 100 MHz | Up | `#ff6600` |
| 3 | ir-remote | pinned at 300 GHz (isIR) | Down | `#cc2200` |
| 4 | bluetooth | 2.4 GHz | Up | `#0082fc` |
| 5 | wifi-24 | 2.45 GHz | Down | `#00aaff` |
| 6 | wifi-5 | 5.5 GHz | Up | `#0066ff` |
| 7 | microwave | 2.45 GHz | Down | `#ff4400` |
| 8 | 4g-lte | 1.8 GHz | Up | `#ff6600` |
| 9 | 5g | 28 GHz | Down | `#ff3300` |
| 10 | gps | 1.575 GHz | Up | `#ffcc00` |
| 11 | satellite-internet | 20 GHz | Down | `#ffaa00` |
| 12 | fiber | 193 THz | Up | `#00ffaa` |
| 13 | rfid | 915 MHz | Down | `#cc44ff` |
| 14 | radar | 10 GHz | Up | `#00ff88` |

> **Note:** Bluetooth, Wi-Fi 2.4 GHz, and Microwave all share ~2.4–2.45 GHz.
> They overlap on the log scale; zooming in 40–80× separates them enough to
> distinguish. The staggered stem heights also help visually.

---

## Icons (`src/icons/TechIcons.jsx`)

Each technology has a hand-drawn SVG icon component:

| `svgIcon` key | Component | Notes |
|---|---|---|
| `bluetooth` | `BluetoothIcon` | Standard ᛒ path |
| `wifi` | `WifiIcon` | Three-arc wifi symbol |
| `cellular` | `CellularIcon` | Concentric arc signal bars |
| `satellite` | `SatelliteIcon` | Dish + cross arm shape |
| `microwave` | `MicrowaveIcon` | Box outline + wave path |
| `fiber` | `FiberIcon` | Sinusoidal wave between two dots |
| `nfc` | `NfcIcon` | NFC card icon |
| `radar` | `RadarIcon` | Concentric rings + sweep line |
| `remote` | `RemoteIcon` | TV remote outline |
| `rfid` | `RfidIcon` | Card + radiating arcs |
| `radio` | `RadioIcon` | Old-style radio with antenna |

All icons accept `{ size, color }` props. The dispatcher is:

```js
getTechIcon(svgIconKey, size, color)  // returns JSX or null
```

---

## CSS Design Tokens

```css
--bg:        #0b0b1a   /* page background */
--surface:   #111128   /* nav / footer bars */
--surface2:  #1a1a35   /* card / chip backgrounds */
--border:    #2a2a4a   /* all border lines */
--text:      #d4d4f0   /* primary text */
--text-dim:  #7878a8   /* secondary/muted text */
--accent:    #7b68ee   /* zoom display, hover rings */
--radius:    10px
```

Tech chips use a per-element `--chip-color` CSS custom property set inline from
the technology's `color` field. The `color-mix()` function tints the active chip
background:

```css
.tech-chip.active {
  background: color-mix(in srgb, var(--chip-color) 15%, transparent);
}
```

---

## Known Design Decisions & Gotchas

1. **`preserveAspectRatio="none"`** on the SVG — the viewBox always stretches to
   fill the container width. This is intentional: the log-scale already handles
   proportional distortion, and we want the bar to be full-width at all zoom
   levels.

2. **`foreignObject` for icons inside SVG** — React SVG components can't render
   HTML children directly, so each `TechPin` uses a `<foreignObject>` wrapping a
   flex `<div xmlns="http://www.w3.org/1999/xhtml">`. This works in all modern
   browsers but is skipped by some SVG exporters.

3. **`isIR` flag** — IR remotes operate at a 38 kHz carrier, but the *light* they
   emit is in the infrared band (~300 GHz–430 THz). The `frequency` field stores
   the carrier for accuracy; `isIR: true` redirects the pin to `300e9 Hz` (IR
   band start) on the spectrum bar.

4. **Bluetooth / Wi-Fi 2.4 GHz / Microwave overlap** — all three sit at 2.4–2.45
   GHz. This is factually correct (ISM band congestion is a real topic). They
   visually overlap at low zoom; staggered stems keep them legible. At ~50×+ zoom
   Bluetooth (2.400 GHz) and Wi-Fi/Microwave (2.450 GHz) separate slightly.

5. **Tick label floating-point drift** — the tick loop uses
   `+(l + step).toFixed(10)` to avoid floating-point accumulation across many
   small additions (e.g., 0.1 decade steps).

6. **No animation library** — all transitions are CSS (`transition: left 0.06s`
   on `.minimap-view`). The SVG repaints on every state update; React's VDOM diff
   keeps this fast since only visible bands/ticks/pins are rendered.

7. **`touch-action: none`** on `.viz-container` — required to prevent the browser
   from intercepting pinch/scroll gestures before the `touchmove` handler fires.

---

## Extending the App

### Add a new technology

Add an entry to `TECHNOLOGIES` in `src/spectrumData.js`:

```js
{
  id: "lora",
  name: "LoRa",
  fullName: "Long Range (LoRaWAN)",
  frequency: 915e6,           // Hz — pin position
  freqDisplay: "868 / 915 MHz",
  color: "#ff44aa",
  svgIcon: "radio",           // reuse an existing icon key, or add a new one
  description: "...",
  examples: ["...", "...", "...", "..."],
  band: "UHF",
  range: "~15 km rural",
  standard: "LoRa Alliance TS001",
}
```

No other files need to change unless you want a dedicated icon.

### Add a new icon

1. Create a new component in `src/icons/TechIcons.jsx`
2. Add a case to the `getTechIcon` switch at the bottom of that file
3. Set `svgIcon` to the new key in your technology entry

### Adjust the spectrum range

Change `LOG_MIN` / `LOG_MAX` in `src/spectrumData.js`. Everything downstream
recomputes automatically.

### Change zoom limits

Edit `MIN_ZOOM` and `MAX_ZOOM` constants at the top of `src/SpectrumViz.jsx`.
