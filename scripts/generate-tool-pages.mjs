// Generates static tool pages (public/tools/<tool>/index.html) and the data they load.
//
//   node scripts/generate-tool-pages.mjs
//
// Each tool is plain HTML + a small script in public/js, replacing the React version in src/.
// The page body is real content (steps, FAQ, links) so it ranks without JavaScript; the script
// only adds the interactive widget.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, esc, pageShell } from "./lib/layout.mjs";
import { timezoneData } from "../src/timezones.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public");
const YEAR = new Date().getFullYear();
const write = (rel, content) => {
  const file = join(PUB, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
};

// GMT offsets are computed in the browser (they change with daylight saving), so they are not stored here.
write("data/timezones.json", JSON.stringify(timezoneData.map(({ city, country, value }) => ({ city, country, value }))));

// ---------- Compare Timezones ----------
const faq = [
  ["How do I compare multiple timezones?", "Search for a city or country, then click it to add it to the table. You can add as many timezones as you need and every clock updates live."],
  ["What does the star do?", "The star sets a timezone as your primary one. When you enter a date and time, it is read in the primary timezone and converted for every other row."],
  ["How do I convert a specific time?", "Star your primary timezone, then pick a date and time. The Equivalent time column shows that moment in each timezone, with a day marker when it falls on the next or previous day."],
  ["Does it account for daylight saving?", "Yes. Conversions use the IANA timezone database for the date you choose, so the gap between, say, India and the UK changes between winter (5.5 hours) and summer (4.5 hours)."],
  ["Are my selections saved?", "Your timezones and primary timezone are saved in your browser's local storage. Nothing is sent to a server."],
];
const pairs = [
  ["ist-to-london", "IST to UK / London"], ["gmt-to-ist", "GMT to IST"], ["ist-to-est", "IST to EST"],
  ["ist-to-pst", "IST to PST"], ["est-to-pst", "EST to PST"], ["london-to-est", "London to EST"],
];

write("tools/timezone-compare/index.html", pageShell({
  title: "Timezone Comparison: Compare World Clocks Side by Side | GeoSyncX",
  description: "Compare multiple timezones side by side. Add any city, set a primary timezone and see live clocks plus the equivalent time for any date, with daylight saving applied.",
  path: "/tools/timezone-compare",
  schema: [
    { "@context": "https://schema.org", "@type": "WebApplication", name: "Timezone Comparison", url: `${SITE}/tools/timezone-compare`, applicationCategory: "UtilityApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, author: { "@type": "Organization", name: "GeoSyncX" } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Timezone Comparison", item: `${SITE}/tools/timezone-compare` },
    ] },
  ],
  body: `    <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / Timezone Comparison</nav>
    <h1>Timezone <span>Comparison</span></h1>
    <p class="lead">See multiple world clocks side by side with live updates. Add cities, star your primary timezone, and pick a date and time to see what it is everywhere else.</p>

    <div class="converter-widget">
      <label class="tc-label" for="tc-search">Add a city or country</label>
      <input id="tc-search" class="conv-time-input" type="search" autocomplete="off" placeholder="e.g. London, Singapore, India">
      <div id="tc-results" class="tc-results" hidden></div>

      <div class="tc-when">
        <div><label class="tc-label" for="tc-date">Date (primary timezone)</label><input id="tc-date" class="conv-date-input" type="date"></div>
        <div><label class="tc-label" for="tc-time">Time (primary timezone)</label><input id="tc-time" class="conv-time-input" type="time"></div>
        <button id="tc-now-btn" class="tc-now-btn" type="button">Use current time</button>
      </div>

      <div class="tc-scroll">
        <table class="tc-table">
          <thead><tr><th>Timezone</th><th>Time now</th><th>Equivalent time</th><th><span class="sr-only">Actions</span></th></tr></thead>
          <tbody id="tc-rows"><tr><td colspan="4">Loading clocks…</td></tr></tbody>
        </table>
      </div>
      <noscript><p>Enable JavaScript to use the live comparison. For fixed pairs, use the converters below.</p></noscript>
    </div>

    <h2>How to compare timezones</h2>
    <ol>
      <li>Search for a city or country and click it to add it.</li>
      <li>Star the timezone you work from to make it your primary one.</li>
      <li>Pick a date and time. The Equivalent time column shows that moment in every timezone.</li>
      <li>Remove rows with ✕. Your list is saved in your browser.</li>
    </ol>

    <h2>Popular time converters</h2>
    <div class="related-links">
${pairs.map(([k, l]) => `      <a href="/time/${k}">${esc(l)}</a>`).join("\n")}
    </div>

    <h2>Related tools</h2>
    <div class="tool-grid">
      <a class="tool-card" href="/tools/best-meeting-time"><span class="tool-icon">✨</span><strong>Best Meeting Time</strong><span>Find when everyone is within working hours</span></a>
      <a class="tool-card" href="/tools/phone-code-lookup"><span class="tool-icon">📞</span><strong>Phone Code Lookup</strong><span>Identify the country from a phone number</span></a>
      <a class="tool-card" href="/tools/meeting-scheduler"><span class="tool-icon">📅</span><strong>Meeting Scheduler</strong><span>Schedule across timezones</span></a>
    </div>

    <h2>Frequently asked questions</h2>
    <div class="faq">
${faq.map(([q, a]) => `      <details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n")}
    </div>`,
  scripts: `<script src="/js/timezone-compare.js" defer></script>`,
}, YEAR));

console.log("Generated tool pages and timezone data.");
