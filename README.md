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
- Executive Scorecard — labelled metric bars
- Steering Snapshot — a six-cell KPI board with count-up animation
- Case-study cards, capability matrix, experience timeline
- Certifications, awards, recommendations, contact section

**Behaviour**
- Light and dark themes, remembered per visitor in `localStorage`
- Six accent palettes with a one-click picker — see `docs/ThemeGuide.md`
- Full Theme Customizer: accent, mode, fonts, radius, motion intensity
- Eight homepage presets: CEO, CTO, CIO, Program Director, Delivery Manager, Engineering Manager, Product Leader, Consultant
- Visual layout builder: drag/drop section ordering, section toggles, live preview, reset, config export/import
- Section toggles: switch any of the eight sections off from `config.js`
- Scroll-reveal animations that respect `prefers-reduced-motion`
- Active-link navigation highlighting with clean URLs (no `#hash` litter)
- Portfolio Copilot — an on-device Q&A widget with **no network calls**
- Contact form that composes a `mailto:` message, so no backend is needed

**Engineering**
- Central `config.js` for name, contact details, links and theme
- CSS split into design tokens, components and media queries
- Reusable section component registry (`assets/js/components.js`)
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
│   │   ├── ui.js               progress bar, ticker, rotator, tilt, Copilot
│   │   └── main.js             applies config.js to the page
│   │
│   ├── images/                 profile photo
│   ├── data/
│   │   ├── demo-profiles.json  sample executive profile/content packs
│   └── downloads/              put your résumé PDF here
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
4. Drop your résumé into `assets/downloads/` and point `config.contact.resume` at it.
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
| Bootstrap | 5.3.3 | MIT |
| Bootstrap Icons | 1.11.3 | MIT |
| jQuery | 3.7.1 | MIT |
| Google Fonts — Inter, Instrument Serif, JetBrains Mono | — | SIL OFL 1.1 |

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
