import { useState } from "react";
import api from "../api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const units = {
  Temperature: "°C",
  Humidity: "%",
  Acoustic: "dB"
};

export default function Charts() {
  const sensorTypes = ["Temperature", "Humidity", "Acoustic"];

  const [filters, setFilters] = useState({
    sensor_type: "",
    location: "",
    date: "",
    time: ""
  });

  const [readings, setReadings] = useState([]);
  const [error, setError] = useState(null);

    const fetchReadings = async () => {
    try {
        let allReadings = [];
        let page = 1;
        let res;
        do {
        res = await api.get("/readings/search", {
            params: {
            sensor_type: filters.sensor_type || undefined,
            location: filters.location || undefined,
            date: filters.date || undefined,
            time: filters.time || undefined,
            page: page
            }
        });
        allReadings = [...allReadings, ...(res.data.data || [])];
        page++;
        } while (page <= res.data.pages);
        setReadings(allReadings);
        setError(null);
    } catch (err) {
        setError("Failed to fetch readings");
    }
    };


  // Compute mean per sensor type
  const meanData = sensorTypes.map(type => {
    const vals = readings.filter(r => r.readingType === type).map(r => r.readingValue);
    const mean = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 0;
    return { type, mean: Number(mean) };
  });

  // Prepare time series per sensor type
  const readingsByType = sensorTypes.reduce((acc, type) => {
    acc[type] = readings
      .filter(r => r.readingType === type)
      .map(r => ({
        datetime: `${r.readingDate} ${r.readingTime}`,
        value: r.readingValue
      }))
      .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    return acc;
  }, {});

  return (
    <div className="w-full p-4">
      <h1 className="text-6xl md:text-7xl font-extrabold text-purple-600 mb-8 tracking-wider font-[cursive]">
        Sensor Metrics & Charts
      </h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select
          value={filters.sensor_type}
          onChange={e => setFilters({ ...filters, sensor_type: e.target.value })}
          className="border h-10 px-2 rounded"
        >
          <option value="">All Types</option>
          <option value="Temperature">Temperature</option>
          <option value="Humidity">Humidity</option>
          <option value="Acoustic">Acoustic</option>
        </select>

        <input
          type="text"
          placeholder="Location"
          value={filters.location}
          onChange={e => setFilters({ ...filters, location: e.target.value })}
          className="border rounded px-3 py-2 flex-1"
        />

        <input
          type="date"
          value={filters.date}
          onChange={e => setFilters({ ...filters, date: e.target.value })}
          className="border h-10 px-2 rounded"
        />

        <input
          type="time"
          value={filters.time}
          onChange={e => setFilters({ ...filters, time: e.target.value })}
          className="border h-10 px-2 rounded"
        />

        <button
          onClick={fetchReadings}
          className="!bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Fetch Readings
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Mean Bar Chart */}
      {readings.length > 0 && (
        <div className="mb-10 bg-white p-4 rounded shadow-md">
          <h2 className="text-xl font-bold mb-2">Mean per Sensor Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={meanData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="mean" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Line Charts per Sensor Type */}
      {sensorTypes.map(type => (
        <div key={type} className="mb-8 bg-white p-4 rounded shadow-md">
          <h2 className="text-xl font-bold mb-2">{type} Readings Over Time</h2>
          {readingsByType[type].length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={readingsByType[type]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="datetime" tick={{ fontSize: 12 }} />
                <YAxis unit={units[type]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#82ca9d" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600">No readings available</p>
          )}
        </div>
      ))}
    </div>
  );
}
