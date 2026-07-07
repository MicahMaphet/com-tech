# Electromagnetic Spectrum Explorer — Architecture

> **New agents:** read `AGENTS.md` first for the fast orientation, then this file for depth.

## Stack

- Vite 8, React 19, plain CSS (no external UI libraries, no CSS-in-JS)
- oxlint for linting
- Only runtime deps: react + react-dom

## Triple visualisations

The app renders **one page per axis** — a frequency page (Hz), a power page (W), and a range page (m) — selectable via a top tab bar. Everything below the App layer is triplicated in *twin* trios, one per domain. This is a deliberate design choice: each page reads top-to-bottom in isolation, and the twin pattern makes it trivial to add a fourth axis later.

| Role | Frequency (Hz) | Power (W) | Range (m) |
|---|---|---|---|
| Data, bands, categories, axis math | `src/spectrumData.js` + `src/spectrumMath.js` | `src/powerData.js` | `src/rangeData.js` |
| View-window hook (`{s,e}` + zoom/pan/focus) | `src/hooks/useSpectrumView.js` | `src/hooks/usePowerView.js` | `src/hooks/useRangeView.js` |
| Page component | `src/SpectrumViz.jsx` | `src/PowerViz.jsx` | `src/RangeViz.jsx` |
| Slide-in detail card | `src/components/InfoPanel.jsx` | `src/components/PowerInfoPanel.jsx` | `src/components/RangeInfoPanel.jsx` |

Every file above starts with a `// TWIN: ./…` header pointing at its counterpart.

**Shared across all pages (no twin):**

- `src/hooks/useSpectrumInteractions.js` — pure 0–1 space, works for any axis.
- `src/components/TechPin.jsx` — accepts a `displayLabel` prop (defaults to `tech.freqDisplay`); `PowerViz` passes `tech.powerDisplay`, `RangeViz` passes `tech.rangeDisplay`.
- `src/spectrumMath.js` — `clamp`, `posToX`, SVG geometry constants, zoom limits. (`generateTicks` and `posToHz` are Hz-only; W and m equivalents live in `powerData.js` and `rangeData.js`.)
- `src/icons/`, `App.jsx` (owns the page-tab state), `index.css`.

## File map

```
com-tech/
├── AGENTS.md                         # Agent-facing orientation (read first)
├── ARCHITECTURE.md                   # This file (deep reference)
├── README.md                         # Product overview + how to run
├── index.html                        # Vite entry; sets page title
└── src/
    ├── main.jsx                      # ReactDOM.createRoot mount
    ├── App.jsx                       # Page-tab state; renders SpectrumViz / PowerViz / RangeViz inside .app-shell
    ├── index.css                     # All styles (CSS custom props, dark theme, .app-shell layout)
    │
    ├── SpectrumViz.jsx               # Frequency page orchestrator [TWIN: PowerViz.jsx]
    ├── PowerViz.jsx                  # Power page orchestrator     [TWIN: SpectrumViz.jsx]
    ├── RangeViz.jsx                  # Range page orchestrator     [TWIN: PowerViz.jsx]
    │
    ├── spectrumData.js               # SPECTRUM_CATEGORIES, SPECTRUM_BANDS, TECHNOLOGIES; freqToPosition, formatFrequency, LOG_MIN, LOG_MAX
    ├── spectrumMath.js               # Geometry constants (SHARED), clamp, posToHz, posToX, generateTicks
    ├── powerData.js                  # POWER_CATEGORIES, POWER_BANDS; powerToPosition, posToWatts, formatPower, generatePowerTicks, LOG_MIN_W/MAX_W
    ├── rangeData.js                  # RANGE_CATEGORIES, RANGE_BANDS; rangeToPosition, posToMeters, formatDistance, generateRangeTicks, LOG_MIN_M/MAX_M
    │
    ├── hooks/
    │   ├── useSpectrumView.js        # {s,e} + zoom/pan/focus/reset for the Hz axis   [TWIN: usePowerView.js]
    │   ├── usePowerView.js           # {s,e} + zoom/pan/focus/reset for the W axis    [TWIN: useSpectrumView.js]
    │   ├── useRangeView.js           # {s,e} + zoom/pan/focus/reset for the m axis    [TWIN: usePowerView.js]
    │   └── useSpectrumInteractions.js# Wheel/mouse/touch → applyZoom/applyPan (SHARED, axis-agnostic)
    ├── components/
    │   ├── TechPin.jsx               # Pin marker (SHARED; displayLabel prop switches aria between freqDisplay/powerDisplay/rangeDisplay)
    │   ├── InfoPanel.jsx             # Frequency detail card [TWIN: PowerInfoPanel.jsx]
    │   ├── PowerInfoPanel.jsx       # Power detail card     [TWIN: InfoPanel.jsx]
    │   └── RangeInfoPanel.jsx        # Range detail card     [TWIN: PowerInfoPanel.jsx]
    └── icons/
        ├── TechIcons.jsx             # 20 hand-drawn SVG icon components
        └── getTechIcon.jsx           # Dispatcher: key string → JSX
```

