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
  // Enable JSON-driven demo content. Place fictional data in assets/data/.
  data: {
    useData: true,
    path: 'assets/data/'
  }

};
