// /src/AppRouter.jsx
import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";

// Main App (Dashboard)
import App from "./App.jsx";

// Blog
import Blog from "./Blog.jsx";
import BlogPost from "./BlogPost.jsx";

// Time Converters
import TimezoneConverter from "./TimezoneConverter.jsx";

// Standalone Pages
import HomePage from "./pages/HomePage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import PhoneCodeLookupPage from "./pages/PhoneCodeLookupPage.jsx";
import TimezoneFinderPage from "./pages/TimezoneFinderPage.jsx";
import TimezoneComparePage from "./pages/TimezoneComparePage.jsx";
import MeetingSchedulerPage from "./pages/MeetingSchedulerPage.jsx";
import BestMeetingTimePage from "./pages/BestMeetingTimePage.jsx";
import FormatterPage from "./pages/FormatterPage.jsx";

// Components
import Footer from "./Footer.jsx";

export default function AppRouter() {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    return stored === null ? true : stored === "true";
  });
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
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

  const navLinkActiveClass = "bg-sky-500 text-white";

  return (
    <div className={`min-h-screen w-full transition-colors ${backgroundClass}`}>
      <div className="px-4 py-6 md:px-8 md:py-10 space-y-6 md:space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3 md:gap-6 flex-wrap">
            {/* Bigger Logo */}
            <Link to="/" className="text-2xl md:text-3xl font-bold hover:text-sky-500 transition-colors tracking-tight">
              GeoSyncX
            </Link>

            {/* Navigation - Dashboard FIRST, then tools */}
            <nav className="hidden md:flex items-center gap-2">
              <Link
                to="/command-center"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname === '/command-center'
                    ? navLinkActiveClass
                    : 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:from-sky-400 hover:to-indigo-400 shadow-lg'
                }`}
              >
                Command Center
              </Link>
              <div className={`h-6 w-px ${darkMode ? 'bg-white/20' : 'bg-slate-300'}`} />
              <Link
                to="/tools/phone-code-lookup"
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  location.pathname === '/tools/phone-code-lookup' ? navLinkActiveClass : navLinkClass
                }`}
              >
                Phone Lookup
              </Link>
              <Link
                to="/tools/timezone-finder"
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  location.pathname === '/tools/timezone-finder' ? navLinkActiveClass : navLinkClass
                }`}
              >
                Finder
              </Link>
              <Link
                to="/tools/timezone-compare"
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  location.pathname === '/tools/timezone-compare' ? navLinkActiveClass : navLinkClass
                }`}
              >
                Compare
              </Link>
              <Link
                to="/tools/best-meeting-time"
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  location.pathname === '/tools/best-meeting-time' ? navLinkActiveClass : navLinkClass
                }`}
              >
                Best Time
              </Link>
              <Link
                to="/tools/meeting-scheduler"
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  location.pathname === '/tools/meeting-scheduler' ? navLinkActiveClass : navLinkClass
                }`}
              >
                Scheduler
              </Link>
              <Link
                to="/tools/formatter"
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  location.pathname === '/tools/formatter' ? navLinkActiveClass : navLinkClass
                }`}
              >
                Formatter
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile: Show Command Center button */}
            <Link
              to="/command-center"
              className="md:hidden px-3 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-sm font-semibold"
            >
              Go
            </Link>
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
              className="hidden md:block px-3 py-2 rounded-xl bg-sky-500 text-white hover:bg-sky-400 transition-transform active:scale-95 shadow-lg"
              title="Send feedback"
            >
              📩
            </button>
          </div>
        </header>

        {/* Routes */}
        <Routes>
          {/* Home */}
          <Route path="/" element={<HomePage darkMode={darkMode} />} />

          {/* Command Center (renamed from Dashboard) */}
          <Route path="/command-center" element={<App darkMode={darkMode} />} />
          {/* Keep /dashboard as alias for backwards compatibility */}
          <Route path="/dashboard" element={<App darkMode={darkMode} />} />

          {/* About */}
          <Route path="/about" element={<AboutPage darkMode={darkMode} />} />

          {/* Standalone Tools */}
          <Route path="/tools/phone-code-lookup" element={<PhoneCodeLookupPage darkMode={darkMode} />} />
          <Route path="/tools/timezone-finder" element={<TimezoneFinderPage darkMode={darkMode} />} />
          <Route path="/tools/timezone-compare" element={<TimezoneComparePage darkMode={darkMode} />} />
          <Route path="/tools/meeting-scheduler" element={<MeetingSchedulerPage darkMode={darkMode} />} />
          <Route path="/tools/best-meeting-time" element={<BestMeetingTimePage darkMode={darkMode} />} />
          <Route path="/tools/formatter" element={<FormatterPage darkMode={darkMode} />} />

          {/* Blog */}
          <Route path="/blog" element={<Blog darkMode={darkMode} />} />
          <Route path="/blog/:postId" element={<BlogPost darkMode={darkMode} />} />

          {/* Time Converters (SEO pages) */}
          <Route path="/time/:route" element={<TimezoneConverter darkMode={darkMode} />} />
        </Routes>

        {/* Footer */}
        <Footer darkMode={darkMode} />
      </div>
    </div>
  );
}
