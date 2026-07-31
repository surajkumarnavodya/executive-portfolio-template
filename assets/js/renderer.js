/* renderer.js — JSON-driven optional renderer
 * Loads content from assets/data/ when enabled in config.js and
 * replaces long-form HTML sections (experience, testimonials, recognition,
 * success-stories) with JSON-driven templates. Keeps the existing HTML
 * markup intact when data is disabled or files are missing.
 */
(function () {
  'use strict';

  var cfg = window.PORTFOLIO_CONFIG || {};
  var dataCfg = cfg.data || { useData: false, path: 'assets/data/' };
  if (!dataCfg.useData) { return; }

  var base = dataCfg.path || 'assets/data/';

  function fetchJson(name) {
    var url = base + name;
    return fetch(url, { cache: 'no-cache' }).then(function (res) {
      if (!res.ok) { throw new Error('Not found: ' + url); }
      return res.json();
    });
  }

  function safeSetHTML(id, html) {
    var el = document.getElementById(id);
    if (!el) { return; }
    el.innerHTML = html;
  }

  /* Render experience timeline (expects array of {title, company, start, end, blurb, bullets}) */
  function renderExperience(items) {
    if (!Array.isArray(items) || items.length === 0) { return; }
    var out = [];
    items.forEach(function (it, index) {
      out.push('<div class="t-item reveal ' + (index % 2 ? 'd2' : 'd1') + '">');
      out.push('<p class="t-when">' + escapeHtml(it.start || '') + ' → ' + escapeHtml(it.end || 'Present') + '</p>');
      out.push('<p class="t-role mb-0">' + escapeHtml(it.title || '') + '</p>');
      if (it.company) { out.push('<p class="t-org">' + escapeHtml(it.company) + '</p>'); }
      if (it.blurb) { out.push('<p class="t-body">' + escapeHtml(it.blurb) + '</p>'); }
      if (Array.isArray(it.bullets) && it.bullets.length) {
        out.push('<ul class="mt-3 ps-3">');
        it.bullets.forEach(function (b) { out.push('<li class="t-body mb-2">' + escapeHtml(b) + '</li>'); });
        out.push('</ul>');
      }
      out.push('</div>');
    });
    safeSetHTML('experience-content', out.join('\n'));
  }
 
  /* Render testimonials (expects array of {name, role, quote, org, avatar}) */
  function renderTestimonials(items) {
    if (!Array.isArray(items) || items.length === 0) { return; }
    var out = [];
    items.forEach(function (it, index) {
      out.push('<div class="col-lg-6 reveal ' + (index % 2 ? 'd2' : 'd1') + '">');
      out.push('<div class="x-card t-card">');
      out.push('<i class="bi bi-quote t-quote"></i>');
      out.push('<h3 class="fs-6 fw-bold">Recommendation</h3>');
      out.push('<p class="t-text">"' + escapeHtml(it.quote || '') + '"</p>');
      out.push('<div class="t-person">');
      out.push('<div class="t-avatar"><i class="bi bi-person-fill"></i></div>');
      out.push('<div><strong>' + escapeHtml(it.name || '') + '</strong>');
      if (it.role || it.org) {
        out.push('<span class="t-role">' + escapeHtml([it.role, it.org].filter(Boolean).join(' · ')) + '</span>');
      }
      out.push('</div></div></div></div>');
    });
    safeSetHTML('testimonials-content', out.join('\n'));
  }
 
  /* Render recognition/awards (expects array of {year, title, issuer, note}) */
  function renderRecognition(items) {
    if (!Array.isArray(items) || items.length === 0) { return; }
    var out = [];
    out.push('<div class="col-12 reveal d1"><div class="x-card"><h3 class="fs-5 fw-bold mb-3"><i class="bi bi-patch-check me-2" style="color:var(--accent)"></i>Recognition highlights</h3><div class="cred-grid">');
    items.forEach(function (it) {
      out.push('<div class="cred-row"><i class="bi bi-award"></i><span>' + escapeHtml((it.year ? String(it.year) + ' · ' : '') + (it.title || '') + (it.issuer ? ' · ' + it.issuer : '')) + '</span></div>');
      if (it.note) { out.push('<p class="text-2 mt-2 mb-0">' + escapeHtml(it.note) + '</p>'); }
    });
    out.push('</div></div></div>');
    safeSetHTML('recognition-content', out.join('\n'));
  }
 
  /* Render success stories / case studies (expects array of {title, subtitle, summary, link}) */
  function renderSuccessStories(items) {
    if (!Array.isArray(items) || items.length === 0) { return; }
    var out = [];
    items.forEach(function (it, index) {
      out.push('<div class="col-lg-6 reveal ' + (index % 2 ? 'd2' : 'd1') + '">');
      out.push('<div class="x-card">');
      out.push('<div class="d-flex gap-2 mb-3 flex-wrap"><span class="tag">Case Study</span><span class="chip green"><span class="cd"></span>DELIVERED</span></div>');
      out.push('<h3 class="fs-4 fw-bold">' + escapeHtml(it.title || '') + '</h3>');
      if (it.subtitle) { out.push('<p class="text-2 mt-2 mb-2">' + escapeHtml(it.subtitle) + '</p>'); }
      if (it.summary) { out.push('<p class="text-2">' + escapeHtml(it.summary) + '</p>'); }
      if (it.link) { out.push('<p class="mb-0"><a href="' + escapeAttr(it.link) + '" target="_blank" rel="noopener">Read case study</a></p>'); }
      out.push('</div></div>');
    });
    safeSetHTML('success-stories-content', out.join('\n'));
  }

  /* Utilities */
  function escapeHtml(s) {
    if (!s && s !== 0) { return ''; }
    return String(s).replace(/[&"'<>]/g, function (c) {
      return { '&': '&amp;', '"': '&quot;', "'": '&#39;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }
  function escapeAttr(s) { return escapeHtml(s).replace(/"/g, '&quot;'); }

  function renderPortfolio(portfolio) {
    if (!portfolio) { return; }
    if (Array.isArray(portfolio.experience)) { renderExperience(portfolio.experience); }
    if (Array.isArray(portfolio.testimonials)) { renderTestimonials(portfolio.testimonials); }
    if (Array.isArray(portfolio.awards)) { renderRecognition(portfolio.awards); }
    if (Array.isArray(portfolio.projects)) { renderSuccessStories(portfolio.projects); }
  }

  /* Fetch the unified portfolio data first, then fall back to the legacy JSON files. */
  fetchJson('portfolio.json').then(function (portfolio) {
    renderPortfolio(portfolio);
  }).catch(function () {
    var tasks = [];
    tasks.push(fetchJson('experience.json').then(renderExperience).catch(function () {}));
    tasks.push(fetchJson('testimonials.json').then(renderTestimonials).catch(function () {}));
    tasks.push(fetchJson('recognition.json').then(renderRecognition).catch(function () {}));
    tasks.push(fetchJson('success-stories.json').then(renderSuccessStories).catch(function () {}));
    Promise.all(tasks).catch(function () { /* ignore individual failures */ });
  });

})();
