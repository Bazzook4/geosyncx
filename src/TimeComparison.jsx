// /src/TimeComparison.jsx
import { useState, useEffect, useMemo, Fragment } from "react";
import { DateTime } from "luxon";
import { timezoneData } from "./timezones.js";
import { TrashIcon, PhoneIcon } from "@heroicons/react/24/outline";
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

// Thin 24-hour strip for one city: night/day shading, with the chosen hour highlighted.
// Every strip starts at midnight of the primary date, so columns line up across rows.
function DayStrip({ zone, primaryZone, selectedDate, selectedHour, onPick, darkMode, is24 }) {
  if (!primaryZone || !selectedDate) return null;
  const start = DateTime.fromISO(selectedDate, { zone: primaryZone }).startOf("day");
  if (!start.isValid) return null;

  return (
    <div className="flex gap-px rounded-md overflow-hidden" role="group" aria-label="Pick an hour">
      {Array.from({ length: 24 }, (_, h) => {
        const local = start.plus({ hours: h }).setZone(zone);
        const night = local.hour < 6 || local.hour >= 21;
        const shoulder = !night && (local.hour < 8 || local.hour >= 19);
        const tone = night
          ? darkMode ? "bg-sky-950 text-sky-300" : "bg-slate-600 text-white"
          : shoulder
          ? darkMode ? "bg-sky-900/50 text-sky-200" : "bg-sky-200 text-sky-900"
          : darkMode ? "bg-white/15 text-white" : "bg-sky-50 text-slate-700";
        return (
          <button
            type="button"
            key={h}
            onClick={() => onPick(h)}
            title={local.toFormat(is24 ? "ccc d LLL, HH:mm" : "ccc d LLL, h:mm a")}
            aria-label={local.toFormat(is24 ? "ccc d LLL, HH:mm" : "ccc d LLL, h:mm a")}
            aria-pressed={h === selectedHour}
            className={`flex-1 h-6 text-[9px] leading-6 text-center tabular-nums ${tone} ${
              h === selectedHour ? "ring-2 ring-inset ring-amber-400" : "hover:brightness-110"
            }`}
          >
            <span className="hidden md:inline">
              {is24 ? local.hour : local.toFormat("h")}
              {!is24 && <span className="opacity-70">{local.hour < 12 ? "a" : "p"}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function TimeComparison({
  darkMode,
  primaryZone,
  setPrimaryZone,
  selectedZones,
  setSelectedZones,
  showCalendar = true,
}) {
  // 12h (am/pm) or 24h display, remembered between visits
  const [is24, setIs24] = useState(() => {
    try {
      return localStorage.getItem("timeFormat24") === "true";
    } catch {
      return false;
    }
  });
  const timeFormat = is24 ? "HH:mm" : "hh:mm a";
  useEffect(() => {
    try {
      localStorage.setItem("timeFormat24", is24);
    } catch {
      // ignore
    }
  }, [is24]);
  const [currentTime, setCurrentTime] = useState({});
  const [currentDate, setCurrentDate] = useState({});
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
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("Planned via GeoSyncX");

  const cardBase = darkMode
    ? "bg-white/10 text-white border border-white/15 shadow-xl"
    : "bg-white/70 text-gray-900 border border-white/60 shadow-xl";
  const inputClass = darkMode
    ? "bg-white/5 text-white placeholder:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
    : "bg-white/60 text-gray-900 placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500";
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

  // Tick current times every second
  useEffect(() => {
    const updateTimes = () => {
      const newTimes = {};
      const newDates = {};
      const zones = new Set(selectedZones);
      if (primaryZone) zones.add(primaryZone);
      zones.forEach((tz) => {
        const dt = DateTime.now().setZone(tz);
        newTimes[tz] = dt.toFormat(timeFormat);
        newDates[tz] = dt.toFormat("dd MMM");
      });
      setCurrentTime(newTimes);
      setCurrentDate(newDates);
    };
    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [selectedZones, primaryZone, timeFormat]);

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

  const formatTimeWithAMPM = (time) => {
    if (!time || time === "-") return { time: "-", ampm: "" };
    const [timePart, ampm] = time.split(" ");
    return { time: timePart || "-", ampm: ampm || "" };
  };

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
      `&details=${encode(fullDetails)}` +
      `&location=${encode(location)}`
    );
  }, [startPrimary, endPrimary, title, details, location, primaryZone, sortedTimezones]);

  const calendarReady = !!startPrimary && !!endPrimary && !!primaryZone;

  return (
    <div className="w-full">
      <div
        className={`p-6 rounded-2xl backdrop-blur-xl transition-colors duration-300 ${cardBase}`}
      >
        {/* Search & add zone */}
        <h2 className="block mb-2 text-lg font-semibold">Add a Timezone</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PhoneIcon className="w-4 h-4 opacity-70" />
              <label htmlFor="tc-phone" className={`text-sm ${mutedClass}`}>Search by Phone Code</label>
            </div>
            <input
              id="tc-phone"
              type="text"
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value)}
              placeholder="e.g., +91, +44, +1..."
              className={`w-full p-3 rounded-xl shadow-inner transition ${inputClass}`}
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
              className={`w-full p-3 rounded-xl shadow-inner transition ${inputClass}`}
            />
          </div>
        </div>
        {(searchQuery || phoneCode) && (
          <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-white/10">
            <div className="sr-only" role="status" aria-live="polite">
              {filteredTimezones.length} matching timezone{filteredTimezones.length === 1 ? "" : "s"}. Press Enter to add the first match.
            </div>
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

        {/* Primary date and time */}
        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <div>
            <label htmlFor="tc-date" className="block mb-1 font-semibold">Primary Date</label>
            <input
              id="tc-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`w-full p-3 rounded-xl shadow-inner transition ${inputClass}`}
            />
          </div>
          <div>
            <label htmlFor="tc-time" className="block mb-1 font-semibold">
              {primaryZone
                ? `Your Time at ${
                    timezoneData.find((tz) => tz.value === primaryZone)?.city || primaryZone.split("/").pop()
                  }, ${timezoneData.find((tz) => tz.value === primaryZone)?.country || ""}`
                : "Your Time (click the star to set a primary timezone)"}
            </label>
            <input
              id="tc-time"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className={`w-full p-3 rounded-xl shadow-inner transition ${inputClass}`}
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex justify-end mt-6">
          <div role="group" aria-label="Time format" className="flex rounded-lg overflow-hidden border border-white/20 text-xs font-semibold">
            {[["am/pm", false], ["24h", true]].map(([label, value]) => (
              <button
                key={label}
                type="button"
                onClick={() => setIs24(value)}
                aria-pressed={is24 === value}
                className={`px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400 ${
                  is24 === value ? "bg-sky-500 text-white" : darkMode ? "hover:bg-white/10" : "hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto w-full mt-2">
          <table className="w-full border-collapse">
            <thead>
              <tr className={tableHeaderClass}>
                <th scope="col" className="p-3 text-left md:w-1/2 w-[40%] rounded-tl-xl">City</th>
                <th scope="col" className="p-3 text-left md:w-1/4 w-[30%]">Current</th>
                <th scope="col" className="p-3 text-left md:w-1/4 w-[30%] rounded-tr-xl">Equivalent Time</th>
              </tr>
            </thead>
            <tbody>
              {sortedTimezones.map((tz) => {
                const timezone = timezoneData.find((zone) => zone.value === tz);
                const currentTimeFormatted = formatTimeWithAMPM(currentTime[tz]);
                const converted = convertTime(tz);

                return (
                  <Fragment key={tz}>
                  <tr
                    className={`${rowHoverClass} transition`}
                  >
                    <td className="p-2 flex items-center gap-2 md:w-1/2 w-[40%]">
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
                          className={`${iconBtn} ${darkMode ? "text-rose-300 hover:text-rose-200" : "text-rose-600 hover:text-rose-500"} transition-transform transform hover:scale-110 active:scale-95`}
                          aria-label={`Remove ${timezone?.city || tz}`}
                          title="Remove Timezone"
                        >
                          <TrashIcon className="w-5 h-5" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                        <p className="font-bold">
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
                          className={`text-xs px-2 py-1 rounded-full ${chipClass}`}
                        >
                          {timezone?.gmt || ""}
                        </span>
                        {getPhoneCode(timezone) && (
                          <span
                            className={`text-xs font-mono px-2 py-1 rounded-full ${chipClass}`}
                            title={`Calling code for ${timezone.country}`}
                          >
                            <span aria-hidden="true">📞</span> {getPhoneCode(timezone)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-2 md:w-1/4 w-[30%]">
                      <div className="flex flex-wrap items-baseline gap-x-2 whitespace-nowrap">
                        <span className="text-lg font-semibold tabular-nums">
                          {currentTimeFormatted.time} {currentTimeFormatted.ampm}
                        </span>
                        {currentDate[tz] && (
                          <span className={`text-xs ${mutedClass}`}>{currentDate[tz]}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-2 md:w-1/4 w-[30%]">
                      <div className="flex flex-wrap items-baseline gap-x-2 whitespace-nowrap">
                        {converted ? (
                          <>
                            <span className="text-lg font-semibold tabular-nums">
                              {converted.time} {converted.ampm}
                            </span>
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
                  </tr>
                  <tr className="border-b border-white/10">
                    <td colSpan={3} className="px-2 pb-3">
                      <DayStrip
                        zone={tz}
                        primaryZone={primaryZone}
                        selectedDate={selectedDate}
                        selectedHour={Number((selectedTime || "").split(":")[0])}
                        onPick={(h) =>
                          setSelectedTime(`${String(h).padStart(2, "0")}:${(selectedTime || "00:00").split(":")[1] || "00"}`)
                        }
                        darkMode={darkMode}
                        is24={is24}
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
          <div className="mt-6 p-3 rounded-lg border border-dashed border-gray-400/40">
            <h2 className="font-semibold text-lg mb-2">Schedule this time</h2>
            <div className="grid md:grid-cols-4 gap-3">
              <label className="block text-sm">
                <span className={`block mb-1 ${mutedClass}`}>Title</span>
              <input
                className={`w-full p-3 rounded-xl shadow-inner transition ${inputClass}`}
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              </label>
              <label className="block text-sm">
                <span className={`block mb-1 ${mutedClass}`}>Location</span>
              <input
                className={`w-full p-3 rounded-xl shadow-inner transition ${inputClass}`}
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              </label>
              <label className="block text-sm">
                <span className={`block mb-1 ${mutedClass}`}>Duration (min)</span>
              <input
                type="number"
                min={15}
                step={15}
                className={`w-full p-3 rounded-xl shadow-inner transition ${inputClass}`}
                placeholder="Duration (min)"
                value={durationMin}
                onChange={(e) => setDurationMin(parseInt(e.target.value || "30", 10))}
              />
              </label>
              <label className="block text-sm">
                <span className={`block mb-1 ${mutedClass}`}>Details</span>
              <input
                className={`w-full p-3 rounded-xl shadow-inner transition ${inputClass}`}
                placeholder="Details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <a
                href={calendarReady ? gcalUrl : undefined}
                target="_blank"
                rel="noopener noreferrer"
                role={calendarReady ? undefined : "link"}
                aria-disabled={calendarReady ? undefined : "true"}
                className={`px-4 py-2 rounded-xl transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  calendarReady
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95"
                    : darkMode ? "bg-white/10 text-slate-300 cursor-not-allowed" : "bg-slate-200 text-slate-600 cursor-not-allowed"
                }`}
                onClick={(e) => {
                  if (!calendarReady) e.preventDefault();
                }}
              >
                Add to Google Calendar
              </a>
              <span className={`text-sm ${mutedClass}`}>
                {calendarReady
                  ? "Times are saved in UTC; Calendar shows them in each attendee's local timezone."
                  : "Enter a time above to enable this button."}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
