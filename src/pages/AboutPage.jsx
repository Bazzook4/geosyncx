// /src/pages/AboutPage.jsx
import SEO from "../SEO";
import { Link } from "react-router-dom";

export default function AboutPage({ darkMode }) {
  const cardClass = darkMode
    ? "bg-white/10 border border-white/15 backdrop-blur-xl"
    : "bg-white/80 border border-white/60 backdrop-blur-xl";

  const textClass = darkMode ? "text-white/80" : "text-slate-700";
  const headingClass = darkMode ? "text-white" : "text-slate-900";

  return (
    <>
      <SEO
        title="About GeoSyncX | The Story Behind the Tool"
        description="GeoSyncX was built by a sales executive tired of juggling 3-4 tools to schedule international calls. Here's the story."
        keywords="about geosyncx, timezone tool story, sales tools, international calling"
        url="https://www.geosyncx.com/about"
      />

      <div className="w-full max-w-3xl mx-auto space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <h1 className={`text-3xl md:text-4xl font-bold ${headingClass}`}>
            Why I Built GeoSyncX
          </h1>
          <p className={`text-lg ${darkMode ? "text-white/60" : "text-slate-500"}`}>
            A tool born from real frustration
          </p>
        </div>

        {/* The Story */}
        <div className={`rounded-2xl p-8 ${cardClass}`}>
          <div className={`space-y-6 text-lg leading-relaxed ${textClass}`}>
            <p>
              I'm a sales executive working with leads from around the globe.
            </p>

            <p>
              Every day, I'd get inquiries with just a phone number — no location, no timezone.
              So I'd open one tab to look up the country code, another to check their timezone,
              and a third to figure out when to call.
            </p>

            <p>
              Then came the multi-stakeholder deals. A prospect in <strong>London</strong>,
              their CTO in <strong>Singapore</strong>, and their US team in <strong>California</strong>.
              Finding a single meeting slot that didn't require someone to wake up at 3 AM?
              That took forever.
            </p>

            <div className={`my-8 p-6 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <p className="italic text-center">
                "I got tired of juggling 3-4 different tools for something so simple."
              </p>
            </div>

            <p>
              So I built <strong>GeoSyncX</strong> — everything I need in one place:
            </p>

            <ul className="space-y-4 ml-4">
              <li className="flex items-start gap-3">
                <span className="text-2xl">📞</span>
                <span><strong>See a phone number?</strong> Instantly know where they're calling from</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">🌍</span>
                <span><strong>Need to compare timezones?</strong> Add as many as you want</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">📅</span>
                <span><strong>Scheduling a meeting?</strong> Find the best overlap in seconds</span>
              </li>
            </ul>

            <p className="mt-8">
              No signups. No clutter. Just the tools I wish I had from day one.
            </p>
          </div>
        </div>

        {/* Who It's For */}
        <div className={`rounded-2xl p-8 ${cardClass}`}>
          <h2 className={`text-2xl font-bold mb-6 ${headingClass}`}>
            Built For
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <div className="text-3xl mb-3">💼</div>
              <h3 className={`font-semibold ${headingClass}`}>Sales Teams</h3>
              <p className={`text-sm mt-2 ${textClass}`}>
                Identify leads, find their timezone, schedule calls — all in one place
              </p>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <div className="text-3xl mb-3">🌐</div>
              <h3 className={`font-semibold ${headingClass}`}>Remote Workers</h3>
              <p className={`text-sm mt-2 ${textClass}`}>
                Coordinate with distributed teams without the timezone headache
              </p>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <div className="text-3xl mb-3">🤝</div>
              <h3 className={`font-semibold ${headingClass}`}>Client Success Teams</h3>
              <p className={`text-sm mt-2 ${textClass}`}>
                Know when to call clients without waking them up at odd hours
              </p>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <div className="text-3xl mb-3">✈️</div>
              <h3 className={`font-semibold ${headingClass}`}>Frequent Travelers</h3>
              <p className={`text-sm mt-2 ${textClass}`}>
                Keep track of home time while hopping between timezones
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className={`rounded-2xl p-8 text-center ${cardClass}`}>
          <h2 className={`text-2xl font-bold mb-4 ${headingClass}`}>
            Ready to save time?
          </h2>
          <p className={`mb-6 ${textClass}`}>
            Try GeoSyncX — it's free, no signup required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/"
              className="px-6 py-3 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-400 transition-colors"
            >
              Open Dashboard
            </Link>
            <Link
              to="/tools/phone-code-lookup"
              className={`px-6 py-3 rounded-xl font-semibold transition-colors ${darkMode ? "bg-white/10 hover:bg-white/20 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-900"}`}
            >
              Try Phone Lookup
            </Link>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center">
          <p className={`${textClass}`}>
            Have feedback or suggestions?{" "}
            <a
              href="mailto:hello@geosyncx.com"
              className="text-sky-500 hover:underline"
            >
              Drop me an email
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
