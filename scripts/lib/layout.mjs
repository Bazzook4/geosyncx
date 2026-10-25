// Shared header / footer for every generated static page.
// Mirrors the Command Center nav (AppRouter.jsx) and Footer.jsx. Styles live in public/css/site.css.
export const SITE = "https://www.geosyncx.com";
export const ADSENSE = `<!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6118286051054894" crossorigin="anonymous"></script>`;

export const siteHeader = () => `
  <header class="site-header">
    <div class="site-left">
      <a href="/" class="site-logo">GeoSyncX</a>
      <nav class="site-nav" aria-label="Main">
        <a class="cc" href="/command-center">Command Center</a>
        <span class="sep tools"></span>
        <a class="tools" href="/tools/phone-code-lookup">Phone Lookup</a>
        <a class="tools" href="/tools/formatter">Formatter</a>
      </nav>
    </div>
  </header>
`;

export const siteFooter = (year) => `
  <footer class="site-footer">
    <div class="footer-in">
      <div class="footer-grid">
        <div><h3>Tools</h3>
          <a href="/command-center">Command Center</a>
          <a href="/tools/phone-code-lookup">Phone Code Lookup</a>
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
      <div class="footer-bottom">© ${year} GeoSyncX. Free timezone tools for global teams. Conversions use the IANA timezone database.</div>
    </div>
  </footer>
`;

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const jsonLd = (o) => `  <script type="application/ld+json">\n${JSON.stringify(o, null, 2).replace(/</g, "\\u003c")}\n  </script>`;

export function pageShell({ title, description, path, schema, body, scripts = "" }, year) {
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

${siteFooter(year)}
</div>
${scripts}
</body>
</html>
`;
}