---

## Coordinate System & Math

### Log-scale mapping

Full spectrum is 3 Hz → 3×10²² Hz (≈ 22 decades).

```
LOG_MIN = log10(3)     ≈ 0.477
LOG_MAX = log10(3e22)  ≈ 22.477

freqToPosition(hz) = (log10(hz) − LOG_MIN) / (LOG_MAX − LOG_MIN)  → [0, 1]
posToHz(pos)       = 10 ^ (pos × (LOG_MAX − LOG_MIN) + LOG_MIN)   → Hz
```

### View state

```js
{ s: 0..1,   // viewStart — left edge of visible window
  e: 0..1 }  // viewEnd   — right edge of visible window
```

`viewRange = e − s`. Full zoom: s=0, e=1. Max zoom (150×): viewRange ≈ 0.0067.
Effective zoom level reported to the user as `1 / viewRange`.

### SVG coordinate system

The SVG element has `width="100%"` and `height={SVG_H}` (360px). Rather than a fixed viewBox that stretches non-uniformly, the viewBox width is set dynamically to match the container's actual CSS pixel width (measured via `ResizeObserver`):

```jsx
<svg viewBox={`0 0 ${width} ${SVG_H}`} width="100%" height={SVG_H} preserveAspectRatio="none">
```

Because the viewBox width always equals the rendered CSS width, the horizontal and vertical scales are both 1 px/unit — no stretching. Circles stay circular, icons stay proportional.

**`posToX`** converts a 0–1 position to an x-coordinate in the live viewBox:

```js
posToX(pos, viewStart, viewEnd, width) =
    ((pos − viewStart) / (viewEnd − viewStart)) × width
```

`width` defaults to `VB_W = 1000` (the fallback before the first ResizeObserver tick).

### SVG vertical layout

```
Y=0    ┌──────────────────────────────┐
       │  tech-pin icon area          │  PIN_AREA_H = 224 px
Y=224  ├──────────────────────────────┤
       │  tick marks + band names     │  LABEL_AREA_H = 44 px
       │  (just above bar)            │
Y=268  ├──────────────────────────────┤  ← BAR_Y; pin stems root here
       │  coloured spectrum bar       │  BAR_H = 70 px
Y=338  ├──────────────────────────────┤
       │  category labels             │  CATEGORY_STRIP_H = 22 px
       │  (Radio, Microwaves, …)      │
Y=360  └──────────────────────────────┘  SVG_H = 360
```

Constants in `spectrumMath.js`:

```js
VB_W            = 1000   // fallback viewBox width
BAR_H           = 70
PIN_AREA_H      = 224
LABEL_AREA_H    = 44
CATEGORY_STRIP_H = 22
BAR_Y           = PIN_AREA_H + LABEL_AREA_H  // 268
SVG_H           = BAR_Y + BAR_H + CATEGORY_STRIP_H  // 360
MIN_ZOOM        = 1
MAX_ZOOM        = 150
```

---

## Component Architecture

### Tree

