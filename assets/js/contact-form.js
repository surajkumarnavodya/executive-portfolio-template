/*!
 * contact-form.js — Executive Portfolio Template
 * ---------------------------------------------------------------------------
 * Real form submission via Formspree (https://formspree.io), replacing a
 * mailto: link as the PRIMARY contact path — mailto: fails silently for any
 * visitor without a desktop mail client configured (increasingly common on
 * mobile, Chromebooks and locked-down work machines). The mailto: link
 * itself is kept as a plain, always-visible fallback line below the form,
 * not removed.
 *
 * No SDK, no dependency beyond a plain fetch() POST — Formspree accepts a
 * standard form submission and returns JSON when asked via the Accept
 * header. Uses only Bootstrap's own already-loaded validation/utility
 * classes (.form-control/.is-invalid/.invalid-feedback/.text-success/
 * .text-danger) — no new colours or classes added to this template's own
 * design system.
 * ---------------------------------------------------------------------------
 */
(function () {
  'use strict';

  var form = document.getElementById('contactForm');
  if (!form) { return; }

  var status = document.getElementById('cfStatus');
  var submitBtn = form.querySelector('[type="submit"]');
  var honeypot = form.querySelector('[name="_gotcha"]');
  var fields = [
    { el: document.getElementById('cfName'), type: 'text' },
    { el: document.getElementById('cfEmail'), type: 'email' },
    { el: document.getElementById('cfMessage'), type: 'text' }
  ].filter(function (f) { return !!f.el; });

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  // status is an aria-live region: screen readers announce whatever text
  // lands here without the visitor needing to move focus to it.
  function setStatus(message, tone) {
    status.textContent = message;
    status.className = tone ? 'mb-3 text-' + tone : 'mb-3';
  }

  function validate() {
    var valid = true;
    fields.forEach(function (f) {
      var value = f.el.value.trim();
      var ok = value.length > 0 && (f.type !== 'email' || isValidEmail(value));
      f.el.classList.toggle('is-invalid', !ok);
      f.el.setAttribute('aria-invalid', String(!ok));
      if (!ok) { valid = false; }
    });
    return valid;
  }

  fields.forEach(function (f) {
    f.el.addEventListener('input', function () {
      f.el.classList.remove('is-invalid');
      f.el.removeAttribute('aria-invalid');
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Honeypot: a field real visitors never see or fill in (it's positioned
    // off-screen), so anything that fills it in is almost certainly a bot.
    // Pretend to succeed rather than telling the bot its submission was
    // rejected — there's nothing to gain from tipping it off.
    if (honeypot && honeypot.value) {
      form.reset();
      setStatus('Thanks — I’ll get back to you within one business day.', 'success');
      return;
    }

    if (!validate()) {
      setStatus('Please fix the highlighted fields and try again.', 'danger');
      return;
    }

    var endpoint = form.getAttribute('data-endpoint') || '';
    if (!endpoint || endpoint.indexOf('PLACEHOLDER_') === 0) {
      setStatus('This form isn’t connected yet — please use the email link below instead.', 'danger');
      return;
    }

    submitBtn.disabled = true;
    setStatus('Sending…', null);

    fetch(endpoint, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    }).then(function (response) {
      submitBtn.disabled = false;
      if (response.ok) {
        form.reset();
        setStatus('Thanks — I’ll get back to you within one business day.', 'success');
      } else {
        setStatus('Something went wrong sending that — please use the email link below instead.', 'danger');
      }
    }).catch(function () {
      submitBtn.disabled = false;
      setStatus('Something went wrong sending that — please use the email link below instead.', 'danger');
    });
  });
})();
