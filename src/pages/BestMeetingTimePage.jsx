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
    ? "bg-white/10 border border-white/15 backdrop-blur-xl"
    : "bg-white/80 border border-white/60 backdrop-blur-xl";

  return (
    <>
      <SEO
        title="Best Meeting Time Finder | Find Optimal Overlap - GeoSyncX"
        description="Automatically discover meeting times where all participants are within their working hours. Perfect for global teams."
        keywords="best meeting time, timezone overlap finder, meeting time across timezones, find common meeting time"
        url="https://www.geosyncx.com/tools/best-meeting-time"
      />

      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className={`text-3xl md:text-4xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
            Best Meeting Time Finder
          </h1>
          <p className={`text-lg ${darkMode ? "text-white/70" : "text-slate-600"}`}>
            Find the perfect overlap when everyone is within working hours
          </p>
        </div>

        {/* Step 1: Add Timezones */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>
            Step 1: Add Participant Timezones
          </h2>
          <TimeComparison
            darkMode={darkMode}
            primaryZone={primaryZone}
            setPrimaryZone={setPrimaryZone}
            selectedZones={selectedZones}
            setSelectedZones={setSelectedZones}
          />
        </div>

        {/* Step 2: Find Best Time */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>
            Step 2: View Best Meeting Times
          </h2>
          {sortedTimezones.length >= 2 ? (
            <BestMeetingFinder zones={sortedTimezones} darkMode={darkMode} />
          ) : (
            <div className={`text-center py-12 ${darkMode ? "text-white/60" : "text-slate-500"}`}>
              <p className="text-lg">Add at least 2 timezones above to find the best meeting times</p>
              <p className="text-sm mt-2">Search for cities, countries, or phone codes like +91 or +44</p>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🟢</div>
              <h3 className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>Green = Great</h3>
              <p className={`text-sm mt-1 ${darkMode ? "text-white/60" : "text-slate-600"}`}>
                Everyone is within working hours (9 AM - 6 PM)
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🟡</div>
              <h3 className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>Yellow = Okay</h3>
              <p className={`text-sm mt-1 ${darkMode ? "text-white/60" : "text-slate-600"}`}>
                Some participants outside normal hours
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🔴</div>
              <h3 className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>Red = Avoid</h3>
              <p className={`text-sm mt-1 ${darkMode ? "text-white/60" : "text-slate-600"}`}>
                Someone would need to wake up at night
              </p>
            </div>
          </div>
        </div>

        {/* Related Tools */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>
            Related Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/tools/meeting-scheduler"
              className={`p-4 rounded-xl transition-all hover:scale-[1.02] ${darkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}
            >
              <h3 className="font-semibold text-sky-500">Meeting Scheduler →</h3>
              <p className={`text-sm mt-1 ${darkMode ? "text-white/60" : "text-slate-600"}`}>
                Pick a specific time for your meeting
              </p>
            </Link>
            <Link
              to="/tools/timezone-compare"
              className={`p-4 rounded-xl transition-all hover:scale-[1.02] ${darkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}
            >
              <h3 className="font-semibold text-sky-500">Timezone Compare →</h3>
              <p className={`text-sm mt-1 ${darkMode ? "text-white/60" : "text-slate-600"}`}>
                Compare timezones side by side
              </p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
