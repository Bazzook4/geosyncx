// /src/InAppGuide.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { QuestionMarkCircleIcon, XMarkIcon, BookOpenIcon } from "@heroicons/react/24/outline";

const GUIDE_SECTIONS = {
  timezones: [
    {
      title: "Compare Time Zones",
      tips: [
        "Search by city, country, or phone code (+91, +44, etc.)",
        "Click the star icon to set your primary timezone",
        "Enter a time to see it converted across all added zones",
      ],
      blogLink: "/blog/timezone-comparison-tool",
      blogTitle: "Full Guide: Timezone Comparison",
    },
    {
      title: "Schedule Meetings",
      tips: [
        "Select a date and time in your primary timezone",
        "Fill in meeting details (title, duration, details)",
        "Click 'Add to Google Calendar' to create the event",
      ],
      blogLink: "/blog/schedule-meeting-across-timezones",
      blogTitle: "Full Guide: Meeting Scheduling",
    },
    {
      title: "Find Best Meeting Time",
      tips: [
        "Add all participant timezones first",
        "Look at the \"Everyone available\" row at the top of the table",
        "Green hours are working hours in every city; amber is early or late; grey is night",
        "Click a green hour to pick it, and use Edit working hours to change each city's window",
      ],
      blogLink: "/blog/best-meeting-time-finder",
      blogTitle: "Full Guide: Best Meeting Time",
    },
  ],
  formatter: [
    {
      title: "Format JSON/XML/SOAP",
      tips: [
        "Paste your minified code in the input area",
        "Select the format type (JSON, XML, or SOAP)",
        "Click 'Format' to beautify the code",
        "Use 'Copy' to copy the formatted result",
      ],
      blogLink: "/blog/json-xml-soap-formatter",
      blogTitle: "Full Guide: Formatter Tools",
    },
  ],
};

export default function InAppGuide({ darkMode, activeTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const closeRef = useRef(null);
  const dialogRef = useRef(null);

  // Escape closes the panel; focus moves in on open and returns to the trigger on close
  useEffect(() => {
    if (!isOpen) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      // Keep Tab inside the open dialog
      const focusable = dialogRef.current.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])");
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const trigger = triggerRef.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [isOpen]);

  const guides = GUIDE_SECTIONS[activeTab] || [];

  const panelBg = darkMode
    ? "bg-slate-900/95 border-white/20"
    : "bg-white/95 border-slate-200";

  const tipBg = darkMode
    ? "bg-white/5 border-white/10"
    : "bg-slate-50 border-slate-200";

  if (guides.length === 0) return null;

  return (
    <>
      {/* Help Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 motion-reduce:transform-none motion-reduce:transition-none bg-sky-600 text-white hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-400"
        aria-label="Open quick guide"
        aria-haspopup="dialog"
        title="Quick Guide"
      >
        <QuestionMarkCircleIcon className="w-6 h-6" aria-hidden="true" />
        <span className="hidden md:inline text-sm font-medium">Help</span>
      </button>

      {/* Slide-out Panel */}
      {isOpen && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-guide-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div
            className={`relative w-full max-w-md h-full overflow-y-auto border-l backdrop-blur-xl ${panelBg}`}
          >
            <div className="sticky top-0 p-4 border-b border-inherit bg-inherit z-10">
              <div className="flex items-center justify-between">
                <h2 id="quick-guide-title" className="text-xl font-bold flex items-center gap-2">
                  <BookOpenIcon className="w-6 h-6 text-sky-500" aria-hidden="true" />
                  Quick Guide
                </h2>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg hover:bg-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  aria-label="Close quick guide"
                >
                  <XMarkIcon className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
              <p className="text-sm mt-1">
                Tips for this page
              </p>
            </div>

            <div className="p-4 space-y-6">
              {guides.map((section, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${tipBg}`}>
                  <h3 className="font-semibold text-lg mb-3">{section.title}</h3>
                  <ul className="space-y-2 mb-4">
                    {section.tips.map((tip, tipIdx) => (
                      <li key={tipIdx} className="flex items-start gap-2 text-sm">
                        <span className="text-sky-500 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={section.blogLink}
                    className="inline-flex items-center gap-2 text-sm text-sky-700 dark:text-sky-300 hover:underline font-medium transition"
                    onClick={() => setIsOpen(false)}
                  >
                    <BookOpenIcon className="w-4 h-4" aria-hidden="true" />
                    {section.blogTitle} →
                  </Link>
                </div>
              ))}

              {/* Additional Resources */}
              <div className={`p-4 rounded-xl border ${tipBg}`}>
                <h3 className="font-semibold text-lg mb-3">More Resources</h3>
                <div className="space-y-2">
                  <Link
                    to="/blog/set-primary-timezone"
                    className="block text-sm text-sky-500 hover:text-sky-400 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    → Setting Your Primary Timezone
                  </Link>
                  <Link
                    to="/blog/phone-code-timezone-search"
                    className="block text-sm text-sky-500 hover:text-sky-400 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    → Finding Timezones by Phone Code
                  </Link>
                  <Link
                    to="/blog"
                    className="block text-sm text-sky-500 hover:text-sky-400 font-medium transition mt-4"
                    onClick={() => setIsOpen(false)}
                  >
                    View All Guides →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
