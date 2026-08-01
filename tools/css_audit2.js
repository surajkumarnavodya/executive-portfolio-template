/**
 * Conservative production CSS audit.
 *
 * A rule is only reported UNUSED when it survives every one of these keep-checks:
 *   1. matches the static DOM of a page that loads the bundle
 *   2. references a runtime-controlled attribute (data-bs-theme, data-motion, [hidden] ...)
 *   3. any class token appears in a JS/JSON string literal (runtime-added class)
 *   4. matches a third-party / framework-injected prefix (Bootstrap, Google Translate)
 *   5. is a state/utility class that is toggled rather than authored in markup
 *   6. is structural (:root, html, body, *, @font-face, @keyframes ...)
 *
 * Everything reported is then reviewed by hand before removal.
 */
const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const safe = require("postcss-safe-parser");
const { JSDOM } = require("jsdom");

const ROOT = "..";
const BUNDLE = path.join(ROOT, "assets/dist/css/template.min.css");
const PAGES = ["home.html", "component-catalog.html"];
const ATF_SELECTORS = [".telemetry", "nav.navbar", "header.hero"];

// --- runtime-controlled attributes: theme/motion/state switches set by JS ------
const RUNTIME_ATTRS = /\[(data-bs-theme|data-motion|data-theme|data-palette|data-density|data-component|hidden|open|aria-[a-z-]+|dir|lang)\b/i;

// --- third-party injected class prefixes --------------------------------------
const THIRD_PARTY = /^(goog-|skiptranslate|VIt|bs-|tooltip|popover|modal|offcanvas|carousel|collapse|dropdown|accordion|toast|spinner|placeholder-glow|was-validated)/;

// --- classes toggled at runtime rather than authored in markup ----------------
const STATE_CLASSES = new Set([
  "show", "open", "active", "on", "off", "visible", "hidden", "closing", "closed",
  "collapsed", "expanded", "fade", "in", "out", "selected", "current", "disabled",
  "loading", "loaded", "error", "success", "dragging", "sticky", "stuck", "pinned",
  "reveal", "revealed", "inview", "animate", "animated", "no-motion", "reduced",
]);

function collectDynamicTokens() {
  const tokens = new Set();
  const dirs = ["assets/js", "assets/dist/js", "assets/data"].map((d) => path.join(ROOT, d));
  for (const d of dirs) {
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d)) {
      if (!/\.(js|json)$/.test(f)) continue;
      // Whole-file tokenization rather than string-literal parsing: quote pairing
      // desynchronizes on apostrophes inside comments ("don't"), which silently
      // drops real runtime classes. Over-keeping is the safe direction here.
      const src = fs.readFileSync(path.join(d, f), "utf8");
      const parts = src.match(/[A-Za-z_][A-Za-z0-9_-]*/g);
      if (parts) parts.forEach((p) => tokens.add(p));
    }
  }
  return tokens;
}

const KEEP_PSEUDO = /^:(not|is|where|has|nth-child|nth-of-type|nth-last-child|first-child|last-child|only-child|first-of-type|last-of-type|empty|root|scope)\b/;

function stripPseudo(sel) {
  let out = "", i = 0;
  while (i < sel.length) {
    if (sel[i] === ":") {
      const rest = sel.slice(i);
      if (KEEP_PSEUDO.test(rest)) {
        const name = rest.match(/^::?[A-Za-z-]+/)[0];
        out += name; i += name.length;
        if (sel[i] === "(") {
          let depth = 0; const start = i;
          while (i < sel.length) {
            if (sel[i] === "(") depth++;
            else if (sel[i] === ")") { depth--; if (!depth) { i++; break; } }
            i++;
          }
          out += sel.slice(start, i);
        }
        continue;
      }
      i++; if (sel[i] === ":") i++;
      while (i < sel.length && /[A-Za-z-]/.test(sel[i])) i++;
      if (sel[i] === "(") {
        let depth = 0;
        while (i < sel.length) {
          if (sel[i] === "(") depth++;
          else if (sel[i] === ")") { depth--; if (!depth) { i++; break; } }
          i++;
        }
      }
      continue;
    }
    out += sel[i]; i++;
  }
  return out.trim();
}

