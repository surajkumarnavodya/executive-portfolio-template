# Copilot Persistent Memory

This file acts as persistent memory across sessions. It is updated after every code change, refactor, or debugging task to keep track of architectural decisions, current work, and outstanding questions.

## Architectural Constraints

- No project structure (solution/projects, package manifests, etc.) has been detected in the workspace yet.
- Constraints will be recorded here as they are discovered or decided (e.g., language/framework choices, coding conventions, dependency restrictions).

## Current Objective

- Redesigned the hero section (`index.html` `#top`) copy to read as a premium executive brand (who/what/value prop), and made the entire hero (eyebrow, headline, rotator phrases, value statement, lede, stats, highlight ribbon, CTA labels) configurable from `assets/js/config.js` without editing HTML structure.

## Architectural Constraints (discovered)

- Static site: `index.html` + `assets/js/*.js` + `assets/css`. No build tool/package.json in repo — `assets/dist/js/template.min.js` is a hand-maintained concatenation of `components.js` + `main.js` (+ others) and must be edited in lockstep with the source files whenever those two files change, since `index.html` only loads the `dist` bundle plus `assets/js/config.js` directly.
- `assets/js/config.js` is the single file end users are meant to edit; `assets/js/main.js` applies it to the DOM defensively (missing elements are skipped, never throws).
- `assets/js/components.js` exposes a `window.PortfolioComponents` registry (`render`/`renderMany`) used by the Studio customizer presets — extended its `hero` component instead of inventing a new mechanism.

## Files Modified & State Changes

- `.github/copilot-instructions.md` — persistent memory log (this file).
- `assets/js/components.js` — extended the `hero` component renderer to also populate `eyebrow`, `headlinePrefix`, `stats[]`, `highlights[]`, and `secondaryCtas[]` (previously only `heroPhrases`/`valueStatement`/`lede`/`primaryCta`).
- `assets/js/main.js` — added a call to `window.PortfolioComponents.render('hero', cfg.hero)` right after the identity block so hero content is applied from config on load.
- `assets/js/config.js` — added a new `hero: {...}` block with premium executive copy (eyebrow, headlinePrefix, rotatorPhrases, valueStatement, lede, stats, highlights, primaryCta, secondaryCtas) and inline documentation of each field.
- `index.html` — updated the hero's static fallback copy (eyebrow/H1/value-statement) to match the new premium wording so first paint (pre-JS) and SEO crawlers see the same tone; no structural/class changes.
- `assets/dist/js/template.min.js` — mirrored the `components.js` hero renderer changes and the `main.js` hero-render call (minified bundle kept in sync manually).

## Next Steps / Open Questions

- No automated test/build tooling exists in this repo to verify the bundle stays in sync — recommend visually verifying the hero on desktop/mobile and confirming CTA is above the fold, per the original testing criteria.
- Open question: should a build script be introduced to regenerate `template.min.js` from source automatically, to avoid manual bundle-sync risk going forward?

## Current Objective (section-order pass)

- Reordered homepage sections to an executive-credibility flow: Hero → Leadership → Success Stories → Experience → Expertise → AI Leadership → Recognition → Testimonials → Contact. Updated navbar links and the Studio customizer's `DEFAULT_SECTION_ORDER` (source + dist bundle) to match.

## Current Objective (trust-signal audit)

