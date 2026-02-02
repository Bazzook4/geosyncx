// /src/InAppGuide.jsx
import { useState } from "react";
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
        "Fill in meeting details (title, duration, location)",
        "Click 'Add to Google Calendar' to create the event",
      ],
      blogLink: "/blog/schedule-meeting-across-timezones",
      blogTitle: "Full Guide: Meeting Scheduling",
    },
    {
      title: "Find Best Meeting Time",
      tips: [
        "Add all participant timezones first",
        "Use the Best Meeting Time finder below the timezone table",
        "It shows overlap windows during business hours for all zones",
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
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 ${
          darkMode
            ? "bg-sky-500 text-white hover:bg-sky-400"
            : "bg-sky-500 text-white hover:bg-sky-400"
        }`}
        title="Quick Guide"
      >
        <QuestionMarkCircleIcon className="w-6 h-6" />
      </button>

      {/* Slide-out Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
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
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BookOpenIcon className="w-6 h-6 text-sky-500" />
                  Quick Guide
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm opacity-70 mt-1">
                Tips for the {activeTab === "timezones" ? "Timezones" : "Formatter"} tab
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
                        <span className="opacity-90">{tip}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={section.blogLink}
                    className="inline-flex items-center gap-2 text-sm text-sky-500 hover:text-sky-400 font-medium transition"
                    onClick={() => setIsOpen(false)}
                  >
                    <BookOpenIcon className="w-4 h-4" />
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
