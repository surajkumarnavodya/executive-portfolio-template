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

  /* -------------------------------------------------- hero -------------- */
  // Everything shown in the hero (the first viewport of the page) is driven
  // from here — no HTML editing required. assets/js/main.js hands this
  // object to the `hero` component in assets/js/components.js, which
  // populates the existing markup in index.html.
  //
  //   eyebrow          small chip above the headline
  //   headlinePrefix   the static lead-in text of the <h1>
  //   rotatorPhrases   phrases that cycle through the gradient span in the
  //                    headline (must match the number of .ph spans in the
  //                    markup — currently 4 — extra entries are ignored)
  //   valueStatement   one-line value proposition directly under the H1
  //   lede             short credibility paragraph — a small set of safe
  //                    tags (strong, em, a, span, b) may be used
  //   stats            the 4 quick-stat tiles (value + label)
  //   highlights       the "Selected highlights" ribbon items (value + label)
  //   primaryCta       label/icon markup for the main "above the fold" CTA
  //   secondaryCtas    labels for the outline buttons that follow it
  //   activeTone       which entry of toneVariants (below) overrides the
  //                    eyebrow/headlinePrefix/rotatorPhrases/valueStatement
  //                    fields above at load time. Set to '' or an unknown key
  //                    to fall back to the fields defined directly on hero.
  //   toneVariants     three ready-made premium brand-voice options for the
  //                    headline + subheadline — swap `activeTone` to try
  //                    each one without touching any other hero field:
  //                      authoritative — command-driven, results-first
  //                      modern        — forward-leaning, plain-spoken
  //                      refined       — understated, quietly confident
  hero: {
    eyebrow: 'Driving enterprise digital transformation',
    // Rendered on its own fixed line — see the <br> right after this text
    // in index.html's #hero-title. Line 2 (the rotator) is a second,
    // separate fixed line below it; keep rotatorPhrases short enough to
    // stay on one line each (see the note there on why).
    headlinePrefix: 'I own enterprise delivery — ',
    // Deliberately short (~20-24 characters) so every phrase renders on a
    // single line at every breakpoint (.rotator forces white-space:nowrap
    // site-wide now — see assets/css/style.css). That's what keeps the
    // hero's height identical across every rotation: a longer phrase that
    // wrapped to a second line would grow the hero and shove the KPI panel
    // and everything below it down, then back up when a shorter phrase
    // rotated in.
    rotatorPhrases: [
      'on time. on budget.',
      'client confidence up.',
      'disciplined delivery.',
      'outcomes. teams. trust.'
    ],
    valueStatement: 'Enterprise program leader trusted with multi-crore portfolios — turning ambitious transformation mandates into outcomes clients can bet on.',
    activeTone: '',
    toneVariants: {
      authoritative: {
        eyebrow: 'Enterprise Program & Delivery Command',
        headlinePrefix: 'I take command of enterprise complexity and deliver ',
        rotatorPhrases: [
          'predictable outcomes.',
          'on-time, on-budget delivery.',
          'boardroom-ready confidence.',
          'zero-compromise execution.'
        ],
        valueStatement: 'The single point of accountability for multi-crore portfolios — decisive under pressure, uncompromising on delivery.'
      },
      modern: {
        eyebrow: 'Program & Delivery Leadership · AI-Augmented',
        headlinePrefix: 'I build delivery engines that turn complexity into ',
        rotatorPhrases: [
          'momentum.',
          'shipped outcomes.',
          'teams that scale.',
          'AI-augmented speed.'
        ],
        valueStatement: 'A hands-on delivery leader for multi-crore portfolios — pairing modern engineering instincts with AI-augmented ways of working.'
      },
      refined: {
        eyebrow: 'Enterprise Program & Delivery Leadership',
        headlinePrefix: 'Enterprise complexity, quietly resolved into ',
        rotatorPhrases: [
          'dependable outcomes.',
          'on-time delivery.',
          'earned stakeholder trust.',
          'considered, disciplined execution.'
        ],
        valueStatement: 'Trusted with multi-crore portfolios — a measured hand behind ambitious transformation, outcomes clients can quietly rely on.'
      }
    },
    lede: 'Enterprise <strong>Program &amp; Project Manager</strong> with <strong>12+ years</strong> of experience and an <strong>8+ year</strong> engineering foundation — delivering multi-account programs through disciplined governance, client partnership and measurable business outcomes.',
    stats: [
      { value: '12+',    label: 'Years Experience' },
      { value: '₹2Cr+',  label: 'Portfolio Governed' },
      { value: '40+',    label: 'Projects Delivered' },
      { value: '20+',    label: 'Engineers Led' }
    ],
    highlights: [
      { value: '98%',  label: 'Delivery Excellence' },
      { value: 'AI',   label: 'Transformation Programs' },
      { value: '5+',   label: 'Enterprise Awards' },
      { value: 'Zero', label: 'Critical Go-Live Escalations' },
      { value: '+30%', label: 'Business Adoption' }
    ],
    primaryCta: '<i class="bi bi-calendar-check me-2"></i>Schedule an Executive Conversation',
    // Two .btn-outline slots exist in index.html's .hero-cta — entries here
    // map onto them by position (see the hero renderer in components.js).
    secondaryCtas: [
      { label: 'Download Resume' },
      { label: 'View case studies' }
    ]
  },

  /* -------------------------------------------------- about -------------- */
  // Executive-summary section shown right after the hero. Everything here
  // is applied to the existing markup in index.html by the `about`
  // component in assets/js/components.js — no HTML editing required.
  //
  //   eyebrow        small chip above the heading
  //   title          section heading (executive positioning statement)
  //   summary        one-line positioning statement directly under the title
  //   paragraphs     2-3 short paragraphs covering leadership style, impact,
  //                  and career positioning — this is the narrative bio
  //   pillars        3 short cards (icon key + title + body) summarising
  //                  leadership / impact / positioning
  //   credentials    small inline credibility line (e.g. certifications)
  about: {
    eyebrow: 'About',
    title: 'An engineer-turned-executive who leads delivery, not just tracks it.',
    summary: 'I run enterprise programs the way a P\u0026L owner would — accountable for outcomes, not just RAG statuses.',
    paragraphs: [
      'Twelve-plus years in IT, the first eight spent hands-on in .NET engineering before moving into program and delivery leadership. That foundation means I read a status report and an architecture diagram with equal fluency — and I use both to keep delivery plans honest.',
      'Today I own multi-account portfolios worth \u20B92Cr+, leading 20+ engineers and standing as the single point of accountability for client sponsors when delivery health, risk, or scope get difficult. My leadership style is calm under pressure, direct with stakeholders, and structured enough to scale without me in every room.',
      'I am now applying that same discipline to AI-augmented delivery — using generative and agentic tooling to compress planning, reporting, and quality-assurance cycles, so the teams I lead ship faster without sacrificing governance.'
    ],
    pillars: [
      { icon: 'bi-compass', title: 'Leadership', body: 'Own the plan, the risk register and the client relationship — with the technical depth to challenge estimates intelligently.' },
      { icon: 'bi-graph-up-arrow', title: 'Impact', body: '98%+ delivery excellence, 30% adoption lift, zero critical go-live escalations across multi-account portfolios.' },
      { icon: 'bi-award', title: 'Positioning', body: 'AI-augmented delivery practitioner, LTIMindtree Certified Agile Practitioner, and one of the few leaders who can still read the code.' }
    ],
    credentials: '12+ Years in IT \u00B7 Technical Project Management \u00B7 Enterprise Delivery \u00B7 Software Engineering Background'
  },

  // insights ---------------------------------------------------------------
  // Thought-leadership / public POV section. Only the section title is
  // currently data-driven here (the cards live in index.html as SEO-visible
  // links to published articles/answers); edit `title` to retitle the
  // section without touching markup.
  insights: {
    title: 'What I\u2019m thinking about, in public.'
  },

  // delivery-framework -------------------------------------------------
  // "How I work" nine-step process explainer, sits between Leadership and
  // Experience. Only the section title is data-driven (same pattern as
  // insights/testimonials/recognition) \u2014 the 9 step cards live in
  // index.html as static markup.
  deliveryFramework: {
    title: 'One framework, every program.'
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
    about:              true,   // executive summary bio, just after the hero
    leadership:         true,   // "Delivery credibility, earned in code"
    deliveryFramework:  true,   // "How I work" nine-step process
    successStories:     true,   // case studies
    insights:           true,   // thought-leadership / POV articles
    aiLeadership:       true,   // AI-augmented delivery
    expertise:          true,   // capability matrix
    experience:         true,   // timeline
    recognition:        true,   // certifications and awards
    testimonials:       true,   // recommendations
    contact:            true    // contact form — think hard before removing this
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

  /* -------------------------------------------------- i18n --------------- */
  // Client-side page translation — no backend, no API key. Driven by
  // Google's free Website Translator widget (assets/js/i18n.js), which
  // hides Google's own toolbar/banner and exposes only your navbar globe
  // button and a one-time suggestion banner. The page's source language
  // is always English; visitors translate away from that, never to it.
  //
  //   enabled                     master switch — false removes the globe
  //                                button, the menu and the banner entirely
  //   suggestFromBrowserLocale    on first visit, offer to translate into
  //                                the visitor's browser language if it
  //                                isn't English. There is no backend on a
  //                                static site, so this is the closest
  //                                available proxy for "their region" —
  //                                true IP geolocation would need a paid
  //                                third-party service. A visitor who
  //                                dismisses it, or picks a language from
  //                                the menu, is never asked again
  //                                (remembered in localStorage).
  //   languages                   offered in the navbar menu and matched
  //                                against for the banner suggestion.
  //                                code = a Google Translate language code,
  //                                label = shown to visitors in their own
  //                                script.
  i18n: {
    enabled: true,
    suggestFromBrowserLocale: true,
    languages: [
      { code: 'hi',    label: 'हिन्दी' },
      { code: 'es',    label: 'Español' },
      { code: 'fr',    label: 'Français' },
      { code: 'de',    label: 'Deutsch' },
      { code: 'pt',    label: 'Português' },
      { code: 'ar',    label: 'العربية' },
      { code: 'zh-CN', label: '中文' },
      { code: 'ja',    label: '日本語' }
    ]
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
