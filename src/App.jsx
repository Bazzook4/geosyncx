// /src/App.jsx
import { useMemo, useEffect, useState } from "react";
import TimeComparison from "./TimeComparison.jsx";
import TelephoneCodeLookup from "./TelephoneCodeLookup.jsx";
import BestMeetingFinder from "./BestMeetingFinder.jsx";
import TodoSmart from "./TodoSmart.jsx";
import { countryCodeToPrimaryTimezone } from "./timezones.js";

const FALLBACK_QUOTES = [
  { text: "Small steps every day build momentum.", author: "Unknown" },
  { text: "Clarity comes from doing, not waiting.", author: "Marie Forleo" },
  { text: "You already have what you need to begin.", author: "Unknown" },
  { text: "Progress beats perfection every time.", author: "Unknown" },
  { text: "Focus on the next right task.", author: "Unknown" },
  { text: "Consistency compounds quietly.", author: "Unknown" },
  { text: "Energy flows where attention goes.", author: "Tony Robbins" },
  {
    text: "Protect the time that protects your future.",
    author: "Unknown",
  },
];

const TABS = [
  { id: "tasks", label: "Smart To-Do" },
  { id: "timezones", label: "Timezones" },
];

function shuffleQuotes(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function App() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const [activeTab, setActiveTab] = useState("tasks");

  const [quotes, setQuotes] = useState(() => shuffleQuotes(FALLBACK_QUOTES));
  const [quotePointer, setQuotePointer] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchQuotes() {
      try {
        const response = await fetch("https://type.fit/api/quotes");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) return;

        const filtered = data
          .map((item) => ({
            text: item?.text?.trim(),
            author: item?.author?.trim() || "Unknown",
          }))
          .filter((item) => item.text && item.text.length <= 140);

        if (!cancelled && filtered.length) {
          const shuffled = shuffleQuotes(filtered);
          setQuotes(shuffled);
          setQuotePointer(0);
        }
      } catch (error) {
        console.warn("Quotes API unavailable, using fallback.", error);
      }
    }

    fetchQuotes();
    const refreshTimer = setInterval(fetchQuotes, 1000 * 60 * 30); // refresh list every 30 minutes
    return () => {
      cancelled = true;
      clearInterval(refreshTimer);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuotePointer((prev) => {
        if (quotes.length <= 1) return prev;
        return (prev + 1) % quotes.length;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [quotes]);

  useEffect(() => {
    if (quotes.length > 0 && quotePointer >= quotes.length) {
      setQuotePointer(0);
    }
  }, [quotes, quotePointer]);

  const [primaryZone, setPrimaryZone] = useState(() => {
    return (
      localStorage.getItem("primaryZone") ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "UTC"
    );
  });

  const [selectedZones, setSelectedZones] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("selectedZones") || "[]");
      if (!Array.isArray(saved)) return [];
      const filtered = saved.filter(
        (zone) => typeof zone === "string" && zone.trim().length > 0
      );
      return Array.from(new Set(filtered));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("primaryZone", primaryZone);
    localStorage.setItem("selectedZones", JSON.stringify(selectedZones));
  }, [primaryZone, selectedZones]);

  const sortedTimezones = useMemo(() => {
    const unique = selectedZones.filter((z) => z && z !== primaryZone);
    return primaryZone ? [primaryZone, ...unique] : unique;
  }, [primaryZone, selectedZones]);

  const handleCountrySelect = (country) => {
    if (!country) return;
    const iso = country.iso?.toUpperCase();
    if (!iso) return;
    const match = countryCodeToPrimaryTimezone[iso];
    if (!match) {
      alert(`No timezone data found for ${country.country}.`);
      return;
    }
    const alreadyTracked =
      primaryZone === match.value || selectedZones.includes(match.value);
    if (alreadyTracked) {
      if (
        primaryZone !== match.value &&
        window.confirm(
          `${match.city} (${match.gmt}) is already tracked. Set it as your primary timezone?`
        )
      ) {
        setPrimaryZone(match.value);
      } else if (primaryZone === match.value) {
        alert(`${match.city} is already your primary timezone.`);
      }
      return;
    }
    if (
      window.confirm(
        `Add ${match.city} (${match.gmt}) to your timezone list for quick comparison?`
      )
    ) {
      setSelectedZones((prev) => [...prev, match.value]);
    }
  };

  const quote = quotes[quotePointer] || FALLBACK_QUOTES[0];
  const backgroundClass = darkMode
    ? "bg-slate-950 text-slate-100"
    : "bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 text-slate-900";
  const toolbarCard = darkMode
    ? "bg-white/10 border border-white/10 text-white"
    : "bg-white/70 border border-white/60 text-slate-900";
  const tabShell = darkMode
    ? "bg-white/10 border border-white/10"
    : "bg-white/70 border border-white/60";
  const tabInactive = darkMode
    ? "text-white/80 hover:text-white"
    : "text-slate-600 hover:text-slate-900";
  const themeToggleClass = darkMode
    ? "bg-white/20 text-white hover:bg-white/30"
    : "bg-slate-900 text-white hover:bg-slate-800";

  return (
    <div className={`min-h-screen w-full transition-colors ${backgroundClass}`}>
      <div className="px-4 py-6 md:px-8 md:py-10 space-y-6 md:space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl shadow-lg ${toolbarCard}`}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">
              Daily Spark
            </span>
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-medium leading-snug">
                “{quote.text}”
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-3 py-2 rounded-xl transition-transform active:scale-95 shadow-lg ${themeToggleClass}`}
              title="Toggle theme"
            >
              {darkMode ? "🌞" : "🌙"}
            </button>
            <button
              onClick={() =>
                (window.location.href =
                  "mailto:hello@geosyncx.com?subject=GeoSyncX%20Feedback")
              }
              className="px-3 py-2 rounded-xl bg-sky-500 text-white hover:bg-sky-400 transition-transform active:scale-95 shadow-lg"
              title="Send feedback"
            >
              📩
            </button>
          </div>
        </header>

        <div className="flex items-center justify-start">
          <div
            className={`flex gap-2 p-1 rounded-full backdrop-blur-xl shadow-lg ${tabShell}`}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-95 ${
                    isActive ? "bg-sky-500 text-white shadow-lg" : tabInactive
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === "tasks" && (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] xl:gap-6">
            <TodoSmart darkMode={darkMode} />
            <div className="flex flex-col gap-4">
              <TelephoneCodeLookup
                darkMode={darkMode}
                onCountrySelect={handleCountrySelect}
              />
            </div>
          </div>
        )}

        {activeTab === "timezones" && (
          <div className="space-y-4 xl:space-y-6">
            <TimeComparison
              darkMode={darkMode}
              primaryZone={primaryZone}
              setPrimaryZone={setPrimaryZone}
              selectedZones={selectedZones}
              setSelectedZones={setSelectedZones}
            />
            <BestMeetingFinder zones={sortedTimezones} darkMode={darkMode} />
          </div>
        )}
      </div>
    </div>
  );
}
