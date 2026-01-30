// /src/TimeComparison.jsx
import { useState, useEffect, useMemo } from "react";
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

// Reverse mapping: country name -> phone code
const countryToPhoneCode = (() => {
  const map = {};
  getSupportedRegionCodes().forEach((iso) => {
    const code = `+${getCountryCodeForRegionCode(iso)}`;
    const countryName = displayNames.of(iso) || iso;
    // Store with lowercase key for easier matching
    map[countryName.toLowerCase()] = code;
  });
  return map;
})();

// Helper to get phone code for a country name
function getPhoneCodeForCountry(countryName) {
  if (!countryName) return null;
  const lower = countryName.toLowerCase();
  // Try exact match first
  if (countryToPhoneCode[lower]) return countryToPhoneCode[lower];
  // Try partial match
  for (const [key, code] of Object.entries(countryToPhoneCode)) {
    if (lower.includes(key) || key.includes(lower)) {
      return code;
    }
  }
  return null;
}

function encode(s = "") {
  return encodeURIComponent(s).replace(/%20/g, "+");
}

export default function TimeComparison({
  darkMode,
  primaryZone,
  setPrimaryZone,
  selectedZones,
  setSelectedZones,
}) {
  const [currentTime, setCurrentTime] = useState({});
  const [selectedTime, setSelectedTime] = useState(""); // HH:mm
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
  const [location, setLocation] = useState("Google Meet");
  const [details, setDetails] = useState("Planned via GeoSyncX");

  const cardBase = darkMode
    ? "bg-white/10 text-white border border-white/15 shadow-xl"
    : "bg-white/70 text-gray-900 border border-white/60 shadow-xl";
  const inputClass = darkMode
    ? "bg-white/5 text-white placeholder:text-white/50"
    : "bg-white/60 text-gray-900 placeholder:text-gray-500";
  const tableHeaderClass = darkMode
    ? "bg-gradient-to-b from-white/10 to-white/5 border-b border-white/20"
    : "bg-gradient-to-b from-white/90 to-white/70 border-b border-white/40";
  const rowHoverClass = darkMode ? "hover:bg-white/10" : "hover:bg-white/80";
  const chipClass = darkMode ? "bg-white/10 text-white" : "bg-white/80 text-gray-900";

  // Clear old cached date (one-time cleanup)
  useEffect(() => {
    localStorage.removeItem("selectedDate");
  }, []);

  // Tick current times every second
  useEffect(() => {
    const updateTimes = () => {
      const newTimes = {};
      const zones = new Set(selectedZones);
      if (primaryZone) zones.add(primaryZone);
      zones.forEach((tz) => {
        newTimes[tz] = DateTime.now().setZone(tz).toFormat("hh:mm a");
      });
      setCurrentTime(newTimes);
    };
    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [selectedZones, primaryZone]);

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

  // Convert “selectedTime” (HH:mm) from primary -> target zone
  const convertTime = (zone) => {
    if (!selectedTime || !primaryZone || !selectedDate) return "-";
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
    if (!base.isValid) return "-";
    return base.setZone(zone).toFormat("hh:mm a");
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
    const fullDetails = `${details}\n\nPrimary TZ: ${primaryZone}\nParticipants: ${who}\n\n(Click “Add Google Meet” in Calendar to attach a Meet link.)`;
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
        <label className="block mb-2 text-xs font-semibold uppercase tracking-wide opacity-80">
          Add a Timezone
        </label>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PhoneIcon className="w-4 h-4 opacity-70" />
              <label className="text-xs opacity-70">Search by Phone Code</label>
            </div>
            <input
              type="text"
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value)}
              placeholder="e.g., +91, +44, +1..."
              className={`w-full p-3 rounded-xl shadow-inner transition ${inputClass}`}
            />
          </div>
          <div>
            <label className="text-xs opacity-70 mb-1 block">Search by Location</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="City, country, IANA, or GMT..."
              className={`w-full p-3 rounded-xl shadow-inner transition ${inputClass}`}
            />
          </div>
        </div>
        {(searchQuery || phoneCode) && (
          <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-white/10">
            {phoneCode && phoneCodeMatches.length > 0 && (
              <div className="p-2 bg-emerald-500/20 text-xs font-semibold sticky top-0 backdrop-blur-sm">
                Found {phoneCodeMatches.length} timezone(s) for {phoneCode}
              </div>
            )}
            {filteredTimezones.map((tz) => {
              const phoneCodeForTz = getPhoneCodeForCountry(tz.country);
              return (
                <div
                  key={tz.value}
                  className={`p-2 cursor-pointer ${rowHoverClass} transition flex items-center justify-between gap-2`}
                  onClick={() => {
                    addZone(tz.value);
                    setSearchQuery("");
                    setPhoneCode("");
                  }}
                >
                  <span>
                    {tz.city}, {tz.country} ({tz.gmt}) —{" "}
                    <span className="text-xs opacity-70">{tz.value}</span>
                  </span>
                  {phoneCodeForTz && (
                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${darkMode ? "bg-white/10" : "bg-gray-200"}`}>
                      {phoneCodeForTz}
                    </span>
                  )}
                </div>
              );
            })}
            {filteredTimezones.length === 0 && (
              <div className="p-2 opacity-70">
                {phoneCode ? `No timezones found for phone code ${phoneCode}` : "No matches"}
              </div>
            )}
          </div>
        )}

        {/* Primary date and time */}
        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <div>
            <label className="block mb-1 font-semibold">Primary Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`w-full p-3 rounded-xl shadow-inner transition ${inputClass}`}
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">
              {primaryZone
                ? `Your Time at ${
                    timezoneData.find((tz) => tz.value === primaryZone)?.city || primaryZone.split("/").pop()
                  }, ${timezoneData.find((tz) => tz.value === primaryZone)?.country || ""}`
                : "Your Time (Click ⭐ to set primary timezone)"}
            </label>
            <input
              type="time"
              onChange={(e) => setSelectedTime(e.target.value)}
              placeholder="Set time"
              className={`w-full p-3 rounded-xl shadow-inner transition ${inputClass}`}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full mt-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className={tableHeaderClass}>
                <th className="p-3 text-left md:w-1/2 w-[40%] rounded-tl-xl">City</th>
                <th className="p-3 text-left md:w-1/4 w-[30%]">Current</th>
                <th className="p-3 text-left md:w-1/4 w-[30%] rounded-tr-xl">Equivalent Time</th>
              </tr>
            </thead>
            <tbody>
              {sortedTimezones.map((tz) => {
                const timezone = timezoneData.find((zone) => zone.value === tz);
                const currentTimeFormatted = formatTimeWithAMPM(currentTime[tz]);
                const convertedTimeFormatted = formatTimeWithAMPM(convertTime(tz));

                return (
                  <tr
                    key={tz}
                    className={`border-b border-white/10 ${rowHoverClass} transition`}
                  >
                    <td className="p-2 flex items-center gap-2 md:w-1/2 w-[40%]">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => setAsPrimary(tz)}
                          className={`p-1 rounded-lg ${
                            tz === primaryZone
                              ? "text-yellow-400 hover:text-yellow-300"
                              : "text-gray-400 hover:text-yellow-400"
                          } transition-all transform hover:scale-110 active:scale-95`}
                          title={tz === primaryZone ? "Primary Timezone" : "Set as Primary Timezone"}
                        >
                          {tz === primaryZone ? (
                            <StarIconSolid className="w-5 h-5" />
                          ) : (
                            <StarIconOutline className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            setSelectedZones((prev) => prev.filter((zone) => zone !== tz))
                          }
                          className="p-1 rounded-lg text-rose-400 hover:text-rose-300 transition-transform transform hover:scale-110 active:scale-95"
                          title="Remove Timezone"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                      <div>
                        <p className="font-bold">
                          {timezone?.city || tz}
                          {tz === primaryZone && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 hidden md:inline">
                              Primary
                            </span>
                          )}
                        </p>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-white/60" : "text-gray-500"
                          }`}
                        >
                          {timezone?.country || ""}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${chipClass}`}
                        >
                          {timezone?.gmt || ""}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 md:w-1/4 w-[30%]">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1">
                          <span>{currentTimeFormatted.time}</span>
                        </span>
                        <span className="text-lg">{currentTimeFormatted.ampm}</span>
                      </div>
                    </td>
                    <td className="p-2 md:w-1/4 w-[30%]">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1">
                          <span>{convertedTimeFormatted.time}</span>
                        </span>
                        <span className="text-lg">{convertedTimeFormatted.ampm}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sortedTimezones.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center opacity-70">
                    Add a timezone above to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Inline scheduling (inside TimeComparison) */}
        <div className="mt-6 p-3 rounded-lg border border-dashed border-gray-400/40">
          <div className="font-semibold mb-2">Schedule this time</div>
          <div className="grid md:grid-cols-4 gap-3">
            <input
              className={`p-3 rounded-xl shadow-inner transition ${inputClass}`}
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className={`p-3 rounded-xl shadow-inner transition ${inputClass}`}
              placeholder="Location (e.g., Google Meet)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <input
              type="number"
              min={15}
              step={15}
              className={`p-3 rounded-xl shadow-inner transition ${inputClass}`}
              placeholder="Duration (min)"
              value={durationMin}
              onChange={(e) => setDurationMin(parseInt(e.target.value || "30", 10))}
            />
            <input
              className={`p-3 rounded-xl shadow-inner transition ${inputClass}`}
              placeholder="Details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <a
              href={calendarReady ? gcalUrl : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-2 rounded-xl transition-transform ${
                calendarReady
                  ? "bg-emerald-500 hover:bg-emerald-400 text-white active:scale-95"
                  : "bg-white/20 text-white/60 cursor-not-allowed"
              }`}
              onClick={(e) => {
                if (!calendarReady) e.preventDefault();
              }}
            >
              Add to Google Calendar
            </a>
            <span className="text-xs opacity-70">
              Times are saved in UTC; Calendar shows them in each attendee’s local timezone. To get a Google Meet link, click “Add Google Meet” in Calendar after opening.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
