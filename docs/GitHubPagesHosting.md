# Hosting This Site on GitHub Pages

A complete, step-by-step guide to publishing this portfolio (or the Studio
tool) as a live website using GitHub, for free, with your own domain if you
want one.

This guide assumes no prior Git experience. If you already know Git, skip to
[Step 3](#step-3-push-the-site-to-github).

---

## What you're deploying

This is a **static site** — plain HTML, CSS, and JavaScript, with no build
step, no `npm install`, and no server-side code. That makes GitHub Pages a
perfect fit: you push the files as-is, and GitHub serves them directly.

The entire repository root becomes the website root. Concretely:

| On GitHub (repo root) | Becomes live at |
|---|---|
| `index.html` | `https://yourdomain.com/` |
| `studio.html` | `https://yourdomain.com/studio.html` |
| `assets/css/style.css` | `https://yourdomain.com/assets/css/style.css` |
| `assets/dist/js/template.min.js` | `https://yourdomain.com/assets/dist/js/template.min.js` |

**Nothing needs to move.** Upload the folder exactly as it is, keeping every
subfolder (`assets/`, `docs/`, `screenshots/`) intact, with `index.html`
sitting at the top level (repo root) — not inside a subfolder.

> **If you fill in `index.html`/`config.js` with your own real name, contact
> details or résumé, do not also deploy `studio.html` at that same domain.**
> Studio's "Export Website ZIP" button fetches whatever files are sitting next
> to it — including `index.html` and `config.js` — and zips them up. If both
> are live at the same origin, anyone who opens `studio.html` and clicks
> Export can download your real content. Either drop `studio.html` (and
> `portfolio.json`, `assets/js/studio-app.js`, `assets/js/content-service.js`,
> `assets/js/asset-store.js`, `assets/js/portfolio-data-service.js`,
> `assets/demo-data/`) from what you push live, or keep Studio only on a
> separate domain/repo from your real site.
>
> **If you're working from the full source repo** (cloned via Git, with a
> `tools/` folder present), `tools/package-live.sh` / `tools/package-live.ps1`
> build exactly that "real site only" file set for you automatically — see
> `tools/README.md`. Run `node tools/validate_release.js --mode live --zip
> <output.zip>` afterward; it fails loudly if Studio (or any other dev-only
> file) ends up in the artifact.
>
> **If you received this as a template ZIP** (unzipped a purchased download,
> no `tools/` folder, no Git repo), you won't have that script — the
> packaging step already happened before you got it. Studio *is* included in
> the template ZIP as a documented optional feature (see the root `README.md`
> → Quick start → "Portfolio Studio"), so once you've filled in `index.html`/
> `config.js` with your own real content, manually delete `studio.html`,
> `component-catalog.html`, `assets/css/studio.css`, `assets/js/studio-app.js`,
> `assets/js/content-service.js`, `assets/js/asset-store.js`,
> `assets/js/portfolio-data-service.js` and `assets/demo-data/` before
> uploading — or keep them, but only on a private/staging deployment, never
> the same public domain as your real site.

---

## Prerequisites

