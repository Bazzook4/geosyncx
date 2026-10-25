// Generates the static SEO converter pages in public/time/ from src/converter-routes.js
// and refreshes the /time/ block of public/sitemap.xml.
//
//   node scripts/generate-converter-pages.mjs
//
// Offsets, conversion tables and DST facts are computed with luxon so they can't drift
// from the route data. The header/nav/footer mirror the Command Center (AppRouter.jsx, Footer.jsx).
import { DateTime } from "luxon";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CONVERTER_ROUTES } from "../src/converter-routes.js";
import { siteHeader, siteFooter, THEME_INIT } from "./lib/layout.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "time");
const SITE = "https://www.geosyncx.com";
const TODAY = new Date().toISOString().slice(0, 10);
const YEAR = new Date().getFullYear();

// Search phrasings people actually use for each zone.
const ZONE_TERMS = {
  ist: { code: "IST", names: ["India", "Indian Standard Time", "India time", "Indian time"] },
  london: { code: "London", names: ["London", "UK", "United Kingdom", "GMT/BST", "British time", "UK time"] },
  gmt: { code: "GMT", names: ["GMT", "UTC", "Greenwich Mean Time"] },
  est: { code: "EST", names: ["EST", "EDT", "New York", "US Eastern time", "Eastern time"] },
  pst: { code: "PST", names: ["PST", "PDT", "Los Angeles", "California", "US Pacific time", "Pacific time"] },
  cst: { code: "CST", names: ["CST", "CDT", "Chicago", "US Central time", "Central time"] },
  sydney: { code: "Sydney", names: ["Sydney", "Australia", "AEST", "AEDT"] },
  dubai: { code: "Dubai", names: ["Dubai", "UAE", "GST", "Gulf time"] },
  singapore: { code: "Singapore", names: ["Singapore", "SGT", "Singapore time"] },
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const jsonLd = (o) => JSON.stringify(o, null, 2).replace(/</g, "\\u003c");

// ---------- time maths ----------
const offsetMin = (zone, iso) => DateTime.fromISO(iso, { zone }).offset;
const fmtHM = (dt) => dt.toFormat("h:mm a");
function hoursText(min) {
  const abs = Math.abs(min) / 60;
  return `${Number.isInteger(abs) ? abs : abs.toFixed(1)} hour${abs === 1 ? "" : "s"}`;
}
// Pick Jan / Jul reference days of the current year to show winter vs summer behaviour.
const WINTER = `${YEAR}-01-15`;
const SUMMER = `${YEAR}-07-15`;

function diffFor(r, day) {
  const m = offsetMin(r.toZone, day) - offsetMin(r.fromZone, day); // to minus from
  return m;
}
function diffPhrase(r, m, fromLabel, toLabel) {
  if (m === 0) return `${toLabel} and ${fromLabel} are on the same time`;
  return `${toLabel} is ${hoursText(m)} ${m > 0 ? "ahead of" : "behind"} ${fromLabel}`;
}

function convertTable(r, day, step = 60) {
  const rows = [];
  for (let m = 0; m < 24 * 60; m += step) rows.push(m);
  return rows.map((mins) => {
    const from = DateTime.fromISO(day, { zone: r.fromZone }).set({ hour: Math.floor(mins / 60), minute: mins % 60 });
    const to = from.setZone(r.toZone);
    const dayDiff = Math.round(to.startOf("day").diff(from.startOf("day"), "days").days);
    return { from: fmtHM(from), from24: from.toFormat("HH:mm"), to: fmtHM(to), note: dayDiff === 0 ? "" : dayDiff > 0 ? " (next day)" : " (previous day)" };
  });
}

function keyOf(route, side) {
  const [a, b] = route.split("-to-");
  return side === "from" ? a : b;
}

// ---------- page ----------
function page(route, r) {
  const fromKey = keyOf(route, "from");
  const toKey = keyOf(route, "to");
  const F = ZONE_TERMS[fromKey] || { code: r.fromCity, names: [r.fromCity] };
  const T = ZONE_TERMS[toKey] || { code: r.toCity, names: [r.toCity] };
  const fromLabel = r.fromCity;
  const toLabel = r.toCity;
  const url = `${SITE}/time/${route}`;
  // Searchers write "UK time" far more often than "London time" (Search Console), so London pages lead with UK.
  const hasLondon = fromKey === "london" || toKey === "london";
  const disp = (k, code) => (k === "london" ? "UK" : code);
  const codeF = disp(fromKey, F.code);
  const codeT = disp(toKey, T.code);

  const wDiff = diffFor(r, WINTER);
  const sDiff = diffFor(r, SUMMER);
  const hasDST = wDiff !== sDiff;
  const wLine = diffPhrase(r, wDiff, fromLabel, toLabel);
  const sLine = diffPhrase(r, sDiff, fromLabel, toLabel);
  const headline = hasDST ? `${wLine} in winter and ${sLine.replace(`${toLabel} is `, "")} in summer` : wLine;

  // Keywords: every route is searched under several phrasings.
  const pair = `${F.code} to ${T.code}`;
  const kw = new Set([
    ...(hasLondon ? [`${codeF} to ${codeT} time`, `${codeF} to ${codeT} time converter`, `${codeF} to ${codeT} time difference`] : []),
    `${pair} time converter`,
    `${pair} time`,
    `${pair.toLowerCase()}`,
    `${F.code} to ${T.code} time difference`,
    `${fromLabel} to ${toLabel} time`,
    `${fromLabel} time to ${toLabel} time`,
    `${toLabel} time in ${F.code}`,
    `${toLabel} timing`,
    `${fromLabel} ${toLabel} time difference`,
    `current time ${toLabel}`,
    `${F.code} ${T.code} meeting time`,
    "timezone converter",
  ]);
  for (const f of F.names.slice(0, 3)) for (const t of T.names.slice(0, 3)) kw.add(`${f} to ${t} time`);
  if (fromKey === "ist" || toKey === "ist") {
    kw.add("India time converter");
    kw.add("IST time converter");
    kw.add("India time difference");
  }
  if (fromKey === "london" || toKey === "london") {
    kw.add("London time converter");
    kw.add("London timing");
    kw.add("UK time converter");
    kw.add("what time is it in London");
  }
  const keywords = [...kw].join(", ");

  const sample = DateTime.fromISO(WINTER, { zone: r.fromZone }).set({ hour: 14, minute: 0 });
  const sampleS = DateTime.fromISO(SUMMER, { zone: r.fromZone }).set({ hour: 14, minute: 0 });
  const answer = hasDST
    ? `${fmtHM(sample)} ${F.code} = ${fmtHM(sample.setZone(r.toZone))} ${T.code} (winter) / ${fmtHM(sampleS.setZone(r.toZone))} (summer)`
    : `${fmtHM(sample)} ${F.code} = ${fmtHM(sample.setZone(r.toZone))} ${T.code}`;
  const metaDesc = `${codeF} to ${codeT} time converter: ${answer}. ${headline}. Full hour-by-hour chart.`.slice(0, 200);
  const title = hasLondon
    ? `${codeF} to ${codeT} Time Converter (${fromLabel} to ${toLabel}) - GeoSyncX`
    : `${r.title} | ${fromLabel} to ${toLabel} Time Difference - GeoSyncX`;

  // FAQ, written around real search questions
  const nineFrom = DateTime.fromISO(WINTER, { zone: r.fromZone }).set({ hour: 9, minute: 0 });
  const nineSummer = DateTime.fromISO(SUMMER, { zone: r.fromZone }).set({ hour: 9, minute: 0 });
  const nineTo = nineFrom.setZone(r.toZone);
  const nineToS = nineSummer.setZone(r.toZone);
  const faq = [
    [`What is the time difference between ${fromLabel} and ${toLabel}?`, `${headline}. ${r.description}`],
    [`What time is it in ${toLabel} when it is 9:00 AM in ${fromLabel}?`,
      hasDST
        ? `When it is 9:00 AM in ${fromLabel}, it is ${fmtHM(nineTo)} in ${toLabel} in winter and ${fmtHM(nineToS)} in summer.`
        : `When it is 9:00 AM in ${fromLabel}, it is ${fmtHM(nineTo)} in ${toLabel}.`],
    [`What is the best time for a call between ${fromLabel} and ${toLabel}?`, r.bestTimes || `Pick a window where both sides fall within 9 AM - 6 PM; use the GeoSyncX Best Meeting Time finder to find it automatically.`],
    [`Does the ${F.code} to ${T.code} difference change during the year?`, r.dstNote || (hasDST ? `Yes. Daylight saving changes shift the gap between ${wDiff / 60} and ${sDiff / 60} hours.` : `No. The difference is constant all year.`)],
  ];
  for (const h of [14, 18]) {
    const w = DateTime.fromISO(WINTER, { zone: r.fromZone }).set({ hour: h, minute: 0 });
    const su = DateTime.fromISO(SUMMER, { zone: r.fromZone }).set({ hour: h, minute: 0 });
    faq.push([`What is ${fmtHM(w).replace(":00", "")} ${F.code} in ${codeT} time?`,
      hasDST ? `${fmtHM(w)} ${F.code} is ${fmtHM(w.setZone(r.toZone))} in ${toLabel} in winter and ${fmtHM(su.setZone(r.toZone))} in summer.` : `${fmtHM(w)} ${F.code} is ${fmtHM(w.setZone(r.toZone))} in ${toLabel}.`]);
  }
  if (fromKey === "ist" || toKey === "ist") {
    faq.push([`What is the IST offset?`, `India Standard Time (IST) is UTC+5:30 (IANA zone Asia/Kolkata). India does not observe daylight saving time, so IST never changes.`]);
  }
  if (fromKey === "london" || toKey === "london") {
    faq.push([`What is London time?`, `London uses Greenwich Mean Time (GMT, UTC+0) in winter and British Summer Time (BST, UTC+1) from the last Sunday of March to the last Sunday of October.`]);
  }

  const step = fromKey === "ist" || fromKey === "gmt" ? 30 : 60;
  const wTable = convertTable(r, WINTER, step);
  const sTable = convertTable(r, SUMMER, step);
  const tableRows = wTable.map((w, i) => `        <tr><td>${w.from} <span class="h24">(${w.from24})</span></td><td>${w.to}${w.note}</td>${hasDST ? `<td>${sTable[i].to}${sTable[i].note}</td>` : ""}</tr>`).join("\n");

  const related = (r.relatedRoutes || []).filter((k) => CONVERTER_ROUTES[k]);
  const sameFamily = Object.keys(CONVERTER_ROUTES).filter((k) => k !== route && !related.includes(k) && (k.startsWith(`${fromKey}-to-`) || k.startsWith(`${toKey}-to-`) || k.endsWith(`-to-${fromKey}`) || k.endsWith(`-to-${toKey}`))).slice(0, 4);
  const relatedLinks = [...related, ...sameFamily].map((k) => `    <a href="/time/${k}">${esc(CONVERTER_ROUTES[k].title.replace(" Time Converter", ""))}</a>`).join("\n");

  const li = (a) => (a || []).map((x) => `      <li>${esc(x)}</li>`).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(metaDesc)}">
  <meta name="keywords" content="${esc(keywords)}">
  <meta name="author" content="GeoSyncX Team">
  <link rel="canonical" href="${url}">

  <meta property="og:title" content="${esc(r.title)} - GeoSyncX">
  <meta property="og:description" content="${esc(`${fromLabel} to ${toLabel} time difference and live converter. ${headline}.`)}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${SITE}/android-chrome-512x512.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" href="/favicon-32x32.png">
  <meta name="theme-color" content="#0b1220">
  ${THEME_INIT}

  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6118286051054894" crossorigin="anonymous"></script>

  <script type="application/ld+json">
${jsonLd({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: r.title,
    description: `${r.subtitle}. ${r.description}`,
    url,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Organization", name: "GeoSyncX" },
  })}
  </script>

  <script type="application/ld+json">
${jsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  })}
  </script>

  <script type="application/ld+json">
${jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Command Center", item: `${SITE}/command-center` },
      { "@type": "ListItem", position: 2, name: "Time Converters", item: `${SITE}/time/ist-to-london` },
      { "@type": "ListItem", position: 3, name: r.title, item: url },
    ],
  })}
  </script>

  <link rel="stylesheet" href="/css/site.css">
</head>
<body>
<div class="wrap">
${siteHeader()}

  <main class="main" id="main" tabindex="-1">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/command-center">Command Center</a> / <a href="/time/ist-to-london">Time Converters</a> / ${esc(r.shortTitle)}</nav>

    <h1>${esc(codeF)} to ${esc(codeT)} <span>Time Converter</span>${hasLondon ? ` <span style="font-size:.5em;color:var(--muted);font-weight:500">(${esc(fromLabel)} to ${esc(toLabel)})</span>` : ""}</h1>
    <p class="quick">${esc(answer)}</p>
    <p class="lead">${esc(r.subtitle)}. ${esc(headline)}. Use the live ${esc(fromLabel)} to ${esc(toLabel)} converter below or open the full <a href="/command-center">Command Center</a> to compare more cities.</p>

    <div class="info-grid">
      <div class="info-card"><strong>Time difference</strong><span>${esc(hasDST ? `${hoursText(wDiff)} / ${hoursText(sDiff)} (summer)` : hoursText(wDiff))}</span></div>
      <div class="info-card"><strong>${esc(fromLabel)}</strong><span>${esc(r.fromGMT)} (${esc(r.fromZone)})</span></div>
      <div class="info-card"><strong>${esc(toLabel)}</strong><span>${esc(r.toGMT)} (${esc(r.toZone)})</span></div>
      <div class="info-card"><strong>Daylight saving</strong><span>${hasDST ? "Changes the gap" : "No change"}</span></div>
    </div>

    <section class="converter-widget" id="live-converter" aria-labelledby="conv-h">
      <h2 id="conv-h">Live ${esc(F.code)} to ${esc(T.code)} converter</h2>
      <div class="conv-inputs">
        <div class="conv-field">
          <label for="from-date">Date</label>
          <input type="date" id="from-date" class="conv-date-input" />
        </div>
        <div class="conv-field">
          <label for="from-time">Your time in ${esc(fromLabel)}</label>
          <input type="time" id="from-time" class="conv-time-input" />
        </div>
      </div>
      <div class="conv-table-wrap">
        <table class="conv-table">
          <thead><tr><th scope="col">City</th><th scope="col">Current</th><th scope="col">Equivalent Time</th></tr></thead>
          <tbody>
            <tr>
              <td><span class="conv-city">${esc(fromLabel)}</span><span class="conv-primary">Primary</span>
                <div class="conv-sub">${esc(r.fromZone)}</div><span class="conv-chip">${esc(r.fromGMT)}</span></td>
              <td><div class="conv-time" id="from-now">—</div><div class="conv-date" id="from-now-date"></div></td>
              <td><div class="conv-time" id="from-eq">—</div><div class="conv-date" id="from-eq-date"></div></td>
            </tr>
            <tr>
              <td><span class="conv-city">${esc(toLabel)}</span>
                <div class="conv-sub">${esc(r.toZone)}</div><span class="conv-chip">${esc(r.toGMT)}</span></td>
              <td><div class="conv-time" id="to-now">—</div><div class="conv-date" id="to-now-date"></div></td>
              <td><div class="conv-time" id="to-eq">—</div><div class="conv-date" id="to-eq-date"></div></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="conv-note">Pick a ${esc(fromLabel)} time above. Daylight saving is applied for the chosen date.</p>
    </section>
    <script>
    (function () {
      var FROM = ${JSON.stringify(r.fromZone)}, TO = ${JSON.stringify(r.toZone)};
      var $ = function (id) { return document.getElementById(id); };
      function fmtTime(d, tz) { return new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true }).format(d); }
      function fmtDate(d, tz) { return new Intl.DateTimeFormat('en-GB', { timeZone: tz, day: '2-digit', month: 'short' }).format(d); }
      function ymd(d, tz) { return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(d); }
      function abbr(tz, d) {
        var p = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'short' }).formatToParts(d || new Date());
        for (var i = 0; i < p.length; i++) if (p[i].type === 'timeZoneName') return p[i].value;
        return tz;
      }
      // Offset (ms) of tz at instant ts, derived from the zone's wall-clock parts.
      function offset(tz, ts) {
        var p = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).formatToParts(new Date(ts));
        var v = {}; p.forEach(function (x) { v[x.type] = +x.value; });
        return Date.UTC(v.year, v.month - 1, v.day, v.hour, v.minute, v.second) - Math.floor(ts / 1000) * 1000;
      }
      // Wall-clock time in tz -> UTC instant (two passes handles DST edges).
      function toUtc(y, mo, d, h, mi, tz) {
        var guess = Date.UTC(y, mo, d, h, mi);
        guess -= offset(tz, guess);
        guess = Date.UTC(y, mo, d, h, mi) - offset(tz, guess);
        return new Date(guess);
      }
      function split(d, tz) {
        var p = fmtTime(d, tz).split(' ');
        return '<span>' + p[0] + '</span> <span class="conv-ampm">' + (p[1] || '') + '</span>';
      }
      function show(id, d, tz, extra) {
        $(id).innerHTML = split(d, tz);
        $(id + '-date').innerHTML = fmtDate(d, tz) + ' ' + abbr(tz, d) + (extra || '');
      }
      // Default to "now" in the source zone so the Equivalent Time column is filled on load.
      var now0 = new Date();
      $('from-date').value = ymd(now0, FROM);
      $('from-time').value = new Intl.DateTimeFormat('en-GB', { timeZone: FROM, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now0);
      function convert() {
        var t = $('from-time').value, dt = $('from-date').value;
        if (!t || !dt) { ['from-eq', 'to-eq'].forEach(function (k) { $(k).textContent = '\u2014'; $(k + '-date').textContent = ''; }); return; }
        var tp = t.split(':'), dp = dt.split('-');
        var utc = toUtc(+dp[0], +dp[1] - 1, +dp[2], +tp[0], +tp[1], FROM);
        var diff = Math.round((Date.parse(ymd(utc, TO)) - Date.parse(ymd(utc, FROM))) / 864e5);
        show('from-eq', utc, FROM);
        var badge = diff ? ' <span class="conv-badge' + (diff < 0 ? ' neg' : '') + '">' + (diff > 0 ? '+' : '') + diff + 'd</span>' : '';
        show('to-eq', utc, TO, badge);
      }
      $('from-time').addEventListener('input', convert);
      $('from-date').addEventListener('input', convert);
      function tick() {
        var n = new Date();
        show('from-now', n, FROM);
        show('to-now', n, TO);
      }
      convert();
      tick(); setInterval(tick, 1000);
    })();
    </script>

    <div style="text-align:center;margin:8px 0 0"><a class="cta" href="/command-center?primary=${encodeURIComponent(r.fromZone).replace(/%2F/g, "/")}&amp;add=${encodeURIComponent(r.toZone).replace(/%2F/g, "/")}">Compare ${esc(fromLabel)}, ${esc(toLabel)} &amp; more in the Command Center →</a></div>

    <h2>${esc(fromLabel)} to ${esc(toLabel)} time difference</h2>
    <p>${esc(r.description)}</p>
    <p>${esc(F.code)} to ${esc(T.code)}: <strong>${esc(wLine)}</strong>${hasDST ? ` in winter, and <strong>${esc(sLine)}</strong> in summer` : " all year round"}.</p>
    ${r.dstNote ? `<p>${esc(r.dstNote)}</p>` : ""}

    <h2>${esc(fromLabel)} time to ${esc(hasLondon ? `${toLabel} / UK` : toLabel)} time chart</h2>
    <p>Quick reference for converting ${esc(F.code)} to ${esc(T.code)}${hasDST ? ` (winter vs summer, using ${WINTER} and ${SUMMER})` : ""}.</p>
    <table>
      <thead><tr><th>${esc(fromLabel)} (${esc(F.code)})</th><th>${esc(toLabel)}${hasDST ? " (winter)" : ""}</th>${hasDST ? `<th>${esc(toLabel)} (summer)</th>` : ""}</tr></thead>
      <tbody>
