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

  /* ---------- Collapse mobile nav on link click ---------- */
  $('.navbar .nav-link, .navbar .dropdown-item, .navbar .btn').on('click', function () {
    var nav = document.getElementById('nav');
    if (nav.classList.contains('show')) bootstrap.Collapse.getInstance(nav).hide();
  });

  /* ---------- Open dropdowns on hover (desktop only) ----------
     Bootstrap dropdowns are click-only by default. On a fine pointer
     (mouse), opening "Expertise"/"Proof" on hover instead reads as more
     natural nav behaviour. Uses the real Dropdown API (not a CSS :hover
     rule) so aria-expanded and Popper positioning stay correct. A short
     open/close delay stops accidental flicker when crossing the gap
     between the toggle and the menu. Below the collapse breakpoint the
     menu is already expanded inline (see responsive.css), so touch/mobile
     is untouched — this only runs where hover is meaningful. */
  var fineHover = false;
  try { fineHover = window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches; } catch (e) {}
  if (fineHover) {
    document.querySelectorAll('.navbar .nav-item.dropdown').forEach(function (item) {
      var toggleEl = item.querySelector('[data-bs-toggle="dropdown"]');
      if (!toggleEl) { return; }
      var dropdown = bootstrap.Dropdown.getOrCreateInstance(toggleEl);
      var openTimer = null, closeTimer = null;
      item.addEventListener('mouseenter', function () {
        clearTimeout(closeTimer);
        openTimer = setTimeout(function () { dropdown.show(); }, 60);
      });
      item.addEventListener('mouseleave', function () {
        clearTimeout(openTimer);
        closeTimer = setTimeout(function () { dropdown.hide(); }, 200);
      });
    });
  }
});
