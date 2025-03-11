import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import timezoneData from "./timezones";
import { MapPinIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function TimeComparison({ darkMode }) {
  const [primaryZone, setPrimaryZone] = useState(
    localStorage.getItem("primaryZone") || ""
  );
  const [selectedZones, setSelectedZones] = useState(
    JSON.parse(localStorage.getItem("selectedZones")) || []
  );
  const [currentTime, setCurrentTime] = useState({});
  const [selectedTime, setSelectedTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTimezones, setFilteredTimezones] = useState([]);

  useEffect(() => {
    localStorage.setItem("primaryZone", primaryZone);
    localStorage.setItem("selectedZones", JSON.stringify(selectedZones));
  }, [primaryZone, selectedZones]);

  useEffect(() => {
    const updateTimes = () => {
      const newTimes = {};
      selectedZones.forEach((tz) => {
        newTimes[tz] = DateTime.now().setZone(tz).toFormat("hh:mm a");
      });
      setCurrentTime(newTimes);
    };
    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [selectedZones]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = timezoneData.filter(
        (tz) =>
          tz.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tz.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTimezones(filtered);
    } else {
      setFilteredTimezones([]);
    }
  }, [searchQuery]);

  const convertTime = (zone) => {
    if (!selectedTime || !primaryZone) return "-";
    const inputTime = DateTime.fromFormat(selectedTime, "HH:mm", {
      zone: primaryZone,
    });
    return inputTime.setZone(zone).toFormat("hh:mm a");
  };

  const sortedTimezones = primaryZone
    ? [primaryZone, ...selectedZones.filter((tz) => tz !== primaryZone)]
    : selectedZones;

  const formatTimeWithAMPM = (time) => {
    if (!time || time === "-") return { time: "-", ampm: "" };
    const [timePart, ampm] = time.split(" ");
    return { time: timePart, ampm };
  };

  return (
    <div className="w-full md:w-3/5">
      <div className={`p-3 rounded-lg shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <label className="block mb-2 font-semibold">Add a Timezone:</label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by city or country..."
          className={`w-full p-3 rounded-lg shadow-sm ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
        />
        {searchQuery && (
          <div className={`mt-2 max-h-48 overflow-y-auto rounded-lg shadow-sm ${
            darkMode ? "bg-gray-700" : "bg-gray-100"
          }`}>
            {filteredTimezones.map((tz) => (
              <div
                key={tz.value}
                className={`p-2 cursor-pointer ${
                  darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                } transition`}
                onClick={() => {
                  if (!selectedZones.includes(tz.value)) {
                    setSelectedZones([...selectedZones, tz.value]);
                  }
                  setSearchQuery("");
                }}
              >
                {tz.city}, {tz.country} ({tz.gmt})
              </div>
            ))}
          </div>
        )}
        <label className="block mt-4 font-semibold">Enter Time in Primary Timezone:</label>
        <input
          type="time"
          onChange={(e) => setSelectedTime(e.target.value)}
          className={`w-full p-3 rounded-lg shadow-sm ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
        />
        <div className="overflow-x-auto w-full mt-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className={`${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                <th className="p-2 text-left md:w-1/2 w-[40%]">City</th>
                <th className="p-2 text-left md:w-1/4 w-[30%]">Current</th>
                <th className="p-2 text-left md:w-1/4 w-[30%]">Converted</th>
              </tr>
            </thead>
            <tbody>
              {sortedTimezones.map((tz) => {
                const timezone = timezoneData.find((zone) => zone.value === tz);
                const currentTimeFormatted = formatTimeWithAMPM(currentTime[tz]);
                const convertedTimeFormatted = formatTimeWithAMPM(convertTime(tz));

                return (
                  <tr key={tz} className={`border-b ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition`}>
                    <td className="p-2 flex items-center gap-2 md:w-1/2 w-[40%]">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => setPrimaryZone(tz)}
                          className={`p-1 ${
                            tz === primaryZone
                              ? "text-green-500 hover:text-green-600"
                              : "text-blue-500 hover:text-blue-600"
                          } transition-transform transform hover:scale-110`}
                          title={tz === primaryZone ? "Primary Timezone" : "Set as Primary Timezone"}
                        >
                          <MapPinIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setSelectedZones(selectedZones.filter((zone) => zone !== tz))}
                          className="p-1 text-red-500 hover:text-red-600 transition-transform transform hover:scale-110"
                          title="Remove Timezone"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                      <div>
                        <p className="font-bold">{timezone?.city}</p>
                        <p className="text-sm text-gray-500">{timezone?.country}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-900"
                          }`}
                        >
                          {timezone?.gmt}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 md:w-1/4 w-[30%]">
                      <div className="flex flex-col">
                        <span>{currentTimeFormatted.time}</span>
                        <span className="text-lg">{currentTimeFormatted.ampm}</span>
                      </div>
                    </td>
                    <td className="p-2 md:w-1/4 w-[30%]">
                      <div className="flex flex-col">
                        <span>{convertedTimeFormatted.time}</span>
                        <span className="text-lg">{convertedTimeFormatted.ampm}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}