// /src/BlogPost.jsx
import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect } from "react";
import SEO from "./SEO";
import { getBlogPostSEO } from "./seo-config";
import TimezoneComparisonPost from "./blog-posts/TimezoneComparisonPost";
import PhoneCodePost from "./blog-posts/PhoneCodePost";
import PrimaryTimezonePost from "./blog-posts/PrimaryTimezonePost";
import ScheduleMeetingPost from "./blog-posts/ScheduleMeetingPost";
import BestMeetingTimePost from "./blog-posts/BestMeetingTimePost";
import SmartTodoPost from "./blog-posts/SmartTodoPost";
import FormatterPost from "./blog-posts/FormatterPost";

const BLOG_POST_COMPONENTS = {
  "timezone-comparison-tool": TimezoneComparisonPost,
  "phone-code-timezone-search": PhoneCodePost,
  "set-primary-timezone": PrimaryTimezonePost,
  "schedule-meeting-across-timezones": ScheduleMeetingPost,
  "best-meeting-time-finder": BestMeetingTimePost,
  "smart-todo-list": SmartTodoPost,
  "json-xml-soap-formatter": FormatterPost,
};

export default function BlogPost({ darkMode }) {
  const { postId } = useParams();
  const PostComponent = BLOG_POST_COMPONENTS[postId];
  const seoData = getBlogPostSEO(postId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [postId]);

  if (!PostComponent) {
    return <Navigate to="/blog" replace />;
  }

  const cardBase = darkMode
    ? "bg-white/10 text-white border border-white/15 shadow-xl"
    : "bg-white/70 text-gray-900 border border-white/60 shadow-xl";

  return (
    <>
      {seoData && <SEO {...seoData} />}
      <div className="w-full max-w-4xl mx-auto">
      <div
        className={`p-6 md:p-10 rounded-2xl backdrop-blur-xl transition-colors duration-300 ${cardBase}`}
      >
        <div className="mb-6">
          <Link
            to="/blog"
            className={`inline-flex items-center gap-2 text-sm transition-colors ${
              darkMode
                ? "text-white/70 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            ← Back to Blog
          </Link>
        </div>

        <article
          className={`prose prose-lg max-w-none ${
            darkMode
              ? "prose-invert prose-headings:text-white prose-headings:font-bold prose-h1:text-4xl prose-h1:leading-tight prose-h1:mb-6 prose-h2:text-3xl prose-h2:leading-snug prose-h2:mt-20 prose-h2:mb-4 prose-h3:text-xl prose-h3:leading-snug prose-h3:mt-12 prose-h3:mb-4 prose-p:text-white/90 prose-p:text-lg prose-p:leading-[2] prose-p:mb-6 prose-a:text-sky-400 prose-a:underline prose-a:decoration-sky-400/30 prose-a:transition-colors hover:prose-a:text-sky-300 hover:prose-a:decoration-sky-400 prose-strong:text-white prose-strong:font-semibold prose-ul:my-6 prose-ul:space-y-6 prose-ul:pl-6 prose-ol:my-6 prose-ol:space-y-6 prose-ol:pl-6 prose-li:text-white/90 prose-li:text-lg prose-li:leading-[2] prose-li:pl-3 prose-li:mb-4 prose-li:marker:text-sky-400 prose-code:text-emerald-300 prose-code:text-base prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:p-4 prose-pre:rounded-xl prose-pre:my-6"
              : "prose-headings:text-gray-900 prose-headings:font-bold prose-h1:text-4xl prose-h1:leading-tight prose-h1:mb-6 prose-h2:text-3xl prose-h2:leading-snug prose-h2:mt-20 prose-h2:mb-4 prose-h3:text-xl prose-h3:leading-snug prose-h3:mt-12 prose-h3:mb-4 prose-p:text-gray-700 prose-p:text-lg prose-p:leading-[2] prose-p:mb-6 prose-a:text-sky-600 prose-a:underline prose-a:decoration-sky-600/30 prose-a:transition-colors hover:prose-a:text-sky-700 hover:prose-a:decoration-sky-600 prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:my-6 prose-ul:space-y-6 prose-ul:pl-6 prose-ol:my-6 prose-ol:space-y-6 prose-ol:pl-6 prose-li:text-gray-700 prose-li:text-lg prose-li:leading-[2] prose-li:pl-3 prose-li:mb-4 prose-li:marker:text-sky-600 prose-code:text-emerald-700 prose-code:bg-emerald-50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-base prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:p-4 prose-pre:rounded-xl prose-pre:my-6"
          }`}
        >
          <PostComponent />
        </article>

        <div className="mt-10 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              to="/blog"
              className={`px-6 py-3 rounded-xl transition-transform active:scale-95 ${
                darkMode
                  ? "bg-white/15 text-white hover:bg-white/25"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              ← More Blog Posts
            </Link>

            <Link
              to="/"
              className="px-6 py-3 rounded-xl bg-sky-500 text-white hover:bg-sky-400 transition-transform active:scale-95"
            >
              Try GeoSyncX →
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
