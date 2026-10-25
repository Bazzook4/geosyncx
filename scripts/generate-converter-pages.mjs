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

  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',sans-serif;color:#f1f5f9;background:linear-gradient(135deg,#020617 0%,#0f172a 50%,#020617 100%);min-height:100vh;line-height:1.7}
    a{color:#38bdf8}
    .wrap{padding:24px 16px 0}
    .main{max-width:900px;margin:0 auto}
    /* Header: same as Command Center */
    .site-header{max-width:1152px;margin:0 auto 32px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .site-left{display:flex;align-items:center;gap:20px;flex-wrap:wrap}
    .site-logo{font-size:1.75rem;font-weight:700;color:#f1f5f9;text-decoration:none;letter-spacing:-0.02em}
    .site-logo:hover{color:#0ea5e9}
    .site-nav{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .site-nav a{background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.8);padding:6px 12px;border-radius:8px;font-size:0.875rem;text-decoration:none;transition:background .2s}
    .site-nav a:hover{background:rgba(255,255,255,0.2);color:#fff}
    .site-nav a.cc{background:linear-gradient(90deg,#0ea5e9,#6366f1);color:#fff;font-weight:600;padding:8px 16px;border-radius:12px;box-shadow:0 8px 20px rgba(14,165,233,.25)}
    .site-nav .sep{width:1px;height:24px;background:rgba(255,255,255,0.2)}
    .crumbs{font-size:.85rem;color:#94a3b8;margin-bottom:16px}
    .crumbs a{color:#94a3b8;text-decoration:none}
    .crumbs a:hover{color:#38bdf8}
    h1{font-size:2.25rem;color:#f1f5f9;margin-bottom:12px;line-height:1.2;font-weight:700}
    h1 span{color:#38bdf8}
    h2{font-size:1.5rem;color:#f1f5f9;margin-top:44px;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.1)}
    h3{font-size:1.15rem;color:#cbd5e1;margin-top:24px;margin-bottom:10px}
    p{margin-bottom:16px;color:#cbd5e1}
    .lead{font-size:1.15rem;color:#e2e8f0;margin-bottom:24px;line-height:1.6}
    .card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px}
    .info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:24px 0}
    .info-card{background:rgba(255,255,255,0.05);padding:16px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);border-left:3px solid #0ea5e9}
    .info-card strong{display:block;color:#38bdf8;font-size:.75rem;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
    .info-card span{font-size:1rem;color:#f1f5f9;font-weight:600}
    table{width:100%;border-collapse:collapse;margin:16px 0;background:rgba(255,255,255,0.03);border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.1)}
    th{background:#0ea5e9;color:#fff;padding:12px 16px;text-align:left;font-weight:600;font-size:.9rem}
    td{padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.07);color:#cbd5e1;font-size:.95rem}
    tr:last-child td{border-bottom:none}
    tr:nth-child(even){background:rgba(255,255,255,0.03)}
    ul{margin:12px 0 16px;padding-left:24px}
    li{margin:8px 0;color:#cbd5e1}
    li::marker{color:#0ea5e9}
    .highlight-box{background:rgba(14,165,233,0.1);border-left:4px solid #0ea5e9;padding:20px;border-radius:12px;margin:20px 0}
    .highlight-box p:last-child{margin-bottom:0}
    .cta{display:inline-block;background:linear-gradient(90deg,#0ea5e9,#6366f1);color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;box-shadow:0 8px 20px rgba(14,165,233,.3);transition:transform .2s}
    .cta:hover{transform:translateY(-2px)}
    .faq details{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px 18px;margin-bottom:10px}
    .faq summary{cursor:pointer;font-weight:600;color:#f1f5f9}
    .faq details p{margin:10px 0 0}
    .related-links{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:16px 0}
    .related-links a{background:rgba(255,255,255,0.05);padding:14px;border-radius:10px;text-decoration:none;color:#38bdf8;font-weight:500;border:1px solid rgba(255,255,255,0.1);transition:all .2s}
    .related-links a:hover{border-color:#0ea5e9;background:rgba(14,165,233,0.1)}
    .also{font-size:.9rem;color:#94a3b8}
    .h24{color:#64748b;font-size:.85rem}
    .quick{background:rgba(14,165,233,0.1);border-left:4px solid #0ea5e9;padding:14px 18px;border-radius:12px;margin:0 0 24px;color:#e2e8f0;font-weight:600}
    /* Live converter */
    .converter-widget{background:rgba(14,165,233,0.07);border:1px solid rgba(14,165,233,0.25);border-radius:16px;padding:24px;margin:28px 0}
    .converter-grid{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px}
    .conv-col{display:flex;flex-direction:column;gap:8px}
    .conv-label{font-size:1rem;font-weight:700}
    .conv-zone-badge{font-size:.75rem;background:rgba(14,165,233,0.2);color:#38bdf8;padding:2px 10px;border-radius:20px;width:fit-content}
    .conv-time-input,.conv-date-input{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);color:#f1f5f9;padding:10px 14px;border-radius:10px;font-size:1rem;width:100%;outline:none;color-scheme:dark}
    .conv-time-input:focus,.conv-date-input:focus{border-color:#0ea5e9}
    .conv-result{font-size:2rem;font-weight:700;color:#38bdf8;min-height:2.5rem}
    .conv-result-date{font-size:.85rem;color:#94a3b8;min-height:1.2rem}
    .conv-live{font-size:.8rem;color:#94a3b8}
    .conv-arrow{font-size:1.8rem;color:#0ea5e9;text-align:center;user-select:none}
    /* Footer: same columns as Footer.jsx */
    .site-footer{margin-top:64px;border-top:1px solid #1e293b;background:rgba(15,23,42,0.5);backdrop-filter:blur(4px)}
    .footer-in{max-width:1152px;margin:0 auto;padding:48px 16px 24px}
    .footer-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:32px;margin-bottom:32px}
    .footer-grid h3{font-size:.8rem;text-transform:uppercase;letter-spacing:.08em;color:#cbd5e1;margin:0 0 14px}
    .footer-grid a{display:block;font-size:.875rem;color:#94a3b8;text-decoration:none;margin-bottom:10px}
    .footer-grid a:hover{color:#38bdf8}
    .footer-bottom{padding-top:24px;border-top:1px solid #1e293b;font-size:.85rem;color:#94a3b8;text-align:center}
    @media(max-width:700px){h1{font-size:1.75rem}.converter-grid{grid-template-columns:1fr}.conv-arrow{transform:rotate(90deg)}.footer-grid{grid-template-columns:repeat(2,1fr)}.site-nav .tools{display:none}}
  </style>
</head>
<body>
<div class="wrap">
  <header class="site-header">
    <div class="site-left">
      <a href="/" class="site-logo">GeoSyncX</a>
      <nav class="site-nav" aria-label="Main">
        <a class="cc" href="/command-center">Command Center</a>
        <span class="sep tools"></span>
        <a class="tools" href="/tools/phone-code-lookup">Phone Lookup</a>
        <a class="tools" href="/tools/timezone-finder">Finder</a>
        <a class="tools" href="/tools/timezone-compare">Compare</a>
        <a class="tools" href="/tools/best-meeting-time">Best Time</a>
        <a class="tools" href="/tools/meeting-scheduler">Scheduler</a>
        <a class="tools" href="/tools/formatter">Formatter</a>
      </nav>
    </div>
  </header>

  <main class="main">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/command-center">Command Center</a> / <a href="/time/ist-to-london">Time Converters</a> / ${esc(r.shortTitle)}</nav>

    <h1>${esc(codeF)} to ${esc(codeT)} <span>Time Converter</span>${hasLondon ? ` <span style="font-size:.5em;color:#94a3b8;font-weight:500">(${esc(fromLabel)} to ${esc(toLabel)})</span>` : ""}</h1>
    <p class="quick">${esc(answer)}</p>
    <p class="lead">${esc(r.subtitle)}. ${esc(headline)}. Use the live ${esc(fromLabel)} to ${esc(toLabel)} converter below or open the full <a href="/command-center">Command Center</a> to compare more cities.</p>

    <div class="info-grid">
      <div class="info-card"><strong>Time difference</strong><span>${esc(hasDST ? `${hoursText(wDiff)} / ${hoursText(sDiff)} (summer)` : hoursText(wDiff))}</span></div>
      <div class="info-card"><strong>${esc(fromLabel)}</strong><span>${esc(r.fromGMT)} (${esc(r.fromZone)})</span></div>
      <div class="info-card"><strong>${esc(toLabel)}</strong><span>${esc(r.toGMT)} (${esc(r.toZone)})</span></div>
      <div class="info-card"><strong>Daylight saving</strong><span>${hasDST ? "Changes the gap" : "No change"}</span></div>
    </div>

    <div class="converter-widget" id="live-converter">
      <h2 style="margin:0 0 16px;border:none;padding:0">Live ${esc(F.code)} to ${esc(T.code)} converter</h2>
      <div class="converter-grid">
        <div class="conv-col">
          <div class="conv-label">${esc(fromLabel)}</div>
          <div class="conv-zone-badge" id="from-zone-badge"></div>
          <input type="time" id="from-time" class="conv-time-input" aria-label="${esc(fromLabel)} time" />
          <input type="date" id="from-date" class="conv-date-input" aria-label="${esc(fromLabel)} date" />
          <div class="conv-live" id="from-live"></div>
        </div>
        <div class="conv-arrow">⇄</div>
        <div class="conv-col">
          <div class="conv-label">${esc(toLabel)}</div>
          <div class="conv-zone-badge" id="to-zone-badge"></div>
          <div class="conv-result" id="to-result">—</div>
          <div class="conv-result-date" id="to-date"></div>
          <div class="conv-live" id="to-live"></div>
        </div>
      </div>
      <p style="text-align:center;font-size:.8rem;color:#94a3b8;margin:16px 0 0">Enter a ${esc(fromLabel)} time on the left. Daylight saving is applied for the chosen date.</p>
    </div>
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
      $('from-zone-badge').textContent = abbr(FROM);
      $('to-zone-badge').textContent = abbr(TO);
      $('from-date').value = ymd(new Date(), FROM);
      function convert() {
        var t = $('from-time').value, dt = $('from-date').value;
        if (!t || !dt) { $('to-result').textContent = '—'; $('to-date').textContent = ''; return; }
        var tp = t.split(':'), dp = dt.split('-');
        var utc = toUtc(+dp[0], +dp[1] - 1, +dp[2], +tp[0], +tp[1], FROM);
        var diff = Math.round((Date.parse(ymd(utc, TO)) - Date.parse(ymd(utc, FROM))) / 864e5);
        $('to-result').textContent = fmtTime(utc, TO);
        $('to-date').textContent = fmtDate(utc, TO) + ' ' + abbr(TO, utc) + (diff ? (diff > 0 ? ' (+' + diff + ' day)' : ' (' + diff + ' day)') : '');
      }
      $('from-time').addEventListener('input', convert);
      $('from-date').addEventListener('input', convert);
      function tick() {
        var n = new Date();
        $('from-live').textContent = 'Now: ' + fmtTime(n, FROM) + ', ' + fmtDate(n, FROM);
        $('to-live').textContent = 'Now: ' + fmtTime(n, TO) + ', ' + fmtDate(n, TO);
      }
      tick(); setInterval(tick, 1000);
    })();
    </script>

    <div style="text-align:center;margin:8px 0 0"><a class="cta" href="/command-center">Compare ${esc(fromLabel)}, ${esc(toLabel)} &amp; more in the Command Center →</a></div>

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

  <footer class="site-footer">
    <div class="footer-in">
      <div class="footer-grid">
        <div><h3>Tools</h3>
          <a href="/command-center">Command Center</a>
          <a href="/tools/phone-code-lookup">Phone Code Lookup</a>
          <a href="/tools/timezone-finder">Timezone Finder</a>
          <a href="/tools/timezone-compare">Timezone Compare</a>
          <a href="/tools/meeting-scheduler">Meeting Scheduler</a>
          <a href="/tools/best-meeting-time">Best Meeting Time</a>
        </div>
        <div><h3>Time Converters</h3>
          <a href="/time/ist-to-london">IST to London</a>
          <a href="/time/london-to-ist">London to IST</a>
          <a href="/time/ist-to-est">IST to EST</a>
          <a href="/time/ist-to-pst">IST to PST</a>
          <a href="/time/est-to-pst">EST to PST</a>
          <a href="/time/pst-to-ist">PST to IST</a>
        </div>
        <div><h3>Resources</h3>
          <a href="/blog/timezone-comparison-tool">Timezone Guide</a>
          <a href="/blog/best-meeting-time-finder">Meeting Time Finder</a>
          <a href="/blog/schedule-meeting-across-timezones">Calendar Guide</a>
          <a href="/blog/phone-code-timezone-search">Phone Code Guide</a>
          <a href="/blog">All Articles</a>
        </div>
        <div><h3>Company</h3>
          <a href="/">Home</a>
          <a href="/about">About / Our Story</a>
          <a href="mailto:hello@geosyncx.com">Contact Us</a>
        </div>
      </div>
      <div class="footer-bottom">© ${YEAR} GeoSyncX. Free timezone tools for global teams. Conversions use the IANA timezone database.</div>
    </div>
  </footer>
</div>
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
