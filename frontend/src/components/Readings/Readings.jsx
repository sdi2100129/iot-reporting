import { useEffect, useState } from "react";
import ReadingForm from "./ReadingForm.jsx";
import ReadingList from "./ReadingList.jsx";
import api from "../../api";

export default function Readings() {
    const [readings, setReadings] = useState([]);
    const [newReadings, setNewReadings] = useState([
        { id: "", sensorId: "", readingType: "", readingValue: "", readingDate: "", readingTime: "", description: "" }
    ]);


    const fetchReadings = async () => {
        try {
            const response = await api.get("/readings");
            setReadings(response.data.data);
        } catch (error) {
            console.error("Error fetching readings:", error);
        }
    };  

    useEffect(() => { fetchReadings() }, []);

    // ---------------- ADD  ----------------
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

    // ---------------- delete  ----------------
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


    // ---------------- search  ----------------



    // ---------------- UI  ----------------
    return (
        <div>
        <h2>Sensor Readings</h2>

        <ReadingForm
            newReadings={newReadings}
            setNewReadings={setNewReadings}
            addReading={addReading}
        />

        <hr />

        <ReadingList readings={readings} deleteReading={deleteReading} />
        </div>
    );

}