${tableRows}
      </tbody>
    </table>

    <h2>Best time to call: ${esc(toLabel)} timing from ${esc(fromLabel)}</h2>
    <div class="highlight-box">
      <p>${esc(r.bestTimes || "Pick a window where both locations are inside 9 AM - 6 PM local time.")}</p>
    </div>
${r.tips ? `    <h3>Tips</h3>\n    <ul>\n${li(r.tips)}\n    </ul>` : ""}

${r.useCases ? `    <h2>Who uses ${esc(F.code)} to ${esc(T.code)} conversion</h2>\n    <ul>\n${li(r.useCases)}\n    </ul>` : ""}

    <h2>Frequently asked questions</h2>
    <div class="faq">
${faq.map(([q, a]) => `      <details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n")}
    </div>

    <h2>Related time converters</h2>
    <div class="related-links">
${relatedLinks}
    </div>

    <p class="also"><strong>Also searched as:</strong> ${esc([...kw].filter((k) => k !== "timezone converter").slice(0, 10).join(" · "))}.</p>
  </main>

${siteFooter(YEAR)}
</div>
<script src="/js/site.js" defer></script>
</body>
</html>
`;
}

// ---------- run ----------
mkdirSync(OUT, { recursive: true });
const routes = Object.keys(CONVERTER_ROUTES);
for (const route of routes) writeFileSync(join(OUT, `${route}.html`), page(route, CONVERTER_ROUTES[route]));

// ---------- sitemap ----------
const smPath = join(ROOT, "public", "sitemap.xml");
let sm = readFileSync(smPath, "utf8");
sm = sm.replace(/\s*<!-- Time converters \(generated\) -->[\s\S]*?<!-- \/Time converters -->/, "");
const prio = (k) => (k.startsWith("ist-to-") || k.endsWith("-to-ist") || k.includes("london") ? "0.9" : "0.7");
const block = `
  <!-- Time converters (generated) -->
${routes.map((k) => `  <url>
    <loc>${SITE}/time/${k}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${prio(k)}</priority>
  </url>
`).join("\n")}  <!-- /Time converters -->
`;
sm = sm.replace("</urlset>", `${block}</urlset>`);
writeFileSync(smPath, sm);

console.log(`Generated ${routes.length} converter pages and updated sitemap.`);
