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
          {/* Tools */}
          <div>
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${headingClass}`}>
              Tools
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/tools/phone-code-lookup" className={`text-sm transition-colors ${linkClass}`}>
                  Phone Code Lookup
                </Link>
              </li>
              <li>
                <Link to="/tools/timezone-finder" className={`text-sm transition-colors ${linkClass}`}>
                  Timezone Finder
                </Link>
              </li>
              <li>
                <Link to="/tools/timezone-compare" className={`text-sm transition-colors ${linkClass}`}>
                  Timezone Compare
                </Link>
              </li>
              <li>
                <Link to="/tools/meeting-scheduler" className={`text-sm transition-colors ${linkClass}`}>
                  Meeting Scheduler
                </Link>
              </li>
              <li>
                <Link to="/tools/best-meeting-time" className={`text-sm transition-colors ${linkClass}`}>
                  Best Meeting Time
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className={`text-sm transition-colors ${linkClass}`}>
                  Full Dashboard
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
              <li>
                <Link to="/time/london-to-ist" className={`text-sm transition-colors ${linkClass}`}>
                  London to IST
                </Link>
              </li>
              <li>
                <Link to="/time/pst-to-ist" className={`text-sm transition-colors ${linkClass}`}>
                  PST to IST
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
                  Phone Code Guide
                </Link>
              </li>
              <li>
                <Link to="/blog" className={`text-sm transition-colors ${linkClass}`}>
                  All Articles
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
                <Link to="/" className={`text-sm transition-colors ${linkClass}`}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className={`text-sm transition-colors ${linkClass}`}>
                  About / Our Story
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
              <Link to="/about" className={`text-xs hover:text-sky-500 ${textClass}`}>
                Built by a sales exec, for global teams
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
