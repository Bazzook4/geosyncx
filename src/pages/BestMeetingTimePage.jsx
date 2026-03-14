// /src/pages/BestMeetingTimePage.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import SEO from "../SEO";
import BestMeetingFinder from "../BestMeetingFinder";
import { useLocation, useNavigate } from "react-router-dom";
import { normalizeTimezoneName } from "../timezones.js";

export default function BestMeetingTimePage({ darkMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const urlZones = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const zonesParam = params.get("zones");
    if (!zonesParam) return null;
    return zonesParam.split(",").map(z => normalizeTimezoneName(decodeURIComponent(z))).filter(Boolean);
  }, [location.search]);

  const [zones, setZones] = useState(() => {
    if (urlZones && urlZones.length > 0) return urlZones;
    try {
      const primary = localStorage.getItem("primaryZone");
      const saved = JSON.parse(localStorage.getItem("selectedZones") || "[]");
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const all = [primary || detected, ...saved.filter(Boolean)].map(normalizeTimezoneName);
      return Array.from(new Set(all.filter(Boolean)));
    } catch { return []; }
  });

  const [prefs, setPrefs] = useState(() => {
    const params = new URLSearchParams(location.search);
    const hoursParam = params.get("hours");
    if (hoursParam) { try { return JSON.parse(decodeURIComponent(hoursParam)); } catch {} }
    try {
      const saved = JSON.parse(localStorage.getItem("bmf_prefs") || "{}");
      return saved && typeof saved === "object" ? saved : {};
    } catch { return {}; }
  });

  // Sync to URL
  useEffect(() => {
    if (!zones.length) return;
    const params = new URLSearchParams();
    params.set("zones", zones.map(encodeURIComponent).join(","));
    const hasCustom = Object.values(prefs).some(p => p.start !== "11:00" || p.end !== "19:00");
    if (hasCustom) params.set("hours", encodeURIComponent(JSON.stringify(prefs)));
    navigate({ search: params.toString() }, { replace: true });
  }, [zones, prefs]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { alert(window.location.href); }
  }, []);

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
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className={`text-2xl font-bold ${headingClass}`}>Best Meeting Time Finder</h1>
            <p className={`text-sm ${textClass}`}>Find when everyone is available</p>
          </div>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium transition-all active:scale-95 shrink-0"
          >
            {copied ? "✓ Copied!" : "🔗 Share"}
          </button>
        </div>

        <BestMeetingFinder
          zones={zones}
          primaryZone={zones[0]}
          onZonesChange={setZones}
          darkMode={darkMode}
          prefs={prefs}
          setPrefs={setPrefs}
        />
      </div>
    </>
  );
}
