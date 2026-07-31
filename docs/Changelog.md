# Changelog

Semantic versioning: MAJOR.MINOR.PATCH.

---

## v1.5.0 — 2026-07-31 — Critical Bundle Regression Fix

### Fixed (Critical — All Sections Blank)
- **ES module syntax in production bundle:** Three Studio-only files (`asset-store.js`, `content-service.js`, `portfolio-data-service.js`) use `export class` ES module syntax and were incorrectly included in the main non-module bundle (`template.min.js`). The `export` keyword at the top of the concatenated bundle caused a silent parse error in the browser, preventing all JavaScript from executing. All `.reveal` elements stayed at `opacity:0`, making every section on the page invisible.
  - **Fix:** Excluded all three files from the bundle build (they belong exclusively to `studio.html` which loads them as `<script type="module">`). Bundle size reduced from ~70KB to ~49KB.

### Fixed (Resilience)
- **Scroll reveal system depended on jQuery:** The `counters.js` IntersectionObserver used jQuery `$.each` internally. If the jQuery CDN failed (offline, blocked, or slow) all `.reveal` elements would stay invisible permanently.
  - **Fix:** Rewrote the reveal observer in pure vanilla JS (`querySelectorAll` + `forEach`) with zero jQuery dependency. Count-up animations degrade gracefully if jQuery is absent.
- **CSS reveal fallback added:** Added `animation: reveal-fallback 0.7s ease 1.2s both` to all `.reveal` elements as a belt-and-suspenders failsafe — if all JavaScript fails, elements become visible via CSS after 1.9 seconds automatically.

### Changed
- Production bundle `template.min.js` rebuilt: ~49KB (was ~70KB). Starts with clean `(function(){'use strict';...` IIFE.
- `counters.js` IntersectionObserver threshold reduced from `0.15` to `0.05` and `rootMargin: '0px 0px -40px 0px'` added for earlier, more reliable reveal triggering.

---

## v1.4.0 — 2026-07-31 — Lighthouse/WCAG QA Pass

### Fixed (WCAG 2.2 AA)
- **Skip link non-functional:** Added `tabindex="-1"` to `<main id="main">` so the skip-link correctly moves keyboard focus past the navbar. Resolves WCAG 2.4.1 (Bypass Blocks).
- **btn-accent contrast failure:** All six accent palettes in dark mode produced `color: #ffffff` on mid-luminance backgrounds (3.0:1–3.2:1 for navy/emerald, 2.4:1 for gold). Added `[data-bs-theme="dark"] .btn-accent { color: #0c1a2e }` which achieves 5.43:1–7.24:1 across all palettes. Resolves WCAG 1.4.3 (Contrast Minimum).
- **SVG role="img" missing accessible name:** Pipeline diagram `<svg role="img">` had no `aria-label` or `<title>`. Added `aria-label` directly on the element. Resolves WCAG 4.1.2 (Name, Role, Value).
- **JSON-LD email field:** `"email"` value incorrectly included `mailto:` URI prefix. Schema.org `email` should be a plain address string. Fixed.

### Fixed (Performance / Best Practices)
- **Triple image preload waste:** Three simultaneous `<link rel="preload" as="image">` tags for AVIF, WebP, and JPEG of the same 34×34px profile photo caused browsers to preload all three. Reduced to single AVIF preload.
- **Srcset format selection incorrect:** `<img srcset="a.avif, b.webp, c.jpg">` does not perform format negotiation — that requires `<picture><source type>`. Replaced navbar avatar with `<picture>` element with typed `<source>` per format.
- **Missing favicon:** `favicon.svg` was referenced but not present, causing a 404 in the browser console and a Lighthouse Best Practices failure. Created minimal `favicon.svg` with SK monogram.
- **Apple touch icon SVG:** iOS ignores SVG for home-screen icons. Changed `<link rel="apple-touch-icon">` to reference `assets/images/profile.jpg`.
- **Stagger class injection caused flash-of-invisible-content:** `main.js` was adding `.stagger` to rows at DOMContentLoaded; since scripts are `defer`, elements were already painted at `opacity:1` and then flashed to `opacity:0` when the class was added. Removed runtime stagger injection (the CSS utility remains available for direct HTML use).

### Fixed (CSS Robustness)
- Added `@media (prefers-reduced-motion: reduce) { body.page-ready { animation: none } }` as a CSS fallback guard for the page-fade animation, in case the customizer JS has not yet run.

### Added
- `docs/ReleaseQA.md` — full Lighthouse/WCAG audit matrix for marketplace submission, covering all 40+ WCAG 2.2 AA criteria, performance checklist, SEO checklist, best practices checklist, and marketplace submission checklist.
- `favicon.svg` — minimal executive monogram favicon.

### Changed
- Production bundles rebuilt after all source changes: `template.min.css` (~62KB), `template.min.js` (~70KB).

---

## v1.3.0 — 2026-07-30

