// Generates the static Home (/) and About (/about) pages.
//
//   node scripts/generate-site-pages.mjs
//
// Same approach as generate-converter-pages.mjs: real HTML in the served file so search engines
// see the full content without running JavaScript. Shared header/footer/CSS live in scripts/lib/layout.mjs
// and public/css/site.css.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ADSENSE, SITE, siteFooter, siteHeader } from "./lib/layout.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUB = join(ROOT, "public");
const YEAR = new Date().getFullYear();

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const jsonLd = (o) => `  <script type="application/ld+json">\n${JSON.stringify(o, null, 2).replace(/</g, "\\u003c")}\n  </script>`;

function shell({ title, description, path, schema, body }) {
  const url = `${SITE}${path}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="author" content="GeoSyncX Team">
  <link rel="canonical" href="${url}">

  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${SITE}/android-chrome-512x512.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" href="/favicon-32x32.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#0b1220">

  ${ADSENSE}

${schema.map(jsonLd).join("\n\n")}

  <link rel="stylesheet" href="/css/site.css">
</head>
<body>
<div class="wrap">
${siteHeader()}

  <main class="main">
${body}
  </main>

${siteFooter(YEAR)}
</div>
</body>
</html>
`;
}

const write = (rel, html) => {
  const file = join(PUB, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
};

// ---------- Home ----------
const TOOLS = [
  ["/command-center", "🚀", "Command Center", "All timezone tools in one dashboard", true],
  ["/tools/timezone-compare", "🌍", "Compare Timezones", "World clocks side by side with live updates"],
  ["/tools/best-meeting-time", "✨", "Best Meeting Time", "Find times when everyone is awake and available"],
  ["/tools/meeting-scheduler", "📅", "Meeting Scheduler", "Schedule across timezones with Google Calendar links"],
  ["/tools/phone-code-lookup", "📞", "Phone Code Lookup", "Find the country and timezone from a phone number"],
  ["/tools/timezone-finder", "🔍", "Timezone Finder", "Search timezones by city, country or GMT offset"],
  ["/tools/formatter", "🔧", "JSON / XML Formatter", "Beautify JSON, XML and SOAP with syntax highlighting"],
];

// Highest-demand conversions first (Search Console, last 3 months: IST/UK/GMT queries).
const POPULAR = [
  ["ist-to-london", "IST to UK / London time"],
  ["london-to-ist", "UK / London to IST"],
  ["gmt-to-ist", "GMT to IST"],
  ["ist-to-gmt", "IST to GMT"],
  ["ist-to-est", "IST to EST"],
  ["ist-to-pst", "IST to PST"],
  ["est-to-ist", "EST to IST"],
  ["pst-to-ist", "PST to IST"],
  ["est-to-pst", "EST to PST"],
  ["london-to-est", "London to EST"],
];

const homeFaq = [
  ["What is the time difference between India and the UK?", "London is 5.5 hours behind India in winter (GMT) and 4.5 hours behind in summer (BST). India (IST, UTC+5:30) does not change its clocks, so the gap shifts when the UK changes clocks in late March and late October."],
  ["Does GeoSyncX need a signup?", "No. Every tool is free and runs in your browser, with no account required."],
  ["How do I find the best time for a meeting across timezones?", "Use the Best Meeting Time tool: add each participant's city and it highlights the hours when everyone is inside working hours."],
  ["How do I find a caller's timezone from their phone number?", "Open the Phone Code Lookup tool, enter the country code or number, and it shows the country and its timezones so you know when it is safe to call."],
];

const home = shell({
  title: "GeoSyncX: Free Time Zone Converter, IST to UK Time & Meeting Planner",
  description: "Free time zone converter and meeting planner. Convert IST to UK, GMT to IST, EST and PST with live daylight-saving-aware charts, find the best meeting time and look up phone codes.",
  path: "/",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "GeoSyncX",
      url: `${SITE}/`,
      description: "Free timezone converter, meeting planner and productivity tools for global teams.",
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "GeoSyncX",
      url: `${SITE}/`,
      logo: `${SITE}/android-chrome-512x512.png`,
      email: "hello@geosyncx.com",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: homeFaq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ],
  body: `    <section class="hero">
      <h1>Free time zone converter <span>for global teams</span></h1>
      <p class="lead">Convert IST to UK time, GMT to IST, EST and PST in one click, find a meeting slot that works for everyone, and look up the timezone behind any phone number. No signup.</p>
      <a class="cta" href="/time/ist-to-london">IST to UK time converter →</a>
    </section>

    <h2>Popular time conversions</h2>
    <div class="related-links">
${POPULAR.map(([k, label]) => `      <a href="/time/${k}">${esc(label)}</a>`).join("\n")}
    </div>

    <h2>Timezone tools</h2>
    <div class="tool-grid">
${TOOLS.map(([href, icon, name, desc, featured]) => `      <a class="tool-card${featured ? " featured" : ""}" href="${href}"><span class="tool-icon">${icon}</span><strong>${esc(name)}</strong><span>${esc(desc)}</span></a>`).join("\n")}
    </div>

    <h2>Why GeoSyncX</h2>
    <div class="info-grid">
      <div class="info-card"><strong>No signup</strong><span>Open a tool and use it</span></div>
      <div class="info-card"><strong>Daylight saving aware</strong><span>Charts show winter and summer</span></div>
      <div class="info-card"><strong>Private</strong><span>Conversions run in your browser</span></div>
    </div>

    <h2>Frequently asked questions</h2>
    <div class="faq">
${homeFaq.map(([q, a]) => `      <details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n")}
    </div>

    <p class="also">Guides: <a href="/blog/timezone-comparison-tool">timezone comparison</a> · <a href="/blog/best-meeting-time-finder">best meeting time</a> · <a href="/blog/schedule-meeting-across-timezones">scheduling across timezones</a> · <a href="/blog">all articles</a></p>`,
});
write("index.html", home);

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
      <li><strong>Need to compare timezones?</strong> Add as many as you want in <a href="/tools/timezone-compare">Compare Timezones</a>.</li>
      <li><strong>Scheduling a meeting?</strong> Find the best overlap in seconds with <a href="/tools/best-meeting-time">Best Meeting Time</a>.</li>
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

console.log("Generated home and about pages.");
