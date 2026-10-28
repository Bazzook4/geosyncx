// Shared header / footer for every generated static page.
// Mirrors the Command Center nav (AppRouter.jsx) and Footer.jsx. Styles live in public/css/site.css.
export const SITE = "https://www.geosyncx.com";
export const ADSENSE = `<!-- Google AdSense -->
  <meta name="google-adsense-account" content="ca-pub-6118286051054894">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6118286051054894" crossorigin="anonymous"></script>`;

// Applies the saved theme before first paint. Shares the "darkMode" key with the React app, so the
// choice carries across Command Center and these pages. Falls back to the OS preference.
export const THEME_INIT = `<script>(function(){var d=true;try{var s=localStorage.getItem('darkMode');d=s===null?!(window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches):s==='true'}catch(e){}var c=document.documentElement.classList;c.toggle('dark',d);c.toggle('light',!d)})()</script>`;

const NAV = [
  ["/tools/formatter", "Formatter"],
];

// Same header as AppRouter.jsx: logo, Command Center pill, tool links, theme toggle, feedback;
// plus the scrollable link row used on phones. `current` is the active nav href, if any.
export const siteHeader = (current = "") => `
  <a href="#main" class="skip-link">Skip to content</a>
  <header class="site-header">
    <div class="site-top">
      <div class="site-left">
        <a href="/" class="site-logo">GeoSyncX</a>
        <nav class="site-nav" aria-label="Main">
          <a class="cc" href="/command-center">Command Center</a>
          <span class="sep"></span>
${NAV.map(([h, l]) => `          <a href="${h}"${current === h ? ' aria-current="page"' : ""}>${l}</a>`).join("\n")}
        </nav>
      </div>
      <div class="site-actions">
        <button type="button" class="theme-toggle" id="theme-toggle" aria-label="Switch theme" title="Switch theme"><span aria-hidden="true" id="theme-icon">🌞</span></button>
        <a class="feedback" href="mailto:hello@geosyncx.com?subject=GeoSyncX%20Feedback">Feedback</a>
      </div>
    </div>
    <nav class="site-nav-m" aria-label="Main (mobile)">
      <ul>
        <li><a class="cc" href="/command-center">Command Center</a></li>
${NAV.map(([h, l]) => `        <li><a href="${h}"${current === h ? ' aria-current="page"' : ""}>${l}</a></li>`).join("\n")}
      </ul>
    </nav>
  </header>
`;

export const siteFooter = (year) => `
  <footer class="site-footer">
    <div class="footer-in">
      <div class="footer-grid">
        <div><h3>Tools</h3>
          <a href="/command-center">Command Center</a>
          <a href="/tools/formatter">JSON / XML Formatter</a>
        </div>
        <div><h3>Time Converters</h3>
          <a href="/time/ist-to-london">IST to London</a>
          <a href="/time/ist-to-est">IST to EST</a>
          <a href="/time/ist-to-pst">IST to PST</a>
          <a href="/time/est-to-pst">EST to PST</a>
          <a href="/time/london-to-ist">London to IST</a>
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
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Use</a>
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
  ${THEME_INIT}

  ${ADSENSE}

${schema.map(jsonLd).join("\n\n")}

  <link rel="stylesheet" href="/css/site.css">
</head>
<body>
<div class="wrap">
${siteHeader()}

  <main class="main" id="main" tabindex="-1">
${body}
  </main>

${siteFooter(year)}
</div>
<script src="/js/site.js" defer></script>
${scripts}
</body>
</html>
`;
}