```
App
└── SpectrumViz                    (orchestrator; owns selectedTech state, width state)
    ├── useSpectrumView             hook: view {s,e}, applyZoom, applyPan, focusTech, resetView
    ├── useSpectrumInteractions     hook: wheel + mouse-drag + touch → calls applyZoom/applyPan
    ├── <header.app-header>         sticky; title, zoom +/− buttons, reset, zoom readout
    ├── <nav.tech-nav>              quick-jump chips for all 26 technologies
    ├── <div.viz-container>         ResizeObserver target; touch-action:none; flex-end aligns SVG to bottom
    │   ├── <svg viewBox dynamic>   the spectrum canvas
    │   │   ├── <defs>              rainbow gradient, glow filter
    │   │   ├── Band rects          one <rect> per visible SPECTRUM_BAND
    │   │   ├── Category labels     SPECTRUM_CATEGORIES names below the bar
    │   │   ├── Tick marks + labels above the bar (LABEL_AREA_H strip)
    │   │   └── TechPin ×N          one per visible TECHNOLOGY
    │   └── InfoPanel               absolute overlay, shown when selectedTech ≠ null
    └── <footer.freq-footer>        left-edge freq · minimap · right-edge freq
```

### State

| Owner | State | Type | Description |
|---|---|---|---|
| `useSpectrumView` | `view` | `{s, e}` | Current 0–1 viewport window |
| `useSpectrumInteractions` | `isDragging` | `boolean` | Drives `.is-dragging` → `grabbing` cursor |
| `SpectrumViz` | `selectedTech` | `Technology \| null` | Drives pin highlight + InfoPanel |
| `SpectrumViz` | `width` | `number` | Container pixel width for dynamic viewBox |

No global state, no context, no reducers.

### Interactions → state changes

| Interaction | Handler | Effect |
|---|---|---|
| Scroll wheel | `wheel` (non-passive) | `applyZoom(cursorFrac, ±1.2)` |
| Mouse drag | `mousedown` + global `mousemove` | `applyPan(deltaNorm)` |
| Pinch (2-finger touch) | `touchstart/move` | `applyZoom(midFrac, newDist/oldDist)` |
| Swipe (1-finger touch) | `touchstart/move` | `applyPan(deltaNorm)` |
| Quick-nav chip click | `jumpToTech` | `focusTech(tech)` → FOCUS_SPAN=0.045 window; sets selectedTech |
| Pin click | `togglePin` | Toggles selectedTech |
| Background click | `onClick` on `.viz-container` | Clears selectedTech |
| `+` / `=` key | global `keydown` | `applyZoom(0.5, 1.3)` |
| `-` / `_` key | global `keydown` | `applyZoom(0.5, 1/1.3)` |
| `←` / `→` key | global `keydown` | `applyPan(±0.15 × viewRange)` |
| `0` key | global `keydown` | `resetView()`, clears selectedTech |
| `Esc` key | `InfoPanel` useEffect | `onClose()` |
| Window resize | ResizeObserver on containerRef | updates `width` → viewBox redraws |

### `applyZoom(focalFrac, factor)`

Atomic functional update so rapid wheel events never see stale state:

```js
setView((v) => {
  const range    = v.e - v.s;
  const focalAbs = v.s + focalFrac * range;      // focal point in [0,1]
  const newRange = clamp(range / factor, 1/MAX_ZOOM, 1/MIN_ZOOM);
  let ns = focalAbs - focalFrac * newRange;       // keep focal point stationary
  let ne = ns + newRange;
  if (ns < 0) { ns = 0; ne = newRange; }
  if (ne > 1) { ne = 1; ns = 1 - newRange; }
  return { s: ns, e: ne };
});
```

### `applyPan(deltaNorm)`

```js
setView((v) => {
  const r = v.e - v.s;
  let ns = v.s - deltaNorm * r;   // deltaNorm is fraction of current view range
  let ne = v.e - deltaNorm * r;
  if (ns < 0) { ns = 0; ne = r; }
  if (ne > 1) { ne = 1; ns = 1 - r; }
  return { s: ns, e: ne };
});
```

