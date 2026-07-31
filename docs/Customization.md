# Customization

Two places to edit, and it is worth knowing which is which:

- **`assets/js/config.js`** — identity, contact details, links, theme, feature switches
- **`index.html`** — all page prose: headlines, case studies, timeline, testimonials
- **`assets/js/customizer.js`** — runtime theme controls and homepage presets
- **`assets/js/components.js`** — reusable section component registry/API

Prose stays in HTML on purpose. Search engines index markup without executing
JavaScript, and text is easier to proofread in place than inside a JS object.

---

## Colours and theme

### No-code customizer

Use the floating **Template Customizer** panel to tune mode, accents, fonts, radius,
motion intensity and homepage preset without editing files.

It also includes a visual layout builder for section ordering and visibility,
plus JSON export/import for portable layout configurations.

### The quick way — one line in `config.js`

```js
theme: {
  accent:    '#4f8cff',   // primary
  accentAlt: '#22c07a'    // success / positive
}
```

Ready-made palettes are listed in the comments of `config.js`:

| Palette | accent | accentAlt |
|---|---|---|
| Navy (default) | `#4f8cff` | `#22c07a` |
| Executive | `#c9a227` | `#8a8f98` |
| Corporate | `#0a66c2` | `#00a37a` |
| Violet | `#7c5cff` | `#22c07a` |

### The thorough way — `assets/css/variables.css`

```css
:root {
  --bg;  --surface;  --border;         /* backgrounds and dividers  */
  --text;  --text-2;  --heading;       /* type colours              */
  --accent;  --accent-2;               /* brand colours             */
  --radius;  --shadow;  --transition;  /* shape and motion          */
}
```

Both light and dark values live in this one file, under `:root` and
`[data-bs-theme="light"]`. Change them here and every component follows.

---

## Fonts

Three families, swapped in two places. In `index.html`, change the Google Fonts
`<link>`; in `variables.css`, change the matching variable:

```css
--font-display  /* headlines      — Instrument Serif */
--font-body     /* body copy      — Inter            */
--font-mono     /* labels, chips  — JetBrains Mono   */
```

Keep `--font-mono` as a genuine monospace — the eyebrow labels and metric chips
rely on even letter spacing to line up.

---

## Feature switches

Set any of these to `false` in `config.js` to turn a behaviour off:

| Switch | Effect when `false` |
|---|---|
| `telemetryTicker` | Removes the scrolling bar above the navbar |
| `heroRotator` | Headline shows one fixed phrase |
| `kpiCountUp` | Numbers appear at final value, no animation |
| `kpiTilt` | Removes the 3D tilt on the snapshot panel |
| `scrollReveals` | All sections visible immediately |
| `scrollProgress` | Removes the progress bar |
| `showThemeToggle` | Hides the light/dark button |

Turning several off is the fastest way to make the page feel calmer, and helps
on low-powered devices.

---

## Section map

Search `index.html` for these strings to find each block:

| Section | Search for |
|---|---|
| Navbar | `<nav class="navbar` |
| Hero eyebrow chip | `eyebrow-chip` |
| Hero headline | `<h1` |
| Lead statement | `value-statement` |
| Hero paragraph | `class="lede"` |
| Domain chips | `class="dom"` |
| Stat cards (4) | `hero-stat s-blue` |
| Selected highlights ribbon | `highlights-label` |
| CTA buttons | `hero-cta` |
| Executive Scorecard | `exec-scorecard` |
| Steering Snapshot | `kpi-board` |
| Leadership principles | `id="leadership"` |
| Case studies | `id="success-stories"` |
| AI work | `id="ai-leadership"` |
| Capability matrix | `id="expertise"` |
| Experience timeline | `id="experience"` |
| Certifications, awards | `id="recognition"` |
| Recommendations | `id="testimonials"` |
| Contact | `id="contact"` |
| Footer | `<footer` |

### Removing a section

Delete the whole `<section id="...">…</section>` block, then remove its navbar
link:

```html
<li class="nav-item"><a class="nav-link" href="#expertise">Expertise</a></li>
```

The active-link highlighting builds its list from the navbar at runtime, so it
adapts automatically. Nothing else needs changing.

### Reordering sections

Cut and paste whole `<section>` blocks. They are self-contained. Reorder the
navbar links to match.

---

## The metric panels

### Executive Scorecard

Each row is one line. Keep the bar width and the value in agreement:

```html
<div class="row-item">
  <span class="sc-label"><span class="sc-dot"></span>Delivery Success</span>
  <span class="sc-track"><span class="sc-fill" style="width:98%"></span></span>
  <span class="val">98%</span>
</div>
```

Two rules worth following:

1. **Make the bar match the number.** `width:98%` next to `98%`.
2. **Never put an inverted metric on a bar.** "Budget Variance <3%" against a 97%
   bar makes a reader stop and work out which direction is good. Phrase it
   positively — "Budget Adherence 97%" — so longer always means better.

Below 400px the bars are hidden and only labels and values show, so long labels
stay on one line.

### Steering Snapshot

```html
<div class="col kpi-cell">
  <div class="kpi-val"><span class="count" data-count="95">95</span><small>%</small></div>
  <div class="kpi-lbl">On-time, on-budget delivery</div>
</div>
```

`data-count` drives the count-up. The text inside is the static fallback, so
crawlers and link previews never capture a zero — keep the two in sync.

Keep labels under about 34 characters. They are clamped to two lines, and longer
strings get truncated rather than wrapped.

---

## The Portfolio Copilot

An offline keyword matcher in `assets/js/ui.js`. It makes **no network calls** —
nothing is sent anywhere, and there is no API key.

Find the `KB` array and edit the entries:

```js
var KB = [
  { k: ['ai','ml','genai'], a: 'Answer shown for AI questions…' },
  { k: ['metric','kpi'],    a: 'Answer shown for metrics questions…' }
];
```

- `k` — keywords that trigger this answer
- `a` — the reply, which may contain simple HTML such as `<b>`

`FALLBACK` is the reply when nothing matches; `GREET` is the opening message.
If you rewrite your page content, rewrite these too — a Copilot answering about
someone else's career is worse than no Copilot.

---

## Adding your own CSS

Put new rules at the **bottom of `style.css`**, or in a new stylesheet loaded
after all three existing ones.

This matters more than it looks. Same-specificity CSS is resolved by source
order, so a rule added in the middle of `style.css` can be silently overridden by
something further down and you will lose an hour wondering why. The bottom of the
file always wins.

If your rule needs to beat a media query, it must come after `responsive.css`.

---

## Breakpoints

`responsive.css` is organised by width. Add to the block that matches:

```
1400px   large desktop
1200px   desktop
992px    laptop / tablet landscape
768px    tablet
576px    mobile landscape
400px    small mobile
```

Test every change at 320px as well. It is the narrowest phone still in real use
and the first place a layout breaks.
