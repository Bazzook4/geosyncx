// /src/pages/BestMeetingTimePage.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import SEO from "../SEO";
import BestMeetingFinder from "../BestMeetingFinder";
import TimeComparison from "../TimeComparison";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { normalizeTimezoneName } from "../timezones.js";

export default function BestMeetingTimePage({ darkMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // Parse zones from URL params if present
  const urlZones = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const zonesParam = params.get("zones");
    if (!zonesParam) return null;
    return zonesParam.split(",").map(z => normalizeTimezoneName(decodeURIComponent(z))).filter(Boolean);
  }, [location.search]);

  const [primaryZone, setPrimaryZone] = useState(() => {
    if (urlZones && urlZones.length > 0) return urlZones[0];
    const stored = localStorage.getItem("primaryZone");
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tz = stored || detected || "UTC";
    return normalizeTimezoneName(tz);
  });

  const [selectedZones, setSelectedZones] = useState(() => {
    if (urlZones && urlZones.length > 1) return urlZones.slice(1);
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

  // Working hours prefs (lifted from BestMeetingFinder so we can encode in URL)
  const [prefs, setPrefs] = useState(() => {
    // Try URL first
    const params = new URLSearchParams(location.search);
    const hoursParam = params.get("hours");
    if (hoursParam) {
      try { return JSON.parse(decodeURIComponent(hoursParam)); } catch {}
    }
    try {
      const saved = JSON.parse(localStorage.getItem("bmf_prefs") || "{}");
      return saved && typeof saved === "object" ? saved : {};
    } catch { return {}; }
  });

  // Sync to localStorage and URL whenever zones or prefs change
  useEffect(() => {
    localStorage.setItem("primaryZone", primaryZone);
    localStorage.setItem("selectedZones", JSON.stringify(selectedZones));
    localStorage.setItem("bmf_prefs", JSON.stringify(prefs));
    const allZones = [primaryZone, ...selectedZones.filter(z => z && z !== primaryZone)];
    const params = new URLSearchParams();
    params.set("zones", allZones.map(encodeURIComponent).join(","));
    // Only include hours in URL if any are non-default
    const hasCustomHours = Object.values(prefs).some(p => p.start !== "11:00" || p.end !== "19:00");
    if (hasCustomHours) params.set("hours", encodeURIComponent(JSON.stringify(prefs)));
    navigate({ search: params.toString() }, { replace: true });
  }, [primaryZone, selectedZones, prefs]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(window.location.href);
    }
  }, []);

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

      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${headingClass}`}>
              Best Meeting Time Finder
            </h1>
            <p className={`text-sm mt-1 ${textClass}`}>
              Find when everyone is within working hours
            </p>
          </div>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium transition-all active:scale-95"
          >
            {copied ? "✓ Copied!" : "🔗 Share"}
          </button>
        </div>

        {/* Best Times Result — PRIMARY FOCUS, always first */}
        {sortedTimezones.length >= 2 ? (
          <div className={`rounded-2xl p-6 ${cardClass} ring-2 ring-emerald-500/30`}>
            <h2 className={`text-lg font-semibold mb-4 ${headingClass}`}>
              ✅ Best Meeting Times
            </h2>
            <BestMeetingFinder zones={sortedTimezones} darkMode={darkMode} prefs={prefs} setPrefs={setPrefs} />
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

        {/* Add/Edit Timezones — collapsible once zones are set */}
        {sortedTimezones.length >= 2 ? (
          <details className={`rounded-2xl ${cardClass}`}>
            <summary className={`p-4 cursor-pointer select-none flex items-center gap-2 ${headingClass}`}>
              <span className="text-sm font-semibold">+ Add / Edit Timezones</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-white/10 text-white/60" : "bg-slate-100 text-slate-500"}`}>{sortedTimezones.length} added</span>
            </summary>
            <div className="px-6 pb-6">
              <TimeComparison
                darkMode={darkMode}
                primaryZone={primaryZone}
                setPrimaryZone={setPrimaryZone}
                selectedZones={selectedZones}
                setSelectedZones={setSelectedZones}
                showCalendar={false}
              />
            </div>
          </details>
        ) : (
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
