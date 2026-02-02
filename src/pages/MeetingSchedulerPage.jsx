// /src/pages/MeetingSchedulerPage.jsx
import { useState, useEffect, useMemo } from "react";
import SEO from "../SEO";
import TimeComparison from "../TimeComparison";
import { Link } from "react-router-dom";
import { normalizeTimezoneName } from "../timezones.js";

export default function MeetingSchedulerPage({ darkMode }) {
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
        title="Meeting Scheduler | Schedule Across Timezones - GeoSyncX"
        description="Schedule meetings with participants across different timezones. See everyone's local time at a glance and find the perfect meeting slot."
        keywords="meeting scheduler, schedule across timezones, international meeting planner, timezone meeting tool"
        url="https://www.geosyncx.com/tools/meeting-scheduler"
      />

      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className={`text-3xl md:text-4xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
            Meeting Scheduler
          </h1>
          <p className={`text-lg ${darkMode ? "text-white/70" : "text-slate-600"}`}>
            Schedule meetings with participants across the globe
          </p>
        </div>

        {/* Instructions */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <h2 className={`text-lg font-semibold mb-3 ${darkMode ? "text-white" : "text-slate-900"}`}>
            How to Schedule a Meeting
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <div className="text-2xl mb-2">1️⃣</div>
              <p className={`text-sm ${darkMode ? "text-white/80" : "text-slate-700"}`}>
                <strong>Add participants' timezones</strong> using the search box below
              </p>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <div className="text-2xl mb-2">2️⃣</div>
              <p className={`text-sm ${darkMode ? "text-white/80" : "text-slate-700"}`}>
                <strong>Click any time slot</strong> to see what time it is for everyone
              </p>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <div className="text-2xl mb-2">3️⃣</div>
              <p className={`text-sm ${darkMode ? "text-white/80" : "text-slate-700"}`}>
                <strong>Pick a slot</strong> that works for all participants
              </p>
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
        />

        {/* Pro Tips */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>
            Pro Tips
          </h2>
          <ul className={`space-y-3 ${darkMode ? "text-white/80" : "text-slate-700"}`}>
            <li className="flex items-start gap-3">
              <span className="text-sky-500">💡</span>
              <span>Set your timezone as primary to see all times relative to you</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-sky-500">💡</span>
              <span>Green hours (9 AM - 6 PM) are typically best for business calls</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-sky-500">💡</span>
              <span>Consider alternating meeting times to share inconvenience fairly</span>
            </li>
          </ul>
        </div>

        {/* Related Tools */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>
            Related Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/tools/best-meeting-time"
              className={`p-4 rounded-xl transition-all hover:scale-[1.02] ${darkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}
            >
              <h3 className="font-semibold text-sky-500">Best Meeting Time →</h3>
              <p className={`text-sm mt-1 ${darkMode ? "text-white/60" : "text-slate-600"}`}>
                Automatically find the optimal overlap
              </p>
            </Link>
            <Link
              to="/tools/phone-code-lookup"
              className={`p-4 rounded-xl transition-all hover:scale-[1.02] ${darkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}
            >
              <h3 className="font-semibold text-sky-500">Phone Code Lookup →</h3>
              <p className={`text-sm mt-1 ${darkMode ? "text-white/60" : "text-slate-600"}`}>
                Don't know where they're from? Look up their phone code
              </p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
