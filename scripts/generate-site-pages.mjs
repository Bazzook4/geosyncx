// Generates the static About (/about), Privacy (/privacy) and Terms (/terms) pages. "/" is the Command Center (React app).
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

// ---------- Privacy ----------
const UPDATED = "28 October 2026";
const crumbs = (name, path) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name, item: `${SITE}${path}` },
  ],
});

write("privacy/index.html", shell({
  title: "Privacy Policy | GeoSyncX",
  description: "How GeoSyncX handles your data: what stays in your browser, how Google AdSense uses cookies, and the choices you have.",
  path: "/privacy",
  schema: [crumbs("Privacy Policy", "/privacy")],
  body: `    <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / Privacy Policy</nav>
    <h1>Privacy <span>Policy</span></h1>
    <p class="lead">Last updated: ${UPDATED}</p>

    <p>GeoSyncX (${SITE.replace("https://", "")}) is a free set of timezone and productivity tools. This page explains what information is handled when you use the site.</p>

    <h2>What stays in your browser</h2>
    <p>The tools run in your browser. The cities you compare, your primary timezone, your theme, your to-do items and your meeting preferences are saved in your browser's local storage so they are there next time. This data is not sent to us. Text you paste into the JSON / XML Formatter is processed on your device and is not uploaded.</p>
    <p>You can remove this data at any time by clearing the site data for geosyncx.com in your browser settings.</p>

    <h2>Information we collect</h2>
    <p>We do not ask you to create an account and we do not collect names, email addresses or payment details through the site. If you email us at <a href="mailto:hello@geosyncx.com">hello@geosyncx.com</a>, we receive your email address and message and use them only to reply.</p>
    <p>Like any website, our hosting provider may keep standard server logs (such as IP address, browser type and requested page) for security and reliability.</p>

    <h2>Advertising and cookies</h2>
    <p>We use Google AdSense to show ads. Google and its partners, as third-party vendors, use cookies and similar technologies to serve ads based on your visits to this and other websites.</p>
    <ul>
      <li>Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to GeoSyncX and other sites on the internet.</li>
      <li>You can opt out of personalised advertising by visiting <a href="https://adssettings.google.com" rel="noopener" target="_blank">Google Ads Settings</a>, or opt out of some third-party vendors' use of cookies at <a href="https://www.aboutads.info" rel="noopener" target="_blank">aboutads.info</a>.</li>
      <li>To learn how Google uses data from sites that use its services, see <a href="https://policies.google.com/technologies/partner-sites" rel="noopener" target="_blank">How Google uses information from sites or apps that use our services</a>.</li>
    </ul>
    <p>If you are in the European Economic Area, the United Kingdom or Switzerland, you will be asked for your consent to cookies for advertising through a consent message. You can change your choice at any time using the privacy options link that message provides, or by clearing your cookies.</p>

    <h2>Your rights</h2>
    <p>Depending on where you live (for example under the GDPR, UK GDPR or CCPA), you may have the right to access, correct or delete personal data held about you, and to object to certain processing. Since we hold very little personal data, the quickest route is to email us and we will respond.</p>

    <h2>Children</h2>
    <p>GeoSyncX is not directed at children under 13 and we do not knowingly collect personal information from them.</p>

    <h2>Changes to this policy</h2>
    <p>If this policy changes, we will update the date at the top of this page.</p>

    <h2>Contact</h2>
    <p>Questions about privacy? Email <a href="mailto:hello@geosyncx.com">hello@geosyncx.com</a>.</p>`,
}));

// ---------- Terms ----------
write("terms/index.html", shell({
  title: "Terms of Use | GeoSyncX",
  description: "The terms for using GeoSyncX's free timezone converters, meeting finder and productivity tools.",
  path: "/terms",
  schema: [crumbs("Terms of Use", "/terms")],
  body: `    <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / Terms of Use</nav>
    <h1>Terms of <span>Use</span></h1>
    <p class="lead">Last updated: ${UPDATED}</p>

    <p>By using GeoSyncX you agree to these terms. If you do not agree, please do not use the site.</p>

    <h2>Use of the tools</h2>
    <p>GeoSyncX is free for personal and business use. Please do not misuse the site, attempt to disrupt it, or scrape it in a way that affects other visitors.</p>

    <h2>Accuracy</h2>
    <p>Time conversions use the IANA timezone database and your device's clock, and phone-code information is provided as a guide. Timezone rules change, and some countries have several timezones, so please double-check anything important, such as a legal deadline or a flight, with an official source. The tools are provided "as is" without warranties of any kind.</p>

    <h2>Limitation of liability</h2>
    <p>To the extent permitted by law, GeoSyncX is not liable for any loss or damage arising from your use of, or inability to use, the site or from reliance on its results, such as a missed meeting.</p>

    <h2>Advertising and third-party links</h2>
    <p>The site shows ads provided by Google AdSense and may link to other websites. We do not control those sites or the ads shown and are not responsible for their content. See our <a href="/privacy">Privacy Policy</a> for details.</p>

    <h2>Content</h2>
    <p>The text, design and code of GeoSyncX belong to its owner. You may link to any page. Please do not republish our articles without permission.</p>

    <h2>Changes</h2>
    <p>We may update these terms from time to time. The date at the top shows the latest version. Continued use of the site means you accept the updated terms.</p>

    <h2>Contact</h2>
    <p>Questions? Email <a href="mailto:hello@geosyncx.com">hello@geosyncx.com</a>.</p>`,
}));

console.log("Generated about, privacy and terms pages.");
