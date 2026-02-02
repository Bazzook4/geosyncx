// /src/pages/TimezoneFinderPage.jsx
import { useState, useMemo, useEffect } from "react";
import SEO from "../SEO";
import { Link } from "react-router-dom";
import { DateTime } from "luxon";
import { getTimeZones } from "@vvo/tzdb";
import { normalizeTimezoneName } from "../timezones.js";

export default function TimezoneFinderPage({ darkMode }) {
  const [query, setQuery] = useState("");
  const [now, setNow] = useState(DateTime.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(DateTime.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const allTimezones = useMemo(() => {
    return getTimeZones().map((tz) => ({
      name: tz.name,
      alternativeName: tz.alternativeName,
      mainCities: tz.mainCities,
      countryName: tz.countryName,
      abbreviation: tz.abbreviation,
      rawOffsetInMinutes: tz.rawOffsetInMinutes,
      currentOffset: tz.currentTimeFormat?.split(" ")[0] || "",
    }));
  }, []);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return allTimezones.slice(0, 20);

    return allTimezones.filter((tz) => {
      const searchable = [
        tz.name,
        tz.alternativeName,
        tz.countryName,
        tz.abbreviation,
        ...(tz.mainCities || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      // Handle GMT offset search
      if (q.startsWith("gmt") || q.startsWith("utc")) {
        const offsetMatch = q.match(/[+-]?\d+/);
        if (offsetMatch) {
          const searchOffset = parseInt(offsetMatch[0]) * 60;
          return Math.abs(tz.rawOffsetInMinutes - searchOffset) < 60;
        }
      }

      return searchable.includes(q);
    });
  }, [query, allTimezones]);

  const cardClass = darkMode
    ? "bg-white/10 border border-white/15 backdrop-blur-xl"
    : "bg-white/80 border border-white/60 backdrop-blur-xl";

  const inputClass = darkMode
    ? "bg-white/10 border-white/20 text-white placeholder-white/50"
    : "bg-white border-slate-200 text-slate-900 placeholder-slate-400";

  return (
    <>
      <SEO
        title="Timezone Finder | Search by City, Country or GMT - GeoSyncX"
        description="Find any timezone by searching for a city, country, or GMT offset. See current local time instantly."
        keywords="timezone finder, world clock, timezone search, GMT offset, city timezone"
        url="https://www.geosyncx.com/tools/timezone-finder"
      />

      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className={`text-3xl md:text-4xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
            Timezone Finder
          </h1>
          <p className={`text-lg ${darkMode ? "text-white/70" : "text-slate-600"}`}>
            Search by city, country, or GMT offset
          </p>
        </div>

        {/* Search */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search: London, India, GMT+5:30..."
            className={`w-full px-4 py-3 rounded-xl border text-lg focus:outline-none focus:ring-2 focus:ring-sky-500 ${inputClass}`}
          />

          {/* Results */}
          <div className="mt-6 space-y-3 max-h-[500px] overflow-y-auto">
            {results.length === 0 ? (
              <p className={`text-center py-8 ${darkMode ? "text-white/50" : "text-slate-500"}`}>
                No timezones found for "{query}"
              </p>
            ) : (
              results.map((tz) => {
                const localTime = now.setZone(tz.name);
                const isValidZone = localTime.isValid;

                return (
                  <div
                    key={tz.name}
                    className={`p-4 rounded-xl ${darkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"} transition-colors`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
                          {tz.alternativeName || tz.name}
                        </h3>
                        <p className={`text-sm ${darkMode ? "text-white/60" : "text-slate-600"}`}>
                          {tz.countryName} • {tz.mainCities?.slice(0, 3).join(", ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-mono font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                          {isValidZone ? localTime.toFormat("HH:mm") : "--:--"}
                        </p>
                        <p className={`text-sm ${darkMode ? "text-white/60" : "text-slate-600"}`}>
                          {tz.abbreviation} ({tz.currentOffset})
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Related Tools */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>
            Related Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/tools/timezone-compare"
              className={`p-4 rounded-xl transition-all hover:scale-[1.02] ${darkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}
            >
              <h3 className="font-semibold text-sky-500">Timezone Compare →</h3>
              <p className={`text-sm mt-1 ${darkMode ? "text-white/60" : "text-slate-600"}`}>
                Compare multiple timezones side by side
              </p>
            </Link>
            <Link
              to="/tools/phone-code-lookup"
              className={`p-4 rounded-xl transition-all hover:scale-[1.02] ${darkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}
            >
              <h3 className="font-semibold text-sky-500">Phone Code Lookup →</h3>
              <p className={`text-sm mt-1 ${darkMode ? "text-white/60" : "text-slate-600"}`}>
                Identify country from phone number
              </p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
