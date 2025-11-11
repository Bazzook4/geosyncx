// /src/Blog.jsx
import { Link } from "react-router-dom";

const BLOG_POSTS = [
  {
    id: "timezone-comparison-tool",
    title: "How to Compare Time Zones Easily: A Free Online Timezone Converter",
    description: "Stop calculating time zone differences manually. Discover how to instantly compare multiple time zones with live updates and weather information.",
    category: "Timezone Tools",
    readTime: "8 min read",
    date: "2025-11-04",
  },
  {
    id: "phone-code-timezone-search",
    title: "Find Timezone by Phone Country Code: Instant Lookup Tool",
    description: "Got a phone number starting with +91, +44, or +1? Instantly find the timezone and schedule calls at the right time.",
    category: "Timezone Tools",
    readTime: "7 min read",
    date: "2025-11-04",
  },
  {
    id: "set-primary-timezone",
    title: "How to Set Your Primary Timezone: Essential Guide for Remote Workers",
    description: "Master timezone management by setting your home timezone as the reference point for all time conversions.",
    category: "Getting Started",
    readTime: "6 min read",
    date: "2025-11-04",
  },
  {
    id: "schedule-meeting-across-timezones",
    title: "How to Schedule Meetings Across Timezones: Google Calendar Integration Guide",
    description: "Stop manually creating calendar invites with timezone notes. Automatically schedule meetings that show correct local time for every attendee.",
    category: "Meeting Tools",
    readTime: "9 min read",
    date: "2025-11-04",
  },
  {
    id: "best-meeting-time-finder",
    title: "Best Meeting Time Finder: Find Perfect Overlap Across Multiple Timezones",
    description: "Stop manually checking if 3 PM works for everyone. Automatically discover meeting times where all participants are within their working hours.",
    category: "Meeting Tools",
    readTime: "10 min read",
    date: "2025-11-04",
  },
  {
    id: "smart-todo-list",
    title: "Smart To-Do List: Simple Task Management with One-Click Sharing",
    description: "Track your tasks, check them off, and share as formatted bullets - all without leaving your productivity hub.",
    category: "Productivity",
    readTime: "7 min read",
    date: "2025-11-04",
  },
  {
    id: "json-xml-soap-formatter",
    title: "Free JSON, XML & SOAP Formatter with Syntax Highlighting",
    description: "Instantly beautify minified JSON, XML, and SOAP data. Format, highlight, and copy with one click - no installation required.",
    category: "Developer Tools",
    readTime: "8 min read",
    date: "2025-11-04",
  },
];

export default function Blog({ darkMode }) {
  const cardBase = darkMode
    ? "bg-white/10 text-white border border-white/15 shadow-xl"
    : "bg-white/70 text-gray-900 border border-white/60 shadow-xl";

  const categoryColors = {
    "Timezone Tools": darkMode ? "bg-blue-500/20 text-blue-200" : "bg-blue-100 text-blue-700",
    "Meeting Tools": darkMode ? "bg-emerald-500/20 text-emerald-200" : "bg-emerald-100 text-emerald-700",
    "Productivity": darkMode ? "bg-purple-500/20 text-purple-200" : "bg-purple-100 text-purple-700",
    "Developer Tools": darkMode ? "bg-orange-500/20 text-orange-200" : "bg-orange-100 text-orange-700",
    "Getting Started": darkMode ? "bg-sky-500/20 text-sky-200" : "bg-sky-100 text-sky-700",
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div
        className={`p-6 md:p-8 rounded-2xl backdrop-blur-xl transition-colors duration-300 ${cardBase}`}
      >
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">GeoSyncX Blog</h1>
          <p className="text-lg opacity-80">
            Learn how to master timezone management, schedule global meetings, and boost your productivity.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className={`p-6 rounded-xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl ${
                darkMode
                  ? "border-white/20 bg-white/5 hover:bg-white/10"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    categoryColors[post.category]
                  }`}
                >
                  {post.category}
                </span>
                <span className="text-xs opacity-70">{post.readTime}</span>
              </div>

              <h2 className="text-xl font-bold mb-2 leading-snug">{post.title}</h2>

              <p className={`text-sm mb-4 ${darkMode ? "text-white/70" : "text-gray-600"}`}>
                {post.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs opacity-60">{post.date}</span>
                <span className="text-sm font-medium text-sky-500 hover:text-sky-400">
                  Read more →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className={`inline-block px-6 py-3 rounded-xl transition-transform active:scale-95 ${
              darkMode
                ? "bg-white/15 text-white hover:bg-white/25"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            ← Back to App
          </Link>
        </div>
      </div>
    </div>
  );
}
