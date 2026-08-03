# CLAUDE.md — Persistent Memory

This file acts as persistent memory across sessions. It is updated after every code change, refactor, or debugging task to keep track of architectural decisions, current work, and outstanding questions.

> Ported from `.github/copilot-instructions.md`. Both files are kept in sync — when you update one, mirror the change into the other so Copilot and Claude Code share the same memory.

## Project

Static executive portfolio site (`surajkumarnavodya/executive-portfolio-template`). Entry point is `index.html`; content lives in `assets/js/config.js`; a Studio customizer (`studio.html`) drives section presets.

## Architectural Constraints

- **Static site only.** `index.html` + `assets/js/*.js` + `assets/css/*.css`. No build tool, no `package.json`, no test runner in the repo.
- **The dist bundle is hand-maintained.** `assets/dist/js/template.min.js` is a manual concatenation of `components.js` + `main.js` (+ `customizer.js` and others). `index.html` only loads two scripts directly:
  - `assets/js/config.js`
  - `assets/dist/js/template.min.js`

  So **any change to a source JS file must be mirrored into the dist bundle in the same pass**, or it will not take effect on the live page.
- **`assets/js/config.js` is the single file end users are meant to edit.** `assets/js/main.js` applies it to the DOM defensively — missing elements are skipped, never throws.
- **`assets/js/components.js` exposes `window.PortfolioComponents`** (`render` / `renderMany`), the registry used by the Studio customizer presets. Extend an existing component rather than inventing a new mechanism.
- **`SECTION_IDS` in `main.js`** maps a config `sections.<key>` toggle to a DOM section id. A new section needs an entry here, or `sections.<key> = false` will not remove it or its nav link.
- **`DEFAULT_SECTION_ORDER` in `assets/js/customizer.js`** must list every section, in the same order as the markup in `index.html`.
- Static fallback copy in `index.html` should match the config copy in tone, so first paint (pre-JS) and SEO crawlers see the same message.

## Conventions

- Minimal-change principle: don't refactor beyond the request; dead CSS left by a markup removal may be left as a harmless no-op unless a cleanup is asked for.
- Reuse existing classes (`sec-title`, `lede`, `x-card`, `pov-label`, `kpi-board`, `cta-secondary`) before adding new CSS.
- Validation is manual: run diagnostics (`get_errors` / IDE Error List), then grep to confirm exactly one `<section id="...">` per id, no duplicate ids, no orphaned selectors, and the intended section order.

## Checklist for adding or changing a section

1. `assets/js/config.js` — data block + `sections.<key>` toggle, with inline docs.
2. `index.html` — markup (`<section id="..." data-component="...">`) + navbar link.
3. `assets/js/components.js` — component renderer consuming the payload shape.
4. `assets/js/main.js` — `window.PortfolioComponents.render('<key>', cfg.<key>)` + `SECTION_IDS` entry.
5. `assets/js/customizer.js` — add to `DEFAULT_SECTION_ORDER`.
6. `assets/dist/js/template.min.js` — mirror steps 3–5.
7. Validate (diagnostics + grep), then update this file and `.github/copilot-instructions.md`.

---

## Session Log

### 2026-08-01 — Nav order pinned to About / Experience / Leadership / Success Stories / Expertise / Proof

Changed in two places, because the markup alone does not decide nav order:

  - `home.html` - the Expertise dropdown `<li>` moved to sit after Success
    Stories, so the pre-JS paint and crawlers see the intended sequence.
  - `DEFAULT_NAV_ORDER` in `customizer.js` (mirrored into the dist bundle) -
    `['about','experience','leadership','success-stories','expertise','recognition']`.
    This runs on load and re-appends the `<li>`s, so it would have reshuffled
    the nav back if only the markup had been edited.

Markup order and post-reorder order are now identical, so there is no visible
jump on load. Dropdowns are matched by their first member id, hence
'expertise' (Capabilities) and 'recognition' (Proof).

CAVEAT - the one case where the order still differs. When `state.sectionOrder`
no longer equals `DEFAULT_SECTION_ORDER` (the visitor dragged the layout in
the Studio customizer, or imported a config), the nav deliberately follows
`state.sectionOrder` instead of `DEFAULT_NAV_ORDER`, and that array starts
`['about','leadership','experience',...]` - so Leadership and Experience swap.
That is existing designed behaviour of the layout builder and was left intact.
To hard-pin the nav regardless, line ~241 of customizer.js becomes:

    var navOrderSource = DEFAULT_NAV_ORDER;

but that also removes the layout builder's ability to re-sequence the nav.

No CSS changed: the reorder only moves an existing `<li>`, so the same rules
match. Verified by regenerating the critical CSS - byte-identical, so the
inlined block in `home.html` did not need updating.

### 2026-08-01 — Fix (2 of 2): dropdown flashed open then closed on click

Follow-up to the collapse fix. The remaining cause was the hover-open block.

`fineHover` was evaluated ONCE at load and tested only pointer type, never
viewport width. So on any hover-capable device - including a desktop window
resized narrow, which is how mobile usually gets tested - the sequence was:

  1. pointer enters the .nav-item.dropdown  -> 60ms -> dropdown.show()
  2. user clicks the toggle -> Bootstrap sees .show -> toggles it CLOSED

The menu appeared to flash open and vanish, with no way to reach a child link.

Two changes:

  - The gate is now `(hover:hover) and (pointer:fine) and (min-width:1200px)`,
    matching navbar-expand-xl (responsive.css uses max-width:1199.98px). It is
    evaluated INSIDE each handler, not once at load, so resizing across the
    breakpoint switches modes immediately instead of stranding whichever mode
    was true at load.
  - A capture-phase click listener on the toggle swallows the click while the
    menu is already open in hover mode, so hover keeps sole control of it.
    Capture is required because Bootstrap listens on document during bubble.
    No-op in click mode; keyboard unaffected (Enter fires with the menu
    closed, so it passes through).

Verified by replaying the real handler logic against a jsdom nav with a
Bootstrap-like document toggle: desktop/narrow/tablet with a mouse all ended
CLOSED before and OPEN after; touch was correct throughout.

Mirrored into `assets/dist/js/template.min.js`. No CSS changed.

### 2026-08-01 — Fix: mobile child (dropdown) menus were unusable

`navigation.js` "collapse mobile nav on link click" bound to
`.navbar .nav-link`, which also matches `.nav-link.dropdown-toggle`
("Expertise", "Proof"). Below the XL breakpoint, tapping a toggle let
Bootstrap open the submenu and then immediately collapsed `#nav`, so the
child menu was never usable on touch.

Selector is now `.navbar .nav-link:not(.dropdown-toggle)`. The child links
themselves still close the nav via the `.dropdown-item` part of the selector,
so tap-through behaviour is unchanged. Desktop is unaffected: the hover-open
path is gated on `(hover:hover) and (pointer:fine)`.

Note the stale comment this corrected — it claimed the mobile menu "is already
expanded inline (see responsive.css)". It is not: responsive.css only sets
`position:static` on `.dropdown-menu`, so Bootstrap's `display:none` still
applies until `.show` is added, and the toggle tap really is required.

Mirrored into `assets/dist/js/template.min.js` (line ~1271) in the same pass,
per the hand-maintained-bundle rule. No CSS changed, so the inlined critical
block in `home.html` did not need regenerating.

Latent issue left alone (out of scope): the same handler calls
`bootstrap.Collapse.getInstance(nav).hide()` with no null guard, which throws
if no Collapse instance exists yet. `getOrCreateInstance` would be safer.

### 2026-08-01 — Front-end performance pass (assets, critical CSS, dead CSS)

**CSS bundle composition changed — read this before regenerating the bundle.**
`assets/dist/css/template.min.css` is now `variables.css + style.css +
responsive.css`. **`studio.css` is no longer bundled.** `studio.html` loads
`variables.css`/`style.css`/`studio.css` directly, and the only two pages that
consume the bundle (`home.html`, `component-catalog.html`) reference zero
`.studio-*` / `.preview-*` classes, so it was ~8.8 KB shipped to every visitor
for nothing. Bundle went 118,914 → 108,875 b (27.6 KB gzip).

**`home.html` now inlines critical CSS.** The first-viewport rules (telemetry
bar + fixed navbar + `header.hero`) are inlined in `<style id="critical-css">`
(35 KB raw / 7.7 KB gzip) and the full bundle loads via
`<link rel="preload" as="style" onload="this.rel='stylesheet'">` with a
`<noscript>` fallback.

