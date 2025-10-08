// /src/TimeComparison.jsx
import { useState, useEffect, useMemo } from "react";
import { DateTime } from "luxon";
import { timezoneData } from "./timezones.js";
import { MapPinIcon, TrashIcon } from "@heroicons/react/24/outline";

function encode(s = "") {
  return encodeURIComponent(s).replace(/%20/g, "+");
}

const WEATHER_STALE_MS = 5 * 60 * 1000;

function pickWeatherIcon(weathercode, isDay) {
  if (weathercode === null || weathercode === undefined) return "☁️";
  if (weathercode <= 1) {
    return isDay ? "☀️" : "🌙";
  }
  return "☁️";
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
    const stored = localStorage.getItem("selectedDate");
    if (stored) return stored;
    const zone = primaryZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    return DateTime.now().setZone(zone).toISODate();
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTimezones, setFilteredTimezones] = useState([]);
  const [weatherByZone, setWeatherByZone] = useState({});
  const [weatherRefreshTick, setWeatherRefreshTick] = useState(0);

  // Small calendar fields
  const [title, setTitle] = useState("Meeting");
  const [durationMin, setDurationMin] = useState(60);
  const [location, setLocation] = useState("Google Meet");
  const [details, setDetails] = useState("Planned via GeoSyncX");

  const cardBase = darkMode
    ? "bg-white/10 text-white border border-white/15 shadow-xl"
    : "bg-white/70 text-gray-900 border border-white/60 shadow-xl";
  const inputClass = darkMode
    ? "bg-white/5 text-white placeholder:text-white/50"
    : "bg-white/60 text-gray-900 placeholder:text-gray-500";
  const tableHeaderClass = darkMode ? "bg-white/5" : "bg-white/70";
  const rowHoverClass = darkMode ? "hover:bg-white/10" : "hover:bg-white/80";
  const chipClass = darkMode ? "bg-white/10 text-white" : "bg-white/80 text-gray-900";

  useEffect(() => {
    localStorage.setItem("selectedDate", selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWeatherRefreshTick((prev) => prev + 1);
    }, WEATHER_STALE_MS);
    return () => clearInterval(interval);
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

  // Search filter
  useEffect(() => {
    if (!searchQuery) {
      setFilteredTimezones([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = timezoneData.filter(
      (tz) =>
        tz.city.toLowerCase().includes(q) ||
        tz.country.toLowerCase().includes(q) ||
        tz.value.toLowerCase().includes(q) ||
        tz.gmt.toLowerCase().includes(q)
    );
    setFilteredTimezones(filtered.slice(0, 200));
  }, [searchQuery]);

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

  useEffect(() => {
    setWeatherByZone((prev) => {
      const next = {};
      sortedTimezones.forEach((zone) => {
        if (prev[zone]) next[zone] = prev[zone];
      });
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(next);
      if (
        prevKeys.length === nextKeys.length &&
        prevKeys.every((key) => nextKeys.includes(key))
      ) {
        return prev;
      }
      return next;
    });
  }, [sortedTimezones]);

  useEffect(() => {
    let cancelled = false;

    const fetchWeatherForZone = async (zone) => {
      try {
        const tzInfo = timezoneData.find((item) => item.value === zone);
        if (!tzInfo) return;
        const searchTerms = [tzInfo.city, tzInfo.country].filter(Boolean).join(", ");
        if (!searchTerms) return;

        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            searchTerms
          )}&count=1&language=en&format=json`
        );
        if (!geoRes.ok) throw new Error(`Geocoding ${geoRes.status}`);
        const geoJson = await geoRes.json();
        const location = geoJson?.results?.[0];
        if (!location) return;

        const { latitude, longitude } = location;
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );
        if (!weatherRes.ok) throw new Error(`Weather ${weatherRes.status}`);
        const weatherJson = await weatherRes.json();
        const current = weatherJson?.current_weather;
        if (!current) return;

        const icon = pickWeatherIcon(current.weathercode, current.is_day);
        if (cancelled) return;
        setWeatherByZone((prev) => ({
          ...prev,
          [zone]: { icon, fetchedAt: Date.now() },
        }));
      } catch (error) {
        console.warn(`Weather lookup failed for ${zone}`, error);
      }
    };

    sortedTimezones.forEach((zone) => {
      const entry = weatherByZone[zone];
      if (entry && Date.now() - entry.fetchedAt < WEATHER_STALE_MS) return;
      fetchWeatherForZone(zone);
    });

    return () => {
      cancelled = true;
    };
  }, [sortedTimezones, weatherByZone, weatherRefreshTick]);

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
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by city, country, IANA (e.g., Asia/Kolkata) or GMT..."
          className={`w-full p-3 rounded-xl shadow-inner transition ${inputClass}`}
        />
        {searchQuery && (
          <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-white/10">
            {filteredTimezones.map((tz) => (
              <div
                key={tz.value}
                className={`p-2 cursor-pointer ${rowHoverClass} transition`}
                onClick={() => {
                  addZone(tz.value);
                  setSearchQuery("");
                }}
              >
                {tz.city}, {tz.country} ({tz.gmt}) —{" "}
                <span className="text-xs opacity-70">{tz.value}</span>
              </div>
            ))}
            {filteredTimezones.length === 0 && (
              <div className="p-2 opacity-70">No matches</div>
            )}
          </div>
        )}

        {/* Primary date/time */}
        <div className="grid md:grid-cols-3 gap-3 mt-4">
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
            <label className="block mb-1 font-semibold">Primary Time</label>
            <input
              type="time"
              onChange={(e) => setSelectedTime(e.target.value)}
              className={`w-full p-3 rounded-xl shadow-inner transition ${inputClass}`}
            />
          </div>
          <div className="flex items-end">
            <span className="text-sm opacity-75">
              {primaryZone ? `Primary: ${primaryZone}` : "Set a primary zone"}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full mt-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className={tableHeaderClass}>
                <th className="p-2 text-left md:w-1/2 w-[40%]">City</th>
                <th className="p-2 text-left md:w-1/4 w-[30%]">Current</th>
                <th className="p-2 text-left md:w-1/4 w-[30%]">Converted</th>
              </tr>
            </thead>
            <tbody>
              {sortedTimezones.map((tz) => {
                const timezone = timezoneData.find((zone) => zone.value === tz);
                const currentTimeFormatted = formatTimeWithAMPM(currentTime[tz]);
                const convertedTimeFormatted = formatTimeWithAMPM(convertTime(tz));
                const weatherIcon = weatherByZone[tz]?.icon;

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
                              ? "text-emerald-400 hover:text-emerald-300"
                              : "text-sky-400 hover:text-sky-300"
                          } transition-transform transform hover:scale-110 active:scale-95`}
                          title={tz === primaryZone ? "Primary Timezone" : "Set as Primary Timezone"}
                        >
                          <MapPinIcon className="w-5 h-5" />
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
                        <p className="font-bold">{timezone?.city || tz}</p>
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
                          {weatherIcon ? <span>{weatherIcon}</span> : null}
                          <span>{currentTimeFormatted.time}</span>
                        </span>
                        <span className="text-lg">{currentTimeFormatted.ampm}</span>
                      </div>
                    </td>
                    <td className="p-2 md:w-1/4 w-[30%]">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1">
                          {weatherIcon ? <span>{weatherIcon}</span> : null}
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
              onChange={(e) => setDurationMin(parseInt(e.target.value || "60", 10))}
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
