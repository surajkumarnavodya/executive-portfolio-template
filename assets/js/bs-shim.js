/*!
 * bs-shim.js — Executive Portfolio Template
 * Minimal replacement for the Bootstrap JS bundle (jQuery-free bundle was
 * still ~80KB incl. Popper). Auditing every data-bs-toggle in index.html /
 * engineering.html confirms exactly two components are used anywhere on
 * this site: Collapse (the mobile nav toggler) and Dropdown (the two nav
 * dropdowns, "Expertise" and "Proof"). No Modal, Tooltip, Popover,
 * Carousel, Tab, Toast, Alert or ScrollSpy usage exists.
 *
 * Exposes window.bootstrap.Collapse / .Dropdown with the same
 * getInstance/getOrCreateInstance + show()/hide() API navigation.js already
 * calls, so navigation.js needed zero changes for this swap.
 *
 * Why Popper isn't needed: this site's .dropdown-menu is positioned purely
 * by CSS (.dropdown{position:relative} + .dropdown-menu{position:absolute}
 * from Bootstrap's own CSS, still loaded, plus this site's own margin-top
 * gap in style.css) — the exact "static" positioning Bootstrap itself uses
 * when data-bs-display="static" is set specifically to drop the Popper
 * dependency. A 2-item menu anchored inside a fixed navbar needs no
 * collision/flip logic.
 *
 * Bootstrap's own CSS (bootstrap.min.css, still loaded) drives the visuals:
 * .collapse/.collapsing/.show and .dropdown-menu/.dropdown-menu.show. This
 * file only toggles the same classes + aria attributes Bootstrap's JS would.
 */
