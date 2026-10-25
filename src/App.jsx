// /src/App.jsx
import { useMemo, useEffect, useState } from "react";
import SEO from "./SEO";
import { DEFAULT_SEO } from "./seo-config";
import TimeComparison from "./TimeComparison.jsx";
import BestMeetingFinder from "./BestMeetingFinder.jsx";
import InAppGuide from "./InAppGuide.jsx";
import { normalizeTimezoneName } from "./timezones.js";

const isValidZone = (tz) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

// Links from the /time/* converter pages arrive as /command-center?primary=Asia/Kolkata&add=Europe/London
// so the table opens with the pair already loaded. Invalid zone names are ignored.
function readPreload() {
  const params = new URLSearchParams(window.location.search);
  const primary = normalizeTimezoneName(params.get("primary") || "");
  const add = (params.get("add") || "")
    .split(",")
    .map((z) => normalizeTimezoneName(z.trim()))
    .filter(Boolean);
  return {
    primary: primary && isValidZone(primary) ? primary : null,
    add: add.filter(isValidZone),
  };
}

export default function App({ darkMode }) {
  const [preload] = useState(readPreload);

  const [primaryZone, setPrimaryZone] = useState(() => {
    if (preload.primary) return preload.primary;
    const stored = localStorage.getItem("primaryZone");
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tz = stored || detected || "UTC";
    return normalizeTimezoneName(tz);
  });

  const [selectedZones, setSelectedZones] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("selectedZones") || "[]");
      if (!Array.isArray(saved)) return Array.from(new Set(preload.add));
      const filtered = saved
        .filter((zone) => typeof zone === "string" && zone.trim().length > 0)
        .map(normalizeTimezoneName);
      return Array.from(new Set([...filtered, ...preload.add]));
    } catch {
      return Array.from(new Set(preload.add));
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
