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

// `converter` ({ primary, add }) opens the tool on exactly that pair, without touching the visitor's saved zones.
// Used by the /time/* converter pages.
export default function App({ darkMode, converter }) {
  const [preload] = useState(() =>
    converter
      ? { primary: normalizeTimezoneName(converter.primary), add: converter.add.map(normalizeTimezoneName) }
      : readPreload()
  );

  const [primaryZone, setPrimaryZone] = useState(() => {
    if (preload.primary) return preload.primary;
    let stored = null;
    try {
      stored = localStorage.getItem("primaryZone");
    } catch {
      // storage blocked; use the detected zone
    }
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tz = stored || detected || "UTC";
    return normalizeTimezoneName(tz);
  });

  const [selectedZones, setSelectedZones] = useState(() => {
    if (converter) return Array.from(new Set(preload.add));
    try {
      const raw = localStorage.getItem("selectedZones");
      // First visit: show two example cities so the table is not empty
      if (raw === null && preload.add.length === 0) return ["Europe/London", "America/New_York"];
      const saved = JSON.parse(raw || "[]");
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
    if (converter) return;
    try {
      localStorage.setItem("primaryZone", primaryZone);
      localStorage.setItem("selectedZones", JSON.stringify(selectedZones));
    } catch {
      // storage blocked; state still works for this session
    }
  }, [primaryZone, selectedZones, converter]);

  const sortedTimezones = useMemo(() => {
    const unique = selectedZones.filter((z) => z && z !== primaryZone);
    return primaryZone ? [primaryZone, ...unique] : unique;
  }, [primaryZone, selectedZones]);

  const headingClass = darkMode ? "text-white" : "text-slate-900";
  const textClass = darkMode ? "text-slate-300" : "text-slate-700";

  return (
    <>
      {!converter && <SEO {...DEFAULT_SEO} />}
      <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header (converter pages bring their own h1) */}
        {!converter && (
        <div className="text-center space-y-2">
          <h1 className={`text-2xl md:text-3xl font-bold ${headingClass}`}>
            Compare time zones and find a meeting time that works for everyone
          </h1>
          <p className={`text-sm md:text-base ${textClass}`}>
            <strong>1.</strong> Add cities below &nbsp;·&nbsp; <strong>2.</strong> Pick a time &nbsp;·&nbsp; <strong>3.</strong> See it in every zone
          </p>
        </div>
        )}

        {/* Main Tool */}
        <div className="space-y-4 xl:space-y-6">
          <TimeComparison
            darkMode={darkMode}
            primaryZone={primaryZone}
            setPrimaryZone={setPrimaryZone}
            selectedZones={selectedZones}
            setSelectedZones={setSelectedZones}
          />
          <BestMeetingFinder
            zones={sortedTimezones}
            primaryZone={primaryZone}
            onZonesChange={setSelectedZones}
            darkMode={darkMode}
          />
        </div>

        {/* In-App Help Guide */}
        <InAppGuide darkMode={darkMode} activeTab="timezones" />
      </div>
    </>
  );
}
