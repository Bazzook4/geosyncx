// /src/QuickLinks.jsx
import { useEffect, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";

const STORAGE_KEY = "quickLinks_gsx";

function sanitizeList(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => ({
      id: item.id || uuid(),
      label: typeof item.label === "string" ? item.label.trim() : "",
      url: typeof item.url === "string" ? item.url.trim() : "",
    }))
    .filter((item) => item.label && item.url);
}

export default function QuickLinks({ darkMode }) {
  const [links, setLinks] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return sanitizeList(saved);
    } catch {
      return [];
    }
  });
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    } catch {
      // storage blocked; links stay for this session only
    }
  }, [links]);

  const panelClass = useMemo(
    () =>
      darkMode
        ? "bg-white/10 text-white border border-white/15 shadow-xl"
        : "bg-white/70 text-gray-900 border border-white/60 shadow-xl",
    [darkMode]
  );

  const inputClass = darkMode
    ? "bg-white/5 text-white placeholder:text-slate-300"
    : "bg-white/60 text-gray-900 placeholder:text-gray-600";

  const handleAdd = () => {
    const trimmedLabel = label.trim();
    let trimmedUrl = url.trim();
    if (!trimmedLabel || !trimmedUrl) return;
    if (!/^https?:\/\//i.test(trimmedUrl)) {
      trimmedUrl = `https://${trimmedUrl}`;
    }
    const next = [
      { id: uuid(), label: trimmedLabel, url: trimmedUrl },
      ...links,
    ];
    setLinks(next);
    setLabel("");
    setUrl("");
  };

  const handleRemove = (id) => {
    setLinks((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div
      className={`p-6 rounded-2xl backdrop-blur-xl transition-colors duration-300 ${panelClass}`}
    >
      <h2 className="font-semibold mb-3 text-lg">Quick Links</h2>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          aria-label="Link label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label"
          className={`p-3 rounded-xl shadow-inner ${inputClass}`}
        />
        <input
          aria-label="Link URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className={`p-3 rounded-xl shadow-inner ${inputClass}`}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-3 rounded-xl bg-indigo-500 text-white hover:bg-indigo-400 transition-transform active:scale-95"
          title="Add link"
        >
          Add
        </button>
      </div>

      {links.length === 0 ? (
        <p className="text-sm mt-3">
          Save your frequently used links here. They stay until you clear your browser data.
        </p>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-2">
          {links.map((item) => (
            <li key={item.id}>
              <div
                className={`flex items-center gap-2 rounded-full px-3 py-2 border ${
                  darkMode
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-slate-300 bg-white/80 text-slate-800"
                }`}
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline truncate max-w-[200px]"
                  title={item.url}
                >
                  {item.label}
                </a>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="inline-flex items-center justify-center min-w-[32px] min-h-[32px] text-sm rounded-full bg-rose-600 text-white hover:bg-rose-500 transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  aria-label={`Remove link ${item.label}`}
                  title="Remove link"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
