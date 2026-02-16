// /src/App.jsx
import { useMemo, useEffect, useState } from "react";
import SEO from "./SEO";
import { DEFAULT_SEO } from "./seo-config";
import TimeComparison from "./TimeComparison.jsx";
import BestMeetingFinder from "./BestMeetingFinder.jsx";
import InAppGuide from "./InAppGuide.jsx";
import { normalizeTimezoneName } from "./timezones.js";

export default function App({ darkMode }) {
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

  const headingClass = darkMode ? "text-white" : "text-slate-900";
  const textClass = darkMode ? "text-white/70" : "text-slate-600";

  return (
    <>
      <SEO {...DEFAULT_SEO} />
      <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className={`text-2xl md:text-3xl font-bold ${headingClass}`}>
            Command Center
          </h1>
          <p className={`text-sm ${textClass}`}>
            All your timezone tools in one place
          </p>
        </div>

        {/* Main Tool */}
        <div className="space-y-4 xl:space-y-6">
          <TimeComparison
            darkMode={darkMode}
            primaryZone={primaryZone}
            setPrimaryZone={setPrimaryZone}
            selectedZones={selectedZones}
            setSelectedZones={setSelectedZones}
          />
          <BestMeetingFinder zones={sortedTimezones} darkMode={darkMode} />
        </div>

        {/* In-App Help Guide */}
        <InAppGuide darkMode={darkMode} activeTab="timezones" />
      </div>
    </>
  );
}
