/*!
 * customizer.js — theme customizer + presets + visual layout builder
 */
(function () {
  'use strict';
  window.__portfolioCustomizerEnabled = !!(window.PORTFOLIO_CONFIG && window.PORTFOLIO_CONFIG.theme && window.PORTFOLIO_CONFIG.theme.enableCustomizer);

  var STORAGE_KEY = 'pf-theme-customizer-v2';
  var root = document.documentElement;
  var cfg = window.PORTFOLIO_CONFIG || {};
  var themeCfg = cfg.theme || {};
  var DEFAULT_SECTION_ORDER = ['about', 'experience', 'leadership', 'delivery-framework', 'success-stories', 'expertise', 'ai-leadership', 'recognition', 'insights', 'testimonials', 'contact'];
  // Default navbar link order. Kept as its own array (rather than derived
  // from DEFAULT_SECTION_ORDER) because the two lists aren't quite the same
  // shape: 'delivery-framework' has no standalone nav link (it isn't
  // significant enough for its own top-level item), and 'ai-leadership' /
  // 'insights' / 'testimonials' are reached via the Expertise/Proof dropdowns
  // rather than as top-level links. Each dropdown is represented here by one
  // anchor id — its first member — since the nav-reorder logic below moves
  // the whole dropdown <li>, not individual items inside it. Even so, the
  // *relative* order of every id both lists share is deliberately identical
  // to DEFAULT_SECTION_ORDER, so scrolling the page and reading the nav
  // left-to-right land on sections in the same sequence.
  var DEFAULT_NAV_ORDER = ['about', 'experience', 'leadership', 'success-stories', 'expertise', 'recognition'];

  var PRESETS = {
    ceo: {
      key: 'ceo',
      label: 'CEO',
      heroPhrases: ['board-level execution.', 'growth with governance.', 'strategy into results.', 'decisive. trusted. bold.'],
      valueStatement: 'I lead enterprise programs that align strategy, execution, and measurable business impact at scale.',
      lede: 'Executive leader focused on transformation outcomes, operating discipline, and stakeholder trust across complex portfolios.',
      primaryCta: '<i class="bi bi-calendar-check me-2"></i>Schedule Executive Conversation'
    },
    cto: {
      key: 'cto',
      label: 'CTO',
      heroPhrases: ['technology. certainty.', 'platforms that perform.', 'architecture. velocity.', 'engineering excellence.'],
      valueStatement: 'I bridge architecture, engineering, and business priorities to deliver resilient technology outcomes.',
      lede: 'Technology executive profile with deep engineering foundations, modern platform thinking, and enterprise delivery accountability.',
      primaryCta: '<i class="bi bi-calendar-check me-2"></i>Schedule Technology Review'
    },
    cio: {
      key: 'cio',
      label: 'CIO',
      heroPhrases: ['IT as strategic edge.', 'governance and security.', 'portfolio clarity.', 'digital transformation.'],
      valueStatement: 'I shape enterprise IT portfolios that improve resilience, transparency, and business value realization.',
      lede: 'CIO-oriented profile balancing technology governance, financial discipline, and measurable transformation outcomes.',
      primaryCta: '<i class="bi bi-calendar-check me-2"></i>Schedule CIO Discussion'
    },
    programDirector: {
      key: 'programDirector',
      label: 'Program Director',
      heroPhrases: ['multi-program clarity.', 'governance at scale.', 'predictable outcomes.', 'leadership visibility.'],
      valueStatement: 'I run strategic programs with disciplined governance, risk transparency, and consistent value delivery.',
      lede: 'Program Director profile focused on steering complex portfolios through structured execution, cross-team alignment, and adoption.',
      primaryCta: '<i class="bi bi-calendar-check me-2"></i>Schedule Program Review'
    },
    deliveryManager: {
      key: 'deliveryManager',
      label: 'Delivery Manager',
      heroPhrases: ['outcomes. teams. trust.', 'on time. on budget.', 'client confidence up.', 'disciplined delivery.'],
      valueStatement: 'I lead enterprise delivery with governance rigor, strong client partnership, and measurable execution quality.',
      lede: 'Enterprise <strong>Program &amp; Project Manager</strong> with <strong>12+ years</strong> of experience and <strong>8+ years</strong> on .NET engineering foundation, delivering multi-account programs through strong governance, client partnerships, technical leadership, and measurable business outcomes.',
      primaryCta: '<i class="bi bi-calendar-check me-2"></i>Schedule Delivery Discussion'
    },
    engineeringManager: {
      key: 'engineeringManager',
      label: 'Engineering Manager',
      heroPhrases: ['teams built for velocity.', 'people growth. quality.', 'durable delivery.', 'reliability by design.'],
      valueStatement: 'I grow engineering teams that ship predictable outcomes without compromising quality or resilience.',
      lede: 'Engineering Manager profile centered on team capability, technical depth, and delivery accountability in enterprise environments.',
      primaryCta: '<i class="bi bi-calendar-check me-2"></i>Schedule Engineering Discussion'
    },
    productLeader: {
      key: 'productLeader',
      label: 'Product Leader',
      heroPhrases: ['outcomes over output.', 'strategy to delivery.', 'customer value at scale.', 'product. pace. purpose.'],
      valueStatement: 'I align product direction, engineering execution, and business outcomes for sustainable growth.',
      lede: 'Product leadership profile with strong delivery foundations, enabling outcome-focused roadmaps and trusted stakeholder alignment.',
      primaryCta: '<i class="bi bi-calendar-check me-2"></i>Schedule Product Conversation'
    },
    consultant: {
      key: 'consultant',
      label: 'Consultant',
      heroPhrases: ['clarity with realism.', 'strategy meets execution.', 'stakeholder confidence.', 'practical. measurable.'],
      valueStatement: 'I help organizations de-risk transformation initiatives and translate strategy into operationally sound execution.',
      lede: 'Consulting-oriented profile combining hands-on technology roots with executive delivery governance and change adoption expertise.',
      primaryCta: '<i class="bi bi-calendar-check me-2"></i>Schedule Consultation'
    }
  };

  var FONTS = {
    inter: { label: 'Inter + Fraunces', body: '"Inter", system-ui, sans-serif', display: '"Fraunces", Georgia, serif' },
    source: { label: 'Source Sans 3 + Playfair Display', body: '"Source Sans 3", system-ui, sans-serif', display: '"Playfair Display", Georgia, serif', googleFonts: 'family=Source+Sans+3:wght@400;500;600;700&family=Playfair+Display:wght@600;700' },
    system: { label: 'System Sans + Georgia', body: 'system-ui, -apple-system, "Segoe UI", sans-serif', display: 'Georgia, serif' }
  };

  // Inter + Fraunces (+ JetBrains Mono for data labels) ship in every page's own
  // <link>, since 'inter' is the default the live site actually renders in. The
  // other typography presets are opt-in only: nobody pays their Google Fonts
  // request unless they're actually picked in the customizer.
  var optionalFontsLoaded = {};
  function ensureFontLoaded(fontKey) {
    var font = FONTS[fontKey];
    if (!font || !font.googleFonts || optionalFontsLoaded[fontKey]) { return; }
    optionalFontsLoaded[fontKey] = true;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?' + font.googleFonts + '&display=swap';
    document.head.appendChild(link);
  }

  var state = {
    mode: themeCfg.defaultMode || 'dark',
    palette: themeCfg.palette || 'navy',
    font: themeCfg.defaultFont || 'inter',
    radius: themeCfg.defaultRadius || 14,
    motion: themeCfg.defaultMotion || 'normal',
    preset: themeCfg.defaultPreset || 'deliveryManager',
    accent: '',
    accentAlt: '',
    sectionOrder: DEFAULT_SECTION_ORDER.slice(),
    sectionVisibility: {}
  };

  DEFAULT_SECTION_ORDER.forEach(function (id) { state.sectionVisibility[id] = true; });

  function readStorage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) { raw = localStorage.getItem('pf-theme-customizer-v1'); }
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          Object.keys(state).forEach(function (k) {
            if (parsed[k] !== undefined && parsed[k] !== null) { state[k] = parsed[k]; }
          });
        }
      }
    } catch (e) {}
    sanitizeSectionState();
  }

  function sanitizeSectionState() {
    if (state.preset === 'executive') { state.preset = 'deliveryManager'; }
    if (state.preset === 'delivery') { state.preset = 'programDirector'; }
    if (state.preset === 'engineering') { state.preset = 'engineeringManager'; }
    if (!PRESETS[state.preset]) { state.preset = 'deliveryManager'; }
    if (!Array.isArray(state.sectionOrder) || !state.sectionOrder.length) { state.sectionOrder = DEFAULT_SECTION_ORDER.slice(); }
    var seen = {};
    state.sectionOrder = state.sectionOrder.filter(function (id) {
      if (DEFAULT_SECTION_ORDER.indexOf(id) === -1 || seen[id]) { return false; }
      seen[id] = true;
      return true;
    });
    DEFAULT_SECTION_ORDER.forEach(function (id) {
      if (state.sectionOrder.indexOf(id) === -1) { state.sectionOrder.push(id); }
      if (typeof state.sectionVisibility[id] !== 'boolean') { state.sectionVisibility[id] = true; }
    });
  }

  function saveStorage() {
    sanitizeSectionState();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function arraysEqual(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) { return false; }
    for (var i = 0; i < a.length; i += 1) { if (a[i] !== b[i]) { return false; } }
    return true;
  }

  function hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') { return null; }
    var value = hex.trim().replace('#', '');
    if (value.length === 3) { value = value[0] + value[0] + value[1] + value[1] + value[2] + value[2]; }
    if (!/^[0-9a-fA-F]{6}$/.test(value)) { return null; }
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16)
    };
  }

  function applyTheme() {
    root.setAttribute('data-bs-theme', state.mode === 'light' ? 'light' : 'dark');
    root.setAttribute('data-palette', state.palette || 'navy');
    root.setAttribute('data-motion', state.motion || 'normal');
    root.style.setProperty('--radius', parseInt(state.radius, 10) + 'px');
    if (state.accent) {
      root.style.setProperty('--accent', state.accent);
      var rgb = hexToRgb(state.accent);
      if (rgb) { root.style.setProperty('--accent-rgb', rgb.r + ',' + rgb.g + ',' + rgb.b); }
    }
    if (state.accentAlt) { root.style.setProperty('--accent-2', state.accentAlt); }
    var font = FONTS[state.font] || FONTS.inter;
    ensureFontLoaded(state.font);
    root.style.setProperty('--font-body', font.body);
    root.style.setProperty('--font-display', font.display);
    root.style.setProperty('--font-serif', font.display);

    var icon = document.querySelector('#themeToggle i');
    if (icon) { icon.className = state.mode === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars'; }
    var swatches = document.querySelectorAll('.pal-swatch');
    Array.prototype.forEach.call(swatches, function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-palette') === state.palette));
    });
  }

  function applyPreset() {
    var preset = PRESETS[state.preset] || PRESETS.deliveryManager;
    if (window.PortfolioComponents && typeof window.PortfolioComponents.render === 'function') {
      window.PortfolioComponents.render('hero', preset);
    }
    root.setAttribute('data-home-preset', preset.key);
  }

  function applySectionLayout() {
    sanitizeSectionState();
    var main = document.getElementById('main');
    if (!main) { return; }
    state.sectionOrder.forEach(function (id) {
      var node = document.getElementById(id);
      if (node && node.parentElement === main) { main.appendChild(node); }
    });
    state.sectionOrder.forEach(function (id) {
      var section = document.getElementById(id);
      if (!section) { return; }
      var visible = state.sectionVisibility[id] !== false;
      section.hidden = !visible;
      section.setAttribute('aria-hidden', String(!visible));
      // Matches both top-level .nav-link items and links nested inside the
      // "Expertise" / "Proof" dropdown menus.
      var navLink = document.querySelector('.navbar .nav-link[href="#' + id + '"], .navbar .dropdown-item[href="#' + id + '"]');
      if (navLink) {
        var navItem = navLink.closest('li') || navLink;
        navItem.style.display = visible ? '' : 'none';
      }
    });
    // Reorder top-level nav items. Links inside a dropdown menu stay in
    // their submenu rather than being promoted into the primary nav row —
    // but the dropdown's own top-level <li> still needs to move to the
    // position of its first member id, or it is simply never touched by
    // this loop (its href doesn't match any ":scope > li > .nav-link") and
    // is left stranded wherever it started, ahead of every section that
    // *did* get moved. Each dropdown is moved at most once, anchored to
    // whichever of its member ids the order array reaches first.
    //
    // The order followed is state.sectionOrder only once the user has
    // actually customized it via the Visual Layout Builder (dragging,
    // importing a config, etc.) — i.e. it no longer matches the shipped
    // DEFAULT_SECTION_ORDER. Until then, the nav follows DEFAULT_NAV_ORDER,
    // which is intentionally a *different* sequence from the page's own
    // section flow (see its declaration above). Once the user has taken
    // the wheel via the layout builder, their dragged order wins for both
    // the sections and the nav together, as that feature is designed to.
    var navList = document.querySelector('.navbar .navbar-nav');
    if (navList) {
      var sectionOrderIsDefault = arraysEqual(state.sectionOrder, DEFAULT_SECTION_ORDER);
      var navOrderSource = sectionOrderIsDefault ? DEFAULT_NAV_ORDER : state.sectionOrder;
      var movedDropdowns = [];
      navOrderSource.forEach(function (id) {
        var directLink = navList.querySelector(':scope > li > .nav-link[href="#' + id + '"]');
        if (directLink) { navList.appendChild(directLink.closest('li')); return; }
        var dropdownItem = navList.querySelector('.dropdown-item[href="#' + id + '"]');
        var dropdownLi = dropdownItem && dropdownItem.closest('li.nav-item.dropdown');
        if (dropdownLi && movedDropdowns.indexOf(dropdownLi) === -1) {
          movedDropdowns.push(dropdownLi);
          navList.appendChild(dropdownLi);
        }
      });
    }
  }

  function exportCustomizerConfig() {
    var payload = {
      mode: state.mode,
      palette: state.palette,
      font: state.font,
      radius: state.radius,
      motion: state.motion,
      preset: state.preset,
      accent: state.accent || null,
      accentAlt: state.accentAlt || null,
      sectionOrder: state.sectionOrder.slice(),
      sectionVisibility: Object.assign({}, state.sectionVisibility)
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'template-customizer-config.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  }

  function importCustomizerConfig(file, paintForm) {
    if (!file) { return; }
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(String(reader.result || '{}'));
        Object.keys(state).forEach(function (k) {
          if (parsed[k] !== undefined && parsed[k] !== null) { state[k] = parsed[k]; }
        });
        sanitizeSectionState();
        applyTheme();
        applyPreset();
        applySectionLayout();
        saveStorage();
        if (typeof paintForm === 'function') { paintForm(); }
      } catch (e) {
        console.warn('Invalid customizer configuration JSON.', e);
      }
    };
    reader.readAsText(file);
  }

  function buildPanel() {
    var panel = document.createElement('aside');
    panel.className = 'customizer-panel';
    panel.id = 'themeCustomizerPanel';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Theme customizer');
    panel.innerHTML = [
      '<div class="customizer-title">Template Customizer</div>',
      '<div class="customizer-scroll">',
      '  <div class="customizer-group"><label class="customizer-label" for="tc-mode">Color mode</label><select id="tc-mode"><option value="dark">Dark</option><option value="light">Light</option></select></div>',
      '  <div class="customizer-group"><label class="customizer-label" for="tc-palette">Accent palette</label><select id="tc-palette"><option value="navy">Navy</option><option value="corporate">Corporate</option><option value="emerald">Emerald</option><option value="executive">Executive</option><option value="purple">Purple</option><option value="charcoal">Charcoal</option></select></div>',
      '  <div class="customizer-group customizer-row"><div><label class="customizer-label" for="tc-accent">Primary accent</label><input id="tc-accent" type="color"></div><div><label class="customizer-label" for="tc-accent-alt">Secondary accent</label><input id="tc-accent-alt" type="color"></div></div>',
      '  <div class="customizer-group"><label class="customizer-label" for="tc-font">Font pairing</label><select id="tc-font"><option value="inter">' + FONTS.inter.label + '</option><option value="source">' + FONTS.source.label + '</option><option value="system">' + FONTS.system.label + '</option></select></div>',
      '  <div class="customizer-group"><label class="customizer-label" for="tc-radius">Border radius</label><input id="tc-radius" type="range" min="8" max="24" step="1"></div>',
      '  <div class="customizer-group"><label class="customizer-label" for="tc-motion">Animation intensity</label><select id="tc-motion"><option value="none">None</option><option value="reduced">Reduced</option><option value="normal">Normal</option><option value="vivid">Vivid</option></select></div>',
      '  <div class="customizer-group"><label class="customizer-label">Homepage preset</label><div class="customizer-preset-grid">',
      '    <button type="button" class="preset-chip" data-preset="ceo">CEO</button>',
      '    <button type="button" class="preset-chip" data-preset="cto">CTO</button>',
      '    <button type="button" class="preset-chip" data-preset="cio">CIO</button>',
      '    <button type="button" class="preset-chip" data-preset="programDirector">Program Director</button>',
      '    <button type="button" class="preset-chip" data-preset="deliveryManager">Delivery Manager</button>',
      '    <button type="button" class="preset-chip" data-preset="engineeringManager">Engineering Manager</button>',
      '    <button type="button" class="preset-chip" data-preset="productLeader">Product Leader</button>',
      '    <button type="button" class="preset-chip" data-preset="consultant">Consultant</button>',
      '  </div></div>',
      '  <div class="customizer-group"><label class="customizer-label">Visual Layout Builder</label><p class="customizer-help">Drag to reorder sections and toggle visibility.</p><ul id="tc-section-list" class="customizer-section-list"></ul></div>',
      '</div>',
      '<input id="tc-import-file" type="file" accept="application/json" hidden>',
      '<div class="customizer-row customizer-row-4">',
      '  <button type="button" class="preset-chip" id="tc-export">Export</button>',
      '  <button type="button" class="preset-chip" id="tc-import">Import</button>',
      '  <button type="button" class="preset-chip" id="tc-layout-reset">Layout reset</button>',
      '  <button type="button" class="preset-chip" id="tc-reset">Reset all</button>',
      '</div>',
      '<div class="customizer-row"><button type="button" class="preset-chip" id="tc-close">Close</button></div>'
    ].join('');
    document.body.appendChild(panel);

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'customizer-toggle';
    toggle.id = 'themeCustomizerToggle';
    toggle.setAttribute('aria-controls', panel.id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open template customizer');
    toggle.innerHTML = '<i class="bi bi-sliders"></i>';
    // Only add the floating "sliders" button when config.js -> theme.enableCustomizer is true.
    if (themeCfg.enableCustomizer) {
      document.body.appendChild(toggle);
    }

    function setOpen(open) {
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open) {
        var first = panel.querySelector('#tc-mode');
        if (first) { first.focus(); }
      }
    }

    toggle.addEventListener('click', function () { setOpen(panel.hidden); });
    panel.querySelector('#tc-close').addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) { setOpen(false); }
    });
    return panel;
  }

  function bindSectionBuilder(panel, paintForm) {
    var list = panel.querySelector('#tc-section-list');
    if (!list) { return; }
    var dragId = null;

    function renderList() {
      list.innerHTML = state.sectionOrder.map(function (id) {
        var label = id.replace(/-/g, ' ').replace(/\b\w/g, function (m) { return m.toUpperCase(); });
        var checked = state.sectionVisibility[id] !== false ? 'checked' : '';
        return '<li class="customizer-section-item" draggable="true" data-section-id="' + id + '">' +
          '<span class="customizer-drag-handle" aria-hidden="true">\u22EE\u22EE</span>' +
          '<label><input type="checkbox" data-section-toggle="' + id + '" ' + checked + '> ' + label + '</label>' +
          '</li>';
      }).join('');

      list.querySelectorAll('.customizer-section-item').forEach(function (item) {
        item.addEventListener('dragstart', function () {
          dragId = item.getAttribute('data-section-id');
          item.classList.add('dragging');
        });
        item.addEventListener('dragend', function () {
          dragId = null;
          item.classList.remove('dragging');
        });
        item.addEventListener('dragover', function (e) { e.preventDefault(); });
        item.addEventListener('drop', function (e) {
          e.preventDefault();
          var targetId = item.getAttribute('data-section-id');
          if (!dragId || dragId === targetId) { return; }
          var from = state.sectionOrder.indexOf(dragId);
          var to = state.sectionOrder.indexOf(targetId);
          if (from < 0 || to < 0) { return; }
          var moved = state.sectionOrder.splice(from, 1)[0];
          state.sectionOrder.splice(to, 0, moved);
          applySectionLayout();
          saveStorage();
          renderList();
        });
      });

      list.querySelectorAll('[data-section-toggle]').forEach(function (box) {
        box.addEventListener('change', function () {
          var id = box.getAttribute('data-section-toggle');
          state.sectionVisibility[id] = box.checked;
          applySectionLayout();
          saveStorage();
        });
      });
    }

    renderList();
    panel.querySelector('#tc-layout-reset').addEventListener('click', function () {
      state.sectionOrder = DEFAULT_SECTION_ORDER.slice();
      state.sectionVisibility = {};
      DEFAULT_SECTION_ORDER.forEach(function (id) { state.sectionVisibility[id] = true; });
      applySectionLayout();
      saveStorage();
      renderList();
      if (typeof paintForm === 'function') { paintForm(); }
    });
    return renderList;
  }

  function bind(panel) {
    var mode = panel.querySelector('#tc-mode');
    var palette = panel.querySelector('#tc-palette');
    var font = panel.querySelector('#tc-font');
    var radius = panel.querySelector('#tc-radius');
    var motion = panel.querySelector('#tc-motion');
    var accent = panel.querySelector('#tc-accent');
    var accentAlt = panel.querySelector('#tc-accent-alt');
    var importInput = panel.querySelector('#tc-import-file');

    function paintForm() {
      mode.value = state.mode;
      palette.value = state.palette;
      font.value = state.font;
      radius.value = String(state.radius);
      motion.value = state.motion;
      accent.value = state.accent || '#4f8cff';
      accentAlt.value = state.accentAlt || '#22c07a';
      var chips = panel.querySelectorAll('.preset-chip[data-preset]');
      Array.prototype.forEach.call(chips, function (chip) {
        chip.setAttribute('aria-pressed', String(chip.getAttribute('data-preset') === state.preset));
      });
    }

    var renderList = bindSectionBuilder(panel, paintForm);

    mode.addEventListener('change', function () { state.mode = mode.value; applyTheme(); saveStorage(); });
    palette.addEventListener('change', function () { state.palette = palette.value; applyTheme(); saveStorage(); });
    font.addEventListener('change', function () { state.font = font.value; applyTheme(); saveStorage(); });
    radius.addEventListener('input', function () { state.radius = parseInt(radius.value, 10) || 14; applyTheme(); saveStorage(); });
    motion.addEventListener('change', function () { state.motion = motion.value; applyTheme(); saveStorage(); });
    accent.addEventListener('change', function () { state.accent = accent.value; applyTheme(); saveStorage(); });
    accentAlt.addEventListener('change', function () { state.accentAlt = accentAlt.value; applyTheme(); saveStorage(); });

    panel.addEventListener('click', function (e) {
      var presetBtn = e.target.closest && e.target.closest('[data-preset]');
      if (presetBtn) {
        state.preset = presetBtn.getAttribute('data-preset');
        applyPreset();
        saveStorage();
        paintForm();
      }
    });

    panel.querySelector('#tc-export').addEventListener('click', exportCustomizerConfig);
    panel.querySelector('#tc-import').addEventListener('click', function () { importInput.click(); });
    importInput.addEventListener('change', function (event) {
      var file = event.target.files && event.target.files[0];
      importCustomizerConfig(file, function () {
        paintForm();
        if (typeof renderList === 'function') { renderList(); }
      });
      event.target.value = '';
    });

    panel.querySelector('#tc-reset').addEventListener('click', function () {
      state.mode = themeCfg.defaultMode || 'dark';
      state.palette = themeCfg.palette || 'navy';
      state.font = themeCfg.defaultFont || 'inter';
      state.radius = themeCfg.defaultRadius || 14;
      state.motion = themeCfg.defaultMotion || ((window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 'none' : 'normal');
      state.preset = themeCfg.defaultPreset || 'deliveryManager';
      state.accent = '';
      state.accentAlt = '';
      state.sectionOrder = DEFAULT_SECTION_ORDER.slice();
      state.sectionVisibility = {};
      DEFAULT_SECTION_ORDER.forEach(function (id) { state.sectionVisibility[id] = true; });
      applyTheme();
      applyPreset();
      applySectionLayout();
      saveStorage();
      paintForm();
      if (typeof renderList === 'function') { renderList(); }
    });

    // The navbar theme toggle is shared with theme.js's fallback handler.
    // Only bind our own listener when the customizer is enabled, or the two
    // would both fire on every click and cancel each other out.
    if (themeCfg.enableCustomizer) {
      var navToggle = document.getElementById('themeToggle');
      if (navToggle) {
        navToggle.addEventListener('click', function () {
          state.mode = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
          applyTheme();
          saveStorage();
          paintForm();
        });
      }
    }

    document.addEventListener('click', function (e) {
      var sw = e.target.closest && e.target.closest('.pal-swatch');
      if (!sw) { return; }
      state.palette = sw.getAttribute('data-palette') || 'navy';
      applyTheme();
      saveStorage();
      paintForm();
    });

    paintForm();
  }

  function init() {
    readStorage();
    var hasSaved = false;
    try { hasSaved = !!localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches && !hasSaved) { state.motion = 'none'; }
    applyTheme();
    applyPreset();
    applySectionLayout();
    var panel = buildPanel();
    bind(panel);
    document.body.classList.add('page-ready');

    window.PortfolioThemeCustomizer = {
      getState: function () { return JSON.parse(JSON.stringify(state)); },
      set: function (next) {
        if (!next || typeof next !== 'object') { return; }
        Object.keys(next).forEach(function (k) {
          if (state[k] !== undefined) { state[k] = next[k]; }
        });
        sanitizeSectionState();
        applyTheme();
        applyPreset();
        applySectionLayout();
        saveStorage();
      },
      presets: Object.keys(PRESETS)
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
