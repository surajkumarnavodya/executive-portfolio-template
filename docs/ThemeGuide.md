# Theme Guide

Two independent switches. A visitor can run any combination.

| Switch | Values | Set by |
|---|---|---|
| **Mode** | dark, light | `data-bs-theme` on `<html>` |
| **Palette** | six accents | `data-palette` on `<html>` |

They compose, so "emerald + light" and "emerald + dark" both work. Palettes only
redefine `--accent` and `--accent-2`, which is what keeps them mode-agnostic.

---

## The six palettes

| Palette | `--accent` | `--accent-2` | Reads as |
|---|---|---|---|
| `navy` *(default)* | `#4f8cff` | `#22c07a` | Executive, technical — matches the screenshots |
| `corporate` | `#0a66c2` | `#00a37a` | Closest to LinkedIn's own blue |
| `emerald` | `#10a37f` | `#34d399` | Calmer; suits operations and delivery roles |
| `executive` | `#c9a227` | `#8fbf6a` | Most formal; pairs best with dark mode |
| `purple` | `#7c5cff` | `#22c07a` | Product and design-leaning |
| `charcoal` | `#8fa3bf` | `#6fbf9b` | Near-monochrome, deliberately understated |

## Three ways to change it

**1. Click a swatch.** The picker sits next to the theme toggle. The choice is
saved to `localStorage` and survives reloads.

**2. Set a default in `config.js`.**

```js
theme: {
  palette: 'emerald',
  showPalettePicker: true   // false locks your choice and hides the picker
}
```

A visitor's saved choice always beats this default. Setting
`showPalettePicker: false` is what makes the default authoritative.

**3. From JavaScript.**

```js
PortfolioPalette.set('purple');
PortfolioPalette.get();        // 'purple'
PortfolioPalette.available;    // ['navy','corporate',...]
```

## Adding your own palette

Three small edits.

**`assets/css/variables.css`** — add a block:

```css
[data-palette="teal"] { --accent:#0d9488; --accent-2:#2dd4bf; }
```

**`assets/js/palette.js`** — add the name to `VALID`:

```js
var VALID = ['navy','corporate','emerald','executive','purple','charcoal','teal'];
```

**`index.html`** — add a swatch inside `.palette-picker`:

```html
<button class="pal-swatch" type="button" data-palette="teal"
        aria-label="Teal accent"><span></span></button>
```

Then give it a swatch colour in `style.css`:

```css
.pal-swatch[data-palette="teal"] > span{background:linear-gradient(135deg,#0d9488,#2dd4bf)}
```

Swatch colours are literals on purpose — each button must show *its own*
palette, not the one currently active.

## Full Theme Customizer

Use the floating sliders button (bottom-right) to configure:

- Accent palette + optional custom primary/secondary accent colors
- Light / dark mode
- Font pairing
- Border radius (8–24px)
- Motion intensity (`none`, `reduced`, `normal`, `vivid`)
- Homepage presets:
  - CEO
  - CTO
  - CIO
  - Program Director
  - Delivery Manager
  - Engineering Manager
  - Product Leader
  - Consultant
- Visual layout builder:
  - drag/drop section ordering
  - section visibility toggles
  - export/import JSON configuration

All preferences persist in `localStorage` under `pf-theme-customizer-v1`.

## Changing more than the accent

For a deeper reskin — backgrounds, surfaces, borders, text — edit the `:root`
and `[data-bs-theme="light"]` blocks at the top of `variables.css`. Those hold
every colour the components use, so nothing needs touching in `style.css`.

Keep two things in mind:

- **Contrast.** Body text against its background should reach 4.5:1, large
  headings 3:1. The default palettes are checked; a custom one may not be.
- **`--accent-2` carries meaning.** It signals "good" — scorecard bars, status
  dots, positive deltas. Keep it green-ish, or the panels stop reading as
  healthy at a glance.
