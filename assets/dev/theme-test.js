/* theme-test.js — toggles theme and runs a simple contrast audit in-page
 * It checks a small set of interactive elements and reports WCAG contrast
 * ratios using computed styles. Open this page in a browser (served over HTTP)
 * and press "Run contrast audit". Results are printed to the console and the
 * on-page report area.
 */
(function () {
  'use strict';

  function getEffectiveBgColor(el) {
    var bg = window.getComputedStyle(el).backgroundColor;
    // Walk up until a non-transparent background is found
    var node = el;
    while (node && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
      node = node.parentElement;
      if (!node) break;
      bg = window.getComputedStyle(node).backgroundColor;
    }
    return bg || 'rgb(255,255,255)';
  }

  function parseRGB(s) {
    var m = s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    var parts = m[1].split(',').map(function (p) { return parseFloat(p.trim()); });
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] === undefined ? 1 : parts[3] };
  }

  function srgbToLin(c) {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function luminance(rgb) {
    return 0.2126 * srgbToLin(rgb.r) + 0.7152 * srgbToLin(rgb.g) + 0.0722 * srgbToLin(rgb.b);
  }

  function contrastRatio(colA, colB) {
    var L1 = luminance(colA);
    var L2 = luminance(colB);
    var light = Math.max(L1, L2);
    var dark = Math.min(L1, L2);
    return (light + 0.05) / (dark + 0.05);
  }

  function collectTargets() {
    var selectors = [
      '.btn-accent', '.btn-outline', '.hero-stat h4', '.hero-stat small',
      '.hero-stat .stat-icon i', '.kpi-val', '.kpi-lbl', '.contact-side h3',
      '.copilot-fab'
    ];
    var els = [];
    selectors.forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { els.push({sel: sel, el: el}); });
    });
    return els;
  }

  function computeForEl(entry) {
    var el = entry.el;
    var fg = window.getComputedStyle(el).color;
    var bg = getEffectiveBgColor(el);
    var fgRgb = parseRGB(fg);
    var bgRgb = parseRGB(bg);
    if (!fgRgb || !bgRgb) return null;
    var ratio = contrastRatio(fgRgb, bgRgb);
    return { selector: entry.sel, text: (el.textContent||el.value||el.alt||'').trim().slice(0,40), ratio: Math.round(ratio*100)/100 };
  }

  function runAudit() {
    var targets = collectTargets();
    var results = [];
    targets.forEach(function (t) {
      var r = computeForEl(t);
      if (r) results.push(r);
    });
    // Build report
    var out = [];
    out.push('Contrast audit — samples (WCAG AA target: 4.5 for normal text, 3.0 for large/display)');
    out.push('Theme: ' + document.documentElement.getAttribute('data-bs-theme'));
    results.forEach(function (r) {
      out.push((r.selector + ' — "' + r.text + '"').padEnd(60) + ' ratio: ' + r.ratio);
    });
    var reportArea = document.getElementById('reportArea');
    if (reportArea) reportArea.textContent = out.join('\n');
    console.log(out.join('\n'));
  }

  function toggleTheme() {
    var root = document.documentElement;
    var cur = root.getAttribute('data-bs-theme') || 'dark';
    var next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-bs-theme', next);
    // Small visual hint
    document.getElementById('toggleTheme').textContent = 'Switch to ' + (next === 'dark' ? 'Dark' : 'Light');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var t = document.getElementById('toggleTheme');
    var r = document.getElementById('runAudit');
    if (t) t.addEventListener('click', toggleTheme);
    if (r) r.addEventListener('click', runAudit);
  });
})();
