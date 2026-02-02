// /src/AppRouter.jsx
import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import App from "./App.jsx";
import Blog from "./Blog.jsx";
import BlogPost from "./BlogPost.jsx";
import TimezoneConverter from "./TimezoneConverter.jsx";
import Footer from "./Footer.jsx";

export default function AppRouter() {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    // Default to dark mode if no preference stored
    return stored === null ? true : stored === "true";
  });
  const location = useLocation();
  const isBlogPage = location.pathname.startsWith('/blog');

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const backgroundClass = darkMode
    ? "bg-slate-950 text-slate-100"
    : "bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 text-slate-900";

  const themeToggleClass = darkMode
    ? "bg-white/20 text-white hover:bg-white/30"
    : "bg-slate-900 text-white hover:bg-slate-800";

  return (
    <div className={`min-h-screen w-full transition-colors ${backgroundClass}`}>
      <div className="px-4 py-6 md:px-8 md:py-10 space-y-6 md:space-y-8">
        {/* Header with Theme Toggle and Blog Link */}
        <header className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-bold hover:text-sky-500 transition-colors">
              GeoSyncX
            </Link>
            {!isBlogPage && (
              <Link
                to="/blog"
                className={`px-4 py-2 rounded-xl transition-transform active:scale-95 ${
                  darkMode
                    ? "bg-white/15 text-white hover:bg-white/25"
                    : "bg-white/70 text-slate-700 hover:bg-white border border-slate-200"
                }`}
              >
                📚 Blog
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-3 py-2 rounded-xl transition-transform active:scale-95 shadow-lg ${themeToggleClass}`}
              title="Toggle theme"
            >
              {darkMode ? "🌞" : "🌙"}
            </button>
            <button
              onClick={() =>
                (window.location.href =
                  "mailto:hello@geosyncx.com?subject=GeoSyncX%20Feedback")
              }
              className="px-3 py-2 rounded-xl bg-sky-500 text-white hover:bg-sky-400 transition-transform active:scale-95 shadow-lg"
              title="Send feedback"
            >
              📩
            </button>
          </div>
        </header>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<App darkMode={darkMode} />} />
          <Route path="/blog" element={<Blog darkMode={darkMode} />} />
          <Route path="/blog/:postId" element={<BlogPost darkMode={darkMode} />} />
          <Route path="/time/:route" element={<TimezoneConverter darkMode={darkMode} />} />
        </Routes>

        {/* Footer */}
        <Footer darkMode={darkMode} />
      </div>
    </div>
  );
}
