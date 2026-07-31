# FAQ

### Do I need Node, npm or a build step?
No. Plain HTML, CSS and JavaScript. Edit the files and upload them.

### The page has no styling when I open it from my computer.
You are on `file://`. The CDN files carry `integrity` and `crossorigin`
attributes, and that check needs a real web server. Run
`python3 -m http.server 8000` in the folder, or upload it. See
`docs/Installation.md`.

### Can I use this for a client?
Depends on your tier. Personal covers one site that is you; Professional covers
up to five including client work; Agency is unlimited. See `LICENSE.txt`.

### Can I resell it or put it in my own template?
No, under any tier.

### Can I keep the sample content?
No. The biography, case studies, metrics, certifications and photograph belong
to the template author and are not licensed to you. They are there so the layout
demonstrates itself. Replace all of it before publishing.

### How do I preview it without the author's details?
Point the config script at the demo profile:

```html
<script src="assets/js/config.demo.js"></script>
```

That swaps the identity fields for a fictional persona. It does **not** rewrite
the page prose — that still lives in `index.html`.

### How do I remove a section?
Set it to `false` in `config.js`:

```js
sections: { testimonials: false }
```

It is removed from the page and from the navbar. No HTML editing.

### How do homepage presets work?
Use the floating Template Customizer and pick one of the executive presets
(CEO through Consultant).
Only hero messaging changes; all sections and features remain enabled.

### What are the new executive presets?
Preset options now include: CEO, CTO, CIO, Program Director, Delivery Manager,
Engineering Manager, Product Leader, and Consultant.

### Why is my content still in index.html rather than config.js?
Deliberate. Search engines index markup without running JavaScript, and prose is
easier to proofread in place. `config.js` handles identity, links, theme and
section visibility. Full content-driven rendering is the v2.0 goal — see
`docs/Changelog.md`.

### Does the Copilot widget call an API?
No. It is an offline keyword matcher in `assets/js/ui.js`. Nothing leaves the
browser and there is no API key. If you rewrite your content, update the `KB`
array there too.

### Is it accessible?
There is a skip link as the first tab stop, a `<main>` landmark, visible
`:focus-visible` rings on every interactive element, `aria-label`s on icon-only
controls, arrow-key navigation across the palette picker, and 46px minimum tap
targets. All animation respects `prefers-reduced-motion`. Formal screen-reader
testing with NVDA and VoiceOver has not been done — if you need a signed VPAT,
budget for an audit.

### Why does the menu collapse at 1200px rather than 992px?
Seven inline links plus the toggle, picker and CTA do not fit between those
widths — the container overflowed by 22px. Collapsing one breakpoint earlier
fixes it properly instead of shrinking the type. If you cut down to four or five
nav links, change `navbar-expand-xl` back to `navbar-expand-lg` in `index.html`.

### How do I make it faster?
Two measured wins, both left undone so the source stays readable: replace the
52 icon-font glyphs with inline SVG (about −190 KB) and drop jQuery
(26 trivial call sites, −88 KB). Together roughly 45% of the payload.

### Can I use it with React, Vue or Next.js?
The markup and CSS port over fine. The JavaScript is jQuery and vanilla, so
you would rewrite the six modules as components. Nothing here blocks it.

### Can I reorder or hide homepage sections visually?
Yes. Use the Template Customizer's Visual Layout Builder (drag/drop + toggles),
or use Portfolio Studio step 10 for full layout configuration export/import.

### How do I move this template between versions safely?
Use [UpgradeGuide.md](</D:/My Portfolio Website/docs/UpgradeGuide.md>) for compatibility and merge steps.

### Something is broken after I edited the CSS.
Check where you added your rule. Same-specificity CSS is decided by source
order, and `responsive.css` loads last on purpose. Put your own rules at the
bottom of `style.css`, or after all three files if they must beat a media query.
