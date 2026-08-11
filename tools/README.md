## Packaging the buyer distributable

```bash
tools/package.sh                 # -> executive-portfolio-template.zip
```
```powershell
tools\package.ps1                # -> executive-portfolio-template.zip
```

Both build the zip with `git archive` against a real commit (`HEAD` by
default), never the working directory — so `.vs/`, stray `*.patch` files, or
anything else untracked can't end up in the zip no matter what's sitting on
disk. `.github/`, `.vs/`, `tools/`, `assets/dev/`, `assets/tests/`,
`docs/ReleaseQA.md` and `screenshots/` are excluded from the archive but stay
in the repo. See the comments at the top of each script for the full
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
