/*!
 * palette.js — Executive Portfolio Template
 * ---------------------------------------------------------------------------
 * One-click accent switching. Sets data-palette on <html>, which activates a
 * block in assets/css/variables.css, and remembers the choice.
 *
 * This is independent of the light/dark toggle in theme.js — a visitor can
 * run "emerald + light" or "emerald + dark". Palettes only redefine
 * --accent and --accent-2, so they layer over either mode.
 * ---------------------------------------------------------------------------
 */
(function () {
  'use strict';
  if (window.__portfolioCustomizerEnabled) { return; }

  var KEY = 'th-palette';
  var VALID = ['navy', 'corporate', 'emerald', 'executive', 'purple', 'charcoal'];
  var root = document.documentElement;

  function configured() {
    var c = window.PORTFOLIO_CONFIG;
    return (c && c.theme && c.theme.palette) || 'navy';
  }

  function read() {
    try {
      var v = localStorage.getItem(KEY);
      return VALID.indexOf(v) > -1 ? v : null;
    } catch (e) { return null; }        // private browsing / storage disabled
  }

  function paint(name) {
    root.setAttribute('data-palette', name);
    var swatches = document.querySelectorAll('.pal-swatch');
    Array.prototype.forEach.call(swatches, function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-palette') === name));
    });
  }

  function apply(name, remember) {
    if (VALID.indexOf(name) === -1) { name = 'navy'; }
    paint(name);
    if (remember) {
      try { localStorage.setItem(KEY, name); } catch (e) {}
    }
  }

  // A saved choice always beats the config default.
  apply(read() || configured(), false);

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.pal-swatch');
    if (!btn) { return; }
    apply(btn.getAttribute('data-palette'), true);
  });

  // Arrow-key navigation across the swatch group, so the picker is usable
  // without a mouse.
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') { return; }
    var active = document.activeElement;
    if (!active || !active.classList || !active.classList.contains('pal-swatch')) { return; }
    var all = Array.prototype.slice.call(document.querySelectorAll('.pal-swatch'));
    var i = all.indexOf(active);
    if (i === -1) { return; }
    var next = all[(i + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length];
    next.focus();
    e.preventDefault();
  });

  // Expose a tiny API so the picker can be driven from elsewhere,
  // e.g. an admin panel in a later version.
  window.PortfolioPalette = {
    set: function (name) { apply(name, true); },
    get: function () { return root.getAttribute('data-palette'); },
    available: VALID.slice()
  };

})();
