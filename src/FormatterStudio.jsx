// /src/FormatterStudio.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

function prettifyJson(input) {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed, null, 2);
}

function prettifyXml(input) {
  // Remove existing whitespace between tags
  let xml = input.replace(/>\s+</g, "><").trim();

  // Split into tokens (tags and text content)
  const tokens = [];
  let current = "";
  let inTag = false;

  for (let i = 0; i < xml.length; i++) {
    const char = xml[i];
    if (char === "<") {
      if (current.trim()) {
        tokens.push({ type: "text", value: current.trim() });
      }
      current = "<";
      inTag = true;
    } else if (char === ">" && inTag) {
      current += ">";
      tokens.push({ type: "tag", value: current });
      current = "";
      inTag = false;
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    tokens.push({ type: "text", value: current.trim() });
  }

  // Format tag with attributes on separate lines if too many attributes
  function formatTag(tag, indentLevel) {
    const baseIndent = "  ".repeat(indentLevel);
    const attrIndent = "  ".repeat(indentLevel + 1);

    const selfClosing = tag.endsWith("/>");
    const tagEnd = selfClosing ? "/>" : ">";
    const tagContent = tag.slice(1, selfClosing ? -2 : -1).trim();

    const firstSpace = tagContent.indexOf(" ");
    if (firstSpace === -1) {
      return baseIndent + tag;
    }

    const tagName = tagContent.slice(0, firstSpace);
    const attrString = tagContent.slice(firstSpace + 1).trim();

    const attrs = [];
    let attrCurrent = "";
    let inQuote = false;
    let quoteChar = "";

    for (let i = 0; i < attrString.length; i++) {
      const char = attrString[i];
      if ((char === '"' || char === "'") && !inQuote) {
        inQuote = true;
        quoteChar = char;
        attrCurrent += char;
      } else if (char === quoteChar && inQuote) {
        inQuote = false;
        attrCurrent += char;
      } else if (char === " " && !inQuote && attrCurrent.trim()) {
        attrs.push(attrCurrent.trim());
        attrCurrent = "";
      } else {
        attrCurrent += char;
      }
    }
    if (attrCurrent.trim()) {
      attrs.push(attrCurrent.trim());
    }

    if (attrs.length <= 3) {
      return baseIndent + tag;
    }

    const lines = [`${baseIndent}<${tagName}`];
    attrs.forEach((attr, i) => {
      const isLast = i === attrs.length - 1;
      lines.push(`${attrIndent}${attr}${isLast ? tagEnd : ""}`);
    });

    return lines.join("\n");
  }

  let indent = 0;
  const lines = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === "text") {
      lines.push("  ".repeat(indent) + token.value);
      continue;
    }

    const tag = token.value;

    if (tag.startsWith("</")) {
      indent = Math.max(0, indent - 1);
      lines.push("  ".repeat(indent) + tag);
    } else if (tag.endsWith("/>") || tag.startsWith("<?") || tag.startsWith("<!")) {
      lines.push(formatTag(tag, indent));
    } else {
      lines.push(formatTag(tag, indent));
      indent += 1;
    }
  }

  return lines.join("\n");
}

function prettifySoap(input) {
  return prettifyXml(input);
}

function escapeString(input) {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\b/g, '\\b')
    .replace(/\f/g, '\\f');
}

