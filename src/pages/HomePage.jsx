// /src/pages/HomePage.jsx
import SEO from "../SEO";
import { DEFAULT_SEO } from "../seo-config";
import { Link } from "react-router-dom";

const TOOLS = [
  {
    id: "command-center",
    title: "Command Center",
    description: "All timezone tools unified",
    icon: "🚀",
    path: "/command-center",
    color: "from-sky-500/20 to-indigo-500/20",
    borderColor: "border-sky-500/30",
    featured: true,
  },
  {
    id: "phone-code",
    title: "Phone Lookup",
    description: "Country from phone number",
    icon: "📞",
    path: "/tools/phone-code-lookup",
    color: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/30",
  },
  {
    id: "timezone-compare",
    title: "Compare",
    description: "Multiple clocks side by side",
    icon: "🌍",
    path: "/tools/timezone-compare",
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30",
  },
  {
    id: "best-meeting-time",
    title: "Best Time",
    description: "Find when everyone's awake",
    icon: "✨",
    path: "/tools/best-meeting-time",
    color: "from-amber-500/20 to-orange-500/20",
    borderColor: "border-amber-500/30",
  },
  {
    id: "timezone-finder",
    title: "Finder",
    description: "Search by city or GMT",
    icon: "🔍",
    path: "/tools/timezone-finder",
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
  },
  {
    id: "meeting-scheduler",
    title: "Scheduler",
    description: "Pick a time globally",
    icon: "📅",
    path: "/tools/meeting-scheduler",
    color: "from-rose-500/20 to-pink-500/20",
    borderColor: "border-rose-500/30",
  },
  {
    id: "formatter",
    title: "Formatter",
    description: "Format JSON, XML, SOAP",
    icon: "🔧",
    path: "/tools/formatter",
    color: "from-violet-500/20 to-fuchsia-500/20",
    borderColor: "border-violet-500/30",
  },
];

export default function HomePage({ darkMode }) {
  const cardClass = darkMode
    ? "bg-white/5 border border-white/10 backdrop-blur-xl"
    : "bg-white/80 border border-white/60 backdrop-blur-xl";

  const textClass = darkMode ? "text-white/70" : "text-slate-600";
  const headingClass = darkMode ? "text-white" : "text-slate-900";

  return (
    <>
      <SEO {...DEFAULT_SEO} />

      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3 pt-4">
          <h1 className={`text-4xl md:text-6xl font-bold leading-tight ${headingClass}`}>
            Geo
            <span className="bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
              Sync
            </span>
            X
          </h1>
          <p className={`text-lg max-w-xl mx-auto ${textClass}`}>
            Timezone tools for global teams — phone lookup, meeting finder, compare, and more.
          </p>
        </div>

        {/* Tools Grid */}
        <div>
          <h2 className={`text-xl font-bold mb-4 text-center ${headingClass}`}>
            Tools
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {TOOLS.map((tool) => (
              <Link
                key={tool.id}
                to={tool.path}
                className={`group p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                  tool.featured
                    ? `bg-gradient-to-br ${tool.color} ${tool.borderColor} border-2`
                    : cardClass
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-2xl">{tool.icon}</div>
                  {tool.featured && (
                    <span className="px-1.5 py-0.5 bg-sky-500 text-white text-[10px] font-semibold rounded-full">
                      ALL-IN-ONE
                    </span>
                  )}
                </div>
                <h3 className={`text-sm font-bold ${headingClass} group-hover:text-sky-500 transition-colors`}>
                  {tool.title}
                </h3>
                <p className={`text-xs mt-1 ${textClass}`}>{tool.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Conversions - Compact */}
        <div className={`rounded-xl p-6 ${cardClass}`}>
          <h2 className={`text-lg font-bold mb-4 ${headingClass}`}>
            Popular Conversions
          </h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {[
              { label: "IST → London", path: "/time/ist-to-london" },
              { label: "IST → EST", path: "/time/ist-to-est" },
              { label: "IST → PST", path: "/time/ist-to-pst" },
              { label: "EST → PST", path: "/time/est-to-pst" },
              { label: "London → EST", path: "/time/london-to-est" },
              { label: "GMT → IST", path: "/time/gmt-to-ist" },
              { label: "PST → IST", path: "/time/pst-to-ist" },
              { label: "London → IST", path: "/time/london-to-ist" },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`p-2 rounded-lg text-center transition-all hover:scale-105 ${
                  darkMode
                    ? "bg-white/5 hover:bg-white/10 border border-white/5"
                    : "bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <span className={`text-xs font-medium ${headingClass}`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-6">
          <Link
            to="/command-center"
            className="inline-block px-8 py-4 bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-lg font-semibold rounded-xl hover:from-sky-400 hover:to-indigo-400 transition-all shadow-lg shadow-sky-500/25"
          >
            Open Command Center
          </Link>
        </div>
      </div>
    </>
  );
}