### Added
- Eight executive homepage presets in `customizer.js`:
  CEO, CTO, CIO, Program Director, Delivery Manager, Engineering Manager, Product Leader, Consultant.
- Visual layout builder in the on-page customizer:
  drag/drop ordering, section visibility toggles, layout reset, config export/import.
- Studio enhancements:
  - demo profile/content-pack import (`assets/data/demo-profiles.json`)
  - layout configuration export/import
  - dedicated layout-builder step in the wizard
- New [component-catalog.html](</D:/My Portfolio Website/component-catalog.html>) showcasing reusable UI components.
- New docs:
  - [UpgradeGuide.md](</D:/My Portfolio Website/docs/UpgradeGuide.md>)
  - [BestPractices.md](</D:/My Portfolio Website/docs/BestPractices.md>)

### Changed
- Refactored Studio preview rendering to remove duplicated branch logic and improve maintainability.
- Added staggered motion utility classes, skeleton loading states, and reduced-motion-safe fallbacks.
- Updated customizer storage key to `pf-theme-customizer-v2`.

### Notes
- This release is additive and preserves existing visual identity and content architecture.

---

## v1.2.0 — 2026-07-30

### Added
- Design-system expansion in `assets/css/variables.css`: typography, spacing, radii, shadow and motion tokens.
- `assets/js/components.js` reusable component registry for hero, KPI cards, timeline, experience, success stories, testimonials, recognition, contact and footer.
- `assets/js/customizer.js` complete theme customizer with persisted preferences:
  - multiple accent palettes + custom accent colors
  - light/dark mode
  - font pairing
  - border radius
  - animation intensity
  - three homepage presets (Executive Leader, Program & Delivery Manager, Engineering Leader)
- `docs/ComponentGuide.md`.

### Changed
- `index.html` now includes component landmarks (`data-component`), stronger section labeling (`aria-labelledby`), deferred scripts, profile image preload, and enhanced Twitter metadata.
- `navigation.js` now respects reduced-motion mode for smooth scrolling.
- `ui.js` decouples contact-form binding from Copilot availability.

### SEO / crawler updates
- Improved `robots.txt` with explicit exclusions for template-internal pages (`studio`, `dev`, `tests`) and host directive.
- Updated sitemap frequency for the root URL.

### Notes
- This release prioritizes architecture, extensibility, and accessibility without removing any shipped features.

---

## v1.1.0 — 2026-07-30

### Added
- **`--accent-rgb`**, a channel-form accent variable. 18 `rgba(79,140,255,X)`
  literals throughout `style.css` were hardcoded to the default blue, so the
  palette switch changed almost nothing visible. They now read
  `rgba(var(--accent-rgb),X)` and follow the palette. The primary CTA gradient
  was hardcoded too and is now laid over `var(--accent)`.
- **Six-palette theme system.** `navy`, `corporate`, `emerald`, `executive`,
  `purple`, `charcoal` — defined in `variables.css` and selected with a
  `data-palette` attribute. Palettes only redefine `--accent` and `--accent-2`,
  so they compose with both light and dark mode.
- **One-click palette picker** in the navbar (`assets/js/palette.js`). Choice
  persists in `localStorage`, exposes `aria-pressed`, supports arrow-key
  navigation, and offers a small API (`PortfolioPalette.set/get/available`).
- **Section toggles.** `config.sections` switches any of the eight sections off;
  `main.js` removes the section from the DOM *and* drops its navbar link.
  Removal rather than hiding, so no empty landmarks are announced.
- **`config.demo.js`** — a fictional profile (John Anderson) for demos and
  listing screenshots, with an explicit note that it does not replace page prose.
- **Accessibility**: skip-to-content link as the first tab stop, a `<main>`
  landmark wrapping all sections, and a `:focus-visible` ring on every
  interactive element with a light variant inside dark panels.
- `docs/ThemeGuide.md` and `docs/FAQ.md`.

### Changed
- Navbar collapses at 1200px (`navbar-expand-xl`) rather than 992px.
- `config.js` gains `theme.palette`, `theme.showPalettePicker` and `sections`.

### Fixed
- **Navbar overflowed its container by 22px between 992px and 1199px.** This
  pre-dated v1.1.0 — verified against v1.0.1 — and was caused by seven inline
  links plus the toggle and CTA. Moving the collapse breakpoint fixes it at the
  cause rather than shrinking type to disguise it.

### Verified
- 22 functional checks: skip link position/visibility/focus ring/jump, `<main>`
  landmark, six distinct palettes, palette persistence across reload, palette in
  light mode, keyboard navigation of the picker, section removal from DOM and
  navbar, sibling sections intact, demo config application. All pass.
- Layout invariants clean at 16 widths from 320px to 1920px: no ribbon clipping,
  KPI labels within two lines, no clipped buttons, scorecard bars present, CTA
  row flush at 0px, no navbar overflow, no horizontal scroll, no console errors.
- Every JS module passes `node --check`.

