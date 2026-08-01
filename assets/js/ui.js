/*!
 * ui.js — Executive Portfolio Template
 * Vanilla-JS interaction layer: scroll progress, telemetry ticker,
 * hero phrase rotator, KPI tilt, Portfolio Copilot and the contact form.
 *
 * These four behaviours share one IIFE on purpose: they read a common
 * `reduced` (prefers-reduced-motion) flag, and the Copilot section uses an
 * early `return`. Splitting them further needs that scope untangled first —
 * see docs/Changelog.md (planned for v1.1).
 */
/* ============================================================
   DYNAMIC LAYER (vanilla JS, no dependencies)
   Scroll progress · hero rotator · KPI tilt · Portfolio Copilot
   ============================================================ */
(function () {
  'use strict';
  function isReducedMotion() {
    var attr = document.documentElement.getAttribute('data-motion');
    if (attr === 'none') { return true; }
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }
  var reduced = isReducedMotion();

  /* ---------- Scroll progress ---------- */
  var bar = document.querySelector('.scroll-progress');
  function paintBar() {
    if (!bar) return;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  }
  /* Telemetry bar: visible at the top, slides away once you scroll */
  function paintTele() {
    document.body.classList.toggle('tele-hide', (window.scrollY || document.documentElement.scrollTop) > 60);
  }
  /* ---------- Sticky nav: condense on scroll -----------------------
     Below ~120px the bar compacts and gains a shadow (it's now "elevated"
     over content). The bar itself always stays visible — an earlier
     scroll-direction "smart-hide" (translating it off-screen on scroll
     down) read as the menu randomly disappearing, so it was removed. */
  function paintNav() {
    var y = window.scrollY || document.documentElement.scrollTop;
    document.body.classList.toggle('nav-condensed', y > 120);
  }
  window.addEventListener('scroll', function () { paintBar(); paintTele(); paintNav(); }, { passive: true });
  window.addEventListener('resize', paintBar);
  paintBar();
  paintTele();
  paintNav();

  /* ---------- Hero phrase rotator ---------- */
  var rot = document.getElementById('heroRotator');
  if (rot && !reduced) {
    var phs = rot.querySelectorAll('.ph'), ri = 0;
    if (phs.length > 1) {
      setInterval(function () {
        phs[ri].classList.remove('on');
        ri = (ri + 1) % phs.length;
        phs[ri].classList.add('on');
      }, 3400);
    }
  }

  /* ---------- Top-ribbon achievement rotator ----------
     Shows one achievement at a time instead of a continuous
     marquee. Rotation continues under reduced-motion (the CSS
     drops the transition), but pauses on hover and when the
     tab is in the background. */
  var teleRot = document.getElementById('teleRotator');
  if (teleRot) {
    var tItems = teleRot.querySelectorAll('.ti');
    if (tItems.length > 1) {
      var ti = 0, tTimer = null, T_DELAY = 3600;
      var showTele = function (n) {
        tItems[ti].classList.remove('on');
        ti = (n + tItems.length) % tItems.length;
        tItems[ti].classList.add('on');
      };
      var startTele = function () {
        if (!tTimer) tTimer = setInterval(function () { showTele(ti + 1); }, T_DELAY);
      };
      var stopTele = function () { clearInterval(tTimer); tTimer = null; };
      startTele();
      var teleBar = teleRot.parentNode;
      teleBar.addEventListener('mouseenter', stopTele);
      teleBar.addEventListener('mouseleave', startTele);
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stopTele(); else startTele();
      });
    }
  }

  /* ---------- KPI board tilt (fine pointers only) ---------- */
  var board = document.querySelector('.kpi-board');
  var fine = false;
  try { fine = window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches; } catch (e) {}
  if (board && fine && !reduced) {
    board.addEventListener('pointermove', function (e) {
      var r = board.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      board.style.transform = 'perspective(900px) rotateY(' + (x * 5).toFixed(2) + 'deg) rotateX(' + (-y * 5).toFixed(2) + 'deg)';
    });
    board.addEventListener('pointerleave', function () { board.style.transform = ''; });
  }

  /* ============================================================
     PORTFOLIO COPILOT — on-device retrieval over a structured
     knowledge base. Keyword scoring picks the best entry; the
     answer types out. No network calls of any kind.
     ============================================================ */
  var KB = [
    { k: ['ai','genai','gen','ml','artificial','intelligence','rag','langgraph','agentic','agent','llm','copilot','multi-agent','pipeline'],
      a: "<b>AI is his deliberate bet, built hands-on.</b> Certified via IIT Kharagpur's AI4ICPS (completed) and pursuing the Johns Hopkins Agentic AI certificate. He's built RAG pipelines and multi-agent workflows with LangGraph himself — so he can scope and govern GenAI initiatives from judgement, not vendor decks — and applies AI tooling daily to reporting, planning and engineering workflows." },
    { k: ['experience','years','background','career','history','journey','profile','about','who'],
      a: "<b>12+ years in IT, one trajectory.</b> 8+ years as a hands-on .NET engineer (2014–2021), then Manager — Program & Delivery Management at LTIMindtree, running L&T Corporate IT, L&T Realty, L&T Construction and Airtel accounts. Engineer → mentor → delivery leader; every phase compounds." },
    { k: ['program','biggest','portfolio','narada','cdp','skills','project','case','delivered','sebi','compliance','platform'],
      a: "<b>Flagship: Narada — SEBI compliance platform</b> for a listed conglomerate, removing regulatory-penalty exposure with one auditable system of record. Also: CDP (end-to-end digitization of road-construction ops) and Easy Skills (workforce capability platform). Portfolio: ₹2Cr+ multi-account, 95%+ on-time/on-budget." },
    { k: ['metric','number','result','kpi','impact','stats','achievement','track','record'],
      a: "<b>The steering snapshot:</b> ₹2Cr+ portfolio under management · 95%+ on-time/on-budget delivery · −20% risk exposure via governance · 30+ engineers led · +30% adoption via change management · +15% team productivity." },
    { k: ['team','leadership','people','lead','manage','coach','mentor','grow','engineers'],
      a: "<b>15+ engineers led across accounts</b> — coached in Scrum and Kanban (+15% productivity), grown into module ownership, structured to reduce key-person risk. His principle: capability should outlast the manager." },
    { k: ['certification','certified','pmp','csm','scrum','agile','lcap','credential','qualification','education','degree'],
      a: "<b>PMP® · Certified Scrum Master · LTIMindtree Certified Agile Practitioner.</b> Plus AI4ICPS (IIT Kharagpur), Agentic AI (Johns Hopkins, in progress), PMI GenAI for PMs, IBM Enterprise Design Thinking. Education: M.Sc. IT (Sikkim Manipal) and BCA." },
    { k: ['why','delivery','director','manager','fit','hire','role','value','different','unique','stand'],
      a: "<b>He owns outcomes, not just plans.</b> Client-sponsor relationships, commercial discipline (estimation, SLA, margin), team growth — backed by 8 years of building the systems the plans describe. That engineering depth changes every conversation with architecture and the boardroom." },
    { k: ['contact','email','phone','reach','call','hire','connect','talk','touch'],
      a: "<b>Direct channels:</b> surajkumar.navodya@gmail.com · +91 90491 41305 · LinkedIn: linkedin.com/in/surajkumar-navodya. He replies within one business day." },
    { k: ['location','mumbai','relocate','relocation','city','based','where','remote','abroad','passport'],
      a: "<b>Based in Mumbai</b> — open to relocation across India and internationally; passport ready." },
    { k: ['award','recognition','mvp','achievement','won','epic','squad','spot'],
      a: "<b>Epic Squad Award (India & ME)</b>, 2× LTIMindtree Spot Award: Super Crew, and 2× C# Corner MVP — a public record of technical writing and community contribution." },
    { k: ['stack','tech','technology','net','dotnet','azure','sql','angular','python','tools','skill'],
      a: "<b>Speaks the stack:</b> C#, .NET Core, SQL Server, Azure, Azure DevOps, Angular, React, Python, Power BI, Jira. Estimates get challenged intelligently and risks get spotted early because he's built these systems himself." },
    { k: ['resume','cv','download','pdf'],
      a: "<b>Resume:</b> use the “Download resume” button in the hero at the top of this page — it's the full Technical PM/Delivery profile as a PDF." },
    { k: ['salary','compensation','ctc','pay','rate','notice','available','availability','join'],
      a: "That's a conversation best had directly. <b>Email surajkumar.navodya@gmail.com</b> — he replies within one business day." },
    { k: ['principle','philosophy','approach','operate','run','style','how'],
      a: "<b>Four operating principles:</b> Green is earned, not reported · Estimate honestly, protect the margin · Build people, not just plans · AI is a capability, not a slide." }
  ];
  var FALLBACK = "I can answer about his <b>AI work, programs, metrics, leadership, certifications, stack, awards, or contact details</b> — try one of the chips below, or email <b>surajkumar.navodya@gmail.com</b> directly.";
  var GREET = "Hi! I'm Suraj's Portfolio Copilot — I answer from this page only, right here in your browser. What would you like to know?";

  var fab = document.getElementById('copilotFab');
  var dock = document.getElementById('copilotDock');
  var dismiss = document.getElementById('copilotDismiss');
  var panel = document.getElementById('copilotPanel');
  var log = document.getElementById('copilotLog');
  var input = document.getElementById('copilotInput');
  var send = document.getElementById('copilotSend');
  var chips = document.getElementById('copilotChips');
  var closeBtn = document.getElementById('copilotClose');

  /* ---------- Contact form -> mailto compose (no backend) ---------- */
  var cfSend = document.getElementById('cfSend');
  if (cfSend) {
    cfSend.addEventListener('click', function () {
      var n = (document.getElementById('cfName').value || '').trim();
      var o = (document.getElementById('cfOrg').value || '').trim();
      var msg = (document.getElementById('cfMsg').value || '').trim();
      var subject = 'Portfolio enquiry' + (n ? ' — ' + n : '');
      var bodyText = 'Hi Suraj,\n\n' + (msg || 'I would like to connect regarding a role.') +
                     '\n\n' + n + (o ? '\n' + o : '');
      window.location.href = 'mailto:surajkumar.navodya@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(bodyText);
    });
  }

  if (!fab || !panel || !log || !input || !send || !chips || !closeBtn) { return; }

  var openState = false, greeted = false, typing = false;

  function setOpen(o) {
    openState = o;
    panel.hidden = !o;
    panel.classList.toggle('open', o);
    fab.setAttribute('aria-expanded', String(o));
    if (o) {
      if (!greeted) { greeted = true; botSay(GREET); }
      setTimeout(function () { input && input.focus(); }, 60);
    } else {
      fab.focus();
    }
  }
  fab.addEventListener('click', function () { setOpen(!openState); });
  closeBtn.addEventListener('click', function () { setOpen(false); });

  /* Dismiss the floating button — in-memory only, so a page reload always
     brings it back. (It used to persist in sessionStorage, which kept the
     button hidden for the rest of the tab's life, even across reloads.)
     Ctrl+K restores it without reloading. */
  function setDockHidden(h) {
    if (!dock) return;
    dock.hidden = h;
    if (h && openState) setOpen(false);
  }
  /* Clear the legacy flag so anyone still carrying it gets the button back */
  try { sessionStorage.removeItem('cp-hide'); } catch (e) {}
  dismiss && dismiss.addEventListener('click', function (e) {
    e.stopPropagation();
    setDockHidden(true);
  });

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (dock && dock.hidden) setDockHidden(false);
      setOpen(!openState);
    }
    if (e.key === 'Escape' && openState) setOpen(false);
  });

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function scrollLog() { log.scrollTop = log.scrollHeight; }

  var flushTyping = null;
  function botSay(html) {
    var m = el('div', 'cmsg bot', '');
    log.appendChild(m); scrollLog();
    if (reduced) { m.innerHTML = html; scrollLog(); return; }
    typing = true;
    flushTyping = function () { clearInterval(iv); m.innerHTML = html; typing = false; flushTyping = null; scrollLog(); };
    var caret = el('span', 'caret', '');
    // Type out plain segments while keeping <b> tags intact
    var parts = html.split(/(<b>|<\/b>)/), pi = 0, ci = 0, bold = false, target = null;
    m.appendChild(caret);
    var iv = setInterval(function () {
      if (pi >= parts.length) { clearInterval(iv); caret.remove(); typing = false; flushTyping = null; scrollLog(); return; }
      var part = parts[pi];
      if (part === '<b>') { bold = true; target = el('b', '', ''); m.insertBefore(target, caret); pi++; ci = 0; return; }
      if (part === '</b>') { bold = false; target = null; pi++; ci = 0; return; }
      var step = 3;
      var chunk = part.slice(ci, ci + step);
      ci += step;
      var dest = bold && target ? target : m;
      dest.insertBefore(document.createTextNode(chunk), bold ? null : caret);
      if (ci >= part.length) { pi++; ci = 0; }
      scrollLog();
    }, 18);
  }

  function answer(q) {
    var words = q.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
    var best = null, bestScore = 0;
    KB.forEach(function (entry) {
      var score = 0;
      words.forEach(function (w) {
        entry.k.forEach(function (k) {
          if (!k) { return; }   // an empty keyword would match every word via indexOf('')===0
          if (w === k) score += 2;
          else if (w.length > 3 && (k.indexOf(w) === 0 || w.indexOf(k) === 0)) score += 1;
        });
      });
      if (score > bestScore) { bestScore = score; best = entry; }
    });
    return bestScore > 0 ? best.a : FALLBACK;
  }

  function submit(q) {
    q = (q || '').trim();
    if (!q) return;
    if (typing && flushTyping) flushTyping();   // finish current answer instantly, never swallow input
    log.appendChild(el('div', 'cmsg user', q.replace(/</g, '&lt;')));
    scrollLog();
    input.value = '';
    setTimeout(function () { botSay(answer(q)); }, 260);
  }

  send.addEventListener('click', function () { submit(input.value); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(input.value); });
  chips.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-q]');
    if (b) submit(b.getAttribute('data-q'));
  });
})();
