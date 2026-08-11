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


---

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

---

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

---

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

---

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

---

**NOTE (this session):** This file had drifted out of sync with `CLAUDE.md` —
several sessions' worth of log entries after the one above were never mirrored
here (dropdown/mobile-nav fixes, the perf pass, hero copy work, trust-signal
audit, About section, hero tone variants, the visual-clutter audit, the
regression-fix pass, i18n wiring, the four-bug pass, nav-order decoupling, the
Phase 1 design-system pass, and the hero headline rewrite are all in
`CLAUDE.md` but not here). Only today's entry is appended below; the backlog
of missing entries was left alone rather than bulk-copied without being asked.

### Recruiter-conversion review: Priority 1 (hero 3-CTA row, case-study restructure)
User pasted an external hiring-manager-style review of the site plus a detailed 17-section enhancement spec, both aimed at recruiter conversion for Microsoft/Amazon/Google/Atlassian-tier hiring managers. Scoped it against the existing 85-item design-system backlog (Phase 1 — visual design — already done; this review largely restates later phases in more detail) and agreed with the user to implement only "Priority 1" now — hero 3-CTA row, executive impact dashboard, case-study restructure — then re-plan the rest (career timeline, delivery framework, leadership philosophy, project gallery, testimonials-with-photos, recruiter resume-variant downloads, executive-snapshot PDF, SEO/schema, micro-interactions) as a later pass, since several of those need real assets (photos, region-specific resumes) the user hasn't supplied yet.

**Audited before touching anything (worth remembering):** `kpi-cards` and `success-stories` are registered components in `components.js` but **`main.js` never calls `render()` for either** — both the Steering Snapshot's 6 KPI values and all 6 Success Stories cards are hand-authored static HTML with zero config binding, unlike `hero`/`about`/`insights`. Concluded the "Executive Impact Dashboard" ask was already substantially satisfied by the existing Steering Snapshot (₹2Cr+, 95%+ on-time, −20% risk, 30+ engineers, +30% adoption, 98% deployment — a near-exact match to the review's target metric set) plus the Executive Scorecard right above it (which the user explicitly asked to have restored in an earlier regression-fix session) — left both untouched rather than risk re-triggering the "redundant dashboard" complaint that was already resolved once.

