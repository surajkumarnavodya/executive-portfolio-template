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

## Folder structure

```
executive-portfolio-template/
├── index.html                  the page
├── component-catalog.html      reusable UI catalog
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── README.md
├── LICENSE.txt
│
├── assets/
│   ├── css/
│   │   ├── variables.css       design tokens — colours, radii, shadows
│   │   ├── style.css           layout, components, typography
│   │   └── responsive.css      every media query
│   │
│   ├── dist/
│   │   ├── css/template.min.css
│   │   └── js/template.min.js
│   │
│   ├── js/
│   │   ├── config.js           ← EDIT THIS ONE
│   │   ├── config.demo.js      fictional profile, for demos
│   │   ├── components.js       reusable section component registry
│   │   ├── customizer.js       full runtime theme customizer + presets
│   │   ├── palette.js          six-palette accent switching
│   │   ├── theme.js            light/dark toggle
│   │   ├── navigation.js       scrolling, active links, mobile nav
│   │   ├── counters.js         scroll reveals, KPI count-up
│   │   ├── i18n.js             page-translation widget + locale banner
│   │   ├── fontsize.js         A / A+ / A++ text-size control
│   │   ├── ui.js               progress bar, ticker, rotator, tilt, Copilot
│   │   ├── contact-form.js     Formspree submission, validation, honeypot
│   │   └── main.js             applies config.js to the page
│   │
│   ├── images/                 profile photo
│   ├── demo-data/
│   │   └── demo-profiles.json  sample executive profile/content packs
│   └── downloads/               empty by default; see Quick start below
│
├── docs/
│   ├── Installation.md
│   ├── Customization.md
│   ├── ThemeGuide.md
│   ├── ComponentGuide.md
│   ├── UpgradeGuide.md
│   ├── BestPractices.md
│   ├── FAQ.md
│   └── Changelog.md
│
└── screenshots/
```

---

## Quick start

1. Extract the archive.
2. Open `assets/js/config.js` and change the name, email and links.
3. Replace `assets/images/profile.jpg` with your own square photo.
4. Add your résumé PDF somewhere **other than the obvious `assets/downloads/`
   path** and point `config.contact.resume` at it — `assets/downloads/` is
   named in `robots.txt`, which makes it the first path anyone scanning for
   your résumé would try. A short random folder + filename (e.g.
   `openssl rand -hex 6` for the folder, `-hex 10` for the file) is enough to
   stop blind discovery by anyone who never visits the page — it does not
   hide the file from an actual visitor, since the download link is right
   there on the page. See `docs/ReleaseQA.md` for the full reasoning.
5. Edit the page sections in `index.html` (see `docs/Customization.md`).
6. Upload the whole folder to any static host.

### Portfolio Studio

Open `studio.html` in a browser to use the optional Portfolio Studio. It provides a multi-step builder, live preview, drag/drop layout controls, demo profile/content-pack import, import/export for `portfolio.json`, and website ZIP export while keeping the original template and renderer intact.

Full walkthrough: `docs/Installation.md`.

### Component Catalog

Open `component-catalog.html` to review every reusable UI component with live examples.

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

Loaded from jsDelivr with Subresource Integrity hashes:

| Library | Version | Licence |
|---|---|---|
| Bootstrap | 5.3.8 | MIT |
| Bootstrap Icons | 1.13.1 | MIT |
| jQuery | 3.7.1 | MIT |
| Google Fonts — Inter, Fraunces, JetBrains Mono | — | SIL OFL 1.1 |

To self-host instead, download each file, drop it in `assets/`, update the paths
in `index.html`, and remove the `integrity` and `crossorigin` attributes — those
only validate over `http(s)`, and will **block** the file over `file://`.

---

## Performance notes

Built-in optimizations in this release:

- Minified production bundles: `assets/dist/css/template.min.css` and
  `assets/dist/js/template.min.js`
- Deferred script loading for non-critical JS
- Critical profile image preload
- WebP + AVIF profile image alternatives (`assets/images/profile.webp`, `assets/images/profile.avif`)
- Motion-safe fallbacks via `prefers-reduced-motion` and runtime motion controls

For further optimization, optional next steps remain:
- Replace icon font usage with inline SVG sprite/subset
- Remove jQuery dependency (all current call sites are straightforward to port)

---

## Licence

See `LICENSE.txt`. The third-party libraries above keep their own licences.

## Credits

Design and build: Suraj Kumar — <https://surajkumarnavodya.com>
