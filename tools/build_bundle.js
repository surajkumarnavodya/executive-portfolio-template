/**
 * Rebuilds assets/dist/css/template.min.css from source.
 *
 * Composition change: studio.css is NO LONGER bundled.
 *   - studio.html loads variables.css + style.css + studio.css directly, so the
 *     Studio UI is unaffected.
 *   - home.html and component-catalog.html are the only pages that load this
 *     bundle, and neither references a single .studio-* / .preview-* class.
 * That removes ~8.8 KB of unreachable CSS from every visitor's download.
 *
 * Composition is now: variables.css + style.css + responsive.css
 */
const fs = require("fs");
const path = require("path");

const SRC = "../assets/css";
const OUT = "../assets/dist/css/template.min.css";

const PARTS = ["variables.css", "style.css", "responsive.css"];

const header =
  "/*! template.min.css — Executive Portfolio Template — production bundle " +
  "(concatenation of variables.css + style.css + responsive.css). " +
  "studio.css is intentionally excluded: studio.html loads it directly and no " +
  "bundle-consuming page uses it. */\n";

let out = header;
const report = [];

for (const part of PARTS) {
  const p = path.join(SRC, part);
  const css = fs.readFileSync(p, "utf8");
  out += `\n/* ===== ${part} ===== */\n`;
  out += css.endsWith("\n") ? css : css + "\n";
  report.push([part, css.length]);
}

const prev = fs.existsSync(OUT) ? fs.statSync(OUT).size : 0;
fs.writeFileSync(OUT, out);

console.log("rebuilt:", OUT);
report.forEach(([n, s]) => console.log(`  ${n.padEnd(18)} ${String(s).padStart(7)} b`));
console.log("  " + "-".repeat(28));
console.log(`  ${"previous".padEnd(18)} ${String(prev).padStart(7)} b`);
console.log(`  ${"new".padEnd(18)} ${String(out.length).padStart(7)} b   (${prev - out.length} b removed)`);
