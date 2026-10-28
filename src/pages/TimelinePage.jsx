import { useState, useEffect, useMemo } from "react";
import { DateTime } from "luxon";
import { timezoneData } from "../timezones.js";
import SEO from "../SEO";

const STORAGE_KEY = "timeline.zones";
const DAY_COUNT = 6;

const localZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

function loadZones() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch {
    // storage blocked or corrupt; use defaults
  }
  return [...new Set([localZone(), "Asia/Kolkata", "America/New_York"])];
}

function labelFor(zone) {
  const entry = timezoneData.find((t) => t.value === zone);
  return {
    city: entry?.city || zone.split("/").pop().replace(/_/g, " "),
    country: entry?.country || zone,
  };
}

// Offset relative to the first row, e.g. "+5.5"
function relativeOffset(dt, base) {
  const diff = (dt.offset - base.offset) / 60;
  if (diff === 0) return "";
  return `${diff > 0 ? "+" : ""}${Number.isInteger(diff) ? diff : diff.toFixed(1)}`;
}

function Cell({ dt, is24, selected, onSelect, darkMode }) {
  const isStartOfDay = dt.hour === 0;
  const night = dt.hour < 6 || dt.hour >= 22;
  const early = (dt.hour >= 6 && dt.hour < 8) || (dt.hour >= 20 && dt.hour < 22);

  const tone = night
    ? darkMode ? "bg-sky-900/70 text-sky-100" : "bg-sky-600 text-white"
    : early
    ? darkMode ? "bg-sky-900/30 text-sky-200" : "bg-sky-200 text-sky-900"
    : darkMode ? "bg-white/5 text-white" : "bg-white text-slate-800";

  const hour = is24 ? String(dt.hour).padStart(2, "0") : dt.toFormat("h");
  const suffix = dt.minute ? `:${String(dt.minute).padStart(2, "0")}` : "";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={dt.toFormat(is24 ? "ccc d LLL HH:mm" : "ccc d LLL h:mm a")}
      className={`flex-1 min-w-[38px] h-12 flex flex-col items-center justify-center leading-none transition-colors ${tone} ${
        selected ? "ring-2 ring-inset ring-amber-400 z-10" : "hover:brightness-95"
      }`}
    >
      {isStartOfDay ? (
        <>
          <span className="text-[10px] uppercase opacity-80">{dt.toFormat("LLL")}</span>
          <span className="text-sm font-semibold">{dt.day}</span>
        </>
      ) : (
        <>
          <span className="text-sm font-semibold tabular-nums">
            {hour}
            <span className="text-[10px] font-normal opacity-70">{suffix}</span>
          </span>
          {!is24 && <span className="text-[10px] opacity-70">{dt.toFormat("a").toLowerCase()}</span>}
        </>
      )}
    </button>
  );
}

