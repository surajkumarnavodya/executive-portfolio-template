# Executive Portfolio Template

A single-page portfolio built for senior technical and delivery roles — Software
Engineer, Technical Lead, Project Manager, Delivery Manager, Program Manager,
Engineering Director.

It ships as plain HTML, CSS and JavaScript. There is no build step, no npm
install and no framework to learn. Open `index.html` in a browser and it works.

---

## Features

**Layout**
- Executive hero with a rotating headline, proof-point ribbon and one primary CTA
- Steering Snapshot — a six-cell KPI board with count-up animation
- Case-study cards, capability matrix, experience timeline
- Certifications, awards, recommendations, contact section

**Behaviour**
- Light and dark themes, remembered per visitor in `localStorage`
- Six accent palettes, collapsed into a single toggle + dropdown — see `docs/ThemeGuide.md`
- Full Theme Customizer: accent, mode, fonts, radius, motion intensity
- Eight homepage presets: CEO, CTO, CIO, Program Director, Delivery Manager, Engineering Manager, Product Leader, Consultant
- Visual layout builder: drag/drop section ordering, section toggles, live preview, reset, config export/import
- Section toggles: switch any of the 11 content sections off from `config.js`
- Site-wide text-size control (A / A+ / A++), remembered per visitor
- Optional one-click page translation via Google's Website Translator widget, with a locale-based suggestion banner
- Scroll-reveal animations that respect `prefers-reduced-motion`
- Active-link navigation highlighting with clean URLs (no `#hash` litter)
- Portfolio Copilot — an on-device Q&A widget with **no network calls**
- Contact form with client-side validation and honeypot spam protection,
  submitting to a Formspree endpoint you configure — falls back to a plain
  `mailto:` link if no endpoint is set, and the form itself stays hidden
  until one is, so nothing broken ever ships by default

**Engineering**
- Central `config.js` for name, contact details, links and theme
- CSS split into design tokens, components and media queries
- Reusable section component registry (`assets/js/components.js`)
- Deterministic build scripts (`tools/build_bundle.js`, `tools/build_bundle_js.js`)
  regenerate the production CSS/JS bundles from source — no hand copy-paste
- Seven breakpoints, verified at 320 / 375 / 576 / 768 / 992 / 1200 / 1600px
- Subresource Integrity on every CDN dependency
- SEO package: OpenGraph, Twitter Card, Schema.org JSON-LD, sitemap, robots.txt
- Accessible: skip link, `<main>` landmark, `:focus-visible` rings, `aria`
  labels, arrow-key palette navigation, 46px minimum tap targets

---

## What's in this download

Everything under **Your website** is required and live. Everything under
**Optional tools** is safe to open locally or delete entirely — none of it
is loaded by `index.html`, so removing it changes nothing about how your
site looks or works.

**Your website** (required)
```
index.html                      ← the page — open this in a browser first
robots.txt, sitemap.xml,
site.webmanifest, favicon.svg   SEO/PWA basics — all reference the placeholder
                                 domain "example.com"; replace with your own
og-image.png                    social-preview placeholder — replace before publishing
assets/css/, assets/fonts/,
assets/images/, assets/js/,
assets/dist/                    styles, self-hosted icon font, images, source
                                 JS, and the production CSS/JS bundles
assets/js/config.js             ← EDIT THIS ONE: name, contact details, links
assets/downloads/                empty by default; see Quick start below
```

**Optional tools** (not required to run the site — delete before deploying if
you don't want them reachable on your live domain; see
`docs/GitHubPagesHosting.md` for why that matters)
```
studio.html                     visual builder — drag/drop layout, live preview,
component-catalog.html          config export/import, ZIP export
assets/css/studio.css,
assets/js/studio-app.js,
assets/js/content-service.js,
assets/js/asset-store.js,
assets/js/portfolio-data-service.js
assets/demo-data/                fictional sample content, only for Studio's
                                 own demo-pack picker — never rendered on
                                 index.html regardless of config
portfolio.json                  Studio's own save format, independent of config.js
```

