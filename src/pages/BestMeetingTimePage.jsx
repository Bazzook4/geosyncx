// /src/pages/BestMeetingTimePage.jsx
import { useState, useEffect, useMemo } from "react";
import SEO from "../SEO";
import BestMeetingFinder from "../BestMeetingFinder";
import TimeComparison from "../TimeComparison";
import { Link } from "react-router-dom";
import { normalizeTimezoneName } from "../timezones.js";

export default function BestMeetingTimePage({ darkMode }) {
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

  const sortedTimezones = useMemo(() => {
    const unique = selectedZones.filter((z) => z && z !== primaryZone);
    return primaryZone ? [primaryZone, ...unique] : unique;
  }, [primaryZone, selectedZones]);

  const cardClass = darkMode
    ? "bg-white/5 border border-white/10 backdrop-blur-xl"
    : "bg-white/80 border border-white/60 backdrop-blur-xl";

  const headingClass = darkMode ? "text-white" : "text-slate-900";
  const textClass = darkMode ? "text-white/70" : "text-slate-600";

  return (
    <>
      <SEO
        title="Best Meeting Time Finder | Find Optimal Overlap - GeoSyncX"
        description="Automatically discover meeting times where all participants are within their working hours. Perfect for global teams."
        keywords="best meeting time, timezone overlap finder, meeting time across timezones, find common meeting time"
        url="https://www.geosyncx.com/tools/best-meeting-time"
      />

      <div className="w-full max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className={`text-3xl md:text-4xl font-bold ${headingClass}`}>
            Best Meeting Time Finder
          </h1>
          <p className={`text-lg ${textClass}`}>
            Find when everyone is within working hours
          </p>
        </div>

        {/* Quick Steps */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold">1</div>
              <div>
                <p className={`font-medium ${headingClass}`}>Add Timezones</p>
                <p className={`text-sm ${textClass}`}>Search cities or phone codes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold">2</div>
              <div>
                <p className={`font-medium ${headingClass}`}>View Results</p>
                <p className={`text-sm ${textClass}`}>See color-coded time slots</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold">3</div>
              <div>
                <p className={`font-medium ${headingClass}`}>Pick Green</p>
                <p className={`text-sm ${textClass}`}>Everyone's awake!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Timezones */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <h2 className={`text-lg font-semibold mb-4 ${headingClass}`}>
            Add Participant Timezones
          </h2>
          <TimeComparison
            darkMode={darkMode}
            primaryZone={primaryZone}
            setPrimaryZone={setPrimaryZone}
            selectedZones={selectedZones}
            setSelectedZones={setSelectedZones}
            showCalendar={false}
          />
        </div>

        {/* Best Times Result */}
        {sortedTimezones.length >= 2 ? (
          <div className={`rounded-2xl p-6 ${cardClass}`}>
            <h2 className={`text-lg font-semibold mb-4 ${headingClass}`}>
              Best Meeting Times
            </h2>
            <BestMeetingFinder zones={sortedTimezones} darkMode={darkMode} />
          </div>
        ) : (
          <div className={`rounded-2xl p-8 text-center ${cardClass}`}>
            <div className="text-5xl mb-4">🌍</div>
            <p className={`text-lg font-medium ${headingClass}`}>
              Add at least 2 timezones to find overlapping hours
            </p>
            <p className={`text-sm mt-2 ${textClass}`}>
              Try searching for cities like "London", "New York" or phone codes like "+91"
            </p>
          </div>
        )}

        {/* Legend */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <h2 className={`text-lg font-semibold mb-4 ${headingClass}`}>
            Understanding the Colors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
              </div>
              <div>
                <h3 className={`font-semibold ${headingClass}`}>Green - Perfect</h3>
                <p className={`text-sm ${textClass}`}>
                  Everyone is within 9 AM - 6 PM local time
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-amber-500"></div>
              </div>
              <div>
                <h3 className={`font-semibold ${headingClass}`}>Yellow - Okay</h3>
                <p className={`text-sm ${textClass}`}>
                  Some people are early morning or evening
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-rose-500"></div>
              </div>
              <div>
                <h3 className={`font-semibold ${headingClass}`}>Red - Avoid</h3>
                <p className={`text-sm ${textClass}`}>
                  Someone would be asleep or very late
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Tools */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <h2 className={`text-lg font-semibold mb-4 ${headingClass}`}>
            Related Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/tools/timezone-compare"
              className={`p-4 rounded-xl transition-all hover:scale-[1.02] ${darkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}
            >
              <h3 className="font-semibold text-sky-500">Timezone Compare →</h3>
              <p className={`text-sm mt-1 ${textClass}`}>
                View clocks side by side
              </p>
            </Link>
            <Link
              to="/tools/phone-code-lookup"
              className={`p-4 rounded-xl transition-all hover:scale-[1.02] ${darkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}
            >
              <h3 className="font-semibold text-sky-500">Phone Code Lookup →</h3>
              <p className={`text-sm mt-1 ${textClass}`}>
                Find timezone from phone number
              </p>
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <h2 className={`text-lg font-semibold mb-6 ${headingClass}`}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <summary className={`font-medium cursor-pointer ${headingClass}`}>
                How does the best meeting time finder work?
              </summary>
              <p className={`mt-3 text-sm ${textClass}`}>
                Add the timezones of all participants, and we analyze the next 24 hours to find slots where everyone is within their working hours (default 9 AM - 6 PM). Green slots mean everyone is comfortable.
              </p>
            </details>
            <details className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <summary className={`font-medium cursor-pointer ${headingClass}`}>
                Can I customize working hours for each participant?
              </summary>
              <p className={`mt-3 text-sm ${textClass}`}>
                Yes! Click "Working hours" to expand the settings. You can set custom start and end times for each timezone, and use "Copy to all" to apply the same hours to everyone.
              </p>
            </details>
            <details className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <summary className={`font-medium cursor-pointer ${headingClass}`}>
                What do the colors mean?
              </summary>
              <p className={`mt-3 text-sm ${textClass}`}>
                Green means everyone is within their working hours (ideal). Yellow means some people are in early morning or evening hours. Red means someone would be outside reasonable hours - best avoided.
              </p>
            </details>
            <details className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <summary className={`font-medium cursor-pointer ${headingClass}`}>
                What if no perfect time slots are found?
              </summary>
              <p className={`mt-3 text-sm ${textClass}`}>
                If there's no overlap where everyone is in working hours, try adjusting the working hours settings. You might need to extend someone's availability or consider alternating inconvenient times fairly.
              </p>
            </details>
          </div>
        </div>
      </div>
    </>
  );
}
