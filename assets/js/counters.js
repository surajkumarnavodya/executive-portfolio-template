/*!
 * counters.js — Executive Portfolio Template
 * Scroll reveals + KPI count-up. Fully vanilla JS (jQuery removed as a perf
 * pass — the count-up tween below reimplements jQuery's default 'swing'
 * easing curve exactly: 0.5 - cos(p*PI)/2, so the animation is unchanged.
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
   KPI COUNT-UP — vanilla requestAnimationFrame tween.
   ============================================================ */
(function () {
  'use strict';

  // Same curve as jQuery's built-in 'swing' easing (ease-in-out).
  function swing(p) { return 0.5 - Math.cos(p * Math.PI) / 2; }

  function tween(el, target, duration) {
    var start = null;
    function step(ts) {
      if (start === null) { start = ts; }
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = Math.floor(swing(p) * target);
      if (p < 1) { requestAnimationFrame(step); }
      else { el.textContent = target; }
    }
    requestAnimationFrame(step);
  }

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
          if (reduced) { el.textContent = target; return; }
          tween(el, target, 1400);
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