- Audited the page for missing trust signals recruiters/clients/senior stakeholders look for. Found: (1) certifications listed as plain text with no way to verify authenticity, (2) outbound identity links (LinkedIn/C# Corner/Stack Overflow) not marked with `rel="me"` to reinforce the `sameAs` structured-data identity claims, (3) testimonials section leans on a peer quote and an "Early Career Recruiter" quote rather than a named senior/client sponsor — the high-value sponsor-quote slot exists in `index.html` but is commented out and needs the user's real content to activate.

## Files Modified & State Changes (trust-signal audit)

- `index.html` — added a verification line under the Recognition → Certifications card linking to the LinkedIn certifications tab (`rel="noopener me"`); added `rel="me"` to the footer's LinkedIn/C# Corner/Stack Overflow links so they match the `Person` structured-data `sameAs` list.

## Next Steps / Open Questions (trust-signal audit)

- User should replace the sample testimonials (peer + early-career recruiter) with a named senior-leader/client-sponsor recommendation — the commented-out featured slot around line ~806 in `index.html` is ready to uncomment once real content/permission is available.
- Consider adding direct verification links per-certification (e.g., Credly badge URLs, PMI certificate IDs) if/when the user has them, rather than a single blanket LinkedIn link.

## Current Objective (executive About section)

- Added a new config-driven "About" section (`#about`) placed between the Hero and Leadership sections — an executive-summary narrative (positioning statement, 3 leadership/impact/positioning paragraphs, 3 pillar cards, credentials line) that was previously missing from the page entirely (Leadership only covered capability pillars, not a personal bio).

## Files Modified & State Changes (executive About section)

- `assets/js/config.js` — added a new `about: {...}` data block (eyebrow, title, summary, paragraphs[], pillars[], credentials) with inline docs; added `sections.about: true` toggle.
- `index.html` — inserted `<section id="about" data-component="about">` markup right after `<main>` (before Leadership), reusing existing `sec-title`/`lede`/`x-card`/`pov-label` classes; added an "About" navbar link.
- `assets/js/components.js` — added an `about` component renderer populating eyebrow/title/summary/paragraphs/pillars/credentials from `cfg.about`.
- `assets/js/main.js` — added `window.PortfolioComponents.render('about', cfg.about)` call after the hero render hook; added a missing `about: 'about'` entry to the `SECTION_IDS` map so `sections.about = false` correctly removes the section and its nav link.
- `assets/js/customizer.js` — added `'about'` to the front of `DEFAULT_SECTION_ORDER`.
- `assets/dist/js/template.min.js` — mirrored all of the above (about component renderer, main.js render + SECTION_IDS entry, customizer DEFAULT_SECTION_ORDER).

## Current Objective (hero headline tone variants)

- Added three ready-made premium brand-voice variants for the hero headline/subheadline — `authoritative`, `modern`, `refined` — selectable via a single `hero.activeTone` config flag, with no HTML changes required to switch tones.

## Files Modified & State Changes (hero headline tone variants)

- `assets/js/config.js` — added `hero.activeTone` (empty string = use base fields) and `hero.toneVariants.{authoritative,modern,refined}`, each overriding `eyebrow`/`headlinePrefix`/`rotatorPhrases`/`valueStatement` only (lede/stats/highlights/CTAs stay shared across tones).
- `assets/js/components.js` — the `hero` component renderer now merges `payload.toneVariants[payload.activeTone]` over the base payload before rendering, falling back silently to the base hero fields if `activeTone` is empty/unknown.
- `assets/dist/js/template.min.js` — mirrored the tone-merge logic in the `hero` component renderer.

## Next Steps / Open Questions (hero headline tone variants)

- To preview a tone, set `hero.activeTone` in `assets/js/config.js` to `'authoritative'`, `'modern'`, or `'refined'` and reload — no other file needs to change.
- Recommend the user manually check contrast/line-wrap on mobile for each tone's headline length, since rotator phrase lengths differ slightly per tone.

## Current Objective (personal-brand content strategy)

- Two content-strategy additions to make the homepage feel like a living brand platform: (1) a "Currently" status line inside About (`#about-currently`), and (2) a new config-driven "Insights" section (`#insights`) with public POV cards linking to published C# Corner articles and Stack Overflow answers.
- Homepage narrative arc was reordered end-to-end to: Hero → About → Leadership → Experience → Success Stories → Expertise → AI Leadership → Recognition → Insights → Testimonials → Contact. Rationale: Leadership → Experience → Success Stories forms an unbroken capability→career→outcome proof chain; Expertise/AI Leadership build differentiation; Recognition adds external validation; Insights (public voice) and Testimonials (others' voices) are placed last as the final trust-builders immediately before the Contact CTA.

## Files Modified & State Changes (personal-brand content strategy)

- `index.html` — added `#about-currently` "Currently" line; moved the Experience section to immediately follow Leadership (was previously after Success Stories/Insights); relocated the Insights section to immediately before Testimonials (was previously between Success Stories and Experience); updated the navbar link order to match the new section order.
- `assets/js/config.js` — added `sections.insights: true` toggle and a new `insights: { title }` data block (only the section title is data-driven; the cards remain SEO-visible static HTML).
- `assets/js/components.js` — added an `insights` component renderer (title-only override, same pattern as `success-stories`/`recognition`).
- `assets/js/main.js` — added an `insights` render hook and an `insights: 'insights'` entry in `SECTION_IDS` for config-driven visibility toggling.
- `assets/js/customizer.js` — `DEFAULT_SECTION_ORDER` updated to `['about','leadership','experience','success-stories','expertise','ai-leadership','recognition','insights','testimonials','contact']`.
- `assets/dist/js/template.min.js` — mirrored the insights renderer, render call, `SECTION_IDS` entry, and the new `DEFAULT_SECTION_ORDER` to keep the hand-maintained bundle in sync.

## Next Steps / Open Questions (personal-brand content strategy)

- Recommend manually verifying the new section order renders correctly on mobile (timeline/experience component right after Leadership can be tall — check for any awkward transition), and confirming in-page anchor scrolling still lands correctly for all nav links.
- No automated build/test tooling exists; changes were validated via `get_errors` (no diagnostics) and a full pass of `grep_search` confirming exactly one `<section id="...">` per id and the correct final order.

## Current Objective (visual clutter audit)

- Audited the hero (`#top`) for visual clutter. Found the single biggest offender: the hero's right column stacked TWO dashboards — an "Executive Scorecard" (7 progress-bar rows: Delivery Success, Client Satisfaction, Budget Adherence, SLA Compliance, Production Stability, Resource Utilization, Audit Success) and a "Steering Snapshot" KPI board (6 metric cells). Several numbers were near-duplicates of each other and of the left-column stats/highlights (e.g. "98% Delivery Excellence" repeated across the highlights ribbon, the scorecard, and the steering snapshot). Also found the domain-tag strip had 9 tags in one unbroken row, and the hero CTA row had 4 competing buttons (primary + Download Resume + Case studies + LinkedIn icon) above the fold.

## Files Modified & State Changes (visual clutter audit)

- `index.html` — removed the entire `.exec-scorecard` panel from the hero's right column (its `data-component="kpi-cards"` attribute was vestigial/unused — only `#impact`/`.kpi-board` was ever wired to a renderer), keeping the "Steering Snapshot" KPI board as the sole dashboard; trimmed the domain-tag strip from 9 tags (HR, Healthcare, BFSI, EPC, Construction, MIS, Sales, Marketing) down to the 5 most senior-relevant (HR, Healthcare, BFSI, Construction, MIS); removed the "Download Resume" button from the hero CTA row (resume download remains reachable from the Contact section at `.cta-secondary`), leaving primary CTA + "Case studies" + LinkedIn icon.
- `assets/js/config.js` — updated `hero.secondaryCtas` to a single-entry array (`Case studies` only) to match the reduced CTA row, keeping the CTA fully config-driven.
- No `assets/js/components.js`/`main.js`/dist bundle logic changes were required: the `hero` and `kpi-cards` renderers already operate generically on whatever markup/config exists, so removing markup and trimming a config array needed no renderer code changes. Dead `.exec-scorecard`/`.sc-*` CSS rules remain in `assets/css/responsive.css` as harmless no-ops (no longer matched by any element) — left alone per minimal-change principle.

## Next Steps / Open Questions (visual clutter audit)

- Recommend visually verifying the hero on desktop/mobile to confirm the KPI board now reads as a single clear "Steering Snapshot" and the CTA row no longer wraps awkwardly on small viewports.
- Optional follow-up: remove the now-dead `.exec-scorecard`/`.sc-*` rules from `assets/css/responsive.css` in a future cleanup pass if the user wants stricter CSS hygiene.

## Current Objective (regression fix pass — dist bundle corruption + broken CTAs + scorecard restore)

- User reported: theme toggle and colour customization not working, oversized gaps in the Steering Snapshot, the Executive Scorecard missing (wanted back), and CTA buttons rendering as plain text.
- Root cause found for the first symptom: `assets/dist/js/template.min.js` had a hard JS syntax error (`SyntaxError: missing ) after argument list`, confirmed with `node -c`). It was missing the `kpi-cards`, `timeline`, `experience`, `recognition`, `contact`, and `footer` component renderers, and the `main.js` section-visibility loop was truncated — content was almost certainly lost during a prior manual "mirror source → dist" edit. Since the bundle never parsed, **none** of customizer.js/palette.js/theme.js/navigation.js/ui.js ever executed in the browser (only the CSS-only `.reveal` fallback masked it from looking fully blank).
- Root cause found for the CTA-as-text symptom: three `<a>` anchors in `index.html` (hero primary CTA, Contact "Schedule an Executive Conversation", Contact "Download my résumé") were missing their opening `<a class="btn-accent...">`/`<a class="btn-outline...">` tags — only a stray icon + text + orphaned `</a>` remained. Confirmed via `git diff` against the last commit (`addfc6a`). This also explains why `components.js`'s hero renderer silently did nothing for the primary CTA: it targets `.hero-cta .btn-accent`, which didn't exist.
- The Executive Scorecard removal from the earlier "visual clutter audit" pass was reverted per explicit user request — restored verbatim from `git show HEAD:index.html` (7-row scorecard: Delivery Success, Client Satisfaction, Budget Adherence, SLA Compliance, Production Stability, Resource Utilization, Audit Success). Dropped the stray `data-component="kpi-cards"` attribute it originally carried (inert — only `#impact` is ever targeted by that component name).
- The Steering Snapshot's oversized padding/icon size was the accumulated result of several earlier override passes each nudging `.kpi-cell`/`.kpi-icon` up instead of down (padding 11px → 17/14px → 18/16px; icon 34px → 36px → 46px → 48px) with no cleanup. Added one consolidated final-word override block at the very bottom of `assets/css/style.css` (the file's own documented "ADD NEW OVERRIDES BELOW THIS LINE" zone) rather than editing every prior layer.

## Files Modified & State Changes (regression fix pass)

- `assets/dist/js/template.min.js` — fully rebuilt as a clean concatenation of all 9 real runtime source files in dependency order: `components.js`, `counters.js`, `customizer.js`, `main.js`, `navigation.js`, `palette.js`, `renderer.js`, `theme.js`, `ui.js` (excludes the Studio-only ES modules `asset-store.js`, `content-service.js`, `portfolio-data-service.js`, `asset-integration-test.js`, `studio-app.js`, which use `export class`/`export function` and would break the non-module bundle the same way the v1.5.0 changelog entry describes). Verified with `node -c` — parses cleanly. Not byte-minified (no build tooling exists in this repo per `README.md`); correctness was prioritized over minification.
- `assets/dist/css/template.min.css` — rebuilt as a concatenation of `variables.css` + `style.css` + `responsive.css` + `studio.css`, matching the prior bundle's composition (including `studio.css`, which the shipped bundle already included even though the main page doesn't use it).
- `index.html` — restored the 3 broken `<a>` CTA anchors (hero primary CTA, Contact schedule CTA, Contact résumé-download CTA); re-inserted the 7-row Executive Scorecard panel into the hero's right column, above the Steering Snapshot KPI board.
- `assets/css/style.css` — appended a consolidated `.kpi-board`/`.kpi-cell`/`.kpi-icon`/`.kpi-val`/`.kpi-lbl` size-correction block at the end of the file to fix the oversized Steering Snapshot spacing, without touching/removing any of the earlier override layers already in the file.

