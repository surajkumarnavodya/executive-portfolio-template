/*!
 * i18n.js — Executive Portfolio Template
 * ---------------------------------------------------------------------------
 * Client-side page translation. There is no backend on this static site, so
 * "geography" is approximated from the visitor's browser locale
 * (navigator.language) rather than true IP geolocation, and the actual
 * translation is performed by Google's free Website Translator widget —
 * no API key, no server, no pre-written translations to maintain.
 *
 * Two ways in for a visitor:
 *   1. A one-time dismissible banner on first visit, offering to translate
 *      into the language implied by their browser locale.
 *   2. A permanent globe button in the navbar (".lang-switch") that opens a
 *      menu of every language listed in cfg.i18n.languages, plus "Original".
 *
 * Both call translateTo(), which drives the Google widget's hidden <select>
 * directly so no third-party banner/toolbar is ever shown to the visitor —
 * see assets/css/style.css for the rules that suppress Google's own UI.
 * ---------------------------------------------------------------------------
 */
(function () {
  'use strict';

  var cfg = (window.PORTFOLIO_CONFIG && window.PORTFOLIO_CONFIG.i18n) || {};
  if (cfg.enabled === false) {
    var deadSwitch = document.querySelector('.lang-switch');
    if (deadSwitch) { deadSwitch.remove(); }
    return;
  }

  var LANGUAGES = Array.isArray(cfg.languages) && cfg.languages.length ? cfg.languages : [
    { code: 'hi',    label: 'हिन्दी' },
    { code: 'es',    label: 'Español' },
    { code: 'fr',    label: 'Français' },
    { code: 'de',    label: 'Deutsch' },
    { code: 'pt',    label: 'Português' },
    { code: 'ar',    label: 'العربية' },
    { code: 'zh-CN', label: '中文' },
    { code: 'ja',    label: '日本語' }
  ];
  var SUGGEST = cfg.suggestFromBrowserLocale !== false;

  var LANG_KEY = 'pf-i18n-lang';
  var DISMISS_KEY = 'pf-i18n-dismissed';
  var PAGE_LANGUAGE = 'en';

  /* ---------------- Google Website Translator (loaded lazily) --------- */

  var widgetReady = false;
  var pendingLang = null;

  window.googleTranslateElementInit = function () {
    /* global google */
    new google.translate.TranslateElement({
      pageLanguage: PAGE_LANGUAGE,
      includedLanguages: LANGUAGES.map(function (l) { return l.code; }).join(','),
      autoDisplay: false
    }, 'google_translate_element');
    widgetReady = true;
    if (pendingLang) { translateTo(pendingLang); pendingLang = null; }
  };

  function loadWidget() {
    if (document.getElementById('google-translate-script')) { return; }
    var s = document.createElement('script');
    s.id = 'google-translate-script';
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    document.body.appendChild(s);
  }

  function findCombo() {
    return document.querySelector('#google_translate_element select.goog-te-combo');
  }

  // The widget can take a moment to hydrate its <select> after the script
  // fires googleTranslateElementInit, so this retries briefly rather than
  // failing silently on a slow connection.
  function comboHasOption(combo, code) {
    for (var i = 0; i < combo.options.length; i++) {
      if (combo.options[i].value === code) { return true; }
    }
    return false;
  }

  function translateTo(code, attempt) {
    attempt = attempt || 0;
    if (code === PAGE_LANGUAGE) { resetTranslation(); return; }
    try { localStorage.setItem(LANG_KEY, code); } catch (e) {}
    loadWidget();
    if (!widgetReady) { pendingLang = code; return; }
    var combo = findCombo();
    // On a cold load the <select> element exists (created synchronously by
    // the TranslateElement constructor) before its <option> list is
    // populated (that happens a beat later). Setting .value to a language
    // that isn't an option yet silently no-ops — the value never actually
    // changes, so the dispatched 'change' translates nothing. That's why
    // the very first click after landing on the page did nothing until a
    // second click found the options already there. Retrying (like the
    // "combo not found yet" case below) until the option genuinely exists
    // fixes it for the first click too.
    if (combo && comboHasOption(combo, code)) {
      combo.value = code;
      // Google's widget listens for 'change' via delegation higher up the
      // DOM, so a non-bubbling event (the default) is silently ignored —
      // the <select>'s value updates but no translation ever fires.
      combo.dispatchEvent(new Event('change', { bubbles: true }));
      paintActiveLanguage(code);
      return;
    }
    if (attempt < 20) { setTimeout(function () { translateTo(code, attempt + 1); }, 300); }
  }

  function resetTranslation() {
    try { localStorage.removeItem(LANG_KEY); } catch (e) {}
    var expire = 'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'googtrans=; ' + expire;
    document.cookie = 'googtrans=; ' + expire + ' domain=' + location.hostname;
    location.reload();
  }

  /* ---------------- navbar language menu ------------------------------ */

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&"'<>]/g, function (c) {
      return { '&': '&amp;', '"': '&quot;', "'": '&#39;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }

  function paintActiveLanguage(code) {
    var items = document.querySelectorAll('#langMenu [data-lang]');
    Array.prototype.forEach.call(items, function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang') === code));
    });
  }

  function buildLangMenu() {
    var wrap = document.querySelector('.lang-switch');
    var menu = document.getElementById('langMenu');
    var toggle = document.getElementById('langToggle');
    if (!wrap || !menu || !toggle) { return; }

    // Plain buttons + aria-pressed, not role="menuitemradio" — see
    // fontsize.js's identical note for why.
    var items = [{ code: PAGE_LANGUAGE, label: 'Original (English)' }].concat(LANGUAGES);
    menu.innerHTML = items.map(function (l) {
      return '<button type="button" class="lang-item" data-lang="' + escapeHtml(l.code) + '">' + escapeHtml(l.label) + '</button>';
    }).join('');

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
    // See palette.js's identical listener for why this is deferred rather
    // than reading focusout's relatedTarget directly.
    wrap.addEventListener('focusout', function () {
      setTimeout(function () {
        if (!wrap.contains(document.activeElement)) { setOpen(false); }
      }, 0);
    });
    menu.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-lang]');
      if (!btn) { return; }
      setOpen(false);
      translateTo(btn.getAttribute('data-lang'));
    });
    // Arrow-key navigation across the language list, matching the
    // convention already established by palette.js/fontsize.js.
    menu.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') { return; }
      var all = Array.prototype.slice.call(menu.querySelectorAll('.lang-item'));
      var i = all.indexOf(document.activeElement);
      if (i === -1) { return; }
      var next = all[(i + (e.key === 'ArrowDown' ? 1 : all.length - 1)) % all.length];
      next.focus();
      e.preventDefault();
    });

    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved) { paintActiveLanguage(saved); }
    } catch (e) {}
  }

  /* ---------------- one-time "translate this page?" banner ------------ */

  function detectSuggestion() {
    var locale = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    var short = locale.slice(0, 2).toLowerCase();
    if (!short || short === PAGE_LANGUAGE) { return null; }
    var exact = LANGUAGES.filter(function (l) { return l.code.toLowerCase() === locale.toLowerCase(); })[0];
    if (exact) { return exact; }
    return LANGUAGES.filter(function (l) { return l.code.toLowerCase().slice(0, 2) === short; })[0] || null;
  }

  function showBanner(suggestion) {
    var el = document.createElement('div');
    el.className = 'i18n-banner';
    // Not role="dialog": this banner is non-modal (nothing behind it is
    // blocked), appears without a user action, and never moves or traps
    // focus — none of which a real dialog implementation would skip.
    // role="region" + aria-live is what it actually is: a labeled,
    // proactively-announced section a screen reader user gets told about
    // even though they weren't already reading at this point in the DOM.
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Translate this page');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML =
      '<p class="i18n-banner-text">It looks like your browser is set to <strong>' + escapeHtml(suggestion.label) + '</strong>. Translate this page?</p>' +
      '<div class="i18n-banner-actions">' +
        '<button type="button" class="btn-accent btn i18n-yes">Translate</button>' +
        '<button type="button" class="btn-outline btn i18n-no">No thanks</button>' +
      '</div>';
    document.body.appendChild(el);

    function dismiss() {
      el.classList.add('closing');
      setTimeout(function () { el.remove(); }, 200);
    }
    el.querySelector('.i18n-yes').addEventListener('click', function () {
      translateTo(suggestion.code);
      dismiss();
    });
    el.querySelector('.i18n-no').addEventListener('click', function () {
      try { localStorage.setItem(DISMISS_KEY, '1'); } catch (e) {}
      dismiss();
    });
    // Escape dismisses like every other floating widget in this codebase
    // (nav dropdown, palette/font-size/language pickers, customizer panel,
    // Copilot) — doesn't remember the dismissal the way "No thanks" does,
    // since Escape reads as "not now," not "never ask again."
    document.addEventListener('keydown', function onKey(e) {
      if (e.key !== 'Escape') { return; }
      document.removeEventListener('keydown', onKey);
      dismiss();
    });
  }

  /* ---------------- init ------------------------------------------------ */

  function init() {
    buildLangMenu();

    var saved = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) {}
    if (saved) {
      translateTo(saved);
      return; // returning visitor already made a choice — never show the banner
    }

    if (!SUGGEST) { return; }
    var dismissed = false;
    try { dismissed = !!localStorage.getItem(DISMISS_KEY); } catch (e) {}
    if (dismissed) { return; }

    var suggestion = detectSuggestion();
    if (suggestion) { showBanner(suggestion); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
