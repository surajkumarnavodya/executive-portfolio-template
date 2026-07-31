# Installation

No build tools, no command line, no npm. If you can edit a text file and upload
a folder, you can ship this.

---

## 1. Extract

Unzip the archive anywhere. You should see `index.html` at the top level
alongside an `assets` folder.

## 2. Open it

Double-click `index.html`. It opens in your browser and works immediately.

> **One caveat when opening from your hard drive.** Browsers apply stricter
> rules to `file://` pages. The three CDN files carry `integrity` and
> `crossorigin` attributes, and the security check behind those needs a real
> web server. Opening the file directly can leave the page unstyled.
>
> If that happens, either upload it to your host (step 6), or run a local server:
>
> ```bash
> # from inside the template folder
> python3 -m http.server 8000
> # then open http://localhost:8000
> ```

## 3. Edit `assets/js/config.js`

This is the only file most people need to touch. Open it in any text editor —
Notepad, TextEdit, VS Code, anything.

```js
identity: {
  name: 'YOUR NAME',
  tagline: 'YOUR ROLE'
},
contact: {
  email: 'you@example.com',
  phone: '+00 00000 00000',
  location: 'Your City',
  resume: 'assets/downloads/your-resume.pdf'
},
links: {
  linkedin: 'https://www.linkedin.com/in/your-handle',
  github:   'https://github.com/your-handle'
}
```

Save, refresh the browser. Your name and links are live.

Leave any link as an empty string (`''`) and it is skipped rather than pointing
at a dead `#`.

## 4. Replace the photo

Overwrite `assets/images/profile.jpg` with your own picture.

- Square crop, 96×96 pixels or larger
- It renders as a circle, so centre your face
- JPG or PNG both work

## 5. Add your résumé

Drop the PDF into `assets/downloads/` and set `config.contact.resume` to match:

```js
resume: 'assets/downloads/jane-doe-resume.pdf'
```

## 6. Edit the page content

Headlines, case studies, the timeline and testimonials live in `index.html` as
ordinary HTML. Open it, use Find, replace the text.

`docs/Customization.md` lists every section with the exact markers to search for,
and explains how to delete sections you do not need.

## 7. Upload

Copy the entire folder — keeping the structure intact — to any static host:

| Host | How |
|---|---|
| **Netlify** | Drag the folder onto app.netlify.com |
| **Vercel** | `vercel deploy` or connect a Git repo |
| **GitHub Pages** | Push to a repo, enable Pages in Settings |
| **Cloudflare Pages** | Connect a repo, no build command |
| **cPanel / FTP** | Upload into `public_html` |

All five work on free tiers.

## 8. Before you go live

- [ ] `config.js` updated with your details
- [ ] `assets/images/profile.jpg` replaced
- [ ] Résumé PDF in place and linked
- [ ] Section content in `index.html` rewritten
- [ ] In `index.html`, replace every `https://surajkumarnavodya.com/` with your
      own domain — this appears in the canonical tag, the OpenGraph tags and the
      JSON-LD block
- [ ] `sitemap.xml` and `robots.txt` updated with your domain
- [ ] `og-image.png` replaced (1200×630) — this is your link preview on
      LinkedIn, WhatsApp and Slack
- [ ] `favicon.svg` replaced
- [ ] Open the browser console (F12) and confirm there are no errors
- [ ] Open the Template Customizer and verify your preferred preset/theme persists after reload
- [ ] Validate section order/visibility in the visual layout builder
- [ ] If using Studio demo packs, import one and confirm preview/export works

## Troubleshooting

**The page has no styling.**
You are opening it over `file://`. See the caveat in step 2.

**Mobile layout looks wrong.**
Check that `assets/dist/css/template.min.css` is loading successfully. If you
switch to source mode, keep CSS order as `variables.css` → `style.css` → `responsive.css`.

**Icons show as empty boxes.**
The Bootstrap Icons stylesheet did not load. Check your internet connection, or
self-host the font as described in the README.

**My photo looks stretched.**
It is not square. Crop it to a 1:1 ratio.

**The Copilot widget does not answer.**
It matches on keywords in `assets/js/ui.js`. If you rewrote the page content,
update the answer set there too.