## Next Steps / Open Questions (regression fix pass)

- Recommend visually verifying in a browser: theme toggle, palette picker, homepage presets, drag/drop layout builder, hero rotator, KPI count-up, and the Portfolio Copilot — all of these depend on the previously-broken JS bundle and should now work end-to-end.
- The `assets/dist/*` bundles remain hand-maintained (no build step in this repo). Any future edit to a source `.js`/`.css` file must be re-mirrored into `assets/dist/js/template.min.js` / `assets/dist/css/template.min.css` in the same pass, and the JS bundle should be spot-checked with `node -c assets/dist/js/template.min.js` before considering the change done — that single command would have caught this entire regression immediately.
- Consider committing the current working-tree state to git (last real commit is `addfc6a`, over 10 files behind) so future regressions can be diffed against a recent baseline instead of a stale one.

## Current Objective (browser verification + hero-right gap fix)

Actually loaded `index.html` in a browser (Playwright, headless) to verify the regression fix pass above — confirmed clean: no console errors, theme toggle flips `data-bs-theme`, palette swatches flip `data-palette`, Executive Scorecard renders, and the hero-right column's bottom edge lines up exactly with the hero CTA row's bottom edge (`align-items:stretch` on `.hero > .container > .row` plus the column being a flex column guarantees this regardless of content height).

