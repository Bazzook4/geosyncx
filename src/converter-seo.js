// /src/converter-seo.js
// Single source for the SEO text on /time/* converter pages. Used by:
//   - scripts/generate-converter-pages.mjs (prerenders it into dist/time/*.html for crawlers)
//   - src/ConverterPage.jsx (renders the same text around the live Command Center)
// Offsets, conversion tables and DST facts are computed with luxon so they can't drift from the route data.
import { DateTime } from "luxon";
import { CONVERTER_ROUTES } from "./converter-routes.js";

export const SITE = "https://www.geosyncx.com";

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
  bst: { code: "BST", names: ["BST", "British Summer Time", "UK summer time", "UK time"] },
  cet: { code: "CET", names: ["CET", "CEST", "Paris", "Berlin", "Central European time"] },
  toronto: { code: "Toronto", names: ["Toronto", "Canada", "Eastern time", "EST"] },
  tokyo: { code: "Tokyo", names: ["Tokyo", "Japan", "JST", "Japan time"] },
  hongkong: { code: "Hong Kong", names: ["Hong Kong", "HKT", "Hong Kong time"] },
};

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const offsetMin = (zone, iso) => DateTime.fromISO(iso, { zone }).offset;
const fmtHM = (dt) => dt.toFormat("h:mm a");
function hoursText(min) {
  const abs = Math.abs(min) / 60;
  return `${Number.isInteger(abs) ? abs : abs.toFixed(1)} hour${abs === 1 ? "" : "s"}`;
}
function diffPhrase(m, fromLabel, toLabel) {
  if (m === 0) return `${toLabel} and ${fromLabel} are on the same time`;
  return `${toLabel} is ${hoursText(m)} ${m > 0 ? "ahead of" : "behind"} ${fromLabel}`;
}

function convertTable(r, day, step) {
  const rows = [];
  for (let m = 0; m < 24 * 60; m += step) rows.push(m);
  return rows.map((mins) => {
    const from = DateTime.fromISO(day, { zone: r.fromZone }).set({ hour: Math.floor(mins / 60), minute: mins % 60 });
    const to = from.setZone(r.toZone);
    const dayDiff = Math.round(to.startOf("day").diff(from.startOf("day"), "days").days);
    return {
      from: fmtHM(from),
      from24: from.toFormat("HH:mm"),
      to: fmtHM(to),
      note: dayDiff === 0 ? "" : dayDiff > 0 ? " (next day)" : " (previous day)",
    };
  });
}

const keyOf = (route, side) => {
  const [a, b] = route.split("-to-");
  return side === "from" ? a : b;
};

