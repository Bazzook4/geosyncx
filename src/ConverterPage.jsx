// /src/ConverterPage.jsx
// /time/:route pages: the real Command Center opened with the pair preloaded,
// wrapped in the SEO text (same text that is prerendered into dist/time/*.html for crawlers).
import { useMemo } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import App from "./App.jsx";
import { buildConverterSeo } from "./converter-seo.js";
import "./seo-content.css";

// "UTC" is not in the timezone list; Reykjavik is GMT+0 all year, so it shows as a normal row.
const displayZone = (z) => (z === "UTC" ? "Atlantic/Reykjavik" : z);

export default function ConverterPage({ darkMode }) {
  // Tolerate a trailing ".html" (static hosting / preview servers)
  const route = (useParams().route || "").replace(/\.html$/, "");
  const navigate = useNavigate();
  const seo = useMemo(() => buildConverterSeo(route), [route]);

  if (!seo) return <Navigate to="/" replace />;

  // Keep in-page links (related converters, breadcrumbs) client-side
  const onContentClick = (e) => {
    const a = e.target.closest?.("a");
    const href = a?.getAttribute("href");
    if (!a || !href || !href.startsWith("/") || a.target || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    navigate(href);
  };

  return (
    <>
      {/* data-rh tags in the prerendered head are replaced by these, so nothing is duplicated */}
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.metaDesc} />
        <meta name="keywords" content={seo.keywords} />
        <link rel="canonical" href={seo.url} />
        <meta property="og:title" content={seo.ogTitle} />
        <meta property="og:description" content={seo.ogDesc} />
        <meta property="og:url" content={seo.url} />
        {seo.schema.map((s, i) => (
          <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
        ))}
      </Helmet>

      <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8">
        <div className="seo-content seo-top" onClick={onContentClick} dangerouslySetInnerHTML={{ __html: seo.top }} />

        {/* The real tool, opened on this pair */}
        <App
          key={route}
          darkMode={darkMode}
          converter={{ primary: displayZone(seo.fromZone), add: [displayZone(seo.toZone)] }}
        />

        <div className="seo-content seo-rest" onClick={onContentClick} dangerouslySetInnerHTML={{ __html: seo.rest }} />
      </div>
    </>
  );
}