However, the `justify-content:space-between` change from the previous pass (`assets/css/responsive.css`, `@media (min-width:992px)`) dumped 100% of the leftover column height into one gap between Executive Scorecard and Steering Snapshot — measured at 113.6px, which read as the Steering Snapshot card being visibly "sunk" below the scorecard, confirmed against a user screenshot.

- `assets/css/responsive.css` (+ mirrored in `assets/dist/css/template.min.css`) — replaced `justify-content:space-between` / `.kpi-board{flex:0 0 auto}` with a fixed `gap:20px` on `.hero-right` plus `.kpi-board{flex:1 1 auto}` and `.kpi-board>.row{flex:1 1 auto;align-content:center}`. The KPI board still grows to fill the column (bottom stays pinned to the CTA row level — verified 830.66px both sides at 1440px width), but the growth is absorbed by centering the cell grid within the board rather than by an external dead gap, and cells keep their natural size instead of stretching apart (avoiding a repeat of the original "oversized Steering Snapshot" complaint).

**Open:** re-verify at narrower desktop widths (992–1200px) and confirm the 20px gap still reads well once real (non-placeholder) Executive Scorecard content is in place. `assets/js/navigation.js` / `assets/dist/js/template.min.js` also carry an uncommitted hover-to-open dropdown change and `assets/css/style.css` an uncommitted preset-chip contrast fix from a separate session — unrelated to this fix, left as-is.

