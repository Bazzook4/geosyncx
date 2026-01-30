# How to Add a New Blog Post with Proper SEO

Follow these steps whenever you add a new blog post to ensure Google can crawl and index it.

## Step 1: Create the Blog Post Component

Create a new file in `/src/blog-posts/` (e.g., `YourNewPost.jsx`):

```jsx
// /src/blog-posts/YourNewPost.jsx
export default function YourNewPost() {
  return (
    <>
      <h1>Your Blog Post Title</h1>

      <p className="lead text-xl font-medium opacity-90 border-l-4 border-sky-500 pl-4 my-8">
        Your compelling introduction or subtitle goes here.
      </p>

      <h2>First Section</h2>
      <p>Your content here...</p>

      {/* Add more sections as needed */}
    </>
  );
}
```

## Step 2: Add SEO Metadata

Update `/src/seo-config.js` and add your post's metadata:

```javascript
export const BLOG_SEO_DATA = {
  // ... existing posts

  "your-post-slug": {
    title: "Your SEO-Optimized Title | GeoSyncX",
    description: "A compelling 150-160 character description that will appear in search results.",
    keywords: "keyword1, keyword2, keyword3, long-tail keyword phrase",
    author: "GeoSyncX Team",
    datePublished: "2025-12-25", // Use YYYY-MM-DD format
    dateModified: "2025-12-25",
    category: "Timezone Tools", // or "Meeting Tools", "Productivity", "Developer Tools", "Getting Started"
    readTime: "8 min read",
    image: "https://www.geosyncx.com/android-chrome-512x512.png",
  },
};
```

### SEO Metadata Tips:
- **title**: 50-60 characters, include main keyword
- **description**: 150-160 characters, compelling and keyword-rich
- **keywords**: 5-10 relevant keywords/phrases
- **category**: Use existing categories for consistency
- **datePublished**: Current date in YYYY-MM-DD format

## Step 3: Register the Post Component

Update `/src/BlogPost.jsx`:

```javascript
// Add import at the top
import YourNewPost from "./blog-posts/YourNewPost";

// Add to BLOG_POST_COMPONENTS object
const BLOG_POST_COMPONENTS = {
  // ... existing posts
  "your-post-slug": YourNewPost,
};
```

## Step 4: Add to Blog Index

Update `/src/Blog.jsx` to add your post to the blog listing:

```javascript
const BLOG_POSTS = [
  // ... existing posts
  {
    id: "your-post-slug",
    title: "Your Blog Post Title",
    description: "Short description that appears on blog index page.",
    category: "Timezone Tools",
    readTime: "8 min read",
    date: "2025-12-25",
  },
];
```

**Note:** The `id` must match:
- The key in `BLOG_SEO_DATA` (seo-config.js)
- The key in `BLOG_POST_COMPONENTS` (BlogPost.jsx)
- The URL slug you want (e.g., `/blog/your-post-slug`)

## Step 5: Update Sitemap

Update `/public/sitemap.xml` to include your new blog post:

```xml
<url>
  <loc>https://www.geosyncx.com/blog/your-post-slug</loc>
  <lastmod>2025-12-25</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

Add this entry inside the `<urlset>` tag, after the other blog posts.

## Step 6: Build and Test Locally

```bash
# Build the project
npm run build

# Preview locally
npm run preview
```

Visit `http://localhost:4173/blog/your-post-slug` to verify:
- The post displays correctly
- Title in browser tab is correct
- No console errors

## Step 7: Test SEO Tags

Use browser inspector (F12) to check the `<head>` section:
- Unique `<title>` tag
- Meta description
- Open Graph tags
- JSON-LD structured data

Or use online tools:
- [Facebook Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

## Step 8: Deploy

```bash
npm run deploy
```

This will:
- Build the production version
- Deploy to GitHub Pages
- Your post will be live at `https://www.geosyncx.com/blog/your-post-slug`

## Step 9: Submit to Google

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "URL Inspection" in the left sidebar
3. Enter: `https://www.geosyncx.com/blog/your-post-slug`
4. Click "Request Indexing"

This speeds up the crawling process. Otherwise, Google will discover it from the sitemap within 1-7 days.

## Checklist

Before deploying, ensure:

- [ ] Created blog post component in `/src/blog-posts/`
- [ ] Added SEO metadata to `/src/seo-config.js`
- [ ] Registered component in `/src/BlogPost.jsx`
- [ ] Added to blog list in `/src/Blog.jsx`
- [ ] Updated `/public/sitemap.xml`
- [ ] Tested locally with `npm run preview`
- [ ] Verified meta tags in browser inspector
- [ ] Deployed with `npm run deploy`
- [ ] Submitted to Google Search Console

## Common Mistakes to Avoid

1. **Slug mismatch** - Ensure the `id` is the same in all 3 files
2. **Forgetting sitemap** - Google won't discover your post quickly
3. **Missing SEO data** - Won't rank well without proper metadata
4. **Not requesting indexing** - Can take weeks instead of days
5. **Date format** - Use YYYY-MM-DD, not other formats

## Example: Complete Workflow

Let's say you want to add a post about "Time Zone Calculator":

1. Create `/src/blog-posts/TimezoneCalculatorPost.jsx`
2. Add to `seo-config.js`:
   ```javascript
   "timezone-calculator": {
     title: "Free Time Zone Calculator: Convert Times Instantly",
     description: "Calculate time differences across zones instantly...",
     // ... rest of metadata
   }
   ```
3. Update `BlogPost.jsx`:
   ```javascript
   import TimezoneCalculatorPost from "./blog-posts/TimezoneCalculatorPost";

   const BLOG_POST_COMPONENTS = {
     "timezone-calculator": TimezoneCalculatorPost,
     // ... other posts
   };
   ```
4. Update `Blog.jsx`:
   ```javascript
   {
     id: "timezone-calculator",
     title: "Free Time Zone Calculator: Convert Times Instantly",
     // ... rest
   }
   ```
5. Update `sitemap.xml` with the new URL
6. Build, test, deploy
7. Submit to Google Search Console

That's it! Your new blog post is now SEO-optimized and ready to be indexed by Google.
