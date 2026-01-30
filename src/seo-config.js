// SEO configuration for all pages
export const BLOG_SEO_DATA = {
  "timezone-comparison-tool": {
    title: "How to Compare Time Zones Easily: Free Online Timezone Converter",
    description: "Stop calculating time zone differences manually. Discover how to instantly compare multiple time zones with live updates and weather information. Free timezone converter tool.",
    keywords: "timezone comparison tool, multiple timezone converter, world clock, compare time zones online free, timezone calculator, international time zone comparison, live timezone converter, real-time world clock",
    author: "GeoSyncX Team",
    datePublished: "2025-11-04",
    dateModified: "2025-11-04",
    category: "Timezone Tools",
    readTime: "8 min read",
    image: "https://www.geosyncx.com/android-chrome-512x512.png",
  },
  "phone-code-timezone-search": {
    title: "Find Timezone by Phone Country Code: Instant Lookup Tool",
    description: "Got a phone number starting with +91, +44, or +1? Instantly find the timezone and schedule calls at the right time. Free phone code timezone search.",
    keywords: "phone code timezone, country code lookup, timezone by phone number, international calling times, phone country code search, find timezone by country code",
    author: "GeoSyncX Team",
    datePublished: "2025-11-04",
    dateModified: "2025-11-04",
    category: "Timezone Tools",
    readTime: "7 min read",
    image: "https://www.geosyncx.com/android-chrome-512x512.png",
  },
  "set-primary-timezone": {
    title: "How to Set Your Primary Timezone: Essential Guide for Remote Workers",
    description: "Master timezone management by setting your home timezone as the reference point for all time conversions. Essential guide for remote teams and freelancers.",
    keywords: "set primary timezone, timezone management, remote work tools, timezone reference point, home timezone settings, timezone converter settings",
    author: "GeoSyncX Team",
    datePublished: "2025-11-04",
    dateModified: "2025-11-04",
    category: "Getting Started",
    readTime: "6 min read",
    image: "https://www.geosyncx.com/android-chrome-512x512.png",
  },
  "schedule-meeting-across-timezones": {
    title: "How to Schedule Meetings Across Timezones: Google Calendar Integration",
    description: "Stop manually creating calendar invites with timezone notes. Automatically schedule meetings that show correct local time for every attendee using Google Calendar integration.",
    keywords: "schedule meetings across timezones, Google Calendar timezone, meeting scheduler, international meeting planner, timezone meeting tool, global team meetings",
    author: "GeoSyncX Team",
    datePublished: "2025-11-04",
    dateModified: "2025-11-04",
    category: "Meeting Tools",
    readTime: "9 min read",
    image: "https://www.geosyncx.com/android-chrome-512x512.png",
  },
  "best-meeting-time-finder": {
    title: "Best Meeting Time Finder: Find Perfect Overlap Across Multiple Timezones",
    description: "Stop manually checking if 3 PM works for everyone. Automatically discover meeting times where all participants are within their working hours across timezones.",
    keywords: "best meeting time finder, timezone overlap, meeting time calculator, find best meeting time, global team meeting times, timezone meeting finder",
    author: "GeoSyncX Team",
    datePublished: "2025-11-04",
    dateModified: "2025-11-04",
    category: "Meeting Tools",
    readTime: "10 min read",
    image: "https://www.geosyncx.com/android-chrome-512x512.png",
  },
  "smart-todo-list": {
    title: "Smart To-Do List: Simple Task Management with One-Click Sharing",
    description: "Track your tasks, check them off, and share as formatted bullets - all without leaving your productivity hub. Free smart todo list app.",
    keywords: "smart todo list, task management, productivity app, to-do list online, task tracker, simple todo app, shareable task list",
    author: "GeoSyncX Team",
    datePublished: "2025-11-04",
    dateModified: "2025-11-04",
    category: "Productivity",
    readTime: "7 min read",
    image: "https://www.geosyncx.com/android-chrome-512x512.png",
  },
  "json-xml-soap-formatter": {
    title: "Free JSON, XML & SOAP Formatter with Syntax Highlighting",
    description: "Instantly beautify minified JSON, XML, and SOAP data. Format, highlight, and copy with one click - no installation required. Free online formatter tool.",
    keywords: "JSON formatter, XML formatter, SOAP formatter, beautify JSON, format XML online, syntax highlighting, code formatter, online JSON beautifier",
    author: "GeoSyncX Team",
    datePublished: "2025-11-04",
    dateModified: "2025-11-04",
    category: "Developer Tools",
    readTime: "8 min read",
    image: "https://www.geosyncx.com/android-chrome-512x512.png",
  },
};

export const DEFAULT_SEO = {
  title: "GeoSyncX — World Time Comparison, Meeting Scheduler & Productivity Tools",
  description: "Free online timezone converter, meeting scheduler, and productivity tools. Compare multiple timezones, find best meeting times, manage tasks, and format JSON/XML. Perfect for remote teams.",
  keywords: "timezone converter, world clock, meeting scheduler, time zone comparison, remote team tools, productivity app, JSON formatter, XML formatter, to-do list",
  author: "GeoSyncX Team",
  image: "https://www.geosyncx.com/android-chrome-512x512.png",
  url: "https://www.geosyncx.com/",
  type: "website",
};

export const BLOG_INDEX_SEO = {
  title: "GeoSyncX Blog — Timezone Management & Productivity Tips",
  description: "Learn how to master timezone management, schedule global meetings, and boost your productivity. Free guides and tutorials for remote teams.",
  keywords: "timezone tips, remote work blog, productivity guides, meeting scheduling tips, timezone management, global team collaboration",
  author: "GeoSyncX Team",
  image: "https://www.geosyncx.com/android-chrome-512x512.png",
  url: "https://www.geosyncx.com/blog",
  type: "website",
};

export function getBlogPostSEO(postId) {
  const seoData = BLOG_SEO_DATA[postId];
  if (!seoData) return null;

  return {
    ...seoData,
    url: `https://www.geosyncx.com/blog/${postId}`,
    type: "article",
  };
}