- [ ] A free [GitHub account](https://github.com/join)
- [ ] [Git installed](https://git-scm.com/downloads) on your computer
      (skip this if you'd rather upload via the browser — see
      [Option B](#option-b-upload-through-the-github-website-no-git-required))
- [ ] The site folder, unzipped, on your computer

---

## Step 1: Create the repository

1. Go to [github.com/new](https://github.com/new).
2. **Repository name:**
   - If you want your site at `https://<username>.github.io/` (no extra path
     segment), name the repo exactly `<username>.github.io` (replace
     `<username>` with your actual GitHub username).
   - Otherwise, any name works (e.g. `portfolio`), and your site will be at
     `https://<username>.github.io/portfolio/`.
3. **Visibility:** Public (required for free GitHub Pages on personal
   accounts).
4. **Do not** check "Add a README" — you already have files to push, and an
   auto-created README would conflict.
5. Click **Create repository**.

---

## Step 2: Add a `.nojekyll` file

GitHub Pages runs your site through **Jekyll** (a static-site generator) by
default. This project isn't built with Jekyll, and Jekyll's default behavior
can quietly skip certain files/folders (anything starting with `_`, for
example) or interfere with how files are served.

To disable Jekyll processing entirely and have GitHub serve your files
exactly as-is:

1. In the unzipped project folder, create a new **empty** file named exactly:
   ```
   .nojekyll
   ```
   (no filename before the dot, no extension after it).
2. Place it at the repo root — same level as `index.html`.

> This project doesn't currently use any `_`-prefixed folders, so the site
> would likely work without this file too — but it's a zero-cost safeguard
> that avoids a whole category of "why is my CSS missing" bugs.

---

## Step 3: Push the site to GitHub

### Option A: Using Git (recommended)

Open a terminal, `cd` into the unzipped site folder, then run:

```bash
git init
git add .
git commit -m "Initial commit: portfolio site"
git branch -M main
git remote add origin https://github.com/<username>/<repo-name>.git
git push -u origin main
```

Replace `<username>/<repo-name>` with your actual GitHub path (visible on
the repo's page after Step 1).

If prompted for credentials, use a
[Personal Access Token](https://github.com/settings/tokens) as the password
— GitHub no longer accepts your account password for Git operations.

### Option B: Upload through the GitHub website (no Git required)

1. Open your new repo on GitHub.
2. Click **Add file → Upload files**.
3. Drag the *contents* of the unzipped folder in — not the folder itself.
   Your file manager should let you select `index.html`, `assets/`, `docs/`,
   etc. all at once and drop them together so the structure is preserved.
4. Scroll down, add a commit message like `Initial commit`, and click
   **Commit changes**.

> Browser uploads are fine for the initial push, but for any future edits
> Option A (Git) is far less error-prone, especially for a project with this
> many nested folders.

---

## Step 4: Enable GitHub Pages

1. In the repo, go to **Settings → Pages** (left sidebar, under "Code and
   automation").
2. Under **Build and deployment → Source**, select **Deploy from a branch**.
3. Under **Branch**, choose `main` and folder `/ (root)`.
4. Click **Save**.

GitHub will build and publish the site — this usually takes 30–90 seconds.
Refresh the Pages settings page; a green banner will show your live URL:

```
https://<username>.github.io/            (if repo is named <username>.github.io)
https://<username>.github.io/<repo>/     (otherwise)
```

---

## Step 5: Verify the deployment

Open the URL from Step 4 and check:

- [ ] The hero section loads with your name, title, and photo
- [ ] Styling looks correct (if it doesn't, see
      [Troubleshooting](#troubleshooting) — this is almost always a path
      issue)
- [ ] `studio.html` loads at `<your-url>/studio.html`
- [ ] Browser console (F12 → Console) shows no red errors

---

## Step 6 (optional): Connect your custom domain

If you own **surajkumarnavodya.com** (or any domain) and want it to point at
this GitHub Pages site instead of `github.io`:

1. **Add a `CNAME` file** at the repo root containing a single line — your
   bare domain, no `https://`, no trailing slash:
   ```
   surajkumarnavodya.com
   ```
2. **At your domain registrar** (wherever you bought the domain — GoDaddy,
   Namecheap, Google Domains, etc.), add these DNS records:

   | Type | Host | Value |
   |---|---|---|
   | A | @ | `185.199.108.153` |
   | A | @ | `185.199.109.153` |
   | A | @ | `185.199.110.153` |
   | A | @ | `185.199.111.153` |
   | CNAME | www | `<username>.github.io` |

   (These four A-record IPs are GitHub's official Pages IPs and don't change
   per-user — only the CNAME target line uses your username.)
3. Back in **Settings → Pages**, enter your domain under **Custom domain**
   and click **Save**. Wait for the DNS check to pass (can take a few
   minutes to 24 hours depending on DNS propagation).
4. Once verified, check **Enforce HTTPS** so GitHub issues a free SSL
   certificate for your domain.

> DNS changes can take anywhere from a few minutes to a day to fully
> propagate. If the domain doesn't resolve immediately, that's expected —
> wait and retry rather than re-editing the records.

---

## Step 7: Update the domain references in the site itself

This project has your domain hardcoded in a few places for SEO purposes
(canonical URLs, Open Graph tags, JSON-LD structured data, sitemap). If
you're publishing under a **different** domain than
`surajkumarnavodya.com` (e.g. sticking with the free `github.io` URL, or
using a different domain you own), update these files — otherwise skip this
step, since the existing values are already correct:

| File | What to change |
|---|---|
| `index.html` | Every `https://surajkumarnavodya.com/` occurrence (canonical tag, `og:url`, JSON-LD `url` field) |
| `sitemap.xml` | All `<url><loc>` entries |
| `robots.txt` | The `Sitemap:` line |

A quick way to find every occurrence before editing:

```bash
grep -rn "surajkumarnavodya.com" index.html sitemap.xml robots.txt
```

---

## Making future updates

Once the repo is set up, publishing any future change is just:

```bash
git add .
git commit -m "Describe what changed"
git push
```

GitHub Pages automatically rebuilds within about a minute of every push to
`main` — no manual redeploy step needed.

---

## Troubleshooting

**Site shows a 404 page**
Check that `index.html` is at the repo root, not inside a subfolder, and that
Settings → Pages shows a successful deployment (green checkmark) rather than
a build error.

**Page loads but has no styling / broken images**
Almost always a path-casing or missing-`.nojekyll` issue. GitHub Pages
servers are case-sensitive (`Assets/` ≠ `assets/`), unlike some local dev
setups on Windows/Mac. Confirm folder names match exactly what's referenced
in `index.html`.

**Custom domain shows "not properly configured" in Settings → Pages**
DNS hasn't propagated yet, or a record is wrong. Use
[dnschecker.org](https://dnschecker.org) to confirm your A/CNAME records are
visible globally, not just from your own network.

**Changes pushed but the live site looks unchanged**
Two likely causes: (1) GitHub Pages hasn't finished rebuilding yet — check
the **Actions** tab in your repo for a green checkmark on the latest build;
(2) your browser is serving a cached copy — hard refresh with
`Ctrl+Shift+R` / `Cmd+Shift+R`.

**The Studio tool (`studio.html`) or Customizer looks broken after
deploying**
Confirm `assets/dist/js/template.min.js` and `assets/js/*.js` were both
uploaded — some drag-and-drop uploads silently skip empty-looking files or
deeply nested folders if not selected carefully.

---

## Reference: what NOT to upload

These exist locally for development only and add no value on the live
site (safe to exclude, though harmless if included):

- `assets/dev/` — internal theme-testing page
- `assets/tests/` — test runner and test files
- `docs/` — project documentation (this file included); useful to keep in
  the repo for your own reference, but not part of the live site experience

Everything else in the project root — `index.html`, `studio.html`,
`component-catalog.html`, `assets/css/`, `assets/js/`, `assets/dist/`,
`assets/images/`, `assets/demo-data/`, `assets/downloads/`, `favicon.svg`,
`site.webmanifest`, `sitemap.xml`, `robots.txt`, `portfolio.json` — is part
of the working site and should be uploaded as-is. `assets/demo-data/` holds
only fictional sample content used by `studio.html`'s demo-pack picker —
see `assets/demo-data/README.md`.
