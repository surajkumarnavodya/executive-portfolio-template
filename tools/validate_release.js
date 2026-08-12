#!/usr/bin/env node
/**
 * validate_release.js — hard-fail checks for a built release package.
 *
 * Runs against either an already-extracted directory (--dir) or a zip
 * (--zip, extracted to a temp dir with `unzip` first). Exits non-zero if any
 * CHECK (not WARNING) fails, so it can gate a CI job or a local packaging
 * run — both package-live.{sh,ps1} and package-template.{sh,ps1} call this
 * automatically after writing their zip.
 *
 * Two modes, because a live deploy and a buyer template have different
 * pass/fail bars for the same question ("does this contain real content?"
 * must be YES for --mode live and NO for --mode template):
 *
 *   --mode live      the artifact that gets deployed to the real domain
 *   --mode template  the artifact a template buyer unzips
 *
 * Usage:
 *   node tools/validate_release.js --mode live     --zip portfolio-live.zip
 *   node tools/validate_release.js --mode template --zip executive-portfolio-template.zip
 *   node tools/validate_release.js --mode live     --dir /path/to/already/extracted
 *   node tools/validate_release.js --mode template --zip out.zip --strict   # also fail on WARNINGs
 */
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

function parseArgs(argv) {
  const args = { mode: null, zip: null, dir: null, strict: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--mode') { args.mode = argv[++i]; }
    else if (a === '--zip') { args.zip = argv[++i]; }
    else if (a === '--dir') { args.dir = argv[++i]; }
    else if (a === '--strict') { args.strict = true; }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
if (!args.mode || (args.mode !== 'live' && args.mode !== 'template')) {
  console.error('Usage: validate_release.js --mode live|template (--zip <path> | --dir <path>) [--strict]');
  process.exit(2);
}
if (!args.zip && !args.dir) {
  console.error('Provide either --zip <path> or --dir <path>.');
  process.exit(2);
}

let ROOT;
let cleanup = () => {};
if (args.dir) {
  ROOT = path.resolve(args.dir);
} else {
  const zipPath = path.resolve(args.zip);
  if (!fs.existsSync(zipPath)) {
    console.error('Zip not found: ' + zipPath);
    process.exit(2);
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'release-validate-'));
  execFileSync('unzip', ['-q', zipPath, '-d', tmp]);
  ROOT = tmp;
  cleanup = () => { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* best effort */ } };
}

const checks = [];   // { name, ok, detail }
const warnings = []; // { name, detail }

function CHECK(name, ok, detail) { checks.push({ name, ok: !!ok, detail: detail || '' }); }
function WARN(name, triggered, detail) { if (triggered) { warnings.push({ name, detail: detail || '' }); } }

function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }
function read(rel) { try { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch (e) { return null; } }
function sizeOf(rel) { try { return fs.statSync(path.join(ROOT, rel)).size; } catch (e) { return -1; } }

function walk(dir, out) {
  out = out || [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full, out); } else { out.push(full); }
  }
  return out;
}
const allFiles = walk(ROOT).map((f) => path.relative(ROOT, f).split(path.sep).join('/'));

/* ===================================================================
   1. STRUCTURAL — same bar for both modes
   =================================================================== */
CHECK('index.html exists at package root', exists('index.html'));
CHECK('robots.txt exists at package root', exists('robots.txt'));
CHECK('sitemap.xml exists at package root', exists('sitemap.xml'));
CHECK('site.webmanifest exists at package root', exists('site.webmanifest'));
CHECK('favicon.svg exists at package root', exists('favicon.svg'));
CHECK('assets/dist/css/template.min.css exists', exists('assets/dist/css/template.min.css'));
CHECK('assets/dist/js/template.min.js exists', exists('assets/dist/js/template.min.js'));
CHECK('assets/css/icons.css exists (self-hosted icon subset)', exists('assets/css/icons.css'));
CHECK('assets/fonts/bootstrap-icons-subset.woff2 exists', exists('assets/fonts/bootstrap-icons-subset.woff2'));

/* ===================================================================
   2. NO DEV/TEST/INTERNAL ARTIFACTS IN EITHER PACKAGE
   =================================================================== */
