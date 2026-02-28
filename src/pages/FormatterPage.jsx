// /src/pages/FormatterPage.jsx
import SEO from "../SEO";
import FormatterStudio from "../FormatterStudio";
import { Link } from "react-router-dom";

export default function FormatterPage({ darkMode }) {
  const cardClass = darkMode
    ? "bg-white/5 border border-white/10 backdrop-blur-xl"
    : "bg-white/80 border border-white/60 backdrop-blur-xl";

  const headingClass = darkMode ? "text-white" : "text-slate-900";
  const textClass = darkMode ? "text-white/70" : "text-slate-600";

  return (
    <>
      <SEO
        title="JSON, XML & SOAP Formatter | Format & Escape Strings - GeoSyncX"
        description="Format and beautify JSON, XML, and SOAP documents. Escape and unescape strings with special characters."
        keywords="json formatter, xml formatter, soap formatter, escape string, unescape string, beautify json"
        url="https://www.geosyncx.com/tools/formatter"
      />

      <div className="w-full max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className={`text-3xl md:text-4xl font-bold ${headingClass}`}>
            Formatter Studio
          </h1>
          <p className={`text-lg ${textClass}`}>
            Format JSON, XML, SOAP or escape/unescape strings
          </p>
        </div>

        {/* Quick Steps */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold">1</div>
              <div>
                <p className={`font-medium ${headingClass}`}>Paste Code</p>
                <p className={`text-sm ${textClass}`}>JSON, XML, or SOAP</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold">2</div>
              <div>
                <p className={`font-medium ${headingClass}`}>Click Format</p>
                <p className={`text-sm ${textClass}`}>Auto-detected format</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold">3</div>
              <div>
                <p className={`font-medium ${headingClass}`}>Copy Result</p>
                <p className={`text-sm ${textClass}`}>Beautifully formatted</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Tool */}
        <FormatterStudio darkMode={darkMode} />

        {/* Related Tools */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <h2 className={`text-xl font-semibold mb-4 ${headingClass}`}>
            Related Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/tools/phone-code-lookup"
              className={`p-4 rounded-xl transition-all hover:scale-[1.02] ${darkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}
            >
              <h3 className="font-semibold text-sky-500">Phone Code Lookup</h3>
              <p className={`text-sm mt-1 ${textClass}`}>
                Identify country from phone number
              </p>
            </Link>
            <Link
              to="/tools/timezone-compare"
              className={`p-4 rounded-xl transition-all hover:scale-[1.02] ${darkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}
            >
              <h3 className="font-semibold text-sky-500">Timezone Compare</h3>
              <p className={`text-sm mt-1 ${textClass}`}>
                Compare multiple timezones side by side
              </p>
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className={`rounded-2xl p-6 ${cardClass}`}>
          <h2 className={`text-xl font-semibold mb-6 ${headingClass}`}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <summary className={`font-medium cursor-pointer ${headingClass}`}>
                What formats are supported?
              </summary>
              <p className={`mt-3 text-sm ${textClass}`}>
                We support JSON, XML, and SOAP documents. The format is automatically detected when you paste your content.
              </p>
            </details>
            <details className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <summary className={`font-medium cursor-pointer ${headingClass}`}>
                What does escape/unescape do?
              </summary>
              <p className={`mt-3 text-sm ${textClass}`}>
                Escape converts special characters like newlines and quotes to their escaped forms (\n, \"). Unescape does the reverse, converting escaped sequences back to actual characters.
              </p>
            </details>
            <details className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <summary className={`font-medium cursor-pointer ${headingClass}`}>
                Is my data secure?
              </summary>
              <p className={`mt-3 text-sm ${textClass}`}>
                Yes! All formatting happens locally in your browser. Your data never leaves your device or gets sent to any server.
              </p>
            </details>
            <details className={`p-4 rounded-xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}>
              <summary className={`font-medium cursor-pointer ${headingClass}`}>
                Why won't my JSON format?
              </summary>
              <p className={`mt-3 text-sm ${textClass}`}>
                If formatting fails, your JSON likely has a syntax error. Check for missing commas, unquoted keys, or trailing commas. The error message will indicate where the problem is.
              </p>
            </details>
          </div>
        </div>
      </div>
    </>
  );
}
