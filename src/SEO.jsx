// SEO component for meta tags and structured data
import { Helmet } from "react-helmet-async";

export default function SEO({
  title,
  description,
  keywords,
  author = "GeoSyncX Team",
  image = "https://www.geosyncx.com/android-chrome-512x512.png",
  url = "https://www.geosyncx.com/",
  type = "website",
  datePublished,
  dateModified,
  category,
  readTime
}) {
  // Generate JSON-LD structured data
  const structuredData = type === "article" ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": image,
    "url": url,
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "author": {
      "@type": "Organization",
      "name": author,
      "url": "https://www.geosyncx.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "GeoSyncX",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.geosyncx.com/android-chrome-512x512.png"
      }
    },
    "articleSection": category,
    "keywords": keywords,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    }
  } : {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "GeoSyncX",
    "url": "https://www.geosyncx.com",
    "description": description,
    "publisher": {
      "@type": "Organization",
      "name": "GeoSyncX"
    }
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="GeoSyncX" />

      {/* Article-specific OG tags */}
      {type === "article" && datePublished && (
        <>
          <meta property="article:published_time" content={datePublished} />
          <meta property="article:modified_time" content={dateModified || datePublished} />
          <meta property="article:author" content={author} />
          {category && <meta property="article:section" content={category} />}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}
