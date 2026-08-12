/**
 * Regenerates index.template.html from index.html.
 *
 * index.html is the live site's real content. index.template.html is the
 * genericized fork shipped to buyers by tools/package-template.ps1/.sh — it
 * must never contain the live site's real name, contact details, employer
 * history, metrics, testimonials or résumé. Rather than hand-maintaining a
 * second 3,600-line file that silently drifts, this script re-derives it
 * from the real index.html on every run via an explicit find/replace map:
 * structural changes to index.html (new sections, class renames, a new
 * data-component) flow through automatically; only genuinely new REAL
 * content needs a new entry added to the map below.
 *
 * Every entry is checked for a match count of exactly 1 (or an explicit
 * expected count) and the script exits non-zero if anything is missing —
 * silently producing a template with leftover real content would be worse
 * than failing loudly.
 *
 * Usage:
 *   node tools/build_template_content.js [index.html] [index.template.html]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.resolve(ROOT, process.argv[2] || 'index.html');
const OUT = path.resolve(ROOT, process.argv[3] || 'index.template.html');

// index.html is CRLF; normalize to LF for matching, restore CRLF on write.
let html = fs.readFileSync(SRC, 'utf8').split('\r\n').join('\n');

const report = [];
function apply(find, replace, expected = 1) {
  const count = html.split(find).length - 1;
  html = html.split(find).join(replace);
  report.push({ find, count, expected });
}

/* ---------- top-of-file copyright comment ---------- */
apply(
`<!--
  =========================================================================
  Copyright (c) 2026 Suraj Kumar. All rights reserved.
  surajkumarnavodya.com

  This page, its design, copy and code are the original work of Suraj Kumar.
  Reproduction, republication or reuse of any part of this site, in whole or
  in substantial part, without prior written permission is not permitted.

  If you are reading this because you like the layout: you are welcome to
  learn from it. Please do not republish it with your own name on the
  achievements. Questions: surajkumar.navodya@gmail.com
  =========================================================================
-->`,
`<!--
  =========================================================================
  Executive Portfolio Template — starter index.html
  Copyright (c) 2026 Suraj Kumar. All rights reserved. See LICENSE.txt for
  the licence you purchased.

  This file ships with placeholder sample content — anything in [brackets]
  is a placeholder, not real data. Replace every placeholder with your own
  real name, contact details, employer history, metrics and achievements
  before publishing. See docs/Customization.md and docs/Installation.md.
  =========================================================================
-->`
);

/* ---------- meta / head ---------- */
apply('<title>Suraj Kumar | Enterprise Program & Project Manager | Digital Transformation & AI</title>',
      '<title>[Your Name] | Enterprise Program & Project Manager | Digital Transformation & AI</title>');
apply('content="Suraj Kumar — Program & Project Manager. 12+ years in IT, 8+ as a hands-on .NET engineer. Owns delivery health, client relationships and teams across ₹2Cr+ multi-account portfolios — 95%+ on-time, on-budget, with AI-augmented ways of working.">',
      'content="[Your Name] — Program & Project Manager. [X]+ years in IT, [X]+ as a hands-on .NET engineer. Owns delivery health, client relationships and teams across [large] multi-account portfolios — [XX]%+ on-time, on-budget, with AI-augmented ways of working.">');
apply('content="Suraj Kumar">', 'content="[Your Name]">', 2);
apply('content="Suraj Kumar | Program & Project Manager · AI-Augmented Delivery">',
      'content="[Your Name] | Program & Project Manager · AI-Augmented Delivery">');
apply('content="Delivery leader — 12+ years in enterprise IT delivery. Owns outcomes, teams and client relationships across ₹2Cr+ multi-account portfolios. 95%+ on-time, on-budget. Engineer-turned-leader, AI-augmented delivery.">',
      'content="Delivery leader — [X]+ years in enterprise IT delivery. Owns outcomes, teams and client relationships across [large] multi-account portfolios. [XX]%+ on-time, on-budget. Engineer-turned-leader, AI-augmented delivery.">');