const FORBIDDEN_PATHS = [
  '.git', '.github', '.vs', 'tools', 'assets/dev', 'assets/tests',
  '.gitattributes', '.gitignore', 'CLAUDE.md', 'AGENTS.md',
  'assets/js/asset-integration-test.js', 'verify-perf-edits.ps1',
  'index.template.html', 'portfolio.template.json',
  'robots.template.txt', 'sitemap.template.xml', 'site.template.webmanifest',
  'assets/images/profile-placeholder.jpg', 'assets/images/profile-placeholder.webp',
  'assets/images/profile-placeholder.avif', 'assets/images/og-image-placeholder.png',
];
for (const p of FORBIDDEN_PATHS) {
  const hit = allFiles.some((f) => f === p || f.startsWith(p + '/'));
  CHECK('no dev/internal artifact at "' + p + '"', !hit, hit ? 'found in package' : '');
}

// Common secret-file patterns — defense in depth, not expected to ever trigger.
const SECRET_NAME_RE = /(^|\/)(\.env(\..*)?|credentials\.json|id_rsa|id_ed25519|\.npmrc|.*\.pem|.*\.key)$/i;
const secretHits = allFiles.filter((f) => SECRET_NAME_RE.test(f));
CHECK('no credential/secret-shaped filenames present', secretHits.length === 0, secretHits.join(', '));

/* ===================================================================
   3. NO BROKEN / NON-PORTABLE PATHS (root vs. subdirectory deploy)
   =================================================================== */
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));
for (const f of htmlFiles) {
  const html = read(f);
  const abs = (html.match(/\b(?:href|src)="\/[^/][^"]*"/g) || []);
  CHECK('no leading-slash absolute href/src in ' + f + ' (breaks subdirectory deploys)', abs.length === 0, abs.slice(0, 5).join(', '));
}
const cssFiles = allFiles.filter((f) => f.endsWith('.css'));
for (const f of cssFiles) {
  const css = read(f);
  const abs = (css.match(/url\(\/[^)]*\)/g) || []);
  CHECK('no leading-slash absolute url() in ' + f, abs.length === 0, abs.slice(0, 5).join(', '));
}

const manifest = read('site.webmanifest');
if (manifest) {
  let parsed = null;
  try { parsed = JSON.parse(manifest); } catch (e) { /* checked below */ }
  CHECK('site.webmanifest is valid JSON', !!parsed);
  if (parsed) {
    CHECK('site.webmanifest start_url is portable (not "/")', parsed.start_url !== '/', String(parsed.start_url));
    CHECK('site.webmanifest scope is portable (not "/")', parsed.scope !== '/', String(parsed.scope));
  }
}

// sitemap <loc> entries should correspond to a file that actually exists in
// this package (catches e.g. a template package's sitemap still listing a
// live-only page that was excluded).
const sitemap = read('sitemap.xml');
if (sitemap) {
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const loc of locs) {
    let pathname;
    try { pathname = new URL(loc).pathname; } catch (e) { pathname = null; }
    CHECK('sitemap.xml <loc> is an absolute URL: ' + loc, !!pathname);
    if (pathname) {
      const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
      CHECK('sitemap.xml entry resolves to a real file: ' + loc, exists(rel), 'expected ' + rel);
    }
  }
}

/* ===================================================================
   4. MODE-SPECIFIC CONTENT RULES
   =================================================================== */
const REAL_IDENTITY_MARKERS = [
  'Suraj Kumar', 'surajkumar.navodya@gmail.com', 'surajkumarnavodya.com',
  'LTIMindtree', '90491 41305',
];

