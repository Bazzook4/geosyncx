// /src/pages/HomePage.jsx
import SEO from "../SEO";
import { DEFAULT_SEO } from "../seo-config";
import { Link } from "react-router-dom";

const TOOLS = [
  {
    id: "phone-code",
    title: "Phone Code Lookup",
    description: "Identify country from any phone number",
    icon: "📞",
    path: "/tools/phone-code-lookup",
    color: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/30",
  },
  {
    id: "timezone-finder",
    title: "Timezone Finder",
    description: "Search by city, country, or GMT offset",
    icon: "🔍",
    path: "/tools/timezone-finder",
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
  },
  {
    id: "timezone-compare",
    title: "Timezone Compare",
    description: "Compare multiple timezones side by side",
    icon: "🌍",
    path: "/tools/timezone-compare",
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30",
  },
  {
    id: "meeting-scheduler",
    title: "Meeting Scheduler",
    description: "Schedule calls across timezones",
    icon: "📅",
    path: "/tools/meeting-scheduler",
    color: "from-orange-500/20 to-amber-500/20",
    borderColor: "border-orange-500/30",
  },
  {
    id: "best-meeting-time",
    title: "Best Meeting Time",
    description: "Find the optimal overlap for everyone",
    icon: "✨",
    path: "/tools/best-meeting-time",
    color: "from-rose-500/20 to-red-500/20",
    borderColor: "border-rose-500/30",
  },
  {
    id: "dashboard",
    title: "Full Dashboard",
    description: "All tools in one unified interface",
    icon: "🚀",
    path: "/dashboard",
    color: "from-sky-500/20 to-indigo-500/20",
    borderColor: "border-sky-500/30",
    featured: true,
  },
];

export default function HomePage({ darkMode }) {
  const cardClass = darkMode
    ? "bg-white/10 border border-white/15 backdrop-blur-xl"
    : "bg-white/80 border border-white/60 backdrop-blur-xl";

  const textClass = darkMode ? "text-white/80" : "text-slate-700";
  const headingClass = darkMode ? "text-white" : "text-slate-900";

  return (
    <>
      <SEO {...DEFAULT_SEO} />

      <div className="w-full max-w-6xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 py-8">
          <h1 className={`text-4xl md:text-5xl font-bold ${headingClass}`}>
            Timezone Tools for
            <span className="text-sky-500"> Global Teams</span>
          </h1>
          <p className={`text-xl max-w-2xl mx-auto ${textClass}`}>
            Stop juggling multiple tools. Find locations from phone numbers,
            compare timezones, and schedule meetings — all in one place.
          </p>

          {/* Quick Story Teaser */}
          <div className={`inline-block rounded-xl px-6 py-3 ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
            <p className={`text-sm ${textClass}`}>
              Built by a sales exec who was tired of opening 3 tabs just to schedule a call.{" "}
              <Link to="/about" className="text-sky-500 hover:underline">
                Read the story →
              </Link>
            </p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map((tool) => (
            <Link
              key={tool.id}
              to={tool.path}
              className={`group p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                tool.featured
                  ? `bg-gradient-to-br ${tool.color} ${tool.borderColor} border-2`
                  : cardClass
              }`}
            >
              <div className="text-4xl mb-4">{tool.icon}</div>
              <h2 className={`text-xl font-bold mb-2 ${headingClass} group-hover:text-sky-500 transition-colors`}>
                {tool.title}
              </h2>
              <p className={`${textClass}`}>{tool.description}</p>
              {tool.featured && (
                <div className="mt-4 inline-block px-3 py-1 bg-sky-500 text-white text-xs font-semibold rounded-full">
                  RECOMMENDED
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Quick Features */}
        <div className={`rounded-2xl p-8 ${cardClass}`}>
          <h2 className={`text-2xl font-bold mb-6 text-center ${headingClass}`}>
            Why GeoSyncX?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className={`font-semibold ${headingClass}`}>Instant</h3>
              <p className={`text-sm mt-2 ${textClass}`}>
                No loading, no signup. Just paste a number or search.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🆓</div>
              <h3 className={`font-semibold ${headingClass}`}>100% Free</h3>
              <p className={`text-sm mt-2 ${textClass}`}>
                All features, no paywalls, no limits.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className={`font-semibold ${headingClass}`}>Private</h3>
              <p className={`text-sm mt-2 ${textClass}`}>
                Everything runs in your browser. Your data stays with you.
              </p>
            </div>
          </div>
        </div>

        {/* Popular Conversions */}
        <div className={`rounded-2xl p-8 ${cardClass}`}>
          <h2 className={`text-2xl font-bold mb-6 ${headingClass}`}>
            Popular Time Conversions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "IST to London", path: "/time/ist-to-london" },
              { label: "IST to EST", path: "/time/ist-to-est" },
              { label: "IST to PST", path: "/time/ist-to-pst" },
              { label: "EST to PST", path: "/time/est-to-pst" },
              { label: "London to EST", path: "/time/london-to-est" },
              { label: "GMT to IST", path: "/time/gmt-to-ist" },
              { label: "PST to IST", path: "/time/pst-to-ist" },
              { label: "London to IST", path: "/time/london-to-ist" },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`p-3 rounded-xl text-center transition-colors ${
                  darkMode
                    ? "bg-white/5 hover:bg-white/10"
                    : "bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <span className={`text-sm font-medium ${headingClass}`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 py-8">
          <h2 className={`text-2xl font-bold ${headingClass}`}>
            Ready to simplify your workflow?
          </h2>
          <Link
            to="/dashboard"
            className="inline-block px-8 py-4 bg-sky-500 text-white text-lg font-semibold rounded-xl hover:bg-sky-400 transition-colors shadow-lg"
          >
            Open Full Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
