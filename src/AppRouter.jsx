// /src/AppRouter.jsx
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";

// Main App (Dashboard)
import App from "./App.jsx";

// Blog
import Blog from "./Blog.jsx";
import BlogPost from "./BlogPost.jsx";

// Time Converters
import ConverterPage from "./ConverterPage.jsx";

// Standalone Pages
import AboutPage from "./pages/AboutPage.jsx";
import FormatterPage from "./pages/FormatterPage.jsx";

// Components
import Footer from "./Footer.jsx";

export default function AppRouter() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem("darkMode");
      if (stored !== null) return stored === "true";
    } catch {
      // storage blocked (private mode); fall through to the OS preference
    }
    return window.matchMedia?.("(prefers-color-scheme: light)").matches ? false : true;
  });
  const location = useLocation();

  useEffect(() => {
    try {
      localStorage.setItem("darkMode", darkMode);
    } catch {
      // ignore
    }
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Gradient background for dark mode
  const backgroundClass = darkMode
    ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100"
    : "bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900";

  const themeToggleClass = darkMode
    ? "bg-white/20 text-white hover:bg-white/30"
    : "bg-slate-900 text-white hover:bg-slate-800";

  const navLinkClass = darkMode
    ? "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
    : "bg-white/70 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200";

  const navLinkActiveClass = "bg-sky-700 text-white";

  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

  // Command Center is the front page too, so treat "/" and "/dashboard" as active for it.
  const isActive = (to) =>
    to === "/command-center"
      ? ["/", "/command-center", "/dashboard"].includes(location.pathname)
      : location.pathname === to || location.pathname.startsWith(`${to}/`);

  const NAV_LINKS = [
    { to: "/tools/formatter", label: "Formatter" },
  ];

  return (
    <div className={`min-h-screen w-full transition-colors ${backgroundClass}`}>
      <div className="px-4 py-6 md:px-8 md:py-10 space-y-6 md:space-y-8">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-sky-700 focus:text-white"
        >
          Skip to content
        </a>

        {/* Header */}
        <header className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 md:gap-6 flex-wrap">
              <Link to="/" className={`text-2xl md:text-3xl font-bold hover:text-sky-600 transition-colors tracking-tight rounded ${focusRing}`}>
                GeoSyncX
              </Link>

              {/* Desktop navigation */}
              <nav aria-label="Main" className="hidden md:flex items-center gap-2">
                <Link
                  to="/command-center"
                  aria-current={isActive("/command-center") ? "page" : undefined}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${focusRing} ${
                    isActive("/command-center")
                      ? navLinkActiveClass
                      : navLinkClass
                  }`}
                >
                  Command Center
                </Link>
                <div className={`h-6 w-px ${darkMode ? "bg-white/20" : "bg-slate-300"}`} />
                {NAV_LINKS.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    aria-current={isActive(to) ? "page" : undefined}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${focusRing} ${
                      isActive(to) ? navLinkActiveClass : navLinkClass
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`px-3 py-2 rounded-xl transition-transform active:scale-95 motion-reduce:transform-none shadow-lg ${themeToggleClass} ${focusRing}`}
                aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
                title={darkMode ? "Switch to light theme" : "Switch to dark theme"}
              >
                {darkMode ? <SunIcon className="w-5 h-5" aria-hidden="true" /> : <MoonIcon className="w-5 h-5" aria-hidden="true" />}
              </button>
              <a
                href="mailto:hello@geosyncx.com?subject=GeoSyncX%20Feedback"
                className={`px-3 py-2 rounded-xl text-sm font-medium border transition-transform active:scale-95 motion-reduce:transform-none ${darkMode ? "border-white/40 text-white hover:bg-white/10" : "border-slate-400 text-slate-800 hover:bg-white"} ${focusRing}`}
              >
                Feedback
              </a>
            </div>
          </div>

          {/* Mobile navigation: scrollable row so every page is reachable */}
          <nav aria-label="Main (mobile)" className="md:hidden -mx-4 px-4 overflow-x-auto">
            <ul className="flex items-center gap-2 pb-1 w-max">
              <li>
                <Link
                  to="/command-center"
                  aria-current={isActive("/command-center") ? "page" : undefined}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap ${focusRing} ${
                    isActive("/command-center")
                      ? navLinkActiveClass
                      : navLinkClass
                  }`}
                >
                  Command Center
                </Link>
              </li>
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    aria-current={isActive(to) ? "page" : undefined}
                    className={`block px-4 py-2.5 rounded-xl text-sm whitespace-nowrap ${focusRing} ${
                      isActive(to) ? navLinkActiveClass : navLinkClass
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        {/* Routes */}
        <main id="main" tabIndex={-1} className="outline-none">
        <Routes>
          {/* The Command Center is the front page (canonical https://www.geosyncx.com/) */}
          <Route path="/" element={<App darkMode={darkMode} />} />

          {/* Command Center (renamed from Dashboard) */}
          <Route path="/command-center" element={<App darkMode={darkMode} />} />
          {/* Keep /dashboard as alias for backwards compatibility */}
          <Route path="/dashboard" element={<App darkMode={darkMode} />} />

          {/* About */}
          <Route path="/about" element={<AboutPage darkMode={darkMode} />} />

          {/* Standalone Tools */}
          {/* Retired tools: send old links to the Command Center */}
          <Route path="/tools/phone-code-lookup" element={<Navigate to="/command-center" replace />} />
          <Route path="/tools/timeline" element={<Navigate to="/command-center" replace />} />
          <Route path="/tools/live-board" element={<Navigate to="/command-center" replace />} />
          <Route path="/tools/timezone-finder" element={<Navigate to="/command-center" replace />} />
          <Route path="/tools/timezone-compare" element={<Navigate to="/command-center" replace />} />
          <Route path="/tools/meeting-scheduler" element={<Navigate to="/command-center" replace />} />
          <Route path="/tools/best-meeting-time" element={<Navigate to="/command-center" replace />} />
          <Route path="/tools/formatter" element={<FormatterPage darkMode={darkMode} />} />

          {/* Blog */}
          <Route path="/blog" element={<Blog darkMode={darkMode} />} />
          <Route path="/blog/:postId" element={<BlogPost darkMode={darkMode} />} />

          {/* Time Converters (SEO pages) */}
          <Route path="/time/:route" element={<ConverterPage darkMode={darkMode} />} />
        </Routes>
        </main>

        {/* Footer */}
        <Footer darkMode={darkMode} />
      </div>
    </div>
  );
}