- **Hero CTA row** (`index.html:2578-2581`, mirrored in `assets/js/config.js` `hero.secondaryCtas`) — was 2 real CTAs (Schedule, View case studies) + 1 icon-only LinkedIn link, with no résumé download reachable from the hero (only from Contact). Confirmed via the `hero` renderer in `components.js` that `secondaryCtas[i]` maps onto `.hero-cta .btn-outline` elements *by position*, so the fix had to change markup and config together: removed the LinkedIn icon anchor (already present with `rel="me"` in the footer and Recognition section — not the only place it lives), added a `Download Resume` anchor using the same `href="Suraj_Kumar_Resume_Technical_PM.pdf" download` pattern as the Contact section's résumé link (`main.js`'s `each('a[download]', ...)` rewrites every such anchor's href from `cfg.contact.resume` site-wide, so no new wiring was needed). Final row: Schedule an Executive Conversation → Download Resume → View case studies.
- **Success Stories restructured into consulting-style case studies** (`index.html:2977-3028`) — the 3 large cards (Narada/SEBI, CDP/L&T Construction, Easy Skills) each expanded from one narrative paragraph into explicit Challenge → Approach → Leadership → Technology → Business Outcome → Lessons Learned blocks. Reused existing classes only, no new CSS: `.pov-label` (already the site's small-caps sub-header pattern, used for the About pillars) for each block's header, `.text-2` for body copy, `.case-stack` relabeled `Technology` (was `Stack`), `.result-line` kept as-is for Business Outcome. The 3 small one-liner cards (HRMS, Bid Advisory, eClaim) were left alone — they're supplementary quick-hits, not full case studies, and restructuring them would have made the section overlong.
- No `components.js`/`main.js`/dist-bundle changes — the `hero` renderer's field-mapping logic didn't change (only its config data did), and `success-stories`'s renderer already only touches `.sec-title` (untouched). `config.js` loads standalone, not through the bundle. So this pass needed no dist rebuild, unlike most sessions in this log.

**Verified with Playwright** (`npx http-server` + `npx playwright`, same pattern as the design-system pass): hero CTA row renders exactly `["Schedule an Executive Conversation", "Download Resume", "View case studies"]`, zero console errors, all three restructured case-study cards screenshot cleanly with no overlap or truncation, two-column CDP/Easy Skills pair stays evenly matched height-wise.

**Next up:** re-plan the remaining review items (career timeline, leadership philosophy, delivery framework, project gallery, testimonials with photos, recruiter resume-variant downloads, Executive Snapshot PDF, SEO/schema, micro-interactions) as a follow-up phase — flagged to the user that several need real assets (headshots, region-specific résumé files) not yet supplied.

### Recruiter-conversion review: Phase 2 (audited-first — 2 of 5 items already existed)
Re-planned the remaining review items against the actual current site before writing code. Two of five turned out to already exist under different section names: **Leadership Philosophy** (`#leadership`'s "Operating principles" sub-block already has this — 4 named principle cards) and **Thought Leadership** (already spread across `#leadership`'s SO/C#-Corner proof strip, `#insights`' article cards, and `#recognition`'s certifications/awards — did not fabricate GitHub/Talks since `links.github` is empty). Left both untouched rather than duplicate.

Genuinely new work, implemented and Playwright-verified: new `#delivery-framework` section (9-step "How I work" process, 3x3 `.x-card` grid, registered end-to-end through config.js/components.js/main.js/customizer.js, mirrored to dist bundle); filterable category chips on Success Stories (`.ss-filter-bar`, reuses `.preset-chip` styling, `data-filter` attributes decoupled from visible `.tag` text so relabeling can't break the filter, new IIFE appended to `ui.js` and mirrored to dist); generated `og-image.png` (1200x630, project root) via a standalone branded HTML page screenshotted with Playwright — the meta tags already pointed at this path but the file never existed, so shared links were rendering blank. Full detail in `CLAUDE.md`.

Still blocked on assets from the user: testimonials with real photos, region-specific résumé PDF variants, the Executive Snapshot one-pager PDF.

### Recruiter-conversion review: content-quality rewrite + case studies expanded to 10 fields
A third variant of the same review asked for a full site-wide content rewrite plus expanding Success Stories to a 10-field consulting structure. Audited every section's copy first — nearly all of it (Hero, About, Leadership, Delivery Framework, Experience, AI Leadership, Expertise, Insights, Contact) is already executive-tone from ~15 prior sessions of tuning, so a wholesale rewrite was skipped in favor of fixing the actual weak spots: the 2 of 3 small Success Stories cards (Bid Advisory, eClaim) that had no quantified outcome, rewritten without fabricating metrics that don't exist. Expanded all 3 major case studies (Narada, CDP, Easy Skills) to the full 10-field structure (adds Business Context, Team Composition, Strategy, Risks Managed, Key Decisions) — genuinely new content grounded in facts already established elsewhere on the site, not invented specifics. Verified with Playwright; one false alarm (a blank gap in an unscrolled section screenshot) traced to `.reveal` animations not firing for off-viewport content, not a real bug. Full detail in `CLAUDE.md`.

### Trimmed Executive Scorecard to 5 rows, deduped against Steering Snapshot / hero highlights
Removed 2 of the Executive Scorecard's 7 rows that duplicated meaning already present elsewhere: "Delivery Success 98%" (duplicate of Steering Snapshot's "98% Deployment & Delivery Success" and the hero highlights' "98% Delivery Excellence") and "Budget Adherence 97%" (restates the budget half of "95%+ on-time, on-budget delivery"). Kept Client Satisfaction, SLA Compliance, Production Stability, Resource Utilization, Audit Success. `index.html` only. Verified with Playwright — correct 5 rows, no layout gap.

**Follow-up:** restored the panel's original ~304px height (measured, was 238.5px at 5 rows) by growing `.exec-scorecard .row-item` padding from 7px to 13.5px top/bottom (math: 74.75px fixed overhead + 5 x rowHeight = 304 -> rowHeight ~45.85px). Added in 3 places to win every cascade: end of `assets/css/style.css`, end of the style.css portion in `assets/dist/css/template.min.css`, AND the very end of `index.html`'s inlined critical-CSS block (the scorecard is above-the-fold, so skipping that copy would flash the shorter height on first paint before the async bundle loads). Full detail in `CLAUDE.md`.

### Bootstrap upgrade ("look as per new bootstrap and WordPress and Drupal best site")
Ambiguous request — asked via AskUserQuestion rather than guessing between visual redesign / platform migration / version upgrade (a migration would violate the static-site-only constraint; a redesign would undo prior design-system work). User chose: upgrade Bootstrap + refine components to current best practice, keep the existing look. Bumped Bootstrap 5.3.3->5.3.8 and Bootstrap Icons 1.11.3->1.13.1 (confirmed actual latest via web search) in `index.html` and `component-catalog.html`. Computed real SHA-384 SRI hashes locally from the downloaded CDN files rather than guessing them (a wrong hash silently blocks the script load). Audited navbar-toggler/dropdown ARIA against current Bootstrap 5.3 conventions — already correct from earlier accessibility sessions, no changes needed. Verified with Playwright: `bootstrap.Tooltip.VERSION` reports 5.3.8 at runtime, dropdown/mobile-toggle/theme-toggle all still work, zero console errors. Full detail in `CLAUDE.md`.

### Credibility/accuracy corrections pass (Executive Scorecard removed, "8+ years" -> "7+ years", SEO/a11y cleanup)
17-item surgical correction list aimed at removing content that read as invented and fixing accessibility/SEO issues — explicitly not a redesign. Key finding: hero/about copy is rendered by `config.js` at load time (overwrites the static HTML), so the "8+ years" -> "7+ years" fix had to land in both `index.html` and `config.js` or JS-enabled visitors would see stale text.

Deleted the `.exec-scorecard` block entirely (unsourced 96-100% dashboard); its CSS left as an inert no-op per this file's established convention. Steering Snapshot: removed the `LIVE` badge, retitled to "DELIVERY TRACK RECORD - 2021-2026" with a one-line sourcing caption. "8+ years"/"Eight years" fixed everywhere (meta description, hero value-statement in both `index.html` and `config.js`, About lede in both, Expertise heading). AI Leadership cert badge IN PROGRESS -> COMPLETED; "Computer Vision - learning" removed from both skill lists (don't list in-progress skills next to held ones). Stack Overflow tag stats collapsed to one line (dropped the row that summed past 100%). Testimonials anonymized names -> NAME/TITLE/COMPANY placeholders + a permission reminder comment. Insights cards -> ARTICLE_URL/TITLE/DATE placeholders (were linking to generic profile pages) + a reminder comment. JSON-LD Person schema gained `description`/`image`/`alumniOf`/expanded `knowsAbout`. Removed `<meta name="keywords">` and `twitter:site`/`twitter:creator`; `og:image`/`twitter:image` changed from a hardcoded domain to a bare-relative path (not root-relative — a leading slash would break a demo host serving from a subdirectory).

Nav dropdown toggles (`Expertise`/`Proof`) are real `<button>`s now, not `href="#"` links, with `aria-controls`. Verified Bootstrap's own `.nav-link{background:0 0;border:0}` rule already neutralizes default button chrome — no extra CSS reset needed (one was added then removed after confirming this). Did not add duplicate jQuery click/keydown handlers — Bootstrap's `data-bs-toggle="dropdown"` and the existing hover-open logic in `navigation.js` already handle click + Enter/Space by class/attribute selectors, unaffected by the tag change. Duplicate "Start a conversation" CTA (`.persistent-cta`) got `aria-hidden="true"` **and** `tabindex="-1"` (aria-hidden alone on a focusable link is a WCAG anti-pattern). Copilot "Ctrl K" hint: found `responsive.css` already hid it below 576px (already live in the dist bundle) — widened to 767.98px in both `responsive.css` and its dist-bundle mirror to actually match the "~768px" ask, since `assets/css/*.css` aren't linked directly, only the concatenated dist bundle is. Contact section: phone removed (kept as a restore comment), added a LinkedIn `c-item`, reworded the location line.

Flagged instead of guessed: did not add a "queries sent to a third-party AI API" privacy sentence near the Copilot — it's a fully on-device keyword-matching KB (confirmed via its own "NOTHING LEAVES YOUR BROWSER" copy and this file's own history), so that claim would have been fabricated, the opposite of this session's goal. Verified everything end-to-end with Playwright against a local `http-server` — zero console errors. Full detail in `CLAUDE.md`.

**Follow-up — resized the Delivery Track Record box to its content.** Removing the Executive Scorecard above left `.hero-right .kpi-board{flex:1 1 auto}` (written for two cards sharing the column) growing alone to fill the full hero-left column height — measured 512px tall with ~220px of dead space. Changed to `flex:0 0 auto` (dropped the now-pointless row-centering compensator alongside it) so it sizes to its own content — 266px after, top-aligned. Updated in all 3 places this rule lives: `assets/css/responsive.css`, its dist-bundle mirror, and the inlined critical-CSS block in `index.html`. Verified at 1024/1200/1440px with Playwright — clean at all three. Full detail in `CLAUDE.md`.

### New page: engineering.html — technical-audience view of the same site
User is also interviewing for Senior .NET Full Stack Lead roles and wanted a second page for technical interviewers, same design system, plus a nav toggle on both pages ("Delivery" / "Engineering") to switch views.

Key finding before writing content: `customizer.js`'s `init()` unconditionally calls `applyPreset()` on every load regardless of whether `config.js` is present, defaulting to the `deliveryManager` preset and overwriting `#top`'s hero content via `PortfolioComponents.render('hero', ...)`. Traced into `components.js`'s `create()`: it does `document.querySelector(selector)` once at bundle-execution time and only registers a component if that succeeds — so simply not using `id="top"` (used `id="eng-hero"` instead) or `id="main"` (used `id="eng-content"`) makes those two lookups permanently fail, and every later `render()` call against them — automatic or user-triggered — silently no-ops. Grepped every other bundled source file for `PORTFOLIO_CONFIG` first to confirm nothing else has a similar landmine. Net result: `engineering.html` loads the same dist CSS/JS bundle as `index.html` but not `config.js` — theme, palette, nav, reveals, count-up, i18n and Copilot all work identically for free; confirmed empirically with Playwright, not just by reading source.

Content is entirely traced to facts already on the delivery page (7+ years .NET, 430+ SO answers, 795k reach, 2× C# Corner MVP) plus the project facts the user supplied directly (DualLens Analytics, Autonomous Financial Analyst / Johns Hopkins capstone) — `PLACEHOLDER_*` for the two project repo links, real production URL for the portfolio-site card (not a placeholder, genuinely live). Current Stack section leaves the "current vs previously used" split as an explicit placeholder rather than guessing. Stack Overflow section reuses `index.html`'s markup verbatim (same real numbers), only the framing copy changed. Full detail in `CLAUDE.md`.

**Real regression caught mid-verification:** the new nav toggle's text labels pushed `index.html`'s already-tight navbar-expand-xl band into genuine overflow ("Start a conversation" clipped past the viewport edge, 1200-~1460px) — `engineering.html` has one fewer nav item and was never actually broken, which is what made it easy to miss testing only one page. Fixed with an icon-only toggle (aria-label carries full text) in a dedicated `@media (min-width:992px) and (max-width:1499px)` band, plus a small palette-picker/gap trim in the same band. Swept 992-1920px on both pages afterward, zero overflow. Also: briefly used `git stash` mid-investigation to compare against the pre-change state, which reverted every tracked-file change from the session — caught immediately, fully recovered with `git stash pop`, nothing lost. `git show HEAD:<path>` into a throwaway location is the correct non-destructive way to do this, not `git stash`. Full detail in `CLAUDE.md`.

### Site-wide text-size control (A / A+ / A++ dropdown)
User asked for a dropdown with three levels — A, A+, A++ — to increase/decrease the whole site's text size, A as default.

Deliberately used CSS `zoom` on `<html>` (`:root[data-fontsize="lg"]{zoom:1.12}` / `xl{zoom:1.25}`, no rule for default `md`) instead of a root font-size/rem approach: this template's type is authored in `px`/`clamp()` throughout, not `rem`, so a rem-relative change wouldn't reach most of it. Zoom now has solid cross-browser support and reproduces exactly the effect a visitor expects from "bigger text."

New `assets/js/fontsize.js` (same shape as `palette.js`: `localStorage['th-fontsize']`, applies the attribute immediately to avoid a flash, builds a 3-item dropdown menu dynamically like `i18n.js`'s `.lang-menu`, Escape/outside-click/arrow-key handling, `window.PortfolioFontSize` API). No `config.js` entry needed, matching `theme.js`. Markup (`.fontsize-switch`) added to the navbar utility cluster on both `index.html` and `engineering.html`, right after `.lang-switch`. CSS appended to `assets/css/style.css` and mirrored into `index.html`'s inlined critical-CSS block (navbar is above the fold). `fontsize.js` concatenated into `assets/dist/js/template.min.js` after `i18n.js`; `node -c` passes.

**Real regression caught by measuring, same class of bug as the engineering.html session above:** the new control's added width broke the `(min-width:992px) and (max-width:1499px)` compacting band again — overflow at 1200px (~16px) and, worse, a new gap at 1500-1599px where the band's old upper bound let everything return to full size right where the new control alone didn't fit. Fixed by tightening the band's shrink values further (gap `6px→3px`, `.fontsize-toggle` down to `min-width:24px;padding:0 3px;font-size:10px`, values chosen with real spare margin via `addStyleTag` experiments, not just zeroed-out overflow) and raising the band's upper bound from `1499px` to `1599px`. Swept 992-1920px on both pages post-fix — zero overflow, zero console errors. Full detail in `CLAUDE.md`.

### Résumé PDF moved off a guessable path
Follow-up to a security question about the resume asset — the file's own contents were already clean (no active content, generic metadata), but its path (`Suraj_Kumar_Resume_Technical_PM.pdf` at the repo root, the person's real name) was trivially guessable by a blind scanner that never visited the page. User authorized moving/renaming it.

`git mv`'d it to `assets/<12-hex-chars>/<20-hex-chars>.pdf` (tokens from `openssl rand -hex`), updated `assets/js/config.js` → `contact.resume` plus the two matching static `<a download>` hrefs in `index.html`/`engineering.html`. Deliberately did **not** add the new path to `robots.txt` — its existing `Disallow: /assets/downloads/` line is exactly the anti-pattern this change avoids, since robots.txt is public and that line publishes the folder name to anyone who reads it. Rewrote `docs/ReleaseQA.md`'s buyer-guidance row and `assets/downloads/README.txt` (which used to tell buyers to put their resume in that exact robots.txt-advertised folder — now corrected) to teach the random-path convention instead. Left the Studio demo/sample profiles' unrelated references to `assets/downloads/...` alone. Verified with a local `http-server`: old path 404s, new path serves 200 as `application/pdf`, both pages' download links resolve correctly, zero console errors. Full detail in `CLAUDE.md`.

**Note:** discovered this session that a third memory file, `AGENTS.md`, also claims to be kept in sync with this file but is several sessions behind (missing the credibility pass, engineering.html, and font-size sessions). Not backfilled this session — flagged for future sessions to mirror updates into `AGENTS.md` too, not just this file.

### v1.5.1 — six-item defect pass
Fixed six user-filed defects in order: (1) relative `og:image`/`twitter:image`/JSON-LD `image` URLs → absolute; (2) removed stale `worksFor: LTIMindtree` + `telephone` from JSON-LD, added PMP/CSM as `EducationalOccupationalCredential` entries; (3) renamed `assets/data/` → `assets/demo-data/` (all 5 files were fictional sample content), wrapped each as `{_comment, items}`, and added a guard in `renderer.js` that refuses to render any `data.path` containing `"demo"` unless the page is `studio.html` — flagged but did not fix the same fictional-testimonial pattern also present in root `portfolio.json`, out of the scope the user named; (4) deleted `perf-optimizations.patch` (confirmed already applied) + WebP screenshot duplicates, added new `tools/package.sh`/`package.ps1` building the buyer zip via `git archive` against `HEAD` with pathspec excludes so untracked junk (`.vs/`, etc.) can't ship; (5) cut the eager Google Fonts request from 5 families to 3 (Inter/Fraunces/JetBrains Mono), made Source Sans 3 + Playfair Display load on demand from `customizer.js` only when a visitor picks that preset — could not measure actual byte savings locally since `fonts.googleapis.com` was unreachable from this session's sandbox; (6) added `engineering.html` to `sitemap.xml`, refreshed `lastmod`. Mirrored `renderer.js`/`customizer.js` changes into `assets/dist/js/template.min.js` by editing its existing sections directly rather than a full regenerate, verified against a from-scratch rebuild diff. Full detail in `CLAUDE.md` and `docs/Changelog.md` v1.5.1.
