// /src/App.jsx
import { useMemo, useEffect, useState } from "react";
import SEO from "./SEO";
import { DEFAULT_SEO } from "./seo-config";
import TimeComparison from "./TimeComparison.jsx";
import BestMeetingFinder from "./BestMeetingFinder.jsx";
import FormatterStudio from "./FormatterStudio.jsx";
import { normalizeTimezoneName } from "./timezones.js";

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
  { id: "timezones", label: "Timezones", desc: "Compare times across cities. Search by phone code or location to find timezones." },
  { id: "formatter", label: "Formatter", desc: "Clean up messy JSON, XML, or SOAP. Add or remove escape characters from text." },
];

function shuffleQuotes(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function App({ darkMode }) {

  const [activeTab, setActiveTab] = useState("timezones");

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
    const stored = localStorage.getItem("primaryZone");
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tz = stored || detected || "UTC";
    return normalizeTimezoneName(tz);
  });

  const [selectedZones, setSelectedZones] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("selectedZones") || "[]");
      if (!Array.isArray(saved)) return [];
      const filtered = saved
        .filter((zone) => typeof zone === "string" && zone.trim().length > 0)
        .map(normalizeTimezoneName);
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

  const quote = quotes[quotePointer] || FALLBACK_QUOTES[0];
  const toolbarCard = darkMode
    ? "bg-white/10 border border-white/10 text-white"
    : "bg-white/70 border border-white/60 text-slate-900";
  const tabShell = darkMode
    ? "bg-white/10 border border-white/10"
    : "bg-white/70 border border-white/60";
  const tabInactive = darkMode
    ? "text-white/80 hover:text-white"
    : "text-slate-600 hover:text-slate-900";

  return (
    <>
      <SEO {...DEFAULT_SEO} />
      <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl shadow-lg ${toolbarCard}`}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">
            Daily Spark
          </span>
          <div className="flex flex-col">
            <span className="text-sm md:text-base font-medium leading-snug">
              "{quote.text}"
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-2">
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
          <p className={`text-sm ${darkMode ? "text-white/60" : "text-slate-500"}`}>
            {TABS.find(t => t.id === activeTab)?.desc}
          </p>
        </div>

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

      {activeTab === "formatter" && (
        <div className="space-y-4 xl:space-y-6">
          <FormatterStudio darkMode={darkMode} />
        </div>
      )}
    </div>
    </>
  );
}