function unescapeString(input) {
  return input
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

// Strip common log prefixes like [2026-03-09 09:40:46] or 2026-03-09T09:40:46 before the payload
function stripLogPrefix(input) {
  return input.replace(/^\[?[\d\-T: .]+\]?\s*/, "").trim();
}

function detectFormat(input) {
  const trimmed = stripLogPrefix(input.trim());
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

// Determine which lines are foldable (opening tags) and their matching close line
function buildFoldMap(lines, format) {
  if (format !== "xml" && format !== "soap" && format !== "json") return {};

  const foldMap = {}; // lineIndex -> { end: lineIndex, depth }
  const stack = []; // stack of { lineIndex, tag }

  if (format === "json") {
    // For JSON, fold on lines ending with { or [
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trimEnd();
      if (trimmed.endsWith("{") || trimmed.endsWith("[")) {
        stack.push({ lineIndex: i });
      } else if (trimmed === "}" || trimmed === "}," || trimmed === "]" || trimmed === "],") {
        const opener = stack.pop();
        if (opener && opener.lineIndex !== i) {
          foldMap[opener.lineIndex] = i;
        }
      }
    }
  } else {
    // XML/SOAP: fold on opening tags
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Opening tag (not self-closing, not closing, not processing instruction)
      if (
        line.startsWith("<") &&
        !line.startsWith("</") &&
        !line.startsWith("<?") &&
        !line.startsWith("<!") &&
        !line.endsWith("/>")
      ) {
        const tagMatch = line.match(/^<([^\s>/]+)/);
        if (tagMatch) {
          stack.push({ lineIndex: i, tag: tagMatch[1] });
        }
      } else if (line.startsWith("</")) {
        const tagMatch = line.match(/^<\/([^\s>]+)/);
        if (tagMatch) {
          // Find matching opener
          for (let s = stack.length - 1; s >= 0; s--) {
            if (stack[s].tag === tagMatch[1]) {
              const opener = stack.splice(s, 1)[0];
              if (opener.lineIndex !== i) {
                foldMap[opener.lineIndex] = i;
              }
              break;
            }
          }
        }
      }
    }
  }

  return foldMap;
}

