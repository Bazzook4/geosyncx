// /src/pages/PhoneCodeLookupPage.jsx
import { useState, useEffect } from "react";
import SEO from "../SEO";
import TelephoneCodeLookup from "../TelephoneCodeLookup";
import { Link } from "react-router-dom";

export default function PhoneCodeLookupPage({ darkMode }) {
  const cardClass = darkMode
    ? "bg-white/5 border border-white/10 backdrop-blur-xl"
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

        {/* Quick Steps */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold">1</div>
              <div>
                <p className={`font-medium ${darkMode ? "text-white" : "text-slate-900"}`}>Paste Number</p>
                <p className={`text-sm ${darkMode ? "text-white/70" : "text-slate-600"}`}>Any format works</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold">2</div>
              <div>
                <p className={`font-medium ${darkMode ? "text-white" : "text-slate-900"}`}>See Country</p>
                <p className={`text-sm ${darkMode ? "text-white/70" : "text-slate-600"}`}>Instantly identified</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold">3</div>
              <div>
                <p className={`font-medium ${darkMode ? "text-white" : "text-slate-900"}`}>Get Timezone</p>
                <p className={`text-sm ${darkMode ? "text-white/70" : "text-slate-600"}`}>Know their local time</p>
              </div>
            </div>
          </div>
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

        {/* FAQ Section */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <h2 className={`text-xl font-semibold mb-6 ${darkMode ? "text-white" : "text-slate-900"}`}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <summary className={`font-medium cursor-pointer ${darkMode ? "text-white" : "text-slate-900"}`}>
                How do I find a country from a phone number?
              </summary>
              <p className={`mt-3 text-sm ${darkMode ? "text-white/70" : "text-slate-600"}`}>
                Simply paste the phone number (with or without the + sign) into the search box. Our tool automatically identifies the country code and shows you the matching country, its timezone, and current local time.
              </p>
            </details>
            <details className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <summary className={`font-medium cursor-pointer ${darkMode ? "text-white" : "text-slate-900"}`}>
                What phone number formats are supported?
              </summary>
              <p className={`mt-3 text-sm ${darkMode ? "text-white/70" : "text-slate-600"}`}>
                We support all international formats: +1 555 123 4567, +44 20 7946 0958, +91-9876543210, and more. Spaces, dashes, and parentheses are automatically handled.
              </p>
            </details>
            <details className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <summary className={`font-medium cursor-pointer ${darkMode ? "text-white" : "text-slate-900"}`}>
                Can I look up just the country code without the full number?
              </summary>
              <p className={`mt-3 text-sm ${darkMode ? "text-white/70" : "text-slate-600"}`}>
                Yes! You can enter just the country code like +44, +1, or +91 to see which countries use that code and their timezones.
              </p>
            </details>
            <details className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <summary className={`font-medium cursor-pointer ${darkMode ? "text-white" : "text-slate-900"}`}>
                Why do some country codes match multiple countries?
              </summary>
              <p className={`mt-3 text-sm ${darkMode ? "text-white/70" : "text-slate-600"}`}>
                Some country codes are shared. For example, +1 is used by the USA, Canada, and several Caribbean nations. We show all matching countries so you can identify the correct one.
              </p>
            </details>
          </div>
        </div>
      </div>
    </>
  );
}
