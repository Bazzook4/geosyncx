// Generates the static About (/about) page. "/" is the Command Center (React app).
//
//   node scripts/generate-site-pages.mjs
//
// Same approach as generate-converter-pages.mjs: real HTML in the served file so search engines
// see the full content without running JavaScript. Shared header/footer/CSS live in scripts/lib/layout.mjs
// and public/css/site.css.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, esc, pageShell } from "./lib/layout.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public");
const YEAR = new Date().getFullYear();
const shell = (o) => pageShell(o, YEAR);

const write = (rel, html) => {
  const file = join(PUB, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
};

// ---------- About ----------
const about = shell({
  title: "About GeoSyncX | The Story Behind the Tool",
  description: "GeoSyncX was built by a sales executive tired of juggling 3-4 tools to schedule international calls. Here is the story.",
  path: "/about",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "About GeoSyncX",
      url: `${SITE}/about`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "About", item: `${SITE}/about` },
      ],
    },
  ],
  body: `    <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / About</nav>
    <h1>Why I built <span>GeoSyncX</span></h1>
    <p class="lead">A tool born from real frustration.</p>

    <p>I'm a sales executive working with leads from around the globe.</p>
    <p>Every day I'd get inquiries with just a phone number: no location, no timezone. So I'd open one tab to look up the country code, another to check their timezone, and a third to figure out when to call.</p>
    <p>Then came the multi-stakeholder deals. A prospect in <strong>London</strong>, their CTO in <strong>Singapore</strong>, and their US team in <strong>California</strong>. Finding a single meeting slot that didn't require someone to wake up at 3 AM took forever.</p>

    <div class="highlight-box"><p>"I got tired of juggling 3-4 different tools for something so simple."</p></div>

    <p>So I built <strong>GeoSyncX</strong>, everything I need in one place:</p>
    <ul>
      <li><strong>See a phone number?</strong> Instantly know where they're calling from with the <a href="/tools/phone-code-lookup">Phone Code Lookup</a>.</li>
      <li><strong>Need to compare timezones?</strong> Add as many as you want in <a href="/command-center">Command Center</a>.</li>
      <li><strong>Scheduling a meeting?</strong> Find the best overlap in seconds with <a href="/command-center">Command Center</a>.</li>
      <li><strong>Converting a specific pair?</strong> Try <a href="/time/ist-to-london">IST to UK time</a> or <a href="/time/gmt-to-ist">GMT to IST</a>.</li>
    </ul>
    <p>No signups. No clutter. Just the tools I wish I had from day one.</p>

    <h2>Built for</h2>
    <div class="info-grid">
      <div class="info-card"><strong>Sales teams</strong><span>Identify leads, find their timezone, schedule calls</span></div>
      <div class="info-card"><strong>Remote workers</strong><span>Coordinate distributed teams without the headache</span></div>
      <div class="info-card"><strong>Client success</strong><span>Know when to call without waking anyone up</span></div>
      <div class="info-card"><strong>Frequent travellers</strong><span>Keep track of home time while on the move</span></div>
    </div>

    <div style="text-align:center;margin:32px 0 0"><a class="cta" href="/command-center">Open the Command Center →</a></div>
    <p style="text-align:center;margin-top:24px">Feedback or suggestions? <a href="mailto:hello@geosyncx.com">Drop me an email</a>.</p>`,
});
write("about/index.html", about);

console.log("Generated about page.");