export default function TimelinePage({ darkMode }) {
  const [zones, setZones] = useState(loadZones);
  const [dayOffset, setDayOffset] = useState(0);
  const [is24, setIs24] = useState(false);
  const [selectedHour, setSelectedHour] = useState(() => DateTime.now().setZone(loadZones()[0]).hour);
  const [query, setQuery] = useState("");
  const [now, setNow] = useState(() => DateTime.now());

  useEffect(() => {
    const id = setInterval(() => setNow(DateTime.now()), 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));
    } catch {
      // ignore
    }
  }, [zones]);

  const baseZone = zones[0];
  const baseDay = now.setZone(baseZone).startOf("day").plus({ days: dayOffset });
  // The instant the highlighted column represents, anchored on the first row
  const selectedInstant = baseDay.plus({ hours: selectedHour });

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return timezoneData
      .filter((t) => !zones.includes(t.value) && `${t.city} ${t.country} ${t.value}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, zones]);

  const addZone = (value) => {
    setZones((z) => [...z, value]);
    setQuery("");
  };
  const removeZone = (value) => setZones((z) => (z.length > 1 ? z.filter((v) => v !== value) : z));
  const makeHome = (value) => setZones((z) => [value, ...z.filter((v) => v !== value)]);

  const days = Array.from({ length: DAY_COUNT }, (_, i) => now.setZone(baseZone).plus({ days: i }));

  const panel = darkMode ? "bg-slate-900/60 border-white/10" : "bg-white border-slate-200";
  const muted = darkMode ? "text-white/60" : "text-slate-500";
  const ghostBtn = darkMode ? "hover:bg-white/10" : "hover:bg-slate-100";

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <SEO
        title="Time Zone Timeline | GeoSyncX"
        description="Compare cities side by side on an hourly timeline and find the hour that works for everyone."
        url="https://www.geosyncx.com/tools/timeline"
      />

      <div className={`rounded-2xl border shadow-sm ${panel}`}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-3 border-b border-inherit">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="+ Add place or timezone"
              aria-label="Add place or timezone"
              className={`w-full px-3 py-2 rounded-lg text-sm outline-none border focus:ring-2 focus:ring-sky-400 ${
                darkMode ? "bg-white/5 border-white/10 placeholder-white/40" : "bg-white border-slate-300"
              }`}
            />
            {matches.length > 0 && (
              <ul
                className={`absolute z-20 mt-1 w-full rounded-lg border shadow-lg overflow-hidden ${
                  darkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
                }`}
              >
                {matches.map((t) => (
                  <li key={t.value}>
                    <button
                      type="button"
                      onClick={() => addZone(t.value)}
                      className={`w-full text-left px-3 py-2 text-sm ${ghostBtn}`}
                    >
                      <span className="font-medium">{t.city}</span>
                      <span className={`ml-2 ${muted}`}>
                        {t.country} · {t.gmt}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div role="tablist" aria-label="Day" className="flex items-center gap-1 text-sm">
            {days.map((d, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={dayOffset === i}
                onClick={() => setDayOffset(i)}
                className={`px-3 py-1.5 rounded-lg ${
                  dayOffset === i ? "bg-sky-500 text-white font-semibold" : ghostBtn
                }`}
              >
                {i === 0 ? `${d.toFormat("LLL d")}` : d.toFormat("d")}
              </button>
            ))}
          </div>

          <div className="ml-auto flex rounded-lg overflow-hidden border border-inherit text-xs font-semibold">
            {[
              ["am/pm", false],
              ["24h", true],
            ].map(([label, value]) => (
              <button
                key={label}
                onClick={() => setIs24(value)}
                aria-pressed={is24 === value}
                className={`px-3 py-1.5 ${is24 === value ? "bg-sky-500 text-white" : ghostBtn}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-inherit border-inherit">
          {zones.map((zone, idx) => {
            const { city, country } = labelFor(zone);
            const atSelected = selectedInstant.setZone(zone);
            const rowStart = baseDay.setZone(zone);
            const offset = idx === 0 ? "" : relativeOffset(rowStart, baseDay);

            return (
              <div key={zone} className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 p-3">
                <div className="flex items-center gap-3 lg:w-72 shrink-0">
                  <button
                    onClick={() => makeHome(zone)}
                    title={idx === 0 ? "Home" : "Make home"}
                    aria-label={idx === 0 ? `${city} is home` : `Make ${city} home`}
                    className={`w-6 text-center ${idx === 0 ? "text-sky-500" : muted}`}
                  >
                    {idx === 0 ? "⌂" : offset || "·"}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{city}</div>
                    <div className={`text-xs truncate ${muted}`}>{country}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular-nums">
                      {atSelected.toFormat(is24 ? "HH:mm" : "h:mm a")}
                    </div>
                    <div className={`text-xs ${muted}`}>{atSelected.toFormat("ccc, LLL d")}</div>
                  </div>
                </div>

                <div className="flex flex-1 overflow-x-auto rounded-lg">
                  {Array.from({ length: 24 }, (_, h) => {
                    // Each column is the same instant across rows, shown in that row's zone
                    const dt = baseDay.plus({ hours: h }).setZone(zone);
                    return (
                      <Cell
                        key={h}
                        dt={dt}
                        is24={is24}
                        darkMode={darkMode}
                        selected={h === selectedHour}
                        onSelect={() => setSelectedHour(h)}
                      />
                    );
                  })}
                </div>

                <button
                  onClick={() => removeZone(zone)}
                  disabled={zones.length === 1}
                  aria-label={`Remove ${city}`}
                  className={`self-end lg:self-auto px-2 py-1 rounded text-lg leading-none disabled:opacity-20 ${muted} ${ghostBtn}`}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <p className={`text-xs ${muted}`}>
        Click any hour to compare it across places. Dark cells are night, light cells are daytime.
      </p>
    </div>
  );
}