apply('content="Suraj">', 'content="[First Name]">');
apply('content="Suraj Kumar | Program & Project Manager">', 'content="[Your Name] | Program & Project Manager">');
apply('content="Delivery leader — 12+ years in enterprise IT delivery. Owns outcomes, teams and client relationships across ₹2Cr+ multi-account portfolios. 95%+ on-time, on-budget.">',
      'content="Delivery leader — [X]+ years in enterprise IT delivery. Owns outcomes, teams and client relationships across [large] multi-account portfolios. [XX]%+ on-time, on-budget.">');

/* ---------- JSON-LD ---------- */
apply('"name": "Suraj Kumar",', '"name": "[Your Name]",');
apply('"description": "Program & Delivery Leader with 12+ years in enterprise IT, including 8+ years as a hands-on .NET engineer — owns delivery health, client relationships and teams across multi-account portfolios.",',
      '"description": "Program & Delivery Leader with [X]+ years in enterprise IT, including [X]+ years as a hands-on .NET engineer — owns delivery health, client relationships and teams across multi-account portfolios.",');
apply('"email": "surajkumar.navodya@gmail.com",', '"email": "you@example.com",');
apply('{ "@type": "CollegeOrUniversity", "name": "Sikkim Manipal University" },', '{ "@type": "CollegeOrUniversity", "name": "[Your University]" },');
apply('{ "@type": "CollegeOrUniversity", "name": "Magadh University" }', '{ "@type": "CollegeOrUniversity", "name": "[Your University 2]" }');
apply('{ "@type": "EducationalOccupationalCredential", "name": "LTIMindtree Certified Agile Practitioner" },',
      '{ "@type": "EducationalOccupationalCredential", "name": "[Your Certification]" },');
apply(`"https://www.linkedin.com/in/surajkumar-navodya",
            "https://github.com/PLACEHOLDER_GITHUB_USERNAME",
            "https://www.c-sharpcorner.com/members/suraj-kumar23/articles",
            "https://stackoverflow.com/users/10532500/suraj-kumar"`,
      `"https://www.linkedin.com/in/yourprofile",
            "https://github.com/yourusername",
            "https://example.com/your-articles",
            "https://stackoverflow.com/users/0000000/yourname"`);

/* ---------- contact / social URLs (site-wide) ---------- */
apply('https://www.linkedin.com/in/surajkumar-navodya/details/certifications/', 'https://www.linkedin.com/in/yourprofile/details/certifications/');
apply('https://www.linkedin.com/in/surajkumar-navodya/', 'https://www.linkedin.com/in/yourprofile/');
apply('https://www.linkedin.com/in/surajkumar-navodya', 'https://www.linkedin.com/in/yourprofile', 3);
apply('linkedin.com/in/surajkumar-navodya', 'linkedin.com/in/yourprofile');
apply('https://www.c-sharpcorner.com/members/suraj-kumar23/articles', 'https://example.com/your-articles', 3);
apply('https://stackoverflow.com/users/10532500/suraj-kumar', 'https://stackoverflow.com/users/0000000/yourname', 4);
apply('mailto:surajkumar.navodya@gmail.com', 'mailto:you@example.com', 3);
apply('surajkumar.navodya@gmail.com', 'you@example.com', 2);
apply('tel:+919049141305', 'tel:+10000000000');
apply('+91 90491 41305', '[Your Phone]');
apply('assets/f3230583c0ff/e9bb4c8c8cd214c449ac.pdf', 'assets/downloads/your-resume.pdf');

/* ---------- KPI board / hero stats / scorecard ---------- */
apply('Measured across L&amp;T Group accounts at LTIMindtree, 2021–2026.', 'Measured across [Client Group] accounts at [Your Employer], [Year]–[Year].');
apply(`<!-- Static fallback numbers are baked in so link previews and crawlers never show zeros.
                             NOTE for Suraj: consider swapping one soft metric for a hard COMMERCIAL number a
                             delivery leader is judged on — e.g. delivery margin %, CSAT/NPS, or utilization %.
                             Template cell:
                             <div class="col kpi-cell"><div class="kpi-val"><span class="count" data-count="NN">NN</span><small>%</small></div><div class="kpi-lbl">Client satisfaction (CSAT)</div></div> -->`,
      `<!-- Static fallback numbers are baked in so link previews and crawlers never show zeros.
                             Replace the sample data-count values and labels below with your own real metrics —
                             e.g. delivery margin %, CSAT/NPS, or utilization %. -->`);