if (args.mode === 'template') {
  // The whole point of the template package is that NONE of the real
  // deployment's identity/content can leak into what a buyer's visitors see
  // or into data the buyer's own site runs on. Two deliberate exemptions:
  //
  //   - LICENSE.txt/README.md/docs/*.md legitimately name the original
  //     author (copyright holder, "design and build by" attribution,
  //     "replace every occurrence of X" instructions naming X) — that's
  //     expected authorship/instructional content, not a leak into the
  //     buyer's own site.
  //   - Code comments (HTML <!-- -->, JS /* */ and //) can legitimately
  //     explain provenance to a developer reading the source without ever
  //     being rendered to a visitor (e.g. index.template.html's own
  //     copyright-notice comment, which correctly states the TEMPLATE CODE
  //     remains the original author's copyright per LICENSE.txt, distinct
  //     from the buyer's own content). Comments are stripped before
  //     scanning so that pattern doesn't false-positive, while a real leak
  //     sitting in actual markup/JSON/JS string literals still fails.
  const EXEMPT_FILES = /^(LICENSE\.txt|README\.md|docs\/.*\.md)$/;
  function stripComments(f, content) {
    if (/\.(html|xml)$/.test(f)) { return content.replace(/<!--[\s\S]*?-->/g, ''); }
    if (/\.(js|css)$/.test(f)) { return content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1'); }
    return content;
  }
  for (const f of allFiles.filter((p) => /\.(html|json|js|css|xml|txt|webmanifest)$/.test(p))) {
    if (EXEMPT_FILES.test(f)) { continue; }
    const raw = read(f);
    if (raw == null) { continue; }
    const content = stripComments(f, raw);
    for (const marker of REAL_IDENTITY_MARKERS) {
      CHECK('no real-identity leak ("' + marker + '") in ' + f, !content.includes(marker));
    }
  }
  CHECK('template package does not ship the live-only engineering.html', !exists('engineering.html'));
  CHECK('template package does not ship the real résumé folders',
    !allFiles.some((f) => /^assets\/[0-9a-f]{12}\//.test(f)));

  const robots = read('robots.txt');
  if (robots) {
    CHECK('robots.txt Sitemap host is the placeholder domain, not the real one',
      !robots.includes('surajkumarnavodya.com'));
  }

  // Bundle should be minified, not just concatenated — a un-minified bundle
  // still works, so this is a size-heuristic warning, not a hard failure.
  const bundleSize = sizeOf('assets/dist/js/template.min.js');
  WARN('template JS bundle looks un-minified (' + bundleSize + ' bytes, comments intact?)',
    bundleSize > 0 && (read('assets/dist/js/template.min.js') || '').includes('/**\n *'));

  WARN('Studio (studio.html / component-catalog.html) is included',
    exists('studio.html') || exists('component-catalog.html'),
    'intentional per README — an optional builder tool, not required to run the site. ' +
    'Buyers who don\'t want it reachable on their live domain should delete studio.html, ' +
    'component-catalog.html, assets/css/studio.css, assets/js/studio-app.js, ' +
    'assets/js/content-service.js, assets/js/asset-store.js, ' +
    'assets/js/portfolio-data-service.js and assets/demo-data/ before deploying.');
}

if (args.mode === 'live') {
  CHECK('live package does not ship the Studio system', !exists('studio.html') && !exists('component-catalog.html'));
  CHECK('live package does not ship demo/fictional data', !exists('assets/demo-data'));
  CHECK('live package does not ship the template\'s generic config', !exists('assets/js/config.demo.js'));

  const indexHtml = read('index.html') || '';
  const engHtml = read('engineering.html') || '';
  const placeholderHits = [];
  for (const [label, content] of [['index.html', indexHtml], ['engineering.html', engHtml]]) {
    const m = content.match(/PLACEHOLDER_[A-Z_]+/g);
    if (m) { placeholderHits.push(label + ': ' + [...new Set(m)].join(', ')); }
  }
  WARN('unfilled PLACEHOLDER_ token(s) remain in the live package', placeholderHits.length > 0, placeholderHits.join(' | '));
}

/* ===================================================================
   REPORT
   =================================================================== */
console.log('\nRelease validation — mode: ' + args.mode + (args.strict ? ' (strict)' : ''));
console.log('Target: ' + (args.zip ? args.zip : args.dir) + '\n');

let failCount = 0;
for (const c of checks) {
  console.log((c.ok ? '  [PASS]' : '  [FAIL]') + ' ' + c.name + (c.detail ? '  :: ' + c.detail : ''));
  if (!c.ok) { failCount++; }
}
for (const w of warnings) {
  console.log('  [WARN] ' + w.name + (w.detail ? '  :: ' + w.detail : ''));
}

console.log('\n' + (checks.length - failCount) + '/' + checks.length + ' checks passed, ' + warnings.length + ' warning(s).');

cleanup();

if (failCount > 0 || (args.strict && warnings.length > 0)) {
  console.error('\nRELEASE VALIDATION FAILED.');
  process.exit(1);
}
console.log('\nRelease validation passed.');
