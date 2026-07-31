/*!
 * counters.js — Executive Portfolio Template
 * Scroll reveals (vanilla JS, no jQuery required) + KPI count-up (jQuery).
 *
 * The reveal observer is intentionally vanilla JS so it works even when
 * jQuery is not yet available or fails to load from CDN (e.g. offline / file://).
 * The count-up animation degrades gracefully to a static number if jQuery is absent.
 */

/* ============================================================
   SCROLL REVEALS — vanilla JS, runs as soon as the DOM is ready.
   No jQuery dependency so it works offline/locally as well.
   ============================================================ */
(function () {
  'use strict';

  function initReveals() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('in');
          io.unobserve(e.target);
        });
      }, {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px'
      });
      for (var i = 0; i < reveals.length; i++) {
        io.observe(reveals[i]);
      }
    } else {
      // Fallback for browsers without IntersectionObserver
      for (var j = 0; j < reveals.length; j++) {
        reveals[j].classList.add('in');
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveals);
  } else {
    initReveals();
  }
})();

/* ============================================================
   KPI COUNT-UP — jQuery-based, degrades to static if absent.
   ============================================================ */
(function () {
  'use strict';

  function initCountUp() {
    var reduced = false;
    try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    var counted = false;

    function countUp() {
      if (counted) return;
      counted = true;
      var els = document.querySelectorAll('.count');
      for (var i = 0; i < els.length; i++) {
        (function (el) {
          var target = parseInt(el.getAttribute('data-count'), 10);
          if (isNaN(target)) return;
          if (reduced || typeof $ === 'undefined') { el.textContent = target; return; }
          $({ n: 0 }).animate({ n: target }, {
            duration: 1400, easing: 'swing',
            step: function (now) { el.textContent = Math.floor(now); },
            complete: function () { el.textContent = target; }
          });
        })(els[i]);
      }
    }

    // Trigger countUp when the KPI board enters the viewport
    var impactEl = document.getElementById('impact');
    if (impactEl) {
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            countUp();
            io.unobserve(e.target);
          });
        }, { threshold: 0.1 });
        io.observe(impactEl);
      } else {
        countUp();
      }
    } else {
      countUp();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCountUp);
  } else {
    initCountUp();
  }
})();