apply('Enterprise Program &amp; Delivery Leader — 12+ years running multi-crore, multi-account portfolios, backed by 8+ years as a hands-on .NET engineer.',
      'Enterprise Program &amp; Delivery Leader — [X]+ years running multi-crore, multi-account portfolios, backed by [X]+ years as a hands-on .NET engineer.');

/* ---------- hero stats / executive ribbon ---------- */
apply('<h4>12+</h4><small>Years Experience</small>', '<h4>[X]+</h4><small>Years Experience</small>');
apply('<h4>₹2Cr+</h4><small>Portfolio Governed</small>', '<h4>[Amount]</h4><small>Portfolio Governed</small>');
apply('<h4>40+</h4><small>Projects Delivered</small>', '<h4>[X]+</h4><small>Projects Delivered</small>');
apply('<h4>20+</h4><small>Engineers Led</small>', '<h4>[X]+</h4><small>Engineers Led</small>');
apply('<span><b>5+</b> Enterprise Awards</span>', '<span><b>[X]+</b> Enterprise Awards</span>');

/* ---------- About ---------- */
apply('Twelve-plus years in IT — the first seven hands-on in .NET engineering before moving into program and delivery leadership. That foundation means I read a status report and an architecture diagram with equal fluency, and use both to keep delivery plans honest.',
      '[X]+ years in IT — the first [X] hands-on in .NET engineering before moving into program and delivery leadership. That foundation means I read a status report and an architecture diagram with equal fluency, and use both to keep delivery plans honest.');
apply(`Today I own multi-account portfolios worth ₹2Cr+, leading 20+ engineers as the single point of accountability for client sponsors on delivery health, risk and scope. I'm now applying that same discipline to AI-augmented delivery — using agentic tooling to compress planning, reporting and QA cycles without sacrificing governance.`,
      `Today I own multi-account portfolios worth [Amount], leading [X]+ engineers as the single point of accountability for client sponsors on delivery health, risk and scope. I'm now applying that same discipline to AI-augmented delivery — using agentic tooling to compress planning, reporting and QA cycles without sacrificing governance.`);
apply('AI-augmented delivery practitioner, LTIMindtree Certified Agile Practitioner, and one of the few leaders who can still read the code.',
      'AI-augmented delivery practitioner, [Your Certification], and one of the few leaders who can still read the code.');
apply('12+ Years in IT · Technical Project Management · Enterprise Delivery · Software Engineering Background',
      '[X]+ Years in IT · Technical Project Management · Enterprise Delivery · Software Engineering Background');

/* ---------- Leadership pillars / operating principles ---------- */
apply('Coached engineers in Scrum and Kanban (+15% productivity), grew individual contributors into module owners, and structured teams to reduce key-person risk.',
      'Coached engineers in Scrum and Kanban ([+XX]% productivity), grew individual contributors into module owners, and structured teams to reduce key-person risk.');

/* ---------- Experience timeline ---------- */
apply('<p class="t-org">LTIMindtree · Mumbai</p>',
      '<p class="t-org">[Your Employer] · [City]</p>');
apply('₹2Cr+ multi-account portfolio, 20+ engineers across .NET, Java, SQL Server and cloud (full delivery metrics under Steering Snapshot, above). Own client-sponsor relationships and steering committees across L&amp;T Group accounts; ISO-standard governance; effort estimation and SLA management that protect delivery margin; grew engineers into module owners; HR automation cutting turnaround by 25%.',
      '[Amount] multi-account portfolio, [X]+ engineers across .NET, Java, SQL Server and cloud (full delivery metrics under Steering Snapshot, above). Own client-sponsor relationships and steering committees across [Client Group] accounts; ISO-standard governance; effort estimation and SLA management that protect delivery margin; grew engineers into module owners; HR automation cutting turnaround by [XX]%.');
