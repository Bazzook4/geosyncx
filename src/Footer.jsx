// /src/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer({ darkMode }) {
  const bgClass = darkMode
    ? "bg-slate-900/50 border-slate-800"
    : "bg-white/50 border-slate-200";

  const textClass = darkMode ? "text-slate-400" : "text-slate-600";
  const headingClass = darkMode ? "text-slate-300" : "text-slate-700";
  const linkClass = darkMode
    ? "text-slate-400 hover:text-sky-400"
    : "text-slate-600 hover:text-sky-600";

  return (
    <footer className={`mt-16 border-t ${bgClass} backdrop-blur-sm`}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Popular Tools */}
          <div>
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${headingClass}`}>
              Popular Tools
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className={`text-sm transition-colors ${linkClass}`}>
                  Timezone Converter
                </Link>
              </li>
              <li>
                <Link to="/" className={`text-sm transition-colors ${linkClass}`}>
                  Meeting Scheduler
                </Link>
              </li>
              <li>
                <Link to="/" className={`text-sm transition-colors ${linkClass}`}>
                  JSON Formatter
                </Link>
              </li>
              <li>
                <Link to="/" className={`text-sm transition-colors ${linkClass}`}>
                  Phone Code Lookup
                </Link>
              </li>
            </ul>
          </div>

          {/* Time Converters */}
          <div>
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${headingClass}`}>
              Time Converters
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/time/ist-to-london" className={`text-sm transition-colors ${linkClass}`}>
                  IST to London
                </Link>
              </li>
              <li>
                <Link to="/time/ist-to-est" className={`text-sm transition-colors ${linkClass}`}>
                  IST to EST
                </Link>
              </li>
              <li>
                <Link to="/time/ist-to-pst" className={`text-sm transition-colors ${linkClass}`}>
                  IST to PST
                </Link>
              </li>
              <li>
                <Link to="/time/est-to-pst" className={`text-sm transition-colors ${linkClass}`}>
                  EST to PST
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${headingClass}`}>
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/blog/timezone-comparison-tool" className={`text-sm transition-colors ${linkClass}`}>
                  Timezone Guide
                </Link>
              </li>
              <li>
                <Link to="/blog/best-meeting-time-finder" className={`text-sm transition-colors ${linkClass}`}>
                  Meeting Time Finder
                </Link>
              </li>
              <li>
                <Link to="/blog/schedule-meeting-across-timezones" className={`text-sm transition-colors ${linkClass}`}>
                  Calendar Guide
                </Link>
              </li>
              <li>
                <Link to="/blog/phone-code-timezone-search" className={`text-sm transition-colors ${linkClass}`}>
                  Phone Code Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${headingClass}`}>
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/blog" className={`text-sm transition-colors ${linkClass}`}>
                  Blog
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@geosyncx.com"
                  className={`text-sm transition-colors ${linkClass}`}
                >
                  Contact Us
                </a>
              </li>
              <li>
                <Link to="/" className={`text-sm transition-colors ${linkClass}`}>
                  Home
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`pt-8 border-t ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className={`text-sm ${textClass}`}>
              © {new Date().getFullYear()} GeoSyncX. Free timezone tools for global teams.
            </p>
            <div className="flex items-center gap-6">
              <span className={`text-xs ${textClass}`}>
                Made with ❤️ for remote teams worldwide
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
