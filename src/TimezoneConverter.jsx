// /src/TimezoneConverter.jsx
import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { DateTime } from "luxon";
import SEO from "./SEO";
import { CONVERTER_ROUTES, getConverterSEO } from "./converter-routes";

export default function TimezoneConverter({ darkMode }) {
  const { route } = useParams();
  const routeData = CONVERTER_ROUTES[route];

  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    return DateTime.now().toISODate();
  });
  const [currentTimes, setCurrentTimes] = useState({ from: "", to: "" });

  const cardBase = darkMode
    ? "bg-white/10 text-white border border-white/15 shadow-xl"
    : "bg-white/70 text-gray-900 border border-white/60 shadow-xl";

  const inputClass = darkMode
    ? "bg-white/5 text-white placeholder:text-white/50 border border-white/10"
    : "bg-white/60 text-gray-900 placeholder:text-gray-500 border border-slate-200";

  // Update current times every second
  useEffect(() => {
    if (!routeData) return;

    const updateTimes = () => {
      setCurrentTimes({
        from: DateTime.now().setZone(routeData.fromZone).toFormat("hh:mm a"),
        to: DateTime.now().setZone(routeData.toZone).toFormat("hh:mm a"),
      });
    };
    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [routeData]);

  // Convert selected time
  const convertedTime = useMemo(() => {
    if (!selectedTime || !selectedDate || !routeData) return null;

    const [H, M] = selectedTime.split(":").map(Number);
    const base = DateTime.fromObject(
      {
        year: Number(selectedDate.slice(0, 4)),
        month: Number(selectedDate.slice(5, 7)),
        day: Number(selectedDate.slice(8, 10)),
        hour: H,
        minute: M,
      },
      { zone: routeData.fromZone }
    );

    if (!base.isValid) return null;

    const converted = base.setZone(routeData.toZone);
    const timeDiff = converted.offset - base.offset;
    const hoursDiff = timeDiff / 60;
    const dayDiff = converted.day - base.day;

    return {
      time: converted.toFormat("hh:mm a"),
      date: converted.toFormat("EEEE, MMMM d, yyyy"),
      dayNote: dayDiff > 0 ? "(next day)" : dayDiff < 0 ? "(previous day)" : "",
      hoursDiff: hoursDiff > 0 ? `+${hoursDiff}` : hoursDiff.toString(),
    };
  }, [selectedTime, selectedDate, routeData]);

  if (!routeData) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className={`p-8 rounded-2xl text-center ${cardBase}`}>
          <h1 className="text-2xl font-bold mb-4">Route Not Found</h1>
          <p className="mb-6 opacity-80">
            The timezone conversion route you're looking for doesn't exist.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-400 transition"
          >
            Go to Main Tool
          </Link>
        </div>
      </div>
    );
  }

  const seoData = getConverterSEO(route);

  return (
    <>
      {seoData && <SEO {...seoData} />}
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Main Converter Card */}
        <div className={`p-6 md:p-8 rounded-2xl backdrop-blur-xl ${cardBase}`}>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {routeData.title}
          </h1>
          <p className="text-lg opacity-80 mb-6">{routeData.subtitle}</p>

          {/* Current Time Display */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <div className="text-sm font-medium opacity-70 mb-1">
                Current time in {routeData.fromCity}
              </div>
              <div className="text-3xl font-bold">{currentTimes.from}</div>
              <div className="text-sm opacity-60">{routeData.fromZone}</div>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <div className="text-sm font-medium opacity-70 mb-1">
                Current time in {routeData.toCity}
              </div>
              <div className="text-3xl font-bold">{currentTimes.to}</div>
              <div className="text-sm opacity-60">{routeData.toZone}</div>
            </div>
          </div>

          {/* Time Difference Banner */}
          <div
            className={`p-4 rounded-xl text-center mb-8 ${
              darkMode ? "bg-sky-500/20 border border-sky-500/30" : "bg-sky-50 border border-sky-200"
            }`}
          >
            <span className="text-lg">
              {routeData.toCity} is{" "}
              <strong className="text-sky-500">{routeData.timeDiff}</strong>{" "}
              {routeData.toCity} time
            </span>
          </div>

          {/* Converter */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Convert a specific time</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`w-full p-3 rounded-xl ${inputClass}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Time in {routeData.fromCity}
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className={`w-full p-3 rounded-xl ${inputClass}`}
                />
              </div>
            </div>

            {convertedTime && (
              <div
                className={`p-6 rounded-xl mt-4 ${
                  darkMode ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-emerald-50 border border-emerald-200"
                }`}
              >
                <div className="text-sm font-medium opacity-70 mb-1">
                  That's {convertedTime.hoursDiff} hours in {routeData.toCity}:
                </div>
                <div className="text-3xl font-bold text-emerald-500">
                  {convertedTime.time} {convertedTime.dayNote}
                </div>
                <div className="text-sm opacity-70 mt-1">{convertedTime.date}</div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-sm opacity-70 mb-4">
              Need to compare more timezones or schedule a meeting?
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-400 transition-transform active:scale-95"
            >
              Open Full Timezone Tool →
            </Link>
          </div>
        </div>

        {/* SEO Content */}
        <div className={`p-6 md:p-8 rounded-2xl backdrop-blur-xl prose prose-lg max-w-none ${cardBase} ${darkMode ? "prose-invert" : ""}`}>
          <h2>About {routeData.fromCity} to {routeData.toCity} Time Conversion</h2>

          <p>{routeData.description}</p>

          <h3>Quick Facts</h3>
          <ul>
            <li><strong>{routeData.fromCity}</strong> is in the {routeData.fromZone} timezone ({routeData.fromGMT})</li>
            <li><strong>{routeData.toCity}</strong> is in the {routeData.toZone} timezone ({routeData.toGMT})</li>
            <li>Time difference: {routeData.timeDiff}</li>
            {routeData.dstNote && <li>{routeData.dstNote}</li>}
          </ul>

          <h3>Common Use Cases</h3>
          <ul>
            {routeData.useCases.map((useCase, idx) => (
              <li key={idx}>{useCase}</li>
            ))}
          </ul>

          <h3>Best Times for Calls</h3>
          <p>{routeData.bestTimes}</p>

          {routeData.tips && (
            <>
              <h3>Pro Tips</h3>
              <ul>
                {routeData.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Related Routes */}
        {routeData.relatedRoutes && routeData.relatedRoutes.length > 0 && (
          <div className={`p-6 rounded-2xl backdrop-blur-xl ${cardBase}`}>
            <h3 className="text-lg font-semibold mb-4">Related Time Conversions</h3>
            <div className="flex flex-wrap gap-2">
              {routeData.relatedRoutes.map((relatedRoute) => (
                <Link
                  key={relatedRoute}
                  to={`/time/${relatedRoute}`}
                  className={`px-4 py-2 rounded-xl text-sm transition ${
                    darkMode
                      ? "bg-white/10 hover:bg-white/20"
                      : "bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  {CONVERTER_ROUTES[relatedRoute]?.shortTitle || relatedRoute}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
