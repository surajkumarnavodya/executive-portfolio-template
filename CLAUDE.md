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
