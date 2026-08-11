/**
 * Rebuilds assets/dist/js/template.min.js from source.
 *
 * Mirrors tools/build_bundle.js's approach for the CSS bundle, closing a gap
 * this repo has carried since v1.0: the JS bundle has always been a
 * hand-maintained concatenation (see CLAUDE.md's session log for the v1.5.0
 * "Critical Bundle Regression" that hand-maintenance caused — a stray
 * `export` keyword from a Studio-only ES module silently blanked the whole
 * page). This script makes rebuilding it a single deterministic command
 * instead of manual copy-paste.
 *
 * Composition: components, counters, customizer, main, navigation, palette,
 * renderer, theme, i18n, fontsize, ui — in that order. Deliberately excludes
 * the Studio-only ES modules (studio-app.js, content-service.js,
 * asset-store.js, portfolio-data-service.js) — they use `export class`,
 * which is invalid in a non-module <script> and is exactly what caused the
 * v1.5.0 regression. studio.html loads those separately as
 * `<script type="module">`.
 *
 * Supports overriding individual source files by name — used by
 * tools/package-template.ps1/.sh to build a bundle with a genericized ui.js
 * (see tools/build_template_ui.js) without touching the real source file.
 *
 * Usage:
 *   node tools/build_bundle_js.js
 *   node tools/build_bundle_js.js --out path/to/out.js
 *   node tools/build_bundle_js.js --override ui.js=path/to/ui.template.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'assets/js');
const DEFAULT_OUT = path.join(ROOT, 'assets/dist/js/template.min.js');

const PARTS = [
  'components.js', 'counters.js', 'customizer.js', 'main.js', 'navigation.js',
  'palette.js', 'renderer.js', 'theme.js', 'i18n.js', 'fontsize.js', 'ui.js'
];

function parseArgs(argv) {
  const overrides = {};
  let out = DEFAULT_OUT;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--override' && argv[i + 1]) {
      const [name, overridePath] = argv[i + 1].split('=');
      overrides[name] = path.resolve(process.cwd(), overridePath);
      i += 1;
    } else if (argv[i] === '--out' && argv[i + 1]) {
      out = path.resolve(process.cwd(), argv[i + 1]);
      i += 1;
    }
  }
  return { overrides, out };
}

const { overrides, out: OUT } = parseArgs(process.argv.slice(2));

const header =
  '/*! template.min.js — Executive Portfolio Template — production bundle ' +
  '(hand-maintained concatenation of assets/js/*.js; excludes Studio-only ES modules) */\r\n';

let bundle = header;
const report = [];

for (const part of PARTS) {
  const p = overrides[part] || path.join(SRC, part);
  let js = fs.readFileSync(p, 'utf8');
  js = js.split('\r\n').join('\n'); // normalize, then re-apply CRLF once below
  bundle += '\r\n/* ===== ' + part + ' ===== */\r\n';
  bundle += (js.endsWith('\n') ? js : js + '\n').split('\n').join('\r\n');
  report.push([part, js.length, overrides[part] ? ' (override: ' + path.relative(ROOT, p) + ')' : '']);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, bundle);

console.log('rebuilt:', path.relative(ROOT, OUT));
report.forEach(([n, s, note]) => console.log(`  ${n.padEnd(18)} ${String(s).padStart(7)} b${note}`));