## Current Objective (dropdown hover, preset-chip contrast, Steering Snapshot cell sizing)

Landed the hover-to-open dropdown and preset-chip contrast fix that were already sitting uncommitted (see CLAUDE.md for full detail — kept in sync there). Summary: `assets/js/navigation.js` opens nav dropdowns on hover via the real `bootstrap.Dropdown` API (gated to fine-pointer/hover devices); an exhaustive Playwright contrast audit found no reproducible dark-mode "text not appearing" bug (one false alarm was my own test racing page load — use `waitUntil:'networkidle'`), but did find and fix a real light-mode AA failure on the active `.preset-chip` in the Template Customizer. Then, per a user screenshot, bumped `.kpi-cell`/`.kpi-icon`/`.kpi-val`/`.kpi-lbl` sizing back up (it read too cramped after the earlier shrink) in the same size-correction block at the bottom of `assets/css/style.css`. Both dist bundles rebuilt from source each time; `node -c` passes.

**Found but not touched (at the time):** `assets/js/i18n.js` (client-side translate widget) existed on disk with matching navbar markup but was entirely unwired. Flagged to the user, who asked for it to be finished — see CLAUDE.md for the full writeup (kept in sync there). Summary: added a `config.js` `i18n` block, an `#google_translate_element` mount div in `index.html`, a full CSS block (menu/banner styling + Google-UI suppression), and included `i18n.js` in the dist bundle. Also fixed a real bug found along the way: the `change` event driving Google's hidden translate `<select>` wasn't set to bubble, so the selection never actually fired a translation. Verified with Playwright: correct locale-based banner suggestion, dismiss persistence, language menu contents, and genuine network engagement with Google's translation engine — could not get a 100%-certain visual confirmation of the on-page text swap inside this headless sandboxed browser (Google's widget is known to behave differently under bot-detection signals); recommend one manual check in a real browser tab.

## Current Objective (removed navbar smart-hide-on-scroll)

