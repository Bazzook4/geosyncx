// /src/pages/TimezoneComparePage.jsx
import { useState, useEffect } from "react";
import SEO from "../SEO";
import TimeComparison from "../TimeComparison";
import { Link } from "react-router-dom";
import { normalizeTimezoneName } from "../timezones.js";

export default function TimezoneComparePage({ darkMode }) {
  const [primaryZone, setPrimaryZone] = useState(() => {
    const stored = localStorage.getItem("primaryZone");
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tz = stored || detected || "UTC";
    return normalizeTimezoneName(tz);
  });

  const [selectedZones, setSelectedZones] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("selectedZones") || "[]");
      if (!Array.isArray(saved)) return [];
      const filtered = saved
        .filter((zone) => typeof zone === "string" && zone.trim().length > 0)
        .map(normalizeTimezoneName);
      return Array.from(new Set(filtered));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("primaryZone", primaryZone);
    localStorage.setItem("selectedZones", JSON.stringify(selectedZones));
  }, [primaryZone, selectedZones]);

  const cardClass = darkMode
    ? "bg-white/5 border border-white/10 backdrop-blur-xl"
    : "bg-white/80 border border-white/60 backdrop-blur-xl";

  const headingClass = darkMode ? "text-white" : "text-slate-900";
  const textClass = darkMode ? "text-white/70" : "text-slate-600";

  return (
    <>
      <SEO
        title="Timezone Comparison | Compare Multiple Timezones - GeoSyncX"
        description="Compare multiple timezones side by side. Add cities, set a primary timezone, and see live time differences."
        keywords="timezone comparison, compare timezones, world clock comparison, time difference calculator"
        url="https://www.geosyncx.com/tools/timezone-compare"
      />

      <div className="w-full max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className={`text-3xl md:text-4xl font-bold ${headingClass}`}>
            Timezone Comparison
          </h1>
          <p className={`text-lg ${textClass}`}>
            See multiple clocks side by side with live updates
          </p>
        </div>

        {/* Quick Steps */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-sm">1</div>
              <span className={`text-sm ${textClass}`}>Search for a city or country</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-sm">2</div>
              <span className={`text-sm ${textClass}`}>Add timezones to compare</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-sm">3</div>
              <span className={`text-sm ${textClass}`}>Star your primary timezone</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-sm">4</div>
              <span className={`text-sm ${textClass}`}>Click any time to convert</span>
            </div>
          </div>
        </div>

        {/* Main Tool */}
        <TimeComparison
          darkMode={darkMode}
          primaryZone={primaryZone}
          setPrimaryZone={setPrimaryZone}
          selectedZones={selectedZones}
          setSelectedZones={setSelectedZones}
          showCalendar={false}
        />

        {/* Related Tools */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <h2 className={`text-xl font-semibold mb-4 ${headingClass}`}>
            Related Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/tools/best-meeting-time"
              className={`p-4 rounded-xl transition-all hover:scale-[1.02] ${darkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}
            >
              <h3 className="font-semibold text-sky-500">Best Meeting Time →</h3>
              <p className={`text-sm mt-1 ${textClass}`}>
                Find when everyone is within working hours
              </p>
            </Link>
            <Link
              to="/tools/phone-code-lookup"
              className={`p-4 rounded-xl transition-all hover:scale-[1.02] ${darkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}
            >
              <h3 className="font-semibold text-sky-500">Phone Code Lookup →</h3>
              <p className={`text-sm mt-1 ${textClass}`}>
                Identify country from a phone number
              </p>
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <h2 className={`text-xl font-semibold mb-6 ${headingClass}`}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <summary className={`font-medium cursor-pointer ${headingClass}`}>
                How do I compare multiple timezones?
              </summary>
              <p className={`mt-3 text-sm ${textClass}`}>
                Search for cities or countries using the search box, then click to add them. You can add as many timezones as you need. All clocks update in real-time.
              </p>
            </details>
            <details className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <summary className={`font-medium cursor-pointer ${headingClass}`}>
                What does the star icon do?
              </summary>
              <p className={`mt-3 text-sm ${textClass}`}>
                Clicking the star sets that timezone as your "primary" timezone. When you enter a time, it will be converted from your primary timezone to all other timezones in the list.
              </p>
            </details>
            <details className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <summary className={`font-medium cursor-pointer ${headingClass}`}>
                How do I convert a specific time?
              </summary>
              <p className={`mt-3 text-sm ${textClass}`}>
                First, set a primary timezone by clicking its star. Then enter your desired date and time in the input fields. The "Equivalent Time" column shows what that time is in each timezone.
              </p>
            </details>
            <details className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <summary className={`font-medium cursor-pointer ${headingClass}`}>
                Are my timezone selections saved?
              </summary>
              <p className={`mt-3 text-sm ${textClass}`}>
                Yes! Your selected timezones and primary timezone are saved in your browser's local storage. They'll be there when you return.
              </p>
            </details>
          </div>
        </div>
      </div>
    </>
  );
}
