// /src/TelephoneCodeLookup.jsx
import { useMemo, useState } from "react";
import {
  getSupportedRegionCodes,
  getCountryCodeForRegionCode,
  parsePhoneNumber,
} from "awesome-phonenumber";

// Convert ISO "IN" -> "🇮🇳"
function isoToFlag(iso) {
  if (!iso) return "🏳️";
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

  // Build list once from awesome-phonenumber
  const allCountries = useMemo(() => {
    return getSupportedRegionCodes()
      .map((iso) => ({
        iso,
        flag: isoToFlag(iso),
        code: `+${String(getCountryCodeForRegionCode(iso))}`,
        country: displayNames.of(iso) || iso,
      }))
      .sort((a, b) => a.country.localeCompare(b.country));
  }, [displayNames]);

  // Detect if query looks like a full phone number (7+ digits after removing non-digits)
  const isFullPhoneNumber = useMemo(() => {
    const digits = query.replace(/\D/g, "");
    return digits.length >= 7;
  }, [query]);

  // Parse full phone number to detect country
  const detectedCountries = useMemo(() => {
    if (!isFullPhoneNumber) return null;

    const cleanQuery = query.startsWith("+") ? query : `+${query.replace(/\D/g, "")}`;

    // Try parsing as-is first
    const parsed = parsePhoneNumber(cleanQuery);
    if (parsed.valid && parsed.regionCode) {
      const country = allCountries.find((c) => c.iso === parsed.regionCode);
      if (country) return [{ ...country, confidence: "exact" }];
    }

    // If not valid, try to match by prefix (2, 3, or 4 digit country codes)
    const digits = query.replace(/\D/g, "");
    const matches = [];

    // Check 1-4 digit prefixes
    for (let len = 1; len <= 4; len++) {
      if (digits.length < len) break;
      const prefix = digits.slice(0, len);
      const matchingCountries = allCountries.filter(
        (c) => c.code === `+${prefix}`
      );
      matchingCountries.forEach((c) => {
        if (!matches.find((m) => m.iso === c.iso)) {
          matches.push({ ...c, confidence: "prefix" });
        }
      });
    }

    return matches.length > 0 ? matches : null;
  }, [query, isFullPhoneNumber, allCountries]);

  const results = useMemo(() => {
    // If we detected countries from a full phone number, show those
    if (detectedCountries) {
      return detectedCountries;
    }

    const q = query.toLowerCase().trim();
    if (!q) return allCountries.slice(0, 30);

    return allCountries.filter(
      (c) =>
        c.country.toLowerCase().includes(q) ||
        c.code.includes(q) ||
        c.iso.toLowerCase().includes(q)
    );
  }, [query, allCountries, detectedCountries]);

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
          placeholder="Search country, code, or paste full phone number"
          className={`w-full p-3 rounded-xl shadow-inner transition ${
            darkMode
              ? "bg-white/5 text-white placeholder:text-white/40"
              : "bg-white/60 text-gray-900 placeholder:text-gray-500"
          }`}
        />

        {isFullPhoneNumber && detectedCountries && (
          <div
            className={`mt-2 px-3 py-2 rounded-lg text-xs ${
              darkMode ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-700"
            }`}
          >
            Detected {detectedCountries.length} possible{" "}
            {detectedCountries.length === 1 ? "country" : "countries"} from phone number
          </div>
        )}

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
                    darkMode ? "hover:bg-white/10" : "hover:bg-white/80"
                  } ${
                    r.confidence === "exact"
                      ? darkMode
                        ? "bg-emerald-500/10"
                        : "bg-emerald-50"
                      : ""
                  } transition-all duration-200`}
                  onClick={() => onCountrySelect?.(r)}
                >
                  <td className="p-2 text-lg leading-none">{r.flag}</td>
                  <td className="p-2">
                    {r.country}
                    {r.confidence === "exact" && (
                      <span
                        className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${
                          darkMode
                            ? "bg-emerald-500/30 text-emerald-300"
                            : "bg-emerald-200 text-emerald-700"
                        }`}
                      >
                        Match
                      </span>
                    )}
                  </td>
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
