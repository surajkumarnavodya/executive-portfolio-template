/*!
 * theme.js — Executive Portfolio Template
 * Light/dark toggle, persisted in localStorage. Vanilla JS (no jQuery).
 */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', fn); }
    else { fn(); }
  }

  ready(function () {
    if (window.__portfolioCustomizerEnabled) { return; }

    /* ---------- Theme toggle (persisted) ---------- */
    function setTheme(mode) {
      document.documentElement.setAttribute('data-bs-theme', mode);
      var icon = document.querySelector('#themeToggle i');
      if (icon) { icon.className = mode === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars'; }
      localStorage.setItem('th-theme', mode);
    }
    var saved = localStorage.getItem('th-theme');
    if (saved) setTheme(saved);

    var toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        setTheme(document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark');
      });
    }
  });
})();