Two constraints on that block:
- It **must stay after** the Bootstrap and Bootstrap Icons `<link>`s. The
  template bundle previously loaded last and won the cascade; moving the inline
  copy above Bootstrap lets Bootstrap override it until the async bundle lands.
- It is **generated, not hand-edited**. Regenerate it whenever the bundle
  changes, otherwise the first paint silently drifts from the real stylesheet.

**Dead CSS removed from `style.css`** after a production audit (12 rules + 1
orphaned keyframes):
- `.pulse` / `.pulse::after` — markup uses `.node-pulse`; bare `.pulse` matched nothing.
- `.stagger > *` + four `nth-child` rules + its reduced-motion override, and the
  now-orphaned `@keyframes stagger-in`.
- `.c-form input/textarea` (+ `:focus`) and `.cf-note` — leftovers of a removed contact form.
- `.executive-ribbon strong` — the ribbon markup uses `<b>`.

`@keyframes pulse` was **kept** — `.copilot-head .dot::after` still animates with it.

Deliberately **not** removed: `.form-control`, `.form-select`, `.form-label`,
`.invalid-feedback`. No form ships today, but these are the themed surface a
buyer inherits when they add one and `config.js` still calls the contact section
a "contact form".

**Audit caveat for anyone re-running a purge here.** A naive PurgeCSS-style pass
reports ~89 unused rules and is *wrong*: it deletes every
`[data-bs-theme="light"]` rule (the document ships `data-bs-theme="dark"`, so
light-theme rules only ever activate via `theme.js`) and, if the token scanner
parses JS string literals rather than whole files, also `.cmsg` and
`.customizer-*` (quote pairing desyncs on apostrophes inside comments). Any
purge must safelist runtime-controlled attributes (`data-bs-theme`,
`data-motion`, `data-palette`), runtime body classes (`nav-condensed`,
`tele-hide`), and third-party injected classes (`goog-*`).

**Images.** Nothing meaningful left to convert — the only served raster is the
navbar avatar, already AVIF/WebP/JPG via `<picture>`. `screenshots/*.png` are
documentation assets (excluded from the site by
`portfolio-data-service.js:406`); WebP + AVIF siblings were generated (1965K →
323K) and the PNGs retained for marketplace listings. `profile.jpg` must stay as
the `<picture>` fallback and `apple-touch-icon`.

**`loading="lazy"`: nothing eligible.** No iframes anywhere; the single `<img>`
is the above-the-fold avatar carrying `fetchpriority="high"`, where lazy loading
would be actively harmful.

**Fonts.** Already optimal — the Google Fonts request carries `&display=swap`
for all five families and both font hosts are preconnected. Added a preconnect
for `cdn.jsdelivr.net` (Bootstrap CSS, Bootstrap Icons CSS and the icon webfont
all originate there, and the font is a third hop only discovered after its
stylesheet parses). Bootstrap Icons ships `font-display: block` and was left
alone: `swap` on an icon font flashes fallback letterforms, and overriding it
requires re-declaring `@font-face` with the exact hashed CDN URL, which breaks
every icon if that hash moves.

**Open item.** Bootstrap CSS is still render-blocking, and the above-the-fold
markup depends on 41 Bootstrap classes (grid, navbar, dropdown, flex utilities),
so first paint still waits on the CDN. Self-hosting a subsetted Bootstrap is the
next meaningful win and was out of scope for this pass.

### TL;DR — 2026-08-01 (high-level summary of the day)

Full narrative detail is in the entries below; this is the condensed version.

**Committed** (`6f0a7e0`): executive content pass + homepage restructure (config-driven hero copy, new About/Insights sections, trust-signal fixes), and a dist-bundle regression fix (a JS syntax error had silently disabled theme toggle/customizer/nav/count-up sitewide) plus restored broken CTA links and the Executive Scorecard panel.

**Uncommitted** (13 modified files + new `assets/js/i18n.js` — all still sitting in the working tree, not yet checked in):
- Hero-right layout fix — KPI board/Steering Snapshot gap redistribution.
- Nav polish — hover-to-open dropdowns, a WCAG contrast fix on the active preset chip, larger Steering Snapshot cell padding.
- i18n / translate feature wired up end-to-end (Google Website Translator integration: config block, mount point, CSS, a non-bubbling-event bug fix) — new file `assets/js/i18n.js`.
- Removed the navbar's scroll-triggered "smart-hide" — it read as the menu randomly vanishing; now it only condenses.
- One pass fixing four reported bugs: Portfolio Copilot mis-answering (stray empty keyword string), a dead "Start a conversation" floating CTA, mis-highlighting scroll-spy, and dropdown `<li>`s not participating in nav reordering.
- i18n "translates on the second click, not the first" bug — fixed a race where Google's `<select>` options weren't populated yet.
- Decoupled default nav link order from page section order (new `DEFAULT_NAV_ORDER`), so the nav can be sequenced independently of content flow.
- Phase 1 of an 85-item design-system backlog: typeface swap (Instrument Serif → Fraunces) with a deliberate heading-weight hierarchy, one restrained new "signature gold" accent token, consolidated button hover motion; spacing and theme-persistence audited and left as-is.
- Hero headline rewrite (fixed "I own enterprise delivery —" line + 4 short rotating phrases) plus a real height-stability fix for the rotator, and — found while verifying it — a `background-clip:text` gradient bleed bug where every rotator phrase's text (including the hidden ones) was ghosting through simultaneously.

**Not yet committed** — worth a checkpoint commit before further work; Phase 2 (data-driven JSON content rewrite) is planned next.

### Hero: premium executive copy, made config-driven
Redesigned the hero (`index.html` `#top`) to read as a premium executive brand (who/what/value prop), and made the entire hero configurable from `config.js` without editing HTML structure.

- `assets/js/components.js` — extended the `hero` renderer to also populate `eyebrow`, `headlinePrefix`, `stats[]`, `highlights[]`, `secondaryCtas[]` (previously only `heroPhrases`/`valueStatement`/`lede`/`primaryCta`).
- `assets/js/main.js` — added `render('hero', cfg.hero)` right after the identity block.
- `assets/js/config.js` — added the `hero: {...}` block with inline docs per field.
- `index.html` — updated the hero's static fallback copy to match the new wording; no structural/class changes.
- `assets/dist/js/template.min.js` — mirrored the renderer changes and the render call.

### Section-order pass
Reordered to an executive-credibility flow: Hero → Leadership → Success Stories → Experience → Expertise → AI Leadership → Recognition → Testimonials → Contact. Updated navbar links and `DEFAULT_SECTION_ORDER` (source + dist).

### Trust-signal audit
Found: certifications listed as plain text with no way to verify; outbound identity links missing `rel="me"`; testimonials lean on a peer + "Early Career Recruiter" quote rather than a named senior sponsor.

- `index.html` — added a verification line under Recognition → Certifications linking to the LinkedIn certifications tab (`rel="noopener me"`); added `rel="me"` to the footer LinkedIn / C# Corner / Stack Overflow links so they match the `Person` structured-data `sameAs` list.

**Open:** the commented-out featured sponsor-quote slot (~line 806 of `index.html`) is ready to uncomment once real content/permission exists. Consider per-certification verification links (Credly, PMI IDs) instead of one blanket LinkedIn link.

### Executive About section
Added a config-driven `#about` section between Hero and Leadership — positioning statement, 3 narrative paragraphs, 3 pillar cards, credentials line. (Leadership only covered capability pillars, not a personal bio.)

- `config.js` — `about: {...}` block + `sections.about: true`.
- `index.html` — `<section id="about" data-component="about">` after `<main>`, reusing existing classes; added an About navbar link.
- `components.js` — `about` renderer.
- `main.js` — `render('about', cfg.about)` + the missing `about: 'about'` `SECTION_IDS` entry.
- `customizer.js` — `'about'` added to the front of `DEFAULT_SECTION_ORDER`.
- dist bundle — all of the above mirrored.

### Hero headline tone variants
Three brand-voice variants — `authoritative`, `modern`, `refined` — selectable via a single `hero.activeTone` flag, no HTML change needed.

- `config.js` — `hero.activeTone` (empty string = base fields) + `hero.toneVariants.{authoritative,modern,refined}`, each overriding only `eyebrow`/`headlinePrefix`/`rotatorPhrases`/`valueStatement`.
- `components.js` — the `hero` renderer merges `payload.toneVariants[payload.activeTone]` over the base payload, falling back silently if `activeTone` is empty/unknown.
- dist bundle — tone-merge logic mirrored.

