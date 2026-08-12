# Installation — 10-minute setup

No build tools, no command line, no npm required to get a working site. If
you can edit a text file and upload a folder, you can ship this in about ten
minutes. (Step 9, packaging, is the one optional step that uses a terminal —
skip it and upload the folder as-is if you'd rather not.)

---

## 1. Download the package

You should have a `.zip` containing `index.html` at the top level, an
`assets/` folder, and a `docs/` folder. Unzip it anywhere.

## 2. Open the documentation

Start here. The other docs you'll want as you go:

| File | What it's for |
|---|---|
| `docs/Installation.md` | This file — the 10-minute setup |
| `docs/Customization.md` | Theme, fonts, sections, feature switches, in depth |
| `docs/ComponentGuide.md` | Every reusable component and its config shape |
| `docs/ReleaseQA.md` | Pre-launch checklist and why each item matters |
| `docs/GitHubPagesHosting.md` | GitHub Pages specifics |

Then open `index.html` directly in your browser — double-click it. It
renders immediately with placeholder content, so you always have a working
page to check your edits against.

> **One caveat when opening from your hard drive.** Browsers apply stricter
> rules to `file://` pages. The CDN files carry `integrity`/`crossorigin`
> attributes, and the security check behind those needs a real web server —
> opening the file directly can leave the page unstyled. If that happens,
> either skip ahead to step 7 (upload it), or run a local server:
>
> ```bash
> # from inside the template folder
> python3 -m http.server 8000
> # then open http://localhost:8000
> ```

## 3. Replace personal identity / configuration

Open `assets/js/config.js` in any text editor — Notepad, TextEdit, VS Code,
anything. This is the only file most people need to touch for identity,
contact and links:

```js
identity: {
  name: 'YOUR NAME',
  tagline: 'YOUR ROLE'
},
contact: {
  email: 'you@example.com',
  phone: '+00 00000 00000',
  location: 'Your City'
},
links: {
  website:  'https://yourdomain.com/',
  linkedin: 'https://www.linkedin.com/in/your-handle',
  github:   'https://github.com/your-handle'
}
```

Save, refresh the browser. Your name, tagline and links are live — `main.js`
applies them everywhere they appear, including the footer link and the
page's structured data (JSON-LD), so you don't have to find every occurrence
by hand. Leave any link as an empty string (`''`) and it's skipped rather
than pointing at a dead `#`.

## 4. Replace images

- **Profile photo** — overwrite `assets/images/profile.jpg` (square crop,
  96×96px or larger; it renders as a circle, so centre your face). JPG or
  PNG both work.
- **Social preview image** — overwrite `og-image.png` (1200×630px). This is
  the card people see when your link is shared on LinkedIn, WhatsApp or
  Slack.
- **Favicon** — overwrite `favicon.svg` with your own mark, if you have one.

## 5. Configure social links

Already covered in step 3's `links` block — `linkedin`, `github`,
`stackoverflow`, `csharpcorner` all propagate automatically to every
matching link on the page (navbar, footer, structured data) once set.

## 6. Configure résumé / contact

```js
contact: {
  resume:         'assets/downloads/your-resume.pdf',
  resumeFilename: 'Your-Name-Resume.pdf',   // what it's saved as on download
  formEndpoint:   ''                        // optional — see below
}
```

- Drop the PDF into `assets/downloads/` (or a folder of your choosing — see
  the note below) and point `resume` at it.
- `resumeFilename` controls what a visitor's browser names the downloaded
  file — set it once here rather than editing the `download="..."`
  attribute in `index.html` by hand.
- **Optional hardening:** `assets/downloads/` is a guessable path — anyone
  scanning common filenames could find your résumé without ever visiting
  the page. A short random folder + filename (e.g. `openssl rand -hex 6` for
  the folder, `-hex 10` for the file) stops that kind of blind discovery.
  This doesn't hide the file from an actual visitor — the link is right
  there on the page — see `docs/ReleaseQA.md` for the full reasoning.
- **Contact form:** if you have a [Formspree](https://formspree.io) (or
  compatible) endpoint, set `contact.formEndpoint` and the contact form
  activates automatically. Leave it empty and the form stays hidden — only
  the `mailto:` fallback shows — rather than shipping a form that silently
  fails.

## 7. Configure theme

```js
theme: {
  defaultMode:  'dark',        // 'dark' | 'light'
  accent:       null,          // e.g. '#c9a227' — leave null for the default navy/blue palette
  accentAlt:    null,          // e.g. '#8a8f98' — paired secondary accent
  showThemeToggle:    true,
  showPalettePicker:  true,
  enableCustomizer:   true     // the on-page Template Customizer panel
}
```

For a deeper pass — six built-in accent palettes, font pairings, section
show/hide/reorder, and the individual feature switches (hero rotator, KPI
count-up, scroll reveals, etc.) — see `docs/Customization.md`. You can also
make all of these changes live, in the browser, using the on-page Template
Customizer (the gear icon) — it writes its choices back into a form you can
paste into `config.js` to make them permanent.

## 8. Configure SEO metadata

Config.js covers identity/contact/links, but title, meta description,
canonical URL, Open Graph/Twitter tags and structured data (JSON-LD) live in
`index.html`'s `<head>` as plain HTML — deliberately not JavaScript-driven,
since search engines need to see the correct values in the very first
response, not after a script runs.

Open `index.html`, use Find, and replace every occurrence of
`https://example.com` with your real domain (keep the trailing slash where
it already has one) — it appears in the canonical tag, the Open Graph tags,
the Twitter tags and the JSON-LD block. Don't do a blanket "replace
`example.com`" — that would also corrupt the `you@example.com` placeholder
email and the unrelated `your-articles` placeholder link, which aren't your
domain.

Also update, in the same pass:
- `<title>` and `<meta name="description">` — your own headline and summary
- `sitemap.xml` and `robots.txt` — same placeholder domain, same find/replace
- `site.webmanifest`'s `name`/`short_name`/`description`

## 9. Build / package the website

Nothing to build for a plain upload — skip straight to step 10. If you want
a clean, validated release folder (recommended before a first deploy, and
useful any time you want to hand a finished package to someone else), run
one of the packaging scripts from a terminal in the project folder:

```bash
# macOS/Linux
bash tools/package-template.sh

# Windows
powershell -File tools/package-template.ps1
```

This produces a zipped, minified release folder and automatically runs
`tools/validate_release.js` against it — the script **fails loudly** (exit
code, printed reasons) if a required file is missing, a path is
accidentally absolute (which breaks subdirectory deploys), or a leftover
placeholder wasn't filled in. Fix what it reports and run it again.

## 10. Deploy

Copy the folder — keeping the structure intact — to any static host:

| Host | How |
|---|---|
| **Netlify** | Drag the folder onto app.netlify.com |
| **Vercel** | `vercel deploy` or connect a Git repo |
| **GitHub Pages** | Push to a repo, enable Pages in Settings — see `docs/GitHubPagesHosting.md` |
| **Cloudflare Pages** | Connect a repo, no build command |
| **cPanel / FTP** | Upload into `public_html` |

All five work on free tiers. Every internal path in this template is
relative, so it works whether your host serves it from the domain root or
from a subdirectory (e.g. a GitHub Pages project page).

---

## Before you go live

- [ ] `config.js` updated with your identity, contact, links, résumé, theme
- [ ] `assets/images/profile.jpg` and `og-image.png` replaced
- [ ] Résumé PDF in place and linked (and, optionally, moved off the
      guessable default path)
- [ ] Section content in `index.html` rewritten — `docs/Customization.md`
      lists every section with the markers to search for
- [ ] Every `https://example.com` replaced with your own domain (step 8)
- [ ] `sitemap.xml`, `robots.txt` and `site.webmanifest` updated with your
      domain/name
- [ ] `tools/validate_release.js` run clean, if you used step 9
- [ ] Open the browser console (F12) and confirm there are no errors
- [ ] Open the Template Customizer and verify your preferred preset/theme
      persists after reload

## Troubleshooting

**The page has no styling.**
You are opening it over `file://`. See the caveat in step 2.

**Mobile layout looks wrong.**
Check that `assets/dist/css/template.min.css` is loading successfully. If
you switch to source mode, keep CSS order as
`variables.css` → `style.css` → `responsive.css`.

**Icons show as empty boxes.**
`assets/css/icons.css` (the self-hosted subsetted icon font) did not load.
Check that `assets/fonts/bootstrap-icons-subset.woff2` uploaded correctly.

**My photo looks stretched.**
It is not square. Crop it to a 1:1 ratio.

**The Copilot widget does not answer.**
It matches on keywords in `assets/js/ui.js`. If you rewrote the page
content, update the answer set there too.

**A résumé/social link still shows my old value after editing `config.js`.**
Hard-refresh (the browser may be caching `config.js`). If it's a link
`main.js` doesn't cover (i.e. its `href` doesn't contain a recognised
substring like `linkedin.com`), it needs a manual edit in `index.html` — see
`docs/Customization.md`.
