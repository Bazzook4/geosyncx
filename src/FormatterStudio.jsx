// /src/FormatterStudio.jsx
import { useEffect, useMemo, useRef, useState } from "react";

function prettifyJson(input) {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed, null, 2);
}

function prettifyXml(input) {
  const compact = input.replace(/>\s+</g, "><").replace(/></g, ">\n<");
  const lines = compact
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let indent = 0;
  return lines
    .map((line) => {
      if (line.match(/^<\/.+>/)) indent = Math.max(indent - 1, 0);
      const padded = `${"  ".repeat(indent)}${line}`;
      if (line.match(/^<[^!?][^>]*[^/]>.*$/) && !line.includes("</")) {
        indent += 1;
      }
      return padded;
    })
    .join("\n");
}

function prettifySoap(input) {
  return prettifyXml(input);
}

function escapeString(input) {
  return input
    .replace(/\\/g, '\\\\')     // Backslash
    .replace(/"/g, '\\"')        // Double quote
    .replace(/\n/g, '\\n')       // Newline
    .replace(/\r/g, '\\r')       // Carriage return
    .replace(/\t/g, '\\t')       // Tab
    .replace(/\b/g, '\\b')       // Backspace
    .replace(/\f/g, '\\f');      // Form feed
}

function unescapeString(input) {
  return input
    .replace(/\\n/g, '\n')       // Newline
    .replace(/\\r/g, '\r')       // Carriage return
    .replace(/\\t/g, '\t')       // Tab
    .replace(/\\b/g, '\b')       // Backspace
    .replace(/\\f/g, '\f')       // Form feed
    .replace(/\\"/g, '"')        // Double quote
    .replace(/\\\\/g, '\\');     // Backslash (must be last)
}

function detectFormat(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    JSON.parse(trimmed);
    return "json";
  } catch {
    // ignore
  }

  if (trimmed.startsWith("<")) {
    if (/^<\s*soap[:\s]/i.test(trimmed) || trimmed.includes(":Envelope")) {
      return "soap";
    }
    return "xml";
  }

  return null;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function highlightJson(jsonString) {
  const escaped = escapeHtml(jsonString);
  const jsonRegex =
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;
  return escaped.replace(jsonRegex, (match) => {
    let cls = "token-number";
    if (/^"/.test(match)) {
      cls = /:$/.test(match) ? "token-key" : "token-string";
    } else if (/true|false/.test(match)) {
      cls = "token-boolean";
    } else if (/null/.test(match)) {
      cls = "token-null";
    }
    return `<span class="${cls}">${match}</span>`;
  });
}

function highlightXml(xmlString) {
  const escaped = escapeHtml(xmlString);
  return escaped
    .replace(
      /(&lt;\/?[^\s&]+)([^&]*?)(&gt;)/g,
      (_, startTag, inner, endTag) => {
        const attrHighlight = inner.replace(
          /([a-zA-Z0-9:_-]+)=(&quot;.*?&quot;)/g,
          `<span class="token-attr-name">$1</span>=<span class="token-attr-value">$2</span>`
        );
        return `<span class="token-tag">${startTag}${attrHighlight}${endTag}</span>`;
      }
    )
    .replace(/(&lt;!--.*?--&gt;)/g, `<span class="token-comment">$1</span>`);
}

export default function FormatterStudio({ darkMode }) {
  const [raw, setRaw] = useState("");
  const [output, setOutput] = useState("");
  const [highlighted, setHighlighted] = useState("");
  const [error, setError] = useState("");
  const [detected, setDetected] = useState(null);
  const [mode, setMode] = useState("format"); // "format", "escape", "unescape"
  const inputRef = useRef(null);
  const topRef = useRef(null);

  const panelClass = useMemo(
    () =>
      darkMode
        ? "bg-white/10 text-white border border-white/15 shadow-xl"
        : "bg-white/70 text-gray-900 border border-white/60 shadow-xl",
    [darkMode]
  );

  const inputClass = darkMode
    ? "bg-white/5 text-white placeholder:text-white/40"
    : "bg-white/90 text-gray-900 placeholder:text-gray-500";

  useEffect(() => {
    if (!inputRef.current) return;
    const el = inputRef.current;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [raw]);

  const handleFormat = () => {
    const value = raw.trim();
    if (!value) {
      setOutput("");
      setHighlighted("");
      setError("Enter content to format.");
      setDetected(null);
      return;
    }

    try {
      // Handle String Escape/Unescape modes
      if (mode === "escape") {
        const escaped = escapeString(value);
        setOutput(escaped);
        setHighlighted(escapeHtml(escaped));
        setDetected("escape");
        setError("");
        return;
      }

      if (mode === "unescape") {
        const unescaped = unescapeString(value);
        setOutput(unescaped);
        setHighlighted(escapeHtml(unescaped));
        setDetected("unescape");
        setError("");
        return;
      }

      // Handle Format mode
      const format = detectFormat(value) || "text";
      setDetected(format);

      let formatted = value;
      if (format === "json") formatted = prettifyJson(value);
      else if (format === "xml") formatted = prettifyXml(value);
      else if (format === "soap") formatted = prettifySoap(value);

      setOutput(formatted);

      if (format === "json") setHighlighted(highlightJson(formatted));
      else if (format === "xml" || format === "soap")
        setHighlighted(highlightXml(formatted));
      else setHighlighted(escapeHtml(formatted));

      setError("");
    } catch (err) {
      setOutput("");
      setHighlighted("");
      setError(err?.message || "Unable to process content.");
      setDetected(null);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      alert("Formatted content copied to clipboard.");
    } catch (err) {
      console.error("Clipboard error", err);
      alert("Couldn't copy. Select the text manually.");
    }
  };

  return (
    <div
      ref={topRef}
      className={`p-6 rounded-2xl backdrop-blur-xl transition-colors duration-300 ${panelClass}`}
    >
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <h3 className="font-semibold tracking-wide uppercase text-xs opacity-80">
          Formatter Studio
        </h3>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            detected
              ? darkMode
                ? "bg-emerald-500/20 text-emerald-200"
                : "bg-emerald-100 text-emerald-700"
              : darkMode
              ? "bg-white/10 text-white/70"
              : "bg-white text-slate-500 border border-slate-200"
          }`}
        >
          {detected ? `Mode: ${detected.toUpperCase()}` : "Ready"}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className={`px-4 py-2 rounded-xl text-sm transition-colors ${
            darkMode
              ? "bg-white/10 text-white border border-white/20 hover:bg-white/15"
              : "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          <option value="format">Format JSON/XML/SOAP</option>
          <option value="escape">Escape String</option>
          <option value="unescape">Unescape String</option>
        </select>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              handleFormat();
              topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span className="text-xl">✨</span>
            <span>{mode === "format" ? "Format" : mode === "escape" ? "Escape" : "Unescape"}</span>
          </button>
          <button
            onClick={handleCopy}
            disabled={!output}
            className={`px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
              output
                ? "bg-blue-500 text-white hover:bg-blue-400 shadow-lg"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            📋 Copy
          </button>
          <button
            onClick={() => {
              setRaw("");
              setOutput("");
              setError("");
              setDetected(null);
              setHighlighted("");
            }}
            className={`px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg ${
              darkMode
                ? "bg-white/20 text-white hover:bg-white/30"
                : "bg-gray-600 text-white hover:bg-gray-700"
            }`}
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start">
        <textarea
          ref={inputRef}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={
            mode === "format"
              ? "Paste your JSON, XML, or SOAP envelope here…"
              : mode === "escape"
              ? "Paste your string to escape special characters (quotes, newlines, etc.)…"
              : "Paste your escaped string to unescape back to normal text…"
          }
          className={`flex-1 w-full resize-none rounded-xl p-4 shadow-inner text-sm leading-relaxed ${inputClass}`}
          style={{ minHeight: "220px" }}
        />
        <div
          className={`flex-1 w-full rounded-xl p-4 shadow-inner text-sm leading-relaxed ${
            darkMode ? "bg-slate-950/60 text-white" : "bg-slate-900/5 text-slate-900"
          }`}
          style={{ minHeight: "220px" }}
        >
          {output ? (
            <pre
              className={`whitespace-pre-wrap formatter-output ${
                detected ? `format-${detected}` : ""
              }`}
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          ) : (
            <div className="text-xs opacity-60">
              Formatted output will appear here.
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
    </div>
  );
}