### Tick generation (`generateTicks`)

Picks a log-decade step based on the current visible span so there are always roughly 5–10 ticks:

| Log span (decades) | Tick step |
|---|---|
| > 8 | 2 decades |
| > 4 | 1 decade |
| > 2 | 0.5 decades |
| > 1 | 0.25 decades |
| ≤ 1 | 0.1 decades |

Walks from `⌊log10(startHz)/step⌋ × step` to `⌈log10(endHz)/step⌉ × step`.
Uses `+(l + step).toFixed(10)` to prevent floating-point drift accumulation.

---

## Data Model

### `SPECTRUM_CATEGORIES` — 7 entries

High-level physics grouping of the spectrum. Rendered as labels in the slim strip directly below the colour bar. Boundaries are non-overlapping and align with `SPECTRUM_BANDS` edges.

| Name | freqMin | freqMax |
|---|---|---|
| Radio | 3 Hz | 3 GHz |
| Microwaves | 3 GHz | 300 GHz |
| Infrared | 300 GHz | 430 THz |
| Visible | 430 THz | 750 THz |
| Ultraviolet | 750 THz | 30 PHz |
| X-rays | 30 PHz | 30 EHz |
| Gamma | 30 EHz | 3×10²² Hz |

Labels are hidden when a category's visible width fraction (`wFrac`) drops below 0.04 (4 % of view) to prevent overprinting at low zoom.

### `SPECTRUM_BANDS` — 16 entries

```ts
{
  name: string          // "Ultra High Frequency"
  abbr: string          // "UHF"
  freqMin: number       // Hz
  freqMax: number       // Hz
  unit: string          // display hint only
  color: string         // hex, or "rainbow" → SVG linearGradient fill
  wavelengthMin: string // human-readable
  wavelengthMax: string
}
```

Band order: `ELF → SLF → ULF → VLF → LF → MF → HF → VHF → UHF → SHF → EHF → IR → VIS → UV → X → γ`

Spans 3 Hz → 3×10²² Hz (≈ 22 decades). Abbreviation text is rendered inside the bar when the band's viewBox width fraction > 3 %. Full band name is rendered above the bar in the label strip when fraction > 6 %.

### `TECHNOLOGIES` — 26 entries

```ts
{
  id: string           // unique kebab-case
  name: string         // short display label
  fullName: string     // long name for InfoPanel
  frequency: number    // Hz — canonical pin position on the frequency page
  freqDisplay: string  // human-readable Hz range string
  powerW: number       // W — canonical pin position on the power page
  powerDisplay: string // human-readable power range string
  rangeM: number|null  // m — canonical pin position on the range page (null → skipped)
  rangeDisplay: string|null // human-readable distance string (null when rangeM is null)
  color: string        // hex — pin, chip border, InfoPanel accent
  svgIcon: string      // key for getTechIcon()
  description: string
  examples: string[]   // 4 real-world use cases
  band: string         // ITU band label(s)
  range: string        // typical operational range (legacy free-text; still shown as fallback)
  standard: string     // governing standard or spec
  isIR?: boolean       // see gotcha #3 below — frequency-page-only override
}
```

The `frequency`/`freqDisplay` and `powerW`/`powerDisplay` pairs are required and always numeric on every entry. The `rangeM`/`rangeDisplay` pair is **nullable by design**: technologies with no meaningful free-space distance (wired power, oven cavities, shielded X-ray rooms, contained detector rings, fibre spans between repeaters, room-scale visible-light sources) set both to `null` and are simply filtered out by `RangeViz.jsx`. Always set `null` explicitly rather than omitting the fields — it keeps the omission greppable.

Technologies sorted by frequency:

