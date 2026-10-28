// /src/BestMeetingFinder.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import { DateTime } from "luxon";
import { timezoneData } from "./timezones.js";
import { DEFAULT_WORK_HOURS } from "./workHours.js";

// Inline zone search bar
function ZoneSearch({ zones, primaryZone, onAdd, onRemove, darkMode }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(
      timezoneData.filter(tz =>
        tz.city?.toLowerCase().includes(q) ||
        tz.country?.toLowerCase().includes(q) ||
        tz.value?.toLowerCase().includes(q)
      ).slice(0, 8)
    );
  }, [query]);

  const inputClass = darkMode
    ? "bg-white/10 text-white placeholder:text-slate-300 border border-white/40"
    : "bg-white text-slate-900 placeholder:text-slate-600 border border-slate-400";

  return (
    <div className="space-y-3">
      {/* Added zones chips */}
      {zones.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {zones.map(z => {
            const label = timezoneData.find(t => t.value === z)?.city || z.split("/").pop().replace(/_/g, " ");
            const isPrimary = z === primaryZone;
            return (
              <span key={z} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                isPrimary
                  ? "bg-sky-700 text-white"
                  : darkMode ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"
              }`}>
                {label}
                {!isPrimary && (
                  <button type="button" onClick={() => onRemove(z)} aria-label={`Remove ${label}`} className="inline-flex items-center justify-center min-w-[28px] min-h-[28px] opacity-80 hover:opacity-100 text-xs leading-none rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"><span aria-hidden="true">✕</span></button>
                )}
                {isPrimary && <span className="sr-only">(primary)</span>}
              </span>
            );
          })}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <label htmlFor="bmf-add-city" className="sr-only">Add a city or country to compare</label>
        <input
          id="bmf-add-city"
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onBlur={e => {
            // Close the list when focus leaves the search box and its results
            if (!e.currentTarget.parentElement.contains(e.relatedTarget)) setResults([]);
          }}
          onKeyDown={e => {
            if (e.key === "Escape") { setResults([]); return; }
            if (e.key === "Enter" && results.length > 0) {
              e.preventDefault();
              onAdd(results[0].value);
              setQuery("");
              setResults([]);
            }
          }}
          placeholder="Add a city or country..."
          className={`w-full px-4 py-2.5 rounded-xl text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${inputClass}`}
        />
        {results.length > 0 && (
          <div className={`absolute z-20 mt-1 w-full rounded-xl shadow-lg overflow-hidden ${
            darkMode ? "bg-slate-800 border border-white/10" : "bg-white border border-slate-200"
          }`}>
            {results.map(tz => (
              <button
                key={tz.value}
                type="button"
                onClick={() => { onAdd(tz.value); setQuery(""); setResults([]); inputRef.current?.focus(); }}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400 ${
                  darkMode ? "hover:bg-white/10 text-white" : "hover:bg-slate-50 text-slate-900"
                }`}
              >
                <span className="font-medium">{tz.city}</span>
                <span className={`text-xs ${darkMode ? "text-slate-300" : "text-slate-600"}`}>{tz.country}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BestMeetingFinder({ zones: zonesProp, primaryZone: primaryZoneProp, onZonesChange, darkMode, is24 = false, prefs: prefsProp, setPrefs: setPrefsProp }) {
  // If zones are managed externally use them, else manage internally
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [internalPrimary, setInternalPrimary] = useState(() => {
    let stored = null;
    try { stored = localStorage.getItem("primaryZone"); } catch { /* storage blocked */ }
    return stored || detected || "UTC";
  });
  const [internalZones, setInternalZones] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("selectedZones") || "[]");
      return Array.isArray(saved) ? saved.filter(Boolean) : [];
    } catch { return []; }
  });

  const primaryZone = primaryZoneProp !== undefined ? primaryZoneProp : internalPrimary;
  const extraZones = zonesProp !== undefined
    ? zonesProp.filter(z => z !== primaryZone)
    : internalZones.filter(z => z !== primaryZone);
  const allZones = primaryZone ? [primaryZone, ...extraZones] : extraZones;

  const handleAdd = (value) => {
    if (zonesProp !== undefined && onZonesChange) {
      if (!allZones.includes(value)) onZonesChange([...allZones, value]);
    } else {
      if (value === internalPrimary) return;
      setInternalZones(prev => prev.includes(value) ? prev : [...prev, value]);
    }
  };

  const handleRemove = (value) => {
    if (zonesProp !== undefined && onZonesChange) {
      onZonesChange(allZones.filter(z => z !== value));
    } else {
      if (value === internalPrimary) {
        // promote first extra zone to primary
        const next = internalZones.filter(z => z !== value);
        setInternalPrimary(next[0] || detected);
        setInternalZones(next.slice(1));
      } else {
        setInternalZones(prev => prev.filter(z => z !== value));
      }
    }
  };

  // Persist internal state
  useEffect(() => {
    if (zonesProp === undefined) {
      localStorage.setItem("primaryZone", internalPrimary);
      localStorage.setItem("selectedZones", JSON.stringify(internalZones));
    }
  }, [internalPrimary, internalZones, zonesProp]);
  const validZones = useMemo(() => allZones.filter(Boolean), [allZones.join(",")]);
  const hasEnoughZones = validZones.length >= 2;

  // A stable string that changes whenever the zone set/order changes
  const zonesKey = useMemo(() => validZones.join("||"), [validZones]);

  // Nice city labels (static map from your timezoneData)
  const labelByZone = useMemo(() => {
    const m = new Map();
    for (const t of timezoneData) m.set(t.value, t.city);
    return m;
  }, []);

  // Per-zone working hours: use props if provided (for URL sharing), else own state
  const [localPrefs, setLocalPrefs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("bmf_prefs") || "{}");
      return saved && typeof saved === "object" ? saved : {};
    } catch { return {}; }
  });
  const prefs = prefsProp !== undefined ? prefsProp : localPrefs;
  const setPrefs = setPrefsProp !== undefined ? setPrefsProp : setLocalPrefs;

  // Track which result cards are expanded
  const [expandedCards, setExpandedCards] = useState(new Set());

  // Toggle expand/collapse
  const toggleCard = (key) =>
    setExpandedCards((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  // Whenever the list of zones changes:
  // 1) Ensure defaults exist for new zones
  // 2) Remove prefs for deleted zones
  // 3) Reset expandedCards (so indices don’t point to old items)
  useEffect(() => {
    if (!hasEnoughZones) return;

          setExpandedCards(new Set()); // reset open state on zones change

    setPrefs((prev) => {
      const next = { ...prev };
      let changed = false;

      // Add defaults for new
          for (const z of validZones) {
            if (!next[z]) {
              next[z] = { ...DEFAULT_WORK_HOURS };
          changed = true;
        }
      }
      // Remove deleted
      for (const key of Object.keys(next)) {
        if (!validZones.includes(key)) {
          delete next[key];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [zonesKey, hasEnoughZones, validZones]);

  // Persist prefs to localStorage only when managing own state (no props)
  useEffect(() => {
    if (setPrefsProp === undefined) {
      localStorage.setItem("bmf_prefs", JSON.stringify(prefs));
    }
  }, [prefs, setPrefsProp]);

  // Check if local time is within [start, end) (supports overnight windows)
  function isWithinRange(localDT, startHHMM, endHHMM) {
    const minutes = localDT.hour * 60 + localDT.minute;
    const [sH, sM] = startHHMM.split(":").map(Number);
    const [eH, eM] = endHHMM.split(":").map(Number);
    const startMin = (sH % 24) * 60 + (sM % 60);
    const endMin = (eH % 24) * 60 + (eM % 60);

    if (Number.isNaN(startMin) || Number.isNaN(endMin)) return false;
    if (startMin === endMin) return true; // treat equal as "always"
    if (startMin < endMin) return minutes >= startMin && minutes < endMin;
    return minutes >= startMin || minutes < endMin; // overnight (22:00 -> 06:00)
  }

  // Next 24h, every 30 minutes, in UTC
  // Re-roll the window every 5 minutes so a tab left open doesn't show stale slots
  const [slotTick, setSlotTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => { if (!document.hidden) setSlotTick((t) => t + 1); }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);
  const slotsUtc = useMemo(() => {
    const now = DateTime.utc().startOf("minute");
    const rounded = now.set({
      minute: now.minute >= 30 ? 30 : 0,
      second: 0,
      millisecond: 0,
    });
    const arr = [];
    for (let i = 0; i < 48; i++) arr.push(rounded.plus({ minutes: 30 * i }));
    return arr;
  }, [slotTick]);

  // Build recommendations: consecutive 30-minute slots where everyone is in working hours
  // are merged into one range, so a 4-hour overlap is one card, not eight.
  const timeFormat = is24 ? "HH:mm" : "h:mm a";
  const recommendations = useMemo(() => {
    if (!hasEnoughZones) return [];
    const okSlots = slotsUtc.filter((slot) =>
      validZones.every((z) => {
        const pref = prefs[z] || DEFAULT_WORK_HOURS;
        return isWithinRange(slot.setZone(z), pref.start, pref.end);
      })
    );

    const ranges = [];
    for (const slot of okSlots) {
      const last = ranges[ranges.length - 1];
      if (last && slot.toMillis() - last.end.toMillis() === 30 * 60 * 1000) {
        last.end = slot;
      } else {
        ranges.push({ start: slot, end: slot });
      }
    }

    return ranges.slice(0, 12).map(({ start, end }) => {
      const endExclusive = end.plus({ minutes: 30 });
      const cards = validZones.map((z) => {
        const s0 = start.setZone(z);
        const e0 = endExclusive.setZone(z);
        const label = labelByZone.get(z) || z.split("/").pop()?.replace(/_/g, " ") || z;
        return {
          zone: z,
          city: label,
          day: s0.toFormat("ccc d LLL"),
          time: `${s0.toFormat(timeFormat)} – ${e0.toFormat(timeFormat)}`,
        };
      });
      return { start, cards };
    });
  }, [hasEnoughZones, slotsUtc, zonesKey, prefs, labelByZone, validZones, timeFormat]);

  // Update working hours for a zone
  const updatePref = (zone, key, value) => {
    setPrefs((prev) => ({
      ...prev,
      [zone]: { ...(prev[zone] || DEFAULT_WORK_HOURS), [key]: value },
    }));
  };

  // Copy hours from one zone to all
  const copyToAll = (sourceZone) => {
    const src = prefs[sourceZone];
    if (!src) return;
    setPrefs((prev) => {
      const next = { ...prev };
      for (const z of validZones) {
        next[z] = { ...src };
      }
      return next;
    });
  };

  const cardBase = darkMode
    ? "bg-white/10 text-white border border-white/15 shadow-xl"
    : "bg-white/70 text-gray-900 border border-white/60 shadow-xl";
  const inputClass = darkMode
    ? "bg-white/5 border border-white/40 text-white placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
    : "bg-white/60 border border-slate-400 text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500";
  const tableHeaderClass = darkMode ? "bg-white/5" : "bg-white/70";
  const rowHoverClass = darkMode ? "hover:bg-white/10" : "hover:bg-white/80";

  return (
    <div className={`p-6 rounded-2xl backdrop-blur-xl transition-colors duration-300 ${cardBase}`}>
      {/* Location search */}
      <div className="mb-5">
        <ZoneSearch
          zones={validZones}
          primaryZone={primaryZone}
          onAdd={handleAdd}
          onRemove={handleRemove}
          darkMode={darkMode}
        />
      </div>

      {!hasEnoughZones && (
        <div className="text-center py-6 text-sm">
          Add at least 2 locations to find overlapping times
        </div>
      )}

      {hasEnoughZones && (<>
      {/* Header + collapsible hours editor */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-lg">Best Times</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Overlap within each city's working hours (default 09:00 – 18:00; change them under Edit working hours).
          </p>
        </div>
        <details className="ml-auto">
          <summary className="cursor-pointer select-none text-sm font-medium hover:underline rounded px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
            <span aria-hidden="true">▸ </span>Edit working hours
          </summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-xs md:text-sm">
              <thead>
                <tr className={tableHeaderClass}>
                  <th scope="col" className="p-2 text-left">City</th>
                  <th scope="col" className="p-2 text-left hidden md:table-cell">Timezone</th>
                  <th scope="col" className="p-2 text-left">Start</th>
                  <th scope="col" className="p-2 text-left">End</th>
                  <th scope="col" className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {validZones.map((z) => {
                  const city = labelByZone.get(z) || z.split("/").pop()?.replace(/_/g, " ") || z;
                  const p = prefs[z] || DEFAULT_WORK_HOURS;
                  return (
                    <tr key={z} className={`${rowHoverClass} transition`}>
                      <td className="p-2 font-medium">{city}</td>
                      <td className="p-2 hidden md:table-cell">{z}</td>
                      <td className="p-2">
                        <input
                          type="time"
                          aria-label={`Working hours start in ${city}`}
                          value={p.start}
                          onChange={(e) => updatePref(z, "start", e.target.value)}
                          className={`p-2 rounded-lg ${inputClass}`}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="time"
                          aria-label={`Working hours end in ${city}`}
                          value={p.end}
                          onChange={(e) => updatePref(z, "end", e.target.value)}
                          className={`p-2 rounded-lg ${inputClass}`}
                        />
                      </td>
                      <td className="p-2">
                        <button
                          type="button"
                          onClick={() => copyToAll(z)}
                          aria-label={`Copy ${city} working hours to all cities`}
                          className="px-3 py-2 rounded-lg bg-sky-700 text-white hover:bg-sky-600 text-xs transition-transform active:scale-95 motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                          title="Copy these hours to all"
                        >
                          Copy to all
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>
      </div>

      {/* One card per overlap range; the first is the earliest option */}
      <div className="mt-3 grid gap-3 grid-cols-[repeat(auto-fill,minmax(230px,1fr))]">
        {recommendations.length === 0 ? (
          <div className="text-sm col-span-full">
            No perfect overlap found in the next 24 hours. Try adjusting hours.
          </div>
        ) : (
          recommendations.map((r, idx) => {
            const isOpen = expandedCards.has(idx);
            const visible = isOpen ? r.cards : r.cards.slice(0, 3); // show 3 by default
            const hiddenCount = Math.max(0, r.cards.length - visible.length);
            const linkClass = darkMode ? "text-sky-200" : "text-sky-800";

            return (
              <div
                key={`${zonesKey}-${idx}`} // key includes zonesKey so list remounts on zone changes
                className={`rounded-xl border p-3 flex flex-col gap-2 transition ${
                  darkMode
                    ? "border-emerald-400/40 bg-emerald-500/10"
                    : "border-emerald-600/40 bg-emerald-500/10"
                }`}
              >
                <div className="text-xs leading-none flex items-center justify-between">
                  <span className="font-semibold uppercase tracking-wide">
                    {idx === 0 ? "Earliest overlap" : `Option ${idx + 1}`}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-black/10 dark:bg-white/10">
                    {r.cards.length} cities
                  </span>
                </div>

                {/* Cities & time ranges, with the date in each city */}
                <ul className={`text-sm leading-snug space-y-1 ${isOpen ? "max-h-48 overflow-auto pr-1" : ""}`}>
                  {visible.map((c) => (
                    <li key={c.zone}>
                      <span className="font-medium">{c.city}</span>
                      <span className="block tabular-nums">
                        {c.time} <span className={`text-xs ${darkMode ? "text-slate-300" : "text-slate-600"}`}>{c.day}</span>
                      </span>
                    </li>
                  ))}
                </ul>

                {(hiddenCount > 0 || isOpen) && (
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    className={`self-start underline py-1 text-sm rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${linkClass}`}
                    onClick={() => toggleCard(idx)}
                  >
                    {isOpen ? "Show fewer" : `+${hiddenCount} more…`}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
      </>)}
    </div>
  );
}