**Open:** check contrast/line-wrap on mobile per tone — rotator phrase lengths differ.

### Personal-brand content strategy
Added a "Currently" status line in About (`#about-currently`) and a config-driven Insights section (`#insights`) with POV cards linking to published C# Corner articles and Stack Overflow answers.

Final order: Hero → About → Leadership → Experience → Success Stories → Expertise → AI Leadership → Recognition → Insights → Testimonials → Contact. Rationale: Leadership → Experience → Success Stories forms an unbroken capability→career→outcome proof chain; Expertise/AI Leadership build differentiation; Recognition adds external validation; Insights (public voice) and Testimonials (others' voices) are the final trust-builders before Contact.

- `index.html` — `#about-currently` line; Experience moved to follow Leadership; Insights relocated to just before Testimonials; navbar order updated.
- `config.js` — `sections.insights: true` + `insights: { title }` (title only is data-driven; cards stay SEO-visible static HTML).
- `components.js` — `insights` renderer (title-only override, same pattern as `success-stories`/`recognition`).
- `main.js` — `insights` render hook + `SECTION_IDS` entry.
- `customizer.js` — `DEFAULT_SECTION_ORDER` = `['about','leadership','experience','success-stories','expertise','ai-leadership','recognition','insights','testimonials','contact']`.
- dist bundle — all mirrored.

**Open:** verify the new order on mobile (Experience right after Leadership can be tall) and confirm anchor scrolling still lands correctly for all nav links.

### Visual clutter audit (most recent)
The hero's right column stacked TWO dashboards — an "Executive Scorecard" (7 progress-bar rows) and a "Steering Snapshot" KPI board (6 cells) — with near-duplicate numbers also repeated in the left-column stats/highlights (e.g. "98% Delivery Excellence" appeared three times). The domain-tag strip had 9 tags in one unbroken row, and the CTA row had 4 competing buttons above the fold.

- `index.html` — removed the entire `.exec-scorecard` panel (its `data-component="kpi-cards"` was vestigial; only `#impact`/`.kpi-board` was ever wired to a renderer), keeping Steering Snapshot as the sole dashboard; trimmed domain tags from 9 to the 5 most senior-relevant (HR, Healthcare, BFSI, Construction, MIS); removed "Download Resume" from the hero CTA row (still reachable from Contact at `.cta-secondary`), leaving primary CTA + "Case studies" + LinkedIn icon.
- `config.js` — `hero.secondaryCtas` reduced to a single entry (`Case studies`).
- No `components.js`/`main.js`/dist changes needed — the `hero` and `kpi-cards` renderers operate generically on whatever markup/config exists. Dead `.exec-scorecard`/`.sc-*` rules remain in `assets/css/responsive.css` as harmless no-ops, left alone per the minimal-change principle.

**Open:** visually verify the hero on desktop/mobile — the KPI board should read as one clear "Steering Snapshot" and the CTA row shouldn't wrap awkwardly on small viewports. Optional: strip the dead `.exec-scorecard`/`.sc-*` CSS in a future hygiene pass.

### Regression fix pass — dist bundle corruption, broken CTAs, scorecard restored
User reported theme toggle and colour customization broken, oversized Steering Snapshot spacing, the Executive Scorecard missing (wanted back), and CTA buttons rendering as plain text.

- **Root cause 1:** `assets/dist/js/template.min.js` had a hard JS syntax error (confirmed with `node -c`) — missing the `kpi-cards`, `timeline`, `experience`, `recognition`, `contact`, `footer` component renderers, and a truncated `main.js` section-visibility loop. Since the bundle never parsed, *nothing* in `customizer.js`/`palette.js`/`theme.js`/`navigation.js`/`ui.js` ever ran in the browser — only the CSS-only `.reveal` fallback kept the page from looking fully blank. This is the same failure class as `docs/Changelog.md` v1.5.0 ("Critical Bundle Regression Fix"), recurred.
- **Root cause 2:** three `<a>` anchors in `index.html` (hero primary CTA, Contact "Schedule an Executive Conversation", Contact "Download my résumé") were missing their opening `<a class="btn-accent...">`/`<a class="btn-outline...">` tags — confirmed via `git diff` against the last commit (`addfc6a`). Also explains why the hero renderer's `.hero-cta .btn-accent` target silently found nothing.
- **Fixes applied:**
  - `assets/dist/js/template.min.js` — rebuilt clean from all 9 real runtime source files (`components.js`, `counters.js`, `customizer.js`, `main.js`, `navigation.js`, `palette.js`, `renderer.js`, `theme.js`, `ui.js`), excluding the Studio-only `export class`/`export function` files. Verified with `node -c`.
  - `assets/dist/css/template.min.css` — rebuilt from `variables.css` + `style.css` + `responsive.css` + `studio.css` (same composition as before).
  - `index.html` — restored the 3 broken CTA anchors; re-inserted the 7-row Executive Scorecard into the hero's right column above the Steering Snapshot (verbatim from `git show HEAD:index.html`, minus its inert duplicate `data-component="kpi-cards"` attribute).
  - `assets/css/style.css` — added one consolidated `.kpi-board`/`.kpi-cell`/`.kpi-icon`/`.kpi-val`/`.kpi-lbl` size-correction block at the end of the file (the file's documented "ADD NEW OVERRIDES BELOW THIS LINE" zone), since the oversized spacing was several earlier override passes each nudging padding/icon size *up* with no cleanup.

**Open:** visually verify theme toggle, palette picker, homepage presets, the drag/drop layout builder, hero rotator, KPI count-up, and the Portfolio Copilot in a browser — all depend on the bundle that was broken. Going forward, `node -c assets/dist/js/template.min.js` after any dist edit would catch this class of bug immediately. Git HEAD (`addfc6a`) is now far behind the working tree (10+ files) — consider committing.

### Browser verification of the regression fix pass, and a follow-on hero-right gap fix
Actually loaded `index.html` in a browser (Playwright, headless) to verify the regression fix pass above — confirmed clean: no console errors, theme toggle flips `data-bs-theme`, palette swatches flip `data-palette`, Executive Scorecard renders, and the hero-right column's bottom edge lines up exactly with the hero CTA row's bottom edge (`align-items:stretch` on `.hero > .container > .row` plus the column being a flex column guarantees this regardless of content height).

However, the `justify-content:space-between` change from the previous pass (`assets/css/responsive.css`, `@media (min-width:992px)`) dumped 100% of the leftover column height into one gap between Executive Scorecard and Steering Snapshot — measured at 113.6px, which read as the Steering Snapshot card being visibly "sunk" below the scorecard, confirmed against a user screenshot.

- `assets/css/responsive.css` (+ mirrored in `assets/dist/css/template.min.css`) — replaced `justify-content:space-between` / `.kpi-board{flex:0 0 auto}` with a fixed `gap:20px` on `.hero-right` plus `.kpi-board{flex:1 1 auto}` and `.kpi-board>.row{flex:1 1 auto;align-content:center}`. The KPI board still grows to fill the column (bottom stays pinned to the CTA row level — verified 830.66px both sides at 1440px width), but the growth is absorbed by centering the cell grid within the board rather than by an external dead gap, and cells keep their natural size instead of stretching apart (avoiding a repeat of the original "oversized Steering Snapshot" complaint).

**Open:** re-verify at narrower desktop widths (992–1200px) and confirm the 20px gap still reads well once real (non-placeholder) Executive Scorecard content is in place. `assets/js/navigation.js` / `assets/dist/js/template.min.js` also carry an uncommitted hover-to-open dropdown change and `assets/css/style.css` an uncommitted preset-chip contrast fix from a separate session — unrelated to this fix, left as-is.

### Dropdown-on-hover, active preset-chip contrast, and Steering Snapshot cell sizing
Landed the hover-to-open dropdown and preset-chip contrast fix mentioned above (they were already sitting uncommitted in the working tree): `assets/js/navigation.js` now opens `.navbar .nav-item.dropdown` on `mouseenter` via `bootstrap.Dropdown.getOrCreateInstance(...).show()/.hide()` (60ms open / 200ms close delay), gated to `(hover:hover) and (pointer:fine)` so touch/mobile keeps click-to-expand. Verified with a real (stepped) Playwright mouse move — a single-jump `mouse.move()` does not reliably synthesize `:hover` in Chromium, needs `{steps: N}`.

Also chased a "dark mode button text not appearing" report through an exhaustive Playwright contrast/hover audit (87+ elements, both themes, resting + hover states, desktop + mobile + `studio.html`) and found **zero reproducible contrast failures** on the current code — one false alarm came from my own test harness racing page load (`domcontentloaded` + fixed timeout isn't enough; use `waitUntil:'networkidle'`). The one real bug found: `.preset-chip[aria-pressed="true"]` in the Template Customizer used `color:var(--accent)` on a near-white surface in light mode (3.22:1, fails the 4.5:1 AA minimum for 12px text) — fixed in `assets/css/style.css` by filling the chip with `background:var(--accent)` + `color:#0c1a2e` (the same dark-navy-on-accent token already proven across all 6 palettes for `.btn-accent`).

User then shared a screenshot of the Steering Snapshot asking to "increase the margin and padding of the inner box to fill entire div" — the `.kpi-cell` sizing from the earlier regression-fix pass (padding 9px 10px, min-height 60px, 34px icon) read as too cramped once the hero-right flex layout was fixed to grow properly. Bumped it: `.kpi-board{padding:16px 18px}`, `.kpi-cell{padding:16px 14px;gap:12px;min-height:82px}`, `.kpi-icon{width:40px;height:40px;font-size:18px}`, `.kpi-val{font-size:clamp(18px,1.9vw,22px)}`, `.kpi-lbl{font-size:11.5px;line-height:1.28}` (same block at the bottom of `assets/css/style.css`). Verified via screenshot against the user's reference image — matches well.

Both `assets/dist/js/template.min.js` and `assets/dist/css/template.min.css` rebuilt from current source after each change; `node -c` passes on the JS bundle.

**Found but not touched (at the time):** `assets/js/i18n.js` existed on disk (client-side page translation via Google's Website Translator widget, language-switch dropdown, locale-suggestion banner) and `index.html` already had the corresponding `.lang-switch`/`#langToggle`/`#langMenu` navbar markup — but nothing wired it up. No memory-log record of who/when started this. Flagged to the user, who then asked for it to be finished.

### Wired up the i18n / translate feature
Completed the integration `i18n.js` was missing:
- `assets/js/config.js` — added an `i18n: { enabled, suggestFromBrowserLocale, languages[] }` block (documented inline like every other config section), matching `i18n.js`'s own built-in language-list default so config and code agree.
- `assets/js/i18n.js` — when `cfg.enabled === false`, now removes `.lang-switch` from the DOM (matching the "removing beats hiding" convention `main.js` already uses for `features.*` toggles) instead of leaving a dead button. Also fixed a real bug: `combo.dispatchEvent(new Event('change'))` used a non-bubbling event, and Google's widget listens for `change` via delegation higher up the DOM — so the hidden `<select>`'s value updated but translation never actually fired. Changed to `new Event('change', { bubbles: true })`.
- `index.html` — added `<div id="google_translate_element" aria-hidden="true"></div>` near the end of `<body>`, the mount point `i18n.js`'s `google.translate.TranslateElement(...)` call targets by id.
- `assets/css/style.css` — added a `LANGUAGE SWITCHER + TRANSLATE SUGGESTION BANNER` block (bottom of file, same size-correction zone): `.lang-switch`/`.lang-menu`/`.lang-item` styled to match the existing `.dropdown-menu`/`.customizer-panel` visual language; `.i18n-banner` styled to match `.copilot-panel`/`.customizer-panel` (fixed, bottom-center, dismissible, motion-safe). Also added the Google-Translate-suppression rules the file's own docblock promised but that never existed: `#google_translate_element{display:none!important}`, hiding `.goog-te-banner-frame`/`.skiptranslate>iframe`, `body{top:0!important;position:static!important}` (counters the inline `top`/`position` Google's script sets on `<body>` to make room for its banner), and `.goog-text-highlight` (suppresses the dotted-underline hover tooltip Google adds to translated words).
- Both dist bundles rebuilt — `i18n.js` added to the `template.min.js` concatenation list (after `theme.js`, before `ui.js`); `node -c` passes.

**Behaviour, by design:** page content is always authored in English (`PAGE_LANGUAGE = 'en'`) and translation only ever goes *away* from English, never to it. There is no backend on this static site, so "their region" is approximated via `navigator.language` (browser locale) rather than true IP geolocation, which would need a paid third-party service — disclosed in both `i18n.js`'s docblock and the new `config.js` comment. A visitor whose browser locale isn't English sees a one-time dismissible bottom-center banner; dismissing or picking a language is remembered in `localStorage` so it's never shown again. The navbar globe icon opens a persistent menu listing "Original (English)" plus all configured languages regardless of locale.

**Verified with Playwright:** banner correctly absent for `en-US`, correctly suggests the right language for `hi-IN`/`fr-FR`, dismiss persists across reload, language menu lists all 9 options with correct `aria-expanded` state, zero console errors in any scenario. Confirmed `translate.google.com` is reachable and clicking "Translate" does trigger real network calls to Google's translation engine for the requested language (`translate_http.tr.hi....`) and the hidden combo's value correctly becomes `hi`.

**Open / not fully verified:** in this headless, sandboxed Chromium test environment, the actual on-page text never visually swapped to Hindi within a 15s wait, despite the network activity and combo state looking correct — could not get a definitive read on whether that's a genuine remaining issue or Google's widget behaving differently under headless/automated browsing (a known characteristic of Google's translate service, which has history of degrading under bot-detection signals). The `bubbles:true` fix is a confirmed, real correctness fix either way. Recommend one manual check in a normal (non-headless) browser tab after deploying, since that's the authoritative test for third-party widget behavior that automation may not fully replicate.

### Removed navbar smart-hide-on-scroll
User reported (with a structured prompt/acceptance-criteria screenshot, but the only line that actually applied here): "when the website is scrolling down the top menu is hiding, please fix that issue." This was the "Sticky nav: condense + smart-hide" feature from the marketplace-transformation pass — `assets/js/ui.js`'s `paintNav()` added a `nav-hidden` body class on scroll-down past 220px (translating `.navbar.fixed-top` off-screen via `translateY(-100%)` in `assets/css/style.css`), reappearing on scroll-up. In practice this reads as the nav menu randomly vanishing while reading, which is what got reported as a bug.

- `assets/js/ui.js` — `paintNav()` no longer tracks scroll direction or toggles `nav-hidden`; it now only toggles `nav-condensed` (the compact/shadow "elevated" treatment past 120px), which stays as a subtler, non-disappearing effect. Removed the now-unused `lastScrollY`/`navEl`/mobile-menu-open guard that only existed to support the hide logic.
- Did **not** touch the CSS (`body.nav-hidden .navbar.fixed-top{transform:translateY(-100%)}` in `style.css`, and `body.nav-hidden .persistent-cta{...}`) — `nav-hidden` is simply never added to `<body>` anymore, so these rules are harmless dead code, left in place per the same "leave inert CSS as a no-op" convention used for `.exec-scorecard`/`.sc-*` earlier. One real side effect: `.persistent-cta` (the bottom-left floating "Start a conversation" button, added specifically as a fallback CTA for while the navbar was hidden) can now never appear, since its only trigger (`body.nav-hidden`) no longer fires. Not removed — flagged to the user as now-fully-dormant, since removing it wasn't asked for and it causes no visible issue on its own.
- `assets/dist/js/template.min.js` rebuilt; `node -c` passes.

**Verified with Playwright** on both desktop (1400×900) and mobile (390×844): scrolled down 1200px then another 1200px then back up 300px — `.navbar.fixed-top`'s bounding box stayed pinned at `y:0` throughout (never translated off-screen), `nav-condensed` class present as expected, `nav-hidden` never appears in `document.body.className`, zero console errors either viewport.

### Four bugs in one pass: Copilot wrong answers, dead persistent CTA, mis-highlighting nav, scrambled menu order
User's report (again with an unrelated generic QA-rubric block pasted alongside it — ignored, as before): "Copilot is not giving the correct output and start a conversation option is hide which was appearing at bottom left. Clicking on the menu it is highlighting to other menu. Re-order the menu with best fit what should be first like About." Four distinct, unrelated root causes, all confirmed before touching anything:

**1. Copilot answering wrong (screenshot: asked "Which certifications?", got the Mumbai/location answer).** Root cause: the location entry's keyword array in `assets/js/ui.js`'s `KB` had a stray empty string — `['location','mumbai','','relocate',...]`. In the scoring loop, `"anyword".indexOf('') === 0` is always `true` in JS, so that empty keyword silently awarded the location entry +1 for *every query word longer than 3 characters*, regardless of topic — a hidden bias strong enough to beat genuine keyword matches elsewhere. Fixed by removing the stray `''`, and hardened the scoring loop itself (`if (!k) { return; }`) so a future empty/falsy keyword can't do this again.

**2. "Start a conversation" bottom-left button gone.** This was `.persistent-cta`, previously gated on `body.nav-hidden` (a fallback CTA for while the navbar was scrolled off-screen). The earlier "navbar no longer hides" fix made `nav-hidden` permanently dead, so this button silently stopped appearing too — exactly the side effect flagged (but not fixed) in that session. Fixed in `assets/css/style.css`: retriggered on `body.nav-condensed` (the same 120px scroll threshold the navbar's own compact treatment uses) instead, so it's back as a persistent scroll companion.

**3. "Clicking on the menu it is highlighting to other menu."** Root cause in `assets/js/navigation.js`'s scroll-spy: `paintActive()` picked the *last* nav target (in nav-menu iteration order) whose offset had been scrolled past, not the one physically closest above the reading line. That's only correct if nav order matches page order — which broke when Success Stories was moved earlier on the page (in an older "personal-brand content strategy" pass) without the nav being restructured to match: navTargets ends up ordered `[...,expertise, ai-leadership, success-stories,...]` while the page is actually `[...,success-stories, expertise, ai-leadership,...]`. Scrolled anywhere in Expertise/AI Leadership, the old logic incorrectly settled on "Success Stories" since it was iterated last among all "passed" targets. Fixed by comparing every target's real page offset and keeping whichever is physically highest below the line, regardless of menu order — correct no matter how the nav is structured. Also fixed a related latent bug: the fixed 700ms post-click lock could expire before a long smooth-scroll finished, letting the spy recompute mid-flight; now unlocked precisely via the `scrollend` event where supported (`'onscrollend' in window`), with a generous 1000ms/4000ms fallback timeout depending on support.

**4. "Re-order the menu... like About."** About was already first in the raw HTML — the actual bug was that `assets/js/customizer.js`'s `applySectionLayout()` runs automatically on every load (Template Customizer is enabled by default) and reorders top-level nav `<li>`s to match `DEFAULT_SECTION_ORDER`, but only handled direct `.nav-link[href="#id"]` matches. Dropdown wrappers (Expertise, Proof) don't match that selector for any single id, so they were never repositioned — left stranded at the front while About/Leadership/Experience got individually moved to the end around them. Confirmed via a real page load: visible order was `Expertise, Proof, About, Leadership, Experience...`, contradicting the source HTML. Fixed the reorder loop to also move a dropdown's own `<li>` (once, anchored to whichever member section `sectionOrder` reaches first) when none of its items match directly — preserves the existing "don't promote individual dropdown items out of their submenu" behavior while keeping the dropdown itself in the right slot. Separately, also promoted "Success Stories" from inside the Proof dropdown to a top-level link in `index.html` (positioned right after Experience, matching its actual page position) — Proof now groups only Recognition/Insights/Testimonials, which are still-late/still-grouped "external validation" content.

All four verified together with Playwright after rebuilding both dist bundles: "Which certifications?" now returns the PMP/certifications answer; `.persistent-cta` opacity flips 0→1 on scroll; nav renders `About, Leadership, Experience, Success Stories, Expertise, Proof` (matches page order); clicking "AI Leadership" ends with `AI Leadership` (+ parent `Expertise`) active, not `Success Stories`; clicking the new top-level "Success Stories" link also highlights correctly. Zero console errors throughout.

### i18n: fixed the "translates on the second click, not the first" bug
User confirmed the exact race condition flagged as an open question in the earlier i18n integration session: picking a language (Hindi, from a fresh page load) did nothing on the first click — the second click was what actually translated. This is a definitive repro, not a headless-browser artifact.

Root cause, in `assets/js/i18n.js`'s `translateTo()`: on a cold load, Google's `<select class="goog-te-combo">` is created synchronously by the `TranslateElement` constructor, but its `<option>` list is populated a beat later. The old code checked only `if (combo) { combo.value = code; ... }` — if the combo existed but didn't yet have an `<option value="hi">`, `combo.value = 'hi'` silently no-ops (the assignment is ignored for a nonexistent option), so the dispatched `change` event fired with the value unchanged and nothing translated. By the second click, the options had finished populating, so it worked. The existing retry loop only covered "combo not found at all," not "combo found but this option isn't in it yet."

- `assets/js/i18n.js` — added `comboHasOption(combo, code)`, and changed the condition from `if (combo)` to `if (combo && comboHasOption(combo, code))`. When the target option isn't there yet, it now falls through to the same `setTimeout(..., 300)` retry already used for "combo not found," up to 20 attempts — so it waits for the options to genuinely finish populating instead of guessing.
- `assets/dist/js/template.min.js` rebuilt; `node -c` passes.

**Verified with Playwright**, exact reported flow (fresh page load → open language menu → click Hindi once, no second click): full page translation to Hindi confirmed within 2.5s (hero heading, KPI labels, nav links, telemetry ticker, CTA buttons all rendered in Hindi), zero console errors. This closes the "Open / not fully verified" item from the earlier i18n session — it was a real bug, not a sandboxed-browser quirk.

### Decoupled default nav link order from page section order
User asked for a specific nav sequence: About, Expertise, Experience, Leadership, Success Stories, Proof. About was already first, but this new order otherwise does **not** match the page's actual content flow (`about → leadership → experience → success-stories → expertise → ai-leadership → ...`) — a direct conflict with the previous session's fix, which made the nav auto-follow `DEFAULT_SECTION_ORDER` on every load (via `customizer.js`'s `applySectionLayout()`, since the Template Customizer runs automatically). Reordering just the HTML would have been silently undone by that same logic on the next load.

Rather than change `DEFAULT_SECTION_ORDER` itself (which also drives the *physical* page section order — doing so would have reshuffled the actual page content to match, breaking the deliberately-designed narrative flow documented in an earlier "personal-brand content strategy" session), decoupled the two:

- `assets/js/customizer.js` — added `DEFAULT_NAV_ORDER = ['about', 'expertise', 'experience', 'leadership', 'success-stories', 'recognition']` (one anchor id per dropdown — `expertise` for the Expertise dropdown, `recognition` for Proof — since the reorder logic moves the whole dropdown `<li>`, not individual items) alongside the existing `DEFAULT_SECTION_ORDER`. Added an `arraysEqual()` helper. The nav-reorder step in `applySectionLayout()` now follows `DEFAULT_NAV_ORDER` *unless* `state.sectionOrder` has actually diverged from `DEFAULT_SECTION_ORDER` (i.e., the user has customized layout via the Visual Layout Builder — dragging, importing a config, etc.), in which case it follows their dragged order for both nav and sections together, exactly as that feature is designed to.
- `index.html` — reordered the authored nav `<li>`s to match (About, Expertise-dropdown, Experience, Leadership, Success Stories, Proof-dropdown), so the no-JS/pre-hydration/SEO-crawler view is consistent with what JS renders.
- `assets/dist/js/template.min.js` rebuilt; `node -c` passes. No CSS touched this pass.

**Verified with Playwright:** fresh page load renders nav as `About, Expertise, Experience, Leadership, Success Stories, Proof` while `#main`'s actual `<section>` order is untouched (`about, leadership, experience, success-stories, expertise, ai-leadership, recognition, insights, testimonials, contact`); clicking "AI Leadership" still correctly highlights `AI Leadership` + parent `Expertise` (confirms the earlier scroll-spy fix is robust to nav reordering, as designed); driving `window.PortfolioThemeCustomizer.set({ sectionOrder: [...custom...] })` (equivalent to what dragging in the Layout Builder does) correctly re-couples the nav to the custom order and reorders the actual sections too. Zero console errors.

### Phase 1 of a large multi-phase initiative: visual design system
User handed over an 85-item backlog (numbered 15–99) covering a full design/content/architecture/performance/accessibility/SEO/QA overhaul, with edit rights and "do the needful one by one." Given the scale and that most of it is strategic ideation ("Suggest/Propose/Identify") rather than a single correct code change, and that a few items (45-50) reopen a previously-deferred major architecture decision, asked three scoping questions before starting: (1) proposal-first vs. just-implement — user chose **just implement, use your judgment**; (2) whether to do the full data-driven JSON rewrite (items 45-50), reversing the earlier "content stays in HTML for SEO" decision — user chose **yes, do it**; (3) sequencing — user chose **visual design system first**. Tracked as 5 phases via TaskCreate (#1 design system — this pass; #2 data-driven rewrite; #3 content & positioning; #4 technical foundation; #5 final polish/QA), since 85 items can't be executed with real verification in one pass.

**Phase 1 — visual design system (items 15-26), all implemented and Playwright-verified:**
- **Typography (#16):** Replaced Instrument Serif with **Fraunces** (variable serif, weight 300-700) as `--font-display`, everywhere the old font was referenced: `variables.css`, the Google Fonts `<link>` in `index.html`, `customizer.js`'s `FONTS.inter` preset (label + display stack), and `studio.css`'s two fallback declarations. This directly fixes a real limitation the old font forced on the whole system — Instrument Serif only ships weight 400, so `style.css`'s "TYPE CONSISTENCY" block had `h1,h2,h3,h4{font-weight:400 !important}` purely to fake a single consistent weight. With real range available, replaced that with a deliberate hierarchy: hero H1 stays 400 (confident without bulk, works at huge display sizes), `.sec-title` goes to 600 (needs to hold authority at a smaller size), general headings default to 500. Kept Inter (body) and JetBrains Mono (data/mono labels) unchanged — both already do their job well.
- **Color (#17):** Did not touch the six existing accent palettes or the WCAG-proven `--accent`/`--accent-2` pairs (accent-2 green is semantically load-bearing — it's the RAG "on track" signal throughout the Scorecard/Steering Snapshot, not just a decorative color, so diluting it site-wide would break that meaning). Instead added one new token, `--signature:#c9a227` (reusing the proven "executive" gold, `--signature-rgb` alongside it), used in exactly one place: the About section's credentials line icon (`.credentials-signature` class, replacing an inline `style="color:var(--accent)"` in `index.html`). Deliberately rare — first draft also put it on every card's hover state site-wide, caught that this directly contradicted the "restrained, memorable" brief (a color used everywhere isn't restrained) and pulled it back to the one moment.
- **Motion (#21, #22):** Added a documented "MOTION PRINCIPLES" comment block in `style.css` (two easing curves only, distance implies duration, motion communicates state not decoration, everything routes through `--motion-scale`/`[data-motion]`). Consolidated button hover transitions to one shared gesture (`transform`/`box-shadow`/`filter`, `--dur-fast` + `--ease-standard`) across `.btn-accent`/`.btn-outline`/hero-cta/cta-final, plus a subtle `filter:brightness(1.04)` on primary-CTA hover. Left per-context button *padding* alone (navbar being more compact than hero/contact CTAs is intentional hierarchy, not inconsistency — unifying it would have made the navbar button oversized or the hero CTA cramped).
- **Spacing (#18):** Audited `section{padding-top:...}`'s history (48px → 24px → 44px across earlier passes) — the final 44px was a deliberate, documented "landed as a middle ground" decision from an earlier session, not leftover cruft, so left it alone rather than changing it just to hit a round token value.
- **Theme persistence (#25):** Confirmed already working (localStorage-backed via `customizer.js`), no code change needed.
- Cards (#19), buttons (#20 beyond the hover-gesture consolidation), dark/light mode redesign (#23/#24 beyond the font/weight changes), and section headers (#26 beyond the weight hierarchy) were assessed but not substantially reworked this pass — the existing treatment (glass cards, WCAG-fixed button contrast, the two verified themes, mono-label eyebrows) was judged already solid; the font and weight changes carry through to all of them since they're `var(--font-display)`-driven.
- `assets/dist/css/template.min.css` and `assets/dist/js/template.min.js` rebuilt; `node -c` passes.

**Verified with Playwright** (had to switch test infrastructure mid-pass — Python's basic `http.server` is single-threaded and was intermittently dropping connections under rapid automated requests, producing false-positive failures like fonts/icons not loading or the theme customizer failing to initialize; switched to `npx http-server`, which resolved it — worth remembering for future verification passes in this repo): Fraunces loads and applies (`getComputedStyle().fontFamily`), hero H1 at weight 400, `.sec-title` at weight 600, signature gold renders as `rgb(201,162,39)` on the credentials line only, dark and light mode both clean, theme toggle persists across a real reload, zero console errors across Hero/About/Leadership/Recognition sections.

**Next up:** Phase 2 (full data-driven JSON rewrite, items 45-50) is a much larger structural undertaking — new content schema, renderer changes, migrating experience/projects/testimonials/awards off hand-authored HTML — planned as a separate pass rather than folded into this one.

### Hero headline rewrite + a real rotator height/rendering fix
User asked for new hero copy — a fixed first line ("I own enterprise delivery —") with a short rotating second line, matching a reference screenshot — plus two explicit constraints: the rotator phrases must fit in exactly two lines total, and the page must not shift vertically as phrases rotate.

- `assets/js/config.js` — `hero.eyebrow` → "Driving enterprise digital transformation"; `hero.headlinePrefix` → "I own enterprise delivery — "; `hero.rotatorPhrases` → four short (~20-24 char) phrases (`on time. on budget.` / `client confidence up.` / `disciplined delivery.` / `outcomes. teams. trust.`), documented inline as to why they're kept short (single-line, no wrap, no height jump).
- `index.html` — mirrored the same copy in the static hero markup; inserted a `<br>` between the prefix text node and `#heroRotator` so the two lines are a structural break, not incidental text wrap (this also doesn't break `components.js`'s hero renderer, which only touches `titleEl.firstChild` — still the text node, `<br>` is a later sibling).
- `assets/css/style.css` — `.rotator` changed from `display:inline-block` (natural, content-dependent height) to `display:block;height:1.15em` (fixed height regardless of which phrase is active) — this is the actual fix for "page should not move": previously only the currently-"on" phrase was in normal flow (`position:relative`) and determined the container's height, so a taller/shorter phrase rotating in changed the hero's total height and shoved everything below it. `.ph.on` changed from `white-space:normal` to `white-space:nowrap` to match (relies on `hero.rotatorPhrases` staying short by convention, documented in `config.js`).
- `assets/css/responsive.css` — removed `@media (max-width:576px){.rotator .ph{white-space:normal}}`, which used to re-allow wrapping on phones (needed for the old, longer phrases; would have defeated the fixed-height fix now that nowrap is enforced everywhere).

**Bug found while verifying (not present before this session's font work, but pre-existing in the rotator mechanism):** `.hero h1 .grad{background:...;-webkit-background-clip:text;...}` was applied to `#heroRotator` itself (class `"grad rotator"`) rather than to each `.ph` span individually. `background-clip:text` clips to the union of *all* descendant text glyphs the element paints, regardless of each child's own `opacity` — so every rotator phrase, including the three sitting at `opacity:0` waiting their turn, bled through as overlapping ghost text on top of the visible one, at every viewport, in the true default (never-touched) page state. Screenshotted it directly to confirm before fixing. Fix: moved the gradient/clip rule to `.hero h1 .grad .ph` so each phrase's mask is scoped to only its own glyphs.
- `assets/dist/css/template.min.css` rebuilt (no JS changes this pass — `config.js` loads standalone, not through the dist bundle).

**Chased two false leads while verifying, worth remembering:** (1) A "12px horizontal overflow on mobile" that looked consistently reproducible was actually `document.documentElement.scrollWidth` being measured mid-CSS-transition — the rotator's 500ms opacity/transform transition was still running when a `waitForTimeout(400)` between forced phrase switches took the measurement; waiting 800ms+ (or testing an isolated fresh switch) shows zero overflow at 320/375/768/1400px. (2) A garbled-multi-line mobile screenshot mid-investigation turned out to be from the same test loop's insufficiently-settled state, not a real bug — re-verified clean with an isolated, cache-busted, fully-settled load. Both are recorded so a future session doesn't have to re-discover that this repo's rotator needs 800ms+, not the transition's own 500ms, to fully settle before a screenshot/measurement is trustworthy.

**Verified with Playwright:** all 4 phrases screenshotted individually in a fully-settled state (desktop) — clean two-line layout, no overlap, matches the reference screenshots exactly; hero `boundingBox().height` identical (843.265625px, bit-for-bit) across all 4 phrases; zero horizontal overflow at 320/375/768/1400px once properly settled; mobile screenshot (375px, cache-busted, fresh load) confirms clean 2-line rendering with no overflow.

### Recruiter-conversion review: Priority 1 (hero 3-CTA row, case-study restructure)
User pasted an external hiring-manager-style review of the site plus a detailed 17-section enhancement spec, both aimed at recruiter conversion for Microsoft/Amazon/Google/Atlassian-tier hiring managers. Scoped it against the existing 85-item design-system backlog (Phase 1 — visual design — already done; this review largely restates later phases in more detail) and agreed with the user to implement only "Priority 1" now — hero 3-CTA row, executive impact dashboard, case-study restructure — then re-plan the rest (career timeline, delivery framework, leadership philosophy, project gallery, testimonials-with-photos, recruiter resume-variant downloads, executive-snapshot PDF, SEO/schema, micro-interactions) as a later pass, since several of those need real assets (photos, region-specific resumes) the user hasn't supplied yet.

**Audited before touching anything (worth remembering):** `kpi-cards` and `success-stories` are registered components in `components.js` but **`main.js` never calls `render()` for either** — both the Steering Snapshot's 6 KPI values and all 6 Success Stories cards are hand-authored static HTML with zero config binding, unlike `hero`/`about`/`insights`. Concluded the "Executive Impact Dashboard" ask was already substantially satisfied by the existing Steering Snapshot (₹2Cr+, 95%+ on-time, −20% risk, 20+ engineers, +30% adoption, 98% deployment — a near-exact match to the review's target metric set) plus the Executive Scorecard right above it (which the user explicitly asked to have restored in an earlier regression-fix session) — left both untouched rather than risk re-triggering the "redundant dashboard" complaint that was already resolved once.

- **Hero CTA row** (`index.html:2578-2581`, mirrored in `assets/js/config.js` `hero.secondaryCtas`) — was 2 real CTAs (Schedule, View case studies) + 1 icon-only LinkedIn link, with no résumé download reachable from the hero (only from Contact). Confirmed via the `hero` renderer in `components.js` that `secondaryCtas[i]` maps onto `.hero-cta .btn-outline` elements *by position*, so the fix had to change markup and config together: removed the LinkedIn icon anchor (already present with `rel="me"` in the footer and Recognition section — not the only place it lives), added a `Download Resume` anchor using the same `href="Suraj_Kumar_Resume_Technical_PM.pdf" download` pattern as the Contact section's résumé link (`main.js`'s `each('a[download]', ...)` rewrites every such anchor's href from `cfg.contact.resume` site-wide, so no new wiring was needed). Final row: Schedule an Executive Conversation → Download Resume → View case studies.
- **Success Stories restructured into consulting-style case studies** (`index.html:2977-3028`) — the 3 large cards (Narada/SEBI, CDP/L&T Construction, Easy Skills) each expanded from one narrative paragraph into explicit Challenge → Approach → Leadership → Technology → Business Outcome → Lessons Learned blocks. Reused existing classes only, no new CSS: `.pov-label` (already the site's small-caps sub-header pattern, used for the About pillars) for each block's header, `.text-2` for body copy, `.case-stack` relabeled `Technology` (was `Stack`), `.result-line` kept as-is for Business Outcome. The 3 small one-liner cards (HRMS, Bid Advisory, eClaim) were left alone — they're supplementary quick-hits, not full case studies, and restructuring them would have made the section overlong.
- No `components.js`/`main.js`/dist-bundle changes — the `hero` renderer's field-mapping logic didn't change (only its config data did), and `success-stories`'s renderer already only touches `.sec-title` (untouched). `config.js` loads standalone, not through the bundle. So this pass needed no dist rebuild, unlike most sessions in this log.

**Verified with Playwright** (`npx http-server` + `npx playwright`, same pattern as the design-system pass): hero CTA row renders exactly `["Schedule an Executive Conversation", "Download Resume", "View case studies"]`, zero console errors, all three restructured case-study cards screenshot cleanly with no overlap or truncation, two-column CDP/Easy Skills pair stays evenly matched height-wise.

**Next up:** re-plan the remaining review items (career timeline, leadership philosophy, delivery framework, project gallery, testimonials with photos, recruiter resume-variant downloads, Executive Snapshot PDF, SEO/schema, micro-interactions) as a follow-up phase — flagged to the user that several need real assets (headshots, region-specific résumé files) not yet supplied.

### Recruiter-conversion review: Phase 2 (audited-first — 2 of 5 items already existed)
Re-planned the remaining review items against the actual current site (not just the review's generic list) before writing code. Two of the five "new" items the plan called for turned out to already exist under different section names, found only by reading the real markup:
- **Leadership Philosophy** — `#leadership`'s existing "Operating principles" sub-block (`index.html:2776-2812`) already has a vision-quote plus 4 named principle cards ("Green is earned, not reported," "Estimate honestly, protect the margin," "Build people, not just plans," "AI is a capability, not a slide") — the same ask as the review, more specific than generic Clarity/Ownership labels. Left untouched.
- **Thought Leadership** — already spread across 3 sections by design: a C# Corner MVP proof strip + full Stack Overflow panel (430 answers, 795k reached) inside `#leadership`, article cards in `#insights`, full Education/Certifications/Awards in `#recognition`. Did **not** add GitHub/Talks/Conferences — `links.github` is empty and none of that content exists, and fabricating it would be dishonest. Left untouched.

Building near-duplicate sections for either would have added clutter without adding information — the same mistake a much earlier session (the "visual clutter audit") already had to walk back once. Caught this time by reading the actual page before writing markup, not by guessing from the review's checklist.

**Genuinely new work, implemented and Playwright-verified:**
- **New `#delivery-framework` section** ("How I work," 9-step process: Discovery → Planning → Risk Assessment → Execution → Governance → Stakeholder Communication → Quality Assurance → Deployment → Continuous Improvement), placed between `#leadership` and `#experience`. Built as a 3×3 grid of `.x-card`s reusing `.pov-label`/`.text-2` (no new CSS) instead of a 9-item vertical `.timeline` — a list that long read as repetitive next to the already-long Experience timeline. Copy deliberately reuses figures already established elsewhere (98% delivery success, zero critical go-live escalations) so it reinforces rather than contradicts other sections. Registered the full way: `config.js` (`sections.deliveryFramework` + `deliveryFramework.title`), `components.js` (`create('delivery-framework', ...)`), `main.js` (`SECTION_IDS` entry + render call), `customizer.js` (`DEFAULT_SECTION_ORDER`, inserted after `'leadership'`) — not added to `DEFAULT_NAV_ORDER`, matching the existing precedent that not every section (`ai-leadership`, `insights`, `testimonials`, `contact`) is a top-level nav link. Confirmed the Visual Layout Builder needs no separate label registration — it title-cases the section id directly (`customizer.js:377`). All mirrored into `assets/dist/js/template.min.js`; `node -c` passes.
- **Filterable category chips on Success Stories** (`index.html`, `.ss-filter-bar` above `#success-stories-content`) — reuses `.preset-chip`/`[aria-pressed]` styling verbatim (already WCAG-contrast-fixed from an earlier session), no new CSS. Categories (`all` / `compliance` / `construction` / `hr-tech` / `finance-ops` / `automation`) are authored per-card via a `data-filter` attribute on each of the 6 project card wrappers, **not** parsed from the visible `.tag` text — deliberately decoupled so relabeling a tag later can't silently break the filter (this codebase has a documented history of exactly that class of string-matching bug, the Portfolio Copilot's empty-keyword bug from an earlier session). New click-delegated filter script appended to `assets/js/ui.js` as its own IIFE (the file's existing single IIFE is docblock-reserved for 4 specific behaviours "on purpose," so this is intentionally separate), mirrored into the dist bundle; `node -c` passes.
- **Generated `og-image.png`** (1200×630, project root) — the `og:image`/`twitter:image` meta tags already existed and pointed to this exact path, but the file itself was never created, so shared links rendered blank. Built via a standalone branded HTML page (Fraunces/Inter/JetBrains Mono, navy palette, real hero copy/stats) screenshotted with Playwright at the exact target dimensions — no design tool needed, matches the live site's actual look rather than a generic template.

**Verified with Playwright** (`npx http-server` + `npx playwright`, same pattern as prior sessions): Delivery Framework renders 9 cards with correct title; nav unaffected (still `About, Experience, Leadership, Success Stories, Expertise, Proof`); Success Stories starts with all 6 cards visible, the HR Tech chip correctly narrows to exactly the 2 matching cards (Easy Skills + HRMS Digitalization) and "All" restores all 6; zero console errors throughout; og-image.png confirmed exactly 1200×630 PNG.

**Not done — genuinely blocked on assets from the user, deferred to a later phase:** testimonials with real photos, region-specific résumé PDF variants (India/Europe/GCC/ATS/Executive), and the Executive Snapshot one-page PDF.

### Recruiter-conversion review: content-quality rewrite + case studies expanded to 10 fields
User pasted a third variant of the same recruiter-conversion review, this time explicitly asking for (a) a full site-wide content rewrite for a more executive/metrics-driven tone, and (b) expanding Success Stories from 6 fields to a full 10-field consulting structure (adds Business Context, Team Composition, Strategy as distinct from the prior "Approach," Risks Managed, Key Decisions). Also proposed SEO landing pages (9 new standalone HTML pages) as a separate large item — user did not pick that option when asked, so it was not started.

**Audited before rewriting anything (this is the load-bearing decision of this session):** read every major section's body copy — Hero, About, Leadership, Delivery Framework, Experience, AI Leadership, Expertise, Insights, Testimonials, Contact. Nearly all of it is already executive-tone and metrics-driven, the product of ~15 prior sessions of iterative copy tuning documented earlier in this log. A wholesale rewrite would have risked regressing that work for no real gain. The actual weak copy was narrow: the 3 small one-liner Success Stories cards (HRMS Digitalization, Bid Advisory & Commodity Hedge Management, eClaim) read as feature descriptions rather than business outcomes, and 2 of the 3 had no quantified result at all. Rewrote only those two (`index.html`) — HRMS already had a real metric (25%) and was left alone. Did not invent metrics for Bid Advisory/eClaim since none exist in config or elsewhere on the site; reframed them as clearer business outcomes without fabricating numbers instead.

**Success Stories expanded to the full 10-field structure** for all 3 major case studies (Narada, CDP, Easy Skills) in `index.html`: Business Challenge → Business Context → My Role → Team Composition → Strategy → Technologies → Risks Managed → Key Decisions → Business Outcome → Lessons Learned. The 4 new fields per card (Business Context, Team Composition, Risks Managed, Key Decisions) are genuinely new content, not relabeled existing text — grounded in facts already established elsewhere on the site (SEBI/ISO governance context, L&T Group account structure, steering-committee cadence) rather than invented specifics. Kept every field to one sentence to manage the resulting card length, which roughly doubled — flagged this tradeoff to the user before starting and they explicitly chose to proceed. Reused `.pov-label`/`.text-2`/`.case-stack`/`.result-line` throughout; no new CSS.

**Verified with Playwright:** all three cards render the correct 8 `.pov-label` fields + `.case-stack` + `.result-line` = 10 total, zero console errors, filter chips still correctly narrow to matching cards after the content expansion. One false alarm during verification worth recording: an element-bounds screenshot of the full `#success-stories` section (without scrolling through it first) showed a large blank gap where the CDP/Easy Skills cards should be — this was purely the `.reveal` scroll-triggered animation never firing for cards that were never actually scrolled into view during the test, not a layout bug. Confirmed by scrolling incrementally through the section first: all 6 card wrappers read `opacity:1` and all 6 titles are present in the DOM. Same class of false lead as the "12px mobile overflow" and "garbled mobile screenshot" false alarms recorded in the hero-rotator session earlier in this log — this repo's `.reveal` animations need an actual scroll-through before a screenshot/measurement of lower content is trustworthy, not just navigation.

No dist-bundle changes this session — only `index.html` static markup changed, no renderer/config logic touched.

### Trimmed Executive Scorecard to 5 rows, deduped against Steering Snapshot / hero highlights
User asked to keep only 5 of the Executive Scorecard's 7 rows — whichever aren't semantically similar to anything already in the Steering Snapshot KPI board or the hero's "Selected highlights" ribbon. Compared all 3 panels: **removed** "Delivery Success 98%" (exact duplicate of Steering Snapshot's "98% Deployment & Delivery Success" and the highlights' "98% Delivery Excellence") and "Budget Adherence 97%" (restates the budget half of Steering Snapshot's "95%+ on-time, on-budget delivery"). **Kept** Client Satisfaction, SLA Compliance, Production Stability, Resource Utilization, Audit Success — none of those concepts appear elsewhere on the page. `index.html` only; no dist changes. Verified with Playwright: exactly the 5 intended rows render, hero-right's flex layout (from an earlier "Hero-right layout fix" session) absorbed the shorter panel with no gap or misalignment against the Steering Snapshot panel beside it, zero console errors.

**Follow-up in the same session:** user asked to restore the scorecard panel's original total height (i.e. don't let it visually shrink from losing 2 rows) by adding gap around each remaining row rather than one lump gap. Measured with Playwright: panel was 238.5px at 5 rows (32.75px/row, padding 7px 0), and would have been ~304px at 7 rows. Solved for the padding needed on 5 rows to reach ~304px total (`74.75px` fixed panel overhead + 5 × rowHeight = 304 → rowHeight ≈ 45.85px → padding ≈13.5px top/bottom, up from 7px) and added `.exec-scorecard .row-item{padding:13.5px 0}` in 3 places to guarantee it wins every relevant cascade: the end of `assets/css/style.css` (the file's own designated "ADD NEW OVERRIDES BELOW THIS LINE" zone), the end of the `style.css` portion inside `assets/dist/css/template.min.css`, and — easy to miss — the very end of `index.html`'s inlined `<style id="critical-css">` block (lines 92-2453), since the Executive Scorecard sits above the fold and is covered by critical CSS; skipping that copy would have caused first paint to flash at the shorter height until the async bundle loaded. Re-measured after: panel height 303.5px (target ~304px, off by <1px). Verified with a screenshot — 5 evenly-spaced rows, no longer visually sparse next to the Steering Snapshot panel. Zero console errors.

### Bootstrap upgrade ("look as per new bootstrap and WordPress and Drupal best site")
User's phrasing was genuinely ambiguous — could have meant a visual redesign, a platform migration to WordPress/Drupal, or a Bootstrap version/pattern upgrade. Asked via AskUserQuestion rather than guessing, since a platform migration would violate this repo's static-site-only constraint and a redesign would undo a lot of prior design-system work. User chose: upgrade to the latest Bootstrap and refine components to current best-practice patterns, while keeping the existing premium visual identity.

- Bumped **Bootstrap 5.3.3 → 5.3.8** and **Bootstrap Icons 1.11.3 → 1.13.1** (both are the actual latest as of Aug 2026, confirmed via web search — 5.3.8 is the last planned patch on the 5.3 line before 5.4). Updated in `index.html` (CSS link, JS bundle script, both carry Subresource Integrity hashes) and `component-catalog.html` (CSS links only, no SRI there). Did **not** guess the new `integrity="sha384-..."` values — downloaded the actual files from the jsDelivr CDN URLs being pinned and computed real SHA-384 hashes locally (`openssl dgst -sha384 -binary ... | openssl base64 -A`), since a wrong/hallucinated SRI hash would make the browser refuse to load the file entirely. Verified the downloaded files were genuine (correct version banners in the file headers) before hashing.
- Left `assets/dev/theme-test.html` on the old version — it's a dev-only component-palette test harness, not part of the live site, same precedent as other content passes this session. `studio.html` has no Bootstrap dependency at all (uses its own CSS), so nothing to bump there.
- **Component "best practice" audit:** checked the navbar toggler and dropdown toggles (the main Bootstrap-JS-driven interactive elements) against current Bootstrap 5.3 ARIA conventions — `aria-controls`/`aria-expanded`/`aria-label` on the toggler, `role="button"` + `data-bs-toggle="dropdown"` + `aria-expanded` on dropdown links. All already correct, the product of several earlier accessibility-focused sessions (WCAG contrast fixes, dropdown hover/keyboard fixes, mobile-toggle fix, focus-visible outline fixes). Did not force additional "modernization" changes onto already-compliant markup, and deliberately did not touch the custom `.x-card`/`.btn-accent`/`.btn-outline` classes in favor of raw Bootstrap `.card`/`.btn-primary` — those are the site's intentional custom branding, not outdated patterns, and replacing them would have been the redesign the user explicitly didn't choose.
- No dist-bundle changes — Bootstrap loads via its own CDN `<script>`/`<link>` tags in `index.html`, entirely separate from this repo's own hand-maintained `template.min.js`/`template.min.css` bundles.

**Verified with Playwright:** confirmed `bootstrap.Tooltip.VERSION` actually reports `5.3.8` at runtime (proves the new file loaded and its SRI hash matched — a mismatched hash would have silently blocked the script instead of erroring loudly), theme toggle still flips `data-bs-theme`, a nav dropdown still opens on click, the mobile navbar-toggler still opens the collapse menu, zero console errors throughout.
