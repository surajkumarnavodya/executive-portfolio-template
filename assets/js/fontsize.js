/*!
 * fontsize.js — Executive Portfolio Template
 * ---------------------------------------------------------------------------
 * Site-wide text-size control (A / A+ / A++), persisted in localStorage like
 * the theme and accent-colour pickers.
 *
 * Scales the whole page via CSS zoom on <html> (assets/css/style.css) rather
 * than converting every font-size rule in the template to rem: this
 * template's typography is authored in px/clamp() throughout, so a root
 * font-size change wouldn't cascade into it, while zoom reproduces the same
 * effect a visitor already expects from a browser's own "increase text
 * size" control.
 * ---------------------------------------------------------------------------
 */
(function () {
  'use strict';

  var KEY = 'th-fontsize';
  var DEFAULT = 'md';
  var LEVELS = [
    { key: 'md', label: 'A',   name: 'Default text size' },
    { key: 'lg', label: 'A+',  name: 'Larger text' },
    { key: 'xl', label: 'A++', name: 'Largest text' }
  ];
  var root = document.documentElement;

  function levelOf(key) {
    return LEVELS.filter(function (l) { return l.key === key; })[0];
  }

  function read() {
    try {
      var v = localStorage.getItem(KEY);
      return levelOf(v) ? v : null;
    } catch (e) { return null; }        // private browsing / storage disabled
  }

  function paint(key) {
    root.setAttribute('data-fontsize', key);
    var toggle = document.getElementById('fontsizeToggle');
    if (toggle) { toggle.textContent = levelOf(key).label; }
    var items = document.querySelectorAll('#fontsizeMenu [data-fontsize]');
    Array.prototype.forEach.call(items, function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-fontsize') === key));
    });
  }

  function apply(key, remember) {
    if (!levelOf(key)) { key = DEFAULT; }
    paint(key);
    if (remember) {
      try { localStorage.setItem(KEY, key); } catch (e) {}
    }
  }

  // A saved choice always beats the default, applied immediately (before the
  // menu below even exists) so a returning visitor never sees a flash back
  // down to the default size.
  apply(read() || DEFAULT, false);

  function buildMenu() {
    var wrap = document.querySelector('.fontsize-switch');
    var menu = document.getElementById('fontsizeMenu');
    var toggle = document.getElementById('fontsizeToggle');
    if (!wrap || !menu || !toggle) { return; }

    menu.innerHTML = LEVELS.map(function (l) {
      return '<button type="button" role="menuitemradio" class="fontsize-item" data-fontsize="' + l.key + '" aria-label="' + l.name + '">' + l.label + '</button>';
    }).join('');
    paint(root.getAttribute('data-fontsize') || DEFAULT);

    function setOpen(open) {
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    }

    toggle.addEventListener('click', function () { setOpen(menu.hidden); });
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) { setOpen(false); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setOpen(false); toggle.focus(); }
    });
    menu.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-fontsize]');
      if (!btn) { return; }
      setOpen(false);
      apply(btn.getAttribute('data-fontsize'), true);
    });

    // Arrow-key navigation across the three levels, same convention as the
    // accent-colour swatch group in palette.js.
    menu.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') { return; }
      var all = Array.prototype.slice.call(menu.querySelectorAll('.fontsize-item'));
      var i = all.indexOf(document.activeElement);
      if (i === -1) { return; }
      var next = all[(i + (e.key === 'ArrowDown' ? 1 : all.length - 1)) % all.length];
      next.focus();
      e.preventDefault();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildMenu);
  } else {
    buildMenu();
  }

  // Expose a tiny API, matching PortfolioPalette's shape.
  window.PortfolioFontSize = {
    set: function (key) { apply(key, true); },
    get: function () { return root.getAttribute('data-fontsize') || DEFAULT; },
    levels: LEVELS.map(function (l) { return l.key; })
  };
})();
