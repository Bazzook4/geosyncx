// /src/pages/BestMeetingTimePage.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import SEO from "../SEO";
import BestMeetingFinder from "../BestMeetingFinder";
import TimeComparison from "../TimeComparison";
import { useLocation, useNavigate } from "react-router-dom";
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
    return normalizeTimezoneName(stored || detected || "UTC");
  });

  const [selectedZones, setSelectedZones] = useState(() => {
    if (urlZones && urlZones.length > 1) return urlZones.slice(1);
    try {
      const saved = JSON.parse(localStorage.getItem("selectedZones") || "[]");
      if (!Array.isArray(saved)) return [];
      return Array.from(new Set(saved.filter(z => typeof z === "string" && z.trim()).map(normalizeTimezoneName)));
    } catch { return []; }
  });

  const [prefs, setPrefs] = useState(() => {
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

  useEffect(() => {
    localStorage.setItem("primaryZone", primaryZone);
    localStorage.setItem("selectedZones", JSON.stringify(selectedZones));
    localStorage.setItem("bmf_prefs", JSON.stringify(prefs));
    const allZones = [primaryZone, ...selectedZones.filter(z => z && z !== primaryZone)];
    const params = new URLSearchParams();
    params.set("zones", allZones.map(encodeURIComponent).join(","));
    const hasCustomHours = Object.values(prefs).some(p => p.start !== "11:00" || p.end !== "19:00");
    if (hasCustomHours) params.set("hours", encodeURIComponent(JSON.stringify(prefs)));
    navigate({ search: params.toString() }, { replace: true });
  }, [primaryZone, selectedZones, prefs]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { alert(window.location.href); }
  }, []);

  const sortedTimezones = useMemo(() => {
    const unique = selectedZones.filter(z => z && z !== primaryZone);
    return primaryZone ? [primaryZone, ...unique] : unique;
  }, [primaryZone, selectedZones]);

  const cardClass = darkMode
    ? "bg-white/5 border border-white/10 backdrop-blur-xl"
    : "bg-white/80 border border-white/60 backdrop-blur-xl";
  const headingClass = darkMode ? "text-white" : "text-slate-900";
  const textClass = darkMode ? "text-white/60" : "text-slate-500";

  return (
    <>
      <SEO
        title="Best Meeting Time Finder | Find Optimal Overlap - GeoSyncX"
        description="Automatically discover meeting times where all participants are within their working hours. Perfect for global teams."
        keywords="best meeting time, timezone overlap finder, meeting time across timezones, find common meeting time"
        url="https://www.geosyncx.com/tools/best-meeting-time"
      />

      <div className="w-full max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className={`text-2xl font-bold ${headingClass}`}>Best Meeting Time Finder</h1>
            <p className={`text-sm ${textClass}`}>Add locations to find when everyone is available</p>
          </div>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium transition-all active:scale-95 shrink-0"
          >
            {copied ? "✓ Copied!" : "🔗 Share"}
          </button>
        </div>

        {/* Single unified card */}
        <div className={`rounded-2xl ${cardClass}`}>
          {/* Location search */}
          <div className="p-5 border-b border-white/10">
            <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${textClass}`}>Locations</p>
            <TimeComparison
              darkMode={darkMode}
              primaryZone={primaryZone}
              setPrimaryZone={setPrimaryZone}
              selectedZones={selectedZones}
              setSelectedZones={setSelectedZones}
              showCalendar={false}
            />
          </div>

          {/* Best times result */}
          <div className="p-5">
            {sortedTimezones.length >= 2 ? (
              <BestMeetingFinder
                zones={sortedTimezones}
                darkMode={darkMode}
                prefs={prefs}
                setPrefs={setPrefs}
              />
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🌍</div>
                <p className={`font-medium ${headingClass}`}>Add at least 2 locations above</p>
                <p className={`text-sm mt-1 ${textClass}`}>Try "London", "New York" or "+91"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