**Documentation**
```
README.md, LICENSE.txt
docs/Installation.md, Customization.md, ThemeGuide.md, ComponentGuide.md,
     UpgradeGuide.md, BestPractices.md, FAQ.md, Changelog.md, GitHubPagesHosting.md
screenshots/                    marketplace listing images
```

---

## Quick start

1. Extract the archive.
2. Open `assets/js/config.js` and change the name, email and links.
3. Replace `assets/images/profile.jpg` (+ `.webp`/`.avif`) with your own square photo.
4. Replace `og-image.png` (1200×630) with your own social-preview image.
5. Edit `robots.txt` and `sitemap.xml` — both ship pointing at the placeholder
   domain `example.com` (each file says so in its own comment); replace it
   with your real domain, or search engines won't find your sitemap. Do the
   same for `site.webmanifest`'s `name`/`short_name`/`description`.
6. Add your résumé PDF somewhere **other than the obvious `assets/downloads/`
   path** and point `config.contact.resume` at it — `assets/downloads/` is
   named in `robots.txt`, which makes it the first path anyone scanning for
   your résumé would try. A short random folder + filename (e.g.
   `openssl rand -hex 6` for the folder, `-hex 10` for the file) is enough to
   stop blind discovery by anyone who never visits the page — it does not
   hide the file from an actual visitor, since the download link is right
   there on the page. See `docs/ReleaseQA.md` for the full reasoning.
7. Edit the page sections in `index.html` (see `docs/Customization.md`).
8. Decide what to do with the **Optional tools** above (keep, delete, or
   deploy them only to a private/staging location — never your public domain
   alongside real content; see `docs/GitHubPagesHosting.md`).
9. Upload the whole folder to any static host — see "Deployment" below for
   GitHub Pages / Netlify / Cloudflare Pages / Vercel specifics.

### Portfolio Studio

Open `studio.html` in a browser to use the optional Portfolio Studio. It provides a multi-step builder, live preview, drag/drop layout controls, demo profile/content-pack import, import/export for `portfolio.json`, and website ZIP export while keeping the original template and renderer intact.

Full walkthrough: `docs/Installation.md`.

### Component Catalog

Open `component-catalog.html` to review every reusable UI component with live examples.

---

## Deployment

This is a static site — any host that serves plain files works. All internal
links are relative (no leading `/`), so the site works identically whether
it's deployed at your domain's root or in a subdirectory (e.g. a GitHub
Pages *project* page at `username.github.io/repo-name/`).

**GitHub Pages**
1. Push this folder to a GitHub repo.
2. Settings → Pages → Source → deploy from a branch (root).
3. Full walkthrough, including the Studio-exposure warning above: `docs/GitHubPagesHosting.md`.