apply('<p class="t-org">Innovsource Services · Mumbai</p>', '<p class="t-org">[Previous Employer] · [City]</p>');
apply('HR and MIS reporting solutions — <strong>+45% reporting performance</strong>. Mentored junior developers; contributed to enterprise architecture and IT governance forums (+25% team efficiency).',
      'HR and MIS reporting solutions — <strong>+[XX]% reporting performance</strong>. Mentored junior developers; contributed to enterprise architecture and IT governance forums (+[XX]% team efficiency).');
apply('<p class="t-org">SA-Techno Consulting Services · Pune</p>', '<p class="t-org">[Previous Employer] · [City]</p>');
apply('Regulatory-compliant applications for B. Braun Medical India — <strong>−20% audit preparation time</strong>; improved SLA compliance in service delivery.',
      'Regulatory-compliant applications for [Client Name] — <strong>−[XX]% audit preparation time</strong>; improved SLA compliance in service delivery.');
apply('<p class="t-org">Intellect Software Solutions · Mumbai</p>', '<p class="t-org">[Previous Employer] · [City]</p>');
apply('Multi-account governance across L&amp;T Group programs — steering committees, Agile-aligned risk controls, ISO-standard compliance, vendor and SLA management.',
      'Multi-account governance across [Client Group] programs — steering committees, Agile-aligned risk controls, ISO-standard compliance, vendor and SLA management.');

/* ---------- C# Corner proof strip / Stack Overflow panel ---------- */
apply(`<!-- ================= STACK OVERFLOW / SQL SERVER =================
                     Figures taken from https://stackoverflow.com/users/0000000/yourname
                     (verified Jul 2026). Reputation, reach, answers and badge counts grow
                     over time — refresh them when you next update the site. -->`,
      `<!-- ================= STACK OVERFLOW / SQL SERVER =================
                     Replace every figure below with your own real Stack Overflow stats —
                     reputation, reach, answers and badge counts change over time, so refresh
                     them whenever you next update the site. -->`);
apply('<h3 class="so-title">795k developers reached, mostly on SQL Server.</h3>', '<h3 class="so-title">[XXXk] developers reached, mostly on SQL Server.</h3>');
apply(`Contributing since 2018 — <strong>430 answers</strong>, <strong>5,685 reputation</strong>, <strong>92% of it on <code>sql-server</code></strong>. These are the problems engineers hit at 2am when a report times out. Answering in public gets the reasoning peer-reviewed, which keeps a delivery leader honest about what is and isn't feasible.`,
      `Contributing since [Year] — <strong>[XXX] answers</strong>, <strong>[X,XXX] reputation</strong>, <strong>[XX]% of it on <code>sql-server</code></strong>. These are the problems engineers hit at 2am when a report times out. Answering in public gets the reasoning peer-reviewed, which keeps a delivery leader honest about what is and isn't feasible.`);
apply(`<b>795k</b>
                            <span>Developers reached</span>`, `<b>[XXXk]</b>
                            <span>Developers reached</span>`);
apply(`<b>430</b>
                            <span>Answers contributed</span>`, `<b>[XXX]</b>
                            <span>Answers contributed</span>`);
apply(`<b>5,685</b>
                            <span>Reputation earned</span>`, `<b>[X,XXX]</b>
                            <span>Reputation earned</span>`);
apply(`<b>7+ yrs</b>
                            <span>Answering since 2018</span>`, `<b>[X]+ yrs</b>
                            <span>Answering since [Year]</span>`);
apply('<span class="so-tag-fig">405 answers — 92% of my activity</span>', '<span class="so-tag-fig">[XXX] answers — [XX]% of my activity</span>');
apply(`<span class="so-badge gold"><span class="bdot"></span><b>8</b> Gold</span>
                                <span class="so-badge silver"><span class="bdot"></span><b>24</b> Silver</span>
                                <span class="so-badge bronze"><span class="bdot"></span><b>45</b> Bronze</span>`,
      `<span class="so-badge gold"><span class="bdot"></span><b>[X]</b> Gold</span>
                                <span class="so-badge silver"><span class="bdot"></span><b>[X]</b> Silver</span>
                                <span class="so-badge bronze"><span class="bdot"></span><b>[X]</b> Bronze</span>`);

