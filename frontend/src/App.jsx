import React, { useEffect, useState } from "react";
import "./App.css";
import { requestTemperature } from "./api/request.js";

const cities = [
  { name: "Belgrade", value: "BELGRADE" },
  { name: "Moscow", value: "MOSCOW" },
  { name: "New York", value: "NEW_YORK" },
];

// days in select
let days = [];
// calculate days in select
for (let i = 0; i < 10; i++) {
  let date = new Date();
  date.setDate(date.getDate() + i);
  days.push(date.toISOString().split("T")[0]);
}

// calculate available hours - fit to external api requirements
function calculateTime(day) {
  let hours = [];
  let currentHour = new Date().getHours();

  let start = day === new Date().toISOString().split("T")[0] ? currentHour : 0;

  let end = 23;

  let dateEnd = new Date();
  dateEnd.setDate(dateEnd.getDate() + 9);
  dateEnd.setHours(0);

  let dayDate = new Date(day);
  dayDate.setHours(currentHour);

  if (dayDate >= dateEnd) {
    end = currentHour <= 12 ? 12 : currentHour <= 18 ? 18 : 23;
  }

  for (let i = start; i <= end; i++) {
    let time = i.toString();
    hours.push(time.padStart(2, "0") + ":00");
  }

  return hours;
}

export default function App() {
  const [timeOptions, setTimeOptions] = useState([]);
  const [city, setCity] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [submitAvailable, setSubmitAvailable] = useState(false);
  const [temperature, setTemperature] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTimeOptions(calculateTime(day));
  }, [day]);

  useEffect(() => {
    setSubmitAvailable(city !== "" && day !== "" && time !== "");
  }, [city, day, time]);

  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  const handleDayChange = (e) => {
    setDay(e.target.value);
    setTime("");
  };

  const handleTimeChange = (e) => {
    setTime(e.target.value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setTemperature(null);
    setError(null);

    try {
      const response = await requestTemperature({ city, day, time });

      if (response.result && response.result.temperature) {
        setTemperature(response.result.temperature);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="app-container">
        <div className="select-container">
          <select value={city} onChange={handleCityChange}>
            <option value="">Select City</option>
            {cities.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.name}
              </option>
            ))}
          </select>

          <select value={day} onChange={handleDayChange}>
            <option value="">Select Day</option>
            {days.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <select value={time} onChange={handleTimeChange}>
            <option value="">Select Time</option>
            {timeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <button disabled={!submitAvailable || loading} onClick={handleSubmit}>
            Check temperature
          </button>
        </div>
        {temperature !== null && (
          <div className="output-container">
            Temperature will be {temperature} °C
          </div>
        )}
        {loading && <div className="loader" />}
        {error && <div className="error">Something went wrong...</div>}
      </div>
    </div>
  );
}
