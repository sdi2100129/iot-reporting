import { useState, useEffect, useMemo } from "react";
import api from "../api";
import {
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  PieChart, 
  Pie, 
  Cell,
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


const addDays = (dateStr, days) => {
    // dateStr expected: "YYYY-MM-DD"
    const d = new Date(dateStr + "T00:00:00");
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
};


// simple least-squares line y = a + b*x
const linearForecast = (values) => {
    const n = values.length;
    if (n < 2) return { a: values[0] ?? 0, b: 0 };
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
        const x = i;
        const y = values[i];
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
    }
    const denom = n * sumX2 - sumX * sumX;
    const b = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
    const a = (sumY - b * sumX) / n;
    
    return { a, b };
};


const ACOUSTIC_THRESHOLD_DB = 80;
// Custom dot for acoustic anomalies
const AnomalyDot = ({ cx, cy, payload }) => {
    if (!payload?.isAnomaly) return null; // show no dot for normal points

    return (
        <circle
        cx={cx}
        cy={cy}
        r={5}
        fill="#ef4444"
        stroke="#ffffff"
        strokeWidth={1.5}
        />
    );
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

    // Store forecast arrays by location.
    const [arimaForecasts, setArimaForecasts] = useState({});

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


    const mean = (arr) =>
        arr.length
    ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1))
    : 0;

    
    // Grouped data: mean per sensor type per location
    const groupedData = useMemo(() => {
        // Step 1: Group readings by location
        const map = Object.values(
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
        );

        // Step 2: Convert arrays → means
        return map.map(loc => ({
            location: loc.location,
            Temperature: mean(loc.Temperature) ,
            Humidity: mean(loc.Humidity),
            Acoustic: mean(loc.Acoustic)
        }));

    }, [readings, sensorMap]);


    //  Mean temperature per day per location
    const multiLocationData = useMemo(() => {
        const map = {};

        readings
            .filter(r => r.readingType === "Temperature")
            .forEach(r => {
            const date = r.readingDate; // only date
            const location = sensorMap[r.sensorId] || "Unknown";

            // Create Date Bucket
            if (!map[date]) {
                map[date] = { datetime: date };
            }

            // Create Location Bucket
            if (!map[date][location]) {
                map[date][location] = [];
            }

            map[date][location].push(r.readingValue);
            });

            // Convert Map to Array
            return Object.values(map).map(entry => {
                const result = { datetime: entry.datetime };

                // For each date object: compute mean per location
                Object.keys(entry).forEach(key => {
                    if (key !== "datetime") {
                    result[key] = mean(entry[key]);  
                    }
                });

                return result;
            }).sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    }, [readings, sensorMap]);


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
                humidity: humidityMap.get(key),
                location: sensorMap[t.sensorId] || "Unknown",
                datetime: key
            };
            })
            .filter(d => d.humidity !== undefined);
    }, [readings, sensorMap]);


    const tempReadings = readings.filter(r => r.readingType === "Temperature");
    //  Value range distribution
    const pieData = [
        {
            name: `Low ( -50°C to 20°C )`,
            type: "Low",
            value: tempReadings.filter(r => r.readingValue < 20).length
        },
        {
            name: "Normal ( 20°C to 25°C )",
            type: "Normal",
            value: tempReadings.filter(r => r.readingValue >= 20 && r.readingValue <= 25).length
        },
        {
            name: "High ( 25°C to 100°C )",
            type: "High",
            value: tempReadings.filter(r => r.readingValue > 25).length
        }
    ];
    

    //  Acoustic readings with anomaly flag
    const acousticSeries = useMemo(() => {
        return readings
            .filter(r => r.readingType === "Acoustic")
            .map(r => ({
            datetime: `${r.readingDate} ${r.readingTime}`,
            value: r.readingValue,
            location: sensorMap[r.sensorId] || "Unknown",
            isAnomaly: r.readingValue >= ACOUSTIC_THRESHOLD_DB
            }))
            .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    }, [readings, sensorMap]);


    const COLORS = {
        Low: "#3b82f6",     
        Normal: "#facc15",   
        High: "#ef4444"   
    };

    const LINE_COLORS = ["#DDB771", "#6BBF59", "#08A045", "#0B6E4F", "#073B3A"];

    // Extract unique locations that have Temperature readings (for multi-line chart)
    const tempLocations = useMemo(() => {
        return [
            ...new Set(
            readings
                .filter(r => r.readingType === "Temperature")
                .map(r => sensorMap[r.sensorId] || "Unknown")
            )
        ];
    }, [readings, sensorMap]);


    //  ForecastData based on multiLocationData
    //  For each location, fit a line to the last 7 days and forecast the next 7 days
    const forecastData = useMemo(() => {
        if (!multiLocationData.length || !tempLocations.length) return [];

        const HORIZON_DAYS = 7;     // how far ahead
        const LOOKBACK = 7;         // how many past points to fit

        // Ensure sorted by date (your multiLocationData already is usually, but safe)
        const sorted = [...multiLocationData].sort(
            (a, b) => new Date(a.datetime) - new Date(b.datetime)
        );

        const lastDate = sorted[sorted.length - 1].datetime;

        // For each location, extract its historical series
        const seriesByLoc = {};
        tempLocations.forEach(loc => {
            const vals = sorted
            .map(row => row[loc])
            .filter(v => typeof v === "number" && !Number.isNaN(v));
            seriesByLoc[loc] = vals;
        });

        // Build future rows
        const futureRows = Array.from({ length: HORIZON_DAYS }, (_, i) => {
            return { datetime: addDays(lastDate, i + 1) };
        });

        // Fill future rows with forecast per location
        tempLocations.forEach(loc => {
            const vals = seriesByLoc[loc];
            if (vals.length < 2) return;

            const tail = vals.slice(-LOOKBACK);
            const { a, b } = linearForecast(tail);

            for (let i = 0; i < HORIZON_DAYS; i++) {
            //  make the first forecast point “1 step after the last tail point”
            const x = (tail.length - 1) + (i + 1);
            const y = a + b * x;
            futureRows[i][`${loc} (Linear Forecast)`] = Number(y.toFixed(1));
            }
        });

        return futureRows;
    }, [multiLocationData, tempLocations]);



    // fetch ARIMA for each temperature location and store in a map { location → forecast[] }
    const fetchArimaForecasts = async (locations) => {
        try {
            const results = await Promise.all(
            locations.map(async (location) => {
                const res = await api.get("/forecast/arima", {
                params: {
                    reading_type: "Temperature",
                    location,
                    freq: "1D",
                    steps: 7,
                    p: 1,
                    d: 1,
                    q: 1
                }
                });

                return {
                location,
                forecast: res.data.forecast || []
                };
            })
            );

            const forecastMap = {};
            results.forEach(({ location, forecast }) => {
            forecastMap[location] = forecast;
            });

            setArimaForecasts(forecastMap);
        } catch (err) {
            console.error("Failed to fetch ARIMA forecasts", err);
        }
    };

    // Convert ARIMA API responses into rows that Recharts can draw
    const forecastDataArima = useMemo(() => {
        if (!tempLocations.length) return [];

        const rowsByDate = {};

        tempLocations.forEach((location) => {
            const forecasts = arimaForecasts[location] || [];

            forecasts.forEach((item) => {
            const dateOnly = item.datetime.slice(0, 10);

            if (!rowsByDate[dateOnly]) {
                rowsByDate[dateOnly] = { datetime: dateOnly };
            }

            rowsByDate[dateOnly][`${location} (Arima Forecast)`] = item.forecast;
            rowsByDate[dateOnly][`${location} (Arima Lower)`] = item.lower;
            rowsByDate[dateOnly][`${location} (Arima Upper)`] = item.upper;
            });
        });

        return Object.values(rowsByDate).sort(
            (a, b) => new Date(a.datetime) - new Date(b.datetime)
        );
    }, [arimaForecasts, tempLocations]);



    // Chart 1: Actual + Linear Forecast only
    const multiLocationWithLinear = useMemo(() => {
        const rowsByDate = {};

        [...multiLocationData, ...forecastData].forEach((row) => {
            const key = row.datetime;
            if (!rowsByDate[key]) rowsByDate[key] = { datetime: key };
            Object.assign(rowsByDate[key], row);
        });

        return Object.values(rowsByDate).sort(
            (a, b) => new Date(a.datetime) - new Date(b.datetime)
        );
    }, [multiLocationData, forecastData]);


    // Chart 2: Actual + ARIMA Forecast only
    const multiLocationWithArima = useMemo(() => {
        const rowsByDate = {};

        [...multiLocationData, ...forecastDataArima].forEach((row) => {
            const key = row.datetime;
            if (!rowsByDate[key]) rowsByDate[key] = { datetime: key };
            Object.assign(rowsByDate[key], row);
        });

        return Object.values(rowsByDate).sort(
            (a, b) => new Date(a.datetime) - new Date(b.datetime)
        );
    }, [multiLocationData, forecastDataArima]);
   



    useEffect(() => {
        if (!readings.length || !tempLocations.length) return;
        fetchArimaForecasts(tempLocations);
    }, [readings, tempLocations]);


    const tooltipFormatter = (value, name) => {
        if (value == null) return ["", name];
        const prettyValue = typeof value === "number" ? value.toFixed(1) : value;
        return [`${prettyValue} °C`, name];
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

                    <Tooltip 
                        formatter={(value, name) => {
                            const unit = units[name] || "";
                            return [`${value} ${unit}`, name];
                        }}
                    />
                    <Legend />

                    {/* Grouped bars (different colors) */}
                    <Bar dataKey="Temperature" fill="#ef4444" />
                    <Bar dataKey="Humidity" fill="#3b82f6" />
                    <Bar dataKey="Acoustic" fill="#10b981" />
                </BarChart>
            </ResponsiveContainer>
        </div>
        )}




        {/* Chart 1: Temperature Over Time + Linear Forecast */}
        {multiLocationData.length > 0 && (
            <div className="mb-10 bg-white p-4 rounded shadow-md">
                <h2 className="text-xl font-bold mb-1">Temperature Over Time — Linear Forecast</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Dashed lines show a simple least-squares linear trend projected 7 days ahead.
                </p>

                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={multiLocationWithLinear}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="datetime" tick={{ fontSize: 12 }} />
                        <YAxis unit="°C" />
                        <Tooltip formatter={tooltipFormatter} />
                        <Legend />

                        {/* Actual lines */}
                        {tempLocations.map((location, index) => (
                            <Line
                                key={location}
                                type="monotone"
                                dataKey={location}
                                stroke={LINE_COLORS[index % LINE_COLORS.length]}
                                dot={false}
                                name={location}
                            />
                        ))}

                        {/* Linear Forecast lines (dashed) */}
                        {tempLocations.map((location, index) => (
                            <Line
                                key={`${location}-linear`}
                                type="monotone"
                                dataKey={`${location} (Linear Forecast)`}
                                stroke={LINE_COLORS[index % LINE_COLORS.length]}
                                strokeDasharray="5 5"
                                dot={false}
                                name={`${location} (Linear Forecast)`}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        )}


        {/* Chart 2: Temperature Over Time + ARIMA Forecast */}
        {multiLocationData.length > 0 && (
            <div className="mb-10 bg-white p-4 rounded shadow-md">
                <h2 className="text-xl font-bold mb-1">Temperature Over Time — ARIMA Forecast</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Dashed center line is the ARIMA(1,1,1) point forecast; dotted bands show the 95% confidence interval.
                </p>

                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={multiLocationWithArima}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="datetime" tick={{ fontSize: 12 }} />
                        <YAxis unit="°C" />
                        <Tooltip formatter={tooltipFormatter} />
                        <Legend />

                        {/* Actual lines */}
                        {tempLocations.map((location, index) => (
                            <Line
                                key={location}
                                type="monotone"
                                dataKey={location}
                                stroke={LINE_COLORS[index % LINE_COLORS.length]}
                                dot={false}
                                name={location}
                            />
                        ))}

                        {/* ARIMA center forecast (dashed) */}
                        {tempLocations.map((location, index) => (
                            <Line
                                key={`${location}-arima-forecast`}
                                type="monotone"
                                dataKey={`${location} (Arima Forecast)`}
                                stroke={LINE_COLORS[index % LINE_COLORS.length]}
                                strokeDasharray="6 3"
                                dot={false}
                                name={`${location} (Arima Forecast)`}
                            />
                        ))}

                        {/* ARIMA lower bound (dotted) */}
                        {tempLocations.map((location, index) => (
                            <Line
                                key={`${location}-arima-lower`}
                                type="monotone"
                                dataKey={`${location} (Arima Lower)`}
                                stroke={LINE_COLORS[index % LINE_COLORS.length]}
                                strokeDasharray="1 4"
                                strokeOpacity={0.5}
                                dot={false}
                                name={`${location} (Arima Lower)`}
                            />
                        ))}

                        {/* ARIMA upper bound (dotted) */}
                        {tempLocations.map((location, index) => (
                            <Line
                                key={`${location}-arima-upper`}
                                type="monotone"
                                dataKey={`${location} (Arima Upper)`}
                                stroke={LINE_COLORS[index % LINE_COLORS.length]}
                                strokeDasharray="1 4"
                                strokeOpacity={0.5}
                                dot={false}
                                name={`${location} (Arima Upper)`}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        )}



        {/* Temperature - Humidity correlation */}
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
                <Tooltip
                formatter={(value, name) => [value, name]}
                labelFormatter={() => ""} 
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                    const data = payload[0].payload;

                    return (
                        <div className="bg-white p-2 border rounded shadow text-sm">
                        <p><strong>Location:</strong> {data.location}</p>
                        <p><strong>Temperature:</strong> {data.temperature} °C</p>
                        <p><strong>Humidity:</strong> {data.humidity} %</p>
                        <p><strong>Time:</strong> {data.datetime}</p>
                        </div>
                    );
                    }
                    return null;
                }}
                />
                <Scatter data={scatterData} fill="#82ca9d" />
            </ScatterChart>
        </ResponsiveContainer>
        </div>
        )}


        {/* Acoustic anomalies over time */}
        {acousticSeries.length > 0 && (
        <div className="mb-10 bg-white p-4 rounded shadow-md">
            <h2 className="text-xl font-bold mb-4">
            Acoustic Readings (Anomalies ≥ {ACOUSTIC_THRESHOLD_DB} dB)
            </h2>

            <ResponsiveContainer width="100%" height={350}>
            <LineChart data={acousticSeries}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="datetime" tick={{ fontSize: 12 }} />
                <YAxis unit="dB" />

                <Tooltip
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                        <div className="bg-white p-2 border rounded shadow text-sm">
                        <p><strong>Time:</strong> {d.datetime}</p>
                        <p><strong>Location:</strong> {d.location}</p>
                        <p><strong>Acoustic:</strong> {d.value} dB</p>
                        <p>
                            <strong>Status:</strong>{" "}
                            {d.isAnomaly ? "Anomaly" : "Normal"}
                        </p>
                        </div>
                    );
                    }
                    return null;
                }}
                />

                <Legend />

                {/* The line (no normal dots) + custom anomaly dots */}
                <Line
                type="monotone"
                dataKey="value"
                name="Acoustic"
                stroke="#0B6E4F"
                dot={<AnomalyDot />}
                activeDot={{ r: 6 }}
                />
            </LineChart>
            </ResponsiveContainer>
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
                labelLine={false}
                label={({ value, percent }) => `${value} (${(percent * 100).toFixed(0)}%)`}
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