| id | Frequency | Band | Color |
|---|---|---|---|
| `ac-power` | 60 Hz | ELF | `#ffdd44` |
| `qi-charging` | 150 kHz | LF | `#66ff88` |
| `nfc` | 13.56 MHz | HF | `#00c8ff` |
| `am-radio` | 1 MHz | MF | `#ff9900` |
| `cb-radio` | 27 MHz | HF | `#ff8844` |
| `fm-radio` | 100 MHz | VHF | `#ff6600` |
| `walkie-talkie` | 462 MHz | UHF | `#ffaa22` |
| `rfid` | 915 MHz | UHF | `#cc44ff` |
| `gps` | 1.575 GHz | UHF | `#ffcc00` |
| `4g-lte` | 1.8 GHz | UHF | `#ff6600` |
| `bluetooth` | 2.4 GHz | UHF | `#0082fc` |
| `wifi-24` | 2.45 GHz | UHF | `#00aaff` |
| `microwave` | 2.45 GHz | UHF | `#ff4400` |
| `wifi-5` | 5.5 GHz | SHF | `#0066ff` |
| `uwb` | 6.5 GHz | SHF | `#22ddff` |
| `radar` | 10 GHz | SHF | `#00ff88` |
| `satellite-internet` | 20 GHz | SHF | `#ffaa00` |
| `5g` | 28 GHz | SHF | `#ff3300` |
| `auto-radar` | 77 GHz | EHF | `#33ffaa` |
| `ir-remote` | pinned at 300 GHz *(isIR)* | IR | `#cc2200` |
| `fiber` | 193 THz | Near-IR | `#00ffaa` |
| `truedepth` | 319 THz (940 nm) | Near-IR | `#ff5566` |
| `led-light` | 500 THz | Visible | `#ffee66` |
| `uv-sterilizer` | 1.18 PHz (254 nm) | UV-C | `#aa55ff` |
| `xray-medical` | 3×10¹⁸ Hz (~12 keV) | X-Ray | `#bb00ff` |
| `gamma-pet` | 1.24×10²⁰ Hz (511 keV) | Gamma | `#ff44ff` |

---

## TechPin

All pins point **upward** from the top edge of the colour bar (`pinY = BAR_Y = 268`). Stem height is staggered by `idx % 4` so vertically-close pins at similar frequencies separate nicely:

```
stemH = 90 + (idx % 4) × 22   →  90, 112, 134, 156 px
iconY = BAR_Y − stemH          →  178, 156, 134, 112
```

Icon radii: 17 px (normal), 22 px (selected). With `r = 22`, the bottom of the shortest icon sits at `178 + 22 = 200`, well inside `PIN_AREA_H = 224`. This ensures icons never overlap the label strip.

Stems are solid lines. The name label (`showLabel = selected || zoomLevel > 4`) is placed at `iconY − iconR − 5` (above the bubble).

---

## Icons (`src/icons/`)

All icons accept `{ size, color }` props and render a 24×24 SVG.

| `svgIcon` key | Component | Visual motif |
|---|---|---|
| `acpower` | `AcPowerIcon` | Sine wave + lightning bolt |
| `bluetooth` | `BluetoothIcon` | Standard ᛒ path |
| `cellular` | `CellularIcon` | Concentric arc signal bars |
| `charging` | `ChargingIcon` | Battery outline + lightning bolt |
| `fiber` | `FiberIcon` | Sinusoidal wave between two dots |
| `gamma` | `GammaIcon` | Three-ellipse atom |
| `lightbulb` | `LightbulbIcon` | Classic bulb silhouette |
| `microwave` | `MicrowaveIcon` | Oven box + wave path |
| `nfc` | `NfcIcon` | NFC card outline |
| `radar` | `RadarIcon` | Concentric rings + sweep line |
| `radio` | `RadioIcon` | Retro radio with antenna |
| `remote` | `RemoteIcon` | TV remote outline |
| `rfid` | `RfidIcon` | Card + radiating arcs |
| `satellite` | `SatelliteIcon` | Dish + cross-arm |
| `truedepth` | `TrueDepthIcon` | Face-ID viewfinder brackets + face |
| `uv` | `UvIcon` | Sun with 8 rays |
| `uwb` | `UwbIcon` | Crosshair + concentric dashed rings |
| `walkietalkie` | `WalkieTalkieIcon` | Handheld radio with antenna |
| `wifi` | `WifiIcon` | Three-arc Wi-Fi arcs |
| `xray` | `XrayIcon` | Radiation trefoil |

