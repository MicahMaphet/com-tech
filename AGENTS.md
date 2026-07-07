# AGENTS.md

Agent-facing orientation for the com-tech project. Read this before making changes; it's short and prevents wasted exploration.

## Start here
1. Skim `README.md` for a 30-second product overview.
2. Read `ARCHITECTURE.md` before touching non-trivial code — it documents the coordinate math, SVG layout, state model, and design decisions that aren't obvious from the source. Consult it whenever you're uncertain.

## Three parallel visualisations
The app renders **one page per axis**. Everything below the App layer is triplicated in "twin" trios — one per domain — so each page is independently self-contained and readable:

| Role | Frequency (Hz) | Power (W) | Range (m) |
|---|---|---|---|
| Data · bands · categories · axis math | `src/spectrumData.js` (+ `src/spectrumMath.js`) | `src/powerData.js` | `src/rangeData.js` |
| View-window hook (`{s,e}` + zoom / pan / focus) | `src/hooks/useSpectrumView.js` | `src/hooks/usePowerView.js` | `src/hooks/useRangeView.js` |
| Page component | `src/SpectrumViz.jsx` | `src/PowerViz.jsx` | `src/RangeViz.jsx` |
| Slide-in detail card | `src/components/InfoPanel.jsx` | `src/components/PowerInfoPanel.jsx` | `src/components/RangeInfoPanel.jsx` |

Every file in this table starts with a `// TWIN: ./…` comment pointing at its counterpart, so you can jump between them without searching.

## Domain-agnostic (shared, no twin — reuse them)
Do **not** duplicate these when adding a new axis:
- `src/hooks/useSpectrumInteractions.js` — wheel / drag / pinch operate purely on 0–1 normalised positions.
- `src/spectrumMath.js` — `clamp`, `posToX`, `MIN_ZOOM`/`MAX_ZOOM`, SVG geometry constants (`BAR_Y`, `BAR_H`, `SVG_H`, `VB_W`). (`generateTicks` and `posToHz` are Hz-specific — the W and m equivalents live in `powerData.js` and `rangeData.js`.)
- `src/components/TechPin.jsx` — accepts an optional `displayLabel` prop. Pass `tech.freqDisplay` on the frequency page, `tech.powerDisplay` on the power page, and `tech.rangeDisplay` on the range page. **Never re-hardcode `tech.freqDisplay` here.**
- `src/icons/` — pure presentation.

## Data model — multi-field requirement
Every entry in `TECHNOLOGIES` (`src/spectrumData.js`) MUST carry all three axis pairs:
- `frequency` (Hz, number) + `freqDisplay` (string) — powers the Hz page
- `powerW` (W, number) + `powerDisplay` (string) — powers the W page
- `rangeM` (m, number **or `null`**) + `rangeDisplay` (string **or `null`**) — powers the m page

The frequency and power pairs must always be numeric strings — if either is missing, the corresponding page will mis-render or crash on that entry.

The range pair is **nullable by design**: technologies with no meaningful free-space distance (wired power, oven cavities, shielded X-ray rooms, contained detector rings, fibre spans between repeaters, room-scale visible-light sources, etc.) set both `rangeM: null` and `rangeDisplay: null`. `RangeViz.jsx` filters those out so they never appear as pins or chips on the range page. Never omit the fields — set them to `null` explicitly so the omission is greppable.

## Layout invariant
The top-level DOM must be:

```
.app-shell   (height: 100dvh; flex column; overflow: hidden)
├── .page-tabs
└── .app-root  (flex: 1; min-height: 0; overflow: hidden)
```

**Never restore `min-height: 100dvh` on `.app-root`.** It now sits inside `.app-shell`, which owns the viewport budget. Re-adding the old `min-height` pushes the footer below the fold. (This was a bug during the power-page rollout — recorded here so it doesn't happen again.)

## Adding a technology
Append to `TECHNOLOGIES` in `src/spectrumData.js`. Provide all three axis pairs: `frequency`/`freqDisplay`, `powerW`/`powerDisplay`, and `rangeM`/`rangeDisplay` (both `null` if it doesn't have a meaningful free-space range). See `ARCHITECTURE.md § Extending the App` for the full field list.

## Adding a fourth axis (e.g. photon energy in eV)
Follow the twin pattern exactly — do not try to parameterise the existing trios. Use the range page as a working template (it was added the same way):
1. Create `src/energyData.js` mirroring `rangeData.js`: exports `energyToPosition`, `posToEnergy`, `formatEnergy`, `generateEnergyTicks`, `ENERGY_BANDS`, `ENERGY_CATEGORIES`.
2. Create `src/hooks/useEnergyView.js` by copying `useRangeView.js` and swapping the one `rangeToPosition` call.
3. Create `src/EnergyViz.jsx` and `src/components/EnergyInfoPanel.jsx` by copying their range counterparts.
4. Add `energyEV` (numeric, nullable if it doesn't apply) and `energyDisplay` fields to every entry in `TECHNOLOGIES`.
5. Add a fourth `.page-tab` in `App.jsx`.

Add `// TWIN:` markers to the new files pointing at their range siblings.

## Gotchas
- **`ir-remote` has `isIR: true`** — on the frequency page its pin renders at 300 GHz (the near-IR band boundary) even though `frequency: 38e3` (the actual 38 kHz IR carrier). Power and range views have no equivalent override; they use `powerW` and `rangeM` directly.
- **`useSpectrumView`, `usePowerView`, and `useRangeView` are near-duplicates.** Each imports its own `toPosition` function at the top of the file — the coupling is not visible from the hook signature. Kept as separate files for clarity and grep-ability, not parameterised.
- **`useRangeView.focusTech` no-ops when `tech.rangeM == null`.** That's a defensive guard; the chip nav in `RangeViz.jsx` already filters null entries out, but the guard means `focusTech` is safe to call with any technology.
- **`TechPin`'s `displayLabel` prop defaults to `tech.freqDisplay`.** Callers on the power page must pass `tech.powerDisplay` explicitly; callers on the range page must pass `tech.rangeDisplay` explicitly.
