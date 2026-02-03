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


  // FETCH ALL  
  const fetchSensors = async () => {
    try {
      const response = await api.get("/sensors")
      setSensors(response.data.data)
    } catch (error) {
      console.error("Error fetching sensors:", error)
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
      alert("Sensor added successfully")
    } catch (err) {
      const detail = err.response?.data?.detail
      alert(JSON.stringify(detail, null, 2))
      console.error(err)
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
      alert("Sensor updated successfully")
    } catch (err) {
      const detail = err.response?.data?.detail
      alert(JSON.stringify(detail, null, 2))
      console.error(err)
    }
  }


  // DELETE  
  const deleteSensor = async (id) => { 
        try {
      await api.delete(`/sensors/${id}`)
      setSensors(sensors.filter(s => s.sensorId !== id))
      alert(`Sensor ${id} deleted successfully`)
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete sensor")
      console.error(err)
    }
  }

  useEffect(() => { fetchSensors() }, [])

  return (
    <div>
      {/* Page Title */}
      <h1 className="text-6xl md:text-7xl font-extrabold text-purple-600 mb-8 tracking-wider font-[cursive]">
        Sensors
      </h1>

      <br />

      {/* Search bar */}
      <div className="mb-6">
        <SensorSearch
          onSelectSensor={(sensor) => {
            setNewSensors([{
              sensorId: sensor.sensorId,
              type: sensor.sensorType,
              vendorName: sensor.vendorName,
              vendorEmail: sensor.vendorEmail,
              description: sensor.description,
              location: sensor.location
            }])
          }}
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
        sensors={sensors} 
        deleteSensor={deleteSensor} 
        updateSensor={updateSensor}
      />

      <br />
      
    </div>
  )
}
