/*!
 * config.demo.js — Executive Portfolio Template
 * ---------------------------------------------------------------------------
 * A fictional profile, for demos and for screenshotting your own listing.
 *
 * TO USE IT
 *   In index.html, change the config script tag to point here:
 *
 *     <script src="assets/js/config.demo.js"></script>
 *
 *   Switch back to config.js when you publish your real site.
 *
 * WHAT THIS DOES AND DOESN'T CHANGE
 *   This file drives the identity fields — name, contact details, links,
 *   palette. It does NOT rewrite the page prose (case studies, timeline,
 *   testimonials), which lives in index.html. So with this config loaded the
 *   page shows John Anderson's name against Suraj Kumar's written content.
 *
 *   That mismatch is fine for a layout demo. It is NOT fine for anything you
 *   publish. Every name, metric and claim in index.html is real and belongs to
 *   the template author, and the licence does not grant you use of it — see
 *   LICENSE.txt. Replace the prose with your own before going live.
 * ---------------------------------------------------------------------------
 */

window.PORTFOLIO_CONFIG = {

  identity: {
    name: 'JOHN ANDERSON',
    nameAccent: '.',
    photo: 'assets/images/profile.jpg',   // swap for your own square photo
    tagline: 'ENGINEERING LEADERSHIP'
  },

  contact: {
    email: 'john@example.com',
    phone: '+1 555 0100',
    location: 'Austin, TX',
    resume: 'assets/downloads/john-anderson-resume.pdf',
    emailSubject: 'Engineering leadership conversation'
  },

  links: {
    website:      'https://example.com/',
    linkedin:     'https://www.linkedin.com/in/example',
    github:       'https://github.com/example',
    stackoverflow:'',
    csharpcorner: ''
  },

  theme: {
    defaultMode: 'dark',
    palette: 'corporate',        // demo ships on the blue palette
    accent: null,
    accentAlt: null,
    showThemeToggle: true,
    showPalettePicker: true
  },

  // Everything on, so the demo shows the full template.
  sections: {
    leadership:     true,
    successStories: true,
    aiLeadership:   true,
    expertise:      true,
    experience:     true,
    recognition:    true,
    testimonials:   true,
    contact:        true
  },

  features: {
    telemetryTicker: true,
    heroRotator:     true,
    kpiCountUp:      true,
    kpiTilt:         true,
    scrollReveals:   true,
    scrollProgress:  true
  },

  /* -------------------------------------------------- data ------------- */
  // Left off deliberately: this config is meant to be loaded by index.html
  // itself (see the docblock above), not by studio.html — and renderer.js
  // only ever renders a "demo" path on studio.html. Turning this on here
  // would only produce a console error on every page that actually loads
  // this file, for a feature that could never render anyway.
  data: {
    useData: false,
    path: 'assets/demo-data/'
  },

  /* -------------------------------------------------- copilot ----------
   * assets/js/ui.js's Portfolio Copilot has a real, hardcoded knowledge base
   * by default (this deployment's real career facts — see ui.js's DEFAULT_KB
   * for why: engineering.html loads no config.js at all, and still needs a
   * working, real Copilot). Loading THIS config overrides that KB entirely
   * with the fictional content below, so the demo/template Copilot never
   * answers with real personal data.
   * ----------------------------------------------------------------------- */
  copilot: {
    kb: [
      { k: ['experience','years','background','career','history','journey','profile','about','who'],
        a: "<b>15+ years in engineering leadership.</b> Individual contributor, then engineering manager, now VP of Engineering — every step spent close enough to the code to lead technical teams credibly." },
      { k: ['team','leadership','people','lead','manage','coach','mentor','grow','engineers'],
        a: "<b>Grows engineers into leads, not just headcount.</b> Coaching, clear ownership and reduced key-person risk are the throughline across every team he's run." },
      { k: ['contact','email','phone','reach','call','hire','connect','talk','touch'],
        a: "<b>Direct channels:</b> john@example.com · LinkedIn: linkedin.com/in/example. Replies within one business day." },
      { k: ['location','relocate','relocation','city','based','where','remote'],
        a: "<b>Based in Austin, TX</b> — open to remote and relocation for the right role." },
      { k: ['resume','cv','download','pdf'],
        a: "<b>Resume:</b> use the “Download resume” link in the hero at the top of this page." },
      { k: ['stack','tech','technology','tools','skill'],
        a: "This is placeholder sample content — replace assets/js/config.js's copilot.kb (or delete it to fall back to your own real Copilot content) before publishing." }
    ],
    fallback: "This is a template demo — replace cfg.copilot in assets/js/config.js with your own real Q&A content before publishing.",
    greet: "Hi! I'm John's Portfolio Copilot (sample content) — I answer from this page only, right here in your browser."
  }

};
