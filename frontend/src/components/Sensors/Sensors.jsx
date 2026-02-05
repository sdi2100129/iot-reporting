import { useState, useEffect } from "react"
import api from "../../api"
import SensorSearch from "./SensorSearch.jsx"
import SensorForm from "./SensorForm.jsx"
import SensorList from "./SensorList.jsx"

export default function Sensors() {
  const [sensors, setSensors] = useState([])
  const [newSensors, setNewSensors] = useState([{
    sensorId: "", type: "", vendorName: "", vendorEmail: "", description: "", location: ""
  }])

  const [filteredSensors, setFilteredSensors] = useState(null);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null)

  // FETCH ALL  
  const fetchSensors = async () => {
    try {
      const response = await api.get("/sensors")
      setSensors(response.data.data)
    } catch (error) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map(e => e.msg).join(". "));
      } else {
        setError(detail || "Failed to fetch sensors");
      }
    }
  }

  // Fetch sensors on first load
  useEffect(() => { fetchSensors() }, [])

  // ADD 
  const addSensor = async (sensor) => {
    try {
      const res = await api.post("/sensors", {
        sensorId: Number(sensor.sensorId),
        type: sensor.type,
        vendorName: sensor.vendorName,
        vendorEmail: sensor.vendorEmail,
        description: sensor.description,
        location: sensor.location
      })
      fetchSensors()
      setSuccess("Sensor added successfully")
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map(e => e.msg).join(". "));
      } else {
        setError(detail || "Add sensor failed");
      }
    }
  }

  // UPDATE 
  const updateSensor = async (sensor) => {
    try {
      const res = await api.put(`/sensors/${sensor.sensorId}`, {
        sensorId: Number(sensor.sensorId),
        type: sensor.type,
        vendorName: sensor.vendorName,
        vendorEmail: sensor.vendorEmail,
        description: sensor.description,
        location: sensor.location
      })
      fetchSensors()
      setSuccess("Sensor updated successfully")
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map(e => e.msg).join(". "));
      } else {
        setError(detail || "Update sensor failed");
      }
    }
  }


  // DELETE  
  const deleteSensor = async (id) => { 
        try {
      await api.delete(`/sensors/${id}`)
      setSensors(sensors.filter(s => s.sensorId !== id))
      setSuccess(`Sensor ${id} deleted successfully`)
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map(e => e.msg).join(". "));
      } else {
        setError(detail || "Delete sensor failed");
      }
    }
  }

  // SEARCH
  const searchSensor = async (id) => {
    if (!id) return;

    try {
      const res = await api.get(`/sensors/${id}`);
      setFilteredSensors([res.data]);
      setSuccess("Sensor found successfully");
      setError(null);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map(e => e.msg).join(". "));
      } else {
        setError(detail || "Sensor not found");
      }
      setSuccess(null);
    }
  };



  return (
    <div>

      <br />

      {/* Error Banner */}
      {error && (
        <div className="bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong>{" "}
          {typeof error === "string" ? error : JSON.stringify(error)}
          <button
            className="float-right font-bold text-red-800"
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Success Banner */}
      {success && (
        <div className="bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded mb-4">
          <strong>Success:</strong> {success}
          <button
            className="float-right font-bold text-green-800"
            onClick={() => setSuccess(null)}
          >
            ✕
          </button>
        </div>
      )}


      {/* Page Title */}
      <h1 className="text-6xl md:text-7xl font-extrabold text-purple-600 mb-8 tracking-wider font-[cursive]">
        Sensors
      </h1>

      <br />

      {/* Search bar */}
      <div className="mb-6">
        <SensorSearch
          onSearch={searchSensor}
        />
      </div>

      <hr />

      <SensorForm
        newSensors={newSensors}
        setNewSensors={setNewSensors}
        addSensor={addSensor}
        updateSensor={updateSensor}
      />


      <hr />
      <SensorList 
        sensors={filteredSensors ?? sensors} 
        deleteSensor={deleteSensor} 
        updateSensor={updateSensor}
      />

      <br />
      
    </div>
  )
}
