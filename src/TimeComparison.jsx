// /src/TimeComparison.jsx
import { useState, useEffect, useMemo, useRef, useCallback, memo, Fragment } from "react";
import { DateTime } from "luxon";
import { timezoneData } from "./timezones.js";
import { DEFAULT_WORK_HOURS } from "./workHours.js";
import { TrashIcon, PhoneIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import {
  getSupportedRegionCodes,
  getCountryCodeForRegionCode,
} from "awesome-phonenumber";

// Build country calling codes mapping dynamically from awesome-phonenumber
const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
const countryCallingCodes = (() => {
  const map = {};
  getSupportedRegionCodes().forEach((iso) => {
    const code = `+${getCountryCodeForRegionCode(iso)}`;
    const countryName = displayNames.of(iso) || iso;
    if (!map[code]) {
      map[code] = [];
    }
    map[code].push(countryName);
  });
  return map;
})();

// Calling code for a timezone entry, from its ISO country code (exact, no name matching).
function getPhoneCode(entry) {
  const iso = entry?.countryCode;
  if (!iso) return null;
  const code = getCountryCodeForRegionCode(iso);
  return code ? `+${code}` : null;
}

function encode(s = "") {
  return encodeURIComponent(s).replace(/%20/g, "+");
}

// Availability -> colour, shared by the strips and the status chips:
// green = working hours, amber = early/late, grey = night.
const NIGHT_START = 22;
const NIGHT_END = 6;
const isNightHour = (h) => h >= NIGHT_START || h < NIGHT_END;
const KINDS = {
  work: { label: "Working hours", dark: "bg-emerald-700 text-white font-semibold", light: "bg-emerald-700 text-white font-semibold" },
  shoulder: { label: "Early / late", dark: "bg-amber-500/40 text-amber-100", light: "bg-amber-200 text-amber-950" },
  night: { label: "Night", dark: "bg-slate-800 text-slate-400", light: "bg-slate-200 text-slate-600" },
};
const KIND_ORDER = ["work", "shoulder", "night"];

const toMinutes = (hhmm = "") => {
  const [h, m] = hhmm.split(":").map(Number);
  return Number.isFinite(h) ? h * 60 + (m || 0) : null;
};
// True when the local time falls inside [start, end); handles windows that wrap past midnight
function isWorkingHour(local, hours) {
  const s = toMinutes(hours?.start ?? DEFAULT_WORK_HOURS.start);
  const e = toMinutes(hours?.end ?? DEFAULT_WORK_HOURS.end);
  if (s === null || e === null) return false;
  const now = local.hour * 60 + local.minute;
  return s <= e ? now >= s && now < e : now >= s || now < e;
}
// work | shoulder | night for one local time
function kindFor(local, hours) {
  if (isWorkingHour(local, hours)) return "work";
  return isNightHour(local.hour) ? "night" : "shoulder";
}
// Short status for the Equivalent Time cell
function hourStatus(local, hours) {
  const kind = kindFor(local, hours);
  if (kind === "work") return { label: KINDS.work.label, tone: "ok" };
  if (kind === "night") return { label: KINDS.night.label, tone: "bad" };
  const s = toMinutes(hours?.start ?? DEFAULT_WORK_HOURS.start);
  return { label: local.hour * 60 + local.minute < s ? "Early" : "Late", tone: "warn" };
}

// 24 hour tiles in a row. Every strip starts at midnight of the primary date, so columns line up
// across rows. One tab stop per strip (the selected hour); Left/Right/Home/End move between hours.
// `tiles` is 24 items of { kind, text, label }; kind drives the colour, label is the tooltip/aria text,
// so "good hour" is never colour-only.
function HourStrip({ tiles, selectedHour, onPick, darkMode, groupLabel }) {
  const refs = useRef([]);
  const focusHour = Number.isInteger(selectedHour) && selectedHour >= 0 && selectedHour < 24 ? selectedHour : 0;

  const onKeyDown = (e, h) => {
    const next = { ArrowRight: h + 1, ArrowLeft: h - 1, Home: 0, End: 23 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const target = Math.min(23, Math.max(0, next));
    refs.current[target]?.focus();
    onPick(target);
  };

  return (
    <div className="flex gap-px rounded-md overflow-hidden" role="group" aria-label={groupLabel}>
      {tiles.map((t, h) => {
        const tone = darkMode ? KINDS[t.kind].dark : KINDS[t.kind].light;
        // Mobile: label every 6th tile; md+: label every tile
        const showMobileLabel = h % 6 === 0;
        return (
          <button
            type="button"
            key={h}
            ref={(el) => (refs.current[h] = el)}
            tabIndex={h === focusHour ? 0 : -1}
            onClick={() => onPick(h)}
            onKeyDown={(e) => onKeyDown(e, h)}
            title={t.label}
            aria-label={t.label}
            aria-pressed={h === selectedHour}
            className={`flex-1 min-w-0 overflow-hidden h-8 md:h-7 text-[10px] leading-8 md:leading-7 text-center tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white ${tone} ${
              h === selectedHour ? "ring-2 ring-inset ring-sky-400" : "hover:brightness-110"
            }`}
          >
            <span className={`${showMobileLabel ? "inline" : "hidden"} md:inline whitespace-nowrap`}>{t.text}</span>
          </button>
        );
      })}
    </div>
  );
}

// One city: each tile shows that city's local hour, coloured by availability.
const DayStrip = memo(function DayStrip({ zone, primaryZone, selectedDate, selectedHour, onPick, darkMode, is24, workHours }) {
  if (!primaryZone || !selectedDate) return null;
  const start = DateTime.fromISO(selectedDate, { zone: primaryZone }).startOf("day");
  if (!start.isValid) return null;

  const tiles = Array.from({ length: 24 }, (_, h) => {
    const local = start.plus({ hours: h }).setZone(zone);
    const kind = kindFor(local, workHours);
    const when = local.toFormat(is24 ? "ccc d LLL, HH:mm" : "ccc d LLL, h:mm a");
    return {
      kind,
      label: `${when} (${KINDS[kind].label.toLowerCase()})`,
      // Half-hour and 45-minute zones (India, Nepal, ...) show their real minutes
      text: (
        <>
          {is24 ? local.hour : local.toFormat("h")}
          {local.minute !== 0 && (
            <span className="text-[9px] opacity-80 xl:hidden">:{String(local.minute).padStart(2, "0")}</span>
          )}
          {!is24 && <span className="opacity-70">{local.hour < 12 ? "a" : "p"}</span>}
        </>
      ),
    };
  });

  return <HourStrip tiles={tiles} selectedHour={selectedHour} onPick={onPick} darkMode={darkMode} groupLabel="Pick an hour" />;
});

// Hour-by-hour availability of one hour tile for all cities together: green only when everyone is
// in working hours for the whole hour, grey when anyone is asleep, amber otherwise.
function overlapKinds(zones, hoursByZone, primaryZone, selectedDate) {
  const start = DateTime.fromISO(selectedDate, { zone: primaryZone }).startOf("day");
  if (!start.isValid) return null;
  return Array.from({ length: 24 }, (_, h) => {
    const from = start.plus({ hours: h });
    const to = from.plus({ minutes: 59 });
    let worst = "work";
    for (const z of zones) {
      for (const t of [from, to]) {
        const k = kindFor(t.setZone(z), hoursByZone[z]);
        if (k === "night") return { kind: "night", at: from };
        if (k === "shoulder") worst = "shoulder";
      }
    }
    return { kind: worst, at: from };
  });
}

const OverlapStrip = memo(function OverlapStrip({ kinds, selectedHour, onPick, darkMode, is24, cityCount }) {
  const tiles = kinds.map(({ kind, at }) => ({
    kind,
    text: is24 ? at.hour : <>{at.toFormat("h")}<span className="opacity-70">{at.hour < 12 ? "a" : "p"}</span></>,
    label: `${at.toFormat(is24 ? "ccc d LLL, HH:mm" : "ccc d LLL, h:mm a")}: ${
      kind === "work" ? `all ${cityCount} cities in working hours` : kind === "shoulder" ? "someone is early or late" : "someone is at night"
    }`,
  }));
  return <HourStrip tiles={tiles} selectedHour={selectedHour} onPick={onPick} darkMode={darkMode} groupLabel="Pick an hour when everyone is available" />;
});

export default function TimeComparison({
  darkMode,
  primaryZone,
  setPrimaryZone,
  selectedZones,
  setSelectedZones,
  workHours = {},
  setWorkHours,
  is24: is24Prop,
  setIs24: setIs24Prop,
  showCalendar = true,
}) {
  // 12h (am/pm) or 24h display, remembered between visits
  const [is24State, setIs24State] = useState(() => {
    try {
      return localStorage.getItem("timeFormat24") === "true";
    } catch {
      return false;
    }
  });
  const is24 = is24Prop !== undefined ? is24Prop : is24State;
  const setIs24 = setIs24Prop || setIs24State;
  const timeFormat = is24 ? "HH:mm" : "hh:mm a";
  useEffect(() => {
    if (is24Prop !== undefined) return; // the parent persists it
    try {
      localStorage.setItem("timeFormat24", is24State);
    } catch {
      // ignore
    }
  }, [is24State, is24Prop]);
  const [showHours, setShowHours] = useState(false);
  // HH:mm in the primary zone; defaults to "now" so the Equivalent Time column is filled on load
  const [selectedTime, setSelectedTime] = useState(() => {
    const zone = primaryZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    return DateTime.now().setZone(zone).toFormat("HH:mm");
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    // Always default to today's date
    const zone = primaryZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    return DateTime.now().setZone(zone).toISODate();
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneCodeMatches, setPhoneCodeMatches] = useState([]);
  const [filteredTimezones, setFilteredTimezones] = useState([]);

  // Small calendar fields
  const [title, setTitle] = useState("Meeting");
  const [durationMin, setDurationMin] = useState(30);
  const [details, setDetails] = useState("Planned via GeoSyncX");

  const primaryEntry = timezoneData.find((tz) => tz.value === primaryZone);

  const cardBase = darkMode
    ? "bg-white/10 text-white border border-white/15 shadow-xl"
    : "bg-white/70 text-gray-900 border border-white/60 shadow-xl";
  const inputClass = darkMode
    ? "bg-white/5 border border-white/40 text-white placeholder:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
    : "bg-white/60 border border-slate-400 text-gray-900 placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500";
  const tableHeaderClass = darkMode
    ? "bg-gradient-to-b from-white/10 to-white/5 border-b border-white/20"
    : "bg-gradient-to-b from-white/90 to-white/70 border-b border-white/40";
  const rowHoverClass = darkMode ? "hover:bg-white/10" : "hover:bg-white/80";
  const mutedClass = darkMode ? "text-slate-300" : "text-slate-600";
  const iconBtn =
    "inline-flex items-center justify-center min-w-[40px] min-h-[40px] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400";
  const chipClass = darkMode ? "bg-white/10 text-white" : "bg-white/80 text-gray-900";

  // Clear old cached date (one-time cleanup)
  useEffect(() => {
    try {
      localStorage.removeItem("selectedDate");
    } catch {
      // ignore
    }
  }, []);

  // Phone code lookup - smart matching for partial codes and full numbers
  useEffect(() => {
    if (!phoneCode) {
      setPhoneCodeMatches([]);
      return;
    }

    // Clean input: remove spaces, dashes, parentheses
    const digits = phoneCode.replace(/[\s\-\(\)]/g, "");
    const normalized = digits.startsWith("+") ? digits : `+${digits}`;
    const numericOnly = digits.replace(/\D/g, "");

    let matchedCountries = [];

    // 1. Try exact match first
    if (countryCallingCodes[normalized]) {
      matchedCountries = [...countryCallingCodes[normalized]];
    }

    // 2. If no exact match, try partial/prefix matching
    if (matchedCountries.length === 0 && numericOnly.length > 0) {
      // For short inputs (1-4 digits), find all codes that START with this prefix
      if (numericOnly.length <= 4) {
        Object.entries(countryCallingCodes).forEach(([code, countries]) => {
          const codeDigits = code.replace(/\D/g, "");
          if (codeDigits.startsWith(numericOnly) || numericOnly.startsWith(codeDigits)) {
            countries.forEach((c) => {
              if (!matchedCountries.includes(c)) {
                matchedCountries.push(c);
              }
            });
          }
        });
      }

      // 3. For longer inputs (full phone numbers), try matching 1-4 digit prefixes
      if (numericOnly.length > 4) {
        for (let len = 4; len >= 1; len--) {
          const prefix = `+${numericOnly.slice(0, len)}`;
          if (countryCallingCodes[prefix]) {
            matchedCountries = [...countryCallingCodes[prefix]];
            break;
          }
        }
      }
    }

    if (matchedCountries.length > 0) {
      const matches = timezoneData.filter((tz) =>
        matchedCountries.some((country) =>
          tz.country.toLowerCase().includes(country.toLowerCase())
        )
      );
      setPhoneCodeMatches(matches);
    } else {
      setPhoneCodeMatches([]);
    }
  }, [phoneCode]);

  // Search filter - combines text search and phone code results
  useEffect(() => {
    if (!searchQuery && phoneCodeMatches.length === 0) {
      setFilteredTimezones([]);
      return;
    }

    let results = [];

    // Add phone code matches first
    if (phoneCodeMatches.length > 0) {
      results = [...phoneCodeMatches];
    }

    // Add text search results
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const textMatches = timezoneData.filter(
        (tz) =>
          tz.city.toLowerCase().includes(q) ||
          tz.country.toLowerCase().includes(q) ||
          tz.value.toLowerCase().includes(q) ||
          tz.gmt.toLowerCase().includes(q)
      );

      // Merge without duplicates
      textMatches.forEach((tm) => {
        if (!results.find((r) => r.value === tm.value)) {
          results.push(tm);
        }
      });
    }

    setFilteredTimezones(results.slice(0, 200));
  }, [searchQuery, phoneCodeMatches]);

  // The selected moment expressed in `zone` (a Luxon DateTime), or null
  const convertedLocal = (zone) => {
    if (!selectedTime || !primaryZone || !selectedDate) return null;
    const [H, M] = selectedTime.split(":").map(Number);
    const base = DateTime.fromISO(selectedDate, { zone: primaryZone }).set({ hour: H, minute: M });
    return base.isValid ? base.setZone(zone) : null;
  };

  // Convert "selectedTime" (HH:mm) from primary -> target zone
  // Returns { time, ampm, date, dayDiff } or null
  const convertTime = (zone) => {
    if (!selectedTime || !primaryZone || !selectedDate) return null;
    const [H, M] = selectedTime.split(":").map(Number);
    const base = DateTime.fromObject(
      {
        year: Number(selectedDate.slice(0, 4)),
        month: Number(selectedDate.slice(5, 7)),
        day: Number(selectedDate.slice(8, 10)),
        hour: H,
        minute: M,
      },
      { zone: primaryZone }
    );
    if (!base.isValid) return null;
    const converted = base.setZone(zone);
    // Compare calendar dates (as UTC midnights) so zone offsets don't produce fractional days
    const dayDiff = Math.round(
      DateTime.fromISO(converted.toISODate(), { zone: "utc" })
        .diff(DateTime.fromISO(base.toISODate(), { zone: "utc" }), "days").days
    );
    const [timePart, ampm] = converted.toFormat(timeFormat).split(" ");
    return { time: timePart, ampm, date: converted.toFormat("dd MMM"), dayDiff };
  };

  // Table order: primary first, then others
  const sortedTimezones = useMemo(() => {
    const unique = selectedZones.filter((z) => z !== primaryZone);
    return primaryZone ? [primaryZone, ...unique] : unique;
  }, [selectedZones, primaryZone]);

  const addZone = (value) => {
    if (!value) return;
    setSelectedZones((prev) => {
      if (prev.includes(value)) return prev;
      return [...prev, value];
    });
  };

  const setAsPrimary = (tz) => {
    setPrimaryZone(tz);
    setSelectedZones((prev) => {
      if (prev.includes(tz)) return prev;
      return [tz, ...prev];
    });
  };

  // Build Google Calendar URL (UTC times)
  const startPrimary = useMemo(() => {
    if (!selectedDate || !selectedTime || !primaryZone) return null;
    const [H, M] = selectedTime.split(":").map(Number);
    const dt = DateTime.fromObject(
      {
        year: Number(selectedDate.slice(0, 4)),
        month: Number(selectedDate.slice(5, 7)),
        day: Number(selectedDate.slice(8, 10)),
        hour: H,
        minute: M,
      },
      { zone: primaryZone }
    );
    return dt.isValid ? dt : null;
  }, [selectedDate, selectedTime, primaryZone]);

  const endPrimary = useMemo(
    () => (startPrimary ? startPrimary.plus({ minutes: durationMin }) : null),
    [startPrimary, durationMin]
  );

  const gcalUrl = useMemo(() => {
    if (!startPrimary || !endPrimary) return "#";
    const startUtc = startPrimary.toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'");
    const endUtc = endPrimary.toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'");
    const who = sortedTimezones.join(", ");
    const fullDetails = `${details}\n\nPrimary TZ: ${primaryZone}\nParticipants: ${who}\n\n(Click "Add Google Meet" in Calendar to attach a Meet link.)`;
    return (
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encode(title)}` +
      `&dates=${startUtc}/${endUtc}` +
      `&details=${encode(fullDetails)}`
    );
  }, [startPrimary, endPrimary, title, details, primaryZone, sortedTimezones]);

  const selectedMinutes = (selectedTime || "00:00").split(":")[1] || "00";
  const pickHour = useCallback(
    (h) => setSelectedTime(`${String(h).padStart(2, "0")}:${selectedMinutes}`),
    [selectedMinutes]
  );
  // Hours on the selected date when every city is available (same colours as the per-city strips)
  const overlap = useMemo(() => {
    if (!primaryZone || !selectedDate || sortedTimezones.length < 2) return null;
    const kinds = overlapKinds(sortedTimezones, workHours, primaryZone, selectedDate);
    if (!kinds) return null;
    const fmt = is24 ? "HH:mm" : "h a";
    const ranges = [];
    kinds.forEach(({ kind, at }, h) => {
      if (kind !== "work") return;
      const last = ranges[ranges.length - 1];
      if (last && last.endHour === h) last.endHour = h + 1;
      else ranges.push({ startHour: h, endHour: h + 1, from: at });
    });
    const summary = ranges.map((r) => `${r.from.toFormat(fmt)} – ${r.from.plus({ hours: r.endHour - r.startHour }).toFormat(fmt)}`);
    const hasAmber = kinds.some((k) => k.kind === "shoulder");
    return { kinds, summary, hasAmber };
  }, [sortedTimezones, workHours, primaryZone, selectedDate, is24]);

  const snapToNow = () => {
    const zone = primaryZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const now = DateTime.now().setZone(zone);
    setSelectedTime(now.toFormat("HH:mm"));
    setSelectedDate(now.toISODate());
  };

  const formatSelected = useMemo(() => {
    if (!selectedTime) return "selected time";
    const [H, M] = selectedTime.split(":").map(Number);
    return DateTime.fromObject({ hour: H || 0, minute: M || 0 }).toFormat(is24 ? "HH:mm" : "h:mm a");
  }, [selectedTime, is24]);

  const calendarReady = !!startPrimary && !!endPrimary && !!primaryZone;

  return (
    <div className="w-full">
      <div
        className={`p-4 rounded-2xl backdrop-blur-xl transition-colors duration-300 ${cardBase}`}
      >
        {/* Search & add zone */}
        <h2 className="sr-only">Add a Timezone</h2>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-x-3 gap-y-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PhoneIcon className="w-4 h-4 opacity-70" aria-hidden="true" />
              <label htmlFor="tc-phone" className={`text-sm ${mutedClass}`}>Search by Phone Code</label>
            </div>
            <input
              id="tc-phone"
              type="text"
              inputMode="tel"
              autoComplete="off"
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value)}
              placeholder="e.g., +91, +44, +1..."
              className={`w-full px-3 py-2 rounded-xl shadow-inner transition ${inputClass}`}
            />
          </div>
          <div>
            <label htmlFor="tc-search" className={`text-sm ${mutedClass} mb-1 block`}>Search by Location</label>
            <input
              id="tc-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && filteredTimezones.length > 0) {
                  e.preventDefault();
                  addZone(filteredTimezones[0].value);
                  setSearchQuery("");
                  setPhoneCode("");
                }
              }}
              placeholder="City, country, IANA, or GMT..."
              className={`w-full px-3 py-2 rounded-xl shadow-inner transition ${inputClass}`}
            />
          </div>
          <div>
            <label htmlFor="tc-date" className={`block mb-1 text-sm ${mutedClass}`}>Date</label>
            <input
              id="tc-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl shadow-inner transition ${inputClass}`}
            />
          </div>
          <div>
            <label htmlFor="tc-time" className={`block mb-1 text-sm ${mutedClass}`}>
              {primaryZone
                ? `Time in ${[primaryEntry?.city || primaryZone.split("/").pop(), primaryEntry?.country].filter(Boolean).join(", ")}`
                : "Your Time (click the star to set a primary timezone)"}
            </label>
            <input
              id="tc-time"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl shadow-inner transition ${inputClass}`}
            />
            <button
              type="button"
              onClick={snapToNow}
              className="mt-1 text-xs font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded"
            >
              Set to now
            </button>
          </div>
        </div>
        {(searchQuery || phoneCode) && (
          <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-400/50">
            <div className="sr-only" role="status" aria-live="polite">
              {filteredTimezones.length} matching timezone{filteredTimezones.length === 1 ? "" : "s"}. Press Enter to add the first match.
            </div>
            {filteredTimezones.length > 0 && (
              <div className={`px-3 py-1 text-xs ${mutedClass}`} aria-hidden="true">Press Enter to add the first match</div>
            )}
            {phoneCode && phoneCodeMatches.length > 0 && (
              <div className="p-2 bg-emerald-500/20 text-sm font-semibold sticky top-0 backdrop-blur-sm">
                Found {phoneCodeMatches.length} timezone(s) for {phoneCode}
              </div>
            )}
            {filteredTimezones.map((tz) => {
              const phoneCodeForTz = getPhoneCode(tz);
              return (
                <button
                  type="button"
                  key={tz.value}
                  className={`w-full text-left p-3 cursor-pointer ${rowHoverClass} transition flex items-center justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400`}
                  onClick={() => {
                    addZone(tz.value);
                    setSearchQuery("");
                    setPhoneCode("");
                  }}
                >
                  <span>
                    {tz.city}, {tz.country} ({tz.gmt}) —{" "}
                    <span className={`text-xs ${mutedClass}`}>{tz.value}</span>
                  </span>
                  {phoneCodeForTz && (
                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${darkMode ? "bg-white/10" : "bg-gray-200"}`}>
                      {phoneCodeForTz}
                    </span>
                  )}
                </button>
              );
            })}
            {filteredTimezones.length === 0 && (
              <div className={`p-2 ${mutedClass}`}>
                {phoneCode ? `No timezones found for phone code ${phoneCode}` : "No matches"}
              </div>
            )}
          </div>
        )}


        {/* Table */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
          <ul className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${mutedClass}`} aria-label="Colour key">
            {KIND_ORDER.map((k) => (
              <li key={k} className="flex items-center gap-1.5">
                <span className={`inline-block w-3 h-3 rounded-sm border border-white/20 ${darkMode ? KINDS[k].dark : KINDS[k].light}`} aria-hidden="true" />
                {KINDS[k].label}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            {setWorkHours && sortedTimezones.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHours((v) => !v)}
                aria-expanded={showHours}
                aria-controls="working-hours-panel"
                title="Edit working hours"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  showHours ? "bg-sky-600 text-white" : darkMode ? "hover:bg-white/10" : "hover:bg-slate-200"
                }`}
              >
                <Cog6ToothIcon className="w-4 h-4" aria-hidden="true" />
                Edit hours
              </button>
            )}
            <div role="group" aria-label="Time format" className="flex rounded-lg overflow-hidden border border-white/20 text-xs font-semibold">
              {[["am/pm", false], ["24h", true]].map(([label, value]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setIs24(value)}
                  aria-pressed={is24 === value}
                  className={`px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400 ${
                    is24 === value ? "bg-sky-600 text-white" : darkMode ? "hover:bg-white/10" : "hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Working hours (gear): drive the green/amber/grey hours below */}
        {setWorkHours && showHours && sortedTimezones.length > 0 && (
          <div id="working-hours-panel" className="mt-3">
            <p className="text-sm font-medium px-1">
              Working hours
              <span className={`ml-2 font-normal ${mutedClass}`}>(default {DEFAULT_WORK_HOURS.start} – {DEFAULT_WORK_HOURS.end}). Colours update automatically.</span>
            </p>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className={tableHeaderClass}>
                    <th scope="col" className="p-2 text-left">City</th>
                    <th scope="col" className="p-2 text-left">Start</th>
                    <th scope="col" className="p-2 text-left">End</th>
                    <th scope="col" className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTimezones.map((tz) => {
                    const city = timezoneData.find((zone) => zone.value === tz)?.city || tz.split("/").pop().replace(/_/g, " ");
                    const p = workHours[tz] || DEFAULT_WORK_HOURS;
                    const update = (key, value) =>
                      setWorkHours((prev) => ({ ...prev, [tz]: { ...(prev[tz] || DEFAULT_WORK_HOURS), [key]: value } }));
                    return (
                      <tr key={tz} className={`${rowHoverClass} transition`}>
                        <td className="p-2 font-medium">{city}</td>
                        <td className="p-2">
                          <input
                            type="time"
                            aria-label={`Working hours start in ${city}`}
                            value={p.start}
                            onChange={(e) => update("start", e.target.value)}
                            className={`p-2 rounded-lg ${inputClass}`}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="time"
                            aria-label={`Working hours end in ${city}`}
                            value={p.end}
                            onChange={(e) => update("end", e.target.value)}
                            className={`p-2 rounded-lg ${inputClass}`}
                          />
                        </td>
                        <td className="p-2">
                          <button
                            type="button"
                            onClick={() =>
                              setWorkHours((prev) => {
                                const next = { ...prev };
                                for (const z of sortedTimezones) next[z] = { start: p.start, end: p.end };
                                return next;
                              })
                            }
                            aria-label={`Copy ${city} working hours to all cities`}
                            className="px-3 py-2 rounded-lg bg-sky-700 text-white hover:bg-sky-600 text-xs transition-transform active:scale-95 motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
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
          </div>
        )}

        <div className="overflow-x-auto w-full mt-2">
          <table className="w-full border-collapse xl:table-fixed">
            <thead>
              <tr className={tableHeaderClass}>
                <th scope="col" className="p-3 text-left md:w-[58%] xl:w-[28%] w-[50%] rounded-tl-xl">City</th>
                <th scope="col" className="p-3 text-left md:w-[42%] xl:w-[22%] w-[50%] xl:rounded-none rounded-tr-xl">At {formatSelected} {primaryEntry?.city || ""}</th>
                <th scope="col" className="hidden xl:table-cell p-3 text-left xl:w-[50%] rounded-tr-xl">Day view <span className="font-normal opacity-80">(click an hour to pick it)</span></th>
              </tr>
            </thead>
            <tbody>
              {overlap && (
                <Fragment>
                  <tr className={`xl:border-b xl:border-white/10 ${darkMode ? "bg-emerald-500/10" : "bg-emerald-500/10"}`}>
                    <td colSpan={2} className="p-2">
                      <p className="font-semibold">Everyone available</p>
                      <p className={`text-sm ${mutedClass}`}>
                        {overlap.summary.length > 0
                          ? `Working hours overlap: ${overlap.summary.join(", ")} (${primaryEntry?.city || "primary"} time)`
                          : overlap.hasAmber
                            ? "No hour where everyone is in working hours. Amber hours are the next best."
                            : "No overlap on this date. Someone is at night in every hour."}
                      </p>
                    </td>
                    <td className="hidden xl:table-cell p-2">
                      <OverlapStrip
                        kinds={overlap.kinds}
                        selectedHour={Number((selectedTime || "").split(":")[0])}
                        onPick={pickHour}
                        darkMode={darkMode}
                        is24={is24}
                        cityCount={sortedTimezones.length}
                      />
                    </td>
                  </tr>
                  <tr className="border-b border-white/10 xl:hidden">
                    <td colSpan={2} className="px-2 pb-3">
                      <OverlapStrip
                        kinds={overlap.kinds}
                        selectedHour={Number((selectedTime || "").split(":")[0])}
                        onPick={pickHour}
                        darkMode={darkMode}
                        is24={is24}
                        cityCount={sortedTimezones.length}
                      />
                    </td>
                  </tr>
                </Fragment>
              )}
              {sortedTimezones.map((tz) => {
                const timezone = timezoneData.find((zone) => zone.value === tz);
                const converted = convertTime(tz);
                const status = converted ? hourStatus(convertedLocal(tz), workHours[tz]) : null;

                return (
                  <Fragment key={tz}>
                  <tr
                    className={`${rowHoverClass} transition xl:border-b xl:border-white/10 ${tz === primaryZone ? (darkMode ? "bg-white/5" : "bg-sky-500/5") : ""}`}
                  >
                    <td className="p-2 md:w-[58%] xl:w-auto w-[50%]">
                      <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setAsPrimary(tz)}
                          type="button"
                          className={`${iconBtn} ${
                            tz === primaryZone
                              ? "text-yellow-500 hover:text-yellow-400"
                              : darkMode ? "text-slate-300 hover:text-yellow-400" : "text-slate-600 hover:text-yellow-600"
                          } transition-all transform hover:scale-110 active:scale-95`}
                          aria-label={
                            tz === primaryZone
                              ? `${timezone?.city || tz} is the primary timezone`
                              : `Set ${timezone?.city || tz} as primary timezone`
                          }
                          aria-pressed={tz === primaryZone}
                          title={tz === primaryZone ? "Primary Timezone" : "Set as Primary Timezone"}
                        >
                          {tz === primaryZone ? (
                            <StarIconSolid className="w-5 h-5" aria-hidden="true" />
                          ) : (
                            <StarIconOutline className="w-5 h-5" aria-hidden="true" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedZones((prev) => prev.filter((zone) => zone !== tz))
                          }
                          disabled={tz === primaryZone}
                          className={`${iconBtn} ${darkMode ? "text-rose-300 hover:text-rose-200" : "text-rose-700 hover:text-rose-600"} transition-transform transform hover:scale-110 active:scale-95 motion-reduce:transform-none disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed`}
                          aria-label={tz === primaryZone ? `${timezone?.city || tz} is primary; set another city as primary to remove it` : `Remove ${timezone?.city || tz}`}
                          title={tz === primaryZone ? "Set another city as primary to remove this one" : "Remove Timezone"}
                        >
                          <TrashIcon className="w-5 h-5" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="flex flex-wrap md:flex-nowrap xl:flex-wrap items-center gap-x-2 gap-y-1 min-w-0 whitespace-nowrap xl:whitespace-normal">
                        <p className="font-medium">
                          {timezone?.city || tz}
                          {tz === primaryZone && (
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 inline-block ${darkMode ? "text-yellow-300" : "text-yellow-800"}`}>
                              Primary
                            </span>
                          )}
                        </p>
                        <p
                          className={`text-sm ${mutedClass}`}
                        >
                          {timezone?.country || ""}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full shrink-0 ${chipClass}`}
                        >
                          {timezone?.gmt || ""}
                        </span>
                        {getPhoneCode(timezone) && (
                          <span
                            className={`text-xs font-mono px-2 py-1 rounded-full shrink-0 ${chipClass}`}
                            title={`Calling code for ${timezone.country}`}
                            aria-label={`Calling code ${getPhoneCode(timezone)}`}
                          >
                            {getPhoneCode(timezone)}
                          </span>
                        )}
                      </div>
                      </div>
                    </td>
                    <td className="p-2 md:w-[42%] xl:w-auto w-[50%]">
                      <div className="flex flex-wrap items-baseline gap-x-2 whitespace-nowrap">
                        {converted ? (
                          <>
                            <span className="text-2xl font-semibold tabular-nums">
                              {converted.time} {converted.ampm}
                            </span>
                            {status && (
                              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                                status.tone === "ok"
                                  ? darkMode ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-600/15 text-emerald-800"
                                  : status.tone === "warn"
                                    ? darkMode ? "bg-amber-500/20 text-amber-300" : "bg-amber-500/20 text-amber-900"
                                    : darkMode ? "bg-white/10 text-slate-300" : "bg-slate-200 text-slate-700"
                              }`}>
                                {status.label}
                              </span>
                            )}
                            <span className={`text-xs ${mutedClass}`}>
                              {converted.date}
                              {converted.dayDiff !== 0 && (
                                <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-semibold ${
                                  converted.dayDiff > 0
                                    ? darkMode ? "bg-sky-500/20 text-sky-300" : "bg-sky-500/20 text-sky-800"
                                    : darkMode ? "bg-rose-500/20 text-rose-300" : "bg-rose-500/20 text-rose-800"
                                }`}>
                                  {converted.dayDiff > 0 ? `+${converted.dayDiff}d` : `${converted.dayDiff}d`}
                                </span>
                              )}
                            </span>
                          </>
                        ) : (
                          <span className={`text-sm ${mutedClass}`}>Enter a time above</span>
                        )}
                      </div>
                    </td>
                    <td className="hidden xl:table-cell p-2">
                    <DayStrip
                      zone={tz}
                      primaryZone={primaryZone}
                      selectedDate={selectedDate}
                      selectedHour={Number((selectedTime || "").split(":")[0])}
                      onPick={pickHour}
                      darkMode={darkMode}
                      is24={is24}
                      workHours={workHours[tz]}
                    />
                    </td>
                  </tr>
                  <tr className="border-b border-white/10 xl:hidden">
                    <td colSpan={2} className="px-2 pb-3">
                      <DayStrip
                        zone={tz}
                        primaryZone={primaryZone}
                        selectedDate={selectedDate}
                        selectedHour={Number((selectedTime || "").split(":")[0])}
                        onPick={pickHour}
                        darkMode={darkMode}
                        is24={is24}
                        workHours={workHours[tz]}
                      />
                    </td>
                  </tr>
                  </Fragment>
                );
              })}
              {sortedTimezones.length === 0 && (
                <tr>
                  <td colSpan={3} className={`p-4 text-center ${mutedClass}`}>
                    Add a timezone above to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Inline scheduling (inside TimeComparison) - only show if showCalendar is true */}
        {showCalendar && (
          <div className="mt-3 p-3 rounded-lg border border-dashed border-gray-400/40">
            <h2 className="font-semibold mb-2">Schedule this time</h2>
            <div className="grid md:grid-cols-[1fr_8rem_1fr_auto] gap-2 items-end">
              <label className="block text-sm">
                <span className={`block mb-1 ${mutedClass}`}>Title</span>
                <input
                  className={`w-full px-3 py-2 rounded-xl shadow-inner transition ${inputClass}`}
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                <span className={`block mb-1 ${mutedClass}`}>Duration (min)</span>
                <input
                  type="number"
                  min={15}
                  step={15}
                  className={`w-full px-3 py-2 rounded-xl shadow-inner transition ${inputClass}`}
                  placeholder="Duration (min)"
                  value={durationMin}
                  onChange={(e) => setDurationMin(Math.max(15, parseInt(e.target.value || "30", 10) || 30))}
                />
              </label>
              <label className="block text-sm">
                <span className={`block mb-1 ${mutedClass}`}>Details</span>
                <input
                  className={`w-full px-3 py-2 rounded-xl shadow-inner transition ${inputClass}`}
                  placeholder="Details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </label>
              <a
                href={calendarReady ? gcalUrl : undefined}
                target="_blank"
                rel="noopener noreferrer"
                role={calendarReady ? undefined : "link"}
                aria-disabled={calendarReady ? undefined : "true"}
                title={calendarReady ? "Times are saved in UTC; Calendar shows them in each attendee's local timezone." : "Enter a time above to enable this button."}
                className={`px-4 py-2 rounded-xl text-center whitespace-nowrap transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  calendarReady
                    ? "bg-emerald-700 hover:bg-emerald-600 text-white active:scale-95"
                    : darkMode ? "bg-white/10 text-slate-300 cursor-not-allowed" : "bg-slate-200 text-slate-600 cursor-not-allowed"
                }`}
                onClick={(e) => {
                  if (!calendarReady) e.preventDefault();
                }}
              >
                Add to Google Calendar
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