### Known cosmetic change
- The primary CTA gradient shifts very slightly on the default palette:
  `rgb(63,131,247) -> rgb(42,106,228)` becomes
  `rgb(74,132,240) -> rgb(63,112,204)`. The original was a hand-picked pair of
  blues that cannot be reproduced as an overlay on `var(--accent)`, so following
  the palette costs a barely perceptible shift. Revert by restoring the literal
  gradient in `style.css` — the button then stops responding to the palette.
- Panel surfaces and borders (the deep navy of the scorecard and snapshot) stay
  navy under every palette. They are the surface identity rather than the
  accent; changing them with the accent made the darker palettes muddy.

### Not done, and why
These were requested but are not honest one-pass work:

- **JSON-driven content** and **fully config-driven sections** — a v2.0 rewrite.
  Shipping half a data layer is worse than shipping none: buyers would edit two
  places and never be sure which wins.
- **Role-specific editions** (Developer, CTO, Product Manager) — these are
  content and copywriting variants, not code. The palette system and section
  toggles are the mechanism they need; the wording is yours to write.
- **Lighthouse 95+/100/100/100** — cannot be measured in this environment, so
  claiming a score would be invented. The two real wins are documented with
  measured byte counts in the README instead.

---

## v1.0.1 — 2026-07-30

### Fixed
- **Executive Scorecard bars were hidden on phones under 400px.** An earlier
  rule set `.sc-track{display:none}` at that width because the label, bar and
  value could not share a single line — which removed the panel's only visual
  signal on the devices most visitors use. The row now wraps instead: label and
  value on line one, the bar full-width beneath. Verified at 320 / 360 / 375 /
  390 / 400 / 401 / 430 / 576px — bars render at every width, fill widths stay
  proportional to their values, and no label clips.

---

## v1.0.0 — 2026-07-30

First packaged release. Converted from a single 154 KB HTML file into a
distributable template.

### Added
- `assets/js/config.js` — central configuration for identity, contact details,
  links, theme colours and six feature switches
- `assets/js/main.js` — applies the config to the DOM at load, defensively
  (missing elements are skipped rather than throwing)
- `docs/Installation.md`, `docs/Customization.md`, this changelog
- `README.md` with folder structure, browser support and honest payload figures
- `robots.txt`, `sitemap.xml`, `site.webmanifest`
- `LICENSE.txt` with three usage tiers
- Subresource Integrity hashes on all four CDN dependencies

### Changed
- CSS extracted from three inline `<style>` blocks into
  `variables.css` (design tokens), `style.css` (components) and
  `responsive.css` (all media queries)
- JavaScript extracted from two inline `<script>` blocks into
  `theme.js`, `navigation.js`, `counters.js` and `ui.js`
- Profile photo extracted from an inline base64 data URI to
  `assets/images/profile.jpg`, so it can be replaced without editing HTML

### Fixed
- **40 dead CSS declarations removed.** Separating media queries into their own
  stylesheet exposed declarations that had never applied: they were overridden by
  later non-media rules in the original single-file cascade. Left in place they
  would have started winning once `responsive.css` moved to the end and changed
  the design. Verified by comparing 20,592 computed values (40 selectors × 39
  properties × 6 widths × 2 themes) before and after — **zero differences.**

### Verified
- Rendering identical to the pre-refactor single file across
  1600 / 1300 / 1100 / 900 / 500 / 375px in both light and dark themes
- All nine interactive behaviours re-tested after the JS split: theme toggle,
  scroll reveals, KPI count-up, active-nav highlighting, scroll progress,
  Copilot open, Copilot answer, config application, photo loading
- Every JS module passes `node --check`
- No console errors at any tested width

### Known limitations
- `ui.js` bundles four behaviours (scroll progress, ticker, rotator, tilt,
  Copilot, contact form) in one IIFE. They share a `prefers-reduced-motion`
  flag and the Copilot block uses an early `return`, so splitting them needs
  that scope untangled first. Planned for v1.1.
- Page prose lives in `index.html`, not `config.js`. Full content-driven
  rendering is a v2.0 goal.
- A latent bug inherited from the source: because of the early `return` in the
  Copilot block, deleting `#copilotFab` or `#copilotPanel` from the HTML also
  stops the contact-form handler from binding. Remove the Copilot markup only
  together with its code, or leave the elements in place and hide them.

---

## Planned

### v1.1
- Split `ui.js` into `scroll.js`, `animations.js`, `copilot.js`, `contact.js`
- Fix the early-return coupling described above
- Replace 52 icon-font glyphs with inline SVG (about −190 KB)
- Optional minified builds alongside the readable source

### v1.2
- Remove the jQuery dependency (26 call sites, all trivial) — about −88 KB
- Self-hosted font subset, dropping the Google Fonts request

### v2.0
- Content moved to a JSON data file with a small template renderer
- Section visibility and ordering driven from `config.js`
- Additional editions: Developer, Delivery Manager, Engineering Director
