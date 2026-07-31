/*!
 * main.js — Executive Portfolio Template
 * ---------------------------------------------------------------------------
 * Applies assets/js/config.js to the page and honours the feature switches.
 * Loaded last so it can override anything the other modules set up.
 *
 * Every step is defensive: if an element is missing (because you deleted a
 * section) nothing throws, the step is simply skipped.
 * ---------------------------------------------------------------------------
 */
(function () {
  'use strict';

  var cfg = window.PORTFOLIO_CONFIG;
  if (!cfg) { return; }                     // no config shipped — leave the HTML as authored

  var id    = cfg.identity || {};
  var ct    = cfg.contact  || {};
  var links = cfg.links    || {};
  var theme = cfg.theme    || {};
  var feat  = cfg.features || {};

  function each(sel, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), fn);
  }

  /* ---------------- identity ---------------------------------------- */
  if (id.name) {
    each('.brand-name', function (el) {
      el.textContent = id.name;
      if (id.nameAccent) {
        var dot = document.createElement('span');
        dot.className = 'dot';
        dot.textContent = id.nameAccent;
        el.appendChild(dot);
      }
    });
  }
  if (id.photo) {
    each('.brand-avatar', function (el) { el.setAttribute('src', id.photo); });
  }

  /* ---------------- contact ----------------------------------------- */
  if (ct.email) {
    var subject = ct.emailSubject ? '?subject=' + encodeURIComponent(ct.emailSubject) : '';
    each('a[href^="mailto:"]', function (el) {
      el.setAttribute('href', 'mailto:' + ct.email + subject);
      // Only rewrite the label when the link displays the address itself.
      if (el.textContent.indexOf('@') > -1) { el.textContent = ct.email; }
    });
  }
  if (ct.resume) {
    each('a[download]', function (el) { el.setAttribute('href', ct.resume); });
  }

  /* ---------------- external links ---------------------------------- */
  // Matched on the existing href so re-ordering the markup can't break it.
  var linkMap = [
    ['linkedin.com',        links.linkedin],
    ['github.com',          links.github],
    ['stackoverflow.com',   links.stackoverflow],
    ['c-sharpcorner.com',   links.csharpcorner]
  ];
  linkMap.forEach(function (pair) {
    var needle = pair[0], url = pair[1];
    if (!url) { return; }                   // empty in config → leave markup untouched
    each('a[href*="' + needle + '"]', function (el) { el.setAttribute('href', url); });
  });

  /* ---------------- theme ------------------------------------------- */
  var root = document.documentElement;

  // Only apply the default mode when the visitor has no saved preference.
  try {
    if (!localStorage.getItem('th-theme') && !localStorage.getItem('pf-theme-customizer-v1') && !localStorage.getItem('pf-theme-customizer-v2') && theme.defaultMode) {
      root.setAttribute('data-bs-theme', theme.defaultMode);
    }
  } catch (e) {
    if (theme.defaultMode) { root.setAttribute('data-bs-theme', theme.defaultMode); }
  }

  if (theme.accent)    { root.style.setProperty('--accent',   theme.accent); }
  if (theme.accentAlt) { root.style.setProperty('--accent-2', theme.accentAlt); }
  if (theme.fontFamily) {
    var bodyFont = String(theme.fontFamily).trim() || 'Inter';
    var bodyFontCss = bodyFont.includes(' ') ? '"' + bodyFont + '", system-ui, sans-serif' : bodyFont + ', system-ui, sans-serif';
    var displayFontCss = bodyFont.includes(' ') ? '"' + bodyFont + '", Georgia, serif' : bodyFont + ', Georgia, serif';
    root.style.setProperty('--font-body', bodyFontCss);
    root.style.setProperty('--font-display', displayFontCss);
  }
  if (theme.fontSize) {
    var fontSizeValue = theme.fontSize;
    var fontSizeCss = typeof fontSizeValue === 'number' ? (fontSizeValue + 'rem') : (/^\d+(\.\d+)?$/.test(String(fontSizeValue)) ? String(fontSizeValue) + 'rem' : /px|rem|em|%/.test(String(fontSizeValue)) ? String(fontSizeValue) : String(fontSizeValue) + 'px');
    root.style.fontSize = fontSizeCss;
  }
 
  if (theme.showThemeToggle === false) {
    each('#themeToggle', function (el) { el.style.display = 'none'; });
  }

  /* ---------------- section visibility ------------------------------ */
  // config key -> section id in index.html
  var SECTION_IDS = {
    leadership:     'leadership',
    successStories: 'success-stories',
    aiLeadership:   'ai-leadership',
    expertise:      'expertise',
    experience:     'experience',
    recognition:    'recognition',
    testimonials:   'testimonials',
    contact:        'contact'
  };
  var sections = cfg.sections || {};
  Object.keys(SECTION_IDS).forEach(function (key) {
    if (sections[key] === false) {
      var domId = SECTION_IDS[key];
      var sec = document.getElementById(domId);
      if (sec) { sec.remove(); }
      // Drop the matching navbar link so nothing points at a missing target.
      each('.navbar .nav-link[href="#' + domId + '"]', function (a) {
        var li = a.closest('li');
        (li || a).remove();
      });
    }
  });

  /* ---------------- palette picker ---------------------------------- */
  if (theme.showPalettePicker === false) {
    each('.palette-picker', function (el) { el.remove(); });
  }

  /* ---------------- feature switches -------------------------------- */
  // Each switch removes the element or neutralises the effect. Removing beats
  // hiding here: it also stops the associated timers and observers.
  function off(name, fn) { if (feat[name] === false) { fn(); } }

  off('telemetryTicker', function () {
    each('.telemetry', function (el) { el.remove(); });
    root.style.setProperty('--tele-h', '0px');
  });

  off('scrollProgress', function () {
    each('.scroll-progress, #scrollProgress', function (el) { el.remove(); });
  });

  off('scrollReveals', function () {
    each('.reveal', function (el) {
      el.classList.add('in');
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  });

  off('kpiCountUp', function () {
    // Freeze each counter on its final value instead of animating from zero.
    each('.count', function (el) {
      var target = el.getAttribute('data-count');
      if (target) { el.textContent = target; }
    });
  });

  off('kpiTilt', function () {
    each('.kpi-board', function (el) { el.classList.add('no-tilt'); });
  });

  off('heroRotator', function () {
    each('.rotator, #heroRotator', function (el) {
      el.classList.add('no-rotate');
    });
  });

  /* ---------------- skeleton loading -------------------------------- */
  // Apply skeleton shimmer to cards, remove on full load so initial render
  // isn't blocked by the animation.
  each('.x-card, .pov-card, .hero-stat, .kpi-cell', function (el) {
    el.classList.add('skeleton');
  });
  window.addEventListener('load', function () {
    each('.skeleton', function (el) { el.classList.remove('skeleton'); });
  }, { once: true });

})();