/* ---------- Delivery framework ---------- */
apply('the same discipline that has held delivery success at 98%.', 'the same discipline that has held delivery success high.');

/* ---------- Success stories ---------- */
apply('Framed by business outcomes, not feature lists. Each shows how I lead delivery across stakeholders, governance and execution — all for L&amp;T Group companies at LTIMindtree.',
      'Framed by business outcomes, not feature lists. Each shows how I lead delivery across stakeholders, governance and execution — all for [Client Group] companies at [Your Employer].');
apply('Narada — SEBI Compliance Reporting Platform', '[Project Name] — SEBI Compliance Reporting Platform');
apply('CDP — Common Digital Platform, L&amp;T Construction', '[Project Name] — Common Digital Platform, [Client Account]');
apply('Easy Skills — Competency Management System', '[Project Name] — Competency Management System');
apply('L&amp;T Construction needed a better way to track workforce capability and deploy people against the right project needs, with capability data scattered across spreadsheets and manual records.',
      '[Client Account] needed a better way to track workforce capability and deploy people against the right project needs, with capability data scattered across spreadsheets and manual records.');
apply('<h3 class="fs-6 fw-bold">HRMS Digitalization</h3>', '<h3 class="fs-6 fw-bold">[Project Name] — HRMS Digitalization</h3>');
apply('Digitized hiring, promotions, resignations, interviews and reviews — reducing manual effort and turnaround by 25%.',
      'Digitized hiring, promotions, resignations, interviews and reviews — reducing manual effort and turnaround by [XX]%.');
apply('<h3 class="fs-6 fw-bold">Bid Advisory &amp; Commodity Hedge Management</h3>', '<h3 class="fs-6 fw-bold">[Project Name] — Bid Advisory &amp; Commodity Hedge Management</h3>');
apply('<h3 class="fs-6 fw-bold">eClaim — Expense Management</h3>', '<h3 class="fs-6 fw-bold">[Project Name] — Expense Management</h3>');

/* ---------- Expertise ---------- */
apply('2014–2021: enterprise applications across real estate, CRM, HR, MIS and regulated healthcare — the years that keep my delivery plans technically honest.',
      '[Year]–[Year]: enterprise applications across real estate, CRM, HR, MIS and regulated healthcare — the years that keep my delivery plans technically honest.');
apply('.NET Core, MVC, SQL Server systems across full lifecycles — including regulatory-compliant builds for B. Braun Medical India that cut audit preparation time by 20%.',
      '.NET Core, MVC, SQL Server systems across full lifecycles — including regulatory-compliant builds for [Client Name] that cut audit preparation time by [XX]%.');
apply('HR and MIS reporting solutions with a 45% reporting-performance improvement — I know what slow queries cost a business, and what fixing them takes.',
      'HR and MIS reporting solutions with a [XX]% reporting-performance improvement — I know what slow queries cost a business, and what fixing them takes.');
apply('Azure and Azure DevOps pipelines across current programs; architecture and IT-governance forums contributor since my developer years (+25% team efficiency).',
      'Azure and Azure DevOps pipelines across current programs; architecture and IT-governance forums contributor since my developer years (+[XX]% team efficiency).');

/* ---------- AI leadership ---------- */
apply('AI4ICPS (Hands-on approach to AI for real-world applications) Certificate of Achievement — <strong>IIT Kharagpur</strong>',
      '[Your AI Certificate] — <strong>[Institution]</strong>');
apply('Agentic AI Certificate — <strong>Johns Hopkins &amp; Great Learning</strong>', 'Agentic AI Certificate — <strong>[Institution]</strong>');