// CodeViewer: line numbers + folding
function CodeViewer({ highlighted, output, format, darkMode }) {
  const [collapsed, setCollapsed] = useState({});

  const lines = useMemo(() => output.split("\n"), [output]);
  const highlightedLines = useMemo(() => highlighted.split("\n"), [highlighted]);
  const foldMap = useMemo(() => buildFoldMap(lines, format), [lines, format]);

  // Reset collapsed state when output changes
  useEffect(() => { setCollapsed({}); }, [output]);

  const toggleFold = useCallback((lineIdx) => {
    setCollapsed(prev => ({ ...prev, [lineIdx]: !prev[lineIdx] }));
  }, []);

  // Build set of hidden lines
  const hiddenLines = useMemo(() => {
    const hidden = new Set();
    Object.entries(collapsed).forEach(([startStr, isCollapsed]) => {
      if (!isCollapsed) return;
      const start = Number(startStr);
      const end = foldMap[start];
      if (end == null) return;
      for (let i = start + 1; i <= end; i++) hidden.add(i);
    });
    return hidden;
  }, [collapsed, foldMap]);

  const lineNumWidth = String(lines.length).length;

  const gutterBg = darkMode ? "#0f172a" : "#f1f5f9";
  const gutterColor = darkMode ? "rgba(255,255,255,0.3)" : "#94a3b8";
  const codeBg = darkMode ? "rgba(2,6,23,0.6)" : "rgba(15,23,42,0.04)";

  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        fontSize: "0.8rem",
        lineHeight: "1.6",
        borderRadius: "12px",
        overflow: "hidden",
        minHeight: "220px",
        maxHeight: "600px",
        overflowY: "auto",
        display: "flex",
        background: codeBg,
      }}
    >
      {/* Gutter: line numbers + fold arrows */}
      <div
        style={{
          background: gutterBg,
          color: gutterColor,
          userSelect: "none",
          flexShrink: 0,
          paddingTop: "16px",
          paddingBottom: "16px",
        }}
      >
        {lines.map((_, i) => {
          if (hiddenLines.has(i)) return null;
          const isFoldable = foldMap[i] != null;
          const isCollapsed = collapsed[i];
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                paddingLeft: "12px",
                paddingRight: "8px",
                height: "1.6em",
                gap: "4px",
                cursor: isFoldable ? "pointer" : "default",
              }}
              onClick={isFoldable ? () => toggleFold(i) : undefined}
            >
              <span style={{ minWidth: `${lineNumWidth}ch`, textAlign: "right", fontSize: "0.75rem" }}>
                {i + 1}
              </span>
              <span style={{ width: "14px", textAlign: "center", fontSize: "0.65rem", color: darkMode ? "#38bdf8" : "#0284c7" }}>
                {isFoldable ? (isCollapsed ? "▶" : "▼") : ""}
              </span>
            </div>
          );
        })}
      </div>

      {/* Code content */}
      <div style={{ flex: 1, overflowX: "auto", padding: "16px 16px 16px 12px" }}>
        <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {lines.map((line, i) => {
            if (hiddenLines.has(i)) return null;
            const isCollapsed = collapsed[i];
            const endLine = foldMap[i];
            return (
              <div key={i} style={{ display: "block", minHeight: "1.6em" }}>
                <span dangerouslySetInnerHTML={{ __html: highlightedLines[i] ?? escapeHtml(line) }} />
                {isCollapsed && endLine != null && (
                  <span
                    onClick={() => toggleFold(i)}
                    style={{
                      cursor: "pointer",
                      marginLeft: "6px",
                      padding: "0 6px",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      background: darkMode ? "rgba(56,189,248,0.15)" : "rgba(2,132,199,0.1)",
                      color: darkMode ? "#38bdf8" : "#0284c7",
                      border: `1px solid ${darkMode ? "rgba(56,189,248,0.3)" : "rgba(2,132,199,0.2)"}`,
                    }}
                  >
                    ··· {endLine - i} lines
                  </span>
                )}
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}

export default function FormatterStudio({ darkMode }) {
  const [raw, setRaw] = useState("");
  const [output, setOutput] = useState("");
  const [highlighted, setHighlighted] = useState("");
  const [error, setError] = useState("");
  const [detected, setDetected] = useState(null);
  const [mode, setMode] = useState("format"); // "format", "escape", "unescape"
  const inputRef = useRef(null);

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
    const maxHeight = 600;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
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

      const stripped = stripLogPrefix(value);
      const format = detectFormat(value) || "text";
      setDetected(format);

      let formatted = stripped;
      if (format === "json") formatted = prettifyJson(stripped);
      else if (format === "xml") formatted = prettifyXml(stripped);
      else if (format === "soap") formatted = prettifySoap(stripped);

      setOutput(formatted);

      if (format === "json") setHighlighted(highlightJson(formatted));
      else if (format === "xml" || format === "soap") setHighlighted(highlightXml(formatted));
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
              ? "bg-slate-800 text-white border border-white/20 hover:bg-slate-700"
              : "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          <option value="format">Format JSON/XML/SOAP</option>
          <option value="escape">Add Escape Characters</option>
          <option value="unescape">Remove Escape Characters</option>
        </select>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleFormat}
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
        {/* Input: 30% width */}
        <div className="lg:w-[30%] flex flex-col">
          <label className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? "text-white/70" : "text-gray-600"}`}>
            Input
          </label>
          <textarea
            ref={inputRef}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={
              mode === "format"
                ? "Paste your JSON, XML, or SOAP here…"
                : mode === "escape"
                ? "Paste text to add escape characters…"
                : "Paste escaped text to convert back…"
            }
            className={`w-full resize-none rounded-xl p-4 shadow-inner text-sm leading-relaxed ${inputClass}`}
            style={{ minHeight: "220px" }}
          />
        </div>

        {/* Result: 70% width */}
        <div className="lg:w-[70%] flex flex-col">
          <label className={`text-xs font-semibold uppercase tracking-wide mb-2 ${darkMode ? "text-white/70" : "text-gray-600"}`}>
            Result
          </label>
          {output ? (
            <CodeViewer
              highlighted={highlighted}
              output={output}
              format={detected}
              darkMode={darkMode}
            />
          ) : (
            <div
              className={`w-full rounded-xl p-4 shadow-inner text-sm ${
                darkMode ? "bg-slate-950/60 text-white" : "bg-slate-900/5 text-slate-900"
              }`}
              style={{ minHeight: "220px" }}
            >
              <div className="text-xs opacity-60">Formatted output will appear here.</div>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
    </div>
  );
}
