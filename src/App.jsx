// /src/App.jsx
import { useEffect, useState } from "react";
import SEO from "./SEO";
import { DEFAULT_SEO } from "./seo-config";
import TimeComparison from "./TimeComparison.jsx";
import InAppGuide from "./InAppGuide.jsx";
import AdUnit from "./AdUnit.jsx";
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

  // 12h/24h display, shown in the clock table
  const [is24, setIs24] = useState(() => {
    try {
      return localStorage.getItem("timeFormat24") === "true";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("timeFormat24", is24);
    } catch {
      // ignore
    }
  }, [is24]);

  // Per-city working hours, shared so the table can show who is in working hours
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("bmf_prefs") || "{}");
      return saved && typeof saved === "object" ? saved : {};
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("bmf_prefs", JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }, [prefs]);

  const headingClass = darkMode ? "text-white" : "text-slate-900";
  const textClass = darkMode ? "text-slate-300" : "text-slate-700";

  return (
    <>
      {!converter && <SEO {...DEFAULT_SEO} />}
      <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header tagline (converter pages bring their own h1). Kept as the h1 for SEO, tucked up under the site header. */}
        {!converter && (
        <div className="-mt-3 md:-mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className={`text-base md:text-lg font-semibold ${headingClass}`}>
            Compare time zones and find a meeting time that works for everyone
          </h1>
          <p className={`text-xs md:text-sm ${textClass}`}>
            <strong>1.</strong> Add cities &nbsp;·&nbsp; <strong>2.</strong> Pick a time &nbsp;·&nbsp; <strong>3.</strong> See it in every zone
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
            is24={is24}
            setIs24={setIs24}
            workHours={prefs}
            setWorkHours={setPrefs}
          />
        </div>

        <AdUnit slot={import.meta.env.VITE_ADSENSE_SLOT_TOOL} />

        {/* In-App Help Guide */}
        <InAppGuide darkMode={darkMode} activeTab="timezones" />
      </div>
    </>
  );
}