/* ---------- Recognition ---------- */
apply('<span>M.Sc. IT — Sikkim Manipal University · 2021</span>', '<span>[Your Degree] — [Your University] · [Year]</span>');
apply('<span>BCA — Magadh University · 2012</span>', '<span>[Your Degree] — [Your University] · [Year]</span>');
apply('<span>LTIMindtree Certified Agile Practitioner · 2024</span>', '<span>[Your Certification] · [Year]</span>');
apply('<span>Generative AI Overview for Project Managers — PMI · 2026</span>', '<span>[Your Certification] — [Issuing Organization] · [Year]</span>');
apply('<span>iLead: Transition to Leadership — LTIMindtree · 2022</span>', '<span>[Leadership Program] — [Your Employer] · [Year]</span>');
apply('<span>Become a Project Manager — LinkedIn · 2021</span>', '<span>[Your Certification] — [Issuing Organization] · [Year]</span>');
apply('<span>Leadership and Team Development — International Business Management Institute (IBMI) · 2020</span>', '<span>[Your Certification] — [Institution] · [Year]</span>');
apply('<span>Basic of Project Management — International Business Management Institute (IBMI) · 2020</span>', '<span>[Your Certification] — [Institution] · [Year]</span>');
apply('<span>Enterprise Design Thinking Practitioner — IBM · 2020</span>', '<span>[Your Certification] — [Issuing Organization] · [Year]</span>');
apply('<span>2× MVP Award — C# Corner</span>', '<span>[X]× [Your Award] — [Community/Publisher]</span>');
apply('<span>LTIMindtree Spot Award : Super Crew — 2025</span>', '<span>[Your Award] — [Year]</span>');
apply('<span>LTIMindtree Spot Award : Super Crew — 2024</span>', '<span>[Your Award] — [Year]</span>');
apply('<span>LTIMindtree Epic Squad (India &amp; ME) Award — 2024</span>', '<span>[Your Award] — [Year]</span>');

/* ---------- Insights ---------- */
apply('430+ answers and counting — the reasoning gets peer-reviewed, which keeps estimates and timelines realistic.',
      '[XXX]+ answers and counting — the reasoning gets peer-reviewed, which keeps estimates and timelines realistic.');
apply('More articles on <a href="https://example.com/your-articles" target="_blank" rel="noopener" style="color:var(--accent)">C# Corner</a> and answers on <a href="https://stackoverflow.com/users/0000000/yourname" target="_blank" rel="noopener" style="color:var(--accent)">Stack Overflow</a>.',
      'More articles on <a href="https://example.com/your-articles" target="_blank" rel="noopener" style="color:var(--accent)">your publishing platform</a> and answers on <a href="https://stackoverflow.com/users/0000000/yourname" target="_blank" rel="noopener" style="color:var(--accent)">Stack Overflow</a>.');
apply(`<!-- REMINDER for Suraj: each card below needs its real published article title,
                     publication date and direct URL (not the profile listing) — replace the
                     ARTICLE TITLE / PUBLISHED_DATE / ARTICLE_URL placeholders. The description
                     line under each title is unchanged framing copy. -->`,
      `<!-- Replace the ARTICLE TITLE / PUBLISHED_DATE / ARTICLE_URL placeholders below with
                     your own real published article title, publication date and direct URL
                     (not a profile listing). The description line under each title is
                     reusable framing copy. -->`);

/* ---------- Testimonials ---------- */
apply('"He combines strong program and project management expertise with enough technical depth to support sound architectural decisions, while leading with calm and maintaining stakeholder confidence under pressure."',
      '"[Paste a real testimonial quote here — one that speaks to your program/project management expertise and how you lead under pressure.]"');
apply('"He brings clarity, structure, and steady ownership to difficult situations, keeps teams aligned without micromanagement, and creates trust through proactive leadership."',
      '"[Paste a real testimonial quote here — one that speaks to your leadership style and how you build trust with your team.]"');
apply(`<!-- These two cards intentionally identify the reviewer by role and
                     relationship only (e.g. "Team Member · LTIMindtree"), not by name —
                     no permission step needed for that. If you later want to name someone
                     instead, get their WRITTEN permission first (an email or message saying
                     it's OK, not just a verbal yes), then swap <strong>role</strong> for
                     their real name and keep the quote text unchanged. -->`,
      `<!-- These two cards identify the reviewer by role and relationship only
                     (e.g. "[Relationship] · [Your Company]"), not by name — no permission step
                     needed for that. If you'd rather name someone, get their WRITTEN permission
                     first (an email or message saying it's OK, not just a verbal yes), then
                     swap <strong>role</strong> for their real name and keep the quote text. -->`);
