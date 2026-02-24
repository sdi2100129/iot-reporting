import { useState, useEffect, useMemo } from "react";
import api from "../api";
import {
  ScatterChart,
  Scatter,
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

import { PieChart, Pie, Cell } from "recharts";


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
    const [sensors, setSensors] = useState([]);
    const [error, setError] = useState(null);

    const fetchReadings = async () => {
        try {
        const res = await api.get("/readings/all", {
            params: {
            sensor_type: filters.sensor_type || undefined,
            location: filters.location || undefined
            }
        });
        setReadings(res.data.data || []);
        setError(null);
        } catch (err) {
        setError("Failed to fetch readings");
        }
    };

    const fetchSensors = async () => {
    try {
        const res = await api.get("/sensors");
        setSensors(res.data.data || []);
    } catch (err) {
        console.error("Failed to fetch sensors");
    }
    };

    useEffect(() => {
    fetchSensors();
    }, []);


    // Create Sensor Map (sensorId → location)
    const sensorMap = useMemo(() => {
        const map = {};
        sensors.forEach(s => {
            map[s.sensorId] = s.location;
        });
        return map;
    }, [sensors]);


    // Grouped data: mean per sensor type per location
    const mean = (arr) =>
    arr.length
        ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1))
        : 0;

    // Step 1: Group readings by location
    const groupedData = Object.values(
    readings.reduce((acc, r) => {

        const loc = sensorMap[r.sensorId] || "Unknown";

        if (!acc[loc]) {
        acc[loc] = {
            location: loc,
            Temperature: [],
            Humidity: [],
            Acoustic: []
        };
        }

        acc[loc][r.readingType].push(r.readingValue);

        return acc;
    }, {})
    )
    // Step 2: Convert arrays → means
    .map(loc => ({
        location: loc.location,
        Temperature: mean(loc.Temperature),
        Humidity: mean(loc.Humidity),
        Acoustic: mean(loc.Acoustic)
    }));


    //  Mean temperature per day per location
    const multiLocationData = useMemo(() => {
    const map = {};

    readings
        .filter(r => r.readingType === "Temperature")
        .forEach(r => {
        const date = r.readingDate; // μόνο date
        const location = sensorMap[r.sensorId] || "Unknown";

        if (!map[date]) {
            map[date] = { datetime: date };
        }

        if (!map[date][location]) {
            map[date][location] = [];
        }

        map[date][location].push(r.readingValue);
        });

        return Object.values(map).map(entry => {
        const result = { datetime: entry.datetime };

        Object.keys(entry).forEach(key => {
            if (key !== "datetime") {
            result[key] = mean(entry[key]);   // 👈 εδώ
            }
        });

        return result;
        });
    }, [readings, sensorMap]);


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


    //  Correlation between Temperature and Humidity
    const scatterData = useMemo(() => {
    const temp = readings.filter(r => r.readingType === "Temperature");
    const humidity = readings.filter(r => r.readingType === "Humidity");

    const humidityMap = new Map();

    humidity.forEach(r => {
        const key = `${r.readingDate} ${r.readingTime}`;
        humidityMap.set(key, r.readingValue);
    });

    return temp
        .map(t => {
        const key = `${t.readingDate} ${t.readingTime}`;
        return {
            temperature: t.readingValue,
            humidity: humidityMap.get(key)
        };
        })
        .filter(d => d.humidity !== undefined);
    }, [readings]);
    

    //  Trend direction using last-first as criterion
    const trend = (values) => {
    if (values.length < 2) return "Stable";
    return values[values.length - 1] > values[0] ? "Increasing" : "Decreasing";
    };


    const tempReadings = readings.filter(r => r.readingType === "Temperature");
    //  Value range distribution
    const pieData = [
    {
        name: "Low (-50 to 20)",
        type: "Low",
        value: tempReadings.filter(r => r.readingValue < 20).length
    },
    {
        name: "Normal (20 to 25)",
        type: "Normal",
        value: tempReadings.filter(r => r.readingValue >= 20 && r.readingValue <= 25).length
    },
    {
        name: "High (25 to 100)",
        type: "High",
        value: tempReadings.filter(r => r.readingValue > 25).length
    }
    ];



    const COLORS = {
        Low: "#3b82f6",      // Blue
        Normal: "#facc15",   // Yellow
        High: "#ef4444"      // Red
    };


    return (
    <div className="w-full p-4">
        <h1 className="text-6xl md:text-7xl font-extrabold text-purple-600 mb-8 tracking-wider font-[cursive]">
        Sensor Metrics & Charts
        </h1>

        <br />

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


        {/* Grouped Horizontal Bar Chart */}
        {groupedData.length > 0 && (
        <div className="mb-10 bg-white p-4 rounded shadow-md">
            <h2 className="text-xl font-bold mb-4">
            Mean Sensor Values per Location
            </h2>

            <ResponsiveContainer width="100%" height={350}>
            <BarChart
                data={groupedData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
            >
                <CartesianGrid strokeDasharray="3 3" />

                {/* X = numeric values */}
                <XAxis type="number" />

                {/* Y = locations */}
                <YAxis
                dataKey="location"
                type="category"
                width={120}
                />

                <Tooltip />
                <Legend />

                {/* Grouped bars (different colors) */}
                <Bar dataKey="Temperature" fill="#ef4444" />
                <Bar dataKey="Humidity" fill="#3b82f6" />
                <Bar dataKey="Acoustic" fill="#10b981" />
            </BarChart>
            </ResponsiveContainer>
        </div>
        )}


        {/* Multi-Line Time Series (Temperature per Location) */}
        {multiLocationData.length > 0 && (
        <div className="mb-10 bg-white p-4 rounded shadow-md">
            <h2 className="text-xl font-bold mb-4">
            Temperature Over Time (Per Location)
            </h2>

            <ResponsiveContainer width="100%" height={350}>
            <LineChart data={multiLocationData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                dataKey="datetime"
                tick={{ fontSize: 12 }}
                />

                <YAxis unit="°C" />

                <Tooltip />
                <Legend />

                {[
                ...new Set(
                    readings
                    .filter(r => r.readingType === "Temperature")
                    .map(r => sensorMap[r.sensorId])
                )
                ].map((location, index) => (
                <Line
                    key={location}
                    type="monotone"
                    dataKey={location}
                    stroke={
                    ["#ef4444", "#3b82f6", "#10b981", "#f59e0b"][index % 4]
                    }
                    dot={false}
                />
                ))}
            </LineChart>
            </ResponsiveContainer>
        </div>
        )}


        {scatterData.length > 0 && (
        <div className="mb-10 bg-white p-4 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">
            Temperature vs Humidity
        </h2>
        <ResponsiveContainer width="100%" height={350}>
        <ScatterChart>
            <CartesianGrid />
            <XAxis type="number" dataKey="temperature" name="Temperature" unit="°C" />
            <YAxis type="number" dataKey="humidity" name="Humidity" unit="%" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={scatterData} fill="#82ca9d" />
        </ScatterChart>
        </ResponsiveContainer>
        </div>
        )}


        {/* Trend Direction */}
        {readings.length > 0 && (
        <div className="mb-10 bg-white p-4 rounded shadow-md">
            <h2 className="text-xl font-bold mb-4">Trend Direction</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sensorTypes.map(type => {
                const values = readingsByType[type].map(r => r.value);
                return (
                <div key={type} className="p-4 border rounded text-center">
                    <h3 className="font-semibold">{type}</h3>
                    <p className="text-lg mt-2">
                    {trend(values)}
                    </p>
                </div>
                );
            })}
            </div>
        </div>
        )}


        {/* Temperature Distribution Pie Chart */}
        {tempReadings.length > 0 && (
        <div className="mb-10 bg-white p-4 rounded shadow-md">
            <h2 className="text-xl font-bold mb-2">Temperature Distribution</h2>

            <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
                >
                {pieData.map((entry, index) => (
                    <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.type]}
                    />
                ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
            </ResponsiveContainer>
        </div>
        )}


    </div>
    );
}
