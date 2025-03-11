import { useState, useEffect } from "react";
import TimeComparison from "./TimeComparison";
import TelephoneCodeLookup from "./TelephoneCodeLookup";

export default function App() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className={`w-full min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} flex flex-col p-2 md:p-6`}>
      <div className="absolute top-4 right-6 flex flex-row gap-4 w-full items-center justify-end">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-lg shadow-md ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"} transition`}
        >
          {darkMode ? "🌞" : "🌙"}
        </button>
        <button
          onClick={() => window.location.href = "mailto:feedback@example.com?subject=Website%20Feedback"}
          className={`p-2 rounded-lg shadow-md ${darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-500 hover:bg-blue-400"} transition`}
        >
          📩
        </button>
      </div>
      <h2 className="text-3xl font-bold mb-6 text-center mt-16 md:mt-0">World Time Comparison</h2>
      <div className="flex flex-col md:flex-row w-full gap-6">
        <TimeComparison darkMode={darkMode} />
        <TelephoneCodeLookup darkMode={darkMode} />
      </div>
    </div>
  );
}