const classesIn = (sel) => (sel.match(/\.(-?[_a-zA-Z][\w-]*)/g) || []).map((c) => c.slice(1));

const dynTokens = collectDynamicTokens();
const docs = PAGES.map((p) => new JSDOM(fs.readFileSync(path.join(ROOT, p), "utf8")).window.document);

// above-the-fold-only document
const atfDoc = new JSDOM(fs.readFileSync(path.join(ROOT, "home.html"), "utf8")).window.document;
{
  const keep = new Set();
  for (const sel of ATF_SELECTORS) {
    const el = atfDoc.querySelector(sel);
    if (!el) continue;
    keep.add(el);
    el.querySelectorAll("*").forEach((n) => keep.add(n));
    let p = el.parentElement;
    while (p) { keep.add(p); p = p.parentElement; }
  }
  Array.from(atfDoc.body.querySelectorAll("*")).forEach((n) => {
    if (!keep.has(n) && n.parentNode) n.parentNode.removeChild(n);
  });
}

function domMatch(docList, cleaned) {
  for (const d of docList) {
    try { if (d.querySelector(cleaned)) return true; }
    catch (e) { return true; }
  }
  return false;
}

/** returns {used:boolean, reason:string} */
function classify(rawSelector) {
  const parts = rawSelector.split(",").map((s) => s.trim()).filter(Boolean);
  for (const part of parts) {
    if (RUNTIME_ATTRS.test(part)) return { used: true, reason: "runtime-attr" };

    const cleaned = stripPseudo(part);
    if (!cleaned) return { used: true, reason: "pseudo-only" };
    if (/^(\*|html|body|:root)\b/.test(cleaned) && classesIn(cleaned).length === 0)
      return { used: true, reason: "structural" };

    if (domMatch(docs, cleaned)) return { used: true, reason: "dom" };

    const cls = classesIn(cleaned);
    if (cls.some((c) => THIRD_PARTY.test(c))) return { used: true, reason: "third-party" };
    if (cls.some((c) => STATE_CLASSES.has(c))) return { used: true, reason: "state-class" };
    if (cls.some((c) => dynTokens.has(c))) return { used: true, reason: "js-token" };
  }
  return { used: false, reason: "no-match" };
}

const css = fs.readFileSync(BUNDLE, "utf8");
const root = postcss.parse(css, { parser: safe });

const reasons = {};
const dead = [];
let total = 0, critical = 0;

root.walkRules((rule) => {
  if (rule.parent && rule.parent.type === "atrule" && /keyframes$/i.test(rule.parent.name)) return;
  total++;
  const { used, reason } = classify(rule.selector);
  reasons[reason] = (reasons[reason] || 0) + 1;
  rule._used = used;
  if (!used) {
    const media = rule.parent && rule.parent.type === "atrule" ? `@${rule.parent.name} ${rule.parent.params}` : "";
    dead.push({ sel: rule.selector.replace(/\s+/g, " "), media, size: rule.toString().length });
  }
  // critical = used AND matches above-the-fold subtree
  if (used) {
    const parts = rule.selector.split(",").map((s) => stripPseudo(s.trim())).filter(Boolean);
    if (parts.some((p) => /^(\*|html|body|:root)\b/.test(p)) || parts.some((p) => domMatch([atfDoc], p))) {
      rule._critical = true;
      critical++;
    }
  }
});

console.log("=== CONSERVATIVE BUNDLE AUDIT ===");
console.log("bundle bytes :", css.length);
console.log("rules total  :", total);
console.log("kept         :", total - dead.length);
console.log("dead         :", dead.length, `(${((dead.length / total) * 100).toFixed(1)}%)`,
  `~${dead.reduce((a, b) => a + b.size, 0)} bytes`);
console.log("ATF critical :", critical);
console.log("\nkeep reasons :", JSON.stringify(reasons, null, 2));
console.log("\n--- DEAD RULES (manual review required) ---");
dead.forEach((d) => console.log(`  ${d.media ? d.media + " | " : ""}${d.sel}  [${d.size}b]`));

fs.writeFileSync("./dead_rules.json", JSON.stringify(dead, null, 2));
