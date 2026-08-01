/*!
 * navigation.js — Executive Portfolio Template
 * Clean-URL scrolling, active-link highlighting, mobile nav collapse.
 */
$(function () {


  /* ---------- Clean-URL navigation: scroll to section without #hash in the address bar ---------- */
  $(document).on('click', 'a[href^="#"]', function (ev) {
    var hash = $(this).attr('href');
    if (hash === '#') return;                 // placeholder links — leave as-is
    var $target = $(hash);
    if (!$target.length) return;
    ev.preventDefault();
    if ($(this).hasClass('nav-link') || $(this).hasClass('dropdown-item')) {
      $('.navbar .nav-link, .navbar .dropdown-item').removeClass('active');
      $(this).addClass('active');
      // A dropdown item was chosen: also light up its parent "Expertise"/"Proof" toggle.
      var $parentToggle = $(this).closest('.dropdown').find('> .nav-link.dropdown-toggle');
      if ($parentToggle.length) $parentToggle.addClass('active');
    }
    var prefersReduced = false;
    try { prefersReduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) {}
    if (document.documentElement.getAttribute('data-motion') === 'none') { prefersReduced = true; }
    $target[0].scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    history.replaceState(null, '', window.location.pathname + window.location.search);
  });

  /* Strip a hash if the page is opened with one (e.g. a shared #career link) */
  if (window.location.hash) {
    var $onLoad = $(window.location.hash);
    if ($onLoad.length) setTimeout(function () { $onLoad[0].scrollIntoView(); }, 0);
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  /* ---------- Active nav highlighting ----------
     Builds its target list from the nav itself, so a link pointing at an
     element inside the hero (#impact) is tracked correctly. Picks whichever
     target sits physically closest above the reading line — no dead zones
     between sections, and no stale "previous" link staying lit.

     This is deliberately NOT "the last target in nav order that has passed
     the line": a menu (e.g. a dropdown) can list items in a different order
     than they actually appear on the page, and picking by iteration order
     then highlights whatever nav item happened to be processed last among
     the passed ones, not the section you're actually looking at. Comparing
     each candidate's real page offset avoids that regardless of how the
     menu is ordered or restructured later. */
  var navTargets = [];
  $('.navbar .nav-link[href^="#"], .navbar .dropdown-item[href^="#"]').each(function () {
    var id = $(this).attr('href').slice(1);
    var el = document.getElementById(id);
    if (el) navTargets.push({ id: id, el: el });
  });

  var lockUntil = 0;   // ignore the spy while a click-triggered smooth scroll runs

  function paintActive() {
    if (!navTargets.length || Date.now() < lockUntil) return;
    var line = $(window).scrollTop() + (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 100) + 12;
    var current = null, currentTop = -Infinity, lowestId = null, lowestTop = -Infinity;
    navTargets.forEach(function (t) {
      var top = $(t.el).offset().top;
      if (top <= line && top > currentTop) { current = t.id; currentTop = top; }
      if (top > lowestTop) { lowestTop = top; lowestId = t.id; }
    });
    // Bottom of page: always light whichever tracked section sits lowest,
    // not just the last one in the nav's own order.
    if ($(window).scrollTop() + $(window).height() >= document.documentElement.scrollHeight - 4) {
      current = lowestId;
    }
    var $links = $('.navbar .nav-link, .navbar .dropdown-item');
    $links.removeClass('active');
    if (current) {
      var $active = $links.filter('[href="#' + current + '"]').addClass('active');
      var $parentToggle = $active.closest('.dropdown').find('> .nav-link.dropdown-toggle');
      if ($parentToggle.length) $parentToggle.addClass('active');
    }
  }

  function releaseLock() {
    lockUntil = 0;
    paintActive();
  }
  // A smooth scroll's duration scales with distance, so a short fixed
  // timeout can unlock the spy before the scroll actually finishes — it
  // then recomputes mid-flight and lands on the wrong (often adjacent)
  // section. `scrollend` fires exactly when the browser's scroll settles,
  // so it drives the unlock where supported; the timeout becomes a
  // generous safety net instead of the primary signal.
  var supportsScrollEnd = 'onscrollend' in window;
  if (supportsScrollEnd) { window.addEventListener('scrollend', releaseLock); }

  $(window).on('scroll resize', paintActive);
  paintActive();
  $('.navbar .nav-link[href^="#"], .navbar .dropdown-item[href^="#"]').on('click', function () {
    lockUntil = Date.now() + (supportsScrollEnd ? 4000 : 1000);
  });

  /* ---------- Collapse mobile nav on link click ----------
     .dropdown-toggle is excluded: it is also a .nav-link, so including it
     meant tapping "Expertise"/"Proof" on mobile opened the submenu and
     immediately collapsed the whole nav, making child menus unusable.
     Its own links still close the nav via the .dropdown-item selector. */
  $('.navbar .nav-link:not(.dropdown-toggle), .navbar .dropdown-item, .navbar .btn').on('click', function () {
    var nav = document.getElementById('nav');
    if (nav.classList.contains('show')) bootstrap.Collapse.getInstance(nav).hide();
  });

  /* ---------- Open dropdowns on hover (expanded desktop nav only) ----------
     Bootstrap dropdowns are click-only by default. On a fine pointer opening
     "Expertise"/"Proof" on hover reads as more natural. Uses the real Dropdown
     API (not a CSS :hover rule) so aria-expanded and Popper positioning stay
     correct, with a short open/close delay to stop flicker when crossing the
     gap between the toggle and the menu.

     Two conditions gate this, and BOTH matter:

       (hover:hover) and (pointer:fine)  - a real mouse
       (min-width:1200px)               - the navbar is actually expanded

     The width test is not optional. navbar-expand-xl collapses the nav into
     the hamburger below 1200px, where the interaction model is click, not
     hover. Without it, a mouse user at a narrow width (or anyone testing
     mobile by resizing the window) got: hover silently opens the submenu,
     then their click hits Bootstrap's toggle and closes what hover had just
     opened - the menu appeared to flash open and vanish, with no way to
     reach a child link.

     The query is also re-evaluated inside each handler rather than once at
     load, so resizing across the breakpoint switches modes immediately
     instead of stranding whichever mode was true when the page loaded. */
  var hoverNavQuery = null;
  try {
    hoverNavQuery = window.matchMedia &&
      window.matchMedia('(hover:hover) and (pointer:fine) and (min-width:1200px)');
  } catch (e) {}
  function hoverNavEnabled() { return !!(hoverNavQuery && hoverNavQuery.matches); }

  document.querySelectorAll('.navbar .nav-item.dropdown').forEach(function (item) {
    var toggleEl = item.querySelector('[data-bs-toggle="dropdown"]');
    if (!toggleEl) { return; }
    var dropdown = bootstrap.Dropdown.getOrCreateInstance(toggleEl);
    var openTimer = null, closeTimer = null;
    item.addEventListener('mouseenter', function () {
      if (!hoverNavEnabled()) { return; }
      clearTimeout(closeTimer);
      openTimer = setTimeout(function () { dropdown.show(); }, 60);
    });
    item.addEventListener('mouseleave', function () {
      // Always cancel a pending open, even in click mode, so a queued timer
      // from just before a resize can never fire against a collapsed nav.
      clearTimeout(openTimer);
      if (!hoverNavEnabled()) { return; }
      closeTimer = setTimeout(function () { dropdown.hide(); }, 200);
    });

    /* In hover mode the pointer has already opened the menu by the time it
       reaches the toggle, so Bootstrap's click handler would read "already
       open" and close it - the menu flashed open and vanished under the
       cursor. Swallow that click while the menu is open so hover stays in
       sole control of it.

       Capture phase is required: Bootstrap listens on document during the
       bubble phase, so the event has to be stopped before it gets there.
       In click mode (touch, or a collapsed nav) this does nothing and
       Bootstrap toggles normally. Keyboard is unaffected - Enter fires a
       click with the menu closed, which passes straight through. */
    toggleEl.addEventListener('click', function (ev) {
      if (!hoverNavEnabled()) { return; }
      if (item.querySelector('.dropdown-menu.show')) {
        ev.preventDefault();
        ev.stopPropagation();
      }
    }, true);
  });
});
