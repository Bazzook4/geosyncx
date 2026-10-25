// Prerenders the /time/* converter pages into dist/time/ and refreshes the /time/ block of the sitemap.
//
//   vite build && node scripts/generate-converter-pages.mjs
//
// Each page is the app's own index.html (same hashed JS/CSS) plus the SEO text, head tags and JSON-LD
// already in the HTML, so crawlers read the full page without running JavaScript. When the bundle loads,
// React replaces the root with the real Command Center opened on the pair, around the same SEO text
// (src/ConverterPage.jsx, both built from src/converter-seo.js). Head tags carry data-rh so
// react-helmet-async swaps them instead of duplicating them.
import { mkdirSync, readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildConverterSeo, CONVERTER_ROUTE_KEYS, SITE, esc } from "../src/converter-seo.js";
import { THEME_INIT, ADSENSE } from "./lib/layout.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const OUT = join(DIST, "time");
const TODAY = new Date().toISOString().slice(0, 10);

const indexPath = join(DIST, "index.html");
if (!existsSync(indexPath)) {
  console.error("dist/index.html not found. Run `vite build` first.");
  process.exit(1);
}

// Hashed bundle tags (module script, modulepreload, stylesheet) from the built index.html.
const built = readFileSync(indexPath, "utf8");
const assetTags = (built.match(/<(?:script type="module"|link rel="(?:stylesheet|modulepreload)")[^>]*>(?:<\/script>)?/g) || []).join("\n  ");
if (!assetTags.includes("/assets/")) {
  console.error("Could not find the bundle tags in dist/index.html.");
  process.exit(1);
}

const jsonLd = (o) => JSON.stringify(o, null, 2).replace(/</g, "\\u003c");

function page(route) {
  const seo = buildConverterSeo(route);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(seo.title)}</title>
  <meta name="description" content="${esc(seo.metaDesc)}" data-rh="true">
  <meta name="keywords" content="${esc(seo.keywords)}" data-rh="true">
  <meta name="author" content="GeoSyncX Team">
  <link rel="canonical" href="${seo.url}" data-rh="true">

  <meta property="og:title" content="${esc(seo.ogTitle)}" data-rh="true">
  <meta property="og:description" content="${esc(seo.ogDesc)}" data-rh="true">
  <meta property="og:url" content="${seo.url}" data-rh="true">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${SITE}/android-chrome-512x512.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" href="/favicon-32x32.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#0b1220">
  ${THEME_INIT}
  <style>html.dark body{background:#020617;color:#f1f5f9}html.light body{background:#f8fafc;color:#0f172a}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}</style>

  ${ADSENSE}

${seo.schema.map((s) => `  <script type="application/ld+json" data-rh="true">\n${jsonLd(s)}\n  </script>`).join("\n\n")}

  ${assetTags}
</head>
<body class="antialiased">
<div id="root"><div class="seo-prerender">
  <nav class="pre-nav" aria-label="Main">
    <a class="pre-logo" href="/">GeoSyncX</a>
    <a href="/command-center">Command Center</a>
    <a href="/tools/phone-code-lookup">Phone Lookup</a>
    <a href="/tools/formatter">Formatter</a>
    <a href="/tools/live-board">Live Board</a>
    <a href="/blog">Blog</a>
    <a href="/about">About</a>
  </nav>
  <div class="seo-content">
${seo.top}
${seo.rest}
  </div>
</div></div>
<noscript>The live converter needs JavaScript. The time difference, conversion chart and FAQ above work without it.</noscript>
</body>
</html>
`;
}

mkdirSync(OUT, { recursive: true });
for (const route of CONVERTER_ROUTE_KEYS) writeFileSync(join(OUT, `${route}.html`), page(route));

// ---------- sitemap ----------
const smPath = join(ROOT, "public", "sitemap.xml");
let sm = readFileSync(smPath, "utf8");
sm = sm.replace(/\s*<!-- Time converters \(generated\) -->[\s\S]*?<!-- \/Time converters -->/, "");
const prio = (k) => (k.startsWith("ist-to-") || k.endsWith("-to-ist") || k.includes("london") ? "0.9" : "0.7");
const block = `
  <!-- Time converters (generated) -->
${CONVERTER_ROUTE_KEYS.map((k) => `  <url>
    <loc>${SITE}/time/${k}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${prio(k)}</priority>
  </url>
`).join("\n")}  <!-- /Time converters -->
`;
sm = sm.replace("</urlset>", `${block}</urlset>`);
writeFileSync(smPath, sm);
copyFileSync(smPath, join(DIST, "sitemap.xml"));

console.log(`Prerendered ${CONVERTER_ROUTE_KEYS.length} converter pages into dist/time and updated the sitemap.`);
