// /src/timezones.js
import { getTimeZones } from '@vvo/tzdb';
const timeZones = getTimeZones();

/** Convert minutes offset to "GMT+H[:MM]" */
function toGmtString(minutes) {
  const sign = minutes >= 0 ? '+' : '-';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `GMT${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`;
}

/** Prefer a nice city label if available */
function pickCity(tz) {
  if (tz.mainCities?.length) return tz.mainCities[0];
  const fromGroup = tz.group?.[0]?.split('/').pop();
  if (fromGroup) return fromGroup.replace(/_/g, ' ');
  return tz.name.split('/').pop().replace(/_/g, ' ');
}

/** One entry per IANA timezone */
export const timezoneData = timeZones.map((tz) => ({
  city: pickCity(tz),
  country: tz.countryName,
  gmt: toGmtString(tz.currentTimeOffsetInMinutes),
  value: tz.name, // e.g., "Asia/Kolkata"
  countryCode: tz.countryCode,
}));

/** Optional: one primary entry per country (first seen) */
export const timezoneDataPrimaryPerCountry = (() => {
  const seen = new Set();
  const list = [];
  for (const tz of timeZones) {
    if (seen.has(tz.countryName)) continue;
    seen.add(tz.countryName);
    list.push({
      city: pickCity(tz),
      country: tz.countryName,
      gmt: toGmtString(tz.currentTimeOffsetInMinutes),
      value: tz.name,
      countryCode: tz.countryCode,
    });
  }
  return list.sort((a, b) => a.country.localeCompare(b.country));
})();

export const countryCodeToPrimaryTimezone = (() => {
  const map = {};
  for (const tz of timeZones) {
    if (!tz.countryCode || map[tz.countryCode]) continue;
    map[tz.countryCode] = {
      value: tz.name,
      city: pickCity(tz),
      country: tz.countryName,
      gmt: toGmtString(tz.currentTimeOffsetInMinutes),
    };
  }
  return map;
})();
