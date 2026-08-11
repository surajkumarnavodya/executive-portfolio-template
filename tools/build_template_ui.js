/**
 * Regenerates a genericized assets/js/ui.js for the template package.
 *
 * assets/js/ui.js's Portfolio Copilot has this deployment's real career
 * facts hardcoded as DEFAULT_KB/DEFAULT_FALLBACK/DEFAULT_GREET — used
 * whenever no cfg.copilot override is present (engineering.html needs this:
 * it loads no config.js at all, so it has nothing to override with). That
 * default has to stay real for the live site, but it means the SOURCE FILE
 * itself carries real personal data even after config.demo.js's runtime
 * override makes the template's rendered Copilot show placeholder answers —
 * a buyer inspecting assets/js/ui.js (or the compiled dist bundle) would
 * still see it. This script produces a genericized copy for the template
 * package only, matching config.demo.js's "John Anderson" persona.
 *
 * Usage:
 *   node tools/build_template_ui.js [assets/js/ui.js] [out/ui.template.js]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.resolve(ROOT, process.argv[2] || 'assets/js/ui.js');
const OUT = process.argv[3] ? path.resolve(ROOT, process.argv[3]) : null;

let js = fs.readFileSync(SRC, 'utf8').split('\r\n').join('\n');

const report = [];
function apply(find, replace, expected = 1) {
  const count = js.split(find).length - 1;
  js = js.split(find).join(replace);
  report.push({ find, count, expected });
}

apply(
`  var DEFAULT_KB = [
    { k: ['ai','genai','gen','ml','artificial','intelligence','rag','langgraph','agentic','agent','llm','copilot','multi-agent','pipeline'],
      a: "<b>AI is his deliberate bet, built hands-on.</b> Certified via IIT Kharagpur's AI4ICPS (completed) and pursuing the Johns Hopkins Agentic AI certificate. He's built RAG pipelines and multi-agent workflows with LangGraph himself — so he can scope and govern GenAI initiatives from judgement, not vendor decks — and applies AI tooling daily to reporting, planning and engineering workflows." },
    { k: ['experience','years','background','career','history','journey','profile','about','who'],
      a: "<b>12+ years in IT, one trajectory.</b> 8+ years as a hands-on .NET engineer (2014–2021), then Manager — Program & Delivery Management at LTIMindtree, running L&T Corporate IT, L&T Realty, L&T Construction and Airtel accounts. Engineer → mentor → delivery leader; every phase compounds." },
    { k: ['program','biggest','portfolio','narada','cdp','skills','project','case','delivered','sebi','compliance','platform'],
      a: "<b>Flagship: Narada — SEBI compliance platform</b> for a listed conglomerate, removing regulatory-penalty exposure with one auditable system of record. Also: CDP (end-to-end digitization of road-construction ops) and Easy Skills (workforce capability platform). Portfolio: ₹2Cr+ multi-account, 95%+ on-time/on-budget." },
    { k: ['metric','number','result','kpi','impact','stats','achievement','track','record'],
      a: "<b>The steering snapshot:</b> ₹2Cr+ portfolio under management · 95%+ on-time/on-budget delivery · −20% risk exposure via governance · 20+ engineers led · +30% adoption via change management · +15% team productivity." },
    { k: ['team','leadership','people','lead','manage','coach','mentor','grow','engineers'],
      a: "<b>20+ engineers led across accounts</b> — coached in Scrum and Kanban (+15% productivity), grown into module ownership, structured to reduce key-person risk. His principle: capability should outlast the manager." },
    { k: ['certification','certified','pmp','csm','scrum','agile','lcap','credential','qualification','education','degree'],
      a: "<b>LTIMindtree Certified Agile Practitioner.</b> Plus AI4ICPS (IIT Kharagpur), Agentic AI (Johns Hopkins, in progress), PMI GenAI for PMs, IBM Enterprise Design Thinking. Education: M.Sc. IT (Sikkim Manipal) and BCA." },
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
  ];`,
`  var DEFAULT_KB = [
    { k: ['experience','years','background','career','history','journey','profile','about','who'],
      a: "<b>15+ years in engineering leadership.</b> [Placeholder sample content — replace assets/js/ui.js's DEFAULT_KB, or set cfg.copilot in assets/js/config.js, with your own real answers before publishing.]" },
    { k: ['team','leadership','people','lead','manage','coach','mentor','grow','engineers'],
      a: "<b>Grows engineers into leads, not just headcount.</b> [Placeholder sample content — see assets/js/config.js's cfg.copilot for how to override this.]" },
    { k: ['contact','email','phone','reach','call','hire','connect','talk','touch'],
      a: "<b>Direct channels:</b> john@example.com · LinkedIn: linkedin.com/in/example. [Placeholder sample content.]" },
    { k: ['location','relocate','relocation','city','based','where','remote'],
      a: "<b>Based in Austin, TX</b> — [placeholder sample content]." },
    { k: ['resume','cv','download','pdf'],
      a: "<b>Resume:</b> use the “Download resume” link in the hero at the top of this page." },
    { k: ['stack','tech','technology','tools','skill'],
      a: "This is placeholder sample content — replace assets/js/config.js's copilot.kb (or delete it to fall back to your own real Copilot content) before publishing." }
  ];`
);
apply(
  `  var DEFAULT_FALLBACK = "I can answer about his <b>AI work, programs, metrics, leadership, certifications, stack, awards, or contact details</b> — try one of the chips below, or email <b>surajkumar.navodya@gmail.com</b> directly.";`,
  `  var DEFAULT_FALLBACK = "This is a template demo — replace cfg.copilot in assets/js/config.js with your own real Q&A content before publishing.";`
);
apply(
  `  var DEFAULT_GREET = "Hi! I'm Suraj's Portfolio Copilot — I answer from this page only, right here in your browser. What would you like to know?";`,
  `  var DEFAULT_GREET = "Hi! I'm John's Portfolio Copilot (sample content) — I answer from this page only, right here in your browser.";`
);
apply(
  `    var recipientEmail = (cfg.contact && cfg.contact.email) || 'surajkumar.navodya@gmail.com';`,
  `    var recipientEmail = (cfg.contact && cfg.contact.email) || 'you@example.com';`
);
apply(
  `    var recipientFirstName = (cfg.identity && cfg.identity.name ? String(cfg.identity.name).split(' ')[0] : 'Suraj');`,
  `    var recipientFirstName = (cfg.identity && cfg.identity.name ? String(cfg.identity.name).split(' ')[0] : 'there');`
);

const mismatches = report.filter((r) => r.count !== r.expected);
if (mismatches.length) {
  console.error(`build_template_ui.js: ${mismatches.length} replacement(s) did not match the expected count.`);
  console.error('ui.js has likely changed since this map was written — update the map above, then re-run.');
  mismatches.forEach((m) => console.error(`  expected ${m.expected}, found ${m.count}: ${JSON.stringify(m.find.slice(0, 90))}`));
  process.exit(1);
}

const result = js.split('\n').join('\r\n');
if (OUT) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, result);
  console.log(`Wrote ${path.relative(ROOT, OUT)} (${report.length} replacements applied, all matched).`);
} else {
  process.stdout.write(result);
}