export function buildConverterSeo(route) {
  const r = CONVERTER_ROUTES[route];
  if (!r) return null;

  const YEAR = new Date().getFullYear();
  // Jan / Jul reference days of the current year to show winter vs summer behaviour.
  const WINTER = `${YEAR}-01-15`;
  const SUMMER = `${YEAR}-07-15`;

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

  const wDiff = offsetMin(r.toZone, WINTER) - offsetMin(r.fromZone, WINTER);
  const sDiff = offsetMin(r.toZone, SUMMER) - offsetMin(r.fromZone, SUMMER);
  const hasDST = wDiff !== sDiff;
  const wLine = diffPhrase(wDiff, fromLabel, toLabel);
  const sLine = diffPhrase(sDiff, fromLabel, toLabel);
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
  if (hasLondon) {
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
  const ogDesc = `${fromLabel} to ${toLabel} time difference and live converter. ${headline}.`;

  // FAQ, written around real search questions
  const nineFrom = DateTime.fromISO(WINTER, { zone: r.fromZone }).set({ hour: 9, minute: 0 });
  const nineSummer = DateTime.fromISO(SUMMER, { zone: r.fromZone }).set({ hour: 9, minute: 0 });
  const nineTo = nineFrom.setZone(r.toZone);
  const nineToS = nineSummer.setZone(r.toZone);
  const faq = [
    [`What is the time difference between ${fromLabel} and ${toLabel}?`, `${headline}. ${r.description}`],
    [
      `What time is it in ${toLabel} when it is 9:00 AM in ${fromLabel}?`,
      hasDST
        ? `When it is 9:00 AM in ${fromLabel}, it is ${fmtHM(nineTo)} in ${toLabel} in winter and ${fmtHM(nineToS)} in summer.`
        : `When it is 9:00 AM in ${fromLabel}, it is ${fmtHM(nineTo)} in ${toLabel}.`,
    ],
    [
      `What is the best time for a call between ${fromLabel} and ${toLabel}?`,
      r.bestTimes || `Pick a window where both sides fall within 9 AM - 6 PM; use the GeoSyncX Best Meeting Time finder to find it automatically.`,
    ],
    [
      `Does the ${F.code} to ${T.code} difference change during the year?`,
      r.dstNote || (hasDST ? `Yes. Daylight saving changes shift the gap between ${wDiff / 60} and ${sDiff / 60} hours.` : `No. The difference is constant all year.`),
    ],
  ];
  for (const h of [14, 18]) {
    const w = DateTime.fromISO(WINTER, { zone: r.fromZone }).set({ hour: h, minute: 0 });
    const su = DateTime.fromISO(SUMMER, { zone: r.fromZone }).set({ hour: h, minute: 0 });
    faq.push([
      `What is ${fmtHM(w).replace(":00", "")} ${F.code} in ${codeT} time?`,
      hasDST
        ? `${fmtHM(w)} ${F.code} is ${fmtHM(w.setZone(r.toZone))} in ${toLabel} in winter and ${fmtHM(su.setZone(r.toZone))} in summer.`
        : `${fmtHM(w)} ${F.code} is ${fmtHM(w.setZone(r.toZone))} in ${toLabel}.`,
    ]);
  }
  if (fromKey === "ist" || toKey === "ist") {
    faq.push([`What is the IST offset?`, `India Standard Time (IST) is UTC+5:30 (IANA zone Asia/Kolkata). India does not observe daylight saving time, so IST never changes.`]);
  }
  if (hasLondon) {
    faq.push([`What is London time?`, `London uses Greenwich Mean Time (GMT, UTC+0) in winter and British Summer Time (BST, UTC+1) from the last Sunday of March to the last Sunday of October.`]);
  }

  const step = fromKey === "ist" || fromKey === "gmt" ? 30 : 60;
  const wTable = convertTable(r, WINTER, step);
  const sTable = convertTable(r, SUMMER, step);
  const tableRows = wTable
    .map((w, i) => `        <tr><td>${w.from} <span class="h24">(${w.from24})</span></td><td>${w.to}${w.note}</td>${hasDST ? `<td>${sTable[i].to}${sTable[i].note}</td>` : ""}</tr>`)
    .join("\n");

  const related = (r.relatedRoutes || []).filter((k) => CONVERTER_ROUTES[k]);
  const sameFamily = Object.keys(CONVERTER_ROUTES)
    .filter((k) => k !== route && !related.includes(k) && (k.startsWith(`${fromKey}-to-`) || k.startsWith(`${toKey}-to-`) || k.endsWith(`-to-${fromKey}`) || k.endsWith(`-to-${toKey}`)))
    .slice(0, 4);
  const relatedLinks = [...related, ...sameFamily]
    .map((k) => `      <a href="/time/${k}">${esc(CONVERTER_ROUTES[k].title.replace(" Time Converter", ""))}</a>`)
    .join("\n");

  const li = (a) => (a || []).map((x) => `      <li>${esc(x)}</li>`).join("\n");

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: r.title,
      description: `${r.subtitle}. ${r.description}`,
      url,
      applicationCategory: "UtilityApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: { "@type": "Organization", name: "GeoSyncX" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Command Center", item: `${SITE}/command-center` },
        { "@type": "ListItem", position: 2, name: "Time Converters", item: `${SITE}/time/ist-to-london` },
        { "@type": "ListItem", position: 3, name: r.title, item: url },
      ],
    },
  ];

  // ----- HTML blocks. `top` sits above the live tool, `rest` below it. -----
  const top = `    <nav class="crumbs" aria-label="Breadcrumb"><a href="/command-center">Command Center</a> / <a href="/time/ist-to-london">Time Converters</a> / ${esc(r.shortTitle)}</nav>
    <h1>${esc(codeF)} to ${esc(codeT)} <span>Time Converter</span>${hasLondon ? ` <small>(${esc(fromLabel)} to ${esc(toLabel)})</small>` : ""}</h1>
    <p class="quick">${esc(answer)}</p>
    <p class="lead">${esc(r.subtitle)}. ${esc(headline)}. Use the live ${esc(fromLabel)} to ${esc(toLabel)} converter below, and add more cities to compare them side by side.</p>`;

  const rest = `    <div class="info-grid">
      <div class="info-card"><strong>Time difference</strong><span>${esc(hasDST ? `${hoursText(wDiff)} / ${hoursText(sDiff)} (summer)` : hoursText(wDiff))}</span></div>
      <div class="info-card"><strong>${esc(fromLabel)}</strong><span>${esc(r.fromGMT)} (${esc(r.fromZone)})</span></div>
      <div class="info-card"><strong>${esc(toLabel)}</strong><span>${esc(r.toGMT)} (${esc(r.toZone)})</span></div>
      <div class="info-card"><strong>Daylight saving</strong><span>${hasDST ? "Changes the gap" : "No change"}</span></div>
    </div>

    <h2>${esc(fromLabel)} to ${esc(toLabel)} time difference</h2>
    <p>${esc(r.description)}</p>
    <p>${esc(F.code)} to ${esc(T.code)}: <strong>${esc(wLine)}</strong>${hasDST ? ` in winter, and <strong>${esc(sLine)}</strong> in summer` : " all year round"}.</p>
    ${r.dstNote ? `<p>${esc(r.dstNote)}</p>` : ""}

    <h2>${esc(fromLabel)} time to ${esc(hasLondon ? `${toLabel} / UK` : toLabel)} time chart</h2>
    <p>Quick reference for converting ${esc(F.code)} to ${esc(T.code)}${hasDST ? ` (winter vs summer, using ${WINTER} and ${SUMMER})` : ""}.</p>
    <div class="table-scroll">
    <table>
      <thead><tr><th>${esc(fromLabel)} (${esc(F.code)})</th><th>${esc(toLabel)}${hasDST ? " (winter)" : ""}</th>${hasDST ? `<th>${esc(toLabel)} (summer)</th>` : ""}</tr></thead>
      <tbody>
${tableRows}
      </tbody>
    </table>
    </div>

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

    <p class="also"><strong>Also searched as:</strong> ${esc([...kw].filter((k) => k !== "timezone converter").slice(0, 10).join(" · "))}.</p>`;

  return {
    route,
    url,
    title,
    metaDesc,
    keywords,
    ogTitle: `${r.title} - GeoSyncX`,
    ogDesc,
    schema,
    top,
    rest,
    // The two zones the live tool opens with
    fromZone: r.fromZone,
    toZone: r.toZone,
  };
}

export const CONVERTER_ROUTE_KEYS = Object.keys(CONVERTER_ROUTES);
