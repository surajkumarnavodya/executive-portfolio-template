/*!
 * theme.js — Executive Portfolio Template
 * Light/dark toggle, persisted in localStorage.
 */
$(function () {
  if (window.__portfolioCustomizerEnabled) { return; }


  /* ---------- Theme toggle (persisted) ---------- */
  var saved = localStorage.getItem('th-theme');
  if (saved) setTheme(saved);
  function setTheme(mode) {
    $('html').attr('data-bs-theme', mode);
    $('#themeToggle i').attr('class', mode === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars');
    localStorage.setItem('th-theme', mode);
  }
  $('#themeToggle').on('click', function () {
    setTheme($('html').attr('data-bs-theme') === 'dark' ? 'light' : 'dark');
  });
});
