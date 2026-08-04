/*!
 * components.js — reusable section component registry
 * Turns major homepage blocks into reusable renderable units.
 */
(function () {
  'use strict';

  var components = new Map();

  function text(el, value) {
    if (el && typeof value !== 'undefined' && value !== null) {
      el.textContent = String(value);
    } else if (el) {
      el.textContent = '';
    }
  }

  function setSafeHTML(el, value) {
    if (!el) { return; }
    if (typeof value !== 'string') {
      el.textContent = '';
      return;
    }

    var doc = new DOMParser().parseFromString(value, 'text/html');
    var allowedTags = new Set(['a', 'b', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'i', 'li', 'ol', 'p', 'span', 'strong', 'ul']);
    var allowedAttrs = {
      a: ['href', 'title', 'target', 'rel', 'class'],
      b: ['class', 'title'],
      code: ['class', 'title'],
      div: ['class', 'title'],
      em: ['class', 'title'],
      h1: ['class', 'title'],
      h2: ['class', 'title'],
      h3: ['class', 'title'],
      h4: ['class', 'title'],
      h5: ['class', 'title'],
      h6: ['class', 'title'],
      i: ['class', 'title', 'aria-label'],
      li: ['class', 'title'],
      ol: ['class', 'title'],
      p: ['class', 'title'],
      span: ['class', 'title', 'aria-label'],
      strong: ['class', 'title'],
      ul: ['class', 'title']
    };

    function isSafeUrl(url) {
      if (!url) { return false; }
      return /^(https?:|mailto:|tel:|\/|\.\/|\.\.\/|#)/i.test(url);
    }

    function sanitizeNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.cloneNode(true);
      }
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return null;
      }

      var tagName = node.tagName.toLowerCase();
      if (!allowedTags.has(tagName)) {
        return null;
      }

      var safeNode = document.createElement(tagName);
      var attrs = allowedAttrs[tagName] || [];
      attrs.forEach(function (attributeName) {
        if (!node.hasAttribute(attributeName)) {
          return;
        }
        var attributeValue = node.getAttribute(attributeName);
        if (attributeName === 'href' && !isSafeUrl(attributeValue)) {
          return;
        }
        safeNode.setAttribute(attributeName, attributeValue);
      });

      Array.from(node.childNodes).forEach(function (childNode) {
        var safeChild = sanitizeNode(childNode);
        if (safeChild) { safeNode.appendChild(safeChild); }
      });

      return safeNode;
    }

    el.replaceChildren();
    var fragment = document.createDocumentFragment();
    Array.from(doc.body.childNodes).forEach(function (childNode) {
      var safeChild = sanitizeNode(childNode);
      if (safeChild) { fragment.appendChild(safeChild); }
    });
    el.appendChild(fragment);
  }

  function create(name, selector, renderer) {
    var root = document.querySelector(selector);
    if (!root) { return null; }
    var instance = {
      name: name,
      selector: selector,
      root: root,
      render: function (payload) {
        if (typeof renderer === 'function') { renderer(root, payload || {}); }
      }
    };
    components.set(name, instance);
    return instance;
  }

  create('hero', '#top', function (root, payload) {
    // Apply a named tone variant (authoritative | modern | refined) over the
    // base eyebrow/headlinePrefix/rotatorPhrases/valueStatement, if selected
    // via payload.activeTone in assets/js/config.js. Falls back silently to
    // the base fields when activeTone is empty or unknown.
    if (payload && payload.activeTone && payload.toneVariants && payload.toneVariants[payload.activeTone]) {
      payload = Object.assign({}, payload, payload.toneVariants[payload.activeTone]);
    }

    var eyebrowEl = root.querySelector('.eyebrow-chip span:last-child');
    if (eyebrowEl && typeof payload.eyebrow === 'string') { text(eyebrowEl, payload.eyebrow); }

    var titleEl = root.querySelector('#hero-title');
    var rotator = root.querySelector('#heroRotator');
    if (titleEl && typeof payload.headlinePrefix === 'string') {
      var prefixNode = titleEl.firstChild;
      if (prefixNode && prefixNode.nodeType === Node.TEXT_NODE) { prefixNode.textContent = payload.headlinePrefix; }
    }
    var phraseList = Array.isArray(payload.rotatorPhrases) ? payload.rotatorPhrases : payload.heroPhrases;
    if (Array.isArray(phraseList) && rotator) {
      var phrases = rotator.querySelectorAll('.ph');
      for (var i = 0; i < phrases.length; i += 1) {
        if (phraseList[i]) { phrases[i].textContent = phraseList[i]; }
      }
      if (phrases.length) {
        for (var j = 0; j < phrases.length; j += 1) { phrases[j].classList.remove('on'); }
        phrases[0].classList.add('on');
      }
    }
    setSafeHTML(root.querySelector('.value-statement'), payload.valueStatement);

    if (Array.isArray(payload.stats)) {
      var statEls = root.querySelectorAll('.hero-stat');
      for (var s = 0; s < statEls.length; s += 1) {
        var stat = payload.stats[s];
        if (!stat) { continue; }
        text(statEls[s].querySelector('h4'), stat.value);
        text(statEls[s].querySelector('small'), stat.label);
      }
    }

    if (Array.isArray(payload.highlights)) {
      var hiEls = root.querySelectorAll('.exec-item');
      for (var h = 0; h < hiEls.length; h += 1) {
        var hi = payload.highlights[h];
        if (!hi) { continue; }
        var boldEl = hiEls[h].querySelector('b');
        var labelEl = hiEls[h].querySelector('span');
        if (boldEl && hi.value) { text(boldEl, hi.value); }
        if (labelEl && hi.label) {
          while (labelEl.lastChild && labelEl.lastChild !== boldEl) { labelEl.removeChild(labelEl.lastChild); }
          labelEl.appendChild(document.createTextNode(' ' + hi.label));
        }
      }
    }

    var primary = root.querySelector('.hero-cta .btn-accent');
    if (primary && typeof payload.primaryCta === 'string') { setSafeHTML(primary, payload.primaryCta); }

    if (Array.isArray(payload.secondaryCtas)) {
      var secondaryEls = root.querySelectorAll('.hero-cta .btn-outline');
      for (var c = 0; c < payload.secondaryCtas.length && c < secondaryEls.length; c += 1) {
        var ctaData = payload.secondaryCtas[c];
        if (ctaData && ctaData.label) {
          var iconEl = secondaryEls[c].querySelector('i');
          var iconHtml = iconEl ? iconEl.outerHTML : '';
          setSafeHTML(secondaryEls[c], iconHtml + ctaData.label);
        }
      }
    }
  });

  create('about', '#about', function (root, payload) {
    text(root.querySelector('.eyebrow'), payload.eyebrow);
    text(root.querySelector('#about-title'), payload.title);
    text(root.querySelector('.sec-sub'), payload.summary);

    if (Array.isArray(payload.paragraphs)) {
      var paraEls = root.querySelectorAll('.col-lg-7 > .lede');
      for (var p = 0; p < paraEls.length; p += 1) {
        if (typeof payload.paragraphs[p] === 'string') { text(paraEls[p], payload.paragraphs[p]); }
      }
    }

    if (Array.isArray(payload.pillars)) {
      var pillarCards = root.querySelectorAll('.x-card');
      for (var i = 0; i < pillarCards.length; i += 1) {
        var pillar = payload.pillars[i];
        if (!pillar) { continue; }
        var labelEl = pillarCards[i].querySelector('.pov-label');
        var bodyEl = pillarCards[i].querySelector('.text-2');
        if (labelEl && pillar.title) {
          var iconEl = labelEl.querySelector('i');
          var iconHtml = iconEl ? iconEl.outerHTML : '';
          setSafeHTML(labelEl, iconHtml + pillar.title);
        }
        if (bodyEl && pillar.body) { text(bodyEl, pillar.body); }
      }
    }

    var credentialsEl = root.querySelector('.container > p.text-2');
    if (credentialsEl && typeof payload.credentials === 'string') {
      var credIcon = credentialsEl.querySelector('i');
      var credIconHtml = credIcon ? credIcon.outerHTML : '';
      setSafeHTML(credentialsEl, credIconHtml + ' ' + payload.credentials);
    }
  });

  create('kpi-cards', '#impact', function (root, payload) {
    if (!Array.isArray(payload.kpis)) { return; }
    var labels = root.querySelectorAll('.kpi-lbl');
    for (var i = 0; i < labels.length; i += 1) {
      if (payload.kpis[i] && payload.kpis[i].label) { labels[i].textContent = payload.kpis[i].label; }
    }
  });

  create('timeline', '#experience-content', function (root, payload) {
    if (typeof payload.html === 'string') { setSafeHTML(root, payload.html); }
  });
  create('experience', '#experience', function (root, payload) {
    if (typeof payload.title === 'string') { text(root.querySelector('.sec-title'), payload.title); }
  });
  create('delivery-framework', '#delivery-framework', function (root, payload) {
    if (typeof payload.title === 'string') { text(root.querySelector('.sec-title'), payload.title); }
  });
  create('success-stories', '#success-stories', function (root, payload) {
    if (typeof payload.title === 'string') { text(root.querySelector('.sec-title'), payload.title); }
  });
  create('insights', '#insights', function (root, payload) {
    if (typeof payload.title === 'string') { text(root.querySelector('.sec-title'), payload.title); }
  });
  create('testimonials', '#testimonials', function (root, payload) {
    if (typeof payload.title === 'string') { text(root.querySelector('.sec-title'), payload.title); }
  });
  create('recognition', '#recognition', function (root, payload) {
    if (typeof payload.title === 'string') { text(root.querySelector('.sec-title'), payload.title); }
  });
  create('contact', '#contact', function (root, payload) {
    if (typeof payload.title === 'string') { text(root.querySelector('.sec-title'), payload.title); }
  });
  create('footer', 'footer', function (root, payload) {
    if (typeof payload.footerLine === 'string') {
      var line = root.querySelector('.mono');
      if (line) { setSafeHTML(line, payload.footerLine); }
    }
  });

  window.PortfolioComponents = {
    list: function () { return Array.from(components.keys()); },
    get: function (name) { return components.get(name) || null; },
    render: function (name, payload) {
      var instance = components.get(name);
      if (instance) { instance.render(payload); }
    },
    renderMany: function (payloadMap) {
      if (!payloadMap || typeof payloadMap !== 'object') { return; }
      Object.keys(payloadMap).forEach(function (name) {
        var instance = components.get(name);
        if (instance) { instance.render(payloadMap[name]); }
      });
    }
  };
})();
