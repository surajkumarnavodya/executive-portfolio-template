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
    if ($(this).hasClass('nav-link')) {
      $('.navbar .nav-link').removeClass('active');
      $(this).addClass('active');
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
     element inside the hero (#impact) is tracked correctly. Picks the last
     target whose top has passed the reading line — no dead zones between
     sections, and no stale "previous" link staying lit. */
  var navTargets = [];
  $('.navbar .nav-link[href^="#"]').each(function () {
    var id = $(this).attr('href').slice(1);
    var el = document.getElementById(id);
    if (el) navTargets.push({ id: id, el: el });
  });

  var lockUntil = 0;   // ignore the spy while a click-triggered smooth scroll runs

  function paintActive() {
    if (!navTargets.length || Date.now() < lockUntil) return;
    var line = $(window).scrollTop() + (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 100) + 12;
    var current = null;
    navTargets.forEach(function (t) {
      if ($(t.el).offset().top <= line) current = t.id;
    });
    // Bottom of page: always light the last link
    if ($(window).scrollTop() + $(window).height() >= document.documentElement.scrollHeight - 4) {
      current = navTargets[navTargets.length - 1].id;
    }
    var $links = $('.navbar .nav-link');
    $links.removeClass('active');
    if (current) $links.filter('[href="#' + current + '"]').addClass('active');
  }

  $(window).on('scroll resize', paintActive);
  paintActive();
  $('.navbar .nav-link[href^="#"]').on('click', function () { lockUntil = Date.now() + 700; });

  /* ---------- Collapse mobile nav on link click ---------- */
  $('.navbar .nav-link, .navbar .btn').on('click', function () {
    var nav = document.getElementById('nav');
    if (nav.classList.contains('show')) bootstrap.Collapse.getInstance(nav).hide();
  });
});
