// /src/TelephoneCodeLookup.jsx
import { useMemo, useState } from "react";
import metadata from "libphonenumber-js/metadata.min.json";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";

// Convert ISO "IN" -> "🇮🇳"
function isoToFlag(iso) {
  if (!iso) return "🏳️";
  // Some territories use non-letters; guard just in case
  return iso
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join("");
}

export default function TelephoneCodeLookup({ darkMode, onCountrySelect }) {
  const [query, setQuery] = useState("");

  const displayNames = useMemo(
    () => new Intl.DisplayNames(["en"], { type: "region" }),
    []
  );

  // Build list once from libphonenumber-js
  const allCountries = useMemo(() => {
    return getCountries()
      .map((iso) => ({
        iso,
        flag: isoToFlag(iso),
        code: `+${getCountryCallingCode(iso, metadata)}`,
        country: displayNames.of(iso) || iso,
      }))
      // Some countries share codes (e.g., US/CA). Sort tidy.
      .sort((a, b) => a.country.localeCompare(b.country));
  }, [displayNames]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return allCountries.slice(0, 30);
    return allCountries.filter(
      (c) =>
        c.country.toLowerCase().includes(q) ||
        c.code.includes(q) ||
        c.iso.toLowerCase().includes(q)
    );
  }, [query, allCountries]);

  const cardBase = darkMode
    ? "bg-white/10 border border-white/15 text-white shadow-xl"
    : "bg-white/70 border border-white/60 text-gray-900 shadow-xl";

  return (
    <div className="w-full">
      <div
        className={`p-4 rounded-2xl backdrop-blur-xl transition-colors duration-300 ${cardBase}`}
      >
        <div className="flex items-center justify-between gap-3 mb-2">
          <label className="font-semibold tracking-wide uppercase text-xs opacity-80">
            Telephone Codes
          </label>
          <span className="text-[11px] opacity-60">
            Click a country to add its primary timezone
          </span>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by country, code, or ISO"
          className={`w-full p-3 rounded-xl shadow-inner transition ${
            darkMode ? "bg-white/5 text-white placeholder:text-white/40" : "bg-white/60 text-gray-900 placeholder:text-gray-500"
          }`}
        />

        <div className="mt-3 max-h-80 overflow-y-auto rounded-xl border border-white/10">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className={`${darkMode ? "bg-white/5" : "bg-white/70"}`}>
                <th className="p-2 text-left w-10"> </th>
                <th className="p-2 text-left">Country</th>
                <th className="p-2 text-left">ISO</th>
                <th className="p-2 text-left">Code</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr
                  key={r.iso}
                  className={`cursor-pointer select-none ${
                    darkMode
                      ? "hover:bg-white/10"
                      : "hover:bg-white/80"
                  } transition-all duration-200`}
                  onClick={() => onCountrySelect?.(r)}
                >
                  <td className="p-2 text-lg leading-none">{r.flag}</td>
                  <td className="p-2">{r.country}</td>
                  <td className="p-2">{r.iso}</td>
                  <td className="p-2 font-mono">{r.code}</td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-3 text-center opacity-70">
                    No results
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
