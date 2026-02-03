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



    const fetchReadings = async () => {
        try {
            const response = await api.get("/readings");
            setReadings(response.data.data);
        } catch (error) {
            console.error("Error fetching readings:", error);
        }
    };  

    useEffect(() => { fetchReadings() }, []);

    // ADD 
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
            alert(res.data.message || "Reading added successfully");
        } catch (err) {
            const detail = err.response?.data?.detail;
            alert(JSON.stringify(detail, null, 2));
            console.error(err);
        }
    };

    // delete 
    const deleteReading = async (readingId) => {
        try {
            const res = await api.delete(`/readings/${readingId}`);
            fetchReadings();
            alert("Reading deleted successfully");
        } catch (err) {
            const detail = err.response?.data?.detail;
            alert(JSON.stringify(detail, null, 2));
            console.error(err);
        }
    };


    // search

    const searchReadings = async () => {
        try {
            const res = await api.get("/readings/search", {
            params: {
                sensor_type: searchFilters.sensor_type || undefined,
                location: searchFilters.location || undefined,
                time: searchFilters.time || undefined,
                page: searchFilters.page
            }
            });

            setFilteredReadings(res.data.data);
        } catch (err) {
            alert(err.response?.data?.detail || "Search failed");
        }
    };

    const clearSearch = () => {
    setFilteredReadings(null);
    };



    // UI  -
    return (
        <div>
        <h1 className="text-6xl md:text-7xl font-extrabold text-purple-600 mb-8 tracking-wider font-[cursive]">
            Sensor Readings
        </h1>

        <hr />
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
        </div>
    );

}