Dispatcher in `getTechIcon.jsx`:
```js
getTechIcon(svgIconKey, size, color)  // → JSX or null
```

---

## CSS Design Tokens

```css
--bg:        #0b0b1a   /* page background */
--surface:   #111128   /* nav / footer bars */
--surface2:  #1a1a35   /* card / chip backgrounds */
--border:    #2a2a4a   /* all borders */
--text:      #d4d4f0   /* primary text */
--text-dim:  #7878a8   /* secondary / muted text */
--accent:    #7b68ee   /* zoom display, focus rings */
--radius:    10px
```

Each tech chip sets `--chip-color` inline from `tech.color`. The active state uses:
```css
.tech-chip.active {
  background: color-mix(in srgb, var(--chip-color) 15%, transparent);
}
```

The `.viz-container` uses `display: flex; flex-direction: column; justify-content: flex-end` so the SVG is always anchored to the bottom of the available vertical space, sitting just above the minimap footer.

---

## Design Decisions & Gotchas

1. **Dynamic viewBox width** — The SVG's viewBox width is driven by a `ResizeObserver` on the container so it always matches the real CSS pixel width. Combined with `preserveAspectRatio="none"`, this means both axes scale at 1 px/unit and nothing gets stretched. Circles are always circular; icons are always square. (Historical note: the original fixed `viewBox="0 0 1000 360"` caused horizontal squishing on wide viewports.)

2. **`foreignObject` for icons** — React SVG trees can't render arbitrary HTML components, so each `TechPin` wraps its icon in `<foreignObject>` with a flex `<div xmlns="http://www.w3.org/1999/xhtml">`. Works in all modern browsers; may be skipped by SVG exporters.

3. **`isIR` flag** — IR remotes use a 38 kHz carrier, but their light is near-IR (~300 GHz–430 THz). The `frequency` field stores the carrier for data accuracy; `isIR: true` redirects the pin placement to `freqToPosition(300e9)` so it appears in the IR band.

4. **2.4 GHz ISM band crowding** — Bluetooth (2.400 GHz), Wi-Fi 2.4 GHz (2.450 GHz), and Microwave Oven (2.450 GHz) share the same region. This is factually accurate — ISM band congestion is itself an important topic. Staggered `idx % 4` stems keep them visually separate; zooming to ~50× separates Bluetooth from the other two.

5. **All pins upward** — Pins were previously alternated up/down based on `idx % 2`. They now all point upward from `BAR_Y`, leaving the label strip and category row below completely clear. Four stem-height levels (`idx % 4`) provide enough vertical separation.

6. **Tick floating-point drift** — The tick loop uses `+(l + step).toFixed(10)` to prevent accumulation across many additions at small step sizes (e.g. 0.1 decade steps = 100 iterations across 10 decades).

7. **`touch-action: none`** on `.viz-container` — Required so the browser does not intercept pinch-to-zoom and scroll gestures before the `touchmove` handler fires.

8. **Atomic state updates** — Both `applyZoom` and `applyPan` use `setView(fn)` functional form. This avoids stale-closure bugs when wheel or touch events fire faster than React can flush a render.

9. **`visibleBands` / `visibleTechs` memoisation** — Both are `useMemo`-derived from `[s, e]`. The overscan on `visibleTechs` (`pad = viewRange × 0.05`) prevents half-visible pins from suddenly appearing mid-drag.

10. **Layout invariant — `.app-shell` owns the viewport height, not `.app-root`.** With the addition of the page-tab bar, the DOM shape is now:

    ```
    .app-shell   (height: 100dvh; flex column; overflow: hidden)
    ├── .page-tabs
    └── .app-root  (flex: 1; min-height: 0; overflow: hidden)
    ```

    `.app-root` **must not** carry `min-height: 100dvh` — that pushes the footer off-screen because `.page-tabs` above it consumes real height. The `min-height: 0` on `.app-root` is the critical flex-child trick that lets `.viz-container` shrink correctly.

