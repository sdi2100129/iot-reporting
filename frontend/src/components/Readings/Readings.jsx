import { useEffect, useState } from "react";
import ReadingForm from "./ReadingForm.jsx";
import ReadingList from "./ReadingList.jsx";
import ReadingSearch from "./ReadingSearch.jsx";
import api from "../../api";

export default function Readings() {
    const [readings, setReadings] = useState([]);
    const [newReadings, setNewReadings] = useState([
        { id: "", 
        sensorId: "",
        readingType: "",
        readingValue: "",
        readingDate: "",
        readingTime: "",
        description: "" }
    ]);

    const [searchFilters, setSearchFilters] = useState({
        sensor_type: "",
        location: "",
        time: "",
        page: 1
    });

    const [filteredReadings, setFilteredReadings] = useState(null);

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);



    const fetchReadings = async () => {
        try {
            const response = await api.get("/readings");
            setReadings(response.data.data);
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                setError(detail.map(e => e.msg).join(". "));
            } else {
                setError(detail || "Failed to fetch readings");
            }
        }
    };  

    useEffect(() => { fetchReadings() }, []);

    // Add
    const addReading = async (reading) => {
        try {
            const res = await api.post("/readings", {
                id: Number(reading.id),
                sensorId: Number(reading.sensorId),
                readingType: reading.readingType,
                readingValue: Number(reading.readingValue),
                readingDate: reading.readingDate,
                readingTime: reading.readingTime,
                description: reading.description
            });
            fetchReadings();
            setSuccess("Reading added successfully");
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                setError(detail.map(e => e.msg).join(". "));
            } else {
                setError(detail || "Failed to add sensor");
            }
        }
    };


    // Delete 
    const deleteReading = async (readingId) => {
        try {
            const res = await api.delete(`/readings/${readingId}`);
            fetchReadings();
            setSuccess("Reading deleted successfully");
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                setError(detail.map(e => e.msg).join(". "));
            } else {
                setError(detail || "Failed to delete sensor");
            }
        }
    };


    // Search

    const searchReadings = async () => {
        try {
            const res = await api.get("/readings/search",{ params: { 
                sensor_type: searchFilters.sensor_type || undefined, 
                location: searchFilters.location || undefined, 
                time: searchFilters.time || undefined, 
                page: searchFilters.page } 
            });

            setFilteredReadings(res.data.data);
            setSuccess("Reading found successfully");
            setError(null);   
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                setError(detail.map(e => e.msg).join(". "));
            } else {
                setError(detail || "Reading not found");
            }
            setSuccess(null);  
        }
    };


    const clearSearch = () => {
        setFilteredReadings(null);
    };



    // UI  -
    return (
        <div>

        {/* Error Banner */}
        {error && (
            <div className="bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {typeof error === "string" ? error : JSON.stringify(error)}
            <button className="float-right font-bold text-red-800" onClick={() => setError(null)}>✕</button>
            </div>
        )}

        {/* Success Banner */}
        {success && (
            <div className="bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded mb-4">
            <strong>Success:</strong> {success}
            <button className="float-right font-bold text-green-800" onClick={() => setSuccess(null)}>✕</button>
            </div>
        )}

        <h1 className="text-6xl md:text-7xl font-extrabold text-purple-600 mb-8 tracking-wider font-[cursive]">
            Sensor Readings
        </h1>

        <br />
        <ReadingSearch
        filters={searchFilters}
        setFilters={setSearchFilters}
        onSearch={searchReadings}
        onClear={clearSearch}
        />

        <hr />
        <ReadingForm
            newReadings={newReadings}
            setNewReadings={setNewReadings}
            addReading={addReading}
        />

        <hr />
        <ReadingList readings={filteredReadings ?? readings} deleteReading={deleteReading} />

        <br/>
        
        </div>
    );

}