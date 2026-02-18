import { useEffect, useState } from "react";
import ReadingForm from "./ReadingForm.jsx";
import ReadingList from "./ReadingList.jsx";
import ReadingSearch from "./ReadingSearch.jsx";
import api from "../../api";

export default function Readings() {
    // To show what readings our database currently have.
    const [readings, setReadings] = useState([]);

    // To implement the add functionality in readings. Keeps the inputs of the user.
    const [newReadings, setNewReadings] = useState([
        { id: "", 
        sensorId: "",
        readingType: "",
        readingValue: "",
        readingDate: "",
        readingTime: "",
        description: "" }
    ]);

    // To implement the search functionality in readings
    const [searchFilters, setSearchFilters] = useState({
        sensor_type: "",
        location: "",
        date: "", 
        time: ""
    });

    // To show readings' list based on filters
    const [filteredReadings, setFilteredReadings] = useState(null);

    // To show in which page we currently are
    const [page, setPage] = useState(1);

    // To show how many pages there are
    const [pages, setPages] = useState(1);

    // To show Success or Error status
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);


    useEffect(() => {
    if (filteredReadings !== null) {
        searchReadings();
    } else {
        fetchReadings();
    }
    }, [page]);


    const fetchReadings = async () => {
        try {
            const response = await api.get("/readings", {
            params: { page: page }  
            });
            setPages(response.data.pages);
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
            //fetchReadings();
             // remove from normal list
            setReadings(prev => prev.filter(r => r.id !== readingId));
            // remove from filtered list if we are in search mode
            setFilteredReadings(prev =>
            prev ? prev.filter(r => r.id !== readingId) : null
            );
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
                date: searchFilters.date || undefined,
                time: searchFilters.time || undefined, 
                page: page } 
            });

            setFilteredReadings(res.data.data);
            setPages(res.data.pages)
            if (res.data.data.length > 0) {
                setSuccess("Reading found successfully");
                setError(null);
            } else {
                setSuccess(null);
                setError("No readings found for the selected filters");
            }
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
        setSearchFilters({
            sensor_type: "",
            location: "",
            date: "",
            time: ""
        });
        setFilteredReadings(null); // remove search filter
        setPage(1); // reset to first page
        fetchReadings(); // fetch full list for first page
        setError(null);
        setSuccess(null);
    };


    // UI  -
    return (
        <div>
        
        <br />
        
        {/* Error Banner */}
        {error && (
            <div className="w-full flex justify-between items-center bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {typeof error === "string" ? error : JSON.stringify(error)}
            <button className="bg-white !bg-white text-red-800" style={{ backgroundColor: "white" }} onClick={() => setError(null)}>✕</button>
            </div>
        )}

        {/* Success Banner */}
        {success && (
            <div className="w-full flex justify-between items-center bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded mb-4">
            <strong>Success:</strong> {success}
            <button className="!bg-white text-green-800" style={{ backgroundColor: "white" }} onClick={() => setSuccess(null)}>✕</button>
            </div>
        )}

        {/* No results found */}
        {filteredReadings?.length === 0 && (
        <div className="bg-yellow-100 border border-yellow-500 text-yellow-700 px-4 py-3 rounded mb-4">
            No readings found for the selected filters
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


        <ReadingList 
        readings={filteredReadings ?? readings} 
        deleteReading={deleteReading} 
        page={page}
        setPage={setPage}
        pages={pages}
        />

        <br/>
        
        </div>
    );

}