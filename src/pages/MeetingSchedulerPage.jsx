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
    ? "bg-white/5 border border-white/10 backdrop-blur-xl"
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

        {/* Quick Steps Guide */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold">1</div>
              <div>
                <p className={`font-medium ${darkMode ? "text-white" : "text-slate-900"}`}>Add Timezones</p>
                <p className={`text-sm ${darkMode ? "text-white/70" : "text-slate-600"}`}>Search cities or phone codes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold">2</div>
              <div>
                <p className={`font-medium ${darkMode ? "text-white" : "text-slate-900"}`}>Set Primary</p>
                <p className={`text-sm ${darkMode ? "text-white/70" : "text-slate-600"}`}>Star your timezone</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold">3</div>
              <div>
                <p className={`font-medium ${darkMode ? "text-white" : "text-slate-900"}`}>Pick a Time</p>
                <p className={`text-sm ${darkMode ? "text-white/70" : "text-slate-600"}`}>Enter date and time</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold">4</div>
              <div>
                <p className={`font-medium ${darkMode ? "text-white" : "text-slate-900"}`}>Schedule</p>
                <p className={`text-sm ${darkMode ? "text-white/70" : "text-slate-600"}`}>Add to calendar</p>
              </div>
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

        {/* FAQ Section */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <h2 className={`text-xl font-semibold mb-6 ${darkMode ? "text-white" : "text-slate-900"}`}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <summary className={`font-medium cursor-pointer ${darkMode ? "text-white" : "text-slate-900"}`}>
                How do I schedule a meeting across timezones?
              </summary>
              <p className={`mt-3 text-sm ${darkMode ? "text-white/70" : "text-slate-600"}`}>
                Add all participants' timezones, set your timezone as primary (click the star), then choose a date and time. You'll see what time it is for everyone. Use the scheduling form to add it to Google Calendar.
              </p>
            </details>
            <details className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <summary className={`font-medium cursor-pointer ${darkMode ? "text-white" : "text-slate-900"}`}>
                Will attendees see the meeting in their local time?
              </summary>
              <p className={`mt-3 text-sm ${darkMode ? "text-white/70" : "text-slate-600"}`}>
                Yes! When you add the event to Google Calendar, it's saved in UTC. Each attendee's calendar app automatically converts it to their local timezone.
              </p>
            </details>
            <details className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <summary className={`font-medium cursor-pointer ${darkMode ? "text-white" : "text-slate-900"}`}>
                How do I find the best time when everyone is available?
              </summary>
              <p className={`mt-3 text-sm ${darkMode ? "text-white/70" : "text-slate-600"}`}>
                Use our "Best Meeting Time" tool! It automatically analyzes all timezones and finds slots where everyone is within working hours.
              </p>
            </details>
            <details className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <summary className={`font-medium cursor-pointer ${darkMode ? "text-white" : "text-slate-900"}`}>
                Can I schedule recurring meetings?
              </summary>
              <p className={`mt-3 text-sm ${darkMode ? "text-white/70" : "text-slate-600"}`}>
                Our tool creates a single event. For recurring meetings, schedule one event first, then set up recurrence directly in Google Calendar after the event is created.
              </p>
            </details>
          </div>
        </div>
      </div>
    </>
  );
}
