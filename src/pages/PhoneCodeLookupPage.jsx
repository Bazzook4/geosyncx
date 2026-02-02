// /src/pages/PhoneCodeLookupPage.jsx
import { useState, useEffect } from "react";
import SEO from "../SEO";
import TelephoneCodeLookup from "../TelephoneCodeLookup";
import { Link } from "react-router-dom";

export default function PhoneCodeLookupPage({ darkMode }) {
  const cardClass = darkMode
    ? "bg-white/10 border border-white/15 backdrop-blur-xl"
    : "bg-white/80 border border-white/60 backdrop-blur-xl";

  const handleCountrySelect = (country) => {
    // Could navigate to timezone finder with this country pre-selected
    console.log("Selected country:", country);
  };

  return (
    <>
      <SEO
        title="Phone Code Lookup | Find Country from Phone Number - GeoSyncX"
        description="Identify any country from a phone number or country code. Paste a number like +44 7xxx and instantly know where it's from."
        keywords="phone code lookup, country code finder, international dialing code, phone number country identifier"
        url="https://www.geosyncx.com/tools/phone-code-lookup"
      />

      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className={`text-3xl md:text-4xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
            Phone Code Lookup
          </h1>
          <p className={`text-lg ${darkMode ? "text-white/70" : "text-slate-600"}`}>
            Paste any phone number and instantly identify the country
          </p>
        </div>

        {/* Main Tool */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <TelephoneCodeLookup darkMode={darkMode} onCountrySelect={handleCountrySelect} />
        </div>

        {/* Use Cases */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>
            Common Use Cases
          </h2>
          <ul className={`space-y-3 ${darkMode ? "text-white/80" : "text-slate-700"}`}>
            <li className="flex items-start gap-3">
              <span className="text-sky-500">📞</span>
              <span><strong>Sales teams:</strong> Identify where your leads are calling from</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-sky-500">🌍</span>
              <span><strong>Customer support:</strong> Know your caller's timezone before picking up</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-sky-500">🔍</span>
              <span><strong>Verification:</strong> Confirm the origin of international numbers</span>
            </li>
          </ul>
        </div>

        {/* Related Tools */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>
            Related Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/tools/timezone-finder"
              className={`p-4 rounded-xl transition-all hover:scale-[1.02] ${darkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}
            >
              <h3 className="font-semibold text-sky-500">Timezone Finder →</h3>
              <p className={`text-sm mt-1 ${darkMode ? "text-white/60" : "text-slate-600"}`}>
                Find timezone by country or city
              </p>
            </Link>
            <Link
              to="/tools/meeting-scheduler"
              className={`p-4 rounded-xl transition-all hover:scale-[1.02] ${darkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}
            >
              <h3 className="font-semibold text-sky-500">Meeting Scheduler →</h3>
              <p className={`text-sm mt-1 ${darkMode ? "text-white/60" : "text-slate-600"}`}>
                Schedule calls across timezones
              </p>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
