// /src/pages/TimezoneComparePage.jsx
import { useState, useEffect, useMemo } from "react";
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
    ? "bg-white/10 border border-white/15 backdrop-blur-xl"
    : "bg-white/80 border border-white/60 backdrop-blur-xl";

  return (
    <>
      <SEO
        title="Timezone Comparison | Compare Multiple Timezones - GeoSyncX"
        description="Compare multiple timezones side by side. Add cities, set a primary timezone, and see live time differences."
        keywords="timezone comparison, compare timezones, world clock comparison, time difference calculator"
        url="https://www.geosyncx.com/tools/timezone-compare"
      />

      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className={`text-3xl md:text-4xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
            Timezone Comparison
          </h1>
          <p className={`text-lg ${darkMode ? "text-white/70" : "text-slate-600"}`}>
            Compare multiple timezones side by side with live updates
          </p>
        </div>

        {/* Main Tool */}
        <TimeComparison
          darkMode={darkMode}
          primaryZone={primaryZone}
          setPrimaryZone={setPrimaryZone}
          selectedZones={selectedZones}
          setSelectedZones={setSelectedZones}
        />

        {/* How to Use */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>
            How to Use
          </h2>
          <ol className={`space-y-3 list-decimal list-inside ${darkMode ? "text-white/80" : "text-slate-700"}`}>
            <li><strong>Search and add timezones</strong> using the search box</li>
            <li><strong>Set your primary timezone</strong> by clicking the star icon</li>
            <li><strong>Compare times</strong> - all clocks update in real-time</li>
            <li><strong>Click any time</strong> to convert and see the equivalent in other zones</li>
          </ol>
        </div>

        {/* Related Tools */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>
            Related Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/tools/meeting-scheduler"
              className={`p-4 rounded-xl transition-all hover:scale-[1.02] ${darkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}
            >
              <h3 className="font-semibold text-sky-500">Meeting Scheduler →</h3>
              <p className={`text-sm mt-1 ${darkMode ? "text-white/60" : "text-slate-600"}`}>
                Schedule calls with these timezones
              </p>
            </Link>
            <Link
              to="/tools/best-meeting-time"
              className={`p-4 rounded-xl transition-all hover:scale-[1.02] ${darkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}
            >
              <h3 className="font-semibold text-sky-500">Best Meeting Time →</h3>
              <p className={`text-sm mt-1 ${darkMode ? "text-white/60" : "text-slate-600"}`}>
                Find the optimal overlap time
              </p>
            </Link>
            <Link
              to="/tools/timezone-finder"
              className={`p-4 rounded-xl transition-all hover:scale-[1.02] ${darkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}
            >
              <h3 className="font-semibold text-sky-500">Timezone Finder →</h3>
              <p className={`text-sm mt-1 ${darkMode ? "text-white/60" : "text-slate-600"}`}>
                Search timezones by city or country
              </p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
