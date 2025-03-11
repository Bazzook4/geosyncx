import { useState } from "react";
import countryCodes from "./countryCodes";

export default function TelephoneCodeLookup({ darkMode }) {
  const [countryCodeInput, setCountryCodeInput] = useState("");
  const [identifiedCountry, setIdentifiedCountry] = useState({
    country: "",
    flag: "",
    continent: "",
  });

  const handleCountryCodeSearch = () => {
    const foundEntry = countryCodes.find((entry) => entry.code === countryCodeInput.trim());
    if (foundEntry) {
      setIdentifiedCountry({
        country: foundEntry.countries.map((c) => `${c.name} ${c.flag}`).join(", "),
        continent: foundEntry.continent,
      });
    } else {
      setIdentifiedCountry({ country: "Unknown Country", flag: "", continent: "" });
    }
  };

  return (
    <div className="w-full md:w-2/5">
      <div className={`p-6 rounded-lg shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <h2 className="text-2xl font-semibold mb-4">Telephone Country Code Lookup</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={countryCodeInput}
            onChange={(e) => setCountryCodeInput(e.target.value)}
            placeholder="Enter Code (e.g. +91)"
            className={`w-full p-3 rounded-lg shadow-sm ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
          />
          <button
            onClick={handleCountryCodeSearch}
            className={`px-4 py-2 rounded-lg ${darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-500 hover:bg-blue-400"} text-white transition`}
          >
            Search
          </button>
        </div>
        <p className="mt-4">
          <strong>Identified Country:</strong> {identifiedCountry.country} {identifiedCountry.flag} &nbsp; | &nbsp; <strong>Continent:</strong> {identifiedCountry.continent}
        </p>
      </div>
    </div>
  );
}