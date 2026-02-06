import api from "../api";
import { useState } from "react";

export default function Metrics() {
    const [filters, setFilters] = useState({
    sensor_type: "",
    location: "",
    time: ""
    });

    const [metrics, setMetrics] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null)

    const getMetrics = async () => {
        try {
            const res = await api.get("/metrics",{ params: { 
                sensor_type: filters.sensor_type || undefined, 
                location: filters.location || undefined, 
                time: filters.time || undefined } 
            });

            setMetrics(res.data);
            setSuccess("Metrics fetched successfully");
            setError(null);   
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                setError(detail.map(e => e.msg).join(". "));
            } else {
                setError(detail || "Failed to fetch metrics");
            }
            setMetrics(null);
            setSuccess(null);  
        }
    };

    return (

        <div className="w-full">

            <br/ >

            <h1 className="text-6xl md:text-7xl font-extrabold text-purple-600 mb-8 tracking-wider font-[cursive]">
                Metrics
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
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="border rounded px-3 py-2 flex-1"
                />

                <input
                type="time"
                placeholder="Time"
                value={filters.time}
                onChange={(e) => setFilters({ ...filters, time: e.target.value })}
                className="border rounded px-3 py-2 flex-1"
                />

                <button
                onClick={getMetrics}
                className="!bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                Get Metrics
                </button>

            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded mb-4">
                <strong>Error:</strong> {error}
                </div>
            )}

            {/* Metrics */}
            {metrics && metrics.range && (
                <div className="bg-white p-6 rounded shadow-md">
                <p><strong>Count:</strong> {metrics.count}</p>
                <p>
                    <strong>Range:</strong> from {metrics.range.min} to {metrics.range.max}
                </p>
                <p><strong>Mean:</strong> {metrics.mean}</p>
                <p><strong>Top 10 Max:</strong> {metrics.top10_max.join(", ")}</p>
                <p><strong>Top 10 Min:</strong> {metrics.top10_min.join(", ")}</p>
                </div>
            )}

            {metrics && !metrics.range && (
                <div className="bg-yellow-100 border border-yellow-500 text-yellow-700 px-4 py-3 rounded mb-4">
                No readings match your filters.
            </div>


            )}

        
        </div>
    );
}


