import { useState, useEffect, useRef } from "react";
import { DateTime } from "luxon";
import { timezoneData, normalizeTimezoneName } from "../timezones.js";
import SEO from "../SEO";

function getWorkStatus(hour) {
  if (hour >= 8 && hour < 12) return { label: "Morning", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
  if (hour >= 12 && hour < 14) return { label: "Lunch", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
  if (hour >= 14 && hour < 18) return { label: "Afternoon", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
  if (hour >= 18 && hour < 21) return { label: "Evening", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" };
  return { label: "Off Hours", color: "bg-red-500/20 text-red-400 border-red-500/30" };
}

// Parse "3:00 PM", "15:30", "3pm", "3.30pm" etc into { hour, minute } or null
function parseTimeInput(raw) {
  const s = raw.trim().toLowerCase().replace(/[.\s]/g, ":");
  // Try HH:MM am/pm
  const m12 = s.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
  if (m12) {
    let h = parseInt(m12[1]);
    const min = parseInt(m12[2]);
    if (m12[3] === "pm" && h !== 12) h += 12;
    if (m12[3] === "am" && h === 12) h = 0;
    return { hour: h, minute: min };
  }
  // Try H am/pm
  const m12s = s.match(/^(\d{1,2})\s*(am|pm)$/);
  if (m12s) {
    let h = parseInt(m12s[1]);
    if (m12s[2] === "pm" && h !== 12) h += 12;
    if (m12s[2] === "am" && h === 12) h = 0;
    return { hour: h, minute: 0 };
  }
  // Try HH:MM (24h)
  const m24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    return { hour: parseInt(m24[1]), minute: parseInt(m24[2]) };
  }
  return null;
}

function ClockRow({ tz, label, isPrimary, darkMode, now, onRemove, isAnchor, onSetAnchor, anchorInput, onAnchorInputChange, onAnchorClear }) {
  const dt = now.setZone(tz);
  const hour = dt.hour;
  const status = getWorkStatus(hour);
  const isWhatIf = !!anchorInput && !isAnchor;
  const timeStr = dt.toFormat("h:mm a");
  const dateStr = dt.toFormat("EEE, MMM d");
  const offsetStr = dt.toFormat("ZZZZZ");

  const rowClass = darkMode
    ? isPrimary
      ? "bg-sky-500/10 border border-sky-500/30"
      : isAnchor
      ? "bg-indigo-500/10 border border-indigo-400/40"
      : "bg-white/5 border border-white/10"
    : isPrimary
    ? "bg-sky-50 border border-sky-200"
    : isAnchor
    ? "bg-indigo-50 border border-indigo-300"
    : "bg-white border border-slate-200";

  const textClass = darkMode ? "text-white/60" : "text-slate-500";
  const headingClass = darkMode ? "text-white" : "text-slate-900";
  const inputClass = darkMode
    ? "bg-white/10 border border-indigo-400/60 text-white placeholder-white/30 focus:border-indigo-300 focus:bg-white/15"
    : "bg-white border border-indigo-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500";

  return (
    <div className={`rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${rowClass}`}>
      {/* Pin indicator */}
      <div
        className="w-1 h-10 rounded-full flex-shrink-0"
        style={{
          background: isPrimary ? "#38bdf8" : isAnchor ? "#818cf8" : "rgba(255,255,255,0.08)",
        }}
      />

      {/* Col 1 — City label */}
      <div className="w-32 flex-shrink-0">
        <div className={`font-semibold text-sm leading-tight ${headingClass}`}>{label}</div>
        <div className={`text-xs ${textClass}`}>{offsetStr}</div>
        {isPrimary && <div className="text-[10px] text-sky-400 font-bold mt-0.5 tracking-wide">YOUR TIME</div>}
      </div>

      {/* Col 2 — Live time */}
      <div className="w-28 flex-shrink-0">
        <div className={`text-xl font-mono font-bold tabular-nums leading-tight ${isWhatIf ? "text-indigo-400" : headingClass}`}>
          {timeStr}
        </div>
        <div className={`text-xs ${textClass}`}>{dateStr}</div>
      </div>

      {/* Col 3 — Convert button or input (KEY HIGHLIGHT) */}
      <div className="w-44 flex-shrink-0">
        {isPrimary ? (
          <div className={`text-xs ${textClass} italic`}>pinned reference</div>
        ) : isAnchor ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={anchorInput}
              onChange={(e) => onAnchorInputChange(e.target.value)}
              placeholder="e.g. 3:00 PM"
              className={`w-28 px-3 py-1.5 rounded-lg text-sm font-mono outline-none transition-all ${inputClass}`}
              autoFocus
            />
            <button
              onClick={onAnchorClear}
              title="Back to live"
              className={`text-xs px-2 py-1.5 rounded-lg font-medium transition-colors ${darkMode ? "bg-white/10 text-white/60 hover:text-white hover:bg-white/20" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
            >
              Live
            </button>
          </div>
        ) : (
          <button
            onClick={onSetAnchor}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              darkMode
                ? "bg-indigo-500/15 border-indigo-400/30 text-indigo-300 hover:bg-indigo-500/30 hover:border-indigo-400/60 hover:text-indigo-200"
                : "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-400"
            }`}
          >
            <span>⇄</span>
            <span>Convert time</span>
          </button>
        )}
      </div>

      {/* Col 4 — Status badge */}
      <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${status.color}`}>
        {status.label}
      </div>

      {/* Col 5 — Remove */}
      <div className="w-6 flex-shrink-0 flex justify-center">
        {!isPrimary && (
          <button
            onClick={onRemove}
            className={`text-xs transition-colors ${darkMode ? "text-white/20 hover:text-red-400" : "text-slate-300 hover:text-red-500"}`}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default function LiveBoardPage({ darkMode }) {
  const [now, setNow] = useState(() => DateTime.now());
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // anchor = { tz, input } when in "what if" mode; null = live mode
  const [anchor, setAnchor] = useState(null);
  const inputRef = useRef(null);

  const primaryZone = normalizeTimezoneName(
    localStorage.getItem("primaryZone") ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    "Asia/Kolkata"
  );
  const primaryEntry = timezoneData.find((t) => t.value === primaryZone);
  const primaryLabel = primaryEntry ? `${primaryEntry.city}, ${primaryEntry.country}` : primaryZone;

  // Live tick — pauses when anchor is active and fully parsed
  useEffect(() => {
    if (anchor && parseTimeInput(anchor.input)) return; // frozen
    const id = setInterval(() => setNow(DateTime.now()), 1000);
    return () => clearInterval(id);
  }, [anchor]);

  // Compute the "what if" moment when anchor is set
  const whatIfNow = (() => {
    if (!anchor) return now;
    const parsed = parseTimeInput(anchor.input);
    if (!parsed) return now;
    // Build a DateTime in anchor's timezone at the typed time, using today's date
    const base = DateTime.now().setZone(anchor.tz);
    return base.set({ hour: parsed.hour, minute: parsed.minute, second: 0, millisecond: 0 });
  })();

  const displayNow = anchor && parseTimeInput(anchor.input) ? whatIfNow : now;
  const isWhatIfActive = anchor && !!parseTimeInput(anchor.input);

  // Search suggestions
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) { setSuggestions([]); return; }
    const matches = timezoneData
      .filter((t) =>
        t.city.toLowerCase().includes(q) ||
        t.country.toLowerCase().includes(q) ||
        t.gmt.toLowerCase().includes(q)
      )
      .slice(0, 8);
    setSuggestions(matches);
  }, [query]);

  function addRow(entry) {
    if (entry.value === primaryZone) return;
    if (rows.find((r) => r.value === entry.value)) return;
    setRows((prev) => [...prev, entry]);
    setQuery("");
    setSuggestions([]);
    inputRef.current?.blur();
  }

  function removeRow(value) {
    setRows((prev) => prev.filter((r) => r.value !== value));
    if (anchor?.tz === value) setAnchor(null);
  }

  function handleSetAnchor(tz) {
    setAnchor({ tz, input: "" });
  }

  function handleAnchorInput(val) {
    setAnchor((prev) => ({ ...prev, input: val }));
  }

  function clearAnchor() {
    setAnchor(null);
    setNow(DateTime.now());
  }

  const headingClass = darkMode ? "text-white" : "text-slate-900";
  const textClass = darkMode ? "text-white/60" : "text-slate-500";
  const inputClass = darkMode
    ? "bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-sky-400"
    : "bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-400";
  const suggestionClass = darkMode
    ? "bg-slate-800 border border-white/10"
    : "bg-white border border-slate-200 shadow-lg";

  return (
    <>
      <SEO
        title="Live Board — Real-Time World Clocks | GeoSyncX"
        description="Pin your timezone, add any city, and instantly convert their local time to yours."
        url="https://www.geosyncx.com/tools/live-board"
      />

      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className={`text-2xl font-bold ${headingClass}`}>Live Board</h1>
            <p className={`text-sm ${textClass}`}>
              Your time stays pinned. Click any row to convert their time → yours.
            </p>
          </div>
          {isWhatIfActive && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${darkMode ? "bg-indigo-500/10 border-indigo-400/30 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-600"}`}>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              What-if mode
              <button onClick={clearAnchor} className="ml-1 opacity-60 hover:opacity-100">✕</button>
            </div>
          )}
        </div>

        {/* Search bar */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Add a city — e.g. Singapore, Dubai, London..."
            className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors ${inputClass}`}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className={`absolute z-50 w-full mt-1 rounded-xl overflow-hidden ${suggestionClass}`}>
              {suggestions.map((s) => (
                <button
                  key={s.value}
                  onMouseDown={() => addRow(s)}
                  className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${
                    darkMode ? "hover:bg-white/10 text-white/80" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span>
                    <span className="font-medium">{s.city}</span>
                    <span className={`ml-2 ${textClass}`}>{s.country}</span>
                  </span>
                  <span className={`text-xs ${textClass}`}>{s.gmt}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clock rows */}
        <div className="space-y-3">
          {/* Primary — always first, never removable, never anchor */}
          <ClockRow
            tz={primaryZone}
            label={primaryLabel}
            isPrimary
            darkMode={darkMode}
            now={displayNow}
            isAnchor={false}
            anchorInput={null}
          />

          {rows.map((row) => (
            <ClockRow
              key={row.value}
              tz={row.value}
              label={`${row.city}, ${row.country}`}
              isPrimary={false}
              darkMode={darkMode}
              now={displayNow}
              onRemove={() => removeRow(row.value)}
              isAnchor={anchor?.tz === row.value}
              onSetAnchor={() => handleSetAnchor(row.value)}
              anchorInput={anchor?.tz === row.value ? anchor.input : null}
              onAnchorInputChange={handleAnchorInput}
              onAnchorClear={clearAnchor}
            />
          ))}

          {rows.length === 0 && (
            <div className={`rounded-xl border-2 border-dashed p-8 text-center ${darkMode ? "border-white/10 text-white/30" : "border-slate-200 text-slate-400"}`}>
              <div className="text-3xl mb-2">🌍</div>
              <p className="text-sm">Search for a city above to add it here</p>
              <p className="text-xs mt-1 opacity-60">Rows are session-only — nothing saved, nothing disrupted</p>
            </div>
          )}
        </div>

        {/* How to use hint */}
        {rows.length > 0 && !anchor && (
          <p className={`text-xs text-center ${textClass}`}>
            Hit <span className={`font-semibold ${darkMode ? "text-indigo-300" : "text-indigo-600"}`}>⇄ Convert time</span> on any row — type their local time and all rows update instantly
          </p>
        )}

        {/* Legend */}
        <div className={`flex flex-wrap gap-3 text-xs ${textClass}`}>
          <span>Working hours:</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Morning / Afternoon</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Lunch</span>
          <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">Evening</span>
          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Off Hours</span>
        </div>
      </div>
    </>
  );
}