apply('<strong>Software Engineer</strong>\n                                    <span class="t-role">Team Member · LTIMindtree</span>',
      '<strong>[Their Job Title]</strong>\n                                    <span class="t-role">Team Member · [Your Company]</span>');
apply('<strong>WFM (Early Career Recruiter)</strong>\n                                    <span class="t-role">Colleague · LTIMindtree</span>',
      '<strong>[Their Job Title]</strong>\n                                    <span class="t-role">Colleague · [Your Company]</span>');

/* ---------- domain, script tag, location ---------- */
apply('surajkumarnavodya.com', 'example.com', 7);
apply('<script defer src="assets/js/config.js"></script>', '<script defer src="assets/js/config.demo.js"></script>');
apply('"addressLocality": "Mumbai", "addressRegion": "Maharashtra", "addressCountry": "IN"',
      '"addressLocality": "[Your City]", "addressRegion": "[Your Region]", "addressCountry": "[Your Country]"');
apply('<strong>Location</strong><br>Mumbai, India · Open to relocation — India and GCC</div></div>',
      '<strong>Location</strong><br>[Your City], [Your Country] · [Open to relocation — regions]</div></div>');

/* ---------- telemetry ticker + navbar brand ---------- */
apply(`<span class="ti on">RISK EXPOSURE <b>&minus;20%</b></span>
            <span class="ti">ADOPTION LIFT <b>+30%</b></span>
            <span class="ti">TEAM PRODUCTIVITY <b>+15%</b></span>
            <span class="ti">ENGINEERS LED <b>20+</b></span>
            <span class="ti">EPIC SQUAD AWARD <b>INDIA &amp; ME</b></span>
            <span class="ti">C# CORNER MVP <b>2&times;</b></span>
            <span class="ti">AI4ICPS <b>IIT KHARAGPUR</b></span>
            <span class="ti">AGENTIC AI <b>JOHNS HOPKINS</b></span>`,
      `<span class="ti on">RISK EXPOSURE <b>&minus;[XX]%</b></span>
            <span class="ti">ADOPTION LIFT <b>+[XX]%</b></span>
            <span class="ti">TEAM PRODUCTIVITY <b>+[XX]%</b></span>
            <span class="ti">ENGINEERS LED <b>[X]+</b></span>
            <span class="ti">[YOUR AWARD] <b>[REGION]</b></span>
            <span class="ti">[YOUR AWARD] <b>[X]&times;</b></span>
            <span class="ti">[YOUR CERTIFICATE] <b>[INSTITUTION]</b></span>
            <span class="ti">[YOUR CERTIFICATE] <b>[INSTITUTION]</b></span>`);
apply('<span class="brand-name">SURAJ KUMAR<span class="dot">.</span></span>', '<span class="brand-name">JOHN ANDERSON<span class="dot">.</span></span>');

/* ---------- KPI board data-count values (drive the count-up animation, not
   just display text — must change independently of the surrounding label) ---------- */
apply('<span class="count" data-count="95">95</span>', '<span class="count" data-count="90">90</span>');
apply('<span class="count" data-count="20">20</span>', '<span class="count" data-count="15">15</span>');
apply('<span class="count" data-count="30">30</span>', '<span class="count" data-count="25">25</span>');
apply('<span class="count" data-count="98">98</span>', '<span class="count" data-count="95">95</span>');

/* ---------- verify + write ---------- */
const mismatches = report.filter((r) => r.count !== r.expected);
if (mismatches.length) {
  console.error(`build_template_content.js: ${mismatches.length} replacement(s) did not match the expected count.`);
  console.error('index.html has likely changed since this map was written — update the map above, then re-run.');
  mismatches.forEach((m) => console.error(`  expected ${m.expected}, found ${m.count}: ${JSON.stringify(m.find.slice(0, 90))}`));
  process.exit(1);
}

fs.writeFileSync(OUT, html.split('\n').join('\r\n'));
console.log(`Wrote ${path.relative(ROOT, OUT)} (${report.length} replacements applied, all matched).`);