(function () {
  'use strict';

  function prefersReducedMotion() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  /* ================= Collapse ================= */
  var collapseInstances = new WeakMap();

  function Collapse(el) {
    this.el = el;
    collapseInstances.set(el, this);
  }

  function setToggleExpanded(collapseEl, expanded) {
    var id = collapseEl.getAttribute('id');
    if (!id) { return; }
    document.querySelectorAll('[data-bs-toggle="collapse"][data-bs-target="#' + id + '"]').forEach(function (btn) {
      btn.setAttribute('aria-expanded', String(expanded));
    });
  }

  // Runs `done` once, whichever comes first: the real transitionend, or a
  // safety-net timeout — so a zero-duration transition (prefers-reduced-
  // motion, or any other reason transitionend might not fire) can never
  // leave an inline height stuck forever.
  function afterTransition(el, done) {
    var finished = false;
    function finish() {
      if (finished) { return; }
      finished = true;
      el.removeEventListener('transitionend', onEnd);
      clearTimeout(timer);
      done();
    }
    function onEnd(ev) { if (ev.target === el && ev.propertyName === 'height') { finish(); } }
    el.addEventListener('transitionend', onEnd);
    var timer = setTimeout(finish, 400); // > the .35s CSS transition
  }

  Collapse.prototype.show = function () {
    var el = this.el;
    if (el.classList.contains('show')) { return; }
    setToggleExpanded(el, true);
    if (prefersReducedMotion()) {
      el.classList.add('show');
      return;
    }
    var target = el.scrollHeight;
    el.classList.remove('collapse');
    el.classList.add('collapsing');
    el.style.height = '0px';
    el.offsetHeight; /* eslint-disable-line no-unused-expressions -- force reflow so the 0px start registers before animating */
    el.style.height = target + 'px';
    afterTransition(el, function () {
      el.classList.remove('collapsing');
      el.classList.add('collapse', 'show');
      el.style.height = '';
    });
  };

  Collapse.prototype.hide = function () {
    var el = this.el;
    if (!el.classList.contains('show')) { return; }
    setToggleExpanded(el, false);
    if (prefersReducedMotion()) {
      el.classList.remove('show');
      return;
    }
    el.style.height = el.scrollHeight + 'px';
    el.offsetHeight; /* eslint-disable-line no-unused-expressions -- force reflow */
    el.classList.remove('collapse', 'show');
    el.classList.add('collapsing');
    el.style.height = '0px';
    afterTransition(el, function () {
      el.classList.remove('collapsing');
      el.classList.add('collapse');
      el.style.height = '';
    });
  };

  Collapse.prototype.toggle = function () {
    if (this.el.classList.contains('show')) { this.hide(); } else { this.show(); }
  };

  Collapse.getInstance = function (el) { return collapseInstances.get(el) || null; };
  Collapse.getOrCreateInstance = function (el) { return collapseInstances.get(el) || new Collapse(el); };

  document.addEventListener('click', function (ev) {
    var toggle = ev.target.closest('[data-bs-toggle="collapse"]');
    if (!toggle) { return; }
    var sel = toggle.getAttribute('data-bs-target') || toggle.getAttribute('href');
    if (!sel) { return; }
    var target = document.querySelector(sel);
    if (!target) { return; }
    ev.preventDefault();
    Collapse.getOrCreateInstance(target).toggle();
  });

  /* ================= Dropdown ================= */
  var dropdownInstances = new WeakMap();

  function Dropdown(toggleEl) {
    this.toggleEl = toggleEl;
    this.menu = toggleEl.parentElement && toggleEl.parentElement.querySelector(':scope > .dropdown-menu');
    dropdownInstances.set(toggleEl, this);
  }

  function allDropdowns() {
    var out = [];
    document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(function (el) {
      out.push(Dropdown.getOrCreateInstance(el));
    });
    return out;
  }
  function closeAllDropdowns() {
    allDropdowns().forEach(function (inst) { inst.hide(); });
  }

  Dropdown.prototype.show = function () {
    if (!this.menu || this.menu.classList.contains('show')) { return; }
    closeAllDropdowns();
    this.menu.classList.add('show');
    this.toggleEl.parentElement.classList.add('show');
    this.toggleEl.setAttribute('aria-expanded', 'true');
  };
  Dropdown.prototype.hide = function () {
    if (!this.menu || !this.menu.classList.contains('show')) { return; }
    this.menu.classList.remove('show');
    this.toggleEl.parentElement.classList.remove('show');
    this.toggleEl.setAttribute('aria-expanded', 'false');
  };
  Dropdown.prototype.toggle = function () {
    if (this.menu && this.menu.classList.contains('show')) { this.hide(); } else { this.show(); }
  };
  Dropdown.getInstance = function (el) { return dropdownInstances.get(el) || null; };
  Dropdown.getOrCreateInstance = function (el) { return dropdownInstances.get(el) || new Dropdown(el); };

  document.addEventListener('click', function (ev) {
    var toggle = ev.target.closest('[data-bs-toggle="dropdown"]');
    if (toggle) {
      ev.preventDefault();
      Dropdown.getOrCreateInstance(toggle).toggle();
      return;
    }
    if (!ev.target.closest('.dropdown-menu')) { closeAllDropdowns(); }
  });

  document.addEventListener('keydown', function (ev) {
    var openMenu = document.querySelector('.dropdown-menu.show');
    if (!openMenu) { return; }

    if (ev.key === 'Escape') {
      var toggle = openMenu.parentElement.querySelector('[data-bs-toggle="dropdown"]');
      closeAllDropdowns();
      if (toggle) { toggle.focus(); }
      return;
    }

    if (ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp') { return; }
    var isToggle = openMenu.parentElement.contains(ev.target) && ev.target.closest('[data-bs-toggle="dropdown"]');
    var isInMenu = openMenu.contains(ev.target);
    if (!isToggle && !isInMenu) { return; }
    ev.preventDefault();
    var items = Array.prototype.slice.call(openMenu.querySelectorAll('.dropdown-item'));
    if (!items.length) { return; }
    var idx = items.indexOf(document.activeElement);
    var next = ev.key === 'ArrowDown' ? idx + 1 : idx - 1;
    if (next < 0) { next = items.length - 1; }
    if (next >= items.length) { next = 0; }
    items[next].focus();
  });

  window.bootstrap = window.bootstrap || {};
  window.bootstrap.Collapse = Collapse;
  window.bootstrap.Dropdown = Dropdown;
})();
