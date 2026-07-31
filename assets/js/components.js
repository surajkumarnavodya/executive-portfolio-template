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
    var rotator = root.querySelector('#heroRotator');
    if (Array.isArray(payload.heroPhrases) && rotator) {
      var phrases = rotator.querySelectorAll('.ph');
      for (var i = 0; i < phrases.length; i += 1) {
        if (payload.heroPhrases[i]) { phrases[i].textContent = payload.heroPhrases[i]; }
      }
      if (phrases.length) {
        for (var j = 0; j < phrases.length; j += 1) { phrases[j].classList.remove('on'); }
        phrases[0].classList.add('on');
      }
    }
    text(root.querySelector('.value-statement'), payload.valueStatement);
    setSafeHTML(root.querySelector('.lede'), payload.lede);
    var primary = root.querySelector('.hero-cta .btn-accent');
    if (primary && typeof payload.primaryCta === 'string') { setSafeHTML(primary, payload.primaryCta); }
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
  create('success-stories', '#success-stories', function (root, payload) {
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