**Netlify**
1. Drag-and-drop the extracted folder onto [app.netlify.com/drop](https://app.netlify.com/drop), or connect the repo.
2. Build command: none. Publish directory: `/` (the repo root).

**Cloudflare Pages**
1. Connect the repo (or use direct upload).
2. Build command: none. Build output directory: `/`.

**Vercel**
1. Import the repo, or run `vercel` from this folder with the Vercel CLI.
2. Framework preset: **Other**. Build command: none. Output directory: `./`.

None of these need a `vercel.json`/`netlify.toml`/build config — there's
nothing to build.

---

## Production bundle vs source files

`index.html` loads the minified production bundle:

```html
<link rel="stylesheet" href="assets/dist/css/template.min.css">
<script defer src="assets/js/config.js"></script>
<script defer src="assets/dist/js/template.min.js"></script>
```

Source files remain in `assets/css/` and `assets/js/` for customization and maintenance.

---

## Browser support

| Browser | Version |
|---|---|
| Chrome / Edge | 90+ |
| Firefox | 90+ |
| Safari | 14+ |
| iOS Safari | 14+ |
| Android Chrome | 90+ |

Internet Explorer is not supported. The template uses CSS custom properties,
`IntersectionObserver` and CSS Grid.

---

## Dependencies

CDN, loaded from jsDelivr with Subresource Integrity hashes:

| Library | Version | Licence |
|---|---|---|
| Bootstrap (CSS only — see below) | 5.3.8 | MIT |
| Google Fonts — Inter, Fraunces, JetBrains Mono | — | SIL OFL 1.1 |

To self-host instead, download the file, drop it in `assets/`, update the path
in `index.html`, and remove the `integrity`/`crossorigin` attributes — those
only validate over `http(s)`, and will **block** the file over `file://`.

Self-hosted, part of this repo:

| Asset | Source | Why |
|---|---|---|
| `assets/css/icons.css` + `assets/fonts/bootstrap-icons-subset.woff2` | Bootstrap Icons 1.13.1, subsetted | index.html/engineering.html use 69 of ~2000 glyphs; self-hosting the full CDN CSS+font cost 221KB and 2 requests for those 69 icons. See the regeneration recipe in `assets/css/icons.css`'s own header. |
| `assets/js/bs-shim.js` (compiled into `template.min.js`) | Hand-written, ~2KB | Replaces the Bootstrap JS CDN bundle (jQuery-free build was still ~80KB incl. Popper). This site only ever used 2 of Bootstrap's components — Collapse (mobile nav) and Dropdown (2 nav menus, positioned by plain CSS, no Popper needed) — see the file's own header for the full reasoning. |

**jQuery has been removed entirely** (was 3.7.1, MIT) — every call site (`counters.js`'s
count-up, `navigation.js`'s scroll-spy/clean-url routing, `theme.js`'s toggle)
is now vanilla JS with identical behavior.

---

## Performance notes

Built-in optimizations in this release:

- Real minified production bundles (terser for JS, csso for CSS) —
  `assets/dist/css/template.min.css` and `assets/dist/js/template.min.js`.
  Previously these were only concatenated, not actually minified, despite
  the filename; see `tools/README.md` for the regeneration commands.
- No jQuery, no Bootstrap JS bundle — see Dependencies above.
- Self-hosted, subsetted Bootstrap Icons (69 glyphs, ~13KB total vs. 221KB
  for the full CDN CSS+font).
- Inlined critical (above-the-fold) CSS on both `index.html` and
  `engineering.html`, regenerated via `tools/build_critical.js` — the full
  bundle loads non-blocking via a preload→stylesheet swap.
- Google Fonts CSS also loads non-blocking (same preload→swap pattern);
  Fraunces' variable-weight axis is requested as 400..700, not the family's
  full 300..700 range, since nothing on the site uses a lower weight.
- Deferred script loading for non-critical JS; the on-page Template
  Customizer's settings panel (sliders, presets, layout builder) builds on
  the browser's next idle moment rather than blocking initial load.
- Critical profile image preload, with explicit `width`/`height` to avoid
  layout shift.
- WebP + AVIF profile image alternatives (`assets/images/profile.webp`, `assets/images/profile.avif`)
- Motion-safe fallbacks via `prefers-reduced-motion` and runtime motion controls

For further optimization, the largest remaining opportunity is Bootstrap CSS
itself (232KB raw from the CDN) — this template uses a meaningful slice of
its grid/flex/navbar/dropdown utilities throughout the markup, so subsetting
it safely needs a proper PurgeCSS-style pass verified page-by-page, not a
quick trim. Out of scope for an incremental pass; a documented audit caveat
already exists in `tools/README.md`'s "Auditing for dead CSS" section for
why a naive purge is unsafe here.

---

## Licence

See `LICENSE.txt`. The third-party libraries above keep their own licences.

## Credits

Design and build: Suraj Kumar — <https://surajkumarnavodya.com>
