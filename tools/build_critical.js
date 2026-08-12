/**
 * Extract critical (first-viewport) CSS from the template bundle.
 *
 * "Above the fold" for index.html = the telemetry ticker, the fixed navbar
 * (including its dropdowns, which are painted on first interaction but share
 * the navbar's box) and the <header class="hero">.
 *
 * A rule is critical when any of its selector parts matches that subtree after:
 *   - pseudo-classes/elements that can't match statically are stripped
 *   - runtime scope prefixes are stripped, so [data-bs-theme="light"] .hero and
 *     body.nav-condensed .navbar are still recognised as hero/navbar rules
 *     (this keeps the light theme from flashing before the async bundle lands)
 *
 * Always kept regardless of match: :root custom properties, @font-face,
 * base element resets, and any @keyframes referenced by a kept rule.
 */
const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const safe = require("postcss-safe-parser");
const { JSDOM } = require("jsdom");

const ROOT = "..";
const BUNDLE = path.join(ROOT, "assets/dist/css/template.min.css");
const OUT = "./critical.css";

const ATF_SELECTORS = [".telemetry", "nav.navbar", "header.hero"];

// Scope prefixes applied at runtime to <html> or <body>; strip them so the
// remainder can be tested against the above-the-fold subtree.
const SCOPE_PREFIX = /^(\[data-bs-theme=["']?\w+["']?\]|\[data-motion=["']?\w+["']?\]|\[data-palette=["'][^"']*["']\]|html(\.[\w-]+)*|body(\.[\w-]+)*)\s+/i;

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
          let d = 0; const s = i;
          while (i < sel.length) { if (sel[i] === "(") d++; else if (sel[i] === ")") { d--; if (!d) { i++; break; } } i++; }
          out += sel.slice(s, i);
        }
        continue;
      }
      i++; if (sel[i] === ":") i++;
      while (i < sel.length && /[A-Za-z-]/.test(sel[i])) i++;
      if (sel[i] === "(") {
        let d = 0;
        while (i < sel.length) { if (sel[i] === "(") d++; else if (sel[i] === ")") { d--; if (!d) { i++; break; } } i++; }
      }
      continue;
    }
    out += sel[i]; i++;
  }
  return out.trim();
}

// ---- build the above-the-fold document ------------------------------------
const dom = new JSDOM(fs.readFileSync(path.join(ROOT, "index.html"), "utf8"));
const doc = dom.window.document;
{
  const keep = new Set();
  for (const sel of ATF_SELECTORS) {
    const el = doc.querySelector(sel);
    if (!el) { console.warn("WARN: ATF selector not found:", sel); continue; }
    keep.add(el);
    el.querySelectorAll("*").forEach((n) => keep.add(n));
    let p = el.parentElement;
    while (p) { keep.add(p); p = p.parentElement; }
  }
  Array.from(doc.body.querySelectorAll("*")).forEach((n) => {
    if (!keep.has(n) && n.parentNode) n.parentNode.removeChild(n);
  });
}

// Interaction states never apply to the very first paint.
const INTERACTION = /:(hover|focus|focus-visible|focus-within|active|target|visited)\b/i;
// The document ships data-bs-theme="dark", so dark is what paints first; the
// light-theme override set only matters once theme.js has run, by which point
// the async bundle has landed.
const NON_DEFAULT_THEME = /\[data-bs-theme=["']?light["']?\]/i;

function isCritical(rawSelector) {
  const parts = rawSelector.split(",").map((s) => s.trim()).filter(Boolean);
  // drop rules that exist purely for interaction states or the non-default theme
  if (parts.length && parts.every((p) => INTERACTION.test(p))) return false;
  if (parts.length && parts.every((p) => NON_DEFAULT_THEME.test(p))) return false;

  for (let part of parts) {
    // base/reset rules: keep
    if (/^(\*|:root|html|body)\s*$/.test(part)) return true;
    if (/^(\*|:root|html|body)(::?[\w-]+)?\s*$/.test(part)) return true;

    let cleaned = stripPseudo(part);
    if (!cleaned) continue;

    // strip runtime scope prefixes (possibly more than one)
    let prev;
    do { prev = cleaned; cleaned = cleaned.replace(SCOPE_PREFIX, "").trim(); } while (cleaned !== prev);
    if (!cleaned) return true; // rule was purely a scope selector, e.g. [data-bs-theme=light]

    try { if (doc.querySelector(cleaned)) return true; }
    catch (e) { /* unparseable: not critical, full bundle will cover it */ }
  }
  return false;
}

const css = fs.readFileSync(BUNDLE, "utf8");
const root = postcss.parse(css, { parser: safe });
const out = postcss.root();
const usedAnimations = new Set();
let kept = 0, dropped = 0;

function keepDecls(rule) {
  rule.walkDecls((d) => {
    if (/^animation(-name)?$/i.test(d.prop)) {
      d.value.split(",").forEach((v) => v.trim().split(/\s+/).forEach((t) => {
        if (/^[A-Za-z_][\w-]*$/.test(t)) usedAnimations.add(t);
      }));
    }
  });
}

root.each((node) => {
  if (node.type === "rule") {
    if (isCritical(node.selector)) { out.append(node.clone()); keepDecls(node); kept++; }
    else dropped++;
  } else if (node.type === "atrule") {
    const n = node.name.toLowerCase();
    if (n === "font-face" || n === "charset" || n === "import") {
      out.append(node.clone());
    } else if (n === "keyframes" || n.endsWith("keyframes")) {
      // handled in a second pass once we know which animations survived
    } else if (n === "media" || n === "supports" || n === "layer") {
      // Only carry first-viewport-relevant media queries. Print styles and
      // large-desktop-only tweaks are not needed to paint the first screen.
      if (/print/i.test(node.params)) return;
      const clone = node.clone();
      clone.removeAll();
      let any = false;
      node.each((child) => {
        if (child.type === "rule") {
          if (isCritical(child.selector)) { clone.append(child.clone()); keepDecls(child); any = true; kept++; }
          else dropped++;
        } else if (child.type === "atrule" && /keyframes$/i.test(child.name)) {
          // skip, resolved later
        } else {
          clone.append(child.clone()); any = true;
        }
      });
      if (any) out.append(clone);
    }
  }
});

// second pass: pull in @keyframes referenced by anything we kept
root.walkAtRules(/keyframes$/i, (at) => {
  if (usedAnimations.has(at.params.trim())) out.append(at.clone());
});

let result = out.toString();

// light minification: strip comments and collapse whitespace
result = result
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s*\n\s*/g, "\n")
  .replace(/\n{2,}/g, "\n")
  .replace(/\s*([{}:;,>])\s*/g, "$1")
  .replace(/;}/g, "}")
  .trim();

fs.writeFileSync(OUT, result);

console.log("critical rules kept :", kept);
console.log("rules dropped       :", dropped);
console.log("keyframes inlined   :", [...usedAnimations].join(", "));
console.log("critical bytes      :", result.length, `(${(result.length / 1024).toFixed(1)} KB)`);
console.log("full bundle bytes   :", css.length, `(${(css.length / 1024).toFixed(1)} KB)`);
