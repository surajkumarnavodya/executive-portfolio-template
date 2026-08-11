# assets/demo-data/ — fictional sample content

Every JSON file in this directory is **invented template sample data**:
placeholder names, companies, quotes, awards and case studies used only to
preview the Studio builder (`studio.html`) and to demo the optional
JSON-driven renderer (`assets/js/renderer.js`). None of it describes a real
person, employer, or claim.

**Never publish this as real content.** Each file's `_comment` field repeats
this warning, and `assets/js/renderer.js` refuses to render any data source
whose path contains `demo` on a page other than `studio.html` — logging a
console error instead of silently injecting fictional content. See the
`config.js` → `data` block for how to point the renderer at your own real
JSON instead.

This directory was previously named `assets/data/` — renamed so "demo" is
visible in the path itself, which is also what the `renderer.js` guard keys
off of.