11. **Range axis is 11 decades (1 mm → 100 000 km) and skips wired/contained tech.** The range page uses a log-metre axis with `LOG_MIN_M = -3`, `LOG_MAX_M = 8`. Seven of the 26 technologies (`ac-power`, `microwave`, `fiber`, `led-light`, `uv-sterilizer`, `xray-medical`, `gamma-pet`) have no meaningful free-space transmission distance — their `rangeM` is `null` and `RangeViz.jsx` filters them out of both the pin layer and the chip nav. The colour bar uses a warm-near → cool-far gradient (touch = red, planetary = deep blue) to invert the power page's cool → hot mapping so the two pages stay visually distinct.

11. **Twin hooks (`useSpectrumView` vs `usePowerView`) are near-duplicates.** Each imports its own domain-specific `toPosition` function at the top of the file, and only differs in the one line inside `focusTech`. This coupling is deliberately kept visible (rather than parameterised as `useAxisView(toPosition)`) so each page's stack is easy to read in isolation and each file can be grepped independently.

12. **`TechPin.displayLabel` prop is required from the power page.** The prop defaults to `tech.freqDisplay`, so callers on the power page must explicitly pass `tech.powerDisplay` (see `PowerViz.jsx`). Do not re-hardcode `tech.freqDisplay` inside `TechPin`.

---

## Extending the App

### Add a technology

Append an entry to `TECHNOLOGIES` in `src/spectrumData.js`. Reuse any existing `svgIcon` key, or add a new icon (see below). **Both** the `frequency`/`freqDisplay` and `powerW`/`powerDisplay` pairs are required.

```js
{
  id: "lora",
  name: "LoRa",
  fullName: "Long Range (LoRaWAN)",
  frequency: 915e6,
  freqDisplay: "868 / 915 MHz",
  color: "#ff44aa",
  svgIcon: "radio",
  description: "Low-power wide-area radio for IoT devices",
  examples: ["Smart meters", "Asset tracking", "Agriculture sensors", "City-wide sensors"],
  band: "UHF",
  range: "~15 km rural",
  standard: "LoRa Alliance TS001",
  powerW: 0.025,
  powerDisplay: "14 – 25 dBm (25 – 316 mW)",
}
```

No other files need changing unless you want a dedicated icon.

### Add an icon

1. Export a new `XyzIcon({ size, color })` component from `src/icons/TechIcons.jsx`
2. Import it and add `xyz: XyzIcon` to the `ICONS` map in `src/icons/getTechIcon.jsx`
3. Set `svgIcon: "xyz"` on your technology entry

### Adjust the spectrum range

Change `LOG_MIN` / `LOG_MAX` in `src/spectrumData.js`. All downstream math (`freqToPosition`, `posToHz`, tick generation) recomputes automatically.

### Change zoom limits

Edit `MIN_ZOOM` and `MAX_ZOOM` in `src/spectrumMath.js`.

### Change the SVG vertical layout

All heights are derived constants in `src/spectrumMath.js`. Edit `PIN_AREA_H`, `LABEL_AREA_H`, `CATEGORY_STRIP_H`, or `BAR_H` and the rest cascade automatically through `BAR_Y` and `SVG_H`. Both pages share these constants.

### Add a third axis (e.g. photon energy in eV)

Follow the twin pattern exactly — do **not** attempt to parameterise the existing pairs. `AGENTS.md § Adding a third axis` has the concrete step-by-step; the summary is:

1. Create `src/energyData.js` mirroring `powerData.js` (bands, categories, `energyToPosition`, `posToEnergy`, `formatEnergy`, `generateEnergyTicks`).
2. Create `src/hooks/useEnergyView.js` by copying `usePowerView.js` and swapping the `toPosition` import.
3. Create `src/EnergyViz.jsx` and `src/components/EnergyInfoPanel.jsx` from their power counterparts.
4. Add `energyEV` (number) and `energyDisplay` (string) to every `TECHNOLOGIES` entry.
5. Add a third `.page-tab` in `App.jsx`.
6. Add `// TWIN: …` header comments to each new file so the pairing stays discoverable.
