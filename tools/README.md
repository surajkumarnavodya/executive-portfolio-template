## Regenerating index.template.html

```bash
node tools/build_template_content.js
```

`index.template.html` is the genericized fork of `index.html` shipped to
template buyers (via `tools/package-template.ps1`/`.sh`) — it must never
contain the live site's real name, contact details, employer history,
metrics, testimonials or résumé. Rather than hand-maintaining a second
3,600-line file that silently drifts from `index.html`, this script re-derives
it via an explicit find/replace map every time it runs: structural changes to
`index.html` (new sections, class renames, a new `data-component`) flow
through automatically since the script re-reads the current file.

Run it after any content change to `index.html` that touches real
name/contact/metric/employer/testimonial text. Each replacement checks its
match count against an expected value and the script **exits non-zero and
prints every mismatch** if `index.html` has changed in a way the map doesn't
account for — add or update the relevant `apply(...)` call, don't silently
ignore the failure, or real content can leak into the template output.

## Packaging: two profiles, two audiences

This repo ships two different products from one working tree — see
`CLAUDE.md`'s migration-plan session log for the full "live vs. template"
architecture. Each has its own packaging script; **do not use one where the
other belongs**, since each excludes exactly what the other product must
never contain.

### `package-live` — what's actually served at the real domain

```bash
tools/package-live.sh            # -> portfolio-live.zip
```
```powershell
tools\package-live.ps1           # -> portfolio-live.zip
```

Excludes the entire Studio/template system (`studio.html`,
`component-catalog.html`, `portfolio.json`, the Studio ES modules,
`assets/demo-data/`, `config.demo.js`) plus internal-only files (`CLAUDE.md`,
`AGENTS.md`, `docs/`, `README.md`, `LICENSE.txt`). This is what
`.github/workflows/deploy-live.yml` publishes to GitHub Pages instead of
Pages serving the repo root directly — see that workflow's comments for why
(`studio.html`'s Export ZIP feature fetches same-origin sibling files, which
was a real live data-exposure path before this split).

### `package-template` — the buyer distributable

```bash
tools/package-template.sh        # -> executive-portfolio-template.zip
```
```powershell
tools\package-template.ps1       # -> executive-portfolio-template.zip
```

Excludes the live site's real content (`engineering.html`,
`assets/js/config.js`, `portfolio.json`, the real profile photo, the real
résumé) and substitutes the already-authored template equivalents
(`config.demo.js`, `portfolio.template.json`, a placeholder photo) into the
archive at their real in-product paths, since `git archive` pathspecs can
exclude a path but can't substitute content at one.

### Shared mechanics

Both scripts build with `git archive` against a real commit (`HEAD` by
default), never the working directory — so `.vs/`, stray `*.patch` files, or
anything else untracked can't end up in either zip no matter what's sitting
on disk. `.github/`, `.vs/`, `tools/`, `assets/dev/`, and `assets/tests/` are
excluded from both. See the comments at the top of each script for its full
exclusion list and an example of packaging a specific tag instead of `HEAD`.

# CSS build tooling

These scripts exist because two things in this repo are **generated, not
hand-written**, and will silently drift if edited by hand:

1. `assets/dist/css/template.min.css` — the production bundle
2. the `<style id="critical-css">` block in `home.html`

They are intentionally kept outside the shipped site: nothing under `tools/`
is served, and the repo still has no build step for normal editing.

## Setup

```bash
cd tools
npm install postcss postcss-safe-parser jsdom
```

## Regenerating after a CSS change

Run these **in order** from inside `tools/`:

```bash
node build_bundle.js       # 1. variables.css + style.css + responsive.css -> dist bundle
node build_critical.js     # 2. extract first-viewport rules -> tools/critical.css
python3 inline_critical.py # 3. inline that block into home.html + defer the bundle
```

Step 3 is idempotent for the preconnect it adds, but **not** for the style
block — it expects to find the plain
`<link rel="stylesheet" href="assets/dist/css/template.min.css">`. If you have
already run it once, revert `home.html`'s head (or delete the existing
`<style id="critical-css">` and restore the plain link) before re-running.

## Auditing for dead CSS

```bash
node css_audit2.js
```

Prints every rule it believes is unreachable, plus a breakdown of *why* each
kept rule was kept. **Treat the output as a candidate list, not an instruction.**

Read the "Audit caveat" paragraph in `CLAUDE.md` before acting on it. Short
version: this site is JS-driven, so a naive purge deletes the entire light theme
(`[data-bs-theme="light"]` never matches the static DOM) along with any class
that only ever appears inside a JS string. Every rule removed in the last pass
was verified by hand against `home.html`, `component-catalog.html`,
`studio.html`, `assets/dev/theme-test.html` and every runtime JS file first.

## Composition notes

- `studio.css` is **deliberately excluded** from the bundle. `studio.html` loads
  it directly, and no bundle-consuming page uses a `.studio-*` class.
- The critical `<style>` block **must stay after** the Bootstrap and Bootstrap
  Icons `<link>`s in `home.html`, or Bootstrap wins the cascade until the async
  bundle lands.
- If you change what counts as "above the fold", edit `ATF_SELECTORS` at the top
  of `build_critical.js` (currently `.telemetry`, `nav.navbar`, `header.hero`).