User reported the top nav menu disappearing while scrolling down as a bug. This was the intentional "smart-hide" feature from the marketplace-transformation pass (`assets/js/ui.js`'s `paintNav()` added `nav-hidden` on scroll-down past 220px, translating `.navbar.fixed-top` off-screen). Removed the hide/reappear direction-tracking logic entirely, keeping only the `nav-condensed` compact/shadow treatment — the navbar now always stays visible. See CLAUDE.md for full detail, including a note that `.persistent-cta` (a fallback CTA button that only ever appeared while the nav was hidden) is now permanently dormant as a side effect — left in place, not removed, since that wasn't asked for. Verified with Playwright on desktop and mobile: navbar bounding box stays pinned at `y:0` through repeated scroll-down/scroll-up, `nav-hidden` never appears in `body.className`, zero console errors.

## Current Objective (Copilot wrong answers, dead persistent CTA, mis-highlighting nav, scrambled menu order)

Four unrelated bugs reported together — full root-cause writeup in CLAUDE.md (kept in sync there). Summary:
1. **Copilot KB bug** (`assets/js/ui.js`): a stray empty string in the location entry's keyword array exploited `"anyword".indexOf('')===0` (always true in JS) to silently bias every query toward the location answer — fixed by removing it and guarding the scoring loop against empty keywords.
2. **`.persistent-cta` dead** (`assets/css/style.css`): was a side effect of the previous "remove navbar hide" fix — the button was gated on `body.nav-hidden`, which no longer fires. Retriggered on `body.nav-condensed` instead.
3. **Scroll-spy mis-highlighting** (`assets/js/navigation.js`): `paintActive()` picked the last nav target in *menu* order that had been scrolled past, which only works if menu order matches page order — broken since Success Stories moved earlier on the page in an older pass without the nav following. Fixed to compare real page offsets instead. Also hardened the post-click lock to release on `scrollend` (where supported) rather than a fixed timeout that could expire mid-scroll.
4. **Menu order** (`assets/js/customizer.js` + `index.html`): About was already first in the HTML — the actual bug was `applySectionLayout()` (which runs automatically since the Template Customizer is on by default) only repositioning nav items with a direct top-level link, silently stranding the Expertise/Proof dropdown wrappers at the front. Fixed the reorder loop to also move a dropdown's own `<li>` when none of its items match directly. Also promoted "Success Stories" out of the Proof dropdown to a top-level link in `index.html`, matching its real page position.

Verified together with Playwright after rebuilding both dist bundles — all four confirmed fixed, zero console errors.

## Current Objective (i18n: translate needed two clicks, now works on the first)

User confirmed the exact race condition flagged as unresolved in the earlier i18n session: picking a language did nothing on the first click, only the second. Full root-cause writeup in CLAUDE.md. Summary: `assets/js/i18n.js`'s `translateTo()` only checked `if (combo)` before setting `combo.value = code` — but on a cold load, Google's `<select>` exists before its `<option>` list is populated, so the value assignment silently no-oped on the first attempt. Added `comboHasOption()` and now retry (same mechanism already used for "combo not found") until the target option genuinely exists. Verified with Playwright: fresh page load → open menu → click Hindi once → full page translated within 2.5s, zero console errors.

## Current Objective (decoupled nav order from page section order)

User requested a specific nav sequence (About, Expertise, Experience, Leadership, Success Stories, Proof) that does not match the page's actual section flow — a direct conflict with the previous session's fix that made the nav auto-follow `DEFAULT_SECTION_ORDER` on every load. Full detail in CLAUDE.md. Summary: added a separate `DEFAULT_NAV_ORDER` constant in `assets/js/customizer.js`, used for the nav specifically whenever `state.sectionOrder` is still the shipped default (i.e., the user hasn't actively dragged sections in the Visual Layout Builder) — once they have, nav and sections stay coupled to their custom order as that feature is designed to. `index.html`'s authored nav order updated to match for the no-JS/SEO baseline. `DEFAULT_SECTION_ORDER` itself (which drives the actual page content order) was deliberately left untouched. Verified with Playwright: correct nav order on a fresh load, page section order unaffected, scroll-spy still correct, and the drag-customization coupling still works when actively used.

## Current Objective (85-item overhaul backlog — Phase 1: visual design system)

User handed over an 85-item backlog (numbered 15-99: design system, content, full data-driven architecture, responsive/performance/a11y/SEO, final polish). Asked 3 scoping questions before starting (format, whether to do the big architecture reversal in items 45-50, sequencing) — answers: just implement using judgment; yes do the full JSON rewrite; visual design system first. Tracked as 5 phases via TaskCreate; this pass = Phase 1 only.

Full writeup in CLAUDE.md. Summary of what changed: swapped the display typeface from single-weight Instrument Serif to variable-weight **Fraunces** everywhere it was referenced (`variables.css`, `index.html`'s font link, `customizer.js`'s font preset, `studio.css` fallbacks), which let a real heading-weight hierarchy replace the old `font-weight:400 !important` hack. Added one new rare "signature" gold token (`--signature`) used in exactly one spot (About's credentials line) — deliberately did not touch the accent/RAG-green system, which is semantically load-bearing, not decorative. Documented motion principles and consolidated button hover transitions to one shared gesture. Left section spacing, per-context button padding, and card structure alone where the existing choices were already deliberate.

Note for future verification passes: Python's `python -m http.server` intermittently drops connections under rapid Playwright automation in this environment, producing false-positive failures (fonts/icons "not loading", customizer "not initializing"). Switch to `npx http-server` for reliable local test serving.

**Next:** Phase 2 (full data-driven JSON content architecture, items 45-50) is a separate, much larger pass — not started yet.

## TL;DR — 2026-08-01 (high-level summary of the day)

Condensed version of everything above; see CLAUDE.md for the same summary and full per-topic detail.

**Committed** (`6f0a7e0`): executive content pass + homepage restructure (config-driven hero copy, new About/Insights sections, trust-signal fixes), and a dist-bundle regression fix (a JS syntax error had silently disabled theme toggle/customizer/nav/count-up sitewide) plus restored broken CTA links and the Executive Scorecard panel.

**Uncommitted** (13 modified files + new `assets/js/i18n.js` — still sitting in the working tree):
- Hero-right layout fix — KPI board/Steering Snapshot gap redistribution.
- Nav polish — hover-to-open dropdowns, a WCAG contrast fix on the active preset chip, larger Steering Snapshot cell padding.
- i18n / translate feature wired up end-to-end (Google Website Translator integration) — new file `assets/js/i18n.js`.
- Removed the navbar's scroll-triggered "smart-hide" (was reading as the menu randomly vanishing).
- One pass fixing four reported bugs: Copilot mis-answering, a dead persistent CTA, mis-highlighting scroll-spy, dropdown `<li>`s not reordering.
- i18n "second click" bug fixed (race with Google's `<select>` option population).
- Decoupled default nav link order from page section order (`DEFAULT_NAV_ORDER`).
- Phase 1 of the 85-item design-system backlog: typeface swap to Fraunces with a weight hierarchy, one restrained new accent token, consolidated button hover motion.

**Not yet committed** — worth a checkpoint commit before further work; Phase 2 (data-driven JSON content rewrite) is planned next.

## Current Objective (hero headline rewrite + rotator height/rendering fix)

User asked for new hero copy (fixed line "I own enterprise delivery —" + 4 short rotating phrases, matching a reference screenshot), with two explicit constraints: exactly two lines, and no page shift as phrases rotate. Full writeup in CLAUDE.md. Summary: updated `config.js`/`index.html` copy, added a `<br>` to make the two-line split structural rather than incidental wrap, and gave `.rotator` a fixed `height:1.15em` (`assets/css/style.css`) instead of letting it size to whichever phrase currently has `position:relative` — that's what was actually causing the page to shift, since the other phrases (position:absolute) never contributed to the container's height. Removed a mobile media query that re-enabled wrapping, since it would have defeated the fix now that all phrases are short/nowrap by design.

Found and fixed a real pre-existing bug while verifying: the gradient text effect (`background-clip:text`) was applied to the shared rotator wrapper instead of each phrase individually, so *every* phrase's text — including the ones sitting at `opacity:0` — bled through as overlapping ghost text, in the default untouched page state, at every viewport. Moved the gradient rule to target each `.ph` span directly.

Also chased and ruled out two false leads during verification (both were the test script measuring mid-transition, not real bugs) — worth remembering: this rotator needs 800ms+ settle time before a screenshot/measurement is trustworthy, not its own 500ms transition duration.

Verified with Playwright: all 4 phrases render as a clean 2-line layout matching the reference, hero height bit-for-bit identical across all 4 (843.265625px), zero horizontal overflow at 320-1400px once fully settled.

