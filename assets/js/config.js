/*!
 * config.js — Executive Portfolio Template
 * ---------------------------------------------------------------------------
 * THIS IS THE ONLY FILE MOST USERS NEED TO EDIT.
 *
 * Everything below is applied to the page at load time by main.js, so you do
 * not have to hunt through index.html for your email address or social links.
 *
 * WHAT THIS FILE CONTROLS
 *   - identity ....... name shown in the navbar and footer
 *   - contact ........ email, phone, location, résumé file
 *   - links .......... LinkedIn, GitHub and other profiles
 *   - theme .......... accent colours and default light/dark mode
 *   - features ....... switch interactive behaviours on or off
 *
 * WHAT THIS FILE DOES *NOT* CONTROL
 *   Long-form page content — case studies, the experience timeline,
 *   testimonials, certifications — still lives as HTML in index.html.
 *   That is intentional: prose belongs in markup where it stays readable and
 *   search engines can index it without running JavaScript. See
 *   docs/Customization.md for where to edit each section.
 * ---------------------------------------------------------------------------
 */

window.PORTFOLIO_CONFIG = {

  /* -------------------------------------------------- identity ---------- */
  identity: {
    // Shown in the navbar (next to the photo) and in the footer.
    name: 'SURAJ KUMAR',
    // Appended to the name as a small accent character. Set to '' to remove.
    nameAccent: '.',
    // Replace assets/images/profile.jpg with your own square photo.
    // 96x96 or larger; it is rendered as a circle.
    photo: 'assets/images/profile.jpg',
    // Used in the footer strapline.
    tagline: 'PROGRAM & DELIVERY MANAGEMENT'
  },

  /* -------------------------------------------------- contact ----------- */
  contact: {
    email: 'surajkumar.navodya@gmail.com',
    phone: '+91 90491 41305',
    location: 'Mumbai, India',
    // Drop your PDF in assets/downloads/ and point this at it.
    resume: 'Suraj_Kumar_Resume_Technical_PM.pdf',
    // Prefilled subject line for the "email me" links.
    emailSubject: 'Delivery leadership conversation'
  },

  /* -------------------------------------------------- links ------------- */
  // Any key left as an empty string is skipped rather than linked to '#'.
  links: {
    website:      'https://surajkumarnavodya.com/',
    linkedin:     'https://www.linkedin.com/in/surajkumar-navodya',
    github:       '',
    stackoverflow:'https://stackoverflow.com/users/10532500/suraj-kumar',
    csharpcorner: 'https://www.c-sharpcorner.com/members/suraj-kumar23/articles'
  },

  /* -------------------------------------------------- theme ------------- */
  theme: {
    // 'dark' | 'light' — the mode used on a visitor's first visit.
    // After that their own choice is remembered in localStorage.
    defaultMode: 'dark',

    // Accent palette. One of:
    //   'navy' | 'corporate' | 'emerald' | 'executive' | 'purple' | 'charcoal'
    // Defined in assets/css/variables.css. The swatch picker in the navbar
    // lets visitors change this; their choice overrides the default below.
    palette: 'navy',

    // Set false to hide the swatch picker and lock your chosen palette.
    showPalettePicker: true,

    // Accent colours. These override --accent / --accent-2 from
    // assets/css/variables.css, so you can re-skin without touching CSS.
    // Set either to null to keep the stylesheet value.
    accent: null,        // e.g. '#4f8cff'  (primary blue)
    accentAlt: null,     // e.g. '#22c07a'  (success green)

    // Ready-made palettes — copy one into accent / accentAlt above.
    //   Navy        accent:'#4f8cff'  accentAlt:'#22c07a'   (default)
    //   Executive   accent:'#c9a227'  accentAlt:'#8a8f98'
    //   Corporate   accent:'#0a66c2'  accentAlt:'#00a37a'
    //   Violet      accent:'#7c5cff'  accentAlt:'#22c07a'
    showThemeToggle: true,

    // Theme customizer defaults (assets/js/customizer.js)
    defaultFont: 'inter',        // inter | source | system
    defaultRadius: 14,           // px: 8..24
    defaultMotion: 'normal',     // none | reduced | normal | vivid
    defaultPreset: 'deliveryManager',   // ceo | cto | cio | programDirector | deliveryManager | engineeringManager | productLeader | consultant

    // Master switch for the floating "sliders" Template Customizer button
    // (palette / font / layout builder panel). Set to true to bring it back,
    // false to keep it hidden. This is the ONLY line you need to change —
    // the dark/light theme toggle in the navbar keeps working either way.
    enableCustomizer: true
  },

  /* -------------------------------------------------- sections ---------- */
  // Set any section to false and it is removed from the page AND from the
  // navbar. Nothing else needs editing — the active-link highlighting rebuilds
  // itself from whatever links remain.
  //
  // Removing a section deletes it from the DOM rather than hiding it, so the
  // markup stays valid and screen readers do not announce empty landmarks.
  sections: {
    leadership:     true,   // "Delivery credibility, earned in code"
    successStories: true,   // case studies
    aiLeadership:   true,   // AI-augmented delivery
    expertise:      true,   // capability matrix
    experience:     true,   // timeline
    recognition:    true,   // certifications and awards
    testimonials:   true,   // recommendations
    contact:        true    // contact form — think hard before removing this
  },

  /* -------------------------------------------------- features ---------- */
  // Turn any of these off if you want a quieter page or better performance
  // on low-powered devices.
  features: {
    telemetryTicker: true,   // the scrolling metric bar above the navbar
    heroRotator:     true,   // the rotating phrase in the hero headline
    kpiCountUp:      true,   // numbers that animate from 0 on scroll
    kpiTilt:         true,   // subtle 3D tilt on the snapshot panel
    scrollReveals:   true,   // fade-in-on-scroll for sections
    scrollProgress:  true    // thin progress bar at the top of the viewport
  },

  /* -------------------------------------------------- data ------------- */
  // Optional JSON-driven renderer. When `useData` is true, renderer.js will
  // load content from assets/data/ and replace matching sections with the
  // JSON-driven output. Defaults to false to keep SEO-friendly static HTML.
  data: {
    // Set true to enable renderer.js and replace long-form HTML with JSON.
    useData: false,
    // Relative path where JSON files live. Trailing slash recommended.
    path: 'assets/data/'
  }

};
