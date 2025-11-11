// /src/BestMeetingFinder.jsx
import { useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import { timezoneData } from "./timezones.js";

export default function BestMeetingFinder({ zones = [], darkMode }) {
  // Normalize & guard
  const validZones = useMemo(
    () => (Array.isArray(zones) ? zones.filter(Boolean) : []),
    [zones]
  );
  const hasEnoughZones = validZones.length >= 2;

  // A stable string that changes whenever the zone set/order changes
  const zonesKey = useMemo(() => validZones.join("||"), [validZones]);

  // Nice city labels (static map from your timezoneData)
  const labelByZone = useMemo(() => {
    const m = new Map();
    for (const t of timezoneData) m.set(t.value, t.city);
    return m;
  }, []);

  // Per-zone working hours: { [zone]: { start:"09:00", end:"18:00" } }
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("bmf_prefs") || "{}");
      return saved && typeof saved === "object" ? saved : {};
    } catch {
      return {};
    }
  });

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
              next[z] = { start: "11:00", end: "19:00" };
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

  // Persist prefs to localStorage
  useEffect(() => {
    localStorage.setItem("bmf_prefs", JSON.stringify(prefs));
  }, [prefs]);

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

  // Next 24h, every 30 minutes, in UTC (recomputed hourly)
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
  }, []); // static window is fine; new recommendations will reflect zones/prefs

  // Build recommendations; re-run on zonesKey or prefs change
  const recommendations = useMemo(() => {
    if (!hasEnoughZones) return [];
    const out = [];

    for (const slot of slotsUtc) {
      const cards = validZones.map((z) => {
        const local = slot.setZone(z);
        const pref = prefs[z] || { start: "09:00", end: "18:00" };
        const ok = isWithinRange(local, pref.start, pref.end);
        const label = labelByZone.get(z) || z.split("/").pop()?.replace(/_/g, " ") || z;
        return { zone: z, city: label, time: local.toFormat("hh:mm a"), ok };
      });

      if (cards.every((c) => c.ok)) out.push({ slot, cards });

      if (out.length >= 24) break; // keep UI tidy
    }
    return out;
  }, [hasEnoughZones, slotsUtc, zonesKey, prefs, labelByZone, validZones]);

  // Update working hours for a zone
  const updatePref = (zone, key, value) => {
    setPrefs((prev) => ({
      ...prev,
      [zone]: { ...(prev[zone] || { start: "09:00", end: "18:00" }), [key]: value },
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
    ? "bg-white/5 text-white placeholder:text-white/50"
    : "bg-white/60 text-gray-900 placeholder:text-gray-500";
  const tableHeaderClass = darkMode ? "bg-white/5" : "bg-white/70";
  const rowHoverClass = darkMode ? "hover:bg-white/10" : "hover:bg-white/80";

  if (!hasEnoughZones) {
    return (
      <div
        className={`p-6 rounded-2xl mt-4 backdrop-blur-xl transition-colors duration-300 ${cardBase}`}
      >
        <h3 className="font-semibold mb-2 tracking-wide uppercase text-xs opacity-80">
          Best Meeting Time Finder
        </h3>
        <p className="text-sm opacity-80">
          Add at least two timezones to see overlapping working hours.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`p-6 rounded-2xl mt-4 backdrop-blur-xl transition-colors duration-300 ${cardBase}`}
    >
      {/* Header + collapsible hours editor */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold tracking-wide uppercase text-xs opacity-80">
          Best Meeting Time Finder
        </h3>
        <details className="ml-auto">
          <summary className="cursor-pointer text-sm opacity-80 hover:opacity-100">
            Working hours
          </summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-xs md:text-sm">
              <thead>
                <tr className={tableHeaderClass}>
                  <th className="p-2 text-left">City</th>
                  <th className="p-2 text-left">Timezone</th>
                  <th className="p-2 text-left">Start</th>
                  <th className="p-2 text-left">End</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {validZones.map((z) => {
                  const city = labelByZone.get(z) || z.split("/").pop()?.replace(/_/g, " ") || z;
                  const p = prefs[z] || { start: "11:00", end: "19:00" };
                  return (
                    <tr key={z} className={`${rowHoverClass} transition`}>
                      <td className="p-2 font-medium">{city}</td>
                      <td className="p-2">{z}</td>
                      <td className="p-2">
                        <input
                          type="time"
                          value={p.start}
                          onChange={(e) => updatePref(z, "start", e.target.value)}
                          className={`p-2 rounded-lg ${inputClass}`}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="time"
                          value={p.end}
                          onChange={(e) => updatePref(z, "end", e.target.value)}
                          className={`p-2 rounded-lg ${inputClass}`}
                        />
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => copyToAll(z)}
                          className="px-3 py-2 rounded-lg bg-sky-500 text-white hover:bg-sky-400 text-xs transition-transform active:scale-95"
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

      {/* Compact WRAP layout: fixed-width cards */}
      <div className="mt-3 flex flex-wrap gap-3">
        {recommendations.length === 0 ? (
          <div className="text-sm opacity-80">
            No perfect overlap found in the next 24 hours. Try adjusting hours.
          </div>
        ) : (
          recommendations.map((r, idx) => {
            const isOpen = expandedCards.has(idx);
            const visible = isOpen ? r.cards : r.cards.slice(0, 3); // show 3 by default
            const hiddenCount = Math.max(0, r.cards.length - visible.length);

            return (
              <div
                key={`${zonesKey}-${idx}`} // key includes zonesKey so list remounts on zone changes
                className={`shrink-0 w-[220px] md:w-[240px] lg:w-[260px] rounded-xl border p-3 flex flex-col gap-2 transition ${
                  darkMode
                    ? "border-emerald-400/40 bg-emerald-500/10"
                    : "border-emerald-500/30 bg-emerald-500/10"
                }`}
                title={r.cards.map((c) => `${c.city}: ${c.time}`).join(" • ")}
              >
                <div className="text-[11px] opacity-80 leading-none flex items-center justify-between">
                  <span className="font-semibold uppercase tracking-wide">Best Slot</span>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-black/10 dark:bg-white/10">
                    {r.cards.length} cities
                  </span>
                </div>

                {/* Cities & times */}
                <div
                  className={`text-xs leading-tight ${
                    isOpen ? "max-h-40 overflow-auto pr-1" : ""
                  }`}
                >
                  {visible.map((c) => (
                    <div key={c.zone}>
                      <span className="font-medium">{c.city}</span>: {c.time}
                    </div>
                  ))}
                  {!isOpen && hiddenCount > 0 && (
                    <button
                      className={`opacity-80 hover:opacity-100 underline ${
                        darkMode ? "text-sky-200" : "text-sky-700"
                      }`}
                      onClick={() => toggleCard(idx)}
                    >
                      +{hiddenCount} more…
                    </button>
                  )}
                </div>

                {/* Footer */}
                <div className="text-[11px] opacity-80 mt-1 flex items-center justify-between">
                  <span>
                    In {r.cards[0].city}: <span className="font-medium">{r.cards[0].time}</span>
                  </span>
                  {isOpen && (
                    <button
                      className={`underline opacity-80 hover:opacity-100 ${
                        darkMode ? "text-sky-200" : "text-sky-700"
                      }`}
                      onClick={() => toggleCard(idx)}
                    >
                      Collapse
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
