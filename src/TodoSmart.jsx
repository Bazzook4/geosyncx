// /src/TodoSmart.jsx
import { useState } from "react";
import { v4 as uuid } from "uuid";

export default function TodoSmart({ darkMode }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("todos_gsx") || "[]");
      if (!Array.isArray(saved)) return [];
      return saved
        .map((item) => ({
          id: item.id || uuid(),
          title: typeof item.title === "string" ? item.title : "",
          done: Boolean(item.done),
        }))
        .filter((item) => item.title.trim().length > 0);
    } catch {
      return [];
    }
  });

  const [draft, setDraft] = useState("");

  const panel = darkMode
    ? "bg-white/10 text-white border border-white/15 shadow-xl"
    : "bg-white/70 text-gray-900 border border-white/60 shadow-xl";
  const input = darkMode
    ? "bg-white/5 text-white placeholder:text-white/50"
    : "bg-white/60 text-gray-900 placeholder:text-gray-500";

  function persist(next) {
    localStorage.setItem("todos_gsx", JSON.stringify(next));
    setItems(next);
  }

  function handleAdd() {
    const title = draft.trim();
    if (!title) return;

    const newItem = {
      id: uuid(),
      title,
      done: false,
    };
    persist([newItem, ...items]);
    setDraft("");
  }

  function toggleDone(id) {
    persist(items.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function removeItem(id) {
    persist(items.filter((t) => t.id !== id));
  }

  async function copyTaskToClipboard(t) {
    try {
      await navigator.clipboard.writeText(`• ${t.title}`);
      alert("Copied single task as a bullet.");
    } catch (e) {
      console.error("Clipboard error", e);
      alert("Couldn't copy. Select the text manually.");
    }
  }

  async function copyAllTasks() {
    if (items.length === 0) return;
    const bullets = items.map((t) => `• ${t.title}`).join("\n");
    try {
      await navigator.clipboard.writeText(bullets);
      alert("Copied all tasks as bullet list.");
    } catch (e) {
      console.error("Clipboard error", e);
      alert("Couldn't copy. Select the text manually.");
    }
  }

  return (
    <div className={`p-6 rounded-2xl backdrop-blur-xl transition-colors duration-300 ${panel}`}>
      <h3 className="font-semibold mb-2 tracking-wide uppercase text-xs opacity-80">
        Smart To-Do
      </h3>

      {/* Draft editor */}
      <div className="flex flex-col md:flex-row gap-2 mt-3">
        <input
          className={`p-3 rounded-xl w-full shadow-inner transition ${input}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a task"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-400 transition-transform active:scale-95"
          title="Add using current draft"
        >
          Add
        </button>
        <button
          onClick={copyAllTasks}
          disabled={items.length === 0}
          className={`px-4 py-3 rounded-xl bg-sky-500 text-white hover:bg-sky-400 transition-transform active:scale-95 ${
            items.length === 0 ? "opacity-50 cursor-not-allowed hover:bg-sky-500" : ""
          }`}
          title="Copy all tasks as bullet points"
        >
          Copy Bullets
        </button>
      </div>

      {/* List */}
      <div className="mt-4">
        {items.length === 0 ? (
          <p className="text-sm opacity-70">No items yet. Add something above.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((t) => {
              return (
                <li
                  key={t.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                    darkMode ? "border-white/10 bg-white/5" : "border-white/60 bg-white/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={t.done} onChange={() => toggleDone(t.id)} />
                    <div>
                      <div className={`text-sm ${t.done ? "line-through opacity-70" : ""}`}>
                        {t.title}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyTaskToClipboard(t)}
                      className="px-3 py-2 rounded-lg text-xs bg-sky-500 text-white hover:bg-sky-400 transition-transform active:scale-95"
                      title="Copy this task as a bullet"
                    >
                      Copy Bullet
                    </button>
                    <button
                      onClick={() => removeItem(t.id)}
                      className="px-3 py-2 rounded-lg text-xs bg-rose-500 text-white hover:bg-rose-400 transition-transform active:scale-95"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="text-xs opacity-60 mt-2">Tip: Keep tasks short like “Email Julia”, “File taxes”, “Follow up on invoice”.</p>
      <p className="text-xs opacity-60 mt-1">
        Quick share: Use <strong>Copy Bullets</strong> to grab the list and paste anywhere.
      </p>
    </div>
  );
}
